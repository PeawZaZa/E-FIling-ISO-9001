/**
 * ข้อมูลตั้งต้นสำหรับการพัฒนาและสาธิต
 * @trace FR-SH05
 *
 * สร้างบทบาทตาม Policy Pack ที่กำลังใช้งาน ไม่ได้เขียนรายชื่อบทบาทตายตัว
 * จึงรันได้ทั้งสองแพ็ก และเมื่อสลับแพ็กแล้วรันซ้ำ บทบาทจะตรงกันเสมอ
 *
 * รหัสผ่านของทุกบัญชีตัวอย่างคือ efiling1234 — ใช้ได้เฉพาะตอนพัฒนา
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { loadPolicyPack } from '../packages/policy/src/index.js';

const prisma = new PrismaClient();
const policy = loadPolicyPack(process.env.POLICY_VARIANT ?? 'srsab');

/** ชื่อภาษาไทยของบทบาท ครอบคลุมรหัสของทั้งสองแพ็ก */
const roleNames: Record<string, string> = {
  // แพ็ก srsab
  SPONSOR: 'ผู้บริหาร/สำนักงานคณบดี',
  ISO_QA_ADMIN: 'เจ้าหน้าที่ ISO/QA (ศูนย์ควบคุมเอกสาร)',
  DOCUMENT_OWNER: 'เจ้าของเอกสาร',
  APPROVER: 'ผู้อนุมัติ',
  QMR: 'ผู้แทนฝ่ายบริหารด้านคุณภาพ',
  END_USER: 'ผู้ใช้งานทั่วไป',
  AUDITOR: 'ผู้ตรวจติดตาม',
  LEAD_AUDITOR: 'หัวหน้าคณะผู้ตรวจติดตาม',
  ASSISTANT_DCC: 'ผู้ช่วยเลขานุการคณะกรรมการระบบคุณภาพ',
  CAR_OWNER: 'ผู้รับผิดชอบการแก้ไข',
  // แพ็ก proposal
  ADMIN: 'ผู้ดูแลระบบ',
  ISO_QA_USER: 'ผู้ใช้งานฝ่าย ISO/QA',
};

/** บัญชีตัวอย่างหนึ่งคนต่อหนึ่งบทบาท */
const sampleUsers: Record<string, { fullName: string; email: string }> = {
  SPONSOR: { fullName: 'คณบดีคณะวิศวกรรมศาสตร์', email: 'sponsor@example.ac.th' },
  ISO_QA_ADMIN: { fullName: 'เจ้าหน้าที่ควบคุมเอกสาร', email: 'dcc@example.ac.th' },
  DOCUMENT_OWNER: { fullName: 'หัวหน้างานวิชาการ', email: 'owner@example.ac.th' },
  APPROVER: { fullName: 'รองคณบดีฝ่ายบริหาร', email: 'approver@example.ac.th' },
  QMR: { fullName: 'ผู้แทนฝ่ายบริหารด้านคุณภาพ', email: 'qmr@example.ac.th' },
  END_USER: { fullName: 'เจ้าหน้าที่ธุรการ', email: 'user@example.ac.th' },
  AUDITOR: { fullName: 'ผู้ตรวจติดตามภายใน', email: 'auditor@example.ac.th' },
  LEAD_AUDITOR: { fullName: 'หัวหน้าคณะผู้ตรวจติดตาม', email: 'lead.auditor@example.ac.th' },
  ASSISTANT_DCC: { fullName: 'ผู้ช่วยเลขานุการคณะกรรมการ', email: 'assistant.dcc@example.ac.th' },
  CAR_OWNER: { fullName: 'หัวหน้างานที่รับผิดชอบแก้ไข', email: 'car.owner@example.ac.th' },
  ADMIN: { fullName: 'ผู้ดูแลระบบ', email: 'admin@example.ac.th' },
  ISO_QA_USER: { fullName: 'เจ้าหน้าที่ ISO/QA', email: 'isoqa@example.ac.th' },
};

const departments = [
  'สำนักงานคณบดี',
  'งานวิชาการและกิจการนักศึกษา',
  'งานบริหารและแผน',
  'งานวิจัยและบริการวิชาการ',
];

async function main() {
  console.log(`สร้างข้อมูลตั้งต้นด้วย Policy Pack: ${policy.id}`);

  for (const name of departments) {
    await prisma.department.upsert({ where: { name }, update: {}, create: { name } });
  }
  const mainDept = await prisma.department.findUniqueOrThrow({ where: { name: departments[0]! } });

  const passwordHash = await bcrypt.hash('efiling1234', 10);

  for (const code of policy.roles.all) {
    const role = await prisma.role.upsert({
      where: { code },
      update: { name: roleNames[code] ?? code },
      create: { code, name: roleNames[code] ?? code },
    });

    const sample = sampleUsers[code];
    if (!sample) {
      console.warn(`  ไม่มีบัญชีตัวอย่างสำหรับบทบาท ${code} — ข้ามไป`);
      continue;
    }
    await prisma.user.upsert({
      where: { email: sample.email },
      update: { roleId: role.id, fullName: sample.fullName },
      create: {
        email: sample.email,
        fullName: sample.fullName,
        passwordHash,
        roleId: role.id,
        departmentId: mainDept.id,
      },
    });
  }

  console.log(`  บทบาท ${policy.roles.all.length} รายการ พร้อมบัญชีตัวอย่าง`);
  console.log(`  แผนก ${departments.length} รายการ`);
  console.log('  รหัสผ่านของทุกบัญชี: efiling1234');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
