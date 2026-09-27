import '../api/src/config.js';
import { database, disconnectDatabase } from '../api/src/lib/prisma.js';
import { CENTRAL_DEPARTMENT, isCentralDocument } from '../api/src/services/documentRules.js';

// The user confirmed the entire central ISO source collection belongs to this organization.
// No inference of a subsection or owner from a historical DAR requester.
async function main() {
  const db = database();
  const department = await db.department.upsert({where:{code:CENTRAL_DEPARTMENT.code},create:CENTRAL_DEPARTMENT,update:{}});
  const documents = await db.document.findMany({where:{departmentId:null},select:{id:true,documentCode:true,versions:{select:{files:{select:{importSources:{select:{id:true}}}}}}}});
  let updated = 0;
  for (const document of documents) {
    const centralSource = document.versions.some(v=>v.files.some(f=>f.importSources.length));
    if (!isCentralDocument(document.documentCode) && !centralSource) continue;
    await db.$transaction(async tx => {
      const changed = await tx.document.updateMany({where:{id:document.id,departmentId:null},data:{departmentId:department.id}});
      if (!changed.count) return;
      await tx.auditEvent.create({data:{action:'UPDATE',entityType:'Document',entityId:document.id,reason:isCentralDocument(document.documentCode)?'QP-2301-0107 §6.3: รหัส 2301 คือสำนักงานคณบดีคณะวิศวกรรมศาสตร์':'ผู้รับผิดชอบยืนยันเอกสารชุดกลาง ISO files ของสำนักงานคณบดีคณะวิศวกรรมศาสตร์; รหัสต้นฉบับยังรอตรวจสอบ',beforeValue:{departmentId:null},afterValue:{departmentId:department.id,departmentName:department.nameTh}}});
      updated++;
    });
  }
  console.log({updated,organization:CENTRAL_DEPARTMENT.nameTh});
}
main().catch(()=>{console.error('เติมหน่วยงานไม่สำเร็จ ตรวจการเชื่อมต่อฐานข้อมูล');process.exitCode=1;}).finally(disconnectDatabase);
