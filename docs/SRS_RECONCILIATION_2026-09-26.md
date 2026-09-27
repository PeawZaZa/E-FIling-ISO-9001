# SRS Implementation Reconciliation — 26 September 2026

**Disposition: Version 1.2, Working Draft — Implementation Reconciled. Not a Baseline Candidate or Approved Baseline.** This is an editorial reconciliation of requirements, confirmed MVP decisions, implementation evidence, and Manual UI Acceptance. Application behavior was not changed. Passing tests and current code are evidence of behavior, not authority to change business rules.

## Sources and change boundary

The generated specification is `SRS_v1.md`. The normal generator remains `scripts/merge_srs.py`; its version 1.2 editorial inputs are `scripts/srs_reconcile_current.py` and `scripts/srs_reconcile_shared.py`, applied after the existing merge rules. The original module sources `GroupA_SRS_v2.md` and `GroupB_SRS_v2.md`, reference mapping and dated revision history are preserved. The existing manually added Group B Use Case Diagram link is now reproduced by the generator and explicitly marked historical where it depicts deferred behavior. `PROJECT_STATE.md` was corrected to the current Manual UI result. No frontend, backend, schema, migration, data, seed, demo fixture, application test, or Chapter 4–5 file was changed for this task.

The reconciliation used `PROJECT_STATE.md`, `works/MVP_2_Weeks_and_Role_Matrix.md`, `Module_Interface_Agreement.md`, current source files for the discrepancies below, and `docs/MANUAL_UI_ACCEPTANCE.md` §9. Current Chapter 1 Word files were inspected: `Project report/บทที่ 1 A update 2 กันยายน 2569.docx` and `Project report/บทที่ 1 B บทนำ.docx`. Chapter 1 B still describes Export Summary (§1.3.7), four roles (§1.4.1.1), four states including Closed (§1.4.5.1), and Record → Finding → CAR → Closure (§1.4.4.1). These remain broader project objectives; the SRS now distinguishes the implemented MVP. The final wording of the thesis objective needs owner/advisor confirmation before a baseline decision.

## Reconciliation checkpoints

| Area | Corrected current interpretation | Remaining boundary |
| :--- | :--- | :--- |
| A — CAR/NCR | Internal Audit → CAR and Management Review → NCR; QMR approves both plans and never own plan; Auditor/Lead who reported the Finding verifies if not the owner; successful verification stops at `PENDING_CLOSURE`. UC-B-12/13, FR-B-28–32, BR-B-02/05/12, AC-B-21–23 and §4.31 now agree. | Closure authority, signatory count and return from closure remain `TBD-B-24`. DCC-reporter substitute remains `TBD-B-25`, held at `PENDING_VERIFICATION`. No inferred QMR/Lead/Assistant DCC closure or substitute authority. |
| B — Documents/DAR | MVP create/revise QM/QP/WI/SD/FM, one document per DAR; registrar receives/closes, DCC publishes; QM DCC→QMR→Dean and other types owner→Deputy Dean→QMR. DAR number is reserved on first submission and retained on resubmission. Close requires distribution/recall evidence or acceptable N/A. | Formal §4/§6.2 authority conflict, other DAR types, future effective dates and detailed N/A policy remain open or deferred. |
| B — PDF/acknowledgement | Document files use authorized download-only flow; inline viewer/preview is not required. Acknowledgement requires assignment, access/download of the assigned version, and explicit confirmation, with user/version/time/audit and duplicate protection. Receipt/holding/download alone is not acknowledgement. | Production assignment authority remains open; API access-prerequisite discrepancy below. |
| B — Records/Audit/Finding | Record/Evidence is separate from controlled Document. Added `AC-B-35` for Finding → Record → Evidence navigation and authorized download (TC-098). Independence uses actual auditor affiliation vs target unit, rejects conflicts, allows only DCC reasoned/audited waiver; Lead has no bypass. | TC-093–095 are fixture-blocked, not passed and not an application defect. Broader auditor qualification policy remains open. |
| B — Dashboard/export | Six current panels, scoped before aggregate; Sponsor aggregate-only without drill-down; zero, unauthorized and failed reads are distinct. Advanced metrics and post-closure measures are deferred. UC-B-16/FR-B-41/AC-B-27 export is deferred while preserving Chapter 1 objective. | Dashboard implementation discrepancies below. No export PASS is claimed. |
| C — Traceability | UC/FR/BR/AC authority and state references were aligned. Appendix C classifies existing TBDs as genuinely open, MVP-resolved, deferred, or fixture-limited and adds `TBD-B-24/25`. Appendix D records 136/0/3/0 current UI results and the new AC. Appendix E links the new AC and separates current, deferred and discrepant requirements. Appendix F separates dated historical QA from current status. | Old revision records and diagrams remain for historical trace and must not be read as current authorization. |

## Implementation discrepancies requiring follow-up

| ID | Requirement retained / observed implementation | Decision or change needed |
| :--- | :--- | :--- |
| ID-01 — acknowledgement prerequisite | `FR-A-14`, `BR-A-07`, `AC-A-12` require access/download of the assigned version before explicit confirmation. `efiling/api/src/services/acknowledgementService.ts` `confirm()` checks assignment, current version and read permission, then writes confirmation and audit event; it does not check a preceding access/download event. The UI flow alone does not enforce the API rule. | Add server-side evidence check and a targeted negative test, or obtain a formal requirements change. Do not mark the full AC passed from UI flow. |
| ID-02 — dashboard internal interface/recovery | `FR-B-42` and `CON-A-02` require cross-module reads through the agreed interface, with independent section failure behavior. `efiling/api/src/services/dashboardService.ts` directly queries Document/Acknowledgement/DAR tables (e.g. lines 22, 28, 35–36); `summary()` awaits sections in sequence and one rejection fails the whole summary. | Route cross-domain summary reads through an agreed interface and isolate section failures, or formally revise the locked interface decision. |
| ID-03 — chart technology | `CON-B-04`/`TBD-B-23` lock Chart.js 4 with `react-chartjs-2` 5. `efiling/frontend/src/pages/DashboardCharts.tsx` renders native SVG. The charts can be useful, but they do not satisfy that constraint as written. | Implement the locked stack or formally approve a technology decision change. |

The dated F.2 claim that a dependency cycle itself violates `NFR-B-04` is too strong: the NFR requires domain separation and business rules outside the request layer, but does not explicitly ban cycles. Current F.4 reclassifies this as a design concern requiring review, not an automatic NFR failure. Session handling is documented as an MVP limitation: `express-session` uses in-memory storage, a fresh secret and an eight-hour cookie, so API restart can require login again. No JWT requirement was added and this is not listed as a current SRS discrepancy; a durable store is a separate production decision.

## Open decisions and verification

The most consequential open decisions are `TBD-B-24` closure/signatures/return path, `TBD-B-25` substitute verifier for DCC-reported Findings, formal DAR and acknowledgement authority, source type mapping beyond Internal Audit/Management Review, automatic stage deadlines, and Chapter 1 alignment. Deferred features retain IDs and trace links; none is silently declared implemented. `TBD-B-11` business rule is confirmed for MVP, while TC-093–095 remain blocked for lack of a conflict fixture. Numeric targets for performance, load, SUS, deployment and restore are not certified by UI smoke.

`docs/MANUAL_UI_ACCEPTANCE.md` §9 records **40 scenarios / 139 cases: PASS 136, FAIL 0, BLOCKED 3, NOT RUN 0**, disposition **ACCEPT WITH OBSERVATIONS**. PDF TC-046/061/075 are PASS against the approved download-only behavior, with their observations retained. TC-123 confirms DCC-reporter waiting behavior; it is not evidence of substitute authority. System/API E2E results from 21 September are a separate historical result and were not rerun in this editorial task.

The normal generator completed. `python scripts/check_merged_srs.py SRS_v1.md --structure-only` passed both anchor and Markdown-table gates. A focused ID/trace check found all **304 original IDs preserved**, exactly three intentional new IDs (`AC-B-35`, `TBD-B-24`, `TBD-B-25`) each defined once, and the new AC linked from E.3. Two consecutive generator runs produced the same SHA-256 hash; `git diff --check` found no whitespace errors. The older full merge-preservation check still fails by design on the three new IDs, a shifted REF mention count, and editorially replaced original source lines; it is a verbatim-merge gate for v1.1, not a version 1.2 reconciliation validator. No SRS approval signature has been applied.

## Final structural and generation closure — 27 September 2026

The audit checked the **current generated artifact**, not the older truncated snapshot. The prior v1.2 editorial replacements had shortened UC-B-12, UC-B-13, UC-B-15 and UC-B-16 to requirement summaries; their actor, goal, pre/postcondition, main, alternate and exception detail is now restored in the permanent generator input. UC-B-13 and UC-B-16 describe conditional **deferred** flows and do not grant closure/export authority or claim MVP implementation.

| Mandatory part | Result | Mandatory part | Result |
| :--- | :--- | :--- | :--- |
| §1 Introduction | PASS | Appendix A — Glossary | PASS |
| §2 Overall Description | PASS | Appendix B — Analysis Models | PASS |
| §3 External Interface Requirements | PASS | Appendix C — To Be Determined List | PASS |
| §4 System Features | PASS | Appendix D — Acceptance Criteria | PASS |
| §5 Other Nonfunctional Requirements | PASS | Appendix E — End-to-End Traceability | PASS |
| §6 Other Requirements | PASS | Appendix F — Completeness and QA Record | PASS |

| Use Case | Defined | Main Steps | Alt/Exception | Requirement Link | AC Link |
| :--- | :--- | :--- | :--- | :--- | :--- |
| UC-B-01 | PASS | PASS | PASS/PASS | PASS | PASS |
| UC-B-02 | PASS | PASS | PASS/PASS | PASS | PASS |
| UC-B-03 | PASS | PASS | PASS/PASS | PASS | PASS |
| UC-A-01 | PASS | PASS | PASS/PASS | PASS | PASS |
| UC-A-02 | PASS | PASS | PASS/PASS | PASS | PASS |
| UC-A-03 | PASS | PASS | PASS/PASS | PASS | PASS |
| UC-A-04 | PASS | PASS | PASS/PASS | PASS | PASS |
| UC-A-05 | PASS | PASS | PASS/PASS | PASS | PASS |
| UC-A-06 | PASS | PASS | PASS/PASS | PASS | PASS |
| UC-A-07 | PASS | PASS | PASS/PASS | PASS | PASS |
| UC-A-08 | PASS | PASS | PASS/PASS | PASS | PASS |
| UC-A-09 | PASS | PASS | PASS/PASS | PASS | PASS |
| UC-A-10 | PASS | PASS | PASS/PASS | PASS | PASS |
| UC-A-11 | PASS | PASS | PASS/PASS | PASS | PASS |
| UC-A-12 | PASS | PASS | PASS/PASS | PASS | PASS |
| UC-B-04 | PASS | PASS | PASS/PASS | PASS | PASS |
| UC-B-05 | PASS | PASS | PASS/PASS | PASS | PASS |
| UC-B-06 | PASS | PASS | PASS/PASS | PASS | PASS |
| UC-B-07 | PASS | PASS | PASS/PASS | PASS | PASS |
| UC-B-08 | PASS | PASS | PASS/PASS | PASS | PASS |
| UC-B-09 | PASS | PASS | PASS/PASS | PASS | PASS |
| UC-B-10 | PASS | PASS | PASS/PASS | PASS | PASS |
| UC-B-11 | PASS | PASS | PASS/PASS | PASS | PASS |
| UC-B-12 | PASS | PASS | PASS/PASS | PASS | PASS |
| UC-B-13 (deferred closure) | PASS | PASS | PASS/PASS | PASS | PASS |
| UC-B-14 | PASS | PASS | PASS/PASS | PASS | PASS |
| UC-B-15 | PASS | PASS | PASS/PASS | PASS | PASS |
| UC-B-16 (deferred export) | PASS | PASS | PASS/PASS | PASS | PASS |

ID/trace result: **304/304 source IDs retained; 307 total including the three intentional reconciliation IDs; 31 REF definitions; 28/28 UC and 64/64 AC definitions.** There are no referenced-but-undefined non-REF IDs, no accidental duplicate canonical UC/US/CON/M/AC/REF definitions, and no non-REF ID left with only a single mention. FR rows reused in several UC tables are intentional shared requirements. Appendix E now explicitly accounts for all 76 FR IDs, including 14 child IDs that the original base-number inventories omitted, and all 64 AC IDs. The merge rule expands source REF ranges *before* mapping because the unified register has a different order; this removed invalid ranges such as `REF-28–12`. Nine REF entries (`REF-11`, `REF-12`, `REF-13`, `REF-17`, `REF-24`, `REF-25`, `REF-26`, `REF-27`, `REF-30`) remain registry-only historical references; they are defined, not dangling citations.

The current-MVP FR chain is present in E.1.1/E.2.1–E.2.4/E.3. The supporting §4.16/§4.30 behavior is identified instead of inventing human UC actors. Two narrower relationships remain **explicitly partial** rather than filled with an invented link: `AC-A-24` is a provisional file-content check sourced to §3.3/`TBD-A-09` without a dedicated FR ID; deferred `FR-B-20.1` has `AC-B-16` for source/type mapping but no separate repeated-issue alert AC. Neither is claimed as completed acceptance. Appendix D uses the current 136 PASS / 0 FAIL / 3 BLOCKED fixture result and keeps the older System/API E2E result separate. Appendix F now labels document QA, trace QA, implementation evidence, Manual UI Acceptance, TBDs and discrepancies distinctly.

`scripts/merge_srs.py` now calls `scripts/validate_srs_generation.py` **before writing** the generated file. The validator rejects missing or reordered §1–§6 / Appendix A–F, missing or abbreviated UC sections, lost/source-renumbered or undefined IDs, missing AC/FR Appendix E coverage, duplicate canonical definitions, invalid REF ranges and missing v1.2 markers. In-memory fault injection confirmed rejection when §5, UC-B-08, Appendix F, the AC-B-35 definition, or the FR-B-33 definition is removed. The normal `python scripts/merge_srs.py` command succeeded twice; both runs produced SHA-256 `5378A02ACA1F96AFC699A946DDABC21A70ED11F851750458E91D497C97C18200`. The standalone validator, older anchor/table structural gate, and `git diff --check` passed. The v1.1 full verbatim-preservation gate remains historical and is not the v1.2 closure test.

All generation code resolves inputs relative to the repository and uses no machine-specific/attachment paths. For a future commit to reproduce Version 1.2 from a clean checkout, include **`SRS_v1.md`, `scripts/merge_srs.py`, `scripts/srs_merge_rules.py`, `scripts/srs_reconcile_current.py`, `scripts/srs_reconcile_shared.py`, `scripts/validate_srs_generation.py`** together. Also include the updated QA/current-state records **`docs/SRS_RECONCILIATION_2026-09-26.md`, `SRS_Merge_Report.md`, `PROJECT_STATE.md`, `PROJECT_SUMMARY.md`**. The generated document links to the currently untracked `Project report/figures/groupB/b4_use_case.html`; include that file for its diagram link to work in a clean checkout. `GroupA_SRS_v2.md` and `GroupB_SRS_v2.md` are already tracked and unchanged. The referenced Manual UI and MVP evidence files are currently untracked and should accompany a reviewable documentation commit, although the generator does not read them. No commit or push occurred in this task.
