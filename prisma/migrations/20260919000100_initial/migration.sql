-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "RoleCode" AS ENUM ('SPONSOR', 'ISO_QA_ADMIN', 'DOC_OWNER', 'APPROVER', 'QMR', 'DEPUTY_QMR', 'SECTION_HEAD', 'END_USER', 'AUDITOR', 'LEAD_AUDITOR', 'ASSISTANT_DCC', 'CAR_OWNER', 'DEAN', 'REGISTRAR');

-- CreateEnum
CREATE TYPE "DocumentVersionStatus" AS ENUM ('DOC_DRAFT', 'DOC_PUBLISHED', 'DOC_OBSOLETE');

-- CreateEnum
CREATE TYPE "ImportReviewStatus" AS ENUM ('PENDING', 'VERIFIED');

-- CreateEnum
CREATE TYPE "DarStatus" AS ENUM ('DAR_DRAFT', 'DAR_AWAITING_INTAKE', 'DAR_AWAITING_REVIEW', 'DAR_AWAITING_APPROVAL', 'DAR_CHANGES_REQUESTED', 'DAR_APPROVED', 'DAR_REJECTED', 'DAR_DISTRIBUTING', 'DAR_RECALLING', 'DAR_CLOSED');

-- CreateEnum
CREATE TYPE "DarRequestType" AS ENUM ('NEW_DOCUMENT', 'HOLD_COPY', 'REVISE', 'CANCEL_HOLD', 'OBSOLETE_DOCUMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "DarDecisionStep" AS ENUM ('INTAKE', 'REVIEW', 'APPROVAL');

-- CreateEnum
CREATE TYPE "DarDecisionResult" AS ENUM ('ACCEPTED', 'CHANGES_REQUESTED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "FindingType" AS ENUM ('NONCONFORMITY', 'OBSERVATION', 'IMPROVEMENT_SUGGESTION');

-- CreateEnum
CREATE TYPE "FindingSeverity" AS ENUM ('MAJOR', 'MINOR', 'OB');

-- CreateEnum
CREATE TYPE "FindingSource" AS ENUM ('INTERNAL_AUDIT', 'EXTERNAL_AUDIT', 'MANAGEMENT_REVIEW', 'COMPLAINT', 'IMPROVEMENT_PROPOSAL');

-- CreateEnum
CREATE TYPE "FindingStatus" AS ENUM ('FINDING_OPEN', 'FINDING_CLOSED');

-- CreateEnum
CREATE TYPE "RequestType" AS ENUM ('CAR', 'NCR');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('OPEN', 'CORRECTION', 'ANALYSIS_PLANNING', 'PENDING_PLAN_APPROVAL', 'IMPLEMENTING', 'PENDING_VERIFICATION', 'PENDING_CLOSURE', 'CLOSED');

-- CreateEnum
CREATE TYPE "CauseCategory" AS ENUM ('PERSON', 'PROCESS', 'SUPPORT', 'OTHER');

-- CreateEnum
CREATE TYPE "PlanTimeframe" AS ENUM ('IMMEDIATE_OR_10_DAYS', 'WITHIN_30_DAYS_WITH_REPORT', 'FOLLOW_UP_NEXT_AUDIT');

-- CreateEnum
CREATE TYPE "ActionKind" AS ENUM ('CORRECTIVE', 'PREVENTIVE');

-- CreateEnum
CREATE TYPE "PlanApprovalResult" AS ENUM ('PLAN_APPROVED', 'PLAN_REJECTED');

-- CreateEnum
CREATE TYPE "VerificationResult" AS ENUM ('EFFECTIVE', 'NOT_EFFECTIVE');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'STATUS_CHANGE', 'ATTACH_EVIDENCE', 'ACKNOWLEDGE', 'LOGIN', 'ROLE_SWITCH', 'PERMISSION_DENIED', 'EXPORT', 'INDEPENDENCE_WAIVER');

-- CreateEnum
CREATE TYPE "NumberSeries" AS ENUM ('DAR', 'CAR', 'NCR');

-- CreateTable
CREATE TABLE "department" (
    "id" UUID NOT NULL,
    "code" VARCHAR(32) NOT NULL,
    "name_th" VARCHAR(200) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_user" (
    "id" UUID NOT NULL,
    "username" VARCHAR(100) NOT NULL,
    "full_name" VARCHAR(200) NOT NULL,
    "position" VARCHAR(200),
    "email" VARCHAR(200),
    "password_hash" VARCHAR(255) NOT NULL,
    "department_id" UUID,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "app_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_role" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "RoleCode" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "assigned_by" UUID,
    "assigned_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_event" (
    "id" UUID NOT NULL,
    "actor_user_id" UUID,
    "actor_role" "RoleCode",
    "action" "AuditAction" NOT NULL,
    "entity_type" VARCHAR(64) NOT NULL,
    "entity_id" UUID,
    "status_before" VARCHAR(64),
    "status_after" VARCHAR(64),
    "before_value" JSONB,
    "after_value" JSONB,
    "reason" TEXT,
    "occurred_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "working_calendar" (
    "calendar_date" DATE NOT NULL,
    "is_working_day" BOOLEAN NOT NULL,
    "note" VARCHAR(200),

    CONSTRAINT "working_calendar_pkey" PRIMARY KEY ("calendar_date")
);

-- CreateTable
CREATE TABLE "record_type" (
    "id" UUID NOT NULL,
    "code" VARCHAR(32) NOT NULL,
    "name_th" VARCHAR(200) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "record_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stage_deadline_setting" (
    "id" UUID NOT NULL,
    "status" "RequestStatus" NOT NULL,
    "standard_working_days" INTEGER NOT NULL,
    "counts_from" VARCHAR(120) NOT NULL,
    "effective_from" DATE NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "note" TEXT,

    CONSTRAINT "stage_deadline_setting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_setting" (
    "key" VARCHAR(100) NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "updated_by" UUID,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "system_setting_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "number_sequence" (
    "series" "NumberSeries" NOT NULL,
    "buddhist_year" INTEGER NOT NULL,
    "last_number" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "number_sequence_pkey" PRIMARY KEY ("series","buddhist_year")
);

-- CreateTable
CREATE TABLE "document" (
    "id" UUID NOT NULL,
    "document_code" VARCHAR(64),
    "title" VARCHAR(300) NOT NULL,
    "doc_type" VARCHAR(64),
    "department_id" UUID,
    "owner_user_id" UUID,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_version" (
    "id" UUID NOT NULL,
    "document_id" UUID NOT NULL,
    "issue_no" INTEGER,
    "revision_no" INTEGER,
    "status" "DocumentVersionStatus",
    "review_status" "ImportReviewStatus" NOT NULL DEFAULT 'PENDING',
    "review_notes" TEXT,
    "effective_date" DATE,
    "published_at" TIMESTAMPTZ(6),
    "published_by" UUID,
    "originating_dar_id" UUID,
    "superseded_by_version_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "document_version_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_file" (
    "id" UUID NOT NULL,
    "version_id" UUID NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "mime_type" VARCHAR(120) NOT NULL,
    "size_bytes" BIGINT NOT NULL,
    "storage_path" VARCHAR(500) NOT NULL,
    "sha256" VARCHAR(64) NOT NULL,
    "uploaded_by" UUID NOT NULL,
    "uploaded_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_file_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_import_source" (
    "id" UUID NOT NULL,
    "source_path" TEXT NOT NULL,
    "source_hash" VARCHAR(64) NOT NULL,
    "file_id" UUID NOT NULL,
    "imported_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_import_source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dar" (
    "id" UUID NOT NULL,
    "dar_no" VARCHAR(20) NOT NULL,
    "buddhist_year" INTEGER NOT NULL,
    "sequence_no" INTEGER NOT NULL,
    "request_type" "DarRequestType" NOT NULL,
    "other_description" TEXT,
    "requester_user_id" UUID NOT NULL,
    "reason" TEXT NOT NULL,
    "has_attachment" BOOLEAN NOT NULL DEFAULT false,
    "effective_date" DATE,
    "status" "DarStatus" NOT NULL DEFAULT 'DAR_DRAFT',
    "submitted_at" TIMESTAMPTZ(6),
    "intake_at" TIMESTAMPTZ(6),
    "distributed_at" TIMESTAMPTZ(6),
    "recalled_at" TIMESTAMPTZ(6),
    "closed_at" TIMESTAMPTZ(6),
    "closed_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "dar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dar_target_item" (
    "id" UUID NOT NULL,
    "dar_id" UUID NOT NULL,
    "document_id" UUID,
    "version_id" UUID,
    "note" TEXT,

    CONSTRAINT "dar_target_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dar_decision" (
    "id" UUID NOT NULL,
    "dar_id" UUID NOT NULL,
    "step" "DarDecisionStep" NOT NULL,
    "result" "DarDecisionResult" NOT NULL,
    "decided_by" UUID NOT NULL,
    "actor_role" "RoleCode" NOT NULL,
    "comment" TEXT,
    "decided_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dar_decision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dar_status_history" (
    "id" UUID NOT NULL,
    "dar_id" UUID NOT NULL,
    "from_status" "DarStatus",
    "to_status" "DarStatus" NOT NULL,
    "actor_user_id" UUID NOT NULL,
    "actor_role" "RoleCode" NOT NULL,
    "reason" TEXT,
    "occurred_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dar_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "distribution_entry" (
    "id" UUID NOT NULL,
    "version_id" UUID NOT NULL,
    "copy_no" VARCHAR(32) NOT NULL,
    "holder_user_id" UUID,
    "holder_position" VARCHAR(200) NOT NULL,
    "holder_name" VARCHAR(200) NOT NULL,
    "received_date" DATE,
    "signed_receipt" BOOLEAN NOT NULL DEFAULT false,
    "returned_date" DATE,

    CONSTRAINT "distribution_entry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "acknowledgement_assignment" (
    "id" UUID NOT NULL,
    "version_id" UUID NOT NULL,
    "assignee_user_id" UUID NOT NULL,
    "assigned_by" UUID NOT NULL,
    "assigned_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "due_date" DATE,

    CONSTRAINT "acknowledgement_assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "acknowledgement_confirmation" (
    "id" UUID NOT NULL,
    "assignment_id" UUID NOT NULL,
    "confirmed_by" UUID NOT NULL,
    "confirmed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "acknowledgement_confirmation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quality_record" (
    "id" UUID NOT NULL,
    "record_type_id" UUID NOT NULL,
    "title" VARCHAR(300) NOT NULL,
    "record_date" DATE NOT NULL,
    "owner_user_id" UUID NOT NULL,
    "department_id" UUID,
    "document_id" UUID,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "quality_record_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evidence" (
    "id" UUID NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "mime_type" VARCHAR(120) NOT NULL,
    "size_bytes" BIGINT NOT NULL,
    "storage_path" VARCHAR(500) NOT NULL,
    "uploaded_by" UUID NOT NULL,
    "uploaded_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "record_id" UUID,
    "finding_id" UUID,
    "request_id" UUID,
    "activity_id" UUID,

    CONSTRAINT "evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_round" (
    "id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "objective" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "criteria" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "target_department_id" UUID NOT NULL,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "audit_round_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_round_member" (
    "id" UUID NOT NULL,
    "audit_round_id" UUID NOT NULL,
    "auditor_user_id" UUID NOT NULL,
    "is_lead" BOOLEAN NOT NULL DEFAULT false,
    "independence_waived" BOOLEAN NOT NULL DEFAULT false,
    "waiver_reason" TEXT,
    "waived_by" UUID,
    "assigned_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_round_member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finding" (
    "id" UUID NOT NULL,
    "audit_round_id" UUID,
    "source" "FindingSource" NOT NULL,
    "finding_type" "FindingType" NOT NULL,
    "severity" "FindingSeverity" NOT NULL,
    "description" TEXT NOT NULL,
    "violated_requirement" TEXT NOT NULL,
    "status" "FindingStatus" NOT NULL DEFAULT 'FINDING_OPEN',
    "department_id" UUID,
    "document_id" UUID,
    "record_id" UUID,
    "recurrence_of_finding_id" UUID,
    "identified_date" DATE NOT NULL,
    "identified_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "finding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "corrective_request" (
    "id" UUID NOT NULL,
    "request_no" VARCHAR(20) NOT NULL,
    "buddhist_year" INTEGER NOT NULL,
    "sequence_no" INTEGER NOT NULL,
    "request_type" "RequestType" NOT NULL,
    "finding_id" UUID NOT NULL,
    "department_id" UUID NOT NULL,
    "severity" "FindingSeverity" NOT NULL,
    "round_label" VARCHAR(64),
    "cause_category" "CauseCategory",
    "related_doc_refs" TEXT,
    "plan_timeframe" "PlanTimeframe",
    "owner_user_id" UUID,
    "current_status" "RequestStatus" NOT NULL DEFAULT 'OPEN',
    "overall_due_date" DATE,
    "opened_by" UUID NOT NULL,
    "opened_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "corrective_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "request_status_history" (
    "id" UUID NOT NULL,
    "request_id" UUID NOT NULL,
    "from_status" "RequestStatus",
    "to_status" "RequestStatus" NOT NULL,
    "action" VARCHAR(120) NOT NULL,
    "actor_user_id" UUID NOT NULL,
    "actor_role" "RoleCode" NOT NULL,
    "reason" TEXT,
    "stage_due_date" DATE,
    "occurred_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "request_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "correction" (
    "id" UUID NOT NULL,
    "request_id" UUID NOT NULL,
    "detail" TEXT NOT NULL,
    "recorded_by" UUID NOT NULL,
    "recorded_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "correction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "root_cause_analysis" (
    "id" UUID NOT NULL,
    "request_id" UUID NOT NULL,
    "root_cause" TEXT NOT NULL,
    "technique" VARCHAR(200) NOT NULL,
    "recorded_by" UUID NOT NULL,
    "recorded_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "root_cause_analysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "action_plan" (
    "id" UUID NOT NULL,
    "request_id" UUID NOT NULL,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "corrective_summary" TEXT NOT NULL,
    "preventive_summary" TEXT NOT NULL,
    "is_current" BOOLEAN NOT NULL DEFAULT true,
    "submitted_by" UUID NOT NULL,
    "submitted_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "action_plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "action_plan_activity" (
    "id" UUID NOT NULL,
    "plan_id" UUID NOT NULL,
    "kind" "ActionKind" NOT NULL,
    "description" TEXT NOT NULL,
    "responsible_user_id" UUID NOT NULL,
    "due_date" DATE NOT NULL,
    "completed_at" TIMESTAMPTZ(6),
    "result_note" TEXT,

    CONSTRAINT "action_plan_activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_approval" (
    "id" UUID NOT NULL,
    "plan_id" UUID NOT NULL,
    "result" "PlanApprovalResult" NOT NULL,
    "decided_by" UUID NOT NULL,
    "actor_role" "RoleCode" NOT NULL,
    "reason" TEXT,
    "decided_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plan_approval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" UUID NOT NULL,
    "request_id" UUID NOT NULL,
    "result" "VerificationResult" NOT NULL,
    "comment" TEXT NOT NULL,
    "verified_by" UUID NOT NULL,
    "actor_role" "RoleCode" NOT NULL,
    "verified_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "closure" (
    "id" UUID NOT NULL,
    "request_id" UUID NOT NULL,
    "verification_id" UUID NOT NULL,
    "closed_by" UUID NOT NULL,
    "actor_role" "RoleCode" NOT NULL,
    "note" TEXT,
    "closed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "closure_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "department_code_key" ON "department"("code");

-- CreateIndex
CREATE UNIQUE INDEX "app_user_username_key" ON "app_user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "app_user_email_key" ON "app_user"("email");

-- CreateIndex
CREATE INDEX "app_user_department_id_idx" ON "app_user"("department_id");

-- CreateIndex
CREATE INDEX "user_role_role_idx" ON "user_role"("role");

-- CreateIndex
CREATE UNIQUE INDEX "user_role_user_id_role_key" ON "user_role"("user_id", "role");

-- CreateIndex
CREATE INDEX "audit_event_entity_type_entity_id_idx" ON "audit_event"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_event_occurred_at_idx" ON "audit_event"("occurred_at");

-- CreateIndex
CREATE INDEX "audit_event_actor_user_id_idx" ON "audit_event"("actor_user_id");

-- CreateIndex
CREATE INDEX "working_calendar_is_working_day_idx" ON "working_calendar"("is_working_day");

-- CreateIndex
CREATE UNIQUE INDEX "record_type_code_key" ON "record_type"("code");

-- CreateIndex
CREATE UNIQUE INDEX "stage_deadline_setting_status_effective_from_key" ON "stage_deadline_setting"("status", "effective_from");

-- CreateIndex
CREATE UNIQUE INDEX "document_document_code_key" ON "document"("document_code");

-- CreateIndex
CREATE INDEX "document_department_id_idx" ON "document"("department_id");

-- CreateIndex
CREATE UNIQUE INDEX "document_version_superseded_by_version_id_key" ON "document_version"("superseded_by_version_id");

-- CreateIndex
CREATE INDEX "document_version_document_id_issue_no_revision_no_idx" ON "document_version"("document_id", "issue_no", "revision_no");

-- CreateIndex
CREATE INDEX "document_version_document_id_status_idx" ON "document_version"("document_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "document_file_storage_path_key" ON "document_file"("storage_path");

-- CreateIndex
CREATE UNIQUE INDEX "document_file_sha256_key" ON "document_file"("sha256");

-- CreateIndex
CREATE INDEX "document_file_version_id_idx" ON "document_file"("version_id");

-- CreateIndex
CREATE UNIQUE INDEX "document_import_source_source_path_key" ON "document_import_source"("source_path");

-- CreateIndex
CREATE UNIQUE INDEX "dar_dar_no_key" ON "dar"("dar_no");

-- CreateIndex
CREATE INDEX "dar_status_idx" ON "dar"("status");

-- CreateIndex
CREATE INDEX "dar_requester_user_id_idx" ON "dar"("requester_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "dar_buddhist_year_sequence_no_key" ON "dar"("buddhist_year", "sequence_no");

-- CreateIndex
CREATE INDEX "dar_target_item_dar_id_idx" ON "dar_target_item"("dar_id");

-- CreateIndex
CREATE INDEX "dar_decision_dar_id_step_idx" ON "dar_decision"("dar_id", "step");

-- CreateIndex
CREATE INDEX "dar_status_history_dar_id_occurred_at_idx" ON "dar_status_history"("dar_id", "occurred_at");

-- CreateIndex
CREATE INDEX "distribution_entry_version_id_idx" ON "distribution_entry"("version_id");

-- CreateIndex
CREATE UNIQUE INDEX "distribution_entry_version_id_copy_no_key" ON "distribution_entry"("version_id", "copy_no");

-- CreateIndex
CREATE UNIQUE INDEX "acknowledgement_assignment_version_id_assignee_user_id_key" ON "acknowledgement_assignment"("version_id", "assignee_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "acknowledgement_confirmation_assignment_id_key" ON "acknowledgement_confirmation"("assignment_id");

-- CreateIndex
CREATE INDEX "quality_record_record_type_id_idx" ON "quality_record"("record_type_id");

-- CreateIndex
CREATE INDEX "quality_record_record_date_idx" ON "quality_record"("record_date");

-- CreateIndex
CREATE UNIQUE INDEX "evidence_storage_path_key" ON "evidence"("storage_path");

-- CreateIndex
CREATE INDEX "evidence_record_id_idx" ON "evidence"("record_id");

-- CreateIndex
CREATE INDEX "evidence_finding_id_idx" ON "evidence"("finding_id");

-- CreateIndex
CREATE INDEX "evidence_request_id_idx" ON "evidence"("request_id");

-- CreateIndex
CREATE INDEX "audit_round_start_date_idx" ON "audit_round"("start_date");

-- CreateIndex
CREATE UNIQUE INDEX "audit_round_member_audit_round_id_auditor_user_id_key" ON "audit_round_member"("audit_round_id", "auditor_user_id");

-- CreateIndex
CREATE INDEX "finding_audit_round_id_idx" ON "finding"("audit_round_id");

-- CreateIndex
CREATE INDEX "finding_severity_status_idx" ON "finding"("severity", "status");

-- CreateIndex
CREATE INDEX "finding_identified_date_idx" ON "finding"("identified_date");

-- CreateIndex
CREATE UNIQUE INDEX "corrective_request_request_no_key" ON "corrective_request"("request_no");

-- CreateIndex
CREATE INDEX "corrective_request_current_status_idx" ON "corrective_request"("current_status");

-- CreateIndex
CREATE INDEX "corrective_request_owner_user_id_idx" ON "corrective_request"("owner_user_id");

-- CreateIndex
CREATE INDEX "corrective_request_finding_id_idx" ON "corrective_request"("finding_id");

-- CreateIndex
CREATE UNIQUE INDEX "corrective_request_buddhist_year_sequence_no_key" ON "corrective_request"("buddhist_year", "sequence_no");

-- CreateIndex
CREATE INDEX "request_status_history_request_id_occurred_at_idx" ON "request_status_history"("request_id", "occurred_at");

-- CreateIndex
CREATE INDEX "correction_request_id_idx" ON "correction"("request_id");

-- CreateIndex
CREATE INDEX "root_cause_analysis_request_id_idx" ON "root_cause_analysis"("request_id");

-- CreateIndex
CREATE INDEX "action_plan_request_id_idx" ON "action_plan"("request_id");

-- CreateIndex
CREATE UNIQUE INDEX "action_plan_request_id_revision_key" ON "action_plan"("request_id", "revision");

-- CreateIndex
CREATE INDEX "action_plan_activity_plan_id_idx" ON "action_plan_activity"("plan_id");

-- CreateIndex
CREATE INDEX "action_plan_activity_due_date_idx" ON "action_plan_activity"("due_date");

-- CreateIndex
CREATE INDEX "plan_approval_plan_id_idx" ON "plan_approval"("plan_id");

-- CreateIndex
CREATE INDEX "verification_request_id_idx" ON "verification"("request_id");

-- CreateIndex
CREATE UNIQUE INDEX "closure_request_id_key" ON "closure"("request_id");

-- CreateIndex
CREATE UNIQUE INDEX "closure_verification_id_key" ON "closure"("verification_id");

-- AddForeignKey
ALTER TABLE "app_user" ADD CONSTRAINT "app_user_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "app_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "app_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_event" ADD CONSTRAINT "audit_event_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "app_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_setting" ADD CONSTRAINT "system_setting_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "app_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document" ADD CONSTRAINT "document_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document" ADD CONSTRAINT "document_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "app_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_version" ADD CONSTRAINT "document_version_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_version" ADD CONSTRAINT "document_version_published_by_fkey" FOREIGN KEY ("published_by") REFERENCES "app_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_version" ADD CONSTRAINT "document_version_originating_dar_id_fkey" FOREIGN KEY ("originating_dar_id") REFERENCES "dar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_version" ADD CONSTRAINT "document_version_superseded_by_version_id_fkey" FOREIGN KEY ("superseded_by_version_id") REFERENCES "document_version"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_file" ADD CONSTRAINT "document_file_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "document_version"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_file" ADD CONSTRAINT "document_file_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "app_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_import_source" ADD CONSTRAINT "document_import_source_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "document_file"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dar" ADD CONSTRAINT "dar_requester_user_id_fkey" FOREIGN KEY ("requester_user_id") REFERENCES "app_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dar" ADD CONSTRAINT "dar_closed_by_fkey" FOREIGN KEY ("closed_by") REFERENCES "app_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dar_target_item" ADD CONSTRAINT "dar_target_item_dar_id_fkey" FOREIGN KEY ("dar_id") REFERENCES "dar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dar_target_item" ADD CONSTRAINT "dar_target_item_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dar_target_item" ADD CONSTRAINT "dar_target_item_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "document_version"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dar_decision" ADD CONSTRAINT "dar_decision_dar_id_fkey" FOREIGN KEY ("dar_id") REFERENCES "dar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dar_decision" ADD CONSTRAINT "dar_decision_decided_by_fkey" FOREIGN KEY ("decided_by") REFERENCES "app_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dar_status_history" ADD CONSTRAINT "dar_status_history_dar_id_fkey" FOREIGN KEY ("dar_id") REFERENCES "dar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dar_status_history" ADD CONSTRAINT "dar_status_history_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "app_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distribution_entry" ADD CONSTRAINT "distribution_entry_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "document_version"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distribution_entry" ADD CONSTRAINT "distribution_entry_holder_user_id_fkey" FOREIGN KEY ("holder_user_id") REFERENCES "app_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acknowledgement_assignment" ADD CONSTRAINT "acknowledgement_assignment_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "document_version"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acknowledgement_assignment" ADD CONSTRAINT "acknowledgement_assignment_assignee_user_id_fkey" FOREIGN KEY ("assignee_user_id") REFERENCES "app_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acknowledgement_assignment" ADD CONSTRAINT "acknowledgement_assignment_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "app_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acknowledgement_confirmation" ADD CONSTRAINT "acknowledgement_confirmation_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "acknowledgement_assignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acknowledgement_confirmation" ADD CONSTRAINT "acknowledgement_confirmation_confirmed_by_fkey" FOREIGN KEY ("confirmed_by") REFERENCES "app_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quality_record" ADD CONSTRAINT "quality_record_record_type_id_fkey" FOREIGN KEY ("record_type_id") REFERENCES "record_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quality_record" ADD CONSTRAINT "quality_record_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "app_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quality_record" ADD CONSTRAINT "quality_record_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quality_record" ADD CONSTRAINT "quality_record_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quality_record" ADD CONSTRAINT "quality_record_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "app_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "app_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_record_id_fkey" FOREIGN KEY ("record_id") REFERENCES "quality_record"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_finding_id_fkey" FOREIGN KEY ("finding_id") REFERENCES "finding"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "corrective_request"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "action_plan_activity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_round" ADD CONSTRAINT "audit_round_target_department_id_fkey" FOREIGN KEY ("target_department_id") REFERENCES "department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_round" ADD CONSTRAINT "audit_round_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "app_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_round_member" ADD CONSTRAINT "audit_round_member_audit_round_id_fkey" FOREIGN KEY ("audit_round_id") REFERENCES "audit_round"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_round_member" ADD CONSTRAINT "audit_round_member_auditor_user_id_fkey" FOREIGN KEY ("auditor_user_id") REFERENCES "app_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_round_member" ADD CONSTRAINT "audit_round_member_waived_by_fkey" FOREIGN KEY ("waived_by") REFERENCES "app_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finding" ADD CONSTRAINT "finding_audit_round_id_fkey" FOREIGN KEY ("audit_round_id") REFERENCES "audit_round"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finding" ADD CONSTRAINT "finding_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finding" ADD CONSTRAINT "finding_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finding" ADD CONSTRAINT "finding_record_id_fkey" FOREIGN KEY ("record_id") REFERENCES "quality_record"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finding" ADD CONSTRAINT "finding_recurrence_of_finding_id_fkey" FOREIGN KEY ("recurrence_of_finding_id") REFERENCES "finding"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finding" ADD CONSTRAINT "finding_identified_by_fkey" FOREIGN KEY ("identified_by") REFERENCES "app_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corrective_request" ADD CONSTRAINT "corrective_request_finding_id_fkey" FOREIGN KEY ("finding_id") REFERENCES "finding"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corrective_request" ADD CONSTRAINT "corrective_request_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corrective_request" ADD CONSTRAINT "corrective_request_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "app_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corrective_request" ADD CONSTRAINT "corrective_request_opened_by_fkey" FOREIGN KEY ("opened_by") REFERENCES "app_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_status_history" ADD CONSTRAINT "request_status_history_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "corrective_request"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_status_history" ADD CONSTRAINT "request_status_history_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "app_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "correction" ADD CONSTRAINT "correction_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "corrective_request"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "correction" ADD CONSTRAINT "correction_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "app_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "root_cause_analysis" ADD CONSTRAINT "root_cause_analysis_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "corrective_request"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "root_cause_analysis" ADD CONSTRAINT "root_cause_analysis_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "app_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action_plan" ADD CONSTRAINT "action_plan_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "corrective_request"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action_plan" ADD CONSTRAINT "action_plan_submitted_by_fkey" FOREIGN KEY ("submitted_by") REFERENCES "app_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action_plan_activity" ADD CONSTRAINT "action_plan_activity_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "action_plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action_plan_activity" ADD CONSTRAINT "action_plan_activity_responsible_user_id_fkey" FOREIGN KEY ("responsible_user_id") REFERENCES "app_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_approval" ADD CONSTRAINT "plan_approval_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "action_plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_approval" ADD CONSTRAINT "plan_approval_decided_by_fkey" FOREIGN KEY ("decided_by") REFERENCES "app_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification" ADD CONSTRAINT "verification_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "corrective_request"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification" ADD CONSTRAINT "verification_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "app_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "closure" ADD CONSTRAINT "closure_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "corrective_request"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "closure" ADD CONSTRAINT "closure_verification_id_fkey" FOREIGN KEY ("verification_id") REFERENCES "verification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "closure" ADD CONSTRAINT "closure_closed_by_fkey" FOREIGN KEY ("closed_by") REFERENCES "app_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

