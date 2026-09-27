import type { Prisma } from '@prisma/client';
import { database } from '../lib/prisma.js';
import { menuAccess } from './authService.js';
import { dbUserId, documentScope, DocumentError, versionScope } from './documentRules.js';
import { list as listDars } from './darService.js';
import { scope as recordScope } from './recordService.js';
import { findingScope, roundScope } from './auditService.js';
import { scope as requestScope } from './carAccess.js';
import { dueRequests } from './carDue.js';

const all = (who: string) => who === 'sponsor';
const permitted = (who: string, roles: string[]) => all(who) || roles.includes(who);
const tally = (values: (string | null)[]) => values.reduce<Record<string, number>>((counts, value) => {
  const key = value ?? 'UNSPECIFIED';
  counts[key] = (counts[key] ?? 0) + 1;
  return counts;
}, {});

async function documents(who: string) {
  const db = database();
  const where: Prisma.DocumentWhereInput = all(who) ? { isActive: true } : { AND: [documentScope(who), { isActive: true }] };
  const versions: Prisma.DocumentVersionWhereInput = all(who) ? {} : versionScope(who);
  const rows = await db.document.findMany({ where, select: { docType: true, versions: { where: versions, select: { status: true, supersededById: true } } } });
  const published = rows.flatMap(row => row.versions).filter(version => version.status === 'DOC_PUBLISHED');
  return { total: rows.length, byType: tally(rows.map(row => row.docType)), byStatus: tally(rows.flatMap(row => row.versions.map(version => version.status))), previousVersions: rows.flatMap(row => row.versions).filter(version => version.status === 'DOC_OBSOLETE' || version.supersededById !== null).length, published: published.length };
}

async function dars(who: string) {
  const rows = all(who) ? await database().dar.findMany({ select: { status: true } }) : (await listDars(who, {})).dars;
  return { total: rows.length, byStatus: tally(rows.map(row => row.status)), open: rows.filter(row => row.status !== 'DAR_CLOSED').length, closed: rows.filter(row => row.status === 'DAR_CLOSED').length };
}

async function acknowledgements(who: string) {
  const where: Prisma.AcknowledgementAssignmentWhereInput = all(who) || who === 'dcc' ? {} : { assigneeId: dbUserId(who) };
  const [assigned, confirmed] = await Promise.all([
    database().acknowledgementAssignment.count({ where }),
    database().acknowledgementAssignment.count({ where: { AND: [where, { confirmation: { isNot: null } }] } }),
  ]);
  return { assigned, confirmed, pending: assigned - confirmed, personal: !all(who) && who !== 'dcc' };
}

async function records(who: string) {
  const scope: Prisma.QualityRecordWhereInput = all(who) ? {} : recordScope(who);
  const [total, withFiles, files] = await Promise.all([
    database().qualityRecord.count({ where: scope }),
    database().qualityRecord.count({ where: { AND: [scope, { evidence: { some: {} } }] } }),
    database().evidence.count({ where: all(who) ? {} : { OR: [
      { record: { is: scope } },
      ...(permitted(who, ['dcc', 'qmr', 'auditor', 'lead', 'deputy']) ? [{ finding: { is: findingScope(who) } }] : []),
      ...(permitted(who, ['dcc', 'qmr', 'auditor', 'lead', 'deputy']) ? [{ request: { is: requestScope(who) } }, { activity: { is: { plan: { request: requestScope(who) } } } }] : []),
    ] } }),
  ]);
  return { total, withFiles, files };
}

async function audit(who: string) {
  const rounds: Prisma.AuditRoundWhereInput = all(who) ? {} : roundScope(who);
  const findings: Prisma.FindingWhereInput = all(who) ? {} : findingScope(who);
  const [roundCount, rows] = await Promise.all([
    database().auditRound.count({ where: rounds }),
    database().finding.findMany({ where: findings, select: { requests: { select: { currentStatus: true } } } }),
  ]);
  return { rounds: roundCount, findings: rows.length, withOpenRequest: rows.filter(row => row.requests.some(request => request.currentStatus !== 'CLOSED')).length, withoutRequest: rows.filter(row => row.requests.length === 0).length };
}

async function cars(who: string) {
  const rows = await dueRequests(who);
  return { total: rows.length, byStatus: tally(rows.map(row => row.currentStatus)), open: rows.filter(row => row.currentStatus !== 'CLOSED').length, closed: rows.filter(row => row.currentStatus === 'CLOSED').length,
    overdue: rows.filter(row => row.due.state === 'OVERDUE').length };
}

export async function summary(who: string) {
  if (menuAccess(who, 'dashboard').status !== 200) throw new DocumentError(403, 'ไม่มีสิทธิ์ดูภาพรวม');
  const reads: [string, Promise<unknown>][] = [];
  if (permitted(who, ['dcc', 'qmr', 'deputy'])) reads.push(['documents', documents(who)], ['dars', dars(who)], ['acknowledgements', acknowledgements(who)]);
  if (permitted(who, ['dcc', 'qmr', 'auditor', 'lead', 'deputy'])) reads.push(['records', records(who)], ['audit', audit(who)], ['cars', cars(who)]);
  const settled = await Promise.allSettled(reads.map(([, read]) => read));
  const sections: Record<string, unknown> = {};
  const unavailable: string[] = [];
  settled.forEach((result, index) => {
    const name = reads[index][0];
    if (result.status === 'fulfilled') sections[name] = result.value;
    else {
      unavailable.push(name);
      console.error(`Dashboard ${name} read failed`, result.reason?.code ?? result.reason);
    }
  });
  return { sections, unavailable, aggregateOnly: all(who) };
}
