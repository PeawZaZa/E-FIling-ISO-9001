import { mkdir, rename, rmdir, stat } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { assertEmptyDirectory, copyStorage, isPathInside, parseDatabaseUrl, requirePostgresTool, resolveStoragePaths, runPostgresTool, verifyManifest, verifyStorageReferences } from './migration-common.mjs';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
dotenv.config({ path: join(projectRoot, '.env'), quiet: true });
const args = process.argv.slice(2);
const valueAfter = name => { const index = args.indexOf(name); return index >= 0 ? args[index + 1] : undefined; };
if (args.includes('--help')) {
  console.log('Usage: npm run restore:migration -- --package <directory> --confirm-empty-target [--pg-bin <directory>]');
  process.exit(0);
}
const packageRoot = resolve(valueAfter('--package') || '');
if (!valueAfter('--package')) throw new Error('--package is required');
if (!args.includes('--confirm-empty-target')) throw new Error('Restore requires --confirm-empty-target and refuses non-empty targets');
await stat(join(packageRoot, 'database', 'efiling.dump'));
const manifestErrors = await verifyManifest(packageRoot);
if (manifestErrors.length) throw new Error(`Backup checksum validation failed:\n${manifestErrors.join('\n')}`);

const database = parseDatabaseUrl(process.env.DATABASE_URL);
const storage = resolveStoragePaths(projectRoot, process.env);
if (storage.documents === storage.records) throw new Error('DOCUMENT_STORAGE_DIR and RECORD_STORAGE_DIR must be different directories');
if (Object.values(storage).some(path => isPathInside(path, packageRoot) || path === packageRoot)) throw new Error('Backup package must not be inside a restore target');
await assertEmptyDirectory(storage.documents);
await assertEmptyDirectory(storage.records);
const pgRestore = requirePostgresTool('pg_restore', projectRoot, process.env, valueAfter('--pg-bin'));

const prisma = new PrismaClient();
try {
  const rows = await prisma.$queryRawUnsafe("SELECT count(*)::int AS count FROM information_schema.tables WHERE table_schema NOT IN ('pg_catalog', 'information_schema')");
  if (Number(rows[0]?.count || 0) !== 0) throw new Error('Target database is not empty; restore was cancelled');
} finally { await prisma.$disconnect(); }

const token = randomUUID();
const staged = {
  documents: join(dirname(storage.documents), `.efiling-document-restore-${token}`),
  records: join(dirname(storage.records), `.efiling-record-restore-${token}`),
};
await copyStorage(join(packageRoot, 'storage', 'document-storage'), staged.documents);
await copyStorage(join(packageRoot, 'storage', 'record-storage'), staged.records);

runPostgresTool(pgRestore, ['--exit-on-error', '--single-transaction', '--no-owner', '--no-privileges', '--dbname', database.metadata.database, join(packageRoot, 'database', 'efiling.dump')], database.environment);
for (const [kind, target] of Object.entries(storage)) {
  await mkdir(dirname(target), { recursive: true });
  try { await rmdir(target); } catch (error) { if (error?.code !== 'ENOENT') throw error; }
  await rename(staged[kind], target);
}

const restored = new PrismaClient();
try {
  const check = await verifyStorageReferences(restored, storage);
  if (check.missing.length) throw new Error(`Restore completed but ${check.missing.length} file references are missing; run verify:migration for details`);
  console.log('Restore completed and all database file references are readable.');
} finally { await restored.$disconnect(); }
