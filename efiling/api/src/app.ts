import { darRouter } from './routes/darRoutes.js';
import express from 'express';
import { authRouter } from './routes/authRoutes.js';
import { healthRouter } from './routes/healthRoutes.js';
import { errorHandler } from './middleware/error-handler.js';
import { documentRouter } from './routes/documentRoutes.js';
import { acknowledgementRouter } from './routes/acknowledgementRoutes.js';
import { recordRouter } from './routes/recordRoutes.js';
import { auditRouter } from './routes/auditRoutes.js';
import { carRouter } from './routes/carRoutes.js';
import { dashboardRouter } from './routes/dashboardRoutes.js';
export function createApp(checkDatabase: () => Promise<void>) {
  const app = express();
  app.disable('x-powered-by');
  app.use('/api/health', healthRouter(checkDatabase));
  app.use(express.json({ limit: '32kb' }));
  app.use('/api', authRouter());
  app.use('/api/documents', documentRouter());
  app.use('/api/dars', darRouter());
  app.use('/api/acknowledgements', acknowledgementRouter());
  app.use('/api/records', recordRouter());
  app.use('/api/audit', auditRouter());
  app.use('/api/cars', carRouter());
  app.use('/api/dashboard', dashboardRouter());
  app.use((_req, res) => { res.status(404).json({ status: 'not_found' }); });
  app.use(errorHandler);
  return app;
}
