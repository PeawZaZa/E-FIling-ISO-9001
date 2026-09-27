import { Router } from 'express';
import { requireUser } from '../middleware/auth.js';
import { summary } from '../services/dashboardService.js';

export function dashboardRouter() {
  const router = Router();
  router.use(requireUser);
  router.get('/', async (req, res) => { res.json(await summary(req.session.userId!)); });
  return router;
}
