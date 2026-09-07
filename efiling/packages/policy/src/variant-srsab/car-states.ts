import type { CarPolicy } from '../contract.js';

/**
 * วงจรสถานะใบคำร้องตาม `SRS_A+B.md` ภาคผนวก B.4 (CAR Status)
 *
 * ห้าสถานะ โดยมี `Reopened` เพิ่มจากที่กลุ่ม B ใช้
 *
 * หมายเหตุที่ต้องรู้ก่อนแก้ไฟล์นี้
 *   1. กระแสงานใน §4.11 ยังกล่าวถึงสถานะ `Pending Management Review` (A4)
 *      และ `Pending Plan Correction` (E2) ซึ่ง **ไม่ปรากฏในตาราง B.4**
 *      จึงไม่ใส่ไว้ที่นี่ เพราะจะเป็นการแต่งสถานะขึ้นเอง
 *      บันทึกไว้เป็นข้อ C2 ใน `SRS_AB_Review.md` รอกลุ่ม A ยืนยัน
 *   2. การทวนสอบเป็นการเปลี่ยนสถานะกลับมาที่เดิม (self-transition)
 *      เพราะเอกสารรวมไม่ได้กำหนดสถานะแยกสำหรับ "ทวนสอบผ่านแล้วรอปิด"
 *      แต่กำหนดให้ผู้ทวนสอบกับผู้ปิดเป็นคนละคน จึงต้องบันทึกผู้ทวนสอบไว้ก่อน
 */
export const car: CarPolicy = {
  states: ['Open', 'In Progress', 'Submitted for Verification', 'Closed', 'Reopened'],
  initial: 'Open',
  closedStates: ['Closed'],
  transitions: [
    {
      from: 'Open',
      to: 'In Progress',
      action: 'startWork',
      allowedRoles: ['CAR_OWNER'],
      guards: [],
      label: 'เริ่มดำเนินการแก้ไข',
    },
    {
      from: 'In Progress',
      to: 'Submitted for Verification',
      action: 'submitForVerification',
      allowedRoles: ['CAR_OWNER'],
      guards: ['requireRootCauseAndAction', 'requireEvidence'],
      label: 'ส่งทวนสอบ',
    },
    {
      from: 'Submitted for Verification',
      to: 'Submitted for Verification',
      action: 'verify',
      allowedRoles: ['ASSISTANT_DCC', 'AUDITOR'],
      guards: ['actorIsNotCarOwner'],
      label: 'บันทึกผลทวนสอบว่าผ่าน',
    },
    {
      from: 'Submitted for Verification',
      to: 'Reopened',
      action: 'verifyFailed',
      allowedRoles: ['ASSISTANT_DCC', 'AUDITOR'],
      guards: ['actorIsNotCarOwner'],
      label: 'ทวนสอบไม่ผ่าน เปิดใบซ้ำ',
    },
    {
      from: 'Submitted for Verification',
      to: 'Closed',
      action: 'close',
      allowedRoles: ['QMR', 'LEAD_AUDITOR'],
      guards: ['requireVerified', 'actorIsNotVerifier'],
      label: 'ปิดใบคำร้อง',
    },
    {
      from: 'Submitted for Verification',
      to: 'Reopened',
      action: 'rejectClosure',
      allowedRoles: ['QMR', 'LEAD_AUDITOR'],
      guards: [],
      label: 'ไม่รับรองการปิด ส่งกลับแก้ไข',
    },
    {
      from: 'Reopened',
      to: 'In Progress',
      action: 'resumeWork',
      allowedRoles: ['CAR_OWNER'],
      guards: [],
      label: 'กลับไปแก้ไขเพิ่มเติม',
    },
  ],
};
