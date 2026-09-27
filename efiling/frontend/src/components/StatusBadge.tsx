import type { ReactNode } from 'react';

const toneByStatus: Record<string, string> = {
  DAR_DRAFT: 'neutral', DOC_DRAFT: 'neutral', OPEN: 'neutral',
  DAR_AWAITING_INTAKE: 'pending', DAR_AWAITING_REVIEW: 'pending', DAR_AWAITING_APPROVAL: 'pending',
  DAR_APPROVED: 'pending', DAR_DISTRIBUTING: 'pending', DAR_RECALLING: 'pending',
  PENDING_PLAN_APPROVAL: 'pending', PENDING_VERIFICATION: 'pending', PENDING_CLOSURE: 'pending',
  CORRECTION: 'progress', ANALYSIS_PLANNING: 'progress', IMPLEMENTING: 'progress',
  DAR_CHANGES_REQUESTED: 'warning',
  OVERDUE: 'warning',
  DAR_REJECTED: 'error',
  DAR_CLOSED: 'success', DOC_PUBLISHED: 'success', VERIFIED: 'success', ACKNOWLEDGED: 'success', CLOSED: 'success',
  DOC_OBSOLETE: 'neutral', PENDING: 'pending',
};

export function StatusBadge({ status, children }: { status: string; children: ReactNode }) {
  return <span className={`status-badge status-badge--${toneByStatus[status] || 'neutral'}`}>{children}</span>;
}
