# Chapter 4 Source Pack

**Current-state cut-off: 27 September 2026.** This is verified source material for revising Chapter 4, not Chapter 4 text or an acceptance certificate. The primary UC classifications come from [Use Case Implementation Traceability](USE_CASE_IMPLEMENTATION_TRACEABILITY.md), checked against the [MVP Gap Closure Plan](MVP_GAP_CLOSURE_PLAN.md) and [MVP Verification Closure](MVP_VERIFICATION_CLOSURE.md). Requirements and MVP boundaries come from [`SRS_v1.md` v1.2](../SRS_v1.md) §1.4.3, §4 and Appendix D. Database facts come from [Database Design](../Database_Design.md) and the current Prisma schema. Test results come from the named verification reports and [Manual UI Acceptance](MANUAL_UI_ACCEPTANCE.md). These sources have different dates and purposes; a past test result is not a fresh acceptance of a revised screen.

## 1. Current MVP Implementation Summary

The current MVP is one React/Express application using PostgreSQL and Prisma. It supports demo-account sign-in and server-enforced role scope; controlled-document registration and new/revise DAR processing; explicit per-version acknowledgement; Records and Evidence; audit rounds and Findings; the confirmed CAR/NCR path through effectiveness verification; and a six-domain operational Dashboard. Successful CAR/NCR verification reaches `PENDING_CLOSURE`, where the MVP intentionally stops. Current-MVP P0 implementation gaps identified in the closure plan are closed. This statement does not promote deferred UCs or unresolved policy-dependent ACs to complete status.

The traceability matrix contains 28 UCs. Thirteen are implemented and verified, seven are implemented with incomplete verification, two are partly implemented, five are deferred, and one is blocked by a business decision. Thus 20 have substantially implemented current workflows, while the full 28-UC SRS and all acceptance criteria have not been verified.

## 2. Use Case Implementation Results

The counts below were recomputed from the **28 individual rows** in the current traceability matrix, rather than copied from its summary. Primary statuses are mutually exclusive. A secondary TBD or design flag does not create another UC.

| Status | Count | Meaning |
| :--- | ---: | :--- |
| IMPLEMENTED + VERIFIED | 13 | Current MVP workflow has recorded implementation and relevant test evidence; not a claim of real-user sign-off or every full-SRS branch. |
| IMPLEMENTED — PARTIALLY VERIFIED | 7 | Current implementation exists, but specific runtime, fixture or revised-UI evidence remains incomplete. |
| PARTIALLY IMPLEMENTED | 2 | Part of the UC works; a stated full-SRS or current design/technology requirement remains unmet. |
| DEFERRED / OUT OF CURRENT MVP | 5 | Entire UC is intentionally outside the present MVP endpoint, even if shared data or guards exist. |
| BLOCKED BY TBD | 1 | Normal path works, but one in-scope branch cannot be assigned an actor without a business decision. |
| **Total** | **28** | Primary UC count. |

Evidence abbreviations: **MUA** = recorded historical `TC-` case in [Manual UI Acceptance](MANUAL_UI_ACCEPTANCE.md); **targeted API/UI** = dated checks in [MVP Verification Closure](MVP_VERIFICATION_CLOSURE.md); **D-** = pending item in the [20-check delta checklist](MVP_DELTA_MANUAL_CHECKLIST.md), never a PASS result. The [traceability matrix](USE_CASE_IMPLEMENTATION_TRACEABILITY.md) gives requirement and AC references for each row.

| UC | Name | Current Status | Main Evidence | Important Limitation |
| :--- | :--- | :--- | :--- | :--- |
| UC-A-01 | Draft or revise document | IMPLEMENTED — PARTIALLY VERIFIED | MUA TC-043–046,050; DAR integration and PDF source/build check | Revised download-only labels and copy notice need manual browser acceptance (D-01–02). Other DAR request types are deferred sub-flows. |
| UC-A-02 | Prepare and submit DAR | IMPLEMENTED + VERIFIED | MUA TC-044–047,051; DAR integration | Verified for current new/revise scope; four other request types remain outside MVP. |
| UC-A-03 | DAR intake | IMPLEMENTED + VERIFIED | MUA TC-048–052; DAR integration | Current intake/return route only. |
| UC-A-04 | Review document and DAR | IMPLEMENTED + VERIFIED | MUA TC-053–054,064–066; DAR integration | Formal authority wording conflict still requires owner review before a baseline. |
| UC-A-05 | Decide DAR approval | IMPLEMENTED + VERIFIED | MUA TC-055–056,066–067; DAR integration | Current routing is tested; formal authority wording conflict remains. |
| UC-A-06 | Register and publish document | IMPLEMENTED + VERIFIED | MUA TC-057–059; DAR integration/E2E | Electronic publication does not certify custody of a paper original. |
| UC-A-07 | Cancel use of controlled document | DEFERRED / OUT OF CURRENT MVP | SRS §1.4.3; traceability source review | Cancellation command and UI are outside new/revise MVP scope. |
| UC-A-08 | Search and access documents | IMPLEMENTED — PARTIALLY VERIFIED | MUA TC-028–035,040–042; Documents integration and PDF source/build check | Revised download/copy-notice screen needs manual acceptance (D-03). |
| UC-A-09 | Assign and track acknowledgement | IMPLEMENTED + VERIFIED | MUA TC-071–073,079; Ack integration | DCC assignment authority is the confirmed demo rule, not settled production authority. |
| UC-A-10 | Confirm document acknowledgement | IMPLEMENTED — PARTIALLY VERIFIED | MUA TC-074–079; targeted Ack integration for post-assignment file-access prerequisite | Server prerequisite and separate confirmation are tested; revised download/notice UI needs manual acceptance (D-04–06). |
| UC-A-11 | Track DAR and inspect history | IMPLEMENTED + VERIFIED | MUA TC-049–050,068–070; DAR integration | Evidence covers current DAR types. |
| UC-A-12 | Check completeness and close DAR | IMPLEMENTED + VERIFIED | MUA TC-060–063,067; DAR integration | Current new/revise checklist; other request types are deferred. |
| UC-B-01 | Login and select active role | PARTIALLY IMPLEMENTED | MUA TC-001–024; auth tests | Demo-person switching works; one user selecting/switching assigned roles is not implemented. The MVP adaptation is intentional. |
| UC-B-02 | Manage users and roles | DEFERRED / OUT OF CURRENT MVP | SRS §1.4.3; traceability source review | Full account administration UI/API is deferred; seeded accounts do not complete this UC. |
| UC-B-03 | View audit trail | DEFERRED / OUT OF CURRENT MVP | Event-writing integration; traceability source review | Audit writes exist, but general scoped search/view UI/API is deferred. |
| UC-B-04 | Create Record and Evidence | IMPLEMENTED — PARTIALLY VERIFIED | MUA TC-080–082; Records integration and source review | Controlled document-lookup outage and later link lack runtime/manual proof (D-07). |
| UC-B-05 | Search, view and download Record/Evidence | IMPLEMENTED + VERIFIED | MUA TC-083–089,098; Records integration/E2E | MUA observed download start; file integrity has separate API/storage evidence. |
| UC-B-06 | Create audit round | IMPLEMENTED — PARTIALLY VERIFIED | MUA TC-090–092; isolated Audit integration | Independence/waiver API checks pass; TC-093–095 remain fixture-blocked in UI (D-08–10). |
| UC-B-07 | Identify and record Finding | IMPLEMENTED — PARTIALLY VERIFIED | MUA TC-096–103; Audit/CAR integration and source review | Five sources are supported, but External Audit and Improvement Proposal creation/reopen and Observation/Suggestion UI coverage are incomplete (D-11–13). |
| UC-B-08 | Open CAR/NCR from Finding | IMPLEMENTED + VERIFIED | MUA TC-104–105,119; CAR integration | Confirmed Internal Audit→CAR and Management Review→NCR mappings only; other mappings are undecided. |
| UC-B-09 | Record correction, root cause and action plan | IMPLEMENTED + VERIFIED | MUA TC-106–109,120; CAR integration | Automatic stage-deadline policy is separate and unresolved. |
| UC-B-10 | Approve or return action plan | IMPLEMENTED + VERIFIED | MUA TC-110–112,120; CAR integration | QMR approval is the current confirmed MVP rule. |
| UC-B-11 | Record activity results and Evidence | IMPLEMENTED + VERIFIED | MUA TC-113–115,121; CAR integration | Evidence/result gates are covered for current path. |
| UC-B-12 | Verify corrective-action effectiveness | BLOCKED BY TBD | MUA TC-116–118,122–123; CAR integration | Original reporting Auditor/Lead path is verified; substitute verifier for a DCC-reported Finding requires `TBD-B-25`. |
| UC-B-13 | Close CAR/NCR after review | DEFERRED / OUT OF CURRENT MVP | MUA TC-118,123; CAR guard/E2E | MVP stops at `PENDING_CLOSURE`; authority/signatures/return path require `TBD-B-24`. `Closure` table existence is not a working close action. |
| UC-B-14 | Follow overdue work | IMPLEMENTED — PARTIALLY VERIFIED | Targeted Dashboard/CAR API and UI rendering tests | Recorded-date scoped count/list work; revised UI needs manual acceptance (D-14–17). Automatic working-day dates and near-due policy await `TBD-B-09/16`. |
| UC-B-15 | View operational dashboard | PARTIALLY IMPLEMENTED | MUA TC-025–027,125–134; targeted Dashboard normal/failure API and UI tests | P0 failure isolation works. Direct cross-module reads violate `FR-B-42`; SVG differs from locked Chart.js. Revised UI needs manual acceptance (D-17–20). |
| UC-B-16 | Export corrective/preventive summary | DEFERRED / OUT OF CURRENT MVP | SRS §1.4.3; traceability source review | Export and its authority/scope are outside MVP. |

## 3. Implemented System Areas

- **Authentication / role scope:** Demo accounts sign in; the API enforces access and scopes module data. The demo changes people rather than selecting roles assigned to one user. The MVP session is in memory, so API restart may require login again.
- **Documents:** One controlled-document register stores versions and file metadata. Authorized users search, inspect and download PDF files; a download is an uncontrolled copy and does not itself acknowledge the document. The revised copy notice awaits browser acceptance.
- **DAR:** New and revised QM/QP/WI/SD/FM requests follow the confirmed role routing, with draft files, immutable submitted-round snapshots, decisions, status history, publication and distribution/recall evidence or accepted N/A before DAR closure. The implementation retains earlier versions and files.
- **Acknowledgement:** The demo DCC assigns eligible readers to a version. A matching post-assignment file-access event is required before the assignee explicitly confirms; the confirmation is tied to that version and does not move to a later one. Revised UI remains unaccepted manually.
- **Records / Evidence:** Authorized roles create, find and read Records, attach/download file Evidence, and optionally refer to the shared Document register. The document-option failure fallback exists, but the controlled outage and later-link sequence lacks runtime evidence.
- **Audit / Finding:** Rounds, members, scope, independence checks and reasoned DCC waiver are implemented. Finding data accepts five source types and can reference Record, Document and Evidence. Manual coverage of all source variants and independence waiver remains incomplete.
- **CAR / NCR:** Confirmed Finding mappings open requests; owners record correction, cause, revisioned plan and activity results; QMR decides plans; the original reporting Auditor/Lead verifies effectiveness, with self-verification denied. The implemented MVP stops at `PENDING_CLOSURE`. DCC-reporter substitute verification and final closure remain unresolved/deferred.
- **Dashboard:** Six role-scoped domain summaries are derived from domain data; Sponsor sees aggregates without personal drill-down. A failed domain now has a local unavailable state while successful permitted panels remain. Recorded-date overdue count and actionable list use the same current-stage/current-plan calculation. Revised screens still need manual acceptance; interface and chart-technology deviations remain.

## 4. Database / ERD Results

PostgreSQL and Prisma implement **38 models mapped to 38 persisted tables**. The maintained [Chapter 3 ERD set](../Project%20report/figures/ch3/er/README.md) and [Database Design](../Database_Design.md) are aligned to that model. The earlier 33-table design is historical. No current table was removed. `request_due_status` is a SQL **view**, not a model/table, and it is not the current overdue source. The Dashboard has no duplicate source-of-truth table.

The main persisted paths are Document→Version→File; DAR→submitted round/files/decisions/history→published Version and distribution; Version→AcknowledgementAssignment→Confirmation; QualityRecord→Evidence with optional Document reference; AuditRound→Members/Findings; Finding→Record/Evidence and CorrectiveRequest; and Request→Correction/Cause→Plan/Activities→Evidence or reused Record→Approval→Verification/history. `Closure` supports later scope but is not written by a current close command.

Five legitimate implementation refinements account for the difference from 33 to 38: `DocumentImportSource` tracks import provenance; `DarRound` retains a submitted snapshot; `DarFile` retains prepublication/logistics files; `ActivityRecordLink` connects plan activities to reusable Records; and `DocumentCodeSequence` numbers controlled documents separately from DAR/CAR sequences. `DarFile.roundNo` is a logical association, not an FK to `DarRound`; files may precede the submitted-round row.

## 5. Verification Results

### Automated / integration verification

The [27 September targeted closure](MVP_VERIFICATION_CLOSURE.md) reports **6/6 isolated-schema API integration checks** across Documents, DAR, Acknowledgement, Records, Audit and Dashboard, and **6/6 focused frontend rendering checks** across the named overdue and Dashboard test files. Earlier CAR workflow integration evidence was retained but was not rerun in that closure. These are developer/team checks of specific behavior; they do not establish complete AC coverage or browser acceptance of revised screens. The earlier [21 September system E2E report](SYSTEM_E2E_VERIFICATION_2026-09-21.md) is a separate run and must retain its own date and scope.

### Historical Manual UI Acceptance

The recorded 139-case suite has **136 PASS, 0 FAIL, 3 BLOCKED, 0 NOT RUN**. Its recorded decision is **ACCEPT WITH OBSERVATIONS**. TC-093–095 remain BLOCKED for the auditor-independence fixture, not failed application tests. This historical suite predates several revised PDF, overdue and failure-isolation screens and cannot certify those changes.

### Delta UI verification still NOT RUN

The separate [delta checklist](MVP_DELTA_MANUAL_CHECKLIST.md) has **20/20 NOT RUN** (D-01–D-20). It covers revised PDF/Ack presentation, the Record lookup outage and late link, audit fixture/source variants, overdue work and Dashboard failures. No item is counted as PASS on the strength of source review or automated tests.

### Real-user acceptance — not yet performed

Neither the historical developer/team browser record nor targeted tests constitute real-user acceptance or sign-off. The SRS remains a Working Draft, not an Approved Baseline. Usability, performance, deployment and other policy-dependent criteria need their own approved thresholds and evidence before being reported as passed.

## 6. Remaining Limitations

| Type | Current boundary | Effect on Chapter 4 and follow-up |
| :--- | :--- | :--- |
| Partial verification | UC-A-01/A-08/A-10 revised file UI; UC-B-04 outage/late link; UC-B-06 fixture; UC-B-07 source variants; UC-B-14 overdue UI. UC-B-15 also needs revised UI acceptance despite its partial-implementation primary status. | Describe implementation and targeted evidence, then state exactly which D-01–D-20 checks remain NOT RUN. Do not promote primary statuses. |
| Partial implementation | UC-B-01 lacks true per-user active-role selection; UC-B-15 retains the internal-interface and chart-stack deviations. | Describe the demo adaptation and Dashboard behavior separately from the unmet requirements. |
| Deferred scope | UC-A-07, UC-B-02, UC-B-03, UC-B-13 and UC-B-16. | Exclude them from current-MVP completion claims; do not call intentional deferral a test FAIL. |
| Business-policy TBD | `TBD-B-09/16` stage working-day defaults/near-due; `TBD-B-24` closure authority; `TBD-B-25` DCC-reporter substitute; production acknowledgement authority and other source mappings remain open. | State the current working rules and endpoints without treating provisional values as approved policy. |
| Architecture/design discrepancy — Dashboard interface | `dashboardService` still reads Document/DAR/Ack tables directly rather than through the agreed internal interface (`FR-B-42`, `CON-A-02`). Normal six-domain and failure-isolation behavior has targeted evidence; no present failure is attributed to this design breach. | Disclose the deviation. A later focused code change is needed for conformance; documentation alone does not resolve it. |
| Technology discrepancy — charts | Native SVG charts work in targeted tests but differ from locked Chart.js 4 with `react-chartjs-2` 5 (`CON-B-04`). | Describe the actual SVG implementation. Later code change or an explicit design decision is needed before claiming technology compliance. |
| Data-use discrepancy — overdue view | SQL `request_due_status` covers stage dates and has a provisional near-due fallback; the current service instead derives overdue from recorded current-plan activity or explicit current-stage dates. The view is not used as current acceptance evidence and does not create a known current-function failure. | Explain the current service calculation. Future use of the view needs approved policy and activity-aware design; retain the view distinction in documentation. |
| Prisma metadata discrepancy | SQL enforces `dar_file.uploaded_by`→`app_user`, but Prisma `DarFile.uploadedById` lacks the `User` relation declaration. No current persisted-integrity or runtime failure is evidenced. | Record the metadata difference without calling it an SRS contradiction. A later schema-metadata review may be needed; documentation cannot add the ORM relation. |
| Documentation currency | The traceability introduction/data-summary and gap/verification reports retain pre-alignment ERD follow-up language; generated SRS §4.13/D.3 retains dated implementation-status prose. The existing Chapter 4 draft describes a 22 September state and says the 139-case browser suite had not run. | Use this source pack for the current 27 September state. Update generated SRS only through its merge workflow in a separate requirements task; revise Chapter 4 in the next task, preserving dates when reporting historical results. |

No confirmed requirement-to-persisted-model contradiction was found in the ERD alignment review. The four technical differences above are separate from current-MVP P0 functional closure and from unexecuted manual checks.

## 7. Safe Claims for Chapter 4

- “The current MVP implements 20 substantially complete UC workflows: 13 with verified recorded evidence and seven with verification still incomplete; two UCs are partly implemented, five are deferred, and one is policy-blocked.” State the cut-off date and status definitions.
- “The confirmed new/revise DAR and CAR/NCR paths were exercised through their current MVP endpoints; a successful CAR/NCR effectiveness review ends at `PENDING_CLOSURE`.”
- “The 27 September targeted API and frontend checks passed within their named scopes; the revised browser UI has not been accepted through the 20-item delta checklist.”
- “The historical 139-case manual suite recorded 136 PASS and three fixture-blocked cases; its result is not real-user sign-off.”
- “The database design and Chapter 3 ERD now describe 38 persisted Prisma models/tables, including five implementation refinements. Dashboard figures are derived from domain records, without a duplicate dashboard table.”
- “Recorded-date overdue count/list and six-domain Dashboard failure isolation have targeted test evidence, while policy-dependent deadline/near-due behavior and the noted design deviations remain open.”

## 8. Claims NOT Safe Yet

- “All 28 Use Cases are complete,” “all acceptance criteria passed,” or “the SRS is an Approved Baseline.”
- “Users accepted or signed off the system,” or “the revised UI passed manual acceptance.” The historical 139 cases and the 20 NOT RUN delta checks are separate populations.
- “139/139 tests passed,” “TC-093–095 passed,” or “the audit waiver was accepted in the browser.”
- “CAR/NCR closes completely,” “DCC-reported Findings have an approved substitute verifier,” or “the other Finding sources have approved CAR/NCR mappings.”
- “Automatic working-day stage deadlines or near-due policy are finalized,” or “the SQL overdue view proves the present Dashboard calculation.”
- “Dashboard conforms to the cross-module interface and locked Chart.js stack.”
- “All five Finding-source variants and the Record lookup outage/late-link sequence have complete runtime/browser evidence.”
- The existing Chapter 4 draft's undated assertions that the 139-case suite was never run or that the current demo database still has no workflow-created data. Those sentences describe an older observation and need fresh dated evidence or removal before a current-results claim.

## 9. Recommended Chapter 4 Outline

The faculty [report rules](REPORT_RULES.md) call for results and discussion with evidence and limitations, but do not prescribe project-specific Chapter 4 subsection titles. The existing [`Chapter_4_E-Filing_Draft.docx`](report-drafts/Chapter_4_E-Filing_Draft.docx) has 4.1 implementation, 4.2 testing and 4.3 discussion; its content can be reused after evidence dates and stale browser claims are corrected. Recommended structure:

1. **4.1 Introduction and evidence cut-off** — scope, MVP boundary, source dates and how results differ from acceptance.
2. **4.2 System implementation results** — the eight actual system areas, using verified behavior and screenshots only where current and attributable.
3. **4.3 Use Case results** — 28-UC status table, definitions, and the concise reason for each non-fully-verified UC; distinguish deferred from failed.
4. **4.4 Database and relationships** — current 38-model ERD, five refinements and cross-module paths; identify `Closure` as supporting deferred scope.
5. **4.5 Verification and testing** — dated automated/E2E evidence, historical 139-case UI result, 20 separate NOT RUN delta checks, and real-user acceptance status.
6. **4.6 Discussion and remaining limitations** — policy TBDs, partial verification, architecture/technology/data-use discrepancies and limits of the test environment.
7. **4.7 Chapter summary** — conclusions supported by the preceding evidence only.

When drafting, apply the Chapter 4 heading, table, figure and citation rules in `REPORT_RULES.md`. The existing draft must not be treated as current test evidence merely because its prose is already formatted.
