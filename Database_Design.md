# การออกแบบฐานข้อมูลระบบ E-Filing — Current Implemented Model

| รายการ | รายละเอียด |
| :--- | :--- |
| ฉบับ | 0.2 — alignment กับ implementation ปัจจุบัน |
| วันที่ทบทวน | 27 กันยายน 2569 |
| สถานะ | Working Draft; ไม่ใช่ Approved Baseline หรือ real-user acceptance |
| แหล่งโครงสร้างที่เก็บจริง | `prisma/schema.prisma` และ migrations ปัจจุบัน (อ่านอย่างเดียวในงานนี้) |
| แหล่งความต้องการ | `SRS_v1.md` v1.2 Working Draft และมติ MVP ใน `PROJECT_STATE.md` |
| ERD บทที่ 3 | [`Project report/figures/ch3/er/`](Project%20report/figures/ch3/er/README.md) — editable `.html` → `.svg`/`.png` |

> เอกสารภายในโครงงาน ห้ามเผยแพร่ต่อสาธารณะโดยไม่ได้รับอนุญาตจากอาจารย์ที่ปรึกษาและหน่วยงานเจ้าของเอกสาร

## 1. Scope and authority

**CURRENT IMPLEMENTED MODEL:** Prisma declares **38 models mapped to 38 PostgreSQL tables** in one schema across the two modules. `request_due_status` is an additional SQL **view**, not a 39th table/model. Dashboard aggregates domain data after permission filtering; it has no summary table. PDF and evidence bytes live in the filesystem; database tables store paths and metadata. No persisted `is_overdue` flag exists.

**PLANNED / EARLIER DESIGN:** Version 0.1 (16 September 2026, SRS v1.1) described 33 tables. All 33 remain in the current schema; five implementation refinements were added. Its statements that PostgreSQL had never been run, that the schema had 33 current tables, and that `add_working_days` lacked a loop guard are historical, not current evidence. This version retains the key design rationale while replacing outdated inventory and validation claims. `works/ERD Diagram.html` is an earlier conceptual mockup, not the maintained Chapter 3 current-model ERD.

SRS defines required data behavior; Prisma and migrations define the persisted implementation. A table's existence does not mean the corresponding workflow or provisional policy has been approved. In particular, `Closure` exists but the MVP stops at `PENDING_CLOSURE`; `StageDeadlineSetting`, `WorkingCalendar` and `SystemSetting` exist but do not establish approved automatic deadlines or near-due thresholds.

## 2. Inventory of all 38 models

PK and unique columns below are Prisma declarations; additional SQL constraints appear in §5. FK lists show persisted relationships, including actor references where important. `—` means no extra FK/unique. This is an entity-level inventory, not a scalar-field dump.

### A. Identity / Authorization — 3 models

| Prisma model → DB table | Purpose | PK | Main FK / relationship | Important unique |
| :--- | :--- | :--- | :--- | :--- |
| `Department` → `department` | Unit for ownership and auditor independence | `id` | — | `code` |
| `User` → `app_user` | Account/actor, optionally in one unit | `id` | `departmentId→Department` | `username`, `email` |
| `UserRole` → `user_role` | Assigned roles and assigner | `id` | `userId→User`, `assignedById→User` | `(userId,role)` |

### B. Documents / Versions / Files — 4 models

| Prisma model → DB table | Purpose | PK | Main FK / relationship | Important unique |
| :--- | :--- | :--- | :--- | :--- |
| `Document` → `document` | Single controlled-document register | `id` | `departmentId→Department`, `ownerUserId→User` | `documentCode` |
| `DocumentVersion` → `document_version` | Issue/revision and publication | `id` | `documentId→Document`, `publishedById→User`, `originatingDarId→Dar`, `supersededById→DocumentVersion` | `supersededById` |
| `DocumentFile` → `document_file` | Published-version file metadata | `id` | `versionId→DocumentVersion`, `uploadedById→User` | `storagePath`, `sha256` |
| `DocumentImportSource` → `document_import_source` | Import provenance and rerun identity | `id` | `fileId→DocumentFile` | `sourcePath` |

### C. DAR — 7 models

| Prisma model → DB table | Purpose | PK | Main FK / relationship | Important unique |
| :--- | :--- | :--- | :--- | :--- |
| `Dar` → `dar` | Request, current draft, assignments and logistics | `id` | `requesterId→User`, `closedById→User` | `darNo`, `(buddhistYear,sequenceNo)` |
| `DarTargetItem` → `dar_target_item` | Published target document/version | `id` | `darId→Dar`, `documentId→Document`, `versionId→DocumentVersion` | — |
| `DarRound` → `dar_round` | Immutable submitted-round snapshot | `id` | `darId→Dar` | `(darId,roundNo)` |
| `DarFile` → `dar_file` | Draft and logistics files before publication | `id` | `darId→Dar`, `uploadedById→User (SQL FK)` | `storagePath` |
| `DarDecision` → `dar_decision` | Intake/review/approval per round | `id` | `darId→Dar`, `decidedById→User` | — |
| `DarStatusHistory` → `dar_status_history` | Append-only DAR transitions | `id` | `darId→Dar`, `actorUserId→User` | — |
| `DistributionEntry` → `distribution_entry` | Copy/holder register for a version | `id` | `versionId→DocumentVersion`, `holderUserId→User` | `(versionId,copyNo)` |

### D. Acknowledgement — 2 models

| Prisma model → DB table | Purpose | PK | Main FK / relationship | Important unique |
| :--- | :--- | :--- | :--- | :--- |
| `AcknowledgementAssignment` → `acknowledgement_assignment` | Assignee for one version | `id` | `versionId→DocumentVersion`, `assigneeId→User`, `assignedById→User` | `(versionId,assigneeId)` |
| `AcknowledgementConfirmation` → `acknowledgement_confirmation` | Explicit acknowledgement of assignment | `id` | `assignmentId→AcknowledgementAssignment`, `confirmedById→User` | `assignmentId` |

### E. Records / Evidence — 3 models

| Prisma model → DB table | Purpose | PK | Main FK / relationship | Important unique |
| :--- | :--- | :--- | :--- | :--- |
| `RecordType` → `record_type` | Configurable Record category | `id` | — | `code` |
| `QualityRecord` → `quality_record` | Record with optional document link | `id` | `recordTypeId→RecordType`, `ownerUserId→User`, `departmentId→Department`, `documentId→Document`, `createdById→User` | — |
| `Evidence` → `evidence` | File evidence linked to work | `id` | `uploadedById→User`, `recordId→QualityRecord`, `findingId→Finding`, `requestId→CorrectiveRequest`, `activityId→ActionPlanActivity` | `storagePath` |

### F. Audit / Finding — 3 models

| Prisma model → DB table | Purpose | PK | Main FK / relationship | Important unique |
| :--- | :--- | :--- | :--- | :--- |
| `AuditRound` → `audit_round` | Audit scope, criteria and target unit | `id` | `targetDepartmentId→Department`, `createdById→User` | — |
| `AuditRoundMember` → `audit_round_member` | Auditor/Lead membership and waiver | `id` | `auditRoundId→AuditRound`, `auditorUserId→User`, `waivedById→User` | `(auditRoundId,auditorUserId)` |
| `Finding` → `finding` | Five-source finding and references | `id` | `auditRoundId→AuditRound`, `departmentId→Department`, `documentId→Document`, `recordId→QualityRecord`, `recurrenceOfId→Finding`, `identifiedById→User` | — |

### G. CAR / NCR — 10 models

| Prisma model → DB table | Purpose | PK | Main FK / relationship | Important unique |
| :--- | :--- | :--- | :--- | :--- |
| `CorrectiveRequest` → `corrective_request` | CAR/NCR request and real status | `id` | `findingId→Finding`, `departmentId→Department`, `ownerUserId→User`, `openedById→User` | `requestNo`, `(buddhistYear,sequenceNo)` |
| `RequestStatusHistory` → `request_status_history` | Transition and optional stage due date | `id` | `requestId→CorrectiveRequest`, `actorUserId→User` | — |
| `Correction` → `correction` | Immediate correction | `id` | `requestId→CorrectiveRequest`, `recordedById→User` | — |
| `RootCauseAnalysis` → `root_cause_analysis` | Root-cause result | `id` | `requestId→CorrectiveRequest`, `recordedById→User` | — |
| `ActionPlan` → `action_plan` | Versioned corrective/preventive plan | `id` | `requestId→CorrectiveRequest`, `submittedById→User` | `(requestId,revision)` |
| `ActionPlanActivity` → `action_plan_activity` | Responsible action and due/completed dates | `id` | `planId→ActionPlan`, `responsibleUserId→User` | — |
| `ActivityRecordLink` → `activity_record_link` | Reuse a Record for a plan activity | `(activityId,recordId)` | `activityId→ActionPlanActivity`, `recordId→QualityRecord` | — |
| `PlanApproval` → `plan_approval` | Decision on a specific plan revision | `id` | `planId→ActionPlan`, `decidedById→User` | — |
| `Verification` → `verification` | Effectiveness verification | `id` | `requestId→CorrectiveRequest`, `verifiedById→User` | — |
| `Closure` → `closure` | Persisted closure support; deferred workflow | `id` | `requestId→CorrectiveRequest`, `verificationId→Verification`, `closedById→User` | `requestId`, `verificationId` |

### H. Shared Audit / Sequence / Settings — 6 models

| Prisma model → DB table | Purpose | PK | Main FK / relationship | Important unique |
| :--- | :--- | :--- | :--- | :--- |
| `AuditEvent` → `audit_event` | Cross-domain append-only event | `id` | `actorUserId→User` | — |
| `WorkingCalendar` → `working_calendar` | Working-day calendar; policy not active | `calendarDate` | — | — |
| `StageDeadlineSetting` → `stage_deadline_setting` | Prepared stage defaults; policy TBD | `id` | — | `(status,effectiveFrom)` |
| `SystemSetting` → `system_setting` | Settings including provisional near-due | `key` | `updatedById→User` | — |
| `NumberSequence` → `number_sequence` | DAR/request number by series/year | `(series,buddhistYear)` | — | — |
| `DocumentCodeSequence` → `document_code_sequence` | Document-code counter by key | `key` | — | — |

**Domain notes.** A: the active role belongs to session behavior, not a `UserRole` column; current demo switches persons (UC-B-01 full-SRS gap). B: `DocumentVersion` links to its source DAR optionally and supports version supersession; `DocumentImportSource` identifies original imported files. C: `DarFile` can be uploaded before `DarRound` is created on submit, so (`dar_id`, `round_no`) is a **logical** round association, not a file-to-round FK. `DarDecision.round_no` is likewise a scalar; DAR logistics are in `Dar.logistics` JSON with file IDs and in `DistributionEntry` after publication. D: holding a copy is separate from acknowledging its content. E/F: `Evidence` has nullable links to Record, Finding, Request and Activity; a SQL CHECK requires at least one. Internal Audit Findings attach a round; other sources need not. G: `ActivityRecordLink` reuses a Record without copying its Evidence; `Closure` is dormant in current MVP. H: `AuditEvent.entity_type/entity_id` is polymorphic metadata, not a database FK to every entity.

## 3. Comparison with 33-table ERD v0.1

Allowed status vocabulary: `ALIGNED`, `IMPLEMENTATION REFINEMENT`, `DOCUMENTATION OUTDATED`, `POTENTIAL DATA MODEL DISCREPANCY`. The five additions are refinements, not confirmed requirement defects. There is no removed prior table.

| Current Prisma Model | Existing ERD/Table | Status | Action |
| :--- | :--- | :--- | :--- |
| `Department` | `department` | ALIGNED | Retain current entity and relationship. |
| `User` | `app_user` | ALIGNED | Retain current entity and relationship. |
| `UserRole` | `user_role` | ALIGNED | Retain current entity and relationship. |
| `AuditEvent` | `audit_event` | ALIGNED | Retain current entity and relationship. |
| `WorkingCalendar` | `working_calendar` | DOCUMENTATION OUTDATED | Mark calendar persisted but automatic defaults unapproved. |
| `RecordType` | `record_type` | ALIGNED | Retain current entity and relationship. |
| `StageDeadlineSetting` | `stage_deadline_setting` | DOCUMENTATION OUTDATED | Mark stage defaults as policy TBD, not active behavior. |
| `SystemSetting` | `system_setting` | DOCUMENTATION OUTDATED | Mark near-due setting as provisional, not accepted. |
| `NumberSequence` | `number_sequence` | ALIGNED | Retain current entity and relationship. |
| `Document` | `document` | ALIGNED | Retain current entity and relationship. |
| `DocumentVersion` | `document_version` | DOCUMENTATION OUTDATED | Show review/source-confirmation fields and current SQL uniqueness. |
| `DocumentFile` | `document_file` | ALIGNED | Retain current entity and relationship. |
| `DocumentImportSource` | — | IMPLEMENTATION REFINEMENT | Add import provenance with unique source path. |
| `Dar` | `dar` | DOCUMENTATION OUTDATED | Show current JSON draft, assignments and logistics. |
| `DarTargetItem` | `dar_target_item` | ALIGNED | Retain current entity and relationship. |
| `DarDecision` | `dar_decision` | DOCUMENTATION OUTDATED | Show round number; no FK to DarRound. |
| `DarStatusHistory` | `dar_status_history` | ALIGNED | Retain current entity and relationship. |
| `DistributionEntry` | `distribution_entry` | ALIGNED | Retain current entity and relationship. |
| `AcknowledgementAssignment` | `acknowledgement_assignment` | ALIGNED | Retain current entity and relationship. |
| `AcknowledgementConfirmation` | `acknowledgement_confirmation` | ALIGNED | Retain current entity and relationship. |
| `QualityRecord` | `quality_record` | ALIGNED | Retain current entity and relationship. |
| `Evidence` | `evidence` | ALIGNED | Retain current entity and relationship. |
| `AuditRound` | `audit_round` | ALIGNED | Retain current entity and relationship. |
| `AuditRoundMember` | `audit_round_member` | ALIGNED | Retain current entity and relationship. |
| `Finding` | `finding` | ALIGNED | Retain current entity and relationship. |
| `CorrectiveRequest` | `corrective_request` | DOCUMENTATION OUTDATED | Distinguish overall due from current work due. |
| `RequestStatusHistory` | `request_status_history` | DOCUMENTATION OUTDATED | Show nullable, nonautomated stage due date. |
| `Correction` | `correction` | ALIGNED | Retain current entity and relationship. |
| `RootCauseAnalysis` | `root_cause_analysis` | ALIGNED | Retain current entity and relationship. |
| `ActionPlan` | `action_plan` | ALIGNED | Retain current entity and relationship. |
| `ActionPlanActivity` | `action_plan_activity` | ALIGNED | Retain current entity and relationship. |
| `ActivityRecordLink` | — | IMPLEMENTATION REFINEMENT | Add composite-key activity-to-Record reuse. |
| `PlanApproval` | `plan_approval` | ALIGNED | Retain current entity and relationship. |
| `Verification` | `verification` | ALIGNED | Retain current entity and relationship. |
| `Closure` | `closure` | DOCUMENTATION OUTDATED | Mark table present but current close action deferred. |
| `DarRound` | — | IMPLEMENTATION REFINEMENT | Add submitted snapshot and unique DAR/round number. |
| `DarFile` | — | IMPLEMENTATION REFINEMENT | Add prepublication/logistics files linked to DAR; round number is logical. |
| `DocumentCodeSequence` | — | IMPLEMENTATION REFINEMENT | Add document-code counter separate from DAR/request numbering. |

No previously documented table was removed. Reclassified descriptions: `closure` is persisted but its final-close workflow is deferred; deadline settings/calendar are persisted but their policy is TBD; `request_due_status` exists as a view but does not cover current-plan activity dates. The older conceptual mockup is not a competing current schema source.

## 4. End-to-end relationships and ownership

| Path | Actual persisted relationship / boundary |
| :--- | :--- |
| Document → Version → File | `document_version.document_id`, `document_file.version_id`; optional `originating_dar_id` and supersession; import provenance via `document_import_source.file_id`. |
| DAR → round/files/decisions/history | `dar_round.dar_id` with unique (`dar_id`,`round_no`); `dar_file.dar_id`; `dar_decision.dar_id`; `dar_status_history.dar_id`. File/decision round numbers are logical; no FK to `dar_round`. |
| DAR → published Version → logistics | `document_version.originating_dar_id`; `dar_target_item` links target Document/Version; `Dar.logistics` JSON + `DarFile(kind)` hold evidence; `distribution_entry.version_id` holds copy/holder data. |
| Version → acknowledgement | `acknowledgement_assignment.version_id`; unique version/assignee; `acknowledgement_confirmation.assignment_id` unique (0..1). Authorized file-access AuditEvent is a service prerequisite, not the confirmation row. |
| Record → Evidence / Document | `quality_record.document_id?` is a reference to the one Document register; `evidence.record_id?`; Finding and ActivityRecordLink may reuse the Record. |
| AuditRound → Member / Finding | `audit_round_member.audit_round_id`; `finding.audit_round_id?`; Finding can reference Document, QualityRecord, Evidence and a prior Finding. |
| Finding → CorrectiveRequest | `corrective_request.finding_id`; SQL partial unique permits no more than one non-CLOSED request per Finding. |
| Request → Correction / RootCause / Plan / Activity | Child FKs to request/plan; `plan_approval.plan_id` targets a revision; `evidence.activity_id?` and `activity_record_link` connect new/reused evidence. |
| Request → Verification / History / Closure | `verification.request_id`, `request_status_history.request_id`; `closure.request_id`/`verification_id` are persisted support for deferred final closure. |
| Dashboard | Aggregates six domain reads after role scope; no dashboard table or duplicate registry. |

## 5. Constraints, refinements and policy limits

- **Important unique/PK:** document code; issue/revision and one published version per Document (SQL partial unique); file paths; DAR/request number by year; DarRound number per DAR; DistributionEntry copy per Version; assignment per Version/assignee; confirmation per assignment; one current plan per Request (SQL partial unique); one open Request per Finding (SQL partial unique); ActivityRecordLink composite PK. See migration DDL for exact predicates.
- **Other SQL enforcement:** Evidence at least one owner; DAR `OTHER` description; DarFile `kind` check; append-only triggers for `audit_event`, DAR/Request status histories, DarRound, DarDecision and DarFile. These supplement Prisma. Actor separation and workflow transitions remain service rules.
- **Five legitimate refinements:** `DocumentImportSource` preserves file import provenance and unique rerun identity; `DarRound` freezes submitted snapshots; `DarFile` retains draft/distribution/recall PDFs before publication; `ActivityRecordLink` reuses QualityRecord evidence for a plan activity; `DocumentCodeSequence` allocates controlled-document codes independently of `NumberSequence` DAR/CAR numbering.
- **Due-date distinction:** `CorrectiveRequest.overallDueDate` is the whole-request reference. Current-MVP overdue derives from unfinished current-plan `ActionPlanActivity.dueDate` or an explicitly recorded current-stage `RequestStatusHistory.stageDueDate`; it is not stored and does not fall back to the overall date. `StageDeadlineSetting`/`WorkingCalendar` do not implement approved defaults (`TBD-B-09`). The SQL `request_due_status` view covers stage dates only and its near-due fallback of 2 working days remains provisional (`TBD-B-16`); the current service does not use it for overdue acceptance. `add_working_days` now has a 3650-iteration guard in the migration.
- **Deferred/policy:** `Closure` table is present but no current-MVP close command writes it (`TBD-B-24`); DCC-reporter substitute verifier remains `TBD-B-25`. The five-source Finding model does not decide CAR/NCR mappings for unresolved sources.
- **POTENTIAL DATA MODEL DISCREPANCY — metadata only:** the `dar_file.uploaded_by` FK to `app_user` is enforced by `20260920000100_dar_workflow/migration.sql`, while Prisma `DarFile.uploadedById` has no declared `User` relation. No confirmed requirement contradiction or persisted referential-integrity failure is evidenced; review ORM metadata in a separate schema task. Do not infer a file-to-DarRound FK.

## 6. Domain → Use Case traceability

| Domain / entity group | Main Use Cases |
| :--- | :--- |
| Identity / Authorization / AuditEvent | UC-B-01–B-03 and access/audit context for all UCs; B-02/B-03 management/search deferred |
| Documents / DAR / DistributionEntry | UC-A-01–A-08, A-11–A-12; A-07 cancellation deferred |
| Acknowledgement | UC-A-09–A-10 |
| Records / Evidence | UC-B-04–B-05, B-07, B-11 |
| Audit / Finding | UC-B-06–B-08 |
| CAR / NCR | UC-B-08–B-14; B-13 final closure deferred, B-12 DCC-reporter branch TBD |
| Dashboard | UC-B-15; derived aggregates, no storage model |
| Export | UC-B-16 deferred; no export table implied |

## 7. Validation and next review

This inventory was reconciled against 38 Prisma model declarations and the five migrations. The Chapter 3 maintained ERD `.html` sources and exported `.svg`/`.png` account for all current tables; the master is for on-screen overview and domain figures are for thesis insertion. No migration, schema, seed or production database was changed in this documentation task. No confirmed SRS-to-persisted-model contradiction was found; the DarFile Prisma/migration metadata gap above remains visible for later review. Next: final traceability/verification review, then Chapter 4 alignment.
