import { Prisma, type DarStatus, type RoleCode } from '@prisma/client';
import { database } from '../lib/prisma.js';
import { CENTRAL_DEPARTMENT, dbUserId, DocumentError, documentTypes } from './documentRules.js';
import { inspectPdf, storePdf, discardFile, storedPath } from './documentStorage.js';
import { jsonSafe, type UploadedPdf } from './documentService.js';
type Draft = {
    docType: string;
    title: string;
    ownerUserId: string | null;
    sourceVersionId: string | null;
    sectionCode: string | null;
    parentDocumentId: string | null;
    issueNo: number | null;
    revisionNo: number | null;
    effectiveDate: string | null;
};
type Item = {
    copyNo: string;
    holderName: string;
    holderPosition: string;
    holderUserId?: string;
    completedDate: string;
    evidence: string;
    evidenceFileId: string;
};
type Logistics = {
    items: Item[];
    notApplicableReason?: string;
    recordedById: string;
    recordedAt: string;
};
const roles: Record<string, RoleCode> = { dcc: 'ISO_QA_ADMIN', owner: 'DOC_OWNER', reviewer: 'APPROVER', qmr: 'QMR', deputy: 'DEPUTY_QMR', registrar: 'REGISTRAR', dean: 'DEAN' };
const related = { requester: { select: { id: true, fullName: true } }, rounds: { orderBy: { roundNo: 'asc' as const } }, files: { orderBy: { uploadedAt: 'asc' as const } }, decisions: { include: { decidedBy: { select: { fullName: true } } }, orderBy: { decidedAt: 'asc' as const } }, statusHistory: { include: { actor: { select: { fullName: true } } }, orderBy: { occurredAt: 'asc' as const } }, targets: true, producedVersions: true };
type Row = Prisma.DarGetPayload<{
    include: typeof related;
}>;
async function requireFiles(files: Row['files']) {
    for (const file of files) {
        try {
            const hash = await inspectPdf(storedPath(file.storagePath), Number(file.sizeBytes), 'application/pdf', file.fileName);
            if (hash !== file.sha256) throw new Error('PDF changed');
        } catch { fail(409, 'ไฟล์ PDF หรือหลักฐานไม่พร้อมใช้งาน กรุณาตรวจสอบก่อนดำเนินการ'); }
    }
}
function fail(status: number, message: string): never { throw new DocumentError(status, message); }
function today() { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()); }
function str(v: unknown, max = 300) { if (v == null || v === '')
    return null; if (typeof v !== 'string' || v.length > max)
    fail(400, 'ข้อความไม่ถูกต้อง'); return v.trim() || null; }
function date(v: unknown) { const s = str(v, 10); if (s && (!/^\d{4}-\d{2}-\d{2}$/.test(s) || !Number.isFinite(Date.parse(s)) || new Date(s).toISOString().slice(0, 10) !== s))
    fail(400, 'วันที่ไม่ถูกต้อง'); return s; }
function int(v: unknown) { if (v == null || v === '')
    return null; if (!/^\d{1,5}$/.test(String(v)))
    fail(400, 'ฉบับและครั้งที่แก้ไขต้องเป็นจำนวนเต็ม'); return Number(v); }
function uuid(v: unknown) { const s = str(v, 36); if (s && !/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(s))
    fail(400, 'รหัสอ้างอิงไม่ถูกต้อง'); return s; }
function draft(body: Record<string, unknown>): Draft { if (!body || typeof body !== 'object' || Array.isArray(body))
    fail(400, 'ข้อมูลร่างไม่ถูกต้อง'); const docType = str(body.docType) || ''; if (!documentTypes.includes(docType))
    fail(400, 'ประเภทเอกสารไม่ถูกต้อง'); return { docType, title: str(body.title) || '', ownerUserId: uuid(body.ownerUserId), sourceVersionId: uuid(body.sourceVersionId), parentDocumentId: uuid(body.parentDocumentId), sectionCode: str(body.sectionCode, 2), issueNo: int(body.issueNo), revisionNo: int(body.revisionNo), effectiveDate: date(body.effectiveDate) }; }
function visible(a: string, d: Row) { return !!roles[a] && (a === 'dcc' || a === 'registrar' || a === 'qmr' || (a === 'dean' && (d.draft as unknown as Draft).docType === 'QM') || (a === 'reviewer' && (d.draft as unknown as Draft).docType !== 'QM') || d.requesterId === dbUserId(a) || (a === 'deputy' && Object.values(d.assignments as object).some((v: any) => v.assigneeId === dbUserId(a)))); }
function actions(a: string, d: Row) {
    const out: string[] = [];
    const meta = d.draft as unknown as Draft;
    const assignments = d.assignments as Record<string, any>;
    if (d.requesterId === dbUserId(a) && ['DAR_DRAFT', 'DAR_CHANGES_REQUESTED'].includes(d.status))
        out.push('edit', 'upload', 'submit');
    if (a === 'registrar' && d.status === 'DAR_AWAITING_INTAKE')
        out.push('intake');
    if (d.status === 'DAR_AWAITING_REVIEW' && ((meta.docType === 'QM' && a === 'qmr') || (meta.docType !== 'QM' && a === 'reviewer') || (a === 'deputy' && assignments.REVIEW?.assigneeId === dbUserId(a) && assignments.REVIEW?.roundNo === d.roundNo)))
        out.push('review');
    if (d.status === 'DAR_AWAITING_APPROVAL' && ((meta.docType === 'QM' && a === 'dean') || (meta.docType !== 'QM' && a === 'qmr') || (a === 'deputy' && assignments.APPROVAL?.assigneeId === dbUserId(a) && assignments.APPROVAL?.roundNo === d.roundNo)) && d.requesterId !== dbUserId(a) && !d.decisions.some(x => x.roundNo === d.roundNo && x.step === 'REVIEW' && x.decidedById === dbUserId(a)))
        out.push('approve');
    if (a === 'qmr' && ((meta.docType === 'QM' && d.status === 'DAR_AWAITING_REVIEW') || (meta.docType !== 'QM' && d.status === 'DAR_AWAITING_APPROVAL')))
        out.push('delegate');
    if (a === 'dcc' && d.status === 'DAR_APPROVED')
        out.push('publish');
    if (a === 'registrar' && ['DAR_DISTRIBUTING', 'DAR_RECALLING'].includes(d.status))
        out.push('distribution', 'recall', 'close');
    return out;
}
async function row(tx: Prisma.TransactionClient, a: string, id: string) { uuid(id); const d = await tx.dar.findUnique({ where: { id }, include: related }); if (!d || !visible(a, d))
    fail(404, 'ไม่พบ DAR หรือไม่มีสิทธิ์'); return d; }
async function transaction<T>(run: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> { for (let n = 0; n < 4; n++) {
    try {
        return await database().$transaction(run, { isolationLevel: 'Serializable', timeout: 20000 });
    }
    catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && ['P2034', 'P2002'].includes(e.code)) {
            if (n < 3)
                continue;
            fail(409, 'ข้อมูลถูกเปลี่ยนหรือเลขซ้ำ กรุณาตรวจสอบแล้วลองใหม่');
        }
        throw e;
    }
} throw new Error('transaction'); }
async function history(tx: Prisma.TransactionClient, a: string, d: Row, status: DarStatus, reason?: string) {
    await tx.darStatusHistory.create({ data: { darId: d.id, fromStatus: d.status, toStatus: status, actorUserId: dbUserId(a), actorRole: roles[a], reason } });
    await tx.dar.update({ where: { id: d.id }, data: { status } });
    await tx.auditEvent.create({ data: { actorUserId: dbUserId(a), actorRole: roles[a], entityType: 'Dar', entityId: d.id, action: 'STATUS_CHANGE', reason, beforeValue: { status: d.status }, afterValue: { status, roundNo: d.roundNo } } });
}
async function audit(tx: Prisma.TransactionClient, a: string, id: string, action: string, before: unknown, after: unknown) { await tx.auditEvent.create({ data: { actorUserId: dbUserId(a), actorRole: roles[a], entityType: 'Dar', entityId: id, action: 'UPDATE', reason: action, beforeValue: jsonSafe(before) as Prisma.InputJsonObject, afterValue: jsonSafe(after) as Prisma.InputJsonObject } }); }
async function options(a: string) {
    if (!roles[a])
        fail(403, 'ไม่มีสิทธิ์เข้า DAR');
    const assigned = a === 'deputy' ? (await database().dar.findMany({ include: related })).filter(d => visible(a, d)).flatMap(d => [...(d.targets.map(t => t.documentId)), ...d.producedVersions.map(v => v.documentId)]).filter((id): id is string => !!id) : [];
    const documents = await database().document.findMany({ where: { isActive: true, ...(!['dcc', 'qmr'].includes(a) ? { versions: { some: { status: 'DOC_PUBLISHED', reviewStatus: 'VERIFIED' } } } : {}), ...(a === 'dean' ? { docType: 'QM' } : a === 'deputy' ? { id: { in: assigned } } : {}) }, select: { id: true, documentCode: true, title: true, docType: true, ownerUserId: true, versions: { where: { status: 'DOC_PUBLISHED' }, select: { id: true, issueNo: true, revisionNo: true } } }, orderBy: { documentCode: 'asc' } });
    return { currentUserId: dbUserId(a), documents: documents.map(d => ({ ...d, canRevise: d.ownerUserId === dbUserId(a) && (a === 'dcc' ? d.docType === 'QM' : a === 'owner' && d.docType !== 'QM') })), owners: ['dcc', 'owner'].includes(a) ? await database().user.findMany({ where: { id: { in: [dbUserId(a)] }, isActive: true }, select: { id: true, fullName: true } }) : [], sectionCodes: [...new Set(documents.map(d => d.documentCode?.match(/^QP-2301-(\d{2})\d{2}$/)?.[1]).filter(Boolean))], createTypes: a === 'dcc' ? ['QM'] : a === 'owner' ? ['QP', 'WI', 'SD', 'FM'] : [] };
}
function safe(a: string, d: Row) { return jsonSafe({ ...d, files: d.files.map(({ storagePath, sha256, ...f }) => f), allowedActions: actions(a, d) }); }
export async function list(a: string, q: Record<string, unknown>) { const opts = await options(a); const rows = await database().dar.findMany({ include: related, orderBy: { createdAt: 'desc' } }); const search = str(q.q) || ''; return { dars: rows.filter(d => visible(a, d) && (!q.status || d.status === q.status) && (!q.requestType || d.requestType === q.requestType) && (!q.docType || (d.draft as unknown as Draft).docType === q.docType) && (!search || `${d.darNo} ${(d.draft as unknown as Draft).title}`.toLowerCase().includes(search.toLowerCase())) && (q.mine !== 'true' || actions(a, d).length > 0)).map(d => safe(a, d)), options: opts }; }
export async function detail(a: string, id: string) { return { dar: safe(a, await row(database(), a, id)), options: await options(a) }; }
async function validateSource(tx: Prisma.TransactionClient, a: string, m: Draft, type: string) { if (type === 'REVISE') {
    if (!m.sourceVersionId)
        fail(400, 'เลือกฉบับต้นทาง');
    const v = await tx.documentVersion.findUnique({ where: { id: m.sourceVersionId }, include: { document: true } });
    if (!v || v.status !== 'DOC_PUBLISHED')
        fail(409, 'ฉบับต้นทางไม่ใช่ฉบับใช้งาน');
    if (!v.document.ownerUserId || v.document.ownerUserId !== dbUserId(a))
        fail(403, 'ต้องให้ DCC ระบุเจ้าของผู้รับผิดชอบก่อน');
    if (v.document.docType !== m.docType)
        fail(400, 'ประเภทไม่ตรงต้นทาง');
    if (v.issueNo === null || v.revisionNo === null)
        fail(400, 'เติมฉบับและครั้งที่แก้ไขของต้นทางก่อน');
    m.issueNo = v.issueNo;
    m.revisionNo = v.revisionNo + 1;
    m.ownerUserId = v.document.ownerUserId;
    return v;
} return null; }
export async function save(a: string, body: Record<string, unknown>, id?: string) {
    const m = draft(body);
    const type = body.requestType;
    if (!['NEW_DOCUMENT', 'REVISE'].includes(String(type)))
        fail(400, 'รองรับสร้างใหม่และแก้ไข');
    if ((m.docType === 'QM' ? a !== 'dcc' : a !== 'owner'))
        fail(403, 'ไม่มีสิทธิ์จัดทำประเภทนี้');
    await transaction(async (tx) => {
        let old: Row | undefined;
        if (id) {
            old = await row(tx, a, id);
            if (!actions(a, old).includes('edit'))
                fail(403, 'แก้ได้เฉพาะร่างของตน');
            if (old.requestType !== type || (old.draft as unknown as Draft).sourceVersionId !== m.sourceVersionId)
                fail(400, 'เปลี่ยนคำขอหรือฉบับต้นทางไม่ได้');
        }
        await validateSource(tx, a, m, String(type));
        if (m.ownerUserId && m.ownerUserId !== dbUserId(a))
            fail(400, 'เจ้าของต้องเป็นผู้จัดทำที่รับผิดชอบ');
        const data = { draft: m as unknown as Prisma.InputJsonObject, reason: str(body.reason, 4000) || '', requestType: type as 'REVISE' | 'NEW_DOCUMENT' };
        if (old) {
            await tx.dar.update({ where: { id }, data });
            await audit(tx, a, id!, 'DAR_DRAFT_EDIT', old.draft, m);
        }
        else {
            const d = await tx.dar.create({ data: { ...data, requesterId: dbUserId(a) } });
            id = d.id;
            await tx.darStatusHistory.create({ data: { darId: d.id, toStatus: 'DAR_DRAFT', actorUserId: dbUserId(a), actorRole: roles[a] } });
        }
    });
    return detail(a, id!);
}
export async function upload(a: string, id: string, file: UploadedPdf, kind = "DRAFT") { let key: string | undefined; let committed = false; try {
    const d = await row(database(), a, id);
    if (!['DRAFT', 'DISTRIBUTION', 'RECALL'].includes(kind) || !actions(a, d).includes(kind === 'DRAFT' ? 'upload' : kind.toLowerCase()))
        fail(403, 'แนบไฟล์ได้เฉพาะร่างของตน');
    if (file.originalname.length > 255)
        fail(400, 'ชื่อไฟล์ยาวเกินกำหนด');
    const hash = await inspectPdf(file.path, file.size, file.mimetype, file.originalname);
    key = await storePdf(file.path);
    await transaction(async (tx) => { const current = await row(tx, a, id); if (!actions(a, current).includes(kind === 'DRAFT' ? 'upload' : kind.toLowerCase()))
        fail(409, 'ร่างถูกส่งแล้ว'); if (current.files.some(f => f.roundNo === current.roundNo && f.kind === kind && f.sha256 === hash))
        fail(409, 'ไฟล์นี้แนบอยู่ในรอบนี้แล้ว'); await tx.darFile.create({ data: { darId: id, kind, roundNo: current.roundNo, fileName: file.originalname, storagePath: key!, sha256: hash, sizeBytes: file.size, uploadedById: dbUserId(a) } }); await audit(tx, a, id, 'DAR_FILE_UPLOAD', {}, { fileName: file.originalname, roundNo: current.roundNo }); });
    committed = true;
    return detail(a, id);
}
catch (e) {
    if (key && !committed)
        await discardFile(storedPath(key));
    throw e;
}
finally {
    await discardFile(file.path);
} }
export async function file(a: string, id: string) { uuid(id); const f = await database().darFile.findUnique({ where: { id } }); if (!f)
    fail(404, 'ไม่พบไฟล์'); await row(database(), a, f.darId); return { fileName: f.fileName, path: storedPath(f.storagePath) }; }
async function nextCode(tx: Prisma.TransactionClient, m: Draft) {
    let prefix = '', suffix = '', pattern: RegExp;
    if (m.docType === 'QM') {
        prefix = 'QM-2301-';
        pattern = /^QM-2301-(\d+)$/;
    }
    else if (m.docType === 'QP') {
        if (!m.sectionCode || !/^\d{2}$/.test(m.sectionCode) || !await tx.document.findFirst({ where: { documentCode: { startsWith: `QP-2301-${m.sectionCode}` } } }))
            fail(400, 'เลือกส่วนงานที่มีหลักฐานในทะเบียน');
        prefix = `QP-2301-${m.sectionCode}`;
        pattern = new RegExp(`^${prefix}(\\d{2})$`);
    }
    else {
        if (!m.parentDocumentId)
            fail(400, 'เลือกเอกสารแม่');
        const parent = await tx.document.findUnique({ where: { id: m.parentDocumentId }, include: { versions: { where: { status: 'DOC_PUBLISHED' } } } });
        if (!parent?.documentCode || !parent.versions.length || !((m.docType === 'SD' && ['QM', 'QP'].includes(parent.docType || '')) || (['WI', 'FM'].includes(m.docType) && parent.docType === 'QP')))
            fail(400, 'เอกสารแม่ไม่ถูกต้อง');
        if (m.docType === 'WI') {
            prefix = 'WI';
            suffix = `-${parent.documentCode}`;
            pattern = new RegExp(`^WI(\\d+)${suffix}$`);
        }
        else {
            prefix = `${m.docType}-${parent.documentCode}-`;
            pattern = new RegExp(`^${prefix}(\\d+)$`);
        }
    }
    const key = prefix + '{n}' + suffix;
    const docs = await tx.document.findMany({ where: { documentCode: { not: null } }, select: { documentCode: true } });
    const max = Math.max(0, ...docs.map(d => Number(d.documentCode?.match(pattern)?.[1] || 0)));
    const counter = await tx.documentCodeSequence.upsert({ where: { key }, create: { key, lastNumber: max }, update: {} });
    const n = Math.max(max, counter.lastNumber) + 1;
    if (n > 99)
        fail(409, 'เลขเอกสารเต็มช่วง ต้องทบทวนกฎการรันเลข');
    await tx.documentCodeSequence.update({ where: { key }, data: { lastNumber: n } });
    return prefix + String(n).padStart(2, '0') + suffix;
}
function logistics(body: Record<string, unknown>, a: string): Logistics { const reason = str(body.notApplicableReason, 4000); if (!Array.isArray(body.items) || body.items.length > 300)
    fail(400, 'รายการถือครองไม่ถูกต้อง'); if (reason && body.items.length)
    fail(400, 'เลือกบันทึกรายการหรือเหตุผลไม่เกี่ยวข้อง'); if (!reason && !body.items.length)
    fail(400, 'ระบุรายการหรือเหตุผลไม่เกี่ยวข้อง'); const copies = new Set<string>(); const items = body.items.map((v: any) => { if (!v || typeof v !== 'object')
    fail(400, 'รายการไม่ถูกต้อง'); const evidenceFileId = uuid(v.evidenceFileId); const copyNo = str(v.copyNo, 32), holderName = str(v.holderName, 200), holderPosition = str(v.holderPosition, 200), completedDate = date(v.completedDate), evidence = str(v.evidence, 4000); if (!evidenceFileId || !copyNo || !holderName || !holderPosition || !completedDate || completedDate > today() || !evidence || copies.has(copyNo))
    fail(400, 'ระบุสำเนา ผู้ถือครอง ตำแหน่ง วันที่ และหลักฐานให้ครบ ไม่ซ้ำ'); copies.add(copyNo); return { copyNo, holderName, holderPosition, completedDate, evidence, evidenceFileId, ...(v.holderUserId ? { holderUserId: uuid(v.holderUserId)! } : {}) }; }); return { items, ...(reason ? { notApplicableReason: reason } : {}), recordedById: dbUserId(a), recordedAt: new Date().toISOString() }; }
export async function command(a: string, id: string, action: string, body: Record<string, unknown>) {
    await transaction(async (tx) => {
        const d = await row(tx, a, id);
        if (!actions(a, d).includes(action))
            fail(403, 'ไม่มีสิทธิ์ดำเนินการในขั้นนี้');
        const m = d.draft as unknown as Draft;
        if (action === 'submit') {
            if (!m.title || !d.reason || !m.ownerUserId || m.issueNo === null || m.revisionNo === null || !d.files.some(f => f.roundNo === d.roundNo && f.kind === 'DRAFT'))
                fail(400, 'ระบุชื่อ เหตุผล ผู้รับผิดชอบ ฉบับ และ PDF ให้ครบ');
            await requireFiles(d.files.filter(file => file.roundNo === d.roundNo && file.kind === 'DRAFT'));
            await validateSource(tx, a, m, d.requestType);
            if (m.ownerUserId !== d.requesterId)
                fail(400, 'เจ้าของไม่ตรงผู้จัดทำ');
            if (!await tx.user.findFirst({ where: { id: m.ownerUserId, isActive: true } }))
                fail(400, 'ผู้รับผิดชอบไม่พร้อมใช้งาน');
            if (d.requestType === 'NEW_DOCUMENT' && ['WI', 'SD', 'FM'].includes(m.docType) && !m.parentDocumentId)
                fail(400, 'เลือกเอกสารแม่');
            if (d.requestType === 'NEW_DOCUMENT' && m.docType === 'QP' && !m.sectionCode)
                fail(400, 'เลือกส่วนงาน');
            let number = {};
            if (!d.darNo) {
                const year = Number(today().slice(0, 4)) + 543;
                const count = await tx.numberSequence.upsert({ where: { series_buddhistYear: { series: 'DAR', buddhistYear: year } }, create: { series: 'DAR', buddhistYear: year, lastNumber: 1 }, update: { lastNumber: { increment: 1 } } });
                number = { darNo: `${String(count.lastNumber).padStart(3, '0')}/${year}`, buddhistYear: year, sequenceNo: count.lastNumber };
            }
            await tx.darRound.create({ data: { darId: id, roundNo: d.roundNo, snapshot: jsonSafe({ draft: m, reason: d.reason, fileIds: d.files.filter(f => f.roundNo === d.roundNo && f.kind === 'DRAFT').map(f => f.id) }) } });
            await tx.dar.update({ where: { id }, data: { ...number, submittedAt: new Date(), draft: m as unknown as Prisma.InputJsonObject, assignments: {} } });
            await history(tx, a, d, 'DAR_AWAITING_INTAKE');
        }
        else if (['intake', 'review', 'approve'].includes(action)) {
            const result = String(body.result), comment = str(body.comment, 4000);
            const success = action === 'approve' ? 'APPROVED' : 'ACCEPTED';
            if (![success, 'CHANGES_REQUESTED', 'REJECTED'].includes(result))
                fail(400, 'ผลพิจารณาไม่ถูกต้อง');
            if (result !== success && !comment)
                fail(400, 'ระบุเหตุผลส่งกลับหรือไม่อนุมัติ');
            const step = action === 'intake' ? 'INTAKE' : action === 'review' ? 'REVIEW' : 'APPROVAL';
            await tx.darDecision.create({ data: { darId: id, roundNo: d.roundNo, step, result: result as any, comment, decidedById: dbUserId(a), actorRole: roles[a] } });
            const next = result === 'CHANGES_REQUESTED' ? 'DAR_CHANGES_REQUESTED' : result === 'REJECTED' ? 'DAR_REJECTED' : action === 'intake' ? 'DAR_AWAITING_REVIEW' : action === 'review' ? 'DAR_AWAITING_APPROVAL' : 'DAR_APPROVED';
            await history(tx, a, d, next, comment || undefined);
            if (next === 'DAR_CHANGES_REQUESTED')
                await tx.dar.update({ where: { id }, data: { roundNo: { increment: 1 }, assignments: {} } });
        }
        else if (action === 'delegate') {
            const step = m.docType === 'QM' ? 'REVIEW' : 'APPROVAL';
            if (body.step !== step || body.assigneeId !== 'deputy')
                fail(400, 'มอบหมายได้เฉพาะผู้ช่วย QMR ในขั้นของ QMR');
            const assignments = { ...(d.assignments as object), [step]: { assigneeId: dbUserId('deputy'), assignedById: dbUserId(a), roundNo: d.roundNo, assignedAt: new Date().toISOString() } };
            await tx.dar.update({ where: { id }, data: { assignments } });
            await audit(tx, a, id, 'DAR_DELEGATE', d.assignments, assignments);
        }
        else if (action === 'publish') {
            const effectiveDate = date(body.effectiveDate) || m.effectiveDate;
            const approval = d.decisions.find(x => x.roundNo === d.roundNo && x.step === 'APPROVAL' && x.result === 'APPROVED');
            const approvedDay = approval ? new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' }).format(approval.decidedAt) : null;
            if (!effectiveDate || effectiveDate > today() || !approvedDay || effectiveDate < approvedDay || m.issueNo === null || m.revisionNo === null)
                fail(400, 'วันที่มีผลใช้ต้องไม่น้อยกว่าวันอนุมัติและไม่เกินวันนี้ ข้อมูลฉบับต้องครบ');
            const round = d.rounds.find(r => r.roundNo === d.roundNo);
            if (!round)
                fail(409, 'ไม่พบร่างที่อนุมัติ');
            const files = d.files.filter(f => f.roundNo === d.roundNo && f.kind === 'DRAFT');
            if (!files.length)
                fail(400, 'ไม่พบไฟล์ที่อนุมัติ');
            await requireFiles(files);
            let documentId: string;
            let oldVersion: string | undefined;
            if (d.requestType === 'REVISE') {
                const source = await tx.documentVersion.findUnique({ where: { id: m.sourceVersionId! }, include: { document: true } });
                if (!source || source.status !== 'DOC_PUBLISHED' || source.supersededById || source.issueNo !== m.issueNo || source.revisionNo! + 1 !== m.revisionNo || source.document.ownerUserId !== m.ownerUserId)
                    fail(409, 'ฉบับต้นทางหรือเจ้าของเปลี่ยนแล้ว ต้องตรวจสอบใหม่');
                documentId = source.documentId;
                oldVersion = source.id;
                await tx.document.update({ where: { id: documentId }, data: { title: m.title } });
                await tx.documentVersion.update({ where: { id: source.id }, data: { status: 'DOC_OBSOLETE' } });
            }
            else {
                const documentCode = await nextCode(tx, m);
                const department = await tx.department.upsert({ where: { code: '2301' }, create: CENTRAL_DEPARTMENT, update: {} });
                documentId = (await tx.document.create({ data: { documentCode, title: m.title, docType: m.docType, departmentId: department.id, ownerUserId: m.ownerUserId } })).id;
            }
            for (const f of files) {
                if (await tx.documentFile.findUnique({ where: { sha256: f.sha256 } }))
                    fail(409, 'ไฟล์นี้อยู่ในทะเบียนแล้ว กรุณาตรวจสอบฉบับก่อนประกาศ');
            }
            const v = await tx.documentVersion.create({ data: { documentId, issueNo: m.issueNo, revisionNo: m.revisionNo, status: 'DOC_PUBLISHED', reviewStatus: 'VERIFIED', effectiveDate: new Date(effectiveDate), publishedAt: new Date(), publishedById: dbUserId(a), originatingDarId: id, files: { create: files.map(f => ({ fileName: f.fileName, mimeType: 'application/pdf', sizeBytes: f.sizeBytes, storagePath: f.storagePath, sha256: f.sha256, uploadedById: f.uploadedById })) } } });
            if (oldVersion)
                await tx.documentVersion.update({ where: { id: oldVersion }, data: { supersededById: v.id } });
            await tx.darTargetItem.create({ data: { darId: id, documentId, versionId: m.sourceVersionId } });
            await tx.dar.update({ where: { id }, data: { effectiveDate: new Date(effectiveDate) } });
            await history(tx, a, d, 'DAR_DISTRIBUTING');
            await audit(tx, a, id, 'DAR_PUBLISH', {}, { documentId, versionId: v.id, effectiveDate });
        }
        else if (action === 'distribution' || action === 'recall') {
            const log = logistics(body, a);
            for (const i of log.items) {
                if (!d.files.some(f => f.id === i.evidenceFileId && f.kind === action.toUpperCase()))
                    fail(400, 'แนบ PDF หลักฐานของรายการนี้ก่อน');
            }
            const produced = d.producedVersions[0];
            if (!produced)
                fail(409, 'ยังไม่ประกาศใช้');
            const publicationDay = produced.publishedAt ? new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' }).format(produced.publishedAt) : today();
            if (log.items.some(i => i.completedDate < publicationDay))
                fail(400, 'วันที่ดำเนินการต้องไม่น้อยกว่าวันประกาศใช้');
            if (action === 'recall') {
                const old = m.sourceVersionId ? await tx.distributionEntry.findMany({ where: { versionId: m.sourceVersionId } }) : [];
                if (old.length && log.notApplicableReason)
                    fail(400, 'มีผู้ถือครองฉบับเดิม ต้องเรียกคืนครบ');
                if (old.some(x => !log.items.some(i => i.copyNo === x.copyNo && i.holderName === x.holderName)))
                    fail(400, 'รายการเรียกคืนไม่ครบผู้ถือครองเดิม');
                if (d.requestType === 'NEW_DOCUMENT' && log.items.length)
                    fail(400, 'เอกสารใหม่ไม่มีฉบับเดิมให้เรียกคืน');
                for (const x of old)
                    await tx.distributionEntry.update({ where: { id: x.id }, data: { returnedDate: new Date(log.items.find(i => i.copyNo === x.copyNo)!.completedDate) } });
            }
            else {
                const existing = await tx.distributionEntry.findMany({ where: { versionId: produced.id } });
                if (existing.some(x => !log.items.some(i => i.copyNo === x.copyNo && i.holderName === x.holderName)))
                    fail(400, 'ห้ามตัดผู้ถือครองที่บันทึกแล้ว');
                for (const i of log.items) {
                    if (i.holderUserId && !await tx.user.findFirst({ where: { id: i.holderUserId, isActive: true } }))
                        fail(400, 'ผู้ถือครองไม่ถูกต้อง');
                    await tx.distributionEntry.upsert({ where: { versionId_copyNo: { versionId: produced.id, copyNo: i.copyNo } }, create: { versionId: produced.id, copyNo: i.copyNo, holderName: i.holderName, holderPosition: i.holderPosition, holderUserId: i.holderUserId, receivedDate: new Date(i.completedDate), signedReceipt: true }, update: { receivedDate: new Date(i.completedDate), signedReceipt: true } });
                }
            }
            const updated = { ...(d.logistics as object), [action]: log };
            await tx.dar.update({ where: { id }, data: { logistics: updated as unknown as Prisma.InputJsonObject, ...(action === 'distribution' ? { distributedAt: new Date() } : { recalledAt: new Date() }) } });
            await audit(tx, a, id, `DAR_${action.toUpperCase()}`, d.logistics, updated);
            if (action === 'distribution')
                await history(tx, a, d, 'DAR_RECALLING');
        }
        else if (action === 'close') {
            const log = d.logistics as unknown as Record<string, Logistics>;
            if (!log.distribution || !log.recall || !d.distributedAt || !d.recalledAt)
                fail(400, 'บันทึกแจกจ่ายและเรียกคืนพร้อมหลักฐานหรือเหตุผลไม่เกี่ยวข้องก่อนปิด');
            const evidenceIds = [...log.distribution.items, ...log.recall.items].map(item => item.evidenceFileId);
            if (evidenceIds.some(id => !d.files.some(file => file.id === id))) fail(409, 'ไม่พบหลักฐานแจกจ่ายหรือเรียกคืน');
            await requireFiles(d.files.filter(file => evidenceIds.includes(file.id) || (file.kind === 'DRAFT' && file.roundNo === d.roundNo)));
            await tx.dar.update({ where: { id }, data: { closedAt: new Date(), closedById: dbUserId(a) } });
            await history(tx, a, d, 'DAR_CLOSED');
        }
    });
    return detail(a, id);
}
