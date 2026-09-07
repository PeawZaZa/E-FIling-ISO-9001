import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../db.js';
import { unauthorized } from '../lib/http-error.js';

interface TokenPayload {
  sub: string;
}

/**
 * ตรวจวาระการใช้งานจากส่วนหัว Authorization
 *
 * โหลดผู้ใช้จากฐานข้อมูลทุกครั้งแทนการเชื่อข้อมูลในโทเค็น เพื่อให้การปิด
 * ใช้งานบัญชี (isActive เป็นเท็จ) มีผลทันทีโดยไม่ต้องรอโทเค็นหมดอายุ
 */
export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) throw unauthorized();

    const payload = jwt.verify(header.slice(7), env.jwtSecret) as TokenPayload;
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: { role: true },
    });
    if (!user || !user.isActive) throw unauthorized('บัญชีผู้ใช้ถูกปิดใช้งานหรือไม่มีอยู่');

    req.user = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      roleCode: user.role.code,
      departmentId: user.departmentId,
    };
    next();
  } catch (err) {
    next(err instanceof Error && err.name === 'JsonWebTokenError' ? unauthorized('โทเค็นไม่ถูกต้อง') : err);
  }
}
