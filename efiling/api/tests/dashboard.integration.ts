import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import request from 'supertest';

test('dashboard counts real data inside each role scope', async () => {
  const root = fileURLToPath(new URL('../../', import.meta.url));
  dotenv.config({ path: resolve(root, '.env'), quiet: true });
  assert.ok(process.env.DATABASE_URL, 'Configure development DATABASE_URL');
  const original = process.env.DATABASE_URL;
  const schema = `dashboard_test_${randomUUID().replaceAll('-', '')}`;
  const url = new URL(original); url.searchParams.set('schema', schema);
  process.env.DATABASE_URL = url.toString();
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
    const app = createApp(async () => {}), agent = request.agent(app), db = database();
    const login = (who: string) => agent.post('/api/auth/login').set('X-EFiling-Client', 'web').send({ email: `${who}@example.test`, password: 'Demo1234!' });
    const user = async (username: string) => (await db.user.findFirstOrThrow({ where: { username } })).id;
    await login('dcc').expect(200);
    const empty = (await agent.get('/api/dashboard').expect(200)).body.sections;
    assert.equal(Object.keys(empty).length, 6);
    assert.equal(empty.documents.total, 0);
    assert.equal(empty.dars.total, 0);
    assert.equal(empty.acknowledgements.assigned, 0);
    assert.equal(empty.records.files, 0);
    assert.equal(empty.audit.findings, 0);
    assert.equal(empty.cars.total, 0);
    const type = await db.recordType.findFirstOrThrow();
    const department = await db.department.findFirstOrThrow();
    const document = await db.document.create({ data: { title: 'คู่มือทดสอบ', docType: 'QM', departmentId: department.id, ownerUserId: await user('dcc'), versions: { create: { status: 'DOC_PUBLISHED', reviewStatus: 'VERIFIED', issueNo: 1, revisionNo: 0, effectiveDate: new Date('2026-09-01') } } }, include: { versions: true } });
    await db.acknowledgementAssignment.create({ data: { versionId: document.versions[0].id, assigneeId: await user('qmr'), assignedById: await user('dcc') } });
    await db.dar.create({ data: { requestType: 'NEW_DOCUMENT', requesterId: await user('dcc'), reason: 'ปรับปรุงคู่มือ', status: 'DAR_AWAITING_REVIEW' } });
    const record = await db.qualityRecord.create({ data: { recordTypeId: type.id, title: 'บันทึก DCC', recordDate: new Date('2026-09-20'), ownerUserId: await user('dcc'), createdById: await user('dcc') } });
    await db.qualityRecord.create({ data: { recordTypeId: type.id, title: 'บันทึกผู้ช่วย', recordDate: new Date('2026-09-20'), ownerUserId: await user('assistant'), createdById: await user('assistant') } });
    await db.evidence.create({ data: { fileName: 'evidence.pdf', mimeType: 'application/pdf', sizeBytes: 10n, storagePath: `dashboard/${randomUUID()}`, uploadedById: await user('dcc'), recordId: record.id } });
    const round = await db.auditRound.create({ data: { name: 'รอบตรวจทดสอบ', objective: 'ตรวจระบบ', scope: 'สำนักงาน', criteria: 'ISO 9001', startDate: new Date('2026-09-20'), endDate: new Date('2026-09-21'), targetDepartmentId: department.id, createdById: await user('dcc'), members: { create: { auditorUserId: await user('auditor') } } } });
    const finding = await db.finding.create({ data: { auditRoundId: round.id, source: 'INTERNAL_AUDIT', findingType: 'NONCONFORMITY', severity: 'MINOR', description: 'พบข้อบกพร่อง', violatedRequirement: '7.5', identifiedDate: new Date('2026-09-20'), identifiedById: await user('auditor'), departmentId: department.id } });
    const requestRow = await db.correctiveRequest.create({ data: { requestNo: '001/2569', buddhistYear: 2569, sequenceNo: 1, requestType: 'CAR', findingId: finding.id, departmentId: department.id, severity: 'MINOR', ownerUserId: await user('carowner'), openedById: await user('dcc'), overallDueDate: new Date('2020-01-01') } });
    await request(app).get('/api/dashboard').expect(401);
    await login('reader').expect(200); await agent.get('/api/dashboard').expect(403);
    await login('dcc').expect(200);
    const dcc = (await agent.get('/api/dashboard').expect(200)).body;
    assert.deepEqual(dcc.unavailable, []);
    assert.equal(Object.keys(dcc.sections).length, 6);
    assert.equal(dcc.sections.records.total, 2);
    assert.equal(dcc.sections.records.withFiles, 1);
    assert.equal(dcc.sections.records.files, 1);
    assert.equal(dcc.sections.documents.published, 1);
    assert.equal(dcc.sections.dars.byStatus.DAR_AWAITING_REVIEW, 1);
    assert.equal(dcc.sections.acknowledgements.pending, 1);
    assert.equal(dcc.sections.audit.withOpenRequest, 1);
    assert.equal(dcc.sections.cars.overdue, 0, 'overall request date is not an applicable stage deadline');
    const undated = (await agent.get('/api/cars').expect(200)).body.requests.find((row: { id: string }) => row.id === requestRow.id);
    assert.equal(undated.due.state, 'NO_DUE_DATE');
    assert.equal(undated.due.nextDueDate, null);
    await login('assistant').expect(200);
    await agent.get('/api/dashboard').expect(403);
    await login('deputy').expect(200);
    const deputy = (await agent.get('/api/dashboard').expect(200)).body;
    assert.equal(Object.keys(deputy.sections).length, 6);
    assert.equal(deputy.sections.records.total, 0);
    assert.equal(deputy.sections.cars.total, 0);
    await login('auditor').expect(200);
    const auditor = (await agent.get('/api/dashboard').expect(200)).body;
    assert.deepEqual(auditor.unavailable, []);
    assert.deepEqual(Object.keys(auditor.sections).sort(), ['audit', 'cars', 'records']);
    assert.equal(auditor.sections.audit.findings, 1);
    assert.equal(auditor.sections.cars.total, 1);
    await login('sponsor').expect(200);
    const sponsor = (await agent.get('/api/dashboard').expect(200)).body;
    assert.equal(sponsor.aggregateOnly, true);
    assert.equal(Object.keys(sponsor.sections).length, 6);
    assert.equal(sponsor.sections.records.total, 2);
    await agent.get('/api/records').expect(403);

    await db.correctiveRequest.update({ where: { id: requestRow.id }, data: { currentStatus: 'IMPLEMENTING' } });
    await db.actionPlan.create({ data: { requestId: requestRow.id, revision: 1, correctiveSummary: 'แก้ไข', preventiveSummary: 'ป้องกัน', submittedById: await user('carowner'), activities: { create: [
      { kind: 'CORRECTIVE', description: 'งานเลยกำหนด', responsibleUserId: await user('carowner'), dueDate: new Date('2020-01-02') },
      { kind: 'PREVENTIVE', description: 'งานอนาคต', responsibleUserId: await user('carowner'), dueDate: new Date('2099-01-01') },
      { kind: 'CORRECTIVE', description: 'งานเสร็จแล้ว', responsibleUserId: await user('carowner'), dueDate: new Date('2020-01-03'), completedAt: new Date('2020-01-04') },
    ] } } });
    await login('dcc').expect(200);
    const dccOverdue = (await agent.get('/api/cars?overdue=1').expect(200)).body.requests;
    assert.equal(dccOverdue.length, 1);
    assert.equal(dccOverdue[0].id, requestRow.id);
    assert.equal(dccOverdue[0].currentStatus, 'IMPLEMENTING');
    assert.equal(dccOverdue[0].due.state, 'OVERDUE');
    assert.equal(dccOverdue[0].due.overdueWork.length, 1);
    assert.equal(dccOverdue[0].due.overdueWork[0].description, 'งานเลยกำหนด');
    assert.ok(dccOverdue[0].due.overdueWork[0].daysOverdue > 0);
    assert.equal((await agent.get('/api/dashboard').expect(200)).body.sections.cars.overdue, dccOverdue.length);

    // An explicit current-stage date counts; a future or stale stage date does not.
    const extraFinding = async (description: string) => (await db.finding.create({ data: { source: 'INTERNAL_AUDIT', findingType: 'NONCONFORMITY', severity: 'MINOR', description, violatedRequirement: '7.5', identifiedDate: new Date('2020-01-01'), identifiedById: await user('auditor'), departmentId: department.id } })).id;
    const stageRequest = await db.correctiveRequest.create({ data: { requestNo: '002/2569', buddhistYear: 2569, sequenceNo: 2, requestType: 'CAR', findingId: await extraFinding('งานรออนุมัติแผน'), departmentId: department.id, severity: 'MINOR', ownerUserId: await user('assistant'), openedById: await user('dcc'), currentStatus: 'PENDING_PLAN_APPROVAL', overallDueDate: new Date('2020-01-01') } });
    await db.requestStatusHistory.create({ data: { requestId: stageRequest.id, toStatus: 'PENDING_PLAN_APPROVAL', action: 'submit-plan', actorUserId: await user('dcc'), actorRole: 'ISO_QA_ADMIN', stageDueDate: new Date('2020-01-05') } });
    const futureRequest = await db.correctiveRequest.create({ data: { requestNo: '003/2569', buddhistYear: 2569, sequenceNo: 3, requestType: 'CAR', findingId: await extraFinding('งานกำหนดในอนาคต'), departmentId: department.id, severity: 'MINOR', ownerUserId: await user('carowner'), openedById: await user('dcc'), currentStatus: 'PENDING_PLAN_APPROVAL', overallDueDate: new Date('2020-01-01') } });
    await db.requestStatusHistory.create({ data: { requestId: futureRequest.id, toStatus: 'PENDING_PLAN_APPROVAL', action: 'submit-plan', actorUserId: await user('dcc'), actorRole: 'ISO_QA_ADMIN', stageDueDate: new Date('2099-01-01') } });
    const finishedRequest = await db.correctiveRequest.create({ data: { requestNo: '004/2569', buddhistYear: 2569, sequenceNo: 4, requestType: 'CAR', findingId: await extraFinding('งานเสร็จแล้ว'), departmentId: department.id, severity: 'MINOR', ownerUserId: await user('carowner'), openedById: await user('dcc'), currentStatus: 'PENDING_CLOSURE', overallDueDate: new Date('2020-01-01') } });
    await db.requestStatusHistory.create({ data: { requestId: finishedRequest.id, toStatus: 'PENDING_CLOSURE', action: 'verify-pass', actorUserId: await user('dcc'), actorRole: 'ISO_QA_ADMIN', stageDueDate: new Date('2020-01-05') } });
    const staleRequest = await db.correctiveRequest.create({ data: { requestNo: '005/2569', buddhistYear: 2569, sequenceNo: 5, requestType: 'CAR', findingId: await extraFinding('กำหนดเวลาของขั้นก่อนหน้า'), departmentId: department.id, severity: 'MINOR', ownerUserId: await user('carowner'), openedById: await user('dcc'), currentStatus: 'PENDING_VERIFICATION', overallDueDate: new Date('2020-01-01') } });
    await db.requestStatusHistory.create({ data: { requestId: staleRequest.id, toStatus: 'IMPLEMENTING', action: 'approve', actorUserId: await user('dcc'), actorRole: 'ISO_QA_ADMIN', stageDueDate: new Date('2020-01-05') } });
    const allOverdue = (await agent.get('/api/cars?overdue=1').expect(200)).body.requests;
    assert.deepEqual(allOverdue.map((row: { id: string }) => row.id).sort(), [requestRow.id, stageRequest.id].sort());
    assert.equal(allOverdue.find((row: { id: string }) => row.id === stageRequest.id).due.overdueWork[0].waitingRole, 'QMR');
    assert.equal((await agent.get('/api/dashboard').expect(200)).body.sections.cars.overdue, allOverdue.length);
    const allRows = (await agent.get('/api/cars').expect(200)).body.requests;
    assert.equal(allRows.find((row: { id: string }) => row.id === futureRequest.id).due.state, 'UPCOMING');
    assert.equal(allRows.find((row: { id: string }) => row.id === finishedRequest.id).due.state, 'NOT_ACTIVE');
    assert.equal(allRows.find((row: { id: string }) => row.id === staleRequest.id).due.state, 'NO_DUE_DATE');
    await login('carowner').expect(200);
    const ownerOverdue = (await agent.get('/api/cars?overdue=1').expect(200)).body.requests;
    assert.deepEqual(ownerOverdue.map((row: { id: string }) => row.id), [requestRow.id]);
    await login('sponsor').expect(200);
    assert.equal((await agent.get('/api/dashboard').expect(200)).body.sections.cars.overdue, 2);
    await agent.get('/api/cars?overdue=1').expect(403);

    // Fault injection stays inside this disposable schema: one failed domain must not erase real results.
    await db.$executeRawUnsafe('DROP TABLE acknowledgement_assignment CASCADE');
    const oneFailure = (await agent.get('/api/dashboard').expect(200)).body;
    assert.deepEqual(oneFailure.unavailable, ['acknowledgements']);
    assert.equal(Object.hasOwn(oneFailure.sections, 'acknowledgements'), false);
    assert.equal(oneFailure.sections.documents.published, 1);
    assert.equal(oneFailure.sections.dars.total, 1);
    assert.equal(oneFailure.sections.records.total, 2);
    assert.equal(oneFailure.sections.audit.findings, 5);
    assert.equal(oneFailure.sections.cars.total, 5);
    assert.equal(oneFailure.aggregateOnly, true);
    assert.deepEqual(Object.keys(oneFailure).sort(), ['aggregateOnly', 'sections', 'unavailable']);

    await login('deputy').expect(200);
    const scopedFailure = (await agent.get('/api/dashboard').expect(200)).body;
    assert.deepEqual(scopedFailure.unavailable, ['acknowledgements']);
    assert.equal(scopedFailure.sections.records.total, 0);
    assert.equal(scopedFailure.sections.cars.total, 0);
    await login('auditor').expect(200);
    const auditorWithoutAck = (await agent.get('/api/dashboard').expect(200)).body;
    assert.deepEqual(auditorWithoutAck.unavailable, []);
    assert.deepEqual(Object.keys(auditorWithoutAck.sections).sort(), ['audit', 'cars', 'records']);

    await db.$executeRawUnsafe('DROP TABLE audit_round CASCADE');
    await login('dcc').expect(200);
    const twoFailures = (await agent.get('/api/dashboard').expect(200)).body;
    assert.deepEqual(twoFailures.unavailable, ['acknowledgements', 'audit']);
    assert.deepEqual(Object.keys(twoFailures.sections).sort(), ['cars', 'dars', 'documents', 'records']);
    assert.equal(twoFailures.sections.documents.published, 1);
    assert.equal(twoFailures.sections.records.files, 1);
    assert.equal(twoFailures.sections.cars.total, 5);
  } finally {
    await disconnect?.();
    await admin.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
    await admin.$disconnect();
    process.env.DATABASE_URL = original;
  }
});
