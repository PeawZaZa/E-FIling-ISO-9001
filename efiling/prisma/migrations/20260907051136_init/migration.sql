-- CreateTable
CREATE TABLE "departments" (
    "department_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("department_id")
);

-- CreateTable
CREATE TABLE "roles" (
    "role_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "users" (
    "user_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "role_id" TEXT NOT NULL,
    "department_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "files" (
    "file_id" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "original_filename" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "uploaded_by" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "files_pkey" PRIMARY KEY ("file_id")
);

-- CreateTable
CREATE TABLE "audit_trail" (
    "log_id" TEXT NOT NULL,
    "actor_id" TEXT,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_trail_pkey" PRIMARY KEY ("log_id")
);

-- CreateTable
CREATE TABLE "documents" (
    "document_id" TEXT NOT NULL,
    "document_code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "department_name" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("document_id")
);

-- CreateTable
CREATE TABLE "document_revisions" (
    "revision_id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "revision_no" INTEGER NOT NULL,
    "issue_no" INTEGER NOT NULL DEFAULT 1,
    "file_id" TEXT,
    "effective_date" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "obsoleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_revisions_pkey" PRIMARY KEY ("revision_id")
);

-- CreateTable
CREATE TABLE "dars" (
    "dar_id" TEXT NOT NULL,
    "dar_no" TEXT NOT NULL,
    "document_id" TEXT,
    "action_type" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "requester_id" TEXT NOT NULL,
    "approver_id" TEXT,
    "status" TEXT NOT NULL,
    "comment" TEXT,
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decided_at" TIMESTAMP(3),

    CONSTRAINT "dars_pkey" PRIMARY KEY ("dar_id")
);

-- CreateTable
CREATE TABLE "acknowledgements" (
    "ack_id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "revision_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "assignment_type" TEXT NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ack_at" TIMESTAMP(3),

    CONSTRAINT "acknowledgements_pkey" PRIMARY KEY ("ack_id")
);

-- CreateTable
CREATE TABLE "distribution_list" (
    "distribution_id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "revision_id" TEXT NOT NULL,
    "recipient_role_id" TEXT,
    "recipient_department" TEXT,
    "copy_no" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "distribution_list_pkey" PRIMARY KEY ("distribution_id")
);

-- CreateTable
CREATE TABLE "records" (
    "record_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "record_type" TEXT NOT NULL,
    "document_id" TEXT,
    "finding_id" TEXT,
    "car_id" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closed_at" TIMESTAMP(3),
    "retention_tier" INTEGER,
    "retention_expiry_date" TIMESTAMP(3),

    CONSTRAINT "records_pkey" PRIMARY KEY ("record_id")
);

-- CreateTable
CREATE TABLE "record_files" (
    "record_file_id" TEXT NOT NULL,
    "record_id" TEXT NOT NULL,
    "file_id" TEXT NOT NULL,
    "uploaded_by" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "record_files_pkey" PRIMARY KEY ("record_file_id")
);

-- CreateTable
CREATE TABLE "audit_rounds" (
    "audit_round_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "lead_auditor_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_rounds_pkey" PRIMARY KEY ("audit_round_id")
);

-- CreateTable
CREATE TABLE "findings" (
    "finding_id" TEXT NOT NULL,
    "audit_round_id" TEXT,
    "source_reference" TEXT,
    "document_id" TEXT,
    "department_id" TEXT,
    "type" TEXT NOT NULL,
    "severity" TEXT,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "reported_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "findings_pkey" PRIMARY KEY ("finding_id")
);

-- CreateTable
CREATE TABLE "cars" (
    "car_id" TEXT NOT NULL,
    "car_no" TEXT NOT NULL,
    "finding_id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "root_cause" TEXT,
    "corrective_action" TEXT,
    "verified_by" TEXT,
    "verified_at" TIMESTAMP(3),
    "closed_by" TEXT,
    "closed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cars_pkey" PRIMARY KEY ("car_id")
);

-- CreateTable
CREATE TABLE "destruction_logs" (
    "destruction_log_id" TEXT NOT NULL,
    "item_type" TEXT NOT NULL,
    "item_ref_id" TEXT NOT NULL,
    "item_code" TEXT NOT NULL,
    "retention_tier" INTEGER,
    "requested_by" TEXT NOT NULL,
    "approved_by" TEXT,
    "status" TEXT NOT NULL,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "destroyed_at" TIMESTAMP(3),

    CONSTRAINT "destruction_logs_pkey" PRIMARY KEY ("destruction_log_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "departments_name_key" ON "departments"("name");

-- CreateIndex
CREATE UNIQUE INDEX "roles_code_key" ON "roles"("code");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "audit_trail_entity_type_entity_id_idx" ON "audit_trail"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_trail_created_at_idx" ON "audit_trail"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "documents_document_code_key" ON "documents"("document_code");

-- CreateIndex
CREATE UNIQUE INDEX "document_revisions_document_id_revision_no_key" ON "document_revisions"("document_id", "revision_no");

-- CreateIndex
CREATE UNIQUE INDEX "dars_dar_no_key" ON "dars"("dar_no");

-- CreateIndex
CREATE UNIQUE INDEX "acknowledgements_revision_id_user_id_key" ON "acknowledgements"("revision_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "cars_car_no_key" ON "cars"("car_no");

-- CreateIndex
CREATE INDEX "cars_status_due_date_idx" ON "cars"("status", "due_date");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("role_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("department_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_trail" ADD CONSTRAINT "audit_trail_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_revisions" ADD CONSTRAINT "document_revisions_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("document_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_revisions" ADD CONSTRAINT "document_revisions_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "files"("file_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dars" ADD CONSTRAINT "dars_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("document_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dars" ADD CONSTRAINT "dars_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dars" ADD CONSTRAINT "dars_approver_id_fkey" FOREIGN KEY ("approver_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acknowledgements" ADD CONSTRAINT "acknowledgements_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("document_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acknowledgements" ADD CONSTRAINT "acknowledgements_revision_id_fkey" FOREIGN KEY ("revision_id") REFERENCES "document_revisions"("revision_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acknowledgements" ADD CONSTRAINT "acknowledgements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distribution_list" ADD CONSTRAINT "distribution_list_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("document_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distribution_list" ADD CONSTRAINT "distribution_list_revision_id_fkey" FOREIGN KEY ("revision_id") REFERENCES "document_revisions"("revision_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "records" ADD CONSTRAINT "records_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("document_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "records" ADD CONSTRAINT "records_finding_id_fkey" FOREIGN KEY ("finding_id") REFERENCES "findings"("finding_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "records" ADD CONSTRAINT "records_car_id_fkey" FOREIGN KEY ("car_id") REFERENCES "cars"("car_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "records" ADD CONSTRAINT "records_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "record_files" ADD CONSTRAINT "record_files_record_id_fkey" FOREIGN KEY ("record_id") REFERENCES "records"("record_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "record_files" ADD CONSTRAINT "record_files_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "files"("file_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "record_files" ADD CONSTRAINT "record_files_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_rounds" ADD CONSTRAINT "audit_rounds_lead_auditor_id_fkey" FOREIGN KEY ("lead_auditor_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "findings" ADD CONSTRAINT "findings_audit_round_id_fkey" FOREIGN KEY ("audit_round_id") REFERENCES "audit_rounds"("audit_round_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "findings" ADD CONSTRAINT "findings_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("document_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "findings" ADD CONSTRAINT "findings_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("department_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "findings" ADD CONSTRAINT "findings_reported_by_fkey" FOREIGN KEY ("reported_by") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cars" ADD CONSTRAINT "cars_finding_id_fkey" FOREIGN KEY ("finding_id") REFERENCES "findings"("finding_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cars" ADD CONSTRAINT "cars_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cars" ADD CONSTRAINT "cars_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cars" ADD CONSTRAINT "cars_closed_by_fkey" FOREIGN KEY ("closed_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "destruction_logs" ADD CONSTRAINT "destruction_logs_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "destruction_logs" ADD CONSTRAINT "destruction_logs_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
