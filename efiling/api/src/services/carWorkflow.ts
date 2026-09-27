import { Prisma, type RequestStatus, type ActionKind } from '@prisma/client';
import { requireEvidenceFiles } from './recordStorage.js';
import { dbUserId, DocumentError } from './documentRules.js';
import { accessible, actorRole, canVerify, date, filled, uuid } from './carAccess.js';

type Row = Awaited<ReturnType<typeof accessible>>;
const transitions: Record<string, [RequestStatus, RequestStatus]> = {
  start: ['OPEN', 'CORRECTION'], correction: ['CORRECTION', 'ANALYSIS_PLANNING'],
  'save-correction': ['CORRECTION', 'CORRECTION'], 'save-analysis': ['ANALYSIS_PLANNING', 'ANALYSIS_PLANNING'],
  'save-plan': ['ANALYSIS_PLANNING', 'ANALYSIS_PLANNING'],
  'submit-plan': ['ANALYSIS_PLANNING', 'PENDING_PLAN_APPROVAL'], approve: ['PENDING_PLAN_APPROVAL', 'IMPLEMENTING'],
  reject: ['PENDING_PLAN_APPROVAL', 'ANALYSIS_PLANNING'], 'submit-verification': ['IMPLEMENTING', 'PENDING_VERIFICATION'],
  'verify-pass': ['PENDING_VERIFICATION', 'PENDING_CLOSURE'], 'verify-fail': ['PENDING_VERIFICATION', 'ANALYSIS_PLANNING'],
};
async function submitPlan(tx: Prisma.TransactionClient, row: Row, actor: string, body: Record<string, unknown>) {
  if (!filled(body.rootCause) || !filled(body.technique) || body.technique.length > 200 || [body.correctiveSummary, body.preventiveSummary].some(v => v !== undefined && (typeof v !== 'string' || v.length > 5000)) || !Array.isArray(body.activities) || !body.activities.length || body.activities.length > 50) throw new DocumentError(400, 'ระบุสาเหตุ เทคนิค แผนแก้ไข แผนป้องกัน และกิจกรรมให้ครบ');
  const activities: { kind: ActionKind; description: string; responsibleUserId: string; dueDate: Date }[] = [];
  for (const [index, item] of body.activities.entries()) {
    if (!item || !['CORRECTIVE', 'PREVENTIVE'].includes(item.kind) || !filled(item.description) || !uuid(item.responsibleUserId) || !date(item.dueDate)) throw new DocumentError(400, `กิจกรรม ${index + 1} ต้องมีรายละเอียด ผู้รับผิดชอบ และกำหนดเวลา`);
    if (!await tx.user.findFirst({ where: { id: item.responsibleUserId, isActive: true } })) throw new DocumentError(400, `ผู้รับผิดชอบกิจกรรม ${index + 1} ไม่พร้อมใช้งาน`);
    activities.push({ kind: item.kind, description: item.description.trim(), responsibleUserId: item.responsibleUserId, dueDate: new Date(item.dueDate) });
  }
  await tx.rootCauseAnalysis.create({ data: { requestId: row.id, rootCause: body.rootCause.trim(), technique: body.technique.trim(), recordedById: actor } });
  await tx.actionPlan.updateMany({ where: { requestId: row.id, isCurrent: true }, data: { isCurrent: false } });
  await tx.actionPlan.create({ data: { requestId: row.id, revision: (row.actionPlans[0]?.revision || 0) + 1, correctiveSummary: typeof body.correctiveSummary === 'string' ? body.correctiveSummary.trim() : '', preventiveSummary: typeof body.preventiveSummary === 'string' ? body.preventiveSummary.trim() : '', submittedById: actor, activities: { create: activities } } });
}
export async function performAction(tx: Prisma.TransactionClient, who: string, row: Row, body: Record<string, unknown>) {
  const action = String(body.action), transition = transitions[action], actor = dbUserId(who);
  if (!transition) throw new DocumentError(409, 'คำสั่งนี้ยังไม่เปิดใช้งาน; การปิดใบและอำนาจที่เกี่ยวข้องยังรอยืนยัน');
  if (row.currentStatus !== transition[0]) throw new DocumentError(409, 'สถานะปัจจุบันไม่อนุญาตคำสั่งนี้ ห้ามข้ามขั้น');
  const plan = row.actionPlans.find(p => p.isCurrent);
  if (action === 'approve' || action === 'reject') {
    if (who !== 'qmr' || plan?.submittedById === actor) throw new DocumentError(403, 'เฉพาะ QMR ที่ไม่ใช่ผู้จัดทำแผน');
  } else if (action.startsWith('verify-')) {
    if (!canVerify(who, row)) throw new DocumentError(403, 'ต้องเป็นผู้แจ้งเดิม และไม่ใช่ผู้รับผิดชอบการแก้ไข');
  } else if (who !== 'carowner' || row.ownerUserId !== actor) throw new DocumentError(403, 'เฉพาะผู้รับผิดชอบของใบนี้');
  const role = await actorRole(tx, who);
  if (action === 'start' && (!row.ownerUserId || !row.overallDueDate)) throw new DocumentError(400, 'ต้องมีผู้รับผิดชอบและกำหนดเวลา');
  if (action === 'correction' || action === 'save-correction') {
    if (!filled(body.detail)) throw new DocumentError(400, 'ระบุการแก้ไขเฉพาะหน้า');
    await tx.correction.create({ data: { requestId: row.id, detail: body.detail.trim(), recordedById: actor } });
  }
  if (action === 'save-analysis') {
    if (!filled(body.rootCause) || !filled(body.technique) || body.technique.length > 200) throw new DocumentError(400, 'ระบุสาเหตุและเทคนิคที่ใช้');
    await tx.rootCauseAnalysis.create({ data: { requestId: row.id, rootCause: body.rootCause.trim(), technique: body.technique.trim(), recordedById: actor } });
  }
  if (action === 'submit-plan') await submitPlan(tx, row, actor, body);
  if (action === 'save-plan') {
    const draft: Record<string, Prisma.InputJsonValue> = {};
    for (const key of ['rootCause', 'technique', 'correctiveSummary', 'preventiveSummary']) {
      if (body[key] !== undefined && (typeof body[key] !== 'string' || (body[key] as string).length > (key === 'technique' ? 200 : 5000))) throw new DocumentError(400, 'ข้อมูลร่างไม่ถูกต้อง');
      draft[key] = (body[key] as string) || '';
    }
    if (!Array.isArray(body.activities) || body.activities.length > 50) throw new DocumentError(400, 'รายการกิจกรรมไม่ถูกต้อง');
    draft.activities = body.activities.map(item => {
      if (!item || typeof item !== 'object') throw new DocumentError(400, 'กิจกรรมไม่ถูกต้อง');
      const activity: Record<string, string> = {};
      for (const key of ['kind', 'description', 'responsibleUserId', 'dueDate']) {
        if (item[key] !== undefined && (typeof item[key] !== 'string' || item[key].length > 5000)) throw new DocumentError(400, 'กิจกรรมไม่ถูกต้อง');
        activity[key] = item[key] || '';
      }
      return activity;
    });
    await tx.correctiveRequest.update({ where: { id: row.id }, data: { planDraft: draft } });
  }
  if (action === 'approve' || action === 'reject') {
    if (!plan) throw new DocumentError(409, 'ไม่พบแผนปัจจุบัน');
    if (action === 'reject' && !filled(body.reason)) throw new DocumentError(400, 'ระบุเหตุผลที่ไม่อนุมัติ');
    await tx.planApproval.create({ data: { planId: plan.id, result: action === 'approve' ? 'PLAN_APPROVED' : 'PLAN_REJECTED', decidedById: actor, actorRole: role, reason: filled(body.reason) ? body.reason.trim() : null } });
  }
  if (action === 'submit-verification' && (!plan || !plan.approvals.some(a => a.result === 'PLAN_APPROVED') || !plan.activities.length || plan.activities.some(a => !a.resultNote?.trim() || !a.completedAt || (!a.evidence.length && !a.recordLinks.some(l => l.record.evidence.length))))) throw new DocumentError(400, 'ทุกกิจกรรมของแผนที่อนุมัติต้องมีผลและหลักฐาน');
  if (action === 'submit-verification' && plan) {
    const ids = plan.activities.flatMap(activity => [...activity.evidence, ...activity.recordLinks.flatMap(link => link.record.evidence)].map(file => file.id));
    const files = await tx.evidence.findMany({ where: { id: { in: ids } }, select: { storagePath: true, sizeBytes: true } });
    await requireEvidenceFiles(files);
  }
  if (action.startsWith('verify-')) {
    if (!filled(body.reason)) throw new DocumentError(400, 'ระบุความเห็นหรือเหตุผลผลการตรวจ');
    await tx.verification.create({ data: { requestId: row.id, result: action === 'verify-pass' ? 'EFFECTIVE' : 'NOT_EFFECTIVE', comment: body.reason.trim(), verifiedById: actor, actorRole: role } });
  }
  await tx.correctiveRequest.update({ where: { id: row.id }, data: { currentStatus: transition[1], ...(action === 'submit-plan' ? { planDraft: Prisma.DbNull } : {}) } });
  const reason = filled(body.reason) ? body.reason.trim() : null;
  if (transition[0] !== transition[1]) await tx.requestStatusHistory.create({ data: { requestId: row.id, fromStatus: transition[0], toStatus: transition[1], action, actorUserId: actor, actorRole: role, reason } });
  await tx.auditEvent.create({ data: { actorUserId: actor, actorRole: role, action: transition[0] === transition[1] ? 'UPDATE' : 'STATUS_CHANGE', entityType: 'CorrectiveRequest', entityId: row.id, reason, beforeValue: { status: row.currentStatus, planId: plan?.id || null }, afterValue: { status: transition[1], command: action } } });
}
