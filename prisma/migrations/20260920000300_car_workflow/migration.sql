ALTER TABLE "corrective_request" ADD COLUMN "plan_draft" JSONB;
CREATE TABLE "activity_record_link" (
  "activity_id" UUID NOT NULL REFERENCES "action_plan_activity"("id") ON DELETE RESTRICT,
  "record_id" UUID NOT NULL REFERENCES "quality_record"("id") ON DELETE RESTRICT,
  PRIMARY KEY ("activity_id", "record_id")
);
