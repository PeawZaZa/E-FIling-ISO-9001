/**
 * จุดเดียวในทั้งระบบที่โหลด Policy Pack
 *
 * ห้ามนำเข้าโฟลเดอร์ variant-* จากที่อื่นโดยตรง เพราะจะทำให้สลับแพ็กไม่ครบ
 * และห้ามเขียนชื่อสถานะหรือชื่อบทบาทเป็นค่าคงที่ในโค้ดส่วนอื่น
 */
import { loadPolicyPack } from '@efiling/policy';
import { env } from './env.js';

export const policy = loadPolicyPack(env.policyVariant);
