import { Router } from 'express';
import multer from 'multer';
import { randomUUID } from 'node:crypto';
import { requireUser } from '../middleware/auth.js';
import { DocumentError } from '../services/documentRules.js';
import { incomingRoot, maxFileBytes, prepareRecordStorage } from '../services/recordStorage.js';
import * as service from '../services/auditService.js';

export function auditRouter() {
  const router = Router();
  const upload = multer({ storage: multer.diskStorage({ destination: (_req, _file, cb) => cb(null, incomingRoot), filename: (_req, _file, cb) => cb(null, randomUUID()) }), limits: { fileSize: maxFileBytes, files: 5, fields: 15, parts: 20 } });
  router.use(requireUser);
  router.get('/options', async (req, res) => { res.json(await service.options(req.session.userId!)); });
  router.get('/rounds', async (req, res) => { res.json(await service.listRounds(req.session.userId!)); });
  router.post('/rounds', async (req, res) => { res.status(201).json(await service.createRound(req.session.userId!, req.body || {})); });
  router.get('/rounds/:id', async (req, res) => { res.json(await service.roundDetail(req.session.userId!, String(req.params.id))); });
  router.get('/findings', async (req, res) => { res.json(await service.listFindings(req.session.userId!, req.query)); });
  router.post('/findings', async (_req, _res, next) => { await prepareRecordStorage(); next(); }, upload.array('files', 5), async (req, res) => { res.status(201).json(await service.createFinding(req.session.userId!, req.body || {}, req.files as Express.Multer.File[] || [])); });
  router.get('/findings/:id', async (req, res) => { res.json(await service.findingDetail(req.session.userId!, String(req.params.id))); });
  router.get('/evidence/:id', async (req, res) => {
    const file = await service.evidence(req.session.userId!, String(req.params.id));
    const name = encodeURIComponent(file.fileName).replace(/['()*]/g, c => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
    res.set({ 'Content-Type': file.mimeType, 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'private, no-store', 'Content-Disposition': `attachment; filename="evidence"; filename*=UTF-8''${name}` });
    res.sendFile(file.path, { dotfiles: 'allow' });
  });
  router.use((error: unknown, _req: import('express').Request, _res: import('express').Response, next: import('express').NextFunction) => {
    if (error instanceof multer.MulterError) { next(new DocumentError(error.code === 'LIMIT_FILE_SIZE' ? 413 : 400, error.code === 'LIMIT_FILE_SIZE' ? `ไฟล์หลักฐานต้องไม่เกิน ${maxFileBytes / 1024 / 1024} MB` : 'จำนวนไฟล์หรือข้อมูลอัปโหลดไม่ถูกต้อง')); return; }
    next(error);
  });
  return router;
}
