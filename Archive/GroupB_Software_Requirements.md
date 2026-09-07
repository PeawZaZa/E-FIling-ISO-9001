# ความต้องการซอฟต์แวร์ — Group B (Records / Audit / Finding / CAR / Dashboard)

เอกสารทำงานภายในทีม สรุปความต้องการของระบบเฉพาะขอบเขตกลุ่ม B แบบกระชับกว่า SRS เต็มรูปแบบ ไม่มี boilerplate ตาม IEEE 830 ทุกข้อในเอกสารนี้ดึงมาจากเอกสารต้นทางใน `Extra details/` เท่านั้น (ไม่มีการคิดความต้องการใหม่) แต่ละข้อมีคอลัมน์อ้างอิงกลับไปยัง FR/NFR/UC ต้นทางเพื่อตรวจสอบย้อนกลับได้ อ่านคู่กับ `PROJECT_SUMMARY.md` (ภาพรวมไฟล์) และ `CLAUDE.md` (มติที่ล็อกไว้)

**แหล่งที่มาหลัก:** `Extra details/E-Filing_Phase1_SRS_Revised_GroupA_GroupB.md` (SRS), `01_BRD_Phase1_Updated_RMUTL_ISO9001.md` (BRD), `E-Filing_Phase1_Detailed_UseCase_Specification.md` (Use Case), `E-Filing_Phase1_SRS_Traceability_Matrix_GroupA_GroupB.md` (Traceability) — ทั้งหมดผ่านการแก้สถานะ CAR เป็น 4 สถานะแล้ว ณ วันที่จัดทำเอกสารนี้

---

## 1. ขอบเขต

**กลุ่ม B ทำ:** บันทึก Record/หลักฐาน, จัดรอบตรวจติดตามภายใน (Internal Audit), บันทึก Finding, เปิดและติดตาม CAR จนปิด, ตรวจ CAR เกินกำหนด (Overdue), แสดง Dashboard ปฏิบัติการ, Export รายงานสรุป

**กลุ่ม B ไม่ทำ:** สร้าง/แก้ไขข้อมูลเอกสาร (Document), DAR, การอนุมัติ/เผยแพร่เอกสาร, การรับทราบเอกสาร (Acknowledgement) — ทั้งหมดนี้เป็นของกลุ่ม A กลุ่ม B **อ่านอย่างเดียว** ผ่าน Shared Contract (SRS §1.2, §2.1; BRD §6)

**หลักการสำคัญ:** Group A คือ Single Source of Truth ของข้อมูลเอกสาร ห้ามกลุ่ม B สร้าง schema เอกสารซ้ำหรือ cache ข้อมูลเอกสารแบบถาวรจนไม่ sync กับกลุ่ม A (NFR-06)

---

## 2. บทบาทผู้ใช้

มติที่ล็อกไว้กำหนด 4 บทบาท (`CLAUDE.md`) ส่วน SRS ต้นทางกำหนดไว้ละเอียดกว่าเป็น 9 Actor (ACT-01–09) ตารางนี้ทำ mapping ให้ตรงกันสำหรับงานฝั่งกลุ่ม B:

| บทบาท (4 บทบาทตามมติ) | เทียบเท่า Actor ในเอกสารต้นทาง | ทำอะไรได้ในโมดูลกลุ่ม B |
|---|---|---|
| **Admin** | ACT-07 IT/Admin | จัดการ user/role/master data, ดู audit trail ทั้งหมด |
| **ISO/QA User** | ACT-04 ISO/QA Admin (ครึ่งงานฝั่ง B) | ดู dashboard, ดู audit trail, กำกับ workflow CAR, สามารถ verify/close CAR ได้ |
| **Auditor** | ACT-05 Auditor | สร้าง audit round, บันทึก finding, เปิด CAR จาก finding, verify/close CAR, export รายงาน |
| **CAR Owner** | ACT-06 CAR Owner | วิเคราะห์ root cause, บันทึก corrective action, แนบ evidence, ส่ง verify — **ต้องไม่ใช่คนเดียวกับผู้ verify/close CAR ใบเดียวกัน (Separation of Duty)** |

ACT-01 (End User) และ ACT-08/09 (Group A/B System) เกี่ยวข้องกับกลุ่ม B เฉพาะฝั่งอ่าน dashboard และ integration API เท่านั้น ไม่ถือเป็นบทบาทผู้ใช้แยกในระบบกลุ่ม B

---

## 3. Shared Contract กับกลุ่ม A

กลุ่ม B **อ่านอย่างเดียว** ผ่าน 2 endpoint ที่กลุ่ม A เปิดให้ (SRS §6.2, mapped FR-A12/FR-B11/FR-B12):

| Endpoint | ให้ข้อมูลอะไร | ใช้ในโมดูล |
|---|---|---|
| `GET /integration/document-summary` | จำนวนเอกสารตามสถานะ (Draft/Review/Approved/Published/Obsolete) | Dashboard (FR-B11) |
| `GET /integration/ack-summary` | อัตราการรับทราบเอกสาร (ack rate) | Dashboard (FR-B12) |

**ข้อบังคับ (NFR-06):** ห้าม duplicate schema เอกสารในฝั่งกลุ่ม B ต้องอ้างอิง `document_id` / `document_code` / `version` / `status` ตามที่กลุ่ม A กำหนด (Design Constraint ข้อ 4 ใน SRS §2.4)

---

## 4. ความสามารถรายโมดูล

### 4.1 Records / Evidence
| ความต้องการ | FR | UC | ความสำคัญ |
|---|---|---|---|
| สร้าง แก้ไข ค้นหา record ได้ | FR-B01 | UC-B01 | Must |
| แนบไฟล์ evidence และผูกกับ `document_id`/`record_id` ได้ | FR-B02 | UC-B01, UC-B03, UC-B05 | Must |

### 4.2 Audit & Finding
| ความต้องการ | FR | UC | ความสำคัญ |
|---|---|---|---|
| สร้าง audit round/header พร้อม scope/date/auditor | FR-B03 | UC-B02 | Should |
| บันทึก finding พร้อม type (NC/OFI/Observation)/severity/description/status | FR-B04 | UC-B03 | Must |
| ผูก finding กับ document/record/evidence ได้ (Traceability) | FR-B05 | UC-B03 | Must |

### 4.3 CAR (Corrective Action Request)
| ความต้องการ | FR | UC | ความสำคัญ |
|---|---|---|---|
| สร้าง CAR จาก finding ได้ | FR-B06 | UC-B04 | Must |
| ป้องกันเปิด CAR ซ้ำจาก finding ที่มี CAR เปิดอยู่แล้ว | FR-B06 (ขยายจาก Traceability SC-B04-02) | UC-B04 | Must |
| เก็บ owner, due_date, root_cause, corrective_action, status | FR-B07 | UC-B04, UC-B05 | Must |
| แนบ evidence ให้ CAR ได้ | FR-B08 | UC-B05 | Must |
| บันทึกผล verify และ close CAR ได้ หากไม่ผ่านให้ย้อนสถานะกลับเป็น In Progress พร้อม comment | FR-B10 | UC-B06 | Should |

### 4.4 Overdue Monitor
| ความต้องการ | FR | UC | ความสำคัญ |
|---|---|---|---|
| คำนวณ overdue จาก `due_date` และ status | FR-B09 | UC-B07 | Must |

### 4.5 Dashboard
| ความต้องการ | FR | UC | ความสำคัญ |
|---|---|---|---|
| แสดงจำนวนเอกสารตามสถานะ (จากกลุ่ม A) | FR-B11 | UC-B08 | Must |
| แสดง acknowledgement rate (จากกลุ่ม A) | FR-B12 | UC-B08 | Must |
| แสดง CAR open/overdue/closed และ recent findings | FR-B13 | UC-B08 | Must |

### 4.6 Export & Audit Trail
| ความต้องการ | FR | UC | ความสำคัญ |
|---|---|---|---|
| Export summary report เบื้องต้น (audit/CAR/dashboard) | FR-B14 | UC-B09 | Should |
| Login/Authentication (ใช้ร่วมกับกลุ่ม A) | FR-SH01 | UC-S01 | Must |
| RBAC พื้นฐาน | FR-SH02 | UC-S01, UC-S02 | Must |
| user_id/role_id กลาง | FR-SH03 | UC-S02 | Must |
| บันทึก audit trail สำหรับ event สำคัญ | FR-SH04 | UC-S03 | Must |
| Seed data สำหรับ demo/UAT | FR-SH05 | UC-S02 | Must |

---

## 5. สถานะและกฎธุรกิจ

### 5.1 สถานะ CAR (4 สถานะ)

| สถานะ | ความหมาย | ใครเปลี่ยนได้ |
|---|---|---|
| Open | เปิด CAR ใหม่จาก finding ยังไม่เริ่มแก้ไข | Auditor / ISO/QA User |
| In Progress | CAR Owner กำลังวิเคราะห์สาเหตุและดำเนินการแก้ไข | CAR Owner |
| Pending Verify | ส่งผลการแก้ไขให้ทวนสอบ รอผลการทวนสอบ | CAR Owner |
| Closed | ทวนสอบผ่านและปิด CAR แล้ว | Auditor / ISO/QA User |

**Transition:** `Open → In Progress → Pending Verify → Closed` — หากทวนสอบ**ไม่ผ่าน** ระบบย้อนสถานะกลับเป็น `In Progress` พร้อมบันทึก comment เหตุผล **ไม่มีสถานะ Reopened แยก**

### 5.2 กฎ Overdue
ไม่ใช่สถานะหลักของ CAR แต่เป็นค่าที่ระบบคำนวณ: `due_date < วันนี้ AND status ≠ Closed`

### 5.3 Separation of Duty
ผู้บันทึก root cause/corrective action ของ CAR (CAR Owner) ต้องไม่ใช่ผู้ verify/close CAR ใบเดียวกัน (ผูกกับบทบาท Auditor/ISO-QA User ในข้อ 2)

### 5.4 กฎ Finding → CAR
Finding ประเภท OFI ไม่บังคับต้องเปิด CAR ทันที ส่วนประเภท NC ควรนำไปสู่การเปิด CAR (อ้างอิงจาก Use Case Spec SC-B03-02)

### 5.5 กฎ Traceability
Record/Finding/CAR ทุกรายการต้อง trace กลับไปยัง document หรือ evidence ได้ (SRS Business Rule 6)

---

## 6. ข้อมูลหลัก (เอนทิตีของกลุ่ม B)

| เอนทิตี | ฟิลด์สำคัญ | หมายเหตุ |
|---|---|---|
| Record | record_id, type, description, evidence_file_id, document_id (อ้างอิงกลุ่ม A) | ผูกกับ document/audit/CAR ได้ |
| Audit | audit_id, scope, date, auditor_id | header ของรอบตรวจ |
| Finding | finding_id, audit_id, type (NC/OFI/Observation), severity, description, status, document_id/record_id (อ้างอิง) | ต้นทางของ CAR |
| CAR | car_id, finding_id, owner_id, due_date, root_cause, corrective_action, status, evidence_file_id | status ใช้ 4 ค่าตามข้อ 5.1 |
| AuditTrail | who, what, when, before/after (เท่าที่จำเป็น) | ใช้ร่วมกับกลุ่ม A (Shared) |

**ฟิลด์ที่อ้างอิงข้ามไปกลุ่ม A (ห้าม duplicate):** `document_id`, `document_code`, `version_id`, `status` (ของเอกสาร) — ดึงผ่าน Shared Contract ในข้อ 3 เท่านั้น

---

## 7. หน้าจอ (UI) ฝั่งกลุ่ม B

| UI ID | หน้าจอ | ต้องแสดง/ทำอะไร |
|---|---|---|
| UI-B01 | Record List/Form | จัดการ records/evidence |
| UI-B02 | Audit/Finding Form | บันทึก audit round และ finding |
| UI-B03 | CAR List/Detail | ติดตาม CAR ตามสถานะ 4 สถานะ |
| UI-B04 | Overdue Monitor | รายการ CAR ที่เกินกำหนด |
| UI-B05 | Operational Dashboard | ภาพรวม document/ack (จากกลุ่ม A) + CAR/finding (จากกลุ่ม B) |
| UI-S03 | Audit Trail Viewer | ดู audit trail (ใช้ร่วมกับกลุ่ม A) |

---

## 8. API ที่ต้องมี (ฝั่งกลุ่ม B)

| พื้นที่ | Endpoint |
|---|---|
| Records | `GET/POST /records`, `POST /records/{id}/files` |
| Audit/Finding | `GET/POST /audits`, `GET/POST /findings` |
| CAR | `GET/POST /cars`, `PATCH /cars/{id}`, `POST /cars/{id}/verify` (ผลผ่าน → close, ผลไม่ผ่าน → กลับเป็น In Progress) |
| Dashboard | `GET /dashboard/summary` |
| Export | `GET /exports/audit-summary`, `GET /exports/car-summary` |
| Audit Trail | `GET /audit-trails` (Shared) |

**หมายเหตุ:** endpoint `POST /cars/{id}/reopen` ที่เคยปรากฏในเอกสารต้นทางถูกตัดออกแล้ว เพราะระบบใช้ผลของ `verify` เดียวกันตัดสินว่า close หรือย้อนกลับ ไม่มี endpoint แยกสำหรับ reopen

---

## 9. ข้อกำหนดที่ไม่ใช่ฟังก์ชัน (คัดเฉพาะที่บังคับกับกลุ่ม B)

| NFR | ความต้องการ |
|---|---|
| NFR-01 Security | RBAC ต้องบังคับสิทธิ์ทั้งเมนูและ API สำคัญของโมดูล B |
| NFR-02 Auditability | event สำคัญ (สร้าง/แก้ไข/verify/close CAR) ต้องเก็บ who/what/when |
| NFR-04 Performance | การค้นหา record ในชุดข้อมูล pilot ต้องตอบสนองในเวลาที่เหมาะสม |
| NFR-05 Maintainability | แยก business logic ของโมดูล B ออกจาก route/controller |
| NFR-06 Interoperability | ใช้ข้อมูลเอกสารผ่าน Shared Contract เท่านั้น ห้าม duplicate schema |
| NFR-08 Reliability | flow หลัก (Record → Finding → CAR → Evidence → Verify/Close) ต้องทำซ้ำได้ไม่ล้มใน UAT |

---

## 10. เกณฑ์การยอมรับ (Acceptance Criteria)

1. ทำ flow ครบ: Record → Finding → CAR → Evidence → Verify/Close (SRS §10 ข้อ 2)
2. Dashboard แสดงข้อมูลจริงจากกลุ่ม A และกลุ่ม B ไม่ใช้ mock เป็นผลลัพธ์สุดท้าย
3. ทุก critical event มี audit trail อย่างน้อย actor/action/entity/time
4. RBAC ป้องกันการเข้าถึง/แก้ไขข้อมูลนอกสิทธิ์ รวมถึงบังคับ Separation of Duty ของ CAR
5. CAR ที่ verify ไม่ผ่านต้องย้อนกลับเป็น In Progress ได้ถูกต้อง ไม่มีสถานะ Reopened ปรากฏในระบบ
6. Overdue monitor แสดงผลตรงกับกฎ `due_date < วันนี้ AND status ≠ Closed`

**UAT Checklist ฝั่งกลุ่ม B (จาก Traceability Matrix §8.2, ปรับคำหลังแก้สถานะ):**
- สร้าง record/evidence และผูกกับ document_id ได้
- สร้าง audit round และ finding ได้
- เปิด CAR จาก finding ได้ และป้องกันเปิดซ้ำ
- CAR Owner กรอก root cause/action/evidence ได้
- Auditor/ISO-QA User บันทึกผล verify และ close CAR ได้ (ไม่ผ่านย้อนกลับเป็น In Progress)
- ระบบแสดง overdue CAR ได้ถูกต้อง
- dashboard แสดงข้อมูลจริงจากกลุ่ม A และกลุ่ม B

---

## 11. เรื่องที่ยังไม่ตัดสินใจ (Open Issues)

| ประเด็น | รายละเอียด | ที่มา |
|---|---|---|
| ไลบรารีกราฟสำหรับ Dashboard | ยังไม่เลือก รอเติมในบทที่ 2 หัวข้อ 2.2.8 | CLAUDE.md |
| สิทธิ์ปิด CAR | ให้ Auditor/ISO-QA User close ได้เท่านั้น หรือ CAR Owner close ได้ด้วย | BRD §14 |
| ผู้ verify effectiveness ของ CAR | ใครเป็นผู้ยืนยันว่าการแก้ไขได้ผลจริงก่อน close | Traceability §9 |
| Record Retention | ระยะเวลาเก็บ record แต่ละประเภท กำหนดตอนนี้หรือ note ไว้ก่อน | Traceability §9 |
| Finding Type | ใช้ NC/OFI/Observation ตามนี้ หรือมีประเภทอื่นเพิ่ม | Traceability §9 |
| Dashboard minimum | การ์ด/กราฟใดเป็นขั้นต่ำที่ผู้ใช้ต้องการ | Traceability §9 |

ประเด็นเหล่านี้ต้องยืนยันกับผู้ใช้งานจริงหรืออาจารย์ที่ปรึกษาก่อนเริ่มออกแบบ ERD/API Contract โดยละเอียดในบทที่ 3
