import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { resolveStoragePaths, verifyManifest, verifyStorageReferences } from './migration-common.mjs';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
dotenv.config({ path: join(projectRoot, '.env'), quiet: true });
const args = process.argv.slice(2);
const packageIndex = args.indexOf('--package');
if (args.includes('--help')) {
  console.log('Usage: npm run verify:migration [-- --package <backup-directory>]');
  process.exit(0);
}
if (packageIndex >= 0) {
  const packageRoot = resolve(args[packageIndex + 1] || '');
  if (!args[packageIndex + 1]) throw new Error('--package requires a directory');
  const errors = await verifyManifest(packageRoot);
  if (errors.length) throw new Error(`Backup checksum validation failed:\n${errors.join('\n')}`);
  console.log('Backup manifest: valid');
}

const prisma = new PrismaClient();
try {
  await prisma.$queryRaw`SELECT 1`;
  const [users, roles, documents, dars, acknowledgements, records, rounds, findings, requests, auditEvents] = await Promise.all([
    prisma.user.count(), prisma.userRole.count(), prisma.document.count(), prisma.dar.count(),
    prisma.acknowledgementAssignment.count(), prisma.qualityRecord.count(), prisma.auditRound.count(),
    prisma.finding.count(), prisma.correctiveRequest.count(), prisma.auditEvent.count(),
  ]);
  const storage = await verifyStorageReferences(prisma, resolveStoragePaths(projectRoot, process.env));
  console.log(JSON.stringify({ database: 'connected', counts: { users, roles, documents, dars, acknowledgements, records, rounds, findings, correctiveRequests: requests, auditEvents }, storage: { references: storage.references, missing: storage.missing.length } }, null, 2));
  if (storage.missing.length) {
    console.error('Missing file references:');
    for (const item of storage.missing) console.error(item);
    process.exitCode = 2;
  }
} finally { await prisma.$disconnect(); }
