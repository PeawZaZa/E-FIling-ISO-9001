import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app.js';

const expected: Record<string, string[]> = {
 dcc: ['documents','dar','ack','records','audit','cars','dashboard'],
 owner: ['documents','dar','ack'], reviewer: ['documents','dar','ack'],
 qmr: ['documents','dar','ack','records','audit','cars','dashboard'],
 reader: ['documents','ack'], auditor: ['records','audit','cars','dashboard'],
 carowner: ['records','audit','cars'], registrar: ['documents','dar','ack'],
 sponsor: ['dashboard'], deputy: ['documents','dar','ack','records','audit','cars','dashboard'],
 sectionhead: ['audit','cars'], lead: ['records','audit','cars','dashboard'],
 assistant: ['records','cars'], dean: ['documents','dar','ack'],
};
const login = (agent: ReturnType<typeof request.agent>, id: string) => agent.post('/api/auth/login')
 .set('X-EFiling-Client','web').send({ email: `${id}@example.test`, password: 'Demo1234!' });

test('14 distinct demo accounts expose only public identity', async () => {
 const r = await request(createApp(async()=>{})).get('/api/auth/demo-accounts').expect(200);
 assert.equal(r.body.accounts.length,14);
 assert.equal(new Set(r.body.accounts.map((a: {id:string})=>a.id)).size,14);
 assert.ok(!r.text.includes('password'));
});

test('every role receives its own menus and API enforces all 98 access combinations', async () => {
 const app = createApp(async()=>{});
 for (const [id, menus] of Object.entries(expected)) {
  const agent = request.agent(app);
  const result = await login(agent,id).expect(200);
  assert.equal(result.body.user.id,id);
  assert.deepEqual(result.body.menus.map((m:{id:string})=>m.id),menus);
  for (const key of expected.dcc) await agent.get(`/api/modules/${key}/access`).expect(menus.includes(key)?200:403);
 }
});

test('rejects anonymous, forged identity, wrong credentials and missing request header', async () => {
 const app=createApp(async()=>{});
 await request(app).get('/api/auth/me').expect(401);
 await request(app).get('/api/modules/documents/access').set('X-Role','dcc').expect(401);
 await request(app).post('/api/auth/login').send({email:'dcc@example.test',password:'Demo1234!'}).expect(403);
 await request(app).post('/api/auth/login').set('X-EFiling-Client','web').send({email:'dcc@example.test',password:'wrong'}).expect(401);
 await request(app).post('/api/auth/login').set('X-EFiling-Client','web').send({email:[],password:{}}).expect(400);
});

test('switch rotates session, ignores supplied role, refresh persists and logout revokes cookie', async () => {
 const app=createApp(async()=>{}); const agent=request.agent(app);
 const first=await login(agent,'dcc').expect(200);
 const cookie=(first.headers['set-cookie'] as unknown as string[])[0];
 assert.match(cookie,/HttpOnly/i); assert.match(cookie,/SameSite=Strict/i);
 const oldCookie=cookie.split(';')[0];
 await agent.get('/api/auth/me').expect(200);
 await agent.post('/api/auth/login').set('X-EFiling-Client','web').send({email:'reader@example.test',password:'Demo1234!',role:'dcc'}).expect(200);
 await request(app).get('/api/auth/me').set('Cookie',oldCookie).expect(401);
 await agent.get('/api/modules/dar/access').expect(403);
 const current=await agent.get('/api/auth/me').expect(200); assert.equal(current.body.user.id,'reader');
 await agent.post('/api/auth/logout').set('X-EFiling-Client','web').expect(204);
 await agent.get('/api/auth/me').expect(401);
});
