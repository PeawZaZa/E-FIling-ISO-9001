import { access, constants } from 'node:fs/promises';
import { database } from '../lib/prisma.js';
import { dbUserId, DocumentError } from './documentRules.js';
import { accessible, actorRole, filled, fileSummary, uuid } from './carAccess.js';
import { mutate } from './carService.js';
import { discardEvidence, inspectEvidence, recordPath, storeEvidence } from './recordStorage.js';
import { detail as recordDetail } from './recordService.js';

export async function result(who: string, id: string, activityId: string, body: Record<string, unknown>, files: Express.Multer.File[]) {
  const stored: { key: string; file: Express.Multer.File; mime: string }[] = [];
  try {
    if (!uuid(activityId) || !filled(body.resultNote)) throw new DocumentError(400, 'ระบุกิจกรรมและผลการดำเนินการ');
    if (body.recordId) {
      if (!uuid(body.recordId)) throw new DocumentError(400, 'รหัสบันทึกไม่ถูกต้อง');
      await recordDetail(who, body.recordId);
    }
    for (const file of files) {
      if (file.originalname.length > 255) throw new DocumentError(400, 'ชื่อไฟล์ยาวเกินไป');
      const inspected = await inspectEvidence(file);
      stored.push({ key: await storeEvidence(file, inspected.ext), file, mime: inspected.mime });
    }
    await mutate(who, id, async (tx, row) => {
      if (who !== 'carowner' || row.ownerUserId !== dbUserId(who)) throw new DocumentError(403, 'เฉพาะผู้รับผิดชอบของใบนี้');
      if (row.currentStatus !== 'IMPLEMENTING') throw new DocumentError(409, 'บันทึกผลได้หลังอนุมัติแผนเท่านั้น');
      const plan = row.actionPlans.find(p => p.isCurrent);
      const activity = plan?.activities.find(a => a.id === activityId);
      if (!activity || !plan?.approvals.some(a => a.result === 'PLAN_APPROVED')) throw new DocumentError(409, 'ต้องใช้กิจกรรมในแผนปัจจุบันที่อนุมัติแล้ว');
      const actorUserId = dbUserId(who), role = await actorRole(tx, who);
      await tx.actionPlanActivity.update({ where: { id: activityId }, data: { resultNote: (body.resultNote as string).trim(), completedAt: new Date() } });
      if (body.recordId) {
        const recordId = body.recordId as string;
        await tx.activityRecordLink.upsert({ where: { activityId_recordId: { activityId, recordId } }, create: { activityId, recordId }, update: {} });
        await tx.auditEvent.create({ data: { actorUserId, actorRole: role, action: 'ATTACH_EVIDENCE', entityType: 'CorrectiveRequest', entityId: id, afterValue: { activityId, recordId } } });
      }
      for (const item of stored) {
        const evidence = await tx.evidence.create({ data: { requestId: id, activityId, fileName: item.file.originalname, mimeType: item.mime, sizeBytes: BigInt(item.file.size), storagePath: item.key, uploadedById: actorUserId } });
        await tx.auditEvent.create({ data: { actorUserId, actorRole: role, action: 'ATTACH_EVIDENCE', entityType: 'Evidence', entityId: evidence.id, afterValue: { requestId: id, activityId, fileName: evidence.fileName } } });
      }
      await tx.auditEvent.create({ data: { actorUserId, actorRole: role, action: 'UPDATE', entityType: 'CorrectiveRequest', entityId: id, beforeValue: { activityId, resultNote: activity.resultNote }, afterValue: { activityId, resultNote: body.resultNote as string } } });
    });
    return { saved: true };
  } catch (error) { await Promise.all(stored.map(s => discardEvidence(recordPath(s.key)))); throw error; }
  finally { await Promise.all(files.map(f => discardEvidence(f.path))); }
}
export async function evidence(who: string, id: string, evidenceId: string) {
  const row = await accessible(database(), who, id);
  if (!uuid(evidenceId)) throw new DocumentError(403, 'ไม่สามารถเข้าถึงหลักฐาน');
  // Source record evidence is exposed only through this already-authorized request.
  const file = await database().evidence.findFirst({ where: { id: evidenceId, OR: [{ requestId: row.id }, { findingId: row.findingId }, { record: { activityLinks: { some: { activity: { plan: { requestId: id } } } } } }, ...(row.finding.recordId ? [{ recordId: row.finding.recordId }] : [])] }, select: { ...fileSummary, storagePath: true } });
  if (!file) throw new DocumentError(403, 'ไม่สามารถเข้าถึงหลักฐาน');
  const path = recordPath(file.storagePath), actorUserId = dbUserId(who), role = await actorRole(database(), who);
  try { await access(path, constants.R_OK); } catch { throw new DocumentError(503, 'ไฟล์หลักฐานไม่พร้อมใช้งาน'); }
  await database().auditEvent.create({ data: { actorUserId, actorRole: role, action: 'EXPORT', entityType: 'Evidence', entityId: file.id, afterValue: { requestId: id } } });
  return { ...file, path };
}
