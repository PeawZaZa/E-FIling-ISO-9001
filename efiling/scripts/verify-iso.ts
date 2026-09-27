import '../api/src/config.js';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { stat } from 'node:fs/promises';
import { database, disconnectDatabase } from '../api/src/lib/prisma.js';
import { inspectPdf, storedPath } from '../api/src/services/documentStorage.js';

async function main() {
  const root = fileURLToPath(new URL('../../ISO files/',import.meta.url));
  const sources = await database().documentImportSource.findMany({include:{file:{include:{version:true}}}});
  const errors: string[] = [];
  for (const source of sources) {
    try {
      const original = resolve(root,source.sourcePath);
      const stored = storedPath(source.file.storagePath);
      const [originalStat,storedStat] = await Promise.all([stat(original),stat(stored)]);
      const [originalHash,storedHash] = await Promise.all([
        inspectPdf(original,originalStat.size,'application/pdf',source.file.fileName),
        inspectPdf(stored,storedStat.size,'application/pdf',source.file.fileName),
      ]);
      if (source.sourceHash !== originalHash || source.file.sha256 !== storedHash || originalHash !== storedHash || BigInt(storedStat.size) !== source.file.sizeBytes) errors.push(source.id);
    } catch { errors.push(source.id); }
  }
  console.log({sourceFiles:sources.length,storedFiles:new Set(sources.map(s=>s.fileId)).size,documents:new Set(sources.map(s=>s.file.version.documentId)).size,checksumFailures:errors.length});
  if (!sources.length || errors.length) process.exitCode=1;
}
main().catch(()=>{console.error('ตรวจไฟล์ไม่ได้ ตรวจการเชื่อมต่อและพื้นที่จัดเก็บ');process.exitCode=1;}).finally(disconnectDatabase);
