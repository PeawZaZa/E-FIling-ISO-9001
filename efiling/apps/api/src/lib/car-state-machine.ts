/**
 * เครื่องสถานะของใบคำร้องขอให้ดำเนินการแก้ไข
 *
 * ตัวเครื่องไม่รู้จักชื่อสถานะใด ๆ เลย อ่านตารางการเปลี่ยนสถานะจาก
 * Policy Pack ทั้งหมด จึงใช้ได้ทั้งแบบห้าสถานะของเอกสารรวม
 * และแบบสี่สถานะของแบบเสนอหัวข้อโดยไม่ต้องแก้ไฟล์นี้
 *
 * ถ้าพบว่าต้องเติมเงื่อนไข if ที่เทียบชื่อสถานะตรง ๆ ในไฟล์นี้
 * แปลว่าออกแบบผิด ให้ย้ายไปเป็นข้อมูลใน Policy Pack แทน
 */
import type { CarTransition, GuardId } from '@efiling/policy';
import { policy } from '../config/policy.js';
import { badRequest, forbidden } from './http-error.js';

export interface CarSnapshot {
  readonly id: string;
  readonly status: string;
  readonly ownerId: string;
  readonly rootCause: string | null;
  readonly correctiveAction: string | null;
  readonly verifiedById: string | null;
  readonly evidenceCount: number;
}

export interface Actor {
  readonly id: string;
  readonly roleCode: string;
}

interface GuardResult {
  readonly ok: boolean;
  readonly reason: string;
}

/** ทะเบียนเงื่อนไข — Policy Pack อ้างถึงด้วยชื่อ ส่วนการตรวจจริงอยู่ที่นี่ */
const guards: Record<GuardId, (car: CarSnapshot, actor: Actor) => GuardResult> = {
  requireRootCauseAndAction: (car) => ({
    ok: Boolean(car.rootCause?.trim() && car.correctiveAction?.trim()),
    reason: 'ต้องบันทึกสาเหตุรากเหง้าและการปฏิบัติการแก้ไขให้ครบก่อน',
  }),
  requireEvidence: (car) => ({
    ok: car.evidenceCount > 0,
    reason: 'ต้องแนบหลักฐานประกอบการแก้ไขอย่างน้อยหนึ่งไฟล์',
  }),
  actorIsNotCarOwner: (car, actor) => ({
    ok: car.ownerId !== actor.id,
    reason: 'ผู้รับผิดชอบการแก้ไขทวนสอบใบคำร้องของตนเองไม่ได้',
  }),
  actorIsNotVerifier: (car, actor) => ({
    ok: car.verifiedById !== actor.id,
    reason: 'ผู้ทวนสอบกับผู้ปิดใบคำร้องต้องไม่ใช่คนเดียวกัน',
  }),
  requireVerified: (car) => ({
    ok: car.verifiedById !== null,
    reason: 'ต้องผ่านการทวนสอบก่อนจึงปิดใบคำร้องได้',
  }),
};

/** การกระทำทั้งหมดที่ผู้ใช้คนนี้สั่งกับใบคำร้องใบนี้ได้ในขณะนี้ */
export function availableActions(car: CarSnapshot, actor: Actor): CarTransition[] {
  return policy.car.transitions.filter(
    (t) =>
      t.from === car.status &&
      t.allowedRoles.includes(actor.roleCode) &&
      t.guards.every((g) => guards[g](car, actor).ok),
  );
}

/**
 * ตรวจว่าสั่งการกระทำนี้ได้หรือไม่ ถ้าไม่ได้จะโยนข้อผิดพลาดที่บอกเหตุผลชัดเจน
 * แยกเป็น 403 เมื่อบทบาทไม่ถูกต้อง และ 400 เมื่อข้อมูลยังไม่ครบ
 */
export function assertTransition(car: CarSnapshot, actor: Actor, action: string): CarTransition {
  const fromCurrent = policy.car.transitions.filter((t) => t.from === car.status);
  const candidates = fromCurrent.filter((t) => t.action === action);

  if (candidates.length === 0) {
    const allowed = fromCurrent.map((t) => t.action).join(', ') || 'ไม่มี';
    throw badRequest(
      `สั่ง "${action}" กับใบคำร้องสถานะ "${car.status}" ไม่ได้ — การกระทำที่ทำได้: ${allowed}`,
    );
  }

  const byRole = candidates.filter((t) => t.allowedRoles.includes(actor.roleCode));
  if (byRole.length === 0) {
    throw forbidden(`บทบาท ${actor.roleCode} สั่ง "${action}" ไม่ได้`);
  }

  for (const transition of byRole) {
    const failed = transition.guards
      .map((g) => guards[g](car, actor))
      .filter((r) => !r.ok);
    if (failed.length === 0) return transition;
    if (transition === byRole[byRole.length - 1]) {
      throw badRequest(failed.map((f) => f.reason).join(' · '));
    }
  }

  throw badRequest('ไม่ผ่านเงื่อนไขการเปลี่ยนสถานะ');
}

/** ใบคำร้องเกินกำหนดหรือยัง — คำนวณสด ไม่เก็บเป็นสถานะ (FR-B09) */
export function isOverdue(car: { status: string; dueDate: Date }, now = new Date()): boolean {
  return car.dueDate < now && !policy.car.closedStates.includes(car.status);
}
