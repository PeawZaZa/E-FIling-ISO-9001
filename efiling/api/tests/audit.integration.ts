import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { rm, rename } from 'node:fs/promises';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import request from 'supertest';

test('audit rounds and findings enforce membership, independence, evidence, and scope', async () => {
  const root = fileURLToPath(new URL('../../', import.meta.url));
  dotenv.config({ path: resolve(root, '.env'), quiet: true });
  assert.ok(process.env.DATABASE_URL);
  const original = process.env.DATABASE_URL;
  const schema = `audit_test_${randomUUID().replaceAll('-', '')}`;
  const storage = resolve(root, '.local', schema);
  const url = new URL(original); url.searchParams.set('schema', schema);
  process.env.DATABASE_URL = url.toString(); process.env.RECORD_STORAGE_DIR = storage;
  const admin = new PrismaClient({ datasourceUrl: original });
  let disconnect: (() => Promise<void>) | undefined;
  try {
    await admin.$executeRawUnsafe(`CREATE SCHEMA "${schema}"`);
    const migration = spawnSync(process.execPath, ['scripts/prisma.mjs', 'migrate', 'deploy'], { cwd: root, env: process.env, encoding: 'utf8' });
    assert.equal(migration.status, 0, migration.stderr);
    const { seedDemo } = await import('../../scripts/seed-demo.js');
    const { database, disconnectDatabase } = await import('../src/lib/prisma.js');
    disconnect = disconnectDatabase; await seedDemo();
    const { createApp } = await import('../src/app.js');
    const app = createApp(async () => {}); const agent = request.agent(app);
    const login = (who: string) => agent.post('/api/auth/login').set('X-EFiling-Client', 'web').send({ email: `${who}@example.test`, password: 'Demo1234!' });
    const db = database();
    const department = await db.department.findFirstOrThrow();
    const auditor = await db.user.findUniqueOrThrow({ where: { username: 'auditor' } });
    const lead = await db.user.findUniqueOrThrow({ where: { username: 'lead' } });
    await db.user.update({ where: { id: auditor.id }, data: { departmentId: department.id } });
    await request(app).get('/api/audit/rounds').expect(401);
    await login('lead').expect(200);
    const roundBody = { name: 'รอบทดสอบ', objective: 'ตรวจระบบ', scope: 'การควบคุมเอกสาร', criteria: 'ISO 9001 ข้อ 7.5', startDate: '2026-09-20', endDate: '2026-09-21', targetDepartmentId: department.id, auditorUserIds: [auditor.id, lead.id] };
    await agent.post('/api/audit/rounds').set('X-EFiling-Client', 'web').send({ ...roundBody, scope: '' }).expect(400);
    await agent.post('/api/audit/rounds').set('X-EFiling-Client', 'web').send(roundBody).expect(400);
    await login('dcc').expect(200);
    await agent.post('/api/audit/rounds').set('X-EFiling-Client', 'web').send({ ...roundBody, waiverReason: '' }).expect(400);
    const round = await agent.post('/api/audit/rounds').set('X-EFiling-Client', 'web').send({ ...roundBody, waiverReason: 'อนุมัติยกเว้นเฉพาะรอบนี้' }).expect(201);
    const roundId = round.body.id;
    assert.equal(round.body.members.length, 2);
    assert.equal(await db.auditEvent.count({ where: { entityType: 'AuditRound', entityId: roundId, action: 'INDEPENDENCE_WAIVER' } }), 1);
    await login('auditor').expect(200);
    const pdf = Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\n%%EOF\n');
    const form = () => agent.post('/api/audit/findings').set('X-EFiling-Client', 'web')
      .field('auditRoundId', roundId).field('source', 'INTERNAL_AUDIT').field('findingType', 'NONCONFORMITY').field('severity', 'MINOR')
      .field('description', 'พบการใช้เอกสารเก่าในขั้นตอนทำงาน').field('violatedRequirement', 'ISO 9001 ข้อ 7.5').field('identifiedDate', '2026-09-20');
    await form().expect(400);
    const recordType = await db.recordType.findFirstOrThrow();
    const record = (await agent.post('/api/records').set('X-EFiling-Client', 'web')
      .field('recordTypeId', recordType.id).field('title', 'Linked proof').field('recordDate', '2026-09-20')
      .field('ownerUserId', auditor.id).attach('files', pdf, 'record.pdf').expect(201)).body;
    const linkedFile = await db.evidence.findUniqueOrThrow({ where: { id: record.evidence[0].id } });
    const linkedPath = resolve(storage, linkedFile.storagePath);
    await rename(linkedPath, `${linkedPath}.missing`);
    await form().field('recordId', record.id).expect(409);
    assert.equal(await db.finding.count(), 0);
    await rename(`${linkedPath}.missing`, linkedPath);
    const finding = await form().attach('files', pdf, { filename: 'proof.pdf', contentType: 'application/pdf' }).expect(201);
    const findingId = finding.body.id;
    assert.equal(finding.body.evidence.length, 1);
    await agent.get(`/api/audit/evidence/${finding.body.evidence[0].id}`).expect(200);
    assert.equal(await db.auditEvent.count({ where: { entityType: 'Evidence', entityId: finding.body.evidence[0].id, action: 'ATTACH_EVIDENCE' } }), 1);
    const summary = await agent.get(`/api/audit/rounds/${roundId}`).expect(200);
    assert.equal(summary.body.summary.byType.NONCONFORMITY, 1);
    assert.equal(summary.body.summary.bySeverity.MINOR, 1);
    await login('carowner').expect(200);
    await agent.get(`/api/audit/findings/${findingId}`).expect(403);
    await agent.get(`/api/audit/rounds/${roundId}`).expect(403);
    await agent.get(`/api/audit/evidence/${finding.body.evidence[0].id}`).expect(403);
    await agent.post('/api/audit/rounds').set('X-EFiling-Client', 'web').send(roundBody).expect(403);
    await login('lead').expect(200);
    await agent.get(`/api/audit/findings/${findingId}`).expect(200);
    await agent.post('/api/audit/findings').set('X-EFiling-Client', 'web').field('auditRoundId', roundId).field('source', 'MANAGEMENT_REVIEW').field('findingType', 'OBSERVATION').field('severity', 'OB').field('description', 'พบข้อสังเกต').field('violatedRequirement', 'ISO 9001 ข้อ 9').field('identifiedDate', '2026-09-20').expect(400);
    await agent.post('/api/audit/findings').set('X-EFiling-Client', 'web').field('source', 'COMPLAINT').field('findingType', 'OBSERVATION').field('severity', 'OB').field('description', 'พบข้อสังเกตจากข้อร้องเรียน').field('violatedRequirement', 'ISO 9001 ข้อ 9').field('identifiedDate', '2026-09-20').expect(201);
    await agent.post('/api/audit/findings').set('X-EFiling-Client', 'web').field('auditRoundId', roundId).field('source', 'INTERNAL_AUDIT').field('findingType', 'NONCONFORMITY').field('severity', 'MAJOR').field('description', 'ไฟล์หลักฐานไม่ใช่ PDF จริง').field('violatedRequirement', 'ISO 9001 ข้อ 7.5').field('identifiedDate', '2026-09-20').attach('files', Buffer.from('fake'), { filename: 'fake.pdf', contentType: 'application/pdf' }).expect(400);
    await login('deputy').expect(200);
    assert.equal((await agent.get('/api/audit/rounds').expect(200)).body.rounds.length, 0);
    assert.equal((await agent.get('/api/audit/findings').expect(200)).body.findings.length, 0);
    await login('dcc').expect(200);
    await agent.post('/api/audit/findings').set('X-EFiling-Client', 'web').field('auditRoundId', roundId).field('source', 'INTERNAL_AUDIT').field('findingType', 'OBSERVATION').field('severity', 'OB').field('description', 'ข้อสังเกตจากผู้ดูแลระบบ').field('violatedRequirement', 'ISO 9001 ข้อ 7.5').field('identifiedDate', '2026-09-20').expect(201);
  } finally {
    await disconnect?.(); await admin.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`); await admin.$disconnect();
    await rm(storage, { recursive: true, force: true }); process.env.DATABASE_URL = original;
  }
});
