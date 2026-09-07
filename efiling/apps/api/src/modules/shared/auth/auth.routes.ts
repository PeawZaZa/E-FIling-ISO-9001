import { Router } from 'express';
import { z } from 'zod';
import { policy } from '../../../config/policy.js';
import { requireAuth } from '../../../middleware/auth.js';
import { login } from './auth.service.js';

const loginBody = z.object({
  email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง'),
  password: z.string().min(1, 'ต้องกรอกรหัสผ่าน'),
});

export const authRoutes = Router();

authRoutes.post('/login', async (req, res, next) => {
  try {
    const body = loginBody.parse(req.body);
    res.json(await login(body.email, body.password));
  } catch (err) {
    next(err);
  }
});

/** ข้อมูลผู้ใช้ปัจจุบันพร้อมรายการกรณีการใช้งานที่เข้าถึงได้ */
authRoutes.get('/me', requireAuth, (req, res) => {
  const user = req.user!;
  res.json({
    user,
    permissions: policy.roles.permissions[user.roleCode] ?? [],
  });
});
