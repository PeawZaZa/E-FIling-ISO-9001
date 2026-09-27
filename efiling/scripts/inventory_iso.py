"""Read-only PDF inventory. Filename values are candidates, never verified metadata.

Run: python efiling/scripts/inventory_iso.py [--render-samples]
Requires PyMuPDF. Original PDFs are never modified. No OCR/network calls are made.
"""
import argparse
from collections import Counter, defaultdict
import csv
from datetime import date
import hashlib
import json
from pathlib import Path
import re

import pymupdf

ROOT = Path(__file__).resolve().parents[2]
CODE = re.compile(r"^(QM|QP|WI|SD|FM)(?:-(?:QM|QP|WI))?-\d{4}-\d{2,4}(?:-\d{2})?", re.I)
LABEL = re.compile(r"(?:ฉบับที่|ครั้งที่|แก้ไข|มีผล|บังคับใช้|effective|revision|issue\s*(?:no|number)|rev\.)", re.I)
# Human visual checks of rendered page 1, tied to the exact source hash.
# Approval dates are not silently equated with effective dates.
VISUAL_CHECKS = {
    "2a8d7d8cb1b81fcbdde3f13c201515a29f8e81f711706880630484d01f14c138": {
        "revisionNo": 0, "effectiveDate": "2025-06-27",
        "evidence": "Visual page 1 footer: FM-QP-2301-0202-07 Rev.0, date 27 June 2568 BE. Title and plan match the second file with Rev.00; both are revision 0 of the same document, retain both original files.",
    },
    "6cbc9cbff3b5e5938d76d5e600eabffc1f1ee39270998251bfe7a70163c61edc": {
        "revisionNo": 0, "effectiveDate": "2025-06-27",
        "evidence": "Visual page 1 footer: FM-QP-2301-0202-07 Rev.00, date 27 June 2568 BE. Title and plan match the other file with Rev.0; both are revision 0 of the same document, retain both original files.",
    },
    "5a4725b564870cb8d1d16d962dff3625595f657d8cddb6ebe8ce6941763e1aa9": {
        "revisionNo": 3,
        "evidence": "Visual page 1 header: QM-2301-01; revision 03; approval date 24 July 2569 BE. Issue number not shown; effective date not separately established.",
    },
    "a9c6e290904b2dc7f5c35f3f79ac29d54dfee713d128bf13c5db3a6a32ed8cb6": {
        "revisionNo": 1,
        "evidence": "Visual page 1 header: QP-2301-0101; revision 01; approval date 14 July 2568 BE. Uncontrolled Document watermark. Issue number not shown; effective date not separately established.",
    },
    "cc20cacc8eb79141fa2cd88f85b46b3438a0a222d5ceb3998579dbdb96007b0c": {
        "evidence": "Visual page 1: SD-QM-2301-0101-01 and ISO 9001:2015 fifth edition, 2015-09-15. External publication edition/date are not internal issue/revision/effective-date values.",
    },
    "791214df08c960fca4fe74dbf1ba2f356be173f0f02f1a4871492fa635b72c09": {
        "evidence": "Visual page 1: e-Office screen with Controlled Documents watermark. No registry code/issue/revision/effective date visible. Malformed filename code left null.",
    },
    "44586dd81d752a3f61867000e0057dbddc9dd655e63b217d1c3fb826a7e278e1": {
        "revisionNo": 0, "effectiveDate": "2025-06-27",
        "evidence": "Visual page 1 footer confirmed: FM-QP-2301-0101-01 Rev.00; publication/effective date 27 June 2568 BE (2025-06-27). Controlled Document watermark. Issue number not shown.",
    },
}

MONTHS = "มกราคม กุมภาพันธ์ มีนาคม เมษายน พฤษภาคม มิถุนายน กรกฎาคม สิงหาคม กันยายน ตุลาคม พฤศจิกายน ธันวาคม".split()


def thai_date(value):
    parts = value.strip().split()
    if len(parts) != 3 or parts[1] not in MONTHS:
        return None
    return date(int(parts[2]) - 543, MONTHS.index(parts[1]) + 1, int(parts[0])).isoformat()


def enrich_csv(source, entries):
    """Keep historical requests distinct from present document metadata."""
    csv_sources, dar, masters = [], defaultdict(list), {}
    for path in sorted(source.glob("*.csv")):
        with path.open(encoding="utf-8-sig", newline="") as stream:
            rows = list(csv.reader(stream))
        kind = "DAR" if "DAR" in path.name else "MASTER_LIST" if "Master List" in path.name else "OTHER"
        count = 0
        for row_number, row in enumerate(rows, 1):
            if kind == "DAR" and len(row) >= 12 and row[0].isdigit() and row[1].isdigit() and CODE.fullmatch(row[4].strip()):
                dar[row[4].strip()].append({
                    "number": row[1], "yearBE": int(row[0]), "requestDate": thai_date(row[2]),
                    "title": row[5].strip(), "requester": row[6], "requesterPosition": row[7],
                    "reviewer": row[8], "reviewerPosition": row[9], "approver": row[10], "approverPosition": row[11],
                    "sourcePath": path.name, "row": row_number,
                })
                count += 1
            if kind == "MASTER_LIST" and len(row) >= 7 and row[0].isdigit() and CODE.fullmatch(row[2].strip()):
                masters[row[2].strip()] = {"title": row[3].strip(), "issueNo": int(row[4]),
                    "revisionNo": int(row[5]), "effectiveDate": thai_date(row[6]),
                    "sourcePath": path.name, "row": row_number}
                count += 1
        csv_sources.append({"sourcePath": path.name, "kind": kind, "dataRecordCount": count,
            "sha256": hashlib.sha256(path.read_bytes()).hexdigest()})
    matches, filled, master_matches = 0, 0, 0
    for entry in entries:
        entry["currentSourceConfirmed"] = True
        entry["currentSourceEvidence"] = "User confirmed all 296 PDFs are the current official central source on 2026-09-19. This does not invent missing field values."
        entry["reviewNotes"] = entry["reviewNotes"].replace("จึงคงสถานะรอตรวจสอบ", "ช่องที่ยังขาดต้องตรวจสอบเพิ่มเติม")
        refs = dar.get(entry["documentCode"], [])
        if refs:
            matches += 1
            entry["historicalDarReferences"] = refs
            titles = {ref["title"] for ref in refs}
            if not entry["candidateTitle"] and len(titles) == 1:
                entry["title"] = next(iter(titles))
                filled += 1
                entry["evidence"] += " Title supplied from exact-code historical DAR rows."
            if titles != {entry["title"]}:
                entry["reviewNotes"] += "; ชื่อในทะเบียน DAR ปี 2568 มีข้อความต่างจากชื่อปัจจุบัน เก็บเป็นประวัติ ไม่ทับชื่อปัจจุบัน"
            entry["evidence"] += " Historical DAR references retained; request dates/people are not current effective dates or workflow approvals."
        master = masters.get(entry["documentCode"])
        if master:
            master_matches += 1
            for field in ["issueNo", "revisionNo", "effectiveDate"]:
                entry[field] = master[field]
            entry["masterListReference"] = master
            entry["evidence"] += f" Master List CSV {master['sourcePath']} row {master['row']} explicitly confirms issue/revision/effective date."
            entry["reviewNotes"] += "; Master List ยืนยันฉบับที่ ครั้งที่แก้ไข และวันที่เริ่มใช้แล้ว"
    return {"sources": csv_sources, "darRecordCount": sum(len(refs) for refs in dar.values()),
        "darUniqueCodeCount": len(dar), "darMatchedPdfCount": matches, "darTitleFilledCount": filled,
        "masterListMatchedPdfCount": master_matches,
        "darTitleVariationCodes": sorted(code for code, refs in dar.items() if len({r['title'] for r in refs}) > 1)}


def inventory(source, output, render_samples=False):
    entries = []
    rendered = set()
    scratch = output.parent / "pdf-inspection"
    for path in sorted(source.rglob("*")):
        if not path.is_file() or path.suffix.lower() != ".pdf":
            continue
        with path.open("rb") as stream:
            digest = hashlib.file_digest(stream, "sha256").hexdigest()
        match = CODE.match(path.stem)
        code = match.group(0).upper() if match else None
        type_match = re.match(r"^(QM|QP|WI|SD|FM)-", path.stem, re.I)
        doc_type = type_match.group(1).upper() if type_match else None
        title = path.stem[match.end():].strip(" ._-") if match else path.stem
        revision = re.search(r"\s+Rev\.?\s*(\d+)\s*$", title, re.I)
        candidate_revision = int(revision.group(1)) if revision else None
        if revision:
            title = title[:revision.start()].strip()
        missing_title = not title
        entry = {
            "sourcePath": path.relative_to(source).as_posix(), "fileName": path.name,
            "sha256": digest, "sizeBytes": path.stat().st_size,
            "documentCode": code, "title": title or path.stem, "docType": doc_type,
            "issueNo": None, "revisionNo": None, "effectiveDate": None,
            "metadataVerified": False, "candidateRevisionNo": candidate_revision,
            "candidateDocumentCode": code, "candidateTitle": title or None,
            "candidateDocType": doc_type, "candidateTextMetadata": [],
            "reviewNotes": "รอตรวจสอบข้อมูลจากต้นฉบับ: รหัส ชื่อ และประเภทที่มีเป็นข้อมูลจากชื่อไฟล์เท่านั้น; ยังไม่ยืนยันฉบับที่ ครั้งที่แก้ไข และวันที่มีผลบังคับใช้",
            "evidence": "Filename only; no metadata values promoted from text-layer detection.",
            "pageCount": None, "textCharacters": 0, "thaiTextCharacters": 0,
            "pagesWithText": 0, "inspectionError": None,
        }
        if missing_title:
            entry["reviewNotes"] += "; ชื่อไฟล์มีเพียงรหัส ยังไม่ทราบชื่อเรื่อง"
        if not match:
            entry["reviewNotes"] += "; รูปแบบรหัสในชื่อไฟล์ไม่ตรงรูปแบบที่รู้จัก ห้ามเดารหัส"
        try:
            with pymupdf.open(path) as pdf:
                entry["pageCount"] = len(pdf)
                for index, page in enumerate(pdf):
                    text = page.get_text()
                    entry["textCharacters"] += len(text.strip())
                    entry["thaiTextCharacters"] += len(re.findall(r"[\u0e00-\u0e7f]", text))
                    entry["pagesWithText"] += bool(text.strip())
                    # Only small labelled snippets, not full source content.
                    if index < 3:
                        for line in text.splitlines():
                            if LABEL.search(line) and len(entry["candidateTextMetadata"]) < 12:
                                entry["candidateTextMetadata"].append({"page": index + 1, "text": line.strip()[:180]})
                if render_samples and doc_type not in rendered and len(pdf):
                    scratch.mkdir(parents=True, exist_ok=True)
                    pdf[0].get_pixmap(dpi=140).save(scratch / f"sample-{doc_type}.png")
                    entry["renderedSample"] = f"pdf-inspection/sample-{doc_type}.png"
                    rendered.add(doc_type)
        except Exception as exc:
            entry["inspectionError"] = str(exc)
            entry["reviewNotes"] += "; อ่าน PDF ไม่สำเร็จ ต้องตรวจด้วยตนเอง"
        if digest in VISUAL_CHECKS:
            entry.update(VISUAL_CHECKS[digest])
            entry["reviewNotes"] = "ตรวจภาพหน้าแรกแล้วตามหลักฐานที่บันทึก แต่ยังยืนยันข้อมูลไม่ครบ จึงคงสถานะรอตรวจสอบ; ช่องที่ไม่มีหลักฐานคงว่าง"
        entries.append(entry)

    csv_summary = enrich_csv(source, entries)
    hashes, codes = defaultdict(list), defaultdict(list)
    for entry in entries:
        hashes[entry["sha256"]].append(entry)
        if entry["documentCode"]:
            codes[entry["documentCode"]].append(entry)
    duplicate_hashes = [{"sha256": digest, "sourcePaths": [e["sourcePath"] for e in group]}
                        for digest, group in hashes.items() if len(group) > 1]
    conflicts = [{"documentCode": code, "sourcePaths": [e["sourcePath"] for e in group]}
                 for code, group in codes.items() if len({e["sha256"] for e in group}) > 1]
    for conflict in conflicts:
        group = codes[conflict["documentCode"]]
        if conflict["documentCode"] == "FM-QP-2301-0202-07" and all(e["sha256"] in VISUAL_CHECKS for e in group):
            conflict["resolution"] = "Same printed document code and revision 0; retain two original files under one current revision. Footer displays Rev.0 versus Rev.00."
            for entry in group:
                entry["sameRevisionFileGroup"] = "FM-QP-2301-0202-07:0"
                entry["reviewNotes"] += "; ตรวจภาพแล้วทั้งสองไฟล์เป็นรหัสเดียวกัน แก้ไขครั้งที่ 0 เหมือนกัน (Rev.0 / Rev.00) เก็บเป็นสองไฟล์ของฉบับปัจจุบันเดียวกัน"
            continue
        for entry in codes[conflict["documentCode"]]:
            entry["reviewNotes"] += "; พบชื่อไฟล์รหัสเดียวกันแต่เนื้อไฟล์ต่างกัน ต้องตรวจความสัมพันธ์ ห้ามทับไฟล์"
    summary = {
        "fileCount": len(entries), "totalBytes": sum(e["sizeBytes"] for e in entries),
        "docTypesFromFilename": dict(Counter(e["docType"] or "UNKNOWN" for e in entries)),
        "uniqueHashes": len(hashes), "duplicateHashGroups": duplicate_hashes,
        "sameCodeDifferentHashGroups": conflicts,
        "missingCodeCount": sum(e["documentCode"] is None for e in entries),
        "missingTitleCount": sum(e["candidateTitle"] is None for e in entries),
        "pdfReadErrorCount": sum(e["inspectionError"] is not None for e in entries),
        "filesWithThaiText": sum(e["thaiTextCharacters"] > 0 for e in entries),
        "filesWithText": sum(e["textCharacters"] > 0 for e in entries),
        "pendingMetadataCount": len(entries),
        "currentSourceConfirmedCount": len(entries),
        "csvEnrichment": csv_summary,
    }
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps({"schemaVersion": 1, "sourceRoot": "ISO files", "summary": summary,
                                  "entries": entries}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=True, indent=2))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, default=ROOT / "ISO files")
    parser.add_argument("--output", type=Path, default=ROOT / "efiling/.local/iso-inventory.json")
    parser.add_argument("--render-samples", action="store_true")
    args = parser.parse_args()
    inventory(args.source.resolve(), args.output.resolve(), args.render_samples)
