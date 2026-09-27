import type { Prisma } from '@prisma/client';
import { constants } from 'node:fs';
import { access } from 'node:fs/promises';
import { database } from '../lib/prisma.js';
import { dbUserId, DocumentError } from './documentRules.js';
import { allowedMime, discardEvidence, inspectEvidence, maxFileBytes, recordPath, storeEvidence } from './recordStorage.js';
import { listRecordDocumentReferences, recordDocumentExists } from './documentService.js';

const elevated = new Set(['dcc', 'qmr', 'auditor', 'lead']);
const creators = new Set(['dcc', 'auditor', 'lead', 'assistant', 'carowner']);
const readers = new Set([...elevated, 'deputy', 'assistant', 'carowner']);
const uuid = (v: unknown) => typeof v === 'string' && /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(v);
const text = (v: unknown, max: number) => typeof v === 'string' && v.trim().length > 0 && v.trim().length <= max ? v.trim() : null;
const validDate = (value: string | null): value is string => !!value && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(new Date(value).getTime()) && new Date(value).toISOString().slice(0, 10) === value;
function canRead(who: string) { if (!readers.has(who)) throw new DocumentError(403, 'บัญชีนี้ไม่มีสิทธิ์ดูบันทึกข้อมูล'); }
function canCreate(who: string) { if (!creators.has(who)) throw new DocumentError(403, 'บัญชีนี้ไม่มีสิทธิ์สร้างบันทึกข้อมูล'); }
export function scope(who: string): Prisma.QualityRecordWhereInput {
  return elevated.has(who) ? {} : { OR: [{ ownerUserId: dbUserId(who) }, { createdById: dbUserId(who) }] };
}
const summary = { id: true, title: true, recordDate: true, createdAt: true, createdById: true, recordType: { select: { id: true, code: true, nameTh: true } }, owner: { select: { id: true, fullName: true } }, document: { select: { id: true, documentCode: true, title: true } }, evidence: { select: { id: true, fileName: true, mimeType: true, sizeBytes: true } } } satisfies Prisma.QualityRecordSelect;
const view = (row: { evidence: { sizeBytes: bigint }[] } & Record<string, unknown>) => ({ ...row, evidence: row.evidence.map(file => ({ ...file, sizeBytes: Number(file.sizeBytes) })) });

export async function options(who: string) {
  canRead(who);
  const db = database();
  const [recordTypes, owners, documentResult] = await Promise.all([
    db.recordType.findMany({ where: { isActive: true }, select: { id: true, code: true, nameTh: true }, orderBy: { nameTh: 'asc' } }),
    db.user.findMany({ where: { isActive: true }, select: { id: true, username: true, fullName: true }, orderBy: { fullName: 'asc' } }),
    listRecordDocumentReferences().then(documents => ({documents, available:true})).catch(() => ({documents:[], available:false})),
  ]);
  return { recordTypes, owners, documents: documentResult.documents, documentsAvailable: documentResult.available, maxFileBytes, allowedMimeTypes: [...allowedMime], canCreate: creators.has(who) };
}
export async function list(who: string, query: Record<string, unknown>) {
  canRead(who);
  const title = text(query.title, 300), typeId = query.typeId, ownerId = query.ownerId, documentId = query.documentId;
  const from = text(query.from, 10), to = text(query.to, 10);
  for (const id of [typeId, ownerId, documentId]) if (id && !uuid(id)) throw new DocumentError(400, 'ตัวกรองไม่ถูกต้อง');
  if ([from, to].some(v => v && !validDate(v)) || (from && to && from > to)) throw new DocumentError(400, 'วันที่ไม่ถูกต้อง');
  const where: Prisma.QualityRecordWhereInput = { AND: [scope(who), ...(title ? [{ title: { contains: title, mode: 'insensitive' as const } }] : []), ...(typeId ? [{ recordTypeId: String(typeId) }] : []), ...(ownerId ? [{ ownerUserId: String(ownerId) }] : []), ...(documentId ? [{ documentId: String(documentId) }] : []), ...((from || to) ? [{ recordDate: { ...(from ? { gte: new Date(from) } : {}), ...(to ? { lte: new Date(to) } : {}) } }] : [])] };
  const rows = await database().qualityRecord.findMany({ where, select: summary, orderBy: [{ recordDate: 'desc' }, { createdAt: 'desc' }], take: 100 });
  return { records: rows.map(view) };
}
export async function detail(who: string, id: string) {
  canRead(who);
  if (!uuid(id)) throw new DocumentError(403, 'ไม่สามารถเข้าถึงบันทึกข้อมูล');
  const row = await database().qualityRecord.findFirst({ where: { AND: [{ id }, scope(who)] }, select: summary });
  if (!row) throw new DocumentError(403, 'ไม่สามารถเข้าถึงบันทึกข้อมูล');
  return { record: view(row) };
}
export async function update(who: string, id: string, body: Record<string, unknown>) {
  canCreate(who);
  if (!uuid(id)) throw new DocumentError(403, 'ไม่สามารถแก้บันทึกข้อมูล');
  const db = database();
  const old = await db.qualityRecord.findFirst({ where: { AND: [{ id }, scope(who)] } });
  if (!old || (!elevated.has(who) && old.createdById !== dbUserId(who))) throw new DocumentError(403, 'ไม่สามารถแก้บันทึกข้อมูล');
  const title = text(body.title, 300), date = text(body.recordDate, 10);
  if (!title || !uuid(body.recordTypeId) || !uuid(body.ownerUserId) || !validDate(date)) throw new DocumentError(400, 'ข้อมูลบันทึกไม่ถูกต้อง');
  if (body.documentId && !uuid(body.documentId)) throw new DocumentError(400, 'เอกสารอ้างอิงไม่ถูกต้อง');
  if (!elevated.has(who) && body.ownerUserId !== dbUserId(who)) throw new DocumentError(403, 'แก้ได้เฉพาะบันทึกของตน');
  const [type, owner, document] = await Promise.all([
    db.recordType.findFirst({ where: { id: String(body.recordTypeId), isActive: true } }),
    db.user.findFirst({ where: { id: String(body.ownerUserId), isActive: true } }),
    body.documentId ? recordDocumentExists(String(body.documentId)) : null,
  ]);
  if (!type || !owner || (body.documentId && !document)) throw new DocumentError(400, 'ข้อมูลอ้างอิงไม่พร้อมใช้งาน');
  const userId = dbUserId(who);
  const result = await db.$transaction(async tx => {
    const row = await tx.qualityRecord.update({ where: { id }, data: { title, recordDate: new Date(date), recordTypeId: String(body.recordTypeId), ownerUserId: String(body.ownerUserId), documentId: body.documentId ? String(body.documentId) : null }, select: summary });
    await tx.auditEvent.create({ data: { actorUserId: userId, actorRole: (await tx.userRole.findFirstOrThrow({ where: { userId } })).role, action: 'UPDATE', entityType: 'QualityRecord', entityId: id, beforeValue: { title: old.title, recordDate: old.recordDate.toISOString().slice(0, 10), recordTypeId: old.recordTypeId, ownerUserId: old.ownerUserId, documentId: old.documentId }, afterValue: { title, recordDate: date, recordTypeId: body.recordTypeId as string, ownerUserId: body.ownerUserId as string, documentId: body.documentId || null } } });
    return row;
  });
  return { record: view(result) };
}
export async function create(who: string, body: Record<string, unknown>, files: Express.Multer.File[]) {
  try {
    canCreate(who);
    const title = text(body.title, 300), date = text(body.recordDate, 10);
    if (!title || !uuid(body.recordTypeId) || !uuid(body.ownerUserId) || !validDate(date)) throw new DocumentError(400, 'กรุณาระบุชนิด ชื่อ วันที่ และผู้รับผิดชอบให้ถูกต้อง');
    if (body.documentId && !uuid(body.documentId)) throw new DocumentError(400, 'เอกสารอ้างอิงไม่ถูกต้อง');
    const db = database();
    const [recordType, owner, document] = await Promise.all([
      db.recordType.findFirst({ where: { id: String(body.recordTypeId), isActive: true } }),
      db.user.findFirst({ where: { id: String(body.ownerUserId), isActive: true } }),
      body.documentId ? recordDocumentExists(String(body.documentId)) : null,
    ]);
    if (!recordType || !owner || (body.documentId && !document)) throw new DocumentError(400, 'ชนิด ผู้รับผิดชอบ หรือเอกสารอ้างอิงไม่พร้อมใช้งาน');
    if (!elevated.has(who) && body.ownerUserId !== dbUserId(who)) throw new DocumentError(403, 'สร้างได้เฉพาะบันทึกของตน');
    const inspected = [];
    for (const file of files) {
      const decoded = Buffer.from(file.originalname, 'latin1').toString('utf8');
      file.originalname = decoded.includes('\uFFFD') ? file.originalname : decoded;
      if (file.originalname.length > 255) throw new DocumentError(400, 'ชื่อไฟล์ยาวเกิน 255 ตัวอักษร');
      inspected.push(await inspectEvidence(file));
    }
    const stored: { key: string; file: Express.Multer.File; mime: string }[] = [];
    try {
      for (let i = 0; i < files.length; i++) stored.push({ key: await storeEvidence(files[i], inspected[i].ext), file: files[i], mime: inspected[i].mime });
      const userId = dbUserId(who);
      const result = await db.$transaction(async tx => {
        const row = await tx.qualityRecord.create({ data: { title, recordDate: new Date(date), recordTypeId: String(body.recordTypeId), ownerUserId: String(body.ownerUserId), documentId: body.documentId ? String(body.documentId) : null, createdById: userId, evidence: { create: stored.map(item => ({ fileName: item.file.originalname, mimeType: item.mime, sizeBytes: BigInt(item.file.size), storagePath: item.key, uploadedById: userId })) } }, select: summary });
        const actorRole = (await tx.userRole.findFirstOrThrow({ where: { userId } })).role;
        await tx.auditEvent.create({ data: { actorUserId: userId, actorRole, action: 'CREATE', entityType: 'QualityRecord', entityId: row.id, afterValue: { title: row.title, evidenceCount: stored.length } } });
        if (row.evidence.length) await tx.auditEvent.createMany({data:row.evidence.map(file => ({actorUserId:userId,actorRole,action:'ATTACH_EVIDENCE' as const,entityType:'Evidence',entityId:file.id,afterValue:{recordId:row.id,fileName:file.fileName}}))});
        return row;
      });
      return view(result);
    } catch (error) {
      await Promise.all(stored.map(item => discardEvidence(recordPath(item.key))));
      throw error;
    }
  } finally {
    await Promise.all(files.map(file => discardEvidence(file.path)));
  }
}
export async function evidence(who: string, id: string) {
  canRead(who);
  if (!uuid(id)) throw new DocumentError(403, 'ไม่สามารถเข้าถึงหลักฐาน');
  const row = await database().evidence.findFirst({ where: { id, record: scope(who) }, select: { id: true, fileName: true, mimeType: true, storagePath: true, recordId: true } });
  if (!row || !row.recordId) throw new DocumentError(403, 'ไม่สามารถเข้าถึงหลักฐาน');
  const path = recordPath(row.storagePath);
  const actorUserId = dbUserId(who);
  const actorRole = (await database().userRole.findFirstOrThrow({where:{userId:actorUserId}})).role;
  try { await access(path, constants.R_OK); }
  catch {
    await database().auditEvent.create({ data: { actorUserId, actorRole, action: 'EXPORT', entityType: 'Evidence', entityId: id, reason: 'FILE_MISSING' } });
    throw new DocumentError(503, `ไฟล์หลักฐานไม่พร้อมใช้งาน (${id})`);
  }
  await database().auditEvent.create({ data: { actorUserId, actorRole, action: 'EXPORT', entityType: 'Evidence', entityId: id } });
  return { ...row, path };
}
