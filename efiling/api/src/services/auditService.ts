import type { Prisma, FindingSource, FindingType, FindingSeverity } from '@prisma/client';
import { access, constants } from 'node:fs/promises';
import { database } from '../lib/prisma.js';
import { dbUserId, DocumentError } from './documentRules.js';
import { allowedMime, discardEvidence, inspectEvidence, maxFileBytes, recordPath, requireEvidenceFiles, storeEvidence } from './recordStorage.js';
import { listRecordDocumentReferences, recordDocumentExists } from './documentService.js';
import { detail as recordDetail } from './recordService.js';

const uuid = (v: unknown): v is string => typeof v === 'string' && /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(v);
const filled = (v: unknown, max: number) => typeof v === 'string' && v.trim().length > 0 && v.trim().length <= max ? v.trim() : null;
const date = (v: unknown) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v;
const sources = ['INTERNAL_AUDIT','EXTERNAL_AUDIT','MANAGEMENT_REVIEW','COMPLAINT','IMPROVEMENT_PROPOSAL'];
const types = ['NONCONFORMITY','OBSERVATION','IMPROVEMENT_SUGGESTION'];
const severities = ['MAJOR','MINOR','OB'];
const roundCreators = new Set(['dcc','lead']);
const findingCreators = new Set(['dcc','auditor','lead']);
const readers = new Set(['dcc','qmr','deputy','lead','auditor','sectionhead','carowner']);
function requireRead(who: string) { if (!readers.has(who)) throw new DocumentError(403, 'ไม่มีสิทธิ์ดูรอบตรวจและประเด็น'); }
export function roundScope(who: string): Prisma.AuditRoundWhereInput {
  const id = dbUserId(who);
  if (who === 'dcc' || who === 'qmr') return {};
  if (who === 'sectionhead' || who === 'carowner') return { targetDepartment: { users: { some: { id } } } };
  return { OR: [{ createdById: id }, { members: { some: { auditorUserId: id } } }] };
}
export function findingScope(who: string): Prisma.FindingWhereInput {
  const id = dbUserId(who);
  if (who === 'dcc' || who === 'qmr') return {};
  if (who === 'sectionhead' || who === 'carowner') return { department: { users: { some: { id } } } };
  return { OR: [{ identifiedById: id }, { auditRound: roundScope(who) }] };
}
const roundInclude = { targetDepartment: { select: { id: true, code: true, nameTh: true } }, members: { include: { auditor: { select: { id: true, fullName: true, username: true } } } }, createdBy: { select: { id: true, fullName: true } } } satisfies Prisma.AuditRoundInclude;
const findingInclude = { auditRound: { select: { id: true, name: true } }, department: { select: { id: true, nameTh: true } }, document: { select: { id: true, documentCode: true, title: true } }, record: { select: { id: true, title: true } }, identifiedBy: { select: { id: true, fullName: true } }, evidence: { select: { id: true, fileName: true, mimeType: true, sizeBytes: true } } } satisfies Prisma.FindingInclude;
function findingView<T extends { evidence: { sizeBytes: bigint }[] }>(row: T) { return { ...row, evidence: row.evidence.map(file => ({ ...file, sizeBytes: Number(file.sizeBytes) })) }; }
async function actorRole(tx: Prisma.TransactionClient, id: string) { return (await tx.userRole.findFirstOrThrow({ where: { userId: id } })).role; }

export async function options(who: string) {
  requireRead(who); const db = database();
  const [departments, auditors, records, documents] = await Promise.all([
    db.department.findMany({ where: { isActive: true }, select: { id: true, code: true, nameTh: true }, orderBy: { code: 'asc' } }),
    db.user.findMany({ where: { isActive: true, roles: { some: { role: { in: ['AUDITOR','LEAD_AUDITOR'] } } } }, select: { id: true, username: true, fullName: true, departmentId: true }, orderBy: { fullName: 'asc' } }),
    db.qualityRecord.findMany({ where: who === 'dcc' || who === 'qmr' || who === 'auditor' || who === 'lead' ? {} : { ownerUserId: dbUserId(who) }, select: { id: true, title: true, evidence: { select: { id: true } } }, take: 200, orderBy: { createdAt: 'desc' } }),
    listRecordDocumentReferences(),
  ]);
  return { departments, auditors, records: records.map(row => ({ id: row.id, title: row.title, evidenceCount: row.evidence.length })), documents, canCreateRound: roundCreators.has(who), canCreateFinding: findingCreators.has(who), maxFileBytes, allowedMimeTypes: [...allowedMime] };
}
export async function listRounds(who: string) {
  requireRead(who);
  return { rounds: await database().auditRound.findMany({ where: roundScope(who), include: roundInclude, orderBy: { startDate: 'desc' }, take: 200 }) };
}
export async function roundDetail(who: string, id: string) {
  requireRead(who);
  if (!uuid(id)) throw new DocumentError(403, 'ไม่สามารถเข้าถึงรอบตรวจ');
  const round = await database().auditRound.findFirst({ where: { AND: [{ id }, roundScope(who)] }, include: { ...roundInclude, findings: { include: findingInclude, orderBy: { identifiedDate: 'desc' } } } });
  if (!round) throw new DocumentError(403, 'ไม่สามารถเข้าถึงรอบตรวจ');
  const summary = { byType: { NONCONFORMITY: 0, OBSERVATION: 0, IMPROVEMENT_SUGGESTION: 0 }, bySeverity: { MAJOR: 0, MINOR: 0, OB: 0 }, withRequest: 0 };
  for (const item of round.findings) { summary.byType[item.findingType]++; summary.bySeverity[item.severity]++; }
  summary.withRequest = await database().correctiveRequest.count({ where: { finding: { auditRoundId: id } } });
  return { round: { ...round, findings: round.findings.map(findingView) }, summary };
}
export async function createRound(who: string, body: Record<string, unknown>) {
  if (!roundCreators.has(who)) throw new DocumentError(403, 'ไม่มีสิทธิ์สร้างรอบตรวจ');
  const name = filled(body.name, 200), objective = filled(body.objective, 3000), scope = filled(body.scope, 3000), criteria = filled(body.criteria, 3000);
  const ids = body.auditorUserIds;
  if (!name || !objective || !scope || !criteria || !date(body.startDate) || !date(body.endDate) || String(body.endDate) < String(body.startDate) || !uuid(body.targetDepartmentId) || !Array.isArray(ids) || !ids.length || ids.length > 20 || ids.some(id => !uuid(id)) || new Set(ids).size !== ids.length) throw new DocumentError(400, 'กรุณาระบุชื่อ วัตถุประสงค์ ขอบเขต เกณฑ์ วันที่ กลุ่มงาน และผู้ตรวจให้ครบ');
  const db = database();
  const [department, auditors] = await Promise.all([db.department.findFirst({ where: { id: body.targetDepartmentId, isActive: true } }), db.user.findMany({ where: { id: { in: ids as string[] }, isActive: true, roles: { some: { role: { in: ['AUDITOR','LEAD_AUDITOR'] } } } } })]);
  if (!department || auditors.length !== ids.length) throw new DocumentError(400, 'กลุ่มงานหรือผู้ตรวจไม่พร้อมใช้งาน');
  const conflicts = auditors.filter(a => a.departmentId === department.id);
  const reason = filled(body.waiverReason, 1000);
  if (conflicts.length && (who !== 'dcc' || !reason)) throw new DocumentError(400, 'ผู้ตรวจสังกัดกลุ่มงานเป้าหมาย ต้องให้ DCC ยกเว้นพร้อมเหตุผล');
  const userId = dbUserId(who);
  return db.$transaction(async tx => {
    const row = await tx.auditRound.create({ data: { name, objective, scope, criteria, startDate: new Date(body.startDate as string), endDate: new Date(body.endDate as string), targetDepartmentId: department.id, createdById: userId, members: { create: auditors.map(a => ({ auditorUserId: a.id, isLead: a.username === 'lead', independenceWaived: conflicts.some(c => c.id === a.id), waiverReason: conflicts.some(c => c.id === a.id) ? reason : null, waivedById: conflicts.some(c => c.id === a.id) ? userId : null })) } }, include: roundInclude });
    const role = await actorRole(tx, userId);
    await tx.auditEvent.create({ data: { actorUserId: userId, actorRole: role, action: 'CREATE', entityType: 'AuditRound', entityId: row.id, afterValue: { name, targetDepartmentId: department.id, auditorUserIds: ids as string[] } } });
    if (conflicts.length) await tx.auditEvent.create({ data: { actorUserId: userId, actorRole: role, action: 'INDEPENDENCE_WAIVER', entityType: 'AuditRound', entityId: row.id, reason, afterValue: { auditorUserIds: conflicts.map(a => a.id) } } });
    return row;
  });
}
export async function listFindings(who: string, query: Record<string, unknown>) {
  requireRead(who);
  if (query.roundId && !uuid(query.roundId)) throw new DocumentError(400, 'รหัสรอบตรวจไม่ถูกต้อง');
  const where: Prisma.FindingWhereInput = { AND: [findingScope(who), query.roundId ? { auditRoundId: query.roundId as string } : {}] };
  return { findings: (await database().finding.findMany({ where, include: findingInclude, orderBy: { identifiedDate: 'desc' }, take: 200 })).map(findingView) };
}
export async function findingDetail(who: string, id: string) {
  requireRead(who); if (!uuid(id)) throw new DocumentError(403, 'ไม่สามารถเข้าถึงประเด็น');
  const row = await database().finding.findFirst({ where: { AND: [{ id }, findingScope(who)] }, include: findingInclude });
  if (!row) throw new DocumentError(403, 'ไม่สามารถเข้าถึงประเด็น');
  return { finding: findingView(row) };
}
export async function createFinding(who: string, body: Record<string, unknown>, files: Express.Multer.File[]) {
  try {
    if (!findingCreators.has(who)) throw new DocumentError(403, 'ไม่มีสิทธิ์เพิ่มประเด็น');
    const source = body.source, findingType = body.findingType, severity = body.severity;
    const description = filled(body.description, 5000), requirement = filled(body.violatedRequirement, 3000);
    if (!sources.includes(String(source)) || !types.includes(String(findingType)) || !severities.includes(String(severity)) || !description || description.length < 10 || !requirement || !date(body.identifiedDate)) throw new DocumentError(400, 'กรุณาระบุแหล่ง ชนิด ระดับ รายละเอียด ข้อกำหนด และวันที่ให้ครบ');
    if ((source === 'INTERNAL_AUDIT') !== Boolean(body.auditRoundId) || (body.auditRoundId && !uuid(body.auditRoundId))) throw new DocumentError(400, 'การตรวจภายในต้องเลือกรอบตรวจ และแหล่งอื่นต้องไม่ผูกรอบ');
    for (const key of ['documentId','recordId','recurrenceOfId']) if (body[key] && !uuid(body[key])) throw new DocumentError(400, 'ข้อมูลอ้างอิงไม่ถูกต้อง');
    const db = database(); const userId = dbUserId(who);
    let round = null;
    if (body.auditRoundId) {
      round = await db.auditRound.findFirst({ where: { id: body.auditRoundId as string, ...(who === 'dcc' ? {} : { members: { some: { auditorUserId: userId } } }) } });
      if (!round) throw new DocumentError(403, 'ไม่มีสิทธิ์บันทึกประเด็นในรอบตรวจนี้');
    }
    if (body.documentId && !await recordDocumentExists(body.documentId as string)) throw new DocumentError(400, 'เอกสารอ้างอิงไม่พร้อมใช้งาน');
    if (body.recordId) await recordDetail(who, body.recordId as string);
    const record = body.recordId ? await db.qualityRecord.findUnique({ where: { id: body.recordId as string }, include: { evidence: true } }) : null;
    if (body.recurrenceOfId && !await db.finding.findFirst({ where: { id: body.recurrenceOfId as string, status: 'FINDING_CLOSED' } })) throw new DocumentError(400, 'ประเด็นเดิมต้องปิดแล้ว');
    if (findingType === 'NONCONFORMITY' && files.length === 0 && !record?.evidence.length) throw new DocumentError(400, 'ความไม่สอดคล้องต้องมีหลักฐานเชิงวัตถุ');
    if (record) await requireEvidenceFiles(record.evidence);
    const inspected = [];
    for (const file of files) { const decoded = Buffer.from(file.originalname, 'latin1').toString('utf8'); file.originalname = decoded.includes('\uFFFD') ? file.originalname : decoded; if (file.originalname.length > 255) throw new DocumentError(400, 'ชื่อไฟล์ยาวเกินไป'); inspected.push(await inspectEvidence(file)); }
    const stored: { key: string; file: Express.Multer.File; mime: string }[] = [];
    try {
      for (let i = 0; i < files.length; i++) stored.push({ key: await storeEvidence(files[i], inspected[i].ext), file: files[i], mime: inspected[i].mime });
      return await db.$transaction(async tx => {
        const row = await tx.finding.create({ data: { source: source as FindingSource, findingType: findingType as FindingType, severity: severity as FindingSeverity, description, violatedRequirement: requirement, identifiedDate: new Date(body.identifiedDate as string), identifiedById: userId, auditRoundId: round?.id || null, departmentId: round?.targetDepartmentId || null, documentId: body.documentId ? String(body.documentId) : null, recordId: record?.id || null, recurrenceOfId: body.recurrenceOfId ? String(body.recurrenceOfId) : null, evidence: { create: stored.map(item => ({ fileName: item.file.originalname, mimeType: item.mime, sizeBytes: BigInt(item.file.size), storagePath: item.key, uploadedById: userId })) } }, include: findingInclude });
        const role = await actorRole(tx, userId);
        await tx.auditEvent.create({ data: { actorUserId: userId, actorRole: role, action: 'CREATE', entityType: 'Finding', entityId: row.id, afterValue: { source: String(source), findingType: String(findingType), severity: String(severity), auditRoundId: round?.id || null, evidenceCount: stored.length, recordId: record?.id || null } } });
        if (row.evidence.length) await tx.auditEvent.createMany({ data: row.evidence.map(file => ({ actorUserId: userId, actorRole: role, action: 'ATTACH_EVIDENCE' as const, entityType: 'Evidence', entityId: file.id, afterValue: { findingId: row.id, fileName: file.fileName } })) });
        return findingView(row);
      });
    } catch (error) { await Promise.all(stored.map(item => discardEvidence(recordPath(item.key)))); throw error; }
  } finally { await Promise.all(files.map(file => discardEvidence(file.path))); }
}
export async function evidence(who: string, id: string) {
  requireRead(who); if (!uuid(id)) throw new DocumentError(403, 'ไม่สามารถเข้าถึงหลักฐาน');
  const file = await database().evidence.findFirst({ where: { id, finding: findingScope(who) }, select: { id: true, fileName: true, mimeType: true, storagePath: true, findingId: true } });
  if (!file?.findingId) throw new DocumentError(403, 'ไม่สามารถเข้าถึงหลักฐาน');
  const path = recordPath(file.storagePath); const actorUserId = dbUserId(who);
  const actorRoleValue = (await database().userRole.findFirstOrThrow({ where: { userId: actorUserId } })).role;
  try { await access(path, constants.R_OK); } catch { await database().auditEvent.create({ data: { actorUserId, actorRole: actorRoleValue, action: 'EXPORT', entityType: 'Evidence', entityId: id, reason: 'FILE_MISSING' } }); throw new DocumentError(503, `ไฟล์หลักฐานไม่พร้อมใช้งาน (${id})`); }
  await database().auditEvent.create({ data: { actorUserId, actorRole: actorRoleValue, action: 'EXPORT', entityType: 'Evidence', entityId: id } });
  return { ...file, path };
}
