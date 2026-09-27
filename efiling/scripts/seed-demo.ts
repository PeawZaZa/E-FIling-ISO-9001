import '../api/src/config.js';
import { scryptSync } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import type { RoleCode } from '@prisma/client';
import { database, disconnectDatabase } from '../api/src/lib/prisma.js';
import { accounts } from '../api/src/data/demoAccounts.js';
import { dbUserId } from '../api/src/services/documentRules.js';

const roles: Record<string,RoleCode> = {dcc:'ISO_QA_ADMIN',owner:'DOC_OWNER',reviewer:'APPROVER',qmr:'QMR',reader:'END_USER',auditor:'AUDITOR',carowner:'CAR_OWNER',registrar:'REGISTRAR',sponsor:'SPONSOR',deputy:'DEPUTY_QMR',sectionhead:'SECTION_HEAD',lead:'LEAD_AUDITOR',assistant:'ASSISTANT_DCC',dean:'DEAN'};
export async function seedDemo() {
  const db = database();
  // Public demonstration credential, not a production password or authentication change.
  const passwordHash = `scrypt:efiling-demo:${scryptSync('Demo1234!','efiling-demo',64).toString('hex')}`;
  for (const account of accounts) {
    const userId = dbUserId(account.id);
    await db.user.upsert({where:{id:userId},create:{id:userId,username:account.id,fullName:`${account.name} (${account.roleLabel})`,email:account.email,passwordHash},update:{}});
    await db.userRole.upsert({where:{userId_role:{userId,role:roles[account.id]}},create:{userId,role:roles[account.id]},update:{}});
  }
  await db.department.upsert({where:{code:'2301'},create:{code:'2301',nameTh:'สำนักงานคณบดีคณะวิศวกรรมศาสตร์'},update:{}});
  await db.recordType.upsert({where:{code:'GENERAL'},create:{code:'GENERAL',nameTh:'บันทึกทั่วไป'},update:{}});
  await db.recordType.upsert({where:{code:'AUDIT'},create:{code:'AUDIT',nameTh:'หลักฐานการตรวจติดตาม'},update:{}});
  await db.recordType.upsert({where:{code:'CORRECTIVE'},create:{code:'CORRECTIVE',nameTh:'หลักฐานการแก้ไข'},update:{}});
  // ISO files/ทะเบียนคุมใบขอดำเนินการเอกสาร (DAR).xlsx - ปี 2568.csv:
  // 68 historical entries, highest 068/2568. Reserve numbers only; do not invent workflows.
  await db.$executeRaw`INSERT INTO "number_sequence" ("series", "buddhist_year", "last_number")
    VALUES ('DAR', 2568, 68)
    ON CONFLICT ("series", "buddhist_year") DO UPDATE
    SET "last_number" = GREATEST("number_sequence"."last_number", EXCLUDED."last_number")`;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  seedDemo().then(()=>console.log('บัญชีเดโมกลาง 14 คนพร้อมใช้งาน')).finally(disconnectDatabase).catch(()=>{console.error('ตั้งค่าบัญชีเดโมไม่สำเร็จ ตรวจการเชื่อมต่อและ migration');process.exitCode=1;});
}
