/**
 * การเข้าสู่ระบบและวาระการใช้งาน
 * @trace FR-SH01 FR-SH02
 */
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../../config/env.js';
import { prisma } from '../../../db.js';
import { unauthorized } from '../../../lib/http-error.js';
import { writeAuditTrail } from '../audittrail/audit-trail.service.js';

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email }, include: { role: true } });

  // เทียบรหัสผ่านเสมอแม้ไม่พบผู้ใช้ เพื่อไม่ให้เวลาตอบกลับบอกได้ว่าอีเมลมีอยู่จริงหรือไม่
  const hash = user?.passwordHash ?? '$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidin';
  const ok = await bcrypt.compare(password, hash);

  if (!user || !ok || !user.isActive) {
    throw unauthorized('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
  }

  const token = jwt.sign({ sub: user.id }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as jwt.SignOptions['expiresIn'],
  });

  await writeAuditTrail({
    actorId: user.id,
    entityType: 'User',
    entityId: user.id,
    action: 'LOGIN',
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      roleCode: user.role.code,
      roleName: user.role.name,
      departmentId: user.departmentId,
    },
  };
}

export function hashPassword(plain: string) {
  return bcrypt.hash(plain, 10);
}
