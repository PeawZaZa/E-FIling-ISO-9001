import { randomUUID } from 'node:crypto';
import { mkdir, rename, rm, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fileTypeFromFile } from 'file-type';
import '../config.js';
import { DocumentError } from './documentRules.js';

export const recordRoot = resolve(process.env.RECORD_STORAGE_DIR || fileURLToPath(new URL('../../../.local/record-storage', import.meta.url)));
export const incomingRoot = resolve(recordRoot, 'incoming');
const defaultMime = ['application/pdf', 'image/jpeg', 'image/png', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/msword', 'application/vnd.ms-excel', 'application/vnd.ms-powerpoint'];
const configured = process.env.RECORD_ALLOWED_MIME_TYPES?.split(',').map(x => x.trim()).filter(Boolean);
export const allowedMime = new Set(configured?.length ? configured : defaultMime);
const maxMb = Number(process.env.RECORD_MAX_FILE_MB || 10);
if (!Number.isInteger(maxMb) || maxMb < 1 || maxMb > 128) throw new Error('RECORD_MAX_FILE_MB must be 1–128');
export const maxFileBytes = maxMb * 1024 * 1024;

export async function prepareRecordStorage() { await mkdir(incomingRoot, { recursive: true }); }
export function recordPath(key: string) {
  if (!/^[0-9a-f-]{36}\.[a-z0-9]{2,5}$/.test(key)) throw new DocumentError(500, 'ตำแหน่งหลักฐานไม่ถูกต้อง');
  return resolve(recordRoot, key);
}
export async function inspectEvidence(file: Express.Multer.File) {
  const kind = await fileTypeFromFile(file.path);
  const extension = file.originalname.split('.').at(-1)?.toLowerCase();
  const normalizedExtension = extension === 'jpeg' ? 'jpg' : extension;
  const legacyMime: Record<string, string> = {doc:'application/msword',xls:'application/vnd.ms-excel',ppt:'application/vnd.ms-powerpoint'};
  const legacy = kind?.ext === 'cfb' && normalizedExtension && legacyMime[normalizedExtension];
  const actual = legacy ? {ext:normalizedExtension,mime:legacy} : kind;
  if (!actual || !allowedMime.has(actual.mime) || normalizedExtension !== actual.ext || file.size === 0) {
    throw new DocumentError(400, 'ชนิดไฟล์หลักฐานไม่ถูกต้องหรือไม่รองรับ');
  }
  return actual;
}
export async function storeEvidence(file: Express.Multer.File, ext: string) {
  const key = `${randomUUID()}.${ext}`;
  await rename(file.path, recordPath(key));
  return key;
}
export async function discardEvidence(path: string) { await rm(path, { force: true }); }
export async function requireEvidenceFiles(files: { storagePath: string; sizeBytes: bigint }[]) {
  for (const file of files) {
    try {
      const info = await stat(recordPath(file.storagePath));
      if (!info.isFile() || BigInt(info.size) !== file.sizeBytes || !info.size) throw new Error('Invalid evidence');
    } catch { throw new DocumentError(409, 'ไฟล์หลักฐานไม่พร้อมใช้งาน กรุณาตรวจสอบก่อนดำเนินการ'); }
  }
}
