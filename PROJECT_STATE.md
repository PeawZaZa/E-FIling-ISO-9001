# Current Project State

Last updated: 2026-09-27

## Current focus

ERD / Database Design Alignment — `Database_Design.md` และชุด ERD บทที่ 3 ปรับตาม Prisma ปัจจุบัน 38 models / 38 tables แล้ว (เดิมเอกสาร 33); เพิ่ม 5 implementation refinements โดยไม่แก้ schema หรือ migrations. พบเพียง metadata discrepancy ที่ Prisma `DarFile.uploadedById` ไม่ประกาศ relation ไป `User` แม้ SQL migration มี FK; ยังไม่พบข้อขัดแย้งกับ requirement ที่ยืนยันแล้ว. ขั้นต่อไป: final traceability/verification review แล้วจึง Chapter 4 alignment. งาน implementation P0 ของ MVP ปัจจุบันปิดแล้ว; 20-item delta manual UI checklist ยัง NOT RUN และยังไม่มี Approved Baseline/real-user sign-off.

## Use Case implementation traceability (27 ก.ย. 2569)

- ทบทวน `docs/USE_CASE_IMPLEMENTATION_TRACEABILITY.md` ครบ 28/28 จาก SRS v1.2 และจัด `docs/MVP_GAP_CLOSURE_PLAN.md`: IMPLEMENTED + VERIFIED 13, IMPLEMENTED — PARTIALLY VERIFIED 7, PARTIALLY IMPLEMENTED 2, DEFERRED / OUT OF CURRENT MVP 5, BLOCKED BY TBD 1; คำตอบอนุรักษ์นิยมเป็น 20/28 เส้นทางที่พัฒนาแล้ว (ยังไม่ใช่ทุก AC หรือ Approved Baseline)
- ตรวจทานสถานะ UC ทั้ง 28 อีกครั้งใน `docs/MVP_VERIFICATION_CLOSURE.md`; จำนวนไม่เปลี่ยนและไม่มี UC เลื่อนเป็น VERIFIED เพราะ targeted tests ไม่แทนการรับรอง UI ใหม่. UC-B-04 ยังขาด outage/late-link runtime fixture, UC-B-06 TC-093–095 ยังติด test data, UC-B-07 ยังขาด source variants, UC-B-14/B-15 ยังรอตรวจรับ UI; ไม่เปลี่ยน `docs/MANUAL_UI_ACCEPTANCE.md` เพราะไม่มี manual result ใหม่
- UC-A-01/A-08/A-10 ปรับหน้าจอไฟล์เป็น Download-only พร้อมข้อความสำเนาไม่ควบคุม/ต้นฉบับ Hard Copy ที่ DCC; Ack ยังต้องกดยืนยันแยกต่างหาก และ server บังคับหลักฐานเข้าถึงฉบับที่มอบหมายผ่าน `AuditEvent`. Focused source checks, frontend typecheck/build และ targeted Ack/Documents/DAR integration ผ่าน; ทั้ง 3 UC เป็น IMPLEMENTED — PARTIALLY VERIFIED เพราะยังไม่ได้ manual acceptance หน้าจอที่แก้ใหม่
- UC-B-15 Dashboard แยกผลล้มเหลวรายหมวดแล้ว: API ส่งค่าสำเร็จจริงแยกจากชื่อหมวดที่อ่านไม่สำเร็จ, UI เตือนเฉพาะการ์ด; targeted Dashboard API/UI tests และ API/frontend typecheck/build ผ่าน. ยัง PARTIALLY IMPLEMENTED เพราะอ่านตารางข้ามโมดูลตรง ไม่ผ่าน interface ตาม FR-B-42; SVG chart ยังต่างจาก Chart.js ที่ล็อกไว้ และ UI ใหม่ยังไม่ได้ manual acceptance
- UC-B-14 Dashboard count และรายการ CAR/NCR ค้างกำหนดใช้การคำนวณเดียวกันจาก due date ที่บันทึกไว้ของกิจกรรมแผนปัจจุบันที่ยังไม่เสร็จ หรือวันครบกำหนดของขั้นปัจจุบันที่ระบุจริง; ไม่ใช้ `overallDueDate` เป็น fallback, ไม่ใช้ SQL view `request_due_status` ที่มี near-due ค่า provisional. รายการแสดงงาน/วันครบกำหนด/ผู้รับผิดชอบหรือบทบาทที่รอ พร้อมสถานะจริงและเปิดใบได้; จำกัด scope ตามสิทธิ์, Sponsor เห็นเฉพาะยอดรวม. Targeted API/frontend tests และ builds ผ่าน; ยังต้อง manual acceptance และ `TBD-B-09/16` สำหรับวันทำการ/near-due จึงเป็น IMPLEMENTED — PARTIALLY VERIFIED
- ไม่มีช่องว่าง implementation P0 ใน MVP ปัจจุบันตามแผนนี้; Dashboard interface และ Chart.js เป็นรายการ P1 แยกต่างหาก. Role switch ของผู้ใช้เดียวเป็นขอบเขต SRS เต็มที่เดโมปรับวิธี, ส่วน UC-A-07/B-02/B-03/B-13/B-16 พักทั้ง UC. ERD/Database Design ปรับเป็น 38 models แล้ว; 5 models ที่เพิ่มเป็น implementation refinements
- UC-B-12 เส้นทาง Auditor/Lead ปกติผ่านแล้ว แต่กรณี DCC แจ้ง Finding ติด `TBD-B-25`; UC-B-13 จบ MVP ที่ PENDING_CLOSURE และอำนาจปิดยังติด `TBD-B-24`; TC-093–095 ยัง BLOCKED เพราะ fixture ไม่ใช่ application FAIL. ขั้นต่อไป: final traceability/verification review แล้ว Chapter 4 alignment

## Current requirements state

ยึด SRS_v1.md ฉบับ 1.2 Working Draft และขอบเขต MVP ใน works/MVP_2_Weeks_and_Role_Matrix.md; การปิด CAR/NCR และผู้ตรวจแทนกรณี DCC แจ้ง Finding ยัง TBD
SRS_v1.md เป็นไฟล์ generated ห้ามแก้โดยตรง; generation ใช้ `scripts/merge_srs.py`, `scripts/srs_merge_rules.py`, `scripts/srs_reconcile_current.py`, `scripts/srs_reconcile_shared.py` และ `scripts/validate_srs_generation.py`; ต้องเก็บไฟล์เหล่านี้ร่วมกันใน Git เพื่อสร้าง v1.2 ซ้ำได้

## Decisions currently in force

- ระบบเดียว บัญชีเดโมกลาง 14 บทบาท React/Vite + Express/TypeScript + PostgreSQL/Prisma
- DAR รองรับสร้างใหม่/แก้ไข QM/QP/WI/SD/FM หนึ่งเอกสารต่อใบ
- ใช้ตาราง QP-2301-0107 §6.2 สำหรับระบบทดลองตามมติผู้ใช้: QM ใช้ QMR ทบทวน/คณบดีอนุมัติ; ประเภทอื่นรองคณบดีทบทวน/QMR อนุมัติ
- ผู้คุมทะเบียนตรวจรับและปิด DAR; DCC ประกาศใช้; ผู้ช่วย QMR ทำเฉพาะใบ/ขั้นที่มอบหมาย
- รักษาฉบับและไฟล์เดิม ห้ามข้ามการแจกจ่าย/เรียกคืนก่อนปิด DAR; การรับทราบเนื้อหาแยกจากการรับสำเนา
- ระบบทดลองให้ DCC เลือกผู้รับทราบจากบัญชีผู้ใช้ที่ยังใช้งานและมีสิทธิ์อ่านฉบับนั้น ผู้รับยืนยันด้วยบัญชีตนเองเท่านั้น; ไม่ย้ายผลไปฉบับใหม่
- รหัสหน่วยงาน 2301 คือสำนักงานคณบดีคณะวิศวกรรมศาสตร์ ส่วนงานย่อย/ผู้รับผิดชอบไม่เดาจากรหัสหรือชื่อผู้ขอ DAR
- ไม่ทดสอบอัตโนมัติผ่าน Edge ตามคำขอผู้ใช้ ใช้ targeted API tests บนฐานแยก
- มติผู้ใช้ 20 ก.ย. 2569: ระบบทดลองให้ QMR อนุมัติแผนทั้ง CAR และ NCR; ผู้จัดทำแผนห้ามอนุมัติตนเอง ไม่เพิ่มอำนาจ Lead Auditor หรือผู้ช่วย QMR โดยอัตโนมัติ

## Open issues

- ข้อความอำนาจบางประเภทใน §4 ต่างจาก §6.2; ใช้ §6.2 ในระบบทดลอง ไม่ถือว่าข้อขัดแย้งทางการหมดไป
- เอกสารต้นทางหลายฉบับยังไม่ทราบ Issue/Revision/เจ้าของ ต้องเติมหลักฐานก่อนเปิด DAR แก้ไข
- อำนาจและขอบเขตรายชื่อผู้รับทราบสำหรับใช้งานจริงยังต้องยืนยัน; สิทธิ์ DCC ใน Step 4 เป็นกติกาของระบบทดลอง ไม่ใช่ข้อยุติเชิงนโยบาย
- ผู้ลงนามปิด CAR ยังต้องยืนยัน
- Step 7 พักการปิดใบ/ส่งกลับจากขั้นปิด, อำนาจ Lead Auditor อนุมัติแผน, การมอบหมายผู้ตรวจ/ผู้ช่วยรายใบ, ประเภทใบของแหล่งอื่นนอกจาก Internal Audit/Management Review, การเปิดใบ OB/ข้อเสนอแนะ และค่ากำหนดเวลารายขั้นอัตโนมัติ; ไม่ใช้ค่าตั้งต้น TBD เป็นข้อยุติ (การตรวจปัจจุบันใช้ Auditor/Lead ผู้แจ้ง Finding เดิมเท่านั้น; ใบที่ DCC แจ้งพักที่รอตรวจประสิทธิผลพร้อมข้อความแจ้ง)

## Backup/Restore readiness

- สถานะ: เตรียมขั้นตอนและเครื่องมือแล้ว แต่ยังไม่ถือว่ายืนยันครบถ้วนจนกว่าจะ restore ใส่ database/storage ว่างบนเครื่องหรือ environment แยกและผ่าน checklist จริง
- คู่มือหลัก: `docs/BACKUP_RESTORE.md`; เครื่องมือที่มีอยู่แล้วอยู่ใน `efiling/scripts/backup-migration.mjs`, `restore-migration.mjs`, `verify-migration.mjs` และ `migration-common.mjs`
- ยืนยัน PostgreSQL/Prisma Migrate, default/override ของ document และ record storage, offline consistent set, custom-format `pg_dump`/`pg_restore`, empty-target guard และ SHA-256 manifest; การตรวจรอบนี้เป็นแบบไม่ทำลายเท่านั้น
- สภาพแวดล้อมปัจจุบันใช้ default storage; document-storage มีอยู่และ read-only verifier พบ document reference 296 รายการโดยไม่ขาดไฟล์; record-storage ยังไม่มี directory แต่ฐานปัจจุบันมี Evidence reference 0 รายการและ `storage.missing` เป็น 0; ต้องตรวจซ้ำทุกครั้งก่อน backup จริง
- ผลตรวจ 22 ก.ย. 2569: migration helper tests 7/7 ผ่าน, Prisma schema valid, migration status ครบ 5 migrations, PostgreSQL server 17.10 เข้ากับ `pg_dump`/`pg_restore` 17.11, backup/restore CLI guard เรียก help ได้; ยังไม่ได้สร้าง backup จริงหรือ restore ลง isolated target

## Next actions

1. ทบทวน `docs/MVP_VERIFICATION_CLOSURE.md` และรัน `docs/MVP_DELTA_MANUAL_CHECKLIST.md` เฉพาะรายการที่มี fixture/สิทธิ์พร้อม; บันทึกเฉพาะผลที่ลงมือผ่าน UI จริงใน `docs/MANUAL_UI_ACCEPTANCE.md`. TC-093–095 ต้องรอ fixture ที่ได้รับอนุญาต; ห้าม seed/reset ฐานเดโมเพื่อเร่งผล
2. หลังทบทวน verification ให้ทำ ERD alignment ตาม 38 Prisma models เทียบกับ ERD v0.1 33 ตาราง โดยแยก current MVP กับ workflow ที่พักไว้; ไม่เปลี่ยน schema ในรอบ verification นี้
3. ตรวจรับ Step 4 และ Step 7 กับผู้ใช้; ยืนยันรายการค้าง CAR/NCR ก่อนเปิดคำสั่งที่พักไว้ รวมถึงอำนาจมอบหมายสำหรับใช้งานจริง

## Recently completed

- Manual UI Acceptance targeted fixes (26 ก.ย. 2569): TC-090 แสดง error วันที่รอบตรวจเฉพาะเจาะจง, TC-098 เปิด Record detail/หลักฐานจาก Finding ด้วยสิทธิ์เดิม, TC-138 แสดง empty state ของ CAR/NCR หลัง filter; browser retest ผ่านและ frontend typecheck/build ผ่าน ไม่เปลี่ยน backend, DB, permission หรือ workflow
- Audit/Finding create-form navigation (26 ก.ย. 2569): เปิดฟอร์มสร้างรอบตรวจหรือเพิ่มประเด็นแล้วเลื่อนมาที่ฟอร์มหลัง render โดยเว้นระยะใต้ header; ปิดและเปิดซ้ำได้ตามเดิม ไม่เปลี่ยน API, ข้อมูล, สิทธิ์, validation หรือ workflow; ตรวจด้วย browser บนรายการปัจจุบันที่ฟอร์มอยู่นอกจอและ frontend typecheck/build ผ่าน
- Documents PDF action simplification (22 ก.ย. 2569): ยกเลิกปุ่ม `เปิด PDF` และงาน preview modal ฝั่ง Documents ตามการตัดสินใจของผู้ใช้ เหลือเฉพาะลิงก์ `ดาวน์โหลด` ที่ใช้ endpoint/authorization เดิม; ไม่เปลี่ยน backend, storage, permission หรือข้อมูลเอกสาร; frontend typecheck/build ผ่านและตรวจบน Edge แล้วว่าไม่มีปุ่มเปิด PDF หรือ dialog เหลืออยู่
- PDF inline response correction (22 ก.ย. 2569): แยกพฤติกรรมเปิด/ดาวน์โหลดเอกสารกลางตามเดิม โดยเอา `Content-Security-Policy: sandbox` ที่ขัดกับ PDF viewer ของ browser ออกจาก response สำหรับไฟล์เอกสาร; `Content-Disposition` ยังคงเป็น `inline` สำหรับเปิดและ `attachment` เมื่อใช้ `?download=1`, คง authorization/file-access checks เดิม; targeted Documents integration test, API/web typecheck และ build ผ่าน ทั้งนี้ manual smoke บน Edge profile ปัจจุบันยังเกิด download แม้ live response เป็น `application/pdf` + `inline` ไม่มี CSP sandbox และไฟล์ทดสอบ render ได้ปกติ จึงยังไม่ถือว่าผ่าน manual browser acceptance และต้องตรวจ browser PDF handling/extension ต่อ
- Final Demo Readiness (22 ก.ย. 2569): เพิ่ม `docs/DEMO_GUIDE.md`; API/web typecheck และ build ผ่าน, API test 8/8 ผ่าน, targeted integration Documents/DAR/Acknowledgement/Records/Audit/CAR/Dashboard ผ่าน 7/7 โดย DAR ยืนยันแยกรันตามรูปแบบเดิม, Prisma schema valid และ migration 5 รายการเป็นปัจจุบัน, API/DB health ตอบ ok, ฐานเชื่อมต่อได้และ storage reference ไม่ขาด, ISO source/stored PDF 296/296 ครอบคลุม 295 เอกสาร checksum failure 0; ยังไม่รัน manual browser smoke/acceptance และไม่แก้ production code
- Manual UI Acceptance checklist (21 ก.ย. 2569): เพิ่ม `docs/MANUAL_UI_ACCEPTANCE.md` เรียงข้อมูลทดสอบให้ reuse ตั้งแต่ Documents/DAR ถึง CAR/NCR และ Dashboard, ระบุบัญชี/prerequisite/UI steps/expected/permission-error/PASS-FAIL ครบ; บันทึก source observations 4 ข้อโดยไม่แก้ production code และคงจุดหยุด CAR/NCR ที่ PENDING_CLOSURE
- NCR E2E gap (21 ก.ย. 2569): สร้าง Management Review Finding พร้อมหลักฐานผ่าน API โดย Auditor ที่อยู่คนละกลุ่มงานกับผู้แก้ไข; เปิด NCR → แก้เฉพาะหน้า → ส่งแผน → QMR อนุมัติ → บันทึกผล/Record evidence → ส่งตรวจ → ผู้แจ้งเดิมตรวจผ่าน → PENDING_CLOSURE; ผู้แก้ตรวจเอง 403 และ close ที่ยัง TBD ตอบ 409; targeted CAR/NCR test 1/1 และ API typecheck ผ่าน ไม่เปลี่ยน business rule/permission. กรณี DCC เป็นผู้แจ้งยังรอ decision เรื่องผู้ตรวจแทน
- System/E2E Verification (21 ก.ย. 2569): rerun API chain และ module tests ผ่าน 11/11; ตรวจ role, permissions, invalid/duplicate, missing files, dashboard และ API process ใหม่; ตรวจ PDF จริง 296 ไฟล์/295 เอกสาร checksum ตรง และ read-only DCC/Sponsor/Reader smoke ผ่าน; ไม่มี defect/code change ใหม่ รายละเอียดใน docs/SYSTEM_E2E_VERIFICATION_2026-09-21.md
- Integration/Hardening: targeted auth + 7 integration flows ผ่าน (11 top-level tests), เพิ่ม chain DAR→Documents→Acknowledgement→Records→Audit/Finding→CAR→Dashboard และตรวจข้อมูล/ไฟล์ใน API process ใหม่สองครั้ง; แก้ CAR ตรวจงานกิจกรรมตนเอง, CAR/Finding ใช้ evidence ที่ไฟล์หาย, DAR ส่ง/ประกาศ/ปิดเมื่อไฟล์จำเป็นหาย และ DAR status audit; regression ผ่านและ typecheck/build API/เว็บผ่าน ไม่เปลี่ยน TBD/locked rules
- Step 1 บัญชีเดโม/สิทธิ์เมนู และ Step 2 ทะเบียนเอกสาร/ไฟล์จริง
- นำเข้า PDF 296 ไฟล์ เป็น 295 เอกสาร/ฉบับ ผู้ใช้รับรองว่าเป็นชุดกลางปัจจุบัน; checksum ตรงต้นฉบับ
- เติมหน่วยงาน 2301 ครบ 295 รายการ; Master List CSV เติม QM Issue 1 Rev.03 วันที่เริ่มใช้ 24 กรกฎาคม 2569
- Step 4 มี API/หน้าจอเลือกผู้รับทราบ ติดตามผล และยืนยันต่อฉบับ พร้อม targeted API test บนฐานแยก
- Step 5 Records มี API/หน้าเพิ่ม แก้ ค้นหา ดูรายละเอียด และดาวน์โหลดหลักฐานตามสิทธิ์; เก็บไฟล์จริงพร้อมตรวจชนิดจากเนื้อไฟล์และบันทึก audit event; ใช้ชนิดบันทึกในฐานข้อมูลและเอกสารอ้างอิงจากโมดูลเอกสาร ทดสอบ API บน schema แยกและ build API/เว็บผ่าน
- Step 6 Audit/Finding มี API/หน้าสร้างและดูรอบตรวจ ทีมผู้ตรวจ เกณฑ์/ขอบเขต สรุป Finding ตามชนิดและระดับ; ตรวจความเป็นอิสระจากสังกัดที่บันทึกจริงและให้ DCC ยกเว้นพร้อมเหตุผล/ประวัติ; บันทึก Finding จาก 5 แหล่งพร้อมข้อกำหนด หลักฐานไฟล์จริงหรือบันทึกหลักฐานเดิม เอกสารอ้างอิง สิทธิ์ระดับรายการและ audit event; targeted integration test บน schema แยกผ่าน ยังไม่ทำ CAR/NCR
- Step 7 มี API/หน้า CAR/NCR: เปิดจาก Finding (Internal Audit → CAR, Management Review → NCR), ป้องกันใบซ้ำ/คำขอชนกัน, แก้เฉพาะหน้า, ร่าง/ส่งแผนรายกิจกรรม, QMR อนุมัติ/ส่งกลับ, ผลและไฟล์จริงหรือ Records อ้างอิง, ผู้แจ้งเดิมตรวจประสิทธิผลถึงรอปิด; ไม่ผ่านย้อนวิเคราะห์ใหม่ เก็บ revision/หลักฐานเดิมและ audit events; migration ร่างแผน/ลิงก์ Records ใช้กับฐาน local แล้ว; targeted API test บน schema แยกและ build API/เว็บผ่าน ยังไม่ตรวจรับหน้าจอกับผู้ใช้ ไม่รันทดสอบ Step 4–6 ทั้งชุด
- Step 8 มี API/หน้า Dashboard 6 หมวดจากเอกสาร, DAR, การรับทราบ, Records/Evidence, Audit/Finding และ CAR/NCR; คำนวณจากข้อมูลจริงตามขอบเขต role ก่อนนับ, แสดงข้อความไม่มีสิทธิ์แยกจากค่าศูนย์, Sponsor เห็นยอดรวมอย่างเดียว; ลิงก์สถานะ DAR/CAR เปิดรายการที่กรองแล้วเฉพาะผู้มีสิทธิ์; ยังไม่มีกราฟขั้นสูงหรือ export
- Dashboard เพิ่ม visualization จาก API เดิม: donut ประเภทเอกสาร/ผลรับทราบ และ bar สถานะ DAR/CAR/NCR; คงการ์ดและรายการตัวเลขเดิมไว้ ไม่เพิ่ม dependency, metric, business rule, export หรือกราฟขั้นสูง
- เพิ่มเครื่องมือย้ายระบบแบบ offline: pg_dump/pg_restore พร้อมสำรอง document และ record/evidence storage เป็นชุดเดียว, SHA-256 manifest, restore guard และ verification แบบ read only; backup artifacts/.env ยังคงไม่เข้า Git
