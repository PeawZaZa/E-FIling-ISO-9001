import { Router } from 'express';
import multer from 'multer';
import { randomUUID } from 'node:crypto';
import { requireUser } from '../middleware/auth.js';
import { MAX_PDF_BYTES } from '../services/documentRules.js';
import { incomingRoot, prepareStorage } from '../services/documentStorage.js';
import * as controller from '../controllers/darController.js';
export function darRouter() { const router = Router(); router.use(requireUser); const upload = multer({ storage: multer.diskStorage({ destination: (_r, _f, cb) => cb(null, incomingRoot), filename: (_r, _f, cb) => cb(null, randomUUID()) }), limits: { fileSize: MAX_PDF_BYTES, files: 1, fields: 1, parts: 3 } }); router.get('/', controller.list); router.get('/files/:id', controller.file); router.get('/:id', controller.detail); router.post('/', controller.create); router.patch('/:id', controller.update); router.post('/:id/files', async (_req, _res, next) => { await prepareStorage(); next(); }, upload.single('file'), controller.upload); router.post('/:id/:action', controller.command); return router; }
