import { stat } from 'node:fs/promises';
import { Prisma, type DocumentVersion } from '@prisma/client';
import { accounts } from '../data/demoAccounts.js';
import { database } from '../lib/prisma.js';
import { dbUserId, documentScope, DocumentError, versionScope } from './documentRules.js';
import { menuAccess } from './authService.js';
import { storedPath } from './documentStorage.js';

const uuidPattern = /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
const published = { status: 'DOC_PUBLISHED' as const, reviewStatus: 'VERIFIED' as const };
const versionInclude = { document: { select: { id: true, documentCode: true, title: true, docType: true, isActive: true } }, files: { select: { id: true, storagePath: true }, take: 1 } } satisfies Prisma.DocumentVersionInclude;
type Version = Prisma.DocumentVersionGetPayload<{ include: typeof versionInclude }>;

function fail(status: number, message: string): never { throw new DocumentError(status, message); }
function requireAck(accountId: string) {
  if (menuAccess(accountId, 'ack').status !== 200) fail(403, 'ไม่มีสิทธิ์เข้ารายการรับทราบ');
}
function requireDcc(accountId: string) {
  if (accountId !== 'dcc') fail(403, 'ระบบทดลองให้ DCC กำหนดผู้รับทราบเท่านั้น');
}
async function requireActiveDcc(tx: Prisma.TransactionClient, accountId: string) {
  requireDcc(accountId);
  if (!await tx.user.findFirst({ where: { id: dbUserId(accountId), isActive: true }, select: { id: true } })) fail(403, 'บัญชีไม่พร้อมใช้งาน');
}
function validId(id: string) { if (!uuidPattern.test(id)) fail(404, 'ไม่พบรายการ'); }
function demoAccount(userId: string) { return accounts.find(account => dbUserId(account.id) === userId); }
async function fileReady(version: Version) {
  const file = version.files[0];
  if (!file) return false;
  try { return (await stat(storedPath(file.storagePath))).isFile(); }
  catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return false; throw error; }
}
async function canRead(tx: Prisma.TransactionClient, accountId: string, versionId: string) {
  if (menuAccess(accountId, 'ack').status !== 200) return false;
  return !!await tx.documentVersion.findFirst({ where: { id: versionId, AND: [versionScope(accountId), { document: { AND: [documentScope(accountId), { isActive: true }] } }] }, select: { id: true } });
}
function versionData(version: Version) {
  return { id: version.id, documentId: version.document.id, documentCode: version.document.documentCode, title: version.document.title,
    docType: version.document.docType, issueNo: version.issueNo, revisionNo: version.revisionNo, status: version.status, fileId: version.files[0]?.id ?? null };
}
async function currentVersion(tx: Prisma.TransactionClient, versionId: string) {
  validId(versionId);
  const version = await tx.documentVersion.findUnique({ where: { id: versionId }, include: versionInclude });
  if (!version || !version.document.isActive || version.status !== published.status || version.reviewStatus !== published.reviewStatus || version.supersededById || !await fileReady(version))
    fail(409, 'ฉบับเอกสารไม่พร้อมให้มอบหมายหรือรับทราบ');
  return version;
}
async function activeRecipient(tx: Prisma.TransactionClient, userId: string, versionId: string) {
  const account = demoAccount(userId);
  if (!account || menuAccess(account.id, 'ack').status !== 200) return false;
  const user = await tx.user.findFirst({ where: { id: userId, isActive: true }, select: { id: true } });
  return !!user && await canRead(tx, account.id, versionId);
}
function assignmentData(row: { id: string; versionId: string; assigneeId: string; assignedAt: Date; assignedById: string; confirmation: { id: string; confirmedAt: Date; confirmedById: string } | null }) {
  return { id: row.id, versionId: row.versionId, assigneeId: row.assigneeId, assignedAt: row.assignedAt, assignedById: row.assignedById,
    confirmedAt: row.confirmation?.confirmedAt ?? null, confirmedById: row.confirmation?.confirmedById ?? null };
}

export async function options(accountId: string) {
  requireDcc(accountId);
  const db = database();
  await requireActiveDcc(db, accountId);
  const [versions, activeUsers] = await Promise.all([
    db.documentVersion.findMany({ where: { ...published, supersededById: null, document: { isActive: true } }, include: versionInclude, orderBy: { createdAt: 'desc' } }),
    db.user.findMany({ where: { isActive: true }, select: { id: true, fullName: true, position: true }, orderBy: { fullName: 'asc' } }),
  ]);
  const ready = (await Promise.all(versions.map(async version => await fileReady(version) ? versionData(version) : null))).filter(v => v !== null);
  const users = activeUsers.filter(user => { const account = demoAccount(user.id); return account && menuAccess(account.id, 'ack').status === 200; });
  return { versions: ready, users };
}

export async function versionAssignments(accountId: string, versionId: string) {
  requireDcc(accountId);
  validId(versionId);
  const db = database();
  await requireActiveDcc(db, accountId);
  const version = await db.documentVersion.findUnique({ where: { id: versionId }, include: versionInclude });
  if (!version) fail(404, 'ไม่พบฉบับเอกสาร');
  const [rows, users] = await Promise.all([
    db.acknowledgementAssignment.findMany({ where: { versionId }, include: { confirmation: true, assignee: { select: { fullName: true } } }, orderBy: { assignedAt: 'asc' } }),
    db.user.findMany({ where: { isActive: true }, select: { id: true, fullName: true, position: true }, orderBy: { fullName: 'asc' } }),
  ]);
  const eligible = [];
  if (version.document.isActive && version.status === published.status && version.reviewStatus === published.reviewStatus && !version.supersededById && await fileReady(version)) {
    for (const user of users) if (await activeRecipient(db, user.id, versionId)) eligible.push(user);
  }
  return { version: versionData(version), users: eligible, assignments: rows.map(row => ({ ...assignmentData(row), assigneeName: row.assignee.fullName })) };
}

export async function assign(accountId: string, versionId: string, body: unknown) {
  requireDcc(accountId);
  validId(versionId);
  const ids = (body as { assigneeIds?: unknown } | null)?.assigneeIds;
  if (!Array.isArray(ids) || ids.length < 1 || ids.length > 100 || ids.some(id => typeof id !== 'string' || !uuidPattern.test(id)) || new Set(ids).size !== ids.length)
    fail(400, 'เลือกรายชื่อผู้รับทราบที่ไม่ซ้ำกันอย่างน้อยหนึ่งคน');
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      await database().$transaction(async tx => {
        await requireActiveDcc(tx, accountId);
        await currentVersion(tx, versionId);
        for (const id of ids as string[]) if (!await activeRecipient(tx, id, versionId)) fail(403, 'ผู้รับที่เลือกไม่มีสิทธิ์อ่านฉบับนี้หรือบัญชีไม่พร้อมใช้งาน');
        for (const id of ids as string[]) {
          const existing = await tx.acknowledgementAssignment.findUnique({ where: { versionId_assigneeId: { versionId, assigneeId: id } }, select: { id: true } });
          if (existing) continue;
          const row = await tx.acknowledgementAssignment.create({ data: { versionId, assigneeId: id, assignedById: dbUserId(accountId) } });
          await tx.auditEvent.create({ data: { actorUserId: dbUserId(accountId), actorRole: 'ISO_QA_ADMIN', action: 'CREATE', entityType: 'AcknowledgementAssignment', entityId: row.id,
            afterValue: { versionId, assigneeId: id, assignedById: dbUserId(accountId) } } });
        }
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
      return versionAssignments(accountId, versionId);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && ['P2002', 'P2034'].includes(error.code) && attempt < 3) continue;
      throw error;
    }
  }
  fail(409, 'รายการถูกเปลี่ยนพร้อมกัน กรุณาลองใหม่');
}

export async function mine(accountId: string) {
  requireAck(accountId);
  const db = database();
  const userId = dbUserId(accountId);
  if (!await db.user.findFirst({ where: { id: userId, isActive: true }, select: { id: true } })) fail(403, 'บัญชีไม่พร้อมใช้งาน');
  const rows = await db.acknowledgementAssignment.findMany({ where: { assigneeId: userId }, include: { confirmation: true, version: { include: versionInclude } }, orderBy: { assignedAt: 'desc' } });
  const assignments = await Promise.all(rows.map(async row => {
    const readable = await canRead(db, accountId, row.versionId);
    const canConfirm = readable && row.version.status === published.status && row.version.reviewStatus === published.reviewStatus && !row.version.supersededById && await fileReady(row.version);
    return { ...versionData(row.version), ...assignmentData(row), fileId: readable ? row.version.files[0]?.id ?? null : null, canConfirm: !row.confirmation && canConfirm };
  }));
  return { assignments };
}

export async function confirm(accountId: string, assignmentId: string) {
  requireAck(accountId);
  validId(assignmentId);
  const userId = dbUserId(accountId);
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      return await database().$transaction(async tx => {
        const user = await tx.user.findFirst({ where: { id: userId, isActive: true }, select: { id: true } });
        if (!user) fail(403, 'บัญชีไม่พร้อมใช้งาน');
        const row = await tx.acknowledgementAssignment.findUnique({ where: { id: assignmentId }, include: { confirmation: true, version: { include: versionInclude } } });
        if (!row || row.assigneeId !== userId) fail(403, 'ไม่มีสิทธิ์ยืนยันรายการนี้');
        if (row.confirmation) return { assignmentId, confirmation: row.confirmation };
        await currentVersion(tx, row.versionId);
        if (!await canRead(tx, accountId, row.versionId)) fail(403, 'ไม่มีสิทธิ์อ่านฉบับเอกสาร');
        const files = await tx.documentFile.findMany({ where: { versionId: row.versionId }, select: { id: true } });
        const priorAccess = await tx.auditEvent.findFirst({ where: { actorUserId: userId, action: 'EXPORT', entityType: 'DocumentFile', entityId: { in: files.map(file => file.id) }, occurredAt: { gte: row.assignedAt } }, select: { id: true } });
        if (!priorAccess) fail(409, 'กรุณาเข้าถึงไฟล์เอกสารฉบับนี้ก่อนยืนยันรับทราบ');
        const activeRole = await tx.userRole.findFirst({ where: { userId, isActive: true }, select: { role: true } });
        if (!activeRole) fail(403, 'บัญชีไม่มีบทบาทที่ใช้งาน');
        const confirmation = await tx.acknowledgementConfirmation.create({ data: { assignmentId, confirmedById: userId } });
        await tx.auditEvent.create({ data: { actorUserId: userId, actorRole: activeRole.role, action: 'ACKNOWLEDGE', entityType: 'AcknowledgementConfirmation', entityId: confirmation.id,
          afterValue: { assignmentId, versionId: row.versionId, confirmedById: userId } } });
        return { assignmentId, confirmation };
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && ['P2002', 'P2034'].includes(error.code) && attempt < 3) continue;
      throw error;
    }
  }
  fail(409, 'รายการถูกเปลี่ยนพร้อมกัน กรุณาลองใหม่');
}
