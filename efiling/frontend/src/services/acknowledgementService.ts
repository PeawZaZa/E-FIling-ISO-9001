import { api } from './apiClient';

export type AckVersion = { id: string; versionId?: string; documentId: string; documentCode: string | null; title: string; docType: string | null; issueNo: number | null; revisionNo: number | null; status: string | null; fileId: string | null };
export type AckUser = { id: string; fullName: string; position: string | null };
export type AckAssignment = { id: string; versionId: string; assigneeId: string; assigneeName?: string; assignedAt: string; assignedById: string; confirmedAt: string | null; confirmedById: string | null; canConfirm?: boolean; fileId?: string | null; documentCode?: string | null; title?: string; issueNo?: number | null; revisionNo?: number | null; status?: string | null };
export type AckOptions = { versions: AckVersion[]; users: AckUser[] };
export type AckVersionDetail = { version: AckVersion; users: AckUser[]; assignments: AckAssignment[] };

export const getAckOptions = () => api<AckOptions>('/acknowledgements/options');
export const getAckVersion = (id: string) => api<AckVersionDetail>(`/acknowledgements/versions/${encodeURIComponent(id)}`);
export const assignAcknowledgements = (id: string, assigneeIds: string[]) => api<AckVersionDetail>(`/acknowledgements/versions/${encodeURIComponent(id)}/assign`, { assigneeIds });
export const getMyAcknowledgements = () => api<{ assignments: AckAssignment[] }>('/acknowledgements/mine');
export const confirmAcknowledgement = (id: string) => api(`/acknowledgements/${encodeURIComponent(id)}/confirm`, {});
