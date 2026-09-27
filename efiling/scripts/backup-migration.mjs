import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { copyStorage, isPathInside, isPortOpen, parseDatabaseUrl, requirePostgresTool, resolveStoragePaths, runPostgresTool, verifyStorageReferences, writeManifest } from './migration-common.mjs';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
dotenv.config({ path: join(projectRoot, '.env'), quiet: true });

const args = process.argv.slice(2);
const valueAfter = name => { const index = args.indexOf(name); return index >= 0 ? args[index + 1] : undefined; };
if (args.includes('--help')) {
  console.log('Usage: npm run backup:migration -- --application-stopped [--output <directory>] [--pg-bin <directory>]');
  process.exit(0);
}
if (!args.includes('--application-stopped')) throw new Error('Stop all E-Filing writers, then rerun with --application-stopped');
const apiPort = Number(process.env.API_PORT || 3001);
if (await isPortOpen(apiPort)) throw new Error(`E-Filing API is still listening on port ${apiPort}; stop it before backup`);

const database = parseDatabaseUrl(process.env.DATABASE_URL);
const storage = resolveStoragePaths(projectRoot, process.env);
if (storage.documents === storage.records) throw new Error('DOCUMENT_STORAGE_DIR and RECORD_STORAGE_DIR must be different directories');
const pgDump = requirePostgresTool('pg_dump', projectRoot, process.env, valueAfter('--pg-bin'));

const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
const backupRoot = resolve(valueAfter('--output') || join(projectRoot, 'backups'));
if (Object.values(storage).some(path => isPathInside(path, backupRoot) || path === backupRoot)) throw new Error('Backup output must not be inside a live storage directory');
const finalRoot = join(backupRoot, `efiling-${timestamp}`);
const workRoot = `${finalRoot}.incomplete`;
const packageStorage = { documents: join(workRoot, 'storage', 'document-storage'), records: join(workRoot, 'storage', 'record-storage') };
const prisma = new PrismaClient();

try {
  await prisma.$queryRaw`SELECT 1`;
  const sourceCheck = await verifyStorageReferences(prisma, storage);
  if (sourceCheck.missing.length) throw new Error(`Current storage has ${sourceCheck.missing.length} missing database references; run verify:migration for details`);
  await mkdir(backupRoot, { recursive: true });
  await mkdir(workRoot, { recursive: false });
  await mkdir(join(workRoot, 'database'));
  await mkdir(packageStorage.documents, { recursive: true });
  await mkdir(packageStorage.records, { recursive: true });

  const dumpPath = join(workRoot, 'database', 'efiling.dump');
  runPostgresTool(pgDump, ['--format=custom', '--no-owner', '--no-privileges', '--file', dumpPath], database.environment);
  const [documentFiles, recordFiles] = await Promise.all([
    copyStorage(storage.documents, packageStorage.documents),
    copyStorage(storage.records, packageStorage.records),
  ]);
  const packageCheck = await verifyStorageReferences(prisma, packageStorage);
  if (packageCheck.missing.length) throw new Error(`Backup storage is incomplete: ${packageCheck.missing.length} referenced files are missing`);

  const packageReadme = await readFile(join(projectRoot, 'docs', 'MIGRATION_PACKAGE_README.md'), 'utf8');
  await writeFile(join(workRoot, 'README.md'), packageReadme, 'utf8');
  await writeFile(join(workRoot, 'metadata.json'), `${JSON.stringify({
    formatVersion: 1, createdAt: new Date().toISOString(), database: database.metadata,
    files: { documents: documentFiles, recordsAndEvidence: recordFiles }, references: packageCheck.references,
    consistency: 'Application stopped; database and storage copied in one offline window.',
  }, null, 2)}\n`, 'utf8');
  const manifestFiles = await writeManifest(workRoot);
  await rename(workRoot, finalRoot);
  console.log(`Backup package created: ${finalRoot}`);
  console.log(`Database dump: ${join(finalRoot, 'database', 'efiling.dump')}`);
  console.log(`Storage backup: ${join(finalRoot, 'storage')}`);
  console.log(`Manifest entries: ${manifestFiles}`);
} finally {
  await prisma.$disconnect();
}
