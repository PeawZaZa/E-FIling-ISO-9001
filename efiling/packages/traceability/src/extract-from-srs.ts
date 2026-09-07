/**
 * สกัดสายโยงความต้องการจาก `SRS_A+B.md` มาเป็น `traceability.yaml`
 *
 * เขียนเป็นสคริปต์แทนการพิมพ์มือ เพราะข้อมูลมีหลายร้อยรายการ
 * และต้องตรงกับเอกสารต้นทางเป๊ะ ๆ ถ้าเอกสารรวมมีเวอร์ชันใหม่ให้รันซ้ำ
 * แล้วดูส่วนต่างด้วย git diff จะเห็นทันทีว่าอะไรเปลี่ยน
 *
 * สคริปต์นี้เติมได้เฉพาะสิ่งที่มีอยู่จริงในเอกสาร ช่องที่เอกสารไม่มีข้อมูล
 * จะถูกทำเครื่องหมายไว้ให้เติมด้วยมือ ไม่เดาแทน
 *
 *   npm run extract --workspace=@efiling/traceability
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { stringify } from 'yaml';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../../../..');
const srsPath = resolve(repoRoot, 'SRS_A+B.md');
const outPath = resolve(here, '../traceability.yaml');

const srs = readFileSync(srsPath, 'utf8');
const lines = srs.split(/\r?\n/);

/** ตัดตัวหนาและช่องว่างหัวท้ายออกจากช่องในตาราง */
function clean(cell: string): string {
  return cell.replace(/\*\*/g, '').replace(/`/g, '').trim();
}

/** แยกแถวตารางมาร์กดาวน์เป็นรายช่อง */
function cells(line: string): string[] {
  if (!line.trim().startsWith('|')) return [];
  return line.split('|').slice(1, -1).map(clean);
}

/**
 * ขยายการเขียนแบบย่อให้เป็นรายการรหัสเต็ม
 * รองรับ "FR-A01..A03", "FR-B11..13", "FR-A10/A11", "UC-10, UC-11"
 */
function expandCodes(raw: string): string[] {
  const out = new Set<string>();
  // เอกสารเขียนย่อโดยละคำนำหน้าไว้ในฐานที่เข้าใจ เช่น "FR-A04, A07, A08"
  // จึงต้องจำคำนำหน้าล่าสุดไว้เติมให้รหัสที่ตามมา
  let lastKind = '';
  let lastPrefix = '';

  for (const chunk of raw.split(/[,;·]/)) {
    const part = chunk.trim();
    if (!part) continue;

    const bare = part.match(/^([A-Z]{1,2})?(\d+)$/);
    if (bare && lastKind) {
      out.add(`${lastKind}-${bare[1] ?? lastPrefix}${bare[2]}`);
      continue;
    }

    const kindMatch = part.match(/\b(FR|UC|AC|BR)-([A-Z]{0,2})/);
    if (kindMatch) {
      lastKind = kindMatch[1]!;
      lastPrefix = kindMatch[2]!;
    }

    const range = part.match(/^(FR|UC|AC|BR)-([A-Z]{0,2})(\d+)\.\.\s*([A-Z]{0,2})(\d+)$/);
    if (range) {
      const [, kind, prefix, from, , to] = range;
      const width = from!.length;
      for (let i = Number(from); i <= Number(to); i++) {
        out.add(`${kind}-${prefix}${String(i).padStart(width, '0')}`);
      }
      continue;
    }

    const slash = part.match(/^(FR|UC|AC|BR)-([A-Z]{0,2})(\d+)((?:\/[A-Z]{0,2}\d+)+)$/);
    if (slash) {
      const [, kind, prefix, first, rest] = slash;
      out.add(`${kind}-${prefix}${first}`);
      for (const tail of rest!.split('/').filter(Boolean)) {
        const m = tail.match(/^([A-Z]{0,2})(\d+)$/);
        if (m) out.add(`${kind}-${m[1] || prefix}${m[2]}`);
      }
      continue;
    }

    const single = part.match(/\b(FR-[A-Z]{0,2}\d+|UC-\d+|AC-\d+|BR-\d+)\b/);
    if (single) out.add(single[1]!);
  }
  return [...out].sort();
}

/** เก็บแถวของตารางที่อยู่ระหว่างสองหัวข้อ */
function tableRowsBetween(startPattern: RegExp, endPattern: RegExp): string[][] {
  const start = lines.findIndex((l) => startPattern.test(l));
  if (start < 0) throw new Error(`หาจุดเริ่มไม่พบ: ${startPattern}`);
  const rest = lines.slice(start + 1);
  const endRel = rest.findIndex((l) => endPattern.test(l));
  const block = endRel < 0 ? rest : rest.slice(0, endRel);
  return block
    .map(cells)
    .filter((c) => c.length > 1 && !/^:?-{3,}/.test(c[0] ?? ''));
}

/* ---------- 1. กรณีการใช้งาน จาก Use Case Summary ---------- */

interface UseCaseEntry {
  id: string;
  name: string;
  primaryActors: string[];
  ownerGroup: string;
  requirements: string[];
  acceptance: string[];
}

const useCases: Record<string, UseCaseEntry> = {};
for (const row of tableRowsBetween(/^### Use Case Summary/, /^> ระบบมีแนวคิด/)) {
  const [id, name, actors, group, frs] = row;
  if (!id || !/^UC-\d+$/.test(id)) continue;
  useCases[id] = {
    id,
    name: name ?? '',
    primaryActors: (actors ?? '').split('/').map((s) => s.trim()).filter(Boolean),
    ownerGroup: group ?? '',
    requirements: expandCodes(frs ?? ''),
    acceptance: [],
  };
}

/* ---------- 2. ความต้องการเชิงธุรกิจ จาก Appendix E.1 ---------- */

interface BusinessRequirement {
  id: string;
  text: string;
  requirements: string[];
  useCases: string[];
}

const businessRequirements: Record<string, BusinessRequirement> = {};
for (const row of tableRowsBetween(/^### E\.1 Business Requirement/, /^> _หมายเหตุ: ตาราง E\.1/)) {
  const [id, text, frs, ucs] = row;
  if (!id || !/^BR-\d+$/.test(id)) continue;
  businessRequirements[id] = {
    id,
    text: text ?? '',
    requirements: expandCodes(frs ?? ''),
    useCases: expandCodes(ucs ?? ''),
  };
}

/* ---------- 3. เกณฑ์การยอมรับ จาก Appendix D ---------- */

interface AcceptanceCriterion {
  id: string;
  given: string;
  when: string;
  then: string;
  requirements: string[];
  useCases: string[];
}

const acceptance: Record<string, AcceptanceCriterion> = {};
for (const row of tableRowsBetween(/^## Appendix D: Acceptance Criteria/, /^#### Negative \/ Boundary/)) {
  const [id, given, when, then, coverage] = row;
  if (!id || !/^AC-\d+$/.test(id)) continue;
  const ucs = expandCodes(coverage ?? '');
  acceptance[id] = {
    id,
    given: given ?? '',
    when: when ?? '',
    then: then ?? '',
    requirements: ucs.filter((c) => c.startsWith('FR-')),
    useCases: ucs.filter((c) => c.startsWith('UC-')),
  };
  for (const uc of acceptance[id]!.useCases) {
    useCases[uc]?.acceptance.push(id);
  }
}

/* ---------- 4. ความต้องการเชิงหน้าที่ จากทุกตาราง Requirements & Verification ---------- */

interface Requirement {
  id: string;
  text: string;
  priority: string;
  group: 'A' | 'B' | 'Shared';
  useCases: string[];
}

const requirements: Record<string, Requirement> = {};

function groupOf(id: string): 'A' | 'B' | 'Shared' {
  if (id.startsWith('FR-A')) return 'A';
  if (id.startsWith('FR-B')) return 'B';
  return 'Shared';
}

/**
 * ผูกความต้องการเข้ากับกรณีการใช้งานที่นิยามมัน
 *
 * ตาราง Use Case Summary ไม่ได้ระบุความต้องการครบทุกตัว เช่น FR-A12
 * ถูกนิยามอยู่ในหัวข้อ 4.13 (UC-13) แต่ไม่ปรากฏในคอลัมน์ Related FR
 * จึงต้องดูจากหัวข้อที่ความต้องการนั้นถูกนิยามไว้ด้วย
 */
const definedUnderUseCase = new Map<string, string>();
let currentUseCaseSection = '';

for (const line of lines) {
  const heading = line.match(/^### 4\.\d+ .* — (UC-\d+)\s*$/);
  if (heading) currentUseCaseSection = heading[1]!;
  else if (/^## \d/.test(line)) currentUseCaseSection = '';

  const row = cells(line);
  const id = row[0];
  if (!id || !/^FR-(A|B|SH)\d+$/.test(id)) continue;
  if (currentUseCaseSection && !definedUnderUseCase.has(id)) {
    definedUnderUseCase.set(id, currentUseCaseSection);
  }
  // ตารางในหัวข้อ 4 มีสี่ช่อง (ID, Requirement, Priority, Verification)
  // ตารางในหัวข้อ 5.3 มีสามช่อง (ID, Requirement, Verification)
  const text = row[1] ?? '';
  const priority = row.length >= 4 ? (row[2] ?? '') : 'Must';
  if (!requirements[id] || text.length > requirements[id]!.text.length) {
    requirements[id] = { id, text, priority, group: groupOf(id), useCases: [] };
  }
}

// ผูกความต้องการกลับไปยังกรณีการใช้งานที่อ้างถึงมันในตารางสรุป
for (const uc of Object.values(useCases)) {
  for (const fr of uc.requirements) {
    requirements[fr]?.useCases.push(uc.id);
  }
}

// เติมความต้องการที่ตารางสรุปไม่ได้ระบุ แต่ถูกนิยามอยู่ใต้หัวข้อของกรณีการใช้งาน
for (const [fr, uc] of definedUnderUseCase) {
  const req = requirements[fr];
  if (req && !req.useCases.includes(uc)) {
    req.useCases.push(uc);
    useCases[uc]?.requirements.push(fr);
  }
}
for (const uc of Object.values(useCases)) {
  uc.requirements = [...new Set(uc.requirements)].sort();
}
for (const req of Object.values(requirements)) {
  req.useCases = [...new Set(req.useCases)].sort();
}

/* ---------- 5. ผู้มีส่วนได้ส่วนเสีย จาก §2.3 ---------- */

const stakeholders: Record<string, { name: string; authorityBoundary: string }> = {};
for (const row of tableRowsBetween(/^### 2\.3 User Classes/, /^> \*\*ปรับปรุง \(v0\.3\)/)) {
  const [actor, , boundary] = row;
  if (!actor || actor.startsWith('Actor')) continue;
  const key = actor.split('(')[0]!.trim();
  stakeholders[key] = { name: actor, authorityBoundary: boundary ?? '' };
}

/* ---------- 6. วัตถุประสงค์ — มีเอกสารรองรับเฉพาะฝั่งกลุ่ม B ---------- */

const objectives = {
  'OBJ-1.2.1': {
    text: 'พัฒนาระบบจัดเก็บบันทึกข้อมูลและหลักฐานที่เกี่ยวข้องกับระบบบริหารงานคุณภาพในฐานข้อมูลกลาง',
    source: 'บทที่ 1 ข้อ 1.2.1 และแบบเสนอหัวข้อ SE02 ข้อ 11.1',
    group: 'B',
    useCases: ['UC-08'],
  },
  'OBJ-1.2.2': {
    text: 'พัฒนาระบบบันทึกประเด็นที่พบจากการตรวจติดตาม พร้อมหลักฐานอ้างอิง และสรุปผลการตรวจติดตามภายในเบื้องต้น',
    source: 'บทที่ 1 ข้อ 1.2.2 และแบบเสนอหัวข้อ SE02 ข้อ 11.1',
    group: 'B',
    useCases: ['UC-09', 'UC-13'],
  },
  'OBJ-1.2.3': {
    text: 'พัฒนาระบบบริหารจัดการใบคำร้องขอให้ดำเนินการแก้ไข ตั้งแต่การเปิดใบจนถึงการปิดงาน',
    source: 'บทที่ 1 ข้อ 1.2.3 และแบบเสนอหัวข้อ SE02 ข้อ 11.1',
    group: 'B',
    useCases: ['UC-10', 'UC-11'],
  },
  'OBJ-1.2.4': {
    text: 'พัฒนาระบบติดตามกำหนดเวลาและคำนวณสถานะงานที่เกินกำหนดโดยอัตโนมัติ',
    source: 'บทที่ 1 ข้อ 1.2.4 และแบบเสนอหัวข้อ SE02 ข้อ 11.1',
    group: 'B',
    useCases: ['UC-12'],
  },
};

/* ---------- ประกอบและบันทึก ---------- */

const doc = {
  meta: {
    generatedBy: 'packages/traceability/src/extract-from-srs.ts',
    source: 'SRS_A+B.md',
    note: [
      'ไฟล์นี้สร้างจากสคริปต์ ถ้าจะแก้ให้แก้ที่เอกสารต้นทางแล้วรันสคริปต์ใหม่',
      'ยกเว้นหัวข้อ objectives ซึ่งไม่มีในเอกสารรวม จึงเขียนไว้ในสคริปต์โดยอ้างบทที่ 1',
      'วัตถุประสงค์มีเอกสารรองรับเฉพาะฝั่งกลุ่ม B — กรณีการใช้งานของกลุ่ม A',
      'จะแสดงว่ายังไม่มีเอกสารวัตถุประสงค์รองรับ ซึ่งเป็นความจริงไม่ใช่ข้อผิดพลาด',
    ],
  },
  objectives,
  stakeholders,
  businessRequirements,
  requirements,
  useCases,
  acceptance,
};

writeFileSync(outPath, stringify(doc, { lineWidth: 0 }), 'utf8');

console.log(`เขียน ${outPath}`);
console.log(`  วัตถุประสงค์      ${Object.keys(objectives).length}`);
console.log(`  ผู้มีส่วนได้เสีย   ${Object.keys(stakeholders).length}`);
console.log(`  ความต้องการธุรกิจ ${Object.keys(businessRequirements).length}`);
console.log(`  ความต้องการหน้าที่ ${Object.keys(requirements).length}`);
console.log(`  กรณีการใช้งาน     ${Object.keys(useCases).length}`);
console.log(`  เกณฑ์การยอมรับ    ${Object.keys(acceptance).length}`);
