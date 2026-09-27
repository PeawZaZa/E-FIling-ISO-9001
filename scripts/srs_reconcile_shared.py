"""Version 1.2 shared editorial sources, applied by the normal SRS generator.

Current requirement corrections live in srs_reconcile_current.py. Historical inputs
and revision-history entries are retained; implementation is not policy authority.
"""

SCOPE = """### 1.4.3 ขอบเขต MVP ที่ยืนยันในการทบทวน 26 กันยายน 2569

ฉบับ 1.2 แยกข้อกำหนดโครงงานระยะเต็มออกจากขอบเขต MVP ที่ยืนยันแล้ว ไม่ใช้โค้ดเป็นอำนาจเปลี่ยนข้อกำหนด เมื่อพบข้อกำหนดที่ยืนยันแล้วแต่ระบบยังไม่ทำ ให้คงข้อกำหนดและบันทึก IMPLEMENTATION DISCREPANCY ในรายงาน `docs/SRS_RECONCILIATION_2026-09-26.md` การคงรหัสของงานที่พักไว้ไม่ได้แปลว่างานนั้นเป็นเกณฑ์ตรวจรับ MVP ปัจจุบัน

| เรื่อง | ขอบเขต MVP / ข้อจำกัด |
| :--- | :--- |
| Documents / DAR | เอกสาร QM/QP/WI/SD/FM; DAR สร้างใหม่หรือแก้ไข หนึ่งเอกสารต่อใบ; ผู้คุมทะเบียนตรวจรับและปิด DCC ประกาศใช้; QM: DCC → QMR ทบทวน → คณบดีอนุมัติ; ประเภทอื่น: เจ้าของ → รองคณบดีทบทวน → QMR อนุมัติ; คงหลักแยกหน้าที่และหลักฐานแจกจ่าย/เรียกคืนหรือเหตุผล N/A ที่ยอมรับได้ก่อนปิด |
| การเข้าถึงไฟล์ | Download-only: เข้าถึง/ดาวน์โหลดไฟล์ที่ถูกต้องตามเอกสาร ฉบับ และสิทธิ์; ไม่บังคับ inline preview, embedded viewer หรือ browser rendering; การดาวน์โหลดไม่ใช่การรับทราบ |
| Acknowledgement | DCC มอบหมายผู้รับในระบบทดลอง; ผู้รับเข้าถึง/ดาวน์โหลดฉบับที่มอบหมายแล้วกดยืนยันด้วยตนเอง; บันทึกผู้ใช้ ฉบับ เวลา และ audit ป้องกันซ้ำ; ไม่รวมกับการถือครอง/แจกจ่าย; อำนาจสำหรับใช้งานจริงยังต้องยืนยัน |
| Records / Evidence | บันทึกและหลักฐานแยกจาก controlled Document; เชื่อมกับงานคุณภาพ Finding อ้าง Record ที่มี Evidence ได้ และผู้มีสิทธิ์ติดตามไปดาวน์โหลดได้โดยยังตรวจสิทธิ์ |
| Audit / Finding | รอบตรวจ ทีม/หน่วยงาน เกณฑ์ ขอบเขต Finding ห้าแหล่ง และ objective evidence; ตรวจความขัดแย้งจากสังกัดจริงกับหน่วยงานเป้าหมาย ปฏิเสธการมอบหมายที่ขัดกัน; เฉพาะ DCC ยกเว้นพร้อมเหตุผลจริงและ audit; Lead Auditor ข้ามกฎไม่ได้ |
| CAR / NCR | Internal Audit → CAR; Management Review → NCR; QMR อนุมัติแผนทั้งสองประเภทและห้ามอนุมัติตนเอง; Auditor/Lead ผู้แจ้ง Finding เดิมตรวจประสิทธิผลโดยห้ามตรวจงานแก้ไขของตน; ผ่านแล้วถึง PENDING_CLOSURE เท่านั้น |
| จุดหยุดที่ยัง TBD | ผู้ปิด CAR/NCR และการส่งกลับจากขั้นปิด; ผู้ตรวจแทนเมื่อ DCC เป็นผู้แจ้ง (พักที่ PENDING_VERIFICATION); การมอบหมายผู้ตรวจ/ผู้ช่วยรายใบ ชนิดใบจากแหล่งอื่น การเปิดใบ OB/ข้อเสนอแนะ และกำหนดเวลารายขั้นอัตโนมัติยังไม่ยืนยัน |
| Dashboard | หกหมวด Documents, DAR, Acknowledgement, Records/Evidence, Audit/Finding, CAR/NCR; กรองตามสิทธิ์ก่อนรวมค่า; Sponsor เห็นเฉพาะยอดรวม ไม่มีรายละเอียดบุคคลหรือลิงก์เจาะรายการ; บทบาทอื่นเข้าถึงเฉพาะขอบเขตที่อนุญาต |
| งานพัก/นอก MVP | จัดการบัญชีเต็มรูปแบบ, DAR ประเภทอื่น, annual audit plan approval, การอบรม/ขึ้นทะเบียน Auditor, opening/closing meeting workflow, formal report approval/distribution, export summary ตามวันที่/สถานะ, advanced analytics, แนวโน้มหลายปี/pivot และการส่งรายงานอัตโนมัติทางอีเมล; ไม่อ้างว่าทำครบ |
| Authentication | authenticated application session และบังคับสิทธิ์ฝั่ง server; session ของ MVP เก็บใน memory การ restart API อาจต้อง login ใหม่แต่ไม่ลบข้อมูลถาวร; ไม่มีข้อกำหนดให้ใช้ JWT; durable session store เป็นงาน production hardening ที่ต้องตกลงแยก |

หลักฐานขอบเขต: คำสั่ง reconciliation ของผู้ใช้วันที่ 26 ก.ย. 2569, `PROJECT_STATE.md` (รวมมติ QMR วันที่ 20 ก.ย.), `works/MVP_2_Weeks_and_Role_Matrix.md` โดยเฉพาะ Step 3 และ `docs/MANUAL_UI_ACCEPTANCE.md` ฉบับปัจจุบัน การทดสอบเป็นหลักฐานพฤติกรรม ไม่ใช่มติให้อำนาจใหม่

ตรวจบทที่ 1 จาก Word ปัจจุบัน `Project report/บทที่ 1 A update 2 กันยายน 2569.docx` และ `Project report/บทที่ 1 B บทนำ.docx` (ไม่ใช้ AutoRecovered หรือ Markdown เก่า): บท B ยังคงเป้าหมาย Export Summary (§1.3.7), สี่บทบาท (§1.4.1.1), สี่สถานะรวม Closed (§1.4.5.1) และสาย Record → Finding → CAR → Closure (§1.4.4.1) เป้าหมายเหล่านี้ไม่ถูกลบโดยการลดขอบเขต MVP; ต้องให้อาจารย์/เจ้าของโครงงานยืนยันการอธิบายขอบเขตและถ้อยคำก่อน Baseline ส่วนบท A ระบุการบันทึกข้อมูลรับทราบอัตโนมัติหลังการยืนยัน ไม่ตีความว่าดาวน์โหลดแล้วรับทราบอัตโนมัติ
"""

TBD_NOTE = """## C.3 วิธีอ่านสถานะรายการค้างหลัง reconciliation

| หมวด | ความหมาย |
| :--- | :--- |
| A | ยังไม่มีข้อยุติจริง คงเปิดไว้ พร้อมผู้ตอบและหลักฐานที่ต้องได้ |
| B | มีมติ/หลักฐานยืนยันแล้ว ปิดเฉพาะขอบเขตย่อยที่ยืนยัน ไม่ขยายเป็นนโยบายใช้งานจริง |
| C | พัก/นอกขอบเขต MVP; ไม่เป็นเกณฑ์ตรวจรับรอบนี้ แต่ไม่ลบวัตถุประสงค์โครงงานระยะเต็ม |
| D | ข้อจำกัดข้อมูลทดสอบหรือสภาพแวดล้อม ไม่ใช่ความกำกวมของข้อกำหนด |

TC-093–095 อยู่หมวด D: fixture ไม่มีคู่ Auditor/หน่วยงานที่ขัดกัน จึงยัง BLOCKED ในเอกสาร Manual UI Acceptance; กฎปฏิเสธ conflict, DCC waiver พร้อมเหตุผล/audit และข้อห้าม Lead bypass ยืนยันแล้ว ไม่เปิด TBD ทางธุรกิจขึ้นใหม่เพราะทดสอบชุดข้อมูลนี้ไม่ได้

การอ่านต้นฉบับหรือผ่าน test ไม่ปิดอำนาจปิด CAR/NCR และอำนาจผู้ตรวจแทน DCC โดยอนุมาน ทั้งสองเรื่องยังเป็น A และคำสั่งที่เกี่ยวข้องถูกพักตาม §1.4.3 ไม่เพิ่มผู้มีอำนาจปิด/ตรวจแทนในฉบับนี้

### C.3.1 การจัดหมวดของรายการเดิม ณ 26 กันยายน 2569

| รหัส | หมวดและสถานะปัจจุบัน |
| :--- | :--- |
| `TBD-A-01` | B: รูปแบบฟอร์มหกช่องยืนยันจาก `REF-05`; C: ประเภทนอก create/revise QM/QP/WI/SD/FM พักจาก MVP; A: วิธีดำเนินการถือครองและการจับคู่ขอสำเนาไม่ควบคุมยังไม่สรุป |
| `TBD-A-02` | B: เส้นทาง MVP ยึด `REF-02` §6.2 ตามมติผู้ใช้; A: ข้อขัดกันกับ §4 และกรณีผู้ทบทวน/ผู้อนุมัติเป็นบุคคลเดียวกันในนโยบายจริงยังเปิด |
| `TBD-A-03` | B: ต้องมีแจกจ่าย/เรียกคืนก่อนปิด DAR; C: งานทำลาย/ทบทวนตามรอบที่พัก; A: กฎรายประเภทนอก MVP ยังต้องยืนยัน |
| `TBD-A-04` | B: `REF-02` §6.6 ระบุไฟล์อิเล็กทรอนิกส์ไม่ควบคุมตามนโยบายเอกสารเดิม; A: การเปลี่ยนนโยบายให้ระบบเป็นแหล่งควบคุมยังต้องมติ QMR |
| `TBD-A-05` | A: กฎเลื่อน Issue และวันมีผลอนาคตยังไม่ยืนยัน; การคงข้อมูลฉบับต้นทางเป็นข้อบังคับของ MVP |
| `TBD-A-06` | B: แยก Registrar/DCC และเส้นทางมอบหมายเฉพาะใบเป็นกฎระบบทดลอง; A: เป็นคนเดียวกันจริงหรือไม่, สิทธิ์ผู้ช่วย และอำนาจรายชื่อรับทราบสำหรับใช้งานจริงยังเปิด |
| `TBD-A-07`, `TBD-A-09`–`TBD-A-12` | A: อุปกรณ์จริง/ขนาดไฟล์ที่ยอมรับ/ต้นฉบับควบคุม/backup restore และเกณฑ์ประสิทธิภาพยังไม่มีหลักฐานรับรองทั้งหมด; ผล UI หรือ read-only backup check ไม่ปิดเกณฑ์เหล่านี้ |
| `TBD-A-08` | B: Q1–Q6 ตกลงเชิงโครงการ 12 ก.ย. 2569 รวมร่าง DAR หลังปิดใบ; C: trigger หลังปิดใบพักเพราะ MVP ไม่ปิด CAR/NCR; A: การลงนามข้อตกลงยังเปิด |
| `TBD-A-13` | A: กฎกรณีส่งกลับ/ปฏิเสธ/วันอนาคต/งานรับทราบเดิมยังเปิดเฉพาะส่วนที่มติ MVP ไม่ครอบคลุม |
| `TBD-B-01`, `TBD-B-02`, `TBD-B-04` | A: ความต่างจาก Chapter 1 Word ปัจจุบันเรื่องบทบาท ถ้อยคำระบบเดียว และวงจร Closed ยังต้องให้ผู้มีอำนาจยืนยัน |
| `TBD-B-03`, `TBD-B-05`, `TBD-B-12` | B: ปิดตามหลักฐานต้นฉบับที่บันทึกไว้เดิม; `TBD-B-05` ใช้กับผลตรวจไม่ผ่านจากขั้น verification ที่เปิดใช้ |
| `TBD-B-06` | B: MVP ยืนยัน Internal Audit → CAR, Management Review → NCR; A: ชนิดใบจาก Finding แหล่งอื่นยังไม่ยืนยัน |
| `TBD-B-07` | C: การเปิดใบจาก OB/ข้อเสนอแนะและทะเบียนความเสี่ยงเต็มรูปแบบพัก; A: กฎระยะเต็มยังรอผู้ใช้ |
| `TBD-B-08` | A: ต้องยืนยันว่าไฟล์ Uncontrolled ตรง Hard Copy ฉบับที่ใช้จริง; อ่านไฟล์ครบไม่ปิดการรับรองฉบับ |
| `TBD-B-09` | C: ค่ารายขั้นอัตโนมัติพักจาก MVP; A: ค่า default/กรอบเวลาสำหรับระยะเต็มยังไม่ยืนยัน |
| `TBD-B-10` | B: QMR อนุมัติแผน CAR และ NCR ในระบบทดลองตามมติ 20 ก.ย. 2569; A: การขยายอำนาจ Lead Auditor/ผู้ช่วยสำหรับระยะเต็มยังไม่ยืนยัน |
| `TBD-B-11` | B: MVP ใช้สังกัดจริงเทียบกลุ่มงานเป้าหมาย ปฏิเสธ conflict และ DCC waiver ต้องมีเหตุผล/audit; A: ความเป็นอิสระระดับหน้าที่กระบวนการและทะเบียนผู้ตรวจใช้งานจริงยังเปิด; D: TC-093–095 fixture BLOCKED |
| `TBD-B-13`–`TBD-B-20` | A: ค่าขนาดไฟล์/near-due/performance/load/SUS/deploy/browser และการรับรองจากผู้ใช้ยังเปิดตามรายการ C.2.2; ผล UI พื้นฐานไม่รับรอง NFR เต็มชุด |
| `TBD-B-21` | C: camera capture จากระบบพัก; MVP อัปโหลดไฟล์ที่ถ่ายไว้; A: ความต้องการหน้างานจริงยังรอผู้ใช้ |
| `TBD-B-22` | B: MVP หกหมวดและการกรองก่อนรวมตามมติ; C: metric ขั้นสูงและ post-closure ที่พัก; A: องค์ประกอบ dashboard สำหรับระยะเต็มยังรอผู้ใช้ |
| `TBD-B-23` | B: มติเดิมเลือก Chart.js 4/React wrapper 5; implementation ใช้ native SVG ต่างจาก constraint, ต้องตัดสิน follow-up ไม่แก้ข้อกำหนดตามโค้ด |

### C.3.2 รายการเปิดที่เพิ่มจากการทบทวน

| ID | หมวด | ประเด็นและหลักฐานที่ต้องได้ | ผลต่อ MVP |
| :--- | :--- | :--- | :--- |
| `TBD-B-24` | A | ผู้มีอำนาจปิด CAR/NCR จำนวนผู้ลงนาม และกฎส่งกลับจาก `PENDING_CLOSURE`; ต้องได้มติจากเจ้าของกระบวนการ/QMR พร้อมแบบฟอร์มที่ใช้จริง | ห้าม close; จบที่ `PENDING_CLOSURE`; `FR-B-30`–`FR-B-32`, `UC-B-13`, `AC-B-22` พัก |
| `TBD-B-25` | A | ผู้ตรวจแทนเมื่อ DCC เป็นผู้แจ้ง Finding; ต้องได้มติชัดจากเจ้าของกระบวนการ ไม่อนุมานจากบทบาท Lead/QMR/Assistant DCC | ใบกรณีนี้ค้าง `PENDING_VERIFICATION`; `FR-B-28`, `UC-B-12`, `AC-B-21` |
"""

AC_STATUS = """## D.3 สถานะการทวนสอบปัจจุบัน ณ 26 กันยายน 2569

Manual UI Acceptance ได้ดำเนินการแล้ว: **40 scenarios / 139 test cases: PASS 136, FAIL 0, BLOCKED 3, NOT RUN 0** ตาม `docs/MANUAL_UI_ACCEPTANCE.md` §9; ผลตัดสินที่บันทึกคือ **ACCEPT WITH OBSERVATIONS** ไม่ใช่ผ่านครบทุกกรณีหรือการอนุมัติ Baseline ไม่มีการทดสอบ UI เพิ่มในงาน reconciliation นี้ และไม่เปลี่ยนผล TC จากการอ่าน source

BLOCKED เฉพาะ TC-093–095 เนื่องจาก fixture สำหรับ auditor independence; ไม่ใช่ application defect และไม่ลดกฎธุรกิจ ผล PDF TC-046/061/075 เป็น PASS ตามเกณฑ์ Download-only ที่อนุมัติ โดยเก็บข้อสังเกตเดิมไว้ TC-123 ได้รัน DCC-reporter case จริง: NCR คง PENDING_VERIFICATION ไม่มีผู้ตรวจแทนที่ระบบเพิ่มอำนาจเอง ส่วน CAR/NCR ที่มีผู้ตรวจตามกติกาถึง PENDING_CLOSURE เท่านั้น

| ขอบเขตตรวจรับ | กรณี UI / หลักฐาน | ความหมายและขอบเขตการอ้างผล |
| :--- | :--- | :--- |
| Login / session / permission | TC-001–024 และ TC-139 | ตรวจ flow บัญชีเดโม/การกู้คืนหลัง API restart; ไม่ใช่การทดสอบ production session store |
| Documents / DAR | TC-025–070 | ตรวจทะเบียน ไฟล์ routing และ workflow ตามแถวกรณีจริง; ไม่ครอบคลุม DAR ประเภทที่พัก |
| Acknowledgement | TC-071–079 | ตรวจมอบหมาย เข้าถึง ยืนยัน และติดตามรายฉบับ; ผล flow UI ไม่รับรองการบังคับเงื่อนไขเข้าถึงไฟล์ผ่าน API โดยตรง ดู IMPLEMENTATION DISCREPANCY ในรายงาน reconciliation |
| Records / Evidence | TC-080–089 และ TC-098 | ตรวจไฟล์ ความสัมพันธ์ Finding → Record → Evidence และสิทธิ์; ไม่บังคับ inline viewer |
| Audit / Finding / independence | TC-090–103 | TC-093–095 ยัง BLOCKED; ไม่อ้างว่าทดสอบ waiver/Lead conflict ผ่าน UI แล้ว |
| CAR / NCR | TC-104–124 | แผนโดย QMR ผู้แจ้งเดิมตรวจ ห้ามตรวจตนเอง; รองรับถึง PENDING_CLOSURE; TC-123 ตรวจการพักเมื่อ DCC แจ้ง ไม่ได้อนุมัติผู้ตรวจแทน |
| Dashboard / cross-cutting UI | TC-125–139 | หกหมวดตามสิทธิ์ Sponsor aggregate-only และ UI recovery; ไม่รับรอง export, analytics หรือการทดสอบ accessibility เต็มรูปแบบ |

ตารางนี้เป็นการจับคู่ขอบเขตเพื่ออ่านหลักฐาน ไม่ใช่การรับรองว่า AC ทุกข้อผ่านหนึ่งต่อหนึ่ง เกณฑ์ตัวเลข/นโยบายที่ยัง TBD งานที่พัก การ restore ไปเครื่องแยก ประสิทธิภาพ โหลด SUS และการติดตั้งยังต้องมีหลักฐานเฉพาะก่อนกล่าวว่าผ่าน ผล System/API E2E วันที่ 21 ก.ย. 2569 อยู่แยกใน `docs/SYSTEM_E2E_VERIFICATION_2026-09-21.md` (รายงานเดิม 11/11); ไม่รวมจำนวนกับ 139 UI cases และไม่ได้ rerun ในงานนี้
"""

TRACE_STATUS = """## E.3 สถานะการสอบกลับของขอบเขตที่ทบทวน

ตาราง E.1–E.2 คงรหัสข้อกำหนดเดิมและสายโยงต้นทาง → FR/NFR/BR → UC → AC/Model การมีสายโยงครบไม่แปลว่าพัฒนาหรือทดสอบครบ สถานะ MVP และการตรวจรับต้องอ่านร่วมกับ §1.4.3 และ D.3

| กลุ่มรหัส | ขอบเขตปัจจุบัน / หลักฐาน |
| :--- | :--- |
| UC-A-01–06, UC-A-08–12; FR-A-01–10, FR-A-12–18 | Documents/DAR/การรับทราบตามเส้นทางที่ยืนยัน; DAR ประเภทอื่นและ future scheduling ยังไม่ใช่ผลผ่านของ MVP; Manual UI Acceptance กลุ่ม Documents/DAR/Acknowledgement |
| UC-A-07; FR-A-11 | ยกเลิกใช้งานเอกสารเป็นกระบวนการที่พัก; คงการสอบกลับและการอ่านประวัติ ไม่อ้างว่าได้ทดสอบคำขอยกเลิกใหม่ |
| FR-B-10–19; BR-B-18; AC-B-11.1; AC-B-35 | Records/Audit/Finding; independence ยืนยันแล้วแต่ UI conflict fixture BLOCKED; Finding → Record → Evidence ตาม TC-098 และสิทธิ์ดาวน์โหลด |
| FR-B-20–29; BR-B-12; AC-B-17–19 | CAR/NCR ผ่าน QMR approval และผู้แจ้งเดิมตรวจ; คงข้อห้ามตรวจ/อนุมัติงานตนเอง; TC-104–124 ตามรายละเอียดรายกรณี |
| FR-B-30–32; UC-B-13; AC-B-22 | การปิดใบ/ผลหลังปิดพักจนกว่าอำนาจจะยืนยัน; PENDING_CLOSURE เป็น endpoint ที่รองรับ; AC-B-20–21 สำหรับการอนุมัติแผน/ห้ามตรวจตนเองยังอยู่ใน MVP |
| FR-B-33–36; UC-B-14 | ติดตามวันครบกำหนดที่กำหนดจริงตามขอบเขตระบบ; automatic per-stage defaults และ near-due policy ยังมี TBD; ไม่อ้างว่าครบข้อกำหนดเชิงนโยบายทั้งหมด |
| FR-B-37–39.5; UC-B-15 | หกหมวดและกรองสิทธิ์ก่อน aggregate; ข้อวิเคราะห์ขั้นสูง/metric หลัง closure ที่พักยังไม่เป็นเกณฑ์ผ่าน MVP; TC-125–134 |
| FR-B-40; FR-B-41; UC-B-16 | FR-B-40 การกรองสิทธิ์ Dashboard อยู่ใน MVP; FR-B-41/UC-B-16 export/report ภายนอกขอบเขตปัจจุบัน; คงเป้าหมาย Chapter 1 ไว้ ไม่มีผล PASS ของ export |
| FR-A-20; FR-B-42 | การอ้างข้อมูลภายในระบบและข้อจำกัดเดิมยังเป็นข้อกำหนด; Q1 หลังปิดใบพักตาม dependency closure; ข้อไม่ตรง implementation แยกในรายงาน ไม่ลดข้อกำหนดให้เท่าโค้ด |

### E.3.1 รหัสย่อย FR ที่ไม่ได้แยกแถวในดัชนีรหัสหลัก

ตารางนี้เติมสายโยงของรหัสย่อยเดิม ไม่สร้างข้อกำหนดใหม่และไม่ถือการอ้าง AC ว่าทดสอบผ่าน ข้อที่พักระบุชัดว่า AC เป็นเกณฑ์อนาคต/ครอบคลุมเพียงบางส่วน

| Source / evidence | Requirement | Use Case / behavior | AC / coverage | Model | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `REF-05`; `TBD-A-01` | `FR-A-04.1` | `UC-A-02` | `AC-A-17` | `M-A-03` | MVP; ประเภทอื่น ๆ ยังนอก MVP |
| ตัวอย่างทะเบียน DAR ใน `FR-A-04.2` | `FR-A-04.2` | `UC-A-02` | `AC-A-03` (ตรวจเลข; กรณีส่งซ้ำตรวจเพิ่มใน D.1) | `M-A-03` | MVP |
| ช่องวันมีผลบน `REF-05`; `TBD-A-05` | `FR-A-04.3` | `UC-A-02` | `AC-A-23` | `M-A-03` | วันอนาคตยัง TBD |
| ข้อตกลงส่วนเชื่อมต่อ `TBD-A-08` | `FR-A-20.1` | §4.16 พฤติกรรมร่วม | `AC-A-25` | `M-A-09` | ข้อกำหนดคงอยู่; implementation discrepancy แยก |
| `TBD-B-14` | `FR-B-11.1` | `UC-B-04` | `AC-B-08` | `M-B-02`, `M-B-03` | MVP; ค่าอนุญาตจริงยัง TBD |
| `REF-03`; `BR-B-18`; `TBD-B-11` | `FR-B-14.1`, `FR-B-14.2` | `UC-B-06` | `AC-B-11.1` (TC-093–095 fixture BLOCKED) | `M-B-04` | กฎ MVP ยืนยัน; ผล UI ยัง blocked |
| `REF-01` §9.2; `TBD-B-15` | `FR-B-18.1` | `UC-B-07` | `AC-B-14` | `M-B-05` | นิยามระดับยังรอผู้ใช้; ไม่อ้างผลทดสอบครบ |
| `TBD-B-15`, `TBD-B-22` | `FR-B-20.1` | `UC-B-08` | `AC-B-16` เฉพาะชนิดใบ; การเตือนเกิดซ้ำยังไม่มี AC เฉพาะ | `M-B-06` | Deferred ตาม dependency การปิดใบ |
| `REF-04` §5; `TBD-B-09`, `TBD-B-16` | `FR-B-39.1` | `UC-B-15`, `UC-B-14` | `AC-B-24` รอเกณฑ์ | `M-B-01`, `M-B-12` | Deferred metric รายขั้นอัตโนมัติ |
| `TBD-B-22` | `FR-B-39.2` | `UC-B-15` | `AC-B-25` ไม่ถือผ่าน analytics นี้ | `M-B-01` | Deferred advanced breakdown |
| `TBD-B-24` | `FR-B-39.3`, `FR-B-39.4` | `UC-B-15` | `AC-B-25` ไม่ถือผ่านผลหลังปิด | `M-B-01` | Deferred until closure |
| `TBD-B-23` | `FR-B-39.5` | `UC-B-15` | `AC-B-25` ครอบคลุมเพียงการ์ด/กราฟปัจจุบัน | `M-B-01` | Deferred full metric presentation |

### E.3.2 เกณฑ์และข้อจำกัดที่ไม่ได้เป็นแถว FR หลัก

| AC / constraint | Requirement, behavior and model link | Current interpretation |
| :--- | :--- | :--- |
| `AC-A-18`, `AC-A-19` | `BR-A-03`, `BR-A-04`; `FR-A-08`; `UC-A-05`; `M-A-04` | อำนาจจริง §4/§6.2 ยังเปิดใน Appendix C |
| `AC-A-20` | `BR-A-08`; `FR-A-16`; `UC-A-12`; `M-A-06` | หลักฐานแจกจ่าย/เรียกคืนก่อนปิด DAR |
| `AC-A-21` | `CON-A-06`; `UC-A-08`; `M-A-02`; `TBD-A-04` | นโยบายสำเนาควบคุมยังต้องมติ QMR |
| `AC-A-22`, `AC-A-23` | `BR-A-06`, `FR-A-04.3`, `FR-A-09`; `UC-A-02`, `UC-A-06`; `M-A-02`, `M-A-03` | กฎ Issue/วันอนาคตยัง TBD บางส่วน |
| `AC-A-24` | §3.3 การตรวจชนิดไฟล์; `UC-A-01`; `TBD-A-09` | ยังไม่มี FR เฉพาะที่ระบุ content sniffing; เป็นข้อจำกัดไฟล์ provisional ไม่ยกระดับเป็นผลผ่าน |
| `AC-A-25` | `FR-A-20.1`; §4.16; `M-A-09` | พฤติกรรมร่วมเมื่ออ่านข้อมูลข้ามโมดูลไม่สำเร็จ |
| `AC-A-26`, `AC-A-27` | `NFR-A-07`, `NFR-A-04`; เกณฑ์ performance/restore ข้าม UC | เกณฑ์ตัวเลขและผล restore ยังไม่รับรอง |
| `AC-A-28` | `FR-A-18`; `UC-A-05`; `M-A-07`; `TBD-A-06` | บันทึกผู้ช่วยในนามตน; อำนาจรายกรณียังเปิด |
| `AC-B-29` | `BR-B-09`; §4.31; `M-B-11` | ห้ามข้ามขั้นสถานะ |
| `AC-B-30`, `AC-B-31`, `AC-B-32`, `AC-B-33`, `AC-B-34` | `NFR-B-05`, `NFR-B-02`, `NFR-B-07`; ข้าม UC | เกณฑ์ performance/usability/deploy ยังไม่มีผลรับรองจาก 139 UI cases |
| `CON-B-02` | §2.5 ข้อจำกัดกำลังคน/เวลา; กำกับ priority ทุก UC | ข้อจำกัดแผนงาน ไม่ใช่ behavior หรือ AC แยก |
| `M-B-08` | แบบจำลองกิจกรรมแผนใน Appendix B; อยู่ในกลุ่ม `M-B-07`–`M-B-09` ของ `US-B-05` | ไม่มี UC/AC แยกจากกิจกรรมแผน |

ประวัติสถานะเอกสารและแบบจำลองเก่าคงไว้เพื่อสอบกลับ ภาพเก่าที่แสดงผู้ปิดหรือวงจรครบไม่ใช่หลักฐานอำนาจ/ความครบของ MVP ปัจจุบัน ให้ใช้ตารางสถานะและ Authority Matrix ฉบับนี้
"""

QA_STATUS = """## F.4 ผล reconciliation ปัจจุบัน

**Version 1.2 — Working Draft — Implementation Reconciled** ยังไม่เป็น Baseline Candidate หรือ Approved Baseline เนื่องจากยังมีข้อยุติเชิงนโยบายและความต่างจาก Chapter 1 ที่ต้องรับรอง รวมทั้ง IMPLEMENTATION DISCREPANCY ที่ต้องติดตาม ไม่มีการอนุมัติแทนผู้มีอำนาจ

| QA ด้าน | หลักฐานและสถานะปัจจุบัน | ข้อจำกัด |
| :--- | :--- | :--- |
| โครงสร้างเอกสาร | ตัวสร้างและตัวตรวจ §1–§6, Appendix A–F, UC 28 ข้อ และรหัสหลัก/ตาราง | เป็น document QA ไม่ใช่ผลทดสอบระบบ |
| สายสอบกลับ | Appendix E จับคู่แหล่งที่มา → FR/BR → UC/พฤติกรรมร่วม → AC → Model; รหัสย่อย/เกณฑ์ข้าม UC อยู่ E.3 | รายการ deferred/TBD ไม่แปลว่าตรวจรับผ่าน |
| Implementation verification | หลักฐาน System/API E2E วันที่ 21 ก.ย. 2569 และผล source review ในรายงาน reconciliation | ไม่ได้ rerun application tests ในรอบเอกสารนี้ |
| Manual UI Acceptance | 40 scenarios / 139 cases: PASS 136, FAIL 0, BLOCKED 3, NOT RUN 0; ACCEPT WITH OBSERVATIONS | TC-093–095 fixture blocked; ไม่ใช่ 139/139 PASS หรือ real-user final acceptance |
| TBD และ discrepancy | Appendix C เปิดอำนาจปิด/ผู้ตรวจแทน และข้ออื่นตามสถานะ; discrepancy 3 รายการอยู่รายงาน reconciliation | ต้องได้มติ/แก้จริงก่อน Baseline; ไม่ให้โค้ดเปลี่ยน requirement โดยอนุมาน |

ระบบมี implementation และ Manual UI Acceptance แล้วตาม D.3 ข้อความ “ยังไม่มีระบบ/ยังไม่ทดสอบ” ใน F.1–F.3 เป็นประวัติผลตรวจ ณ วันที่เดิมเท่านั้น ไม่ใช่สถานะปัจจุบัน ผล performance/load/SUS/restore และการยอมรับทุก browser ยังไม่ยืนยันจาก UI smoke

รายการ F.2 เดิมที่ระบุว่า dependency cycle “ขัดกับ NFR-B-04” เกินถ้อยคำของ NFR-B-04 ซึ่งกำหนดแยกโดเมน/แยกกฎจาก route แต่ไม่ได้ห้ามการพึ่งพาวงจรโดยตรง; ให้ถือเป็น design concern ที่ต้องทบทวน ไม่ใช่ผล FAIL ของข้อกำหนดโดยอัตโนมัติ

รอบนี้ตรวจการสร้าง SRS ใหม่ การคงรหัส การนิยามและการอ้างอิง FR/NFR/BR/CON/UC/AC/TBD โครงสร้างตาราง/หัวข้อ และความสอดคล้องของขอบเขต อำนาจ สถานะ และรายการค้าง ผลคำสั่งตรวจจริงและข้อจำกัดเครื่องมือตรวจเดิมบันทึกใน `docs/SRS_RECONCILIATION_2026-09-26.md` ไม่ใช้ผลตรวจเอกสารแทนผลทดสอบระบบ

ต้นทางโมดูลและประวัติเดิมไม่ถูกเขียนทับ การแก้ requirements ทำผ่าน `scripts/srs_merge_rules.py` และแหล่งกฎ reconciliation ที่ import โดย `scripts/merge_srs.py` แล้ว regenerate `SRS_v1.md`; ไม่แก้ frontend/backend/schema/migrations/database/seed/demo data/business logic/tests และไม่แก้บทที่ 4–5
"""


def apply_shared(text):
    text = text.replace('| Version | 1.1 |', '| Version | 1.2 |', 1)
    text = text.replace('| วันที่ | 16 ก.ย. 2569 |', '| วันที่ | 26 ก.ย. 2569 |', 1)
    text = text.replace('| สถานะ | Working Draft — รวมครบ §1–6 และ Appendix A–F ยังไม่ใช่ Baseline |',
                        '| สถานะ | Working Draft — Implementation Reconciled; ยังไม่ใช่ Baseline Candidate / Approved Baseline |', 1)
    marker = '| 1.1 | 16 ก.ย. 2569 |'
    text = text.replace(marker, '| 1.2 | 26 ก.ย. 2569 | Reconcile requirements กับมติ MVP และหลักฐาน implementation/Manual UI Acceptance; คง TBD อำนาจปิดใบและผู้ตรวจแทน DCC; แยกงานพักกับ implementation discrepancies และคงรหัสเดิม | Working Draft — Implementation Reconciled | ระบบรวม |\n' + marker, 1)
    text = text.replace('## 1.5 References', SCOPE + '\n## 1.5 References', 1)
    text = text.replace('# Appendix D: Acceptance Criteria', TBD_NOTE + '\n# Appendix D: Acceptance Criteria', 1)
    text = text.replace('เกณฑ์ทั้งหมดเป็น Given–When–Then สำหรับวางแผนทดสอบ **ยังไม่ได้ทดสอบระบบจริง** เงื่อนไขที่พึ่ง TBD ต้องปิดก่อนใช้ตัดสินผ่าน เส้นทาง A/E ใน §4 เป็นกรณีตรวจเพิ่มเติม ไม่กล่าวว่า AC 16 ข้อครอบคลุมทุกข้อผิดพลาดแล้ว',
                        'เกณฑ์ Given–When–Then ชุดนี้เริ่มเป็นแผนทดสอบ; ปัจจุบันมีผล Manual UI Acceptance ตาม D.3 แล้ว แต่ไม่ใช่การยืนยันทุก AC แบบหนึ่งต่อหนึ่ง เงื่อนไขที่พึ่ง TBD ยังใช้ตัดสินผ่านไม่ได้ และเส้นทาง A/E ใน §4 ต้องทดสอบตามบริบท', 1)
    text = text.replace('เกณฑ์การยอมรับเขียนแบบ **Given–When–Then** ทุกข้อ · ทุกเกณฑ์ต้องทดสอบได้จริงโดยไม่ต้องตีความเพิ่ม · เกณฑ์ที่ยังต้องรอค่าจากรายการค้างระบุไว้ชัดว่ารอค่าใด',
                        'เกณฑ์การยอมรับใช้ Given–When–Then; สถานะผลทดสอบปัจจุบันอยู่ D.3 ไม่อนุมานว่าทุกเกณฑ์ผ่านจากยอดรวม UI. เกณฑ์ที่ยังรอค่าจากรายการค้างและงานที่พักต้องยืนยันก่อนใช้ตัดสิน', 1)
    text = text.replace('# Appendix E:', AC_STATUS + '\n# Appendix E:', 1)
    text = text.replace('# Appendix F:', TRACE_STATUS + '\n# Appendix F:', 1)
    text = text.replace('## F.3 ข้อสังเกตจากการรวมเล่ม', '## F.3 ประวัติข้อสังเกตจากการรวมเล่ม 12–16 กันยายน 2569\n\n> เก็บผลเดิมเพื่อสอบกลับ สถานะปัจจุบันอยู่ F.4 และ D.3 ไม่ใช้รายการค้าง/ข้อความยังไม่ทดสอบด้านล่างแทนผลปัจจุบัน', 1)
    text = text.replace('End of Software Requirements Specification — E-Filing Phase 1', QA_STATUS + '\nEnd of Software Requirements Specification — E-Filing Phase 1', 1)
    # Preserve the existing workspace's manually added diagram reference as a
    # reproducible, explicitly historical link rather than silently losing it.
    marker = 'สองหัวข้อสุดท้าย (§4.30 และ §4.31)'
    text = text.replace(marker, 'แผนภาพกรณีการใช้งานกลุ่ม B ครอบคลุม `UC-B-01`–`UC-B-16` เก็บเป็น [ชุด Use Case Diagram กลุ่ม B พร้อมตารางสอบกลับผู้ทำการ](Project%20report/figures/groupB/b4_use_case.html) ห้าภาพและไฟล์ SVG/PNG เดิมเพื่อสอบกลับการออกแบบ; ส่วนอนุมัติ/ปิดใบและรายงานในภาพเป็นขอบเขตเดิม ไม่ใช่สิทธิ์หรือฟังก์ชัน MVP ที่เปิดใช้ ตารางสถานะและ Authority Matrix ฉบับ 1.2 เป็นข้อมูลปัจจุบัน\n\n' + marker, 1)
    # Q1 safeguards remain verbatim; later MVP scope restricts activation.
    text = text.replace('#### กติกาการสร้างร่าง DAR จากใบคำร้อง — Q1', '#### กติกาการสร้างร่าง DAR จากใบคำร้อง — Q1\n\n> มติเดิมคงอยู่สำหรับระยะเต็ม แต่ trigger หลังปิดใบยังไม่เกิดใน MVP ที่หยุด PENDING_CLOSURE จึงพักการทำงานส่วนนี้ ไม่อ้างว่าสร้าง DAR อัตโนมัติแล้ว และไม่ลบกติกาที่ตกลงไว้', 1)
    text = text.replace('| Q3 | FR-A-13–14, FR-B-38 | ตัวหารตามบัญชีแจกจ่ายตามมติ |', '| Q3 | FR-A-13–14, FR-B-38 | มติเดิมใช้บัญชีแจกจ่าย; ระบบทดลองใช้ผู้รับทราบที่ DCC มอบหมายตามมติ Step 4 และแยกจากผู้ถือครอง; นโยบายใช้งานจริงยังรอยืนยัน |', 1)
    old = '| Q3 นิยามอัตราการรับทราบ | ✅ **ตกลงแล้ว 12 ก.ย. 2569** — ทางเลือก **ก. ตัวหารคือผู้ถือครองในบัญชีแจกจ่าย** | เป็นสิ่งที่มีอยู่จริงในกระบวนการ เพราะ `FM-QP-2301-0107-03` มีช่องผู้ถือครองพร้อมลายเซ็นอยู่แล้ว ไม่ใช่แนวคิดที่ทีมสร้างขึ้นเอง |'
    new = '| Q3 นิยามอัตราการรับทราบ | มติเดิม 12 ก.ย. 2569 ใช้ผู้ถือครองในบัญชีแจกจ่าย; สำหรับ MVP ใช้ผู้รับทราบที่ DCC มอบหมายต่อฉบับตามมติ Step 4 | ผู้ถือครอง/การรับสำเนาไม่ใช่เหตุการณ์รับทราบ; นโยบายและรายชื่อสำหรับใช้งานจริงยังต้องยืนยัน ไม่ปิดด้วยผลทดสอบ |'
    assert old in text
    return text.replace(old, new, 1)
