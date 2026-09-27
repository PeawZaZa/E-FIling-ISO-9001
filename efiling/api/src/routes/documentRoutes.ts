import { Router } from 'express';
import multer from 'multer';
import { randomUUID } from 'node:crypto';
import { requireUser } from '../middleware/auth.js';
import { MAX_PDF_BYTES, requireDcc } from '../services/documentRules.js';
import { incomingRoot, prepareStorage } from '../services/documentStorage.js';
import * as controller from '../controllers/documentController.js';

export function documentRouter() {
  const router = Router();
  const upload = multer({storage:multer.diskStorage({destination:(_req,_file,cb)=>cb(null,incomingRoot),filename:(_req,_file,cb)=>cb(null,randomUUID())}),limits:{fileSize:MAX_PDF_BYTES,files:1,fields:14,fieldSize:16384,parts:16}});
  router.use(requireUser);
  router.get('/',controller.list);
  router.get('/files/:id',controller.file);
  router.get('/:id',controller.detail);
  router.post('/',async (req,_res,next)=>{requireDcc(req.session.userId!); await prepareStorage(); next();},upload.single('file'),controller.importPdf);
  router.patch('/versions/:id',controller.update);
  return router;
}
