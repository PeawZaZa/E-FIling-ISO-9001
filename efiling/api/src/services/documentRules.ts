import type { Prisma, DocumentVersionStatus } from '@prisma/client';
import { menuAccess } from './authService.js';

export class DocumentError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export const MAX_PDF_BYTES = 128 * 1024 * 1024;
export const documentTypes = ['QM','QP','WI','SD','FM'];
export const CENTRAL_DEPARTMENT = {code:'2301',nameTh:'สำนักงานคณบดีคณะวิศวกรรมศาสตร์'};
export function isCentralDocument(code: string | null) { return !!code && /(?:^|-)2301(?:-|$)/.test(code); }
export function dbUserId(accountId: string) {
  const ids = ['dcc','owner','reviewer','qmr','reader','auditor','carowner','registrar','sponsor','deputy','sectionhead','lead','assistant','dean'];
  const index = ids.indexOf(accountId);
  if (index < 0) throw new DocumentError(401,'กรุณาเข้าสู่ระบบ');
  return `00000000-0000-4000-8000-${String(index + 1).padStart(12,'0')}`;
}
export function requireDcc(accountId: string) {
  if (accountId !== 'dcc') throw new DocumentError(403,'เฉพาะเจ้าหน้าที่ควบคุมเอกสารที่นำเข้าหรือแก้ข้อมูลได้');
}
export function versionScope(accountId: string): Prisma.DocumentVersionWhereInput {
  if (accountId === 'dcc' || accountId === 'qmr') return {};
  if (accountId === 'owner') return { reviewStatus:'VERIFIED', OR:[{status:'DOC_PUBLISHED'},{document:{ownerUserId:dbUserId(accountId)}}] };
  return { reviewStatus:'VERIFIED', status:'DOC_PUBLISHED' };
}
export function documentScope(accountId: string): Prisma.DocumentWhereInput {
  if (menuAccess(accountId,'documents').status !== 200) throw new DocumentError(403,'บัญชีนี้ไม่มีสิทธิ์เข้าทะเบียนเอกสาร');
  if (accountId === 'dcc' || accountId === 'qmr') return {};
  // การนำเข้าเดิมไม่มี DAR มอบหมายให้ผู้ช่วย QMR; ไม่ให้สิทธิ์ QMR โดยปริยาย
  if (accountId === 'deputy') return { versions:{some:{status:'DOC_PUBLISHED',reviewStatus:'VERIFIED',originatingDar:{OR:[{assignments:{path:['REVIEW','assigneeId'],equals:dbUserId(accountId)}},{assignments:{path:['APPROVAL','assigneeId'],equals:dbUserId(accountId)}}]}}} };
  return { ...(accountId === 'dean' ? {docType:'QM'} : {}), versions:{some:versionScope(accountId)} };
}
function text(value: unknown, name: string, max: number): string | null {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string' || value.trim().length > max) throw new DocumentError(400,`${name}ไม่ถูกต้อง`);
  return value.trim() || null;
}
function integer(value: unknown, name: string) {
  if (value === undefined || value === null || value === '') return null;
  if (!/^\d{1,6}$/.test(String(value))) throw new DocumentError(400,`${name}ต้องเป็นจำนวนเต็มตั้งแต่ 0`);
  return Number(value);
}
function uuid(value: unknown, label: string) {
  const result = text(value,label,36);
  if (result && !/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(result)) throw new DocumentError(400,`${label}ไม่ถูกต้อง`);
  return result;
}
export function parseDocumentInput(body: Record<string, unknown>) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new DocumentError(400,'รูปแบบข้อมูลไม่ถูกต้อง');
  const title = text(body.title,'ชื่อเอกสาร',300);
  if (!title) throw new DocumentError(400,'กรุณาระบุชื่อเอกสาร');
  const documentCode = text(body.documentCode,'รหัสเอกสาร',64)?.toUpperCase() ?? null;
  const docType = text(body.docType,'ประเภท',64);
  if (docType && !documentTypes.includes(docType)) throw new DocumentError(400,'ประเภทเอกสารไม่ถูกต้อง');
  const issueNo = integer(body.issueNo,'ฉบับที่');
  const revisionNo = integer(body.revisionNo,'ครั้งที่แก้ไข');
  const date = text(body.effectiveDate,'วันที่มีผลใช้',10);
  if (date && (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(new Date(date).getTime()) || new Date(date).toISOString().slice(0,10) !== date)) throw new DocumentError(400,'วันที่มีผลใช้ไม่ถูกต้อง');
  const status = text(body.status,'สถานะ',30) as DocumentVersionStatus | null;
  if (status && !['DOC_PUBLISHED','DOC_OBSOLETE'].includes(status)) throw new DocumentError(400,'การนำเข้าใช้ได้เฉพาะเอกสารเดิมที่ประกาศใช้หรือฉบับเก่า');
  const departmentId = uuid(body.departmentId,'หน่วยงาน');
  const ownerUserId = uuid(body.ownerUserId,'เจ้าของเอกสาร');
  const departmentName = text(body.departmentName,'ชื่อหน่วยงาน',200);
  const reviewNotes = text(body.reviewNotes,'หมายเหตุ',4000);
  const verified = body.verified === true;
  if (verified && (!documentCode || !docType || issueNo === null || revisionNo === null || !date || (!departmentId && !departmentName && !isCentralDocument(documentCode)) || !ownerUserId || !status)) {
    throw new DocumentError(400,'ตรวจยืนยันได้เมื่อรหัส ประเภท ฉบับ ครั้งที่แก้ไข วันที่มีผลใช้ หน่วยงาน เจ้าของ และสถานะครบถ้วน');
  }
  return {title,documentCode,docType,issueNo,revisionNo,effectiveDate:date ? new Date(date):null,status,departmentId,departmentName,ownerUserId,reviewNotes,verified};
}
export type DocumentInput = ReturnType<typeof parseDocumentInput>;
