# สรุปภาพรวมโครงงาน — SE02 Group B

เอกสารนี้สรุปว่าตอนนี้โครงงานมีไฟล์อะไรอยู่ที่ไหน อะไรเสร็จแล้ว อะไรยังค้าง และไฟล์ไหนต้องระวังไม่ให้เชื่อตรง ๆ ปรับปรุงล่าสุด: 2026-09-03

## 0. ที่เก็บออนไลน์และการทำงานข้ามเครื่อง

โครงงานนี้เก็บบน GitHub แบบ **private repository** ที่ `github.com/PeawZaZa/E-FIling-ISO-9001` (ต่อผ่าน SSH) ทำให้ทำงานต่อจากคอมพิวเตอร์เครื่องอื่นได้และมีประวัติการแก้ไขย้อนดูได้

**ห้ามเปลี่ยนเป็น public** เพราะมีเอกสารคุณภาพภายในจริงของสำนักงานคณบดี (QP-2301-0102, QP-2301-0109, QP-2301-0107, ASIS Handbook) ถ้าจะเผยแพร่ต้องถามอาจารย์ที่ปรึกษาก่อน

**ขั้นตอนประจำวัน**

| จังหวะ | คำสั่ง |
|---|---|
| ก่อนเริ่มทำงานทุกครั้ง | `git pull` |
| หลังทำงานเสร็จ ก่อนปิดเครื่อง | `git add .` → `git commit -m "แก้อะไร"` → `git push` |

**กฎเหล็ก:** ห้ามแก้ไฟล์ `.docx` เดียวกันจากสองเครื่องโดยยังไม่ push เพราะ git รวมไฟล์ Word จากสองฝั่งไม่ได้ ต้องเลือกเก็บฉบับใดฉบับหนึ่งเท่านั้น

**ตั้งค่าเครื่องใหม่:** สร้าง SSH key ของเครื่องนั้นเอง (`ssh-keygen -t ed25519 -C "อีเมล"`) แล้วเพิ่มเป็นคีย์ใหม่ใน GitHub Settings — อย่าคัดลอกคีย์จากเครื่องเดิม จากนั้น `git clone git@github.com:PeawZaZa/E-FIling-ISO-9001.git`

คำสั่งที่ใช้บ่อย: `git log --oneline` (ดูประวัติ) · `git diff` (ดูสิ่งที่แก้ยังไม่ commit) · `git restore <ไฟล์>` (ยกเลิกการแก้ที่ยังไม่ commit)

## 1. โครงงานคืออะไร

ปริญญานิพนธ์วิศวกรรมซอฟต์แวร์ มทร.ล้านนา หัวข้อ "ระบบทะเบียนหลักฐาน การตรวจติดตามภายใน การติดตามการแก้ไขและการป้องกัน พร้อมแดชบอร์ดปฏิบัติการ สำหรับระบบบริหารงานคุณภาพ ISO 9001:2015 ของสำนักงานคณบดีคณะวิศวกรรมศาสตร์" จัดทำโดยปวริศ คูณศรี (หัวหน้าโครงงาน) และอภิรญา สายนาคำ ที่ปรึกษาคืออาจารย์ธนิต เกตุแก้ว โครงการฝั่งระบบจริงชื่อ E-Filing Phase 1 แบ่งเป็น 2 กลุ่มคู่กัน — **กลุ่ม A** ทำ Document Control/DAR/Acknowledgement เป็นเจ้าของข้อมูลเอกสาร และ **กลุ่ม B (โครงงานนี้)** ทำ Records/Audit/Finding/CAR/Dashboard โดยอ่านข้อมูลจากกลุ่ม A ผ่าน Shared Contract เท่านั้น ที่เก็บนี้เป็นที่เก็บเอกสาร ไม่ใช่ repo โค้ด

## 2. สารบัญไฟล์ทั้งหมด

### ราก (`/`)
| ไฟล์ | ประเภท | เนื้อหาโดยย่อ | สถานะ |
|---|---|---|---|
| `CLAUDE.md` | คู่มือโครงงาน | บริบท กติกาเขียน กฎอ้างอิง เคล็ดลับเครื่องมือ งานที่เหลือ | ใช้งานหลัก |
| `.gitignore` | ตั้งค่า git | กันไฟล์ lock ของ Word (`~$*`) ไฟล์ขยะระบบ และ `.claude/settings.local.json` ไม่ให้ขึ้น repo | ใช้งาน |
| `PROJECT_SUMMARY.md` | เอกสารนี้ | สารบัญ+สถานะไฟล์ทั้งหมด | ใช้งาน |
| `GroupB_Software_Requirements.md` | เอกสารความต้องการ | สรุปความต้องการซอฟต์แวร์เฉพาะกลุ่ม B (ฉบับย่อ ใช้ทำงานภายในทีม) | ใช้งาน |
| `GroupB_SRS.md` | SRS ฉบับเต็ม | SRS เฉพาะกลุ่ม B ขยายจากฉบับย่อ สำหรับส่งอาจารย์ที่ปรึกษาพิจารณา — มีหัวข้อ Detailed Use Case ครบ 9 ตัว และประเด็นขอความเห็นชอบ | ใช้งาน |
| `GroupB_Architecture_Decisions.md` | บันทึกการตัดสินใจ (ADR) | เหตุผลการเลือกสถาปัตยกรรม 9 ข้อ (ADR-01–09) โยงกับคะแนน Quality Attribute และ NFR + กลไกจำกัดความเสียหาย — ใช้รองรับรูป C4 ในบทที่ 3 | ใช้งาน |
| `E-Filing_ASIS_Quality_Document_Control_Handbook_Pack.zip` | zip สำรอง | สำเนา ASIS Handbook + drawio + รูป 7 รูป | **backup ซ้ำกับ `Extra details/` — อย่าแก้ที่นี่** |
| `E-Filing_Phase1_SRS_and_Traceability_Matrix_Pack.zip` | zip สำรอง | สำเนา SRS Revised + Traceability Matrix | **backup ซ้ำกับ `Extra details/`** |
| `E-Filing_Phase1_UseCase_Specification_and_Diagrams.zip` | zip สำรอง | สำเนา Use Case Spec + drawio | **backup ซ้ำกับ `Extra details/`** |
| `E-Filing_RMUTL_Phase1_Updated_BRD_SRS_Mapping_ActionPlan.zip` | zip สำรอง | สำเนาเอกสาร 01–04 (BRD/SRS/Mapping/ActionPlan) | **backup ซ้ำกับ `Extra details/`** |

**หมายเหตุ:** zip ทั้ง 4 ไฟล์นี้บันทึกไว้ ณ วันที่สร้าง — หลังการแก้สถานะ CAR ในขั้นตอนนี้ เนื้อหาใน zip จะ**ล้าสมัยกว่า** ไฟล์ .md ใน `Extra details/` ห้ามดึงจาก zip มาใช้อ้างอิงสถานะ CAR

### `Proposal/`
| ไฟล์ | เนื้อหา | สถานะ |
|---|---|---|
| `SE02 Group B.docx` | แบบเสนอหัวข้อที่ผ่านแล้ว 19 หัวข้อ + ภาคผนวก ก/ข | ใช้งานหลัก แต่มีบรรณานุกรมผิด 4 รายการ (ดูข้อ 4) |
| `~$02 Group B.docx` | ไฟล์ lock ของ Word (162B) | ไม่ใช่เนื้อหา — เกิดจากไฟล์ข้างต้นถูกเปิดอยู่/เพิ่งเปิด |

### `Project report/`
| ไฟล์ | เนื้อหา | สถานะ |
|---|---|---|
| `บทที่ 1 บทนำ.docx` | บทที่ 1 ฉบับสมบูรณ์: ที่มา/วัตถุประสงค์ 4 ข้อ (ไม่มีข้อแยกสำหรับ Dashboard)/ขอบเขต/สมมติฐาน 5 ข้อ/ประโยชน์/สถานที่/แผนงาน | ✅ เสร็จ |
| `บทที่ 1 บทนำ (AutoRecovered).docx` | ไฟล์ auto-recovery ของ Word | ฉบับร่างสำรอง ไม่ใช่ต้นฉบับ |
| `บทที่ 1.pdf` | PDF export ของบทที่ 1 | ใช้อ่าน/ส่งตรวจ |
| `บทที่ 2 ทฤษฎีและงานวิจัยที่เกี่ยวข้อง.md` | บทที่ 2 ฉบับเนื้อหา ~63,700 ตัวอักษร: 2.1 ทฤษฎี 12 หัวข้อ, 2.2 เครื่องมือ 10 หัวข้อ, 2.3 งานวิจัย 10 เรื่อง, รูป 24, ตาราง 7, บรรณานุกรม 33 รายการ, ภาคผนวก ก–ฉ | ✅ เนื้อหาเสร็จ ⬜ ยังไม่จัดลง Word |
| `research from gemini for chapter 2.md` | ผลค้นดิบจาก Gemini เกี่ยวกับงานวิจัย 9 เรื่อง | ⚠️ **ผิด 7 จาก 9 รายการ ห้ามใช้อ้างอิงตรง ๆ** ใช้เป็น lead เท่านั้น |
| `figures/ch2/*.svg` (13 ไฟล์) | แผนภาพที่วาดเอง: PDCA, document hierarchy, document vs record, audit-CAR process, CAR state, RBAC, 3-tier architecture, C2 container, shared contract sequence, traceability chain, dashboard aggregation, dashboard wireframe, ER conceptual | ✅ ใช้งานได้ ตรวจ well-formed แล้วด้วย ElementTree |
| `figures/ch2/*.png` (4 ไฟล์) | รูปสกัดจาก proposal: context diagram, container diagram เก่า, form categories, use case กลุ่ม B | ใช้อ้างอิงประกอบบทที่ 2 |

### `Rules for project report/`
| ไฟล์ | เนื้อหา | สถานะ |
|---|---|---|
| `ร่าง คู่มือปริญญานิพนธ์ 2568 (คณะวิศวกรรมศาสตร์) (1).pdf` | คู่มือจัดพิมพ์ปริญญานิพนธ์ฉบับร่าง — ฟอนต์ ขอบกระดาษ หัวข้อ ตาราง รูป สมการ | สรุปกฎสำคัญไว้ใน CLAUDE.md แล้ว อ่านต้นฉบับเมื่อมีคำถามนอกเหนือจากที่สรุปไว้ |

### `Example/`
| ไฟล์ | เนื้อหา | สถานะ |
|---|---|---|
| `บทที่2_โครงงานมือเทียม (5) (1).pdf` | บทที่ 2 ของกลุ่มโครงงานมือเทียม | ใช้เป็นต้นแบบรูปแบบการเขียนเท่านั้น — เลขรูป/ตารางของกลุ่มนี้หลุดเป็น `2.4.1` **อย่าทำตาม** |

### `Extra details/` — เอกสารข้อกำหนดของระบบจริง (มีคู่ .md + .docx ทุกไฟล์ ยกเว้นที่ระบุ)
| คู่ไฟล์ (ไม่รวมนามสกุล) | เนื้อหา | สถานะหลังขั้นตอนนี้ |
|---|---|---|
| `01_BRD_Phase1_Updated_RMUTL_ISO9001` | Business Requirements Document: ปัญหา/วิสัยทัศน์/objectives/scope/stakeholders/AS-IS-TO-BE/business rules/data domains/acceptance criteria | ไม่มีการแก้ไข (ไม่ระบุชื่อสถานะ CAR อยู่แล้ว) |
| `02_SRS_UseCase_Phase1_Updated_RMUTL_ISO9001` | SRS+Use Case ฉบับร่างแรก (คนละชุด FR ID กับฉบับ Revised) | ✅ แก้สถานะ CAR เป็น 4 สถานะแล้ว |
| `03_SE02_SRS_Mapping_GroupA_GroupB_RMUTL_ISO9001` | รายงานเทียบ scope proposal ของนักศึกษากับ BRD/SRS แยกตามกลุ่ม | ไม่มีการแก้ไข |
| `04_ActionPlan_3Months_GroupA_GroupB_RMUTL_ISO9001` | แผนงาน 3 เดือน: milestone, งานรายสัปดาห์/เดือน, gate review, UAT scenario | ไม่มีการแก้ไข |
| `E-Filing_ASIS_Quality_Document_Control_Handbook_RMUTL_ISO9001` | คู่มือ AS-IS อธิบาย QMS/ISO9001, document control, records/audit/CAR ปัจจุบัน, scenario library, mapping ไป SRS | ไม่มีการแก้ไข (อธิบายกระบวนการ ไม่ระบุชื่อสถานะ) |
| `E-Filing_Phase1_Detailed_UseCase_Specification` | รายละเอียด use case ~19 ตัว (UC-S/A/B) พร้อม scenario matrix | ✅ แก้สถานะ CAR เป็น 4 สถานะแล้ว |
| `E-Filing_Phase1_SRS_Revised_GroupA_GroupB` | **SRS ฉบับล่าสุด (source of truth หลัก)**: Intro, Overall Description, System States, FR/NFR, Interface, Logical Data, Use Case, Acceptance Criteria, Test Strategy | ✅ แก้สถานะ CAR เป็น 4 สถานะแล้ว |
| `E-Filing_Phase1_SRS_Traceability_Matrix_GroupA_GroupB` | Traceability: Business Need→FR/NFR→UC→Scenario→Screen/API/Entity→Test Case | ✅ แก้สถานะ CAR เป็น 4 สถานะแล้ว |
| `E-Filing_ASIS_Quality_Process_Diagrams.drawio` | ไดอะแกรมกระบวนการ AS-IS (แก้ไขได้ใน draw.io) | ไม่มีการแก้ไข |
| `E-Filing_Phase1_Detailed_UseCase_Diagrams.drawio` | ไดอะแกรม use case (แก้ไขได้ใน draw.io) | ไม่มีการแก้ไข |
| `se02_group_B_latest_version.pdf` | PDF ของ proposal กลุ่ม B ฉบับล่าสุด | ไม่มีคู่ .md |
| `~$Filing_ASIS_Quality_Document_Control_Handbook_RMUTL_ISO9001.docx` | ไฟล์ lock ของ Word (162B) | ไม่ใช่เนื้อหา |
| `images/01–07_*.png` | แผนภาพ AS-IS: ISO QMS overview, document hierarchy, group boundary, DAR flow, document vs record, audit-CAR flow, dashboard flow | ใช้ประกอบ ASIS Handbook |

**กฎสำคัญ:** ไฟล์ `.md` ใน `Extra details/` คือ **source of truth** ไฟล์ `.docx` คู่กันเป็น export ที่สร้างไว้ก่อนแก้สถานะ CAR รอบนี้ **ยังไม่ได้ re-export ให้ตรงกัน** — ถ้าจะใช้ `.docx` อ้างอิงสถานะ CAR ต้อง re-export จาก `.md` ก่อน

## 3. สถานะความคืบหน้า

- ✅ บทที่ 1 บทนำ — เสร็จสมบูรณ์
- ✅ บทที่ 2 ทฤษฎีและงานวิจัยที่เกี่ยวข้อง — เนื้อหาเสร็จ ⬜ ยังไม่จัดลง Word (ยังไม่แทรกรูป/โลโก้/ฟอนต์ตามฟอร์แมต)
- ✅ แผนภาพประกอบบทที่ 2 — วาดครบ 13 รูป + สกัดจาก proposal อีก 4 รูป
- ✅ เอกสารความต้องการระบบ (BRD/SRS/Use Case/Traceability) ใน `Extra details/` — มีครบ และตอนนี้สถานะ CAR สอดคล้องกับมติที่ล็อกไว้แล้วทั้ง 4 ไฟล์
- ✅ เอกสารความต้องการฉบับย่อเฉพาะกลุ่ม B — `GroupB_Software_Requirements.md`
- ✅ SRS ฉบับเต็มเฉพาะกลุ่ม B สำหรับส่งอาจารย์ที่ปรึกษา — `GroupB_SRS.md` (สร้างใหม่ในรอบนี้ รอฟังผลจากอาจารย์ในประเด็นหัวข้อ 13 ของไฟล์นั้น)
- ✅ บันทึกการตัดสินใจเชิงสถาปัตยกรรม — `GroupB_Architecture_Decisions.md` (ADR-01–08 + กลไกจำกัดความเสียหาย)
- ✅ แผนภาพ C3 Component Diagram ของ API Application — `Project report/figures/ch3/ch3_01_c3_component_api.svg` (8 ส่วนประกอบ)
- 🔄 บทที่ 3 การออกแบบระบบ — ยังไม่เริ่มเขียนเนื้อบท แต่วัตถุดิบพร้อมแล้ว (ADR + C1/C2/C3 + ERD แนวคิด + Use Case)
- ⬜ ตัวระบบจริง — ยังไม่เริ่มพัฒนา
- ⬜ เลือกไลบรารีกราฟ — ยังไม่ตัดสินใจ (บทที่ 2 หัวข้อ 2.2.8 เว้นไว้)
- ⬜ แก้บรรณานุกรม proposal 4 รายการ — ยังไม่แก้ ต้องแจ้งอาจารย์ที่ปรึกษาด้วย
- ⬜ Re-export ไฟล์ `.docx` ใน `Extra details/` ให้ตรงกับ `.md` หลังแก้สถานะ CAR — ยังไม่ทำ

## 4. ข้อควรระวังต่อไฟล์

- **`research from gemini for chapter 2.md`** — ผลค้นผิด 7/9 รายการ (ชื่อวารสาร/ชื่อเรื่อง/ปี/เลขหน้า/จำนวนผู้แต่ง) ห้ามใช้อ้างอิงตรง ต้องตรวจกับต้นฉบับทุกครั้ง รายการที่ตรวจแก้แล้วอยู่ในภาคผนวก จ ของไฟล์บทที่ 2
- **บรรณานุกรมใน `Proposal/SE02 Group B.docx`** — ผิด 4 รายการ (รวมระบุผู้เขียนผิดคน) ฉบับที่ส่งอาจารย์ไปแล้วยังไม่ได้แก้ ต้องแจ้งอาจารย์ที่ปรึกษา
- **zip 4 ไฟล์ที่ราก** — เป็น snapshot เก่ากว่าไฟล์ใน `Extra details/` หลังรอบแก้ไขนี้ อย่านำมาทับหรืออ้างอิงสถานะ CAR
- **ไฟล์ `~$*.docx`** (ใน `Proposal/` และ `Extra details/`) — เป็นไฟล์ lock ของ Microsoft Word ไม่ใช่เนื้อหา ลบได้เมื่อปิดไฟล์ต้นฉบับแล้ว (ไม่ได้ลบในรอบนี้เพราะไม่ใช่ขอบเขตงาน)
- **`.docx` ใน `Extra details/`** — export ก่อนรอบแก้สถานะ CAR นี้ ยังพูดถึง 5 สถานะ/`Reopened` อยู่ ใช้ `.md` เป็นหลักจนกว่าจะ re-export
- **`Example/บทที่2_โครงงานมือเทียม...pdf`** — ใช้เป็นต้นแบบรูปแบบเท่านั้น เลขรูป/ตารางของกลุ่มนั้นผิดกฎ (`2.4.1`) ห้ามทำตาม

## 5. ข้อตัดสินใจที่ล็อกแล้ว (อย่าเปลี่ยนโดยไม่ถามผู้ใช้ก่อน)

อ้างอิงจาก `CLAUDE.md` — source of truth ของตารางนี้คือ CLAUDE.md เสมอ สรุปย่อ:

| เรื่อง | ค่าที่ใช้ |
|---|---|
| Tech stack | React + Node.js/Express + PostgreSQL + Prisma |
| สถานะ CAR | 4 สถานะ `Open → In Progress → Pending Verify → Closed` (verify ไม่ผ่าน → กลับ In Progress) |
| Overdue | ค่าที่คำนวณจาก `due_date < วันนี้ AND status ≠ Closed` ไม่ใช่สถานะหลัก |
| บทบาทผู้ใช้ | Admin / ISO-QA User / Auditor / CAR Owner + Separation of Duty |
| ลำดับ Quality Attribute | Security 15 = Usability 15 > Availability 12 > Modifiability 10 > Performance 8 > Scalability 4 (ทีมโหวต 3 คน เต็ม 15) ใช้ตัดสิน trade-off ตอนออกแบบสถาปัตยกรรม — ดูรายละเอียดใน CLAUDE.md |
| ไลบรารีกราฟ | ยังไม่เลือก |
| ระบบอ้างอิง | ไม่ใส่ `[n]` ในเนื้อความ บรรณานุกรมท้ายบทเรียงเลขตามลำดับที่กล่าวถึง |

## 6. งานที่เหลือ (เรียงลำดับ)

1. เลือกไลบรารีกราฟ แล้วเติมหัวข้อ 2.2.8 รูปที่ 2.22 และบรรณานุกรม [21] ของบทที่ 2
2. แก้บรรณานุกรม proposal 4 รายการ และแจ้งอาจารย์ที่ปรึกษา
3. Re-export ไฟล์ `.docx` ใน `Extra details/` ทั้ง 3 ไฟล์ที่แก้สถานะ CAR รอบนี้ ให้ตรงกับ `.md` (ไม่บังคับเร่งด่วน แต่ต้องทำก่อนส่งเอกสารชุดนี้ให้ใครอ่านจาก .docx)
4. จัดบทที่ 2 ลง Word — ก็อปจากไฟล์ .md แทรกรูปตามภาคผนวก ก และดาวน์โหลดโลโก้ 9 ตัวตามภาคผนวก ข
5. เริ่มบทที่ 3 การออกแบบระบบ — ใช้ `GroupB_Software_Requirements.md` และเอกสารใน `Extra details/` เป็นวัตถุดิบหลัก
