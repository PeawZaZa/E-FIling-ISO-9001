import type {
  AckRate,
  DocumentRef,
  DocumentStatusCount,
  GroupAClient,
  GroupAClientDeps,
} from '../contract.js';

/**
 * การเชื่อมต่อกับระบบกลุ่ม A ตามแบบเสนอหัวข้อ SE02 ข้อ 10.2.4
 * และบทที่ 1 §1.4.2.2 — เรียกผ่านส่วนต่อประสานโปรแกรมประยุกต์ (API)
 * แบบอ่านอย่างเดียว ทิศทางเดียว
 *
 * กำหนดเวลารอไว้ที่ตัวเชื่อมต่อจุดเดียวตาม ADR-04 เพื่อไม่ให้แดชบอร์ด
 * ทั้งหน้าล่มเมื่อระบบกลุ่ม A ไม่ตอบสนอง ผู้เรียกต้องดักข้อผิดพลาดเอง
 * แล้วแสดงเฉพาะส่วนที่ดึงข้อมูลสำเร็จ
 */
class GroupAUnavailableError extends Error {
  constructor(readonly endpoint: string, cause: unknown) {
    super(`เรียกส่วนต่อประสานของระบบกลุ่ม A ไม่สำเร็จ: ${endpoint}`);
    this.name = 'GroupAUnavailableError';
    this.cause = cause;
  }
}

export function createGroupAClient(deps: GroupAClientDeps): GroupAClient {
  const baseUrl = deps.baseUrl;
  if (!baseUrl) {
    throw new Error(
      'แพ็ก proposal ต้องกำหนด GROUP_A_BASE_URL เพราะเรียกระบบกลุ่ม A ผ่านเครือข่าย',
    );
  }
  const timeoutMs = deps.timeoutMs ?? 3000;

  async function get<T>(path: string): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(`${baseUrl}${path}`, {
        signal: controller.signal,
        headers: { accept: 'application/json' },
      });
      if (!res.ok) throw new Error(`สถานะตอบกลับ ${res.status}`);
      return (await res.json()) as T;
    } catch (err) {
      throw new GroupAUnavailableError(path, err);
    } finally {
      clearTimeout(timer);
    }
  }

  return {
    documentSummary: () => get<DocumentStatusCount[]>('/integration/document-summary'),
    ackSummary: () => get<AckRate[]>('/integration/ack-summary'),
    publishedDocuments: () => get<DocumentRef[]>('/integration/documents?status=Published'),
    documentById: (id) => get<DocumentRef | null>(`/integration/documents/${encodeURIComponent(id)}`),
  };
}

export { GroupAUnavailableError };
