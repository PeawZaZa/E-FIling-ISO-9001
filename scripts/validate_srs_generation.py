"""Fail-fast structural and identifier checks for the generated SRS.

This validator checks the assembled text before merge_srs.py writes SRS_v1.md.
It complements the older verbatim-merge audit, whose v1.1 text/count baselines
are intentionally not applicable to the version 1.2 editorial reconciliation.
"""

from __future__ import annotations

import argparse
from collections import Counter
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent.parent
FAMILIES = ("FR", "NFR", "BR", "CON", "US", "UC", "AC", "M", "TBD")
ID_RE = re.compile(r"\b(?:FR|NFR|BR|CON|US|UC|AC|M|TBD)-[AB]-\d+(?:\.\d+)?\b")
REF_RE = re.compile(r"\bREF-\d{2}\b")
ADDED_12 = {"AC-B-35", "TBD-B-24", "TBD-B-25"}
MAIN = (
    "# 1. Introduction", "# 2. Overall Description",
    "# 3. External Interface Requirements", "# 4. System Features",
    "# 5. Other Nonfunctional Requirements", "# 6. Other Requirements",
)
APPENDICES = (
    "# Appendix A: Glossary", "# Appendix B: Analysis Models",
    "# Appendix C: To Be Determined List", "# Appendix D: Acceptance Criteria",
    "# Appendix E: End-to-End Traceability",
    "# Appendix F: Completeness and QA Record",
)
TRACE_MARKERS = (
    "## 1.5 References", "## 5.5 Business Rules",
    "### E.1.1 ", "### E.1.2 ", "### E.2.4 ", "## E.3 ", "### E.3.1 ",
)
EXPECTED_UC = {f"UC-A-{i:02d}" for i in range(1, 13)} | {
    f"UC-B-{i:02d}" for i in range(1, 17)
}
UC_HEADING_RE = re.compile(r"^## 4\.\d+ .+?\b(UC-[AB]-\d{2})\s*$", re.M)
UC_MARKERS = (
    "Goal", "Primary Actor", "Preconditions", "Success Postconditions",
    "Main Success Scenario", "Alternate Flows", "Exception Flows",
)


class SrsValidationError(ValueError):
    """The generated SRS must not be written because a required part is absent."""


def between(text: str, start: str, end: str) -> str:
    return text.split(start, 1)[1].split(end, 1)[0]


def first_column_ids(text: str, family: str) -> list[str]:
    pattern = re.compile(r"\b" + family + r"-[AB]-\d+(?:\.\d+)?\b")
    result: list[str] = []
    for line in text.splitlines():
        if line.startswith("|"):
            first_cell = line[1:].split("|", 1)[0]
            result.extend(pattern.findall(first_cell))
    return result


def uc_inventory(text: str) -> list[dict[str, object]]:
    matches = list(UC_HEADING_RE.finditer(text))
    end_of_features = text.find("# 5. Other Nonfunctional Requirements")
    result: list[dict[str, object]] = []
    for index, match in enumerate(matches):
        end = matches[index + 1].start() if index + 1 < len(matches) else end_of_features
        body = text[match.end():end]
        # Non-UC §4.16/§4.30 text between headings does not satisfy a UC check.
        following_heading = re.search(r"^## 4\.\d+ ", body, re.M)
        if following_heading:
            body = body[:following_heading.start()]
        steps = bool(re.search(r"^1\.\s+", body, re.M))
        result.append({
            "id": match.group(1), "title": match.group(0),
            "defined": True,
            "main": "Main Success Scenario" in body and steps,
            "alternate": "Alternate Flows" in body,
            "exception": "Exception Flows" in body,
            "requirements": bool(re.search(r"\b(?:FR|BR)-[AB]-\d+", body)),
            "ac": bool(re.search(r"\bAC-[AB]-\d+", body)),
            "missing_markers": [marker for marker in UC_MARKERS if marker not in body],
        })
    return result


def validate_text(text: str, source_a: str, source_b: str) -> dict[str, object]:
    errors: list[str] = []
    positions: list[int] = []
    for heading in MAIN + APPENDICES:
        hits = list(re.finditer(r"^" + re.escape(heading) + r"\s*$", text, re.M))
        if len(hits) != 1:
            errors.append(f"mandatory heading {heading!r}: expected once, found {len(hits)}")
        else:
            positions.append(hits[0].start())
    if len(positions) == len(MAIN) + len(APPENDICES) and positions != sorted(positions):
        errors.append("§1–§6 and Appendix A–F are out of order")
    for marker in TRACE_MARKERS:
        if marker not in text:
            errors.append(f"mandatory reference/trace subsection {marker.strip()!r} is missing")

    if "| Version | 1.2 |" not in text or "Working Draft — Implementation Reconciled" not in text:
        errors.append("version 1.2 Working Draft header is missing")
    for phrase in ("PENDING_CLOSURE", "TBD-B-24", "TBD-B-25",
                   "Download-only", "PASS 136, FAIL 0, BLOCKED 3, NOT RUN 0"):
        if phrase not in text:
            errors.append(f"reconciliation marker {phrase!r} is missing")

    inventory = uc_inventory(text)
    counts = Counter(row["id"] for row in inventory)
    for code in sorted(EXPECTED_UC):
        if counts[code] != 1:
            errors.append(f"use case {code}: expected one §4 definition, found {counts[code]}")
    for code in sorted(set(counts) - EXPECTED_UC):
        errors.append(f"unexpected §4 use case definition: {code}")
    for row in inventory:
        missing = row["missing_markers"]
        if missing or not all(row[k] for k in ("main", "alternate", "exception", "requirements", "ac")):
            errors.append(f"{row['id']} lacks behavior/trace detail: {missing or 'steps, flow, FR/BR or AC'}")

    source_ids = set(ID_RE.findall(source_a + source_b))
    artifact_ids = set(ID_RE.findall(text))
    missing_ids = sorted(source_ids - artifact_ids)
    new_ids = artifact_ids - source_ids
    if missing_ids:
        errors.append(f"source IDs lost during generation: {', '.join(missing_ids)}")
    if new_ids != ADDED_12:
        errors.append(f"unexpected 1.2 ID delta: {sorted(new_ids)}; expected {sorted(ADDED_12)}")
    orphan_candidates = sorted(code for code, count in Counter(ID_RE.findall(text)).items() if count < 2)
    if orphan_candidates:
        errors.append(f"IDs mentioned only at their definition (or otherwise orphaned): {', '.join(orphan_candidates)}")

    if all(heading in text for heading in MAIN + APPENDICES) and all(marker in text for marker in TRACE_MARKERS):
        zones = {
            "US": between(text, MAIN[1], MAIN[2]),
            "CON": between(text, MAIN[1], MAIN[2]),
            "FR": between(text, MAIN[3], MAIN[4]),
            "NFR": between(text, MAIN[4], MAIN[5]),
            "BR": between(text, "## 5.5 Business Rules", MAIN[5]),
            "M": between(text, APPENDICES[1], APPENDICES[2]),
            "TBD": between(text, APPENDICES[2], APPENDICES[3]),
            "AC": between(text, APPENDICES[3], APPENDICES[4]),
        }
        for family, zone in zones.items():
            defined = first_column_ids(zone, family)
            referenced = {code for code in artifact_ids if code.startswith(family + "-")}
            undefined = sorted(referenced - set(defined))
            if undefined:
                errors.append(f"{family} referenced without definition row: {', '.join(undefined)}")
            if family in ("US", "CON", "M", "AC"):
                duplicates = sorted(code for code, n in Counter(defined).items() if n != 1)
                if duplicates:
                    errors.append(f"{family} duplicate/missing canonical definitions: {', '.join(duplicates)}")
        app_e = text.split(APPENDICES[4], 1)[1].split(APPENDICES[5], 1)[0]
        untraced_fr = sorted(code for code in artifact_ids if code.startswith("FR-") and code not in app_e)
        if untraced_fr:
            errors.append(f"FR absent from Appendix E trace: {', '.join(untraced_fr)}")
        app_d = zones["AC"]
        defined_ac = first_column_ids(app_d, "AC")
        untraced_ac = sorted(code for code in defined_ac if code not in app_e)
        if untraced_ac:
            errors.append(f"AC absent from Appendix E trace: {', '.join(untraced_ac)}")
        e1_rows = between(app_e, "### E.1.1 ", "### E.1.2 ")
        e2_index = between(app_e, "### E.2.4 ", "## E.3 ")
        e3_rows = app_e.split("### E.3.1 ", 1)[1] if "### E.3.1 " in app_e else ""
        for code in sorted(c for c in artifact_ids if c.startswith("FR-")):
            if "." in code.split("-")[-1]:
                witnesses = [line for line in e3_rows.splitlines() if line.startswith("|") and code in line]
                if not any("AC-" in line and "M-" in line and ("UC-" in line or "§4." in line) for line in witnesses):
                    errors.append(f"subrequirement {code} lacks an E.3 source→behavior→AC→model row")
            elif code.startswith("FR-A-"):
                witnesses = [line for line in e1_rows.splitlines() if line.startswith("|") and code in line]
                if not any("AC-A-" in line and "M-A-" in line and ("UC-A-" in line or "§4." in line) for line in witnesses):
                    errors.append(f"{code} lacks an E.1.1 source→behavior→AC→model row")
            else:
                witnesses = [line for line in e2_index.splitlines() if line.startswith("|") and line.lstrip("| `").startswith(code)]
                if not any("AC-B-" in line and ("UC-B-" in line or "§4." in line) for line in witnesses):
                    errors.append(f"{code} lacks an E.2.4 behavior→AC index row")
        registry = between(text, "## 1.5 References", MAIN[1])
        ref_defs = re.findall(r"^\|\s*(REF-\d{2})\s*\|", registry, re.M)
        ref_uses = set(REF_RE.findall(text))
        if set(ref_defs) != ref_uses or len(ref_defs) != len(set(ref_defs)):
            errors.append(f"REF register/usage mismatch: undefined={sorted(ref_uses-set(ref_defs))}; duplicate definitions={[k for k,v in Counter(ref_defs).items() if v>1]}")
        residual_refs = sorted(set(re.findall(r"\bREF-[AB]-\d{2}\b|\bREF-\d{2}–\d{2}\b", text)))
        if residual_refs:
            errors.append(f"source-prefix or unexpanded REF range remains: {residual_refs}")

    if errors:
        raise SrsValidationError("SRS generation validation failed:\n- " + "\n- ".join(errors))
    return {"sections": len(MAIN), "appendices": len(APPENDICES),
            "use_cases": len(inventory), "source_ids": len(source_ids),
            "artifact_ids": len(artifact_ids), "inventory": inventory}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("path", nargs="?", default=str(ROOT / "SRS_v1.md"))
    parser.add_argument("--inventory", action="store_true", help="print a compact 28-UC Markdown inventory")
    args = parser.parse_args()
    try:
        result = validate_text(Path(args.path).read_text(encoding="utf-8"),
                               (ROOT / "GroupA_SRS_v2.md").read_text(encoding="utf-8"),
                               (ROOT / "GroupB_SRS_v2.md").read_text(encoding="utf-8"))
    except SrsValidationError as error:
        print(error)
        return 1
    print(f"PASS: §1–§6, Appendix A–F, {result['use_cases']} UC definitions, "
          f"{result['source_ids']} source IDs retained, {result['artifact_ids']} total IDs")
    if args.inventory:
        print("| Use Case | Defined | Main Steps | Alt/Exception | Requirement Link | AC Link |")
        print("| :--- | :--- | :--- | :--- | :--- | :--- |")
        for row in result["inventory"]:
            print(f"| {row['id']} | PASS | PASS | PASS/PASS | PASS | PASS |")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
