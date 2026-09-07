import assert from 'node:assert/strict';
import { test } from 'node:test';
import { findActivePath } from '../src/lib/active-nav.ts';

const paths = [
  '/documents',
  '/documents/new',
  '/documents/publish',
  '/documents/obsolete',
  '/dar',
  '/dar/new',
  '/cars',
  '/cars/new',
  '/records',
  '/audit-trail',
];

test('เส้นทางที่ตรงกันเป๊ะเป็นตัวที่ทำงานอยู่', () => {
  assert.equal(findActivePath(paths, '/records'), '/records');
});

test('เส้นทางลูกต้องไม่ทำให้เส้นทางแม่ทำงานไปด้วย', () => {
  // นี่คือข้อผิดพลาดที่ผู้ใช้แจ้ง กดสร้างเอกสารแล้วค้นหาเอกสารติดไปด้วย
  assert.equal(findActivePath(paths, '/documents/new'), '/documents/new');
  assert.equal(findActivePath(paths, '/dar/new'), '/dar/new');
  assert.equal(findActivePath(paths, '/cars/new'), '/cars/new');
});

test('หน้ารายละเอียดที่ไม่มีเมนูของตัวเองให้เมนูแม่ทำงานแทน', () => {
  // เช่น เปิดใบคำร้องรายใบ ต้องยังเห็นว่าอยู่ในหมวดติดตามใบคำร้อง
  assert.equal(findActivePath(paths, '/cars/cmt123abc'), '/cars');
  assert.equal(findActivePath(paths, '/documents/QP-2301-0107/revisions'), '/documents');
});

test('เส้นทางที่ไม่มีในเมนูไม่ทำให้เมนูใดทำงาน', () => {
  assert.equal(findActivePath(paths, '/'), undefined);
  assert.equal(findActivePath(paths, '/unknown'), undefined);
});

test('ชื่อเส้นทางที่ขึ้นต้นเหมือนกันแต่คนละหน้าต้องไม่ชนกัน', () => {
  // /documents ต้องไม่ทำงานเมื่ออยู่ที่ /documents-archive
  assert.equal(findActivePath(paths, '/documents-archive'), undefined);
});
