# รายการตรวจสอบความคืบหน้าและการสอบกลับ

> ไฟล์นี้สร้างด้วย `npm run trace` จาก `packages/traceability/traceability.yaml`
> และผลสแกนความเห็น `@trace` ในโค้ดจริง **ห้ามแก้ด้วยมือ**

สร้างเมื่อ 2026-09-07 · สัญลักษณ์ ⬜ ยังไม่ได้ทำ · 🟡 มีโค้ดแล้ว · ✅ มีเทสต์แล้ว

## สรุป

| หมวด | ทั้งหมด | ⬜ | 🟡 | ✅ |
|---|---:|---:|---:|---:|
| กรณีการใช้งาน | 16 | 15 | 1 | 0 |
| ความต้องการเชิงหน้าที่ | 38 | 35 | 3 | 0 |
| เกณฑ์การยอมรับ | 13 | 13 | 0 | 0 |

## กรณีการใช้งาน พร้อมสายโยงกลับไปต้นทาง

| | รหัส | ชื่อ | กลุ่ม | ผู้กระทำหลัก | วัตถุประสงค์ | ความต้องการเชิงธุรกิจ | ความต้องการเชิงหน้าที่ | เกณฑ์การยอมรับ |
|---|---|---|---|---|---|---|---|---|
| ⬜ | UC-01 | Create Document Draft | A | Document Owner | ยังไม่มีเอกสารวัตถุประสงค์รองรับ (กลุ่ม A) | BR-01, BR-18 | FR-A01, FR-A02, FR-A03 | AC-01 |
| ⬜ | UC-02 | Submit DAR | A | Document Owner | ยังไม่มีเอกสารวัตถุประสงค์รองรับ (กลุ่ม A) | BR-03 | FR-A05 | AC-02 |
| ⬜ | UC-03 | Review/Approve/Reject DAR | A | Approver | ยังไม่มีเอกสารวัตถุประสงค์รองรับ (กลุ่ม A) | BR-04 | FR-A06 | AC-02 |
| ⬜ | UC-04 | Publish Current Version | A | ISO Admin | ยังไม่มีเอกสารวัตถุประสงค์รองรับ (กลุ่ม A) | BR-02, BR-05, BR-06, BR-16 | FR-A04, FR-A07, FR-A08 | AC-03 |
| ⬜ | UC-05 | Obsolete Document | A | ISO Admin | ยังไม่มีเอกสารวัตถุประสงค์รองรับ (กลุ่ม A) | BR-05, BR-16 | FR-A04, FR-A07, FR-A08 | AC-04 |
| ⬜ | UC-06 | Search/View Document | A | End User | ยังไม่มีเอกสารวัตถุประสงค์รองรับ (กลุ่ม A) | BR-01, BR-16 | FR-A09, FR-A15 | AC-12 |
| ⬜ | UC-07 | Acknowledge Document | A | End User | ยังไม่มีเอกสารวัตถุประสงค์รองรับ (กลุ่ม A) | BR-07 | FR-A10, FR-A11 | AC-05 |
| ⬜ | UC-08 | Create Record/Evidence | B | ISO User / CAR Owner | OBJ-1.2.1 | BR-08 | FR-B01, FR-B02, FR-B16, FR-B17 | AC-06 |
| ⬜ | UC-09 | Create Finding (Audit / Non-Audit Source) | B | Auditor / ISO Admin (DCC) | OBJ-1.2.2 | BR-09 | FR-B03, FR-B04, FR-B05 | AC-07 |
| ⬜ | UC-10 | Open CAR | B | ISO Admin / Auditor | OBJ-1.2.3 | BR-10 | FR-B06 | AC-08 |
| ⬜ | UC-11 | Update/Verify/Close CAR | B | CAR Owner / Auditor | OBJ-1.2.3 | BR-10, BR-11 | FR-B07, FR-B08, FR-B09, FR-B10 | AC-08 |
| ⬜ | UC-12 | View Operational Dashboard | B | ISO Admin / Manager | OBJ-1.2.4 | BR-11, BR-12, BR-13 | FR-B11, FR-B12, FR-B13 | AC-09 |
| ⬜ | UC-13 | Export Summary | B | ISO Admin / Auditor | OBJ-1.2.2 | — | FR-A12, FR-B14 | — |
| 🟡 | UC-14 | View Audit Trail | Shared | ISO Admin / Auditor | ยังไม่มีเอกสารวัตถุประสงค์รองรับ | BR-06, BR-14 | FR-SH04 | — |
| ⬜ | UC-15 | Data Retention & Destruction Management | Shared | ISO Admin (DCC) / QMR | ยังไม่มีเอกสารวัตถุประสงค์รองรับ | BR-15 | FR-A13, FR-B15, FR-SH06 | AC-11 |
| ⬜ | UC-16 | My Task Checklist | A | End User / Document Owner / Approver | ยังไม่มีเอกสารวัตถุประสงค์รองรับ (กลุ่ม A) | BR-17 | FR-A16 | AC-13 |

## ความต้องการเชิงหน้าที่

| | รหัส | ข้อกำหนด | กลุ่ม | ลำดับความสำคัญ | กรณีการใช้งาน |
|---|---|---|---|---|---|
| ⬜ | FR-A01 | ระบบต้องสร้าง แก้ไข แสดง และค้นหา document master ได้ | A | Must | UC-01 |
| ⬜ | FR-A02 | ระบบต้องเก็บ metadata: document_code, title, type, department, owner, approver, version, status | A | Must | UC-01 |
| ⬜ | FR-A03 | ระบบต้อง upload/download ไฟล์เอกสารได้ พร้อมตรวจสอบขนาดไฟล์สูงสุดตามประเภทเอกสาร (BRULE-EFL-27) | A | Must | UC-01 |
| ⬜ | FR-A04 | ระบบต้องควบคุมสถานะ Draft/Review/Approved/Published/Obsolete | A | Must | UC-04, UC-05 |
| ⬜ | FR-A05 | ระบบต้องสร้าง DAR พร้อม action type ครบ 4 ประเภท (CREATE / AMEND / CANCEL / REQUEST_UNCONTROLLED) และ reason ได้ — ปรับปรุงตามมติผู้ใช้อ้างอิง QP-2301-0107 ข้อ 6.5.1 (REF-13) แทนที่แนวทางเดิมที่เคยพิจารณาเพิ่มประเภท hold/cancel-hold | A | Must | UC-02 |
| ⬜ | FR-A06 | ระบบต้องมี approval queue และ approve/reject พร้อม comment | A | Must | UC-03 |
| ⬜ | FR-A07 | ระบบต้อง publish current version ได้เพียงหนึ่งฉบับ (และตั้ง Obsolete รุ่นก่อนหน้าอัตโนมัติ) | A | Must | UC-04, UC-05 |
| ⬜ | FR-A08 | ระบบต้องบันทึก revision history ของเอกสาร (เข้าถึงได้จำกัดสิทธิ์ผ่าน Alternate Flow A1) | A | Must | UC-04, UC-05 |
| ⬜ | FR-A09 | ระบบต้องค้นหาด้วย code/title/type/department ได้ | A | Must | UC-06 |
| ⬜ | FR-A10 | ระบบต้องกำหนดกลุ่มเป้าหมายผู้รับทราบเอกสารได้ทั้งแบบแผนก/บทบาท และเจาะจงรายบุคคล (Dual Mapping) — สถาปัตยกรรมยืนยันแล้วจาก TBD-EFL-05 RESOLVED เพื่อลด Alert Fatigue | A | Should (ตามเอกสารต้นทาง) | UC-07 |
| ⬜ | FR-A11 | ระบบต้องบันทึก acknowledgement user/time/document version | A | Must | UC-07 |
| ⬜ | FR-A12 | ระบบต้องให้ Group B module ดึง Document/Acknowledgement Summary ผ่าน Internal Interface ได้ (กลไกอัตโนมัติ — ดู §3.3.1) | A | Must | UC-13 |
| ⬜ | FR-A13 | ระบบต้องรองรับกระบวนการขอทำลายเอกสาร (Document) สถานะ Obsolete ที่ครบเกณฑ์จัดเก็บขั้นต่ำ ผ่านการอนุมัติก่อนเสมอ | A | Must | UC-15 |
| ⬜ | FR-A15 | ระบบต้องแสดงป้ายกำกับ/ลายน้ำ "สำเนาไม่ควบคุม / Uncontrolled Copy" บนหน้าพรีวิว ไฟล์ดาวน์โหลด และผลพิมพ์ของเอกสาร Published ทุกครั้ง (มติผู้ใช้ อ้างอิง QP-2301-0107 ข้อ 6.6, REF-13) | A | Must | UC-06 |
| ⬜ | FR-A16 | ระบบต้องแสดงรายการงานค้างส่วนบุคคล (DAR รออนุมัติ/ทบทวน, เอกสารรอรับทราบ) เฉพาะของผู้ใช้ปัจจุบัน แยกจาก Operational Dashboard รวมของ Group B | A | Should | UC-16 |
| ⬜ | FR-B01 | ระบบต้องสร้าง/แก้ไข/ค้นหา record ได้ | B | Must | UC-08 |
| ⬜ | FR-B02 | ระบบต้องแนบ evidence file และผูกกับ document_id, finding_id หรือ car_id ได้อย่างน้อยหนึ่งรายการ (ปรับปรุงให้สอดคล้องกับ BRULE-EFL-06 และ Direct Issue Linkage) | B | Must | UC-08 |
| ⬜ | FR-B03 | ระบบควรสร้าง audit header หรือ AuditRound ได้ (Single Header ต่อรอบปี ผูก Lead Auditor และ Finding/NC เป็น Child Record — สถาปัตยกรรมยืนยันแล้วจาก TBD-EFL-06 RESOLVED) | B | Should (ตามเอกสารต้นทาง) | UC-09 |
| ⬜ | FR-B04 | ระบบต้องบันทึก finding และ type/severity/description ได้ ไม่ว่าจะมาจาก Audit หรือ Non-Audit Source | B | Must | UC-09 |
| ⬜ | FR-B05 | ระบบต้องผูก finding กับ document/record/evidence ได้ (audit_round_id เป็น Nullable — TBD-EFL-15 RESOLVED) | B | Must | UC-09 |
| ⬜ | FR-B06 | ระบบต้องสร้าง CAR จาก finding ได้ | B | Must | UC-10 |
| ⬜ | FR-B07 | ระบบต้องเก็บ owner, due_date, root_cause, corrective_action, status | B | Must | UC-11 |
| ⬜ | FR-B08 | ระบบต้องแนบ evidence ให้ CAR ได้ | B | Must | UC-11 |
| ⬜ | FR-B09 | ระบบต้องคำนวณ overdue status จาก due_date และ status | B | Must | UC-11 |
| ⬜ | FR-B10 | ระบบควรรองรับ Verify/Close/Reopen CAR แบบ Two-Step Authorization โดยแยกสิทธิ์ผู้ Verify (Assistant DCC/Auditor ผู้แจ้งพบ) ออกจากผู้ Close (QMR/Lead Auditor) — สถาปัตยกรรมยืนยันแล้วจาก TBD-EFL-07 RESOLVED | B | Should (ตามเอกสารต้นทาง) | UC-11 |
| ⬜ | FR-B11 | dashboard ต้องแสดง document status จาก Group A | B | Must | UC-12 |
| ⬜ | FR-B12 | dashboard ต้องแสดง acknowledgement rate จาก Group A (ต้องป้องกัน Divide-by-Zero — E2) | B | Must | UC-12 |
| ⬜ | FR-B13 | dashboard ต้องแสดง CAR open/overdue/closed และ recent findings | B | Must | UC-12 |
| ⬜ | FR-B14 | ระบบควร export summary report เบื้องต้นได้ (เช่น Acknowledgement Logs เป็น CSV/xlsx) | B | Should | UC-13 |
| ⬜ | FR-B15 | ระบบต้องรองรับกระบวนการขอทำลายบันทึกคุณภาพ (Quality Record) ที่ Retention Clock ครบกำหนดตามตารางระยะเวลาจัดเก็บ ผ่านการอนุมัติก่อนเสมอ | B | Must | UC-15 |
| ⬜ | FR-B16 | ระบบต้องรองรับการแนบไฟล์หลักฐานมากกว่า 1 ไฟล์ต่อ record เดียว (Multi-File Attachment ผ่าน Entity RecordFile) | B | Must | UC-08 |
| ⬜ | FR-B17 | ระบบต้องรองรับการผูก record เข้ากับ finding_id หรือ car_id ได้โดยตรงโดยไม่บังคับต้องมี document_id (Direct Issue Linkage — document_id เป็น Nullable) | B | Must | UC-08 |
| 🟡 | FR-SH01 | ระบบต้องมี Login และ JWT-based session หรือเทียบเท่า | Shared | Must | — |
| 🟡 | FR-SH02 | ระบบต้องมี RBAC ขั้นพื้นฐาน | Shared | Must | — |
| ⬜ | FR-SH03 | ระบบต้องมี shared role และ shared user id ระหว่าง Group A/B | Shared | Must | — |
| 🟡 | FR-SH04 | ระบบต้องบันทึก audit trail สำหรับ event สำคัญ | Shared | Must | UC-14 |
| ⬜ | FR-SH05 | ระบบต้องมี seed data จาก Master List/DAR/Pilot documents | Shared | Must | — |
| ⬜ | FR-SH06 | ระบบต้องบันทึก Destruction Log (ผู้ร้องขอ, ผู้อนุมัติ, รายการ, วันที่) ทุกครั้งที่มีการทำลายข้อมูล และเก็บรักษา log นี้ไว้อย่างน้อย 5 ปี โดยห้ามลบข้อมูลอัตโนมัติ (No Auto-Deletion) | Shared | Must | UC-15 |

## ความต้องการเชิงธุรกิจ

| รหัส | ข้อกำหนด | ความต้องการเชิงหน้าที่ | กรณีการใช้งาน |
|---|---|---|---|
| BR-01 | Document registry กลางอ้างอิง Master List ได้ | FR-A01, FR-A02 | UC-01, UC-06 |
| BR-02 | ควบคุม current version ของเอกสารได้ | FR-A04, FR-A07 | UC-04 |
| BR-03 | รองรับ DAR สำหรับสร้าง/แก้ไข/ยกเลิกเอกสาร | FR-A05 | UC-02 |
| BR-04 | รองรับการอนุมัติตามบทบาท | FR-A06 | UC-03 |
| BR-05 | รองรับ publish/obsolete | FR-A04, FR-A07, FR-A08 | UC-04, UC-05 |
| BR-06 | รองรับ revision history และ audit trail | FR-A08, FR-SH04 | UC-04, UC-14 |
| BR-07 | รองรับ acknowledgement | FR-A10, FR-A11 | UC-07 |
| BR-08 | รองรับ records/evidence | FR-B01, FR-B02 | UC-08 |
| BR-09 | รองรับ audit/finding | FR-B03, FR-B04, FR-B05 | UC-09 |
| BR-10 | รองรับ CAR lifecycle | FR-B06, FR-B07, FR-B08, FR-B10 | UC-10, UC-11 |
| BR-11 | มี overdue monitoring | FR-B09 | UC-11, UC-12 |
| BR-12 | มี operational dashboard จากข้อมูลจริง | FR-B11, FR-B12, FR-B13 | UC-12 |
| BR-13 | มี shared contract ระหว่าง A/B |  | UC-12 |
| BR-14 | มี role-based access ขั้นพื้นฐาน | FR-SH02, FR-SH03 | FR-SH03, UC-14 |
| BR-15 | ปฏิบัติตามนโยบายวงจรชีวิตข้อมูล (Retention/Archival/Destruction) ตาม ISO 9001:2015 ข้อ 7.5.3 | FR-A13 | UC-15 |
| BR-16 | รักษาบัญชีผู้ถือครองเอกสารควบคุม (Distribution List) และแสดงสถานะ Controlled/Uncontrolled Copy ให้ถูกต้องตาม QMS Procedure (QP-2301-0107, QM-2301-01) | FR-A14 | UC-04, UC-05, UC-06 |
| BR-17 | แยก "งานของฉัน" (My Task Checklist) ของ Group A ออกจาก Operational Dashboard รวมของ Group B เพื่อป้องกันการทำงานซ้ำซ้อน | FR-A16 | UC-16 |
| BR-18 | ควบคุมขนาดไฟล์แนบของเอกสารคุณภาพให้เป็นไปตามเกณฑ์สูงสุดที่กำหนดแยกตามประเภทเอกสาร (QM/QP/SD/FM) | FR-A03 | UC-01 |

## เกณฑ์การยอมรับ

| | รหัส | เมื่อ (Given) | เมื่อทำ (When) | ต้องได้ (Then) | กรณีการใช้งาน |
|---|---|---|---|---|---|
| ⬜ | AC-01 | มี Document Draft ที่กรอก metadata ครบ | Document Owner สร้าง/บันทึกเอกสารพร้อมไฟล์แนบ | สร้าง document draft และแนบไฟล์ได้สำเร็จ | UC-01 |
| ⬜ | AC-02 | มี Document ที่ต้องการแก้ไข/ยกเลิก | Document Owner submit DAR แล้ว Approver ตัดสินใจ | DAR flow ทำได้อย่างน้อย submit → review/approve/reject | UC-02, UC-03 |
| ⬜ | AC-03 | Document อยู่ในสถานะ Approved | ISO Admin publish เอกสาร | ผู้ใช้เห็น current version ได้ | UC-04 |
| ⬜ | AC-04 | Document ถูก obsolete | End User ทั่วไปเปิดดูเอกสาร | ผู้ใช้ทั่วไปไม่เห็นเป็นฉบับใช้งาน | UC-05 |
| ⬜ | AC-05 | มี current document ที่มอบหมายให้รับทราบ | End User กดรับทราบ | acknowledgement เก็บ user/time/document version ได้ | UC-07 |
| ⬜ | AC-06 | มี document_id, finding_id หรือ car_id อย่างน้อยหนึ่งรายการที่ต้องการอ้างอิง | ISO User/CAR Owner สร้าง record พร้อมแนบไฟล์ (หนึ่งไฟล์ขึ้นไป) | record/evidence ผูกกับ document, finding หรือ CAR ได้อย่างน้อยหนึ่งรายการ และรองรับไฟล์แนบหลายไฟล์ผ่าน RecordFile | UC-08 |
| ⬜ | AC-07 | มี evidence หรือ document ที่เกี่ยวข้อง | Auditor สร้าง finding | finding ผูกกับ evidence หรือ document ได้ | UC-09 |
| ⬜ | AC-08 | มี finding ที่ต้องดำเนินการแก้ไข | ISO Admin/Auditor เปิด CAR และ CAR Owner ดำเนินการ | CAR ผูกกับ finding และมี due date/status/owner ได้ | UC-10, UC-11 |
| ⬜ | AC-09 | มีข้อมูล document/ack/CAR/finding ในระบบจริง | ผู้ใช้เปิด dashboard | dashboard แสดง document status, acknowledgement, CAR status, overdue ได้จากฐานข้อมูลจริง | UC-12 |
| ⬜ | AC-10 | มี document ที่เชื่อมกับ record/finding/CAR | ผู้ใช้ตรวจสอบ traceability | มี traceability จาก document → record/finding/CAR และจาก CAR → evidence | — |
| ⬜ | AC-11 | มีเอกสาร Obsolete ที่เก็บครบ ≥1 Revision หรือบันทึกคุณภาพที่ Retention Clock ครบกำหนด | ISO/QA Admin ยื่นคำร้องขอทำลายและได้รับอนุมัติจาก QMR/ผู้อนุมัติ | ระบบทำลายเฉพาะรายการที่อนุมัติแล้ว (Hard Delete) และบันทึก Destruction Log ครบถ้วน | UC-15 |
| ⬜ | AC-12 | มีเอกสาร Published ที่ถูกเปิด preview/ดาวน์โหลด/พิมพ์ | ผู้ใช้เปิดดู/ดาวน์โหลด/พิมพ์เอกสารดังกล่าว | ระบบแสดงป้ายกำกับ/ลายน้ำ "สำเนาไม่ควบคุม / Uncontrolled Copy" ทุกช่องทางเสมอ | UC-06 |
| ⬜ | AC-13 | End User/Document Owner/Approver มีงาน DAR หรือ Acknowledgement ค้างที่ผูกกับตนเอง | ผู้ใช้เปิดเมนู "งานของฉัน (My Task Checklist)" | ระบบแสดงเฉพาะงานค้างของผู้ใช้เอง แยกจาก Operational Dashboard รวมของ Group B โดยสมบูรณ์ | UC-16 |

## ผู้มีส่วนได้ส่วนเสีย

| ผู้มีส่วนได้ส่วนเสีย | ขอบเขตอำนาจ |
|---|---|
| ผู้บริหาร/สำนักงานคณบดี (Sponsor) | ไม่ปฏิบัติงานในระบบโดยตรง (ดู Dashboard) |
| ISO/QA Admin (DCC — Document Control Center/Coordinator) | Publish/Obsolete เอกสาร เฉพาะหลังได้รับอนุมัติจาก Approver แล้วเท่านั้น, เปิด CAR, ดูภาพรวมทั้งระบบ, จัดการบัญชีผู้ใช้และสิทธิ์พื้นฐาน; ห้ามทำหน้าที่ Approver เอง (Segregation of Duties ตาม TBD-EFL-04) |
| Document Owner | แก้ไขเฉพาะเอกสารของตน; ไม่ approve เอง |
| Approver | อนุมัติได้เฉพาะที่ได้รับมอบหมาย; แยกขาดจาก ISO Admin/DCC โดยเด็ดขาด — ไม่มีสิทธิ์ Publish เอง |
| QMR (ผู้แทนฝ่ายบริหาร / Management Representative) | มีสิทธิ์ Close CAR ร่วมกับ Lead Auditor (ดู TBD-EFL-07); ไม่ทำหน้าที่ Publish เอกสาร |
| End User | อ่าน/รับทราบเท่านั้น; ไม่แก้ไขเอกสาร |
| Auditor (ผู้ตรวจ/ผู้แจ้งพบข้อบกพร่อง) | สร้าง finding/CAR; มีสิทธิ์ Verify CAR เฉพาะกรณีเป็นผู้แจ้งพบข้อบกพร่องนั้นเอง; ไม่มีสิทธิ์ Close CAR เว้นแต่เป็น Lead Auditor |
| Lead Auditor (ผู้ตรวจประเมินหลักประจำรอบ/คณะ) | มีสิทธิ์ Close CAR ร่วมกับ QMR (Two-Step Authorization ตาม TBD-EFL-07) |
| Assistant DCC (ผู้ช่วยเลขานุการคณะกรรมการระบบคุณภาพ) | มีสิทธิ์ Verify CAR; ไม่มีสิทธิ์ Close CAR (แยกจากผู้ Close ตาม Segregation of Duties) |
| CAR Owner | แก้ไขเฉพาะ CAR ที่ตนรับผิดชอบ; ไม่มีสิทธิ์ Verify/Close CAR ของตนเอง |
| Student Group A / Group B (Delivery Team) | Group A ห้ามทำ Record/Finding/CAR/Dashboard หลัก; Group B ห้ามทำ Document Master/DAR Approval/Ack Assignment (ดู §2.5 และ Appendix B.5) |

## ช่องว่างที่ยังปิดไม่ได้

กรณีการใช้งาน 10 รายการยังไม่มีวัตถุประสงค์รองรับ ได้แก่ UC-01, UC-02, UC-03, UC-04, UC-05, UC-06, UC-07, UC-14, UC-15, UC-16

สาเหตุคือ `SRS_A+B.md` ไม่มีหัวข้อวัตถุประสงค์ วัตถุประสงค์ที่มีเอกสารรองรับคือ
ข้อ 1.2.1 ถึง 1.2.4 ในบทที่ 1 ของกลุ่ม B เท่านั้น ส่วนของกลุ่ม A ยังไม่มีเอกสาร
ในที่เก็บนี้ ช่องนี้จึงเว้นไว้ตามความจริง ไม่เติมด้วยการเดา
