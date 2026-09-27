import '../api/src/config.js';
import { copyFile, mkdir, readFile, writeFile, stat } from 'node:fs/promises';
import { resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { database, disconnectDatabase } from '../api/src/lib/prisma.js';
import { importDocument } from '../api/src/services/documentService.js';
import { incomingRoot, prepareStorage } from '../api/src/services/documentStorage.js';
import { seedDemo } from './seed-demo.js';

const appRoot = fileURLToPath(new URL('../',import.meta.url));
const sourceRoot = resolve(appRoot,'../ISO files');
type Entry = {sourcePath:string,fileName:string,sha256:string,sizeBytes:number,documentCode:string|null,title:string,docType:string|null,issueNo:number|null,revisionNo:number|null,effectiveDate:string|null,reviewNotes:string,evidence:unknown};
async function main() {
  const manifest = JSON.parse(await readFile(resolve(appRoot,'.local/iso-inventory.json'),'utf8')) as {schemaVersion:number,entries:Entry[]};
  if (manifest.schemaVersion !== 1 || !Array.isArray(manifest.entries) || !manifest.entries.length) throw new Error('Invalid inventory');
  await seedDemo(); await prepareStorage();
  const results: Record<string,unknown>[] = [];
  for (const entry of manifest.entries) {
    const source = resolve(sourceRoot,entry.sourcePath);
    const rel = relative(sourceRoot,source);
    if (rel.startsWith(`..${sep}`) || rel === '..' || resolve(sourceRoot,rel) !== source || !entry.sourcePath.toLowerCase().endsWith('.pdf')) throw new Error('Invalid source path');
    const linked = await database().documentImportSource.findUnique({where:{sourcePath:entry.sourcePath},include:{file:{select:{version:{select:{documentId:true,reviewStatus:true,status:true,sourceConfirmedAt:true,sourceConfirmationNote:true}}}}}});
    if (linked) {
      if (linked.sourceHash !== entry.sha256) {
        results.push({sourcePath:entry.sourcePath,status:'conflict',message:'ต้นฉบับเปลี่ยนหลังนำเข้า ไม่เขียนทับรายการเดิม'});
      } else results.push({sourcePath:entry.sourcePath,status:'existing',documentId:linked.file.version.documentId,fileId:linked.fileId,sha256:entry.sha256,reviewStatus:linked.file.version.reviewStatus,lifecycle:linked.file.version.status,sourceConfirmedAt:linked.file.version.sourceConfirmedAt,sourceConfirmationNote:linked.file.version.sourceConfirmationNote});
      continue;
    }
    try {
      const sourceInfo = await stat(source);
      if (sourceInfo.size !== entry.sizeBytes) throw new Error('Source size changed');
      const path = resolve(incomingRoot,randomUUID());
      await copyFile(source,path);
      const imported = await importDocument('dcc',{
        ...entry,
        reviewNotes:[entry.reviewNotes,typeof entry.evidence === 'string'? entry.evidence:JSON.stringify(entry.evidence)].filter(Boolean).join('\n').slice(0,4000),
      },{path,size:entry.sizeBytes,mimetype:'application/pdf',originalname:entry.fileName},{sourcePath:entry.sourcePath,sha256:entry.sha256});
      results.push({sourcePath:entry.sourcePath,status:imported.duplicate?'duplicate':'imported',documentId:imported.id,fileId:imported.fileId,sha256:entry.sha256,reviewStatus:'PENDING'});
    } catch {
      results.push({sourcePath:entry.sourcePath,status:'failed',message:'นำเข้าไม่สำเร็จ ตรวจต้นฉบับ ฐานข้อมูล และพื้นที่จัดเก็บ'});
    }
    if (results.length % 50 === 0) console.log(`ตรวจนำเข้า ${results.length}/${manifest.entries.length}`);
  }
  const summary = {total:results.length,imported:results.filter(r=>r.status==='imported').length,existing:results.filter(r=>r.status==='existing').length,duplicate:results.filter(r=>r.status==='duplicate').length,failed:results.filter(r=>r.status==='failed'||r.status==='conflict').length};
  const confirmed = results.find(r=>r.sourceConfirmationNote);
  const report = {generatedAt:new Date().toISOString(),sourceConfirmation:confirmed?.sourceConfirmationNote,summary,results};
  await mkdir(resolve(appRoot,'.local'),{recursive:true});
  await writeFile(resolve(appRoot,'.local/iso-import-report.json'),JSON.stringify(report,null,2));
  console.log(summary);
  if (summary.failed) process.exitCode=1;
}
main().catch(()=>{console.error('นำเข้าไม่สำเร็จ ตรวจ inventory และการเชื่อมต่อฐานข้อมูล');process.exitCode=1;}).finally(disconnectDatabase);
