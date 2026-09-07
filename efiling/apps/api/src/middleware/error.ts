import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { HttpError } from '../lib/http-error.js';

/** ตัวจัดการข้อผิดพลาดตัวสุดท้าย แปลงทุกอย่างเป็นรูปแบบเดียวกัน */
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, detail: err.detail });
  }
  if (err instanceof ZodError) {
    return res.status(400).json({ error: 'ข้อมูลที่ส่งมาไม่ถูกต้อง', detail: err.issues });
  }
  console.error(err);
  return res.status(500).json({ error: 'เกิดข้อผิดพลาดภายในระบบ' });
}
