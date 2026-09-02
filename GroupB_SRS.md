# Software Requirements Specification (SRS) — Group B Only

## E-Filing Phase 1: Records / Audit / Finding / CAR / Operational Dashboard

**โครงการ:** E-Filing Phase 1 MVP + Operational Dashboard (ขอบเขตเฉพาะกลุ่ม B)
**หน่วยงาน:** สำนักงานคณบดีคณะวิศวกรรมศาสตร์ มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา
**สถานะ:** Draft for Advisor Review
**จัดทำโดย:** ปวริศ คูณศรี, อภิรญา สายนาคำ (SE02 Group B)
**เสนอต่อ:** อาจารย์ธนิต เกตุแก้ว (อาจารย์ที่ปรึกษา)
**วันที่จัดทำ:** 2026-08-25

**หมายเหตุ:** เอกสารนี้คัดเฉพาะขอบเขตของกลุ่ม B ออกมาจาก SRS ฉบับรวมสองกลุ่ม (`Extra details/E-Filing_Phase1_SRS_Revised_GroupA_GroupB.md`) และเติมรายละเอียด Use Case แบบเต็มจาก `Extra details/E-Filing_Phase1_Detailed_UseCase_Specification.md` เพื่อใช้เสนอขอความเห็นชอบจากอาจารย์ที่ปรึกษาโดยเฉพาะ **ไม่ใช่เนื้อหาที่จะนำไปใส่ในบทที่ 3 ของรูปเล่มโดยตรง** จึงไม่ได้จัดรูปแบบตามคู่มือปริญญานิพนธ์ ทุกข้อความอ้างอิงย้อนกลับไปยังเอกสารต้นทางที่ตรวจสอบแล้วเท่านั้น ไม่มีความต้องการที่คิดขึ้นใหม่

---

## 1. Introduction

### 1.1 Purpose
เอกสารนี้จัดทำขึ้นเพื่อสรุปความต้องการซอฟต์แวร์ของระบบในความรับผิดชอบของกลุ่ม B ให้อาจารย์ที่ปรึกษาพิจารณาและให้ความเห็นชอบ ก่อนที่ทีมจะเริ่มออกแบบ ERD, API Contract และ UI Wireframe โดยละเอียดในบทที่ 3 ของรูปเล่ม รวมถึงเป็นช่องทางขอคำตัดสินใจในประเด็นที่ยังเปิดอยู่ (ดูหัวข้อ 13)

### 1.2 Scope
**กลุ่ม B รับผิดชอบ:** Records/Evidence, Audit & Finding, CAR (Corrective Action Request), Overdue Monitor, Operational Dashboard, Export Summary

**กลุ่ม B ไม่รับผิดชอบ (เป็นของกลุ่ม A):** Document Control, DAR (Document Action Request), Publication, Obsolete/Archive, Revision History, Acknowledgement — กลุ่ม B **อ่านข้อมูลเหล่านี้ผ่าน Shared Contract เท่านั้น** ห้ามสร้างหรือแก้ไขข้อมูลเอกสารซ้ำ เนื่องจากกลุ่ม A เป็น Single Source of Truth ของข้อมูลเอกสาร

**ร่วมกับกลุ่ม A (Shared):** Login/RBAC, User/Role, Audit Trail, Seed Data, Integration Contract

### 1.3 Definitions
| Term | Meaning |
|---|---|
| Record | หลักฐานว่าได้ดำเนินการแล้ว เช่น form ที่กรอกแล้ว, checklist, audit evidence |
| Finding | ผลการตรวจ เช่น NC (Nonconformity), OFI (Opportunity for Improvement), Observation |
| CAR | Corrective Action Request สำหรับติดตามการแก้ไข |
| Overdue | ค่าที่ระบบคำนวณ ไม่ใช่สถานะหลัก ดูนิยามในหัวข้อ 3.2 |
| RBAC | Role-Based Access Control |
| Document (อ้างอิงจากกลุ่ม A) | เอกสารที่ต้องควบคุม เช่น QM, QP, WI, SD, FM template |
| Current Version (อ้างอิงจากกลุ่ม A) | เอกสารฉบับที่อนุมัติและประกาศใช้ล่าสุด |

---

## 2. Overall Description

### 2.1 Product Perspective
ระบบกลุ่ม B เป็นระบบติดตาม Records, Audit, Finding, CAR และ Dashboard ที่ทำงานคู่กับระบบกลุ่ม A โดยดึงข้อมูลสถานะเอกสารและอัตราการรับทราบจากกลุ่ม A ผ่าน Shared API Contract เท่านั้น ไม่ duplicate schema เอกสารของตนเอง

### 2.2 User Classes
มติของทีมกำหนดบทบาทผู้ใช้ไว้ 4 บทบาท ตารางด้านล่างแสดงการเทียบกับ Actor ที่ระบุไว้ในเอกสาร SRS/Use Case ต้นทาง (ACT-01–09):

| บทบาท (4 บทบาทตามมติทีม) | เทียบเท่า Actor ในเอกสารต้นทาง | บทบาทหลักในโมดูลกลุ่ม B |
|---|---|---|
| **Admin** | ACT-07 IT/Admin | จัดการ user/role/master data, ดู audit trail ทั้งหมด, สำรองข้อมูล |
| **ISO/QA User** | ACT-04 ISO/QA Admin (ครึ่งงานฝั่ง B) | ดู dashboard, ดู audit trail, กำกับ workflow CAR, verify/close CAR |
| **Auditor** | ACT-05 Auditor | สร้าง audit session, บันทึก finding, เปิด CAR จาก finding, verify/close CAR, export รายงาน |
| **CAR Owner** | ACT-06 CAR Owner | วิเคราะห์ root cause, บันทึก corrective action, แนบ evidence, ส่ง verify |

ACT-01 (End User) และ ACT-08/09 (Group A/B System) เกี่ยวข้องกับกลุ่ม B เฉพาะฝั่งอ่าน dashboard และ integration API เท่านั้น ไม่ถือเป็นบทบาทผู้ใช้แยกในระบบกลุ่ม B

### 2.3 Operating Environment
- Web browser บนเครื่องคอมพิวเตอร์หรืออุปกรณ์มือถือผ่าน responsive web
- Backend API ร่วมกับกลุ่ม A
- Relational database เช่น PostgreSQL
- File storage สำหรับ evidence files
- Development/UAT environment ภายในโครงการ

### 2.4 Design Constraints
- ใช้ single-level approval สำหรับ MVP ก่อน (ตามกรอบร่วมของ Phase 1)
- ไม่ทำ SSO/LDAP/Email/OCR integration จริงในรอบนี้
- Dashboard ต้องใช้ข้อมูลจริงจาก transaction ไม่ใช้ mock data เป็นผลลัพธ์สุดท้าย
- กลุ่ม B ต้องอ้างอิง `document_id`/`document_code`/`version`/`status` จากกลุ่ม A ตาม Shared Contract ห้าม duplicate schema

### 2.5 Assumptions and Dependencies
- กลุ่ม A เปิด Integration API (`/integration/document-summary`, `/integration/ack-summary`) ให้กลุ่ม B ดึงข้อมูลได้ตามกำหนด
- นักศึกษาสองกลุ่มต้อง lock ERD และ API contract ร่วมกันก่อนเริ่ม dev หลัก
- มีข้อมูลตัวอย่างสำหรับ seed data (audit checklist, CAR form ที่ใช้งานจริงของหน่วยงาน)

---

## 3. System States and Business Rules

### 3.1 Finding Status
Finding มีสถานะอย่างน้อย Open และสามารถนำไปสู่การเปิด CAR ได้ (สำหรับประเภท NC) ส่วนประเภท OFI ไม่บังคับต้องเปิด CAR ทันที (อ้างอิง Use Case Spec SC-B03-02)

### 3.2 CAR Status (4 สถานะ)

| สถานะ | ความหมาย | ผู้เปลี่ยนสถานะได้ |
|---|---|---|
| Open | เปิด CAR ใหม่จาก finding ยังไม่เริ่มแก้ไข | Auditor / ISO/QA User |
| In Progress | CAR Owner กำลังวิเคราะห์สาเหตุและดำเนินการแก้ไข | CAR Owner |
| Pending Verify | ส่งผลการแก้ไขให้ทวนสอบ รอผลการทวนสอบ | CAR Owner |
| Closed | ทวนสอบผ่านและปิด CAR แล้ว | Auditor / ISO/QA User |

**กฎการเปลี่ยนสถานะ:** `Open → In Progress → Pending Verify → Closed` หากทวนสอบ **ไม่ผ่าน** ระบบต้องเปลี่ยนสถานะกลับเป็น `In Progress` พร้อมบันทึก comment เหตุผล — ระบบนี้**ไม่มีสถานะ Reopened แยกต่างหาก**

**Overdue** ไม่ใช่สถานะหลักของ CAR แต่เป็นค่าที่ระบบคำนวณจาก `due_date < วันปัจจุบัน AND status ≠ Closed`

### 3.3 Business Rules ที่เกี่ยวข้องกับกลุ่ม B
1. Record/Finding/CAR ต้องสามารถ trace กลับไปยัง document หรือ evidence ได้
2. CAR overdue คำนวณจาก `due_date` และ status ที่ยังไม่ Closed
3. Dashboard ของ Phase 1 ต้องใช้ข้อมูลจริงจากกลุ่ม A และกลุ่ม B ไม่ใช้ mock เป็นผลลัพธ์สุดท้าย
4. ผู้บันทึก root cause/corrective action ของ CAR (CAR Owner) ต้องไม่ใช่ผู้ verify/close CAR ใบเดียวกัน (Separation of Duty)
5. ป้องกันการเปิด CAR ซ้ำจาก finding ที่มี CAR เปิดอยู่แล้ว (Traceability Matrix SC-B04-02)

---

## 4. Functional Requirements

### 4.1 Group B — Records / Audit / CAR / Dashboard
| FR ID | Area | Requirement | Priority | Mapped UC |
|---|---|---|---|---|
| FR-B01 | Record CRUD | ระบบต้องสร้าง/แก้ไข/ค้นหา record ได้ | Must | UC-B01 |
| FR-B02 | Evidence Linkage | ระบบต้องแนบ evidence file และผูกกับ document_id/record_id ได้ | Must | UC-B01, UC-B03, UC-B05 |
| FR-B03 | Audit Header | ระบบต้องสร้าง audit round/header/scope/date/auditor ได้ | Should | UC-B02 |
| FR-B04 | Finding | ระบบต้องบันทึก finding พร้อม type/severity/description/status ได้ | Must | UC-B03 |
| FR-B05 | Finding Traceability | ระบบต้องผูก finding กับ document/record/evidence ได้ | Must | UC-B03 |
| FR-B06 | CAR Create | ระบบต้องสร้าง CAR จาก finding ได้ | Must | UC-B04 |
| FR-B07 | CAR Detail | ระบบต้องเก็บ owner, due_date, root_cause, corrective_action, status ได้ | Must | UC-B04, UC-B05 |
| FR-B08 | CAR Evidence | ระบบต้องแนบ evidence ให้ CAR ได้ | Must | UC-B05 |
| FR-B09 | Overdue Logic | ระบบต้องคำนวณ overdue status จาก due_date และ status | Must | UC-B07 |
| FR-B10 | Verify/Close | ระบบต้องบันทึกผลการ verify และ close CAR ได้ หากผล verify ไม่ผ่านต้องย้อนสถานะ CAR กลับเป็น In Progress พร้อม comment | Should | UC-B06 |
| FR-B11 | Dashboard Document Status | dashboard ต้องแสดงจำนวนเอกสารตามสถานะจาก Group A | Must | UC-B08 |
| FR-B12 | Dashboard Ack Rate | dashboard ต้องแสดง acknowledgement rate จาก Group A | Must | UC-B08 |
| FR-B13 | Dashboard CAR/Finding | dashboard ต้องแสดง CAR open/overdue/closed และ recent findings | Must | UC-B08 |
| FR-B14 | Export Summary | ระบบควร export summary report เบื้องต้นได้ | Should | UC-B09 |

### 4.2 Shared Requirements ที่กลุ่ม B ต้องพึ่งพา
| FR ID | Area | Requirement | Priority | Mapped UC |
|---|---|---|---|---|
| FR-SH01 | Authentication | ระบบต้องมี login/session หรือ JWT-based authentication | Must | UC-S01 |
| FR-SH02 | RBAC | ระบบต้องมี role-based access control ขั้นพื้นฐาน | Must | UC-S01, UC-S02 |
| FR-SH03 | Shared User/Role | ระบบต้องมี user_id/role_id กลางใช้ร่วมกัน | Must | UC-S02 |
| FR-SH04 | Audit Trail | ระบบต้องบันทึก audit trail สำหรับ event สำคัญ | Must | UC-S03 |
| FR-SH05 | Seed Data | ระบบต้องมี seed data เพื่อ demo/UAT | Must | UC-S02 |

### 4.3 Requirement Traceability — วัตถุประสงค์บทที่ 1, Business Objective และ Stakeholder

ตารางนี้โยง Functional Requirement ของกลุ่ม B กลับไปยัง **วัตถุประสงค์ของโครงงานวิศวกรรมในบทที่ 1** (`Project report/บทที่ 1 บทนำ.docx` หัวข้อ 1.2 — มี 4 ข้อ) และ **Business Objective ระดับโครงการ** (BRD §5) รวมถึง Stakeholder หลัก (BRD §7) เพื่อแสดงว่าแต่ละความต้องการมีที่มาที่ตรวจสอบได้ ทั้งจากรูปเล่มและจากเอกสารความต้องการของโครงการ ไม่ใช่การเพิ่มความต้องการใหม่ **วัตถุประสงค์บทที่ 1 และ BO ของ BRD เป็นเอกสารคนละชุดกัน** (BO ครอบคลุมทั้งสองกลุ่ม ส่วนวัตถุประสงค์บทที่ 1 เฉพาะกลุ่ม B) จึงแยกคอลัมน์ให้ชัดเจน

| วัตถุประสงค์บทที่ 1 (1.2.x) | Business Objective ที่เกี่ยวข้อง (BRD §5) | FR ที่เกี่ยวข้อง | Stakeholder หลักที่ได้ประโยชน์ (BRD §7) |
|---|---|---|---|
| 1.2.1 พัฒนาระบบจัดเก็บบันทึกข้อมูลและหลักฐานในฐานข้อมูลกลาง | BO-05 (บางส่วน) | FR-B01, FR-B02 | Auditor, CAR Owner, ISO/QA Admin |
| 1.2.2 พัฒนาระบบบันทึกประเด็นที่พบจากการตรวจติดตาม พร้อมหลักฐานอ้างอิง และสรุปผลตรวจติดตามเบื้องต้น | BO-05 | FR-B03, FR-B04, FR-B05 | Auditor, ISO/QA Admin |
| 1.2.3 พัฒนาระบบบริหารจัดการ CAR ตั้งแต่เปิดใบจนถึงปิดงาน | BO-05 | FR-B06, FR-B07, FR-B08, FR-B10 | CAR Owner, Auditor, ISO/QA Admin |
| 1.2.4 พัฒนาระบบติดตามกำหนดเวลาและคำนวณ Overdue โดยอัตโนมัติ | BO-05 (เกณฑ์ overdue) | FR-B09 | CAR Owner, ISO/QA Admin, Management Viewer |
| *(ไม่มีข้อตรงตัวในบทที่ 1 — ดูข้อสังเกต)* | BO-06 ทำให้ dashboard ใช้ข้อมูลจริง | FR-B11, FR-B12, FR-B13, FR-B14 | ผู้บริหาร/สำนักงานคณบดี (Sponsor), ISO/QA Admin, Management Viewer |
| *(ไม่มีข้อตรงตัวในบทที่ 1 — เป็นวัตถุประสงค์ระดับโครงการ ไม่ใช่ระดับวิชาการ)* | BO-07 รองรับการพัฒนาต่อใน Phase 2/3 | FR-SH01–FR-SH05 (พื้นฐานร่วม) | IT/Admin, Student Group B (Delivery Team) |
| *(ไม่เกี่ยวกับกลุ่ม B)* | BO-01–BO-04 (ของกลุ่ม A: ลดความเสี่ยงเอกสารผิดเวอร์ชัน, ลดเวลาค้นหา, DAR digital, หลักฐานรับทราบ) | ไม่มี FR-B ตรงตัว — กลุ่ม B สนับสนุนทางอ้อมผ่าน FR-B11/FR-B12 ที่แสดงผลข้อมูลของกลุ่ม A บน dashboard เท่านั้น | End User, Document Owner, Approver (stakeholder ฝั่งกลุ่ม A) |

**ข้อสังเกต:**
1. ไม่มี FR-B ใดผูกกับ BO-01–04 โดยตรง เพราะวัตถุประสงค์เหล่านี้อยู่ในความรับผิดชอบของกลุ่ม A ทั้งหมด กลุ่ม B เกี่ยวข้องเฉพาะฐานะผู้แสดงผลข้อมูลบน dashboard (FR-B11, FR-B12) เท่านั้น จึงไม่ควรตีความว่ากลุ่ม B ต้องรับผิดชอบผลลัพธ์ของ BO-01–04
2. **Dashboard/Export (FR-B11–FR-B14) ไม่มีวัตถุประสงค์ตรงตัวในบทที่ 1** แม้ชื่อโครงงานจะระบุ "พร้อมแดชบอร์ดปฏิบัติการ" และย่อหน้าที่มา (หัวข้อ 1.1) จะกล่าวถึงแดชบอร์ดไว้ชัดเจนก็ตาม วัตถุประสงค์ 1.2.1–1.2.4 ที่มีอยู่ไม่ได้ตั้งข้อสำหรับแดชบอร์ดโดยเฉพาะ — ควรสอบถามอาจารย์ที่ปรึกษาว่าจะเพิ่มเป็นวัตถุประสงค์ข้อที่ 5 ในบทที่ 1 หรือถือเป็นผลลัพธ์ประกอบของวัตถุประสงค์อื่น

---

## 5. Non-Functional Requirements (คัดเฉพาะที่บังคับกับกลุ่ม B)

| NFR ID | Category | Requirement | Priority | Mapped Scope |
|---|---|---|---|---|
| NFR-01 | Security | RBAC ต้องบังคับสิทธิ์ทั้งเมนูและ API สำคัญของโมดูลกลุ่ม B | Must | All secure UCs |
| NFR-02 | Auditability | event สำคัญ (สร้าง/แก้ไข/verify/close CAR) ต้องเก็บ who/what/when และ before-after เท่าที่จำเป็น | Must | UC-S03, B workflow |
| NFR-04 | Performance | การค้นหา record ในชุดข้อมูล pilot ต้องตอบสนองในเวลาที่เหมาะสม | Should | UC-B01 |
| NFR-05 | Maintainability | โค้ดต้องแยก module ของกลุ่ม B และแยก business logic ออกจาก route/controller | Must | All |
| NFR-06 | Interoperability | กลุ่ม B ต้องใช้ข้อมูล document ผ่าน Shared Contract ไม่ duplicate schema แบบแยกกัน | Must | UC-B08 |
| NFR-08 | Reliability | demo workflow หลัก (Record → Finding → CAR → Evidence → Verify/Close) ต้องทำงานซ้ำได้ไม่ล้มใน UAT | Must | All critical paths |

---

## 6. External Interface Requirements

### 6.1 User Interface Requirements
| UI ID | Screen | Purpose |
|---|---|---|
| UI-B01 | Record List/Form | จัดการ records/evidence |
| UI-B02 | Audit/Finding Form | บันทึก audit/finding |
| UI-B03 | CAR List/Detail | ติดตาม CAR ตามสถานะ 4 สถานะ |
| UI-B04 | Overdue Monitor | ดู CAR เกินกำหนด |
| UI-B05 | Operational Dashboard | ภาพรวม document/ack/CAR/finding |
| UI-S03 | Audit Trail Viewer | ดู audit trail (ร่วมกับกลุ่ม A) |

### 6.2 API Requirements
| API Area | Candidate Endpoints | หมายเหตุ |
|---|---|---|
| Records | `GET/POST /records`, `POST /records/{id}/files` | ของกลุ่ม B |
| Audit/Finding | `GET/POST /audits`, `GET/POST /findings` | ของกลุ่ม B |
| CAR | `GET/POST /cars`, `PATCH /cars/{id}`, `POST /cars/{id}/verify` | ของกลุ่ม B (ผลผ่าน → close, ผลไม่ผ่าน → กลับเป็น In Progress ไม่มี endpoint `reopen` แยก) |
| Dashboard | `GET /dashboard/summary` | ของกลุ่ม B |
| Export | `GET /exports/audit-summary`, `GET /exports/car-summary` | ของกลุ่ม B |
| Audit Trail | `GET /audit-trails` | Shared |
| **Integration (External — เป็นของกลุ่ม A)** | `GET /integration/document-summary`, `GET /integration/ack-summary` | กลุ่ม B **เรียกใช้เท่านั้น** ไม่ใช่เจ้าของ endpoint |

---

## 7. Logical Data Requirements

| Entity | Key Fields | Owner |
|---|---|---|
| Record | record_id, type, title, date, owner_id, document_id (อ้างอิง), evidence_file_id | B |
| Audit | audit_id, title, scope, date, auditor_id | B |
| Finding | finding_id, audit_id, type (NC/OFI/Observation), severity, description, status, document_id/record_id (อ้างอิง) | B |
| CAR | car_id, finding_id, owner_id, due_date, root_cause, corrective_action, status, evidence_file_id | B |
| AuditTrail | actor, action, object_type, object_id, timestamp, before/after (เท่าที่จำเป็น) | Shared |

**ฟิลด์ที่อ้างอิงข้ามจากกลุ่ม A (ห้าม duplicate schema):** `document_id`, `document_code`, `version_id`, `status` (ของเอกสาร) — ดึงผ่าน Integration API ในหัวข้อ 6.2 เท่านั้น

---

## 8. Use Case Summary

| UC ID | Owner Group | Use Case | Primary Actor | Mapped FR | Mapped Screen | Mapped API | Test Case |
|---|---|---|---|---|---|---|---|
| UC-S01 | Shared | Login and Access System | ทุกบทบาท | FR-SH01 | Login | POST /auth/login | TC-S01 |
| UC-S02 | Shared | Manage Users and Roles | Admin | FR-SH02, FR-SH03 | User/Role Management | GET/POST /users | TC-S02 |
| UC-S03 | Shared | View Audit Trail | Admin / Auditor / ISO/QA User | FR-SH04, NFR-02 | Audit Trail Viewer | GET /audit-trails | TC-S03 |
| UC-B01 | Group B | Create Record / Evidence | ISO/QA User / Auditor / CAR Owner | FR-B01, FR-B02, NFR-02 | Record Form | POST /records; POST /records/{id}/files | TC-B01 |
| UC-B02 | Group B | Create Audit Session / Audit Header | Auditor / ISO/QA User | FR-B03 | Audit Form | POST /audits | TC-B02 |
| UC-B03 | Group B | Record Audit Finding | Auditor / ISO/QA User | FR-B04, FR-B05, NFR-02 | Finding Form | POST /findings | TC-B03 |
| UC-B04 | Group B | Create CAR from Finding | Auditor / ISO/QA User | FR-B06, FR-B07 | CAR Form | POST /cars | TC-B04 |
| UC-B05 | Group B | Update Root Cause and Corrective Action | CAR Owner | FR-B07, FR-B08, NFR-02 | CAR Detail | PATCH /cars/{id}; POST /cars/{id}/evidence | TC-B05 |
| UC-B06 | Group B | Verify and Close CAR | ISO/QA User / Auditor | FR-B10, FR-SH04 | CAR Verification | POST /cars/{id}/verify | TC-B06 |
| UC-B07 | Group B | Monitor Overdue CAR | ISO/QA User / CAR Owner / Management Viewer | FR-B09, FR-B13 | Overdue Monitor | GET /cars?status=overdue | TC-B07 |
| UC-B08 | Group B | View Operational Dashboard | ISO/QA User / Management Viewer / Auditor | FR-B11, FR-B12, FR-B13, NFR-06 | Dashboard | GET /dashboard/summary | TC-B08 |
| UC-B09 | Group B | Export Audit/CAR/Dashboard Summary | ISO/QA User / Auditor | FR-B14, FR-SH04 | Export Screen | GET /exports/audit-summary; GET /exports/car-summary | TC-B09 |

---

## 9. Detailed Use Cases

### UC-S01 — Login and Access System
| หัวข้อ | รายละเอียด |
|---|---|
| Owner Group | Shared |
| Primary Actor | ทุกบทบาท (Admin / ISO-QA User / Auditor / CAR Owner) |
| Trigger | ผู้ใช้ต้องการเข้าใช้งานระบบ |
| Preconditions | ผู้ใช้มีบัญชีและถูกกำหนด role แล้ว |
| Postconditions | เข้าสู่ระบบและเห็นเมนูตามสิทธิ์ |

**Main Success Scenario:** 1) เปิดหน้า Login 2) กรอก username/password 3) ระบบตรวจสอบข้อมูลผู้ใช้ 4) ระบบสร้าง session/token 5) ระบบแสดงเมนูตาม role

**Alternative/Exception Flows:** ข้อมูลเข้าสู่ระบบผิด → แจ้งเตือนและไม่อนุญาตเข้าใช้งาน; บัญชีถูกปิด → แจ้งให้ติดต่อผู้ดูแลระบบ

**Acceptance Criteria:** ผู้ใช้แต่ละ role เห็นเมนูต่างกันตาม role matrix; endpoint สำคัญต้องตรวจสิทธิ์ก่อนตอบกลับ

**Test Scenarios:** SC-S01-01 Login สำเร็จ, SC-S01-02 Login ผิดรหัสผ่าน, SC-S01-03 ผู้ใช้ไม่มีสิทธิ์เรียก endpoint ที่ห้าม

---

### UC-S02 — Manage Users and Roles
| หัวข้อ | รายละเอียด |
|---|---|
| Owner Group | Shared |
| Primary Actor | Admin |
| Trigger | ต้องเพิ่มผู้ใช้หรือกำหนด role ให้ตรงกับงานจริง |
| Preconditions | ผู้ดูแลระบบเข้าสู่ระบบแล้ว |
| Postconditions | ผู้ใช้มี role พร้อมใช้งานใน workflow |

**Main Success Scenario:** 1) เปิดเมนูผู้ใช้ 2) เพิ่ม/แก้ไขข้อมูลผู้ใช้ 3) กำหนด role และ department 4) บันทึก 5) ระบบบันทึก audit trail

**Alternative/Exception Flows:** ข้อมูลซ้ำ → แจ้งเตือน; role ไม่ถูกต้อง → ไม่ให้บันทึก

**Acceptance Criteria:** ผู้ใช้ถูกผูก role ได้อย่างน้อย 1 role; การเปลี่ยน role ถูกบันทึกใน audit trail

**Test Scenarios:** SC-S02-01 เพิ่มผู้ใช้ใหม่, SC-S02-02 เปลี่ยน role

---

### UC-B01 — Create Record / Evidence
| หัวข้อ | รายละเอียด |
|---|---|
| Owner Group | Group B |
| Primary Actor | ISO/QA User / Auditor / CAR Owner |
| Mapped FR | FR-B01, FR-B02 |
| เอกสารอ้างอิง | Records, Audit Evidence, QP-2301-0102 |
| Trigger | ต้องเก็บหลักฐานประกอบเอกสาร/audit/CAR |
| Preconditions | ผู้ใช้มีสิทธิ์สร้าง record และมี document reference ถ้ามี |
| Postconditions | record/evidence ถูกสร้างและผูก document_id หรือ finding/CAR ได้ |

**Main Success Scenario:** 1) เปิดเมนู Records 2) กด Create Record 3) กรอก record type/title/date/owner 4) เลือก document reference 5) แนบไฟล์ evidence 6) บันทึก 7) ระบบสร้าง audit trail

**Alternative/Exception Flows:** ไม่พบ document_id จากกลุ่ม A → บันทึกแบบ temporary reference หรือแจ้งเตือน; ไฟล์ผิดชนิด → ไม่ให้แนบ

**Acceptance Criteria:** record ค้นหาได้ตาม type/date/document; record ผูกกับ document/finding/CAR ได้; evidence file ดาวน์โหลดได้ตามสิทธิ์

**Test Scenarios:** SC-B01-01 สร้าง record ผูกกับเอกสาร, SC-B01-02 แนบ evidence ให้ CAR, SC-B01-03 ค้นหา record ตาม document

---

### UC-B02 — Create Audit Session / Audit Header
| หัวข้อ | รายละเอียด |
|---|---|
| Owner Group | Group B |
| Primary Actor | Auditor / ISO/QA User |
| Mapped FR | FR-B03 |
| เอกสารอ้างอิง | QP-2301-0102, Audit Plan/Checklist |
| Trigger | ต้องเปิดรอบการตรวจติดตามภายใน |
| Preconditions | Auditor/ISO-QA User มีสิทธิ์ |
| Postconditions | audit session/header ถูกสร้างพร้อมขอบเขตการตรวจ |

**Main Success Scenario:** 1) เปิดเมนู Audit 2) กด Create Audit 3) กรอก audit title/date/scope/auditor 4) เลือก process/document ที่เกี่ยวข้อง 5) บันทึก

**Alternative/Exception Flows:** ไม่ระบุ scope → แจ้งเตือน; audit date ไม่ถูกต้อง → ไม่ให้บันทึก

**Acceptance Criteria:** audit session ใช้เป็น parent ของ finding ได้; แสดงรายการ audit ตามวัน/สถานะได้

**Test Scenarios:** SC-B02-01 สร้าง audit รอบ internal audit, SC-B02-02 สร้าง audit โดยไม่ระบุ auditor

---

### UC-B03 — Record Audit Finding
| หัวข้อ | รายละเอียด |
|---|---|
| Owner Group | Group B |
| Primary Actor | Auditor / ISO/QA User |
| Mapped FR | FR-B04, FR-B05 |
| เอกสารอ้างอิง | FM-QP-2301-0102-02 Audit Checklist, FM-QP-2301-0102-04 NC Form |
| Trigger | พบ observation, nonconformity หรือ opportunity for improvement |
| Preconditions | มี audit session หรือสิทธิ์สร้าง finding |
| Postconditions | finding ถูกบันทึกและสามารถเปิด CAR ต่อได้ |

**Main Success Scenario:** 1) เปิด audit session 2) เลือก Create Finding 3) ระบุ finding type/description/clause/process/document 4) แนบ evidence หรือเลือก record 5) บันทึก 6) ระบบตั้ง status Open

**Alternative/Exception Flows:** finding เป็น OFI → อาจยังไม่เปิด CAR; finding เป็น NC → ระบบเสนอให้เปิด CAR; evidence ไม่ครบ → บันทึกเป็น draft หรือแจ้งเตือน

**Acceptance Criteria:** finding อ้างอิง document หรือ process ได้; finding ผูก evidence/record ได้; finding status ติดตามได้

**Test Scenarios:** SC-B03-01 บันทึก finding พร้อม evidence, SC-B03-02 บันทึก OFI ไม่เปิด CAR อัตโนมัติ, SC-B03-03 เปิด CAR จาก finding

---

### UC-B04 — Create CAR from Finding
| หัวข้อ | รายละเอียด |
|---|---|
| Owner Group | Group B |
| Primary Actor | Auditor / ISO/QA User |
| Mapped FR | FR-B06, FR-B07 |
| เอกสารอ้างอิง | QP-2301-0109, FM-QP-2301-0109-01 CAR |
| Trigger | finding ต้องได้รับ corrective action |
| Preconditions | มี finding status Open หรือ Need CAR |
| Postconditions | CAR สถานะ Open พร้อม owner/due date |

**Main Success Scenario:** 1) เปิด finding 2) เลือก Create CAR 3) ระบุ owner/due date/severity 4) ระบุ problem statement เบื้องต้น 5) บันทึก 6) ระบบแจ้งสถานะ Open

**Alternative/Exception Flows:** ไม่กำหนด owner/due date → ไม่ให้สร้าง; finding ถูกปิดแล้ว → ไม่ให้เปิด CAR ใหม่เว้นแต่มีสิทธิ์; **finding มี CAR เปิดอยู่แล้ว → ระบบแจ้ง duplicate/open CAR exists**

**Acceptance Criteria:** CAR ผูก finding_id; CAR มี owner/due_date/status; CAR ปรากฏใน dashboard และ overdue monitor

**Test Scenarios:** SC-B04-01 เปิด CAR จาก finding NC, SC-B04-02 ป้องกันเปิด CAR ซ้ำจาก finding เดิม, SC-B04-03 CAR ใหม่แสดงใน dashboard

---

### UC-B05 — Update Root Cause and Corrective Action
| หัวข้อ | รายละเอียด |
|---|---|
| Owner Group | Group B |
| Primary Actor | CAR Owner |
| Mapped FR | FR-B07, FR-B08 |
| เอกสารอ้างอิง | QP-2301-0109, CAR Form |
| Trigger | CAR Owner ต้องตอบ CAR |
| Preconditions | CAR อยู่ในสถานะ Open/In Progress และ user เป็น owner หรือมีสิทธิ์ |
| Postconditions | CAR มี root cause, corrective action และ evidence |

**Main Success Scenario:** 1) CAR Owner เปิดรายการ CAR ของตนเอง 2) กรอก root cause 3) กรอก corrective action 4) แนบ evidence/record 5) อัปเดต status เป็น **Pending Verify** 6) ระบบบันทึก audit trail

**Alternative/Exception Flows:** ไม่มี evidence → แจ้งเตือนหรือบันทึกเป็น In Progress; ผู้ใช้ไม่ใช่ owner → ไม่อนุญาตแก้ไข

**Acceptance Criteria:** root cause และ corrective action ต้องไม่ว่างก่อนส่ง verify; evidence ต้องผูก record หรือ file ได้; status ต้องเปลี่ยนตาม workflow

**Test Scenarios:** SC-B05-01 CAR Owner กรอก RCA/action และแนบ evidence, SC-B05-02 CAR Owner ส่ง verify โดยไม่มี action

---

### UC-B06 — Verify and Close CAR
| หัวข้อ | รายละเอียด |
|---|---|
| Owner Group | Group B |
| Primary Actor | ISO/QA User / Auditor |
| Mapped FR | FR-B10, FR-SH04 |
| เอกสารอ้างอิง | QP-2301-0109, FM-QP-2301-0109-02 |
| Trigger | CAR ถูกส่งเพื่อ verify |
| Preconditions | CAR status **Pending Verify** |
| Postconditions | CAR ถูกปิด (Closed) หรือย้อนสถานะกลับเป็น In Progress |

**Main Success Scenario:** 1) Auditor/ISO-QA User เปิด CAR 2) ตรวจ root cause/action/evidence 3) บันทึกผล verify: ผ่าน (Close) หรือไม่ผ่าน (ย้อนกลับเป็น In Progress) 4) ระบุ verification note 5) ระบบปรับ status และบันทึก audit trail

**Alternative/Exception Flows:** evidence ไม่พอ → ย้อนสถานะกลับเป็น In Progress พร้อม comment (ไม่มีสถานะ Reopened แยก); action ไม่แก้ root cause → ย้อนสถานะกลับเป็น In Progress พร้อม comment; ผ่าน → Close และบันทึก closed_date

**Acceptance Criteria:** Close ต้องมี verification note; การย้อนกลับต้องมีเหตุผล; dashboard ต้องปรับจำนวน open/closed/overdue

**Test Scenarios:** SC-B06-01 Verify และ Close CAR (จาก Pending Verify), SC-B06-02 Verify ไม่ผ่าน → ย้อนกลับเป็น In Progress พร้อม comment

---

### UC-B07 — Monitor Overdue CAR
| หัวข้อ | รายละเอียด |
|---|---|
| Owner Group | Group B |
| Primary Actor | ISO/QA User / CAR Owner / Management Viewer |
| Mapped FR | FR-B09, FR-B13 |
| เอกสารอ้างอิง | CAR Tracking |
| Trigger | ต้องติดตามรายการเกินกำหนดหรือใกล้ครบกำหนด |
| Preconditions | มี CAR พร้อม due_date |
| Postconditions | ผู้ใช้เห็นรายการ overdue และจัดลำดับติดตามได้ |

**Main Success Scenario:** 1) เปิด Overdue Monitor 2) ระบบคำนวณจาก due_date และ status 3) แสดงรายการ Overdue/Due Soon 4) ผู้ใช้ filter ตาม owner/status 5) เปิด detail เพื่อติดตาม

**Alternative/Exception Flows:** ไม่มี overdue → แสดงสถานะ 0; due date ถูกแก้ไข → คำนวณใหม่และบันทึก audit trail

**Acceptance Criteria:** Overdue = `due_date < today AND status ≠ Closed`; filter by owner/status/date ได้; รายการ overdue แสดงใน dashboard

**Test Scenarios:** SC-B07-01 CAR เกินกำหนดแสดงเป็น overdue, SC-B07-02 CAR closed แล้วไม่แสดง overdue

---

### UC-B08 — View Operational Dashboard
| หัวข้อ | รายละเอียด |
|---|---|
| Owner Group | Group B |
| Primary Actor | ISO/QA User / Management Viewer / Auditor |
| Mapped FR | FR-B11, FR-B12, FR-B13 |
| เอกสารอ้างอิง | Operational Dashboard / Phase 1 BRD |
| Trigger | ต้องเห็นภาพรวมสถานะ Phase 1 |
| Preconditions | มีข้อมูลจากกลุ่ม A และกลุ่ม B |
| Postconditions | dashboard แสดงสถานะจากข้อมูลจริง |

**Main Success Scenario:** 1) เปิด Dashboard 2) ระบบดึง document status summary จากกลุ่ม A 3) ระบบดึง acknowledgement summary 4) ระบบดึง finding/CAR/overdue จากกลุ่ม B 5) แสดง cards/charts/recent list 6) ผู้ใช้ drill down ไปยังรายการได้

**Alternative/Exception Flows:** Integration API ของกลุ่ม A unavailable → แสดง warning และแสดงเฉพาะส่วนกลุ่ม B; ไม่มีข้อมูล → แสดง 0/empty state

**Acceptance Criteria:** dashboard ไม่ใช้ mock/hardcode; มี card อย่างน้อย Total Documents, Published, Ack Rate, Open CAR, Overdue CAR, Recent Findings; ตัวเลขต้องตรงกับฐานข้อมูลและ shared API

**Test Scenarios:** SC-B08-01 Dashboard แสดง document status จากกลุ่ม A, SC-B08-02 Dashboard แสดง Open/Overdue/Closed CAR, SC-B08-03 Integration API ของกลุ่ม A unavailable

---

### UC-B09 — Export Audit/CAR/Dashboard Summary
| หัวข้อ | รายละเอียด |
|---|---|
| Owner Group | Group B |
| Primary Actor | ISO/QA User / Auditor |
| Mapped FR | FR-B14, FR-SH04 |
| เอกสารอ้างอิง | Audit Report, CAR Summary |
| Trigger | ต้องนำข้อมูลไปประกอบการประชุมหรือการตรวจติดตาม |
| Preconditions | มีข้อมูล audit/finding/CAR/dashboard |
| Postconditions | ได้ไฟล์ export หรือรายงาน summary |

**Main Success Scenario:** 1) เปิดเมนู Report/Export 2) เลือกชนิดรายงาน 3) กำหนดช่วงวันที่/สถานะ 4) กด Export 5) ระบบสร้างไฟล์หรือแสดงตารางสำหรับนำออก

**Alternative/Exception Flows:** ไม่มีข้อมูลในช่วงที่เลือก → ส่งไฟล์ว่างพร้อมหัวตารางหรือแสดง empty state; ผู้ใช้ไม่มีสิทธิ์ export → ปฏิเสธ

**Acceptance Criteria:** รายงานอย่างน้อยต้อง export รายการ finding และ CAR summary ได้; ต้องระบุวันที่สร้างรายงานและผู้สร้าง

**Test Scenarios:** SC-B09-01 Export CAR summary, SC-B09-02 Export finding list

---

### UC-S03 — View Audit Trail
| หัวข้อ | รายละเอียด |
|---|---|
| Owner Group | Shared |
| Primary Actor | Admin / Auditor / ISO/QA User |
| Mapped FR | FR-SH04 |
| เอกสารอ้างอิง | Audit Trail Requirements |
| Trigger | ต้องตรวจสอบย้อนหลังว่าใครทำอะไรเมื่อไร |
| Preconditions | มี event ในระบบ |
| Postconditions | ผู้ใช้เห็น audit trail ตามสิทธิ์ |

**Main Success Scenario:** 1) เปิด Audit Trail 2) เลือก object type หรือ user/date 3) ระบบแสดง event list 4) ผู้ใช้เปิดรายละเอียด event 5) ถ้ามีสิทธิ์ export ได้

**Alternative/Exception Flows:** ไม่มีสิทธิ์ดู log → ปฏิเสธ; ไม่พบ event → แสดง empty state

**Acceptance Criteria:** event สำคัญต้องมี actor/action/object_type/object_id/timestamp; log ต้องถูกแก้ไขโดยผู้ใช้ทั่วไปไม่ได้

**Test Scenarios:** SC-S03-01 ดู log การ close CAR, SC-S03-02 End User พยายามดู audit trail (ควรถูกปฏิเสธ)

---

## 10. Acceptance Criteria ระดับระบบ (ขอบเขตกลุ่ม B)

1. กลุ่ม B ทำ flow ครบ: Record → Finding → CAR → Evidence → Verify/Close
2. Dashboard แสดงข้อมูลจริงจากกลุ่ม A และกลุ่ม B ไม่ใช้ mock เป็นผลลัพธ์สุดท้าย
3. ทุก critical event มี audit trail อย่างน้อย actor/action/entity/time
4. RBAC ป้องกันการเข้าถึงหรือแก้ไขข้อมูลนอกสิทธิ์ รวมถึงบังคับ Separation of Duty ของ CAR
5. ข้อมูล document_id/document_code/version/status ใช้ร่วมกันได้กับกลุ่ม A ผ่าน Shared Contract
6. UAT scenario ที่เกี่ยวข้องกับกลุ่ม B ใน Traceability Matrix ต้องผ่านก่อน demo ผู้ใช้งานจริง

**UAT Checklist ขั้นต่ำ (Traceability Matrix §8.2, ปรับตามสถานะ CAR ที่แก้ไขแล้ว):**
- สร้าง record/evidence และผูกกับ document_id ได้
- สร้าง audit round และ finding ได้
- เปิด CAR จาก finding ได้ และป้องกันเปิดซ้ำ
- CAR Owner กรอก root cause/action/evidence ได้
- Auditor/ISO-QA User บันทึกผล verify และ close CAR ได้ (ไม่ผ่านย้อนกลับเป็น In Progress)
- ระบบแสดง overdue CAR ได้ถูกต้อง
- dashboard แสดงข้อมูลจริงจากกลุ่ม A และกลุ่ม B

---

## 11. Test Strategy

- **Unit Test:** validate service logic เช่น overdue calculation, CAR status transition
- **API Test:** ใช้ Postman/HTTP client ทดสอบ endpoint ของกลุ่ม B ตามหัวข้อ 6.2
- **Integration Test:** กลุ่ม B เรียก document/ack summary จากกลุ่ม A ผ่าน Integration API
- **Workflow Test:** ทดสอบ end-to-end scenario ตาม Test Case กลุ่ม B (TC-B01–TC-B09)
- **UAT:** ใช้ข้อมูลตัวอย่างจาก audit checklist และ CAR form ที่เลือกเป็น pilot

---

## 12. Requirement Ownership

| Area | Owner Group | Remarks |
|---|---|---|
| Login/RBAC/User/Role | Shared | ต้องตกลงก่อน dev หลัก |
| Document Control/DAR/Publication/Ack | Group A | **นอกขอบเขตกลุ่ม B** — กลุ่ม B อ่านผ่าน Integration API เท่านั้น |
| Records/Audit/Finding/CAR | Group B | ผูกกับ document_id จากกลุ่ม A |
| Dashboard/Export | Group B | ต้องไม่ใช้ mock เป็นผลลัพธ์สุดท้าย |
| Audit Trail | Shared | อาจแยกตารางเดียวหรือ service กลาง |

---

## 13. ประเด็นที่ต้องขอความเห็นชอบจากอาจารย์ที่ปรึกษา

| ประเด็น | รายละเอียด | ต้องการคำตอบ/การตัดสินใจ |
|---|---|---|
| สิทธิ์ปิด CAR | ให้ Auditor/ISO-QA User close ได้เท่านั้น หรือ CAR Owner close ได้ด้วย | ยืนยันบทบาทผู้มีสิทธิ์ close CAR |
| ผู้ verify effectiveness ของ CAR | ใครเป็นผู้ยืนยันว่าการแก้ไขได้ผลจริงก่อน close | กำหนด role matrix ของการ verify |
| Record Retention | ระยะเวลาเก็บ record แต่ละประเภท กำหนดตอนนี้หรือ note ไว้ก่อน | ตัดสินใจ policy การเก็บ record |
| Finding Type | ใช้ NC/OFI/Observation ตามนี้ หรือมีประเภทอื่นเพิ่ม | ยืนยัน master data ของ finding type |
| Dashboard minimum | การ์ด/กราฟใดเป็นขั้นต่ำที่ผู้ใช้ต้องการ นอกเหนือจาก 6 การ์ดที่ระบุในหัวข้อ 9 (UC-B08) | กำหนด dashboard backlog ขั้นต่ำ |
| ไลบรารีกราฟสำหรับ Dashboard | ยังไม่เลือก รอเติมในบทที่ 2 หัวข้อ 2.2.8 ของรูปเล่ม | เลือกไลบรารีที่จะใช้จริง |

---

## ภาคผนวก — เอกสารต้นทางที่ใช้อ้างอิง

| เอกสาร | ใช้เพื่อ |
|---|---|
| `Extra details/01_BRD_Phase1_Updated_RMUTL_ISO9001.md` | Business Requirements, Business Objectives และ Stakeholders (หัวข้อ 4.3), Open Issues (หัวข้อ 13) |
| `Extra details/E-Filing_Phase1_SRS_Revised_GroupA_GroupB.md` | โครงสร้าง SRS, FR/NFR, System States, Interface, Logical Data (หัวข้อ 1–7, 10–12) |
| `Extra details/E-Filing_Phase1_Detailed_UseCase_Specification.md` | รายละเอียด Use Case แบบเต็ม (หัวข้อ 9) |
| `Extra details/E-Filing_Phase1_SRS_Traceability_Matrix_GroupA_GroupB.md` | Use Case Summary, UAT Checklist, Gap/Decision Log (หัวข้อ 8, 10, 13) |
| `GroupB_Software_Requirements.md` | เอกสารความต้องการทำงานภายในทีม (ฉบับย่อ) ที่เอกสารนี้ขยายต่อ |
| `Project report/บทที่ 1 บทนำ.docx` | วัตถุประสงค์ของโครงงานวิศวกรรม 4 ข้อ (หัวข้อ 1.2) ใช้ทำ Requirement Traceability ในหัวข้อ 4.3 |

เอกสารทั้งหมดข้างต้นผ่านการแก้ไขสถานะ CAR จาก 5 สถานะให้เหลือ 4 สถานะ (`Open → In Progress → Pending Verify → Closed`) เรียบร้อยแล้ว ก่อนจัดทำเอกสารฉบับนี้
