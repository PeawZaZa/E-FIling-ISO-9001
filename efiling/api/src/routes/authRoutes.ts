import { Router } from 'express';
import * as controller from '../controllers/authController.js';
import { demoSession } from '../middleware/session.js';
import { requireClient, requireUser, validateLogin } from '../middleware/auth.js';
export function authRouter() {
  const router = Router();
  router.use((_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
  router.use(demoSession(), requireClient);
  router.get('/auth/demo-accounts', controller.listAccounts);
  router.post('/auth/login', validateLogin, controller.login);
  router.get('/auth/me', requireUser, controller.me);
  router.post('/auth/logout', controller.logout);
  router.get('/modules/:module/access', requireUser, controller.access);
  return router;
}
