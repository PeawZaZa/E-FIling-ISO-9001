import { Router } from 'express';
import { requireUser } from '../middleware/auth.js';
import * as controller from '../controllers/acknowledgementController.js';

export function acknowledgementRouter() {
  const router = Router();
  router.use(requireUser);
  router.get('/options', controller.options);
  router.get('/mine', controller.mine);
  router.get('/versions/:id', controller.versionAssignments);
  router.post('/versions/:id/assign', controller.assign);
  router.post('/:id/confirm', controller.confirm);
  return router;
}
