import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseDocumentInput, documentScope } from '../src/services/documentRules.js';

test('pending imports preserve unknown metadata, never fabricate revision/date/status', () => {
  const value = parseDocumentInput({title:'เอกสารเดิม',documentCode:'QP-2301-0107',docType:'QP'});
  assert.equal(value.issueNo,null); assert.equal(value.revisionNo,null);
  assert.equal(value.effectiveDate,null); assert.equal(value.status,null);
  assert.equal(value.verified,false);
});
test('rejects malformed dates, numbers, types and incomplete verification', () => {
  for (const fields of [{issueNo:'-1'},{revisionNo:'1.2'},{effectiveDate:'2026-02-30'}, {docType:'EXE'}, {verified:true}]) {
    assert.throws(()=>parseDocumentInput({title:'test',...fields}));
  }
});
test('document scope excludes pending versions except DCC/QMR; deputy has no delegated imports', () => {
  assert.deepEqual(documentScope('dcc'),{});
  assert.deepEqual(documentScope('qmr'),{});
  assert.match(JSON.stringify(documentScope('reader')),/VERIFIED/);
  assert.match(JSON.stringify(documentScope('dean')),/QM/);
  assert.match(JSON.stringify(documentScope('deputy')),/in/);
  assert.throws(()=>documentScope('sponsor'));
});
