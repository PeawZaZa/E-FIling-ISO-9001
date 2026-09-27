import type { ErrorRequestHandler } from 'express';
import multer from 'multer';
import { DocumentError } from '../services/documentRules.js';
export const errorHandler: ErrorRequestHandler = (error, _req, res, next) => {
  if (res.headersSent) { next(error); return; }
  if (error?.type === 'entity.too.large') { res.status(413).json({message:'ข้อมูลคำขอมีขนาดเกินกำหนด'}); return; }
  if (error?.type === 'entity.parse.failed') { res.status(400).json({message:'รูปแบบข้อมูลไม่ถูกต้อง'}); return; }
  if (error instanceof DocumentError) { res.status(error.status).json({message:error.message}); return; }
  if (error instanceof multer.MulterError) {
    res.status(error.code === 'LIMIT_FILE_SIZE' ? 413:400).json({message:error.code === 'LIMIT_FILE_SIZE'?'ไฟล์ PDF ต้องไม่เกิน 128 MB':'ข้อมูลอัปโหลดไม่ถูกต้อง กรุณาเลือก PDF หนึ่งไฟล์'}); return;
  }
  res.status(500).json({ status: 'error', message:'บันทึกหรืออ่านข้อมูลไม่สำเร็จ กรุณาลองใหม่' });
};
