# E-Filing — โครงเริ่มต้นระบบจริง

React + TypeScript + Vite → Express + TypeScript → PostgreSQL ผ่าน Prisma
ใช้สถาปัตยกรรมสามชั้น (Three-tier) + Modular Service Design และฐานข้อมูลร่วมกันทั้งโครงการ
ปัจจุบันมีบัญชีเดโม 14 บทบาท และทะเบียนเอกสาร/ไฟล์จริง ตรวจสิทธิ์ฝั่ง API แล้ว ส่วน DAR และ workflow อื่นยังไม่พัฒนา

## เริ่มบนเครื่องใหม่

ใช้ Node.js 22.12 ขึ้นไป และ PostgreSQL 17 ขึ้นไป พร้อมฐานพัฒนาชื่อ `efiling` และบัญชีที่เชื่อมได้ ไม่ต้องใช้ Docker
รันจากโฟลเดอร์ `efiling`:

```powershell
npm ci
Copy-Item .env.example .env
```

หากมี `.env` แล้วให้แก้ไฟล์เดิม ไม่คัดลอกทับ แก้ `DATABASE_URL` ให้ตรงกับเครื่องตนเอง แทน `CHANGE_ME` ด้วยรหัสผ่านจริง (URL-encode หากมีอักขระพิเศษ) อย่าใส่ URL นี้ในตัวแปร `VITE_*`

```powershell
npm run db:validate
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

เปิด http://127.0.0.1:5173 เว็บและ API รับการเชื่อมต่อเฉพาะเครื่องนี้ API ใช้พอร์ต 3001
หากยังไม่มี `.env` API ยังเปิดได้ แต่ฐานข้อมูลจะแสดงว่าเชื่อมต่อไม่ได้
validate/generate ใช้ URL ตัวอย่างเมื่อยังไม่ได้ตั้งค่า โดยไม่เชื่อมฐานหรือสร้างตาราง

## PostgreSQL พกพาที่เตรียมไว้บนเครื่องนี้

PostgreSQL 17.10 อยู่ที่ `.local/postgres/package/native` จากแพ็กเกจ `@embedded-postgres/windows-x64@17.10.0-beta.17` ใช้เฉพาะพัฒนาในเครื่อง ไม่ได้ติดตั้ง Windows service หรือเพิ่มเป็น dependency แอป
ฐานพัฒนาชื่อ `efiling` พอร์ต **55432** รับเฉพาะ 127.0.0.1 ใช้รหัสผ่านสุ่มใน `.env`
`.local` และ `.env` ไม่เข้า Git จึงไม่มีติดไปเมื่อ clone เครื่องใหม่

เริ่มฐานหลังเปิดเครื่องใหม่ จากโฟลเดอร์ `efiling`:

```powershell
& ./.local/postgres/package/native/bin/pg_ctl.exe -D ./.local/postgres/data -l ./.local/postgres/server.log -o '-h 127.0.0.1 -p 55432' -w start
```

หยุดเฉพาะฐานพัฒนาชุดนี้:

```powershell
& ./.local/postgres/package/native/bin/pg_ctl.exe -D ./.local/postgres/data -m fast -w stop
```

## โครงสร้างและ schema

- `frontend/src/pages`: หน้า Login, Layout, เมนู และสถานะ; `components`: ส่วนหน้าจอร่วม; `services`: เรียก API; `App.tsx`: จัดการ session และเลือกหน้า
- `api/src/routes`: เส้นทาง; `controllers`: รับคำขอ/ตอบ HTTP; `services`: กฎและข้อมูล; `middleware`: session/สิทธิ์/validation/error; `data`: บัญชีเดโม; `lib`: Prisma; `config.ts`: ตั้งค่า
- `../prisma/schema.prisma`: schema ชุดเดียวของโครงการ ใช้ร่างเดิม ไม่คัดลอกอีกชุด

ตรึง Prisma 6.19.2 เพื่อรองรับ schema เดิม เรียก generator ของ package ในแอปโดยตรง เพราะ schema อยู่เหนือ workspace และเก็บ Client ใน `node_modules/.prisma/client` ซึ่งสร้างใหม่ได้และไม่เข้า Git
มี overrides ของ effect/deepmerge-ts เพื่อแก้ dependency advisories ของ Prisma CLI; ตรวจ validate/generate อีกครั้งเมื่ออัปเกรด
หลังเปลี่ยน schema หรือติดตั้ง dependencies ใหม่ให้รัน `npm run db:generate` ใช้ migration ที่ราก: initial สร้างโครงตาม schema ร่วม ตามด้วย constraints; ตารางของ workflow ยังไม่มีฟีเจอร์ใช้งาน ห้าม reset ฐานที่มีข้อมูล

## API และการตรวจรับ

| เส้นทาง | ผล |
|---|---|
| GET /api/health | 200 `{ "status": "ok" }` ไม่ขึ้นกับฐานข้อมูล |
| GET /api/health/db | ทดลอง SELECT 1; 200 `{ "status": "ok" }` หรือ 503 `{ "status": "unavailable" }` |

Health endpoints ไม่ cache และไม่ส่ง connection string หรือ error ภายในกลับ browser
หน้าเว็บตรวจสองจุดพร้อมกัน จำกัดเวลารอ 6 วินาที และมีปุ่มตรวจใหม่

```powershell
npm test
npm run typecheck
npm run build
```

Automated test จำลองฐานล่มและกลับมา พร้อมตรวจว่า API ไม่เปิดเผย error ภายใน
ทดสอบจริง: เปิดฐานและแอป → พร้อมทั้งสอง → หยุดฐาน → ตรวจใหม่ (API พร้อม แต่ฐานเชื่อมไม่ได้) → เปิดฐาน → ตรวจใหม่ (พร้อมทั้งสองโดยไม่ restart API)
build สร้าง output ใน `api/dist และ frontend/dist` และไม่ deploy; รัน API ที่ build แล้วจากโฟลเดอร์นี้ด้วย `node api/dist/server.js`

## แก้ปัญหา

- API เปิดไม่ได้: ตรวจ terminal และ API_PORT ใน `.env`; หากพอร์ตซ้ำเปลี่ยนค่าแล้ว restart dev เพื่อให้ Vite proxy อ่านค่าใหม่ด้วย
- พอร์ตเว็บ 5173 ซ้ำ: ปิด dev server ตัวเก่าก่อน Vite ตั้ง strictPort เพื่อไม่ย้ายพอร์ตเงียบ ๆ
- ฐานเชื่อมไม่ได้: ตรวจว่า PostgreSQL เปิดอยู่ และ host/port/database/user/password ถูกต้อง; restart API หลังแก้ `.env`
- หา Prisma Client ไม่เจอ: รัน npm ci แล้ว npm run db:generate จากโฟลเดอร์แอป
- PowerShell บล็อก npm.ps1: ใช้ npm.cmd แทน โดยไม่ต้องเปลี่ยนนโยบายเครื่อง

ฟีเจอร์ถัดไปคือ DAR อ้างอิง MVP ใน works และ SRS ฉบับรวม


## ขั้นที่ 1 — บัญชีเดโมและสิทธิ์เข้าเมนู

หน้าแรกเลือกบทบาทแล้วเติม email/password; กดเข้าสู่ระบบเพื่อเริ่ม session
ทุกบัญชีใช้รหัสผ่าน Demo1234! ตาม mockup เป็นบัญชีสาธิตที่จงใจเปิดเผย ไม่ใช่บัญชีผู้ใช้จริง
เมื่อเข้าแล้วใช้รายการสลับบัญชีเพื่อเปลี่ยนคนทันที เมนูคำนวณใหม่จากบัญชีที่ server ยืนยัน ไม่มีการรวมสิทธิ์จากคนก่อนหน้า

- บัญชีและเมนูเก็บคงที่ใน api/src/data/demoAccounts.ts ตาม mockup; ขั้นที่ 2 ใช้ db:seed ผูกกับ User/UserRole กลางแบบ UUID คงที่ เพื่อบันทึกผู้นำเข้า โดยไม่เปลี่ยนการเข้าสู่ระบบเดโม
- Cookie efiling.sid เป็น HttpOnly, SameSite=Strict อายุ 8 ชั่วโมง; ไม่มี token ใน localStorage
- รีเฟรชหน้ายังอยู่ใน session เดิม; สลับบัญชีจะยกเลิก session เก่า; ออกจากระบบจะทำลาย session และลบ cookie
- ใช้ express-session MemoryStore เฉพาะพัฒนาในเครื่อง: restart API แล้วทุก session หาย และยังไม่รองรับหลาย process
- ปิดการเริ่ม API เมื่อ NODE_ENV=production เพราะบัญชีเดโมและ session store นี้ไม่ได้เตรียมใช้ production
- POST ต้องมี X-EFiling-Client: web และไม่มีการเปิด CORS
- ทะเบียนเอกสารใช้ข้อมูลจริงและสิทธิ์รายรายการ/ไฟล์แล้ว; เมนูอื่นยังแสดงว่ายังไม่เริ่มพัฒนา

| API | หน้าที่ |
|---|---|
| GET /api/auth/demo-accounts | รายชื่อบัญชีเดโม 14 คน |
| POST /api/auth/login | รับ email/password เริ่มหรือเปลี่ยน session |
| GET /api/auth/me | บัญชีปัจจุบันและเมนู; 401 เมื่อยังไม่เข้าใช้ |
| POST /api/auth/logout | ยกเลิก session |
| GET /api/modules/:module/access | ตรวจสิทธิ์เข้าเมนู; 401 ไม่มี session, 403 ไม่มีสิทธิ์, 404 เมนูไม่รู้จัก; ไม่ใช่ API อ่านข้อมูลธุรกิจ |

npm test ตรวจทุก 98 คู่บทบาท/เมนู รวมปลอมบทบาท ส่งรหัสผ่านผิด สลับคน ยกเลิก session เก่า และออกจากระบบ

## โครงตามแนว Lab 07 (ปรับ 19 กันยายน 2569)

```text
efiling/
├── api/
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── data/
│   │   ├── lib/
│   │   ├── config.ts
│   │   ├── app.ts
│   │   └── server.ts
│   └── tests/
├── frontend/
│   └── src/
│       ├── pages/
│       ├── components/
│       ├── services/
│       ├── App.tsx
│       └── main.tsx
└── scripts/
```

อ่าน API ตามลำดับ app → routes → middleware → controller → service; service ไม่ใช้ req/res
อ่านเว็บจาก main → App → pages/components → services
คง TypeScript, npm workspaces, URL แบบ hash และพฤติกรรมเดิม ไม่มีโครง apps/modules/features เก่าค้างใน source
.env ยังอยู่ระดับ efiling และ schema อยู่ ../prisma/schema.prisma ชุดเดียว
ไฟล์ build ก่อนย้ายเก็บสำรองใน .local/refactor-backup (ไม่เข้า Git) ไม่ถูกใช้รันระบบ


## ขั้นที่ 2 — ทะเบียนและไฟล์ PDF

เปิดเมนูทะเบียนด้วย DCC เพื่อเพิ่มเอกสารเดิม ค้นหา กรอง อ่านไฟล์ และตรวจข้อมูลนำเข้า
รองรับ QM/QP/WI/SD/FM, PDF สูงสุด **128 MiB (134,217,728 bytes)** เพื่อรองรับชุด ISO files (ไฟล์ใหญ่สุดประมาณ 105 MiB) ไม่รันเลขใหม่และไม่สร้าง DAR ย้อนหลัง

- ใช้ชื่อและไฟล์เป็นข้อมูลขั้นต่ำ ช่องที่ยังไม่ยืนยันเก็บ null แสดงยังไม่ระบุ
- แยกสถานะตรวจข้อมูลออกจากสถานะฉบับ DCC/QMR เห็นรายการรอตรวจสอบ; ผู้ใช้อื่นอ่านได้ตามสิทธิ์เมื่อยืนยันแล้ว คณบดีเห็น QM ส่วนผู้ช่วย QMR ยังไม่มีเอกสารที่ได้รับมอบหมายจาก DAR ในขั้นนี้
- เอกสารนำเข้าทั่วไป: DCC แก้ข้อมูลรอตรวจสอบ การยืนยันต้องมีรหัส/ประเภท/Issue/Rev/วันที่/หน่วยงาน/เจ้าของ/สถานะครบ และบันทึกประวัติค่าเดิม/ใหม่; ไม่ใช้วันนำเข้าแทนวันประกาศใช้
- API ตรวจสิทธิ์เมื่ออ่านรายการ รายละเอียด และเปิด/ดาวน์โหลดไฟล์ ไม่เปิด storage เป็น static directory
- ไฟล์อยู่ `.local/document-storage` หรือ absolute path จาก DOCUMENT_STORAGE_DIR; ชื่อสุ่มและ SHA-256 อยู่ในฐาน ข้อมูลนี้ไม่ส่งให้ browser
- ต้องสำรองฐานและ storage คู่กัน ใช้ `npm run backup:migration` / `restore:migration` ตาม [คู่มือย้ายเครื่อง](docs/MIGRATION_BACKUP_RESTORE.md)

| API | หน้าที่ |
|---|---|
| GET /api/documents | ค้น q, type, status=pending/verified, lifecycle, departmentId |
| GET /api/documents/:id | รายละเอียด ฉบับ ไฟล์ และประวัติตามสิทธิ์ |
| POST /api/documents | multipart: file หนึ่งไฟล์ + metadata; DCC เท่านั้น |
| PATCH /api/documents/versions/:id | แก้ข้อมูลนำเข้ารอตรวจสอบหรือชุดกลางที่รับรองแล้ว; verified=true เพื่อตรวจยืนยันรายการทั่วไป |
| GET /api/documents/files/:id | เปิด PDF; เพิ่ม ?download=1 เพื่อดาวน์โหลด |

คำขอแก้ข้อมูลยังต้องมี X-EFiling-Client: web ใช้ cookie session เดิม
รหัส/ไฟล์ซ้ำจากหน้าอัปโหลดคืน 409; PDF ไม่ถูกต้องคืน 400; เกินขนาดคืน 413; ไม่มี session คืน 401

### นำเข้า ISO files ตั้งต้น

ต้องมีโฟลเดอร์ต้นฉบับ ISO files ที่รากโครงการ และ Python + PyMuPDF (`python -m pip install pymupdf` หากยังไม่มี)
จาก efiling:

```powershell
npm run iso:inventory
npm run iso:import
npm run iso:verify
npm run iso:report
```

inventory อ่านเอกสารและสร้างข้อมูลตั้งต้นใน .local โดยไม่แก้ PDF ต้นฉบับ ชื่อไฟล์เป็นข้อมูลตั้งต้น ไม่ถือเป็นหลักฐานยืนยันข้อมูลครบ
สคริปต์นำเข้า 296 ไฟล์ (QM 1, QP 32, SD 106, FM 157) ตรวจ hash และ source path เพื่อเรียกซ้ำได้โดยไม่ซ้ำข้อมูล
รหัสเดียวกันหลายไฟล์เก็บรอตรวจสอบโดยไม่เขียนทับ รหัสที่อ่านไม่ชัดเก็บว่างและระบุเหตุผล
ผู้รับผิดชอบยืนยันชุดนี้เป็นเอกสารกลางปัจจุบันแล้ว: ใช้ `npm run iso:confirm-central -- --confirm-current` เพื่อบันทึกหลักฐานยืนยันเฉพาะชุด 296 ไฟล์นี้ (เรียกซ้ำไม่แก้ข้อมูลซ้ำ) เป็น 295 เอกสาร / 295 ฉบับ / 296 ไฟล์ เพราะแบบฟอร์มรหัส FM-QP-2301-0202-07 สองไฟล์ตรวจจากหน้าจริงแล้วเป็นฉบับเดียวกัน
เอกสารชุดนี้แสดงยืนยันจากเอกสารกลางและประกาศใช้ได้แม้ metadata บางช่องยังว่าง DCC เติม/แก้ข้อมูลทะเบียนได้พร้อมเก็บค่าเดิม แต่เปลี่ยนสถานะหรือสร้างฉบับใหม่ผ่านฟอร์มนี้ไม่ได้
CSV Master List QM ยืนยัน Issue 1, Revision 3, วันที่เริ่มใช้ 24 ก.ค. 2569; CSV ทะเบียน DAR มี 68 รายการประวัติ ตรงกับ PDF 33 ฉบับ ใช้สอบกลับ ไม่สร้าง workflow เก่าหรือถือวันที่ขอเป็นวันที่เริ่มใช้
รายงานสำหรับอ่านอยู่ ../works/ISO Import Report.html; JSON รายไฟล์อยู่ .local/iso-import-report.json
ไม่เพิ่มปุ่ม bulk import บนหน้าเว็บ และไม่ลบต้นฉบับหรือข้อมูลเดิมเมื่อรันซ้ำ

### ตรวจส่วนที่พัฒนา

```powershell
npm test
npm run test:documents
npm run typecheck
npm run build
```

`test:documents` ต้องมี PostgreSQL ที่รันอยู่ ใช้ schema ชื่อ registry_test_<uuid> และ storage ทดสอบแยก แล้วล้างเฉพาะชุดทดสอบนั้น ไม่ reset ฐานพัฒนา
ตรวจสิทธิ์ไฟล์ การแก้ข้อมูล/ยืนยัน รหัสและไฟล์ซ้ำ เก็บกวาดไฟล์เมื่อ DB transaction ล้มเหลว และอ่านต่อหลังเชื่อมต่อใหม่
`iso:verify` อ่านเทียบ SHA-256 ของไฟล์ต้นฉบับและไฟล์ที่จัดเก็บทั้งหมด ผล test runner ไม่ถูกนำไปติ๊ก manual checklist อัตโนมัติ
ไม่ใช้ Edge/browser automation ในรอบนี้; การตรวจหน้าจอจริงยังให้ผู้ใช้ทำจาก checklist

### หน่วยงานจากรหัสเอกสาร

รหัส 2301 ระบุสำนักงานคณบดีคณะวิศวกรรมศาสตร์ตาม QP-2301-0107 §6.3 ระบบเติมหน่วยงานนี้อัตโนมัติ ไม่ใช้รหัสส่วนงานย่อยเป็นหน่วยงานหลัก และไม่ใช้ชื่อผู้ขอ DAR แทนผู้รับผิดชอบเอกสาร
สำหรับข้อมูลที่นำเข้าไว้ก่อนหน้า รัน `npx tsx scripts/fill-document-departments.ts` เพื่อเติมเฉพาะหน่วยงานที่ยังว่าง พร้อมบันทึกประวัติ (เรียกซ้ำไม่แก้ข้อมูลที่มีแล้ว)

### Step 3 — DAR

หลังอัปเดตโค้ด รันจาก `efiling` ตามลำดับ:

```powershell
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Migration เพิ่มร่าง รอบตรวจ ไฟล์ หลักฐานและตัวนับ โดยไม่ reset ตารางเดิม; seed คงเลข DAR ปี 2568 ไม่น้อยกว่า 68 ตามทะเบียนอ้างอิง ไม่สร้างคำขอย้อนหลัง

เปิดเมนู DAR (`/#dar`) สร้างใหม่หรือแก้ไขทีละเอกสารตามเส้นทางนี้:

| ประเภท | ผู้จัดทำ | ตรวจรับ | ทบทวน | อนุมัติ |
|---|---|---|---|---|
| QM | DCC | ผู้คุมทะเบียน | QMR | คณบดี |
| QP/WI/SD/FM | เจ้าของเอกสาร | ผู้คุมทะเบียน | รองคณบดี | QMR |

ใช้ QP-2301-0107 §6.2 เป็นกฎระบบทดลองตามที่ผู้ใช้เลือก; ข้อความอำนาจใน §4 ที่ต่างกันยังต้องยืนยันก่อนใช้งานทางการ ผู้ช่วย QMR ทำได้เฉพาะใบ ขั้น และรอบที่ QMR มอบหมาย ผู้จัดทำอนุมัติตนเองไม่ได้ และผู้ทบทวนกับผู้อนุมัติต้องต่างคน

บันทึกร่างได้ก่อนครบ แต่ส่งต้องมีข้อมูลฉบับ เจ้าของ เหตุผลและ PDF เลข DAR ออกตอนส่งครั้งแรกและคงเดิมเมื่อส่งใหม่ ส่งกลับต้องมีเหตุผลและเริ่มตรวจรับรอบใหม่; ไม่อนุมัติเป็นจุดจบของใบ

เอกสารนำเข้าที่ยังไม่มีเจ้าของหรือ Issue/Revision ให้ DCC เติมข้อมูลตามต้นฉบับในทะเบียนก่อนเปิด DAR แก้ไข จากนั้นเข้าสู่ระบบด้วยเจ้าของที่ระบุ (QM ใช้ DCC) ไฟล์ร่างแยกจากฉบับใช้งานและเก็บตามรอบตรวจ

DCC ประกาศใช้หลังอนุมัติ กำหนดวันที่ไม่น้อยกว่าวันอนุมัติและไม่เกินวันนี้ รหัสใหม่ใช้ชุดเลขจากทะเบียนจริง; แก้ไขคงรหัสและ Issue เพิ่ม Revision หนึ่ง เก็บฉบับเก่าและไฟล์เดิมครบ หากฉบับต้นทางเปลี่ยนจะปฏิเสธแทนการเขียนทับ

ผู้คุมทะเบียนบันทึกแจกจ่ายและเรียกคืนในแท็บเดียว พร้อมผู้ถือครอง วันที่ คำอธิบายและ PDF หลักฐาน หรือเหตุผลไม่เกี่ยวข้องเมื่อไม่มีงานนั้น ก่อนปิด DAR การแจกจ่ายไม่สร้างผลรับทราบเนื้อหาอัตโนมัติ

API ใช้ `/api/dars` สำหรับรายการ/ร่าง และ `/:id` สำหรับรายละเอียด/แก้ร่าง; `/:id/files` รับ PDF แบบ multipart ส่วน `/:id/submit`, `intake`, `review`, `approve`, `publish`, `distribution`, `recall`, `close`, `delegate` เป็นคำสั่ง POST ที่ตรวจสิทธิ์และขั้นที่ server ไม่รับการตั้งสถานะตรงจาก client

ยังไม่รวมคำขอยกเลิกเอกสาร ถือครอง/ยกเลิกถือครอง คำขออื่น ๆ การรับทราบเนื้อหา หรือการตั้งเวลาประกาศล่วงหน้า
