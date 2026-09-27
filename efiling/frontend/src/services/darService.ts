import { api } from './apiClient';

export const darStatuses: Record<string, string> = {
  DAR_DRAFT: 'ร่างคำขอ', DAR_AWAITING_INTAKE: 'รอตรวจรับ', DAR_AWAITING_REVIEW: 'รอทบทวน',
  DAR_AWAITING_APPROVAL: 'รออนุมัติ', DAR_CHANGES_REQUESTED: 'ส่งกลับให้แก้ไข', DAR_APPROVED: 'รอประกาศใช้',
  DAR_REJECTED: 'ไม่อนุมัติ', DAR_DISTRIBUTING: 'รอแจกจ่าย / เรียกคืน', DAR_RECALLING: 'รอเรียกคืน', DAR_CLOSED: 'ปิด DAR แล้ว',
};
export const documentTypes: Record<string, string> = { QM: 'คู่มือคุณภาพ', QP: 'ระเบียบปฏิบัติ', WI: 'วิธีปฏิบัติงาน', SD: 'เอกสารสนับสนุน', FM: 'แบบฟอร์ม' };
export type Person = { id: string; fullName: string };
export type DarDraft = { docType: string; title: string; ownerUserId: string | null; sourceVersionId: string | null; sectionCode: string | null; parentDocumentId: string | null; issueNo: number | null; revisionNo: number | null; effectiveDate: string | null };
export type LogisticsItem = { copyNo: string; holderName: string; holderPosition: string; holderUserId?: string; completedDate: string; evidence: string; evidenceFileId?: string };
export type Dar = {
  id: string; darNo: string | null; requestType: string; status: string; requester: Person; reason: string; draft: DarDraft;
  effectiveDate?: string | null; roundNo: number; submittedAt?: string | null; createdAt?: string; allowedActions: string[]; closeBlockReasons?: string[];
  files: { id: string; fileName: string; roundNo: number; kind?: string }[];
  decisions: { id: string; step: string; result: string; comment?: string | null; roundNo?: number; decidedAt: string; decidedBy?: Person }[];
  statusHistory: { id: string; toStatus: string; reason?: string | null; occurredAt: string; actor?: Person }[];
  logistics: { distribution?: LogisticsRecord; recall?: LogisticsRecord };
};
export type LogisticsRecord = { items?: LogisticsItem[]; notApplicableReason?: string; recordedById?: string; recordedAt?: string };
export type DarOptions = {
  owners: Person[]; sectionCodes: string[]; createTypes?: string[]; currentUserId?: string;
  documents: { id: string; documentCode: string; title: string; docType: string; ownerUserId: string | null; canRevise?: boolean; versions: { id: string; issueNo: number | null; revisionNo: number | null }[] }[];
};
export const getDars = (query: URLSearchParams) => api<{ dars: Dar[]; options: DarOptions }>(`/dars?${query}`);
export const getDar = (id: string) => api<{ dar: Dar; options: DarOptions }>(`/dars/${encodeURIComponent(id)}`);
export const darAction = (id: string, action: string, body: unknown = {}) => api(`/dars/${encodeURIComponent(id)}/${action}`, body);
