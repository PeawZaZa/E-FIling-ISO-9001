# สำรองและย้าย E-Filing ไปเครื่องใหม่

ระบบเก็บข้อมูลเป็นสองส่วนที่ต้องสำรองในช่วง offline เดียวกัน:

1. PostgreSQL เก็บรายการ ผู้ใช้/บทบาท workflow ประวัติ และ storage key
2. File storage เก็บ controlled document PDF, ไฟล์ DAR และ Evidence ของ Records/Finding/CAR/NCR

ห้ามแยกใช้ database dump จากคนละรอบกับ storage เพราะอาจเกิดการอ้างไฟล์ที่ไม่มีอยู่

## Prerequisites

- Node.js 22.12 ขึ้นไป
- PostgreSQL 17 ขึ้นไป พร้อม client tools `pg_dump` และ `pg_restore` รุ่นเดียวกับ server หรือใหม่กว่า
- Git และพื้นที่ว่างพอสำหรับ database dump กับ storage ทั้งชุด
- PowerShell สำหรับคำสั่งตัวอย่างบน Windows

ตรวจ client tools:

```powershell
pg_dump --version
pg_restore --version
```

ถ้า tools ไม่อยู่ใน `PATH` ให้ส่ง `--pg-bin "C:\Program Files\PostgreSQL\17\bin"` กับคำสั่ง backup/restore

PostgreSQL แบบพกพาใน `.local/postgres` ของเครื่องพัฒนาอาจมีเฉพาะ server และไม่มี `pg_dump`/`pg_restore` จึงต้องติดตั้ง PostgreSQL Command Line Tools แยกก่อน พาธที่ส่งด้วย `--pg-bin` ต้องเป็น directory ที่มีไฟล์ `pg_dump.exe` จริง ตรวจด้วย `Test-Path "<path>\pg_dump.exe"`

## สร้าง backup จากเครื่องเดิม

1. แจ้งหยุดใช้งานและหยุด API/frontend ทุก process ที่เขียนข้อมูล ห้ามมี import/upload ระหว่าง backup
2. ตรวจว่าไม่มี process อื่นเขียน PostgreSQL หรือ storage ชุดนี้
3. รันจากโฟลเดอร์ `efiling`:

```powershell
npm run backup:migration -- --application-stopped
```

ค่าเริ่มต้นสร้าง `backups/efiling-<timestamp>/` ซึ่งถูก ignore ใน Git แล้ว ใช้ `--output "D:\E-Filing-Backups"` เพื่อเก็บนอก project ได้

Script อ่าน `DATABASE_URL`, `DOCUMENT_STORAGE_DIR` และ `RECORD_STORAGE_DIR` จาก environment/`.env` โดยไม่พิมพ์ credentials ตรวจ database/file references ก่อนและหลัง copy แล้วสร้าง SHA-256 manifest ไฟล์ใน `incoming` จะไม่ถูกนำไป เพราะเป็นไฟล์ upload ชั่วคราว

หลังคำสั่งสำเร็จ ให้ย้ายทั้ง directory `efiling-<timestamp>` เป็นหนึ่งชุด ห้ามเลือกเฉพาะ dump หรือ storage บางส่วน

## เตรียมเครื่องใหม่

1. Clone/copy private repository ไปเครื่องใหม่ และรักษาสถานะ private
2. ใน `efiling` รัน `npm ci`
3. ติดตั้ง/เปิด PostgreSQL แล้วสร้าง user และ database เปล่า ใช้ชื่อและรหัสผ่านใหม่สำหรับเครื่องปลายทาง ตัวอย่างคำสั่งให้ผู้ดูแลฐานรันโดยแทนค่า placeholder เอง:

```sql
CREATE ROLE <efiling_user> LOGIN PASSWORD '<new-secret>';
CREATE DATABASE <efiling_database> OWNER <efiling_user>;
```

4. คัดลอก `.env.example` เป็น `.env` แล้วกำหนดเฉพาะค่าของเครื่องใหม่:
   - `DATABASE_URL`
   - `API_PORT`
   - `DOCUMENT_STORAGE_DIR`
   - `RECORD_STORAGE_DIR`
   - `RECORD_MAX_FILE_MB` ถ้าต้องการเปลี่ยนจากค่าเริ่มต้น
   - `RECORD_ALLOWED_MIME_TYPES` ถ้าต้องการจำกัดชนิดไฟล์

อย่าคัดลอก secret เดิมลงเอกสารหรือ source control และอย่าใส่ `.env` ใน migration package

5. สร้าง Prisma Client จาก source โดยยังไม่แก้ฐาน:

```powershell
npm run db:validate
npm run db:generate
```

## Restore

ฐานปลายทางต้องมี schema ว่าง และ storage ปลายทางต้องไม่มีไฟล์ Restore script จะตรวจและยกเลิกหากไม่ว่าง:

```powershell
npm run restore:migration -- --package "D:\Transfer\efiling-<timestamp>" --confirm-empty-target
```

ถ้า `pg_restore` ไม่อยู่ใน `PATH`:

```powershell
npm run restore:migration -- --package "D:\Transfer\efiling-<timestamp>" --confirm-empty-target --pg-bin "C:\Program Files\PostgreSQL\17\bin"
```

Script ตรวจ checksum ก่อน restore, stage storage ใน directory ชั่วคราว, ใช้ `pg_restore --single-transaction --exit-on-error` และย้าย storageเข้า path ที่ตั้งไว้โดยคง directory structure/filename/storage key เดิม ไม่ overwrite ฐานหรือ storage ที่มีข้อมูลอยู่แล้ว

### Prisma migration หลัง restore

Backup มี `_prisma_migrations` และ schema ณ เวลาสำรองอยู่แล้ว จึง **ไม่ต้องรัน `db:migrate` ทันทีหลัง restore ชุดเดียวกับ source revision เดิม** ตรวจสถานะก่อน:

```powershell
node scripts/prisma.mjs migrate status
```

ใช้ `npm run db:migrate` เฉพาะเมื่อ source บนเครื่องใหม่มี migration ที่ใหม่กว่า backup และได้สำรอง restored database อีกครั้งก่อน deploy migration แล้ว ห้ามใช้ `prisma migrate reset` และห้ามรัน `db:seed` กับ restored database

## Start และ verify

```powershell
npm run verify:migration -- --package "D:\Transfer\efiling-<timestamp>"
npm run dev
```

เปิด `http://127.0.0.1:5173` แล้วตรวจตามรายการ:

- [ ] Database เชื่อมต่อได้ และ verification script รายงาน `database: connected`
- [ ] จำนวน users และ roles ยังอยู่
- [ ] ทะเบียน controlled documents ยังอยู่ และเปิด PDF เดิมได้อย่างน้อยหนึ่งไฟล์
- [ ] DAR เดิม รายการรับทราบ confirmation และ history ยังอยู่
- [ ] Records/Evidence ยังอยู่ และดาวน์โหลดไฟล์เดิมได้อย่างน้อยหนึ่งไฟล์
- [ ] Audit rounds และ Findings ยังอยู่
- [ ] CAR/NCR และสถานะ workflow ยังอยู่
- [ ] Dashboard เปิดได้และค่าสรุปมาจากข้อมูล restored
- [ ] Audit events/history ยังอยู่
- [ ] `storage.missing` จาก verification scriptเป็น `0`
- [ ] ทดสอบด้วย role อย่างน้อย DCC, QMR, Auditor และ Sponsor เพื่อยืนยันขอบเขตเดิม

Verification script เป็น read only และแสดงเฉพาะจำนวนกับ storage key ที่หาย ไม่แสดง credentials

## ข้อจำกัดและการปฏิบัติงาน

- Workflow นี้ใช้ช่วงหยุดระบบสั้น ๆ เพื่อให้ database กับ storage เป็นชุดเดียวกัน เหมาะกับ MVP ปัจจุบันซึ่งยังไม่มี distributed storage/snapshot coordinator
- Script ตรวจว่า API port ไม่เปิด แต่ผู้ดูแลยังต้องรับรองว่าไม่มี writer อื่นเชื่อมฐานหรือแก้ storage
- PostgreSQL role/password ระดับ server ไม่อยู่ใน dump แบบ portable นี้ ต้องสร้างใหม่บนเครื่องปลายทาง
- หาก restore ล้มเหลว ห้าม retry ลง schema เดิมที่อาจมีข้อมูล ให้ใช้ database/schema ว่างชุดใหม่และ storage ปลายทางว่าง
