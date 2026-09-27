import { Router } from 'express';
import multer from 'multer';
import { randomUUID } from 'node:crypto';
import { requireUser } from '../middleware/auth.js';
import { incomingRoot, maxFileBytes, prepareRecordStorage } from '../services/recordStorage.js';
import * as service from '../services/carService.js';
import * as evidence from '../services/carEvidence.js';

export function carRouter() {
  const router = Router();
  const upload = multer({ storage: multer.diskStorage({ destination: (_req, _file, cb) => cb(null, incomingRoot), filename: (_req, _file, cb) => cb(null, randomUUID()) }), limits: { fileSize: maxFileBytes, files: 5, fields: 5 } });
  router.use(requireUser);
  router.get('/options', async (req, res) => { res.json(await service.options(req.session.userId!)); });
  router.get('/', async (req, res) => { res.json(await service.list(req.session.userId!, req.query.overdue === '1')); });
  router.post('/', async (req, res) => { res.status(201).json(await service.create(req.session.userId!, req.body || {})); });
  router.get('/:id', async (req, res) => { res.json(await service.detail(req.session.userId!, String(req.params.id))); });
  router.post('/:id/actions', async (req, res) => { res.json(await service.action(req.session.userId!, String(req.params.id), req.body || {})); });
  router.post('/:id/activities/:activityId/result', async (_req, _res, next) => { await prepareRecordStorage(); next(); }, upload.array('files', 5), async (req, res) => { res.json(await evidence.result(req.session.userId!, String(req.params.id), String(req.params.activityId), req.body || {}, req.files as Express.Multer.File[] || [])); });
  router.get('/:id/evidence/:evidenceId', async (req, res) => {
    const file = await evidence.evidence(req.session.userId!, String(req.params.id), String(req.params.evidenceId));
    const name = encodeURIComponent(file.fileName).replace(/['()*]/g, c => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
    res.set({ 'Content-Type': file.mimeType, 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'private, no-store', 'Content-Disposition': `attachment; filename="evidence"; filename*=UTF-8''${name}` });
    res.sendFile(file.path, { dotfiles: 'allow' });
  });
  return router;
}
