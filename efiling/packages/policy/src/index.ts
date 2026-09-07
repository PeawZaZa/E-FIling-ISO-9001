/**
 * จุดเดียวที่เลือกว่าจะใช้ Policy Pack ตัวใด
 *
 * เลือกด้วยตัวแปรสภาพแวดล้อม `POLICY_VARIANT` เท่านั้น
 * ห้ามนำเข้าไฟล์ในโฟลเดอร์ variant-* โดยตรงจากที่อื่น
 */
import type { PolicyPack } from './contract.js';
import { pack as srsab } from './variant-srsab/index.js';
import { pack as proposal } from './variant-proposal/index.js';

export * from './contract.js';

const packs: Record<string, PolicyPack> = { srsab, proposal };

export function loadPolicyPack(variant = process.env.POLICY_VARIANT ?? 'srsab'): PolicyPack {
  const pack = packs[variant];
  if (!pack) {
    const available = Object.keys(packs).join(', ');
    throw new Error(`ไม่รู้จัก POLICY_VARIANT ค่า "${variant}" — ค่าที่ใช้ได้: ${available}`);
  }
  return pack;
}

export { srsab, proposal };
