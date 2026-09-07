import type { RolePolicy } from '../contract.js';

/**
 * บทบาทผู้ใช้ตาม `SRS_A+B.md` §2.3 (User Classes and Characteristics)
 *
 * สิบบทบาท — เอกสารรวมระบุ 11 รายการ แต่รายการสุดท้าย
 * "Student Group A / Group B (Delivery Team)" เป็นทีมพัฒนา ไม่ใช่บทบาทในระบบ
 * จึงไม่นับเป็น role
 *
 * ต่างจากแบบเสนอหัวข้อ SE02 ข้อ 10.2.3 และบทที่ 1 §1.4.1.1 ที่กำหนดไว้ 4 บทบาท
 * ดูข้อ A4 และ ⓪.1 ใน `SRS_AB_Review.md`
 */
export const roles: RolePolicy = {
  all: [
    'SPONSOR',
    'ISO_QA_ADMIN',
    'DOCUMENT_OWNER',
    'APPROVER',
    'QMR',
    'END_USER',
    'AUDITOR',
    'LEAD_AUDITOR',
    'ASSISTANT_DCC',
    'CAR_OWNER',
  ],
  permissions: {
    /** ผู้บริหาร/สำนักงานคณบดี — ไม่ปฏิบัติงานในระบบ ดูภาพรวมอย่างเดียว */
    SPONSOR: ['UC-06', 'UC-12'],

    /**
     * ISO/QA Admin (DCC) — เจ้าของระบบฝั่งคุณภาพ
     * รวมหน้าที่ IT/Admin เข้ามาตามมติ v0.3 ของเอกสารรวม
     * ห้ามทำหน้าที่ Approver เอง (BRULE-EFL-11)
     */
    ISO_QA_ADMIN: [
      'UC-01', 'UC-02', 'UC-04', 'UC-05', 'UC-06', 'UC-07',
      'UC-08', 'UC-09', 'UC-10', 'UC-11', 'UC-12', 'UC-13', 'UC-14', 'UC-15',
    ],

    DOCUMENT_OWNER: ['UC-01', 'UC-02', 'UC-06', 'UC-07', 'UC-16'],

    /** ทบทวนและอนุมัติ DAR — แยกขาดจาก ISO/QA Admin */
    APPROVER: ['UC-03', 'UC-06', 'UC-07', 'UC-16'],

    /** ผู้แทนฝ่ายบริหาร — อนุมัติ DAR ได้ และมีสิทธิ์ปิดใบคำร้อง */
    QMR: ['UC-03', 'UC-06', 'UC-07', 'UC-11', 'UC-12', 'UC-15', 'UC-16'],

    END_USER: ['UC-06', 'UC-07', 'UC-16'],

    /** ผู้ตรวจติดตาม — ทวนสอบได้เฉพาะใบที่ตนเป็นผู้แจ้งพบ */
    AUDITOR: ['UC-06', 'UC-08', 'UC-09', 'UC-10', 'UC-11', 'UC-12', 'UC-13', 'UC-14'],

    /** หัวหน้าคณะผู้ประเมินประจำรอบ — มีสิทธิ์ปิดใบคำร้อง */
    LEAD_AUDITOR: ['UC-06', 'UC-08', 'UC-09', 'UC-10', 'UC-11', 'UC-12', 'UC-13', 'UC-14'],

    /** ผู้ช่วยเลขานุการคณะกรรมการ — ทวนสอบได้ แต่ปิดใบคำร้องไม่ได้ */
    ASSISTANT_DCC: ['UC-06', 'UC-08', 'UC-11', 'UC-12'],

    /** ผู้รับผิดชอบการแก้ไข — แก้ได้เฉพาะใบของตน ทวนสอบและปิดใบตนเองไม่ได้ */
    CAR_OWNER: ['UC-06', 'UC-08', 'UC-11', 'UC-12'],
  },
};
