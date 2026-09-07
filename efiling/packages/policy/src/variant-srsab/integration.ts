import type { GroupAClient, GroupAClientDeps } from '../contract.js';

/**
 * การเชื่อมต่อระหว่างโมดูลกลุ่ม A และกลุ่ม B ตาม `SRS_A+B.md` §3.3.1
 *
 * เอกสารรวมยืนยันว่าทั้งสองโมดูลอยู่บน backend เดียวกัน จึงเรียกกันด้วย
 * การเรียกฟังก์ชันในกระบวนการเดียวกัน ไม่ผ่านเครือข่าย
 *
 * ตัวนี้จึงเป็นเพียงตัวส่งต่อไปยังบริการอ่านของโมดูลกลุ่ม A ที่ชั้น API
 * ส่งเข้ามาให้ ประโยชน์ที่ยังได้คือ **จุดควบคุมเดียว** ที่พิสูจน์ได้ว่า
 * ไม่มีบริการใดของกลุ่ม B แตะข้อมูลเอกสารเอง (NFR-06 Interoperability)
 *
 * ข้อควรทราบ: แบบเสนอหัวข้อ SE02 ข้อ 10.2.4 และบทที่ 1 §1.4.2.2 ระบุคำว่า
 * "อินเทอร์เฟซโปรแกรมประยุกต์ (API)" ไว้ชัด ซึ่งขัดกับวิธีนี้
 * ดูข้อ A3 ใน `SRS_AB_Review.md` — ถ้าที่ประชุมยืนตามเอกสารที่อนุมัติแล้ว
 * ให้สลับไปใช้แพ็ก `proposal` โดยไม่ต้องแก้โค้ดส่วนอื่น
 */
export function createGroupAClient(deps: GroupAClientDeps): GroupAClient {
  return {
    documentSummary: () => deps.local.documentSummary(),
    ackSummary: () => deps.local.ackSummary(),
    publishedDocuments: () => deps.local.publishedDocuments(),
    documentById: (id) => deps.local.documentById(id),
  };
}
