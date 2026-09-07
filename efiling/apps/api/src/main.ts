import { createApp } from './app.js';
import { env } from './config/env.js';
import { policy } from './config/policy.js';
import { prisma } from './db.js';

/**
 * ตรวจว่าบทบาทในฐานข้อมูลตรงกับ Policy Pack ที่กำลังใช้
 *
 * ถ้าสลับแพ็กแล้วลืมย้ายข้อมูลบทบาท ระบบจะปฏิเสธสิทธิ์ทุกคำขอโดยไม่บอกสาเหตุ
 * จึงตรวจให้เจอตั้งแต่ตอนเริ่มทำงานแทนที่จะไปเจอตอนใช้งาน
 */
async function checkRolesMatchPolicy() {
  const rolesInDb = (await prisma.role.findMany({ select: { code: true } })).map((r) => r.code);
  const missing = policy.roles.all.filter((code) => !rolesInDb.includes(code));
  const extra = rolesInDb.filter((code) => !policy.roles.all.includes(code));

  if (missing.length || extra.length) {
    console.warn('คำเตือน: บทบาทในฐานข้อมูลไม่ตรงกับ Policy Pack');
    if (missing.length) console.warn(`  ขาดในฐานข้อมูล: ${missing.join(', ')}`);
    if (extra.length) console.warn(`  มีเกินมา: ${extra.join(', ')}`);
    console.warn('  รัน npm run db:seed เพื่อสร้างบทบาทให้ตรงกับแพ็กที่ใช้อยู่');
  }
}

async function main() {
  await checkRolesMatchPolicy();

  createApp().listen(env.port, () => {
    console.log(`ระบบ E-Filing พร้อมใช้งานที่ http://localhost:${env.port}`);
    console.log(`Policy Pack: ${policy.id} — ${policy.source}`);
    console.log(`สถานะใบคำร้อง: ${policy.car.states.join(' → ')}`);
    console.log(`บทบาททั้งหมด ${policy.roles.all.length} บทบาท`);
  });
}

main().catch((err) => {
  console.error('เริ่มระบบไม่สำเร็จ:', err);
  process.exit(1);
});
