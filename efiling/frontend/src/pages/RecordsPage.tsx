import { useEffect, useState, type FormEvent } from 'react';
import { api, ApiError } from '../services/apiClient';

type Name = { id: string; username?: string; fullName: string };
type RecordType = { id: string; code: string; nameTh: string };
type Document = { id: string; documentCode: string | null; title: string };
type Evidence = { id: string; fileName: string; mimeType: string; sizeBytes: number };
type RecordItem = { id: string; title: string; recordDate: string; createdById: string; recordType: RecordType; owner: Name; document: Document | null; evidence: Evidence[] };
type Options = { recordTypes: RecordType[]; owners: Name[]; documents: Document[]; documentsAvailable: boolean; maxFileBytes: number; allowedMimeTypes: string[]; canCreate: boolean };
const message = (error: unknown) => error instanceof ApiError ? error.message : 'เชื่อมต่อระบบไม่ได้ กรุณาลองใหม่';
const date = (value: string) => new Date(value).toLocaleDateString('th-TH');

export function RecordsPage({ userId }: { userId: string }) {
  const [options, setOptions] = useState<Options | null>(null);
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [selected, setSelected] = useState<RecordItem | null>(null);
  const [title, setTitle] = useState(''), [typeId, setTypeId] = useState(''), [ownerId, setOwnerId] = useState(''), [documentId, setDocumentId] = useState(''), [from, setFrom] = useState(''), [to, setTo] = useState('');
  const [editing, setEditing] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState(''), [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    api<Options>('/records/options').then(data => { if (active) setOptions(data); }).catch(e => { if (active) setError(message(e)); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    let active = true;
    const params = new URLSearchParams({ title, typeId, ownerId, documentId, from, to });
    const timer = window.setTimeout(() => {
      api<{ records: RecordItem[] }>(`/records?${params}`).then(data => { if (active) setRecords(data.records); }).catch(e => { if (active) setError(message(e)); });
    }, 250);
    return () => { active = false; window.clearTimeout(timer); };
  }, [title, typeId, ownerId, documentId, from, to, revision]);
  const open = async (id: string) => {
    setError('');
    try { setSelected((await api<{ record: RecordItem }>(`/records/${id}`)).record); }
    catch (e) { setError(message(e)); }
  };
  useEffect(() => {
    const recordId = new URLSearchParams(window.location.hash.split('?')[1] || '').get('recordId');
    if (recordId) void open(recordId);
  }, []);
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setBusy(true); setError(''); setNotice('');
    const form = new FormData(event.currentTarget);
    try {
      if (selected) {
        const values = Object.fromEntries(form.entries());
        const changed = await api<{ record: RecordItem }>(`/records/${selected.id}`, values, 'PATCH');
        setSelected(changed.record);
      } else {
        await api<RecordItem>('/records', form);
      }
      setEditing(false); setRevision(value => value + 1); setNotice('บันทึกข้อมูลและหลักฐานแล้ว');
    } catch (e) { setError(message(e)); }
    finally { setBusy(false); }
  };
  return <main className="module-page registry-page">
    <div className="registry-heading"><div><h1>{selected ? 'รายละเอียดบันทึกข้อมูล' : 'บันทึกและหลักฐาน'}</h1><p>ค้นหาและเปิดหลักฐานตามสิทธิ์ของบัญชี</p></div>{selected ? <button className="secondary" onClick={() => { setSelected(null); if (window.location.hash.includes('recordId=')) window.location.hash = '#records'; }}>กลับรายการ</button> : options?.canCreate && <button onClick={() => setEditing(true)}>＋ เพิ่มบันทึก</button>}</div>
    {error && <p className="registry-error" role="alert">{error}</p>}{notice && <p className="registry-notice" role="status">{notice}</p>}
    {options && !options.documentsAvailable && <p className="registry-warning">รายการเอกสารอ้างอิงไม่พร้อมใช้งาน สามารถบันทึกข้อมูลก่อนและผูกเอกสารภายหลังได้</p>}
    {selected ? <div className="registry-panel"><h2>{selected.title}</h2><p>{selected.recordType.nameTh} · {date(selected.recordDate)} · ผู้รับผิดชอบ {selected.owner.fullName}</p><p>เอกสารอ้างอิง: {selected.document ? `${selected.document.documentCode || 'ยังไม่ระบุรหัส'} — ${selected.document.title}` : 'ยังไม่ผูกเอกสาร'}</p><h3>ไฟล์หลักฐาน</h3>{selected.evidence.map(file => <div className="registry-file" key={file.id}><span>{file.fileName} ({(file.sizeBytes / 1024 / 1024).toFixed(2)} MB)</span><a href={`/api/records/evidence/${file.id}`}>ดาวน์โหลด</a></div>)}{!selected.evidence.length && <p>ยังไม่มีไฟล์หลักฐาน</p>}{options?.canCreate && (['dcc', 'auditor', 'lead'].includes(userId) || selected.createdById === options.owners.find(item => item.username === userId)?.id) && <button className="secondary" onClick={() => setEditing(true)}>แก้ข้อมูลบันทึก</button>}</div> : <div className="registry-panel registry-flush"><div className="registry-toolbar"><input aria-label="ค้นหาชื่อบันทึก" placeholder="ค้นหาชื่อบันทึก" value={title} onChange={e => setTitle(e.target.value)}/><select aria-label="ชนิดบันทึก" value={typeId} onChange={e => setTypeId(e.target.value)}><option value="">ทุกชนิด</option>{options?.recordTypes.map(item => <option key={item.id} value={item.id}>{item.nameTh}</option>)}</select><select aria-label="ผู้รับผิดชอบ" value={ownerId} onChange={e => setOwnerId(e.target.value)}><option value="">ทุกคน</option>{options?.owners.map(item => <option key={item.id} value={item.id}>{item.fullName}</option>)}</select><select aria-label="เอกสารอ้างอิง" value={documentId} onChange={e => setDocumentId(e.target.value)}><option value="">ทุกเอกสาร</option>{options?.documents.map(item => <option key={item.id} value={item.id}>{item.documentCode || item.title}</option>)}</select><label>จาก <input type="date" value={from} onChange={e => setFrom(e.target.value)}/></label><label>ถึง <input type="date" value={to} onChange={e => setTo(e.target.value)}/></label></div><div className="registry-count">{records.length} รายการ</div><div className="registry-table-wrap"><table className="registry-table"><thead><tr><th>ชื่อบันทึก</th><th>ชนิด</th><th>วันที่</th><th>ผู้รับผิดชอบ</th><th>เอกสารอ้างอิง</th><th>ไฟล์</th></tr></thead><tbody>{records.map(row => <tr key={row.id}><td><button className="registry-link" onClick={() => void open(row.id)}>{row.title}</button></td><td>{row.recordType.nameTh}</td><td>{date(row.recordDate)}</td><td>{row.owner.fullName}</td><td>{row.document?.documentCode || '—'}</td><td>{row.evidence.length}</td></tr>)}</tbody></table></div>{!records.length && <p className="registry-empty">ไม่พบบันทึกที่มีสิทธิ์ดูตามตัวกรองนี้</p>}</div>}
    {editing && options && <div className="registry-panel"><h2>{selected ? 'แก้ข้อมูลบันทึก' : 'เพิ่มบันทึกข้อมูล'}</h2><form onSubmit={event => void save(event)}><div className="registry-toolbar"><label>ชนิดบันทึก <select name="recordTypeId" required defaultValue={selected?.recordType.id || ''}><option value="">เลือกชนิด</option>{options.recordTypes.map(item => <option key={item.id} value={item.id}>{item.nameTh}</option>)}</select></label><label>ชื่อเรื่อง <input name="title" required maxLength={300} defaultValue={selected?.title || ''}/></label><label>วันที่ <input name="recordDate" type="date" required defaultValue={selected?.recordDate.slice(0, 10) || new Date().toISOString().slice(0, 10)}/></label><label>ผู้รับผิดชอบ <select name="ownerUserId" required defaultValue={selected?.owner.id || options.owners.find(item => item.username === userId)?.id || ''}><option value="">เลือกผู้รับผิดชอบ</option>{options.owners.map(item => <option key={item.id} value={item.id}>{item.fullName}</option>)}</select></label><label>เอกสารอ้างอิง <select name="documentId" defaultValue={selected?.document?.id || ''}><option value="">ยังไม่ผูกเอกสาร</option>{options.documents.map(item => <option key={item.id} value={item.id}>{item.documentCode || item.title}</option>)}</select></label>{!selected && <label>หลักฐาน (สูงสุด 5 ไฟล์ ไฟล์ละ {options.maxFileBytes / 1024 / 1024} MB) <input name="files" type="file" multiple accept={options.allowedMimeTypes.join(',')}/></label>}</div><div className="registry-actions"><button type="submit" disabled={busy}>{busy ? 'กำลังบันทึก…' : 'บันทึก'}</button><button className="secondary" type="button" onClick={() => setEditing(false)}>ยกเลิก</button></div></form></div>}
  </main>;
}
