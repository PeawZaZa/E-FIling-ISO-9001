/** ข้อผิดพลาดที่ตั้งใจส่งกลับให้ผู้เรียก พร้อมรหัสสถานะที่เหมาะสม */
export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly detail?: unknown,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export const badRequest = (m: string, d?: unknown) => new HttpError(400, m, d);
export const unauthorized = (m = 'ต้องเข้าสู่ระบบก่อน') => new HttpError(401, m);
export const forbidden = (m = 'ไม่มีสิทธิ์ดำเนินการนี้') => new HttpError(403, m);
export const notFound = (m = 'ไม่พบรายการที่ระบุ') => new HttpError(404, m);
export const conflict = (m: string, d?: unknown) => new HttpError(409, m, d);
