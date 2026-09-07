import type { UseCaseId } from '@efiling/policy';

declare global {
  namespace Express {
    interface Request {
      /** ผู้ใช้ที่ผ่านการยืนยันตัวตนแล้ว ตั้งค่าโดย requireAuth */
      user?: {
        id: string;
        email: string;
        fullName: string;
        roleCode: string;
        departmentId: string | null;
      };
      /** กรณีการใช้งานที่เส้นทางนี้อยู่ภายใต้ ใช้ประกอบร่องรอยการตรวจสอบ */
      useCase?: UseCaseId;
    }
  }
}

export {};
