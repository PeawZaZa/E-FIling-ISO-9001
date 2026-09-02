# E-Filing RMUTL ISO9001 Phase 1 - Detailed Use Case Specification
## พร้อม Use Case Diagram, Scenario Matrix และ SRS Mapping สำหรับ Group A / Group B

---

## 1. วัตถุประสงค์ของเอกสาร
เอกสารนี้ใช้กำหนด Use Case แบบละเอียดของระบบ E-Filing Phase 1 MVP + Operational Dashboard เพื่อให้ทีม Group A และ Group B เข้าใจว่าใครต้องทำอะไร ระบบต้องรองรับ scenario ใด และ requirement ใดใน SRS ต้องถูกทดสอบผ่าน use case ใด

## 2. Baseline ที่ใช้
- Phase 1 BRD/SRS กลางของโครงการ E-Filing RMUTL ISO9001
- Master Plan ที่กำหนดให้ Group A รับผิดชอบ Document Control / DAR / Ack และ Group B รับผิดชอบ Records / Audit / CAR / Dashboard
- SE02 Group A และ SE02 Group B ที่นักศึกษาเสนอแล้ว
- เอกสาร ISO จริงของหน่วยงาน: QM, QP, SD, FM, Master List, DAR

## 3. Scope
### 3.1 In Scope
- Group A: Document Control, DAR, Publish/Obsolete, Revision History, Acknowledgement, Document Summary API
- Group B: Records/Evidence, Audit/Finding, CAR, Overdue Monitor, Operational Dashboard, Export Summary
- Shared: Login/RBAC, User/Role, Audit Trail, Shared Data Contract

### 3.2 Out of Scope ในรอบนี้
- Risk register เต็มระบบ
- HR/Training matrix เต็มระบบ
- Management Review เต็มรูปแบบ
- Executive dashboard / KPI analytics ขั้นสูง
- Email/Line/SSO/OCR integration จริง

## 4. Actors และความรับผิดชอบ
| Actor ID | Actor | คำอธิบาย | ความรับผิดชอบหลัก |
| --- | --- | --- | --- |
| ACT-01 | End User | ผู้ใช้งานทั่วไป | ค้นหา/เปิดอ่านเอกสารฉบับปัจจุบัน, รับทราบเอกสาร, ดู dashboard ตามสิทธิ์ |
| ACT-02 | Document Owner | เจ้าของเอกสาร | สร้าง/แก้ไขเอกสาร, สร้าง DAR, ส่งขอทบทวน/อนุมัติ, ตรวจสอบ revision history |
| ACT-03 | Approver | ผู้ทบทวน/ผู้อนุมัติ | Review/Approve/Reject เอกสารหรือ DAR พร้อมเหตุผล |
| ACT-04 | ISO/QA Admin | ผู้ควบคุมระบบคุณภาพ | Publish/Obsolete, กำหนดกลุ่มผู้รับทราบ, ดู audit trail, กำกับ workflow |
| ACT-05 | Auditor | ผู้ตรวจติดตาม | สร้าง audit/finding, ตรวจหลักฐาน, export รายงาน |
| ACT-06 | CAR Owner | ผู้รับผิดชอบ corrective action | วิเคราะห์ root cause, บันทึก corrective action, แนบ evidence, ส่ง verify/close |
| ACT-07 | IT/Admin | ผู้ดูแลระบบ | จัดการ user/role/master data, ตรวจ log, สำรองข้อมูลในระดับโครงการ |
| ACT-08 | Group A System | ระบบย่อยเอกสาร | ส่ง document status, current version, acknowledgement summary ให้ Group B |
| ACT-09 | Group B System | ระบบย่อย Records/Audit/CAR/Dashboard | อ่านข้อมูลเอกสารและ acknowledgement จาก Group A |

## 5. Use Case Overview
| UC ID | Owner Group | Use Case | Primary Actor | SRS/FR Mapping |
| --- | --- | --- | --- | --- |
| UC-S01 | Shared | Login and Access System | End User / Owner / Approver / ISO Admin / Auditor / CAR Owner / IT/Admin | NFR-SEC-01, NFR-OPS-01 |
| UC-S02 | Shared | Manage Users and Roles | IT/Admin / ISO/QA Admin | NFR-SEC-01, FR-DC-09 |
| UC-A01 | Group A | Create Document Draft | Document Owner / ISO/QA Admin | FR-DC-01, FR-DC-04, FR-DC-09, GA-FR-01, GA-FR-02 |
| UC-A02 | Group A | Create and Submit DAR | Document Owner / ISO/QA Admin | FR-DAR-01, FR-DAR-02, FR-DAR-03, FR-DAR-04, GA-FR-04 |
| UC-A03 | Group A | Review DAR and Document | Approver / ISO/QA Admin | FR-DC-02, FR-DC-05, FR-DC-08, FR-DAR-04, GA-FR-05 |
| UC-A04 | Group A | Publish Current Version | ISO/QA Admin | FR-DC-02, FR-DC-06, FR-DC-07, GA-FR-06 |
| UC-A05 | Group A | Obsolete / Archive Document | ISO/QA Admin | FR-DC-07, FR-AT-01, GA-FR-06 |
| UC-A06 | Group A | Search and View Current Document | End User / Owner / Auditor / ISO/QA Admin | FR-DC-05, FR-SW-01, GA-FR-09 |
| UC-A07 | Group A | Acknowledge Document | End User / Document Owner / Approver / CAR Owner | FR-SW-03, FR-SW-04, FR-SW-05, GA-FR-08 |
| UC-A08 | Group A | Provide Document/Ack Summary to Group B | Group B System / Dashboard Aggregator | FR-DB-01, FR-DB-02, NFR-MNT-01, GA-FR-10 |
| UC-B01 | Group B | Create Record / Evidence | ISO/QA User / Auditor / CAR Owner | FR-RC-01, FR-RC-02, FR-RC-03, GB-FR-01, GB-FR-02 |
| UC-B02 | Group B | Create Audit Session / Audit Header | Auditor / ISO/QA Admin | FR-AU-01, GB-FR-03 |
| UC-B03 | Group B | Record Audit Finding | Auditor / ISO/QA Admin | FR-AU-02, FR-AU-03, FR-AU-04, GB-FR-03 |
| UC-B04 | Group B | Create CAR from Finding | Auditor / ISO/QA Admin | FR-CAR-01, FR-CAR-02, GB-FR-05 |
| UC-B05 | Group B | Update Root Cause and Corrective Action | CAR Owner | FR-CAR-03, FR-CAR-04, GB-FR-06 |
| UC-B06 | Group B | Verify and Close CAR | ISO/QA Admin / Auditor | FR-CAR-06, FR-AT-01, GB-FR-08 |
| UC-B07 | Group B | Monitor Overdue CAR | ISO/QA Admin / CAR Owner / Management Viewer | FR-CAR-05, FR-DB-03, GB-FR-07 |
| UC-B08 | Group B | View Operational Dashboard | ISO/QA Admin / Management Viewer / Auditor / Group B User | FR-DB-01, FR-DB-02, FR-DB-03, FR-DB-04, FR-DB-05, GB-FR-09, GB-FR-10 |
| UC-B09 | Group B | Export Audit/CAR/Dashboard Summary | ISO/QA Admin / Auditor | FR-AU-05, FR-AT-03, GB-FR-09 |
| UC-S03 | Shared | View Audit Trail | ISO/QA Admin / Auditor / IT/Admin | FR-AT-01, FR-AT-02, FR-AT-03, NFR-AUD-01 |

## 6. Scenario Matrix สำหรับทดสอบให้ครบ
| Scenario ID | UC ID | Use Case | Group | Actor | Scenario | Expected Result |
| --- | --- | --- | --- | --- | --- | --- |
| SC-S01-01 | UC-S01 | Login and Access System | Shared | End User / Owner / Approver / ISO Admin / Auditor / CAR Owner / IT/Admin | Login สำเร็จด้วย role Document Owner | Pass when expected postcondition/acceptance criteria are met |
| SC-S01-02 | UC-S01 | Login and Access System | Shared | End User / Owner / Approver / ISO Admin / Auditor / CAR Owner / IT/Admin | Login ผิดรหัสผ่าน | Pass when expected postcondition/acceptance criteria are met |
| SC-S01-03 | UC-S01 | Login and Access System | Shared | End User / Owner / Approver / ISO Admin / Auditor / CAR Owner / IT/Admin | ผู้ใช้ไม่มีสิทธิ์เรียก endpoint ที่ห้าม | Pass when expected postcondition/acceptance criteria are met |
| SC-S02-01 | UC-S02 | Manage Users and Roles | Shared | IT/Admin / ISO/QA Admin | เพิ่มผู้ใช้ใหม่เป็น Approver | Pass when expected postcondition/acceptance criteria are met |
| SC-S02-02 | UC-S02 | Manage Users and Roles | Shared | IT/Admin / ISO/QA Admin | เปลี่ยน role จาก End User เป็น Document Owner | Pass when expected postcondition/acceptance criteria are met |
| SC-A01-01 | UC-A01 | Create Document Draft | Group A | Document Owner / ISO/QA Admin | สร้างเอกสาร QP ใหม่พร้อมไฟล์ PDF | Pass when expected postcondition/acceptance criteria are met |
| SC-A01-02 | UC-A01 | Create Document Draft | Group A | Document Owner / ISO/QA Admin | สร้างเอกสารโดยไม่กรอก owner | Pass when expected postcondition/acceptance criteria are met |
| SC-A01-03 | UC-A01 | Create Document Draft | Group A | Document Owner / ISO/QA Admin | ใช้ document code ซ้ำ | Pass when expected postcondition/acceptance criteria are met |
| SC-A02-01 | UC-A02 | Create and Submit DAR | Group A | Document Owner / ISO/QA Admin | ส่ง DAR เพื่อสร้างเอกสารใหม่ | Pass when expected postcondition/acceptance criteria are met |
| SC-A02-02 | UC-A02 | Create and Submit DAR | Group A | Document Owner / ISO/QA Admin | ส่ง DAR เพื่อ revise เอกสาร Published | Pass when expected postcondition/acceptance criteria are met |
| SC-A02-03 | UC-A02 | Create and Submit DAR | Group A | Document Owner / ISO/QA Admin | ส่ง DAR โดยไม่เลือก approver | Pass when expected postcondition/acceptance criteria are met |
| SC-A03-01 | UC-A03 | Review DAR and Document | Group A | Approver / ISO/QA Admin | Approve DAR สำเร็จ | Pass when expected postcondition/acceptance criteria are met |
| SC-A03-02 | UC-A03 | Review DAR and Document | Group A | Approver / ISO/QA Admin | Reject DAR พร้อม comment | Pass when expected postcondition/acceptance criteria are met |
| SC-A03-03 | UC-A03 | Review DAR and Document | Group A | Approver / ISO/QA Admin | ผู้ไม่มีสิทธิ์พยายาม approve | Pass when expected postcondition/acceptance criteria are met |
| SC-A04-01 | UC-A04 | Publish Current Version | Group A | ISO/QA Admin | Publish เอกสารใหม่ครั้งแรก | Pass when expected postcondition/acceptance criteria are met |
| SC-A04-02 | UC-A04 | Publish Current Version | Group A | ISO/QA Admin | Publish revision ใหม่และปิด current version เดิม | Pass when expected postcondition/acceptance criteria are met |
| SC-A04-03 | UC-A04 | Publish Current Version | Group A | ISO/QA Admin | Publish โดยไม่มีไฟล์แนบ | Pass when expected postcondition/acceptance criteria are met |
| SC-A05-01 | UC-A05 | Obsolete / Archive Document | Group A | ISO/QA Admin | Obsolete เอกสารที่ถูกแทนที่ | Pass when expected postcondition/acceptance criteria are met |
| SC-A05-02 | UC-A05 | Obsolete / Archive Document | Group A | ISO/QA Admin | End User ค้นหาเอกสาร obsolete แล้วไม่เห็นใน current list | Pass when expected postcondition/acceptance criteria are met |
| SC-A06-01 | UC-A06 | Search and View Current Document | Group A | End User / Owner / Auditor / ISO/QA Admin | ค้นหาด้วยรหัส QP-2301-0107 | Pass when expected postcondition/acceptance criteria are met |
| SC-A06-02 | UC-A06 | Search and View Current Document | Group A | End User / Owner / Auditor / ISO/QA Admin | ค้นหาด้วยคำว่า DAR | Pass when expected postcondition/acceptance criteria are met |
| SC-A06-03 | UC-A06 | Search and View Current Document | Group A | End User / Owner / Auditor / ISO/QA Admin | ผู้ใช้ทั่วไปพยายามเปิด draft | Pass when expected postcondition/acceptance criteria are met |
| SC-A07-01 | UC-A07 | Acknowledge Document | Group A | End User / Document Owner / Approver / CAR Owner | End User รับทราบเอกสาร Published | Pass when expected postcondition/acceptance criteria are met |
| SC-A07-02 | UC-A07 | Acknowledge Document | Group A | End User / Document Owner / Approver / CAR Owner | เอกสาร revise ใหม่แล้วต้องรับทราบใหม่ | Pass when expected postcondition/acceptance criteria are met |
| SC-A07-03 | UC-A07 | Acknowledge Document | Group A | End User / Document Owner / Approver / CAR Owner | ดูรายชื่อผู้ยังไม่รับทราบ | Pass when expected postcondition/acceptance criteria are met |
| SC-A08-01 | UC-A08 | Provide Document/Ack Summary to Group B | Group A | Group B System / Dashboard Aggregator | Group B ดึงจำนวน Published/Pending/Obsolete | Pass when expected postcondition/acceptance criteria are met |
| SC-A08-02 | UC-A08 | Provide Document/Ack Summary to Group B | Group A | Group B System / Dashboard Aggregator | Group B ดึง acknowledgement rate | Pass when expected postcondition/acceptance criteria are met |
| SC-B01-01 | UC-B01 | Create Record / Evidence | Group B | ISO/QA User / Auditor / CAR Owner | สร้าง record ผูกกับ QP-2301-0107 | Pass when expected postcondition/acceptance criteria are met |
| SC-B01-02 | UC-B01 | Create Record / Evidence | Group B | ISO/QA User / Auditor / CAR Owner | แนบ evidence ให้ CAR | Pass when expected postcondition/acceptance criteria are met |
| SC-B01-03 | UC-B01 | Create Record / Evidence | Group B | ISO/QA User / Auditor / CAR Owner | ค้นหา record ตาม document | Pass when expected postcondition/acceptance criteria are met |
| SC-B02-01 | UC-B02 | Create Audit Session / Audit Header | Group B | Auditor / ISO/QA Admin | สร้าง audit รอบ QMS internal audit | Pass when expected postcondition/acceptance criteria are met |
| SC-B02-02 | UC-B02 | Create Audit Session / Audit Header | Group B | Auditor / ISO/QA Admin | สร้าง audit โดยไม่ระบุ auditor | Pass when expected postcondition/acceptance criteria are met |
| SC-B03-01 | UC-B03 | Record Audit Finding | Group B | Auditor / ISO/QA Admin | บันทึก finding พร้อม evidence | Pass when expected postcondition/acceptance criteria are met |
| SC-B03-02 | UC-B03 | Record Audit Finding | Group B | Auditor / ISO/QA Admin | บันทึก finding ที่อ้างเอกสาร obsolete | Pass when expected postcondition/acceptance criteria are met |
| SC-B03-03 | UC-B03 | Record Audit Finding | Group B | Auditor / ISO/QA Admin | เปิด CAR จาก finding | Pass when expected postcondition/acceptance criteria are met |
| SC-B04-01 | UC-B04 | Create CAR from Finding | Group B | Auditor / ISO/QA Admin | เปิด CAR จาก finding NC | Pass when expected postcondition/acceptance criteria are met |
| SC-B04-02 | UC-B04 | Create CAR from Finding | Group B | Auditor / ISO/QA Admin | เปิด CAR โดยไม่ใส่ due date | Pass when expected postcondition/acceptance criteria are met |
| SC-B04-03 | UC-B04 | Create CAR from Finding | Group B | Auditor / ISO/QA Admin | CAR ใหม่แสดงใน dashboard | Pass when expected postcondition/acceptance criteria are met |
| SC-B05-01 | UC-B05 | Update Root Cause and Corrective Action | Group B | CAR Owner | CAR Owner กรอก RCA/action และแนบ evidence | Pass when expected postcondition/acceptance criteria are met |
| SC-B05-02 | UC-B05 | Update Root Cause and Corrective Action | Group B | CAR Owner | CAR Owner ส่ง verify โดยไม่มี action | Pass when expected postcondition/acceptance criteria are met |
| SC-B06-01 | UC-B06 | Verify and Close CAR | Group B | ISO/QA Admin / Auditor | Verify และ close CAR | Pass when expected postcondition/acceptance criteria are met |
| SC-B06-02 | UC-B06 | Verify and Close CAR | Group B | ISO/QA Admin / Auditor | Return CAR ให้ owner แก้ไข | Pass when expected postcondition/acceptance criteria are met |
| SC-B06-03 | UC-B06 | Verify and Close CAR | Group B | ISO/QA Admin / Auditor | dashboard อัปเดตหลัง close | Pass when expected postcondition/acceptance criteria are met |
| SC-B07-01 | UC-B07 | Monitor Overdue CAR | Group B | ISO/QA Admin / CAR Owner / Management Viewer | CAR เกินกำหนดแสดงเป็น overdue | Pass when expected postcondition/acceptance criteria are met |
| SC-B07-02 | UC-B07 | Monitor Overdue CAR | Group B | ISO/QA Admin / CAR Owner / Management Viewer | CAR closed แล้วไม่แสดง overdue | Pass when expected postcondition/acceptance criteria are met |
| SC-B08-01 | UC-B08 | View Operational Dashboard | Group B | ISO/QA Admin / Management Viewer / Auditor / Group B User | Dashboard แสดง document status จาก Group A | Pass when expected postcondition/acceptance criteria are met |
| SC-B08-02 | UC-B08 | View Operational Dashboard | Group B | ISO/QA Admin / Management Viewer / Auditor / Group B User | Dashboard แสดง Open/Overdue/Closed CAR | Pass when expected postcondition/acceptance criteria are met |
| SC-B08-03 | UC-B08 | View Operational Dashboard | Group B | ISO/QA Admin / Management Viewer / Auditor / Group B User | Group A API unavailable | Pass when expected postcondition/acceptance criteria are met |
| SC-B09-01 | UC-B09 | Export Audit/CAR/Dashboard Summary | Group B | ISO/QA Admin / Auditor | Export CAR summary | Pass when expected postcondition/acceptance criteria are met |
| SC-B09-02 | UC-B09 | Export Audit/CAR/Dashboard Summary | Group B | ISO/QA Admin / Auditor | Export finding list | Pass when expected postcondition/acceptance criteria are met |
| SC-S03-01 | UC-S03 | View Audit Trail | Shared | ISO/QA Admin / Auditor / IT/Admin | ดู log การ publish เอกสาร | Pass when expected postcondition/acceptance criteria are met |
| SC-S03-02 | UC-S03 | View Audit Trail | Shared | ISO/QA Admin / Auditor / IT/Admin | ดู log การ close CAR | Pass when expected postcondition/acceptance criteria are met |
| SC-S03-03 | UC-S03 | View Audit Trail | Shared | ISO/QA Admin / Auditor / IT/Admin | End User พยายามดู audit trail | Pass when expected postcondition/acceptance criteria are met |

## 7. Detailed Use Case Specification
### UC-S01 - Login and Access System
| หัวข้อ | รายละเอียด |
| --- | --- |
| Owner Group | Shared |
| Primary Actor | End User / Owner / Approver / ISO Admin / Auditor / CAR Owner / IT/Admin |
| SRS/FR Mapping | NFR-SEC-01, NFR-OPS-01 |
| เอกสารอ้างอิง/ที่มาของ requirement | ระบบผู้ใช้/บทบาทของโครงการ |
| Trigger | ผู้ใช้ต้องการเข้าใช้งานระบบ E-Filing |
| Preconditions | ผู้ใช้มีบัญชีและถูกกำหนด role แล้ว |
| Postconditions | เข้าสู่ระบบและเห็นเมนูตามสิทธิ์ |

**Main Success Scenario**
1. ผู้ใช้เปิดหน้า Login
2. กรอก username/password
3. ระบบตรวจสอบข้อมูลผู้ใช้
4. ระบบสร้าง session/token
5. ระบบแสดงเมนูตาม role

**Alternative / Exception Flows**
- ข้อมูลเข้าสู่ระบบผิด: แจ้งเตือนและไม่อนุญาตเข้าใช้งาน
- บัญชีถูกปิด: แจ้งให้ติดต่อผู้ดูแลระบบ

**Acceptance Criteria**
- ผู้ใช้แต่ละ role เห็นเมนูต่างกันตาม role matrix
- endpoint สำคัญต้องตรวจสิทธิ์ก่อนตอบกลับ

**Test Scenarios**
| Scenario ID | Description |
| --- | --- |
| SC-S01-01 | Login สำเร็จด้วย role Document Owner |
| SC-S01-02 | Login ผิดรหัสผ่าน |
| SC-S01-03 | ผู้ใช้ไม่มีสิทธิ์เรียก endpoint ที่ห้าม |

### UC-S02 - Manage Users and Roles
| หัวข้อ | รายละเอียด |
| --- | --- |
| Owner Group | Shared |
| Primary Actor | IT/Admin / ISO/QA Admin |
| SRS/FR Mapping | NFR-SEC-01, FR-DC-09 |
| เอกสารอ้างอิง/ที่มาของ requirement | Role Matrix / Shared Contract |
| Trigger | ต้องเพิ่มผู้ใช้หรือกำหนด role ให้ตรงกับงานจริง |
| Preconditions | ผู้ดูแลระบบเข้าสู่ระบบแล้ว |
| Postconditions | ผู้ใช้มี role พร้อมใช้งานใน workflow |

**Main Success Scenario**
1. เปิดเมนูผู้ใช้
2. เพิ่ม/แก้ไขข้อมูลผู้ใช้
3. กำหนด role และ department
4. บันทึก
5. ระบบบันทึก audit trail

**Alternative / Exception Flows**
- ข้อมูลซ้ำ: ระบบแจ้งเตือน
- role ไม่ถูกต้อง: ระบบไม่ให้บันทึก

**Acceptance Criteria**
- ผู้ใช้ถูกผูก role ได้อย่างน้อย 1 role
- การเปลี่ยน role ถูกบันทึกใน audit trail

**Test Scenarios**
| Scenario ID | Description |
| --- | --- |
| SC-S02-01 | เพิ่มผู้ใช้ใหม่เป็น Approver |
| SC-S02-02 | เปลี่ยน role จาก End User เป็น Document Owner |

### UC-A01 - Create Document Draft
| หัวข้อ | รายละเอียด |
| --- | --- |
| Owner Group | Group A |
| Primary Actor | Document Owner / ISO/QA Admin |
| SRS/FR Mapping | FR-DC-01, FR-DC-04, FR-DC-09, GA-FR-01, GA-FR-02 |
| เอกสารอ้างอิง/ที่มาของ requirement | QP-2301-0107, FM-QP-2301-0107-02 Master List |
| Trigger | ต้องสร้างเอกสารคุณภาพใหม่หรือเพิ่มข้อมูลเอกสารเข้าระบบ |
| Preconditions | ผู้ใช้มีสิทธิ์ Document Owner หรือ ISO Admin |
| Postconditions | เอกสารถูกบันทึกในสถานะ Draft พร้อม metadata และไฟล์แนบ |

**Main Success Scenario**
1. เปิดเมนู Document
2. กด Create Document
3. กรอก document code, title, type, owner, approver, process
4. อัปโหลดไฟล์เอกสาร
5. บันทึก Draft
6. ระบบสร้าง revision เริ่มต้นและ audit trail

**Alternative / Exception Flows**
- metadata ไม่ครบ: ระบบแจ้งช่องที่ต้องกรอก
- document code ซ้ำ: ระบบไม่ให้บันทึก
- ไฟล์ไม่ถูกชนิด/ขนาดเกิน: ระบบแจ้งเตือน

**Acceptance Criteria**
- เอกสาร Draft ต้องมี document_code, title, document_type, owner_id, status
- ระบบต้องเก็บ file reference ได้
- Draft ยังไม่แสดงเป็น current version ให้ End User ใช้งาน

**Test Scenarios**
| Scenario ID | Description |
| --- | --- |
| SC-A01-01 | สร้างเอกสาร QP ใหม่พร้อมไฟล์ PDF |
| SC-A01-02 | สร้างเอกสารโดยไม่กรอก owner |
| SC-A01-03 | ใช้ document code ซ้ำ |

### UC-A02 - Create and Submit DAR
| หัวข้อ | รายละเอียด |
| --- | --- |
| Owner Group | Group A |
| Primary Actor | Document Owner / ISO/QA Admin |
| SRS/FR Mapping | FR-DAR-01, FR-DAR-02, FR-DAR-03, FR-DAR-04, GA-FR-04 |
| เอกสารอ้างอิง/ที่มาของ requirement | FM-QP-2301-0107-01 DAR, QP-2301-0107 |
| Trigger | ต้องสร้าง/แก้ไข/ยกเลิกเอกสารผ่านคำขอดำเนินการเอกสาร |
| Preconditions | มีเอกสาร Draft หรือเอกสารที่ต้องการเปลี่ยนแปลงในระบบ |
| Postconditions | DAR สถานะ Submitted และเข้าสู่คิวผู้ทบทวน/ผู้อนุมัติ |

**Main Success Scenario**
1. เปิดเอกสารที่ต้องการดำเนินการ
2. เลือก Create DAR
3. เลือกรูปแบบคำขอ: create/revise/obsolete
4. ระบุเหตุผลและรายละเอียดการเปลี่ยนแปลง
5. เลือก reviewer/approver
6. Submit DAR
7. ระบบส่งเข้าคิว review และบันทึก audit trail

**Alternative / Exception Flows**
- ไม่มีไฟล์เอกสารแนบ: ระบบเตือนก่อนส่ง
- ไม่เลือก approver: ระบบไม่ให้ submit
- ผู้ใช้ยกเลิก DAR ก่อน submit: สถานะเป็น Draft/Cancelled

**Acceptance Criteria**
- DAR ต้องมี requester, document_id, action_type, reason, status
- ผู้ทบทวน/ผู้อนุมัติเห็นรายการใน Approval Queue
- การ submit ต้องเปลี่ยนสถานะเอกสารเป็น Review หรือ Pending Review ตาม policy

**Test Scenarios**
| Scenario ID | Description |
| --- | --- |
| SC-A02-01 | ส่ง DAR เพื่อสร้างเอกสารใหม่ |
| SC-A02-02 | ส่ง DAR เพื่อ revise เอกสาร Published |
| SC-A02-03 | ส่ง DAR โดยไม่เลือก approver |

### UC-A03 - Review DAR and Document
| หัวข้อ | รายละเอียด |
| --- | --- |
| Owner Group | Group A |
| Primary Actor | Approver / ISO/QA Admin |
| SRS/FR Mapping | FR-DC-02, FR-DC-05, FR-DC-08, FR-DAR-04, GA-FR-05 |
| เอกสารอ้างอิง/ที่มาของ requirement | QP-2301-0107, FM-QP-2301-0107-01 DAR |
| Trigger | มี DAR ที่รอทบทวน/อนุมัติ |
| Preconditions | DAR อยู่ในสถานะ Submitted/Review และ approver มีสิทธิ์ |
| Postconditions | DAR ถูก approve หรือ reject พร้อม comment |

**Main Success Scenario**
1. Approver เปิด Approval Queue
2. เปิดรายละเอียด DAR และเอกสารแนบ
3. ตรวจ metadata/file/reason
4. เลือก Approve หรือ Reject
5. ระบุ comment
6. ระบบบันทึกผลและ audit trail

**Alternative / Exception Flows**
- Reject: ระบบส่งกลับ Document Owner เพื่อแก้ไข
- Approve: เอกสารเข้าสู่สถานะ Approved
- Approver ไม่ใช่คนที่กำหนด: ระบบไม่ให้ดำเนินการ

**Acceptance Criteria**
- Approve/Reject ต้องมีผู้ดำเนินการและเวลา
- Reject ต้องเก็บเหตุผล
- สถานะของ DAR และ Document ต้องสอดคล้องกัน

**Test Scenarios**
| Scenario ID | Description |
| --- | --- |
| SC-A03-01 | Approve DAR สำเร็จ |
| SC-A03-02 | Reject DAR พร้อม comment |
| SC-A03-03 | ผู้ไม่มีสิทธิ์พยายาม approve |

### UC-A04 - Publish Current Version
| หัวข้อ | รายละเอียด |
| --- | --- |
| Owner Group | Group A |
| Primary Actor | ISO/QA Admin |
| SRS/FR Mapping | FR-DC-02, FR-DC-06, FR-DC-07, GA-FR-06 |
| เอกสารอ้างอิง/ที่มาของ requirement | QP-2301-0107, Master List |
| Trigger | เอกสารได้รับอนุมัติและพร้อมประกาศใช้ |
| Preconditions | เอกสารอยู่ในสถานะ Approved |
| Postconditions | เอกสารเป็น Published current version และผู้ใช้เข้าถึงได้ |

**Main Success Scenario**
1. ISO Admin เปิดเอกสาร Approved
2. ตรวจสอบ metadata และไฟล์
3. กำหนด effective date
4. กด Publish
5. ระบบตั้งเอกสารฉบับนี้เป็น current version
6. ระบบทำให้เวอร์ชันก่อนหน้าไม่เป็น current
7. ระบบบันทึก audit trail

**Alternative / Exception Flows**
- มี Published version เดิม: ระบบต้องปิด current flag เดิม
- effective date ไม่ถูกต้อง: ระบบแจ้งเตือน
- ไฟล์หาย: ระบบไม่ให้ publish

**Acceptance Criteria**
- ต่อหนึ่ง document_code ต้องมี current Published เพียงหนึ่งฉบับ
- End User เห็นเฉพาะ Published current version
- ประวัติ version ต้องยังเรียกดูได้โดย role ที่มีสิทธิ์

**Test Scenarios**
| Scenario ID | Description |
| --- | --- |
| SC-A04-01 | Publish เอกสารใหม่ครั้งแรก |
| SC-A04-02 | Publish revision ใหม่และปิด current version เดิม |
| SC-A04-03 | Publish โดยไม่มีไฟล์แนบ |

### UC-A05 - Obsolete / Archive Document
| หัวข้อ | รายละเอียด |
| --- | --- |
| Owner Group | Group A |
| Primary Actor | ISO/QA Admin |
| SRS/FR Mapping | FR-DC-07, FR-AT-01, GA-FR-06 |
| เอกสารอ้างอิง/ที่มาของ requirement | QP-2301-0107, FM-QP-2301-0107-04 Document Destruction Log |
| Trigger | เอกสารไม่ใช้งานแล้วหรือถูกแทนที่ |
| Preconditions | เอกสารเป็น Published หรือ Approved และมีสิทธิ์ obsolete |
| Postconditions | เอกสารเปลี่ยนเป็น Obsolete/Archived และไม่แสดงเป็นเอกสารใช้งานทั่วไป |

**Main Success Scenario**
1. ISO Admin เปิดเอกสาร
2. เลือก Obsolete/Archive
3. ระบุเหตุผล
4. ยืนยัน
5. ระบบเปลี่ยนสถานะและบันทึก audit trail

**Alternative / Exception Flows**
- เอกสารมี CAR/finding ค้าง: ระบบแจ้งเตือนก่อนยืนยัน
- ผู้ไม่มีสิทธิ์: ระบบปฏิเสธ

**Acceptance Criteria**
- Obsolete document ต้องไม่ปรากฏในรายการ current document สำหรับ End User
- เหตุผลการ obsolete ต้องตรวจสอบย้อนหลังได้

**Test Scenarios**
| Scenario ID | Description |
| --- | --- |
| SC-A05-01 | Obsolete เอกสารที่ถูกแทนที่ |
| SC-A05-02 | End User ค้นหาเอกสาร obsolete แล้วไม่เห็นใน current list |

### UC-A06 - Search and View Current Document
| หัวข้อ | รายละเอียด |
| --- | --- |
| Owner Group | Group A |
| Primary Actor | End User / Owner / Auditor / ISO/QA Admin |
| SRS/FR Mapping | FR-DC-05, FR-SW-01, GA-FR-09 |
| เอกสารอ้างอิง/ที่มาของ requirement | Master List, QP/SD/FM document sets |
| Trigger | ผู้ใช้ต้องการค้นหาเอกสารที่ใช้งานจริง |
| Preconditions | มีเอกสาร Published ในระบบ |
| Postconditions | ผู้ใช้เปิดดูเอกสารตามสิทธิ์ |

**Main Success Scenario**
1. ผู้ใช้เปิด Document List
2. กรอก keyword หรือเลือก filter
3. ระบบแสดงรายการตามสิทธิ์
4. ผู้ใช้เปิด Document Detail
5. ระบบแสดง metadata และไฟล์ current version

**Alternative / Exception Flows**
- ไม่พบผลลัพธ์: ระบบแสดงข้อความไม่พบข้อมูล
- ผู้ใช้ไม่มีสิทธิ์ดูเอกสารบางประเภท: ระบบไม่แสดงหรือปฏิเสธ

**Acceptance Criteria**
- ค้นหาด้วย document code/title/type/status ได้
- End User เห็นเฉพาะ current Published
- Auditor/ISO Admin สามารถเห็น revision history ตามสิทธิ์

**Test Scenarios**
| Scenario ID | Description |
| --- | --- |
| SC-A06-01 | ค้นหาด้วยรหัส QP-2301-0107 |
| SC-A06-02 | ค้นหาด้วยคำว่า DAR |
| SC-A06-03 | ผู้ใช้ทั่วไปพยายามเปิด draft |

### UC-A07 - Acknowledge Document
| หัวข้อ | รายละเอียด |
| --- | --- |
| Owner Group | Group A |
| Primary Actor | End User / Document Owner / Approver / CAR Owner |
| SRS/FR Mapping | FR-SW-03, FR-SW-04, FR-SW-05, GA-FR-08 |
| เอกสารอ้างอิง/ที่มาของ requirement | Distribution List, QP-2301-0107 |
| Trigger | เอกสารถูก publish และกำหนดกลุ่มผู้ต้องรับทราบ |
| Preconditions | เอกสาร Published และผู้ใช้ถูก assign ให้รับทราบ |
| Postconditions | มี acknowledgement record พร้อม user/time/version |

**Main Success Scenario**
1. ผู้ใช้เปิดเอกสาร Published
2. อ่านรายละเอียดหรือ preview
3. กดรับทราบ
4. ระบบบันทึกชื่อผู้ใช้ เวลา และ document version
5. ระบบอัปเดต acknowledgement summary

**Alternative / Exception Flows**
- ผู้ใช้กดรับทราบซ้ำ: ระบบแจ้งว่ารับทราบแล้วหรืออัปเดตตาม policy
- เอกสารถูก revise ใหม่: ระบบต้องนับ acknowledgement สำหรับเวอร์ชันใหม่แยกจากเดิม

**Acceptance Criteria**
- acknowledgement ต้องผูก document_version
- ระบบต้องสรุปได้ว่าใครบ้างรับทราบ/ยังไม่รับทราบ
- summary ต้องพร้อมให้ Group B ใช้ใน dashboard

**Test Scenarios**
| Scenario ID | Description |
| --- | --- |
| SC-A07-01 | End User รับทราบเอกสาร Published |
| SC-A07-02 | เอกสาร revise ใหม่แล้วต้องรับทราบใหม่ |
| SC-A07-03 | ดูรายชื่อผู้ยังไม่รับทราบ |

### UC-A08 - Provide Document/Ack Summary to Group B
| หัวข้อ | รายละเอียด |
| --- | --- |
| Owner Group | Group A |
| Primary Actor | Group B System / Dashboard Aggregator |
| SRS/FR Mapping | FR-DB-01, FR-DB-02, NFR-MNT-01, GA-FR-10 |
| เอกสารอ้างอิง/ที่มาของ requirement | Shared Contract |
| Trigger | Group B ต้องการข้อมูลสำหรับ dashboard หรือ audit reference |
| Preconditions | มีเอกสารและ acknowledgement data |
| Postconditions | Group B ได้ข้อมูล document status และ acknowledgement summary ตาม contract |

**Main Success Scenario**
1. Group B เรียก API ตาม contract
2. Group A ตรวจสิทธิ์ service/user
3. Group A ส่ง document status summary
4. Group A ส่ง acknowledgement summary
5. Group B นำไป aggregate dashboard

**Alternative / Exception Flows**
- contract ไม่ตรง: ระบบส่ง error schema/version
- ไม่มีข้อมูล: ส่งค่า 0 และรายการว่างตามรูปแบบที่กำหนด

**Acceptance Criteria**
- API ต้องส่ง document_id/document_code/status/current_version
- ack summary ต้องมี target_count, acknowledged_count, pending_count
- Group B ใช้ข้อมูลจริง ไม่ hardcode/mock

**Test Scenarios**
| Scenario ID | Description |
| --- | --- |
| SC-A08-01 | Group B ดึงจำนวน Published/Pending/Obsolete |
| SC-A08-02 | Group B ดึง acknowledgement rate |

### UC-B01 - Create Record / Evidence
| หัวข้อ | รายละเอียด |
| --- | --- |
| Owner Group | Group B |
| Primary Actor | ISO/QA User / Auditor / CAR Owner |
| SRS/FR Mapping | FR-RC-01, FR-RC-02, FR-RC-03, GB-FR-01, GB-FR-02 |
| เอกสารอ้างอิง/ที่มาของ requirement | Records, Audit Evidence, QP-2301-0102 |
| Trigger | ต้องเก็บหลักฐานประกอบเอกสาร/audit/CAR |
| Preconditions | ผู้ใช้มีสิทธิ์สร้าง record และมี document reference ถ้ามี |
| Postconditions | record/evidence ถูกสร้างและผูก document_id หรือ finding/CAR ได้ |

**Main Success Scenario**
1. เปิดเมนู Records
2. กด Create Record
3. กรอก record type, title, date, owner
4. เลือก document reference
5. แนบไฟล์ evidence
6. บันทึก
7. ระบบสร้าง audit trail

**Alternative / Exception Flows**
- ไม่พบ document_id จาก Group A: ระบบให้บันทึกแบบ temporary reference หรือแจ้งเตือน
- ไฟล์ผิดชนิด: ระบบไม่ให้แนบ

**Acceptance Criteria**
- record ต้องค้นหาได้ตาม type/date/document
- record ต้องผูกกับ document/finding/CAR ได้
- evidence file ต้องดาวน์โหลดได้ตามสิทธิ์

**Test Scenarios**
| Scenario ID | Description |
| --- | --- |
| SC-B01-01 | สร้าง record ผูกกับ QP-2301-0107 |
| SC-B01-02 | แนบ evidence ให้ CAR |
| SC-B01-03 | ค้นหา record ตาม document |

### UC-B02 - Create Audit Session / Audit Header
| หัวข้อ | รายละเอียด |
| --- | --- |
| Owner Group | Group B |
| Primary Actor | Auditor / ISO/QA Admin |
| SRS/FR Mapping | FR-AU-01, GB-FR-03 |
| เอกสารอ้างอิง/ที่มาของ requirement | QP-2301-0102, Audit Plan/Checklist |
| Trigger | ต้องเปิดรอบการตรวจติดตามภายใน |
| Preconditions | Auditor/ISO Admin มีสิทธิ์ |
| Postconditions | audit session/header ถูกสร้างพร้อมขอบเขตการตรวจ |

**Main Success Scenario**
1. เปิดเมนู Audit
2. กด Create Audit
3. กรอก audit title, date, scope, auditor
4. เลือก process/document ที่เกี่ยวข้อง
5. บันทึก

**Alternative / Exception Flows**
- ไม่ระบุ scope: ระบบแจ้งเตือน
- audit date ไม่ถูกต้อง: ระบบไม่ให้บันทึก

**Acceptance Criteria**
- audit session ต้องใช้เป็น parent ของ finding ได้
- ต้องแสดงรายการ audit ตามวัน/สถานะได้

**Test Scenarios**
| Scenario ID | Description |
| --- | --- |
| SC-B02-01 | สร้าง audit รอบ QMS internal audit |
| SC-B02-02 | สร้าง audit โดยไม่ระบุ auditor |

### UC-B03 - Record Audit Finding
| หัวข้อ | รายละเอียด |
| --- | --- |
| Owner Group | Group B |
| Primary Actor | Auditor / ISO/QA Admin |
| SRS/FR Mapping | FR-AU-02, FR-AU-03, FR-AU-04, GB-FR-03 |
| เอกสารอ้างอิง/ที่มาของ requirement | FM-QP-2301-0102-02 Audit Checklist, FM-QP-2301-0102-04 NC Form |
| Trigger | พบ observation, nonconformity หรือ opportunity for improvement |
| Preconditions | มี audit session หรือสิทธิ์สร้าง finding |
| Postconditions | finding ถูกบันทึกและสามารถเปิด CAR ต่อได้ |

**Main Success Scenario**
1. เปิด audit session
2. เลือก Create Finding
3. ระบุ finding type, description, clause/process/document
4. แนบ evidence หรือเลือก record
5. บันทึก
6. ระบบตั้ง status Open

**Alternative / Exception Flows**
- finding เป็น minor/OFI: อาจยังไม่เปิด CAR
- finding เป็น NC: ระบบเสนอให้เปิด CAR
- evidence ไม่ครบ: บันทึกเป็น draft หรือแจ้งเตือน

**Acceptance Criteria**
- finding ต้องอ้างอิง document หรือ process ได้
- finding ต้องผูก evidence/record ได้
- finding status ต้องติดตามได้

**Test Scenarios**
| Scenario ID | Description |
| --- | --- |
| SC-B03-01 | บันทึก finding พร้อม evidence |
| SC-B03-02 | บันทึก finding ที่อ้างเอกสาร obsolete |
| SC-B03-03 | เปิด CAR จาก finding |

### UC-B04 - Create CAR from Finding
| หัวข้อ | รายละเอียด |
| --- | --- |
| Owner Group | Group B |
| Primary Actor | Auditor / ISO/QA Admin |
| SRS/FR Mapping | FR-CAR-01, FR-CAR-02, GB-FR-05 |
| เอกสารอ้างอิง/ที่มาของ requirement | QP-2301-0109, FM-QP-2301-0109-01 CAR |
| Trigger | finding ต้องได้รับ corrective action |
| Preconditions | มี finding status Open หรือ Need CAR |
| Postconditions | CAR สถานะ Open พร้อม owner/due date |

**Main Success Scenario**
1. เปิด finding
2. เลือก Create CAR
3. ระบุ owner, due date, severity/priority
4. ระบุ problem statement เบื้องต้น
5. บันทึก
6. ระบบแจ้งสถานะ Open

**Alternative / Exception Flows**
- ไม่กำหนด owner/due date: ระบบไม่ให้สร้าง
- finding ถูกปิดแล้ว: ระบบไม่ให้เปิด CAR ใหม่เว้นแต่มีสิทธิ์

**Acceptance Criteria**
- CAR ต้องผูก finding_id
- CAR ต้องมี owner, due_date, status
- CAR ต้องปรากฏใน dashboard และ overdue monitor

**Test Scenarios**
| Scenario ID | Description |
| --- | --- |
| SC-B04-01 | เปิด CAR จาก finding NC |
| SC-B04-02 | เปิด CAR โดยไม่ใส่ due date |
| SC-B04-03 | CAR ใหม่แสดงใน dashboard |

### UC-B05 - Update Root Cause and Corrective Action
| หัวข้อ | รายละเอียด |
| --- | --- |
| Owner Group | Group B |
| Primary Actor | CAR Owner |
| SRS/FR Mapping | FR-CAR-03, FR-CAR-04, GB-FR-06 |
| เอกสารอ้างอิง/ที่มาของ requirement | QP-2301-0109, CAR Form |
| Trigger | CAR Owner ต้องตอบ CAR |
| Preconditions | CAR อยู่ในสถานะ Open/In Progress และ user เป็น owner หรือมีสิทธิ์ |
| Postconditions | CAR มี root cause, corrective action และ evidence |

**Main Success Scenario**
1. CAR Owner เปิดรายการ CAR ของตนเอง
2. กรอก root cause
3. กรอก corrective action
4. แนบ evidence/record
5. อัปเดต status เป็น Pending Verify
6. ระบบบันทึก audit trail

**Alternative / Exception Flows**
- ไม่มี evidence: ระบบแจ้งเตือนหรือบันทึกเป็น In Progress
- ผู้ใช้ไม่ใช่ owner: ระบบไม่อนุญาตแก้ไข

**Acceptance Criteria**
- root cause และ corrective action ต้องไม่ว่างก่อนส่ง verify
- evidence ต้องผูก record หรือ file ได้
- status ต้องเปลี่ยนตาม workflow

**Test Scenarios**
| Scenario ID | Description |
| --- | --- |
| SC-B05-01 | CAR Owner กรอก RCA/action และแนบ evidence |
| SC-B05-02 | CAR Owner ส่ง verify โดยไม่มี action |

### UC-B06 - Verify and Close CAR
| หัวข้อ | รายละเอียด |
| --- | --- |
| Owner Group | Group B |
| Primary Actor | ISO/QA Admin / Auditor |
| SRS/FR Mapping | FR-CAR-06, FR-AT-01, GB-FR-08 |
| เอกสารอ้างอิง/ที่มาของ requirement | QP-2301-0109, FM-QP-2301-0109-02 |
| Trigger | CAR ถูกส่งเพื่อ verify |
| Preconditions | CAR status Pending Verify |
| Postconditions | CAR ถูกปิด (Closed) หรือย้อนสถานะกลับเป็น In Progress |

**Main Success Scenario**
1. Auditor/ISO Admin เปิด CAR
2. ตรวจ root cause/action/evidence
3. บันทึกผล verify: ผ่าน (Close) หรือไม่ผ่าน (ย้อนกลับเป็น In Progress)
4. ระบุ verification note
5. ระบบปรับ status และบันทึก audit trail

**Alternative / Exception Flows**
- evidence ไม่พอ: ย้อนสถานะกลับเป็น In Progress พร้อม comment (ไม่มีสถานะ Reopened แยก)
- action ไม่แก้ root cause: ย้อนสถานะกลับเป็น In Progress พร้อม comment
- ผ่าน: Close และบันทึก closed_date

**Acceptance Criteria**
- Close ต้องมี verification note
- Return ต้องมีเหตุผล
- dashboard ต้องปรับจำนวน open/closed/overdue

**Test Scenarios**
| Scenario ID | Description |
| --- | --- |
| SC-B06-01 | Verify และ close CAR |
| SC-B06-02 | Return CAR ให้ owner แก้ไข |
| SC-B06-03 | dashboard อัปเดตหลัง close |

### UC-B07 - Monitor Overdue CAR
| หัวข้อ | รายละเอียด |
| --- | --- |
| Owner Group | Group B |
| Primary Actor | ISO/QA Admin / CAR Owner / Management Viewer |
| SRS/FR Mapping | FR-CAR-05, FR-DB-03, GB-FR-07 |
| เอกสารอ้างอิง/ที่มาของ requirement | CAR Tracking |
| Trigger | ต้องติดตามรายการเกินกำหนดหรือใกล้ครบกำหนด |
| Preconditions | มี CAR พร้อม due_date |
| Postconditions | ผู้ใช้เห็นรายการ overdue และจัดลำดับติดตามได้ |

**Main Success Scenario**
1. เปิด Overdue Monitor
2. ระบบคำนวณจาก due_date และ status
3. แสดงรายการ Overdue / Due Soon
4. ผู้ใช้ filter ตาม owner/status
5. เปิด detail เพื่อติดตาม

**Alternative / Exception Flows**
- ไม่มี overdue: แสดงสถานะ 0
- due date ถูกแก้ไข: ระบบคำนวณใหม่และบันทึก audit trail

**Acceptance Criteria**
- Overdue = due_date < today และ status ไม่ใช่ Closed
- ต้อง filter by owner/status/date ได้
- รายการ overdue ต้องแสดงใน dashboard

**Test Scenarios**
| Scenario ID | Description |
| --- | --- |
| SC-B07-01 | CAR เกินกำหนดแสดงเป็น overdue |
| SC-B07-02 | CAR closed แล้วไม่แสดง overdue |

### UC-B08 - View Operational Dashboard
| หัวข้อ | รายละเอียด |
| --- | --- |
| Owner Group | Group B |
| Primary Actor | ISO/QA Admin / Management Viewer / Auditor / Group B User |
| SRS/FR Mapping | FR-DB-01, FR-DB-02, FR-DB-03, FR-DB-04, FR-DB-05, GB-FR-09, GB-FR-10 |
| เอกสารอ้างอิง/ที่มาของ requirement | Operational Dashboard / Phase 1 BRD |
| Trigger | ต้องเห็นภาพรวมสถานะ Phase 1 |
| Preconditions | มีข้อมูลจาก Group A และ Group B |
| Postconditions | dashboard แสดงสถานะจากข้อมูลจริง |

**Main Success Scenario**
1. เปิด Dashboard
2. ระบบดึง document status summary จาก Group A
3. ระบบดึง acknowledgement summary
4. ระบบดึง finding/CAR/overdue จาก Group B
5. แสดง cards/charts/recent list
6. ผู้ใช้ drill down ไปยังรายการได้

**Alternative / Exception Flows**
- Group A API unavailable: แสดง warning และใช้ข้อมูลล่าสุดที่ cache/หรือแสดงเฉพาะส่วน Group B
- ไม่มีข้อมูล: แสดง 0/empty state

**Acceptance Criteria**
- dashboard ต้องไม่ใช้ mock/hardcode
- ต้องมี card อย่างน้อย Total Documents, Published, Ack Rate, Open CAR, Overdue CAR, Recent Findings
- ตัวเลขต้องตรงกับฐานข้อมูลและ shared API

**Test Scenarios**
| Scenario ID | Description |
| --- | --- |
| SC-B08-01 | Dashboard แสดง document status จาก Group A |
| SC-B08-02 | Dashboard แสดง Open/Overdue/Closed CAR |
| SC-B08-03 | Group A API unavailable |

### UC-B09 - Export Audit/CAR/Dashboard Summary
| หัวข้อ | รายละเอียด |
| --- | --- |
| Owner Group | Group B |
| Primary Actor | ISO/QA Admin / Auditor |
| SRS/FR Mapping | FR-AU-05, FR-AT-03, GB-FR-09 |
| เอกสารอ้างอิง/ที่มาของ requirement | Audit Report, CAR Summary |
| Trigger | ต้องนำข้อมูลไปประกอบการประชุมหรือการตรวจติดตาม |
| Preconditions | มีข้อมูล audit/finding/CAR/dashboard |
| Postconditions | ได้ไฟล์ export หรือรายงาน summary |

**Main Success Scenario**
1. เปิดเมนู Report/Export
2. เลือกชนิดรายงาน
3. กำหนดช่วงวันที่/สถานะ
4. กด Export
5. ระบบสร้างไฟล์หรือแสดงตารางสำหรับนำออก

**Alternative / Exception Flows**
- ไม่มีข้อมูลในช่วงที่เลือก: ส่งไฟล์ว่างพร้อมหัวตารางหรือแสดง empty state
- ผู้ใช้ไม่มีสิทธิ์ export: ปฏิเสธ

**Acceptance Criteria**
- รายงานอย่างน้อยต้อง export รายการ finding และ CAR summary ได้
- ต้องระบุวันที่สร้างรายงานและผู้สร้าง

**Test Scenarios**
| Scenario ID | Description |
| --- | --- |
| SC-B09-01 | Export CAR summary |
| SC-B09-02 | Export finding list |

### UC-S03 - View Audit Trail
| หัวข้อ | รายละเอียด |
| --- | --- |
| Owner Group | Shared |
| Primary Actor | ISO/QA Admin / Auditor / IT/Admin |
| SRS/FR Mapping | FR-AT-01, FR-AT-02, FR-AT-03, NFR-AUD-01 |
| เอกสารอ้างอิง/ที่มาของ requirement | Audit Trail Requirements |
| Trigger | ต้องตรวจสอบย้อนหลังว่าใครทำอะไรเมื่อไร |
| Preconditions | มี event ในระบบ |
| Postconditions | ผู้ใช้เห็น audit trail ตามสิทธิ์ |

**Main Success Scenario**
1. เปิด Audit Trail
2. เลือก object type หรือ user/date
3. ระบบแสดง event list
4. ผู้ใช้เปิดรายละเอียด event
5. ถ้ามีสิทธิ์ export ได้

**Alternative / Exception Flows**
- ไม่มีสิทธิ์ดู log: ระบบปฏิเสธ
- ไม่พบ event: แสดง empty state

**Acceptance Criteria**
- event สำคัญต้องมี actor, action, object_type, object_id, timestamp
- log ต้องถูกแก้ไขโดยผู้ใช้ทั่วไปไม่ได้

**Test Scenarios**
| Scenario ID | Description |
| --- | --- |
| SC-S03-01 | ดู log การ publish เอกสาร |
| SC-S03-02 | ดู log การ close CAR |
| SC-S03-03 | End User พยายามดู audit trail |

## 8. SRS Mapping by Group
### 8.1 Group A Mapping
| Use Case | SRS / FR | Screen candidates | Main Data Objects | API candidates |
| --- | --- | --- | --- | --- |
| UC-A01 Create Document Draft | FR-DC-01, FR-DC-04, GA-FR-01/02 | Document List, Document Form | Document, DocumentVersion, FileReference | POST /documents, POST /documents/{id}/files |
| UC-A02 Create and Submit DAR | FR-DAR-01..04, GA-FR-04 | DAR Form, Document Detail | DAR, Document, ApprovalLog | POST /dar, POST /dar/{id}/submit |
| UC-A03 Review DAR and Document | FR-DC-02/05/08, GA-FR-05 | Approval Queue, DAR Detail | DAR, ApprovalLog, AuditTrail | GET /approvals, POST /dar/{id}/approve, POST /dar/{id}/reject |
| UC-A04 Publish Current Version | FR-DC-06/07, GA-FR-06 | Document Detail, Publish Dialog | DocumentVersion, RevisionHistory, AuditTrail | POST /documents/{id}/publish |
| UC-A05 Obsolete/Archive | FR-DC-07 | Document Detail | DocumentVersion, AuditTrail | POST /documents/{id}/obsolete |
| UC-A06 Search/View | FR-DC-05, GA-FR-09 | Document List, Document Detail | Document, DocumentVersion | GET /documents |
| UC-A07 Acknowledge | FR-SW-03..05, GA-FR-08 | Ack Task, Document Detail | Acknowledgement, DocumentVersion | POST /documents/{id}/ack, GET /ack/summary |
| UC-A08 Provide Summary to Group B | FR-DB-01/02, GA-FR-10 | Service API | DocumentStatusSummary, AckSummary | GET /integration/document-summary, GET /integration/ack-summary |

### 8.2 Group B Mapping
| Use Case | SRS / FR | Screen candidates | Main Data Objects | API candidates |
| --- | --- | --- | --- | --- |
| UC-B01 Create Record/Evidence | FR-RC-01..03, GB-FR-01/02 | Record List, Record Form | Record, FileReference, DocumentReference | POST /records, POST /records/{id}/files |
| UC-B02 Create Audit Session | FR-AU-01, GB-FR-03 | Audit List, Audit Form | Audit | POST /audits |
| UC-B03 Record Finding | FR-AU-02..04, GB-FR-03 | Finding Form, Audit Detail | Finding, Record, DocumentReference | POST /findings |
| UC-B04 Create CAR | FR-CAR-01/02, GB-FR-05 | Finding Detail, CAR Form | CAR, Finding | POST /cars |
| UC-B05 Update RCA/Action | FR-CAR-03/04, GB-FR-06 | CAR Detail | CAR, Record, FileReference | PATCH /cars/{id} |
| UC-B06 Verify/Close CAR | FR-CAR-06, GB-FR-08 | CAR Verification | CAR, AuditTrail | POST /cars/{id}/verify, POST /cars/{id}/close |
| UC-B07 Overdue Monitor | FR-CAR-05, FR-DB-03, GB-FR-07 | Overdue Monitor | CAR | GET /cars?status=overdue |
| UC-B08 Dashboard | FR-DB-01..05, GB-FR-09/10 | Dashboard | DashboardSummary | GET /dashboard/summary |
| UC-B09 Export Summary | FR-AU-05, GB-FR-09 | Report/Export | Audit, Finding, CAR | GET /reports/cars, GET /reports/findings |

## 9. Use Case Diagram Reference
ดูไฟล์ `E-Filing_Phase1_Detailed_UseCase_Diagrams.drawio` ภายในแพ็ก ซึ่งประกอบด้วยหน้า:
1. Overall Phase 1 Use Case Diagram
2. Group A Use Case Diagram
3. Group B Use Case Diagram
4. Document Lifecycle Scenario Flow
5. Audit/Finding/CAR Scenario Flow
6. Dashboard Integration Scenario Flow
7. SRS Mapping Overview

## 10. Definition of Done สำหรับ Use Case
- ทุก Use Case ต้องมี scenario ทดสอบอย่างน้อย 1 happy path และ 1 alternative/exception path สำหรับ flow สำคัญ
- ทุก Scenario ต้องผูกกับ SRS/FR ID
- Group A ต้องส่งข้อมูล document status และ acknowledgement summary ให้ Group B ได้
- Group B dashboard ต้องใช้ข้อมูลจริงจาก Group A/B ไม่ใช่ mock data
- ทุก workflow สำคัญต้องมี audit trail อย่างน้อย actor/action/object/timestamp