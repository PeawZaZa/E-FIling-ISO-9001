# 03 — SE02 Review & SRS Mapping: Group A / Group B
## การทบทวนเอกสารที่นักศึกษานำเสนอและการ map เข้ากับ BRD/SRS Phase 1

**สถานะเอกสาร:** Working Draft v2.0  
**เป้าหมาย:** ใช้กำหนดขอบเขตงานต่อจาก SE02 ที่ผ่านการนำเสนอแล้ว  
**หมายเหตุ:** เอกสารนี้ปรับปรุงจากแหล่งข้อมูลในโครงการ ได้แก่ Master Plan, Phase 1 BRD, SE02 Group A/B ที่อนุมัติ/นำเสนอแล้ว, เอกสารคุณภาพจริงของสำนักงานคณบดีคณะวิศวกรรมศาสตร์ มทร.ล้านนา เช่น QM, QP, SD, FM, Master List และ DAR โดยยังคงกรอบ Phase 1 MVP + Operational Dashboard: Group A = Document Control/DAR/Acknowledgement และ Group B = Records/Audit/CAR/Dashboard

---

## 1. Executive Summary

จากการทบทวนเอกสาร SE02 ของทั้งสองกลุ่ม พบว่า scope หลักสอดคล้องกับแนวทางที่กำหนดไว้ คือ **Phase 1 MVP + Operational Dashboard** โดย Group A รับผิดชอบ Document Control/DAR/Acknowledgement และ Group B รับผิดชอบ Records/Audit/CAR/Dashboard อย่างไรก็ตาม ก่อนเริ่ม ERD และ API Contract จำเป็นต้องปรับ mapping ให้ชัดเจนมากขึ้น เพื่อป้องกันงานซ้ำซ้อนและกำหนด boundary ที่ตรวจสอบได้

---

## 2. Baseline ที่ต้องยึดร่วมกัน

| Baseline | รายละเอียด |
|---|---|
| Master Plan | กำหนดภาพรวม Phase 1 และการแบ่งงาน 2 กลุ่ม |
| Phase 1 BRD | กำหนด requirement กลางและ acceptance criteria |
| Phase 1 SRS | กำหนด functional/non-functional/use case/user story |
| SE02 Group A | ใช้ยืนยัน scope ด้าน Document Control/DAR/Ack |
| SE02 Group B | ใช้ยืนยัน scope ด้าน Records/Audit/CAR/Dashboard |
| Raw ISO Source | QM/QP/SD/FM/Master List/DAR ใช้เป็นข้อมูลจริงสำหรับออกแบบและ seed data |

---

## 3. ทบทวน Group A — Document Control / DAR / Acknowledgement

### 3.1 Scope ที่ควรรักษาไว้

| Area | Status | เหตุผล |
|---|---|---|
| Document Control | Keep as primary scope | เป็นแหล่งข้อมูลต้นทางของระบบทั้งหมด |
| DAR Workflow | Keep as primary scope | สอดคล้องกับแบบฟอร์ม DAR และการควบคุมเอกสาร |
| Publication / Current Version | Keep as primary scope | ลดการใช้เอกสารผิดเวอร์ชัน |
| Obsolete Control | Keep as primary scope | จำเป็นต่อ document lifecycle |
| Acknowledgement | Keep as primary scope | สร้างหลักฐานการรับทราบ |
| Revision History | Keep as primary scope | รองรับ traceability |
| Search / Filter | Keep as primary scope | ใช้งานจริงและ demo ได้ชัดเจน |
| Dashboard | จำกัดเป็น data provider | Group B เป็นเจ้าของ dashboard รวม |

### 3.2 Scope ที่ควรปรับให้ชัด

| ประเด็น | ปรับเป็น |
|---|---|
| Document lifecycle | ใช้ status กลาง: Draft, Review, Approved, Published, Obsolete |
| DAR status | ใช้ status กลาง: Draft, Submitted, Reviewed, Approved, Rejected, Closed |
| Current version | บังคับ unique current published ต่อ document_code |
| Acknowledgement | ผูกกับ document_version_id ไม่ใช่ document_id อย่างเดียว |
| Integration | Group A ต้อง expose document summary และ ack summary ให้ Group B |

### 3.3 Mapping Group A กับ SRS Phase 1

| Group A Scope | Phase 1 FR | Use Case | Priority |
|---|---|---|---|
| Document CRUD | FR-A01, FR-A02, FR-A03 | UC-01 | Must |
| Document Lifecycle | FR-A04, FR-A07, FR-A08 | UC-03, UC-04, UC-05 | Must |
| DAR | FR-A05, FR-A06 | UC-02, UC-03 | Must |
| Search/View | FR-A09 | UC-06 | Must |
| Acknowledgement | FR-A10, FR-A11 | UC-07 | Must |
| Data for Dashboard | FR-A12 | UC-12 support | Must |
| RBAC / Audit Trail | FR-SH02, FR-SH04 | UC-14 | Must |

### 3.4 Deliverable ที่ Group A ต้องส่งมอบ

1. Web UI: Document List, Document Detail, Create/Edit Document, DAR List/Form, Approval Queue, Ack Tracking
2. API: document, document version, DAR, approval, acknowledgement, document summary
3. Database tables: Document, DocumentVersion, DAR, Acknowledgement, ApprovalLog, AuditTrail ส่วนที่เกี่ยวข้อง
4. Seed data: ตัวอย่าง QM/QP/FM จาก Master List และ DAR ตัวอย่าง
5. Integration endpoint ให้ Group B

---

## 4. ทบทวน Group B — Records / Audit / CAR / Dashboard

### 4.1 Scope ที่ควรรักษาไว้

| Area | Status | เหตุผล |
|---|---|---|
| Records/Evidence | Keep as primary scope | เป็นหลักฐานว่าปฏิบัติตามเอกสารจริง |
| Audit/Finding | Keep as primary scope | สอดคล้องกับ internal audit |
| CAR | Keep as primary scope | สอดคล้องกับ corrective action |
| Overdue Monitor | Keep as primary scope | ช่วยติดตามงานค้าง |
| Operational Dashboard | Keep as primary scope | ผู้ใช้ต้องการ dashboard ใน Phase 1 |
| Export Summary | Should scope | ทำได้ถ้าเวลาเหลือหลัง dashboard ใช้ข้อมูลจริง |
| Document CRUD | Out of direct scope | ใช้ข้อมูลจาก Group A เท่านั้น |

### 4.2 Scope ที่ควรปรับให้ชัด

| ประเด็น | ปรับเป็น |
|---|---|
| Records | ต้องผูก document_id จาก Group A หรือ finding/CAR |
| Finding | ต้องผูก evidence หรือ document reference อย่างน้อย 1 รายการ |
| CAR | ต้องสร้างจาก finding เป็นหลัก ไม่เปิด CAR ลอย ๆ ใน MVP |
| Dashboard | ต้องรวม document status/ack จาก Group A และ CAR/finding จาก Group B |
| Overdue | คำนวณจาก due_date < today และ status ยังไม่ Closed |

### 4.3 Mapping Group B กับ SRS Phase 1

| Group B Scope | Phase 1 FR | Use Case | Priority |
|---|---|---|---|
| Record CRUD | FR-B01, FR-B02 | UC-08 | Must |
| Audit/Finding | FR-B03, FR-B04, FR-B05 | UC-09 | Must |
| CAR | FR-B06, FR-B07, FR-B08, FR-B10 | UC-10, UC-11 | Must/Should |
| Overdue | FR-B09 | UC-11, UC-12 | Must |
| Dashboard | FR-B11, FR-B12, FR-B13 | UC-12 | Must |
| Export Summary | FR-B14 | UC-13 | Should |
| Audit Trail | FR-SH04 | UC-14 | Must |

### 4.4 Deliverable ที่ Group B ต้องส่งมอบ

1. Web UI: Record List/Form, Audit/Finding Form, CAR List/Detail, Overdue Monitor, Dashboard
2. API: records, findings, CAR, dashboard summary, overdue, export summary
3. Database tables: Record, RecordFile, Audit, Finding, CAR, CARAction, Dashboard views, AuditTrail ส่วนที่เกี่ยวข้อง
4. Integration: consume document summary และ acknowledgement summary จาก Group A
5. Dashboard: document status, ack rate, open CAR, overdue CAR, recent findings, recent documents

---

## 5. Boundary ที่ห้ามทับกัน

| เรื่อง | Owner | ห้ามทำซ้ำโดยอีกกลุ่ม |
|---|---|---|
| Document master | A | B ห้ามสร้าง document table แยกเพื่อใช้จริง |
| Current version | A | B อ่านอย่างเดียว |
| DAR approval | A | B ไม่ทำ approval DAR |
| Ack assignment/detail | A | B ใช้ summary เท่านั้น |
| Record/evidence | B | A ไม่ทำ record module เต็ม |
| Finding/CAR | B | A ไม่ทำ finding/CAR module |
| Dashboard รวม | B | A อาจมี my task/dashboard lite ได้ แต่ไม่ใช่ dashboard หลัก |

---

## 6. Shared Contract ที่ต้องนิยามก่อน ERD/API

### 6.1 Shared IDs

| Field | Meaning | ใช้โดย |
|---|---|---|
| user_id | ผู้ใช้กลาง | A/B |
| role_id | role กลาง | A/B |
| department_id | หน่วยงาน | A/B |
| document_id | primary reference ของเอกสาร | A/B |
| document_code | รหัสเอกสาร เช่น QP-2301-0107 | A/B |
| version_id | version ที่ published/ack | A/B |
| file_id | ไฟล์เอกสาร/หลักฐาน | A/B |

### 6.2 Group A → Group B Data Feed ขั้นต่ำ

| Endpoint/ข้อมูล | Purpose |
|---|---|
| Document summary | dashboard เอกสารตาม status/type |
| Published document list | ใช้เลือก document reference ใน Record/Finding |
| Acknowledgement summary | dashboard ack rate |
| Document detail by id | แสดง reference ใน audit/CAR |

### 6.3 Group B → Group A Data Feed ขั้นต่ำ

| Endpoint/ข้อมูล | Purpose |
|---|---|
| Record count by document | แสดงจำนวนหลักฐานที่ผูกกับเอกสาร |
| Finding count by document | แสดงเอกสารที่มี finding |
| CAR count/status by document | ใช้ใน detail หรือ traceability |

---

## 7. Gap Analysis จาก SE02 เดิม

| Gap | ผลกระทบ | Action |
|---|---|---|
| ยังไม่ได้ล็อก shared data model | integration ล้มเหลวช่วงท้าย | ทำ ERD กลางก่อน dev |
| Group A มี dashboard/data provider แต่ขอบเขต dashboard ยังไม่ชัด | ทำ dashboard ซ้ำ | กำหนดว่า B เป็น dashboard owner |
| Group B ต้องดึงข้อมูลจาก A แต่ยังไม่มี contract | dashboard อาจใช้ mock data | ทำ API contract สัปดาห์ที่ 2 |
| CAR close criteria ยังไม่ชัด | ปิดงานแบบไม่มี evidence | กำหนด required fields ก่อน close |
| Ack ผูก document หรือ version ยังไม่ชัด | traceability ไม่ครบ | ผูกกับ version_id |
| File storage ยังไม่ชัด | upload ซ้ำ/ย้ายยาก | ใช้ file table กลางหรือ naming convention กลาง |

---

## 8. Requirement-to-Group Final Checklist

### Group A Must Have

- Document CRUD
- File upload/download
- Document status lifecycle
- DAR create/review/approve/reject
- Publish current version
- Obsolete
- Revision history
- Acknowledgement
- Search/filter
- Document summary API

### Group B Must Have

- Record/evidence CRUD
- Link record to document
- Audit/finding
- Open CAR from finding
- Update RCA/action/evidence
- Due date and overdue
- Verify/close CAR
- Dashboard from real data
- Consume Group A API

### Shared Must Have

- User/role seed
- Auth/RBAC
- AuditTrail
- Shared statuses
- Demo dataset
- Integration test cases

---

## 9. สรุปการตัดสินใจ

เอกสาร SE02 ที่นักศึกษานำเสนอใช้เป็น baseline ได้ แต่ต้องผูกเข้ากับ BRD/SRS กลางให้ชัดเจนก่อนลงมือทำ ERD/API โดยเฉพาะเรื่อง shared data model, owner ของ dashboard และการเชื่อมข้อมูล document/ack จาก Group A ไปยัง Group B
