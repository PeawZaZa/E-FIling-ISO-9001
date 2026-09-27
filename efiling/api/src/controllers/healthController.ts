import type { RequestHandler } from 'express';
export const health: RequestHandler = (_req, res) => { res.json({ status: 'ok' }); };
export function databaseHealth(checkDatabase: () => Promise<void>): RequestHandler {
  return async (_req, res) => {
    try { await checkDatabase(); res.json({ status: 'ok' }); }
    catch { res.status(503).json({ status: 'unavailable' }); }
  };
}
