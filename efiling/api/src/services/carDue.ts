import { database } from '../lib/prisma.js';
import { person, scope } from './carAccess.js';

const waitingRole: Record<string, string> = {
  OPEN: 'CAR Owner', CORRECTION: 'CAR Owner', ANALYSIS_PLANNING: 'CAR Owner',
  PENDING_PLAN_APPROVAL: 'QMR', IMPLEMENTING: 'CAR Owner',
  PENDING_VERIFICATION: 'ผู้ตรวจเดิม (Auditor/Lead)',
};

// Only recorded dates for current work count. Overall request dates and provisional defaults do not.
export async function dueRequests(who: string) {
  const rows = await database().correctiveRequest.findMany({
    where: who === 'sponsor' ? {} : scope(who),
    select: {
      id: true, requestNo: true, requestType: true, currentStatus: true, overallDueDate: true,
      owner: { select: person }, finding: { select: { description: true } },
      statusHistory: { orderBy: { occurredAt: 'desc' }, take: 1, select: { toStatus: true, stageDueDate: true } },
      actionPlans: { where: { isCurrent: true }, orderBy: { revision: 'desc' }, take: 1,
        select: { activities: { select: { id: true, description: true, dueDate: true, completedAt: true, responsible: { select: person } } } } },
    },
    orderBy: { openedAt: 'desc' },
  });
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const daysOverdue = (due: string) => Math.round((Date.parse(today) - Date.parse(due)) / 86_400_000);
  return rows.map(({ statusHistory, actionPlans, ...row }) => {
    const inactive = row.currentStatus === 'CLOSED' || row.currentStatus === 'PENDING_CLOSURE';
    const plan = row.currentStatus === 'IMPLEMENTING' ? actionPlans[0] : undefined;
    const activities = plan?.activities.filter(activity => !activity.completedAt);
    const stage = statusHistory[0]?.toStatus === row.currentStatus ? statusHistory[0].stageDueDate : null;
    const work = activities?.map(activity => ({ activityId: activity.id, description: activity.description, dueDate: activity.dueDate.toISOString().slice(0, 10), responsible: activity.responsible, waitingRole: 'ผู้รับผิดชอบกิจกรรม' }))
      ?? (stage && !inactive ? [{ activityId: null, description: 'งานขั้นปัจจุบัน', dueDate: stage.toISOString().slice(0, 10), responsible: row.currentStatus === 'PENDING_PLAN_APPROVAL' || row.currentStatus === 'PENDING_VERIFICATION' ? null : row.owner, waitingRole: waitingRole[row.currentStatus] || 'ผู้รับผิดชอบขั้นงาน' }] : []);
    const activeWork = inactive ? [] : work;
    const overdueWork = activeWork.filter(item => item.dueDate < today).map(item => ({ ...item, daysOverdue: daysOverdue(item.dueDate) }));
    const nextDueDate = activeWork.map(item => item.dueDate).sort()[0] ?? null;
    const state = inactive ? 'NOT_ACTIVE' : overdueWork.length ? 'OVERDUE' : nextDueDate ? 'UPCOMING' : plan && !activities?.length ? 'NO_ACTIVE_WORK' : 'NO_DUE_DATE';
    return { ...row, due: { state, nextDueDate, overdueWork } };
  });
}
