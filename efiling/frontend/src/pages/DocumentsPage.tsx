import { useEffect, useRef, useState, type FormEvent } from 'react';
import { api, ApiError } from '../services/apiClient';
import { StatusBadge } from '../components/StatusBadge';
import { CopyStatusNotice } from '../components/CopyStatusNotice';

type Department = { id: string; code: string; nameTh: string };
type Owner = { id: string; fullName: string };
type Version = { id: string; originatingDar?: { id: string; darNo: string | null } | null; issueNo: number | null; revisionNo: number | null; status: string | null; reviewStatus: 'PENDING' | 'VERIFIED'; sourceConfirmedAt: string | null; sourceConfirmationNote: string | null; effectiveDate: string | null; reviewNotes: string | null; files: { id: string; fileName: string; sizeBytes: number; uploadedAt?: string; uploadedBy?: Owner | null }[] };
type Document = { id: string; documentCode: string | null; title: string; docType: string | null; department: Department | null; owner: Owner | null; versions: Version[] };
type Registry = { documents: Document[]; departments: Department[]; owners: Owner[]; canImport: boolean };
type Detail = { document: Document; history: { id: string; action: string; occurredAt: string; actor: Owner | null; beforeValue: unknown; afterValue: unknown }[] };
const types: Record<string, string> = { QM: 'คู่มือคุณภาพ', QP: 'ระเบียบปฏิบัติ', WI: 'วิธีปฏิบัติงาน', SD: 'เอกสารสนับสนุน', FM: 'แบบฟอร์ม' };
const date = (value: string | null | undefined) => value ? new Date(value).toLocaleDateString('th-TH') : 'ยังไม่ระบุ';
const status = (value: string | null) => value === 'DOC_PUBLISHED' ? 'ประกาศใช้' : value === 'DOC_OBSOLETE' ? 'ยกเลิกแล้ว' : 'ยังไม่ยืนยัน';
const errorMessage = (error: unknown) => error instanceof ApiError ? error.message : 'เชื่อมต่อระบบไม่ได้ กรุณาลองใหม่';
const sourceConfirmed = (v: Version) => v.reviewStatus === 'VERIFIED' && Boolean(v.sourceConfirmedAt);
const missingMetadata = (d: Document, v: Version) => !d.documentCode || !d.docType || !d.department || !d.owner || v.issueNo === null || v.revisionNo === null || !v.effectiveDate;
const review = (v: Version) => <StatusBadge status={v.reviewStatus}>{sourceConfirmed(v) ? 'ยืนยันจากเอกสารกลาง' : v.reviewStatus === 'VERIFIED' ? 'ตรวจสอบแล้ว' : 'รอตรวจสอบข้อมูล'}</StatusBadge>;

export function DocumentsPage({ userId, canViewDar = false }: { userId: string; canViewDar?: boolean }) {
  const [registry, setRegistry] = useState<Registry | null>(null);
  const [q, setQ] = useState(''), [type, setType] = useState(''), [filter, setFilter] = useState(''), [department, setDepartment] = useState(''), [lifecycle, setLifecycle] = useState('');
  const [selected, setSelected] = useState(''), [detail, setDetail] = useState<Detail | null>(null);
  const [error, setError] = useState(''), [loading, setLoading] = useState(true), [revision, setRevision] = useState(0);
  const [editor, setEditor] = useState<{ document?: Document; version?: Version } | null>(null);
  const [notice, setNotice] = useState('');
  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError('');
    const timer = window.setTimeout(() => {
      api<Registry>(`/documents?${new URLSearchParams({ q, type, status: filter, departmentId: department, lifecycle })}`)
        .then(data => { if (!cancelled) setRegistry(data); })
        .catch(e => { if (!cancelled) setError(errorMessage(e)); })
        .finally(() => { if (!cancelled) setLoading(false); });
    }, 250);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [q, type, filter, department, lifecycle, revision]);
  useEffect(() => {
    setDetail(null);
    if (!selected) return;
    let cancelled = false;
    setError('');
    api<Detail>(`/documents/${encodeURIComponent(selected)}`).then(data => { if (!cancelled) setDetail(data); }).catch(e => { if (!cancelled) setError(errorMessage(e)); });
    return () => { cancelled = true; };
  }, [selected, revision]);
  const canEdit = userId === 'dcc' && registry?.canImport;
  return <main className="module-page registry-page">
    <div className="registry-heading"><div><h1>{selected ? 'รายละเอียดเอกสาร' : 'ทะเบียนเอกสาร'}</h1><p>ค้นหาเอกสาร ฉบับที่ใช้งาน และประวัติในทะเบียนเดียวกัน</p></div>{selected ? <button className="secondary" onClick={() => { setSelected(''); setError(''); }}>กลับทะเบียน</button> : canEdit && <button onClick={() => setEditor({})}>＋ นำเข้าเอกสารเดิม</button>}</div>
    {notice && <p className="registry-notice" role="status">{notice}</p>}
    {error && <div className="registry-error" role="alert">{error} <button className="secondary" onClick={() => setRevision(n => n + 1)}>ลองใหม่</button></div>}
    {!selected ? <div className="registry-panel registry-flush">
      <div className="registry-toolbar"><input aria-label="ค้นหาเอกสาร" placeholder="ค้นหารหัสหรือชื่อเอกสาร…" value={q} onChange={e => setQ(e.target.value)}/><select aria-label="ประเภทเอกสาร" value={type} onChange={e => setType(e.target.value)}><option value="">ทุกประเภท</option>{Object.entries(types).map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select><select aria-label="การตรวจสอบข้อมูล" value={filter} onChange={e => setFilter(e.target.value)}><option value="">ทุกการตรวจสอบ</option><option value="pending">รอตรวจสอบข้อมูล</option><option value="verified">ตรวจสอบแล้ว</option></select><select aria-label="สถานะเอกสาร" value={lifecycle} onChange={e => setLifecycle(e.target.value)}><option value="">ทุกสถานะเอกสาร</option><option value="DOC_PUBLISHED">ประกาศใช้</option><option value="DOC_OBSOLETE">ยกเลิกแล้ว</option></select><select aria-label="หน่วยงาน" value={department} onChange={e => setDepartment(e.target.value)}><option value="">ทุกหน่วยงาน</option>{registry?.departments.map(d => <option key={d.id} value={d.id}>{d.nameTh}</option>)}</select></div>
      {loading ? <p className="registry-empty" role="status">กำลังโหลดทะเบียน…</p> : !error && <><div className="registry-count">{registry?.documents.length ?? 0} รายการ</div><div className="registry-table-wrap"><table className="registry-table"><thead><tr>{['รหัส / ชื่อเอกสาร', 'ประเภท', 'ฉบับ / แก้ไข', 'วันที่มีผล', 'สถานะ / การตรวจสอบ', 'เจ้าของเอกสาร'].map(t => <th key={t}>{t}</th>)}</tr></thead><tbody>{registry?.documents.map(d => { const v = d.versions.find(v => (!filter || v.reviewStatus === (filter === 'pending' ? 'PENDING' : 'VERIFIED')) && (!lifecycle || v.status === lifecycle)) ?? d.versions[0]; return <tr key={d.id}><td><button className="registry-link" onClick={() => { setSelected(d.id); setNotice(''); }}>{d.documentCode || 'ยังไม่ระบุรหัส'}</button><div>{d.title || 'ยังไม่ระบุชื่อ'}</div><small>{d.department?.nameTh || 'ยังไม่ระบุหน่วยงาน'}</small></td><td>{types[d.docType ?? ''] || 'ยังไม่ระบุ'}</td><td>{v?.issueNo ?? '—'} / {v?.revisionNo ?? '—'}</td><td>{date(v?.effectiveDate)}</td><td>{v && <><StatusBadge status={v.status || 'UNSPECIFIED'}>{status(v.status)}</StatusBadge><br/>{review(v)}{sourceConfirmed(v) && missingMetadata(d, v) && <div><small>ข้อมูลทะเบียนบางช่องยังไม่ระบุ</small></div>}</>}</td><td>{d.owner?.fullName || 'ยังไม่ระบุ'}</td></tr>; })}</tbody></table></div>{!registry?.documents.length && <p className="registry-empty">ไม่พบเอกสารที่บัญชีนี้มีสิทธิ์ดู ลองเปลี่ยนคำค้นหาหรือตัวกรอง</p>}</>}
    </div> : detail ? <>
      <div className="registry-panel"><h2>{detail.document.documentCode || 'ยังไม่ระบุรหัส'}</h2><p>{detail.document.title || 'ยังไม่ระบุชื่อเอกสาร'}</p><dl className="registry-metadata"><div><dt>ประเภท</dt><dd>{types[detail.document.docType ?? ''] || 'ยังไม่ระบุ'}</dd></div><div><dt>หน่วยงาน</dt><dd>{detail.document.department?.nameTh || 'ยังไม่ระบุ'}</dd></div><div><dt>เจ้าของเอกสาร</dt><dd>{detail.document.owner?.fullName || 'ยังไม่ระบุ'}</dd></div></dl></div>
      {detail.document.versions.map(v => <div className="registry-panel" key={v.id}><div className="registry-heading"><h2>ฉบับที่ {v.issueNo ?? '—'} / แก้ไขครั้งที่ {v.revisionNo ?? '—'}</h2>{review(v)}</div><p>วันที่มีผล: {date(v.effectiveDate)} · สถานะ: {status(v.status)}</p>{sourceConfirmed(v) && <div className="registry-confirmation"><strong>ยืนยันจากเอกสารกลางเมื่อ {date(v.sourceConfirmedAt)}</strong>{v.sourceConfirmationNote && <p>{v.sourceConfirmationNote}</p>}</div>}{sourceConfirmed(v) && missingMetadata(detail.document, v) && <p className="registry-metadata-note">ข้อมูลทะเบียนบางช่องยังไม่ระบุ สามารถเติมจากต้นฉบับได้ โดยเอกสารนี้ได้รับการยืนยันว่าเป็นฉบับปัจจุบันแล้ว</p>}{v.reviewStatus === 'PENDING' && <p className="registry-warning">ข้อมูลยังไม่ได้ตรวจสอบกับต้นฉบับ โปรดตรวจสอบก่อนนำไปใช้อ้างอิง</p>}{v.reviewNotes && <p className="registry-notes">หมายเหตุ: {v.reviewNotes}</p>}
      <p>คำขอที่ประกาศใช้: {v.originatingDar ? canViewDar ? <a href={`#dar?id=${encodeURIComponent(v.originatingDar.id)}`}>{v.originatingDar.darNo || 'คำขอ DAR'}</a> : v.originatingDar.darNo || 'มีคำขอ DAR อ้างอิง' : 'เอกสารนำเข้าเดิม ไม่มี DAR ในระบบ'}</p><h3>ไฟล์เอกสาร</h3>{v.files.length > 0 && <CopyStatusNotice/>}{v.files.map(f => <div className="registry-file" key={f.id}><div><strong>{f.fileName}</strong><br/><small>{(f.sizeBytes / 1024 / 1024).toFixed(2)} เมกะไบต์ · นำเข้า {date(f.uploadedAt)}{f.uploadedBy && ` โดย ${f.uploadedBy.fullName}`}</small></div><div className="registry-actions"><a href={`/api/documents/files/${encodeURIComponent(f.id)}?download=1`}>ดาวน์โหลด PDF</a></div></div>)}{!v.files.length && <p>ยังไม่มีไฟล์เอกสาร</p>}{canEdit && (v.reviewStatus === 'PENDING' || sourceConfirmed(v)) && <button className="secondary" onClick={() => setEditor({ document: detail.document, version: v })}>{sourceConfirmed(v) ? 'เติม / แก้ข้อมูลทะเบียน' : 'ตรวจสอบ / แก้ไขข้อมูล'}</button>}</div>)}
      <div className="registry-panel"><h2>ประวัติการนำเข้าและตรวจสอบ</h2>{detail.history.length ? <ol className="registry-history">{detail.history.map(h => <li key={h.id}><strong>{actionLabel(h.action, h.beforeValue, h.afterValue)}</strong><p>{date(h.occurredAt)} · {h.actor?.fullName || 'ระบบ'}</p><HistoryValues before={h.beforeValue} after={h.afterValue}/></li>)}</ol> : <p>ยังไม่มีประวัติ</p>}</div>
    </> : !error && <p role="status">กำลังโหลดรายละเอียด…</p>}
    {editor && registry && <DocumentEditor {...editor} departments={registry.departments} owners={registry.owners} onClose={() => setEditor(null)} onSaved={() => { setEditor(null); setRevision(n => n + 1); setNotice('บันทึกข้อมูลเรียบร้อยแล้ว'); }}/>}</main>;
}
function actionLabel(action: string, before: unknown, after: unknown) {
  const previous = before && typeof before === 'object' ? before as Record<string, unknown> : {};
  const next = after && typeof after === 'object' ? after as Record<string, unknown> : {};
  if (next.sourceConfirmedAt && !previous.sourceConfirmedAt) return 'ยืนยันจากเอกสารกลาง';
  if (next.reviewStatus === 'VERIFIED' && previous.reviewStatus !== 'VERIFIED') return 'ยืนยันการตรวจสอบข้อมูลเอกสาร';
  const value = action.toLowerCase();
  return value.includes('verif') || value.includes('review') ? 'ตรวจสอบข้อมูลเอกสาร' : value.includes('updat') || value.includes('edit') ? 'แก้ไขข้อมูลทะเบียน' : value.includes('import') || value.includes('creat') || value.includes('upload') ? 'นำเข้าเอกสาร' : 'บันทึกการเปลี่ยนแปลงเอกสาร';
}

function HistoryValues({ before, after }: { before: unknown; after: unknown }) {
  const fields: Record<string, string> = { documentCode: 'รหัสเอกสาร', title: 'ชื่อเอกสาร', docType: 'ประเภท', issueNo: 'ฉบับที่', revisionNo: 'แก้ไขครั้งที่', effectiveDate: 'วันที่มีผล', status: 'สถานะ', reviewStatus: 'การตรวจสอบ', reviewNotes: 'หมายเหตุ', fileName: 'ไฟล์เอกสาร', departmentName: 'ชื่อหน่วยงาน', sourceConfirmedAt: 'วันที่ยืนยันจากเอกสารกลาง', sourceConfirmationNote: 'บันทึกการยืนยันจากเอกสารกลาง' };
  const oldValues = before && typeof before === 'object' ? before as Record<string, unknown> : {};
  const newValues = after && typeof after === 'object' ? after as Record<string, unknown> : {};
  const changes = Object.keys(fields).filter(key => key in newValues && oldValues[key] !== newValues[key]);
  function display(key: string, value: unknown) {
    if (value === null || value === undefined || value === '') return 'ยังไม่ระบุ';
    if (key === 'status') return status(String(value));
    if (key === 'reviewStatus') return value === 'VERIFIED' ? 'ตรวจสอบแล้ว' : 'รอตรวจสอบข้อมูล';
    if (key === 'docType') return types[String(value)] || 'ยังไม่ระบุ';
    if (key === 'effectiveDate' || key === 'sourceConfirmedAt') return date(String(value));
    return typeof value === 'string' || typeof value === 'number' ? String(value) : 'บันทึกข้อมูลแล้ว';
  }
  return changes.length ? <details><summary>ข้อมูลที่เปลี่ยนแปลง</summary><dl>{changes.map(key => <div key={key}><dt>{fields[key]}</dt><dd>{key in oldValues ? `${display(key, oldValues[key])} → ` : ''}{display(key, newValues[key])}</dd></div>)}</dl></details> : null;
}
type EditorProps = { document?: Document; version?: Version; departments: Department[]; owners: Owner[]; onClose: () => void; onSaved: () => void };
function DocumentEditor({ document: doc, version, departments, owners, onClose, onSaved }: EditorProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const editingConfirmed = Boolean(version && sourceConfirmed(version));
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [verified, setVerified] = useState(false);
  const [departmentId, setDepartmentId] = useState(doc?.department?.id ?? '');
  const [documentCode, setDocumentCode] = useState(doc?.documentCode ?? '');
  const automaticDepartment = /(?:^|-)2301(?:-|$)/.test(documentCode.trim()) ? departments.find(d => d.code === '2301') : undefined;
  useEffect(() => { ref.current?.showModal(); }, []);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError('');
    const data = new FormData(event.currentTarget);
    if (automaticDepartment) { data.set('departmentId', automaticDepartment.id); data.delete('departmentName'); }
    if (editingConfirmed && version?.status) data.set('status', version.status);
    const file = data.get('file');
    if (!version && (!(file instanceof File) || !file.size || !file.name.toLowerCase().endsWith('.pdf'))) { setError('กรุณาเลือกไฟล์ PDF'); return; }
    if (file instanceof File && file.size > 128 * 1024 * 1024) { setError('ไฟล์ต้องมีขนาดไม่เกิน 128 เมกะไบต์'); return; }
    setBusy(true);
    try { if (version) await api(`/documents/versions/${encodeURIComponent(version.id)}`, { ...Object.fromEntries(data), verified }, 'PATCH'); else await api('/documents', data); onSaved(); }
    catch (e) { setError(errorMessage(e)); }
    finally { setBusy(false); }
  }
  return <dialog ref={ref} className="registry-dialog" aria-labelledby="document-editor-title" onCancel={event => { event.preventDefault(); if (!busy) onClose(); }}><form onSubmit={event => void save(event)}><div className="registry-heading"><h2 id="document-editor-title">{editingConfirmed ? 'เติม / แก้ข้อมูลทะเบียน' : version ? 'ตรวจสอบข้อมูลเอกสาร' : 'นำเข้าเอกสารเดิม'}</h2><button type="button" className="secondary" aria-label="ปิด" disabled={busy} onClick={onClose}>×</button></div><p>{editingConfirmed ? 'เติมข้อมูลทะเบียนตามต้นฉบับ ข้อมูลที่ยังไม่ทราบสามารถเว้นว่างได้ การบันทึกนี้คงการยืนยันจากเอกสารกลางไว้' : 'ระบุชื่อเอกสารและกรอกข้อมูลตามต้นฉบับ ข้อมูลอื่นที่ยังไม่ทราบสามารถเว้นว่างไว้รอตรวจสอบได้'}</p><fieldset disabled={busy} className="registry-fields"><div className="registry-form-grid">
    <label>รหัสเอกสาร<input name="documentCode" maxLength={64} value={documentCode} onChange={e => setDocumentCode(e.target.value)} required={verified}/></label><label>ประเภทเอกสาร<select name="docType" defaultValue={doc?.docType || ''} required={verified}><option value="">ยังไม่ระบุ</option>{Object.entries(types).map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label>
    <label className="registry-wide">ชื่อเอกสาร<input name="title" defaultValue={doc?.title} maxLength={300} required/></label><label>ฉบับที่<input name="issueNo" type="number" min="0" max="999999" step="1" defaultValue={version?.issueNo ?? ''} required={verified}/></label><label>แก้ไขครั้งที่<input name="revisionNo" type="number" min="0" max="999999" step="1" defaultValue={version?.revisionNo ?? ''} required={verified}/></label><label>วันที่มีผล<input name="effectiveDate" type="date" defaultValue={version?.effectiveDate?.slice(0, 10) ?? ''} required={verified}/></label><label>สถานะตามต้นฉบับ<select name="status" defaultValue={version?.status ?? ''} required={verified} disabled={editingConfirmed}><option value="">ยังไม่ยืนยัน</option><option value="DOC_PUBLISHED">ประกาศใช้</option><option value="DOC_OBSOLETE">ยกเลิกแล้ว</option></select></label><label>หน่วยงาน<select name="departmentId" disabled={Boolean(automaticDepartment)} value={automaticDepartment?.id ?? departmentId} onChange={e => setDepartmentId(e.target.value)}><option value="">ยังไม่ระบุ</option>{departments.map(d => <option key={d.id} value={d.id}>{d.nameTh}</option>)}</select></label><label>เจ้าของเอกสาร<select name="ownerUserId" defaultValue={doc?.owner?.id ?? ''} required={verified}><option value="">ยังไม่ระบุ</option>{owners.map(o => <option key={o.id} value={o.id}>{o.fullName}</option>)}</select></label><label className="registry-wide">ชื่อหน่วยงาน (กรณีไม่มีในรายการ)<input name="departmentName" maxLength={200} disabled={Boolean(departmentId || automaticDepartment)} required={verified && !departmentId && !automaticDepartment}/></label><label className="registry-wide">หมายเหตุการตรวจสอบ<textarea name="reviewNotes" maxLength={4000} rows={3} defaultValue={version?.reviewNotes ?? ''}/></label></div>
    {!version && <label className="registry-upload">ไฟล์ PDF (ไม่เกิน 128 เมกะไบต์)<input name="file" type="file" accept="application/pdf,.pdf" required/><small>เอกสารที่นำเข้าจะอยู่ในสถานะรอตรวจสอบข้อมูล</small></label>}{version && !editingConfirmed && <label className="registry-check"><input type="checkbox" checked={verified} onChange={e => setVerified(e.target.checked)}/>ยืนยันว่าได้ตรวจสอบข้อมูลครบถ้วนและตรงกับต้นฉบับแล้ว</label>}</fieldset>{error && <p className="form-error" role="alert">{error}</p>}<div className="registry-actions"><button type="button" className="secondary" disabled={busy} onClick={onClose}>ยกเลิก</button><button disabled={busy}>{busy ? 'กำลังบันทึก…' : verified ? 'ยืนยันการตรวจสอบ' : version ? 'บันทึกข้อมูล' : 'นำเข้าทะเบียน'}</button></div></form></dialog>;
}





