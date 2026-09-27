import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { api, ApiError } from '../services/apiClient';
import { darAction, darStatuses, documentTypes, getDar, getDars, type Dar, type DarOptions, type LogisticsItem, type LogisticsRecord } from '../services/darService';
import { StatusBadge } from '../components/StatusBadge';
import { CopyStatusNotice } from '../components/CopyStatusNotice';

const message = (error: unknown) => error instanceof ApiError ? error.message : 'เชื่อมต่อระบบไม่ได้ กรุณาลองใหม่';
const date = (value?: string | null) => value ? new Date(value).toLocaleDateString('th-TH') : 'ยังไม่ระบุ';
const requestName = (value: string) => value === 'REVISE' ? 'แก้ไขฉบับเดิม' : 'จัดทำเอกสารใหม่';
const stepNames: Record<string, string> = { INTAKE: 'ตรวจรับ', REVIEW: 'ทบทวน', APPROVAL: 'อนุมัติ' };
const resultNames: Record<string, string> = { ACCEPTED: 'ผ่าน', APPROVED: 'อนุมัติ', REJECTED: 'ไม่อนุมัติ', CHANGES_REQUESTED: 'ส่งกลับแก้ไข' };

export function DarPage() {
  const [rows, setRows] = useState<Dar[]>([]), [options, setOptions] = useState<DarOptions | null>(null);
  const [q, setQ] = useState(''), [status, setStatus] = useState(() => new URLSearchParams(window.location.hash.split('?')[1] || '').get('status') || ''), [type, setType] = useState(''), [requestType, setRequestType] = useState(''), [mine, setMine] = useState(false);
  const [selected, setSelected] = useState(() => new URLSearchParams(window.location.hash.split('?')[1] || '').get('id') || ''), [dar, setDar] = useState<Dar | null>(null), [tab, setTab] = useState('detail');
  const [error, setError] = useState(''), [notice, setNotice] = useState(''), [loading, setLoading] = useState(true), [busy, setBusy] = useState(false), [revision, setRevision] = useState(0);
  const [editor, setEditor] = useState(false), [action, setAction] = useState('');
  useEffect(() => {
    let cancelled = false; setLoading(true); setError('');
    const timer = window.setTimeout(() => {
      const request = selected ? getDar(selected).then(data => { if (!cancelled) { setDar(data.dar); setOptions(data.options); } })
        : getDars(new URLSearchParams({ q, status, docType: type, requestType, mine: mine ? 'true' : '' })).then(data => { if (!cancelled) { setRows(data.dars); setOptions(data.options); } });
      request.catch(e => { if (!cancelled) setError(message(e)); }).finally(() => { if (!cancelled) setLoading(false); });
    }, selected ? 0 : 200);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [selected, q, status, type, requestType, mine, revision]);
  const refresh = () => setRevision(n => n + 1);
  async function perform(name: string, body: unknown = {}) {
    if (!dar) return; setBusy(true); setError('');
    try { await darAction(dar.id, name, body); setAction(''); setNotice('บันทึกการดำเนินการเรียบร้อยแล้ว'); refresh(); }
    catch (e) { setError(message(e)); throw e; }
    finally { setBusy(false); }
  }
  const allowed = (name: string) => Boolean(dar?.allowedActions.includes(name));
  const closeReasons = dar?.closeBlockReasons || (allowed('close') ? [!dar?.logistics?.distribution && 'ยังไม่บันทึกแจกจ่ายพร้อมหลักฐานหรือเหตุผลไม่เกี่ยวข้อง', !dar?.logistics?.recall && 'ยังไม่บันทึกเรียกคืนพร้อมหลักฐานหรือเหตุผลไม่เกี่ยวข้อง'].filter((v): v is string => Boolean(v)) : []);
  return <main className="module-page registry-page dar-page">
    <div className="registry-heading"><div><h1>{selected ? dar?.darNo || 'ร่างคำขอ DAR' : 'คำขอเอกสาร (DAR)'}</h1><p>{selected ? dar?.draft.title || 'ยังไม่ระบุชื่อเอกสาร' : 'ตรวจรับ ทบทวน อนุมัติ ประกาศใช้ และปิดคำขอ'}</p></div>
      {selected ? <button className="secondary" onClick={() => { setSelected(''); setDar(null); setNotice(''); }}>กลับรายการ</button> : Boolean(options?.createTypes?.length) && <button onClick={() => { setDar(null); setEditor(true); }}>＋ สร้างคำขอ DAR</button>}</div>
    {notice && <p className="registry-notice" role="status">{notice}</p>}{error && <div className="registry-error" role="alert">{error} <button className="secondary" onClick={refresh}>ลองใหม่</button></div>}
    {!selected ? <section className="registry-panel registry-flush"><div className="registry-toolbar">
      <input aria-label="ค้นหา DAR" placeholder="ค้นหาเลขคำขอหรือชื่อเอกสาร…" value={q} onChange={e => setQ(e.target.value)}/>
      <select aria-label="สถานะ DAR" value={status} onChange={e => setStatus(e.target.value)}><option value="">ทุกสถานะ</option>{Object.entries(darStatuses).map(([id, text]) => <option key={id} value={id}>{text}</option>)}</select>
      <select aria-label="ประเภทเอกสาร" value={type} onChange={e => setType(e.target.value)}><option value="">ทุกประเภทเอกสาร</option>{Object.entries(documentTypes).map(([id, text]) => <option key={id} value={id}>{text}</option>)}</select>
      <select aria-label="ลักษณะคำขอ" value={requestType} onChange={e => setRequestType(e.target.value)}><option value="">ทุกลักษณะคำขอ</option><option value="NEW_DOCUMENT">จัดทำใหม่</option><option value="REVISE">แก้ไขฉบับเดิม</option></select>
      <label className="dar-mine"><input type="checkbox" checked={mine} onChange={e => setMine(e.target.checked)}/>งานของฉัน</label>
    </div>{loading ? <p className="registry-empty" role="status">กำลังโหลดคำขอ…</p> : <><div className="registry-count">{rows.length} รายการ</div><div className="registry-table-wrap"><table className="registry-table"><thead><tr>{['เลขคำขอ / เอกสาร', 'ประเภท / ลักษณะคำขอ', 'ผู้ขอ', 'วันที่ส่ง', 'ขั้นปัจจุบัน'].map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map(d => <tr key={d.id}><td><button className="registry-link" onClick={() => { setSelected(d.id); setTab('detail'); setNotice(''); }}>{d.darNo || 'ร่าง — ยังไม่ออกเลข'}</button><div>{d.draft.title || 'ยังไม่ระบุชื่อ'}</div></td><td>{documentTypes[d.draft.docType] || 'ยังไม่ระบุ'}<br/><small>{requestName(d.requestType)}</small></td><td>{d.requester.fullName}</td><td>{date(d.submittedAt)}</td><td><Status value={d.status}/></td></tr>)}</tbody></table></div>{!rows.length && !error && <p className="registry-empty">ไม่มีคำขอที่ตรงกับตัวกรอง</p>}</>}</section>
    : loading ? <p role="status">กำลังโหลดรายละเอียด…</p> : dar && <>
      <div className="dar-detail-heading"><Status value={dar.status}/><span>ผู้ขอ {dar.requester.fullName} · รอบที่ {dar.roundNo}</span></div>
      <nav className="dar-tabs" aria-label="ส่วนรายละเอียด DAR">{[['detail', 'ข้อมูลคำขอและ PDF'], ['history', 'ผลตรวจและประวัติ'], ['logistics', 'แจกจ่าย / เรียกคืน']].map(([id, name]) => <button key={id} className={tab === id ? 'active' : 'secondary'} aria-pressed={tab === id} onClick={() => setTab(id)}>{name}</button>)}</nav>
      {tab === 'detail' && <section className="registry-panel"><h2>{dar.draft.title || 'ร่างคำขอ'}</h2><dl className="registry-metadata">{[['ลักษณะคำขอ', requestName(dar.requestType)], ['ประเภท', documentTypes[dar.draft.docType] || 'ยังไม่ระบุ'], ['ฉบับ / แก้ไข', `${dar.draft.issueNo ?? '—'} / ${dar.draft.revisionNo ?? '—'}`], ['วันที่มีผล', date(dar.effectiveDate || dar.draft.effectiveDate)], ['ผู้รับผิดชอบ', (dar.draft.ownerUserId === dar.requester.id ? dar.requester.fullName : options?.owners.find(o => o.id === dar.draft.ownerUserId)?.fullName) || 'ยังไม่ระบุ'], ['หน่วยงาน', 'สำนักงานคณบดีคณะวิศวกรรมศาสตร์']].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><h3>เหตุผลในการจัดทำ / แก้ไข</h3><p className="registry-notes">{dar.reason || 'ยังไม่ระบุ'}</p><p className="registry-metadata-note">{dar.draft.docType === 'QM' ? 'ตรวจรับ → QMR ทบทวน → คณบดีอนุมัติ → DCC ประกาศใช้' : 'ตรวจรับ → รองคณบดีทบทวน → QMR อนุมัติ → DCC ประกาศใช้'}</p>
        <h3>ไฟล์ที่เสนอในรอบปัจจุบัน</h3><Files files={dar.files.filter(f => f.roundNo === dar.roundNo && (!f.kind || f.kind === 'DRAFT'))}/>
        <div className="registry-actions">{allowed('edit') && <button className="secondary" onClick={() => setEditor(true)}>แก้ไขร่าง</button>}{allowed('upload') && <Upload darId={dar.id} onSaved={() => { refresh(); setNotice('แนบไฟล์แล้ว'); }}/>} {allowed('submit') && <button disabled={busy} onClick={() => setAction('submit')}>ส่งตรวจรับ</button>}</div>
      </section>}
      {tab === 'history' && <section className="registry-panel"><h2>ผลตรวจทุกรอบ</h2>{dar.decisions.length ? <ol className="registry-history">{dar.decisions.map(d => <li key={d.id}><strong>{stepNames[d.step] || 'ตรวจคำขอ'} — {resultNames[d.result] || 'บันทึกผล'}</strong><p>รอบที่ {d.roundNo ?? '—'} · {date(d.decidedAt)} · {d.decidedBy?.fullName || 'ผู้ดำเนินการ'}</p><p className="registry-notes">{d.comment}</p></li>)}</ol> : <p>ยังไม่มีผลตรวจ</p>}<h2>ไฟล์ทุกรอบ</h2><Files files={dar.files}/><h2>ประวัติการเดินงาน</h2><ol className="registry-history">{dar.statusHistory.map(h => <li key={h.id}><strong>{darStatuses[h.toStatus] || 'บันทึกการดำเนินการ'}</strong><p>{date(h.occurredAt)} · {h.actor?.fullName || 'ผู้ดำเนินการ'}</p><p className="registry-notes">{h.reason}</p></li>)}</ol></section>}
      {tab === 'logistics' && <section className="registry-panel"><h2>แจกจ่ายและเรียกคืน</h2><p>บันทึกสำเนาแต่ละรายการและหลักฐานให้ครบ การแจกจ่ายไม่ได้ยืนยันการรับทราบเนื้อหาแทนผู้รับ</p><LogisticsSummary title="การแจกจ่าย" record={dar.logistics?.distribution}/><LogisticsSummary title="การเรียกคืน" record={dar.logistics?.recall}/><div className="registry-actions">{allowed('distribution') && <button onClick={() => setAction('distribution')}>บันทึกแจกจ่าย</button>}{allowed('recall') && <button onClick={() => setAction('recall')}>บันทึกเรียกคืน</button>}</div></section>}
      <section className="registry-panel"><h2>ดำเนินการตามหน้าที่</h2>{closeReasons.length ? <ul className="registry-warning">{closeReasons.map(reason => <li key={reason}>{reason}</li>)}</ul> : null}<div className="registry-actions dar-work-actions">
        {(['intake', 'review', 'approve', 'publish', 'delegate', 'close'] as const).filter(allowed).map(name => <button key={name} disabled={busy || name === 'close' && closeReasons.length > 0} onClick={() => setAction(name)}>{{ intake: 'ตรวจรับคำขอ', review: 'บันทึกผลทบทวน', approve: 'บันทึกผลอนุมัติ', publish: 'ประกาศใช้', delegate: 'มอบหมายผู้ช่วย QMR', close: 'ตรวจครบและปิด DAR' }[name]}</button>)}
        {!dar.allowedActions.length && <p>ไม่มีรายการที่ต้องดำเนินการด้วยบัญชีนี้ในขั้นปัจจุบัน</p>}
      </div></section>
    </>}
    {editor && options && <DraftEditor dar={selected ? dar : null} options={options} onClose={() => setEditor(false)} onSaved={id => { setEditor(false); setSelected(id); setTab('detail'); refresh(); setNotice('บันทึกร่างแล้ว สามารถแนบ PDF และส่งตรวจรับได้'); }}/>} 
    {action && dar && <ActionDialog action={action} dar={dar} onClose={() => setAction('')} onSave={body => perform(action, body)} onRefresh={refresh}/>}
  </main>;
}

function Status({ value }: { value: string }) { return <StatusBadge status={value}>{darStatuses[value] || 'กำลังดำเนินการ'}</StatusBadge>; }
function Files({ files }: { files: Dar['files'] }) { return files.length ? <><CopyStatusNotice/>{files.map(f => <div className="registry-file" key={f.id}><div><strong>{f.fileName}</strong><br/><small>รอบที่ {f.roundNo}</small></div><div className="registry-actions"><a href={`/api/dars/files/${encodeURIComponent(f.id)}?download=1`}>ดาวน์โหลด PDF</a></div></div>)}</> : <p className="registry-metadata-note">ยังไม่มีไฟล์ในรอบนี้ กรุณาแนบ PDF ก่อนส่งตรวจรับ</p>; }
function Upload({ darId, onSaved, kind = 'DRAFT' }: { darId: string; onSaved: () => void; kind?: string }) {
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  return <div><label className="dar-upload">{busy ? 'กำลังแนบไฟล์…' : 'แนบ PDF'}<input aria-label="แนบ PDF คำขอ" type="file" accept="application/pdf,.pdf" disabled={busy} onChange={async e => { const file = e.target.files?.[0]; if (!file) return; const input = e.target; setBusy(true); setError(''); try { const data = new FormData(); data.set('file', file); data.set('kind', kind); await darAction(darId, 'files', data); onSaved(); } catch (error) { setError(message(error)); } finally { setBusy(false); input.value = ''; } }}/></label>{error && <p className="form-error" role="alert">{error}</p>}</div>;
}
function Modal({ title, children, busy, onClose }: { title: string; children: ReactNode; busy: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null); useEffect(() => { ref.current?.showModal(); }, []);
  return <dialog ref={ref} className="registry-dialog" aria-label={title} onCancel={e => { e.preventDefault(); if (!busy) onClose(); }}><div className="registry-heading"><h2>{title}</h2><button type="button" className="secondary" aria-label="ปิดหน้าต่าง" disabled={busy} onClick={onClose}>×</button></div>{children}</dialog>;
}
function DraftEditor({ dar, options, onClose, onSaved }: { dar: Dar | null; options: DarOptions; onClose: () => void; onSaved: (id: string) => void }) {
  const [kind, setKind] = useState(dar?.requestType || 'NEW_DOCUMENT'), [type, setType] = useState(dar?.draft.docType || options.createTypes?.[0] || 'QP');
  const [source, setSource] = useState(dar?.draft.sourceVersionId || ''), [busy, setBusy] = useState(false), [error, setError] = useState('');
  const sourceDocument = options.documents.find(d => d.versions.some(v => v.id === source));
  const sourceVersion = sourceDocument?.versions.find(v => v.id === source);
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setError(''); const values = Object.fromEntries(new FormData(e.currentTarget));
    const body = { ...values, requestType: kind, docType: kind === 'REVISE' ? sourceDocument?.docType : type, sourceVersionId: kind === 'REVISE' ? source || null : null,
      issueNo: kind === 'REVISE' ? sourceVersion?.issueNo : values.issueNo === '' ? null : Number(values.issueNo),
      revisionNo: kind === 'REVISE' ? sourceVersion?.revisionNo === null || sourceVersion?.revisionNo === undefined ? null : sourceVersion.revisionNo + 1 : values.revisionNo === '' ? null : Number(values.revisionNo),
      ownerUserId: kind === 'REVISE' ? sourceDocument?.ownerUserId : values.ownerUserId || null, sectionCode: values.sectionCode || null, parentDocumentId: values.parentDocumentId || null, effectiveDate: values.effectiveDate || null };
    try { const result = await api<{ dar: Dar }>(dar ? `/dars/${dar.id}` : '/dars', body, dar ? 'PATCH' : 'POST'); onSaved(result.dar.id); }
    catch (error) { setError(message(error)); } finally { setBusy(false); }
  }
  return <Modal title={dar ? 'แก้ไขร่างคำขอ' : 'สร้างร่างคำขอ DAR'} busy={busy} onClose={onClose}><form onSubmit={e => void save(e)}><p>บันทึกร่างไว้ก่อนได้ เมื่อข้อมูลและ PDF ครบจึงส่งตรวจรับ เอกสารใหม่จะได้รหัสเมื่อประกาศใช้</p><fieldset className="registry-fields" disabled={busy}><div className="registry-form-grid">
    <label>ลักษณะคำขอ<select value={kind} disabled={Boolean(dar)} onChange={e => setKind(e.target.value)}><option value="NEW_DOCUMENT">จัดทำเอกสารใหม่</option><option value="REVISE">แก้ไขฉบับเดิม</option></select></label>
    {kind === 'REVISE' ? <label>ฉบับที่ต้องการแก้ไข<select value={source} disabled={Boolean(dar)} onChange={e => setSource(e.target.value)}><option value="">เลือกเอกสารที่รับผิดชอบ</option>{options.documents.filter(d => d.canRevise).flatMap(d => d.versions.map(v => <option key={v.id} value={v.id}>{d.documentCode} · {d.title}</option>))}</select></label> : <label>ประเภทเอกสาร<select value={type} disabled={Boolean(dar)} onChange={e => setType(e.target.value)}>{(options.createTypes || []).map(t => <option key={t} value={t}>{documentTypes[t]}</option>)}</select></label>}
    {kind === 'REVISE' && sourceDocument && <p className="registry-wide registry-metadata-note">{sourceDocument.ownerUserId ? 'ใช้เจ้าของเอกสารจากทะเบียน' : 'ยังไม่มีเจ้าของเอกสาร ให้ DCC ระบุในทะเบียนก่อน'} · ฉบับเดิม {sourceVersion?.issueNo ?? 'ยังไม่ระบุ'} / {sourceVersion?.revisionNo ?? 'ยังไม่ระบุ'}{(sourceVersion?.issueNo === null || sourceVersion?.revisionNo === null) && ' — ให้ DCC เติมข้อมูลจากต้นฉบับก่อนส่งคำขอ'}</p>}
    <label className="registry-wide">ชื่อเอกสาร<input key={source || 'new'} name="title" defaultValue={dar?.draft.title || sourceDocument?.title || ''} maxLength={300}/></label>
    <label className="registry-wide">เหตุผลในการจัดทำ / แก้ไข<textarea name="reason" defaultValue={dar?.reason || ''} rows={3} maxLength={4000}/></label>
    {kind === 'NEW_DOCUMENT' && <><label>ผู้รับผิดชอบ<select name="ownerUserId" defaultValue={dar?.draft.ownerUserId || options.currentUserId || ''}><option value="">ยังไม่ระบุ</option>{options.owners.filter(o => !options.currentUserId || o.id === options.currentUserId).map(o => <option key={o.id} value={o.id}>{o.fullName}</option>)}</select></label><label>รหัสส่วนงาน<select name="sectionCode" defaultValue={dar?.draft.sectionCode || ''}><option value="">ยังไม่ระบุ</option>{options.sectionCodes.map(code => <option key={code} value={code}>ส่วนงาน {code}</option>)}</select></label><label>ฉบับที่<input name="issueNo" type="number" min="0" step="1" defaultValue={dar?.draft.issueNo ?? ''}/></label><label>แก้ไขครั้งที่<input name="revisionNo" type="number" min="0" step="1" defaultValue={dar?.draft.revisionNo ?? ''}/></label>
      {['WI', 'SD', 'FM'].includes(type) && <label className="registry-wide">เอกสารแม่<select name="parentDocumentId" defaultValue={dar?.draft.parentDocumentId || ''}><option value="">เลือกเอกสารแม่</option>{options.documents.filter(d => d.docType === 'QP' || type === 'SD' && d.docType === 'QM').map(d => <option key={d.id} value={d.id}>{d.documentCode} · {d.title}</option>)}</select></label>}</>}
    <label>วันที่เสนอให้มีผลใช้<input name="effectiveDate" type="date" defaultValue={dar?.draft.effectiveDate?.slice(0, 10) || ''}/></label>
  </div></fieldset>{error && <p className="form-error" role="alert">{error}</p>}<div className="registry-actions"><button type="button" className="secondary" disabled={busy} onClick={onClose}>ยกเลิก</button><button disabled={busy}>{busy ? 'กำลังบันทึก…' : 'บันทึกร่าง'}</button></div></form></Modal>;
}

function ActionDialog({ action, dar, onClose, onSave, onRefresh }: { action: string; dar: Dar; onClose: () => void; onSave: (body: unknown) => Promise<void>; onRefresh: () => void }) {
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [result, setResult] = useState(action === 'approve' ? 'APPROVED' : 'ACCEPTED');
  const [na, setNa] = useState(Boolean(dar.logistics?.[action as 'distribution' | 'recall']?.notApplicableReason)), [items, setItems] = useState<LogisticsItem[]>(dar.logistics?.[action as 'distribution' | 'recall']?.items || []);
  const title = ({ submit: 'ยืนยันส่งตรวจรับ', intake: 'ตรวจรับคำขอ', review: 'บันทึกผลทบทวน', approve: 'บันทึกผลอนุมัติ', publish: 'ประกาศใช้เอกสาร', delegate: 'มอบหมายผู้ช่วย QMR', distribution: 'บันทึกแจกจ่าย', recall: 'บันทึกเรียกคืน', close: 'ยืนยันปิด DAR' } as Record<string, string>)[action];
  const decision = ['intake', 'review', 'approve'].includes(action), logistics = ['distribution', 'recall'].includes(action);
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const data = Object.fromEntries(new FormData(e.currentTarget)); setBusy(true); setError('');
    try { await onSave(decision ? { result, comment: data.comment } : logistics ? { items: na ? [] : items, notApplicableReason: na ? data.notApplicableReason : null } : action === 'delegate' ? { step: dar.status === 'DAR_AWAITING_REVIEW' ? 'REVIEW' : 'APPROVAL', assigneeId: 'deputy' } : action === 'publish' ? { effectiveDate: data.effectiveDate } : {}); }
    catch (error) { setError(message(error)); } finally { setBusy(false); }
  }
  const changeItem = (index: number, field: keyof LogisticsItem, value: string) => setItems(rows => rows.map((row, i) => i === index ? { ...row, [field]: value } : row));
  return <Modal title={title} busy={busy} onClose={onClose}><form onSubmit={e => void save(e)}><fieldset disabled={busy} className="registry-fields"><div className="registry-form-grid">
    {decision && <><label className="registry-wide">ผลการดำเนินการ<select value={result} onChange={e => setResult(e.target.value)}><option value={action === 'approve' ? 'APPROVED' : 'ACCEPTED'}>{action === 'approve' ? 'อนุมัติ' : 'ผ่าน'}</option><option value="CHANGES_REQUESTED">ส่งกลับให้แก้ไข</option><option value="REJECTED">ไม่อนุมัติและจบคำขอ</option></select></label><label className="registry-wide">ความเห็น / เหตุผล<textarea name="comment" rows={4} required={result !== 'ACCEPTED' && result !== 'APPROVED'} maxLength={4000}/></label></>}
    {action === 'publish' && <><p className="registry-wide">นำ PDF ที่ผ่านอนุมัติเข้าทะเบียน เอกสารใหม่จะออกเลขอัตโนมัติ ส่วนแก้ไขจะเก็บฉบับเดิมไว้ในประวัติ</p><label>วันที่มีผลใช้<input type="date" name="effectiveDate" required defaultValue={dar.draft.effectiveDate?.slice(0, 10) || ''}/></label></>}
    {action === 'submit' && <p className="registry-wide">ยืนยันว่าข้อมูลและ PDF ในรอบนี้พร้อมตรวจรับ เมื่อส่งแล้วต้องรอส่งกลับจึงแก้ไขได้</p>}
    {action === 'delegate' && <p className="registry-wide">มอบหมายผู้ช่วย QMR ให้ดำเนินการ{dar.status === 'DAR_AWAITING_REVIEW' ? 'ทบทวน' : 'อนุมัติ'}เฉพาะคำขอและรอบนี้ ระบบบันทึกผู้ดำเนินการจริง</p>}
    {action === 'close' && <p className="registry-wide">ตรวจสอบว่าประกาศใช้และบันทึกแจกจ่าย / เรียกคืนครบแล้ว การปิดคำขอจะเก็บผู้ปิดและวันที่</p>}
    {logistics && <div className="registry-wide"><label className="registry-check"><input type="checkbox" checked={na} onChange={e => setNa(e.target.checked)}/>ไม่มีรายการที่เกี่ยวข้อง</label>{na ? <label>เหตุผลที่ไม่เกี่ยวข้อง<textarea name="notApplicableReason" defaultValue={dar.logistics?.[action as 'distribution' | 'recall']?.notApplicableReason} required rows={3} maxLength={4000}/></label> : <><Upload darId={dar.id} kind={action.toUpperCase()} onSaved={onRefresh}/><p>แนบ PDF ใบรับหรือคืนสำเนา แล้วเลือกหลักฐานให้แต่ละรายการ</p>{items.map((item, index) => <div className="dar-copy" key={index}><div className="registry-heading"><strong>สำเนารายการที่ {index + 1}</strong><button type="button" className="secondary" onClick={() => setItems(rows => rows.filter((_, i) => i !== index))}>ลบรายการ</button></div><div className="registry-form-grid">{[['copyNo', 'เลขสำเนา'], ['holderName', 'ชื่อผู้ถือครอง'], ['holderPosition', 'ตำแหน่งผู้ถือครอง'], ['completedDate', action === 'distribution' ? 'วันที่รับสำเนา' : 'วันที่คืนสำเนา'], ['evidence', 'หลักฐาน / เลขอ้างอิงใบรับหรือคืน']].map(([key, label]) => <label key={key} className={key === 'evidence' ? 'registry-wide' : ''}>{label}<input type={key === 'completedDate' ? 'date' : 'text'} maxLength={key === 'copyNo' ? 32 : key === 'evidence' ? 4000 : 200} required value={item[key as keyof LogisticsItem] || ''} onChange={e => changeItem(index, key as keyof LogisticsItem, e.target.value)}/></label>)}<label className="registry-wide">ไฟล์หลักฐาน PDF<select required value={item.evidenceFileId || ''} onChange={e => changeItem(index, 'evidenceFileId', e.target.value)}><option value="">เลือก PDF ที่แนบไว้</option>{dar.files.filter(f => f.kind === action.toUpperCase()).map(f => <option key={f.id} value={f.id}>{f.fileName}</option>)}</select></label></div></div>)}<button type="button" className="secondary" onClick={() => setItems(rows => [...rows, { copyNo: '', holderName: '', holderPosition: '', completedDate: '', evidence: '' }])}>＋ เพิ่มผู้ถือครอง / สำเนา</button><p>ระบุผู้ถือครองให้ครบตามบัญชีแจกจ่าย หากยังดำเนินการไม่ครบ อย่าเพิ่งยืนยันปิดคำขอ</p></>}</div>}
  </div></fieldset>{error && <p className="form-error" role="alert">{error}</p>}<div className="registry-actions"><button type="button" className="secondary" disabled={busy} onClick={onClose}>ยกเลิก</button><button disabled={busy || logistics && !na && !items.length}>{busy ? 'กำลังบันทึก…' : 'ยืนยัน'}</button></div></form></Modal>;
}
function LogisticsSummary({ title, record }: { title: string; record?: LogisticsRecord }) {
  return <section className="dar-logistics"><h3>{title}</h3>{!record ? <p>ยังไม่บันทึก</p> : record.notApplicableReason ? <p>ไม่เกี่ยวข้อง: {record.notApplicableReason}</p> : <>{record.items?.some(item => item.evidenceFileId) && <CopyStatusNotice/>}{record.items?.map((item, index) => <div className="registry-file" key={`${item.copyNo}-${index}`}><div><strong>สำเนา {item.copyNo} · {item.holderName}</strong><p>{item.holderPosition} · {date(item.completedDate)}</p><p>หลักฐาน: {item.evidence}</p>{item.evidenceFileId && <a href={`/api/dars/files/${encodeURIComponent(item.evidenceFileId)}?download=1`}>ดาวน์โหลด PDF หลักฐาน</a>}</div></div>)}</>}{record && <small>ผู้บันทึก: {record.recordedById} · บันทึกเมื่อ {date(record.recordedAt)}</small>}</section>;
}
