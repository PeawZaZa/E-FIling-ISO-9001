import type { Prisma } from '@prisma/client';
import { database } from '../lib/prisma.js';
import { dbUserId, DocumentError } from './documentRules.js';
import { findingDetail } from './auditService.js';
import { accessible, actorRole, capabilities, creators, date, denied, include, person, scope, uuid } from './carAccess.js';
import { performAction } from './carWorkflow.js';
import { dueRequests } from './carDue.js';

export async function options(who: string) {
  scope(who);
  return { canCreate: creators.has(who), records: who === 'carowner' ? await database().qualityRecord.findMany({ where: { OR: [{ ownerUserId: dbUserId(who) }, { createdById: dbUserId(who) }] }, select: { id: true, title: true }, take: 200, orderBy: { createdAt: 'desc' } }) : [], users: await database().user.findMany({ where: { isActive: true }, select: { ...person, roles: { select: { role: true } } } }), departments: await database().department.findMany({ where: { isActive: true }, select: { id: true, nameTh: true } }) };
}
export async function list(who: string, overdueOnly = false) {
  scope(who); // Sponsor can see only Dashboard aggregates, never this detail list.
  const rows = await dueRequests(who);
  return { requests: overdueOnly ? rows.filter(row => row.due.state === 'OVERDUE') : rows.slice(0, 200) };
}
export async function detail(who: string, id: string) {
  const row = await accessible(database(), who, id);
  return { request: row, actions: capabilities(who, row), stageDeadlinePending: true, verificationBlocked: !['auditor', 'lead'].map(dbUserId).includes(row.finding.identifiedById) || row.ownerUserId === row.finding.identifiedById };
}
export async function create(who: string, body: Record<string, unknown>) {
  if (!creators.has(who)) throw new DocumentError(403, 'ไม่มีสิทธิ์เปิดใบคำร้อง');
  if (!uuid(body.findingId) || !uuid(body.ownerUserId) || !uuid(body.departmentId) || !date(body.overallDueDate)) throw new DocumentError(400, 'ระบุประเด็น ผู้รับผิดชอบ กลุ่มงาน และกำหนดเวลารวมให้ครบ');
  const { finding } = await findingDetail(who, body.findingId);
  if (finding.findingType !== 'NONCONFORMITY') throw new DocumentError(409, 'การเปิดใบจากข้อสังเกต/ข้อเสนอแนะยังรอยืนยัน');
  if (!['INTERNAL_AUDIT', 'MANAGEMENT_REVIEW'].includes(finding.source)) throw new DocumentError(409, 'ประเภทใบจากแหล่งนี้ยังรอยืนยัน');
  if (finding.departmentId && finding.departmentId !== body.departmentId) throw new DocumentError(400, 'กลุ่มงานต้องตรงกับประเด็นต้นทาง');
  const db = database(), ownerId = body.ownerUserId, departmentId = body.departmentId;
  const [owner, department] = await Promise.all([
    db.user.findFirst({ where: { id: ownerId, isActive: true, roles: { some: { role: 'CAR_OWNER' } } } }),
    db.department.findFirst({ where: { id: departmentId, isActive: true } }),
  ]);
  if (!owner || !department) throw new DocumentError(400, 'ผู้รับผิดชอบหรือกลุ่มงานไม่พร้อมใช้งาน');
  return db.$transaction(async tx => {
    // Serialize creation across both request types: existing schema has a shared annual uniqueness constraint.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(709001)`;
    const existing = await tx.correctiveRequest.findFirst({ where: { findingId: finding.id, currentStatus: { not: 'CLOSED' } } });
    if (existing) throw new DocumentError(409, `ประเด็นนี้มีใบเปิดค้าง ${existing.requestNo}`);
    const currentFinding = await tx.finding.findUniqueOrThrow({ where: { id: finding.id } });
    if (currentFinding.status !== 'FINDING_OPEN') throw new DocumentError(409, 'ต้องใช้ประเด็นที่ยังเปิดอยู่');
    const year = Number(new Intl.DateTimeFormat('en-US', { year: 'numeric', timeZone: 'Asia/Bangkok' }).format(new Date())) + 543;
    const last = await tx.correctiveRequest.aggregate({ where: { buddhistYear: year }, _max: { sequenceNo: true } });
    const sequenceNo = (last._max.sequenceNo || 0) + 1, actorUserId = dbUserId(who), role = await actorRole(tx, who);
    const row = await tx.correctiveRequest.create({ data: { requestNo: `${String(sequenceNo).padStart(3, '0')}/${year}`, buddhistYear: year, sequenceNo, requestType: finding.source === 'INTERNAL_AUDIT' ? 'CAR' : 'NCR', findingId: finding.id, departmentId, severity: finding.severity, ownerUserId: ownerId, overallDueDate: new Date(body.overallDueDate as string), openedById: actorUserId } });
    await tx.requestStatusHistory.create({ data: { requestId: row.id, toStatus: 'OPEN', action: 'เปิดใบ', actorUserId, actorRole: role } });
    await tx.auditEvent.create({ data: { actorUserId, actorRole: role, action: 'CREATE', entityType: 'CorrectiveRequest', entityId: row.id, afterValue: { findingId: finding.id, requestNo: row.requestNo, ownerUserId: ownerId, overallDueDate: body.overallDueDate as string } } });
    return row;
  });
}
export async function mutate<T>(who: string, id: string, fn: (tx: Prisma.TransactionClient, row: Awaited<ReturnType<typeof accessible>>) => Promise<T>) {
  try {
    return await database().$transaction(async tx => {
      if (!uuid(id)) throw new DocumentError(403, 'ไม่สามารถเข้าถึงใบคำร้อง');
      await tx.$queryRaw`SELECT id FROM corrective_request WHERE id = ${id}::uuid FOR UPDATE`;
      return fn(tx, await accessible(tx, who, id));
    });
  } catch (error) {
    if (error instanceof DocumentError && error.status === 403) await denied(who, id);
    throw error;
  }
}
export async function action(who: string, id: string, body: Record<string, unknown>) {
  await mutate(who, id, (tx, row) => performAction(tx, who, row, body));
  return detail(who, id);
}
