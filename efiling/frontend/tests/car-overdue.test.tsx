import { test } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DueCell } from '../src/pages/CarPage';

test('overdue activity shows recorded due date, responsible person and calendar days', () => {
  const html = renderToStaticMarkup(<DueCell due={{ state: 'OVERDUE', nextDueDate: '2026-09-01', overdueWork: [{ activityId: 'a1', description: 'ตรวจฉบับ', dueDate: '2026-09-01', responsible: { id: 'u1', fullName: 'ผู้รับผิดชอบทดสอบ' }, waitingRole: 'ผู้รับผิดชอบกิจกรรม', daysOverdue: 26 }] }}/>);
  assert.match(html, /เกินกำหนด/);
  assert.match(html, /ตรวจฉบับ/);
  assert.match(html, /2026-09-01/);
  assert.match(html, /26 วันปฏิทิน/);
  assert.match(html, /ผู้รับผิดชอบทดสอบ/);
});

test('missing and completed due work do not show a false overdue marker', () => {
  for (const state of ['NO_DUE_DATE', 'NO_ACTIVE_WORK', 'NOT_ACTIVE']) {
    const html = renderToStaticMarkup(<DueCell due={{ state, nextDueDate: null, overdueWork: [] }}/>);
    assert.doesNotMatch(html, /เกินกำหนด/);
    assert.doesNotMatch(html, /<strong>0<\/strong>/);
  }
});
