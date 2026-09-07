/**
 * บันทึกร่องรอยการตรวจสอบ
 * @trace UC-14 FR-SH04
 *
 * ทุกเหตุการณ์สำคัญต้องผ่านฟังก์ชันนี้ที่เดียว เพื่อให้รูปแบบข้อมูลเหมือนกัน
 * และตรวจได้ว่าไม่มีเส้นทางใดเปลี่ยนข้อมูลโดยไม่ทิ้งร่องรอย (BRULE-EFL-04)
 */
import type { Prisma } from '@prisma/client';
import { prisma } from '../../../db.js';

export interface AuditEvent {
  actorId?: string | null;
  entityType: string;
  entityId: string;
  action: string;
  before?: unknown;
  after?: unknown;
  reason?: string | null;
}

export async function writeAuditTrail(event: AuditEvent, tx?: Prisma.TransactionClient) {
  const client = tx ?? prisma;
  await client.auditTrail.create({
    data: {
      actorId: event.actorId ?? null,
      entityType: event.entityType,
      entityId: event.entityId,
      action: event.action,
      before: (event.before ?? undefined) as Prisma.InputJsonValue | undefined,
      after: (event.after ?? undefined) as Prisma.InputJsonValue | undefined,
      reason: event.reason ?? null,
    },
  });
}

export interface AuditTrailQuery {
  entityType?: string;
  entityId?: string;
  actorId?: string;
  from?: Date;
  to?: Date;
  take?: number;
}

export async function searchAuditTrail(q: AuditTrailQuery) {
  return prisma.auditTrail.findMany({
    where: {
      entityType: q.entityType,
      entityId: q.entityId,
      actorId: q.actorId,
      createdAt: q.from || q.to ? { gte: q.from, lte: q.to } : undefined,
    },
    include: { actor: { select: { id: true, fullName: true, email: true } } },
    orderBy: { createdAt: 'desc' },
    take: Math.min(q.take ?? 100, 500),
  });
}
