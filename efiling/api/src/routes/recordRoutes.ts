import { Router } from 'express';
import multer from 'multer';
import { randomUUID } from 'node:crypto';
import { requireUser } from '../middleware/auth.js';
import { DocumentError } from '../services/documentRules.js';
import { incomingRoot, maxFileBytes, prepareRecordStorage } from '../services/recordStorage.js';
import * as service from '../services/recordService.js';

export function recordRouter() {
  const router = Router();
  const upload = multer({ storage: multer.diskStorage({ destination: (_req, _file, cb) => cb(null, incomingRoot), filename: (_req, _file, cb) => cb(null, randomUUID()) }), limits: { fileSize: maxFileBytes, files: 5, fields: 10, parts: 15 } });
  router.use(requireUser);
  router.get('/options', async (req, res) => { res.json(await service.options(req.session.userId!)); });
  router.get('/', async (req, res) => { res.json(await service.list(req.session.userId!, req.query)); });
  router.get('/evidence/:id', async (req, res) => {
    const file = await service.evidence(req.session.userId!, String(req.params.id));
    const name = encodeURIComponent(file.fileName).replace(/['()*]/g, c => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
    res.set({ 'Content-Type': file.mimeType, 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'private, no-store', 'Content-Disposition': `attachment; filename="evidence"; filename*=UTF-8''${name}` });
    res.sendFile(file.path, { dotfiles: 'allow' });
  });
  router.get('/:id', async (req, res) => { res.json(await service.detail(req.session.userId!, String(req.params.id))); });
  router.patch('/:id', async (req, res) => { res.json(await service.update(req.session.userId!, String(req.params.id), req.body)); });
  router.post('/', async (_req, _res, next) => { await prepareRecordStorage(); next(); }, upload.array('files', 5), async (req, res) => {
    if (!req.body || typeof req.body !== 'object') throw new DocumentError(400, 'ข้อมูลบันทึกไม่ถูกต้อง');
    res.status(201).json(await service.create(req.session.userId!, req.body, req.files as Express.Multer.File[] || []));
  });
  router.use((error: unknown, _req: import('express').Request, _res: import('express').Response, next: import('express').NextFunction) => {
    if (error instanceof multer.MulterError) {
      next(new DocumentError(error.code === 'LIMIT_FILE_SIZE' ? 413 : 400, error.code === 'LIMIT_FILE_SIZE' ? `ไฟล์หลักฐานต้องไม่เกิน ${maxFileBytes / 1024 / 1024} MB` : 'จำนวนไฟล์หรือข้อมูลอัปโหลดไม่ถูกต้อง'));
      return;
    }
    next(error);
  });
  return router;
}
