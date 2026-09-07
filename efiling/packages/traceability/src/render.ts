/**
 * สร้างรายการตรวจสอบสองรูปแบบจากแหล่งความจริงเดียวกัน
 *
 *   docs/CHECKLIST.md    เข้า git ดูส่วนต่างได้ทุกครั้งที่ความคืบหน้าเปลี่ยน
 *   docs/checklist.html  เปิดให้อาจารย์หรือกลุ่ม A ดู
 *
 * ทั้งสองไฟล์ห้ามแก้ด้วยมือ ให้แก้ที่ traceability.yaml หรือที่ความเห็น @trace
 * ในโค้ดแล้วรัน `npm run trace` ใหม่
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import { scanForTraces, statusByCode, type CodeStatus } from './scan.js';

const here = dirname(fileURLToPath(import.meta.url));
const monorepoRoot = resolve(here, '../../..');
const yamlPath = resolve(here, '../traceability.yaml');
const docsDir = resolve(monorepoRoot, 'docs');

interface UseCase {
  id: string;
  name: string;
  primaryActors: string[];
  ownerGroup: string;
  requirements: string[];
  acceptance: string[];
}
interface Requirement {
  id: string;
  text: string;
  priority: string;
  group: string;
  useCases: string[];
}
interface BusinessRequirement {
  id: string;
  text: string;
  requirements: string[];
  useCases: string[];
}
interface Objective {
  text: string;
  source: string;
  group: string;
  useCases: string[];
}
interface AcceptanceCriterion {
  id: string;
  given: string;
  when: string;
  then: string;
  useCases: string[];
}

interface TraceDoc {
  objectives: Record<string, Objective>;
  stakeholders: Record<string, { name: string; authorityBoundary: string }>;
  businessRequirements: Record<string, BusinessRequirement>;
  requirements: Record<string, Requirement>;
  useCases: Record<string, UseCase>;
  acceptance: Record<string, AcceptanceCriterion>;
}

const doc = parse(readFileSync(yamlPath, 'utf8')) as TraceDoc;

const hits = scanForTraces(
  [resolve(monorepoRoot, 'apps'), resolve(monorepoRoot, 'packages')],
  monorepoRoot,
  { exclude: ['packages/traceability/'] },
);
const status = statusByCode(hits);

const NOT_STARTED: CodeStatus = { status: 'ยังไม่ได้ทำ', sourceFiles: [], testFiles: [] };
const statusOf = (code: string): CodeStatus => status.get(code) ?? NOT_STARTED;

const MARK: Record<string, string> = {
  'ยังไม่ได้ทำ': '⬜',
  'มีโค้ดแล้ว': '🟡',
  'มีเทสต์แล้ว': '✅',
};

/* ---------- สายโยงย้อนกลับ ---------- */

/** วัตถุประสงค์ที่กรณีการใช้งานนี้รองรับ — ว่างได้เมื่อยังไม่มีเอกสารรองรับ */
const objectivesByUseCase = new Map<string, string[]>();
for (const [id, obj] of Object.entries(doc.objectives)) {
  for (const uc of obj.useCases) {
    objectivesByUseCase.set(uc, [...(objectivesByUseCase.get(uc) ?? []), id]);
  }
}

const brByUseCase = new Map<string, string[]>();
for (const br of Object.values(doc.businessRequirements)) {
  for (const uc of br.useCases) {
    brByUseCase.set(uc, [...(brByUseCase.get(uc) ?? []), br.id]);
  }
}

const NO_OBJECTIVE = 'ยังไม่มีเอกสารวัตถุประสงค์รองรับ';

function objectiveCell(ucId: string): string {
  const list = objectivesByUseCase.get(ucId);
  if (list?.length) return list.join(', ');
  const group = doc.useCases[ucId]?.ownerGroup;
  return group === 'A' ? `${NO_OBJECTIVE} (กลุ่ม A)` : NO_OBJECTIVE;
}

/* ---------- สรุปตัวเลข ---------- */

function tally(codes: string[]) {
  const counts = { 'ยังไม่ได้ทำ': 0, 'มีโค้ดแล้ว': 0, 'มีเทสต์แล้ว': 0 };
  for (const c of codes) counts[statusOf(c).status]++;
  return counts;
}

const ucIds = Object.keys(doc.useCases).sort();
const frIds = Object.keys(doc.requirements).sort();
const acIds = Object.keys(doc.acceptance).sort();
const summary = {
  useCases: tally(ucIds),
  requirements: tally(frIds),
  acceptance: tally(acIds),
};

/* ---------- Markdown ---------- */

function markdown(): string {
  const out: string[] = [];
  const now = new Date().toISOString().slice(0, 10);

  out.push('# รายการตรวจสอบความคืบหน้าและการสอบกลับ', '');
  out.push(
    '> ไฟล์นี้สร้างด้วย `npm run trace` จาก `packages/traceability/traceability.yaml`',
    '> และผลสแกนความเห็น `@trace` ในโค้ดจริง **ห้ามแก้ด้วยมือ**',
    '',
  );
  out.push(`สร้างเมื่อ ${now} · สัญลักษณ์ ⬜ ยังไม่ได้ทำ · 🟡 มีโค้ดแล้ว · ✅ มีเทสต์แล้ว`, '');

  out.push('## สรุป', '');
  out.push('| หมวด | ทั้งหมด | ⬜ | 🟡 | ✅ |');
  out.push('|---|---:|---:|---:|---:|');
  for (const [label, ids, t] of [
    ['กรณีการใช้งาน', ucIds, summary.useCases],
    ['ความต้องการเชิงหน้าที่', frIds, summary.requirements],
    ['เกณฑ์การยอมรับ', acIds, summary.acceptance],
  ] as const) {
    out.push(`| ${label} | ${ids.length} | ${t['ยังไม่ได้ทำ']} | ${t['มีโค้ดแล้ว']} | ${t['มีเทสต์แล้ว']} |`);
  }
  out.push('');

  out.push('## กรณีการใช้งาน พร้อมสายโยงกลับไปต้นทาง', '');
  out.push('| | รหัส | ชื่อ | กลุ่ม | ผู้กระทำหลัก | วัตถุประสงค์ | ความต้องการเชิงธุรกิจ | ความต้องการเชิงหน้าที่ | เกณฑ์การยอมรับ |');
  out.push('|---|---|---|---|---|---|---|---|---|');
  for (const id of ucIds) {
    const uc = doc.useCases[id]!;
    const s = statusOf(id);
    out.push(
      `| ${MARK[s.status]} | ${id} | ${uc.name} | ${uc.ownerGroup} | ${uc.primaryActors.join(' / ')} | ${objectiveCell(id)} | ${(brByUseCase.get(id) ?? []).join(', ') || '—'} | ${uc.requirements.join(', ') || '—'} | ${uc.acceptance.join(', ') || '—'} |`,
    );
  }
  out.push('');

  out.push('## ความต้องการเชิงหน้าที่', '');
  out.push('| | รหัส | ข้อกำหนด | กลุ่ม | ลำดับความสำคัญ | กรณีการใช้งาน |');
  out.push('|---|---|---|---|---|---|');
  for (const id of frIds) {
    const fr = doc.requirements[id]!;
    const s = statusOf(id);
    out.push(
      `| ${MARK[s.status]} | ${id} | ${fr.text} | ${fr.group} | ${fr.priority} | ${fr.useCases.join(', ') || '—'} |`,
    );
  }
  out.push('');

  out.push('## ความต้องการเชิงธุรกิจ', '');
  out.push('| รหัส | ข้อกำหนด | ความต้องการเชิงหน้าที่ | กรณีการใช้งาน |');
  out.push('|---|---|---|---|');
  for (const id of Object.keys(doc.businessRequirements).sort()) {
    const br = doc.businessRequirements[id]!;
    out.push(`| ${id} | ${br.text} | ${br.requirements.join(', ')} | ${br.useCases.join(', ')} |`);
  }
  out.push('');

  out.push('## เกณฑ์การยอมรับ', '');
  out.push('| | รหัส | เมื่อ (Given) | เมื่อทำ (When) | ต้องได้ (Then) | กรณีการใช้งาน |');
  out.push('|---|---|---|---|---|---|');
  for (const id of acIds) {
    const ac = doc.acceptance[id]!;
    out.push(
      `| ${MARK[statusOf(id).status]} | ${id} | ${ac.given} | ${ac.when} | ${ac.then} | ${ac.useCases.join(', ') || '—'} |`,
    );
  }
  out.push('');

  out.push('## ผู้มีส่วนได้ส่วนเสีย', '');
  out.push('| ผู้มีส่วนได้ส่วนเสีย | ขอบเขตอำนาจ |');
  out.push('|---|---|');
  for (const [key, sh] of Object.entries(doc.stakeholders)) {
    out.push(`| ${sh.name || key} | ${sh.authorityBoundary} |`);
  }
  out.push('');

  const missingObjective = ucIds.filter((id) => !objectivesByUseCase.get(id)?.length);
  if (missingObjective.length) {
    out.push('## ช่องว่างที่ยังปิดไม่ได้', '');
    out.push(
      `กรณีการใช้งาน ${missingObjective.length} รายการยังไม่มีวัตถุประสงค์รองรับ ได้แก่ ${missingObjective.join(', ')}`,
      '',
      'สาเหตุคือ `SRS_A+B.md` ไม่มีหัวข้อวัตถุประสงค์ วัตถุประสงค์ที่มีเอกสารรองรับคือ',
      'ข้อ 1.2.1 ถึง 1.2.4 ในบทที่ 1 ของกลุ่ม B เท่านั้น ส่วนของกลุ่ม A ยังไม่มีเอกสาร',
      'ในที่เก็บนี้ ช่องนี้จึงเว้นไว้ตามความจริง ไม่เติมด้วยการเดา',
      '',
    );
  }

  return out.join('\n');
}

/* ---------- HTML ---------- */

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function html(): string {
  const now = new Date().toISOString().slice(0, 10);
  const badge = (code: string) => {
    const s = statusOf(code).status;
    const cls = s === 'มีเทสต์แล้ว' ? 'done' : s === 'มีโค้ดแล้ว' ? 'wip' : 'todo';
    return `<span class="badge ${cls}">${s}</span>`;
  };

  const ucRows = ucIds
    .map((id) => {
      const uc = doc.useCases[id]!;
      const files = statusOf(id).sourceFiles.concat(statusOf(id).testFiles);
      return `<tr>
      <td>${badge(id)}</td>
      <td><code>${id}</code></td>
      <td>${escapeHtml(uc.name)}<div class="files">${files.map((f) => `<code>${escapeHtml(f)}</code>`).join(' ') || ''}</div></td>
      <td>${escapeHtml(uc.ownerGroup)}</td>
      <td>${escapeHtml(uc.primaryActors.join(' / '))}</td>
      <td class="${objectivesByUseCase.get(id)?.length ? '' : 'gap'}">${escapeHtml(objectiveCell(id))}</td>
      <td>${(brByUseCase.get(id) ?? []).join(', ') || '—'}</td>
      <td>${uc.requirements.join(', ') || '—'}</td>
      <td>${uc.acceptance.join(', ') || '—'}</td>
    </tr>`;
    })
    .join('\n');

  const frRows = frIds
    .map((id) => {
      const fr = doc.requirements[id]!;
      return `<tr>
      <td>${badge(id)}</td>
      <td><code>${id}</code></td>
      <td>${escapeHtml(fr.text)}</td>
      <td>${escapeHtml(fr.group)}</td>
      <td>${escapeHtml(fr.priority)}</td>
      <td>${fr.useCases.join(', ') || '—'}</td>
    </tr>`;
    })
    .join('\n');

  const acRows = acIds
    .map((id) => {
      const ac = doc.acceptance[id]!;
      return `<tr>
      <td>${badge(id)}</td>
      <td><code>${id}</code></td>
      <td>${escapeHtml(ac.given)}</td>
      <td>${escapeHtml(ac.when)}</td>
      <td>${escapeHtml(ac.then)}</td>
      <td>${ac.useCases.join(', ') || '—'}</td>
    </tr>`;
    })
    .join('\n');

  const stat = (label: string, t: Record<string, number>, total: number) =>
    `<div class="stat"><h3>${label}</h3><div class="n">${t['มีเทสต์แล้ว']}<span>/${total}</span></div>
     <div class="bar"><i class="done" style="flex:${t['มีเทสต์แล้ว']}"></i><i class="wip" style="flex:${t['มีโค้ดแล้ว']}"></i><i class="todo" style="flex:${t['ยังไม่ได้ทำ']}"></i></div>
     <p>⬜ ${t['ยังไม่ได้ทำ']} · 🟡 ${t['มีโค้ดแล้ว']} · ✅ ${t['มีเทสต์แล้ว']}</p></div>`;

  return `<!doctype html>
<html lang="th">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>รายการตรวจสอบระบบ E-Filing</title>
<style>
  :root {
    --bg: #f8fafc; --panel: #ffffff; --ink: #0f172a; --muted: #64748b;
    --line: #e2e8f0; --done: #16a34a; --wip: #ca8a04; --todo: #cbd5e1; --gap: #dc2626;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
      --bg: #0f172a; --panel: #1e293b; --ink: #f1f5f9; --muted: #94a3b8;
      --line: #334155; --todo: #475569;
    }
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; padding: 2rem 1.25rem; background: var(--bg); color: var(--ink);
    font-family: "TH Sarabun New", Sarabun, "Segoe UI", Tahoma, sans-serif;
    font-size: 17px; line-height: 1.6;
  }
  main { max-width: 1400px; margin: 0 auto; }
  h1 { font-size: 1.9rem; margin: 0 0 .25rem; }
  h2 { font-size: 1.35rem; margin: 2.5rem 0 .75rem; padding-bottom: .4rem; border-bottom: 2px solid var(--line); }
  .lede { color: var(--muted); margin: 0 0 2rem; }
  .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 1rem; }
  .stat { background: var(--panel); border: 1px solid var(--line); border-radius: 12px; padding: 1rem 1.1rem; }
  .stat h3 { margin: 0 0 .35rem; font-size: .95rem; color: var(--muted); font-weight: 600; }
  .stat .n { font-size: 2rem; font-weight: 700; line-height: 1; }
  .stat .n span { font-size: 1rem; color: var(--muted); font-weight: 400; }
  .stat p { margin: .5rem 0 0; font-size: .85rem; color: var(--muted); }
  .bar { display: flex; height: 8px; border-radius: 99px; overflow: hidden; margin-top: .7rem; background: var(--todo); }
  .bar i.done { background: var(--done); } .bar i.wip { background: var(--wip); } .bar i.todo { background: var(--todo); }
  .scroll { overflow-x: auto; border: 1px solid var(--line); border-radius: 12px; background: var(--panel); }
  table { border-collapse: collapse; width: 100%; font-size: .93rem; }
  th, td { text-align: left; padding: .6rem .7rem; border-bottom: 1px solid var(--line); vertical-align: top; }
  th { background: var(--bg); font-weight: 600; white-space: nowrap; position: sticky; top: 0; }
  tr:last-child td { border-bottom: 0; }
  code { font-family: ui-monospace, "Cascadia Code", Consolas, monospace; font-size: .85em; }
  .files { margin-top: .3rem; }
  .files code { color: var(--muted); font-size: .78em; display: block; }
  .badge { display: inline-block; padding: .15rem .5rem; border-radius: 99px; font-size: .78rem; white-space: nowrap; color: #fff; }
  .badge.done { background: var(--done); } .badge.wip { background: var(--wip); }
  .badge.todo { background: var(--todo); color: var(--ink); }
  td.gap { color: var(--gap); }
  .note { background: var(--panel); border: 1px solid var(--line); border-left: 4px solid var(--gap); border-radius: 8px; padding: 1rem 1.1rem; }
  footer { margin-top: 3rem; color: var(--muted); font-size: .85rem; }
</style>
</head>
<body>
<main>
  <h1>รายการตรวจสอบระบบ E-Filing</h1>
  <p class="lede">
    สถานะมาจากการสแกนความเห็น <code>@trace</code> ในโค้ดจริง ไม่ได้พิมพ์ด้วยมือ ·
    สร้างเมื่อ ${now}
  </p>

  <div class="stats">
    ${stat('กรณีการใช้งาน', summary.useCases, ucIds.length)}
    ${stat('ความต้องการเชิงหน้าที่', summary.requirements, frIds.length)}
    ${stat('เกณฑ์การยอมรับ', summary.acceptance, acIds.length)}
  </div>

  <h2>กรณีการใช้งาน พร้อมสายโยงกลับไปต้นทาง</h2>
  <div class="scroll"><table>
    <thead><tr><th>สถานะ</th><th>รหัส</th><th>ชื่อ</th><th>กลุ่ม</th><th>ผู้กระทำหลัก</th><th>วัตถุประสงค์</th><th>ความต้องการเชิงธุรกิจ</th><th>ความต้องการเชิงหน้าที่</th><th>เกณฑ์การยอมรับ</th></tr></thead>
    <tbody>${ucRows}</tbody>
  </table></div>

  <h2>ความต้องการเชิงหน้าที่</h2>
  <div class="scroll"><table>
    <thead><tr><th>สถานะ</th><th>รหัส</th><th>ข้อกำหนด</th><th>กลุ่ม</th><th>ลำดับความสำคัญ</th><th>กรณีการใช้งาน</th></tr></thead>
    <tbody>${frRows}</tbody>
  </table></div>

  <h2>เกณฑ์การยอมรับ</h2>
  <div class="scroll"><table>
    <thead><tr><th>สถานะ</th><th>รหัส</th><th>เมื่อ</th><th>เมื่อทำ</th><th>ต้องได้</th><th>กรณีการใช้งาน</th></tr></thead>
    <tbody>${acRows}</tbody>
  </table></div>

  <h2>ช่องว่างที่ยังปิดไม่ได้</h2>
  <div class="note">
    <p><strong>วัตถุประสงค์ของกรณีการใช้งานฝั่งกลุ่ม A ยังไม่มีเอกสารรองรับ</strong></p>
    <p>
      <code>SRS_A+B.md</code> ไม่มีหัวข้อวัตถุประสงค์ วัตถุประสงค์ที่มีเอกสารรองรับคือ
      ข้อ 1.2.1 ถึง 1.2.4 ในบทที่ 1 ของกลุ่ม B เท่านั้น ช่องนี้จึงเว้นไว้ตามความจริง
      ไม่เติมด้วยการเดา
    </p>
  </div>

  <footer>
    สร้างด้วย <code>npm run trace</code> · แหล่งความจริงคือ
    <code>packages/traceability/traceability.yaml</code> และความเห็น <code>@trace</code> ในโค้ด
  </footer>
</main>
</body>
</html>`;
}

mkdirSync(docsDir, { recursive: true });
writeFileSync(resolve(docsDir, 'CHECKLIST.md'), markdown(), 'utf8');
writeFileSync(resolve(docsDir, 'checklist.html'), html(), 'utf8');

console.log('สร้างรายการตรวจสอบแล้ว');
console.log(`  docs/CHECKLIST.md`);
console.log(`  docs/checklist.html`);
console.log(
  `  กรณีการใช้งาน ${summary.useCases['มีเทสต์แล้ว']} ✅ / ${summary.useCases['มีโค้ดแล้ว']} 🟡 / ${summary.useCases['ยังไม่ได้ทำ']} ⬜ จาก ${ucIds.length}`,
);
console.log(
  `  ความต้องการ ${summary.requirements['มีเทสต์แล้ว']} ✅ / ${summary.requirements['มีโค้ดแล้ว']} 🟡 / ${summary.requirements['ยังไม่ได้ทำ']} ⬜ จาก ${frIds.length}`,
);
