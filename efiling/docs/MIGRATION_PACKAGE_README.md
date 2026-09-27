# E-Filing migration package

แพ็กเกจนี้สร้างในช่วงที่หยุด API และผู้เขียนข้อมูลทั้งหมด จึงต้องย้ายทั้งฐานข้อมูลและ storage จากแพ็กเกจเดียวกัน

## Contents

- `database/efiling.dump` — PostgreSQL custom-format dump ซึ่งมี schema และข้อมูลจริง
- `storage/document-storage/` — controlled document PDF และไฟล์ DAR โดยคง storage key เดิม
- `storage/record-storage/` — Records/Evidence และหลักฐาน Finding/CAR/NCR โดยคง storage key เดิม
- `metadata.json` — เวลาสำรอง จำนวนไฟล์/การอ้างอิง และ metadata ที่ไม่มีรหัสผ่าน
- `manifest-sha256.txt` — SHA-256 ของทุกไฟล์ในแพ็กเกจสำหรับตรวจความครบถ้วน

## Restore destinations

อย่าคัดลอกไฟล์แยกเองถ้าใช้ restore script ได้ ให้ตั้งค่าตัวแปรบนเครื่องใหม่ก่อน:

- `DATABASE_URL` ชี้ฐาน PostgreSQL ใหม่ที่ว่าง
- `DOCUMENT_STORAGE_DIR` ชี้ปลายทางของ `storage/document-storage`
- `RECORD_STORAGE_DIR` ชี้ปลายทางของ `storage/record-storage`

จากโฟลเดอร์ `efiling` รัน:

```powershell
npm run restore:migration -- --package "<path-to-this-package>" --confirm-empty-target
npm run verify:migration -- --package "<path-to-this-package>"
```

Restore script จะยกเลิกหาก checksum ไม่ตรง, schema เป้าหมายมีตารางอยู่แล้ว, storage เป้าหมายไม่ว่าง หรือหา `pg_restore` ไม่พบ และจะไม่รัน seed/migrate reset

คู่มือเต็มอยู่ที่ `efiling/docs/MIGRATION_BACKUP_RESTORE.md` ใน project source
