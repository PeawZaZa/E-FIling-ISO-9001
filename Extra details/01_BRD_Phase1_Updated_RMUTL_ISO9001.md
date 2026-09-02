# 01 — BRD ปรับปรุง: E-Filing Phase 1 MVP + Operational Dashboard
## ระบบบริหารงานคุณภาพ ISO 9001:2015 สำนักงานคณบดีคณะวิศวกรรมศาสตร์ มทร.ล้านนา

**สถานะเอกสาร:** Working Draft v2.0  
**เจ้าของเอกสาร:** BA / Product Owner  
**ขอบเขต:** Phase 1 MVP + Operational Dashboard  
**หมายเหตุ:** เอกสารนี้ปรับปรุงจากแหล่งข้อมูลในโครงการ ได้แก่ Master Plan, Phase 1 BRD, SE02 Group A/B ที่อนุมัติ/นำเสนอแล้ว, เอกสารคุณภาพจริงของสำนักงานคณบดีคณะวิศวกรรมศาสตร์ มทร.ล้านนา เช่น QM, QP, SD, FM, Master List และ DAR โดยยังคงกรอบ Phase 1 MVP + Operational Dashboard: Group A = Document Control/DAR/Acknowledgement และ Group B = Records/Audit/CAR/Dashboard

---

## 1. บทสรุปผู้บริหาร

โครงการ E-Filing มีเป้าหมายเพื่อยกระดับระบบบริหารงานคุณภาพ ISO 9001:2015 จากการจัดการเอกสารและหลักฐานแบบกระดาษ/ไฟล์กระจัดกระจาย ไปสู่ระบบดิจิทัลที่ควบคุมเอกสาร หลักฐาน การตรวจติดตาม และการแก้ไขข้อบกพร่องได้จริง จุดเน้นของรอบนี้คือ **Phase 1 MVP + Operational Dashboard** เพื่อให้ส่งมอบได้ภายในบริบทโครงงานนักศึกษา 2 กลุ่ม กลุ่มละ 2 คน และใช้เป็นฐานต่อยอดสู่ Phase 2 และ Phase 3 ได้

ระบบจะอ้างอิงข้อมูลดิบจากเอกสารใช้งานจริง ได้แก่ Quality Manual, Quality Procedure, Support Document, Form, Master List และ DAR รวมทั้งใช้เอกสารโครงการ SE02 ของ Group A และ Group B เป็น baseline แต่จะปรับให้สอดคล้องกับ BRD/SRS กลางของ Phase 1 เพื่อควบคุม scope และลดความเสี่ยงในการรวมระบบ

---

## 2. ข้อมูลดิบและเอกสารอ้างอิงที่ใช้ประกอบการออกแบบ

| กลุ่มเอกสาร | ไฟล์/ตัวอย่าง | บทบาทต่อการออกแบบ |
|---|---|---|
| คู่มือคุณภาพ | QM-2301-01 / Quality Manual | ใช้เข้าใจภาพรวม QMS, process flow, scope ISO |
| ระเบียบปฏิบัติงาน | QP-2301-0107, QP-2301-0102, QP-2301-0109 และ QP อื่น | ใช้ออกแบบ process, workflow, role และเอกสารอ้างอิง |
| เอกสารสนับสนุน | SD ที่เกี่ยวข้องกับ QM/QP | ใช้ออกแบบ document relationship และ record reference |
| แบบฟอร์ม | DAR, Master List, Distribution List, Audit Checklist, CAR, NCR | ใช้ออกแบบ data field, form, evidence และ workflow |
| Master List | ทะเบียนชื่อเอกสาร | ใช้ seed ข้อมูล document master/document type/document code |
| DAR Register | ทะเบียนคุมใบขอดำเนินการเอกสาร | ใช้ออกแบบ DAR lifecycle และสถานะคำขอ |
| SE02 Group A | SE02_E-filing_GroupA_fix-4_thanit_signed.pdf | ใช้กำหนด scope ฝั่ง Document Control/DAR/Ack |
| SE02 Group B | se02_group_B_latest_version.pdf | ใช้กำหนด scope ฝั่ง Records/Audit/CAR/Dashboard |

---

## 3. Business Problem

### 3.1 ปัญหาเชิงธุรกิจ

1. เอกสารคุณภาพมีหลายประเภทและจำนวนมาก ทำให้การค้นหาเอกสารฉบับใช้งานจริงใช้เวลานาน
2. มีความเสี่ยงจากการใช้เอกสารผิดฉบับหรือเอกสารที่ถูกยกเลิกแล้ว
3. กระบวนการ DAR ยังมีโอกาสล่าช้าและตรวจสอบสถานะได้ไม่ชัดเจน
4. หลักฐานการรับทราบเอกสารยังต้องการระบบที่ตรวจสอบย้อนหลังได้
5. หลักฐาน audit, finding และ CAR กระจายอยู่หลายไฟล์ ทำให้ติดตามงานค้างได้ยาก
6. Dashboard ระดับปฏิบัติการยังไม่มีแหล่งข้อมูลจริงจาก transaction ของระบบ

### 3.2 ผลกระทบ

- เพิ่ม human error และงานซ้ำซ้อน
- ลดความพร้อมในการตรวจติดตามภายใน/ภายนอก
- ทำให้ระบบคุณภาพขึ้นกับบุคคลมากกว่าระบบ
- ใช้เวลามากในการเตรียมหลักฐาน audit
- ทำให้การปรับปรุงอย่างต่อเนื่องมองไม่เห็นข้อมูลเชิงสถานะที่ทันเวลา

---

## 4. Business Vision

> ระบบ E-Filing Phase 1 ต้องทำให้องค์กรมีแหล่งข้อมูลกลางสำหรับเอกสารคุณภาพฉบับปัจจุบัน หลักฐานการปฏิบัติงาน ผลการตรวจติดตาม และ CAR พร้อม dashboard ที่สะท้อนสถานะจริงของระบบคุณภาพ

---

## 5. Business Objectives

| ID | Objective | Success Signal |
|---|---|---|
| BO-01 | ลดความเสี่ยงจากการใช้เอกสารผิดเวอร์ชัน | ผู้ใช้เห็นเฉพาะ current published version ในงานประจำ |
| BO-02 | ลดเวลาค้นหาเอกสารและหลักฐาน | ค้นหาด้วย document code/title/type/status ได้ |
| BO-03 | ทำให้ DAR เป็น digital workflow | DAR มีสถานะและผู้รับผิดชอบชัดเจน |
| BO-04 | สร้างหลักฐานการรับทราบเอกสาร | acknowledgement มี user/time/version |
| BO-05 | ทำให้ finding และ CAR ติดตามได้ | CAR มี owner/due date/status/evidence |
| BO-06 | ทำให้ dashboard ใช้ข้อมูลจริง | dashboard ดึงข้อมูลจาก Document, Ack, Record, Finding, CAR |
| BO-07 | รองรับการพัฒนาต่อใน Phase 2/3 | data model แยก module และมี shared contract |

---

## 6. Scope ของ Phase 1 MVP

### 6.1 In Scope

| Area | รายละเอียด | Owner หลัก |
|---|---|---|
| Document Master | รหัสเอกสาร ชื่อ ประเภท หน่วยงาน เจ้าของเอกสาร สถานะ | Group A |
| Document Lifecycle | Draft, Review, Approved, Published, Obsolete | Group A |
| DAR | สร้าง/ทบทวน/อนุมัติ/ปฏิเสธ/ติดตามสถานะ | Group A |
| File Management | แนบไฟล์เอกสาร/หลักฐาน และเก็บ path/metadata | A/B แยกตาม module |
| Acknowledgement | มอบหมายผู้รับทราบและบันทึกการรับทราบ | Group A |
| Records/Evidence | สร้าง records และผูกกับ document/finding/CAR | Group B |
| Audit/Finding | บันทึก audit header, finding, evidence | Group B |
| CAR | open/update/verify/close, root cause, corrective action, due date | Group B |
| Dashboard | status cards/charts/recent lists/overdue | Group B |
| Audit Trail | who/what/when สำหรับ event สำคัญ | Shared |

### 6.2 Out of Scope รอบ 3 เดือน

- Risk register แบบเต็มระบบ
- HR/training matrix แบบเต็มระบบ
- Management Review แบบเต็มรูปแบบ
- Executive dashboard ขั้นสูง
- KPI analytics เชิงลึก
- SSO/LDAP จริง
- email/LINE notification จริง
- OCR/scanner integration
- mobile native application

---

## 7. Stakeholders และ Users

| Actor | บทบาท | ความต้องการหลัก |
|---|---|---|
| ผู้บริหาร/สำนักงานคณบดี | Sponsor / Decision maker | เห็นภาพรวมระบบคุณภาพและลดความเสี่ยง |
| ISO/QA Admin | System owner ฝั่งคุณภาพ | ควบคุมเอกสาร, DAR, audit trail, dashboard |
| Document Owner | เจ้าของเอกสาร | สร้าง/แก้ไข/ส่ง DAR |
| Approver | ผู้อนุมัติ | ตรวจ/อนุมัติ/ปฏิเสธเอกสาร |
| End User | ผู้ใช้งานเอกสาร | ค้นหา อ่าน รับทราบเอกสาร |
| Auditor | ผู้ตรวจติดตาม | บันทึก finding และตรวจหลักฐาน |
| CAR Owner | ผู้รับผิดชอบแก้ไข | บันทึก RCA/action/evidence และปิดงาน |
| Student Group A | Delivery Team A | พัฒนาส่วน Document Control/DAR/Ack |
| Student Group B | Delivery Team B | พัฒนาส่วน Records/Audit/CAR/Dashboard |

---

## 8. Business Process TO-BE

### 8.1 Document Control / DAR / Ack

1. Document Owner สร้าง draft document พร้อม metadata และไฟล์แนบ
2. Document Owner สร้าง DAR ระบุ action type เช่น new/revise/obsolete และเหตุผล
3. Approver ทบทวนและ approve/reject พร้อม comment
4. ISO/QA Admin publish เอกสาร approved เป็น current version
5. ระบบป้องกันไม่ให้ผู้ใช้ทั่วไปใช้ obsolete document
6. End User เปิดดูเอกสาร current version และกด acknowledgement
7. ระบบส่ง document status และ acknowledgement summary ให้ dashboard ของ Group B

### 8.2 Records / Audit / CAR / Dashboard

1. ISO User หรือผู้เกี่ยวข้องสร้าง record/evidence และผูกกับ document
2. Auditor บันทึก audit/finding และแนบ evidence
3. หาก finding ต้องดำเนินการแก้ไข ระบบเปิด CAR
4. CAR Owner บันทึก root cause, corrective action, evidence, due date
5. ISO/QA หรือ Auditor verify และ close CAR
6. Dashboard aggregate ข้อมูลจาก Group A และ Group B เพื่อแสดง operational summary

---

## 9. Business Requirements

| BR-ID | Business Requirement | Priority | Owner |
|---|---|---|---|
| BR-01 | ระบบต้องมี document registry กลางที่อ้างอิง Master List ได้ | Must | A |
| BR-02 | ระบบต้องควบคุม current version ของเอกสารได้ | Must | A |
| BR-03 | ระบบต้องรองรับ DAR สำหรับสร้าง/แก้ไข/ยกเลิกเอกสาร | Must | A |
| BR-04 | ระบบต้องรองรับการอนุมัติตามบทบาท | Must | A |
| BR-05 | ระบบต้องรองรับ publish/obsolete | Must | A |
| BR-06 | ระบบต้องรองรับ revision history และ audit trail | Must | A/Shared |
| BR-07 | ระบบต้องรองรับ acknowledgement | Must | A |
| BR-08 | ระบบต้องรองรับ records/evidence | Must | B |
| BR-09 | ระบบต้องรองรับ audit/finding | Must | B |
| BR-10 | ระบบต้องรองรับ CAR lifecycle | Must | B |
| BR-11 | ระบบต้องมี overdue monitoring | Must | B |
| BR-12 | ระบบต้องมี operational dashboard จากข้อมูลจริง | Must | B |
| BR-13 | ระบบต้องมี shared contract ระหว่าง A/B | Must | Shared |
| BR-14 | ระบบต้องมี role-based access ขั้นพื้นฐาน | Must | Shared |

---

## 10. Business Rules

1. Published document ที่เป็น current version ต้องมีเพียง 1 ฉบับต่อ document code
2. Obsolete document ต้องไม่แสดงเป็น default ให้ End User ใช้งาน
3. DAR ต้องระบุ requester, reviewer/approver, action type, reason และ status
4. ทุกการ approve/reject/publish/obsolete/acknowledge ต้องมี audit trail
5. Acknowledgement ต้องผูกกับ document version ไม่ใช่เฉพาะ document code
6. Record ต้องผูกกับ document หรือ finding/CAR อย่างน้อยหนึ่งรายการเมื่อเป็นหลักฐาน audit/CAR
7. CAR ต้องมี owner, due date, status, root cause, corrective action และ evidence ก่อน close
8. Dashboard ห้ามใช้ mock data ใน final demo ต้องดึงข้อมูลจาก transaction จริง
9. Group B ต้องอ้างอิงข้อมูล document จาก Group A ผ่าน shared contract ไม่สร้าง document master ซ้ำ
10. ในรอบ 3 เดือนใช้ single-level approval ก่อน ไม่ทำ multi-level approval ซับซ้อน

---

## 11. Data Domains ระดับ BRD

| Domain | Entity หลัก | Owner |
|---|---|---|
| Identity | User, Role, Department | Shared |
| Document | Document, DocumentVersion, DocumentFile, RevisionHistory | A |
| Workflow | DAR, ApprovalLog | A |
| Awareness | Acknowledgement, AckAssignment | A |
| Evidence | Record, RecordFile, RecordType | B |
| Audit | Audit, Finding, AuditEvidence | B |
| Corrective Action | CAR, CARAction, CAREvidence | B |
| Monitoring | DashboardMetric, OverdueView, AuditTrail | B/Shared |

---

## 12. Acceptance Criteria ระดับธุรกิจ

| AC-ID | Acceptance Criteria |
|---|---|
| AC-01 | สร้าง document draft และแนบไฟล์ได้ |
| AC-02 | DAR flow ทำได้อย่างน้อย submit → review/approve/reject |
| AC-03 | publish แล้วผู้ใช้เห็น current version ได้ |
| AC-04 | obsolete แล้วผู้ใช้ทั่วไปไม่เห็นเป็นฉบับใช้งาน |
| AC-05 | acknowledgement เก็บ user/time/document version ได้ |
| AC-06 | record/evidence ผูกกับ document ได้ |
| AC-07 | finding ผูกกับ evidence หรือ document ได้ |
| AC-08 | CAR ผูกกับ finding และมี due date/status/owner ได้ |
| AC-09 | dashboard แสดง document status, acknowledgement, CAR status, overdue ได้จากฐานข้อมูลจริง |
| AC-10 | มี traceability จาก document → record/finding/CAR และจาก CAR → evidence |

---

## 13. Group Split ที่ยืนยันสำหรับทำงานต่อ

| Module | Group A | Group B | หมายเหตุ |
|---|---|---|---|
| Auth/RBAC | ใช้ร่วม/อาจทำโครงกลาง | ใช้ร่วม | ต้องตกลง role เดียวกัน |
| Document Master | Primary | Read-only reference | ห้าม Group B สร้าง document master ซ้ำ |
| DAR | Primary | Read-only reference | Group B ใช้ใน dashboard ได้ |
| Acknowledgement | Primary | Consumer | B ใช้ summary เท่านั้น |
| Records | Reference | Primary | B ต้องผูก document_id จาก A |
| Audit/Finding | Reference | Primary | Finding อ้างเอกสาร/record |
| CAR | Reference | Primary | CAR อ้าง finding/evidence |
| Dashboard | Data provider | Primary | B ทำหน้ารวม |
| Audit Trail | Shared | Shared | อย่างน้อย log event สำคัญ |

---

## 14. Open Issues ก่อนเริ่ม ERD/API

| Issue | ต้องตัดสินใจ |
|---|---|
| User source | ใช้ user seed เอง หรือ import จากรายชื่อจริงบางส่วน |
| Document code uniqueness | unique ตาม document_code + revision หรือ document_code เดียวแล้ว version แยก |
| File storage | local disk สำหรับ demo หรือ object storage จำลอง |
| Approval role | Approver แยกจาก ISO Admin หรือ ISO Admin publish หลัง Approver approve |
| Ack assignment | assign ตาม role/department หรือเลือก user รายคน |
| Audit period | รอบ audit เป็น header ง่าย ๆ หรือแยกแผน audit รายหน่วยงาน |
| CAR verification | ให้ Auditor/ISO Admin close เท่านั้นหรือ CAR Owner close ได้ |

---

## 15. สรุป

BRD ฉบับปรับปรุงนี้ยืนยันว่า Phase 1 ต้องเป็นระบบที่ทำงานได้จริงใน 3 เดือน โดยให้ Group A เป็นเจ้าของแหล่งข้อมูลเอกสารและ workflow ด้าน DAR/Ack ส่วน Group B เป็นเจ้าของหลักฐาน การตรวจติดตาม CAR และ dashboard ทั้งสองกลุ่มต้องใช้ shared contract เดียวกันก่อนเริ่มออกแบบ ERD และ API Contract
