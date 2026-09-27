import type { RequestHandler } from 'express';
import { discardFile } from '../services/documentStorage.js';
import { DocumentError } from '../services/documentRules.js';
import * as service from '../services/documentService.js';

export const list: RequestHandler = async (req,res) => { res.json(await service.listDocuments(req.session.userId!,req.query)); };
export const detail: RequestHandler = async (req,res) => { res.json(await service.getDocument(req.session.userId!,String(req.params.id))); };
export const importPdf: RequestHandler = async (req,res) => {
  if (!req.file) throw new DocumentError(400,'กรุณาเลือกไฟล์ PDF');
  // Browser multipart header names arrive through busboy's latin1 default.
  const decoded = Buffer.from(req.file.originalname,'latin1').toString('utf8');
  const originalname = decoded.includes('\uFFFD') ? req.file.originalname : decoded;
  if (originalname.length > 255) {
    await discardFile(req.file.path); throw new DocumentError(400,'ชื่อไฟล์ยาวเกิน 255 ตัวอักษร');
  }
  res.status(201).json(await service.importDocument(req.session.userId!,req.body,{...req.file,originalname}));
};
export const update: RequestHandler = async (req,res) => { res.json(await service.updateImportedVersion(req.session.userId!,String(req.params.id),req.body)); };
export const file: RequestHandler = async (req,res,next) => {
  const file = await service.getDocumentFile(req.session.userId!,String(req.params.id));
  res.set({'Content-Type':'application/pdf','X-Content-Type-Options':'nosniff','Cache-Control':'private, no-store'});
  const name = encodeURIComponent(file.fileName).replace(/['()*]/g,c=>`%${c.charCodeAt(0).toString(16).toUpperCase()}`);
  res.set('Content-Disposition',`${req.query.download === '1' ? 'attachment' : 'inline'}; filename="document.pdf"; filename*=UTF-8''${name}`);
  // .local is a private parent directory; the exact random filename is authorized above.
  res.sendFile(file.path,{dotfiles:'allow'},error => {
    if (error && !res.headersSent) next(new DocumentError(404,'ไม่พบไฟล์ในพื้นที่จัดเก็บ กรุณาติดต่อผู้ดูแล'));
    else if (error) next(error);
  });
};
