import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../../middleware/auth.js';
import { requireUseCase } from '../../../middleware/rbac.js';
import { searchAuditTrail } from './audit-trail.service.js';

const query = z.object({
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  actorId: z.string().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  take: z.coerce.number().int().positive().optional(),
});

export const auditTrailRoutes = Router();

/** @trace UC-14 FR-SH04 */
auditTrailRoutes.get('/', requireAuth, requireUseCase('UC-14'), async (req, res, next) => {
  try {
    res.json(await searchAuditTrail(query.parse(req.query)));
  } catch (err) {
    next(err);
  }
});
