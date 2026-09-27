import type { RequestHandler } from 'express';
import * as service from '../services/acknowledgementService.js';

export const options: RequestHandler = async (req, res) => { res.json(await service.options(req.session.userId!)); };
export const versionAssignments: RequestHandler = async (req, res) => { res.json(await service.versionAssignments(req.session.userId!, String(req.params.id))); };
export const assign: RequestHandler = async (req, res) => { res.json(await service.assign(req.session.userId!, String(req.params.id), req.body)); };
export const mine: RequestHandler = async (req, res) => { res.json(await service.mine(req.session.userId!)); };
export const confirm: RequestHandler = async (req, res) => { res.json(await service.confirm(req.session.userId!, String(req.params.id))); };
