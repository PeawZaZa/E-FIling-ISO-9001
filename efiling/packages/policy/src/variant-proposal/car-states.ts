import type { CarPolicy } from '../contract.js';

/**
 * วงจรสถานะใบคำร้องตามแบบเสนอหัวข้อ SE02 ข้อ 10.2.2 และบทที่ 1 §1.4.5.1
 *
 * สี่สถานะ ไม่มี `Reopened` แยกต่างหาก — ทวนสอบไม่ผ่านให้ย้อนกลับไป
 * `In Progress` ตรง ๆ ตามที่ ADR-09 บันทึกเหตุผลไว้
 *
 * เหตุผลที่ไม่มีสถานะเปิดซ้ำ: สถิติงานเกินกำหนดและระยะเวลาปิดงานจะนับซ้ำ
 * ถ้าใบเดียวกันวนเข้าสถานะใหม่ทุกครั้งที่ทวนสอบไม่ผ่าน
 */
export const car: CarPolicy = {
  states: ['Open', 'In Progress', 'Pending Verify', 'Closed'],
  initial: 'Open',
  closedStates: ['Closed'],
  transitions: [
    {
      from: 'Open',
      to: 'In Progress',
      action: 'startWork',
      allowedRoles: ['CAR_OWNER'],
      guards: [],
      label: 'บันทึกสาเหตุรากเหง้า',
    },
    {
      from: 'In Progress',
      to: 'Pending Verify',
      action: 'submitForVerification',
      allowedRoles: ['CAR_OWNER'],
      guards: ['requireRootCauseAndAction', 'requireEvidence'],
      label: 'ส่งทวนสอบ',
    },
    {
      from: 'Pending Verify',
      to: 'Closed',
      action: 'verifyPassed',
      allowedRoles: ['AUDITOR', 'ISO_QA_USER'],
      guards: ['actorIsNotCarOwner'],
      label: 'ทวนสอบผ่าน ปิดใบคำร้อง',
    },
    {
      from: 'Pending Verify',
      to: 'In Progress',
      action: 'verifyFailed',
      allowedRoles: ['AUDITOR', 'ISO_QA_USER'],
      guards: ['actorIsNotCarOwner'],
      label: 'ทวนสอบไม่ผ่าน กลับไปแก้ไขเพิ่มเติม',
    },
  ],
};
