import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app.js';

test('API stays available while database is unavailable and recovers without restart', async () => {
  let online = false;
  const app = createApp(async () => { if (!online) throw new Error('postgresql://secret:password@private'); });
  await request(app).get('/api/health').expect(200, { status: 'ok' });
  const failed = await request(app).get('/api/health/db').expect(503);
  assert.deepEqual(failed.body, { status: 'unavailable' });
  assert.ok(!failed.text.includes('password'));
  online = true;
  await request(app).get('/api/health/db').expect(200, { status: 'ok' });
  online = false;
  await request(app).get('/api/health/db').expect(503);
  await request(app).get('/api/health').expect(200);
});
