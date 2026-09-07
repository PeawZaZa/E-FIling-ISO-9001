import type { NextFunction, Request, Response } from 'express';
import type { UseCaseId } from '@efiling/policy';
import { policy } from '../config/policy.js';
import { forbidden, unauthorized } from '../lib/http-error.js';

/**
 * ควบคุมสิทธิ์ตามบทบาท
 *
 * อ่านตารางสิทธิ์จาก Policy Pack ที่เดียว จึงสลับระหว่างแบบ 10 บทบาท
 * ของเอกสารรวม กับแบบ 4 บทบาทของแบบเสนอหัวข้อได้โดยไม่แตะเส้นทางใด ๆ
 */
export function requireUseCase(useCase: UseCaseId) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(unauthorized());
    req.useCase = useCase;

    const allowed = policy.roles.permissions[req.user.roleCode] ?? [];
    if (!allowed.includes(useCase)) {
      return next(
        forbidden(`บทบาท ${req.user.roleCode} ไม่มีสิทธิ์เข้าถึง ${useCase}`),
      );
    }
    next();
  };
}
