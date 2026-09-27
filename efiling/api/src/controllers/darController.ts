import type { RequestHandler } from 'express';
import { DocumentError } from '../services/documentRules.js';
import * as service from '../services/darService.js';
export const list: RequestHandler = async (req, res) => { res.json(await service.list(req.session.userId!, req.query)); };
export const detail: RequestHandler = async (req, res) => { res.json(await service.detail(req.session.userId!, String(req.params.id))); };
export const create: RequestHandler = async (req, res) => { res.status(201).json(await service.save(req.session.userId!, req.body)); };
export const update: RequestHandler = async (req, res) => { res.json(await service.save(req.session.userId!, req.body, String(req.params.id))); };
export const command: RequestHandler = async (req, res) => { res.json(await service.command(req.session.userId!, String(req.params.id), String(req.params.action), req.body || {})); };
export const upload: RequestHandler = async (req, res) => { if (!req.file)
    throw new DocumentError(400, 'เลือก PDF'); const decoded = Buffer.from(req.file.originalname, 'latin1').toString('utf8'); res.status(201).json(await service.upload(req.session.userId!, String(req.params.id), { ...req.file, originalname: decoded.includes('\uFFFD') ? req.file.originalname : decoded }, req.body.kind || 'DRAFT')); };
export const file: RequestHandler = async (req, res, next) => { const f = await service.file(req.session.userId!, String(req.params.id)); res.set({ 'Content-Type': 'application/pdf', 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'private, no-store', 'Content-Security-Policy': 'sandbox' }); res.set('Content-Disposition', `${req.query.download === '1' ? 'attachment' : 'inline'}; filename="document.pdf"; filename*=UTF-8''${encodeURIComponent(f.fileName)}`); res.sendFile(f.path, { dotfiles: 'allow' }, e => { if (e)
    next(new DocumentError(404, 'ไม่พบไฟล์')); }); };
