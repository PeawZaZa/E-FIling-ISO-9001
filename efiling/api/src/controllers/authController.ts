import type { RequestHandler } from 'express';
import { authenticate, identity, demoAccounts, menuAccess } from '../services/authService.js';

export const listAccounts: RequestHandler = (_req, res) => { res.json({ accounts: demoAccounts() }); };
export const login: RequestHandler = (req, res, next) => {
    const { email, password } = req.body ?? {};
    const user = authenticate(email, password);
    if (!user) {
      res.status(401).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }); return;
    }
    req.session.regenerate(error => {
      if (error) { next(error); return; }
      req.session.userId = user.id;
      req.session.save(error => {
        if (error) { next(error); return; }
        res.json(identity(user.id));
      });
    });
};
export const me: RequestHandler = (req, res) => { res.json(identity(req.session.userId!)); };
export const logout: RequestHandler = (req, res, next) => {
    req.session.destroy(error => {
      if (error) { next(error); return; }
      res.clearCookie('efiling.sid', { httpOnly: true, sameSite: 'strict', secure: false });
      res.sendStatus(204);
    });
};
export const access: RequestHandler = (req, res) => {
  const result = menuAccess(req.session.userId!, String(req.params.module));
  res.status(result.status).json(result.body);
};
