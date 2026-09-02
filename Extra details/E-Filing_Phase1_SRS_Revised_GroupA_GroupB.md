# E-Filing Phase 1 Software Requirements Specification (SRS) — Revised
## Group A / Group B / Shared Requirement Baseline

**โครงการ:** E-Filing Phase 1 MVP + Operational Dashboard  
**หน่วยงาน:** สำนักงานคณบดีคณะวิศวกรรมศาสตร์ มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา  
**สถานะ:** Working Draft v3.0  
**วันที่จัดทำ:** 2026-05-17  

---

## 1. Introduction

### 1.1 Purpose
เอกสารนี้เป็น **Software Requirements Specification (SRS) ฉบับปรับปรุง** สำหรับระบบ E-Filing Phase 1 MVP + Operational Dashboard เพื่อใช้เป็น requirement baseline สำหรับ Group A และ Group B ก่อนการออกแบบ ERD กลาง, Shared API Contract, UI Wireframe และ Test Plan

### 1.2 Scope
ระบบ Phase 1 ครอบคลุมการเปลี่ยนงานควบคุมเอกสารและหลักฐานของระบบบริหารงานคุณภาพ ISO 9001:2015 ให้เป็นระบบดิจิทัล โดยแบ่งเป็น 2 กลุ่มพัฒนา:

- **Group A:** Document Control, DAR, Publication, Obsolete, Revision History, Acknowledgement, Document Summary API
- **Group B:** Records, Audit, Finding, CAR, Overdue Monitor, Operational Dashboard, Export Summary
- **Shared:** Login, RBAC, User/Role, Audit Trail, Seed Data, Integration Contract

### 1.3 Definitions
| Term | Meaning |
|---|---|
| Document | เอกสารที่ต้องควบคุม เช่น QM, QP, WI, SD, FM template |
| Record | หลักฐานว่าได้ดำเนินการแล้ว เช่น form ที่กรอกแล้ว, checklist, audit evidence |
| DAR | Document Action Request หรือใบขอดำเนินการเอกสาร |
| Current Version | เอกสารฉบับที่อนุมัติและประกาศใช้ล่าสุด |
| Obsolete | เอกสารที่ยกเลิกหรือไม่ใช้งานแล้ว |
| Finding | ผลการตรวจ เช่น NC, OFI, Observation |
| CAR | Corrective Action Request สำหรับติดตามการแก้ไข |
| RBAC | Role-Based Access Control |

---

## 2. Overall Description

### 2.1 Product Perspective
ระบบเป็น web application ที่ทำหน้าที่เป็นศูนย์กลางของ E-Filing Phase 1 โดย Group A เป็นแหล่งข้อมูลเอกสารและ acknowledgement ส่วน Group B เป็นระบบติดตาม records, audit, CAR และ dashboard ที่ดึงข้อมูลจาก Group A ผ่าน shared API contract

### 2.2 User Classes
| Actor ID | Actor | คำอธิบาย | ความรับผิดชอบหลัก | กลุ่ม |
| --- | --- | --- | --- | --- |
| ACT-01 | End User | ผู้ใช้งานทั่วไป | ค้นหา/เปิดอ่านเอกสารฉบับปัจจุบัน, รับทราบเอกสาร, ดู dashboard ตามสิทธิ์ | A/B |
| ACT-02 | Document Owner | เจ้าของเอกสาร | สร้าง/แก้ไขเอกสาร, สร้าง DAR, ส่งขอทบทวน/อนุมัติ, ตรวจ revision history | A |
| ACT-03 | Approver | ผู้ทบทวน/ผู้อนุมัติ | Review/Approve/Reject เอกสารหรือ DAR พร้อม comment | A |
| ACT-04 | ISO/QA Admin | ผู้ควบคุมระบบคุณภาพ | Publish/Obsolete, กำหนดผู้รับทราบ, ดู audit trail, กำกับ workflow | A/B |
| ACT-05 | Auditor | ผู้ตรวจติดตาม | สร้าง audit/finding, ตรวจหลักฐาน, export รายงาน | B |
| ACT-06 | CAR Owner | ผู้รับผิดชอบ corrective action | วิเคราะห์ root cause, บันทึก corrective action, แนบ evidence, ส่ง verify/close | B |
| ACT-07 | IT/Admin | ผู้ดูแลระบบ | จัดการ user/role/master data, ตรวจ log, สำรองข้อมูลในระดับโครงการ | Shared |
| ACT-08 | Group A System | ระบบย่อย Document Control | ส่ง document status, current version, acknowledgement summary ให้ Group B | A→B |
| ACT-09 | Group B System | ระบบย่อย Records/Audit/CAR/Dashboard | อ่านข้อมูลเอกสารและ acknowledgement จาก Group A | B |


### 2.3 Operating Environment
- Web browser บนเครื่องคอมพิวเตอร์หรืออุปกรณ์มือถือผ่าน responsive web
- Backend API สำหรับ Group A/B
- Relational database เช่น PostgreSQL
- File storage สำหรับ document/evidence files
- Development/UAT environment ภายในโครงการ

### 2.4 Design Constraints
- ใช้ single-level approval สำหรับ MVP ก่อน
- ไม่ทำ SSO/LDAP/Email/OCR integration จริงในรอบนี้
- Dashboard ต้องใช้ข้อมูลจริงจาก transaction ไม่ใช้ mock data เป็นผลลัพธ์สุดท้าย
- Group B ต้องอ้างอิง document_id/document_code/version/status จาก Group A ตาม shared contract

### 2.5 Assumptions and Dependencies
- มีข้อมูลตัวอย่างจาก Master List และ DAR สำหรับ seed data
- ผู้ใช้จริงสามารถช่วยยืนยัน flow และ field ที่จำเป็นได้
- นักศึกษาสองกลุ่มต้อง lock ERD และ API contract ร่วมกันก่อนเริ่ม dev หลัก

---

## 3. System States and Business Rules

### 3.1 Document Status
| Status | Meaning | ผู้เปลี่ยนสถานะได้ |
|---|---|---|
| Draft | เอกสารร่าง | Owner / ISO Admin |
| Review | ส่งทบทวน/รออนุมัติ | Owner |
| Approved | ผ่านการอนุมัติ | Approver / ISO Admin |
| Published | เอกสารฉบับใช้งานจริง | ISO Admin |
| Obsolete | เอกสารยกเลิก/ไม่ใช้งาน | ISO Admin |

### 3.2 DAR Status
| Status | Meaning |
|---|---|
| Draft | ยังไม่ส่งคำขอ |
| Submitted | ส่งคำขอแล้ว |
| Reviewed | ทบทวนแล้ว |
| Approved | อนุมัติแล้ว |
| Rejected | ไม่อนุมัติ/ส่งกลับแก้ไข |
| Closed | ปิดคำขอแล้ว |

### 3.3 CAR Status
| Status | Meaning | ผู้เปลี่ยนสถานะได้ |
|---|---|---|
| Open | เปิด CAR ใหม่จาก finding ยังไม่เริ่มแก้ไข | Auditor / ISO Admin |
| In Progress | CAR Owner กำลังวิเคราะห์สาเหตุและดำเนินการแก้ไข | CAR Owner |
| Pending Verify | ส่งผลการแก้ไขให้ทวนสอบ รอผลการทวนสอบ | CAR Owner |
| Closed | ทวนสอบผ่านและปิด CAR แล้ว | Auditor / ISO Admin |

**กฎการเปลี่ยนสถานะ:** `Open → In Progress → Pending Verify → Closed` และหากทวนสอบ **ไม่ผ่าน** ระบบต้องเปลี่ยนสถานะกลับเป็น `In Progress` พร้อมบันทึก comment เหตุผล — ระบบนี้ **ไม่มีสถานะ Reopened แยกต่างหาก** เพราะการเปิดกลับมาแก้ไขคือการกลับสู่สถานะ In Progress เดิม

### 3.4 Business Rules
1. Published document ต้องมี current version เพียงหนึ่งฉบับต่อ document_code
2. End User ต้องเห็นเฉพาะเอกสารที่ Published/current ตามสิทธิ์
3. Draft/Review/Approved ต้องไม่ปรากฏใน current document list ของผู้ใช้ทั่วไป
4. DAR ต้องมี action_type, reason, requester, approver และ document reference
5. Acknowledgement ต้องผูกกับ document version ไม่ใช่แค่ document_code
6. Record/Finding/CAR ต้องสามารถ trace กลับไปยัง document หรือ evidence ได้
7. CAR overdue คำนวณจาก due_date และ status ที่ยังไม่ Closed
8. Dashboard ของ Phase 1 ต้องใช้ข้อมูลจริงจาก Group A และ Group B

---

## 4. Functional Requirements

### 4.1 Group A — Document Control / DAR / Acknowledgement
| FR ID | Area | Requirement | Priority | Mapped UC |
| --- | --- | --- | --- | --- |
| FR-A01 | Document Master | ระบบต้องสร้าง แก้ไข แสดง และค้นหา document master ได้ | Must | UC-A01, UC-A06 |
| FR-A02 | Document Metadata | ระบบต้องเก็บ metadata ขั้นต่ำ: document_code, title, type, department, owner, approver, version, status | Must | UC-A01 |
| FR-A03 | Document File | ระบบต้อง upload/download/preview metadata ของไฟล์เอกสารได้ | Must | UC-A01, UC-A06 |
| FR-A04 | Document Status | ระบบต้องควบคุม Draft/Review/Approved/Published/Obsolete | Must | UC-A02, UC-A03, UC-A04, UC-A05 |
| FR-A05 | DAR Create | ระบบต้องสร้าง DAR พร้อม action_type, reason, requester, reviewer/approver ได้ | Must | UC-A02 |
| FR-A06 | Approval Queue | ระบบต้องมี approval queue และ approve/reject พร้อม comment | Must | UC-A03 |
| FR-A07 | Publication Control | ระบบต้อง publish current version ได้เพียงหนึ่งฉบับ และ obsolete เวอร์ชันเดิม/เอกสารที่ยกเลิกได้ | Must | UC-A04, UC-A05 |
| FR-A08 | Revision History | ระบบต้องบันทึก revision history และความสัมพันธ์กับ DAR | Must | UC-A03, UC-A04, UC-A05 |
| FR-A09 | Search/View | ระบบต้องค้นหาเอกสารด้วย code/title/type/status และแสดงเฉพาะสิทธิ์ที่อนุญาต | Must | UC-A06 |
| FR-A10 | Ack Assignment | ระบบต้องกำหนดกลุ่ม/ผู้รับทราบเอกสารได้ | Should | UC-A07 |
| FR-A11 | Acknowledgement Log | ระบบต้องบันทึก acknowledgement: user, time, document version | Must | UC-A07 |
| FR-A12 | Document Summary API | ระบบต้องให้ Group B ดึง document status และ acknowledgement summary ได้ | Must | UC-A08 |


### 4.2 Group B — Records / Audit / CAR / Dashboard
| FR ID | Area | Requirement | Priority | Mapped UC |
| --- | --- | --- | --- | --- |
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


### 4.3 Shared Requirements
| FR ID | Area | Requirement | Priority | Mapped UC |
| --- | --- | --- | --- | --- |
| FR-SH01 | Authentication | ระบบต้องมี login/session หรือ JWT-based authentication | Must | UC-S01 |
| FR-SH02 | RBAC | ระบบต้องมี role-based access control ขั้นพื้นฐาน | Must | UC-S01, UC-S02 |
| FR-SH03 | Shared User/Role | ระบบต้องมี user_id/role_id กลางใช้ร่วมกัน | Must | UC-S02 |
| FR-SH04 | Audit Trail | ระบบต้องบันทึก audit trail สำหรับ event สำคัญ | Must | UC-S03 |
| FR-SH05 | Seed Data | ระบบต้องมี seed data จาก Master List/DAR/Pilot documents เพื่อ demo/UAT | Must | UC-S02 |


---

## 5. Non-Functional Requirements
| NFR ID | Category | Requirement | Priority | Mapped Scope |
| --- | --- | --- | --- | --- |
| NFR-01 | Security | RBAC ต้องบังคับสิทธิ์ทั้งเมนูและ API สำคัญ | Must | All secure UCs |
| NFR-02 | Auditability | event สำคัญต้องเก็บ who/what/when และ before-after เท่าที่จำเป็น | Must | UC-S03, A/B workflow |
| NFR-03 | Usability | ผู้ใช้ทั่วไปต้องค้นหาเอกสาร current version ได้ภายในไม่เกิน 3 คลิกจากหน้าหลัก | Should | UC-A06 |
| NFR-04 | Performance | การค้นหา document/record ในชุดข้อมูล pilot ต้องตอบสนองในเวลาที่เหมาะสม | Should | UC-A06, UC-B01 |
| NFR-05 | Maintainability | โค้ดต้องแยก module ตาม Group A/B และแยก business logic ออกจาก route/controller | Must | All |
| NFR-06 | Interoperability | Group B ต้องใช้ข้อมูล document ผ่าน contract ไม่ duplicate schema แบบแยกกัน | Must | UC-A08, UC-B08 |
| NFR-07 | Data Integrity | current version ต้องถูกต้องหลังทุก publish/obsolete/revise scenario | Must | UC-A04, UC-A05 |
| NFR-08 | Reliability | demo workflow หลักต้องทำงานซ้ำได้ไม่ล้มใน UAT | Must | All critical paths |
| NFR-09 | Backup | ต้องมีวิธี backup database และ upload files ในระดับโครงการ | Should | Operations |
| NFR-10 | Documentation | ต้องมี README, test cases, API contract, ERD, คู่มือ demo | Must | Delivery |


---

## 6. External Interface Requirements

### 6.1 User Interface Requirements
| UI ID | Screen | Owner | Purpose |
|---|---|---|---|
| UI-S01 | Login | Shared | เข้าสู่ระบบ |
| UI-S02 | User/Role Management | Shared | จัดการผู้ใช้และบทบาท |
| UI-A01 | Document List | A | ค้นหาและดูรายการเอกสาร |
| UI-A02 | Document Form | A | สร้าง/แก้ไข document metadata |
| UI-A03 | Document Detail | A | ดูเอกสาร, file, version, DAR, ack |
| UI-A04 | DAR Form | A | สร้างและส่ง DAR |
| UI-A05 | Approval Queue | A | review/approve/reject |
| UI-A06 | Acknowledgement Panel | A | กดรับทราบและดูสถานะ |
| UI-B01 | Record List/Form | B | จัดการ records/evidence |
| UI-B02 | Audit/Finding Form | B | บันทึก audit/finding |
| UI-B03 | CAR List/Detail | B | ติดตาม CAR |
| UI-B04 | Overdue Monitor | B | ดู CAR เกินกำหนด |
| UI-B05 | Operational Dashboard | B | ภาพรวม document/ack/CAR/finding |
| UI-S03 | Audit Trail Viewer | Shared | ดู audit trail |

### 6.2 API Candidate Summary
| API Area | Candidate Endpoints | Owner |
|---|---|---|
| Auth | POST /auth/login, GET /me | Shared |
| User/Role | GET/POST /users, PATCH /users/{id}/roles | Shared |
| Document | GET/POST /documents, GET/PATCH /documents/{id}, POST /documents/{id}/files | A |
| DAR | GET/POST /dars, POST /dars/{id}/submit, /approve, /reject | A |
| Publication | POST /documents/{id}/publish, POST /documents/{id}/obsolete | A |
| Ack | POST /documents/{id}/ack, GET /documents/{id}/ack-summary | A |
| Integration | GET /integration/document-summary, GET /integration/ack-summary | A→B |
| Records | GET/POST /records, POST /records/{id}/files | B |
| Audit/Finding | GET/POST /audits, GET/POST /findings | B |
| CAR | GET/POST /cars, PATCH /cars/{id}, POST /cars/{id}/verify | B |
| Dashboard | GET /dashboard/summary | B |
| Export | GET /exports/audit-summary, GET /exports/car-summary | B |
| Audit Trail | GET /audit-trails | Shared |

---

## 7. Logical Data Requirements

| Entity | Key Fields | Owner |
|---|---|---|
| User | user_id, full_name, email, role_id, department_id, active | Shared |
| Role | role_id, role_name, permissions | Shared |
| Department | department_id, name | Shared |
| Document | document_id, document_code, title, type, department, current_version_id, status | A |
| DocumentVersion | version_id, document_id, revision_no, issue_no, file_id, effective_date, status | A |
| DAR | dar_id, dar_no, document_id, action_type, reason, requester_id, approver_id, status | A |
| Acknowledgement | ack_id, document_id, version_id, user_id, ack_at | A |
| Record | record_id, document_id, record_type, title, file_id, created_by, created_at | B |
| Audit | audit_id, audit_round, audit_date, scope, auditor_id | B |
| Finding | finding_id, audit_id, document_id, record_id, type, description, status | B |
| CAR | car_id, finding_id, owner_id, due_date, status, root_cause, corrective_action | B |
| AuditTrail | log_id, actor_id, entity_type, entity_id, action, timestamp | Shared |

---

## 8. Use Case Summary
| UC ID | Group | Use Case | Primary Actor | FR/NFR Mapping | Screen | API Candidate | Main Entities | Test Case |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| UC-S01 | Shared | Login and Access System | End User / Owner / Approver / ISO Admin / Auditor / CAR Owner / IT/Admin | FR-SH01, FR-SH02, NFR-01 | Login / Auth Middleware | POST /auth/login; GET /me | User, Role | TC-S01 |
| UC-S02 | Shared | Manage Users and Roles | IT/Admin / ISO/QA Admin | FR-SH02, FR-SH03, FR-SH05 | User Management | GET/POST /users; PATCH /users/{id}/roles | User, Role, Department | TC-S02 |
| UC-A01 | Group A | Create Document Draft | Document Owner / ISO/QA Admin | FR-A01, FR-A02, FR-A03, NFR-02 | Document Form | POST /documents; POST /documents/{id}/files | Document, DocumentVersion, FileReference, AuditTrail | TC-A01 |
| UC-A02 | Group A | Create and Submit DAR | Document Owner / ISO/QA Admin | FR-A04, FR-A05, NFR-02 | DAR Form | POST /dars; POST /dars/{id}/submit | DAR, Document, AuditTrail | TC-A02 |
| UC-A03 | Group A | Review DAR and Document | Approver / ISO/QA Admin | FR-A04, FR-A06, FR-A08, NFR-02 | Approval Queue | GET /approval-tasks; POST /dars/{id}/approve; POST /dars/{id}/reject | DAR, ApprovalLog, DocumentVersion, AuditTrail | TC-A03 |
| UC-A04 | Group A | Publish Current Version | ISO/QA Admin | FR-A04, FR-A07, FR-A08, NFR-07 | Publish Panel | POST /documents/{id}/publish | Document, DocumentVersion, DAR, AuditTrail | TC-A04 |
| UC-A05 | Group A | Obsolete / Archive Document | ISO/QA Admin | FR-A07, FR-A08, NFR-07 | Document Admin Action | POST /documents/{id}/obsolete | Document, DocumentVersion, AuditTrail | TC-A05 |
| UC-A06 | Group A | Search and View Current Document | End User / Owner / Auditor / ISO Admin | FR-A09, NFR-03, NFR-04 | Document List / Detail | GET /documents?filters; GET /documents/{id} | Document, DocumentVersion, FileReference | TC-A06 |
| UC-A07 | Group A | Acknowledge Document | End User / Owner / Approver / CAR Owner | FR-A10, FR-A11, NFR-02 | Acknowledgement Panel | POST /documents/{id}/ack; GET /documents/{id}/ack-summary | Acknowledgement, DocumentVersion, User | TC-A07 |
| UC-A08 | Group A | Provide Document/Ack Summary to Group B | Group B System / Dashboard Aggregator | FR-A12, FR-B11, FR-B12, NFR-06 | Integration API | GET /integration/document-summary; GET /integration/ack-summary | Document, Acknowledgement | TC-A08 |
| UC-B01 | Group B | Create Record / Evidence | ISO/QA User / Auditor / CAR Owner | FR-B01, FR-B02, NFR-02 | Record Form | POST /records; POST /records/{id}/files | Record, FileReference, DocumentRef, AuditTrail | TC-B01 |
| UC-B02 | Group B | Create Audit Session / Audit Header | Auditor / ISO/QA Admin | FR-B03 | Audit Form | POST /audits | Audit, Auditor | TC-B02 |
| UC-B03 | Group B | Record Audit Finding | Auditor / ISO/QA Admin | FR-B04, FR-B05, NFR-02 | Finding Form | POST /findings | Finding, Audit, Record, DocumentRef, AuditTrail | TC-B03 |
| UC-B04 | Group B | Create CAR from Finding | Auditor / ISO/QA Admin | FR-B06, FR-B07 | CAR Form | POST /cars | CAR, Finding, User | TC-B04 |
| UC-B05 | Group B | Update Root Cause and Corrective Action | CAR Owner | FR-B07, FR-B08, NFR-02 | CAR Detail | PATCH /cars/{id}; POST /cars/{id}/evidence | CAR, Record, FileReference, AuditTrail | TC-B05 |
| UC-B06 | Group B | Verify and Close CAR | ISO/QA Admin / Auditor | FR-B10, FR-SH04 | CAR Verification | POST /cars/{id}/verify (ผลผ่าน → close, ผลไม่ผ่าน → กลับเป็น In Progress) | CAR, VerificationLog, AuditTrail | TC-B06 |
| UC-B07 | Group B | Monitor Overdue CAR | ISO/QA Admin / CAR Owner / Management Viewer | FR-B09, FR-B13 | Overdue Monitor | GET /cars?status=overdue | CAR | TC-B07 |
| UC-B08 | Group B | View Operational Dashboard | ISO/QA Admin / Management Viewer / Auditor | FR-B11, FR-B12, FR-B13, NFR-06 | Dashboard | GET /dashboard/summary | DocumentSummary, AckSummary, Finding, CAR | TC-B08 |
| UC-B09 | Group B | Export Audit/CAR/Dashboard Summary | ISO/QA Admin / Auditor | FR-B14, FR-SH04 | Export Screen | GET /exports/audit-summary; GET /exports/car-summary | Audit, Finding, CAR | TC-B09 |
| UC-S03 | Shared | View Audit Trail | ISO/QA Admin / Auditor / IT/Admin | FR-SH04, NFR-02 | Audit Trail Viewer | GET /audit-trails | AuditTrail | TC-S03 |


---

## 9. Detailed Use Cases

### UC-A01 Create Document Draft
- **Owner Group:** Group A
- **Primary Actor:** Document Owner / ISO Admin
- **Preconditions:** user login แล้วและมีสิทธิ์สร้างเอกสาร
- **Main Flow:** เปิด Document Form → กรอก metadata → upload file → save draft
- **Alternatives:** metadata ไม่ครบ, document_code ซ้ำ, file ไม่ถูกต้อง
- **Postconditions:** document status = Draft, มี file reference, มี audit trail
- **Mapped FR:** FR-A01, FR-A02, FR-A03
- **Test Cases:** TC-A01-01..03

### UC-A02 Create and Submit DAR
- **Owner Group:** Group A
- **Primary Actor:** Document Owner / ISO Admin
- **Main Flow:** เลือกเอกสาร → สร้าง DAR → เลือก action_type → ระบุ reason/approver → submit
- **Postconditions:** DAR status = Submitted, document status = Review
- **Mapped FR:** FR-A04, FR-A05

### UC-A03 Review DAR and Document
- **Owner Group:** Group A
- **Primary Actor:** Approver / ISO Admin
- **Main Flow:** เปิด approval queue → review document/DAR → approve/reject พร้อม comment
- **Postconditions:** approve → Approved; reject → Rejected/Draft
- **Mapped FR:** FR-A04, FR-A06, FR-A08

### UC-A04 Publish Current Version
- **Owner Group:** Group A
- **Primary Actor:** ISO/QA Admin
- **Main Flow:** เลือก approved document → กำหนด effective date → publish
- **Postconditions:** version ใหม่เป็น current version เดียว
- **Mapped FR:** FR-A07, FR-A08

### UC-A05 Obsolete / Archive Document
- **Owner Group:** Group A
- **Primary Actor:** ISO/QA Admin
- **Main Flow:** เลือกเอกสาร → ระบุเหตุผล obsolete → confirm
- **Postconditions:** document ไม่อยู่ใน current list ของ End User
- **Mapped FR:** FR-A07, FR-A08

### UC-A06 Search and View Current Document
- **Owner Group:** Group A
- **Primary Actor:** End User / Owner / Auditor / ISO Admin
- **Main Flow:** ค้นหาด้วย code/title/type/status → เปิด detail → download/view file ตามสิทธิ์
- **Postconditions:** ผู้ใช้ทั่วไปเห็นเฉพาะ Published/current
- **Mapped FR:** FR-A09

### UC-A07 Acknowledge Document
- **Owner Group:** Group A
- **Primary Actor:** End User / ผู้เกี่ยวข้อง
- **Main Flow:** เปิด published document → กด acknowledge → ระบบบันทึก user/time/version
- **Postconditions:** ack record ถูกบันทึกและนับใน ack summary
- **Mapped FR:** FR-A10, FR-A11

### UC-A08 Provide Document/Ack Summary to Group B
- **Owner Group:** Group A
- **Primary Actor:** Group B System
- **Main Flow:** Group B เรียก integration API → Group A ส่ง document status / ack summary
- **Postconditions:** dashboard ของ Group B ใช้ข้อมูลจริงจาก Group A
- **Mapped FR:** FR-A12, FR-B11, FR-B12

### UC-B01 Create Record / Evidence
- **Owner Group:** Group B
- **Primary Actor:** ISO User / Auditor / CAR Owner
- **Main Flow:** เพิ่ม record → เลือก document_id → แนบ file → save
- **Postconditions:** record ผูกกับ document/evidence
- **Mapped FR:** FR-B01, FR-B02

### UC-B02 Create Audit Session / Audit Header
- **Owner Group:** Group B
- **Primary Actor:** Auditor / ISO Admin
- **Main Flow:** สร้าง audit round → ระบุ scope/date/auditor
- **Mapped FR:** FR-B03

### UC-B03 Record Audit Finding
- **Owner Group:** Group B
- **Primary Actor:** Auditor / ISO Admin
- **Main Flow:** เลือก audit → บันทึก finding → เลือก type/severity → link evidence/document
- **Postconditions:** finding ถูกสร้างและ trace ได้
- **Mapped FR:** FR-B04, FR-B05

### UC-B04 Create CAR from Finding
- **Owner Group:** Group B
- **Primary Actor:** Auditor / ISO Admin
- **Main Flow:** เลือก finding → create CAR → ระบุ owner/due_date
- **Postconditions:** CAR status = Open
- **Mapped FR:** FR-B06, FR-B07

### UC-B05 Update Root Cause and Corrective Action
- **Owner Group:** Group B
- **Primary Actor:** CAR Owner
- **Main Flow:** เปิด CAR → กรอก root cause/action → แนบ evidence → save/submit
- **Mapped FR:** FR-B07, FR-B08

### UC-B06 Verify and Close CAR
- **Owner Group:** Group B
- **Primary Actor:** Auditor / ISO Admin
- **Main Flow:** ตรวจ evidence → บันทึกผล verify พร้อม comment → ผ่านให้ close, ไม่ผ่านให้ย้อนสถานะกลับเป็น In Progress
- **Mapped FR:** FR-B10

### UC-B07 Monitor Overdue CAR
- **Owner Group:** Group B
- **Primary Actor:** ISO Admin / CAR Owner / Management Viewer
- **Main Flow:** เปิด overdue monitor → ระบบคำนวณ due_date/status → แสดงรายการ overdue
- **Mapped FR:** FR-B09, FR-B13

### UC-B08 View Operational Dashboard
- **Owner Group:** Group B
- **Primary Actor:** ISO Admin / Management Viewer / Auditor
- **Main Flow:** เปิด dashboard → ระบบ aggregate document/ack/CAR/finding → แสดง cards/charts/recent list
- **Mapped FR:** FR-B11, FR-B12, FR-B13

### UC-B09 Export Audit/CAR/Dashboard Summary
- **Owner Group:** Group B
- **Primary Actor:** ISO Admin / Auditor
- **Main Flow:** เลือก filter → export summary
- **Mapped FR:** FR-B14

### UC-S01/S02/S03 Shared Use Cases
- Authentication, user/role management และ audit trail เป็น shared foundation ที่ทุก use case ต้องใช้ร่วมกัน

---

## 10. Acceptance Criteria ระดับระบบ

1. Group A สามารถทำ flow Document → DAR → Approve → Publish → Ack ได้ครบ
2. Group B สามารถทำ flow Record → Finding → CAR → Evidence → Verify/Close ได้ครบ
3. Dashboard แสดงข้อมูลจริงจาก Group A และ Group B
4. ทุก critical event มี audit trail อย่างน้อย actor/action/entity/time
5. RBAC ป้องกันการเข้าถึงหรือแก้ไขข้อมูลนอกสิทธิ์
6. ข้อมูล document_id/document_code/version/status ใช้ร่วมกันได้ระหว่างสองกลุ่ม
7. UAT scenario ใน Traceability Matrix ต้องผ่านก่อน demo ผู้ใช้งานจริง

---

## 11. Test Strategy

- **Unit Test:** validate service logic เช่น current version, overdue calculation
- **API Test:** ใช้ Postman/HTTP client ทดสอบ endpoint ตาม candidate API
- **Integration Test:** Group B เรียก document/ack summary จาก Group A
- **Workflow Test:** ทดสอบ end-to-end scenario ตาม TC-A/TC-B
- **UAT:** ใช้ข้อมูลตัวอย่างจาก Master List, DAR, QP/QM/FM ที่เลือกเป็น pilot

---

## 12. Requirement Ownership

| Area | Owner Group | Remarks |
|---|---|---|
| Login/RBAC/User/Role | Shared | ต้องตกลงก่อน dev หลัก |
| Document Control | Group A | เป็น source of truth ของเอกสาร |
| DAR/Publication/Ack | Group A | ส่งข้อมูลให้ dashboard |
| Records/Audit/Finding/CAR | Group B | ผูกกับ document_id จาก Group A |
| Dashboard/Export | Group B | ต้องไม่ใช้ mock เป็นผลลัพธ์สุดท้าย |
| Audit Trail | Shared | อาจแยกตารางเดียวหรือ service กลาง |

---

## 13. Link to Traceability Matrix

รายละเอียด mapping ราย Use Case / Scenario / Test Case อยู่ในเอกสาร:

**E-Filing_Phase1_SRS_Traceability_Matrix_GroupA_GroupB.md**

เอกสาร SRS นี้ควรใช้คู่กับ Traceability Matrix ทุกครั้งเมื่อแตก backlog, ERD, API Contract และ Test Plan
