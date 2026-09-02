# 04 — Action Plan 3 เดือน: Group A / Group B
## ก่อนออกแบบ ERD กลาง + Shared API Contract และก่อนเริ่มพัฒนา Phase 1 MVP

**ระยะเวลา:** 3 เดือน / 12 สัปดาห์  
**แนวทาง:** Phase 1 MVP + Operational Dashboard  
**หมายเหตุ:** เอกสารนี้ปรับปรุงจากแหล่งข้อมูลในโครงการ ได้แก่ Master Plan, Phase 1 BRD, SE02 Group A/B ที่อนุมัติ/นำเสนอแล้ว, เอกสารคุณภาพจริงของสำนักงานคณบดีคณะวิศวกรรมศาสตร์ มทร.ล้านนา เช่น QM, QP, SD, FM, Master List และ DAR โดยยังคงกรอบ Phase 1 MVP + Operational Dashboard: Group A = Document Control/DAR/Acknowledgement และ Group B = Records/Audit/CAR/Dashboard

---

## 1. เป้าหมายใน 3 เดือน

ภายใน 3 เดือน ทั้งสองกลุ่มต้องส่งมอบ prototype ที่ทำงานร่วมกันได้ใน flow หลักต่อไปนี้

- **Group A:** Document → DAR → Approve → Publish → Acknowledge
- **Group B:** Record → Finding → CAR → Dashboard
- **Integration:** Dashboard ใช้ข้อมูลจริงจาก Group A และ Group B ผ่าน shared contract

---

## 2. Milestone หลัก

| Milestone | สัปดาห์ | ผลลัพธ์ |
|---|---|---|
| M1 Requirement Freeze | Week 1 | Scope, role, status, pilot docs ชัดเจน |
| M2 ERD + API Contract Freeze | Week 2 | ERD กลาง, shared IDs, endpoint draft |
| M3 UI Flow + Project Skeleton | Week 3 | wireframe, repo, auth skeleton |
| M4 Core CRUD | Week 4-5 | Document/Record core ใช้งานได้ |
| M5 Workflow Core | Week 6-7 | DAR/Audit/Finding/CAR ทำงานได้ |
| M6 Dashboard + Ack/Overdue | Week 8-9 | Ack และ dashboard เบื้องต้นใช้ข้อมูลจริง |
| M7 Integration Test | Week 10 | A/B เชื่อมข้อมูลกันได้ |
| M8 UAT + Fix | Week 11 | ผู้ใช้ทดลองตาม scenario |
| M9 Final Demo Package | Week 12 | demo script, report, evidence, source code |

---

## 3. แผนรายสัปดาห์แบบละเอียด

| Week | Shared / BA-PO | Group A | Group B | Deliverable |
|---|---|---|---|---|
| 1 | Review raw ISO sources, signed SE02, freeze Phase 1 scope | วิเคราะห์ Master List/DAR fields | วิเคราะห์ Audit/CAR/Form fields | Scope freeze + source inventory |
| 2 | ทำ ERD กลางและ API Contract draft | นิยาม Document/DAR/Ack schema | นิยาม Record/Finding/CAR/Dashboard schema | ERD v0.1 + API Contract v0.1 |
| 3 | กำหนด UI standard, repo, branch, auth rule | Wireframe Document/DAR/Ack | Wireframe Record/Audit/CAR/Dashboard | Wireframe + repo skeleton |
| 4 | Review sprint 1 | Auth/RBAC + Document Type + Document CRUD | Record Type + Record CRUD | Core CRUD demo 1 |
| 5 | ตรวจ shared IDs | File upload/download + search/filter | Evidence upload + link to document | CRUD demo 2 + file handling |
| 6 | Review workflow | DAR create/submit + approval queue | Audit header + finding form | Workflow demo 1 |
| 7 | Integration sync | approve/reject + publish/obsolete + revision history | open CAR + update root cause/action | Workflow demo 2 |
| 8 | ตรวจ data contract | Acknowledgement assignment/ack log | due date/overdue logic | Ack + overdue demo |
| 9 | Dashboard data validation | Document summary/ack summary API | Dashboard cards/charts/recent lists | Dashboard demo from real data |
| 10 | Integration test | Fix A endpoints + integration issues | Consume A APIs + integration issues | Integrated demo |
| 11 | UAT with pilot scenarios | UAT fixes for A | UAT fixes for B | UAT evidence |
| 12 | Final review | Final report + manual + code freeze | Final report + manual + code freeze | Final demo package |

---

## 4. งานของ Group A ภายใน 3 เดือน

### Month 1 — Foundation

| Task | Output |
|---|---|
| วิเคราะห์ Master List/DAR | field list + mapping |
| ออกแบบ document lifecycle | status transition diagram |
| สร้าง document master | document CRUD |
| ทำ file upload | upload/download metadata |
| ทำ search/filter | search by code/title/type/status |

### Month 2 — Workflow

| Task | Output |
|---|---|
| ทำ DAR form | create/submit DAR |
| ทำ approval queue | approve/reject/comment |
| ทำ publish/obsolete | current version control |
| ทำ revision history | timeline/log |
| ทำ acknowledgement | ack assignment + ack log |

### Month 3 — Integration / UAT

| Task | Output |
|---|---|
| ทำ document summary API | ให้ Group B ใช้ dashboard |
| ทำ acknowledgement summary API | ack rate สำหรับ dashboard |
| integration testing | document/ack data ใช้ใน B ได้ |
| UAT fixes | แก้ตาม scenario |
| final demo | Document → DAR → Publish → Ack |

---

## 5. งานของ Group B ภายใน 3 เดือน

### Month 1 — Foundation

| Task | Output |
|---|---|
| วิเคราะห์ Audit/CAR forms | field list + mapping |
| ออกแบบ record/evidence model | record schema |
| ทำ record CRUD | record list/form/detail |
| ทำ evidence upload | file evidence |
| เตรียม dashboard layout | card/chart placeholders |

### Month 2 — Workflow

| Task | Output |
|---|---|
| ทำ audit header/finding | finding form/list |
| ทำ link finding-document-record | traceability |
| ทำ CAR from finding | open CAR |
| ทำ CAR update | root cause/action/evidence |
| ทำ overdue logic | overdue list/status color |

### Month 3 — Dashboard / Integration / UAT

| Task | Output |
|---|---|
| consume Group A document API | document status cards |
| consume Group A ack API | ack rate cards/chart |
| dashboard CAR/finding | open/overdue/closed/recent finding |
| integration testing | dashboard จากข้อมูลจริง |
| final demo | Record → Finding → CAR → Dashboard |

---

## 6. Gate Review รายสัปดาห์

| Gate | คำถามที่ต้องตอบได้ |
|---|---|
| Week 1 | scope ไม่หลุดจาก Phase 1 MVP ใช่หรือไม่ |
| Week 2 | A/B ใช้ entity และ ID เดียวกันหรือไม่ |
| Week 3 | UI flow ครอบคลุม use case หลักหรือไม่ |
| Week 5 | CRUD + file ใช้งานจริงหรือยัง |
| Week 7 | workflow หลักเดินได้จริงหรือยัง |
| Week 9 | dashboard ใช้ข้อมูลจริงหรือ mock data |
| Week 10 | integration จุดสำคัญผ่านหรือยัง |
| Week 11 | UAT scenario ผ่าน ≥ 80–90% หรือไม่ |
| Week 12 | demo, report, source, manual พร้อมหรือไม่ |

---

## 7. UAT Scenario ขั้นต่ำ

### Scenario A1 — Document Flow

1. Owner สร้างเอกสาร QP ตัวอย่าง
2. สร้าง DAR เพื่อขอประกาศใช้
3. Approver approve
4. ISO Admin publish
5. End User เปิดดูและ acknowledge
6. Dashboard แสดง document published และ ack summary

### Scenario B1 — Audit/CAR Flow

1. Auditor สร้าง audit round
2. บันทึก finding อ้างอิง document จาก Group A
3. แนบ evidence/record
4. เปิด CAR
5. CAR Owner บันทึก root cause/action/evidence
6. Auditor verify/close
7. Dashboard แสดง CAR status และ overdue ถูกต้อง

### Scenario INT1 — Traceability

1. เปิด document detail
2. เห็น records/finding/CAR ที่เกี่ยวข้อง
3. เปิด dashboard แล้ว drill หรือ link ไปยังรายการที่เกี่ยวข้องได้อย่างน้อยในระดับ list/detail

---

## 8. Deliverables เมื่อจบ 3 เดือน

| ประเภท | รายการ |
|---|---|
| Source Code | frontend/backend/database migration/seed |
| Documents | BRD/SRS final, ERD, API contract, use case, test cases |
| Demo Data | pilot documents, DAR sample, records, findings, CAR |
| Test Evidence | unit/manual/UAT screenshots หรือ logs |
| User Guide | คู่มือผู้ใช้ราย role เบื้องต้น |
| Demo Script | flow สำหรับนำเสนอ 10–15 นาที |

---

## 9. Risk Control

| Risk | Owner | Mitigation |
|---|---|---|
| A/B รวมระบบไม่ได้ | BA/PO + both groups | ERD/API freeze Week 2 และ integration Week 10 |
| Scope ใหญ่เกิน | BA/PO | ใช้ Must/Should/Could และตัด advanced features |
| Group B ใช้ mock data dashboard | Group B | บังคับ consume API จาก A ใน Week 9-10 |
| Group A ทำ workflow ซับซ้อนเกิน | Group A | single-level approval เท่านั้น |
| File upload ไม่เสถียร | Both | ใช้ local storage + file metadata ง่ายก่อน |
| UAT ไม่ทัน | Both | เริ่มเตรียม scenario ตั้งแต่ Week 6 |

---

## 10. สิ่งที่ต้องทำทันทีหลังเอกสารนี้

1. สรุป field จาก Master List และ DAR เป็น data dictionary
2. ยืนยัน role และ permission matrix
3. ทำ ERD กลาง v0.1
4. ทำ API Contract v0.1
5. กำหนด seed data ชุด pilot
6. สร้าง repo/project skeleton
7. สร้าง backlog ราย sprint จาก requirement ในเอกสารนี้
