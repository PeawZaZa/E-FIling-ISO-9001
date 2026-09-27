-- ข้อบังคับที่ schema.prisma เขียนไม่ได้ ต้องเติมเป็น SQL ตรง
--
-- Prisma ไม่รองรับ CHECK constraint, partial unique index และ trigger
-- ทุกข้อในไฟล์นี้มาจากกฎที่ SRS_v1.md บังคับไว้ ไม่ใช่ข้อบังคับที่คิดขึ้นเอง
-- ให้รันหลัง migration ที่สร้างตารางเสมอ

-- ---------------------------------------------------------------------------
-- 1. หลักฐานต้องผูกกับอย่างน้อยหนึ่งสิ่ง
--    SRS §6.1.2.1 · M-B-03 — คีย์นอกสามตัวเป็นแบบไม่บังคับ "เพื่อให้แนบหลักฐาน
--    เข้ากับสิ่งใดสิ่งหนึ่งได้โดยตรง" ซึ่งแปลว่าห้ามมีหลักฐานที่ไม่ผูกกับอะไรเลย
-- ---------------------------------------------------------------------------
ALTER TABLE "evidence"
  ADD CONSTRAINT "evidence_at_least_one_owner"
  CHECK (
    "record_id" IS NOT NULL
    OR "finding_id" IS NOT NULL
    OR "request_id" IS NOT NULL
    OR "activity_id" IS NOT NULL
  );

-- ---------------------------------------------------------------------------
-- 2. ประเภทคำขอ "อื่น ๆ" ต้องบังคับกรอกคำอธิบาย
--    SRS §3.1.1 · TBD-A-01 ปิดแล้วด้วยแบบฟอร์ม REF-05
-- ---------------------------------------------------------------------------
ALTER TABLE "dar"
  ADD CONSTRAINT "dar_other_requires_description"
  CHECK (
    "request_type" <> 'OTHER'
    OR ("other_description" IS NOT NULL AND btrim("other_description") <> '')
  );

-- ---------------------------------------------------------------------------
-- 3. ฉบับปัจจุบันมีได้ไม่เกินหนึ่งฉบับต่อเอกสาร
--    BR-A-06 · SRS §6.1.1 "ฉบับปัจจุบันไม่เกินหนึ่งฉบับ"
-- ---------------------------------------------------------------------------
CREATE UNIQUE INDEX "document_one_published_version"
  ON "document_version" ("document_id")
  WHERE "status" = 'DOC_PUBLISHED' AND "review_status" = 'VERIFIED';

-- การนำเข้าที่รอตรวจสอบเก็บความขัดแย้งไว้ได้ แต่ฉบับที่ยืนยันต้องไม่ซ้ำ
CREATE UNIQUE INDEX "document_verified_revision"
  ON "document_version" ("document_id", "issue_no", "revision_no")
  WHERE "review_status" = 'VERIFIED';

ALTER TABLE "document_version" ADD CONSTRAINT "verified_metadata_required"
  CHECK ("review_status" <> 'VERIFIED' OR
    ("issue_no" IS NOT NULL AND "revision_no" IS NOT NULL
     AND "effective_date" IS NOT NULL AND "status" IS NOT NULL));
ALTER TABLE "document_version" ADD CONSTRAINT "nonnegative_revision"
  CHECK (("issue_no" IS NULL OR "issue_no" >= 0) AND
         ("revision_no" IS NULL OR "revision_no" >= 0));

-- ---------------------------------------------------------------------------
-- 4. หนึ่งประเด็นที่พบมีใบคำร้องที่ยังไม่ปิดได้ไม่เกินหนึ่งใบ
--    BR-B-07 · AC-B-15 — เปิดใบใหม่ได้เมื่อใบเดิมปิดแล้วและปัญหากลับมาเกิดซ้ำ
-- ---------------------------------------------------------------------------
CREATE UNIQUE INDEX "finding_one_open_request"
  ON "corrective_request" ("finding_id")
  WHERE "current_status" <> 'CLOSED';

-- ---------------------------------------------------------------------------
-- 5. แผนที่ใช้งานอยู่มีได้ฉบับเดียวต่อใบคำร้อง
--    §6.1.2.2 ข้อ 7 — แผนที่อนุมัติแล้วเก็บไว้ไม่เปลี่ยนแปลง การแก้ต้องสร้าง
--    revision ใหม่ ระเบียนเดิมยังอยู่ครบ
-- ---------------------------------------------------------------------------
CREATE UNIQUE INDEX "request_one_current_plan"
  ON "action_plan" ("request_id")
  WHERE "is_current";

-- ---------------------------------------------------------------------------
-- 6. ร่องรอยการตรวจสอบและประวัติสถานะเป็นข้อมูลเพิ่มอย่างเดียว
--    §6.1.2.2 ข้อ 6 "แก้ไขและลบไม่ได้ทุกกรณี"
--    บังคับที่ฐานข้อมูล ไม่ใช่เพียงไม่เขียนโค้ดแก้ เพราะข้อกำหนดเขียนว่าทุกกรณี
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "reject_mutation"()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'ตาราง % เป็นข้อมูลเพิ่มอย่างเดียว แก้ไขหรือลบไม่ได้ (SRS ข้อ 6.1.2.2(6))',
    TG_TABLE_NAME;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "audit_event_append_only"
  BEFORE UPDATE OR DELETE ON "audit_event"
  FOR EACH ROW EXECUTE FUNCTION "reject_mutation"();

CREATE TRIGGER "request_status_history_append_only"
  BEFORE UPDATE OR DELETE ON "request_status_history"
  FOR EACH ROW EXECUTE FUNCTION "reject_mutation"();

CREATE TRIGGER "dar_status_history_append_only"
  BEFORE UPDATE OR DELETE ON "dar_status_history"
  FOR EACH ROW EXECUTE FUNCTION "reject_mutation"();

-- ---------------------------------------------------------------------------
-- 7. ตัวช่วยคำนวณวันทำการ
--    §4.30 กำหนดเวลาทุกค่านับเป็น "วันทำการ" ซึ่งคำนวณไม่ได้ถ้าไม่มีปฏิทิน
--    ⚠️ ตาราง working_calendar เป็นสิ่งที่การออกแบบค้นพบ ไม่ใช่ข้อกำหนดใน SRS
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "add_working_days"(start_date DATE, days INT)
RETURNS DATE AS $$
DECLARE
  result DATE := start_date;
  remaining INT := days;
  guard INT := 0;
BEGIN
  WHILE remaining > 0 LOOP
    guard := guard + 1;
    -- กันวนไม่รู้จบเมื่อปฏิทินวันทำการขาดช่วง ซึ่งจะเกิดทุกต้นปีที่ยังไม่ได้นำเข้า
    IF guard > 3650 THEN
      RAISE EXCEPTION 'ปฏิทินวันทำการไม่ครอบคลุมช่วงที่ต้องใช้ นับจาก % ไป % วันทำการ', start_date, days;
    END IF;
    result := result + 1;
    IF EXISTS (
      SELECT 1 FROM "working_calendar"
      WHERE "calendar_date" = result AND "is_working_day"
    ) THEN
      remaining := remaining - 1;
    END IF;
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql STABLE;

-- ---------------------------------------------------------------------------
-- 8. มุมมองสถานะเกินกำหนด
--    BR-B-06 · §6.1.2.2 ข้อ 4 ห้ามเก็บสถานะเกินกำหนดเป็นข้อมูล
--    จึงให้เป็น view ที่คำนวณสด ไม่ใช่คอลัมน์ที่ต้องคอยปรับให้ตรง
--    เกณฑ์ "ใกล้ครบกำหนด" อ่านจาก system_setting ไม่ฝังเป็นค่าคงที่ (BR-B-16)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW "request_due_status" AS
SELECT
  r."id"                AS "request_id",
  r."current_status",
  h."stage_due_date",
  (
    h."stage_due_date" IS NOT NULL
    AND h."stage_due_date" < CURRENT_DATE
    AND r."current_status" <> 'CLOSED'
  ) AS "is_overdue",
  (
    h."stage_due_date" IS NOT NULL
    AND r."current_status" <> 'CLOSED'
    AND h."stage_due_date" >= CURRENT_DATE
    AND h."stage_due_date" <= "add_working_days"(
      CURRENT_DATE,
      COALESCE(
        (SELECT ("value" #>> '{}')::INT FROM "system_setting"
         WHERE "key" = 'due_soon_working_days'),
        2
      )
    )
  ) AS "is_due_soon"
FROM "corrective_request" r
LEFT JOIN LATERAL (
  SELECT "stage_due_date"
  FROM "request_status_history"
  WHERE "request_id" = r."id"
  ORDER BY "occurred_at" DESC
  LIMIT 1
) h ON TRUE;
