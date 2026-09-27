// Runs against a disposable PostgreSQL schema, never resets the development data.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve, relative } from 'node:path';
import { readdir, rm } from 'node:fs/promises';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import request from 'supertest';

test('registry API: private files, pending review, rollback, duplicate protection and persistence', async () => {
  const root = fileURLToPath(new URL('../../',import.meta.url));
  dotenv.config({path:resolve(root,'.env'),quiet:true});
  assert.ok(process.env.DATABASE_URL,'Configure development DATABASE_URL before integration tests');
  const original = process.env.DATABASE_URL;
  const schema = `registry_test_${randomUUID().replaceAll('-','')}`;
  const storage = resolve(root,'.local',schema);
  const url = new URL(original); url.searchParams.set('schema',schema);
  process.env.DATABASE_URL = url.toString();
  process.env.DOCUMENT_STORAGE_DIR = storage;
  const admin = new PrismaClient({datasourceUrl:original});
  let disconnect: (()=>Promise<void>) | undefined;
  try {
    await admin.$executeRawUnsafe(`CREATE SCHEMA "${schema}"`);
    const migrate = spawnSync(process.execPath,['scripts/prisma.mjs','migrate','deploy'],{cwd:root,env:process.env,encoding:'utf8'});
    assert.equal(migrate.status,0,'migrations must apply to empty test schema');
    const {seedDemo} = await import('../../scripts/seed-demo.js');
    const {database,disconnectDatabase} = await import('../src/lib/prisma.js');
    disconnect = disconnectDatabase;
    await seedDemo();
    const {createApp} = await import('../src/app.js');
    const {dbUserId} = await import('../src/services/documentRules.js');
    const {checkDatabase} = await import('../src/lib/prisma.js');
    const app = createApp(checkDatabase);
    const agent = request.agent(app);
    const login = (who:string, target=agent) => target.post('/api/auth/login').set('X-EFiling-Client','web').send({email:`${who}@example.test`,password:'Demo1234!'});
    const pdf = Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\n%%EOF\n');
    const upload = (data:Record<string,string>, bytes=pdf, filename='test.pdf') => {
      let req = agent.post('/api/documents').set('X-EFiling-Client','web');
      for (const [key,value] of Object.entries(data)) req=req.field(key,value);
      return req.attach('file',bytes,{filename,contentType:'application/pdf'});
    };
    await request(app).get('/api/documents').expect(401);
    await login('reader').expect(200);
    await upload({title:'ไม่อนุญาต'}).expect(403);
    await login('dcc').expect(200);
    await upload({title:'ปลอม PDF'},Buffer.from('not pdf')).expect(400);
    await upload({title:'วันที่ผิด',effectiveDate:'2026-02-30'}).expect(400);
    assert.deepEqual(await readdir(resolve(storage,'incoming')),[],'invalid uploads must not remain');
    const first = await upload({title:'คู่มือทดสอบ',documentCode:'QM-2301-99',docType:'QM',reviewNotes:'ก'.repeat(4000)}).expect(201);
    const id = first.body.id; const fileId = first.body.fileId;
    const pending = await agent.get(`/api/documents/${id}`).expect(200);
    const version = pending.body.document.versions[0];
    assert.equal(pending.body.document.department?.nameTh,'สำนักงานคณบดีคณะวิศวกรรมศาสตร์','2301 automatically identifies the organization');
    assert.equal(pending.body.document.owner,null,'do not invent an owner from the organization code');
    assert.equal(version.reviewStatus,'PENDING'); assert.equal(version.revisionNo,null); assert.equal(version.effectiveDate,null);
    assert.ok(!JSON.stringify(pending.body).includes('storagePath'));
    await agent.get(`/api/documents/files/${fileId}`)
      .expect(200)
      .expect('Content-Type',/application\/pdf/)
      .expect('Content-Disposition',/^inline/)
      .expect(response => assert.ok(!response.headers['content-security-policy']?.includes('sandbox'),'inline PDF responses must not sandbox the browser PDF viewer'));
    await upload({title:'ซ้ำไฟล์',documentCode:'QM-2301-98',docType:'QM'}).expect(409);
    await upload({title:'ซ้ำรหัส',documentCode:'QM-2301-99',docType:'QM'},Buffer.concat([pdf,Buffer.from('different')])).expect(409);
    assert.equal(await database().documentFile.count(),1);
    assert.equal((await readdir(storage)).filter(n=>n.endsWith('.pdf')).length,1);
    await upload({title:'ล้มเหลว',ownerUserId:randomUUID()},Buffer.concat([pdf,Buffer.from('owner')])).expect(400);
    assert.equal((await readdir(storage)).filter(n=>n.endsWith('.pdf')).length,1,'transaction failure cleans permanent file');
    await login('qmr').expect(200); await agent.get(`/api/documents/${id}`).expect(200);
    await agent.patch(`/api/documents/versions/${version.id}`).set('X-EFiling-Client','web').send({title:'forged'}).expect(403);
    await login('reader').expect(200);
    assert.equal((await agent.get('/api/documents').expect(200)).body.documents.length,0);
    await agent.get(`/api/documents/${id}`).expect(404);
    await agent.get(`/api/documents/files/${fileId}?download=1`).expect(404);
    await login('dcc').expect(200);
    const patch = (value:Record<string,unknown>) => agent.patch(`/api/documents/versions/${version.id}`).set('X-EFiling-Client','web').send(value);
    await patch({title:'คู่มือทดสอบ',documentCode:'QM-2301-99',docType:'QM',reviewNotes:'ก'.repeat(4000)}).expect(200);
    await patch({title:'คู่มือทดสอบ',verified:true}).expect(400);
    const department = await database().department.findFirstOrThrow();
    await patch({title:'คู่มือทดสอบแก้ข้อมูล',documentCode:'QM-2301-99',docType:'QM',issueNo:1,revisionNo:0,effectiveDate:'2026-01-01',departmentId:department.id,ownerUserId:dbUserId('owner'),status:'DOC_PUBLISHED',verified:true}).expect(200);
    await patch({title:'แก้หลังยืนยัน'}).expect(409);
    const detail = (await agent.get(`/api/documents/${id}`).expect(200)).body;
    assert.equal(detail.history.length,3); assert.equal(detail.history[0].action,'UPDATE');
    assert.equal(detail.document.versions[0].reviewStatus,'VERIFIED');
    await login('reader').expect(200);
    assert.equal((await agent.get('/api/documents?q=แก้ข้อมูล&type=QM&status=verified').expect(200)).body.documents.length,1);
    assert.equal((await agent.get('/api/documents?status=pending').expect(200)).body.documents.length,0);
    await agent.get(`/api/documents/files/${fileId}?download=1`).expect(200).expect('Content-Disposition',/^attachment/);
    await login('dean').expect(200); await agent.get(`/api/documents/${id}`).expect(200);
    await login('deputy').expect(200); await agent.get(`/api/documents/${id}`).expect(404);
    await login('auditor').expect(200); await agent.get(`/api/documents/files/${fileId}`).expect(403);
    await login('dcc').expect(200);
    const central = await upload({title:'เอกสารกลาง',documentCode:'QP-2301-99',docType:'QP'},Buffer.concat([pdf,Buffer.from('central')])).expect(201);
    const centralVersion = await database().documentVersion.findFirstOrThrow({where:{documentId:central.body.id}});
    await database().documentVersion.update({where:{id:centralVersion.id},data:{reviewStatus:'VERIFIED',status:'DOC_PUBLISHED',sourceConfirmedAt:new Date(),sourceConfirmationNote:'ผู้รับผิดชอบยืนยันชุดกลางปัจจุบันในการทดสอบ'}});
    await login('reader').expect(200);
    const accepted = await agent.get(`/api/documents/${central.body.id}`).expect(200);
    assert.equal(accepted.body.document.versions[0].issueNo,null,'source confirmation must not invent issue number');
    await agent.get(`/api/documents/files/${central.body.fileId}`).expect(200);
    await login('dean').expect(200); await agent.get(`/api/documents/${central.body.id}`).expect(404);
    await login('dcc').expect(200);
    await agent.patch(`/api/documents/versions/${centralVersion.id}`).set('X-EFiling-Client','web').send({title:'เอกสารกลางเพิ่มข้อมูล',documentCode:'QP-2301-99',docType:'QP',status:'DOC_PUBLISHED'}).expect(200);
    assert.equal((await database().documentVersion.findUniqueOrThrow({where:{id:centralVersion.id}})).reviewStatus,'VERIFIED');
    await agent.patch(`/api/documents/versions/${centralVersion.id}`).set('X-EFiling-Client','web').send({title:'เอกสารกลาง',status:'DOC_OBSOLETE'}).expect(409);
    await database().$disconnect();
    const restarted = request.agent(createApp(checkDatabase));
    await login('dcc',restarted).expect(200);
    await restarted.get(`/api/documents/${id}`).expect(200);
    await restarted.get(`/api/documents/files/${fileId}`).expect(200);
    assert.equal(await database().documentImportSource.count(),0);
  } finally {
    await disconnect?.();
    await admin.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
    await admin.$disconnect();
    // Only remove the uniquely named, disposable test directory under this app's .local.
    assert.equal(relative(resolve(root,'.local'),storage),schema);
    await rm(storage,{recursive:true,force:true});
    process.env.DATABASE_URL=original;
    delete process.env.DOCUMENT_STORAGE_DIR;
  }
});
