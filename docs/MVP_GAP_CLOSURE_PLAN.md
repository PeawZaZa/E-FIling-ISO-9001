# MVP Gap Closure Plan

**Assessment date:** 27 September 2026. **Authority:** `SRS_v1.md` v1.2 §1.4.3, relevant §4 UCs and Appendix D; `works/MVP_2_Weeks_and_Role_Matrix.md` for confirmed demo scope; `docs/USE_CASE_IMPLEMENTATION_TRACEABILITY.md` for source and recorded-test evidence. This plan reviews existing evidence and targeted current source. Targeted PDF and Dashboard checks passed; no new manual acceptance was performed. It is not an Approved Baseline or real-user acceptance.

## 1. Executive Summary

The earlier **13/3/8/2/2** split was incorrect. UC-B-02 and UC-B-03 are wholly deferred, despite shared user/audit foundations. UC-B-13 is deferred because `PENDING_CLOSURE` is the confirmed MVP endpoint; `TBD-B-24` is its secondary policy flag. The corrected **primary** classifications are:

| Primary UC status | Count |
| :--- | ---: |
| IMPLEMENTED + VERIFIED | 13 |
| IMPLEMENTED — PARTIALLY VERIFIED | 7 |
| PARTIALLY IMPLEMENTED | 2 |
| DEFERRED / OUT OF CURRENT MVP | 5 |
| BLOCKED BY TBD | 1 |
| **Total** | **28** |

**No current-MVP P0 implementation gap remains in this plan.** UC-B-14 now tracks persisted applicable dates; UC-B-15 retains a P1 internal-interface discrepancy after its P0 failure-isolation fix. PDF presentation/AC-A-21 for UC-A-01, UC-A-08 and UC-A-10 was implemented and source/build checked on 27 September 2026. **Verification-only gaps affect 7 UCs:** those three PDF UCs plus UC-B-04, UC-B-06, UC-B-07 and UC-B-14. **Five UCs are primarily deferred:** UC-A-07, UC-B-02, UC-B-03, UC-B-13 and UC-B-16. **One UC is primarily business-policy blocked:** UC-B-12. These categories count each UC once by its main remaining issue; secondary flags below are not additive. UC-B-01 is a partial UC: its real per-user role-switch scenario is a documented full-SRS gap, while the MVP deliberately switches demo persons. It is not a P0 coding defect.

The conservative answer is **20/28 substantially implemented current workflows** (13 verified + 7 partially verified). It does not mean 20 full-scope UCs or every AC passed. MUA remains 136 PASS, 0 FAIL, 3 BLOCKED across 139 cases; TC-093–095 are fixture-blocked, not application failures. The revised PDF, Dashboard and overdue screens have no new manual UI acceptance.

### Coverage of all 15 non-fully-verified UCs

Flags: **A** current-MVP implementation; **B** verification/test; **C** deferred/out of MVP; **D** business TBD; **E** documentation/ERD drift. The primary status is unchanged from the corrected traceability matrix.

| UC | Primary status | Remaining flag(s) and specific boundary |
| :--- | :--- | :--- |
| UC-B-01 | PARTIALLY IMPLEMENTED | C: `AppLayout.tsx` changes demo person, not a role assigned to one user. MVP matrix §3/§4 accepts this demo adaptation; AC-B-01–03 full-SRS role selection remains future work. |
| UC-B-02 | DEFERRED / OUT OF CURRENT MVP | C: full account administration UI/API and administrative AC-B-04 are outside MVP per SRS §1.4.3 and the MVP matrix; shared IDs/seed remain. |
| UC-B-03 | DEFERRED / OUT OF CURRENT MVP | C: FR-B-07 event writing continues; general FR-B-08 audit search UI/API is deferred by the MVP matrix. |
| UC-A-01 | IMPLEMENTED — PARTIALLY VERIFIED | B: DAR draft/history and logistics evidence now use download-only links and the shared AC-A-21 notice; revised UI needs manual acceptance. E: `DarFile`/`DarRound` remain legitimate refinements omitted by the older ERD. |
| UC-A-07 | DEFERRED / OUT OF CURRENT MVP | C: cancellation FR-A-11/AC-A-09 is expressly parked. |
| UC-A-08 | IMPLEMENTED — PARTIALLY VERIFIED | B: authorized download and AC-A-21 notice are implemented in Documents; revised notice needs manual acceptance. |
| UC-A-10 | IMPLEMENTED — PARTIALLY VERIFIED | B: the server requires a matching post-assignment `DocumentFile` access event before confirmation (AC-A-12 verified in targeted integration); Ack now downloads, displays AC-A-21 and keeps a separate confirm button, pending revised UI acceptance. |
| UC-B-04 | IMPLEMENTED — PARTIALLY VERIFIED | B: document-reference lookup failure fallback exists in `recordService.options` and Records UI, but AC-B-08 outage/late-link has no targeted runtime proof. |
| UC-B-06 | IMPLEMENTED — PARTIALLY VERIFIED | B: independence and DCC waiver are integration-tested; TC-093–095 cannot run manually without a permitted same-department fixture. |
| UC-B-07 | IMPLEMENTED — PARTIALLY VERIFIED | B: source/API support five Finding sources; manual cases cover a subset and do not complete the observation/suggestion UI variant. |
| UC-B-12 | BLOCKED BY TBD | D: original Auditor/Lead verifier path, self-denial and pass/fail are implemented and verified; only DCC-reporter substitute authority `TBD-B-25` is unresolved. |
| UC-B-13 | DEFERRED / OUT OF CURRENT MVP | C, D: current endpoint is `PENDING_CLOSURE`; final close is deferred and its actor/signatures/return path remain `TBD-B-24`. Guard against premature close is verified. |
| UC-B-14 | IMPLEMENTED — PARTIALLY VERIFIED | B, D: Dashboard count and scoped CAR/NCR overdue list now derive from recorded unfinished current-plan activity dates or an explicit current-stage due date, without an overall-date fallback. The list shows current status, due work/date, responsible actor or waiting role and detail action; Sponsor remains aggregate-only. Manual UI acceptance is pending. Automatic working-day stage defaults and near-due threshold depend on `TBD-B-09/16`; full AC-B-24 remains open. |
| UC-B-15 | PARTIALLY IMPLEMENTED | A, E: six-domain scoped normal path and independent failure recovery now work in targeted tests. Direct cross-module DB reads still violate FR-B-42 interface design; SVG differs from locked Chart.js. Revised failure UI needs manual acceptance. SQL-view bypass is data-use drift, not a missing model. |
| UC-B-16 | DEFERRED / OUT OF CURRENT MVP | C: FR-B-41/AC-B-27 export is intentionally outside MVP. |

## 2. P0 — Before advisor/demo/thesis results

The confirmed current-MVP P0 implementation tasks are complete. UC-A-10's server-side AC-A-12 prerequisite, three PDF presentation/AC-A-21 surfaces, UC-B-15 dashboard failure isolation and UC-B-14 recorded-date overdue tracking have targeted test/build evidence. Revised UI manual acceptance remains open for these surfaces. UC-B-14 automatic working-day deadlines and near-due labels remain policy-dependent; full AC-B-24 cannot be claimed while `TBD-B-09/16` are open. Disclose these exact limits before a demonstration.

## 3. P1 — Verify / improve if time allows

| UC | Type | Evidence and limited action | Size |
| :--- | :--- | :--- | :--- |
| UC-A-01 | B — revised UI acceptance | Source/build and DAR integration verify download links and shared AC-A-21 notice. Manually check draft/history and logistics evidence links and notice; retain earlier TC-046 separately. | SMALL |
| UC-A-08 | B — revised UI acceptance | Source/build and Documents integration verify version download and shared AC-A-21 notice. Manually check detail/version display and notice; retain earlier TC-032 separately. | SMALL |
| UC-A-10 | B — revised UI acceptance | Ack integration verifies the server prior-access prerequisite and explicit confirmation. Manually check download, notice and separate confirm button on own work and DCC version detail; retain earlier TC-075 separately. | SMALL |
| UC-B-04 | B — verification only | `recordService.options` catches document lookup failure and `RecordsPage.tsx` warns while allowing an unlinked Record. Run a controlled outage, save an unlinked Record, then restore lookup and link it; verify AC-B-08/AC-A-25 without changing production data. | SMALL |
| UC-B-06 | B — fixture/manual verification | `audit.integration.ts` exercises independence and DCC waiver. With an authorized isolated same-department fixture, rerun TC-093–095 through UI; retain BLOCKED until observed. Do not reseed/reset the current database. | SMALL |
| UC-B-07 | B — verification only | `auditService.createFinding` supports five sources and CAR guards observation/suggestion. Exercise the remaining source variants and nonconformity-only offer in targeted UI/manual cases; retain existing API evidence separately. | SMALL |
| UC-B-14 | B — revised UI acceptance | Targeted API tests cover recorded past/future/completed activity dates, explicit current-stage date, missing/stale dates, role scope, Sponsor denial and Dashboard/list count agreement. Manually check the CAR/NCR overdue filter, due-work labels and Dashboard link under permitted roles. | SMALL |
| UC-B-15 | B — revised UI acceptance | Targeted Dashboard integration and page tests verify one/two failed domains, scoped successes, Sponsor output and local warning. Manually inspect the revised unavailable panel; keep earlier TC-125–134 evidence separate. | SMALL |
| UC-B-15 | Architecture/design discrepancy | FR-B-42/CON-A-02 requires agreed internal interfaces; `dashboardService.ts` directly reads Document/DAR/Ack data. Specify narrow per-domain read interfaces and migrate only those reads, preserving the present role scope and failure isolation. Do not turn this into a broad service refactor. | MEDIUM |
| UC-B-15 | Locked technology discrepancy | `DashboardCharts.tsx` renders native SVG although CON-B-04 specifies Chart.js 4 + `react-chartjs-2` 5. Either implement the locked choice and retest charts, or obtain an explicit design decision; do not claim stack compliance from the SVG tests. This is distinct from dashboard functional failure. | MEDIUM |

Before advisor/thesis results, state the two dashboard design/technology deviations explicitly if they remain. Verification-only rows are not implementation defects, and no blocked manual case becomes PASS based on an integration test.

## 4. P2 — Deferred / policy / report follow-up

| Item | Classification and action |
| :--- | :--- |
| UC-A-07, UC-B-02, UC-B-03, UC-B-13, UC-B-16 | C: intentionally deferred whole UCs. Retain their SRS requirements, but exclude them from current-MVP P0 coding and acceptance claims. UC-B-03 retains mandatory event writing; UC-B-02 retains shared identity/seed foundations. |
| UC-B-01 full role switching | C secondary: real one-user multi-role selection remains full-SRS scope; the demo-person switch is accepted for MVP. Document the difference and revisit with the production account decision. |
| UC-B-12 DCC-reporter branch | D: wait for `TBD-B-25`. Keep the verified original Auditor/Lead path and the intentional hold; do not assign a substitute by inference. |
| UC-B-13 final closure | C + D: keep `PENDING_CLOSURE` as the MVP endpoint; obtain `TBD-B-24` before defining closure authority, signatures and return transition. Do not call the absent close button a current-MVP bug. |
| UC-B-14 policy-dependent portion | D: `TBD-B-09/16` govern automatic per-stage working-day defaults and the near-due threshold. Do not use provisional “2 working days” to decide acceptance. Preserve “no deadline” when no approved current-stage due date exists. |
| ERD/report alignment | E: `Database_Design.md` v0.1 describes 33 planned tables; current Prisma schema declares 38 models. Update the ERD/report **later**, after review, for the five refinements below and for current versus parked workflow. Do not edit the schema/ERD in this phase. |
| Production hardening | Durable session storage, real account administration and production acknowledgement authority are separate decisions; do not inflate current MVP acceptance or add them to P0 from this plan. |

### Five additional Prisma models: refinement or conflict

All five are **legitimate implementation refinements / ERD drift**, with no observed requirement or data-model conflict requiring a design decision. This does not settle any business TBD.

| Model | Current purpose and later ERD change |
| :--- | :--- |
| `DocumentImportSource` | File-level import provenance and rerun identity, linked to `DocumentFile`; show the relation and uniqueness of `sourcePath`. |
| `DarRound` | Submitted DAR round snapshot, unique within DAR by round number; show `Dar` 1:N `DarRound`. |
| `DarFile` | Pre-publication/logistics file metadata and checksum tied to DAR and round; distinguish it from published `DocumentFile`. |
| `ActivityRecordLink` | Junction for a plan activity to reuse `QualityRecord`/Evidence; show its composite key and cardinality. |
| `DocumentCodeSequence` | Controlled-document code counter, separate from DAR numbering; show key/scope and uniqueness. |

Also document `Dar.draft`/`Dar.logistics` JSON, the `request_due_status` SQL view (created by migration but not a Prisma model), and the unused `Closure` model. The dashboard bypassing the view is a data-use discrepancy, not a sixth missing model.

## 5. Completed P0 Coding Order

### Task 1 — Enforce acknowledgement access prerequisite

**Completed 27 September 2026.** Reused `AuditEvent` with `EXPORT` on `DocumentFile`; no Prisma schema/migration change. Direct-API pre-access, wrong-user and wrong-revision denials and post-access confirmation passed in `acknowledgements.integration.ts`. The DAR chain now requests the published file before its concurrent confirmations. Duplicate requests retain the existing HTTP 200 response and do not create a second row/event, per the user's clarification and SRS §4.13 A2.

The generated `SRS_v1.md` §4.13 still contains historical prose calling the API prerequisite an implementation discrepancy. Its requirement remains valid; update that status wording through the SRS generation/reconciliation workflow later, not by hand in this task.

- **Affected UC:** UC-A-10.
- **Requirement/AC:** FR-A-14, AC-A-12, AC-A-16.
- **Files changed:** `efiling/api/src/services/documentService.ts`, `efiling/api/src/services/acknowledgementService.ts`, `efiling/api/tests/acknowledgements.integration.ts`, `efiling/api/tests/dar.integration.ts`.
- **Behavior:** after document scope authorization and a readable-file check, a persisted `EXPORT` `AuditEvent` records actor, `DocumentFile`, version and time before the server serves the file. A new confirmation requires a matching event no earlier than the assignment. The event does not itself acknowledge the document.
- **Targeted tests:** acknowledgement direct-API pre-access denial, matching-version positive, wrong user/revision, obsolete/missing-file and duplicate cases; document file regression; DAR cross-module chain.
- **Residual limit:** the event proves an authorized, readable server file request, not that a person consumed every PDF byte. The separate download-only UI and copy-status work remains Task 2.

### Task 2 — Make document actions download-only and show copy status

**Completed in implementation on 27 September 2026.** DAR draft/history and logistics evidence, Documents version files, and Ack assignment/DCC version links now use existing `?download=1` attachment behavior with download labels. A shared notice states the electronic download is an uncontrolled copy and the controlled original is with DCC in hard copy. Ack still requires a separate explicit confirmation. Focused source checks, frontend typecheck/build and targeted Ack/Documents/DAR integration passed; no new manual UI acceptance was performed. The final production wording still depends on QMR resolution of `TBD-A-04`.

- **Affected UC:** UC-A-01, UC-A-08, UC-A-10.
- **Requirement/AC:** AC-A-21; SRS §1.4.3 file-access decision.
- **Files changed:** `efiling/frontend/src/pages/DarPage.tsx`, `DocumentsPage.tsx`, `AcknowledgementsPage.tsx`, `components/CopyStatusNotice.tsx`, and the focused `efiling/api/tests/dar.integration.ts` assertion.
- **Behavior:** all document-file actions in these screens request attachment/download; no open/preview control remains on these surfaces; the notice distinguishes downloaded electronic copies from the controlled original under the SRS working assumption.
- **Targeted checks:** focused source checks for links, labels, notice and explicit Ack action; frontend typecheck/build; targeted Ack/Documents/DAR integration. Extend manual TC-032/046/075 to the revised screens before claiming full UI verification.
- **Residual risk:** QMR must confirm final copy-control wording for production under `TBD-A-04`.

### Task 3 — Isolate dashboard domain failures

**Completed in implementation on 27 September 2026.** The Dashboard API checks access first, settles the permitted domain reads independently, returns successful real aggregates under `sections` and failed permitted domain names under `unavailable`, and logs the domain plus server error code/cause. The UI shows a local unavailable message without a false zero or raw error. Targeted Dashboard integration and page tests, plus API/frontend typecheck/build, passed. Manual UI acceptance remains open. The direct module-table access and SVG/Chart.js discrepancies remain separate P1 work.

- **Affected UC:** UC-B-15.
- **Requirement/AC:** FR-B-42, AC-B-25.
- **Files changed:** `efiling/api/src/services/dashboardService.ts`, `efiling/frontend/src/pages/DashboardPage.tsx`, `efiling/api/tests/dashboard.integration.ts`, and focused `efiling/frontend/tests/dashboard-page.test.tsx`.
- **Behavior:** one or more domain read failures yield local warnings while other permitted sections retain their real scoped values; zero, no permission and error remain distinct; Sponsor remains aggregate-only.
- **Targeted tests:** existing six-domain and Sponsor checks plus injected one- and two-domain failures, scoped/unauthorized role assertions and frontend panel rendering checks.
- **Residual limit:** revised failure UI needs manual acceptance; `FR-B-42` internal-interface design remains unmet, so UC-B-15 stays PARTIALLY IMPLEMENTED.

### Task 4 — Correct the overdue count and list recorded overdue activities

**Completed in implementation on 27 September 2026.** Dashboard and CAR/NCR list use the same derived due calculation from dates already recorded for applicable current work. The CAR/NCR page filters overdue work and shows due activities or an explicit current-stage deadline, responsible actor or waiting role, true request status and detail action. Sponsor sees only aggregate Dashboard data. Targeted API/frontend tests and builds passed; revised UI manual acceptance remains open.

- **Affected UC:** UC-B-14.
- **Requirement/AC:** FR-B-34–36, AC-B-24/28, within confirmed tracking of dates actually set.
- **Files changed:** `efiling/api/src/services/carDue.ts`, `carService.ts`, `dashboardService.ts`, `efiling/api/src/routes/carRoutes.ts`, `efiling/frontend/src/pages/CarPage.tsx`, `DashboardPage.tsx`, `efiling/frontend/src/components/StatusBadge.tsx`, and focused API/frontend tests.
- **Behavior:** an overdue request has unfinished current-plan activities with recorded past due dates, or an explicit past due date for its current stage when no current plan applies. A past `overallDueDate` alone never makes current work overdue. Closed and current-MVP `PENDING_CLOSURE` requests are inactive. Other applicable work without a recorded deadline shows “no deadline.” Status is derived and the existing `request_due_status` view is not used for acceptance because its near-due default remains provisional.
- **Targeted tests:** past/future/completed plan activities, overall date only, missing/stale current-stage date, explicit current-stage date, scope and Sponsor denial, count/list equality, due-cell rendering and Dashboard link behavior.
- **Residual limit:** no automatic stage deadline or near-due classification; `TBD-B-09/16` and revised manual UI acceptance remain open, so full AC-B-24 is not yet verified.

Tasks 1–4 are completed implementation work. The P1 interface migration and Chart.js alignment remain separate narrow tasks subject to the existing architecture decisions.

## 6. Advisor-Facing Answer

**“ตอนนี้ระบบทำเส้นทาง MVP หลักได้ 20 จาก 28 Use Case: 13 ข้อพัฒนาและตรวจยืนยันครบ, 7 ข้อพัฒนาแล้วแต่ยังตรวจยืนยันไม่ครบ. อีก 2 ข้อทำได้บางส่วน, 5 ข้อพักจาก MVP และ 1 ข้อติดมติธุรกิจ. ตัวเลข 20 ไม่ได้หมายความว่าผ่านทุก Acceptance Criteria หรือรับรองใช้งานจริงแล้ว”**
