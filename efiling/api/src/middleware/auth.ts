import type { RequestHandler } from 'express';
import { identity } from '../services/authService.js';
export const requireClient: RequestHandler = (req, res, next) => {
  if (req.method !== 'GET' && req.get('X-EFiling-Client') !== 'web') {
    res.status(403).json({ message: 'คำขอไม่ถูกต้อง' }); return;
  }
  next();
};
export const requireUser: RequestHandler = (req, res, next) => {
  if (!req.session.userId || !identity(req.session.userId)) {
    res.status(401).json({ message: 'กรุณาเข้าสู่ระบบ' }); return;
  }
  next();
};
export const validateLogin: RequestHandler = (req, res, next) => {
  const { email, password } = req.body ?? {};
  if (typeof email !== 'string' || typeof password !== 'string') {
    res.status(400).json({ message: 'กรุณาระบุอีเมลและรหัสผ่าน' }); return;
  }
  next();
};
