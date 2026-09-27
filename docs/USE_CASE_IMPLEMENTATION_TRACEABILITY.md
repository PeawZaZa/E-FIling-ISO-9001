# Use Case Implementation Traceability — E-Filing ISO 9001 MVP

**Assessment date:** 27 September 2026. **Requirements authority:** `SRS_v1.md` v1.2, *Working Draft — Implementation Reconciled*, especially §4 and Appendices D/E. This is an implementation and evidence assessment, not an Approved Baseline or real-user sign-off. The planned ERD is `Database_Design.md` v0.1 (16 September, based on SRS v1.1); current persisted structure is `prisma/schema.prisma`. UI and API references below are current source, not the HTML mockup. Test evidence is the recorded result in `docs/MANUAL_UI_ACCEPTANCE.md` (MUA), `docs/SYSTEM_E2E_VERIFICATION_2026-09-21.md` (E2E), `docs/INTEGRATION_HARDENING_2026-09-20.md` (IH), and named existing integration files. Ack/Documents/DAR integration and frontend typecheck/build were rerun for the PDF task; no new manual UI acceptance was performed.

**Interpretation.** The primary status assesses the whole UC against confirmed MVP scope and unresolved policy. A wholly deferred UC is DEFERRED even when shared foundations exist; a missing full-SRS sub-flow is identified separately when the current demo adapts it. “Verified” requires evidence for the workflow and relevant AC, not merely a page or route. A source check supports implementation but does not by itself prove runtime acceptance. The manual result is **136 PASS, 0 FAIL, 3 BLOCKED, 0 NOT RUN** across 139 cases; TC-093–095 are a **TEST DATA / FIXTURE LIMITATION**. The 21 September E2E run is separate evidence. UC-B-12 is counted BLOCKED because its DCC-reporter branch remains in the current verification workflow, although its normal path is verified. UC-B-13 is counted DEFERRED because closure is outside the current MVP endpoint; its authority is also TBD. Secondary flags never add to the 28 primary statuses.

| UC | Name | Primary Actor | Requirement / BR | AC | UI | Main Data | Verification | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| UC-B-01 | Login / active role | All users | FR-B-01–04; BR-B-10 | B-01–03 | Login, shell | User, UserRole, AuditEvent | TC-001–024; auth | PARTIALLY IMPLEMENTED |
| UC-B-02 | Manage users / roles | DCC admin | FR-B-05–06,09 | B-04 | None | User, UserRole | source/seed only | DEFERRED / OUT OF CURRENT MVP |
| UC-B-03 | View audit trail | DCC/Auditor/Lead | FR-B-07–08; BR-B-10 | B-05–06 | No audit search | AuditEvent | module tests (write only) | DEFERRED / OUT OF CURRENT MVP |
| UC-A-01 | Draft document | Owner | FR-A-01–03; BR-A-01,06 | A-01–02,16,21 | DAR | Dar, DarFile, Document | TC-043–046,050; DAR test; PDF source check | IMPLEMENTED — PARTIALLY VERIFIED |
| UC-A-02 | Submit DAR | Requester | FR-A-04–05; BR-A-09 | A-03,16 | DAR | Dar, DarRound, history | TC-044–047,051; DAR test | IMPLEMENTED + VERIFIED |
| UC-A-03 | DAR intake | Registrar | FR-A-06; BR-A-09 | A-04,16 | DAR | DarDecision, history | TC-048–052; DAR test | IMPLEMENTED + VERIFIED |
| UC-A-04 | Review DAR | Reviewer/QMR | FR-A-07; BR-A-04 | A-05,16 | DAR | DarDecision, DarRound | TC-053–054,064–066; DAR test | IMPLEMENTED + VERIFIED |
| UC-A-05 | Approve DAR | QMR/Dean | FR-A-08; BR-A-02–04 | A-06–07,18–19 | DAR | DarDecision, history | TC-055–056,066–067; DAR test | IMPLEMENTED + VERIFIED |
| UC-A-06 | Publish revision | DCC | FR-A-09–10,17 | A-02,08,22–23 | DAR, Documents | Document, Version, File | TC-057–059; DAR test | IMPLEMENTED + VERIFIED |
| UC-A-07 | Cancel document use | DCC | FR-A-11,17; BR-A-02 | A-09 | None | Document, Version, Dar | no current-MVP run | DEFERRED / OUT OF CURRENT MVP |
| UC-A-08 | Find/read document | Authorized reader | FR-A-03,12; BR-A-05 | A-10,16,21 | Documents | Document, Version, File | TC-028–035,040–042; Documents test; PDF source check | IMPLEMENTED — PARTIALLY VERIFIED |
| UC-A-09 | Assign acknowledgement | DCC (demo) | FR-A-13; BR-A-07 | A-11,16 | Acknowledgements | Assignment, Version | TC-071–073,079; Ack test | IMPLEMENTED + VERIFIED |
| UC-A-10 | Confirm acknowledgement | Assignee | FR-A-14; BR-A-07 | A-12,16,21 | Acknowledgements | Assignment, Confirmation | TC-074–079; Ack test; PDF source check | IMPLEMENTED — PARTIALLY VERIFIED |
| UC-A-11 | Track DAR/history | Requester/participant | FR-A-05,15,17–18 | A-13,16 | DAR, Documents | Dar, decisions, history | TC-049–050,068–070; DAR test | IMPLEMENTED + VERIFIED |
| UC-A-12 | Close DAR | Registrar | FR-A-16,18; BR-A-08 | A-14,20 | DAR | logistics, DistributionEntry, history | TC-060–063,067; DAR test | IMPLEMENTED + VERIFIED |
| UC-B-04 | Create Record/Evidence | DCC/Auditor/Owner | FR-B-10–11,42; BR-B-01 | B-07–08 | Records | QualityRecord, Evidence | TC-080–082; Records test | IMPLEMENTED — PARTIALLY VERIFIED |
| UC-B-05 | Search/read Record | Authorized reader | FR-B-12–13; BR-B-11 | B-09–10,35 | Records | QualityRecord, Evidence | TC-083–089,098; Records test | IMPLEMENTED + VERIFIED |
| UC-B-06 | Create audit round | DCC/Lead | FR-B-14,14.1–14.2,19; BR-B-18 | B-11,11.1,12 | Audit | AuditRound, Member | TC-090–095; Audit test | IMPLEMENTED — PARTIALLY VERIFIED |
| UC-B-07 | Record Finding | Auditor/Lead/DCC | FR-B-15–18; BR-B-08 | B-13–14,35 | Audit | Finding, Record, Evidence | TC-096–103; Audit test | IMPLEMENTED — PARTIALLY VERIFIED |
| UC-B-08 | Open CAR/NCR | Auditor/Lead/DCC | FR-B-20–21; BR-B-07,15 | B-15–16,29 | CAR/NCR | Finding, CorrectiveRequest | TC-104–105,119; CAR test | IMPLEMENTED + VERIFIED |
| UC-B-09 | Correction / plan | CAR Owner | FR-B-22–24; BR-B-13–14 | B-17–18,29 | CAR/NCR | Correction, Cause, Plan | TC-106–109,120; CAR test | IMPLEMENTED + VERIFIED |
| UC-B-10 | Approve plan | QMR | FR-B-25–26; BR-B-12 | B-19–20,29 | CAR/NCR | PlanApproval, Plan | TC-110–112,120; CAR test | IMPLEMENTED + VERIFIED |
| UC-B-11 | Activity result/evidence | CAR Owner | FR-B-27,11; BR-B-13 | B-18–19,29 | CAR/NCR | Activity, Evidence, RecordLink | TC-113–115,121; CAR test | IMPLEMENTED + VERIFIED |
| UC-B-12 | Verify effectiveness | Reporting Auditor/Lead | FR-B-28–29; BR-B-05 | B-21,23 | CAR/NCR | Verification, status history | TC-116–118,122–123; CAR test | BLOCKED BY TBD |
| UC-B-13 | Close CAR/NCR | TBD authority | FR-B-30–32; BR-B-02,05 | B-22–23 | No close action | Closure (unused), request | TC-118,123; CAR guard | DEFERRED / OUT OF CURRENT MVP |
| UC-B-14 | Follow overdue work | DCC/Owner/Auditor/QMR | FR-B-33–36; BR-B-06,16 | B-24,28 | Dashboard count; CAR work list | Request, current stage/activity dates | Dashboard/CAR overdue tests | IMPLEMENTED — PARTIALLY VERIFIED |
| UC-B-15 | Operational dashboard | DCC/QMR/Auditor/Lead/Sponsor | FR-B-37–40,42; BR-B-03,11 | B-25–26 | Dashboard | six-domain aggregate | TC-025–027,125–134; Dashboard normal/failure tests | PARTIALLY IMPLEMENTED |
| UC-B-16 | Export summary | TBD export role | FR-B-41,32; BR-B-11 | B-27 | None | request/closure summary | no export test | DEFERRED / OUT OF CURRENT MVP |

**Status totals:** Total Use Cases **28**; IMPLEMENTED + VERIFIED **13**; IMPLEMENTED — PARTIALLY VERIFIED **7**; PARTIALLY IMPLEMENTED **2**; DEFERRED / OUT OF CURRENT MVP **5**; BLOCKED BY TBD **1**. Thus **20/28** have a substantially implemented current workflow (13 fully verified and 7 partially verified); this is an MVP implementation count, not a claim that all 28 full-scope UCs pass. The two partly implemented UCs and one policy-blocked UC are not counted as implemented. Revised PDF and overdue screens still need manual acceptance.

## UC-B-01 — Login and select active role

### A. Requirement coverage
FR-B-01–04; BR-B-10; NFR-B-01; US shared login; SRS §4.1. One person may hold several roles, but only one active role authorizes each action.
### B. Expected workflow
1. Authenticate account. 2. Select one assigned role (automatic if only one). 3. Create a role-bound session and show its menus. 4. Switch among assigned roles without logging out; deny an unassigned role with 403 and audit it. Invalid, inactive, or roleless accounts cannot start a session.
### C. UI implementation
`LoginPage.tsx` at unauthenticated entry and `AppLayout.tsx` account selector; `App.tsx` routes `#documents`, `#dar`, `#ack`, `#records`, `#audit`, `#cars`, `#dashboard`. The selector switches *demo accounts* by logging in again, not roles belonging to the same user.
### D. Backend / API implementation
`POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`, `GET /api/modules/:module/access`; `authService.ts` authenticates from `demoAccounts.ts` and computes menus from demo account ID. No role-selection/switch endpoint or role-bound identity decision exists.
### E. Data / ERD
Planned/current `app_user` (`User`), `user_role` (`UserRole`), `audit_event` (`AuditEvent`). **DATA MODEL / IMPLEMENTATION GAP:** these tables exist, but the live login path uses the in-code demo account registry rather than assigning and switching a role for one database user.
### F. Acceptance Criteria
AC-B-01 role choice, AC-B-02 active-role-only authorization, AC-B-03 in-session role switch. Login/session and menu scope are demonstrated; the multi-role conditions are not.
### G. Verification evidence
MUA TC-001–024; `efiling/api/tests/auth.test.ts`; E2E login of 14 demo accounts and 98 menu/API combinations. These do not create a multi-role user and exercise AC-B-01–03 as written.
### H. Current status
**Status: PARTIALLY IMPLEMENTED.** Authentication and demo account scoping work; genuine per-user active-role selection/switch and its audit are missing against the full SRS UC. **DEFERRED FULL-SRS SUB-FLOW / DEMO ADAPTATION:** the current MVP matrix deliberately switches between demo persons, so this is not a current-MVP coding defect. The primary status remains partial because the UC's role-selection scenario as written has not been demonstrated.

| Expected Step | UI | Backend/API | Data | Evidence | Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Authenticate and scope menus | Login / shell | `/auth/login`, `/modules/:module/access` | demo registry, session | TC-001–024; auth test | Covered for demo accounts |
| Select/switch assigned role | account selector | no role-switch command | `UserRole` unused for session choice | source check | Missing |

## UC-B-02 — Manage users and roles

### A. Requirement coverage
FR-B-05–06, FR-B-09, FR-B-04; NFR-B-01; SRS §4.2. DCC admin must create/edit/deactivate users and assign at least one common role.
### B. Expected workflow
1. DCC opens user administration. 2. Enter identity/department and one or more roles. 3. Reject duplicate email or zero roles. 4. Save/audit; allow deactivation without deletion and role removal while one remains.
### C. UI implementation
No user administration page or route. Login displays 14 seeded demo accounts but cannot manage them.
### D. Backend / API implementation
`GET /api/auth/demo-accounts` lists examples. No user create/edit/deactivate/role-assignment API. `authService.ts` uses static `demoAccounts.ts`.
### E. Data / ERD
Planned/current `app_user` (`User`), `user_role` (`UserRole`), `department` (`Department`), `audit_event` (`AuditEvent`). Schema supports the relations, but no administration workflow uses them to manage login identities.
### F. Acceptance Criteria
AC-B-04 rejects duplicate email/roleless creation and confirms shared IDs; AC-B-02 access guard is cross-cutting. AC-B-04 has no runtime administrative-path evidence.
### G. Verification evidence
MUA TC-008–021 checks demo account menus; `auth.test.ts` checks demo authentication. Seeded users are not evidence for admin create/edit.
### H. Current status
**Status: DEFERRED / OUT OF CURRENT MVP.** SRS v1.2 §1.4.3 and the MVP matrix explicitly defer full account management, including FR-B-05 and the administrative part of AC-B-04. Shared IDs and demo accounts support other MVP UCs; they are not UC-B-02 implementation evidence. The absent administration UI/API is a full-project gap, not a current-MVP implementation defect.

| Expected Step | UI | Backend/API | Data | Evidence | Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| View seeded identities | Login | `/auth/demo-accounts` | demo registry / User | TC-008–021 | Demo only |
| Create, change, disable, audit | none | none | User, UserRole, AuditEvent | source check | Missing |

## UC-B-03 — View audit trail

### A. Requirement coverage
FR-B-07–08; BR-B-10; NFR-B-01; SRS §4.3. Events must record actor, active role, action, entity, time and changes; authorized users must filter/view them.
### B. Expected workflow
1. DCC/Auditor/Lead chooses audit trail. 2. Filter entity, actor, dates under active-role scope. 3. Open event/history detail. 4. Deny unauthorized access and all mutation. Contextual navigation and request timeline are alternate paths.
### C. UI implementation
DAR and CAR detail pages show local status/history. No general audit-trail search/detail page or contextual audit-event view.
### D. Backend / API implementation
Module services write `AuditEvent` and status history, including before/after CAR transitions. No read/search audit-event route in `app.ts` or `routes/`; no audit-trail authorization API.
### E. Data / ERD
Planned/current `audit_event` (`AuditEvent`), `dar_status_history` (`DarStatusHistory`), `request_status_history` (`RequestStatusHistory`). This is shared audit data, not the audit-round domain.
### F. Acceptance Criteria
AC-B-05 event fields and state change; AC-B-06 authorized filtering, 403 and append-only mutation guard. Event-write fragments have evidence; read/search AC does not.
### G. Verification evidence
IH/E2E and `dar.integration.ts`, `car.integration.ts`, `records.integration.ts` inspect selected audit writes. No MUA case opens a general event-search page.
### H. Current status
**Status: DEFERRED / OUT OF CURRENT MVP.** The MVP matrix defers the general FR-B-08 search/view workflow while retaining FR-B-07 event writes for current flows. Those writes are shared foundation, not completion of UC-B-03. The absent search UI/API is a full-project gap, not a current-MVP implementation defect.

| Expected Step | UI | Backend/API | Data | Evidence | Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Persist action and status | module detail/history | module services | AuditEvent, histories | IH/E2E module tests | Covered in tested flows |
| Search/open scoped event | none | no route | AuditEvent | source check | Missing |

## UC-A-01 — Draft or revise document

### A. Requirement coverage
FR-A-01–03, FR-A-19; BR-A-01, BR-A-06, BR-A-09–10; US-A-01; SRS §4.4. Draft must not overwrite the published version.
### B. Expected workflow
1. Authorized owner selects new/revised document. 2. Enter title/type/owner/source and attach valid PDF. 3. Check code/source uniqueness and save a separate editable draft. Sending for intake is UC-A-02; duplicate code, invalid file or stale source are rejected.
### C. UI implementation
`#dar`, `DarPage.tsx`: `＋ สร้างคำขอ DAR`, `บันทึกร่าง`, `แก้ไขร่าง`, `แนบ PDF`; owner or DCC for QM according to the current routing.
### D. Backend / API implementation
`POST/PATCH /api/dars`, `POST /api/dars/:id/files`; `darService.save/upload` check actor, type, source and PDF. The draft lives in a DAR until publication; `documentService` serves published documents.
### E. Data / ERD
Planned `document`→`document_version`→`document_file`, `dar`; current `Document`/`DocumentVersion`/`DocumentFile`, `Dar`/`DarFile`. **ERD DRIFT — LEGITIMATE REFINEMENT:** `DarFile` and JSON `Dar.draft` retain pre-publication files/content; the 16 September ERD does not show that draft storage or `DarRound`. Update the ERD/report later.
### F. Acceptance Criteria
AC-A-01 separate draft/file; AC-A-02 duplicate code/source reference; AC-A-16 rights; AC-A-21 uncontrolled-copy notice where the draft file is displayed; AC-A-24 file-content validation is a cross-cutting upload criterion.
### G. Verification evidence
MUA TC-043–046,050; `dar.integration.ts` and `documents.integration.ts`; IH/E2E revision, duplicate, PDF, source and rollback checks. TC-046 validates the earlier download path only. On 27 September, the DAR draft/history and logistics evidence links were changed to `?download=1`, labeled as downloads, and given the shared AC-A-21 notice. Focused source checks, frontend typecheck/build and targeted DAR/Documents integration passed; manual UI acceptance of the revised notice and links remains open.
### H. Current status
**Status: IMPLEMENTED — PARTIALLY VERIFIED.** The current-MVP draft and download-only file UI are implemented. The revised PDF presentation and AC-A-21 notice have source/build evidence but no new manual UI acceptance. Other DAR request types are deferred sub-flows.

| Expected Step | UI | Backend/API | Data | Evidence | Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Save editable draft | DAR form | `/api/dars` | Dar.draft | TC-043,050 | Covered |
| Attach/validate PDF without replacing live version | DAR file control and download link | `/api/dars/:id/files`, `?download=1` file route | DarFile; DocumentVersion | TC-045–046; DAR test; PDF source check | Implemented; revised UI pending manual acceptance |

## UC-A-02 — Prepare and submit DAR

### A. Requirement coverage
FR-A-04–05, FR-A-04.1–04.3, FR-A-18–19; BR-A-09; US-A-02; SRS §4.5. Current MVP accepts new/revise QM/QP/WI/SD/FM, one document per DAR.
### B. Expected workflow
1. Select allowed request type and draft/source. 2. Supply reason, effective date and file. 3. Validate required fields/permission. 4. Reserve `nnn/พ.ศ.` once, submit to registrar and retain the number on resubmission. Six form types exist in broader scope; holding/cancel/other rules remain deferred or policy dependent.
### C. UI implementation
`#dar`, `DarPage.tsx`: draft, upload, `ส่งตรวจรับ`, confirmation and resubmission after return; request-type controls expose current MVP choices.
### D. Backend / API implementation
`POST/PATCH /api/dars`, file upload and `POST /api/dars/:id/submit` through dynamic action route; `darService.ts` accepts only `NEW_DOCUMENT`/`REVISE`, checks file/source, numbering and state.
### E. Data / ERD
Planned `dar`, `dar_target_item`, `number_sequence`, `dar_status_history`; current `Dar`, `DarTargetItem`, `NumberSequence`, `DarStatusHistory`, plus `DarRound`/`DarFile`. One-item MVP is narrower than planned multi-item structure.
### F. Acceptance Criteria
AC-A-03 number, actor/date and resubmission; AC-A-16 rights. AC-A-17 (“other” explanation) belongs to deferred request type; AC-A-23 effective-date boundary applies to current publishing path.
### G. Verification evidence
MUA TC-044–047,050–051; `dar.integration.ts`; IH/E2E numbering, repeated/invalid transition and five document types.
### H. Current status
**Status: IMPLEMENTED + VERIFIED.** The current MVP submission path and retained number are covered. **DEFERRED SUB-FLOW:** four other form request types and their business rules are outside current MVP.

| Expected Step | UI | Backend/API | Data | Evidence | Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Validate draft/file and submit | DAR send button | `submit` action | Dar, DarFile | TC-044–047 | Covered |
| Return and resubmit same number | DAR edit/send | `darService.command` | DarRound, history | TC-049–052; DAR test | Covered |

## UC-A-03 — DAR intake

### A. Requirement coverage
FR-A-06, FR-A-15, FR-A-18–19; BR-A-09; US-A-03; SRS §4.6.
### B. Expected workflow
1. Registrar opens submitted DAR. 2. Checks request, draft and attachment. 3. Passes to authorized reviewer or returns with reason. 4. Record decision, actor/time/history; intake is not approval. Invalid state or actor is rejected.
### C. UI implementation
`#dar`, `DarPage.tsx`: `งานของฉัน`, `ตรวจรับคำขอ`, pass/return dialog and history tab; registrar-only action.
### D. Backend / API implementation
`POST /api/dars/:id/:action`; `darService.command` validates registrar, state and reason, persists decision/history and audit event.
### E. Data / ERD
Planned/current `dar` (`Dar`)→`dar_decision` (`DarDecision`)→`dar_status_history` (`DarStatusHistory`); submitted draft snapshot is current `DarRound` (extra to ERD).
### F. Acceptance Criteria
AC-A-04 returned missing information/reason and no false pass; AC-A-16 access control.
### G. Verification evidence
MUA TC-048–052; `dar.integration.ts`; IH/E2E role and transition guards.
### H. Current status
**Status: IMPLEMENTED + VERIFIED.** Return, correction and successful intake have direct UI and API evidence.

| Expected Step | UI | Backend/API | Data | Evidence | Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Inspect and return with reason | intake dialog | `return` command | DarDecision, history | TC-048–049 | Covered |
| Accept corrected round | pass action | `intake` command | DarRound, decision | TC-050–052 | Covered |

## UC-A-04 — Review document and DAR

### A. Requirement coverage
FR-A-07, FR-A-15, FR-A-18–19; BR-A-04, BR-A-09; US-A-04; SRS §4.7. Use the confirmed `REF-02` §6.2 MVP authority table, while the formal §4/§6.2 wording conflict remains open.
### B. Expected workflow
1. Authorized reviewer opens intake-passed draft/version. 2. Inspects file and history. 3. Records pass or return/comment on the current round. 4. System forwards passed work to approver without auto-approval; rejects wrong actor or stale round.
### C. UI implementation
`#dar`, `DarPage.tsx`: review action on assigned QP/QM and history; Deputy Dean reviews non-QM, QMR reviews QM in the demo routing.
### D. Backend / API implementation
`POST /api/dars/:id/:action`; `darService.command` checks reviewer authority/state and stores round-linked decision, status and audit.
### E. Data / ERD
Planned/current `Dar`→`DarDecision`/`DarStatusHistory`; `DarRound` preserves the exact submitted snapshot (additional current model).
### F. Acceptance Criteria
AC-A-05 review tied to proposal and separate from approval; AC-A-16 rights; AC-A-19 authority table cross-check.
### G. Verification evidence
MUA TC-053–054 and QM route TC-064–066; `dar.integration.ts`; IH/E2E separation of duties.
### H. Current status
**Status: IMPLEMENTED + VERIFIED.** Current QP and QM routing, independent review and subsequent approval state were exercised. Formal policy conflict is documented, not silently resolved.

| Expected Step | UI | Backend/API | Data | Evidence | Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Inspect assigned version | DAR detail/file | detail/file endpoints | DarRound, DarFile | TC-053,065 | Covered |
| Record review, forward only | review dialog | review command | DarDecision, history | TC-054,066 | Covered |

## UC-A-05 — Decide DAR approval

### A. Requirement coverage
FR-A-08, FR-A-15, FR-A-18–19; BR-A-02–04, BR-A-08–09; US-A-05; SRS §4.8. Approver may not be requester/draft author for the same DAR.
### B. Expected workflow
1. Authorized approver opens reviewed current round. 2. Inspects document/review. 3. Approves or refuses with reason. 4. Store actor/time/decision; neither publish nor close automatically. Reject self-approval or wrong authority, including after role switch.
### C. UI implementation
`#dar`, `DarPage.tsx`: `บันทึกผลอนุมัติ` for QMR on non-QM and Dean on QM; other actors do not see it.
### D. Backend / API implementation
`POST /api/dars/:id/:action`; `darService.command` checks current state, authority, requester identity and round before decision/audit.
### E. Data / ERD
Planned/current `Dar`→`DarDecision`→`DarStatusHistory`/`AuditEvent`; current `DarRound` binds the decision to submitted content.
### F. Acceptance Criteria
AC-A-06 decision does not publish/close; AC-A-07 and AC-A-18 reject self-approval; AC-A-19 enforces type-specific authority; AC-A-16 roles.
### G. Verification evidence
MUA TC-055–056,066–067; `dar.integration.ts`; IH/E2E role/segregation/invalid-state checks.
### H. Current status
**Status: IMPLEMENTED + VERIFIED.** Current MVP approval and prohibited-actor behavior are covered; the formal authority-text conflict needs owner review before baseline.

| Expected Step | UI | Backend/API | Data | Evidence | Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Deny wrong actor/self | hidden action | authority guard | Dar, User | TC-055; DAR test | Covered |
| Decide without publication | approval dialog | approve/reject command | DarDecision, history | TC-056,067 | Covered |

## UC-A-06 — Register and publish document

### A. Requirement coverage
FR-A-09–10, FR-A-17–19; BR-A-01, BR-A-06, BR-A-10; US-A-06; SRS §4.9. A replacement preserves prior version and references.
### B. Expected workflow
1. DCC opens approved DAR and checks exact draft/file. 2. Validate effective date/issue/revision and current source. 3. Publish new version, supersede old atomically, link DAR, preserve prior file/history. 4. Distribution and recall remain subsequent steps before DAR closure.
### C. UI implementation
`#dar` publish action and `#documents` registry/version detail; DCC-only button. PDF action is authorized **download-only**.
### D. Backend / API implementation
`POST /api/dars/:id/publish`; `darService.command` verifies approval/date/file SHA-256/source, creates `DocumentVersion`/`DocumentFile`, marks old version obsolete and records history/audit in transaction. `GET /api/documents/:id` and `/files/:id` read it.
### E. Data / ERD
Planned/current `Document`→`DocumentVersion`→`DocumentFile`, `DarTargetItem`, `DistributionEntry`, `AuditEvent`. Current `DarFile` is transferred to controlled file on publish; ERD v0.1 omits that staging model.
### F. Acceptance Criteria
AC-A-02 unique document identity; AC-A-08 one current version and historical reference; AC-A-22 revision increment/DAR link; AC-A-23 date boundary; AC-A-16 authorization.
### G. Verification evidence
MUA TC-057–059,067; `dar.integration.ts` and `documents.integration.ts`; IH/E2E concurrent publication, file integrity and history.
### H. Current status
**Status: IMPLEMENTED + VERIFIED.** Publication and registry persistence are covered for current types. Actual paper original remains outside electronic publication behavior.

| Expected Step | UI | Backend/API | Data | Evidence | Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Reject invalid effective date/file | publish dialog | publish guard | DarFile, DarDecision | TC-057; DAR test | Covered |
| Publish/version and retain predecessor | DAR→Documents | publish/document endpoints | DocumentVersion, File, Dar | TC-058–059; E2E | Covered |

## UC-A-07 — Cancel use of a controlled document

### A. Requirement coverage
FR-A-11, FR-A-17–19; BR-A-01–02, BR-A-05, BR-A-08–10; US-A-07; SRS §4.10. Cancel *document use* differs from canceling a holder's copy.
### B. Expected workflow
1. DCC opens an approved cancellation DAR. 2. Checks target/version and reason. 3. Cancels use without deleting history/file; no new current version is required. 4. Retains DAR/event trace, then performs applicable distribution/recall and separate DAR closure.
### C. UI implementation
No current cancellation request/action in `DarPage.tsx`; `#documents` can display historical/obsolete versions but cannot perform this UC.
### D. Backend / API implementation
`darService.save` accepts only `NEW_DOCUMENT` and `REVISE`; no cancel command. `DocumentVersionStatus` supports non-current states, but this does not implement approved cancellation.
### E. Data / ERD
Planned/current `Dar`→`Document`→`DocumentVersion` and `AuditEvent`, `DistributionEntry`; no cancellation-specific current transaction.
### F. Acceptance Criteria
AC-A-09 cancellation, zero current versions, retained history; AC-A-16 permission. Not run because the request type is outside current MVP.
### G. Verification evidence
No MUA cancellation case or targeted runtime test. Source shows no cancellation action. `documents.integration.ts` tests other version paths only.
### H. Current status
**Status: DEFERRED / OUT OF CURRENT MVP.** The broader SRS retains this UC, while the confirmed MVP supports new/revise DAR only. This is not an MVP defect.

| Expected Step | UI | Backend/API | Data | Evidence | Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Open approved cancel DAR | none | request type rejected | Dar | source check | Deferred |
| Cancel version and retain trail | none | no cancel command | DocumentVersion, AuditEvent | no current-MVP test | Deferred |

## UC-A-08 — Search and access documents

### A. Requirement coverage
FR-A-03, FR-A-12, FR-A-19; BR-A-05; NFR-A-01; US-A-08; SRS §4.11. Default reading emphasizes current authorized versions, not draft/canceled content.
### B. Expected workflow
1. Authorized user searches code/title/type/status. 2. System scopes results before display. 3. User opens detail/version and downloads permitted PDF. 4. Direct unauthorized file URL is denied. Download is not acknowledgement.
### C. UI implementation
`#documents`, `DocumentsPage.tsx`: registry filters, detail/history, `ดาวน์โหลด PDF` and AC-A-21 copy notice; no inline PDF preview requirement.
### D. Backend / API implementation
`GET /api/documents`, `/:id`, `/files/:id`; `documentService` and `documentRules` scope documents/versions and authorize file access.
### E. Data / ERD
Planned/current `document` (`Document`)→`document_version` (`DocumentVersion`)→`document_file` (`DocumentFile`); `originatingDarId` preserves DAR linkage. Download does not create `AcknowledgementConfirmation`.
### F. Acceptance Criteria
AC-A-10 scoped search/direct file denial; AC-A-16 active permission; AC-A-21 uncontrolled-copy notice. AC-A-15 is cross-module historical-version reference, not a separate reading UC.
### G. Verification evidence
MUA TC-028–035,040–042; `documents.integration.ts`; E2E 296 actual PDF/checksum read-only smoke and scoped downloads. On 27 September, `DocumentsPage.tsx` gained the shared AC-A-21 notice beside version file actions, which retain `?download=1`. Focused source checks, frontend typecheck/build and targeted Documents integration passed. MUA did not test the newly added notice.
### H. Current status
**Status: IMPLEMENTED — PARTIALLY VERIFIED.** Search, detail, authorized download and the AC-A-21 notice are implemented; the revised screen awaits manual UI acceptance.

| Expected Step | UI | Backend/API | Data | Evidence | Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Search scoped registry | Documents filters | `/api/documents` | Document, Version | TC-028–030,040–042 | Covered |
| Open/download version with copy notice | detail `ดาวน์โหลด PDF` and notice | document file route `?download=1` | DocumentFile | TC-031–035; Documents test; PDF source check | Implemented; notice pending manual acceptance |

## UC-A-09 — Assign and track acknowledgement

### A. Requirement coverage
FR-A-13, FR-A-19; BR-A-07, BR-A-09; US-A-09; SRS §4.12. DCC is authorized **for the demo MVP**; production assignment authority is still unresolved.
### B. Expected workflow
1. DCC selects a published, readable version. 2. Selects active users who can read it. 3. System records person/version assignments without granting new read rights or marking confirmation. 4. DCC tracks pending/confirmed per version; duplicates and obsolete versions are rejected.
### C. UI implementation
`#ack`, `AcknowledgementsPage.tsx`: DCC version chooser, assignee picker, assign action and per-version result; recipient has separate “my assignments” view.
### D. Backend / API implementation
`GET /api/acknowledgements/options`, `/versions/:id`, `POST /versions/:id/assign`; `acknowledgementService.assign` checks DCC, active recipient, published/readable version and stores audit event.
### E. Data / ERD
Planned/current `document_version` (`DocumentVersion`)→`acknowledgement_assignment` (`AcknowledgementAssignment`)→`acknowledgement_confirmation` (`AcknowledgementConfirmation`). `distribution_entry` is separate by design.
### F. Acceptance Criteria
AC-A-11 eligible assignment and tracking; AC-A-16 rights. Real-world authority remains `TBD-A-06`, not an invented DCC policy.
### G. Verification evidence
MUA TC-071–073,079; `acknowledgements.integration.ts`; IH/E2E eligibility, duplicate and obsolete checks.
### H. Current status
**Status: IMPLEMENTED + VERIFIED.** The explicitly confirmed *demo* assignment workflow has UI/API evidence; production authority remains an open decision.

| Expected Step | UI | Backend/API | Data | Evidence | Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Select version and eligible user | Ack DCC form | options/version route | Version, User | TC-071–072 | Covered |
| Assign and track separately from confirm | assign/result | assign route | Assignment, Confirmation | TC-073,079; Ack test | Covered |

## UC-A-10 — Confirm document acknowledgement

### A. Requirement coverage
FR-A-14, FR-A-18–19; BR-A-07, BR-A-09–10; US-A-10; SRS §4.13. Explicit confirmation must follow authorized access/download of the assigned version; download alone is not confirmation.
### B. Expected workflow
1. Assignee opens own assignment. 2. Downloads/accesses exact published PDF. 3. Explicitly confirms. 4. Server checks assignment, account, version, read right **and prior access event**; records person/time/version/audit once. Reject pre-access, wrong user or superseded version; repeated confirmation returns the existing result without another write.
### C. UI implementation
`#ack`, `AcknowledgementsPage.tsx`: own work, download control and explicit `ยืนยันรับทราบ`; UI sequencing does not secure a direct API request.
### D. Backend / API implementation
`GET /api/acknowledgements/mine`, `POST /api/acknowledgements/:id/confirm`; `documentService.getDocumentFile` records an `EXPORT` `AuditEvent` for an authorized, readable `DocumentFile` with actor, file, version and time before serving it. `acknowledgementService.confirm` checks identity, assignment, current version/readability and a matching post-assignment file-access event in its transaction. A prior event is required for a new confirmation; an existing confirmation is returned unchanged on a repeated request.
### E. Data / ERD
Planned/current `AcknowledgementAssignment`→`AcknowledgementConfirmation`, linked to `DocumentVersion`, plus `AuditEvent`. The existing `AuditEvent` model stores a qualifying `EXPORT` on `DocumentFile` and a separate `ACKNOWLEDGE` on confirmation. No new table/model or migration was needed; download/access alone never creates a confirmation.
### F. Acceptance Criteria
AC-A-12 rejects a new confirmation before the assignee accesses the assigned revision, and checks version/person/time/audit/duplicate; AC-A-16 rights; AC-A-21 uncontrolled-copy notice on the file link. The server precondition and download-only Ack presentation are implemented.
### G. Verification evidence
MUA TC-074–079 remains recorded UI evidence. The targeted `acknowledgements.integration.ts` run on 27 September 2026 verifies direct-API pre-access denial without a confirmation row/event, wrong-user and wrong-revision access denial, success after the assignee downloads the exact revision, persisted actor/version/time/audit, unchanged duplicate HTTP 200 result without another write, and obsolete/missing-file guards. Related `documents.integration.ts` and `dar.integration.ts` runs passed. `AcknowledgementsPage.tsx` now uses `?download=1` links labeled as downloads, displays the shared AC-A-21 notice, and states that confirmation requires the separate button; focused source checks and frontend typecheck/build passed. The changed UI has not been manually re-accepted.
### H. Current status
**Status: IMPLEMENTED — PARTIALLY VERIFIED.** **AC-A-12 server prerequisite is implemented and verified** using persisted file-access evidence. Download-only links, explicit confirmation separation and AC-A-21 notice are implemented, but the revised screen has no manual UI re-acceptance.

| Expected Step | UI | Backend/API | Data | Evidence | Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Download then explicitly confirm | Ack own work; notice and separate button | `?download=1` file route; confirm route | Version, AuditEvent, Confirmation | TC-074–079; Ack integration; PDF source check | Implemented; revised UI pending manual acceptance |
| Deny direct confirm before access | UI offers sequence | matching post-assignment `EXPORT` event required | AuditEvent by actor/file/version/time | Ack integration | Covered |

## UC-A-11 — Track DAR and inspect history

### A. Requirement coverage
FR-A-05, FR-A-15, FR-A-17–19; BR-A-08–10; US-A-11; SRS §4.14. History must show recorded facts only and retain old-version references.
### B. Expected workflow
1. Requester/participant opens accessible DAR. 2. Reads number/type/status/next work. 3. Opens decisions/status history and related version. 4. System enforces scope and does not fabricate future approval/closure or mutate history.
### C. UI implementation
`#dar`, `DarPage.tsx`: list filters, `งานของฉัน`, detail/history tabs; `#documents` linked published version/history.
### D. Backend / API implementation
`GET /api/dars`, `/:id`, document detail endpoints; `darService.list/detail` apply visibility and return decisions, rounds and histories.
### E. Data / ERD
Planned/current `Dar`, `DarDecision`, `DarStatusHistory`, `DocumentVersion` and `AuditEvent`; current `DarRound` preserves returned/resubmitted snapshots (extra model).
### F. Acceptance Criteria
AC-A-13 status/comment/history/next work within permission; AC-A-16 scope; AC-A-08–09 supply version-change history semantics.
### G. Verification evidence
MUA TC-049–050,068–070 plus TC-031,039,059; `dar.integration.ts`; E2E historical references and role restrictions.
### H. Current status
**Status: IMPLEMENTED + VERIFIED.** Current DAR tracking and recorded history are exercised after return, publication and reload.

| Expected Step | UI | Backend/API | Data | Evidence | Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Filter/open authorized DAR | DAR list/detail | `/api/dars` | Dar | TC-068–070 | Covered |
| Inspect real decisions/version history | history tab/link | DAR/detail documents | decisions, rounds, Version | TC-049–050,059 | Covered |

## UC-A-12 — Check completeness and close DAR

### A. Requirement coverage
FR-A-15–16, FR-A-18–19; BR-A-08–09; US-A-12; SRS §4.15. Approval is not closure; required distribution/recall or justified N/A precedes registrar closure.
### B. Expected workflow
1. Registrar opens approved DAR/checklist. 2. Reviews publication, distribution and recall evidence per applicable type. 3. Records completed work or acceptable N/A reason. 4. System rechecks state/files/role and closes with actor/date/history; reject incomplete evidence.
### C. UI implementation
`#dar`, `DarPage.tsx`: `แจกจ่าย / เรียกคืน`, upload/holder entries or N/A reason, `ตรวจครบและปิด DAR`; registrar role visibility.
### D. Backend / API implementation
`POST /api/dars/:id/distribution`, `/recall`, `/close` via dynamic route; `darService.command` checks files, logistics, stage order and role, then history/audit in transaction.
### E. Data / ERD
Planned/current `Dar`, `DistributionEntry`, `DarStatusHistory`, `AuditEvent`; current `DarFile` holds evidence and `Dar.logistics` JSON records distribution/recall detail. **ERD DRIFT — LEGITIMATE REFINEMENT:** these extra proof structures are absent from the 16 September ERD; update the ERD/report later.
### F. Acceptance Criteria
AC-A-14 and AC-A-20 reject closure before evidence and record closure when complete; AC-A-16 role guard. Detailed N/A policy for real operation still needs confirmation.
### G. Verification evidence
MUA TC-060–063,067; `dar.integration.ts`; IH/E2E missing-file, order and closure audit regressions.
### H. Current status
**Status: IMPLEMENTED + VERIFIED.** The current new/revise DAR checklist and closure path are exercised; broader request-type checklists are deferred.

| Expected Step | UI | Backend/API | Data | Evidence | Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Record distribution/recall or N/A | logistics tab | distribution/recall commands | DistributionEntry, DarFile, logistics | TC-060–062 | Covered |
| Reject premature/perform valid close | close button | close guard | DarStatusHistory, AuditEvent | TC-063,067; DAR test | Covered |

## UC-B-04 — Create Record and Evidence

### A. Requirement coverage
FR-B-10–11, FR-B-42; BR-B-01; US-B-01; SRS §4.17. Quality Record/Evidence is distinct from controlled Document; document selection crosses modules.
### B. Expected workflow
1. Authorized user enters type/title/date/owner. 2. Optionally links current document and attaches permitted evidence. 3. System validates file content, stores file/path and record atomically, audits creation. 4. If document lookup fails, warn locally and allow an unlinked record for later linking.
### C. UI implementation
`#records`, `RecordsPage.tsx`: add form, record type/owner/document selectors, file upload, validation and detail. Document availability is returned in options; a distinct outage UI/late-link path is not evidenced by MUA.
### D. Backend / API implementation
`GET /api/records/options`, `POST /api/records`, `PATCH /:id`; `recordService.options` catches document-reference read failure independently and returns `documentsAvailable:false`; `create` validates content, stores files and rolls back stored files on DB failure. Direct `documentId` validation uses `documentService`.
### E. Data / ERD
Planned/current `record_type` (`RecordType`)→`quality_record` (`QualityRecord`)→`evidence` (`Evidence`); optional `document_id` references `Document`, not a duplicate document master. Evidence can also attach to Finding/Request/Activity.
### F. Acceptance Criteria
AC-B-07 record/evidence/reference and atomic failure; AC-B-08 local document-interface outage recovery; AC-A-25 is the related cross-module failure criterion. No test proves the entire outage-and-later-link UI flow.
### G. Verification evidence
MUA TC-080–082,086; `records.integration.ts` tests create/upload/reference and invalid files; IH/E2E cross-module chain. The options fallback is confirmed by source; no targeted runtime AC-B-08 outage test was found.
### H. Current status
**Status: IMPLEMENTED — PARTIALLY VERIFIED.** Main creation flow is verified. Failure-isolation implementation exists at options level, but full AC-B-08 behavior has only source-level support.

| Expected Step | UI | Backend/API | Data | Evidence | Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Create Record with Document/Evidence | Records form | POST `/api/records` | QualityRecord, Evidence, Document | TC-080–082; Records test | Covered |
| Continue when document lookup fails | Records form | options catch/fallback | optional document_id | source check | Partly verified |

## UC-B-05 — Search, view and download Record/Evidence

### A. Requirement coverage
FR-B-12–13; BR-B-11; NFR-B-01; US-B-02; SRS §4.18. Scope must apply before search; direct out-of-scope IDs must reveal nothing.
### B. Expected workflow
1. Filter by type/date/owner/document. 2. Server scopes query by current actor, then returns rows. 3. Open detail and download authorized evidence. 4. Audit download; report missing file with reference, not false success.
### C. UI implementation
`#records`, `RecordsPage.tsx`: search/filter, detail, edit, file downloads; Finding detail links a permitted Record at `#records`.
### D. Backend / API implementation
`GET /api/records`, `/:id`, `/evidence/:id`; `recordService.scope` is applied inside list/detail/file queries. Out-of-scope ID returns 403; file download writes an audit event, including missing-file path.
### E. Data / ERD
Planned/current `QualityRecord`→`Evidence`, optional `Document`; `Finding.recordId` gives Finding→Record and its evidence. No controlled-document semantics are assigned to Evidence.
### F. Acceptance Criteria
AC-B-09 scoped search/direct denial; AC-B-10 authorized download/missing-file audit; AC-B-35 Finding→Record→Evidence navigation.
### G. Verification evidence
MUA TC-083–089,098; `records.integration.ts` and `audit.integration.ts`; IH/E2E scope/file and cross-module checks.
### H. Current status
**Status: IMPLEMENTED + VERIFIED.** Search, direct denial, detail/download and Finding navigation have UI/API evidence. TC-098 observed download start, while file-content integrity is supported separately by API/storage checks.

| Expected Step | UI | Backend/API | Data | Evidence | Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Filter/open scoped Record | Records list/detail | list/detail routes | QualityRecord | TC-083–089; Records test | Covered |
| Follow Finding and download Evidence | Audit→Records link | record/evidence routes | Finding.recordId, Evidence | TC-098; E2E | Covered |

## UC-B-06 — Create audit round

### A. Requirement coverage
FR-B-14, FR-B-14.1–14.2, FR-B-19; BR-B-18; SRS §4.19. Auditor independence uses recorded department affiliation; only DCC may waive with reason and audit, never Lead by role alone.
### B. Expected workflow
1. DCC/Lead enters round name/objective/scope/criteria/dates/target unit. 2. Assigns auditors. 3. Rejects an auditor in the target department unless DCC supplies a reasoned waiver. 4. Save round/members and audit waiver; show finding counts by type/severity.
### C. UI implementation
`#audit`, `AuditPage.tsx`: create round form, team/date validation, independence warning/waiver reason, detail and summary; create shown only to DCC/Lead.
### D. Backend / API implementation
`POST /api/audit/rounds`, `GET /rounds/:id`; `auditService.createRound` compares each auditor's `departmentId` with target, requires DCC + reason for conflicts, persists `AuditRoundMember` waiver and `INDEPENDENCE_WAIVER` event.
### E. Data / ERD
Planned/current `AuditRound`→`AuditRoundMember`→`User`/`Department`; `Finding` attaches to round; `AuditEvent` holds waiver reason. No fabricated independence authority.
### F. Acceptance Criteria
AC-B-11 complete round; AC-B-11.1 conflict rejection/DCC waiver/Lead denial; AC-B-12 aggregate findings. AC-B-11.1 UI conflict cases need a suitable fixture.
### G. Verification evidence
MUA TC-090–092 PASS; **TC-093–095 BLOCKED** because the demo fixture lacks a same-department auditor/target combination. `audit.integration.ts` and IH/E2E cover code-level rejection/waiver; manual UI waiver remains unobserved.
### H. Current status
**Status: IMPLEMENTED — PARTIALLY VERIFIED.** Core round and independence guards exist; UI independence cases remain a **TEST DATA / FIXTURE LIMITATION**, not an application FAIL.

| Expected Step | UI | Backend/API | Data | Evidence | Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Create valid scoped round | Audit create | POST `/api/audit/rounds` | AuditRound, Member | TC-090–092 | Covered |
| Conflict / DCC waiver | waiver field | `auditService.createRound` | Member, AuditEvent | Audit test; TC-093–095 blocked | API covered; UI fixture blocked |

## UC-B-07 — Identify and record Finding

### A. Requirement coverage
FR-B-15–18; BR-B-08; US-B-03; SRS §4.20. Five sources are recorded; a nonconformity needs violated requirement and objective Evidence. Observation/suggestion does not automatically open a request.
### B. Expected workflow
1. Reporter chooses source (and round for internal audit), type/severity/date. 2. Enters description/violated requirement and direct Evidence or a valid Record/Evidence reference; may link Document. 3. Server validates and persists Finding/event. 4. Suppresses CAR/NCR offer for observation/suggestion; stale/missing files are rejected.
### C. UI implementation
`#audit`, `AuditPage.tsx`: add Finding form, source/round/type/severity, Document/Record and file controls; detail links to Record/Evidence. `#cars` filters candidates to nonconformities from supported sources.
### D. Backend / API implementation
`POST /api/audit/findings`, `GET /findings/:id`, evidence route; `auditService.createFinding` checks source/round, requirement, minimum description, valid Record/files and rights, then persists Finding/Evidence/audit. `carService.create` rejects observation/suggestion.
### E. Data / ERD
Planned/current `Finding`→optional `AuditRound`, `Document`, `QualityRecord`; direct `Evidence` or `QualityRecord`→`Evidence`; `AuditEvent`. Current `Finding.recordId` and file checks are real cross-module links.
### F. Acceptance Criteria
AC-B-13 mandatory requirement/evidence; AC-B-14 five sources and nonconformity-only request offer; AC-B-35 authorized Finding→Record→Evidence. Other-source CAR/NCR mapping remains policy TBD.
### G. Verification evidence
MUA TC-096–103 (internal and management-review paths; TC-098 link); `audit.integration.ts`, `car.integration.ts` and IH/E2E source/round/record/file tests. Manual tests do not exercise every five-source/observation variant.
### H. Current status
**Status: IMPLEMENTED — PARTIALLY VERIFIED.** Implementation accepts five sources and guards request eligibility; available UI evidence samples two sources and the negative observation rule mainly via API/source.

| Expected Step | UI | Backend/API | Data | Evidence | Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Create NC with requirement/Evidence | Audit Finding form | POST `/api/audit/findings` | Finding, Evidence | TC-096–100; Audit test | Covered |
| Link Record and follow its file | Finding detail | finding/record routes | Finding.recordId→Evidence | TC-097–098 | Covered |
| Suppress request for OB/suggestion | CAR candidate list | `carService.create` guard | FindingType | CAR test/source | Partly verified |

## UC-B-08 — Open CAR/NCR from Finding

### A. Requirement coverage
FR-B-20–21; BR-B-07, BR-B-15; US-B-04; SRS §4.21. Internal Audit→CAR and Management Review→NCR in MVP; other-source mapping is unresolved.
### B. Expected workflow
1. Authorized reporter chooses open nonconformity Finding. 2. System proposes supported request type. 3. Enter owner, department and overall due date. 4. Reject an already-open request (including race), create request/status/event. Automatic per-stage deadlines are a deferred/TBD sub-flow.
### C. UI implementation
`#cars`, `CarPage.tsx`: `＋ เปิดใบคำร้อง`, eligible Finding picker, CAR/NCR type, owner/due date; only DCC/Auditor/Lead see create action.
### D. Backend / API implementation
`POST /api/cars`; `carService.create` permits only nonconformities from Internal Audit/Management Review, derives CAR/NCR, checks owner and duplicate under transaction, writes `RequestStatusHistory`/`AuditEvent`.
### E. Data / ERD
Planned/current `Finding`→`CorrectiveRequest`→`RequestStatusHistory`; `StageDeadlineSetting` exists but automatic stage values are not in this creation path. One active request per Finding is guarded.
### F. Acceptance Criteria
AC-B-15 duplicate open request; AC-B-16 source→type; AC-B-29 no skipped state. External Audit/form mapping remains `TBD-B-06` and is not treated as failed MVP behavior.
### G. Verification evidence
MUA TC-104–105,119; `car.integration.ts`; IH/E2E duplicate/start race and CAR/NCR mapping.
### H. Current status
**Status: IMPLEMENTED + VERIFIED.** Both confirmed MVP source mappings and duplicate guard are exercised. **DEFERRED SUB-FLOW:** automatic stage deadlines and other-source request types.

| Expected Step | UI | Backend/API | Data | Evidence | Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Select eligible Finding and owner | CAR create form | POST `/api/cars` | Finding, Request | TC-104,119 | Covered |
| Reject duplicate, keep audit | error/disabled action | `carService.create` | Request, history | TC-105; CAR test | Covered |

## UC-B-09 — Record correction, root cause and action plan

### A. Requirement coverage
FR-B-22–24; BR-B-13–14; US-B-05; SRS §4.22. Immediate correction and root-cause correction are separate; each plan activity needs owner and due date.
### B. Expected workflow
1. CAR Owner starts own request and records immediate correction. 2. Separately records root cause/technique. 3. Drafts corrective/preventive activities with owner and date. 4. Validate and submit plan for QMR decision, preserving revisions and prohibiting skipped states. Automatic working-day targets remain TBD.
### C. UI implementation
`#cars`, `CarPage.tsx`/`CarActions.tsx`: `เริ่มแก้ไขเฉพาะหน้า`, correction fields, cause/technique, draft plan activities, `ส่งแผนขออนุมัติ`; owner actions only.
### D. Backend / API implementation
`POST /api/cars/:id/actions`; `carWorkflow.performAction` transitions OPEN→CORRECTION→ANALYSIS_PLANNING→PENDING_PLAN_APPROVAL, validates activity owner/date, writes `Correction`, `RootCauseAnalysis`, revisioned `ActionPlan` and audit/history.
### E. Data / ERD
Planned/current `CorrectiveRequest`→`Correction`, `RootCauseAnalysis`, `ActionPlan`→`ActionPlanActivity`, plus histories. `planDraft` JSON in current request model is an extra persisted draft representation absent from ERD v0.1.
### F. Acceptance Criteria
AC-B-17 separate correction/cause fields; AC-B-18 complete activities before submission; AC-B-29 state sequence.
### G. Verification evidence
MUA TC-106–109,120; `car.integration.ts`; IH/E2E revision, incomplete-plan and transition guards.
### H. Current status
**Status: IMPLEMENTED + VERIFIED.** Current correction-to-submitted-plan path and validation are exercised; automatic stage deadlines are tracked under UC-B-14.

| Expected Step | UI | Backend/API | Data | Evidence | Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Record immediate correction | CAR detail | start/correction actions | Correction, history | TC-106–108 | Covered |
| Submit valid revisioned plan | plan form | submit-plan action | RootCauseAnalysis, Plan, Activity | TC-108–109; CAR test | Covered |

## UC-B-10 — Approve or return action plan

### A. Requirement coverage
FR-B-25–26; BR-B-12; US-B-06; SRS §4.23. Confirmed demo decision: QMR approves CAR and NCR plans, never a plan QMR authored; Lead/Assistant do not inherit authority.
### B. Expected workflow
1. QMR reviews correction, cause and activity plan. 2. Server rejects self-approval and result entry before approval. 3. Approve to IMPLEMENTING or return with mandatory reason to ANALYSIS_PLANNING. 4. Retain prior plan revision, decision and audit.
### C. UI implementation
`#cars`, `CarPage.tsx`/`CarActions.tsx`: QMR approval/return controls, reason dialog; no approval action for CAR Owner/other roles.
### D. Backend / API implementation
`POST /api/cars/:id/actions`; `carWorkflow.performAction` accepts `approve`/`reject` only in PENDING_PLAN_APPROVAL by QMR who did not submit the plan; reason required on reject; persists `PlanApproval` and state history.
### E. Data / ERD
Planned/current `ActionPlan`→`PlanApproval`, `CorrectiveRequest`→`RequestStatusHistory`, `AuditEvent`; `ActionPlan.revision/isCurrent` preserves returned versions.
### F. Acceptance Criteria
AC-B-19 no implementation before plan approval; AC-B-20 reasoned return and preserved plan; AC-B-29 no state bypass.
### G. Verification evidence
MUA TC-110–112,120; `car.integration.ts`; IH/E2E self-approval and revision guards.
### H. Current status
**Status: IMPLEMENTED + VERIFIED.** QMR decision and return path have UI/API evidence for both current request types.

| Expected Step | UI | Backend/API | Data | Evidence | Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Reject unreasoned/self decision | QMR dialog | approve/reject guard | PlanApproval | TC-110; CAR test | Covered |
| Approve/return with history | CAR detail | approve/reject actions | Plan, Approval, history | TC-111–112,120 | Covered |

## UC-B-11 — Record plan activity results and Evidence

### A. Requirement coverage
FR-B-27, FR-B-11; BR-B-13; US-B-07; SRS §4.24. Every activity in the approved plan needs a result and real Evidence before effectiveness verification.
### B. Expected workflow
1. CAR Owner opens approved activities. 2. Records each result and uploads Evidence or links a permitted Record with Evidence. 3. System checks every activity and actual file availability. 4. Submit to PENDING_VERIFICATION; reject missing result/file or wrong state.
### C. UI implementation
`#cars`, `CarPage.tsx`/`CarActions.tsx`: activity result and file/Record controls, submit-for-verification button shown only to owner in IMPLEMENTING.
### D. Backend / API implementation
`POST /api/cars/:id/activities/:activityId/result`; `carEvidence.result` stores file/Record links. `POST /api/cars/:id/actions` `submit-verification` checks approved plan, result, Evidence/Record link and physical file; `carWorkflow` writes state/audit.
### E. Data / ERD
Planned/current `ActionPlanActivity`→`Evidence`; current `ActivityRecordLink`→`QualityRecord`→`Evidence` adds Record reuse absent from planned 33 tables. `Evidence.activityId` is the planned direct activity key.
### F. Acceptance Criteria
AC-B-18 rejects incomplete plan/activity Evidence; AC-B-19 implementation after approval; AC-B-29 state sequence.
### G. Verification evidence
MUA TC-113–115,121; `car.integration.ts`; IH/E2E missing physical file, Record-linked evidence and self action checks.
### H. Current status
**Status: IMPLEMENTED + VERIFIED.** Result/Evidence gates are exercised, including Record reuse and missing-file denial.

| Expected Step | UI | Backend/API | Data | Evidence | Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Attach result/file or Record | CAR activity form | result route | Activity, Evidence, RecordLink | TC-113–114,121 | Covered |
| Validate all and send | submit button | submit-verification action | RequestStatusHistory | TC-115; CAR test | Covered |

## UC-B-12 — Verify corrective-action effectiveness

### A. Requirement coverage
FR-B-28–29; BR-B-05; US-B-08; SRS §4.25. Reporting Auditor/Lead, independent of CAR Owner and activity owners, verifies; successful verification ends at PENDING_CLOSURE in MVP. DCC-reported Finding needs a substitute-verifier decision (`TBD-B-25`).
### B. Expected workflow
1. Authorized original reporter opens PENDING_VERIFICATION. 2. Reviews approved plan, results and Evidence. 3. Records effective/ineffective decision with comment. 4. Server checks reporting identity and separation; pass→PENDING_CLOSURE, fail→ANALYSIS_PLANNING with history. If DCC reported, hold without inventing substitute authority.
### C. UI implementation
`#cars`, `CarPage.tsx`/`CarActions.tsx`: verifier action shown for eligible original Auditor/Lead; DCC-reporter case states waiting/limitation and offers no surrogate action.
### D. Backend / API implementation
`POST /api/cars/:id/actions` `verify-pass`/`verify-fail`; `carAccess.canVerify` requires original Auditor/Lead reporter and excludes request/activity owners. `carWorkflow` stores `Verification`, status history and audit; no substitute rule.
### E. Data / ERD
Planned/current `Finding.identifiedById`→`CorrectiveRequest`→`Verification`, `RequestStatusHistory`, `AuditEvent`; no approved substitute-verifier relation/policy in the model. This is a business TBD, not a reason to fabricate a table.
### F. Acceptance Criteria
AC-B-21 self-verification denial; AC-B-23 ineffective return; AC-B-29 state order. AC-B-21/FR-B-28 cannot fully settle DCC-reporter branch until `TBD-B-25` is resolved.
### G. Verification evidence
MUA TC-116–118,122 PASS for original reporter; TC-123 PASS confirms DCC-reported NCR remains pending. `car.integration.ts`, IH/E2E cover self-denial, normal success, negative decision and DCC hold. No substitute acceptance test can be defined yet.
### H. Current status
**Status: BLOCKED BY TBD.** **NORMAL PATH IMPLEMENTED + VERIFIED:** the original reporting Auditor/Lead can verify effectiveness, with self-verification denial, pass and fail transitions tested. Only the DCC-reporter substitute branch remains unresolved under `TBD-B-25`; the current hold is intentional, not a missing normal-path implementation. **Secondary flag: D — blocked business decision** for that branch.

| Expected Step | UI | Backend/API | Data | Evidence | Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Original reporter verifies or rejects | CAR verification | verify-pass/fail | Verification, history | TC-116–118,122; CAR test | Covered |
| DCC-reporter substitute | waiting message | no authorized substitute | Finding.identifiedById | TC-123; source | Blocked by TBD-B-25 |

## UC-B-13 — Close CAR/NCR after effectiveness review

### A. Requirement coverage
FR-B-30–32; BR-B-02, BR-B-05, BR-B-17; US-B-09; SRS §4.26. Full-cycle closure is retained for traceability but intentionally outside the current MVP endpoint. Authority/signatures/return path are `TBD-B-24`.
### B. Expected workflow
1. Future authorized closer opens PENDING_CLOSURE. 2. Reviews Finding, plan, implementation Evidence and effectiveness result. 3. Applies confirmed authority and separation rule. 4. Records decision, reason, actor/time and closure/history. Until policy is approved, no actor may close or return from this state.
### C. UI implementation
`#cars` shows PENDING_CLOSURE and no close command; no closer role/button. This is the correct current hold, not a hidden completed closure.
### D. Backend / API implementation
`carWorkflow.transitions` has no close or return-from-closure action; unsupported commands receive 409. No service creates a `Closure` row.
### E. Data / ERD
Planned/current `CorrectiveRequest`→`Verification`→`Closure`, `RequestStatusHistory`, `AuditEvent`; `Closure` schema exists but is unused in MVP. No data-model claim is made for unapproved signatory count.
### F. Acceptance Criteria
AC-B-22 currently verifies *rejection* of close at PENDING_CLOSURE; future closure acceptance is parked. AC-B-23 return from PENDING_CLOSURE is parked, while return from verification is covered by UC-B-12.
### G. Verification evidence
MUA TC-118 observes endpoint; TC-123 shows another hold. `car.integration.ts`/E2E confirm close gets 409 and no CLOSED result. No evidence of final closure or owner-approved authority.
### H. Current status
**Status: DEFERRED / OUT OF CURRENT MVP.** PENDING_CLOSURE is the confirmed MVP endpoint, and the guard against closure is verified. Full closure remains future scope; `TBD-B-24` on authority, signatures and return path is a **secondary D — blocked business decision** for later implementation. The absent close action is not a current-MVP defect.

| Expected Step | UI | Backend/API | Data | Evidence | Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Reach pending closure | CAR status | verify-pass | Verification, Request | TC-118,122 | Covered MVP endpoint |
| Close or return under approved authority | none | unsupported command→409 | Closure unused | CAR test; E2E | Deferred; policy TBD-B-24 |

## UC-B-14 — Follow overdue work

### A. Requirement coverage
FR-B-33–36; BR-B-06, BR-B-16; US-B-10; SRS §4.27 and §4.30. Overdue is computed, not persisted as request status. Current MVP tracks dates actually recorded for the active stage or approved-plan activity; automatic stage/working-day defaults and the near-due threshold await `TBD-B-09/16`.
### B. Expected workflow
1. Authorized user opens the CAR/NCR overdue list. 2. System computes from an explicit current-stage due date or unfinished current-plan activity due dates, under role scope. 3. Shows stage and waiting role; no-deadline rows remain unmarked in the general list. 4. Filter by owner/status and open the source request. Calendar days elapsed are labeled as such; no working-day or near-due threshold is inferred from provisional settings.
### C. UI implementation
`#cars` now has an overdue filter, owner/status filters and a current-work due column. Each overdue row shows its request number, current status, overdue activity or stage, recorded date, known responsible person/role, calendar days elapsed and a detail button. The general list distinguishes no applicable date and inactive/completed work. `#dashboard` shows the matching request count and a link for non-Sponsor users with overdue work.
### D. Backend / API implementation
`carDue.dueRequests` derives per-request current-work state from the role-scoped request query. In `IMPLEMENTING`, it uses only unfinished activities on the current plan; otherwise it uses the latest `stageDueDate` only when its history status matches the current status. It excludes `CLOSED` and the MVP endpoint `PENDING_CLOSURE`. `carService.list` exposes the derived state and an `?overdue=1` list; `dashboardService.cars` counts those same scoped request results. The `overallDueDate` fallback was removed. No near-due classification or automatic stage deadline calculation is asserted.
### E. Data / ERD
Persisted sources are `CorrectiveRequest.overallDueDate` (whole-request reference, not an applicable stage deadline), `ActionPlanActivity.dueDate` and `completedAt`, nullable `RequestStatusHistory.stageDueDate`, and completion/verification timestamps. `StageDeadlineSetting` and `WorkingCalendar` exist but current workflow does not generate approved stage dates from them. Migration `20260919000200_constraints` creates `add_working_days` and `request_due_status`; that view covers stage dates only and has a provisional near-due default, so the current-MVP calculation does not use it. No persisted `is_overdue` field exists. **DATA-USE DISCREPANCY:** the designed view remains unused pending policy and activity-aware design.
### F. Acceptance Criteria
AC-B-24 stage/role overdue list and near-due branch; AC-B-28 derived marker alongside real state. The recorded-date overdue branch is implemented. The provisional near-due numeric threshold and automatic working-day stage deadlines cannot be claimed as accepted.
### G. Verification evidence
On 27 September 2026, targeted `dashboard.integration.ts` verified overall-date fallback removal, past/future/completed activities, multiple activity selection, no applicable date, explicit current versus stale stage date, inactive request, role scope, Sponsor aggregate-only access and Dashboard/list count equality. `car.integration.ts` passed. Focused `car-overdue.test.tsx` verified due display; Dashboard page/chart tests and API/frontend typecheck/build passed. No MUA UC-B-14 list case or manual re-acceptance of the revised UI exists; TC-125–128 remain aggregate-only evidence.
### H. Current status
**Status: IMPLEMENTED — PARTIALLY VERIFIED.** The confirmed current-MVP recorded-date overdue count and actionable list are implemented with targeted tests. Manual UI verification remains open. Automatic per-stage working-day deadlines and near-due classification remain policy-dependent under `TBD-B-09/16`; this status does not claim full-scope AC-B-24 acceptance.

| Expected Step | UI | Backend/API | Data | Evidence | Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Compute scoped overdue count | Dashboard panel | GET `/api/dashboard` | current stage or unfinished current-plan activity date | Dashboard integration | Covered for recorded dates |
| List/filter overdue work and open request | CAR list/filter/detail | GET `/api/cars?overdue=1`, detail route | derived work from current request/plan | Dashboard/CAR integration; DueCell test | Implemented; manual UI acceptance pending |
| Automatic stage deadlines / near-due | no current-MVP claim | no provisional rule used | settings/calendar and view retained | TBD-B-09/16 | Policy-dependent full scope |

## UC-B-15 — View operational dashboard

### A. Requirement coverage
FR-B-37–40, FR-B-42; BR-B-03, BR-B-11; US-B-11; SRS §4.28. Current MVP is six real-data domains, role scope before aggregation, Sponsor aggregate-only. Advanced metrics/export are deferred. Cross-module failure isolation remains a current requirement.
### B. Expected workflow
1. User opens dashboard. 2. Server scopes each domain then aggregates Documents, DAR, Acknowledgements, Records/Evidence, Audit/Finding and CAR/NCR. 3. UI distinguishes zero, no permission and failed read. 4. Authorized non-Sponsor users follow source-list links; Sponsor cannot drill down. A failed domain must warn locally while others remain usable.
### C. UI implementation
`#dashboard`, `DashboardPage.tsx`/`DashboardCharts.tsx`: six panels, numeric metrics, SVG donut/bar charts and DAR/CAR links; `aggregateOnly` suppresses Sponsor drill-down. A failed authorized domain now shows a local “ไม่สามารถโหลดข้อมูลส่วนนี้ได้” state while successful panels remain usable. An omitted unauthorized domain still shows “ไม่มีสิทธิ์ดูข้อมูลหมวดนี้”.
### D. Backend / API implementation
`GET /api/dashboard`; `dashboardService.summary` checks Dashboard access, starts only permitted scoped reads, then settles each independently. Successful data remains under `sections`; failed permitted domain names appear under `unavailable`, with no fabricated zero or raw error in the response. The direct Document/DAR/Acknowledgement queries still bypass the agreed internal-module interface (`FR-B-42`, `CON-A-02`).
### E. Data / ERD
Planned/current data are derived from `Document/DocumentVersion`, `Dar`, `AcknowledgementAssignment/Confirmation`, `QualityRecord/Evidence`, `AuditRound/Finding`, `CorrectiveRequest`; no dashboard table by design (`M-B-01` is a model concept, not a table). **DATA-USE GAP, NOT MODEL CONFLICT:** the migration creates the `request_due_status` derived view; current dashboard computes a fallback aggregate in service instead.
### F. Acceptance Criteria
AC-B-25 six-domain scoped dashboard, Sponsor restriction, zero/no-right/failure distinction; AC-B-26 real transactions and empty state. The failure branch is now implemented. Advanced breakdown, all-chart/table accessibility and post-closure metrics are expressly deferred, not scored as current MVP failures.
### G. Verification evidence
MUA TC-025–027,125–134; `dashboard.integration.ts` and `dashboard-charts.test.tsx`; IH/E2E six-domain counts and role scope. On 27 September 2026, the targeted integration test passed normal six-domain values, one failed Ack read, two failed independent reads, unchanged successful scoped counts, Sponsor aggregate-only output and no failed/unauthorized detail in metadata. `dashboard-page.test.tsx` verified local warning, retained panels and Sponsor link suppression; API/frontend typecheck/build passed. The revised UI has no manual acceptance yet. Reconciliation ID-02's failure-isolation portion is resolved; its internal-interface discrepancy remains. ID-03 notes SVG instead of locked Chart.js 4/`react-chartjs-2` 5 (`CON-B-04`, `TBD-B-23`).
### H. Current status
**Status: PARTIALLY IMPLEMENTED.** Six-domain normal path and independent failure isolation are implemented and targeted-test verified. The current `FR-B-42`/`CON-A-02` internal-interface requirement remains unmet by direct Document/DAR/Acknowledgement table reads, so the UC is not promoted. Revised UI acceptance remains open. **IMPLEMENTATION DISCREPANCY:** remaining interface portion of ID-02; technology constraint ID-03. Deferred analytics/export are not counted as defects of the current MVP summary.

| Expected Step | UI | Backend/API | Data | Evidence | Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Scope and show six real domains | Dashboard panels | GET `/api/dashboard` | six domain aggregates | TC-025–027,125–134; Dashboard test | Covered |
| Sponsor aggregate/no drill-down | Dashboard no links | `aggregateOnly` | scoped counts | TC-132–134 | Covered |
| Isolate one or more failed domains | local warning; other panels persist | `sections` plus `unavailable` from independent reads | scoped domain queries | Dashboard integration and page tests | Covered in targeted tests; revised UI pending manual acceptance |

## UC-B-16 — Export corrective/preventive summary

### A. Requirement coverage
FR-B-41, FR-B-32; BR-B-11; US-B-12; SRS §4.29. Full-project summary/export objective is retained; the authorized export role and post-closure data depend on later decisions.
### B. Expected workflow
1. Future approved actor selects date/status filters. 2. Server scopes before aggregate. 3. UI shows summary; export produces file with creator and creation date. Current MVP exposes no export and cannot claim closed-request outcome measures.
### C. UI implementation
No export/report UI in `#dashboard` or `#cars`. Dashboard cards are operational summaries, not the UC-B-16 file output.
### D. Backend / API implementation
No report/export route or service. `GET /api/dashboard` is not an export implementation.
### E. Data / ERD
Would consume planned/current `CorrectiveRequest`, `ActionPlan`, `Verification`, `Closure` plus scope; `Closure` is unused until policy approval. No report artifact table is defined in planned/current ERD.
### F. Acceptance Criteria
AC-B-27 expressly parks export from current MVP and requires role-scoped file with creator/date when opened; AC-B-22 closure part is separately parked.
### G. Verification evidence
No MUA export case or runtime export test. SRS v1.2 §4.29 and reconciliation explicitly defer this objective; source shows no route/button.
### H. Current status
**Status: DEFERRED / OUT OF CURRENT MVP.** No implementation is expected now. Export actor, closure source and final report scope require future decisions before acceptance.

| Expected Step | UI | Backend/API | Data | Evidence | Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Select range and preview report | none | none | request/verification summary | SRS §4.29; source | Deferred |
| Export attributed file | none | none | file metadata not defined | no export test | Deferred |

## UI Coverage Summary

| Current application area | Route / source | Use Cases | Boundary |
| :--- | :--- | :--- | :--- |
| Login / role shell | unauthenticated, `App.tsx`, `LoginPage.tsx`, `AppLayout.tsx` | B-01, B-02, all access guards | Demo account switch is not multi-role switching; no user admin |
| General audit trail | none; module history only | B-03; audit evidence across A/B | No searchable shared audit-event view |
| Documents | `#documents`, `DocumentsPage.tsx` | A-01, A-06–08, A-11; B-04/B-07 reference | A-07 cancel action absent; PDF download-only |
| DAR | `#dar`, `DarPage.tsx` | A-01–07, A-11–12 | Current new/revise types; cancellation deferred |
| Acknowledgements | `#ack`, `AcknowledgementsPage.tsx` | A-09–10 | Explicit confirmation and server prior-access check; Ack file link/copy notice pending |
| Records / Evidence | `#records`, `RecordsPage.tsx` | B-04–05, B-07, B-11 | Evidence is separate from controlled Document |
| Audit / Finding | `#audit`, `AuditPage.tsx` | B-06–08, B-12 | TC-093–095 fixture limitation; Finding→Record link tested |
| CAR / NCR | `#cars`, `CarPage.tsx`, `CarActions.tsx` | B-08–14, B-16 | Ends at PENDING_CLOSURE; no close/export/overdue list |
| Dashboard | `#dashboard`, `DashboardPage.tsx`, `DashboardCharts.tsx` | B-14–16; aggregates A-06/A-11/A-09/B-04/B-06/B-08 | Six domains; failed section currently fails whole request |

## Data / ERD Coverage Summary

`Database_Design.md` is a 16 September v0.1 **draft based on SRS v1.1** and describes 33 tables. Current `prisma/schema.prisma` declares **38 models**. The five extra current models are `DocumentImportSource`, `DarRound`, `DarFile`, `ActivityRecordLink`, and `DocumentCodeSequence`. Source review classifies all five as **legitimate implementation refinements / ERD documentation drift (E)**, with no observed requirement or data-model conflict requiring a design decision. The planned draft already anticipated `Evidence.activityId`; current Record reuse adds `ActivityRecordLink`. The current schema also keeps `Closure` and stage deadline settings while their business workflows are held. The `request_due_status` SQL view is created by a migration even though it is not a Prisma model; the current dashboard does not use it. See `docs/MVP_GAP_CLOSURE_PLAN.md` for each refinement and the later ERD update.

| Planned entity/domain → current Prisma model | Use Cases | Key relationship / discrepancy |
| :--- | :--- | :--- |
| `app_user`, `user_role`, `department` → `User`, `UserRole`, `Department` | B-01–03; all rights | Shared identities; runtime auth uses static demo registry rather than multi-role DB assignment |
| `audit_event` → `AuditEvent` | B-03; all write workflows | Shared actor/role/entity trail; no general viewer |
| `document`, `document_version`, `document_file` → `Document`, `DocumentVersion`, `DocumentFile` | A-01, A-06–10; B-04, B-07, B-15 | Version/file identity; Finding/Record link to Document; extra `DocumentImportSource` records imported source |
| `dar`, `dar_target_item`, `dar_decision`, `dar_status_history`, `distribution_entry` → named PascalCase models | A-01–07, A-11–12, B-15 | DAR→published version→distribution/recall; extra `DarRound`/`DarFile` retain draft rounds and evidence; `DocumentCodeSequence` added |
| `acknowledgement_assignment`, `acknowledgement_confirmation` → named PascalCase models | A-09–10, B-15 | Assignment→version→explicit confirmation; distinct from distribution. No prior-access prerequisite enforced at confirm |
| `record_type`, `quality_record`, `evidence` → `RecordType`, `QualityRecord`, `Evidence` | B-04–05, B-07, B-11, B-15 | Record→Evidence; Record/ Finding may reference Document; direct Evidence also links Finding/Request/Activity |
| `audit_round`, `audit_round_member`, `finding` → `AuditRound`, `AuditRoundMember`, `Finding` | B-06–08, B-12, B-15 | Round→Finding; member/target department drives independence; Finding→Record→Evidence |
| `corrective_request`, `correction`, `root_cause_analysis`, `action_plan`, `action_plan_activity`, `plan_approval` → named PascalCase models | B-08–11, B-14–16 | Finding→request→plan activities; extra `ActivityRecordLink` reuses Record/Evidence at activity level |
| `verification`, `closure`, `request_status_history` → `Verification`, `Closure`, `RequestStatusHistory` | B-12–16 | Request→verification→PENDING_CLOSURE; `Closure` unused until TBD-B-24 |
| `working_calendar`, `stage_deadline_setting`, `system_setting` → named PascalCase models; `request_due_status` SQL view | B-14–15 | Planned working-day/stage due structures exist; current dashboard bypasses the view and uses latest stage date or overall due fallback, without actionable list |

## Cross-module and discrepancy register

| Flow / item | Verified current link or exact gap |
| :--- | :--- |
| DAR→Document revision→distribution/recall | `darService.publish` creates linked `DocumentVersion`/files; logistics and `DistributionEntry` precede close; MUA TC-057–063, DAR/E2E tests |
| Document revision→acknowledgement | Assignment targets `DocumentVersion`; confirmation stays on that version, never transfers silently. **ID-01 resolved:** a matching authorized `DocumentFile` access event after assignment is required before a new UC-A-10 confirmation; the Ack UI retains a separate explicit confirmation button after download. |
| Document-file presentation | **PDF presentation P0 resolved in source/build on 27 September:** `DocumentsPage.tsx`, `DarPage.tsx` and `AcknowledgementsPage.tsx` use download links with `?download=1` and the shared AC-A-21 uncontrolled-copy notice. DAR logistics evidence is included. No open/preview control remains on these surfaces. MUA TC-032/046/075 covered earlier download actions; the revised labels and notice still need manual UI acceptance. |
| Record/Evidence→Finding | `Finding.recordId` and/or direct `Evidence.findingId`; TC-097–098, Audit/Records tests; file permissions apply. |
| Finding→CAR/NCR | `CorrectiveRequest.findingId`; Internal Audit→CAR, Management Review→NCR; TC-104–105/119 and CAR tests. Other-source mappings stay TBD. |
| CAR/NCR→Evidence→verification | `ActionPlanActivity.evidence` or `ActivityRecordLink`→`QualityRecord.evidence`, then `Verification`; TC-113–123 and CAR tests. DCC-reporter substitute is TBD-B-25. |
| CAR/NCR→closure | Valid verification reaches PENDING_CLOSURE; no close action or `Closure` row; TBD-B-24. |
| Dashboard→all six domains | Normal scoped aggregates tested by TC-125–134 and Dashboard tests. Targeted failure tests now show local recovery from one or two failed domains. **ID-02 remaining:** direct cross-domain DB reads bypass the agreed interface. **ID-03:** SVG charts differ from locked Chart.js 4/`react-chartjs-2` 5 technology choice. |
| Overdue tracking | Current scoped Dashboard count and CAR/NCR overdue list share the derived rule for recorded unfinished current-plan activity or explicit current-stage due dates; no overall-date fallback. The list shows waiting role/person and opens the request. Revised manual UI acceptance remains open; near-due threshold and automatic working-day stage policy remain TBD-B-09/16. |

**Evidence and decision boundary.** TC-093–095 are BLOCKED by demo fixture, while `audit.integration.ts` exercises independence and DCC waiver; do not convert them to PASS or FAIL. Current manual result is **136/139 PASS, 3 BLOCKED**. `TBD-B-24` (closure authority, signatures and return path) and `TBD-B-25` (DCC-reporter substitute verifier) remain unresolved. Production acknowledgement assignment authority, some DAR request-type rules, and automatic stage deadlines also remain open; the trace does not treat provisional values as approved criteria. Advisor/project-owner review should confirm the classification and data-model drift before Chapters 4–5 are aligned.
