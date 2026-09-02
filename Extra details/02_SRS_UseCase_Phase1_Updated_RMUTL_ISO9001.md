# 02 — SRS + Use Case ปรับปรุง: E-Filing Phase 1 MVP
## สำหรับ Group A / Group B ใช้ร่วมกันก่อนออกแบบ ERD และ Shared API Contract

**สถานะเอกสาร:** Working Draft v2.0  
**ขอบเขต:** Phase 1 MVP + Operational Dashboard  
**หมายเหตุ:** เอกสารนี้ปรับปรุงจากแหล่งข้อมูลในโครงการ ได้แก่ Master Plan, Phase 1 BRD, SE02 Group A/B ที่อนุมัติ/นำเสนอแล้ว, เอกสารคุณภาพจริงของสำนักงานคณบดีคณะวิศวกรรมศาสตร์ มทร.ล้านนา เช่น QM, QP, SD, FM, Master List และ DAR โดยยังคงกรอบ Phase 1 MVP + Operational Dashboard: Group A = Document Control/DAR/Acknowledgement และ Group B = Records/Audit/CAR/Dashboard

---

## 1. Purpose

เอกสารนี้เป็น SRS และ Use Case ระดับ Phase 1 สำหรับใช้เป็น requirement กลางของ Group A และ Group B ก่อนเข้าสู่การออกแบบ ERD และ Shared API Contract จุดประสงค์คือทำให้ทั้งสองกลุ่มเข้าใจ actors, functional requirements, non-functional requirements, use cases, user stories, acceptance criteria และ boundary ของแต่ละโมดูลตรงกัน

---

## 2. System Overview

ระบบ E-Filing Phase 1 เป็น web application สำหรับจัดการเอกสารคุณภาพและหลักฐานตามระบบบริหารงานคุณภาพ ISO 9001:2015 โดยแบ่งการพัฒนาเป็น 2 vertical modules

- **Group A:** Document Control, DAR, Publication, Acknowledgement
- **Group B:** Records, Audit/Finding, CAR, Operational Dashboard

ระบบต้องทำงานร่วมกันผ่าน shared data model และ shared API contract โดยมี document_id/document_code/version/status เป็น key กลางในการเชื่อมข้อมูล

---

## 3. Actors

| Actor | Description | กลุ่มที่เกี่ยวข้อง |
|---|---|---|
| End User | ผู้ค้นหาและรับทราบเอกสาร | A, B dashboard read |
| Document Owner | ผู้สร้าง/แก้ไข/ส่ง DAR | A |
| Approver | ผู้ทบทวนและอนุมัติเอกสาร/DAR | A |
| ISO/QA Admin | ผู้ควบคุมเอกสารและระบบคุณภาพ | A/B |
| Auditor | ผู้บันทึก audit/finding | B |
| CAR Owner | ผู้รับผิดชอบ corrective action | B |
| IT/Admin | ผู้ดูแล user/role/config | Shared |

---

## 4. System States

### 4.1 Document Status

| Status | Meaning | ผู้เปลี่ยนสถานะ |
|---|---|---|
| Draft | เอกสารร่าง | Owner/Admin |
| Review | ส่งทบทวน/รออนุมัติ | Owner |
| Approved | ผ่านการอนุมัติ | Approver |
| Published | เอกสารฉบับใช้งานจริง | ISO Admin |
| Obsolete | ยกเลิก/ไม่ใช้งาน | ISO Admin |

### 4.2 DAR Status

| Status | Meaning |
|---|---|
| Draft | ยังไม่ส่ง |
| Submitted | ส่งคำขอแล้ว |
| Reviewed | ทบทวนแล้ว |
| Approved | อนุมัติแล้ว |
| Rejected | ไม่อนุมัติ / ส่งกลับแก้ไข |
| Closed | ปิดคำขอแล้ว |

### 4.3 CAR Status

| Status | Meaning |
|---|---|
| Open | เปิด CAR ใหม่ |
| In Progress | กำลังแก้ไข |
| Pending Verify | ส่งให้ทวนสอบ |
| Closed | ปิดหลัง verify แล้ว |

**กฎการเปลี่ยนสถานะ:** `Open → In Progress → Pending Verify → Closed` — verify ไม่ผ่านให้ย้อนสถานะกลับเป็น In Progress พร้อม comment ไม่มีสถานะ Reopened แยก

---

## 5. Functional Requirements

### 5.1 Group A — Document Control / DAR / Acknowledgement

| ID | Requirement | Priority | Actor |
|---|---|---|---|
| FR-A01 | ระบบต้องสร้าง แก้ไข แสดง และค้นหา document master ได้ | Must | Owner/Admin |
| FR-A02 | ระบบต้องเก็บ metadata: document_code, title, type, department, owner, approver, version, status | Must | Owner/Admin |
| FR-A03 | ระบบต้อง upload/download file เอกสารได้ | Must | Owner/Admin/End User |
| FR-A04 | ระบบต้องควบคุม status Draft/Review/Approved/Published/Obsolete | Must | Owner/Approver/Admin |
| FR-A05 | ระบบต้องสร้าง DAR พร้อม action type และ reason ได้ | Must | Owner |
| FR-A06 | ระบบต้องมี approval queue และ approve/reject พร้อม comment | Must | Approver |
| FR-A07 | ระบบต้อง publish current version ได้เพียงหนึ่งฉบับ | Must | ISO Admin |
| FR-A08 | ระบบต้องบันทึก revision history | Must | System |
| FR-A09 | ระบบต้องค้นหาด้วย code/title/type/status | Must | All |
| FR-A10 | ระบบต้องกำหนดกลุ่มหรือผู้รับทราบเอกสาร | Should | ISO Admin |
| FR-A11 | ระบบต้องบันทึก acknowledgement user/time/document version | Must | End User/System |
| FR-A12 | ระบบต้องให้ Group B ดึง document status และ acknowledgement summary ได้ | Must | System |

### 5.2 Group B — Records / Audit / CAR / Dashboard

| ID | Requirement | Priority | Actor |
|---|---|---|---|
| FR-B01 | ระบบต้องสร้าง/แก้ไข/ค้นหา record ได้ | Must | ISO User/CAR Owner |
| FR-B02 | ระบบต้องแนบ evidence file และผูกกับ document_id ได้ | Must | ISO User/CAR Owner |
| FR-B03 | ระบบต้องสร้าง audit header หรือ audit round ได้ | Should | Auditor/ISO Admin |
| FR-B04 | ระบบต้องบันทึก finding และ type/severity/description ได้ | Must | Auditor |
| FR-B05 | ระบบต้องผูก finding กับ document/record/evidence ได้ | Must | Auditor |
| FR-B06 | ระบบต้องสร้าง CAR จาก finding ได้ | Must | Auditor/ISO Admin |
| FR-B07 | ระบบต้องเก็บ owner, due_date, root_cause, corrective_action, status | Must | CAR Owner |
| FR-B08 | ระบบต้องแนบ evidence ให้ CAR ได้ | Must | CAR Owner |
| FR-B09 | ระบบต้องคำนวณ overdue status จาก due_date และ status | Must | System |
| FR-B10 | ระบบต้องบันทึกผล verify และ close CAR ได้ หากไม่ผ่านให้ย้อนสถานะกลับเป็น In Progress | Should | Auditor/ISO Admin |
| FR-B11 | dashboard ต้องแสดง document status จาก Group A | Must | System |
| FR-B12 | dashboard ต้องแสดง acknowledgement rate จาก Group A | Must | System |
| FR-B13 | dashboard ต้องแสดง CAR open/overdue/closed และ recent findings | Must | System |
| FR-B14 | ระบบควร export summary report เบื้องต้นได้ | Should | ISO Admin/Auditor |

### 5.3 Shared Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-SH01 | ระบบต้องมี Login และ JWT-based session หรือเทียบเท่า | Must |
| FR-SH02 | ระบบต้องมี RBAC ขั้นพื้นฐาน | Must |
| FR-SH03 | ระบบต้องมี shared role และ shared user id | Must |
| FR-SH04 | ระบบต้องบันทึก audit trail สำหรับ event สำคัญ | Must |
| FR-SH05 | ระบบต้องมี seed data จาก Master List/DAR/Pilot documents | Must |

---

## 6. Non-Functional Requirements

| ID | Category | Requirement | Target |
|---|---|---|---|
| NFR-01 | Security | RBAC ต้องบังคับสิทธิ์ทุกเมนูและ API สำคัญ | Must |
| NFR-02 | Auditability | event สำคัญต้องเก็บ who/what/when/before-after เท่าที่จำเป็น | Must |
| NFR-03 | Usability | ผู้ใช้ทั่วไปต้องค้นหาเอกสาร current version ได้ในไม่เกิน 3 คลิกจากหน้าหลัก | Should |
| NFR-04 | Performance | การค้นหา document/record ในชุดข้อมูล pilot ต้องตอบสนองในเวลาที่เหมาะสม | Should |
| NFR-05 | Maintainability | โค้ดต้องแยก module ตาม Group A/B และ service ชั้น business logic | Must |
| NFR-06 | Interoperability | Group B ต้องใช้ข้อมูล document ผ่าน contract ไม่ duplicate schema | Must |
| NFR-07 | Data Integrity | current version ต้องถูกต้องหลังทุก publish/obsolete/revise scenario | Must |
| NFR-08 | Reliability | demo workflow หลักต้องทำงานซ้ำได้ไม่ล้มใน UAT | Must |
| NFR-09 | Backup | ต้องมีวิธี backup database และ upload files ในระดับโครงการ | Should |
| NFR-10 | Documentation | มี README, test cases, API contract, ERD, คู่มือ demo | Must |

---

## 7. Logical Data Entities

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

| UC-ID | Use Case | Primary Actor | Owner Group | Related FR |
|---|---|---|---|---|
| UC-01 | Create Document Draft | Document Owner | A | FR-A01..A03 |
| UC-02 | Submit DAR | Document Owner | A | FR-A05 |
| UC-03 | Review/Approve/Reject DAR | Approver | A | FR-A06 |
| UC-04 | Publish Current Version | ISO Admin | A | FR-A04,A07,A08 |
| UC-05 | Obsolete Document | ISO Admin | A | FR-A04,A07,A08 |
| UC-06 | Search/View Document | End User | A | FR-A09 |
| UC-07 | Acknowledge Document | End User | A | FR-A10,A11 |
| UC-08 | Create Record/Evidence | ISO User/CAR Owner | B | FR-B01,B02 |
| UC-09 | Create Audit Finding | Auditor | B | FR-B03..B05 |
| UC-10 | Open CAR | ISO Admin/Auditor | B | FR-B06 |
| UC-11 | Update/Verify/Close CAR | CAR Owner/Auditor | B | FR-B07..B10 |
| UC-12 | View Operational Dashboard | ISO Admin/Manager | B | FR-B11..B13 |
| UC-13 | Export Summary | ISO Admin/Auditor | B | FR-B14 |
| UC-14 | View Audit Trail | ISO Admin/Auditor | Shared | FR-SH04 |

---

## 9. Detailed Use Cases

### UC-01 Create Document Draft

| Field | Detail |
|---|---|
| Primary Actor | Document Owner |
| Preconditions | User login และมี role Owner/Admin |
| Main Flow | 1) เปิดหน้า Create Document 2) กรอก metadata 3) upload file 4) บันทึก Draft |
| Alternate | metadata ไม่ครบ → ระบบแจ้ง validation error |
| Postconditions | Document status = Draft และมี audit trail |
| Acceptance | มี document_id และ file reference |

### UC-02 Submit DAR

| Field | Detail |
|---|---|
| Primary Actor | Document Owner |
| Preconditions | Document อยู่ใน Draft หรือมี request revise/obsolete |
| Main Flow | 1) เปิด Document Detail 2) สร้าง DAR 3) เลือก action type 4) ระบุ reason/approver 5) submit |
| Postconditions | DAR status = Submitted, Document status = Review |
| Acceptance | Approver เห็นใน approval queue |

### UC-03 Review / Approve / Reject DAR

| Field | Detail |
|---|---|
| Primary Actor | Approver |
| Main Flow | 1) เปิด approval queue 2) อ่าน document/DAR 3) approve/reject พร้อม comment |
| Postconditions | Approve → Document Approved, Reject → กลับ Draft/Rejected |
| Acceptance | comment และ approver/time ถูก log |

### UC-04 Publish Current Version

| Field | Detail |
|---|---|
| Primary Actor | ISO/QA Admin |
| Main Flow | 1) เลือก approved document 2) กำหนด effective date 3) publish 4) ระบบปิด current version เดิม |
| Postconditions | DocumentVersion status = Published current |
| Acceptance | มี current published version เดียวต่อ document_code |

### UC-07 Acknowledge Document

| Field | Detail |
|---|---|
| Primary Actor | End User |
| Main Flow | 1) เปิด current document 2) อ่าน/preview 3) กดรับทราบ |
| Postconditions | Ack record บันทึก user/time/version |
| Acceptance | Dashboard ดึง ack summary ได้ |

### UC-08 Create Record/Evidence

| Field | Detail |
|---|---|
| Primary Actor | ISO User / CAR Owner |
| Main Flow | 1) เปิด Record Form 2) กรอก metadata 3) เลือก document reference 4) แนบไฟล์ 5) save |
| Postconditions | Record ผูกกับ document_id |
| Acceptance | ค้นหา record และดูไฟล์ได้ |

### UC-09 Create Audit Finding

| Field | Detail |
|---|---|
| Primary Actor | Auditor |
| Main Flow | 1) เปิด audit round 2) สร้าง finding 3) อ้างเอกสาร/ข้อกำหนด/record 4) บันทึก |
| Postconditions | Finding status = Open |
| Acceptance | Finding มี evidence หรือ reference ชัดเจน |

### UC-10 Open CAR

| Field | Detail |
|---|---|
| Primary Actor | ISO Admin / Auditor |
| Main Flow | 1) เลือก finding 2) กด Open CAR 3) กำหนด owner/due date 4) save |
| Postconditions | CAR status = Open |
| Acceptance | CAR ปรากฏใน dashboard และ overdue monitor |

### UC-11 Update / Verify / Close CAR

| Field | Detail |
|---|---|
| Primary Actor | CAR Owner / Auditor |
| Main Flow | 1) CAR Owner บันทึก root cause/action/evidence 2) ส่ง verify (สถานะเป็น Pending Verify) 3) Auditor บันทึกผล verify: ผ่านให้ close, ไม่ผ่านให้ย้อนกลับเป็น In Progress พร้อม comment |
| Postconditions | CAR Closed หรือกลับเป็น In Progress |
| Acceptance | Close ได้เมื่อมี required fields และ evidence |

### UC-12 View Operational Dashboard

| Field | Detail |
|---|---|
| Primary Actor | ISO Admin / Manager |
| Main Flow | 1) เปิด dashboard 2) ระบบ aggregate data 3) แสดง cards/charts/recent/overdue |
| Postconditions | ผู้ใช้เห็น status จากข้อมูลจริง |
| Acceptance | ไม่มี hardcoded mock data ใน final demo |

---

## 10. User Stories + Acceptance Criteria

### Epic A — Document Control

| Story ID | User Story | Acceptance Criteria |
|---|---|---|
| US-A01 | ในฐานะ Document Owner ฉันต้องการสร้างเอกสารฉบับร่าง เพื่อเริ่มกระบวนการควบคุมเอกสาร | บันทึก draft พร้อม metadata/file ได้ |
| US-A02 | ในฐานะ ISO Admin ฉันต้องการให้ระบบมี current version เดียว เพื่อกันการใช้เอกสารผิดฉบับ | publish แล้ว current เดิมถูกปิด |
| US-A03 | ในฐานะ End User ฉันต้องการค้นหาเอกสารด้วยรหัส/ชื่อ เพื่อเข้าถึงเอกสารได้เร็ว | search/filter ทำงานและแสดง current version |

### Epic B — DAR / Workflow

| Story ID | User Story | Acceptance Criteria |
|---|---|---|
| US-A04 | ในฐานะ Document Owner ฉันต้องการส่ง DAR เพื่อขอเปลี่ยนแปลงเอกสาร | DAR ถูกสร้างและเข้าสู่ queue |
| US-A05 | ในฐานะ Approver ฉันต้องการ approve/reject พร้อม comment | สถานะเปลี่ยนและ log comment |

### Epic C — Acknowledgement

| Story ID | User Story | Acceptance Criteria |
|---|---|---|
| US-A06 | ในฐานะ End User ฉันต้องการกดรับทราบเอกสาร | ack เก็บ user/time/version |
| US-A07 | ในฐานะ ISO Admin ฉันต้องการดูสถานะผู้รับทราบ | report หรือ summary แสดงครบ |

### Epic D — Records / Audit / CAR

| Story ID | User Story | Acceptance Criteria |
|---|---|---|
| US-B01 | ในฐานะ ISO User ฉันต้องการเก็บ record/evidence | record ผูกกับ document และค้นหาได้ |
| US-B02 | ในฐานะ Auditor ฉันต้องการบันทึก finding | finding มี reference/evidence |
| US-B03 | ในฐานะ ISO Admin ฉันต้องการเปิด CAR จาก finding | CAR มี owner/due_date/status |
| US-B04 | ในฐานะ CAR Owner ฉันต้องการอัปเดต root cause/action/evidence | ส่ง verify ได้เมื่อข้อมูลครบ |
| US-B05 | ในฐานะ Auditor ฉันต้องการบันทึกผล verify และ close CAR | status เปลี่ยนพร้อม audit trail |

### Epic E — Dashboard

| Story ID | User Story | Acceptance Criteria |
|---|---|---|
| US-B06 | ในฐานะ ISO Admin ฉันต้องการเห็นจำนวนเอกสารตามสถานะ | cards/charts ดึงจาก Group A |
| US-B07 | ในฐานะ ISO Admin ฉันต้องการเห็น CAR overdue | overdue list คำนวณจาก due_date |
| US-B08 | ในฐานะผู้บริหาร ฉันต้องการเห็นภาพรวมระบบคุณภาพ | dashboard มี document, ack, finding, CAR |

---

## 11. Testing Requirements

| Test Area | Minimum Test Cases |
|---|---|
| Document Lifecycle | create → submit → approve → publish → obsolete |
| DAR | create/approve/reject/search |
| Acknowledgement | assign/ack/report |
| Record | create/link/upload/search |
| Audit/Finding | create finding/link evidence |
| CAR | open/update/verify/close/overdue |
| Dashboard | cards/charts/recent list จากข้อมูลจริง |
| RBAC | user แต่ละ role เห็นเมนู/action ที่ถูกต้อง |
| Integration | Group B ดึง document status/ack จาก Group A ได้ |

---

## 12. Definition of Done สำหรับ Phase 1

1. ระบบหลักของ Group A และ Group B run ได้พร้อมกัน
2. มี seed data จากเอกสารจริงอย่างน้อยชุด pilot
3. Flow กลุ่ม A ทำได้ครบ Document → DAR → Approve → Publish → Ack
4. Flow กลุ่ม B ทำได้ครบ Record → Finding → CAR → Dashboard
5. Shared contract ใช้จริง ไม่สร้างข้อมูลซ้ำ
6. มี README, test cases, demo script, UAT evidence
7. Dashboard ใช้ข้อมูลจริงจากฐานข้อมูล
