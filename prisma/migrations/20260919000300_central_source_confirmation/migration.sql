ALTER TABLE "document_version"
  ADD COLUMN "source_confirmed_at" TIMESTAMPTZ(6),
  ADD COLUMN "source_confirmation_note" TEXT;

-- ผู้รับผิดชอบยืนยันชุดต้นทางว่าใช้งานปัจจุบันได้ แม้ metadata บางช่องยังไม่ทราบ
-- ไม่แทนที่วันมีผลใช้หรือเลขฉบับด้วยวันนำเข้า/เลขสมมติ
ALTER TABLE "document_version" DROP CONSTRAINT "verified_metadata_required";
ALTER TABLE "document_version" ADD CONSTRAINT "verified_metadata_required"
  CHECK ("review_status" <> 'VERIFIED' OR
    ("source_confirmed_at" IS NOT NULL AND "source_confirmation_note" IS NOT NULL AND "status" IS NOT NULL) OR
    ("issue_no" IS NOT NULL AND "revision_no" IS NOT NULL
     AND "effective_date" IS NOT NULL AND "status" IS NOT NULL));
