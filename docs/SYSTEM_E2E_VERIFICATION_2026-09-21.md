# MVP System / E2E Verification — 21 กันยายน 2569

## ขอบเขตและข้อมูล

- รัน workflow ผ่าน API จริงด้วยบัญชีเดโม 14 บทบาทบน PostgreSQL schema และ storage ชั่วคราวที่แยกจากข้อมูลปัจจุบัน; tests ลบเฉพาะ schema/storage ที่สร้างเองหลังรัน ไม่ reset หรือ seed ฐานปัจจุบัน
- ตรวจข้อมูลปัจจุบันแบบอ่านอย่างเดียว: PDF ต้นทาง 296 ไฟล์และไฟล์จัดเก็บ 296 ไฟล์ ครอบคลุม 295 เอกสาร, checksum mismatch 0; DCC เห็นเอกสาร 295 รายการและ Dashboard 6 หมวด; Sponsor เห็น aggregate-only; Reader ถูกปฏิเสธจาก Dashboard; Records/Finding/CAR ในฐานปัจจุบันยังเป็น 0
- ไม่มี browser UI automation ตามมติโครงการเดิม; ผลนี้เป็น system/API E2E และ read-only production-data smoke ไม่ใช่ manual UI acceptance

## ผล scenario

| เส้นทาง | ผลและหลักฐานสำคัญ |
|---|---|
| Authentication / Roles | ผ่าน: login 14 บัญชี, 98 menu/API access combinations, anonymous/forged identity, session rotation, reload/logout |
| Document + DAR | ผ่าน: 5 ประเภทเอกสาร, การแก้ฉบับ, submit → intake → review → approve → publish → distribution/recall → close; ตรวจ revision, PDF, history, audit, invalid/repeated transitions และไฟล์หาย |
| Acknowledgement | ผ่าน: DCC มอบหมายผู้มีสิทธิ์อ่าน, ผู้รับเปิด PDF และยืนยันด้วยบัญชีตนเอง, คำสั่งซ้ำ/พร้อมกันไม่เพิ่ม confirmation, obsolete/inactive/missing file ถูกปฏิเสธ |
| Records / Evidence | ผ่าน: create/edit/search/view, upload/download, empty evidence, invalid PDF, missing file, สิทธิ์ไฟล์และ document reference |
| Audit / Finding | ผ่าน: round, auditor membership/independence และ waiver ที่มีเหตุผล, Finding เชื่อม Document/Record และหลักฐาน; สิทธิ์รายรายการและไฟล์หาย |
| CAR | ผ่าน: Finding → CAR → immediate correction → plan → QMR approval → result/evidence → effectiveness verification → pending closure; ตรวจ self-approval/self-verification, plan revision, repeat/invalid actions, missing evidence, audit events |
| NCR | ผ่านถึง submit-verification: Management Review Finding → NCR → correction → plan → QMR approval → result/Record evidence → pending verification; ขั้น effectiveness verification สำหรับ Finding ที่ DCC แจ้งยังรอผู้ตรวจที่มีอำนาจยืนยัน จึงไม่ให้ผลผ่านเต็มเส้นทาง |
| Dashboard | ผ่าน: empty state, 6 หมวด, aggregate เทียบ DB/fixture หลัง workflow, role scope และ Sponsor aggregate-only; process ใหม่สองครั้งอ่าน dashboard/PDF/evidence/CAR เดิมได้หลัง login ใหม่ |

ผลรันสด: `dar.integration.ts` 1/1 และชุด `auth.test.ts`, `documents.integration.ts`, `acknowledgements.integration.ts`, `records.integration.ts`, `audit.integration.ts`, `car.integration.ts`, `dashboard.integration.ts` 10/10 รวม 11/11 top-level tests, 0 fail. Tests หลาย scenario อยู่ภายในแต่ละ top-level test. ตรวจ cleanup แล้วไม่พบ storage test directory ค้าง

## Defects / regression / build

- รอบนี้ไม่พบ defect ใหม่และไม่ได้แก้ implementation; regression tests เดิมของ Integration/Hardening ผ่านทั้งหมด 11/11 (รายละเอียด root cause และ red/green ของ defect เดิมอยู่ใน `docs/INTEGRATION_HARDENING_2026-09-20.md`)
- ไม่เพิ่ม regression test เพราะไม่มี defect ใหม่; ไม่รัน typecheck/build ซ้ำเพราะไม่มีการเปลี่ยนโค้ด (รอบ Integration/Hardening ก่อนหน้าผ่านทั้งสองคำสั่ง)
- คำสั่ง `tsx` ใน sandbox เริ่มไม่ได้ด้วย `uv_os_get_passwd ... ENOMEM`; รันซ้ำภายนอก sandbox แล้วผ่าน จึงเป็นข้อจำกัด environment ไม่ใช่ผล test failure

## Manual UI tests ที่ยังต้องทำ

- Login/logout และเมนูแต่ละ role; ตรวจ 401/403 และข้อความ error บนหน้าจอ
- DAR ครบทุกขั้นและรอบส่งกลับ; preview/download PDF, revision/history, distribution/recall และหน้าปิดใบ
- ผู้รับมอบหมายเปิด PDF แล้ว acknowledge; ตรวจสถานะหลัง reload และการกดย้ำ
- Records/Audit/Finding/CAR/NCR: ฟอร์มสร้าง/แก้/ค้นหา, upload/download, ลิงก์ข้ามโมดูล, สิทธิ์และ error states รวมไฟล์หาย
- Dashboard ทุก role: ค่า empty/มีข้อมูล, filter/link, การแสดง aggregate-only และการตอบสนองของหน้าจอ
- ตรวจ reload/browser restart และ actual API/PostgreSQL restart ใน environment สำหรับตรวจรับ; automated tests ตรวจเพียง API child process ใหม่ ไม่ได้ restart DB/OS

## Known limitations / TBD

- ผู้ลงนามปิด CAR/NCR, ขั้นส่งกลับจากการปิด, ผู้ตรวจแทนเมื่อ DCC เป็นผู้แจ้ง Finding, การมอบหมายรายใบ, แหล่ง Finding/OB ที่ยังไม่ยืนยัน และกำหนดเวลาอัตโนมัติ ยังเป็น TBD; test ยืนยันว่าคำสั่ง close ที่ยังไม่กำหนดอำนาจถูกปฏิเสธ
- DAR/Step 4 และหน้าจอ Step 7 ยังรอตรวจรับ; ข้อขัดแย้งอำนาจ §4/§6.2 และนโยบายผู้รับทราบจริงยังต้องยืนยัน
- การทดสอบ workflow เขียนข้อมูลใช้ fixture แยก ไม่ได้เขียนลงชุดเอกสารกลาง 295 รายการ; real-data smoke ตรวจการอ่าน/สิทธิ์และ checksum เท่านั้น
- ไม่มีผล load/soak, ทุก concurrency interleaving หรือ PostgreSQL/OS restart; session อยู่ใน memory และต้อง login ใหม่หลัง API restart
