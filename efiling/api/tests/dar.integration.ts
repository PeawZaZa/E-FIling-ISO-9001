// API integration tests use only a disposable PostgreSQL schema and private temporary storage.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve, relative } from 'node:path';
import { rm, readdir, rename } from 'node:fs/promises';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import request from 'supertest';
test('DAR: five routes, round binding, file permissions, number races, publication, logistics and rollback', async () => {
    const root = fileURLToPath(new URL('../../', import.meta.url));
    dotenv.config({ path: resolve(root, '.env'), quiet: true });
    const original = process.env.DATABASE_URL!;
    assert.ok(original);
    const schema = `dar_test_${randomUUID().replaceAll('-', '')}`;
    const storage = resolve(root, '.local', schema);
    const url = new URL(original);
    url.searchParams.set('schema', schema);
    process.env.DATABASE_URL = url.toString();
    process.env.DOCUMENT_STORAGE_DIR = storage;
    process.env.RECORD_STORAGE_DIR = resolve(storage, 'records');
    const admin = new PrismaClient({ datasourceUrl: original });
    let disconnect: (() => Promise<void>) | undefined;
    try {
        await admin.$executeRawUnsafe(`CREATE SCHEMA "${schema}"`);
        const migrated = spawnSync(process.execPath, ['scripts/prisma.mjs', 'migrate', 'deploy'], { cwd: root, env: process.env, encoding: 'utf8' });
        assert.equal(migrated.status, 0, migrated.stderr + migrated.stdout);
        const { seedDemo } = await import('../../scripts/seed-demo.js');
        await seedDemo();
        const { database, disconnectDatabase } = await import('../src/lib/prisma.js');
        disconnect = disconnectDatabase;
        const db = database();
        const { dbUserId } = await import('../src/services/documentRules.js');
        const { createApp } = await import('../src/app.js');
        const app = createApp(async () => { });
        const agents: Record<string, ReturnType<typeof request.agent>> = {};
        for (const who of ['dcc', 'owner', 'registrar', 'reviewer', 'qmr', 'dean', 'deputy', 'reader', 'carowner', 'auditor']) {
            agents[who] = request.agent(app);
            await agents[who].post('/api/auth/login').set('X-EFiling-Client', 'web').send({ email: `${who}@example.test`, password: 'Demo1234!' }).expect(200);
        }
        const post = (who: string, id: string, action: string, data: object = {}) => agents[who].post(`/api/dars/${id}/${action}`).set('X-EFiling-Client', 'web').send(data);
        const upload = (who: string, id: string, kind = 'DRAFT', bytes = Buffer.from(`%PDF-1.4\n${randomUUID()}\n%%EOF`)) => agents[who].post(`/api/dars/${id}/files`).set('X-EFiling-Client', 'web').field('kind', kind).attach('file', bytes, { filename: 'test.pdf', contentType: 'application/pdf' });
        const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
        const parent = await db.document.create({ data: { documentCode: 'QP-2301-0107', title: 'Parent', docType: 'QP', versions: { create: { issueNo: 1, revisionNo: 2, effectiveDate: new Date(day), status: 'DOC_PUBLISHED', reviewStatus: 'VERIFIED' } } }, include: { versions: true } });
        async function create(type: string, extra: object = {}) { const who = type === 'QM' ? 'dcc' : 'owner'; const body = { requestType: 'NEW_DOCUMENT', docType: type, title: `Title ${type}`, reason: 'Test reason', ownerUserId: dbUserId(who), issueNo: 1, revisionNo: 0, effectiveDate: day, sectionCode: '01', parentDocumentId: ['WI', 'SD', 'FM'].includes(type) ? parent.id : null, ...extra }; const r = await agents[who].post('/api/dars').set('X-EFiling-Client', 'web').send(body).expect(201); return { id: r.body.dar.id, who, body }; }
        async function approve(id: string, who: string, type: string) { await upload(who, id).expect(201); await post(who, id, 'submit').expect(200); await post('registrar', id, 'intake', { result: 'ACCEPTED' }).expect(200); await post(type === 'QM' ? 'qmr' : 'reviewer', id, 'review', { result: 'ACCEPTED' }).expect(200); await post(type === 'QM' ? 'dean' : 'qmr', id, 'approve', { result: 'APPROVED' }).expect(200); }
        await request(app).get('/api/dars').expect(401);
        await agents.reader.get('/api/dars').expect(403);
        const incomplete = await create('QP', { issueNo: null });
        await post('owner', incomplete.id, 'submit').expect(400);
        await post('dcc', incomplete.id, 'publish').expect(403);
        for (const type of ['QM', 'QP', 'WI', 'SD', 'FM']) {
            const { id, who } = await create(type);
            await approve(id, who, type);
            await post('dcc', id, 'publish', { effectiveDate: '2000-01-01' }).expect(400);
            await post('dcc', id, 'publish', { effectiveDate: day }).expect(200);
            await post('dcc', id, 'publish', { effectiveDate: day }).expect(403);
            await post('registrar', id, 'close').expect(400);
            await post('registrar', id, 'distribution', { items: [], notApplicableReason: 'No physical holders' }).expect(200);
            await post('registrar', id, 'recall', { items: [], notApplicableReason: 'New document' }).expect(200);
            await post('registrar', id, 'close').expect(200);
            const closeEvent = await db.auditEvent.findFirst({ where: { entityType: 'Dar', entityId: id, action: 'STATUS_CHANGE', afterValue: { path: ['status'], equals: 'DAR_CLOSED' } } });
            assert.ok(closeEvent, 'DAR closure must have an audit event');
            assert.equal(closeEvent.actorUserId, dbUserId('registrar'));
            await post('registrar', id, 'distribution', { items: [], notApplicableReason: 'Edit closed' }).expect(403);
            const v = await db.documentVersion.findFirstOrThrow({ where: { originatingDarId: id }, include: { document: true, files: true } });
            assert.ok(v.document.documentCode);
            assert.equal(v.files.length, 1);
            await agents.reader.get(`/api/documents/files/${v.files[0].id}`).expect(200);
        }
        // Returned rounds retain files/decisions and restart intake; only the new round can approve.
        const returned = await create('QP');
        const firstFile = (await upload('owner', returned.id).expect(201)).body.dar.files[0].id;
        const draftFile = await db.darFile.findUniqueOrThrow({ where: { id: firstFile } });
        const draftPath = resolve(storage, draftFile.storagePath);
        await rename(draftPath, `${draftPath}.missing`);
        await post('owner', returned.id, 'submit').expect(409);
        assert.equal(await db.darRound.count({ where: { darId: returned.id } }), 0);
        await rename(`${draftPath}.missing`, draftPath);
        await post('owner', returned.id, 'submit').expect(200);
        await upload('owner', returned.id).expect(403);
        await post('registrar', returned.id, 'intake', { result: 'CHANGES_REQUESTED' }).expect(400);
        await post('registrar', returned.id, 'intake', { result: 'CHANGES_REQUESTED', comment: 'Fix' }).expect(200);
        await post('owner', returned.id, 'submit').expect(400);
        await approve(returned.id, 'owner', 'QP');
        const rd = await db.dar.findUniqueOrThrow({ where: { id: returned.id }, include: { rounds: true, decisions: true, files: true } });
        assert.equal(rd.rounds.length, 2);
        assert.equal(rd.roundNo, 2);
        assert.equal(rd.decisions[0].roundNo, 1);
        assert.ok(rd.files.some(f => f.id === firstFile));
        await agents.reader.get(`/api/dars/files/${firstFile}`).expect(404);
        await agents.qmr.get(`/api/dars/files/${firstFile}?download=1`).expect(200).expect('Content-Disposition', /^attachment/);
        await assert.rejects(() => db.darRound.update({ where: { id: rd.rounds[0].id }, data: { snapshot: { changed: true } } }));
        // Explicit deputy delegation grants only the selected DAR step.
        const delegated = await create('QP');
        await upload('owner', delegated.id);
        await post('owner', delegated.id, 'submit');
        await post('registrar', delegated.id, 'intake', { result: 'ACCEPTED' });
        await post('reviewer', delegated.id, 'review', { result: 'ACCEPTED' });
        await post('deputy', delegated.id, 'approve', { result: 'APPROVED' }).expect(404);
        await post('qmr', delegated.id, 'delegate', { step: 'APPROVAL', assigneeId: 'deputy' }).expect(200);
        await post('deputy', delegated.id, 'approve', { result: 'APPROVED' }).expect(200);
        assert.equal((await db.darDecision.findFirstOrThrow({ where: { darId: delegated.id, step: 'APPROVAL' } })).decidedById, dbUserId('deputy'));
        // Concurrent submit requests allocate unique year-local numbers.
        const races = await Promise.all([create('QP'), create('QP')]);
        for (const r of races)
            await upload('owner', r.id);
        const numbered = await Promise.all(races.map(r => post('owner', r.id, 'submit').expect(200)));
        assert.notEqual(numbered[0].body.dar.darNo, numbered[1].body.dar.darNo);
        assert.equal((await db.numberSequence.findUniqueOrThrow({ where: { series_buddhistYear: { series: 'DAR', buddhistYear: 2568 } } })).lastNumber, 68);
        // Concurrent publication shares a transaction-backed document sequence.
        const publications = await Promise.all([create('QP'), create('QP')]);
        for (const r of publications)
            await approve(r.id, 'owner', 'QP');
        await Promise.all(publications.map(r => post('dcc', r.id, 'publish', { effectiveDate: day }).expect(200)));
        const codes = await db.document.findMany({ where: { versions: { some: { originatingDarId: { in: publications.map(r => r.id) } } } }, select: { documentCode: true } });
        assert.equal(new Set(codes.map(d => d.documentCode)).size, 2);
        // Separation checks compare database user IDs even when a person is eligible through another role.
        const separation = await create('QP');
        await upload('owner', separation.id);
        await post('owner', separation.id, 'submit');
        await post('registrar', separation.id, 'intake', { result: 'ACCEPTED' });
        await post('reviewer', separation.id, 'review', { result: 'ACCEPTED' });
        await db.dar.update({ where: { id: separation.id }, data: { requesterId: dbUserId('qmr') } });
        await post('qmr', separation.id, 'approve', { result: 'APPROVED' }).expect(403);
        await db.dar.update({ where: { id: separation.id }, data: { requesterId: dbUserId('owner') } });
        await db.darDecision.create({ data: { darId: separation.id, roundNo: 1, step: 'REVIEW', result: 'ACCEPTED', decidedById: dbUserId('qmr'), actorRole: 'QMR' } });
        await post('qmr', separation.id, 'approve', { result: 'APPROVED' }).expect(403);
        const approvedFile = await db.darFile.findFirstOrThrow({ where: { darId: delegated.id, kind: 'DRAFT' } });
        const approvedPath = resolve(storage, approvedFile.storagePath);
        await rename(approvedPath, `${approvedPath}.missing`);
        await post('dcc', delegated.id, 'publish', { effectiveDate: day }).expect(409);
        assert.equal(await db.documentVersion.count({ where: { originatingDarId: delegated.id } }), 0);
        await rename(`${approvedPath}.missing`, approvedPath);
        await post('dcc', delegated.id, 'publish', { effectiveDate: day }).expect(200);
        const delegatedVersion = await db.documentVersion.findFirstOrThrow({ where: { originatingDarId: delegated.id }, include: { files: true } });
        await agents.deputy.get(`/api/documents/files/${delegatedVersion.files[0].id}`).expect(200);
        // Imported source with unknown owner cannot be revised, and unknown issue/revision is never guessed.
        const reviseBody = { requestType: 'REVISE', sourceVersionId: parent.versions[0].id };
        await agents.owner.post('/api/dars').set('X-EFiling-Client', 'web').send({ ...races[0].body, ...reviseBody }).expect(403);
        await db.document.update({ where: { id: parent.id }, data: { ownerUserId: dbUserId('owner') } });
        const revision = await create('QP', reviseBody);
        await approve(revision.id, 'owner', 'QP');
        const stale = await create('QP', reviseBody);
        await approve(stale.id, 'owner', 'QP');
        await post('dcc', revision.id, 'publish', { effectiveDate: day }).expect(200);
        await post('dcc', stale.id, 'publish', { effectiveDate: day }).expect(409);
        const old = await db.documentVersion.findUniqueOrThrow({ where: { id: parent.versions[0].id } });
        assert.equal(old.status, 'DOC_OBSOLETE');
        assert.ok(old.supersededById);
        // Recorded holders require actual PDF proof and recall all prior holders.
        await db.distributionEntry.create({ data: { versionId: old.id, copyNo: '01', holderName: 'Holder', holderPosition: 'Staff' } });
        const item = { copyNo: '01', holderName: 'Holder', holderPosition: 'Staff', completedDate: day, evidence: 'Signed receipt' };
        await post('registrar', revision.id, 'distribution', { items: [item] }).expect(400);
        const evidence = (await upload('registrar', revision.id, 'DISTRIBUTION').expect(201)).body.dar.files.find((f: any) => f.kind === 'DISTRIBUTION').id;
        await post('registrar', revision.id, 'distribution', { items: [{ ...item, evidenceFileId: evidence }] }).expect(200);
        await post('registrar', revision.id, 'recall', { items: [], notApplicableReason: 'No holders' }).expect(400);
        const recall = (await upload('registrar', revision.id, 'RECALL').expect(201)).body.dar.files.find((f: any) => f.kind === 'RECALL').id;
        await post('registrar', revision.id, 'recall', { items: [{ ...item, evidenceFileId: recall }] }).expect(200);
        const recallFile = await db.darFile.findUniqueOrThrow({ where: { id: recall } });
        const recallPath = resolve(storage, recallFile.storagePath);
        await rename(recallPath, `${recallPath}.missing`);
        await post('registrar', revision.id, 'close').expect(409);
        assert.equal((await db.dar.findUniqueOrThrow({ where: { id: revision.id } })).closedAt, null);
        await rename(`${recallPath}.missing`, recallPath);
        await post('registrar', revision.id, 'close').expect(200);
        // A duplicate registered PDF fails publication atomically: no document, counter or state partial update.
        const rollback = await create('QP');
        const duplicate = Buffer.from('%PDF-1.4\nduplicate\n%%EOF');
        await upload('owner', rollback.id, 'DRAFT', duplicate).expect(201);
        await upload('owner', rollback.id, 'DRAFT', duplicate).expect(409);
        await post('owner', rollback.id, 'submit');
        await post('registrar', rollback.id, 'intake', { result: 'ACCEPTED' });
        await post('reviewer', rollback.id, 'review', { result: 'ACCEPTED' });
        await post('qmr', rollback.id, 'approve', { result: 'APPROVED' });
        const hash = (await db.darFile.findFirstOrThrow({ where: { darId: rollback.id } })).sha256;
        await db.documentFile.create({ data: { versionId: old.id, fileName: 'existing.pdf', mimeType: 'application/pdf', sizeBytes: duplicate.length, storagePath: `${randomUUID()}.pdf`, sha256: hash, uploadedById: dbUserId('dcc') } });
        const before = await db.document.count();
        await post('dcc', rollback.id, 'publish', { effectiveDate: day }).expect(409);
        assert.equal(await db.document.count(), before);
        assert.equal((await db.dar.findUniqueOrThrow({ where: { id: rollback.id } })).status, 'DAR_APPROVED');
        assert.deepEqual(await readdir(resolve(storage, 'incoming')), []);
        await db.$disconnect();
        await agents.dcc.get(`/api/dars/${revision.id}`).expect(200);
        // Cross-module chain uses API-created data, then checks the same state in two fresh API processes.
        const published = await db.documentVersion.findFirstOrThrow({ where: { originatingDarId: revision.id }, include: { files: true } });
        const write = (who: string, path: string, data: object) => agents[who].post(`/api/${path}`).set('X-EFiling-Client', 'web').send(data);
        await write('dcc', `acknowledgements/versions/${published.id}/assign`, { assigneeIds: [dbUserId('reader')] }).expect(200);
        const assignment = await db.acknowledgementAssignment.findFirstOrThrow({ where: { versionId: published.id } });
        await agents.reader.get(`/api/documents/files/${published.files[0].id}?download=1`).expect(200);
        const confirmations = await Promise.all([write('reader', `acknowledgements/${assignment.id}/confirm`, {}), write('reader', `acknowledgements/${assignment.id}/confirm`, {})]);
        assert.ok(confirmations.every(response => response.status === 200));
        assert.equal(await db.acknowledgementConfirmation.count({ where: { assignmentId: assignment.id } }), 1);
        const type = await db.recordType.findFirstOrThrow();
        const record = (await agents.carowner.post('/api/records').set('X-EFiling-Client', 'web')
            .field('recordTypeId', type.id).field('title', 'Integration proof').field('recordDate', day)
            .field('ownerUserId', dbUserId('carowner')).field('documentId', published.documentId)
            .attach('files', Buffer.from('%PDF-1.4\nIntegration proof\n%%EOF'), 'proof.pdf').expect(201)).body;
        const department = await db.department.findFirstOrThrow();
        const round = (await write('dcc', 'audit/rounds', { name: 'Integration round', objective: 'Check references', scope: 'Document control', criteria: '7.5', startDate: day, endDate: day, targetDepartmentId: department.id, auditorUserIds: [dbUserId('auditor')] }).expect(201)).body;
        const finding = (await agents.auditor.post('/api/audit/findings').set('X-EFiling-Client', 'web')
            .field('auditRoundId', round.id).field('source', 'INTERNAL_AUDIT').field('findingType', 'NONCONFORMITY')
            .field('severity', 'MINOR').field('description', 'Integration finding').field('violatedRequirement', '7.5')
            .field('identifiedDate', day).field('recordId', record.id).field('documentId', published.documentId).expect(201)).body;
        const car = (await write('dcc', 'cars', { findingId: finding.id, ownerUserId: dbUserId('carowner'), departmentId: department.id, overallDueDate: day }).expect(201)).body;
        await write('dcc', 'cars', { findingId: finding.id, ownerUserId: dbUserId('carowner'), departmentId: department.id, overallDueDate: day }).expect(409);
        const command = (who: string, action: string, data = {}) => write(who, `cars/${car.id}/actions`, { action, ...data });
        await command('carowner', 'start').expect(200);
        await command('carowner', 'correction', { detail: 'Contain issue' }).expect(200);
        await command('carowner', 'submit-plan', { rootCause: 'Missing check', technique: '5 Whys', activities: [{ kind: 'CORRECTIVE', description: 'Check versions', responsibleUserId: dbUserId('carowner'), dueDate: day }] }).expect(200);
        await command('qmr', 'approve').expect(200);
        const activity = await db.actionPlanActivity.findFirstOrThrow({ where: { plan: { requestId: car.id, isCurrent: true } } });
        await agents.carowner.post(`/api/cars/${car.id}/activities/${activity.id}/result`).set('X-EFiling-Client', 'web').field('resultNote', 'Checked').field('recordId', record.id).expect(200);
        await command('carowner', 'submit-verification').expect(200);
        await command('auditor', 'verify-pass', { reason: 'Effective' }).expect(200);
        await command('qmr', 'close').expect(409); // Closure authority remains TBD.
        const linked = (await agents.carowner.get(`/api/cars/${car.id}`).expect(200)).body.request;
        assert.equal(linked.finding.documentId, published.documentId);
        assert.equal(linked.finding.recordId, record.id);
        assert.equal(linked.actionPlans[0].activities[0].recordLinks[0].record.id, record.id);
        await agents.carowner.get(`/api/cars/${car.id}/evidence/${record.evidence[0].id}`).expect(200);
        await agents.reader.get(`/api/cars/${car.id}`).expect(403);
        await agents.deputy.get(`/api/records/evidence/${record.evidence[0].id}`).expect(403);
        const dashboard = (await agents.dcc.get('/api/dashboard').expect(200)).body;
        assert.equal(dashboard.sections.documents.total, await db.document.count({ where: { isActive: true } }));
        assert.equal(dashboard.sections.documents.published, await db.documentVersion.count({ where: { status: 'DOC_PUBLISHED' } }));
        assert.equal(dashboard.sections.dars.total, await db.dar.count());
        assert.equal(dashboard.sections.dars.closed, await db.dar.count({ where: { status: 'DAR_CLOSED' } }));
        assert.deepEqual(dashboard.sections.acknowledgements, { assigned: 1, confirmed: 1, pending: 0, personal: false });
        assert.deepEqual(dashboard.sections.records, { total: 1, withFiles: 1, files: 1 });
        assert.deepEqual(dashboard.sections.audit, { rounds: 1, findings: 1, withOpenRequest: 1, withoutRequest: 0 });
        assert.equal(dashboard.sections.cars.byStatus.PENDING_CLOSURE, 1);
        assert.equal(dashboard.sections.cars.total, 1);
        assert.equal(await db.auditEvent.count({ where: { entityId: car.id, action: 'STATUS_CHANGE' } }), 6);
        const probe = `
          import assert from 'node:assert/strict';
          import request from 'supertest';
          import { createApp } from './api/src/app.ts';
          import { checkDatabase, disconnectDatabase } from './api/src/lib/prisma.ts';
          const fixture = JSON.parse(process.env.HARDENING_FIXTURE);
          const agent = request.agent(createApp(checkDatabase));
          try {
            await agent.post('/api/auth/login').set('X-EFiling-Client', 'web').send({ email: 'dcc@example.test', password: 'Demo1234!' }).expect(200);
            assert.deepEqual((await agent.get('/api/dashboard').expect(200)).body, fixture.dashboard);
            const document = await agent.get('/api/documents/files/' + fixture.documentFile).expect(200);
            assert.ok(document.body.length > 0);
            const evidence = await agent.get('/api/records/evidence/' + fixture.evidence).expect(200);
            assert.equal(evidence.body.toString(), '%PDF-1.4\\nIntegration proof\\n%%EOF');
            const car = await agent.get('/api/cars/' + fixture.car).expect(200);
            assert.equal(car.body.request.currentStatus, 'PENDING_CLOSURE');
          } finally { await disconnectDatabase(); }
        `;
        for (let boot = 0; boot < 2; boot++) {
            const restarted = spawnSync(process.execPath, ['--import', 'tsx', '--input-type=module', '-e', probe], { cwd: root, env: { ...process.env, HARDENING_FIXTURE: JSON.stringify({ dashboard, documentFile: published.files[0].id, evidence: record.evidence[0].id, car: car.id }) }, encoding: 'utf8', timeout: 30000 });
            assert.equal(restarted.status, 0, restarted.stderr + restarted.stdout);
        }
    }
    finally {
        await disconnect?.();
        await admin.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
        await admin.$disconnect();
        assert.equal(relative(resolve(root, '.local'), storage), schema);
        await rm(storage, { recursive: true, force: true });
        process.env.DATABASE_URL = original;
        delete process.env.DOCUMENT_STORAGE_DIR;
        delete process.env.RECORD_STORAGE_DIR;
    }
});
