import { test } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DashboardPanels } from '../src/pages/DashboardPage';

test('dashboard keeps successful panels and marks a failed domain without zero metrics', () => {
  const html = renderToStaticMarkup(<DashboardPanels data={{
    aggregateOnly: false,
    unavailable: ['acknowledgements'],
    sections: {
      documents: { total: 7, published: 4, previousVersions: 2 },
      dars: { total: 3, open: 2, closed: 1 },
      records: { total: 5, withFiles: 2, files: 3 },
      audit: { rounds: 1, findings: 2, withOpenRequest: 1, withoutRequest: 1 },
      cars: { total: 2, open: 2, closed: 0, overdue: 1 },
    },
  }}/>);
  assert.match(html, /<h2>การรับทราบ<\/h2><p[^>]*>ไม่สามารถโหลดข้อมูลส่วนนี้ได้<\/p>/);
  assert.doesNotMatch(html, /<span>มอบหมาย<\/span>/);
  for (const title of ['เอกสาร', 'DAR', 'บันทึกและหลักฐาน', 'รอบตรวจและ Finding', 'CAR / NCR']) {
    assert.match(html, new RegExp(`<h2>${title.replace('/', '\\/')}</h2>`));
  }
  assert.match(html, /<span>ทะเบียนเอกสาร<\/span><strong>7<\/strong>/);
  assert.match(html, /href="#dar\?status=/);
  assert.match(html, /href="#cars\?overdue=1"/);
});

test('Sponsor has aggregate-only successful panels and safe failure text', () => {
  const html = renderToStaticMarkup(<DashboardPanels data={{
    aggregateOnly: true,
    unavailable: ['documents'],
    sections: { dars: { total: 3, open: 2, closed: 1, byStatus: { DAR_AWAITING_REVIEW: 3 } }, cars: { total: 1, open: 1, overdue: 1 } },
  }}/>);
  assert.match(html, /<h2>เอกสาร<\/h2><p[^>]*>ไม่สามารถโหลดข้อมูลส่วนนี้ได้<\/p>/);
  assert.match(html, /<h2>DAR<\/h2>/);
  assert.doesNotMatch(html, /href="#/);
  assert.doesNotMatch(html, /stack|exception|Prisma/i);
});
