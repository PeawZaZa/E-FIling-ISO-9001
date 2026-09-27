import { Router } from 'express';
import { health, databaseHealth } from '../controllers/healthController.js';
export function healthRouter(checkDatabase: () => Promise<void>) {
  const router = Router();
  router.use((_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
  router.get('/', health);
  router.get('/db', databaseHealth(checkDatabase));
  return router;
}
