import type { Prisma, RequestStatus } from '@prisma/client';
import { database } from '../lib/prisma.js';
import { dbUserId, DocumentError } from './documentRules.js';

export const uuid = (v: unknown): v is string => typeof v === 'string' && /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(v);
export const filled = (v: unknown): v is string => typeof v === 'string' && !!v.trim() && v.length <= 5000;
export const date = (v: unknown): v is string => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && Number.isFinite(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v;
export const creators = new Set(['dcc', 'auditor', 'lead']);
export const person = { id: true, fullName: true } as const;
export const fileSummary = { id: true, fileName: true, mimeType: true } as const;
export const include = {
  owner: { select: person }, department: { select: { id: true, nameTh: true } },
  finding: { select: { id: true, identifiedById: true, description: true, source: true, violatedRequirement: true, documentId: true, recordId: true, record: { select: { id: true, title: true, evidence: { select: fileSummary } } }, evidence: { select: fileSummary } } },
  corrections: { orderBy: { recordedAt: 'desc' } }, rootCauses: { orderBy: { recordedAt: 'desc' } },
  actionPlans: { orderBy: { revision: 'desc' }, include: { activities: { include: { responsible: { select: person }, evidence: { select: fileSummary }, recordLinks: { include: { record: { select: { id: true, title: true, evidence: { select: fileSummary } } } } } } }, approvals: true } },
  verifications: { orderBy: { verifiedAt: 'desc' } }, statusHistory: { orderBy: { occurredAt: 'desc' } },
} satisfies Prisma.CorrectiveRequestInclude;
export function scope(who: string): Prisma.CorrectiveRequestWhereInput {
  const id = dbUserId(who);
  if (who === 'dcc' || who === 'qmr') return {};
  if (who === 'carowner') return { ownerUserId: id };
  if (who === 'sectionhead') return { department: { users: { some: { id } } } };
  if (who === 'auditor' || who === 'lead') return { OR: [{ openedById: id }, { finding: { identifiedById: id } }, { finding: { auditRound: { members: { some: { auditorUserId: id } } } } }] };
  if (who === 'assistant' || who === 'deputy') return { id: { in: [] } };
  throw new DocumentError(403, 'ไม่มีสิทธิ์ดูใบคำร้อง');
}
export async function actorRole(tx: Prisma.TransactionClient, who: string) {
  return (await tx.userRole.findFirstOrThrow({ where: { userId: dbUserId(who) } })).role;
}
export async function denied(who: string, id: string) {
  await database().auditEvent.create({ data: { actorUserId: dbUserId(who), actorRole: await actorRole(database(), who), action: 'PERMISSION_DENIED', entityType: 'CorrectiveRequest', entityId: uuid(id) ? id : null, reason: 'ไม่มีสิทธิ์ดำเนินการกับใบคำร้อง' } });
}
export async function accessible(tx: Prisma.TransactionClient, who: string, id: string) {
  if (!uuid(id)) throw new DocumentError(403, 'ไม่สามารถเข้าถึงใบคำร้อง');
  const row = await tx.correctiveRequest.findFirst({ where: { AND: [{ id }, scope(who)] }, include });
  if (!row) throw new DocumentError(403, 'ไม่สามารถเข้าถึงใบคำร้อง');
  return row;
}
export function capabilities(who: string, row: Awaited<ReturnType<typeof accessible>>) {
  const owner = who === 'carowner' && row.ownerUserId === dbUserId(who);
  const approver = who === 'qmr' && row.actionPlans[0]?.submittedById !== dbUserId(who);
  const verifier = canVerify(who, row);
  const map: Partial<Record<RequestStatus, string[]>> = {
    OPEN: owner ? ['start'] : [], CORRECTION: owner ? ['save-correction', 'correction'] : [],
    ANALYSIS_PLANNING: owner ? ['save-analysis', 'save-plan', 'submit-plan'] : [],
    PENDING_PLAN_APPROVAL: approver ? ['approve', 'reject'] : [],
    IMPLEMENTING: owner ? ['result', 'submit-verification'] : [],
    PENDING_VERIFICATION: verifier ? ['verify-pass', 'verify-fail'] : [],
  };
  return map[row.currentStatus] || [];
}
export function canVerify(who: string, row: Awaited<ReturnType<typeof accessible>>) {
  const actor = dbUserId(who);
  return ['auditor', 'lead'].includes(who) && row.finding.identifiedById === actor && row.ownerUserId !== actor
    && !row.actionPlans.some(plan => plan.activities.some(activity => activity.responsibleUserId === actor));
}
