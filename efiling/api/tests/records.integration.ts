import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { readdir, rm } from 'node:fs/promises';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import request from 'supertest';

test('records: create with evidence, search by scope, and authorize downloads', async () => {
  const root = fileURLToPath(new URL('../../', import.meta.url));
  dotenv.config({ path: resolve(root, '.env'), quiet: true });
  assert.ok(process.env.DATABASE_URL, 'Configure development DATABASE_URL');
  const original = process.env.DATABASE_URL;
  const schema = `records_test_${randomUUID().replaceAll('-', '')}`;
  const storage = resolve(root, '.local', schema);
  const url = new URL(original); url.searchParams.set('schema', schema);
  process.env.DATABASE_URL = url.toString();
  process.env.RECORD_STORAGE_DIR = storage;
  const admin = new PrismaClient({ datasourceUrl: original });
  let disconnect: (() => Promise<void>) | undefined;
  try {
    await admin.$executeRawUnsafe(`CREATE SCHEMA "${schema}"`);
    const migrate = spawnSync(process.execPath, ['scripts/prisma.mjs', 'migrate', 'deploy'], { cwd: root, env: process.env, encoding: 'utf8' });
    assert.equal(migrate.status, 0, migrate.stderr);
    const { seedDemo } = await import('../../scripts/seed-demo.js');
    const { database, disconnectDatabase } = await import('../src/lib/prisma.js');
    disconnect = disconnectDatabase;
    await seedDemo();
    const { createApp } = await import('../src/app.js');
    const { checkDatabase } = await import('../src/lib/prisma.js');
    const app = createApp(checkDatabase);
    const agent = request.agent(app);
    const login = (who: string) => agent.post('/api/auth/login').set('X-EFiling-Client', 'web').send({ email: `${who}@example.test`, password: 'Demo1234!' });
    const pdf = Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\n%%EOF\n');
    await request(app).get('/api/records').expect(401);
    await login('dcc').expect(200);
    const types = await agent.get('/api/records/options').expect(200);
    assert.ok(types.body.recordTypes.length);
    const typeId = types.body.recordTypes[0].id;
    const department = await database().department.findFirstOrThrow();
    const document = await database().document.create({ data: { title: 'ระเบียบอ้างอิง', documentCode: 'QP-2301-9999', docType: 'QP', departmentId: department.id, ownerUserId: types.body.owners[0].id, versions: { create: { status: 'DOC_PUBLISHED', reviewStatus: 'VERIFIED', issueNo: 1, revisionNo: 0, effectiveDate: new Date('2026-09-01') } } } });
    assert.ok((await agent.get('/api/records/options').expect(200)).body.documents.some((item: { id: string }) => item.id === document.id));
    const create = () => agent.post('/api/records').set('X-EFiling-Client', 'web')
      .field('recordTypeId', typeId).field('title', 'หลักฐานทดสอบ')
      .field('recordDate', '2026-09-20').field('ownerUserId', types.body.owners[0].id)
      .field('documentId', document.id)
      .attach('files', pdf, { filename: 'evidence.pdf', contentType: 'application/pdf' });
    const created = await create().expect(201);
    const id = created.body.id;
    const evidenceId = created.body.evidence[0].id;
    await agent.patch(`/api/records/${id}`).set('X-EFiling-Client', 'web').send({ title: 'หลักฐานปรับปรุง', recordTypeId: typeId, recordDate: '2026-09-19', ownerUserId: types.body.owners[0].id, documentId: document.id }).expect(200);
    assert.equal((await agent.get(`/api/records/${id}`).expect(200)).body.record.title, 'หลักฐานปรับปรุง');
    assert.equal((await agent.get('/api/records?title=หลักฐาน').expect(200)).body.records.length, 1);
    assert.equal((await agent.get(`/api/records?documentId=${document.id}`).expect(200)).body.records.length, 1);
    await agent.get(`/api/records/${id}`).expect(200);
    await agent.get(`/api/records/evidence/${evidenceId}`).expect(200).expect('Content-Type', /application\/pdf/);
    const empty = await agent.post('/api/records').set('X-EFiling-Client', 'web')
      .field('recordTypeId', typeId).field('title', 'บันทึกยังไม่ผูกเอกสาร')
      .field('recordDate', '2026-09-20').field('ownerUserId', types.body.owners[0].id).expect(201);
    assert.equal(empty.body.evidence.length, 0);
    await agent.get('/api/records?from=2026-02-30').expect(400);
    await login('carowner').expect(200);
    assert.equal((await agent.get('/api/records').expect(200)).body.records.length, 0);
    await agent.get(`/api/records/${id}`).expect(403);
    await agent.get(`/api/records/evidence/${evidenceId}`).expect(403);
    await agent.patch(`/api/records/${id}`).set('X-EFiling-Client', 'web').send({ title: 'forged' }).expect(403);
    await create().expect(403);
    await login('dcc').expect(200);
    const bad = await agent.post('/api/records').set('X-EFiling-Client', 'web')
      .field('recordTypeId', typeId).field('title', 'ปลอม PDF')
      .field('recordDate', '2026-09-20').field('ownerUserId', types.body.owners[0].id)
      .attach('files', Buffer.from('not pdf'), { filename: 'fake.pdf', contentType: 'application/pdf' }).expect(400);
    assert.ok(bad.body.message);
    assert.equal(await database().qualityRecord.count(), 2);
    assert.deepEqual(await readdir(resolve(storage, 'incoming')), []);
    const stored = await database().evidence.findUniqueOrThrow({ where: { id: evidenceId } });
    await rm(resolve(storage, stored.storagePath));
    await agent.get(`/api/records/evidence/${evidenceId}`).expect(503);
    assert.equal(await database().auditEvent.count({ where: { entityType: 'Evidence', entityId: evidenceId, reason: 'FILE_MISSING' } }), 1);
  } finally {
    await disconnect?.();
    await admin.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
    await admin.$disconnect();
    await rm(storage, { recursive: true, force: true });
    process.env.DATABASE_URL = original;
  }
});
