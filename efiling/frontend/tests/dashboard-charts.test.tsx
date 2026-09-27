import { test } from 'node:test';
import React from 'react';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { DonutChart, StatusBarChart } from '../src/pages/DashboardCharts';

test('dashboard charts show an empty state without invalid geometry', () => {
  const items = [{ label: 'ยืนยันแล้ว', value: 0, color: '#24928c' }, { label: 'ค้าง', value: 0, color: '#e3a23e' }];
  for (const chart of [<DonutChart title="ผลการรับทราบ" items={items}/>, <StatusBarChart title="จำนวนตามขั้นงาน" items={items}/>]) {
    const html = renderToStaticMarkup(chart);
    assert.match(html, /ยังไม่มีข้อมูลสำหรับกราฟ/);
    assert.doesNotMatch(html, /NaN|Infinity/);
  }
});

test('dashboard charts expose values as labels and tooltips', () => {
  const items = [{ label: 'ยืนยันแล้ว', value: 3, color: '#24928c' }, { label: 'ค้าง', value: 1, color: '#e3a23e' }];
  const donut = renderToStaticMarkup(<DonutChart title="ผลการรับทราบ" items={items}/>);
  const bars = renderToStaticMarkup(<StatusBarChart title="จำนวนตามขั้นงาน" items={items}/>);
  assert.match(donut, /aria-label="ผลการรับทราบ: ทั้งหมด 4"/);
  assert.match(donut, /<title>ยืนยันแล้ว: 3<\/title>/);
  assert.match(donut, /dashboard-chart-legend/);
  assert.match(bars, /aria-label="ค้าง: 1"/);
  assert.match(bars, /title="ยืนยันแล้ว: 3"/);
});
