-- DAR rounds retain the exact submitted metadata and files. No existing data is reset.
ALTER TABLE "dar" ALTER COLUMN "dar_no" DROP NOT NULL, ALTER COLUMN "buddhist_year" DROP NOT NULL, ALTER COLUMN "sequence_no" DROP NOT NULL;
ALTER TABLE "dar" ADD COLUMN "draft" JSONB NOT NULL DEFAULT '{}', ADD COLUMN "round_no" INTEGER NOT NULL DEFAULT 1, ADD COLUMN "assignments" JSONB NOT NULL DEFAULT '{}', ADD COLUMN "logistics" JSONB NOT NULL DEFAULT '{}';
ALTER TABLE "dar_decision" ADD COLUMN "round_no" INTEGER NOT NULL DEFAULT 1;
CREATE TABLE "dar_round" (
 "id" UUID NOT NULL PRIMARY KEY, "dar_id" UUID NOT NULL REFERENCES "dar"("id") ON DELETE RESTRICT,
 "round_no" INTEGER NOT NULL, "snapshot" JSONB NOT NULL, "submitted_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "dar_round_dar_id_round_no_key" UNIQUE ("dar_id","round_no")
);
CREATE TABLE "dar_file" (
 "id" UUID NOT NULL PRIMARY KEY, "dar_id" UUID NOT NULL REFERENCES "dar"("id") ON DELETE RESTRICT,
 "kind" VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK ("kind" IN ('DRAFT','DISTRIBUTION','RECALL')),
 "round_no" INTEGER NOT NULL, "file_name" VARCHAR(255) NOT NULL, "storage_path" VARCHAR(500) NOT NULL UNIQUE,
 "sha256" VARCHAR(64) NOT NULL, "size_bytes" BIGINT NOT NULL,
 "uploaded_by" UUID NOT NULL REFERENCES "app_user"("id") ON DELETE RESTRICT,
 "uploaded_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "dar_file_dar_id_round_no_idx" ON "dar_file"("dar_id","round_no");
CREATE TABLE "document_code_sequence" ("key" VARCHAR(100) NOT NULL PRIMARY KEY,"last_number" INTEGER NOT NULL DEFAULT 0);
CREATE TRIGGER "dar_round_append_only" BEFORE UPDATE OR DELETE ON "dar_round" FOR EACH ROW EXECUTE FUNCTION "reject_mutation"();
CREATE TRIGGER "dar_decision_append_only" BEFORE UPDATE OR DELETE ON "dar_decision" FOR EACH ROW EXECUTE FUNCTION "reject_mutation"();
CREATE TRIGGER "dar_file_append_only" BEFORE UPDATE OR DELETE ON "dar_file" FOR EACH ROW EXECUTE FUNCTION "reject_mutation"();
