# Software Requirements Specification
## ระบบ E-Filing — ระบบบริหารงานคุณภาพ ISO 9001:2015
### สำนักงานคณบดีคณะวิศวกรรมศาสตร์ มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา (มทร.ล้านนา)
**ขอบเขตฉบับนี้: Phase 1 MVP + Operational Dashboard**

| รายการ | รายละเอียด |
| :--- | :--- |
| **โปรเจกต์** | ระบบ E-Filing (ระบบบริหารงานคุณภาพ ISO 9001:2015) |
| **หน่วยงาน** | สำนักงานคณบดีคณะวิศวกรรมศาสตร์ มทร.ล้านนา |
| **ขอบเขต** | Phase 1 MVP + Operational Dashboard (Group A: Document Control/DAR/Acknowledgement, Group B: Records/Audit/CAR/Dashboard) |
| **รหัสอ้างอิง (ID Convention)** | คงรูปแบบเดิมจากเอกสารต้นทาง: `FR-Axx` / `FR-Bxx` / `FR-SHxx`, `BR-xx`, `NFR-xx`, `UC-xx`, `US-Axx` / `US-Bxx`, `AC-xx` — ไม่รวมเป็น `[PRJ]` เดี่ยว เพื่อรักษาความสามารถ Traceability กลับไปยัง Master Plan/SE02 และคงการแบ่งความรับผิดชอบ Group A/B/Shared (ดูเหตุผลใน §1.2) |
| **Version** | 0.12 (Draft) |
| **สถานะ** | Working Draft — รวบรวมจาก 01_BRD v2.0, 02_SRS+Use Case v2.0, 03_SE02 Mapping v2.0 ยังไม่ Baseline (มี Open Issues ใน Appendix C) |
| **จัดทำโดย** | BA / Product Owner (ตามเอกสารต้นทาง) — _[TBD ชื่อผู้จัดทำจริง]_ |
| **วันที่** | 2026-09-04 |

---

## สารบัญ (Table of Contents)

| ส่วน | เนื้อหา |
| :--- | :--- |
| **1** | **Introduction:** จุดประสงค์ ขอบเขต ผู้อ่าน และเอกสารอ้างอิง |
| **2** | **Overall Description:** บริบท ฟังก์ชัน ผู้ใช้ สภาพแวดล้อม ข้อจำกัด และสมมติฐาน |
| **3** | **External Interface Requirements:** UI, Hardware, Software (รวม Internal Contract A↔B) และ Communications |
| **4** | **System Features:** UC-01..16, Main/Alternate/Exception Flow และ Functional Requirements |
| **5** | **Other Nonfunctional Requirements:** Performance, Safety, Security, Quality, Business Rules |
| **6** | **Other Requirements:** Data/Audit, Language, Release & Ownership Boundary |
| **Appendix A** | Glossary |
| **Appendix B** | Analysis Models (Data Entities, State Semantics, Authority/Ownership Matrix) |
| **Appendix C** | TBD / Controlled Open Issues |
| **Appendix D** | Acceptance Criteria (Given–When–Then) |
| **Appendix E** | End-to-End Traceability (BR → FR → UC → AC) |
| **Appendix F** | Completeness and QA Record |

---

## Revision History

| Version | Date | Reason for Changes | Status |
| :--- | :--- | :--- | :--- |
| **0.1** | 2026-09-04 | สร้างโครงเอกสารเริ่มต้นจากไฟล์ guideline (Case X) | Draft |
| **0.2** | 2026-09-04 | นำเข้าเนื้อหาจาก 01_BRD_Phase1, 02_SRS_UseCase_Phase1, 03_SE02_Mapping (E-Filing ISO 9001:2015) จัดวางลงโครงสร้าง IEEE SRS พร้อม Traceability เบื้องต้น | Working Draft |
| **0.3** | 2026-09-04 | ปรับปรุง 2 จุด: (1) รวม Actor "IT/Admin" เข้ากับ "ISO/QA Admin" เป็นผู้จัดการเพียงบทบาทเดียว (2) เปลี่ยนสถาปัตยกรรมการสื่อสารระหว่าง Group A/B จาก Shared API Contract เป็น Internal Module Interface บน backend เดียวกัน (§2.1, §2.3, §3.3 และจุดอ้างอิงที่เกี่ยวข้อง) | Working Draft |
| **0.3.1** | 2026-09-04 | แก้ไขรหัสซ้ำ: TBD-EFL-04/05 เดิมถูกใช้ซ้ำ 2 ความหมาย (Performance target ใน §5.1 vs. Approval role/Ack assignment ใน Appendix C) เปลี่ยน Performance TBD เป็น TBD-EFL-13/14 และรวมเข้า Appendix C เป็นทะเบียนเดียว | Working Draft |
| **0.4** | 2026-09-04 | นำเข้ามติจาก businesspolicies.md (REF-08) ปิด **TBD-EFL-01..07** ทั้งหมด: User Source, Document Code Uniqueness, File Storage, Approver Separation (SoD), Acknowledgement Dual Mapping, Audit Round Structure, CAR Two-Step Verify/Close — เพิ่ม Actor ใหม่ (QMR, Lead Auditor, Assistant DCC), เพิ่ม Business Rule ใหม่ 3 ข้อ (BRULE-EFL-11..13), ปรับ Data Model (DocumentRevision, isActive, AuditRound, CAR verified_by/closed_by), อัปเดต UC-03/04/07/09/11 ให้สอดคล้อง | Working Draft |
| **0.5** | 2026-09-04 | นำเข้ารายละเอียดเต็มของ UC-05 (Obsolete), UC-06 (Search/View), UC-14 (Audit Trail) จาก usecasespecificationssome.md ยืนยัน Backend เป็น Node.js/Express + Prisma ORM (§2.4) — **พบข้อขัดแย้งสถาปัตยกรรมใน UC-13/UC-A09 (REST API vs Internal Module Interface ที่ยืนยันแล้วใน v0.3) ยังไม่แก้ไข รอผู้ใช้ยืนยัน** (ดู Appendix F) | Working Draft |
| **0.6** | 2026-09-04 | ผู้ใช้ยืนยันคงสถาปัตยกรรม **Internal Module Interface** ตามมติ v0.3 (ไม่ใช้ REST API ตามที่ usecasespecificationssome.md บรรยายไว้สำหรับ UC-A09) — ปรับ UC-13 (Export Summary) ให้ใช้เฉพาะ Manual Export flow (ISO/QA Admin ดาวน์โหลด CSV/xlsx) และย้ายเนื้อหากลไกส่งข้อมูลอัตโนมัติ A→B ไปไว้ที่ §3.3.1 (Internal Module Interface table) พร้อมเพิ่มรายละเอียด Document Summary / Acknowledgement Rate ที่ส่งต่อกัน — ปิดข้อขัดแย้งที่ค้างจาก v0.5 | Working Draft |
| **0.7** | 2026-09-04 | นำเข้า qmsdatalifecyclepolicy.md (QMS Data Life Cycle Policy, ISO 9001:2015 ข้อ 7.5.3) ปิด **TBD-EFL-09** (Data retention/archival/deletion) — เพิ่ม §6.1.1 นโยบายวงจรชีวิตข้อมูล (แยก Document/Quality Record, ตารางระยะเวลาจัดเก็บ 5 ระดับ, No Auto-Deletion), เพิ่ม Use Case ใหม่ **UC-15 (Data Retention & Destruction Management)**, FR ใหม่ 3 ข้อ (FR-A13, FR-B15, FR-SH06), Business Rule ใหม่ 5 ข้อ (BRULE-EFL-14..18), Entity ใหม่ (DestructionLog), AC-11, BR-15 — พบและบันทึก Gap เดิม: FR-SH05 ถูกอ้างอิงในเอกสารแต่ไม่เคยมีนิยาม (ดู Appendix F) | Working Draft |
| **0.7.1** | 2026-09-04 | แก้ไข Gap ที่พบใน v0.7: ค้นพบนิยามจริงของ **FR-SH05** ในเอกสารต้นทาง 02_SRS_UseCase_Phase1_Updated_RMUTL_ISO9001.md ("ระบบต้องมี seed data จาก Master List/DAR/Pilot documents") ซึ่งตกหล่นระหว่างการรวมเอกสารครั้งแรก (v0.2) — เติมกลับเข้า §5.3 และปิดรายการ OPEN ใน Appendix F | Working Draft |
| **0.8** | 2026-09-04 | นำเข้า usecaseflows.md (Alternate & Exception Flow Specifications) เติม Alternate/Exception Flow ที่เคยเป็น `[TBD]` ให้ครบ 9 Use Case (UC-01, 02, 03, 04, 07, 09, 10, 11, 13) เพิ่ม Business Rule ใหม่ 3 ข้อ (BRULE-EFL-19..21: PDF-only upload, Optimistic Locking บน DAR approval, CAR ต้องมีผู้รับผิดชอบปลายทาง) — **พบข้อขัดแย้งใหม่**: UC-10 Alternate Flow เสนอเปิด CAR จากแหล่งอื่นนอกรอบตรวจติดตาม (Out-of-Audit) ซึ่งขัดกับ Precondition ของ UC-09 ที่บังคับให้ Finding ทุกรายการต้องผูกกับ AuditRound (TBD-EFL-06) บันทึกเป็น **TBD-EFL-15** รอผู้ใช้ยืนยัน; ส่วนเนื้อหา REST API ของ Export Summary (UC-A09 E1) ที่ซ้ำมาอีกครั้ง ตรวจสอบแล้วไม่นำมาใช้ตามมติ Internal Module Interface เดิม | Working Draft |
| **0.9** | 2026-09-04 | ผู้ใช้ (Product Owner) ให้มติปิด **TBD-EFL-15**: ยืนยันขยายขอบเขตให้ Finding/CAR เปิดได้จากแหล่งอื่นนอกรอบตรวจติดตาม (Non-Audit Source เช่น ข้อร้องเรียน QP-2301-0106, มติที่ประชุมทบทวนฝ่ายบริหาร QP-2301-0101) โดยอ้างอิง QP-2301-0109 ข้อ 2/6.1.1 — ปรับ `audit_round_id` บน Entity Finding เป็น Nullable ใช้ `record_id` แทนเมื่อไม่ผูก AuditRound, เพิ่ม BRULE-EFL-22, ปรับ UC-09 (เปลี่ยนชื่อเป็น "Create Finding (Audit / Non-Audit Source)") และ UC-10 A1 ให้สอดคล้องกัน, เพิ่ม REF-12 | Working Draft |
| **0.10** | 2026-09-04 | ผู้ใช้ (Product Owner) ให้ "มติสรุป" ปิด 5 ประเด็นค้าง ตรวจสอบตรงกับ QM-2301-01 Rev.03 และ QP-2301-0107 Rev.02 ฉบับจริงแล้ว (REF-13): **(1)** เพิ่ม Entity ใหม่ **DistributionList** (ผู้ถือครองสำเนาควบคุม, QM-2301-01 §7.5.3) พร้อม FR-A14 และ BRULE-EFL-23 (Auto-Withdraw เมื่อเอกสาร Obsolete); **(2)** เพิ่มประเภทคำร้อง DAR ที่ 4 **REQUEST_UNCONTROLLED** ใน FR-A05/UC-02 (QP-2301-0107 §6.5.1) แทนแนวทาง hold/cancel-hold เดิม; **(3)** ปรับสถานะ **BRULE-EFL-19** (PDF-only) จาก "ข้อบังคับ QP" เป็น **Engineering Control** ของทีมพัฒนา (ตรวจสอบแล้วไม่มีกฎ file-format ใน QP-2301-0107) อิง ISO 9001:2015 ข้อ 7.5.3 แทน; **(4)** ยืนยันไฟล์อิเล็กทรอนิกส์ Published ในระบบยังคงเป็น **"Uncontrolled Document"** ตาม QP-2301-0107 §6.6 — ปิด **TBD-EFL-16** (ใหม่) เพิ่ม BRULE-EFL-24 บังคับแสดงป้ายกำกับ/ลายน้ำ "สำเนาไม่ควบคุม" พร้อม FR-A15 และปรับ UC-06; **(5)** ปิด **TBD-EFL-12**: แบ่งขอบเขต Dashboard ตาม Module Boundary — Group A เป็นเจ้าของ **"My Task Checklist"** (เพิ่ม **UC-16**, FR-A16) ส่วน Group B เป็นเจ้าของ Operational Dashboard รวม (เฉพาะสถิติภาพรวม) ปรับ UC-12 Alternate/Exception Flow ให้ครบ (Role-Based View, Departmental Drill-Down, Internal Interface Timeout, Divide-by-Zero) — เพิ่มเติม: implement UC-08 (Create Record/Evidence) Alternate/Exception Flow ที่วิเคราะห์ค้างไว้ (RecordFile multi-file attachment, Direct Issue Linkage ทำให้ document_id เป็น Nullable บน Record, ขนาดไฟล์ 20MB, Referential Integrity ก่อนทำลายข้อมูล) เพิ่ม FR-B16/B17, BRULE-EFL-25/26, Entity RecordFile ใน Appendix B.3; เพิ่ม BR-16/BR-17, REF-13/REF-14, แก้ไข Glossary (WI, Distribution List, Controlled/Uncontrolled Copy) | Working Draft |
| **0.11** | 2026-09-04 | **แก้ไขข้อผิดพลาดการอ้างอิงและเพิ่มข้อมูลขนาดไฟล์เอกสาร:** ตรวจสอบย้อนกลับพบว่า **BRULE-EFL-25** (RecordFile 20MB) อ้างอิง REF-14 (เล่มรายงานทบทวนวรรณกรรม) อย่างไม่ถูกต้อง — ค้นแล้วไม่พบตัวเลข 20MB ในเอกสารต้นทางใดเลย จึงปรับสถานะเป็น **Provisional** และเปิด **TBD-EFL-17** (ใหม่) ให้ Stakeholder ยืนยันตัวเลขจริงก่อน Baseline — เพิ่ม **BRULE-EFL-27** (ใหม่): ขนาดไฟล์สูงสุดของเอกสารควบคุม (Document) แยกตามประเภทที่ผู้ใช้/Product Owner ให้ไว้จากข้อมูลจริงปัจจุบัน (QM ≤ 22MB, QP ≤ 12MB, SD ≤ 104MB, FM ≤ 4MB; WI ยังไม่มีเกณฑ์เนื่องจากยังไม่มีไฟล์จริง) — เพิ่ม Exception Flow E3 ใน UC-01 (Create Document Draft), ปรับ FR-A03, เพิ่ม REF-15 | Working Draft |
| **0.12** | 2026-09-04 | **แก้ไข Consistency Audit** (พบโดยการประเมินภาพรวมเอกสารซ้ำ): **(1)** เขียน §6.1 Data Domain table ใหม่ทั้งหมดให้ตรงกับ Entity จริงใน Appendix B.3 (ของเดิมค้างมาตั้งแต่ v0.2 มีชื่อ Entity ที่ไม่เคยถูกสร้างจริง เช่น DocumentVersion/DocumentFile/RevisionHistory/ApprovalLog/AckAssignment/RecordType/AuditEvidence/CARAction/CAREvidence/DashboardMetric/OverdueView และขาด DestributionList/RecordFile/DestructionLog); **(2)** แก้ช่วง ID ที่ล้าสมัยใน §1.2 Document Conventions (BR-xx 01–14→01–18, UC-xx 01–14→01–16, AC-xx 01–10→01–13); **(3)** ตัดข้อความเวอร์ชันค้าง "(v0.2)" ออกจาก §6.3; **(4)** แก้ไข Appendix F Release Decision ที่ยังอ้างเงื่อนไข "ยืนยัน UC-13" ทั้งที่ข้อขัดแย้งนั้นถูกปิดไปแล้วตั้งแต่ v0.6; **(5)** ปิดช่องว่าง Traceability ของ **FR-SH03** (Shared user/role id) ที่ไม่เคยถูกอ้างอิงใน Appendix E — เพิ่มเข้า BR-14 พร้อมหมายเหตุว่าเป็น Foundational Requirement ข้ามทุก UC ไม่ผูกกับ UC เดียว | Working Draft |

---

## 1. Introduction

### 1.1 Purpose

เอกสารนี้กำหนดความต้องการซอฟต์แวร์สำหรับ **ระบบ E-Filing Phase 1 MVP + Operational Dashboard** ของระบบบริหารงานคุณภาพ ISO 9001:2015 สำนักงานคณบดีคณะวิศวกรรมศาสตร์ มทร.ล้านนา เพื่อยกระดับจากการจัดการเอกสารและหลักฐานแบบกระดาษ/ไฟล์กระจัดกระจาย ไปสู่ระบบดิจิทัลที่ควบคุมเอกสาร หลักฐาน การตรวจติดตาม (audit) และการแก้ไขข้อบกพร่อง (CAR) ได้จริง

โครงการนี้ส่งมอบในบริบทโครงงานนักศึกษา 2 กลุ่ม กลุ่มละ 2 คน แบ่งความรับผิดชอบเป็น **Group A — Document Control / DAR / Acknowledgement** และ **Group B — Records / Audit / CAR / Operational Dashboard** เอกสารฉบับนี้ใช้เป็น requirement กลางที่ทั้งสองกลุ่มต้องเข้าใจตรงกัน (actors, functional requirements, non-functional requirements, use cases, user stories, acceptance criteria และ boundary ของแต่ละโมดูล) ก่อนเข้าสู่การออกแบบ ERD และ Internal Module Interface Contract ระหว่าง Group A/B (เดิมเรียก "Shared API Contract" แต่ปัจจุบันทั้งสองกลุ่มใช้ backend เดียวกัน — ดู §2.1, §3.3) และใช้เป็นฐานต่อยอดสู่ Phase 2/3

**สถานะเอกสาร:** Working Draft — ยังไม่เป็น Baseline เนื่องจากยังมีประเด็นเปิด (Appendix C) ที่ต้องตัดสินใจก่อนเริ่มออกแบบ ERD/Internal Interface เช่น แหล่งที่มาของ user, กติกา uniqueness ของ document code, file storage, บทบาทผู้อนุมัติ, การ assign ผู้รับทราบเอกสาร, รอบ audit และเงื่อนไขการ verify/close CAR

### 1.2 Document Conventions

| Convention | ความหมาย |
| :--- | :--- |
| **FR-Axx** | Functional Requirement ของ Group A (Document Control/DAR/Acknowledgement) |
| **FR-Bxx** | Functional Requirement ของ Group B (Records/Audit/CAR/Dashboard) |
| **FR-SHxx** | Functional Requirement ที่ใช้ร่วมกัน (Shared) |
| **BR-xx** | Business Requirement ระดับ BRD (01–18) |
| **BRULE-EFL-xx** | Business Rule เชิงนโยบาย (กำหนดรหัสใหม่โดย BA จากรายการ Business Rules ที่ไม่มี ID ในเอกสารต้นทาง เพื่อให้ trace ได้) |
| **NFR-xx** | Nonfunctional Requirement (01–10) |
| **UC-xx** | Use Case (01–16) |
| **US-Axx / US-Bxx** | User Story ของ Epic A–E |
| **AC-xx** | Acceptance Criteria ระดับธุรกิจ (01–13, จาก BRD และเพิ่มเติมโดย BA ตามรอบแก้ไข) |
| **TBD-EFL-xx** | ประเด็นที่ยังไม่สรุป (รวมจาก Open Issues ของ BRD และ Gap Analysis ของ SE02 Mapping) |
| **ต้อง / Must** | ข้อกำหนดที่จำเป็นสำหรับ Phase 1 MVP |
| **ควร / Should** | ข้อกำหนดลำดับรองหรือทำได้ถ้าเวลาเหลือ |

> **หมายเหตุเรื่องรหัสอ้างอิง:** เอกสารฉบับนี้ **คงรูปแบบรหัสเดิมจากเอกสารต้นทาง** (FR-A/FR-B/FR-SH, BR, NFR, UC, US-A/US-B, AC) แทนที่จะรวมเป็นรหัสเดียว `[PRJ]` แบบเทมเพลตทั่วไป เพราะรูปแบบเดิมสื่อความรับผิดชอบ Group A/B/Shared ซึ่งเป็นข้อมูลสำคัญของโครงการ (ป้องกันงานซ้ำซ้อนระหว่าง 2 ทีม) และช่วยรักษา Traceability กลับไปยัง Master Plan และเอกสาร SE02 ที่อนุมัติ/นำเสนอแล้ว

เอกสารต้นทางไม่ได้ระบุ Font/Branding เฉพาะ — หากมีข้อกำหนดจาก อว./มทร.ล้านนา ให้ระบุเพิ่มเติม (`[TBD]`)

### 1.3 Intended Audience and Reading Suggestions

| ผู้อ่าน | อ่านส่วนที่แนะนำ | จุดประสงค์ |
| :--- | :--- | :--- |
| **ผู้บริหาร/สำนักงานคณบดี (Sponsor)** | 1, 2, 5.5, Appendix C | ยืนยัน Scope, ความเสี่ยง และ Business Rules |
| **ISO/QA Admin** | ทุกส่วน เน้น 2, 4, 5.3, Appendix B | เข้าใจการควบคุมเอกสาร, DAR, audit trail, dashboard |
| **Document Owner / Approver / End User** | 2.3, 4.1–4.7 | เข้าใจบทบาทและขั้นตอนที่ตนเกี่ยวข้อง |
| **Auditor / CAR Owner** | 2.3, 4.8–4.13, Appendix D | เข้าใจ audit/finding/CAR workflow และเกณฑ์ปิดงาน |
| **Student Group A** | 2, 3, 4.1–4.7, Appendix B–E ส่วน Group A | ขอบเขตงานและ Deliverable ที่ต้องส่งมอบ |
| **Student Group B** | 2, 3, 4.8–4.13, Appendix B–E ส่วน Group B | ขอบเขตงานและ Deliverable ที่ต้องส่งมอบ |
| **Instructor / Reviewer** | Revision History, Appendix C, E, F | ใช้ตรวจ Gate ก่อนอนุมัติ ERD/Internal Interface Contract |

### 1.4 Product Scope

ผู้จัดกิจกรรมด้านคุณภาพ (Document Owner, Auditor, ISO/QA Admin ฯลฯ) ในสำนักงานคณบดีคณะวิศวกรรมศาสตร์ มทร.ล้านนา เผชิญปัญหา 6 ด้าน ได้แก่ (1) เอกสารคุณภาพจำนวนมากค้นหาฉบับใช้งานจริงได้ยาก (2) มีความเสี่ยงใช้เอกสารผิดฉบับ/เอกสารที่ถูกยกเลิก (3) กระบวนการ DAR (Document Amendment Request) ล่าช้าและตรวจสอบสถานะไม่ชัดเจน (4) หลักฐานการรับทราบเอกสารตรวจสอบย้อนหลังไม่ได้ (5) หลักฐาน audit/finding/CAR กระจายหลายไฟล์ ติดตามงานค้างยาก และ (6) Dashboard ระดับปฏิบัติการยังไม่มีข้อมูลจริงจาก transaction ของระบบ ผลกระทบคือ human error, งานซ้ำซ้อน, ความพร้อมรับการตรวจติดตามต่ำ, ระบบคุณภาพขึ้นกับตัวบุคคล และมองไม่เห็นสถานะที่ทันเวลาเพื่อการปรับปรุงต่อเนื่อง

**Business Vision:** ระบบ E-Filing Phase 1 ต้องทำให้องค์กรมีแหล่งข้อมูลกลางสำหรับเอกสารคุณภาพฉบับปัจจุบัน หลักฐานการปฏิบัติงาน ผลการตรวจติดตาม และ CAR พร้อม dashboard ที่สะท้อนสถานะจริงของระบบคุณภาพ

| In Scope (Phase 1 MVP) | Out of Scope / Deferred |
| :--- | :--- |
| Document Master (รหัส/ชื่อ/ประเภท/หน่วยงาน/เจ้าของ/สถานะ) | Risk register แบบเต็มระบบ |
| Document Lifecycle: Draft → Review → Approved → Published → Obsolete | HR/training matrix แบบเต็มระบบ |
| DAR: สร้าง/ทบทวน/อนุมัติ/ปฏิเสธ/ติดตามสถานะ | Management Review แบบเต็มรูปแบบ |
| File Management (แนบไฟล์/หลักฐาน + metadata) | Executive dashboard ขั้นสูง / KPI analytics เชิงลึก |
| Acknowledgement (มอบหมาย + บันทึกการรับทราบ) | SSO/LDAP จริง |
| Records/Evidence ผูกกับ document/finding/CAR | Email/LINE notification จริง |
| Audit/Finding (บันทึก header, finding, evidence) | OCR/scanner integration |
| CAR: open/update/verify/close, root cause, corrective action, due date | Mobile native application |
| Operational Dashboard (status cards/charts/recent/overdue) จากข้อมูลจริง | — |
| Audit Trail (who/what/when) สำหรับ event สำคัญ | — |

> **Core semantic / หลักการสำคัญ:** Group A เป็นเจ้าของแหล่งข้อมูลเอกสารต้นทาง (Document/DAR/Acknowledgement) ส่วน Group B เป็นเจ้าของหลักฐาน การตรวจติดตาม CAR และ Dashboard รวม ทั้งสองฝั่งต้องสื่อสารผ่าน **Shared Contract** เดียวกัน — **ห้าม Group B สร้าง Document Master ซ้ำ** และ **Dashboard หลักต้องอยู่ที่ Group B เท่านั้น** (Group A มี **"My Task Checklist" (UC-16, FR-A16)** เป็น dashboard/summary ระดับส่วนบุคคลของตนเองได้ แต่ไม่ใช่ dashboard รวมของระบบ — ขอบเขตนี้ยืนยันแล้วตามมติปิด **TBD-EFL-12 RESOLVED**)

### 1.5 References

| Ref | เอกสาร/แหล่งอ้างอิง | การใช้ใน SRS |
| :--- | :--- | :--- |
| **REF-01** | 01_BRD_Phase1_Updated_RMUTL_ISO9001.md | Business Problem, Objectives, Scope, Business Requirements/Rules, Data Domains, AC ระดับธุรกิจ, Group Split, Open Issues |
| **REF-02** | 02_SRS_UseCase_Phase1_Updated_RMUTL_ISO9001.md | Actors, System States, Functional/Nonfunctional Requirements, Data Entities, Use Case, User Story, Testing Requirements, Definition of Done |
| **REF-03** | 03_SE02_SRS_Mapping_GroupA_GroupB_RMUTL_ISO9001.md | Mapping Scope↔FR↔UC, Boundary ระหว่าง Group, Shared Contract, Gap Analysis |
| **REF-04** | Master Plan โครงการ | กำหนดภาพรวม Phase 1 และการแบ่งงาน 2 กลุ่ม |
| **REF-05** | SE02 Group A (SE02_E-filing_GroupA_fix-4_thanit_signed.pdf) | ยืนยัน scope ฝั่ง Document Control/DAR/Ack ที่นำเสนอแล้ว |
| **REF-06** | SE02 Group B (se02_group_B_latest_version.pdf) | ยืนยัน scope ฝั่ง Records/Audit/CAR/Dashboard ที่นำเสนอแล้ว |
| **REF-07** | เอกสารคุณภาพจริง: QM, QP (เช่น QP-2301-0107, -0102, -0109), SD, FM, Master List, DAR Register | ใช้ออกแบบ process/workflow/role/field และ seed data |
| **REF-08** | businesspolicies.md (Business & Architectural Policy Consensus) | มติปิด TBD-EFL-01..07: User Source, Document Code Uniqueness, File Storage, Approver Separation, Acknowledgement Assignment, Audit Round Structure, CAR Verify/Close |
| **REF-09** | usecasespecificationssome.md (Use Case Specifications, SE02 Group A) | รายละเอียดเต็มของ UC-A05 (Obsolete), UC-A07 (Search/View), UC-A09 (Export Summary), UC-14 (Audit Trail) พร้อม RBAC framework 4 บทบาท และยืนยันสถาปัตยกรรม Backend (Node.js/Express + Prisma) — **UC-A09 เดิมบรรยายด้วยกลไก REST API ซึ่งขัดกับมติ Internal Module Interface ใน v0.3; ผู้ใช้ยืนยันแล้วให้คง Internal Module Interface — เนื้อหาถูกแปลงเข้าสู่ UC-13 (Manual Export) และ §3.3.1 (กลไกอัตโนมัติแบบ internal call) ในเวอร์ชัน 0.6 (แก้ไขเรียบร้อย)** |
| **REF-10** | qmsdatalifecyclepolicy.md (QMS Data Life Cycle Policy) | นโยบายบริหารวงจรชีวิตข้อมูล (Retention/Archival/Destruction) ตาม ISO 9001:2015 ข้อ 7.5.3 — ปิด `TBD-EFL-09`; ใช้ออกแบบ §6.1.1, UC-15, BRULE-EFL-14..18, Entity DestructionLog |
| **REF-11** | usecaseflows.md (Alternate & Exception Flow Specifications) | เติม Alternate/Exception Flow ที่เคยเป็น `[TBD]` ให้ UC-01, UC-02, UC-03, UC-04, UC-07, UC-09, UC-10, UC-11, UC-13 — เพิ่ม BRULE-EFL-19..21 — **พบข้อขัดแย้งใหม่ระหว่าง UC-10 A1 (Out-of-Audit CAR) กับ Precondition ของ UC-09 (Finding ต้องผูกกับ AuditRound) บันทึกเป็น `TBD-EFL-15` (ภายหลังได้รับมติแก้ไขแล้ว ดู REF-12); ส่วนเนื้อหา Export Summary API (UC-A09 E1) ซ้ำแนวทาง REST API เดิม ตรวจสอบแล้วไม่นำมาใช้ตามมติ Internal Module Interface** |
| **REF-12** | มติผู้ใช้ (Product Owner/BA) อ้างอิง QP-2301-0109 (การแก้ไขและการป้องกัน, Rev.00) ข้อ 2 Scope และข้อ 6.1.1 — เอกสารฉบับเต็มได้ถูกอัปโหลดเข้าระบบภายหลังและ BA ได้ตรวจสอบยืนยันข้อความอ้างอิงตรงกับต้นฉบับแล้ว (ดู REF-13) | ปิด `TBD-EFL-15` — ยืนยันให้ Finding/CAR เปิดได้จากแหล่งอื่นนอกรอบตรวจติดตาม (audit_round_id Nullable); ใช้ปรับ §4.9, §4.10, Appendix B.3, BRULE-EFL-22 |
| **REF-13** | เอกสารคุณภาพจริง 10 ฉบับที่อัปโหลดเข้าระบบ: QM-2301-01 (คู่มือคุณภาพ, Rev.03), QP-2301-0107 (การควบคุมเอกสาร, Rev.02), QP-2301-0109 (การแก้ไขและการป้องกัน, Rev.00), QP-2301-0102 (Rev.01) และแบบฟอร์ม FM-QP-2301-0107-01..04, FM-QP-2301-0109-01..02 — BA ตรวจสอบโดยตรง (`Read` หน้า 9-11 ของ QP-2301-0107 และหน้า 34-36 ของ QM-2301-01) ยืนยันข้อความตรงกับที่ผู้ใช้อ้างอิงในมติสรุปทุกจุด | ใช้ยืนยัน/ปิดประเด็น Distribution List (§7.5.3), DAR 4 ประเภท CREATE/AMEND/CANCEL/REQUEST_UNCONTROLLED (§6.5.1), สถานะ Uncontrolled Document ของไฟล์อิเล็กทรอนิกส์ (§6.6), และตรวจสอบว่า QP-2301-0107 ไม่มีข้อบังคับ PDF-only (ใช้แก้ไขสถานะ BRULE-EFL-19) |
| **REF-14** | เล่มรายงานการศึกษาทบทวนวรรณกรรม "การพัฒนาระบบ E-Filing สนับสนุน ISO 9001" (.docx, แปลงเป็นข้อความด้วย pandoc เพื่ออ่าน) | ใช้ประกอบการออกแบบ UC-08 A1/A2 (Multi-File Attachment, Direct Issue Linkage) และ UC-12 A1/A2 (Role-Based View, Cognitive Overload/Role-based customization) — **หมายเหตุแก้ไข (v0.11):** ไม่มีการระบุตัวเลขขนาดไฟล์ (20MB) ไว้ในเอกสารนี้ — BRULE-EFL-25 เคยอ้างอิง REF-14 ผิดพลาด แก้ไขเป็น Provisional/TBD-EFL-17 แล้ว |
| **REF-15** | ข้อมูลผู้ใช้ (Product Owner/BA) ระบุขนาดไฟล์สูงสุดของเอกสารคุณภาพจริงที่มีอยู่ในปัจจุบัน แยกตามประเภท: QM ≤ 22MB, QP ≤ 12MB, SD ≤ 104MB, FM ≤ 4MB — ให้ไว้ในการสนทนา (v0.11) ยังไม่มีเอกสาร QMS ฉบับทางการที่ระบุตัวเลขนี้โดยตรง | ใช้กำหนด BRULE-EFL-27 และ UC-01 Exception Flow E3 |

---

## 2. Overall Description

### 2.1 Product Perspective

ระบบ E-Filing Phase 1 เป็น **web application ใหม่** สำหรับจัดการเอกสารคุณภาพและหลักฐานตามระบบบริหารงานคุณภาพ ISO 9001:2015 แบ่งการพัฒนาเชิงหน้าที่เป็น 2 vertical modules (Group A, Group B) แต่ **รวมอยู่บน backend เดียวกัน (single shared backend / monolith)** ไม่ได้แยกเป็นคนละ service ที่เรียกกันผ่าน network API — Group A และ Group B ส่งข้อมูลให้กันผ่าน **Internal Module Interface** (เรียกใช้ฟังก์ชัน/service ภายใน backend เดียวกัน) โดยมี `document_id` / `document_code` / `version_id` / `status` เป็น key กลางในการเชื่อมข้อมูลระหว่างโมดูล ระบบไม่มีการเชื่อมต่อ Real-time กับระบบ Legacy ใด ๆ ในเวอร์ชันนี้ (SSO/LDAP จริงและ OCR/scanner อยู่นอกขอบเขต)

> **ปรับปรุง (v0.3):** เดิมเอกสารระบุว่า Group A/B สื่อสารกันผ่าน Shared API Contract (แยก service) ปัจจุบันการออกแบบเปลี่ยนเป็น **backend เดียวกัน** ทั้งสองกลุ่ม โดยแบ่งความรับผิดชอบเป็นคนละ module/layer ภายในโค้ดเดียวกัน และเรียกหากันด้วย Internal Module Interface (function call/service call ภายในกระบวนการเดียวกัน) แทนการเรียกผ่าน HTTP API ระหว่างกัน — รายละเอียดอยู่ที่ §3.3

*(ภาพที่ 1 — System Context: Group A ↔ Group B ↔ Shared Auth/RBAC — TBD ต้องวาดจากโครงสร้างนี้)*

### 2.2 Product Functions

| Capability Group | หน้าที่หลัก | Requirement Coverage |
| :--- | :--- | :--- |
| **Document Control (A)** | สร้าง/แก้ไข/ค้นหา document master, จัดการ metadata และไฟล์แนบ | FR-A01, FR-A02, FR-A03, FR-A09 |
| **Document Lifecycle (A)** | ควบคุมสถานะ Draft/Review/Approved/Published/Obsolete และ revision history | FR-A04, FR-A07, FR-A08 |
| **DAR Workflow (A)** | สร้าง/ทบทวน/อนุมัติ/ปฏิเสธคำขอแก้ไขเอกสาร | FR-A05, FR-A06 |
| **Acknowledgement (A)** | มอบหมายผู้รับทราบและบันทึกการรับทราบเอกสาร | FR-A10, FR-A11 |
| **Data Feed to B (A)** | ส่ง document/ack summary ให้ Group B | FR-A12 |
| **Distribution List & Uncontrolled Copy (A)** | ดูแลบัญชีผู้ถือครองสำเนาควบคุม (Distribution List) และแสดงป้ายกำกับ "สำเนาไม่ควบคุม" บนไฟล์อิเล็กทรอนิกส์ | FR-A14, FR-A15 |
| **My Task Checklist (A)** | แสดงงานค้าง (DAR/Acknowledgement) เฉพาะของผู้ใช้แต่ละคน แยกจาก Dashboard รวมของ Group B | FR-A16 |
| **Records/Evidence (B)** | สร้าง/ผูก record หรือหลักฐานกับเอกสาร/finding/CAR พร้อมไฟล์แนบหลายไฟล์ | FR-B01, FR-B02, FR-B16, FR-B17 |
| **Audit/Finding (B)** | บันทึก audit round และ finding พร้อม evidence | FR-B03, FR-B04, FR-B05 |
| **CAR Lifecycle (B)** | เปิด/อัปเดต/verify/close/reopen CAR พร้อม root cause และ evidence | FR-B06, FR-B07, FR-B08, FR-B10 |
| **Overdue Monitoring (B)** | คำนวณสถานะเลยกำหนดของ CAR | FR-B09 |
| **Operational Dashboard (B)** | รวมสถานะเอกสาร/ack/CAR/finding จากข้อมูลจริง | FR-B11, FR-B12, FR-B13 |
| **Export Summary (B)** | ส่งออกรายงานสรุปเบื้องต้น | FR-B14 |
| **Auth/RBAC/Audit Trail (Shared)** | Login, สิทธิ์ตามบทบาท, บันทึก log เหตุการณ์สำคัญ | FR-SH01, FR-SH02, FR-SH03, FR-SH04, FR-SH05 |
| **Data Retention & Destruction (Shared)** | บริหารวงจรชีวิตข้อมูล (retention/archival) ของเอกสารและบันทึกคุณภาพ และกระบวนการขอทำลายข้อมูลที่ครบกำหนดโดยต้องผ่านการอนุมัติเสมอ (No Auto-Deletion) | FR-A13, FR-B15, FR-SH06 |

#### User Story Summary

| Epic | ID | User Story | Coverage |
| :--- | :--- | :--- | :--- |
| **A — Document Control** | US-A01 | Document Owner สร้างเอกสารฉบับร่างเพื่อเริ่มควบคุมเอกสาร | FR-A01..03; UC-01 |
| | US-A02 | ISO Admin ต้องการ current version เดียวเพื่อกันใช้ผิดฉบับ | FR-A04/A07; UC-04 |
| | US-A03 | End User ค้นหาเอกสารด้วยรหัส/ชื่อเพื่อเข้าถึงเร็ว | FR-A09; UC-06 |
| **B — DAR/Workflow** | US-A04 | Document Owner ส่ง DAR เพื่อขอเปลี่ยนแปลงเอกสาร | FR-A05; UC-02 |
| | US-A05 | Approver อนุมัติ/ปฏิเสธ DAR พร้อม comment | FR-A06; UC-03 |
| **C — Acknowledgement** | US-A06 | End User กดรับทราบเอกสาร | FR-A10/A11; UC-07 |
| | US-A07 | ISO Admin ดูสถานะผู้รับทราบ | FR-A11; UC-07 |
| **F — My Task Checklist** | US-A08 | End User/Document Owner ต้องการเห็นเฉพาะงาน DAR/Acknowledgement ค้างของตนเอง แยกจาก Dashboard รวม | FR-A16; UC-16 |
| **D — Records/Audit/CAR** | US-B01 | ISO User เก็บ record/evidence ผูกกับเอกสาร | FR-B01/B02; UC-08 |
| | US-B02 | Auditor บันทึก finding พร้อม reference/evidence | FR-B03..05; UC-09 |
| | US-B03 | ISO Admin เปิด CAR จาก finding | FR-B06; UC-10 |
| | US-B04 | CAR Owner อัปเดต root cause/action/evidence แล้วส่ง verify | FR-B07/B08; UC-11 |
| | US-B05 | Auditor close/reopen CAR พร้อม audit trail | FR-B10; UC-11 |
| **E — Dashboard** | US-B06 | ISO Admin เห็นจำนวนเอกสารตามสถานะ | FR-B11; UC-12 |
| | US-B07 | ISO Admin เห็น CAR overdue | FR-B09/B13; UC-12 |
| | US-B08 | ผู้บริหารเห็นภาพรวมระบบคุณภาพ | FR-B11..13; UC-12 |

### 2.3 User Classes and Characteristics

| Actor / User Class | เป้าหมายและลักษณะ | Authority Boundary |
| :--- | :--- | :--- |
| **ผู้บริหาร/สำนักงานคณบดี (Sponsor)** | ตัดสินใจเชิงนโยบาย ต้องการเห็นภาพรวมและลดความเสี่ยง | ไม่ปฏิบัติงานในระบบโดยตรง (ดู Dashboard) |
| **ISO/QA Admin (DCC — Document Control Center/Coordinator)** | System owner ฝั่งคุณภาพ ควบคุมเอกสาร, DAR, audit trail, dashboard **และดูแล user/role/config ของระบบ** (รวมหน้าที่ที่เดิมแยกเป็น IT/Admin เข้ามาเป็นผู้จัดการเพียงบทบาทเดียว) | Publish/Obsolete เอกสาร **เฉพาะหลังได้รับอนุมัติจาก Approver แล้วเท่านั้น**, เปิด CAR, ดูภาพรวมทั้งระบบ, จัดการบัญชีผู้ใช้และสิทธิ์พื้นฐาน; **ห้ามทำหน้าที่ Approver เอง (Segregation of Duties ตาม TBD-EFL-04)** |
| **Document Owner** | เจ้าของเอกสาร สร้าง/แก้ไข/ส่ง DAR | แก้ไขเฉพาะเอกสารของตน; ไม่ approve เอง |
| **Approver** | ทบทวน/อนุมัติ/ปฏิเสธเอกสารหรือ DAR เช่น คณบดี หรือ **QMR (ผู้แทนฝ่ายบริหาร)** | อนุมัติได้เฉพาะที่ได้รับมอบหมาย; **แยกขาดจาก ISO Admin/DCC โดยเด็ดขาด — ไม่มีสิทธิ์ Publish เอง** |
| **QMR (ผู้แทนฝ่ายบริหาร / Management Representative)** | อาจทำหน้าที่ Approver ของ DAR ได้ และมีอำนาจพิเศษด้านคุณภาพระดับคณะ | มีสิทธิ์ **Close CAR** ร่วมกับ Lead Auditor (ดู TBD-EFL-07); ไม่ทำหน้าที่ Publish เอกสาร |
| **End User** | ค้นหา อ่าน และรับทราบเอกสาร | อ่าน/รับทราบเท่านั้น; ไม่แก้ไขเอกสาร |
| **Auditor (ผู้ตรวจ/ผู้แจ้งพบข้อบกพร่อง)** | บันทึก audit/finding และตรวจหลักฐาน | สร้าง finding/CAR; มีสิทธิ์ **Verify CAR** เฉพาะกรณีเป็นผู้แจ้งพบข้อบกพร่องนั้นเอง; **ไม่มีสิทธิ์ Close CAR เว้นแต่เป็น Lead Auditor** |
| **Lead Auditor (ผู้ตรวจประเมินหลักประจำรอบ/คณะ)** | บันทึกเป็นหัวหน้าคณะผู้ประเมินใน AuditRound แต่ละรอบ | มีสิทธิ์ **Close CAR** ร่วมกับ QMR (Two-Step Authorization ตาม TBD-EFL-07) |
| **Assistant DCC (ผู้ช่วยเลขานุการคณะกรรมการระบบคุณภาพ)** | ตรวจสอบหน้างานจริงเพื่อยืนยันผลการแก้ไข CAR | มีสิทธิ์ **Verify CAR**; **ไม่มีสิทธิ์ Close CAR** (แยกจากผู้ Close ตาม Segregation of Duties) |
| **CAR Owner** | รับผิดชอบแก้ไข บันทึก RCA/action/evidence | แก้ไขเฉพาะ CAR ที่ตนรับผิดชอบ; **ไม่มีสิทธิ์ Verify/Close CAR ของตนเอง** |
| **Student Group A / Group B (Delivery Team)** | ทีมพัฒนาแต่ละโมดูลตาม Group Split | Group A ห้ามทำ Record/Finding/CAR/Dashboard หลัก; Group B ห้ามทำ Document Master/DAR Approval/Ack Assignment (ดู §2.5 และ Appendix B.5) |

> **ปรับปรุง (v0.3):** เดิม Actor "IT/Admin (Shared)" แยกต่างหากสำหรับดูแล user/role/config ปัจจุบันหน้าที่นี้ถูกรวมเข้ากับ **ISO/QA Admin** เป็นผู้จัดการเพียงบทบาทเดียว ไม่มี Actor แยกสำหรับงาน IT/Admin อีกต่อไป

> **ปรับปรุง (v0.4 — จาก businesspolicies.md):** เพิ่ม Actor ใหม่ 3 บทบาท (QMR, Lead Auditor, Assistant DCC) และเพิ่มคำอธิบาย DCC ให้ ISO/QA Admin ตามมติ TBD-EFL-04 (แยก Approver ออกจาก ISO Admin/DCC โดยเด็ดขาด) และ TBD-EFL-07 (แยกผู้ Verify CAR ออกจากผู้ Close CAR โดยเด็ดขาด) หลักการทั้งสองเป็น **Segregation of Duties (SoD)** — ดู Business Rule ใหม่ที่ §5.5 (BRULE-EFL-11, BRULE-EFL-12)

### 2.4 Operating Environment

- ระบบเป็น **Web Application** — แพลตฟอร์ม client (OS/Browser ขั้นต่ำ) ยังไม่ถูกล็อกในเอกสารต้นทาง (`[TBD]`)
- ผู้ใช้ต้อง Login ผ่านระบบ Auth ภายในโครงการ (JWT-based Middleware ตรวจสิทธิ์ ตาม FR-SH01, ยืนยันแล้วจาก businesspolicies.md) — ไม่มี SSO/LDAP/AD จริงใน Phase 1 (TBD-EFL-01 RESOLVED)
- **Database:** PostgreSQL (ยืนยันแล้ว — ใช้เก็บทั้งข้อมูล transactional ของ Group A/B และ File Path/Metadata ของไฟล์ที่อัปโหลด)
- **File Upload Middleware:** Multer (DiskStorage) — เก็บไฟล์จริงบน Local Server File System (TBD-EFL-03 RESOLVED)
- **Backend Framework:** ยืนยันแล้วจาก usecasespecificationssome.md — **Node.js + Express.js** พร้อม **Prisma ORM** (Authorization Guard ใช้ตรวจสิทธิ์ระดับ endpoint) เชื่อมต่อ PostgreSQL; เวอร์ชันเฉพาะของแต่ละ package ยังไม่ระบุ (`[TBD]`)
- Hosting เฉพาะ (on-premise/cloud) ยังไม่ระบุใน BRD/SRS (`[TBD]`)
- ต้องรองรับ seed data จากเอกสารจริง (Master List, DAR Register ตัวอย่าง QM/QP/FM) — ผู้ใช้ทดสอบ (pilot) จำลองจาก Local PostgreSQL Users Table ครอบคลุม QMR, คณบดี, SOP Owner แต่ละแผนก

### 2.5 Design and Implementation Constraints

| Constraint | ผลต่อการออกแบบ/พัฒนา |
| :--- | :--- |
| **ส่งมอบภายใน 3 เดือน โดยนักศึกษา 2 กลุ่ม กลุ่มละ 2 คน** | ต้องคุม scope ตาม Must/Should เท่านั้น ไม่เพิ่ม feature นอกเอกสาร |
| **Group Ownership Boundary** (ดูรายละเอียดเต็มใน Appendix B.5) | Document Master/DAR/Ack = Group A เท่านั้น; Records/Finding/CAR/Dashboard หลัก = Group B เท่านั้น |
| **Internal Interface Contract ต้องนิยามก่อน ERD** (§3.3) | ห้าม Group ใดออกแบบ schema ที่ทับซ้อนกับอีกฝั่งก่อนตกลง contract; เนื่องจากใช้ backend เดียวกัน การเรียกข้ามโมดูลต้องผ่าน internal interface ที่ตกลงกันไว้ ไม่เรียกตรงเข้าตาราง/ข้อมูลภายในของอีกฝั่ง |
| **NFR-05 Module Separation** | โค้ดต้องแยกตาม Group A/B และแยกชั้น business logic |
| **NFR-06 Interoperability** | Group B ต้องใช้ข้อมูล document ผ่าน contract ไม่ duplicate schema |
| **Dashboard ห้ามใช้ mock data ใน final demo** | ต้อง integrate ข้อมูลจริงจาก Group A ก่อน demo (Business Rule ข้อ 8, §5.5) |
| **Out of scope: SSO/LDAP จริง, Email/LINE notification จริง, OCR/scanner, Mobile native app** | ไม่ต้องออกแบบ/พัฒนาในเวอร์ชันนี้ |
| **Single-level approval เท่านั้นในรอบ 3 เดือน** | ห้ามออกแบบ multi-level approval ซับซ้อนใน Phase 1 |

### 2.6 User Documentation

ตาม Definition of Done (§6.3 / NFR-10) ต้องมี: README, Test Cases, Internal Interface Contract (เดิมเรียก API Contract ในเอกสารต้นทาง — ปรับความหมายเป็น contract ระดับโมดูลภายใน backend เดียวกัน), ERD, และคู่มือ Demo — รูปแบบ/ช่องทางส่งมอบยังเป็น Design/Delivery Decision (`[TBD]`)

### 2.7 Assumptions and Dependencies

| Type | รายการ | สถานะ/ผลกระทบ |
| :--- | :--- | :--- |
| **Dependency** | มี Master List และ DAR Register ตัวอย่างจากเอกสารจริงสำหรับ seed data | จำเป็นต่อ FR-SH05 |
| **Dependency** | Group A module ต้อง expose Document/Acknowledgement Summary ผ่าน Internal Interface ให้ Group B module เรียกใช้ ก่อน Dashboard ทำงานได้จริง | จำเป็นต่อ FR-A12, FR-B11/B12 |
| **Dependency** | Group B module ต้อง expose Record/Finding/CAR count ผ่าน Internal Interface ให้ Group A module เรียกใช้ (สำหรับ detail/traceability) | ตาม §3.3 Internal Module Interface |
| **Assumption (RESOLVED)** | ผู้ใช้ทดสอบ (pilot) เป็นบัญชีที่ seed ขึ้นเองใน Local PostgreSQL Users Table ไม่ใช่ระบบบัญชีมหาวิทยาลัยจริง; ปิดใช้งานผู้ใช้ด้วย `isActive: false` แทน Hard Delete | ยืนยันแล้ว — TBD-EFL-01 RESOLVED (businesspolicies.md) |
| **Assumption** | Approval ใน Phase 1 เป็นแบบ single-level | ตาม Business Rule ข้อ 10 |
| **Policy (RESOLVED)** | Verify CAR โดย Assistant DCC/Auditor ผู้แจ้งพบ; Close CAR โดย QMR/Lead Auditor เท่านั้น (Two-Step Authorization) | ยืนยันแล้ว — TBD-EFL-07 RESOLVED (businesspolicies.md) |
| **Policy (RESOLVED)** | Document code unique บน Document Master; ผูกกับ DocumentRevision แบบ One-to-Many; Published ได้เพียง 1 revision ต่อรหัสเอกสาร ณ เวลาใดเวลาหนึ่ง | ยืนยันแล้ว — TBD-EFL-02 RESOLVED (businesspolicies.md) |

---

## 3. External Interface Requirements

### 3.1 User Interfaces

กำหนด Logical Interface Characteristics ตาม Deliverable ที่ระบุในเอกสาร SE02 Mapping โดยไม่ล็อก Wireframe/Component Library/เทคโนโลยี UI

| Logical View | ข้อมูล/Action ที่ต้องรองรับ | Owner | Traceability |
| :--- | :--- | :--- | :--- |
| **Document List / Detail** | ค้นหา/กรอง/ดูรายละเอียดเอกสารและ current version | A | FR-A09; UC-06 |
| **Create/Edit Document** | กรอก metadata, upload/download ไฟล์ | A | FR-A01..03; UC-01 |
| **DAR List / Form** | สร้าง/ดูสถานะคำขอแก้ไขเอกสาร | A | FR-A05; UC-02 |
| **Approval Queue** | ทบทวน/อนุมัติ/ปฏิเสธพร้อม comment | A | FR-A06; UC-03 |
| **Ack Tracking** | มอบหมายและติดตามการรับทราบ | A | FR-A10/A11; UC-07 |
| **Record List / Form** | สร้าง/ค้นหา record พร้อมไฟล์แนบและอ้างอิงเอกสาร | B | FR-B01/B02; UC-08 |
| **Audit / Finding Form** | สร้าง audit round และบันทึก finding | B | FR-B03..05; UC-09 |
| **CAR List / Detail** | เปิด/อัปเดต/verify/close CAR | B | FR-B06..10; UC-10/11 |
| **Overdue Monitor** | รายการ CAR ที่เลยกำหนด | B | FR-B09; UC-11/12 |
| **Operational Dashboard** | Cards/Charts/Recent List/Overdue จากข้อมูลจริง | B | FR-B11..13; UC-12 |
| **Audit Trail View** | ประวัติ who/what/when ของ event สำคัญ | Shared | FR-SH04; UC-14 |

> **UI wording checkpoint:** `[TBD]` — ต้องกำหนดถ้อยคำที่ใช้กับสถานะเอกสาร (เช่น "Published/Current" ต้องไม่ปะปนกับ "Approved") ให้สอดคล้องกันทั้ง Group A และ Group B

### 3.2 Hardware Interfaces

ไม่มี Hardware Interface เฉพาะ — ระบบใช้งานผ่าน Web Browser มาตรฐาน อุปกรณ์สแกน/OCR อยู่นอกขอบเขต Phase 1 (ดู §1.4 Out of Scope)

### 3.3 Software Interfaces

#### 3.3.1 Internal Module Interface (Group A ↔ Group B)

> **ปรับปรุง (v0.3):** Group A และ Group B **ไม่ได้สื่อสารกันผ่าน network API** เนื่องจากทั้งสองโมดูลถูกออกแบบให้รวมอยู่บน **backend เดียวกัน (single shared backend)** การส่งข้อมูลระหว่างกันจึงเป็นการเรียกใช้ฟังก์ชัน/service ภายในกระบวนการเดียวกัน (in-process function call / internal service call) ไม่ใช่การเรียกผ่าน HTTP endpoint ข้าม service ตารางด้านล่างจึงอธิบายเป็น "Internal Interface" (สิ่งที่โมดูลหนึ่งต้องเรียกใช้จากอีกโมดูล) แทนคำว่า "Endpoint"

| Direction | Internal Interface / ข้อมูลที่ส่งให้กัน | Purpose |
| :--- | :--- | :--- |
| **A → B** | Document summary — จำนวนเอกสารแยกตามสถานะ (Draft/Review/Approved/Published/Obsolete) | Dashboard เอกสารตาม status/type (FR-B11) |
| **A → B** | Published document list | เลือก document reference ใน Record/Finding (FR-B02, FR-B05) |
| **A → B** | Acknowledgement summary — อัตราการรับทราบ (Acknowledgement Rate) เทียบกับกลุ่มเป้าหมายต่อเวอร์ชันเอกสาร | Dashboard ack rate (FR-B12) |
| **A → B** | Document detail by id | แสดง reference ใน audit/CAR |
| **B → A** | Record count by document | แสดงจำนวนหลักฐานที่ผูกกับเอกสาร (ใน Document Detail ของ A) |
| **B → A** | Finding count by document | แสดงเอกสารที่มี finding |
| **B → A** | CAR count/status by document | ใช้ใน detail หรือ traceability |

**Shared IDs ที่ต้องใช้ร่วมกัน:** `user_id`, `role_id`, `department_id`, `document_id`, `document_code`, `version_id`, `file_id`

> เนื่องจากเป็น backend เดียวกัน รูปแบบที่ต้องนิยามให้ชัดคือ **Internal Interface Contract** ระดับโค้ด เช่น function signature, shared service/repository interface หรือ internal data transfer object (DTO) ระหว่าง module ของ Group A และ Group B (ไม่ใช่ REST/JSON API Spec ระหว่าง service อีกต่อไป) — รายละเอียดยังไม่ถูกกำหนดเป็นทางการในเอกสารต้นทาง ต้องยืนยันก่อนเริ่มพัฒนา (`TBD-EFL-08`)

#### 3.3.2 External Software Interfaces

| External Interface | Input to System | Output from System | Constraint / TBD |
| :--- | :--- | :--- | :--- |
| **Authentication Service** | Credential (username/password) | JWT token (session) | FR-SH01; **RESOLVED (TBD-EFL-01):** ใช้ Local PostgreSQL Users Table ร่วมกันระหว่าง Group A/B ตรวจสิทธิ์ผ่าน JWT-based Middleware ไม่เชื่อมต่อ AD/LDAP/HR System ของมหาวิทยาลัยใน Phase 1 |
| **File Storage** | ไฟล์เอกสาร/หลักฐาน (PDF) | Path/Metadata (บันทึกใน PostgreSQL) | **RESOLVED (TBD-EFL-03):** Local Server File System ผ่าน Multer DiskStorage — ออกแบบให้ย้ายไป Amazon S3 หรือ Private Object Storage ได้ใน Phase 3 โดยไม่กระทบ schema ฐานข้อมูล |

### 3.4 Communications Interfaces

- ทุก Action ที่มี Authority ต้องรักษา Authenticated Identity และ Role Context (FR-SH01/FR-SH02)
- Event สำคัญ (approve/reject/publish/obsolete/acknowledge/CAR change) ต้องบันทึก Audit Trail (FR-SH04, NFR-02)
- Protocol การสื่อสาร, encryption baseline, retry policy และ delivery guarantee ยังเป็น `TBD` (ไม่มี Email/LINE notification จริงใน Phase 1 ตาม §1.4)

---

## 4. System Features

*(ภาพที่ 2 — Use Case Diagram: UC-01..UC-16 แบ่งตาม Group A/B/Shared — TBD ต้องวาดจากตาราง Use Case Summary ด้านล่าง)*

### Use Case Summary

| UC-ID | Use Case | Primary Actor | Owner Group | Related FR |
| :--- | :--- | :--- | :--- | :--- |
| UC-01 | Create Document Draft | Document Owner | A | FR-A01..A03 |
| UC-02 | Submit DAR | Document Owner | A | FR-A05 |
| UC-03 | Review/Approve/Reject DAR | Approver | A | FR-A06 |
| UC-04 | Publish Current Version | ISO Admin | A | FR-A04, A07, A08 |
| UC-05 | Obsolete Document | ISO Admin | A | FR-A04, A07, A08 |
| UC-06 | Search/View Document | End User | A | FR-A09 |
| UC-07 | Acknowledge Document | End User | A | FR-A10, A11 |
| UC-08 | Create Record/Evidence | ISO User/CAR Owner | B | FR-B01, B02, B16, B17 |
| UC-09 | Create Finding (Audit / Non-Audit Source) | Auditor / ISO Admin (DCC) | B | FR-B03..B05 |
| UC-10 | Open CAR | ISO Admin/Auditor | B | FR-B06 |
| UC-11 | Update/Verify/Close CAR | CAR Owner/Auditor | B | FR-B07..B10 |
| UC-12 | View Operational Dashboard | ISO Admin/Manager | B | FR-B11..B13 |
| UC-13 | Export Summary | ISO Admin/Auditor | B | FR-B14 |
| UC-14 | View Audit Trail | ISO Admin/Auditor | Shared | FR-SH04 |
| UC-15 | Data Retention & Destruction Management | ISO Admin (DCC) / QMR | Shared | FR-A13, FR-B15, FR-SH06 |
| UC-16 | My Task Checklist | End User/Document Owner/Approver | A | FR-A16 |

> ระบบมีแนวคิด **State Lifecycle** สำหรับ Document / DAR / CAR (Draft → ... → Published/Closed) ตารางสถานะเต็มอยู่ที่ **Appendix B.4 State Semantics** — ทุก Use Case ด้านล่างอ้างอิงสถานะเหล่านี้

### 4.1 Create Document Draft — UC-01

| Priority | Source / Coverage |
| :--- | :--- |
| **Must** | US-A01; FR-A01..A03; AC-01 |

#### Use Case Specification

| Field | รายละเอียด |
| :--- | :--- |
| **Goal** | สร้างเอกสารฉบับร่างพร้อม metadata และไฟล์แนบ เพื่อเริ่มกระบวนการควบคุมเอกสาร |
| **Primary Actor** | Document Owner |
| **Supporting Actors** | ISO/QA Admin (อาจสร้างแทนได้) |
| **Trigger** | ต้องการจัดทำเอกสารคุณภาพฉบับใหม่ |
| **Preconditions** | ผู้ใช้ Login และมี role Owner/Admin |
| **Success Postconditions** | Document status = Draft และมี audit trail |

#### Scenarios

* **Main Success Scenario:**
  1. เปิดหน้า Create Document
  2. กรอก metadata (document_code, title, type, department, owner)
  3. Upload ไฟล์เอกสาร
  4. บันทึกเป็น Draft
* **Alternate Flows:**
  * **A1 (metadata ไม่ครบ):** ระบบแจ้ง validation error และไม่บันทึก
  * **A2 (คัดลอก Metadata จากเอกสารรุ่นเดิมเพื่อสร้างรุ่นแก้ไข — Clone Metadata for Revision Up):** หาก Document Owner ได้รับมอบหมายให้แก้ไขเอกสาร Published รุ่นเดิม (เช่น Rev.00 → Rev.01) ผู้ใช้เลือกเอกสาร Published รหัสเดิมจากคลังระบบและกดคำสั่ง "สร้างเอกสารรุ่นแก้ไขถัดไป" ระบบดึง Metadata หลัก (รหัส, ชื่อเรื่อง, ประเภท, ฝ่ายงาน) มากรอกอัตโนมัติในสถานะ Draft พร้อมคำนวณเลขเวอร์ชันถัดไป (current_rev + 1) ให้อัตโนมัติ ผู้ใช้ตรวจสอบ แนบไฟล์ฉบับร่างใหม่ และบันทึก
* **Exception Flows:**
  * **E1 (ไฟล์แนบผิดประเภท — MIME-Type Mismatch):** หากผู้ใช้อัปโหลดไฟล์ที่ไม่ใช่ PDF สำหรับเอกสารควบคุม QM/QP/WI/SD ระบบ (Multer Middleware + Storage Filter) ตรวจ MIME-Type แล้วปฏิเสธการบันทึกไฟล์ พร้อมข้อความ "เอกสารคุณภาพระดับ QM/QP/WI บังคับให้ใช้เฉพาะไฟล์ PDF เท่านั้น" — บังคับใช้ BRULE-EFL-19
  * **E2 (รหัสเอกสารซ้ำซ้อน — Unique Constraint Violation):** หากผู้ใช้กรอก document_code ที่ซ้ำกับ Document Master เดิม ระบบตรวจพบ Unique Key Constraint Violation ยกเลิกธุรกรรม และแจ้งให้ยื่น DAR ขอแก้ไขรายการเดิมแทนการสร้างใหม่
  * **E3 (ไฟล์เกินขนาดสูงสุดตามประเภทเอกสาร — File Size Limit Exceeded):** ✅ หากไฟล์ที่อัปโหลดมีขนาดเกินเกณฑ์สูงสุดตามประเภทเอกสาร (**QM ≤ 22MB, QP ≤ 12MB, SD ≤ 104MB, FM ≤ 4MB**) ระบบปฏิเสธการอัปโหลดทันที พร้อมแจ้งเกณฑ์ขนาดไฟล์สูงสุดของประเภทเอกสารนั้นให้ผู้ใช้ทราบ — บังคับใช้ **BRULE-EFL-27** (มติผู้ใช้/Product Owner อ้างอิงข้อมูลขนาดไฟล์จริงปัจจุบัน, REF-15) — กรณี **WI** ยังไม่มีเกณฑ์กำหนด เนื่องจากยังไม่มีไฟล์จริง ณ ปัจจุบัน (ดู Glossary)

#### Requirements & Verification

| ID | Requirement | Priority | Verification |
| :--- | :--- | :--- | :--- |
| **FR-A01** | ระบบต้องสร้าง แก้ไข แสดง และค้นหา document master ได้ | Must | AC-01 |
| **FR-A02** | ระบบต้องเก็บ metadata: document_code, title, type, department, owner, approver, version, status | Must | AC-01 |
| **FR-A03** | ระบบต้อง upload/download ไฟล์เอกสารได้ พร้อมตรวจสอบขนาดไฟล์สูงสุดตามประเภทเอกสาร (BRULE-EFL-27) | Must | AC-01; E3 ครอบคลุมกรณีไฟล์เกินขนาด |

---

### 4.2 Submit DAR — UC-02

| Priority | Source / Coverage |
| :--- | :--- |
| **Must** | US-A04; FR-A05; AC-02 |

#### Use Case Specification

| Field | รายละเอียด |
| :--- | :--- |
| **Goal** | สร้างคำขอแก้ไขเอกสาร (DAR) พร้อมประเภทการดำเนินการและเหตุผล |
| **Primary Actor** | Document Owner |
| **Trigger** | ต้องการขอ new/revise/obsolete เอกสาร |
| **Preconditions** | Document อยู่ใน Draft หรือมีคำขอ revise/obsolete |
| **Success Postconditions** | DAR status = Submitted, Document status = Review |

#### Scenarios

* **Main Success Scenario:**
  1. เปิด Document Detail
  2. สร้าง DAR
  3. เลือก action type (new/revise/obsolete)
  4. ระบุ reason และ approver
  5. Submit
* **Alternate Flows:**
  * **A1 (DAR ประเภทขอยกเลิกเอกสาร — Cancellation Request):** หากผู้ใช้เลือกประเภทคำร้องเป็น "ขอยกเลิกเอกสาร (CANCEL)" ระบบไม่บังคับแนบไฟล์ใหม่ แต่บังคับให้กรอกคำอธิบาย/เหตุผลความจำเป็นแทน แล้วบันทึกเข้าสู่สถานะรอทวนสอบ
  * **A2 (คำขอสำเนาไม่ควบคุม — Request Uncontrolled Copy):** ✅ หากผู้ที่ไม่ได้อยู่ในบัญชี Distribution List ของเอกสารนั้น (เช่น ผู้ตรวจประเมินระบบบริหารคุณภาพจากภายนอก) ต้องการใช้/รับสำเนาเอกสาร ผู้ใช้ (มักเป็น DCC) เลือกประเภทคำร้องที่ 4 "ขอสำเนาไม่ควบคุม (REQUEST_UNCONTROLLED)" ระบุชื่อผู้ขอและวัตถุประสงค์แทนเหตุผลแก้ไขเอกสาร ระบบบันทึกเป็นรายการคำขอเพื่อการตรวจสอบย้อนกลับ **โดยไม่ผ่านขั้นตอนอนุมัติแบบ DAR ปกติ** เนื่องจากเป็นงานธุรการโดยตรงของ DCC (QP-2301-0107 ข้อ 6.5.1) — ไม่กระทบบัญชี Distribution List (ซึ่งคุมเฉพาะผู้ถือครองสำเนาควบคุมตาม FR-A14) — บังคับใช้ปรับปรุง **FR-A05**
* **Exception Flows:**
  * **E1 (ไม่มีไฟล์แนบสำหรับคำขอจัดทำ/แก้ไขใหม่ — Missing Attachment Check):** หากเลือกประเภท CREATE/AMEND แต่ไม่มีไฟล์แนบ ระบบปฏิเสธการ submit พร้อมข้อความแจ้งเตือน และดีดกลับสู่สถานะ Draft
  * **E2 (ไม่ได้ระบุผู้อนุมัติ/ผู้ทบทวน — Missing Sign-off Path):** หากไม่ระบุ reviewer_id/approver_id ระบบระงับการ submit และแจ้งให้ระบุผู้รับผิดชอบ (คณบดี/รองคณบดี หรือ QMR) ตามระเบียบควบคุมเอกสาร (ไม่บังคับใช้กับ A2 REQUEST_UNCONTROLLED ซึ่งไม่มีขั้นตอนอนุมัติ)

#### Requirements & Verification

| ID | Requirement | Priority | Verification |
| :--- | :--- | :--- | :--- |
| **FR-A05** | ระบบต้องสร้าง DAR พร้อม action type ครบ **4 ประเภท** (`CREATE` / `AMEND` / `CANCEL` / `REQUEST_UNCONTROLLED`) และ reason ได้ — ปรับปรุงตามมติผู้ใช้อ้างอิง QP-2301-0107 ข้อ 6.5.1 (REF-13) แทนที่แนวทางเดิมที่เคยพิจารณาเพิ่มประเภท hold/cancel-hold | Must | AC-02; Approver เห็นใน approval queue (ยกเว้น REQUEST_UNCONTROLLED ไม่เข้า queue) |

---

### 4.3 Review / Approve / Reject DAR — UC-03

| Priority | Source / Coverage |
| :--- | :--- |
| **Must** | US-A05; FR-A06; AC-02 |

#### Use Case Specification

| Field | รายละเอียด |
| :--- | :--- |
| **Goal** | ให้ Approver ทบทวนและตัดสินใจต่อ DAR/เอกสารพร้อมบันทึกเหตุผล |
| **Primary Actor** | Approver (เช่น คณบดี หรือ QMR — **แยกขาดจาก ISO Admin/DCC โดยเด็ดขาดตาม TBD-EFL-04 RESOLVED, Segregation of Duties**) |
| **Preconditions** | มี DAR ในสถานะ Submitted ใน approval queue |
| **Success Postconditions** | Approve → Document status = Approved; Reject → กลับสู่ Draft/Rejected |

#### Scenarios

* **Main Success Scenario:**
  1. เปิด approval queue
  2. อ่าน document/DAR
  3. Approve หรือ Reject พร้อม comment
* **Alternate Flows:**
  * **A1 (ปฏิเสธคำขอพร้อมข้อคิดเห็น — Reject with Feedback):** หาก Approver พบข้อบกพร่อง/ไม่สอดคล้อง สามารถลงนาม "ปฏิเสธคำร้อง (Reject)" โดยระบบบังคับให้กรอกเหตุผลในฟิลด์ comment (ห้ามเว้นว่าง) แล้วเปลี่ยนสถานะ DAR เป็น Rejected และ Document กลับสู่ Draft พร้อมแจ้งเตือน Document Owner
* **Exception Flows:**
  * **E1 (อนุมัติซ้ำซ้อนจากผู้อนุมัติหลายคนพร้อมกัน — Concurrency Collision):** หาก DAR รายการเดียวกันถูกอนุมัติ/ปฏิเสธไปแล้ว แต่ Approver อีกคนพยายามบันทึกซ้ำ ระบบตรวจสอบด้วย Optimistic Locking (PostgreSQL/Prisma) และปฏิเสธการบันทึกซ้ำ พร้อมแจ้งให้รีเฟรชคิวงาน — บังคับใช้ BRULE-EFL-20

#### Requirements & Verification

| ID | Requirement | Priority | Verification |
| :--- | :--- | :--- | :--- |
| **FR-A06** | ระบบต้องมี approval queue และ approve/reject พร้อม comment | Must | AC-02; comment และ approver/time ถูกบันทึก |

---

### 4.4 Publish Current Version — UC-04

| Priority | Source / Coverage |
| :--- | :--- |
| **Must** | US-A02; FR-A04, A07, A08; AC-03 |

#### Use Case Specification

| Field | รายละเอียด |
| :--- | :--- |
| **Goal** | Publish เอกสารที่ Approved แล้วเป็น current version เดียวของ document code นั้น |
| **Primary Actor** | ISO/QA Admin (DCC) — **ทำหน้าที่ธุรการ Publish เท่านั้น หลังจาก Approver อนุมัติแล้ว ไม่มีสิทธิ์ approve เอง (TBD-EFL-04 RESOLVED)** |
| **Preconditions** | Document status = Approved |
| **Success Postconditions** | DocumentRevision (เดิมเรียก DocumentVersion) สถานะ Published (current) มีได้เพียง 1 revision ต่อ document_code ณ เวลาใดเวลาหนึ่ง; revision ก่อนหน้าทั้งหมดถูกตั้งเป็น Obsolete โดยอัตโนมัติ (TBD-EFL-02 RESOLVED) |

#### Scenarios

* **Main Success Scenario:**
  1. เลือก approved document
  2. กำหนด effective date
  3. Publish
  4. ระบบปิด current version เดิม
* **Alternate Flows:**
  * **A1 (ตั้งวันบังคับใช้ล่วงหน้า — Future Effective Date Publishing):** ISO/QA Admin สามารถกำหนด `published_at` เป็นวันที่ในอนาคตได้ ระบบซ่อนเอกสารจาก End User ไว้ชั่วคราวจนถึงวันที่กำหนด แล้วจึงเปลี่ยนสถานะเป็น Published และตั้ง revision เดิมเป็น Obsolete โดยอัตโนมัติ (ต้องมีกลไกตรวจสอบตามรอบเวลา เช่น Scheduled Job)
* **Exception Flows:**
  * **E1 (ไฟล์ต้นฉบับสูญหายบน Server — Missing PDF Binary Check):** ก่อน publish ระบบตรวจสอบว่าไฟล์ยังอยู่จริงตาม storage_path หากไม่พบไฟล์ ระบบปฏิเสธการ publish และแจ้ง DCC ให้อัปโหลดไฟล์ใหม่

#### Requirements & Verification

| ID | Requirement | Priority | Verification |
| :--- | :--- | :--- | :--- |
| **FR-A04** | ระบบต้องควบคุมสถานะ Draft/Review/Approved/Published/Obsolete | Must | AC-03/AC-04 |
| **FR-A07** | ระบบต้อง publish current version ได้เพียงหนึ่งฉบับ | Must | AC-03; มี current published version เดียวต่อ document_code |
| **FR-A08** | ระบบต้องบันทึก revision history | Must | AC-10 |

---

### 4.5 Obsolete Document — UC-05

| Priority | Source / Coverage |
| :--- | :--- |
| **Must** | FR-A04, A07, A08; AC-04 |

#### Use Case Specification

| Field | รายละเอียด |
| :--- | :--- |
| **Goal** | ISO/QA Admin (DCC) ปรับปรุงสถานะเอกสารจาก Published ให้เป็น Obsolete เพื่อป้องกันบุคลากรทั่วไปนำเอกสารล้าสมัยไปใช้งาน |
| **Primary Actor** | ISO/QA Admin (DCC) |
| **Preconditions** | (1) ผู้ใช้ผ่าน Authentication และมีสิทธิ์บทบาท ISO/QA Admin (DCC); (2) เอกสารเป้าหมายมีสถานะ Published อยู่ในปัจจุบัน |
| **Success Postconditions** | เอกสารเป้าหมายเปลี่ยนสถานะเป็น Obsolete สมบูรณ์ในฐานข้อมูล มีไฟล์ต้นฉบับจัดเก็บแยกไว้บน Server; End User ไม่สามารถสืบค้น/มองเห็นเอกสารนี้ได้อีกต่อไป |

#### Scenarios

* **Main Success Scenario:**
  1. ISO/QA Admin เปิดหน้า "บริหารจัดการสถานะเอกสาร Master" และระบุเงื่อนไขค้นหาเพื่อเรียกดูเอกสารฉบับปัจจุบัน
  2. ระบบสืบค้นฐานข้อมูลและแสดงรายละเอียดเอกสาร (รหัส, ชื่อ, ประเภท, เวอร์ชันปัจจุบัน, สถานะ) — FR-A02
  3. ISO/QA Admin เลือกคำสั่ง "ปรับปรุงสถานะเป็น Obsolete (ซ่อนจากการใช้งาน)" ของเอกสารเป้าหมาย
  4. ระบบตรวจสอบสิทธิ์การทำธุรกรรม (RBAC Token Verification)
  5. ระบบบันทึกเปลี่ยนฟิลด์ `status` ของ revision นั้นเป็น "Obsolete" (Soft Delete — เก็บข้อมูลทางกายภาพไว้ทวนสอบย้อนกลับ)
  6. ระบบตัดการมองเห็นไฟล์เอกสาร revision นั้นออกจากผลค้นหาของ End User แบบเรียลไทม์
  7. ระบบบันทึกรหัสธุรกรรม, ผู้กระทำ, วันเวลา และเหตุการณ์ลงใน Audit Trail — NFR-02 (Auditability)
* **Alternate Flows:**
  * **A1 (Automatic Version Obsolescence — เปลี่ยนสถานะอัตโนมัติเมื่อ Publish รุ่นใหม่):** เมื่อ Approver อนุมัติ DAR เวอร์ชันใหม่แล้ว และ ISO/QA Admin กด "Publish เอกสารเวอร์ชันปรับปรุงใหม่" ระบบตรวจจับรหัสเอกสารเดียวกันที่เป็นเวอร์ชันก่อนหน้า แล้วปรับสถานะเป็น Obsolete โดยอัตโนมัติ — คงสถานะ Published ได้เพียง 1 revision ต่อรหัสเอกสาร ณ เวลาใดเวลาหนึ่งเสมอ (FR-A07; สอดคล้องกับ TBD-EFL-02 RESOLVED)
  * **A2 (Auto-Withdraw บัญชีผู้ถือครองสำเนาควบคุม — Distribution List Withdrawal):** ✅ เมื่อเอกสารเปลี่ยนสถานะเป็น Obsolete (ไม่ว่าจากขั้นตอน Main Success Scenario หรือจาก A1) ระบบปรับสถานะทุกรายการใน **DistributionList** ของ revision นั้นจาก `Active` เป็น `Withdrawn` โดยอัตโนมัติ เพื่อสะท้อนว่าสำเนาที่ถือครองอยู่ล้าสมัยแล้วและต้องเรียกคืน/แจ้งผู้ถือครองตามระเบียบควบคุมเอกสาร — บังคับใช้ **BRULE-EFL-23** (FR-A14)
* **Exception Flows:**
  * **E1 (มี DAR/วงรอบทบทวนค้างอยู่):** ระบบตรวจพบว่ารหัสเอกสารนี้มีคำขอในสถานะ Review หรือ Approved ที่ยังไม่ได้ Publish ค้างอยู่ ระบบยกเลิกขั้นตอน แสดงข้อความ "ไม่สามารถทำรายการได้เนื่องจากมีคำขอเปลี่ยนแปลง (DAR) รอการเผยแพร่ค้างอยู่ในระบบ" และกลับสู่เมนูสืบค้นหลัก

#### Requirements & Verification

| ID | Requirement | Priority | Verification |
| :--- | :--- | :--- | :--- |
| **FR-A04** | ระบบต้องควบคุมสถานะ Draft/Review/Approved/Published/Obsolete | Must | AC-04 |
| **FR-A07** | ระบบต้อง publish current version ได้เพียงหนึ่งฉบับ (และตั้ง Obsolete รุ่นก่อนหน้าอัตโนมัติ) | Must | AC-04 |
| **FR-A08** | ระบบต้องบันทึก revision history / Audit Trail ของการเปลี่ยนสถานะ | Must | AC-04; AC-10 |

> **แหล่งที่มา:** usecasespecificationssome.md (UC-A05) อ้างอิง SE02 Group A หน้า 10, 29 และ QP-2301-0107 ข้อ 6.5.4 "การยกเลิกเอกสาร" — ระบุ NFR-A01 (RBAC) ในเอกสารต้นทาง ซึ่งตรงกับ **NFR-01** ในเอกสารฉบับนี้ (ดู §5.3)

---

### 4.6 Search / View Document — UC-06

| Priority | Source / Coverage |
| :--- | :--- |
| **Must** | US-A03; FR-A09 |

#### Use Case Specification

| Field | รายละเอียด |
| :--- | :--- |
| **Goal** | ค้นหาและเปิดดูเอกสารด้วยรหัส/ชื่อ/ประเภท/แผนก เพื่อเข้าถึงเอกสารฉบับใช้งานล่าสุดได้ถูกต้องและรวดเร็ว |
| **Primary Actor** | End User (บุคลากรทั่วไป) — รวมถึง Document Owner, Approver และ ISO/QA Admin ด้วยระดับสิทธิ์ที่ต่างกัน (ดู Alternate Flows) |
| **Preconditions** | ผู้ใช้ระบุสิทธิ์และผ่านการ Login เข้าระบบ E-Filing สำเร็จ |
| **Success Postconditions** | ผู้ใช้สืบค้นและเข้าถึงเอกสารฉบับบังคับใช้ล่าสุดได้สำเร็จภายในไม่เกิน 3 คลิกจากหน้าหลัก (Usability — ตรงกับ **NFR-03** ในเอกสารฉบับนี้) |

#### Scenarios

* **Main Success Scenario (กรณี End User):**
  1. ผู้ใช้เข้าสู่เมนู "สืบค้นข้อมูลเอกสารคุณภาพกลาง (Document Directory)"
  2. ผู้ใช้ระบุคำค้นหา: รหัสเอกสาร, ชื่อเอกสาร, ประเภทเอกสาร หรือแผนกเจ้าของข้อมูล — FR-A09
  3. ระบบกรองสิทธิ์ผู้ใช้ (RBAC Context Guard) และแสดงผลเฉพาะเอกสารที่มีสถานะ **Published** เท่านั้น — ตรงกับ **NFR-01** (RBAC) ในเอกสารฉบับนี้
  4. ผู้ใช้เลือกเอกสารที่ต้องการจากรายการผลลัพธ์
  5. ระบบเชื่อมโยง Middleware ดึง path ไฟล์เอกสาร PDF จาก Local Server File System (Multer DiskStorage — ตรงกับ TBD-EFL-03 RESOLVED)
  6. ระบบแสดงผลพรีวิวเนื้อหาเอกสารแบบอ่านออนไลน์บนเบราว์เซอร์ พร้อม Metadata ที่เกี่ยวข้อง — FR-A03
  7. ระบบแสดงป้ายกำกับ/ลายน้ำ **"สำเนาไม่ควบคุม / Uncontrolled Copy"** กำกับบนหน้าพรีวิว ไฟล์ที่ดาวน์โหลด และผลพิมพ์ทุกครั้ง เนื่องจากไฟล์อิเล็กทรอนิกส์บนแพลตฟอร์มออนไลน์จัดเป็น **Uncontrolled Document** ตาม QP-2301-0107 ข้อ 6.6 (สำเนาควบคุมตัวจริงคือเอกสารกระดาษ/บัญชีผู้ถือครองที่ควบคุมโดย DCC — ดู DistributionList, FR-A14) — บังคับใช้ **BRULE-EFL-24** (FR-A15)
* **Alternate Flows:**
  * **A1 (สิทธิ์ระดับบริหาร — ISO/QA Admin/DCC หรือ Approver):** ในขั้นตอนที่ 3 หาก Actor คือ ISO/QA Admin หรือ Approver ระบบปลดล็อกตัวกรองสถานะ อนุญาตให้สืบค้นเอกสารในสถานะอื่น (Draft, Review, Approved, Obsolete) เพื่อวัตถุประสงค์ตรวจติดตาม
  * **A2 (Document Owner ดู Draft ของตนเอง):** ในขั้นตอนที่ 3 หากผู้สืบค้นเป็น Document Owner ระบบอนุญาตให้เห็นร่างเอกสาร (Draft) ที่ผูกกับ `creator_id` เป็นตนเองเพิ่มเติม นอกเหนือจากไฟล์ Published ปกติ
* **Exception Flows:**
  * **E1 (ไม่พบข้อมูล):** พารามิเตอร์ค้นหาไม่ตรงกับ Metadata ใด ๆ ในฐานข้อมูล ระบบแสดง "ไม่พบข้อมูลเอกสารคุณภาพตรงตามเกณฑ์ที่ระบุ กรุณาตรวจสอบคำค้นหาใหม่อีกครั้ง"
  * **E2 (ไฟล์เอกสารเสียหาย/สูญหายเชิงกายภาพ):** ระบบพบระเบียนในฐานข้อมูลแต่โหลดไฟล์จริงจาก Storage ปลายทางไม่ได้ ระบบบล็อกพรีวิวและแจ้ง "เกิดข้อผิดพลาดเชิงโครงสร้างระบบ: ไฟล์คู่มือบน Server เสียหาย กรุณาแจ้งผู้ควบคุมระบบ (DCC) เพื่อปรับปรุงไฟล์ใหม่"

#### Requirements & Verification

| ID | Requirement | Priority | Verification |
| :--- | :--- | :--- | :--- |
| **FR-A03** | ระบบต้อง upload/download และแสดงผลพรีวิวไฟล์เอกสารได้ | Must | E2 ครอบคลุมกรณีไฟล์เสีย/หาย |
| **FR-A09** | ระบบต้องค้นหาด้วย code/title/type/department ได้ | Must | AC สอดคล้องกับ US-A03 |
| **FR-A15** | ระบบต้องแสดงป้ายกำกับ/ลายน้ำ "สำเนาไม่ควบคุม / Uncontrolled Copy" บนหน้าพรีวิว ไฟล์ดาวน์โหลด และผลพิมพ์ของเอกสาร Published ทุกครั้ง (มติผู้ใช้ อ้างอิง QP-2301-0107 ข้อ 6.6, REF-13) | Must | AC-12; ตรวจสอบว่าไฟล์/พรีวิว/สิ่งพิมพ์ทุกช่องทางมีป้ายกำกับ |

> **แหล่งที่มา:** usecasespecificationssome.md (UC-A07) อ้างอิง SE02 Group A หน้า 11, 29 และ QP-2301-0107 ข้อ 6.6 "การเผยแพร่ แจกจ่าย เรียกคืนเอกสาร"

---

### 4.7 Acknowledge Document — UC-07

| Priority | Source / Coverage |
| :--- | :--- |
| **Must** | US-A06, US-A07; FR-A10, A11; AC-05 |

#### Use Case Specification

| Field | รายละเอียด |
| :--- | :--- |
| **Goal** | ให้ End User รับทราบเอกสารฉบับปัจจุบัน และให้ ISO Admin ติดตามสถานะผู้รับทราบ |
| **Primary Actor** | End User |
| **Preconditions** | มีเอกสาร current version ที่ถูกมอบหมายให้รับทราบ |
| **Success Postconditions** | Acknowledgement บันทึก user/time/document version |

#### Scenarios

* **Main Success Scenario:**
  1. DCC กำหนดกลุ่มเป้าหมายผู้รับทราบเอกสาร Published ล่าสุด โดยเลือกได้ทั้งตามแผนก/บทบาท (Department/Role) หรือเจาะจงรายบุคคล (Individual) — **Dual Mapping Method (TBD-EFL-05 RESOLVED)**
  2. End User ที่ตรงกลุ่มเป้าหมายเปิด current document
  3. อ่าน/preview
  4. กดรับทราบ
  5. ระบบบันทึก user/เวลา/document version แยกเป็นเอกเทศ เพื่อคำนวณ Acknowledgement Rate ส่งต่อให้ Dashboard ฝั่ง Group B
* **Alternate Flows:**
  * **A1 (บันทึกรับทราบแบบกลุ่มจากการอบรม Face-to-Face — Batch Acknowledgment Input):** หาก DCC จัดอบรม/ชี้แจงแบบพบหน้าและมีการเซ็นชื่อบนแบบฟอร์มกระดาษ DCC สามารถเปิดเมนู "ลงนามรับทราบแบบกลุ่ม" เลือกรายชื่อพนักงานและแนบไฟล์ใบลงชื่อเป็นหลักฐาน ระบบบันทึกสถานะ Acknowledged ให้ทุกรายชื่อที่เลือกพร้อมกัน
* **Exception Flows:**
  * **E1 (กดรับทราบซ้ำ — Duplicate Acknowledgment Block):** หากผู้ใช้เคยรับทราบเอกสารเวอร์ชันปัจจุบันไปแล้ว ระบบตรวจพบรายการซ้ำและปฏิเสธการบันทึกซ้ำ พร้อมแจ้งวันเวลาที่เคยรับทราบไปแล้ว
  * **E2 (ไม่อยู่ในกลุ่มเป้าหมาย — Not Assigned Target Block):** หาก End User พยายามรับทราบเอกสารที่ไม่ได้อยู่ในกลุ่มเป้าหมายของตน (Dual Mapping) ระบบอนุญาตให้อ่านได้ตามปกติแต่ซ่อนปุ่มยืนยันรับทราบ พร้อมข้อความแจ้งว่าไม่จำเป็นต้องรับทราบเอกสารฉบับนี้

#### Requirements & Verification

| ID | Requirement | Priority | Verification |
| :--- | :--- | :--- | :--- |
| **FR-A10** | ระบบต้องกำหนดกลุ่มเป้าหมายผู้รับทราบเอกสารได้ทั้งแบบแผนก/บทบาท และเจาะจงรายบุคคล (Dual Mapping) — **สถาปัตยกรรมยืนยันแล้วจาก TBD-EFL-05 RESOLVED** เพื่อลด Alert Fatigue | Should (ตามเอกสารต้นทาง) | AC-05 |
| **FR-A11** | ระบบต้องบันทึก acknowledgement user/time/document version | Must | AC-05; Dashboard ดึง ack summary ได้ |

> **หมายเหตุ Business Rule:** Acknowledgement ต้องผูกกับ `document_version_id` ไม่ใช่เฉพาะ `document_id` (ปรับจาก SE02 Mapping §3.2)

---

### 4.8 Create Record/Evidence — UC-08

| Priority | Source / Coverage |
| :--- | :--- |
| **Must** | US-B01; FR-B01, B02, B16, B17; AC-06 |

#### Use Case Specification

| Field | รายละเอียด |
| :--- | :--- |
| **Goal** | บันทึกหลักฐาน/record พร้อมไฟล์แนบ (หนึ่งไฟล์ขึ้นไป) และผูกกับเอกสาร และ/หรือ finding/CAR ที่เกี่ยวข้อง |
| **Primary Actor** | ISO User / CAR Owner |
| **Preconditions** | มีอย่างน้อยหนึ่งใน `document_id` (จาก Group A), `finding_id`, หรือ `car_id` ที่จะอ้างอิง (ปรับจากเดิมที่บังคับต้องมี document_id เท่านั้น เพื่อให้สอดคล้องกับ BRULE-EFL-06 ซึ่งอนุญาตให้ผูกกับ document **หรือ** finding/CAR อย่างน้อยหนึ่งรายการอยู่แล้ว) |
| **Success Postconditions** | Record ผูกกับ document_id, finding_id หรือ car_id อย่างน้อยหนึ่งรายการ พร้อมไฟล์แนบครบตามที่ระบุใน RecordFile |

#### Scenarios

* **Main Success Scenario:**
  1. เปิด Record Form
  2. กรอก metadata
  3. เลือก document reference (หรือ finding/CAR reference — ดู A2)
  4. แนบไฟล์ (รองรับมากกว่า 1 ไฟล์ — ดู A1)
  5. Save
* **Alternate Flows:**
  * **A1 (แนบหลักฐานหลายไฟล์ — Multi-File Attachment):** ผู้ใช้สามารถแนบไฟล์หลักฐานได้มากกว่า 1 ไฟล์ต่อ record เดียว (เช่น รูปถ่ายหน้างานหลายมุม + เอกสารสแกน) ระบบบันทึกแต่ละไฟล์เป็นรายการแยกใน **RecordFile** ที่ผูกกับ `record_id` เดียวกัน แสดงเป็นรายการไฟล์แนบทั้งหมดในหน้า Record Detail — บังคับใช้ **FR-B16**
  * **A2 (อ้างอิง Finding/CAR โดยตรงโดยไม่มีเอกสารต้นทาง — Direct Issue Linkage):** เมื่อหลักฐานเกิดจากการดำเนินการแก้ไข CAR หรือการตรวจ Finding ที่ไม่มีเอกสารคุณภาพ (Document) เกี่ยวข้องโดยตรง (เช่น ภาพถ่ายสภาพหน้างานก่อน/หลังแก้ไข) ผู้ใช้สามารถข้ามขั้นตอนเลือก document reference และเลือกผูกกับ `finding_id` หรือ `car_id` แทนได้ทันที ระบบตั้งค่า `document_id = NULL` บน Record นั้น (Record.document_id เป็น **Nullable**) แต่ยังคงบังคับให้มี `finding_id` หรือ `car_id` อย่างน้อยหนึ่งรายการเสมอ เพื่อรักษา Traceability ตาม BRULE-EFL-06 — บังคับใช้ **FR-B17**
* **Exception Flows:**
  * **E1 (ไฟล์แนบเกินขนาดที่กำหนด — File Size Limit, ค่าตั้งต้นชั่วคราว 20MB):** ⚠️ หากไฟล์ที่แนบ (ไฟล์ใดไฟล์หนึ่งใน RecordFile) มีขนาดเกิน **20MB (ค่าตั้งต้นชั่วคราว — Provisional)** ระบบปฏิเสธการอัปโหลดไฟล์นั้นทันที พร้อมข้อความแจ้งเตือนขนาดไฟล์สูงสุดที่รองรับ โดยไม่กระทบไฟล์อื่นที่แนบสำเร็จแล้วใน record เดียวกัน — บังคับใช้ **BRULE-EFL-25 (Provisional)**; ตัวเลข 20MB **ยังไม่มีแหล่งอ้างอิงที่ยืนยันแล้ว** (ตรวจสอบย้อนกลับพบว่าไม่มีเอกสารต้นทางใดระบุไว้จริง) รอ Stakeholder ยืนยันตัวเลขจริงตาม **TBD-EFL-17** ก่อน Baseline — แยกจากขนาดไฟล์ของ Document (BRULE-EFL-27) ซึ่งมีข้อมูลจริงยืนยันแล้ว
  * **E2 (ความล้มเหลวเชิงบูรณภาพการอ้างอิง — Referential Integrity Failure):** หากผู้ใช้พยายามผูก Record กับ `document_id`, `finding_id`, หรือ `car_id` ที่ถูกทำลายไปแล้วผ่านกระบวนการ Destruction (UC-15) หรือไม่มีอยู่จริงในฐานข้อมูล ระบบปฏิเสธการบันทึกพร้อมแจ้ง "ไม่พบรายการอ้างอิงในระบบ หรือรายการดังกล่าวถูกทำลายไปแล้วตามกระบวนการจัดการวงจรชีวิตข้อมูล" — ในทางกลับกัน ระบบต้องบล็อกคำร้องขอทำลาย (Destruction Request, UC-15) ของ document/finding/CAR ที่ยังมี Record อ้างอิงอยู่ (Active Reference) ไม่ให้ผ่านการอนุมัติ เว้นแต่จะยกเลิก/ย้ายการอ้างอิงก่อน — บังคับใช้ **BRULE-EFL-26**

#### Requirements & Verification

| ID | Requirement | Priority | Verification |
| :--- | :--- | :--- | :--- |
| **FR-B01** | ระบบต้องสร้าง/แก้ไข/ค้นหา record ได้ | Must | AC-06 |
| **FR-B02** | ระบบต้องแนบ evidence file และผูกกับ document_id, finding_id หรือ car_id ได้อย่างน้อยหนึ่งรายการ (ปรับปรุงให้สอดคล้องกับ BRULE-EFL-06 และ Direct Issue Linkage) | Must | AC-06; ค้นหา record และดูไฟล์ได้ |
| **FR-B16** | ระบบต้องรองรับการแนบไฟล์หลักฐานมากกว่า 1 ไฟล์ต่อ record เดียว (Multi-File Attachment ผ่าน Entity RecordFile) | Must | AC-06; record หนึ่งรายการมีไฟล์แนบได้หลายไฟล์ |
| **FR-B17** | ระบบต้องรองรับการผูก record เข้ากับ finding_id หรือ car_id ได้โดยตรงโดยไม่บังคับต้องมี document_id (Direct Issue Linkage — document_id เป็น Nullable) | Must | AC-06; สร้าง record ที่ไม่มี document_id แต่มี finding_id/car_id ได้สำเร็จ |

---

### 4.9 Create Finding (Audit / Non-Audit Source) — UC-09

| Priority | Source / Coverage |
| :--- | :--- |
| **Must** | US-B02; FR-B03, B04, B05; AC-07 |

#### Use Case Specification

| Field | รายละเอียด |
| :--- | :--- |
| **Goal** | บันทึก Finding (NC) ที่อาจเกิดจากรอบตรวจติดตามประจำปี **หรือ** จากแหล่งอื่นนอกรอบตรวจ (เช่น ข้อร้องเรียนผู้รับบริการตาม QP-2301-0106 หรือมติที่ประชุมทบทวนโดยฝ่ายบริหารตาม QP-2301-0101) พร้อมอ้างอิงเอกสาร/หลักฐาน — ขอบเขตนี้ขยายจากเดิมตามมติ **TBD-EFL-15 RESOLVED** |
| **Primary Actor** | Auditor (กรณีเกิดจากรอบตรวจ) / ISO Admin (DCC) (กรณี Non-Audit Source) |
| **Preconditions** | **กรณี Audit Source:** มี **AuditRound** (Header เดียวต่อรอบตรวจติดตามประจำปี ผูก Lead Auditor และขอบเขต/วันที่ — TBD-EFL-06 RESOLVED) และมี document/record ที่จะอ้างอิง; **กรณี Non-Audit Source:** ไม่จำเป็นต้องมี AuditRound แต่ต้องมี record อ้างอิงอื่น (เช่น บันทึกข้อร้องเรียน หรือมติที่ประชุม) เพื่อรักษา Traceability (TBD-EFL-15 RESOLVED) |
| **Success Postconditions** | Finding (NC) status = Open; หากมาจากรอบตรวจ จะถูกบันทึกเป็น Child Record ของ AuditRound แยกตามแผนกที่รับตรวจ (`audit_round_id` มีค่า); หากมาจากแหล่งอื่น `audit_round_id` เป็น `NULL` และ Finding ต้องมี `record_id` หรือแหล่งอ้างอิงอื่นแทน |

#### Scenarios

* **Main Success Scenario (Audit Source):**
  1. ISO Admin/Lead Auditor เปิด AuditRound ประจำปี ระบุขอบเขต วันที่ และ Lead Auditor
  2. Auditor สร้าง finding ภายใต้ AuditRound นั้น
  3. อ้างเอกสาร/ข้อกำหนด/record
  4. บันทึกเป็น Child Record ของ AuditRound แยกตามแผนก auditee (สอดคล้อง ISO 9001:2015 ข้อ 9.2/10.2)
* **Alternate Flows:**
  * **A1 (Non-Audit Source — บันทึก Finding จากข้อร้องเรียนหรือการประชุมทบทวนฝ่ายบริหาร):** ISO/QA Admin (DCC) สามารถสร้าง Finding ได้โดยตรงโดยไม่ต้องผูกกับ AuditRound เมื่อที่มาคือข้อร้องเรียนจากผู้รับบริการ (QP-2301-0106) หรือมติจากที่ประชุมทบทวนโดยฝ่ายบริหาร (QP-2301-0101) หรือปัญหาคุณภาพอื่นที่กระทบ QMS ระบบตั้งค่า `audit_round_id = NULL` และบังคับให้ระบุ `record_id` หรือแหล่งอ้างอิง (เช่น เลขที่บันทึกข้อร้องเรียน) แทน เพื่อรักษาเส้นทางตรวจสอบย้อนกลับ (Traceability) — บังคับใช้ **BRULE-EFL-22** (TBD-EFL-15 RESOLVED)
* **Exception Flows:**
  * **E1 (Auditee โต้แย้งผลการตรวจพบ — Findings Dispute):** ในขั้นตอนประชุมปิด (Closing Meeting) หาก Auditee ไม่เห็นด้วยกับ Finding ที่ตรวจพบและปฏิเสธการลงนามรับทราบ ระบบระงับการออกเลขที่ CAR จาก finding นั้นไว้ชั่วคราว เปลี่ยนสถานะ Finding เป็น "Disputed" และส่งเรื่องให้ QMR/คณะกรรมการบริหารระบบคุณภาพพิจารณาไกล่เกลี่ยก่อนปลดล็อก

> **✅ ข้อขัดแย้งที่เคยพบ (v0.8) — แก้ไขแล้วใน v0.9:** เดิมมี Precondition บังคับให้ Finding ทุกรายการต้องผูกกับ AuditRound ซึ่งขัดกับ usecaseflows.md (UC-10 A1) ผู้ใช้ (Product Owner) ยืนยันมติให้ขยายขอบเขต โดยอ้างอิง QP-2301-0109 ข้อ 2 (Scope) และข้อ 6.1.1 ซึ่งระบุว่า NC มีได้หลายแหล่งที่มา (Internal Audit, External Audit, Management Review/NCR, ข้อร้องเรียนตาม QP-2301-0106, ปัญหาอื่นที่กระทบ QMS) — แก้ไขโดยกำหนด `audit_round_id` เป็น **Nullable** บน Entity Finding และใช้ `record_id`/แหล่งอ้างอิงอื่นแทนเมื่อไม่ผูกกับ AuditRound (ดู Appendix B.3, BRULE-EFL-22, Appendix C.1 TBD-EFL-15 RESOLVED)

#### Requirements & Verification

| ID | Requirement | Priority | Verification |
| :--- | :--- | :--- | :--- |
| **FR-B03** | ระบบควรสร้าง audit header หรือ AuditRound ได้ (Single Header ต่อรอบปี ผูก Lead Auditor และ Finding/NC เป็น Child Record — **สถาปัตยกรรมยืนยันแล้วจาก TBD-EFL-06 RESOLVED**) | Should (ตามเอกสารต้นทาง) | — |
| **FR-B04** | ระบบต้องบันทึก finding และ type/severity/description ได้ ไม่ว่าจะมาจาก Audit หรือ Non-Audit Source | Must | AC-07 |
| **FR-B05** | ระบบต้องผูก finding กับ document/record/evidence ได้ (audit_round_id เป็น Nullable — TBD-EFL-15 RESOLVED) | Must | AC-07; Finding มี evidence/reference ชัดเจนไม่ว่าจะมี AuditRound หรือไม่ |

---

### 4.10 Open CAR — UC-10

| Priority | Source / Coverage |
| :--- | :--- |
| **Must** | US-B03; FR-B06; AC-08 |

#### Use Case Specification

| Field | รายละเอียด |
| :--- | :--- |
| **Goal** | เปิด Corrective Action Request จาก finding ที่ต้องดำเนินการแก้ไข |
| **Primary Actor** | ISO Admin / Auditor |
| **Preconditions** | มี finding ที่ต้องดำเนินการแก้ไข (Business Rule: ห้ามเปิด CAR ลอยโดยไม่มี finding อ้างอิงใน MVP) — finding นั้นอาจมาจากรอบตรวจติดตาม (ผูก AuditRound) หรือจากแหล่งอื่น (Non-Audit Source, audit_round_id = NULL) ตาม TBD-EFL-15 RESOLVED |
| **Success Postconditions** | CAR status = Open |

#### Scenarios

* **Main Success Scenario:**
  1. เลือก finding
  2. กด Open CAR
  3. กำหนด owner/due date
  4. Save
* **Alternate Flows:**
  * **A1 (เปิด CAR จากแหล่งอื่นนอกเหนือรอบตรวจติดตาม — Out-of-Audit CAR Source):** ✅ ISO/QA Admin หรือ DCC เปิด CAR ได้โดยตรงจาก Finding ที่มาจากแหล่งอื่น (เช่น ข้อร้องเรียนจากผู้รับบริการตาม QP-2301-0106 หรือมติที่ประชุมทบทวนโดยฝ่ายบริหารตาม QP-2301-0101) โดยไม่ต้องผ่านรอบตรวจติดตามประจำปี — **ยืนยันแล้วตามมติ TBD-EFL-15 RESOLVED** (ดูรายละเอียดการปรับ Finding entity ที่ §4.9 A1 และ Appendix B.3) ระบบสร้าง CAR รหัสเฉพาะและแจ้งเตือนผู้รับผิดชอบตามแผนกตามขั้นตอนปกติ
* **Exception Flows:**
  * **E1 (แผนกปลายทางไม่มีผู้รับผิดชอบ — Liaison Not Defined):** หากแผนก/หน่วยงานที่มีข้อบกพร่องยังไม่มีผู้ใช้ลงทะเบียนรับบทบาทผู้รับผิดชอบ (Document Owner/ผู้ประสานงานคุณภาพ) ระบบปฏิเสธการออกใบ CAR ไปยังแผนกนั้น และแจ้ง DCC ให้ตั้งค่าผู้รับผิดชอบในเมนูจัดการผู้ใช้ก่อน — บังคับใช้ BRULE-EFL-21

#### Requirements & Verification

| ID | Requirement | Priority | Verification |
| :--- | :--- | :--- | :--- |
| **FR-B06** | ระบบต้องสร้าง CAR จาก finding ได้ | Must | AC-08; CAR ปรากฏใน dashboard และ overdue monitor |

---

### 4.11 Update / Verify / Close CAR — UC-11

| Priority | Source / Coverage |
| :--- | :--- |
| **Must / Should** | US-B04, US-B05; FR-B07, B08, B09, B10; AC-08 |

#### Use Case Specification

| Field | รายละเอียด |
| :--- | :--- |
| **Goal** | ให้ CAR Owner บันทึกการแก้ไข และให้ผ่านการทวนสอบ/ปิดงานแบบ **Two-Step Authorization** เพื่อป้องกันผลประโยชน์ทับซ้อน (TBD-EFL-07 RESOLVED) |
| **Primary Actor** | CAR Owner (ดำเนินการแก้ไข) → Assistant DCC หรือ Auditor ผู้แจ้งพบข้อบกพร่อง (Verify) → QMR หรือ Lead Auditor (Close) |
| **Preconditions** | CAR status = Open หรือ In Progress |
| **Success Postconditions** | CAR = Closed (โดย QMR/Lead Auditor เท่านั้น) หรือ Reopened |

#### Scenarios

* **Main Success Scenario:**
  1. CAR Owner บันทึก root cause/corrective action/evidence
  2. CAR Owner ส่ง Verify
  3. **Assistant DCC หรือ Auditor ผู้แจ้งพบข้อบกพร่องนั้น** ตรวจสอบหน้างานจริง ยืนยันความสมบูรณ์ของการแก้ไข และเซ็นผ่านขั้นตอน Verify
  4. **QMR หรือ Auditor หลักประจำคณะ (Lead Auditor)** ตรวจเช็กความสอดคล้องรอบสุดท้ายและกดปิด CAR (Close) — **ผู้ทำ Close ต้องไม่ใช่บุคคลเดียวกับผู้ทำ Verify (Segregation of Duties)**
* **Alternate Flows:**
  * **A1 (Verify ไม่ผ่าน):** ส่งกลับให้ CAR Owner แก้ไขเพิ่มเติม (ยังไม่ Close)
  * **A2 (ขอขยายกรอบเวลาแผนแก้ไข — Corrective Plan Timeline Extension):** หากปัญหาซับซ้อนเชิงโครงสร้าง (เช่น ต้องรอจัดซื้อครุภัณฑ์) CAR Owner ยื่นคำร้องขอขยายเวลาส่งแผน RCA พร้อมเหตุผลและความเสี่ยง ระบบส่งให้ QMR พิจารณา หากอนุมัติ ระบบเลื่อนวันครบกำหนด (due_date) ของสถิติ Overdue ออกไปตามรอบที่อนุมัติ
  * **A3 (บันทึกผลทวนสอบหน้างานแบบออฟไลน์ — On-site Offline Check & Media Attachment):** กรณีจุดตรวจ (เช่น ห้องแล็บ) ไม่สะดวกใช้ระบบออนไลน์ ผู้ทวนสอบ (Assistant DCC) บันทึกผลบนกระดาษหน้างานก่อน แล้วสแกน/ถ่ายภาพแนบเข้าระบบภายหลังเป็นหลักฐานประกอบการ Verify
  * **A4 (เสนอเรื่องต่อคณะกรรมการบริหารระบบคุณภาพ — Escalate to Management Review):** หากการแก้ไขต้องใช้งบประมาณ/ทรัพยากรเกินอำนาจตัดสินใจของ QMR ผู้ใช้เลือก "เสนอเรื่องต่อคณะกรรมการบริหารระบบคุณภาพ" ระบบเปลี่ยนสถานะ CAR เป็น "Pending Management Review" รอวาระการประชุมคุณภาพของคณะ
* **Exception Flows:**
  * **E1 (Close ไม่ผ่านหลัง Verify):** QMR/Lead Auditor สั่ง Reopen พร้อมเหตุผล — Business Rule กำหนดว่าต้องมี required fields และ evidence ครบก่อน Close ได้เท่านั้น
  * **E2 (แผนแก้ไขไม่ผ่านการอนุมัติจาก QMR — Action Plan Rejected):** หาก QMR ตรวจสอบแผน RCA/Corrective Action แล้วเห็นว่าไม่สามารถขจัดสาเหตุรากเหง้าได้จริง กด "ไม่รับรองแผนแก้ไข" ระบบเปลี่ยนสถานะ CAR เป็น "Pending Plan Correction" พร้อมบังคับแนบ comment และกำหนดกรอบเวลาส่งแผนใหม่ (เช่น ไม่เกิน 3 วันทำการ)
  * **E3 (ตรวจพบปัญหาเกิดซ้ำระหว่าง Verify — Verification Check Failure):** หากผู้ทวนสอบพบว่าปัญหายังไม่ได้รับการแก้ไขอย่างยั่งยืนหรือเกิดซ้ำ กด "การแก้ไขล้มเหลวไม่มีประสิทธิผล (Verify Failed)" ระบบเปลี่ยนสถานะ CAR เป็น Reopened และเริ่มนับกรอบเวลาวิเคราะห์สาเหตุรากเหง้าใหม่รอบสอง
  * **E4 (พยายามปิด CAR โดยไม่มีหลักฐานทวนสอบ — Missing Verification Block):** หาก QMR/Auditor พยายามกดปิด CAR แต่ระบบตรวจไม่พบสถานะ Verify ผ่าน หรือไม่พบไฟล์หลักฐานทวนสอบประสิทธิผล ระบบบล็อกสิทธิ์คำสั่ง Close ทันที พร้อมแจ้งให้รอผลทวนสอบก่อน — สอดคล้องกับ BRULE-EFL-07 (ต้องมี evidence ครบก่อน Close)

#### Requirements & Verification

| ID | Requirement | Priority | Verification |
| :--- | :--- | :--- | :--- |
| **FR-B07** | ระบบต้องเก็บ owner, due_date, root_cause, corrective_action, status | Must | AC-08 |
| **FR-B08** | ระบบต้องแนบ evidence ให้ CAR ได้ | Must | AC-08 |
| **FR-B09** | ระบบต้องคำนวณ overdue status จาก due_date และ status | Must | overdue list ถูกต้อง |
| **FR-B10** | ระบบควรรองรับ Verify/Close/Reopen CAR แบบ **Two-Step Authorization** โดยแยกสิทธิ์ผู้ Verify (Assistant DCC/Auditor ผู้แจ้งพบ) ออกจากผู้ Close (QMR/Lead Auditor) — **สถาปัตยกรรมยืนยันแล้วจาก TBD-EFL-07 RESOLVED** | Should (ตามเอกสารต้นทาง) | Close ได้เมื่อมี required fields, evidence ครบ และผู้ Close ≠ ผู้ Verify (ดู BRULE-EFL-12) |

---

### 4.12 View Operational Dashboard — UC-12

| Priority | Source / Coverage |
| :--- | :--- |
| **Must** | US-B06, US-B07, US-B08; FR-B11, B12, B13; AC-09 |

#### Use Case Specification

| Field | รายละเอียด |
| :--- | :--- |
| **Goal** | แสดงภาพรวมสถานะระบบคุณภาพเชิงสถิติรวม (Operational/Aggregate Level) จากข้อมูลจริง (document, ack, CAR, finding) — **ขอบเขตนี้ไม่รวมงานค้างส่วนบุคคล ("งานของฉัน") ซึ่งแยกไปเป็น UC-16 My Task Checklist ของ Group A ตามมติ TBD-EFL-12 RESOLVED (Module Boundary Split)** |
| **Primary Actor** | ISO Admin / Manager |
| **Preconditions** | Group A module ได้ expose Document/Ack Summary ผ่าน Internal Interface ให้ Group B module เรียกใช้แล้ว |
| **Success Postconditions** | ผู้ใช้เห็นสถานะจากข้อมูลจริง ไม่มี hardcoded mock data |

#### Scenarios

* **Main Success Scenario:**
  1. เปิด dashboard
  2. ระบบ aggregate ข้อมูลจาก Group A และ Group B
  3. แสดง cards/charts/recent/overdue
* **Alternate Flows:**
  * **A1 (มุมมองตามบทบาท — Role-Based Visualization):** ✅ ระบบปรับชุด widget ที่แสดงตามบทบาทผู้ใช้ — ผู้บริหาร/QMR เห็นภาพรวมทุกแผนก, ISO/QA Admin (DCC) เห็นเน้นสถานะเอกสาร/Acknowledgement Rate, Auditor/CAR Owner เห็นเน้น CAR overdue/finding ของแผนกตน — ทั้งหมดยังคงเป็น**สถิติระดับปฏิบัติการ (Operational)** เท่านั้น ไม่ปะปนกับ My Task Checklist ส่วนบุคคล (UC-16)
  * **A2 (เจาะลึกระดับแผนก — Departmental Drill-Down):** ✅ ผู้ใช้ (ผู้บริหาร/QMR/ISO Admin) สามารถกดเลือกแผนก/หน่วยงานหนึ่งจาก card สรุปภาพรวม เพื่อกรองข้อมูล document/ack/CAR/finding เฉพาะแผนกนั้น รองรับการเปรียบเทียบผลระหว่างแผนกเพื่อการปรับปรุงต่อเนื่อง (Continual Improvement)
* **Exception Flows:**
  * **E1 (เรียก Internal Interface ของ Group A ไม่สำเร็จ — Internal Module Call Timeout/Exception):** หากการเรียก Internal Module Interface ไปยัง Group A module (Document/Ack Summary) เกิด exception หรือ timeout ภายใน backend เดียวกัน ระบบต้องไม่ปล่อยให้ทั้งหน้า dashboard ล่ม (fail) แต่แสดงเฉพาะ widget ที่ได้รับข้อมูลสำเร็จ พร้อมข้อความ "ไม่สามารถดึงข้อมูลเอกสาร/การรับทราบจากโมดูล Group A ได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง" บน widget ที่ล้มเหลว — ห้ามแสดงข้อมูล mock/ค่าเริ่มต้นแทนข้อมูลจริงที่ดึงไม่สำเร็จ (สอดคล้อง BRULE-EFL-08)
  * **E2 (ป้องกันการหารด้วยศูนย์ — Divide-by-Zero Protection):** เมื่อคำนวณอัตราส่วนเชิงสถิติ (เช่น Acknowledgement Rate = จำนวนรับทราบ/จำนวนกลุ่มเป้าหมาย) หากตัวหารเป็น 0 (เช่น ยังไม่มีการมอบหมายกลุ่มเป้าหมาย) ระบบต้องแสดงผลเป็น "ไม่มีข้อมูล (N/A)" หรือ 0% แทนการเกิด runtime error หรือค่า `NaN`/`Infinity` บนหน้าจอ

#### Requirements & Verification

| ID | Requirement | Priority | Verification |
| :--- | :--- | :--- | :--- |
| **FR-B11** | dashboard ต้องแสดง document status จาก Group A | Must | AC-09 |
| **FR-B12** | dashboard ต้องแสดง acknowledgement rate จาก Group A (ต้องป้องกัน Divide-by-Zero — E2) | Must | AC-09 |
| **FR-B13** | dashboard ต้องแสดง CAR open/overdue/closed และ recent findings | Must | AC-09; ไม่มี hardcoded mock data ใน final demo |

> **✅ มติปิด TBD-EFL-12 (v0.10):** Dashboard ของ Group B (UC-12) จำกัดเฉพาะสถิติภาพรวมระดับปฏิบัติการ (Operational/Aggregate) เท่านั้น ส่วนงานค้างส่วนบุคคล (เช่น DAR ที่ต้องอนุมัติ, เอกสารที่ยังไม่ได้รับทราบ) ของผู้ใช้แต่ละคนเป็นความรับผิดชอบของ Group A ภายใต้ **UC-16 (My Task Checklist)** แยกต่างหาก เพื่อป้องกันการทำงานซ้ำซ้อนระหว่างสอง Module (ดู Appendix C.1, BR-17)

---

### 4.13 Export Summary — UC-13

| Priority | Source / Coverage |
| :--- | :--- |
| **Should** | FR-B14 |

#### Use Case Specification

| Field | รายละเอียด |
| :--- | :--- |
| **Goal** | ให้ ISO/QA Admin ส่งออกรายงานสรุปสถิติ (เช่น Acknowledgement Logs) เป็นไฟล์ตารางมาตรฐาน เพื่อสนับสนุนการจัดทำรายงาน Management Review |
| **Primary Actor** | ISO/QA Admin (DCC) |
| **Preconditions** | มีข้อมูลธุรกรรม/สถิติที่ยืนยันแล้วในระบบ (FR-A11) |
| **Success Postconditions** | ไฟล์รายงานสรุป (.CSV หรือ .xlsx) ถูกสร้างและดาวน์โหลดสำเร็จ |

#### Scenarios

* **Main Success Scenario:**
  1. ISO/QA Admin เปิดเมนู "ประวัติสถิติการรับสารสนเทศ (Acknowledgement Logs Overview)"
  2. เลือกช่วงเวลาของรอบที่ต้องการส่งออก และกดคำสั่ง "ส่งออกรายงานสรุปสถิติ (Export Report)"
  3. ระบบดึงข้อมูลและแปลงรูปแบบเป็นไฟล์ตารางมาตรฐาน (.CSV หรือ .xlsx)
  4. ระบบส่งไฟล์ให้ดาวน์โหลดลงเครื่องผู้ใช้ ISO/QA Admin ทันที
* **Alternate Flows:**
  * **A1 (กรองข้อมูลตามช่วงเวลา — Filter by Date Range):** ISO/QA Admin ระบุช่วงวันที่ (start_date/end_date) ก่อนส่งออกรายงาน เพื่อจำกัดขอบเขตข้อมูลเฉพาะรอบตรวจติดตามหรือรอบรายงานที่ต้องการ ระบบกรองและสรุปเฉพาะรายการในช่วงเวลานั้น
* **Exception Flows:**
  * **E1 (ไม่พบข้อมูลในช่วงเวลาที่เลือก):** หากไม่มีข้อมูลตรงเงื่อนไข ระบบแจ้งเตือนและไม่สร้างไฟล์เปล่า

> **หมายเหตุ — เนื้อหาที่ตรวจสอบแล้วไม่นำมาใช้:** usecaseflows.md (UC-09/UC-A09 Exception Flow E1) ยังบรรยาย Exception Flow แบบ REST API ระหว่างระบบ (Invalid API Key/JWT Token, HTTP 401/403, บันทึก IP ผู้พยายามเจาะข้อมูล) ซึ่งใช้ไม่ได้กับสถาปัตยกรรม **Internal Module Interface / Manual Export** ที่ยืนยันแล้วใน v0.3/v0.6 (backend เดียวกัน ไม่มี network call ข้าม service) — เนื้อหานี้จะมีความหมายก็ต่อเมื่อ Phase 3 เปิด Export/Integration เป็น Public API จริงเท่านั้น จึงไม่นำมาบังคับใช้ใน SRS ฉบับนี้ (ตรวจสอบแล้วและเลือกไม่ใช้โดยเจตนา ไม่ใช่การตกหล่น)

> **หมายเหตุสำคัญ — เกี่ยวข้องกับ §3.3.1:** เอกสารต้นทาง (UC-A09) ยังบรรยาย **กลไกที่ Group B ดึงข้อมูลสรุปเอกสาร/อัตราการรับทราบจาก Group A แบบอัตโนมัติ** สำหรับ Dashboard แต่บรรยายด้วย REST API ระหว่าง service ซึ่ง**ขัดกับมติ v0.3** ที่ผู้ใช้ยืนยันว่า Group A/B ใช้ backend เดียวกันและสื่อสารกันผ่าน **Internal Module Interface** (ไม่ใช่ network API) — ผู้ใช้ยืนยันแล้วให้คงมติ v0.3 ไว้ (ดู Revision History v0.6) ดังนั้นกลไกการดึงข้อมูลอัตโนมัตินี้ยังคงอธิบายไว้ที่ **§3.3.1** ในรูปแบบ Internal Interface (function call ภายใน backend เดียวกัน) ไม่ใช่ REST API — ข้อมูลที่ส่งให้กันคือ: (1) จำนวนเอกสารแยกตามสถานะ (Draft/Review/Approved/Published/Obsolete) และ (2) สถิติอัตราการรับทราบ (Acknowledgement Rate) เทียบกับกลุ่มเป้าหมายต่อเวอร์ชันเอกสาร — รายละเอียดนี้เพิ่มเข้าไปที่ §3.3.1 แล้ว

#### Requirements & Verification

| ID | Requirement | Priority | Verification |
| :--- | :--- | :--- | :--- |
| **FR-B14** | ระบบควร export summary report เบื้องต้นได้ (เช่น Acknowledgement Logs เป็น CSV/xlsx) | Should | ไฟล์ export เปิดได้และข้อมูลตรงกับฐานข้อมูล |
| **FR-A12** | ระบบต้องให้ Group B module ดึง Document/Acknowledgement Summary ผ่าน Internal Interface ได้ (กลไกอัตโนมัติ — ดู §3.3.1) | Must | Dashboard แสดงข้อมูลถูกต้องแบบ real-time ภายใน backend เดียวกัน |

> **แหล่งที่มา:** usecasespecificationssome.md (UC-A09) — เนื้อหา Main Flow (REST API) ไม่ถูกนำเข้าโดยตรงเนื่องจากขัดกับสถาปัตยกรรมที่ยืนยันแล้ว; นำเฉพาะ Alternate Flow A1 (Manual Export โดย DCC) มาเป็น Main Flow ของ UC-13 แทน

---

### 4.14 View Audit Trail — UC-14

| Priority | Source / Coverage |
| :--- | :--- |
| **Must** | FR-SH04 |

#### Use Case Specification

| Field | รายละเอียด |
| :--- | :--- |
| **Goal** | ให้ ISO/QA Admin (DCC) ตรวจสอบประวัติ who/what/when ของ event สำคัญทั้งระบบ เพื่อเป็นหลักฐานตรวจสอบย้อนกลับที่โปร่งใสและน่าเชื่อถือ |
| **Primary Actor** | ISO/QA Admin (DCC) **เท่านั้น** — บทบาทอื่น (End User, Document Owner, Approver, Auditor ฯลฯ) ถูกปิดกั้นการเข้าถึงเมนูนี้อย่างสมบูรณ์ |
| **Preconditions** | ผู้ใช้ผ่านการ Login สำเร็จในบทบาท ISO/QA Admin เท่านั้น |
| **Success Postconditions** | ISO/QA Admin มีหลักฐานประวัติย้อนหลังครอบคลุม 100% พร้อมให้ Internal Auditor ทวนสอบได้ตามเกณฑ์ ISO 9001:2015 ข้อ 9.2 |

#### Scenarios

* **Main Success Scenario:**
  1. ISO/QA Admin คลิกเมนู "ระบบตรวจสอบร่องรอยประวัติย้อนหลัง (View System Audit Trail Service)" บนหน้าควบคุมความปลอดภัย
  2. ระบบดึงข้อมูลจากตาราง `AuditLogs` ในฐานข้อมูลกลาง
  3. ระบบแสดงตารางประวัติเรียงจากล่าสุดไปเก่าสุด (Descending) ประกอบด้วยคอลัมน์: Timestamp, Actor (Who), Action (What เช่น สร้าง DAR/ทบทวน/บันทึกรับทราบ), Entity เป้าหมาย (Which)
  4. ISO/QA Admin ใส่คำค้นกรองประวัติ เช่น รหัสเจ้าหน้าที่, รหัส DAR, หรือรายชื่อพนักงานที่ถูกแก้ไขสิทธิ์ในช่วงเวลาหนึ่ง
* **Alternate Flows:**
  * **A1 (Document Revision History View — สิทธิ์จำกัดเฉพาะเอกสารของตน):** Document Owner หรือ Approver เปิดหน้าประวัติของเอกสารเฉพาะรหัสที่เกี่ยวข้อง ระบบจำกัดให้เห็นเฉพาะ Revision History และ DAR History ของเอกสารรหัสนั้น (ไม่ใช่ Audit Trail เต็มระบบ) — FR-A08
* **Exception Flows:**
  * **E1 (พยายามเข้าถึงโดยไม่มีสิทธิ์):** ผู้ที่ไม่ใช่ ISO/QA Admin พยายามเรียก endpoint หน้านี้โดยตรงผ่าน URL/API parameter ระบบ (Authorization Guard) ปฏิเสธการทำธุรกรรม (Access Denied) และบันทึกความพยายามเข้าถึงนี้ลง Audit Log โดยอัตโนมัติเพื่อเฝ้าระวังความปลอดภัย

#### Requirements & Verification

| ID | Requirement | Priority | Verification |
| :--- | :--- | :--- | :--- |
| **FR-SH04** | ระบบต้องบันทึก audit trail สำหรับ event สำคัญ | Must | Audit record inspection |
| **FR-A08** | ระบบต้องบันทึก revision history ของเอกสาร (เข้าถึงได้จำกัดสิทธิ์ผ่าน Alternate Flow A1) | Must | ตรวจสอบ Revision History แสดงถูกต้อง |

> **แหล่งที่มา:** usecasespecificationssome.md (UC-14) — ระบุ NFR-A03 (Auditability) ในเอกสารต้นทาง ตรงกับ **NFR-02** ในเอกสารฉบับนี้ (ดู §5.3) เอกสารต้นทางยังเผยรายละเอียดสถาปัตยกรรมที่ยืนยันเพิ่ม: **Backend ใช้ Express.js ร่วมกับ Prisma ORM** (Authorization Guard) — ดูการอัปเดต §2.4

---

### 4.15 Data Retention & Destruction Management — UC-15

| Priority | Source / Coverage |
| :--- | :--- |
| **Must** | FR-A13, FR-B15, FR-SH06; AC-11 |

#### Use Case Specification

| Field | รายละเอียด |
| :--- | :--- |
| **Goal** | ISO/QA Admin (DCC) ดำเนินกระบวนการขอทำลายเอกสารคุณภาพ (Document) ที่มีสถานะ Obsolete และบันทึกคุณภาพ (Quality Record) ที่หมดอายุการจัดเก็บ (Retention Period) โดยต้องผ่านการอนุมัติจากผู้มีอำนาจก่อนทุกครั้ง — ระบบห้ามลบข้อมูลอัตโนมัติ (No Auto-Deletion) |
| **Primary Actor** | ISO/QA Admin (DCC) |
| **Secondary Actor** | QMR / ผู้อนุมัติตามสายงาน (Authorizer) |
| **Preconditions** | (1) ผู้ใช้ผ่าน Authentication และมีสิทธิ์บทบาท ISO/QA Admin (DCC); (2) มีเอกสารสถานะ Obsolete ที่จัดเก็บมาแล้วอย่างน้อย 1 Revision ตามเกณฑ์ (BRULE-EFL-14) หรือมีบันทึกคุณภาพที่ Retention Clock เดินครบตามตารางระยะเวลาจัดเก็บ (§6.1.1) |
| **Success Postconditions** | รายการที่ได้รับอนุมัติให้ทำลายถูกลบออกจากฐานข้อมูล/ไฟล์จัดเก็บอย่างถาวร (Hard Delete); มีการบันทึก Destruction Log (ผู้ร้องขอ, ผู้อนุมัติ, รายการ, วันที่ทำลาย) เก็บรักษาไว้อย่างน้อย 5 ปี; ไม่มีการลบข้อมูลใดที่ยังไม่ได้รับอนุมัติ |

#### Scenarios

* **Main Success Scenario:**
  1. เมื่อสิ้นปีงบประมาณ (หรือตามรอบที่กำหนด) ISO/QA Admin เปิดหน้า "รายงานข้อมูลครบกำหนดจัดเก็บ" ระบบสืบค้นเอกสาร Obsolete ที่เก็บครบเกณฑ์ขั้นต่ำ และบันทึกคุณภาพที่ Retention Clock ครบกำหนดตามตารางในระเบียบ — FR-A13, FR-B15
  2. ระบบแสดงรายการที่เข้าเกณฑ์ทำลายได้ พร้อม document_code/record_id, ประเภท, วันที่เริ่มนับอายุ และระยะเวลาจัดเก็บที่ใช้อ้างอิง
  3. ISO/QA Admin เลือกรายการที่ต้องการเสนอทำลาย ระบบสร้าง "คำร้องเสนอขออนุมัติทำลายข้อมูล" (Destruction Request) ในสถานะรออนุมัติ
  4. ระบบส่งคำร้องไปยัง QMR/ผู้อนุมัติตามสายงานเพื่อพิจารณา
  5. QMR/ผู้อนุมัติตรวจสอบความจำเป็นและข้อกฎหมาย แล้วลงนามอนุมัติ (Authorization) ผ่านระบบ
  6. ระบบอนุญาตให้ ISO/QA Admin ดำเนินการทำลายข้อมูลจริงเฉพาะรายการที่ได้รับอนุมัติแล้วเท่านั้น (Hard Delete บน PostgreSQL Metadata และไฟล์ต้นฉบับบน Disk Storage)
  7. ระบบบันทึกรหัสธุรกรรม ผู้ร้องขอ ผู้อนุมัติ รายการที่ถูกทำลาย และวันเวลา ลงใน Destruction Log — FR-SH06
  8. ระบบแสดงผลยืนยันการทำลายสำเร็จ และปรับปรุงรายการออกจากรายงาน "ข้อมูลครบกำหนดจัดเก็บ"
* **Alternate Flows:**
  * **A1 (Reject โดยผู้อนุมัติ):** หาก QMR/ผู้อนุมัติไม่อนุมัติคำร้อง ระบบเปลี่ยนสถานะคำร้องเป็น "ถูกปฏิเสธ" พร้อมเหตุผล และคงข้อมูลเดิมไว้ในระบบต่อไปโดยไม่ทำลาย — ISO/QA Admin ยื่นคำร้องใหม่ภายหลังได้
  * **A2 (เอกสารกระดาษควบคู่):** กรณีมีสำเนากระดาษ (Controlled Copy) ประกอบ ระบบอนุญาตให้ ISO/QA Admin บันทึก checklist ยืนยันว่าได้ฉีกทำลาย (Shredding) เอกสารกระดาษเรียบร้อยแล้ว เป็นส่วนหนึ่งของ Destruction Log เดียวกัน
* **Exception Flows:**
  * **E1 (พยายามทำลายโดยไม่มีการอนุมัติ):** หาก ISO/QA Admin พยายามเรียก endpoint ทำลายข้อมูลโดยตรงโดยไม่มีสถานะอนุมัติที่ถูกต้อง ระบบปฏิเสธการทำธุรกรรม (Access Denied) ทันที และบันทึกความพยายามนี้ลง Audit Trail — บังคับใช้ BRULE-EFL-16 (No Auto-Deletion)
  * **E2 (รายการยังไม่ครบเกณฑ์จัดเก็บขั้นต่ำ):** หากรายการที่เลือกยังไม่ครบระยะเวลาจัดเก็บขั้นต่ำ (เช่น Obsolete document ที่ยังไม่ครบ 1 Revision หรือ Record ที่ Retention Clock ยังไม่ครบกำหนด) ระบบปฏิเสธการสร้างคำร้องและแสดงข้อความแจ้งเตือนพร้อมวันที่ครบกำหนดจริง

#### Requirements & Verification

| ID | Requirement | Priority | Verification |
| :--- | :--- | :--- | :--- |
| **FR-A13** | ระบบต้องรองรับกระบวนการขอทำลายเอกสาร (Document) สถานะ Obsolete ที่ครบเกณฑ์จัดเก็บขั้นต่ำ ผ่านการอนุมัติก่อนเสมอ | Must | AC-11 |
| **FR-B15** | ระบบต้องรองรับกระบวนการขอทำลายบันทึกคุณภาพ (Quality Record) ที่ Retention Clock ครบกำหนดตามตารางระยะเวลาจัดเก็บ ผ่านการอนุมัติก่อนเสมอ | Must | AC-11 |
| **FR-SH06** | ระบบต้องบันทึก Destruction Log (ผู้ร้องขอ, ผู้อนุมัติ, รายการ, วันที่) ทุกครั้งที่มีการทำลายข้อมูล และเก็บรักษา log นี้ไว้อย่างน้อย 5 ปี โดยห้ามลบข้อมูลอัตโนมัติ (No Auto-Deletion) | Must | ตรวจสอบ Destruction Log ครบถ้วน ไม่มีรายการถูกลบโดยไม่มี Log |

> **แหล่งที่มา:** qmsdatalifecyclepolicy.md (QMS Data Life Cycle Policy) อ้างอิง ISO 9001:2015 ข้อ 7.5.3 (Control of Documented Information) — ปิด `TBD-EFL-09` เนื้อหาแยกความแตกต่างระหว่าง "เอกสารคุณภาพ" (Document) และ "บันทึกคุณภาพ" (Quality Record) อย่างชัดเจน รวมถึงตารางระยะเวลาจัดเก็บ 5 ระดับ (Permanent/10 ปี/5 ปี/3 ปี/1 ปี) — รายละเอียดตารางเต็มอยู่ที่ §6.1.1 หมายเหตุ: เอกสารต้นทางครอบคลุมบันทึกระดับคณะที่กว้างกว่าระบบ E-Filing (เช่น ครุภัณฑ์ งบประมาณ วิชาการ) รายการเหล่านั้นอยู่นอกขอบเขต Phase 1 (§6.3) — SRS ฉบับนี้สกัดเฉพาะกฎที่บังคับใช้กับ Entity ที่ระบบดูแลจริงตาม Appendix B.3

---

### 4.16 My Task Checklist — UC-16

| Priority | Source / Coverage |
| :--- | :--- |
| **Should** | US-A08; FR-A16 |

#### Use Case Specification

| Field | รายละเอียด |
| :--- | :--- |
| **Goal** | ให้ผู้ใช้แต่ละคนเห็นรายการงานค้างส่วนบุคคลของตนเอง (DAR ที่ต้องอนุมัติ, เอกสารที่มอบหมายให้ตนแต่ยังไม่ได้รับทราบ) แยกต่างหากจาก Operational Dashboard รวมของ Group B — **✅ เกิดจากมติปิด TBD-EFL-12 (Module Boundary Split): Group A เป็นเจ้าของหน้าจอนี้ (personal task queue), Group B เป็นเจ้าของ Operational Dashboard เชิงสถิติรวมเท่านั้น (UC-12)** |
| **Primary Actor** | End User / Document Owner / Approver (ทุกบทบาทที่มีงานค้างในโมดูล Group A) |
| **Preconditions** | ผู้ใช้ Login สำเร็จ และมีรายการ DAR/Acknowledgement ที่ผูกกับตนในสถานะยังไม่เสร็จสิ้น |
| **Success Postconditions** | ผู้ใช้เห็นรายการงานค้างของตนเองเท่านั้น ไม่เห็นข้อมูลของผู้ใช้อื่นหรือสถิติรวมทั้งองค์กร |

#### Scenarios

* **Main Success Scenario:**
  1. ผู้ใช้เปิดเมนู "งานของฉัน (My Task Checklist)" จากหน้าหลัก
  2. ระบบกรองข้อมูลเฉพาะรายการที่ผูกกับ `user_id` ของผู้ใช้ปัจจุบัน — DAR ที่รอตนอนุมัติ (กรณี Approver), DAR ของตนที่ถูกปฏิเสธ/รอทบทวน (กรณี Document Owner), เอกสารที่มอบหมายให้ตนแต่ยังไม่ได้กดรับทราบ (กรณี End User ที่อยู่ใน Dual Mapping target)
  3. ระบบแสดงรายการพร้อมปุ่มลัดไปยังหน้าจอที่เกี่ยวข้อง (Approval Queue / Document Detail / Acknowledgement)
* **Alternate Flows:**
  * **A1 (ไม่มีงานค้าง):** หากผู้ใช้ไม่มีรายการค้างใด ๆ ระบบแสดงข้อความ "ไม่มีงานค้างในขณะนี้" แทนรายการว่างเปล่า
* **Exception Flows:** — ไม่มี Exception Flow เพิ่มเติมนอกเหนือจากการตรวจสอบสิทธิ์ผู้ใช้มาตรฐาน (RBAC Context Guard)

#### Requirements & Verification

| ID | Requirement | Priority | Verification |
| :--- | :--- | :--- | :--- |
| **FR-A16** | ระบบต้องแสดงรายการงานค้างส่วนบุคคล (DAR รออนุมัติ/ทบทวน, เอกสารรอรับทราบ) เฉพาะของผู้ใช้ปัจจุบัน แยกจาก Operational Dashboard รวมของ Group B | Should | AC-13; ผู้ใช้ A เห็นเฉพาะงานของตน ไม่เห็นของผู้ใช้ B |

> **หมายเหตุขอบเขต:** UC-16 เป็น "dashboard lite" ระดับบุคคลของ Group A ตามที่ระบุไว้แล้วใน §1.2/Core Semantic และ Appendix B.5 ("Group A อาจมี dashboard/summary ระดับ 'my task' ของตนเองได้ แต่ไม่ใช่ dashboard รวมของระบบ") — ไม่ทับซ้อนกับ FR-B11..13/UC-12 ซึ่งเป็นสถิติรวมระดับองค์กรของ Group B เท่านั้น

---

## 5. Other Nonfunctional Requirements

### 5.1 Performance Requirements

เอกสารต้นทางยังไม่มีตัวเลข Response Time/Concurrent Users/Throughput ที่ยืนยันแล้ว (NFR-04 ระบุเพียง "เวลาที่เหมาะสม") จึงไม่สร้างตัวเลขสมมติในเอกสารนี้

| TBD | สิ่งที่ต้องกำหนด | Verification เมื่อปิดประเด็น |
| :--- | :--- | :--- |
| **TBD-EFL-13** | Response time ของการค้นหา document/record ในชุดข้อมูล pilot ("เวลาที่เหมาะสม" ใน NFR-04) | Performance test ตาม threshold ที่ Stakeholder อนุมัติ |
| **TBD-EFL-14** | จำนวนผู้ใช้พร้อมกันที่ต้องรองรับ | Load test |

### 5.2 Safety Requirements

ไม่มี Safety Requirement เฉพาะในเอกสารต้นทาง (BRD/SRS/SE02 Mapping ไม่ได้กล่าวถึงประเด็นความปลอดภัยเชิงกายภาพ)

### 5.3 Security Requirements

| ID | Requirement | Verification |
| :--- | :--- | :--- |
| **FR-SH01** | ระบบต้องมี Login และ JWT-based session หรือเทียบเท่า | Authentication scenario |
| **FR-SH02** | ระบบต้องมี RBAC ขั้นพื้นฐาน | Role-based positive/negative test |
| **FR-SH03** | ระบบต้องมี shared role และ shared user id ระหว่าง Group A/B | Integration test — **Foundational Requirement**: เป็นรากฐานของสถาปัตยกรรม backend เดียวกัน (§2.1, §3.3.1) ที่ทุก Use Case ใช้ร่วมกัน จึงไม่ผูกกับ UC เดียว แต่ตรวจสอบผ่าน Traceability ที่ BR-14 (Appendix E.1) |
| **FR-SH05** | ระบบต้องมี seed data จาก Master List/DAR/Pilot documents | ตรวจสอบข้อมูลตั้งต้นสอดคล้องกับ Master List/DAR Register ตัวอย่างจริง (REF-07) |
| **NFR-01** | RBAC ต้องบังคับสิทธิ์ทุกเมนูและ API สำคัญ | Authorization negative test |
| **NFR-02** | Event สำคัญต้องเก็บ who/what/when/before-after เท่าที่จำเป็น | Audit record inspection |

### 5.4 Software Quality Attributes

| Attribute | Requirement / Design Intent | Evidence / Verification |
| :--- | :--- | :--- |
| **Usability (NFR-03)** | ผู้ใช้ทั่วไปค้นหาเอกสาร current version ได้ในไม่เกิน 3 คลิกจากหน้าหลัก | Should; usability test |
| **Performance (NFR-04)** | การค้นหา document/record ตอบสนองในเวลาที่เหมาะสม | Should; ตัวเลขจริงรอ TBD-EFL-13 |
| **Maintainability (NFR-05)** | โค้ดแยก module ตาม Group A/B และแยกชั้น business logic | Must; code review |
| **Interoperability (NFR-06)** | Group B ใช้ข้อมูล document ผ่าน Internal Interface Contract ไม่ duplicate schema (ปรับจาก "API contract" เดิม เนื่องจากทั้งคู่ใช้ backend เดียวกัน — ดู §3.3) | Must; integration test |
| **Data Integrity (NFR-07)** | current version ต้องถูกต้องหลังทุก publish/obsolete/revise scenario | Must; regression test |
| **Reliability (NFR-08)** | demo workflow หลักต้องทำงานซ้ำได้ไม่ล้มใน UAT | Must; UAT |
| **Backup (NFR-09)** | ต้องมีวิธี backup database และ upload files ระดับโครงการ | Should |
| **Documentation (NFR-10)** | มี README, test cases, Internal Interface Contract (เดิมเรียก API contract), ERD, คู่มือ demo | Must |

### 5.5 Business Rules

| ID | Business Rule | Status | Implication |
| :--- | :--- | :--- | :--- |
| **BRULE-EFL-01** | Published document ที่เป็น current version ต้องมีเพียง 1 ฉบับต่อ document code | Reviewed / Mandatory | บังคับ unique constraint ระดับ business logic |
| **BRULE-EFL-02** | Obsolete document ต้องไม่แสดงเป็น default ให้ End User ใช้งาน | Reviewed / Mandatory | ต้องกรองสถานะในผลค้นหา |
| **BRULE-EFL-03** | DAR ต้องระบุ requester, reviewer/approver, action type, reason และ status | Reviewed / Mandatory | Validation ก่อน submit |
| **BRULE-EFL-04** | ทุกการ approve/reject/publish/obsolete/acknowledge ต้องมี audit trail | Reviewed / Mandatory | เชื่อมกับ FR-SH04 |
| **BRULE-EFL-05** | Acknowledgement ต้องผูกกับ document version ไม่ใช่เฉพาะ document code | Reviewed / Mandatory | Data model ต้องมี version_id บน Ack |
| **BRULE-EFL-06** | Record ต้องผูกกับ document หรือ finding/CAR อย่างน้อยหนึ่งรายการเมื่อเป็นหลักฐาน audit/CAR | Reviewed / Mandatory | Validation บน Record |
| **BRULE-EFL-07** | CAR ต้องมี owner, due date, status, root cause, corrective action และ evidence ก่อน close | Reviewed / Mandatory | Required fields ก่อนเปลี่ยนสถานะ Closed |
| **BRULE-EFL-08** | Dashboard ห้ามใช้ mock data ใน final demo ต้องดึงข้อมูลจาก transaction จริง | Reviewed / Mandatory | Integration ต้องเสร็จก่อน demo |
| **BRULE-EFL-09** | Group B ต้องอ้างอิงข้อมูล document จาก Group A ผ่าน shared contract ไม่สร้าง document master ซ้ำ | Reviewed / Mandatory | สถาปัตยกรรม/ownership boundary |
| **BRULE-EFL-10** | ในรอบ 3 เดือนใช้ single-level approval ก่อน ไม่ทำ multi-level approval ซับซ้อน | Reviewed / Mandatory | จำกัด scope ของ Approval workflow |
| **BRULE-EFL-11** | Approver (เช่น คณบดี/QMR) ต้องเป็นคนละบทบาทกับ ISO Admin/DCC เสมอ (Segregation of Duties) — ห้ามให้บุคคลเดียวกันทั้งอนุมัติและ publish เอกสารเดียวกัน | Reviewed / Mandatory (จาก businesspolicies.md, TBD-EFL-04) | Authorization test: role ผู้ approve ≠ role ผู้ publish |
| **BRULE-EFL-12** | ผู้ทำหน้าที่ Verify CAR (Assistant DCC/Auditor ผู้แจ้งพบ) ต้องไม่ใช่บุคคลเดียวกับผู้ทำหน้าที่ Close CAR (QMR/Lead Auditor) | Reviewed / Mandatory (จาก businesspolicies.md, TBD-EFL-07) | Authorization test: actor Verify ≠ actor Close ในเรคคอร์ดเดียวกัน |
| **BRULE-EFL-13** | ผู้ใช้ที่เลิกใช้งานต้องถูกตั้งค่า `isActive: false` (Soft Delete) ห้ามลบบัญชีจริง (Hard Delete) เพื่อรักษา Traceability ของ Acknowledgement/Audit Trail ที่ผูกกับผู้ใช้นั้น | Reviewed / Mandatory (จาก businesspolicies.md, TBD-EFL-01) | ตรวจสอบว่าบัญชีที่ปิดใช้งานยังปรากฏใน Audit Trail/Ack History เดิมได้ |
| **BRULE-EFL-14** | เอกสาร (Document) ที่เปลี่ยนสถานะเป็น Obsolete ต้องถูกจัดเก็บรักษาไว้อย่างน้อย 1 รุ่นการแก้ไข (1 Revision) ก่อนจึงจะเข้าเกณฑ์ยื่นขอทำลายได้ | Reviewed / Mandatory (จาก qmsdatalifecyclepolicy.md, TBD-EFL-09) | ตรวจสอบว่าไม่มี Obsolete revision ที่ถูกลบก่อนครบเกณฑ์ 1 revision |
| **BRULE-EFL-15** | บันทึกคุณภาพ (Quality Record) เริ่มนับอายุการจัดเก็บ (Retention Clock) ทันทีที่ธุรกรรมเสร็จสิ้นและปิดเคส (Closed/Signed-off) ไม่ใช่ตั้งแต่วันที่สร้างรายการ | Reviewed / Mandatory (จาก qmsdatalifecyclepolicy.md, TBD-EFL-09) | ตรวจสอบ retention_expiry คำนวณจาก closed_at ไม่ใช่ created_at |
| **BRULE-EFL-16** | ห้ามระบบลบเอกสารหรือบันทึกคุณภาพใดๆ โดยอัตโนมัติเมื่อครบกำหนดจัดเก็บ (No Auto-Deletion) — ต้องผ่านการยื่นคำร้องและได้รับอนุมัติจาก QMR/ผู้อนุมัติตามสายงานก่อนทุกครั้ง | Reviewed / Mandatory (จาก qmsdatalifecyclepolicy.md, TBD-EFL-09) | Negative test: เรียก destroy endpoint โดยไม่มีสถานะอนุมัติต้องถูกปฏิเสธ (E1, UC-15) |
| **BRULE-EFL-17** | การทำลายข้อมูล (Hard Delete) ทุกครั้งต้องบันทึกลง Destruction Log (ผู้ร้องขอ, ผู้อนุมัติ, รายการ, วันที่) และเก็บรักษา log นี้ไว้อย่างน้อย 5 ปี | Reviewed / Mandatory (จาก qmsdatalifecyclepolicy.md, TBD-EFL-09) | ตรวจสอบทุกรายการที่ถูกทำลายมี Destruction Log ที่สอดคล้องกัน |
| **BRULE-EFL-18** | สิทธิ์การมองเห็น: End User เห็นเอกสารเฉพาะสถานะ Published; พนักงานทั่วไปเห็นบันทึกคุณภาพเฉพาะของตนเอง; ISO/QA Admin (DCC)/ผู้บริหารเท่านั้นที่ดึงรายงานสรุป/สถิติของบันทึกคุณภาพทั้งหมดได้ | Reviewed / Mandatory (จาก qmsdatalifecyclepolicy.md, TBD-EFL-09) | RBAC negative test แยกตาม role ผู้ใช้ทั่วไป vs DCC/ผู้บริหาร |
| **BRULE-EFL-19** | ไฟล์แนบของเอกสารควบคุมระดับ QM/QP/WI/SD ต้องเป็นไฟล์ประเภท PDF (`application/pdf`) เท่านั้น ระบบต้องปฏิเสธไฟล์ประเภทอื่น (เช่น รูปภาพ, สเปรดชีต) | **Engineering Control** — ปรับสถานะจากเดิม (v0.10): ตรวจสอบ QP-2301-0107 Rev.02 ฉบับเต็มแล้ว **ไม่พบข้อบังคับรูปแบบไฟล์ (file-format mandate) ใดๆ** ในระเบียบควบคุมเอกสาร — จึงไม่ใช่ข้อบังคับจาก QP โดยตรง แต่เป็น**การตัดสินใจเชิงวิศวกรรมของทีมพัฒนา**เพื่อรักษาความถูกต้องของเนื้อหาและป้องกันการแก้ไข/ปลอมแปลงเอกสารควบคุมโดยไม่ได้รับอนุญาต สอดคล้องกับเจตนารมณ์ของ ISO 9001:2015 ข้อ 7.5.3 (การควบคุมสารสนเทศที่เป็นเอกสาร) | Negative test: อัปโหลดไฟล์ที่ไม่ใช่ PDF ต้องถูกปฏิเสธพร้อมข้อความแจ้งเตือน |
| **BRULE-EFL-20** | การอนุมัติ/ปฏิเสธ DAR ต้องมีการตรวจสอบ Concurrency (Optimistic Locking) เพื่อป้องกันผู้อนุมัติหลายคนบันทึกทับซ้อนรายการเดียวกัน | Reviewed / Mandatory (จาก usecaseflows.md, UC-03 E1) | Concurrency test: ผู้อนุมัติ 2 คนกดบันทึกพร้อมกัน ต้องมีเพียงรายการแรกสำเร็จ |
| **BRULE-EFL-21** | ห้ามออกใบ CAR ไปยังแผนก/หน่วยงานที่ยังไม่มีผู้ใช้ลงทะเบียนรับบทบาทผู้รับผิดชอบ (Document Owner/ผู้ประสานงานคุณภาพ) | Reviewed / Mandatory (จาก usecaseflows.md, UC-10 E1) | Negative test: เปิด CAR ไปยังแผนกที่ไม่มีผู้รับผิดชอบต้องถูกปฏิเสธ |
| **BRULE-EFL-22** | Finding (NC) เกิดขึ้นได้จากรอบตรวจติดตามประจำปี (ผูกกับ AuditRound, `audit_round_id` มีค่า) **หรือ**จากแหล่งอื่นนอกรอบตรวจ เช่น ข้อร้องเรียนผู้รับบริการ (QP-2301-0106) หรือมติที่ประชุมทบทวนโดยฝ่ายบริหาร (QP-2301-0101) — กรณีหลัง `audit_round_id` ต้องเป็น NULL และต้องมี `record_id`/แหล่งอ้างอิงอื่นแทนเพื่อรักษา Traceability | Reviewed / Mandatory (มติผู้ใช้/Product Owner อ้างอิง QP-2301-0109 ข้อ 2 และ 6.1.1 — TBD-EFL-15 RESOLVED) | ตรวจสอบว่า Finding ทุกรายการมีอย่างน้อยหนึ่งใน audit_round_id หรือ record_id/แหล่งอ้างอิงเสมอ |
| **BRULE-EFL-23** | เมื่อเอกสาร (Document) เปลี่ยนสถานะเป็น Obsolete ทุกรายการใน DistributionList ของ revision นั้นที่ยังมีสถานะ `Active` ต้องถูกปรับเป็น `Withdrawn` โดยอัตโนมัติ | Reviewed / Mandatory (มติผู้ใช้/Product Owner อ้างอิง QM-2301-01 ข้อ 7.5.3, REF-13) | ตรวจสอบว่าไม่มี DistributionList entry สถานะ Active ผูกกับ document revision ที่เป็น Obsolete |
| **BRULE-EFL-24** | หน้าจอ preview, ไฟล์ที่ดาวน์โหลด และผลพิมพ์ของเอกสาร Published ทุกรายการต้องแสดงป้ายกำกับ/ลายน้ำ "สำเนาไม่ควบคุม / Uncontrolled Copy" เนื่องจากไฟล์อิเล็กทรอนิกส์บนแพลตฟอร์มออนไลน์จัดเป็น Uncontrolled Document ตาม QP-2301-0107 ข้อ 6.6 | Reviewed / Mandatory (มติผู้ใช้/Product Owner อ้างอิง QP-2301-0107 ข้อ 6.6, REF-13 — ปิด TBD-EFL-16) | ตรวจสอบว่าทุกช่องทาง (preview/download/print) มีป้ายกำกับปรากฏ |
| **BRULE-EFL-25** | ไฟล์แนบของ Record (RecordFile) แต่ละไฟล์ต้องมีขนาดไม่เกิน **20MB (ค่าตั้งต้นชั่วคราว)** ระบบต้องปฏิเสธไฟล์ที่เกินขนาดกำหนดเป็นรายไฟล์ | **Provisional / รอยืนยัน — เปิด TBD-EFL-17 (v0.11)** ตรวจสอบย้อนกลับแล้วไม่พบเอกสารต้นทางใดระบุตัวเลข 20MB ไว้จริง (เดิมอ้างอิง REF-14 ผิดพลาด แก้ไขแล้ว) เป็นค่าเริ่มต้นที่ BA/ทีมพัฒนาเสนอไว้ชั่วคราวเพื่อไม่ให้ระบบไม่มีการป้องกันขนาดไฟล์เลย รอ Stakeholder ยืนยันตัวเลขจริงก่อน Baseline | Negative test: อัปโหลดไฟล์ขนาด >20MB (ค่าตั้งต้น) ต้องถูกปฏิเสธเฉพาะไฟล์นั้น — ตัวเลขอาจเปลี่ยนเมื่อ TBD-EFL-17 ปิด |
| **BRULE-EFL-26** | ห้ามอนุมัติคำร้องขอทำลาย (Destruction Request, UC-15) เอกสารหรือบันทึกคุณภาพที่ยังมี Record อ้างอิงอยู่ (Active Reference ผ่าน document_id/finding_id/car_id) เว้นแต่จะยกเลิกหรือย้ายการอ้างอิงออกก่อน | Reviewed / Mandatory (วิเคราะห์โดย BA เพื่อป้องกัน Referential Integrity Failure ใน UC-08 E2) | Negative test: ยื่นคำร้องทำลายรายการที่ยังมี Record ผูกอยู่ต้องถูกปฏิเสธ/บล็อกก่อนถึงขั้นอนุมัติ |
| **BRULE-EFL-27** | ไฟล์แนบของเอกสารควบคุม (Document) ต้องมีขนาดไม่เกินเกณฑ์สูงสุดตามประเภทเอกสาร: **QM ≤ 22MB, QP ≤ 12MB, SD ≤ 104MB, FM ≤ 4MB** ระบบต้องปฏิเสธไฟล์ที่เกินขนาดกำหนดตามประเภท (**WI ยังไม่มีเกณฑ์กำหนด** เนื่องจากยังไม่มีไฟล์จริง ณ ปัจจุบัน — ดู Glossary) | Reviewed / Mandatory (ข้อมูลผู้ใช้/Product Owner ระบุขนาดไฟล์สูงสุดของเอกสารจริงที่มีอยู่ในปัจจุบันแต่ละประเภท ให้ไว้ในการสนทนา v0.11, REF-15 — ยังไม่มีเอกสาร QMS ฉบับทางการระบุตัวเลขนี้โดยตรง) | Negative test: อัปโหลดไฟล์เกินขนาดตามประเภทเอกสารต้องถูกปฏิเสธ ทดสอบแยกตาม QM/QP/SD/FM |

---

## 6. Other Requirements

### 6.1 Data and Audit Requirements

โครงสร้างข้อมูลเชิงตรรกะ (ไม่ใช่ Database Schema) และ Data Domain หลัก:

| Domain | Entity หลัก | Owner |
| :--- | :--- | :--- |
| Identity | User, Role, Department | Shared |
| Document | Document, DocumentRevision, DistributionList | A |
| Workflow | DAR | A |
| Awareness | Acknowledgement | A |
| Evidence | Record, RecordFile | B |
| Audit | AuditRound, Finding | B |
| Corrective Action | CAR | B |
| Governance & Retention | AuditTrail, DestructionLog | Shared |
| File Storage | File | Shared |

> **แก้ไข Consistency (v0.12):** ตารางนี้เดิมค้างมาตั้งแต่ v0.2 มีชื่อ Entity สมมติที่ไม่เคยถูกสร้างจริงใน Appendix B.3 (เช่น DocumentVersion, DocumentFile, RevisionHistory, ApprovalLog, AckAssignment, RecordType, AuditEvidence, CARAction, CAREvidence, DashboardMetric, OverdueView) — ปรับให้ตรงกับ Entity จริงทั้งหมด **Overdue status** (FR-B09) และ **Dashboard aggregates** (FR-B11..13) เป็นค่าที่คำนวณแบบ Derived จาก Entity ข้างต้นผ่าน Internal Module Interface แบบ real-time ไม่ใช่ Entity ที่จัดเก็บแยกต่างหาก จึงไม่มีแถวของตนเองในตารางนี้

**Logical Data Entities (รายละเอียด key fields):** ดู Appendix B.3

- ทุก Decision/Change ต้องเชื่อมกับ Event/Item และมี Actor, Reason, Timestamp ตาม FR-SH04

#### 6.1.1 นโยบายวงจรชีวิตข้อมูล (QMS Data Life Cycle Policy) — `TBD-EFL-09` ✅ RESOLVED

> **มติ (REF-10, qmsdatalifecyclepolicy.md):** สอดคล้องตาม **ISO 9001:2015 ข้อ 7.5.3** ระบบ E-Filing แยกสินทรัพย์ข้อมูลออกเป็น 2 ประเภทอย่างเด็ดขาด และบังคับใช้กฎการจัดเก็บ/ทำลายที่แตกต่างกันตามตารางด้านล่าง กระบวนการยื่นขอและอนุมัติทำลายข้อมูลถูกออกแบบเป็น **UC-15 (Data Retention & Destruction Management)**

**(ก) การจำแนกประเภทข้อมูล**

| ประเด็น | เอกสารคุณภาพ (Document) | บันทึกคุณภาพ (Quality Record) |
| :--- | :--- | :--- |
| คุณลักษณะ | **Dynamic** — ทบทวน/แก้ไขเวอร์ชันได้ตามรอบ (QM/QP/WI/SD/FM Template) | **Static** — ห้ามแก้ไขย้อนหลังเด็ดขาด (หลักฐานธุรกรรมที่เกิดขึ้นแล้ว) |
| ตรรกะเวอร์ชัน | Revision Control ผ่าน DAR (Draft→...→Published→Obsolete) | ไม่มีรุ่นแก้ไข — ผูกกับ transaction ID/timestamp/actor เฉพาะรายการ |
| จุดเริ่มนับอายุจัดเก็บ (Retention Trigger) | ไม่มีกำหนดลบขณะยัง Published; **เริ่มนับเมื่อเปลี่ยนเป็น Obsolete เท่านั้น** | **เริ่มนับทันทีที่ธุรกรรมเสร็จสิ้นและปิดเคส (Closed/Signed-off)** เช่น CAR ปิดโดย QMR, Ack บันทึกสำเร็จ |
| การเก็บถาวร | เก็บฉบับ Obsolete ไว้อย่างน้อย **1 Revision** เพื่ออ้างอิงประวัติ (BRULE-EFL-14) | จัดเก็บรวมศูนย์ในฐานข้อมูลกลางตามระยะเวลาจัดเก็บเฉพาะประเภท (ตาราง (ข) ด้านล่าง) |
| RBAC | End User เห็นเฉพาะสถานะ Published; DCC/Admin เห็น/ควบคุมได้ทุกสถานะ | พนักงานทั่วไปเห็นเฉพาะบันทึกของตนเอง; ผู้บริหาร/DCC ดึงรายงานสถิติรวมได้ (BRULE-EFL-18) |
| Entity ที่เกี่ยวข้อง (Appendix B.3) | Document, DocumentRevision | DAR, Acknowledgement, Record, Finding, CAR, AuditTrail |

**(ข) ตารางระยะเวลาจัดเก็บ (Retention Period) ของ Entity ที่ระบบดูแล**

| ระดับ | ระยะเวลา | Entity ในระบบนี้ | อ้างอิง |
| :--- | :--- | :--- | :--- |
| 1 | **ถาวร (Permanent)** | AuditTrail (Audit Trail Logs) | FR-SH04 / NFR-02 |
| 3 | **5 ปี** | DAR, Acknowledgement (Distribution List / Ack Log), รายงานผลตรวจติดตามคุณภาพภายใน (AuditRound/Finding) | FM-QP-2301-0107-xx, FM-QP-2301-0102-xx |
| 4 | **3 ปี** | CAR, Finding/NCR และผลการทวนสอบประสิทธิผล | FM-QP-2301-0109-xx |
| — | **ตามเกณฑ์ Obsolete** | Document/DocumentRevision (นับ 1 Revision หลัง Obsolete ไม่ใช่ปีปฏิทิน) | BRULE-EFL-14 |

> ระดับ 2 (10 ปี) และระดับ 5 (1 ปี) ตามเอกสารต้นทาง (ครุภัณฑ์ ตำแหน่งวิชาการ งบประมาณ แผนความเสี่ยง ฯลฯ) เป็นบันทึกระดับคณะที่ **นอกขอบเขต Phase 1** (§6.3) — ระบบ E-Filing Phase 1 ไม่มี Entity รองรับโดยตรง จึงไม่นำมาบังคับใช้ในเอกสารฉบับนี้ หากมี Data Domain ใหม่ในอนาคตต้องผ่าน Change Request ก่อนผูกกับตารางนี้

**(ค) นโยบายการทำลายข้อมูล (No Auto-Deletion)**

ระบบ **ห้ามลบข้อมูลอัตโนมัติ** (ทั้ง Document และ Quality Record) เมื่อครบกำหนดจัดเก็บ — ทุกการทำลายต้องผ่านกระบวนการ: (1) ระบบระบุรายการที่ครบเกณฑ์ → (2) ISO/QA Admin (DCC) ยื่นคำร้องขออนุมัติทำลาย → (3) QMR/ผู้อนุมัติตามสายงานลงนามอนุมัติ → (4) DCC ดำเนินการทำลายจริง (Hard Delete บน PostgreSQL Metadata + ไฟล์บน Disk Storage) → (5) ระบบบันทึก Destruction Log เก็บรักษาอย่างน้อย 5 ปี — รายละเอียดเต็มดู **UC-15 (§4.15)** และ BRULE-EFL-16/17

### 6.2 Language and Terminology

- เอกสารต้นทางทั้งหมดเป็นภาษาไทย และระบบสันนิษฐานว่าใช้ภาษาไทยเป็นหลัก — ยังไม่มีข้อกำหนดเรื่อง bilingual UI (`TBD-EFL-10`)
- ชื่อสถานะต้องใช้คำให้สม่ำเสมอ: **Published/Current ≠ Approved**, **Item Decision ≠ Overall Status** (ดู UI wording checkpoint §3.1)

### 6.3 Release and Change Boundary

SRS ฉบับนี้ครอบคลุมเฉพาะ **Phase 1 MVP + Operational Dashboard** ตามที่ยืนยันใน BRD/SE02 Mapping รายการที่อยู่นอกขอบเขต (Risk register เต็มระบบ, HR/training matrix, Management Review เต็มรูปแบบ, Executive dashboard ขั้นสูง, KPI analytics เชิงลึก, SSO/LDAP จริง, Email/LINE notification จริง, OCR/scanner, Mobile native app) จะพิจารณาใน **Phase 2/3** และต้องผ่านกระบวนการ Change Request/Impact Analysis ก่อนเพิ่มเข้ามาในขอบเขต โดยไม่เขียนทับประวัติเดิม

**Ownership Boundary ระหว่าง Group (ห้ามทับกัน):** ดูรายละเอียดเต็มที่ Appendix B.5

---

## Appendix A: Glossary

| Term | คำอธิบาย |
| :--- | :--- |
| **E-Filing** | ชื่อระบบบริหารเอกสารและหลักฐานคุณภาพที่พัฒนาในโครงการนี้ |
| **DAR (Document Amendment Request)** | คำขอสร้าง/แก้ไข/ยกเลิกเอกสารคุณภาพ |
| **CAR (Corrective Action Request)** | คำขอดำเนินการแก้ไขจาก finding |
| **QM / QP / WI / SD / FM** | Quality Manual / Quality Procedure / Work Instruction (วิธีปฏิบัติงาน) / Support Document / Form ตามระบบ ISO 9001:2015 — **หมายเหตุ:** ระดับ **WI** ยังไม่มีไฟล์จริงที่จัดทำเสร็จ ณ ปัจจุบัน อยู่ระหว่างดำเนินการจัดทำโดยหน่วยงาน (ผู้ใช้ยืนยันในการสนทนา) จึงยังไม่มี WI ปรากฏใน seed data ตัวอย่างสำหรับ FR-SH05 ในช่วงเริ่มต้นของ Phase 1 |
| **Distribution List (บัญชีรายชื่อผู้ถือครองเอกสาร)** | ทะเบียนรายชื่อ/ตำแหน่งของผู้ถือครองสำเนาควบคุม (Controlled Copy) ของเอกสารแต่ละฉบับ ดูแลโดยผู้มีหน้าที่ควบคุมเอกสารส่วนกลาง (DCC) ตาม QM-2301-01 ข้อ 7.5.3 — เป็น Entity แยกจาก Acknowledgement (ซึ่งบันทึกการรับทราบเนื้อหา ไม่ใช่การถือครองสำเนาควบคุม) |
| **Controlled Copy (สำเนาควบคุม)** | สำเนาเอกสารที่อยู่ในบัญชี Distribution List และได้รับการปรับปรุงให้ทันสมัยทุกครั้งที่มีการแก้ไข — ในบริบทระบบ E-Filing คือสำเนากระดาษ/สำเนาที่ DCC ควบคุมด้วยตนเอง ไม่ใช่ไฟล์อิเล็กทรอนิกส์บนแพลตฟอร์มออนไลน์ (ดู Uncontrolled Copy) |
| **Uncontrolled Copy / Uncontrolled Document (สำเนาไม่ควบคุม)** | สถานะของไฟล์อิเล็กทรอนิกส์ (Electronic File) ที่จัดเก็บบนแพลตฟอร์มออนไลน์ของระบบ E-Filing ตาม QP-2301-0107 ข้อ 6.6 — แม้จะเป็นไฟล์ Published/current version ก็ตาม ไฟล์เหล่านี้ **ไม่ถือเป็น Controlled Copy** ระบบจึงต้องแสดงป้ายกำกับ/ลายน้ำกำกับทุกครั้งที่ preview/download/print (BRULE-EFL-24) |
| **Master List** | ทะเบียนรายชื่อเอกสารคุณภาพทั้งหมด |
| **DAR Register** | ทะเบียนคุมใบขอดำเนินการเอกสาร |
| **Current Version** | เอกสารฉบับที่ Published และใช้งานจริง ณ ปัจจุบัน (มีได้เพียง 1 ฉบับต่อ document_code) |
| **Finding** | ข้อบกพร่อง/ข้อสังเกตที่พบ — มาจากการตรวจติดตาม (audit, ผูกกับ AuditRound) **หรือ**จากแหล่งอื่น เช่น ข้อร้องเรียนผู้รับบริการหรือการประชุมทบทวนโดยฝ่ายบริหาร (Non-Audit Source, audit_round_id = NULL) ตาม TBD-EFL-15 RESOLVED |
| **Root Cause / Corrective Action** | สาเหตุที่แท้จริงและมาตรการแก้ไขของ CAR |
| **Overdue** | สถานะ CAR ที่เลยกำหนด due_date และยังไม่ Closed |
| **RBAC** | Role-Based Access Control — การควบคุมสิทธิ์ตามบทบาท |
| **Audit Trail** | บันทึกประวัติ who/what/when ของ event สำคัญในระบบ |
| **MVP** | Minimum Viable Product — ขอบเขตขั้นต่ำที่ใช้งานได้จริงภายใน 3 เดือน |
| **Shared Contract / Internal Module Interface** | ข้อตกลง Data/Interface กลางระหว่าง Group A และ Group B ที่ทำงานบน backend เดียวกัน (เรียกใช้ผ่าน function/service call ภายใน ไม่ใช่ network API) |
| **Group A / Group B** | ทีมนักศึกษาที่รับผิดชอบ Document Control/DAR/Ack และ Records/Audit/CAR/Dashboard ตามลำดับ |
| **DCC (Document Control Center/Coordinator)** | บทบาทเชิงธุรการของ ISO/QA Admin — ผู้ Publish เอกสารและดูแลบัญชีผู้ใช้ หลังได้รับอนุมัติจาก Approver แล้ว |
| **QMR (Management Representative / ผู้แทนฝ่ายบริหาร)** | ผู้มีอำนาจด้านคุณภาพระดับคณะ อาจทำหน้าที่ Approver ของ DAR และมีสิทธิ์ Close CAR ร่วมกับ Lead Auditor |
| **Lead Auditor** | ผู้ตรวจประเมินหลักที่บันทึกไว้ในหัว AuditRound แต่ละรอบ มีสิทธิ์ Close CAR ร่วมกับ QMR |
| **Assistant DCC** | ผู้ช่วยเลขานุการคณะกรรมการระบบคุณภาพ มีสิทธิ์ Verify CAR (ตรวจหน้างานจริง) แต่ไม่มีสิทธิ์ Close |
| **Segregation of Duties (SoD)** | หลักการแยกอำนาจหน้าที่เพื่อป้องกันผลประโยชน์ทับซ้อน เช่น Approver ≠ ISO Admin/DCC, ผู้ Verify CAR ≠ ผู้ Close CAR |
| **Document Master** | ตารางหลักที่เก็บ document_code แบบ Unique เป็น Single Source of Truth ผูกกับ DocumentRevision แบบ One-to-Many |
| **DocumentRevision** | รุ่นของเอกสารแต่ละครั้งที่แก้ไข/ประกาศใช้ (เดิมเรียก DocumentVersion ในเอกสาร SRS ต้นทาง — entity เดียวกัน) |
| **isActive** | Flag บนตาราง User สำหรับปิดใช้งานบัญชีแบบ Soft Delete แทนการลบจริง เพื่อรักษา Traceability |
| **AuditRound** | Header เดียวคุมรอบการตรวจติดตามประจำปี ผูก Lead Auditor และ Finding/NC เป็น Child Record |
| **Multer (DiskStorage)** | Middleware อัปโหลดไฟล์ (Node.js ecosystem) ที่ใช้เก็บไฟล์เอกสาร/หลักฐานบน Local Server File System |
| **Dual Mapping Method** | วิธีกำหนดกลุ่มเป้าหมายผู้รับทราบเอกสาร โดยเลือกได้ทั้งตามแผนก/บทบาท และเจาะจงรายบุคคล |
| **Two-Step Authorization** | กระบวนการ Verify และ Close CAR ที่แยกผู้ปฏิบัติ 2 คนไม่ให้เป็นคนเดียวกัน |
| **Prisma** | ORM (Object-Relational Mapping) ที่ใช้เชื่อม Backend (Express.js) กับฐานข้อมูล PostgreSQL |
| **RBAC Context Guard** | กลไกตรวจสอบสิทธิ์ตามบทบาทก่อนแสดงผล/อนุญาต action เช่น กรองผลค้นหาให้เห็นเฉพาะเอกสาร Published สำหรับ End User |
| **Document Directory** | เมนู/หน้าจอสืบค้นเอกสารคุณภาพกลางที่ End User ใช้ค้นหาด้วยรหัส/ชื่อ/ประเภท/แผนก |
| **Least Privilege** | หลักการให้สิทธิ์ผู้ใช้เท่าที่จำเป็นต่อหน้าที่เท่านั้น เช่น End User เห็นได้เฉพาะเอกสาร Published |
| **AuditLogs** | ตารางฐานข้อมูลกลางที่เก็บบันทึกเหตุการณ์สำคัญ (who/what/when/which) สำหรับ Audit Trail |
| **Quality Record (บันทึกคุณภาพ)** | หลักฐานเชิงประจักษ์ที่เกิดจากธุรกรรม/กิจกรรมที่เสร็จสมบูรณ์แล้ว (เช่น DAR, Acknowledgement, Record, Finding, CAR) มีคุณสมบัติ **Static** ห้ามแก้ไขย้อนหลัง ต่างจาก Document ที่เป็น **Dynamic** (ดู §6.1.1) |
| **Retention Clock** | ตัวนับอายุการจัดเก็บของบันทึกคุณภาพ เริ่มทำงานทันทีที่ธุรกรรมเสร็จสิ้นและปิดเคส (Closed/Signed-off) ไม่ใช่ตั้งแต่วันที่สร้างรายการ (BRULE-EFL-15) |
| **No Auto-Deletion** | หลักการห้ามระบบลบเอกสาร/บันทึกคุณภาพโดยอัตโนมัติเมื่อครบกำหนดจัดเก็บ ต้องผ่านการยื่นคำร้องและอนุมัติจาก QMR/ผู้อนุมัติตามสายงานก่อนทุกครั้ง (BRULE-EFL-16, UC-15) |
| **Destruction Log** | บันทึกประวัติการทำลายข้อมูล (ผู้ร้องขอ, ผู้อนุมัติ, รายการ, วันที่) เก็บรักษาไว้อย่างน้อย 5 ปี เพื่อเป็นหลักฐานต่อผู้ตรวจติดตาม (BRULE-EFL-17) |
| **Hard Delete** | การลบข้อมูลถาวรออกจากฐานข้อมูล/พื้นที่จัดเก็บไฟล์ ใช้เฉพาะกับข้อมูลที่ได้รับอนุมัติให้ทำลายแล้วเท่านั้น (ต่างจาก Soft Delete ที่ใช้กับ User ตาม BRULE-EFL-13) |

---

## Appendix B: Analysis Models

### B.1 System Context Model

*(ภาพที่ 1 อ้างอิงจาก §2.1 — TBD ต้องวาด Diagram จริง)*

### B.2 Conceptual Domain Model

*(ภาพที่ 4 — โครงสร้างเชิงตรรกะของ Document, DAR, Acknowledgement, Record, Finding, CAR — TBD ต้องวาด Diagram จริงจากตาราง B.3)*

### B.3 Logical Data Entities

| Entity | Key Fields | Owner |
| :--- | :--- | :--- |
| **User** | user_id, full_name, email, role_id, department_id, **isActive** (boolean — Soft Delete แทน Hard Delete ตาม BRULE-EFL-13) | Shared |
| **Role** | role_id, role_name, permissions (รวมบทบาท Approver, QMR, Lead Auditor, Assistant DCC, ISO Admin/DCC ตาม §2.3) | Shared |
| **Department** | department_id, name | Shared |
| **Document (Document Master)** | document_id, document_code (**Unique**), title, type, department, current_revision_id, status | A |
| **DocumentRevision** (เดิมเรียก DocumentVersion — entity เดียวกัน) | revision_id, document_id, revision_no, issue_no, file_id, effective_date, status — **One-to-Many กับ Document Master; Published ได้เพียง 1 revision ต่อ document ณ เวลาใดเวลาหนึ่ง (BRULE-EFL-01, TBD-EFL-02 RESOLVED)**; ไฟล์ (file_id) ต้องผ่านการตรวจสอบขนาดสูงสุดตามประเภทเอกสาร (BRULE-EFL-27) | A |
| **DAR** | dar_id, dar_no, document_id, **action_type** (`CREATE` / `AMEND` / `CANCEL` / `REQUEST_UNCONTROLLED` — 4 ประเภทตาม QP-2301-0107 ข้อ 6.5.1, REF-13), reason, requester_id, approver_id, status | A |
| **Acknowledgement** | ack_id, document_id, version_id, user_id, ack_at, **assignment_type** (Department/Role หรือ Individual — TBD-EFL-05 RESOLVED) | A |
| **DistributionList** (ใหม่ตามมติผู้ใช้ v0.10, อ้างอิง QM-2301-01 §7.5.3) | distribution_id, document_id, **recipient_role_id / recipient_department_id** (ผู้ถือครองตามตำแหน่ง/แผนก), copy_no, **status** (`Active` / `Withdrawn` — Auto-Withdraw เมื่อ Obsolete ตาม BRULE-EFL-23), issued_at | A |
| **Record** | record_id, **document_id (Nullable — Direct Issue Linkage, FR-B17)**, **finding_id (Optional Reference)**, **car_id (Optional Reference)**, record_type, title, created_by, created_at, **closed_at** (จุดเริ่ม Retention Clock), **retention_tier**, **retention_expiry_date** (คำนวณจาก closed_at ตาม §6.1.1, TBD-EFL-09 RESOLVED) — ต้องมีอย่างน้อยหนึ่งใน document_id/finding_id/car_id เสมอ (BRULE-EFL-06) | B |
| **RecordFile** (ใหม่ตามมติผู้ใช้ v0.10 — เดิมถูกอ้างถึงใน §6.1 Data Domain ตั้งแต่ v0.2 แต่ยังไม่เคยกำหนดเป็น Entity) | record_file_id, record_id, file_id, uploaded_by, uploaded_at — รองรับไฟล์แนบหลายไฟล์ต่อ record เดียว (One-to-Many, FR-B16); แต่ละไฟล์ต้องไม่เกินขนาดที่กำหนด (BRULE-EFL-25 — **Provisional 20MB, รอยืนยันจริงตาม TBD-EFL-17**) | B |
| **AuditRound** (เดิมเรียก Audit — Header เดียวต่อรอบตรวจประจำปี ตาม TBD-EFL-06 RESOLVED) | audit_round_id, audit_date_range, scope, **lead_auditor_id** | B |
| **Finding (NC)** | finding_id, **audit_round_id (Nullable — TBD-EFL-15 RESOLVED)**, document_id, record_id (Optional Reference — ใช้แทน audit_round_id เมื่อมาจาก Non-Audit Source), department_id (auditee), type, description, status — Child Record ของ AuditRound เมื่อมี audit_round_id; เมื่อ audit_round_id = NULL ต้องมี record_id หรือแหล่งอ้างอิงอื่นแทน | B |
| **CAR** | car_id, finding_id, owner_id, due_date, status, root_cause, corrective_action, **verified_by, verified_at** (Assistant DCC/Auditor ผู้แจ้งพบ), **closed_by, closed_at** (QMR/Lead Auditor เท่านั้น — ต้องคนละคนกับ verified_by ตาม BRULE-EFL-12) | B |
| **AuditTrail** | log_id, actor_id, entity_type, entity_id, action, timestamp | Shared |
| **File** (จาก File Storage — Multer DiskStorage) | file_id, file_path (Local Server File System), original_filename, mime_type, uploaded_by, uploaded_at | Shared |
| **DestructionLog** (ใหม่ตาม §6.1.1, TBD-EFL-09 RESOLVED) | destruction_log_id, item_type (Document/Record), item_ref_id, item_code, retention_tier, requested_by, approved_by, destroyed_at — เก็บรักษาอย่างน้อย 5 ปี (BRULE-EFL-17) | Shared |

### B.4 State Semantics

#### Document Status

| Status | Meaning | ผู้เปลี่ยนสถานะ |
| :--- | :--- | :--- |
| Draft | เอกสารร่าง | Owner/Admin |
| Review | ส่งทบทวน/รออนุมัติ | Owner |
| Approved | ผ่านการอนุมัติ | Approver |
| Published | เอกสารฉบับใช้งานจริง (current) | ISO Admin |
| Obsolete | ยกเลิก/ไม่ใช้งาน | ISO Admin |

#### DAR Status

| Status | Meaning |
| :--- | :--- |
| Draft | ยังไม่ส่ง |
| Submitted | ส่งคำขอแล้ว |
| Reviewed | ทบทวนแล้ว |
| Approved | อนุมัติแล้ว |
| Rejected | ไม่อนุมัติ / ส่งกลับแก้ไข |
| Closed | ปิดคำขอแล้ว |

#### CAR Status

| Status | Meaning |
| :--- | :--- |
| Open | เปิด CAR ใหม่ |
| In Progress | กำลังแก้ไข |
| Submitted for Verification | ส่งให้ทวนสอบ |
| Closed | ปิดหลัง verify แล้ว |
| Reopened | เปิดซ้ำเมื่อ verify ไม่ผ่าน |

### B.5 Ownership / Authority Boundary (Group A ↔ Group B)

| เรื่อง | Owner | ห้ามทำซ้ำโดยอีกกลุ่ม |
| :--- | :--- | :--- |
| Document master | A | B ห้ามสร้าง document table แยกเพื่อใช้จริง |
| Current version | A | B อ่านอย่างเดียว |
| DAR approval | A | B ไม่ทำ approval DAR |
| Ack assignment/detail | A | B ใช้ summary เท่านั้น |
| Record/evidence | B | A ไม่ทำ record module เต็ม |
| Finding/CAR | B | A ไม่ทำ finding/CAR module |
| Dashboard รวม | B | A อาจมี "My Task Checklist" (UC-16, FR-A16) เป็น dashboard lite ระดับบุคคลได้ แต่ไม่ใช่ dashboard รวมระดับองค์กร (UC-12 เป็นของ B เท่านั้น — TBD-EFL-12 RESOLVED) |
| Distribution List / Uncontrolled Copy Labeling | A | B ไม่เกี่ยวข้องกับการดูแลบัญชีผู้ถือครองสำเนาหรือป้ายกำกับเอกสาร |

---

## Appendix C: To Be Determined List

### C.1 ปิดแล้ว (Resolved) — จาก businesspolicies.md (Business & Architectural Policy Consensus)

| TBD-ID | ประเด็น | มติที่เลือกปฏิบัติ (Resolution) | อ้างอิง |
| :--- | :--- | :--- | :--- |
| **TBD-EFL-01** ✅ | User Source | **Local System DB (Seed Data)** — ไม่เชื่อม AD/LDAP/HR System ของมหาวิทยาลัยใน Phase 1; ปิดใช้งานผู้ใช้ด้วย `isActive: false` (Soft Delete) แทน Hard Delete | REF-08; §2.4, §2.7, §3.3.2 |
| **TBD-EFL-02** ✅ | Document Code Uniqueness | **Unique บน Document Master**; ผูก **DocumentRevision** แบบ One-to-Many; Published ได้เพียง 1 revision ต่อรหัสเอกสาร ณ เวลาใดเวลาหนึ่ง — revision ก่อนหน้าเปลี่ยนเป็น Obsolete อัตโนมัติ | REF-08; §4.4, Appendix B.3 |
| **TBD-EFL-03** ✅ | File Storage | **Local Server File System** ผ่าน **Multer DiskStorage**; PostgreSQL เก็บเฉพาะ Path/Metadata; ออกแบบให้ย้ายไป Amazon S3/Object Storage ได้ใน Phase 3 โดยไม่กระทบ schema | REF-08; §2.4, §3.3.2 |
| **TBD-EFL-04** ✅ | Approver Role Separation | **Strict Separation (SoD):** Approver (คณบดี/QMR) พิจารณา DAR เท่านั้น; ISO Admin (DCC) publish จริงหลังอนุมัติแล้วเท่านั้น ห้ามเป็นคนเดียวกัน | REF-08; §2.3, §4.3, §4.4, BRULE-EFL-11 |
| **TBD-EFL-05** ✅ | Acknowledgement Assignment | **Dual Mapping Method** — เลือกได้ทั้งตามแผนก/บทบาท (Department/Role) และเจาะจงรายบุคคล (Individual) | REF-08; §4.7 |
| **TBD-EFL-06** ✅ | Audit Round Structure | **Single AuditRound Header** ต่อรอบตรวจประจำปี ผูก Lead Auditor และขอบเขต/วันที่; Finding/NC เป็น Child Record แยกตามแผนก | REF-08; §4.9, Appendix B.3 |
| **TBD-EFL-07** ✅ | CAR Verification & Closing | **Two-Step Authorization:** Assistant DCC หรือ Auditor ผู้แจ้งพบ ทำ Verify; QMR หรือ Lead Auditor ทำ Close เท่านั้น (คนละคนกัน) | REF-08; §4.11, BRULE-EFL-12 |
| **TBD-EFL-09** ✅ | Data Retention & Destruction Policy | **แยก "เอกสารคุณภาพ" (Dynamic, นับอายุเมื่อ Obsolete) กับ "บันทึกคุณภาพ" (Static, นับอายุเมื่อปิดเคส)** อย่างเด็ดขาด; กำหนดตารางระยะเวลาจัดเก็บของ Entity ที่ระบบดูแล (Permanent สำหรับ AuditTrail, 5 ปีสำหรับ DAR/Ack/Audit report, 3 ปีสำหรับ CAR/Finding); **ห้ามลบอัตโนมัติ (No Auto-Deletion)** ต้องผ่านคำร้อง+อนุมัติจาก QMR ก่อนทำลายทุกครั้ง (Hard Delete) พร้อม Destruction Log เก็บ 5 ปี | REF-10; §6.1.1, §4.15 (UC-15), Appendix B.3, BRULE-EFL-14..18 |
| **TBD-EFL-15** ✅ | ขอบเขตแหล่งที่มาของ Finding/CAR | **ขยายให้ Finding เกิดได้จากรอบตรวจติดตามประจำปี (ผูก AuditRound) หรือจากแหล่งอื่น** เช่น ข้อร้องเรียนผู้รับบริการ (QP-2301-0106) หรือมติที่ประชุมทบทวนโดยฝ่ายบริหาร (QP-2301-0101) — ปรับ `audit_round_id` บน Entity Finding เป็น **Nullable** และใช้ `record_id`/แหล่งอ้างอิงอื่นแทนเมื่อไม่ผูกกับ AuditRound เพื่อรักษา Traceability | REF-12; §4.9, §4.10, Appendix B.3, BRULE-EFL-22 |
| **TBD-EFL-12** ✅ | ขอบเขต Dashboard ของ Group A/B (ป้องกันการทำงานซ้ำซ้อน) | **แบ่งตาม Module Boundary:** Group A เป็นเจ้าของ **"My Task Checklist"** (งานค้างส่วนบุคคล — UC-16 ใหม่, FR-A16); Group B เป็นเจ้าของ **Operational Dashboard** รวม (สถิติภาพรวมระดับองค์กรเท่านั้น — UC-12) | มติผู้ใช้ (Product Owner) v0.10; §4.12, §4.16 (UC-16 ใหม่), Appendix B.5 |
| **TBD-EFL-16** ✅ | สถานะ Controlled/Uncontrolled ของไฟล์อิเล็กทรอนิกส์บนระบบ E-Filing | **ยืนยันคงสถานะ "Uncontrolled Document"** สำหรับไฟล์อิเล็กทรอนิกส์ (Electronic File) ทุกไฟล์บนแพลตฟอร์มออนไลน์ ตาม QP-2301-0107 ข้อ 6.6 (แม้จะเป็น Published/current version) — ไม่ปรับสถานะเอกสารเป็น Controlled แต่เพิ่มข้อกำหนดให้ระบบแสดงป้ายกำกับ/ลายน้ำ "สำเนาไม่ควบคุม" แทน; สำเนาควบคุมตัวจริง (Controlled Copy) ยังคงเป็นสำเนากระดาษ/บัญชี Distribution List ที่ DCC ควบคุมด้วยตนเอง | มติผู้ใช้ (Product Owner) v0.10 อ้างอิง QP-2301-0107 ข้อ 6.6 (REF-13); §4.6 (UC-06), BRULE-EFL-24, FR-A15 |

> ทุกรายการข้างต้นอนุมัติโดยคณะผู้พัฒนาระบบ (SE02) ตามเอกสารอ้างอิงที่ระบุในคอลัมน์ขวาสุด (businesspolicies.md / qmsdatalifecyclepolicy.md / มติผู้ใช้) — หากมีการเปลี่ยนแปลงในภายหลังต้องผ่าน Change Request/Impact Analysis ไม่แก้ทับมติเดิม

### C.2 ยังเปิดอยู่ (Open / Still TBD)

| TBD / Open | รายละเอียด | Owner / Closure Evidence | Blocking? |
| :--- | :--- | :--- | :--- |
| **TBD-EFL-08** | รูปแบบ Internal Interface Contract ระหว่าง module Group A/B บน backend เดียวกัน (เช่น function signature, service interface, internal DTO) | Architecture decision (A+B) | Before Internal Interface Contract |
| **TBD-EFL-10** | ภาษา UI และ bilingual requirement | Product Owner decision | Before UI baseline |
| **TBD-EFL-11** | Shared data model ยังไม่ล็อกเป็น ERD กลาง (Gap จาก SE02 เดิม) | Group A/B ร่วมกันก่อน dev | Blocking — ต้องทำ ERD กลางก่อนเริ่มพัฒนา |
| **TBD-EFL-13** | Performance target: response time ของการค้นหา document/record (NFR-04 ระบุเพียง "เวลาที่เหมาะสม") | Stakeholder + Architecture decision | Before Performance test / baseline |
| **TBD-EFL-14** | จำนวนผู้ใช้พร้อมกัน (concurrent users) ที่ระบบต้องรองรับ | Stakeholder decision | Before Load test / baseline |
| **TBD-EFL-17** | ขนาดไฟล์สูงสุดของ RecordFile (หลักฐาน/evidence ของ Record ใน UC-08) — ค่า 20MB ปัจจุบันเป็นเพียงค่าตั้งต้นชั่วคราวที่ BA/ทีมพัฒนาเสนอเอง ตรวจสอบย้อนกลับแล้วไม่พบเอกสารต้นทางใดระบุตัวเลขนี้ไว้จริง (แยกจากขนาดไฟล์ Document ตาม BRULE-EFL-27 ซึ่งมีข้อมูลจริงยืนยันแล้ว) | Stakeholder decision | Before file upload validation implementation / baseline |

> **Controlled uncertainty:** TBD ไม่ใช่ช่องว่างที่อนุญาตให้ทีมเดา ทุก TBD ต้องมี Owner, Closure Evidence และจุดตัดสินใจก่อน Baseline/Implementation — รายการใน C.1 ถือว่าปิดแล้วและไม่ควรเปิดใหม่โดยไม่มี Change Request

---

## Appendix D: Acceptance Criteria

| ID | Given | When | Then | Coverage |
| :--- | :--- | :--- | :--- | :--- |
| **AC-01** | มี Document Draft ที่กรอก metadata ครบ | Document Owner สร้าง/บันทึกเอกสารพร้อมไฟล์แนบ | สร้าง document draft และแนบไฟล์ได้สำเร็จ | FR-A01..A03; UC-01 |
| **AC-02** | มี Document ที่ต้องการแก้ไข/ยกเลิก | Document Owner submit DAR แล้ว Approver ตัดสินใจ | DAR flow ทำได้อย่างน้อย submit → review/approve/reject | FR-A05/A06; UC-02/03 |
| **AC-03** | Document อยู่ในสถานะ Approved | ISO Admin publish เอกสาร | ผู้ใช้เห็น current version ได้ | FR-A04/A07; UC-04 |
| **AC-04** | Document ถูก obsolete | End User ทั่วไปเปิดดูเอกสาร | ผู้ใช้ทั่วไปไม่เห็นเป็นฉบับใช้งาน | FR-A04/A07/A08; UC-05 |
| **AC-05** | มี current document ที่มอบหมายให้รับทราบ | End User กดรับทราบ | acknowledgement เก็บ user/time/document version ได้ | FR-A10/A11; UC-07 |
| **AC-06** | มี document_id, finding_id หรือ car_id อย่างน้อยหนึ่งรายการที่ต้องการอ้างอิง | ISO User/CAR Owner สร้าง record พร้อมแนบไฟล์ (หนึ่งไฟล์ขึ้นไป) | record/evidence ผูกกับ document, finding หรือ CAR ได้อย่างน้อยหนึ่งรายการ และรองรับไฟล์แนบหลายไฟล์ผ่าน RecordFile | FR-B01/B02/B16/B17; UC-08 |
| **AC-07** | มี evidence หรือ document ที่เกี่ยวข้อง | Auditor สร้าง finding | finding ผูกกับ evidence หรือ document ได้ | FR-B03..05; UC-09 |
| **AC-08** | มี finding ที่ต้องดำเนินการแก้ไข | ISO Admin/Auditor เปิด CAR และ CAR Owner ดำเนินการ | CAR ผูกกับ finding และมี due date/status/owner ได้ | FR-B06..10; UC-10/11 |
| **AC-09** | มีข้อมูล document/ack/CAR/finding ในระบบจริง | ผู้ใช้เปิด dashboard | dashboard แสดง document status, acknowledgement, CAR status, overdue ได้จากฐานข้อมูลจริง | FR-B11..13; UC-12 |
| **AC-10** | มี document ที่เชื่อมกับ record/finding/CAR | ผู้ใช้ตรวจสอบ traceability | มี traceability จาก document → record/finding/CAR และจาก CAR → evidence | FR-A08/FR-SH04 |
| **AC-11** | มีเอกสาร Obsolete ที่เก็บครบ ≥1 Revision หรือบันทึกคุณภาพที่ Retention Clock ครบกำหนด | ISO/QA Admin ยื่นคำร้องขอทำลายและได้รับอนุมัติจาก QMR/ผู้อนุมัติ | ระบบทำลายเฉพาะรายการที่อนุมัติแล้ว (Hard Delete) และบันทึก Destruction Log ครบถ้วน | FR-A13/FR-B15/FR-SH06; UC-15 |
| **AC-12** | มีเอกสาร Published ที่ถูกเปิด preview/ดาวน์โหลด/พิมพ์ | ผู้ใช้เปิดดู/ดาวน์โหลด/พิมพ์เอกสารดังกล่าว | ระบบแสดงป้ายกำกับ/ลายน้ำ "สำเนาไม่ควบคุม / Uncontrolled Copy" ทุกช่องทางเสมอ | FR-A15; UC-06 |
| **AC-13** | End User/Document Owner/Approver มีงาน DAR หรือ Acknowledgement ค้างที่ผูกกับตนเอง | ผู้ใช้เปิดเมนู "งานของฉัน (My Task Checklist)" | ระบบแสดงเฉพาะงานค้างของผู้ใช้เอง แยกจาก Operational Dashboard รวมของ Group B โดยสมบูรณ์ | FR-A16; UC-16 |

#### Negative / Boundary Scenarios (จาก BRD/SE02)

- ต้องบังคับ single current published version ต่อ document_code (ห้ามมีมากกว่า 1)
- Obsolete document ต้องไม่ถูกเลือกเป็นค่า default ในหน้าค้นหา/อ้างอิง
- CAR ห้าม close ได้จนกว่าจะมี owner/due_date/root_cause/corrective_action/evidence ครบ
- Dashboard ต้องไม่ใช้ mock/hardcoded data ในการสาธิตครั้งสุดท้าย
- Group B ต้องไม่สร้าง Document Master ซ้ำ — ต้องอ้างอิงผ่าน Shared Contract เท่านั้น
- ห้ามระบบลบเอกสาร/บันทึกคุณภาพใดๆ โดยอัตโนมัติเมื่อครบกำหนดจัดเก็บ (No Auto-Deletion) — ต้องผ่านการอนุมัติก่อนทุกครั้ง (BRULE-EFL-16)
- Obsolete document ต้องเก็บรักษาไว้อย่างน้อย 1 Revision ก่อนเข้าเกณฑ์ยื่นขอทำลาย (BRULE-EFL-14)
- ไฟล์แนบของ Record (RecordFile) แต่ละไฟล์ต้องไม่เกิน 20MB — **ค่าตั้งต้นชั่วคราว (Provisional), รอยืนยันตาม TBD-EFL-17** (BRULE-EFL-25)
- ห้ามอนุมัติคำร้องทำลายเอกสาร/บันทึกคุณภาพที่ยังมี Record อ้างอิงอยู่ (BRULE-EFL-26)
- เอกสาร Published ทุกฉบับต้องแสดงป้ายกำกับ "สำเนาไม่ควบคุม/Uncontrolled Copy" บน preview/download/print เสมอ (BRULE-EFL-24)
- ไฟล์แนบของ Document ต้องไม่เกินขนาดตามประเภทเอกสาร: QM≤22MB, QP≤12MB, SD≤104MB, FM≤4MB (BRULE-EFL-27)

---

## Appendix E: End-to-End Traceability

### E.1 Business Requirement (BRD) → Functional Requirement → Use Case

| BR-ID | Business Requirement | FR Group | UC |
| :--- | :--- | :--- | :--- |
| **BR-01** | Document registry กลางอ้างอิง Master List ได้ | FR-A01/A02 | UC-01, UC-06 |
| **BR-02** | ควบคุม current version ของเอกสารได้ | FR-A04/A07 | UC-04 |
| **BR-03** | รองรับ DAR สำหรับสร้าง/แก้ไข/ยกเลิกเอกสาร | FR-A05 | UC-02 |
| **BR-04** | รองรับการอนุมัติตามบทบาท | FR-A06 | UC-03 |
| **BR-05** | รองรับ publish/obsolete | FR-A04/A07/A08 | UC-04, UC-05 |
| **BR-06** | รองรับ revision history และ audit trail | FR-A08, FR-SH04 | UC-04, UC-14 |
| **BR-07** | รองรับ acknowledgement | FR-A10/A11 | UC-07 |
| **BR-08** | รองรับ records/evidence | FR-B01/B02 | UC-08 |
| **BR-09** | รองรับ audit/finding | FR-B03/B04/B05 | UC-09 |
| **BR-10** | รองรับ CAR lifecycle | FR-B06/B07/B08/B10 | UC-10, UC-11 |
| **BR-11** | มี overdue monitoring | FR-B09 | UC-11, UC-12 |
| **BR-12** | มี operational dashboard จากข้อมูลจริง | FR-B11/B12/B13 | UC-12 |
| **BR-13** | มี shared contract ระหว่าง A/B | §3.3 Shared Contract | UC-12 (dependency) |
| **BR-14** | มี role-based access ขั้นพื้นฐาน | FR-SH02, FR-SH03 | UC-14 (governance); **FR-SH03 เป็น Foundational Requirement** (shared user_id/role_id ระหว่าง Group A/B บน backend เดียวกัน) รองรับทุก UC ในเอกสารนี้ ไม่ได้ผูกกับ UC ใด UC หนึ่งโดยเฉพาะ — เพิ่ม Traceability นี้ใน v0.12 หลังพบว่า FR-SH03 ไม่เคยถูกอ้างอิงใน Appendix E มาก่อน |
| **BR-15** | ปฏิบัติตามนโยบายวงจรชีวิตข้อมูล (Retention/Archival/Destruction) ตาม ISO 9001:2015 ข้อ 7.5.3 | FR-A13/FR-B15/FR-SH06 | UC-15 |
| **BR-16** | รักษาบัญชีผู้ถือครองเอกสารควบคุม (Distribution List) และแสดงสถานะ Controlled/Uncontrolled Copy ให้ถูกต้องตาม QMS Procedure (QP-2301-0107, QM-2301-01) | FR-A14/FR-A15 | UC-04, UC-05, UC-06 |
| **BR-17** | แยก "งานของฉัน" (My Task Checklist) ของ Group A ออกจาก Operational Dashboard รวมของ Group B เพื่อป้องกันการทำงานซ้ำซ้อน | FR-A16 | UC-16 |
| **BR-18** | ควบคุมขนาดไฟล์แนบของเอกสารคุณภาพให้เป็นไปตามเกณฑ์สูงสุดที่กำหนดแยกตามประเภทเอกสาร (QM/QP/SD/FM) | FR-A03 | UC-01 |

> _หมายเหตุ: ตาราง E.1 เป็นการแมป BR → FR/UC ที่ BA จัดทำจากเนื้อหาเอกสารต้นทาง (BRD §9 และ SRS §8) เพื่อความสมบูรณ์ของ Traceability ควรให้ Product Owner ยืนยันความถูกต้องก่อน Baseline_

### E.2 User Story → Use Case → Acceptance Criteria → Requirement

| User Story | Use Case | Acceptance Criteria | Requirements |
| :--- | :--- | :--- | :--- |
| US-A01 | UC-01 | AC-01 | FR-A01..A03 |
| US-A02 | UC-04 | AC-03 | FR-A04/A07 |
| US-A03 | UC-06 | — | FR-A09 |
| US-A04 | UC-02 | AC-02 | FR-A05 |
| US-A05 | UC-03 | AC-02 | FR-A06 |
| US-A06 / US-A07 | UC-07 | AC-05 | FR-A10/A11 |
| US-B01 | UC-08 | AC-06 | FR-B01/B02 |
| US-B02 | UC-09 | AC-07 | FR-B03..05 |
| US-B03 | UC-10 | AC-08 | FR-B06 |
| US-B04 / US-B05 | UC-11 | AC-08 | FR-B07..10 |
| US-B06 / US-B07 / US-B08 | UC-12 | AC-09 | FR-B11..13 |
| US-A08 | UC-16 | AC-13 | FR-A16 |

### E.3 Group Scope Mapping (จาก SE02 Mapping)

| Group | Scope | Phase 1 FR | Use Case | Priority |
| :--- | :--- | :--- | :--- | :--- |
| A | Document CRUD | FR-A01, A02, A03 | UC-01 | Must |
| A | Document Lifecycle | FR-A04, A07, A08 | UC-03, UC-04, UC-05 | Must |
| A | DAR | FR-A05, A06 | UC-02, UC-03 | Must |
| A | Search/View | FR-A09 | UC-06 | Must |
| A | Acknowledgement | FR-A10, A11 | UC-07 | Must |
| A | Data for Dashboard | FR-A12 | UC-12 (support) | Must |
| A | Distribution List & Uncontrolled Copy Labeling | FR-A14, A15 | UC-04, UC-05, UC-06 | Must |
| A | My Task Checklist | FR-A16 | UC-16 | Should |
| B | Record CRUD & Multi-File/Direct Issue Linkage | FR-B01, B02, B16, B17 | UC-08 | Must |
| B | Audit/Finding | FR-B03, B04, B05 | UC-09 | Must |
| B | CAR | FR-B06, B07, B08, B10 | UC-10, UC-11 | Must/Should |
| B | Overdue | FR-B09 | UC-11, UC-12 | Must |
| B | Dashboard | FR-B11, B12, B13 | UC-12 | Must |
| B | Export Summary | FR-B14 | UC-13 | Should |
| Shared | RBAC/Audit Trail | FR-SH02, FR-SH04 | UC-14 | Must |
| Shared | Data Retention & Destruction | FR-A13, FR-B15, FR-SH06 | UC-15 | Must |

### E.4 End-to-End Example (สร้างจาก Business Process TO-BE ใน BRD §8)

| Step | Scenario | Trace |
| :--- | :--- | :--- |
| 1 | Document Owner สร้าง draft เอกสาร QP ใหม่พร้อม metadata และไฟล์แนบ | UC-01; FR-A01..03 |
| 2 | Document Owner สร้าง DAR ระบุ action type "new" พร้อมเหตุผลและ submit | UC-02; FR-A05 |
| 3 | Approver (คณบดี/QMR) ทบทวนและ approve พร้อม comment — คนละบทบาทกับ ISO Admin/DCC (SoD) | UC-03; FR-A06; BRULE-EFL-11 |
| 4 | ISO/QA Admin (DCC) publish เอกสารเป็น current DocumentRevision; revision เดิมเปลี่ยนเป็น Obsolete อัตโนมัติ | UC-04; FR-A04/A07/A08 |
| 5 | End User ที่อยู่ในกลุ่มเป้าหมาย (Department/Role หรือ Individual) ค้นหาเอกสาร เปิดอ่าน และกดรับทราบ | UC-06, UC-07; FR-A09/A10/A11 |
| 6 | ระบบส่ง document status และ acknowledgement summary ให้ Dashboard ของ Group B ผ่าน Internal Module Interface | FR-A12 → FR-B11/B12 |
| 7 | Auditor ตรวจติดตามภายใต้ AuditRound ประจำปี และบันทึก finding (NC) ผูกกับเอกสารดังกล่าว | UC-09; FR-B03..05 |
| 8 | ISO Admin/Auditor เปิด CAR จาก finding กำหนด owner/due date | UC-10; FR-B06 |
| 9 | CAR Owner บันทึก root cause/corrective action/evidence แล้วส่ง verify → Assistant DCC/Auditor ผู้แจ้งพบ Verify → QMR/Lead Auditor Close (คนละคนกับผู้ Verify) | UC-11; FR-B07..10; BRULE-EFL-12 |
| 10 | Dashboard รวมสถานะเอกสาร/ack/CAR/finding จากข้อมูลจริงให้ผู้บริหารดู | UC-12; FR-B11..13 |

---

## Appendix F: Completeness and QA Record

| QA Check | Result | Evidence |
| :--- | :--- | :--- |
| **IEEE template sections 1–6 + Appendices A–F ครบ** | PASS | โครงสร้างตามไฟล์ guideline (Case X) |
| **FR-A01..16, FR-B01..17, FR-SH01..06 ถูกนำเข้าครบ** | PASS | Section 2.2, 4, Appendix E |
| **BR-01..18 (Business Requirement) ถูก map ไป FR/UC** | PASS (ต้องยืนยันโดย Product Owner) | Appendix E.1 |
| **Business Rules 27 ข้อ ถูกกำหนดรหัส BRULE-EFL-01..27** (10 ข้อจาก BRD + 3 ข้อจาก businesspolicies.md + 5 ข้อจาก qmsdatalifecyclepolicy.md + 3 ข้อจาก usecaseflows.md + 1 ข้อจากมติ TBD-EFL-15 [Finding Audit/Non-Audit Source] + 4 ข้อจากมติสรุป v0.10 [Distribution List Auto-Withdraw, Uncontrolled Copy Watermark, Record File Size Limit, Referential Integrity ก่อนทำลายข้อมูล] + 1 ข้อใหม่จาก v0.11 [Document File Size by Type]) — **BRULE-EFL-19 ปรับสถานะจาก "QP Mandate" เป็น "Engineering Control" ใน v0.10; BRULE-EFL-25 ปรับเป็น "Provisional" ใน v0.11 หลังตรวจพบว่าอ้างอิง REF-14 ผิดพลาด (เปิด TBD-EFL-17 แทน)** | PASS | Section 5.5 |
| **TBD-EFL-01..07, 09, 12, 15, 16 ปิดแล้วด้วยมติจาก businesspolicies.md / qmsdatalifecyclepolicy.md / มติผู้ใช้ (REF-12, REF-13)** | PASS | Appendix C.1 (11 รายการ Resolved) |
| **Alternate/Exception Flow ของ UC ที่เคยเป็น `[TBD]` ถูกเติมครบ 11 UC** (UC-01, 02, 03, 04, 06, 07, 08, 09, 10, 11, 12, 13) — เพิ่ม UC-08 (RecordFile/Direct Issue Linkage/20MB/Referential Integrity) และ UC-12 (Role-Based View/Departmental Drill-Down/Timeout/Divide-by-Zero) ในรอบ v0.10 | ✅ COMPLETE | Section 4.1–4.16 |
| **UC-01..16 ถูกนำเข้าครบ** | ✅ COMPLETE (v0.10) | UC-01..14 ครบตั้งแต่ v0.6; UC-15 เพิ่มใน v0.7; **UC-16 (My Task Checklist)** เพิ่มใน v0.10 จากมติปิด TBD-EFL-12 |
| **AC-01..13 (ระดับธุรกิจ) ถูกนำเข้าและจัด Given-When-Then** | PASS (Given/When เป็นการเรียบเรียงของ BA จาก Main Flow เดิม ควรให้ Product Owner ทวนสอบ) | Appendix D |
| **Data Entities/Domains ถูกรวมไว้** | PASS (เพิ่ม DestructionLog ใน v0.7; เพิ่ม DistributionList, RecordFile ใน v0.10 — RecordFile เคยถูกอ้างถึงใน §6.1 ตั้งแต่ v0.2 แต่ยังไม่เคยกำหนดเป็น Entity จนถึงรอบนี้) | Appendix B.3 |
| **State Semantics (Document/DAR/CAR) ถูกรวมไว้** | PASS | Appendix B.4 |
| **Ownership Boundary Group A/B ถูกรวมไว้** | PASS (เพิ่มแถว Distribution List/Uncontrolled Copy Labeling และอ้างอิง UC-16 ใน v0.10) | Appendix B.5 |
| **Open Issues + Gap Analysis + Performance TBD รวมเป็น TBD List เดียว** | PASS | Appendix C (17 รายการทั้งหมด — 11 ปิดแล้ว/6 เปิดอยู่, ID ไม่ซ้ำกัน — เพิ่ม TBD-EFL-17 ใน v0.11) |
| **ไม่มีการคิดค้น UI/DB/API/Framework เกินหลักฐาน** | PASS | Interface เป็น Logical Interface เท่านั้น |
| **Performance target ตัวเลขจริง** | OPEN | TBD-EFL-13/14 — ยังไม่มีตัวเลขยืนยัน |
| **ERD กลาง / Internal Interface Contract** | OPEN — Blocking | TBD-EFL-08, TBD-EFL-11 ต้องปิดก่อนเริ่มพัฒนา |
| **FR-SH05 มีนิยามครบถ้วน** | ✅ RESOLVED (v0.7.1) | พบนิยามจริงในเอกสารต้นทาง **02_SRS_UseCase_Phase1_Updated_RMUTL_ISO9001.md บรรทัด "FR-SH05 \| ระบบต้องมี seed data จาก Master List/DAR/Pilot documents \| Must"** ซึ่งตกหล่นระหว่างการรวมเอกสารครั้งแรก (v0.2) เติมกลับเข้า §5.3 เรียบร้อยแล้ว |
| **แหล่งที่มาของ Finding/CAR สอดคล้องกันทุกจุด** | ✅ RESOLVED (v0.9) | ผู้ใช้ยืนยันขยายขอบเขตให้ Finding/CAR เปิดได้จาก Non-Audit Source โดยอ้างอิง QP-2301-0109 (REF-12) — ปรับ audit_round_id เป็น Nullable, เพิ่ม BRULE-EFL-22 (TBD-EFL-15 RESOLVED) |
| **มติสรุป 5 ประเด็นค้าง (Distribution List, DAR REQUEST_UNCONTROLLED, BRULE-EFL-19 rationale, Uncontrolled Document status, TBD-EFL-12 Dashboard split) ตรวจสอบตรงกับต้นฉบับ QM-2301-01/QP-2301-0107 แล้ว** | ✅ RESOLVED (v0.10) | BA ตรวจสอบโดยตรงด้วย `Read` หน้า 9-11 (QP-2301-0107) และหน้า 34-36 (QM-2301-01) ยืนยันข้อความตรงกับที่ผู้ใช้อ้างอิงทุกจุด (REF-13) — implement ครบทั้ง 5 ประเด็น พร้อม UC-08/UC-12 Alternate/Exception Flow ที่วิเคราะห์ค้างไว้ |
| **Record.document_id Nullable และ RecordFile ถูกกำหนดเป็น Entity จริง สอดคล้องกับ BRULE-EFL-06 ที่มีมาตั้งแต่ v0.2** | ✅ RESOLVED (v0.10) | เดิม FR-B02/UC-08 Precondition/AC-06 บังคับ document_id เสมอ ซึ่งขัดกับ BRULE-EFL-06 ที่อนุญาตให้ผูกกับ document **หรือ** finding/CAR — แก้ไขให้สอดคล้องกันทั้งหมดในรอบนี้ (FR-B17, Appendix B.3) |
| **BRULE-EFL-25 (RecordFile 20MB) อ้างอิง REF-14 ไม่ถูกต้อง — ตรวจสอบพบไม่มีเอกสารต้นทางใดระบุตัวเลขนี้จริง** | ✅ CORRECTED (v0.11) | ผู้ใช้ตั้งคำถามที่มาของตัวเลข 20MB — BA ตรวจสอบย้อนกลับด้วย `grep` ในเอกสารต้นทางทั้งหมด (รวมเล่มวรรณกรรม REF-14) ไม่พบตัวเลขนี้ จึงปรับสถานะเป็น Provisional และเปิด **TBD-EFL-17** ให้ Stakeholder ยืนยันแทน |
| **ขนาดไฟล์สูงสุดของเอกสารคุณภาพ (Document) ตามประเภท ถูกกำหนดครั้งแรก** | ✅ RESOLVED (v0.11) | ผู้ใช้/Product Owner ให้ข้อมูลขนาดไฟล์จริงปัจจุบันแยกตามประเภท (QM≤22MB, QP≤12MB, SD≤104MB, FM≤4MB) — เพิ่ม **BRULE-EFL-27**, Exception Flow E3 ใน UC-01, ปรับ FR-A03, เพิ่ม REF-15, BR-18 (WI ยังไม่มีเกณฑ์เนื่องจากไม่มีไฟล์จริง) |
| **Consistency Audit ภาพรวมเอกสาร (§6.1 vs Appendix B.3, §1.2 ID ranges, §6.3 version tag, Appendix F Release Decision, FR-SH03 traceability)** | ✅ CORRECTED (v0.12) | ประเมินภาพรวมเอกสารซ้ำ (independent review) พบ 5 จุดที่ metadata ค้างมาตั้งแต่เวอร์ชันแรกๆ ไม่เคยอัปเดตตามเนื้อหาที่โตขึ้น — แก้ไขครบทั้ง 5 จุดตามรายละเอียดใน Revision History v0.12; จุด Minor อื่น (§1.3 reading list, §4.14 wording, §2.2 Epic order, convention "Provisional"/"Won't in MVP", §2.5 Constraint ID) ยังไม่ได้แก้ในรอบนี้ — เก็บไว้พิจารณารอบถัดไป |

> **Release decision:** เอกสารนี้ผ่าน QA ด้าน **ความครบถ้วนของเนื้อหา** ที่มีอยู่ในเอกสารต้นทาง (BRD/SRS/SE02 Mapping) แต่ **ยังไม่พร้อมเป็น Baseline** จนกว่าจะปิด TBD ที่ระบุว่า Blocking (โดยเฉพาะ **TBD-EFL-08** Internal Interface Contract และ **TBD-EFL-11** ERD กลางระหว่าง Group A/B) และได้รับการยืนยัน AC ที่ปรับรูปแบบจาก BA โดย Product Owner — *(แก้ไข v0.12: ตัดเงื่อนไข "ยืนยัน UC-13" ออกจากประโยคนี้ เนื่องจากข้อขัดแย้งดังกล่าวถูกปิดไปแล้วตั้งแต่ v0.6 ตามที่บันทึกไว้ด้านล่าง — ประโยคเดิมค้างมา 5 เวอร์ชันโดยไม่เคยอัปเดต)*
>
> ✅ **ข้อขัดแย้งที่เคยพบ (v0.5) — แก้ไขแล้วใน v0.6:** usecasespecificationssome.md เคยบรรยาย UC-A09 ด้วยกลไก REST API ระหว่าง service ซึ่งขัดกับมติ v0.3 ผู้ใช้ยืนยันแล้วให้คง **Internal Module Interface** (backend เดียวกัน) ไว้ตามเดิม — เนื้อหา UC-A09 จึงถูกแปลงเข้าสู่ UC-13 (ใช้เฉพาะ Manual Export โดย DCC) และ §3.3.1 (กลไกอัตโนมัติแบบ internal call) แทนการอ้าง REST API โดยตรง

---

## บันทึกขั้นตอนถัดไป (Next Steps)

1. ยืนยันเนื้อหาที่ BA จัดวางใหม่ (โดยเฉพาะ Appendix D Given-When-Then และ Appendix E Traceability ที่เป็นการแมปเพิ่มเติม) ว่าตรงกับความตั้งใจเดิมหรือไม่
2. ~~เติมรายละเอียด Alternate/Exception Flow ที่ยังขาดของ UC-08 และ UC-12~~ — ✅ เสร็จสิ้นใน v0.10
3. ตัดสินใจปิด TBD ที่ระบุว่า **Blocking** ก่อนเริ่ม ERD/Internal Interface Contract (**เหลือเฉพาะ TBD-EFL-08, TBD-EFL-11** — TBD-EFL-12 ปิดแล้วใน v0.10)
4. ส่งข้อมูลส่วนถัดไป (ถ้ามี) เช่น Wireframe, ERD ฉบับร่าง, ตัวเลข Performance/Concurrent Users (TBD-EFL-13/14), หรือผลการตัดสินใจ Open Issues ที่เหลือ
5. อัปเดต Revision History ทุกครั้งที่มีการแก้ไขสำคัญ

---
*End of Software Requirements Specification — ระบบ E-Filing ISO 9001:2015 (Phase 1 MVP + Operational Dashboard)*
