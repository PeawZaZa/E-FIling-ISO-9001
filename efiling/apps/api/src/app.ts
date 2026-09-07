import cors from 'cors';
import express from 'express';
import { policy } from './config/policy.js';
import { errorHandler } from './middleware/error.js';
import { authRoutes } from './modules/shared/auth/auth.routes.js';
import { auditTrailRoutes } from './modules/shared/audittrail/audit-trail.routes.js';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  /** ตรวจสถานะระบบ พร้อมบอกว่ากำลังใช้ Policy Pack ตัวใด เพื่อกันหยิบผิดแพ็ก */
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      policy: {
        variant: policy.id,
        source: policy.source,
        carStates: policy.car.states,
        roles: policy.roles.all,
      },
    });
  });

  app.use('/auth', authRoutes);
  app.use('/audit-trail', auditTrailRoutes);

  app.use(errorHandler);
  return app;
}
