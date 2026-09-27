# MVP Verification Closure

**Review date:** 27 September 2026. **Scope:** targeted delta verification after current-MVP P0 implementation closure. Authority: `USE_CASE_IMPLEMENTATION_TRACEABILITY.md`, `MVP_GAP_CLOSURE_PLAN.md`, `MANUAL_UI_ACCEPTANCE.md`, and the named targeted tests. This is developer/team verification, not real-user acceptance or an Approved SRS Baseline. No feature, business rule, schema, seed, or TBD was changed in this review.

## Current UC status totals

| Primary status | Count |
| :--- | ---: |
| IMPLEMENTED + VERIFIED | 13 |
| IMPLEMENTED — PARTIALLY VERIFIED | 7 |
| PARTIALLY IMPLEMENTED | 2 |
| DEFERRED / OUT OF CURRENT MVP | 5 |
| BLOCKED BY TBD | 1 |
| **Total** | **28** |

**20/28** have substantially implemented current-MVP workflows (13 verified and 7 partially verified). No UC was promoted by this review: the new checks reran developer/team evidence, while revised UI acceptance was not executed. Every UC was reassessed against its primary status and boundary:

| UC | Primary status | Review basis / remaining boundary |
| :--- | :--- | :--- |
| UC-B-01 | PARTIALLY IMPLEMENTED | Demo-person switching works; one-user active-role selection is not the full-SRS flow. |
| UC-B-02 | DEFERRED / OUT OF CURRENT MVP | Account administration remains outside MVP. |
| UC-B-03 | DEFERRED / OUT OF CURRENT MVP | Audit events are written; general search UI/API is deferred. |
| UC-A-01 | IMPLEMENTED — PARTIALLY VERIFIED | DAR workflow and download behavior have test/source evidence; revised file labels and notice lack fresh UI acceptance. |
| UC-A-02 | IMPLEMENTED + VERIFIED | Submitted DAR workflow has prior manual/API evidence; unchanged in this review. |
| UC-A-03 | IMPLEMENTED + VERIFIED | Intake has prior manual/API evidence; unchanged. |
| UC-A-04 | IMPLEMENTED + VERIFIED | Review has prior manual/API evidence; unchanged. |
| UC-A-05 | IMPLEMENTED + VERIFIED | Approval has prior manual/API evidence; unchanged. |
| UC-A-06 | IMPLEMENTED + VERIFIED | Publication has prior manual/API evidence; unchanged. |
| UC-A-07 | DEFERRED / OUT OF CURRENT MVP | Cancellation remains parked. |
| UC-A-08 | IMPLEMENTED — PARTIALLY VERIFIED | Authorized document download has test/source evidence; revised copy notice lacks fresh UI acceptance. |
| UC-A-09 | IMPLEMENTED + VERIFIED | Assignment has prior manual/API evidence; unchanged. |
| UC-A-10 | IMPLEMENTED — PARTIALLY VERIFIED | Prior-access and explicit confirmation pass API tests; revised download/notice UI lacks fresh acceptance. |
| UC-A-11 | IMPLEMENTED + VERIFIED | DAR tracking/history has prior manual/API evidence; unchanged. |
| UC-A-12 | IMPLEMENTED + VERIFIED | DAR closure has prior manual/API evidence; unchanged. |
| UC-B-04 | IMPLEMENTED — PARTIALLY VERIFIED | Normal Record creation/reference passes; document-option outage and later-link path lack a safe runtime/manual fixture. |
| UC-B-05 | IMPLEMENTED + VERIFIED | Record search/read has prior manual/API evidence; unchanged. |
| UC-B-06 | IMPLEMENTED — PARTIALLY VERIFIED | Independence and waiver pass isolated API test; TC-093–095 remain fixture-blocked in UI. |
| UC-B-07 | IMPLEMENTED — PARTIALLY VERIFIED | Five sources are supported; runtime/manual source-variant evidence is incomplete. |
| UC-B-08 | IMPLEMENTED + VERIFIED | CAR/NCR opening path has prior manual/API evidence; unchanged. |
| UC-B-09 | IMPLEMENTED + VERIFIED | Correction/plan path has prior manual/API evidence; unchanged. |
| UC-B-10 | IMPLEMENTED + VERIFIED | QMR plan approval has prior manual/API evidence; unchanged. |
| UC-B-11 | IMPLEMENTED + VERIFIED | Activity result/evidence has prior manual/API evidence; unchanged. |
| UC-B-12 | BLOCKED BY TBD | Original Auditor/Lead verification path works; DCC-reporter substitute remains TBD-B-25. |
| UC-B-13 | DEFERRED / OUT OF CURRENT MVP | PENDING_CLOSURE is the MVP endpoint; final closure is deferred and TBD-B-24 remains. |
| UC-B-14 | IMPLEMENTED — PARTIALLY VERIFIED | Recorded-date overdue calculation, scope and count/list agreement pass targeted tests; revised list lacks UI acceptance; full AC-B-24 policy branches remain TBD. |
| UC-B-15 | PARTIALLY IMPLEMENTED | Six-domain and failure-isolation behavior pass targeted tests; FR-B-42 interface and locked Chart.js discrepancies remain, as does revised failure UI acceptance. |
| UC-B-16 | DEFERRED / OUT OF CURRENT MVP | Export remains outside MVP. |

## Newly verified behavior

On 27 September 2026, targeted isolated-schema API integration tests passed **6/6**: `documents.integration.ts`, `dar.integration.ts`, `acknowledgements.integration.ts`, `records.integration.ts`, `audit.integration.ts`, and `dashboard.integration.ts`. Focused frontend rendering tests passed **6/6**: `car-overdue.test.tsx`, `dashboard-page.test.tsx`, and `dashboard-charts.test.tsx`. The CAR workflow integration test passed in the preceding UC-B-14 implementation check; it was not repeated here. No whole-repository suite or shared demo database reset was run.

- PDF/Ack: authorized file access, attachment/download route, rejected confirmation before matching post-assignment access, and successful separate confirmation are exercised by integration tests. Source review confirms `ดาวน์โหลด PDF`, `?download=1`, the shared copy-status notice, and no preview control on the three revised surfaces. This is not a fresh browser observation.
- UC-B-04: normal Record creation, optional document link, evidence and authorized download passed. `recordService.options` catches document-reference lookup failure and the UI has a local warning, but the existing test does not interrupt the lookup and then prove late linking.
- UC-B-06: isolated integration reproduces Lead conflict denial, DCC denial without a reason, and DCC waiver with reason plus audit event. The historical UI fixture remains insufficient.
- UC-B-07: manual TC-097 and TC-099/100 cover Internal Audit and Management Review. The targeted integration test creates Internal Audit and Complaint Findings. `car.integration.ts` constructs an External Audit Finding directly in its isolated database to check the CAR opening guard; it does not test its UI/API creation and reopen path. Improvement Proposal is visible in source/UI choices but has no located creation-and-reopen runtime evidence. The invalid Management Review round-link test checks a guard, not a successful source variant. Observation/Suggestion UI behavior is not fully accepted.
- UC-B-14: Dashboard integration checks past/future/completed activities, missing or stale stage dates, an explicit current-stage date, permission scope, Sponsor denial, and count/list equality. Frontend rendering checks due labels and the authorized Dashboard link. It does not prove browser usability with a real overdue fixture.
- UC-B-15: Dashboard integration checks the normal six-domain response, one and two failed domains, scope-before-aggregation, and Sponsor aggregate output. Frontend rendering checks local unavailable text without a false zero and preserved successful panels. It does not prove the failure display in a browser.

## Remaining verification limitations

The browser-control service could not initialize for this review, so **no new manual UI check was executed**. The existing `MANUAL_UI_ACCEPTANCE.md` results remain **136 PASS, 0 FAIL, 3 BLOCKED** across 139 historical cases; they must not be interpreted as acceptance of the revised UI. The [delta checklist](MVP_DELTA_MANUAL_CHECKLIST.md) contains NOT RUN entries for the revised PDF/Ack UI, Record lookup outage, remaining Finding variants, overdue list and Dashboard failure display.

UC-B-04 has a **VERIFICATION LIMITATION**: no existing targeted runtime test or prepared controlled outage fixture proves the document-option failure and subsequent link. UC-B-06 has a **TEST DATA / FIXTURE LIMITATION**: TC-093–095 require a permitted same-department auditor/target pair and remain BLOCKED. UC-B-07 has a **SOURCE-VARIANT VERIFICATION LIMITATION** for External Audit UI/API creation and Improvement Proposal creation/reopen, plus incomplete Observation/Suggestion UI acceptance. UC-B-14 and UC-B-15 have revised UI acceptance gaps. API and static rendering results do not turn these into manual PASS results.

## Deferred UCs

UC-A-07 cancellation, UC-B-02 account administration, UC-B-03 general audit search, UC-B-13 final CAR/NCR closure, and UC-B-16 export remain outside the current MVP. Shared foundations or guards do not change their primary classification.

## Policy/TBD limitations

- UC-B-14: `TBD-B-09/16` govern automatic working-day stage deadlines and the near-due threshold. No provisional threshold was accepted; full AC-B-24 remains open.
- UC-B-12: `TBD-B-25` governs the substitute verifier when DCC reports a Finding. The verified original Auditor/Lead path is retained.
- UC-B-13: `TBD-B-24` governs final closure authority/signatures/return path beyond the MVP endpoint.
- UC-A-01/A-08/A-10: final production copy-control wording remains subject to `TBD-A-04`; the current notice follows the documented working assumption.
- Other unresolved CAR/NCR source mappings and production account/assignment authority remain as recorded in the traceability matrix; this review supplies no new decision.

## Architecture/documentation discrepancies

UC-B-15 still reads cross-module tables directly where FR-B-42/CON-A-02 calls for agreed internal interfaces, and its native SVG charts differ from locked Chart.js 4/`react-chartjs-2` 5. UC-B-14's `request_due_status` SQL view remains unsuitable as current acceptance evidence because it covers stage dates, not activity dates, and includes a provisional near-due default. `Database_Design.md` v0.1 describes 33 tables versus 38 current Prisma models; the five additional models are documented refinements awaiting ERD alignment. Generated SRS §4.13 still contains historical implementation-status prose for the now-enforced Ack prerequisite; change it only through the SRS generation workflow when that documentation is reviewed. No discrepancy was changed here.

## Real-user acceptance still required

Execute the [20 focused delta checks](MVP_DELTA_MANUAL_CHECKLIST.md) in the current UI with authorized data, record actual observations, and update `MANUAL_UI_ACCEPTANCE.md` only for executed results. A controlled isolated outage is needed for UC-B-04 and the visible UC-B-15 error state; an approved independence fixture is needed for UC-B-06. Keep those checks NOT RUN or BLOCKED until executable. After verification review, the next planned documentation task is **ERD alignment**. Current-MVP P0 implementation gaps remain closed; real-user sign-off has not been obtained.
