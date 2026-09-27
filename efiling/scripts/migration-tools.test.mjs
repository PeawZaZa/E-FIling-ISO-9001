import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseDatabaseUrl, resolveStoragePaths, writeManifest, verifyManifest, assertEmptyDirectory, isPathInside, requirePostgresTool } from './migration-common.mjs';

test('database URL becomes libpq environment without exposing password in metadata', () => {
  const parsed = parseDatabaseUrl('postgresql://app:secret%21@db.local:55432/efiling?schema=public&sslmode=require');
  assert.deepEqual(parsed.metadata, { host: 'db.local', port: '55432', database: 'efiling', schema: 'public', sslmode: 'require' });
  assert.equal(parsed.environment.PGPASSWORD, 'secret!');
  assert.doesNotMatch(JSON.stringify(parsed.metadata), /secret/);
});

test('storage paths use configured values and project defaults', () => {
  const root = join(tmpdir(), 'efiling-root');
  const defaults = resolveStoragePaths(root, {});
  assert.equal(defaults.documents, join(root, '.local', 'document-storage'));
  assert.equal(defaults.records, join(root, '.local', 'record-storage'));
  assert.equal(resolveStoragePaths(root, { DOCUMENT_STORAGE_DIR: 'D:/docs', RECORD_STORAGE_DIR: 'D:/records' }).documents, 'D:\\docs');
});

test('manifest detects changed package files', async () => {
  const root = await mkdtemp(join(tmpdir(), 'efiling-manifest-'));
  await mkdir(join(root, 'storage'), { recursive: true });
  await writeFile(join(root, 'storage', 'one.pdf'), 'original');
  await writeManifest(root);
  assert.deepEqual(await verifyManifest(root), []);
  await writeFile(join(root, 'storage', 'one.pdf'), 'changed');
  assert.match((await verifyManifest(root))[0], /checksum mismatch/);
});

test('manifest rejects files added after backup creation', async () => {
  const root = await mkdtemp(join(tmpdir(), 'efiling-extra-'));
  await writeFile(join(root, 'known'), 'known');
  await writeManifest(root);
  await writeFile(join(root, 'unexpected'), 'unexpected');
  assert.match((await verifyManifest(root)).join('\n'), /unexpected file/);
});

test('path containment guard handles siblings and descendants', () => {
  const root = join(tmpdir(), 'storage');
  assert.equal(isPathInside(root, join(root, 'backups')), true);
  assert.equal(isPathInside(root, join(tmpdir(), 'storage-old')), false);
});

test('restore guard rejects a non-empty storage directory', async () => {
  const root = await mkdtemp(join(tmpdir(), 'efiling-empty-'));
  await assertEmptyDirectory(join(root, 'missing'));
  await writeFile(join(root, 'data'), 'occupied');
  await assert.rejects(() => assertEmptyDirectory(root), /not empty/);
});

test('explicit PostgreSQL bin reports the missing executable path', () => {
  const root = join(tmpdir(), 'efiling-tool-root');
  const bin = join(root, 'missing-bin');
  assert.throws(() => requirePostgresTool('pg_dump', root, {}, bin), new RegExp(`pg_dump\\.exe was not found in --pg-bin directory`));
});
