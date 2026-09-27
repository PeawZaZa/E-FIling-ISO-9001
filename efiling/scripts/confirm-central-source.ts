import '../api/src/config.js';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { Prisma } from '@prisma/client';
import { database, disconnectDatabase } from '../api/src/lib/prisma.js';
import { jsonSafe } from '../api/src/services/documentService.js';

// One-time operator action for the particular source collection confirmed by the user.
// It does not create historical approvals, DAR requests or fabricated metadata.
const reason = 'ผู้รับผิดชอบโครงการยืนยันว่า PDF ทั้งชุด ISO files เป็นเอกสารกลางที่ใช้งานปัจจุบัน (มติ 19 กันยายน 2569); ข้อมูลทะเบียนที่ไม่ทราบยังคงว่าง';
type Entry = {sourcePath:string,sha256:string,title:string,documentCode:string|null,docType:string|null,issueNo:number|null,revisionNo:number|null,effectiveDate:string|null,reviewNotes:string,evidence:string};
async function main() {
  if (!process.argv.includes('--confirm-current')) throw new Error('Explicit --confirm-current is required');
  const manifestPath = fileURLToPath(new URL('../.local/iso-inventory.json',import.meta.url));
  const manifest = JSON.parse(await readFile(manifestPath,'utf8')) as {entries:Entry[]};
  const sources = await database().documentImportSource.findMany({include:{file:{include:{version:{include:{document:true}}}}}});
  if (sources.length !== manifest.entries.length || sources.length !== 296) throw new Error('Source set differs from approved collection');
  const groups = new Map<string,typeof sources>();
  for (const source of sources) {
    if (!manifest.entries.some(e=>e.sourcePath === source.sourcePath && e.sha256 === source.sourceHash)) throw new Error('Source manifest mismatch');
    const group = groups.get(source.file.version.documentId) ?? [];
    group.push(source); groups.set(source.file.version.documentId,group);
  }
  let confirmed = 0;
  for (const [documentId,group] of groups) {
    const entries = group.map(s=>manifest.entries.find(e=>e.sourcePath===s.sourcePath)!);
    if (group.every(s=>s.file.version.sourceConfirmedAt)) continue;
    // The only shared code was visually verified: same form, revision 0, same effective date.
    if (group.length > 1 && !(group.length === 2 && entries.every(e=>e.documentCode === 'FM-QP-2301-0202-07' && e.revisionNo === 0 && e.effectiveDate === '2025-06-27'))) throw new Error('Unresolved multiple-file document; no automatic edition choice');
    await database().$transaction(async tx => {
      const oldVersions = await tx.documentVersion.findMany({where:{documentId},include:{files:{select:{id:true,fileName:true}}},orderBy:{createdAt:'asc'}});
      if (oldVersions.some(v=>v.reviewStatus !== 'PENDING' || v.originatingDarId)) throw new Error('Document has changed after import');
      const primary = oldVersions[0];
      const entry = entries[0];
      // Both PDFs are retained. The discarded empty import placeholder is preserved in audit JSON.
      for (const extra of oldVersions.slice(1)) {
        await tx.documentFile.updateMany({where:{versionId:extra.id},data:{versionId:primary.id}});
        await tx.documentVersion.delete({where:{id:extra.id}});
      }
      const oldDocument = group[0].file.version.document;
      await tx.document.update({where:{id:documentId},data:{title:entry.title,documentCode:entry.documentCode,docType:entry.docType}});
      const notes = [entry.reviewNotes.replaceAll('รอตรวจสอบ','ข้อมูลประกอบยังไม่ครบ'),entry.evidence,group.length > 1 ? 'PDF สองไฟล์เป็นแบบฟอร์มเดียวกัน แก้ไขครั้งที่ 0 และวันที่เริ่มใช้เดียวกัน เก็บทั้งคู่เป็นไฟล์ของฉบับเดียว' : null].filter(Boolean).join('\n');
      await tx.documentVersion.update({where:{id:primary.id},data:{issueNo:entry.issueNo,revisionNo:entry.revisionNo,effectiveDate:entry.effectiveDate?new Date(entry.effectiveDate):null,status:'DOC_PUBLISHED',reviewStatus:'VERIFIED',sourceConfirmedAt:new Date(),sourceConfirmationNote:reason,reviewNotes:notes}});
      await tx.auditEvent.create({data:{actorUserId:null,action:'UPDATE',entityType:'Document',entityId:documentId,reason,beforeValue:jsonSafe({document:oldDocument,versions:oldVersions}) as unknown as Prisma.InputJsonObject,afterValue:{title:entry.title,documentCode:entry.documentCode,status:'DOC_PUBLISHED',reviewStatus:'VERIFIED',issueNo:entry.issueNo,revisionNo:entry.revisionNo,effectiveDate:entry.effectiveDate,sourceConfirmationNote:reason,fileCount:group.length}}});
    });
    confirmed++;
  }
  // Persist an accurate per-source report after merging two identical-edition file entries.
  const refreshed = await database().documentImportSource.findMany({include:{file:{include:{version:true}}},orderBy:{sourcePath:'asc'}});
  const report = {generatedAt:new Date().toISOString(),sourceConfirmation:reason,summary:{total:refreshed.length,imported:0,existing:refreshed.length,duplicate:0,failed:0,confirmedDocuments:groups.size},results:refreshed.map(s=>({sourcePath:s.sourcePath,status:'existing',documentId:s.file.version.documentId,fileId:s.fileId,sha256:s.sourceHash,reviewStatus:s.file.version.reviewStatus,lifecycle:s.file.version.status,sourceConfirmedAt:s.file.version.sourceConfirmedAt}))};
  await writeFile(fileURLToPath(new URL('../.local/iso-import-report.json',import.meta.url)),JSON.stringify(report,null,2));
  console.log({confirmedNow:confirmed,documents:groups.size,files:refreshed.length});
}
main().catch(error=>{console.error(error instanceof Error ? error.message:'Source confirmation failed');process.exitCode=1;}).finally(disconnectDatabase);
