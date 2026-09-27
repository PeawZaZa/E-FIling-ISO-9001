# MVP Integration / Hardening — 20 กันยายน 2569

ขอบเขต: ทดสอบ API กับ PostgreSQL schema ชั่วคราวและ storage แยก ไม่เปลี่ยนข้อมูลจริง ไม่เพิ่ม feature หรือเปลี่ยน business rules/TBD ไม่ใช้ Edge automation

## ผลทดสอบ

ผ่าน 11 top-level tests: auth 4 tests และ integration 7 tests (แต่ละ integration test มีหลายสถานการณ์) ไม่ใช่การรัน full test suite

| เส้นทาง | สิ่งที่ตรวจและผล |
|---|---|
| Login / role | 14 บัญชี, สิทธิ์เมนู/API 98 คู่, anonymous/forged identity, session rotation, reload และ logout — ผ่าน |
| Documents / PDF | private download, invalid PDF, duplicate, rollback, persistence — ผ่าน |
| DAR | QM/QP/WI/SD/FM, role/step guards, รอบส่งกลับ, delegation, segregation, concurrent numbering/publication, stale source, mandatory distribution/recall, ปิดเมื่อครบ, ไฟล์หาย, status audit — ผ่านหลังแก้ |
| Acknowledgement | เฉพาะฉบับที่อ่านได้/ประกาศใช้, ยืนยันของตนเอง, obsolete/inactive/missing file, คำสั่งซ้ำ; เพิ่ม simultaneous confirm ใน cross-module chain — ผ่าน |
| Records / Evidence | create/edit/search/download ตามสิทธิ์, invalid references/inputs ที่ tests ครอบคลุม, empty evidence, invalid upload, missing download และ audit — ผ่าน |
| Audit / Finding | สมาชิก/สังกัด/waiver, source/round compatibility, file permissions, Records reference ที่ไฟล์หาย — ผ่านหลังแก้ |
| CAR/NCR | confirmed workflow, duplicate creation/start races, self-approval/self-verification, revision history, invalid states/uploads, Records links, missing evidence; close และประเภทใบ TBD ยังคงถูกปฏิเสธ — ผ่านหลังแก้ |
| Dashboard | empty dataset, 6 sections, scope ตาม role, sponsor aggregate-only; เทียบ totals/status กับ DB และ fixture ที่สร้างผ่าน API — ผ่าน |

Cross-module chain ที่เพิ่มใน `efiling/api/tests/dar.integration.ts`:

DAR ที่ปิดแล้ว → published document → assignment/confirmation → Record พร้อมไฟล์และ document reference → Audit Round → Finding อ้าง Record/Document → CAR พร้อมผลกิจกรรมอ้าง Record → verification → pending closure → Dashboard

ตรวจ ID อ้างอิง, cross-role denial, จำนวน audit events และ aggregate จริง จากนั้นเปิด API ใน **child process ใหม่สองครั้ง** บน schema/storage เดิม ล็อกอินใหม่ และตรวจ Dashboard, สถานะ CAR, ดาวน์โหลด PDF และเนื้อไฟล์ Evidence อีกครั้ง — ผ่าน ไม่มีการรีสตาร์ต PostgreSQL หรือเครื่องจริง

## Defects และ root cause

| Defect | Root cause | Minimal fix / regression |
|---|---|---|
| CAR ผู้รับผิดชอบกิจกรรมตรวจงานตนเองได้ | ตรวจเพียง `ownerUserId` ของใบ | ใช้ guard ร่วมสำหรับ action list และคำสั่ง verify ตรวจผู้รับผิดชอบกิจกรรมในแผนด้วย; regression ได้ 403 และไม่มี Verification ถูกสร้าง |
| CAR ส่งตรวจได้เมื่อไฟล์หาย | ตรวจจำนวน Evidence/Records links อย่างเดียว | ตรวจไฟล์จริง เป็น regular file และขนาดตรง metadata ก่อนส่งตรวจ; ทดสอบทั้ง direct evidence และ Records link พร้อมตรวจสถานะไม่เปลี่ยนเมื่อถูกปฏิเสธ |
| DAR ส่ง/ประกาศ/ปิดได้เมื่อไฟล์จำเป็นหาย | ใช้ metadata โดยไม่ตรวจ storage | ตรวจ PDF และ SHA-256 ก่อน submit/publish/close; close ตรวจหลักฐาน distribution/recall ที่อ้างถึงด้วย; regression คืน 409, ไม่สร้าง round/version หรือปิดใบ และผ่านหลังคืนไฟล์ |
| DAR status audit ไม่ครบ | ตัวบันทึกสถานะเขียนเฉพาะ history | เขียน `STATUS_CHANGE` ใน transaction เดียวกับ history/state พร้อม actor และ before/after; regression ตรวจ closure event ของทั้ง 5 ประเภทเอกสาร |
| Finding ใช้ Records ที่ไฟล์หายเป็นหลักฐานได้ | ตรวจเพียงจำนวน Evidence ในฐาน | ใช้ตัวตรวจไฟล์จริงร่วมกับ CAR; regression คืน 409 และไม่สร้าง Finding |

ทุก defect มีการรัน regression ให้ fail กับพฤติกรรมเดิมก่อนแก้ และผ่านหลังแก้ ไม่มี migration/dependency/frontend feature เพิ่ม

## คำสั่งที่รัน

รันจาก `efiling/`:

```text
npx tsx --test api/tests/dar.integration.ts api/tests/dashboard.integration.ts api/tests/auth.test.ts
# 6/6 ผ่าน (baseline)
npx tsx --test api/tests/documents.integration.ts api/tests/acknowledgements.integration.ts api/tests/records.integration.ts api/tests/audit.integration.ts api/tests/car.integration.ts
# 5/5 ผ่าน (baseline)
npx tsx --test api/tests/car.integration.ts
npx tsx --test api/tests/dar.integration.ts
npx tsx --test api/tests/audit.integration.ts
# รันแยกตาม defect: fail ก่อนแก้ / pass หลังแก้
npx tsx --test api/tests/dar.integration.ts api/tests/car.integration.ts api/tests/dashboard.integration.ts
# 3/3 ผ่าน รวม empty dashboard และ cross-module/restart checks
npx tsx --test api/tests/audit.integration.ts api/tests/car.integration.ts api/tests/records.integration.ts api/tests/dar.integration.ts
# 4/4 ผ่าน หลังแก้ shared evidence validation ล่าสุด
npm run typecheck
npm run build
# API และ frontend ผ่านทั้งสองคำสั่ง หลังแก้โค้ดล่าสุด
```

## Known limitations / TBD

- ยังไม่ใช่ผล manual UI acceptance; ไม่ทดสอบ browser layouts/interactions, PostgreSQL/OS restart, load/soak หรือทุก concurrency interleaving
- บัญชีและสิทธิ์ยังเป็น demo 14 บทบาท; in-memory sessions ไม่คงอยู่ข้าม API restart ต้อง login ใหม่ ไม่เปลี่ยนระบบ authentication ในรอบนี้
- ผู้ลงนามปิด CAR/NCR, การส่งกลับขั้นปิด, การมอบหมายรายใบ, แหล่ง Finding/OB ที่ยังไม่ยืนยัน และกำหนดเวลารายขั้นอัตโนมัติ ยังคง TBD ตาม PROJECT_STATE.md
- DCC เป็นผู้แจ้ง Finding แล้วยังไม่มีผู้ตรวจประสิทธิผลที่ยืนยัน; ไม่สมมติผู้แทน
- DAR/Step 4 และหน้าจอ Step 7 ยังต้องตรวจรับกับผู้ใช้; ข้อขัดแย้งเอกสารอำนาจ §4/§6.2 และนโยบายผู้รับทราบจริงยังคงเดิม
- Records evidence ยังไม่มี checksum ใน schema: guard ใหม่ตรวจไฟล์/ขนาด ไม่ตรวจจับการแก้ bytes ที่ขนาดเท่าเดิม; DAR ใช้ SHA-256 ที่มีอยู่แล้ว การตรวจ storage ไม่ป้องกันการเปลี่ยนไฟล์จากภายนอกหลังตรวจเสร็จ
- Dashboard ทดสอบกับข้อมูลคงที่ระหว่าง request; ไม่ได้ยืนยัน snapshot consistency ระหว่างหลาย query ขณะที่มี concurrent writes
- ไม่ได้เพิ่ม optimistic concurrency/version tokens ให้ฟอร์มแก้ไขทั่วไป; stale DAR source และ repeated workflow commands อยู่ในขอบเขตที่ทดสอบแล้ว
