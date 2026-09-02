# E-Filing Phase 1 SRS Traceability Matrix
## Group A / Group B / Use Case / Scenario / Test Case

**โครงการ:** E-Filing Phase 1 MVP + Operational Dashboard  
**หน่วยงาน:** สำนักงานคณบดีคณะวิศวกรรมศาสตร์ มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา  
**สถานะ:** Working Draft v1.0  
**วันที่จัดทำ:** 2026-05-17  

---

## 1. วัตถุประสงค์ของเอกสาร

เอกสารนี้ใช้เป็น **SRS Traceability Matrix ฉบับควบคุมงานพัฒนา** สำหรับ Phase 1 MVP + Operational Dashboard โดยเชื่อมโยงตั้งแต่ความต้องการเชิงระบบ (SRS) ไปยัง Use Case, Scenario, Test Case, หน้าจอ, API และ Data Entity ที่เกี่ยวข้อง เพื่อให้ทีม Group A และ Group B เข้าใจตรงกันว่า **ใครทำอะไร ต้องทดสอบอะไร และต้องส่งมอบอะไร** ก่อนเข้าสู่การออกแบบ ERD กลางและ Shared API Contract

---

## 2. ขอบเขตของ Matrix

- **Group A:** Document Control / DAR / Publication / Obsolete / Acknowledgement / Document Summary API
- **Group B:** Records / Audit / Finding / CAR / Overdue Monitor / Operational Dashboard / Export Summary
- **Shared:** Login, RBAC, User/Role, Audit Trail, Seed Data, Shared Contract

### 2.1 หลัก Traceability

```text
Business Need → FR/NFR → Use Case → Scenario → Screen/API/Entity → Test Case → UAT Evidence
```

---

## 3. Actors และความรับผิดชอบ

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


---

## 4. Requirement Catalog อ้างอิง

### 4.1 Group A Functional Requirements

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


### 4.2 Group B Functional Requirements

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
| FR-B10 | Verify/Close | ระบบต้องบันทึกผล verify และ close CAR ได้ หากไม่ผ่านให้ย้อนสถานะกลับเป็น In Progress | Should | UC-B06 |
| FR-B11 | Dashboard Document Status | dashboard ต้องแสดงจำนวนเอกสารตามสถานะจาก Group A | Must | UC-B08 |
| FR-B12 | Dashboard Ack Rate | dashboard ต้องแสดง acknowledgement rate จาก Group A | Must | UC-B08 |
| FR-B13 | Dashboard CAR/Finding | dashboard ต้องแสดง CAR open/overdue/closed และ recent findings | Must | UC-B08 |
| FR-B14 | Export Summary | ระบบควร export summary report เบื้องต้นได้ | Should | UC-B09 |


### 4.3 Shared Functional Requirements

| FR ID | Area | Requirement | Priority | Mapped UC |
| --- | --- | --- | --- | --- |
| FR-SH01 | Authentication | ระบบต้องมี login/session หรือ JWT-based authentication | Must | UC-S01 |
| FR-SH02 | RBAC | ระบบต้องมี role-based access control ขั้นพื้นฐาน | Must | UC-S01, UC-S02 |
| FR-SH03 | Shared User/Role | ระบบต้องมี user_id/role_id กลางใช้ร่วมกัน | Must | UC-S02 |
| FR-SH04 | Audit Trail | ระบบต้องบันทึก audit trail สำหรับ event สำคัญ | Must | UC-S03 |
| FR-SH05 | Seed Data | ระบบต้องมี seed data จาก Master List/DAR/Pilot documents เพื่อ demo/UAT | Must | UC-S02 |


### 4.4 Non-Functional Requirements

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

## 5. Use Case → SRS → Screen/API/Entity/Test Mapping

ตารางนี้เป็นแกนกลางสำหรับควบคุมงานพัฒนา ถ้า Use Case ใดไม่มี screen/API/entity/test case ที่ชัดเจน ให้ถือว่า requirement ยังไม่พร้อมเข้าสู่ development sprint

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
| UC-B06 | Group B | Verify and Close CAR | ISO/QA Admin / Auditor | FR-B10, FR-SH04 | CAR Verification | POST /cars/{id}/verify (ผ่าน → close, ไม่ผ่าน → กลับเป็น In Progress) | CAR, VerificationLog, AuditTrail | TC-B06 |
| UC-B07 | Group B | Monitor Overdue CAR | ISO/QA Admin / CAR Owner / Management Viewer | FR-B09, FR-B13 | Overdue Monitor | GET /cars?status=overdue | CAR | TC-B07 |
| UC-B08 | Group B | View Operational Dashboard | ISO/QA Admin / Management Viewer / Auditor | FR-B11, FR-B12, FR-B13, NFR-06 | Dashboard | GET /dashboard/summary | DocumentSummary, AckSummary, Finding, CAR | TC-B08 |
| UC-B09 | Group B | Export Audit/CAR/Dashboard Summary | ISO/QA Admin / Auditor | FR-B14, FR-SH04 | Export Screen | GET /exports/audit-summary; GET /exports/car-summary | Audit, Finding, CAR | TC-B09 |
| UC-S03 | Shared | View Audit Trail | ISO/QA Admin / Auditor / IT/Admin | FR-SH04, NFR-02 | Audit Trail Viewer | GET /audit-trails | AuditTrail | TC-S03 |


---

## 6. Scenario-Level Traceability Matrix

ตารางนี้ใช้กำหนด scenario ที่ต้องทำให้ครบก่อน UAT และใช้เป็น checklist แยกงานระหว่าง Group A และ Group B

| Scenario ID | UC ID | Group | Actor | Scenario | Condition / Steps | Expected Result | FR Mapping | NFR Mapping | Screen | API | Entity | Test Case |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SC-S01-01 | UC-S01 | Shared | ACT-01..07 | Login สำเร็จด้วย role Document Owner | กรอก username/password ถูกต้อง | เข้าสู่ระบบและเห็นเมนูตาม role | FR-SH01, FR-SH02 | NFR-01 | Login | POST /auth/login | User, Role | TC-S01-01 |
| SC-S01-02 | UC-S01 | Shared | ACT-01..07 | Login ผิดรหัสผ่าน | กรอก password ผิด | ระบบปฏิเสธและไม่สร้าง session | FR-SH01 | NFR-01 | Login | POST /auth/login | User | TC-S01-02 |
| SC-S01-03 | UC-S01 | Shared | ACT-01 | ผู้ใช้ไม่มีสิทธิ์เรียก endpoint ที่ห้าม | End User เรียก publish endpoint | ระบบตอบ forbidden และ audit trail ตามความเหมาะสม | FR-SH02 | NFR-01, NFR-02 | N/A | POST /documents/{id}/publish | AuditTrail | TC-S01-03 |
| SC-S02-01 | UC-S02 | Shared | ACT-07 | เพิ่มผู้ใช้ใหม่เป็น Approver | IT/Admin เปิดหน้าจัดการผู้ใช้ | ผู้ใช้ใหม่ถูกสร้างพร้อม role Approver | FR-SH03, FR-SH05 | NFR-01 | User Management | POST /users | User, Role | TC-S02-01 |
| SC-S03-01 | UC-S03 | Shared | ACT-04, ACT-05, ACT-07 | ดู audit trail ของเอกสาร | ค้นด้วย entity_type=document และ document_id | เห็นลำดับ create/update/approve/publish พร้อม who/what/when | FR-SH04 | NFR-02 | Audit Trail Viewer | GET /audit-trails | AuditTrail | TC-S03-01 |
| SC-A01-01 | UC-A01 | Group A | ACT-02 | สร้างเอกสาร QP ใหม่พร้อมไฟล์ PDF | กรอก metadata ครบและ upload file | ได้ document status Draft และมี file reference | FR-A01, FR-A02, FR-A03 | NFR-02 | Document Form | POST /documents; POST /documents/{id}/files | Document, DocumentVersion, FileReference | TC-A01-01 |
| SC-A01-02 | UC-A01 | Group A | ACT-02 | สร้างเอกสารโดยไม่กรอก owner | metadata ขาด owner | ระบบแจ้ง validation error ไม่สร้างเอกสาร | FR-A02 | NFR-01 | Document Form | POST /documents | Document | TC-A01-02 |
| SC-A01-03 | UC-A01 | Group A | ACT-02 | ใช้ document code ซ้ำ | document_code มีอยู่แล้ว | ระบบแจ้ง duplicate code | FR-A01, FR-A02 | NFR-07 | Document Form | POST /documents | Document | TC-A01-03 |
| SC-A02-01 | UC-A02 | Group A | ACT-02 | ส่ง DAR เพื่อสร้างเอกสารใหม่ | เอกสาร Draft มีอยู่แล้ว | DAR status Submitted และเอกสารเป็น Review | FR-A04, FR-A05 | NFR-02 | DAR Form | POST /dars; POST /dars/{id}/submit | DAR, Document | TC-A02-01 |
| SC-A02-02 | UC-A02 | Group A | ACT-02 | ส่ง DAR เพื่อ revise เอกสาร Published | เลือก action_type=revise | สร้าง revision draft และ DAR trace ไปยัง current version เดิม | FR-A05, FR-A08 | NFR-02, NFR-07 | DAR Form | POST /dars | DAR, DocumentVersion | TC-A02-02 |
| SC-A02-03 | UC-A02 | Group A | ACT-02 | ส่ง DAR โดยไม่เลือก approver | ข้อมูล approver ว่าง | ระบบแจ้ง validation error | FR-A05, FR-A06 | NFR-01 | DAR Form | POST /dars/{id}/submit | DAR | TC-A02-03 |
| SC-A03-01 | UC-A03 | Group A | ACT-03 | Approve DAR สำเร็จ | Approver เปิด approval queue | DAR Approved และ document status Approved | FR-A06, FR-A04 | NFR-02 | Approval Queue | POST /dars/{id}/approve | DAR, ApprovalLog | TC-A03-01 |
| SC-A03-02 | UC-A03 | Group A | ACT-03 | Reject DAR พร้อม comment | Approver กด reject และระบุ comment | DAR Rejected และ owner เห็นเหตุผล | FR-A06, FR-A08 | NFR-02 | Approval Queue | POST /dars/{id}/reject | DAR, ApprovalLog | TC-A03-02 |
| SC-A03-03 | UC-A03 | Group A | ACT-01 | ผู้ไม่มีสิทธิ์พยายาม approve | End User เรียก approve | ระบบ forbidden | FR-A06, FR-SH02 | NFR-01 | N/A | POST /dars/{id}/approve | AuditTrail | TC-A03-03 |
| SC-A04-01 | UC-A04 | Group A | ACT-04 | Publish เอกสารใหม่ครั้งแรก | document status Approved | document status Published และเป็น current version | FR-A07, FR-A08 | NFR-07 | Publish Panel | POST /documents/{id}/publish | Document, DocumentVersion | TC-A04-01 |
| SC-A04-02 | UC-A04 | Group A | ACT-04 | Publish revision ใหม่และปิด current version เดิม | revision ใหม่ Approved | เวอร์ชันใหม่ Published; เวอร์ชันเดิมไม่ใช่ current | FR-A07, FR-A08 | NFR-07 | Publish Panel | POST /documents/{id}/publish | DocumentVersion | TC-A04-02 |
| SC-A04-03 | UC-A04 | Group A | ACT-04 | Publish โดยไม่มีไฟล์แนบ | Approved document ไม่มี file | ระบบไม่อนุญาต publish | FR-A03, FR-A07 | NFR-07 | Publish Panel | POST /documents/{id}/publish | DocumentVersion | TC-A04-03 |
| SC-A05-01 | UC-A05 | Group A | ACT-04 | Obsolete เอกสารที่ถูกแทนที่ | เอกสาร Published มี DAR action=obsolete | document status Obsolete และไม่แสดงใน current list | FR-A07, FR-A08 | NFR-07 | Document Admin Action | POST /documents/{id}/obsolete | Document | TC-A05-01 |
| SC-A06-01 | UC-A06 | Group A | ACT-01 | ค้นหาด้วยรหัส QP-2301-0107 | มีเอกสารใน seed data | แสดงเอกสาร current version ที่ตรงเงื่อนไข | FR-A09 | NFR-03, NFR-04 | Document List | GET /documents?code=QP-2301-0107 | Document | TC-A06-01 |
| SC-A06-02 | UC-A06 | Group A | ACT-01 | ผู้ใช้ทั่วไปพยายามเปิด Draft | รู้ document_id ของ draft | ระบบปฏิเสธหรือไม่แสดงเนื้อหา draft | FR-A09, FR-SH02 | NFR-01 | Document Detail | GET /documents/{id} | Document | TC-A06-02 |
| SC-A07-01 | UC-A07 | Group A | ACT-01 | End User รับทราบเอกสาร Published | ผู้ใช้ถูก assign ให้รับทราบ | ระบบบันทึก user/time/version | FR-A10, FR-A11 | NFR-02 | Acknowledgement Panel | POST /documents/{id}/ack | Acknowledgement | TC-A07-01 |
| SC-A07-02 | UC-A07 | Group A | ACT-01 | เอกสาร revise ใหม่แล้วต้องรับทราบใหม่ | เอกสารมี version ใหม่ Published | ack ของ version เดิมไม่ถูกนับแทน version ใหม่ | FR-A11 | NFR-07 | Ack Summary | GET /documents/{id}/ack-summary | Acknowledgement, DocumentVersion | TC-A07-02 |
| SC-A08-01 | UC-A08 | Group A | ACT-09 | Group B ดึง document status summary | Group B เรียก integration API ด้วย token ที่ถูกต้อง | ได้ JSON summary ตาม contract | FR-A12, FR-B11 | NFR-06 | Integration API | GET /integration/document-summary | Document | TC-A08-01 |
| SC-A08-02 | UC-A08 | Group A | ACT-09 | Group B ดึง ack summary | มีข้อมูล acknowledgement | ได้ ack_total/ack_done/ack_rate ตาม document/version | FR-A12, FR-B12 | NFR-06 | Integration API | GET /integration/ack-summary | Acknowledgement | TC-A08-02 |
| SC-B01-01 | UC-B01 | Group B | ACT-04, ACT-05, ACT-06 | สร้าง record/evidence ผูกกับเอกสาร | เลือก document_id และแนบไฟล์ | record ถูกสร้างและ link document_id | FR-B01, FR-B02 | NFR-02 | Record Form | POST /records | Record, DocumentRef, FileReference | TC-B01-01 |
| SC-B01-02 | UC-B01 | Group B | ACT-04 | สร้าง record โดยไม่เลือก document_id | metadata ไม่ครบ | ระบบแจ้ง validation error | FR-B01, FR-B02 | NFR-07 | Record Form | POST /records | Record | TC-B01-02 |
| SC-B02-01 | UC-B02 | Group B | ACT-05 | สร้าง audit round/header | กรอก audit_date/scope/auditor | audit header ถูกสร้าง | FR-B03 | NFR-02 | Audit Form | POST /audits | Audit | TC-B02-01 |
| SC-B03-01 | UC-B03 | Group B | ACT-05 | บันทึก finding แบบ NC พร้อม evidence | เลือก audit_id/document_id/record_id | finding ถูกสร้างและ trace ไปยัง evidence | FR-B04, FR-B05 | NFR-02 | Finding Form | POST /findings | Finding, Record | TC-B03-01 |
| SC-B03-02 | UC-B03 | Group B | ACT-05 | บันทึก OFI ที่ไม่ต้องเปิด CAR ทันที | finding type=OFI | finding status Recorded และไม่สร้าง CAR อัตโนมัติ | FR-B04 | NFR-02 | Finding Form | POST /findings | Finding | TC-B03-02 |
| SC-B04-01 | UC-B04 | Group B | ACT-05, ACT-04 | เปิด CAR จาก finding | finding type NC หรือผู้ใช้เลือก create CAR | CAR status Open และผูก finding_id | FR-B06, FR-B07 | NFR-02 | CAR Form | POST /cars | CAR, Finding | TC-B04-01 |
| SC-B04-02 | UC-B04 | Group B | ACT-04 | ป้องกันเปิด CAR ซ้ำจาก finding เดิม | finding มี CAR open อยู่แล้ว | ระบบแจ้ง duplicate/open CAR exists | FR-B06 | NFR-07 | CAR Form | POST /cars | CAR, Finding | TC-B04-02 |
| SC-B05-01 | UC-B05 | Group B | ACT-06 | CAR Owner กรอก root cause และ corrective action | CAR status Open/In Progress | ข้อมูล RCA/action ถูกบันทึกและ status In Progress | FR-B07 | NFR-02 | CAR Detail | PATCH /cars/{id} | CAR | TC-B05-01 |
| SC-B05-02 | UC-B05 | Group B | ACT-06 | แนบ evidence ให้ CAR | CAR Owner upload file | evidence ถูกผูกกับ CAR | FR-B08 | NFR-02 | CAR Detail | POST /cars/{id}/evidence | CAR, FileReference | TC-B05-02 |
| SC-B06-01 | UC-B06 | Group B | ACT-04, ACT-05 | Verify และ Close CAR | CAR status Pending Verify | Auditor/ISO Admin close CAR พร้อม verification note | FR-B10 | NFR-02 | CAR Verification | POST /cars/{id}/verify | CAR, VerificationLog | TC-B06-01 |
| SC-B06-02 | UC-B06 | Group B | ACT-04, ACT-05 | Verify ไม่ผ่าน | หลักฐานไม่เพียงพอ | CAR status ย้อนกลับเป็น In Progress พร้อม comment | FR-B10 | NFR-02 | CAR Verification | POST /cars/{id}/verify | CAR, VerificationLog | TC-B06-02 |
| SC-B07-01 | UC-B07 | Group B | ACT-04, ACT-06 | แสดง CAR overdue | due_date < today และ status ยังไม่ Closed | รายการปรากฏใน overdue monitor | FR-B09, FR-B13 | NFR-04 | Overdue Monitor | GET /cars?status=overdue | CAR | TC-B07-01 |
| SC-B08-01 | UC-B08 | Group B | ACT-04 | dashboard แสดง document status จาก Group A | Group A integration API พร้อมใช้งาน | แสดง total/published/pending/obsolete | FR-B11 | NFR-06 | Dashboard | GET /dashboard/summary | DocumentSummary | TC-B08-01 |
| SC-B08-02 | UC-B08 | Group B | ACT-04 | dashboard แสดง acknowledgement rate | Group A มี ack summary | แสดง ack_rate และ pending acknowledgement | FR-B12 | NFR-06 | Dashboard | GET /dashboard/summary | AckSummary | TC-B08-02 |
| SC-B08-03 | UC-B08 | Group B | ACT-04 | dashboard แสดง CAR open/overdue/closed และ recent findings | มีข้อมูล CAR/finding | แสดง cards/charts/recent list จากข้อมูลจริง | FR-B13 | NFR-04 | Dashboard | GET /dashboard/summary | CAR, Finding | TC-B08-03 |
| SC-B09-01 | UC-B09 | Group B | ACT-04, ACT-05 | export summary report | เลือกช่วงวันที่/ประเภทข้อมูล | ได้ไฟล์หรือข้อมูลสรุปตาม filter | FR-B14 | NFR-10 | Export Screen | GET /exports/car-summary | CAR, Finding | TC-B09-01 |


---

## 7. Coverage Summary แยกตามกลุ่ม

### 7.1 Group A Coverage

| หมวด | Use Case | Scenario สำคัญ | Test Coverage |
|---|---|---|---|
| Document Master | UC-A01 | SC-A01-01..03 | create, validation, duplicate code |
| DAR | UC-A02 | SC-A02-01..03 | new/revise/validation |
| Approval | UC-A03 | SC-A03-01..03 | approve/reject/unauthorized |
| Publish/Obsolete | UC-A04, UC-A05 | SC-A04-01..03, SC-A05-01 | current version, revision, obsolete |
| Search/View | UC-A06 | SC-A06-01..02 | search current, block draft |
| Acknowledgement | UC-A07 | SC-A07-01..02 | ack log, re-ack after revision |
| Integration to B | UC-A08 | SC-A08-01..02 | document summary, ack summary |

### 7.2 Group B Coverage

| หมวด | Use Case | Scenario สำคัญ | Test Coverage |
|---|---|---|---|
| Records/Evidence | UC-B01 | SC-B01-01..02 | create evidence, validation |
| Audit | UC-B02, UC-B03 | SC-B02-01, SC-B03-01..02 | audit header, finding, evidence link |
| CAR | UC-B04, UC-B05, UC-B06 | SC-B04-01..02, SC-B05-01..02, SC-B06-01..02 | create, update, evidence, verify/close |
| Overdue | UC-B07 | SC-B07-01 | due_date logic |
| Dashboard | UC-B08 | SC-B08-01..03 | doc status, ack rate, CAR/finding |
| Export | UC-B09 | SC-B09-01 | summary report |

---

## 8. Minimum UAT Checklist

### 8.1 Group A ต้องผ่านอย่างน้อย
- สร้างเอกสาร Draft จากข้อมูลตัวอย่าง Master List ได้
- สร้าง DAR เพื่อสร้างใหม่ / revise / obsolete ได้
- Approver approve/reject ได้พร้อม comment
- ISO Admin publish current version ได้เพียงฉบับเดียว
- End User เห็นเฉพาะ published/current document
- End User acknowledge document ได้ และ revision ใหม่ต้องนับ ack ใหม่
- Group B สามารถดึง document summary และ acknowledgement summary ได้

### 8.2 Group B ต้องผ่านอย่างน้อย
- สร้าง record/evidence และผูกกับ document_id ได้
- สร้าง audit round และ finding ได้
- เปิด CAR จาก finding ได้
- CAR Owner กรอก root cause/action/evidence ได้
- Auditor/ISO Admin บันทึกผล verify และ close CAR ได้ (ไม่ผ่านย้อนกลับเป็น In Progress)
- ระบบแสดง overdue CAR ได้ถูกต้อง
- dashboard แสดงข้อมูลจริงจาก Group A และ Group B

---

## 9. Gap / Decision Log ที่ต้องยืนยันกับผู้ใช้งานจริง

| ประเด็น | คำถามที่ต้องถามผู้ใช้ | ผลต่อระบบ |
|---|---|---|
| Document Type | QM/QP/WI/SD/FM ต้องใช้รหัสและ metadata เหมือนกันทั้งหมดหรือไม่ | กำหนด schema และ validation |
| DAR Approval | ผู้ทบทวนและผู้อนุมัติเป็นคนเดียวกันได้หรือไม่ | workflow rule |
| Distribution/Ack | เอกสารใดบ้างที่ต้องบังคับรับทราบ | ack assignment rule |
| Obsolete Access | Auditor/ISO Admin เห็น obsolete ได้แค่ไหน | permission rule |
| Record Retention | ระยะเก็บ record แต่ละประเภทต้องกำหนดตอนนี้หรือใช้ note ก่อน | record metadata |
| Finding Type | ใช้ NC/OFI/Observation หรือมีประเภทอื่น | finding master data |
| CAR Close | ใครเป็นผู้ verify effectiveness และ close | CAR role matrix |
| Dashboard | ผู้ใช้ต้องการ card/chart ใดเป็น minimum | dashboard backlog |

---

## 10. ข้อสรุป

เอกสารนี้เป็นเอกสารเชื่อมกลางระหว่าง SRS, Use Case, Scenario, Test Case, Screen, API และ Entity ใช้เป็นเกณฑ์ควบคุม scope ก่อนทำ ERD และ Shared API Contract โดยทุก requirement ที่จะเข้าสู่ development ควรมี mapping อย่างน้อยไปยัง Use Case และ Test Case หนึ่งรายการ
