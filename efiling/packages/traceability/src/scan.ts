/**
 * สแกนหาความเห็นกำกับ @trace ในโค้ดและเทสต์
 *
 * วิธีใช้: เขียนความเห็นไว้เหนือฟังก์ชันหรือเส้นทางที่ทำงานตามข้อกำหนดนั้น
 *
 *   /** @trace UC-10 FR-B06 *\/
 *
 * ในไฟล์เทสต์ให้กำกับเกณฑ์การยอมรับด้วย เช่น `@trace AC-08`
 * สถานะในรายการตรวจสอบมาจากผลสแกนนี้ ไม่ได้พิมพ์ด้วยมือ จึงล้าสมัยไม่ได้
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

export interface TraceHit {
  /** รหัสที่ถูกอ้างถึง เช่น UC-10, FR-B06, AC-08 */
  code: string;
  /** เส้นทางไฟล์เทียบกับรากโมโนรีโป */
  file: string;
  line: number;
  isTest: boolean;
}

const CODE_PATTERN = /\b(UC-\d{2}|FR-(?:A|B|SH)\d{2}|AC-\d{2}|BR-\d{2})\b/g;
const TRACE_PATTERN = /@trace\s+([^\n*]+)/g;
const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx']);
const SKIP_DIRS = new Set(['node_modules', 'dist', 'build', '.git', 'coverage']);

function walk(dir: string, out: string[] = []): string[] {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (SOURCE_EXTENSIONS.has(extname(full))) out.push(full);
  }
  return out;
}

function looksLikeTest(path: string): boolean {
  return /(^|[\\/])(test|tests|__tests__)[\\/]/.test(path) || /\.(test|spec)\.[jt]sx?$/.test(path);
}

export interface ScanOptions {
  /**
   * เส้นทางที่ไม่ต้องสแกน เทียบกับรากโมโนรีโป
   *
   * ต้องกันโฟลเดอร์ของเครื่องมือสอบกลับเองออกไปเสมอ เพราะเอกสารประกอบ
   * ในนั้นมีตัวอย่างการเขียน @trace อยู่ ถ้าไม่กัน ตัวอย่างจะถูกนับเป็นของจริง
   * แล้วรายการตรวจสอบจะขึ้นว่าทำแล้วทั้งที่ยังไม่ได้ทำ
   */
  readonly exclude?: readonly string[];
}

export function scanForTraces(
  roots: string[],
  repoRoot: string,
  options: ScanOptions = {},
): TraceHit[] {
  const hits: TraceHit[] = [];
  const exclude = options.exclude ?? [];

  for (const root of roots) {
    for (const file of walk(root)) {
      const rel = relative(repoRoot, file).replace(/\\/g, '/');
      if (exclude.some((prefix) => rel.startsWith(prefix))) continue;
      const isTest = looksLikeTest(file);
      const lines = readFileSync(file, 'utf8').split(/\r?\n/);

      lines.forEach((text, index) => {
        for (const match of text.matchAll(TRACE_PATTERN)) {
          for (const code of match[1]!.matchAll(CODE_PATTERN)) {
            hits.push({ code: code[1]!, file: rel, line: index + 1, isTest });
          }
        }
      });
    }
  }

  return hits;
}

export type ImplementationStatus = 'ยังไม่ได้ทำ' | 'มีโค้ดแล้ว' | 'มีเทสต์แล้ว';

export interface CodeStatus {
  status: ImplementationStatus;
  sourceFiles: string[];
  testFiles: string[];
}

export function statusByCode(hits: TraceHit[]): Map<string, CodeStatus> {
  const map = new Map<string, CodeStatus>();

  for (const hit of hits) {
    const entry = map.get(hit.code) ?? { status: 'ยังไม่ได้ทำ', sourceFiles: [], testFiles: [] };
    const bucket = hit.isTest ? entry.testFiles : entry.sourceFiles;
    const label = `${hit.file}:${hit.line}`;
    if (!bucket.includes(label)) bucket.push(label);
    entry.status = entry.testFiles.length > 0 ? 'มีเทสต์แล้ว' : 'มีโค้ดแล้ว';
    map.set(hit.code, entry);
  }

  return map;
}
