import { createReadStream } from 'node:fs';
import { mkdir, open, rename, rm } from 'node:fs/promises';
import { createHash, randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import '../config.js';
import { DocumentError, MAX_PDF_BYTES } from './documentRules.js';

export const storageRoot = resolve(process.env.DOCUMENT_STORAGE_DIR || fileURLToPath(new URL('../../../.local/document-storage',import.meta.url)));
export const incomingRoot = resolve(storageRoot,'incoming');
export async function prepareStorage() { await mkdir(incomingRoot,{recursive:true}); }
export function storedPath(key: string) {
  if (!/^[0-9a-f-]{36}\.pdf$/.test(key)) throw new DocumentError(500,'ตำแหน่งไฟล์ไม่ถูกต้อง');
  return resolve(storageRoot,key);
}
export async function inspectPdf(path: string, size: number, mime: string, fileName: string) {
  if (size > MAX_PDF_BYTES) throw new DocumentError(413,'ไฟล์ PDF ต้องไม่เกิน 128 MB');
  if (!size || !fileName.toLowerCase().endsWith('.pdf') || mime !== 'application/pdf') throw new DocumentError(400,'รองรับเฉพาะไฟล์ PDF');
  const file = await open(path,'r');
  try {
    const head = Buffer.alloc(5); await file.read(head,0,5,0);
    if (head.toString() !== '%PDF-') throw new DocumentError(400,'เนื้อหาไฟล์ไม่ใช่ PDF');
  } finally { await file.close(); }
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  return hash.digest('hex');
}
export async function storePdf(path: string) {
  const key = `${randomUUID()}.pdf`;
  await rename(path,storedPath(key));
  return key;
}
export async function discardFile(path: string) { await rm(path,{force:true}); }
