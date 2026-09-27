import { useEffect, useState, type FormEvent } from 'react';
import { api, ApiError } from '../services/apiClient';
import { CarActions, type CarDetail, type Person } from './CarActions';
import { StatusBadge } from '../components/StatusBadge';

export const statusLabels: Record<string, string> = { OPEN: 'เปิดใบ', CORRECTION: 'อยู่ระหว่างแก้ไขเฉพาะหน้า', ANALYSIS_PLANNING: 'อยู่ระหว่างวิเคราะห์สาเหตุและจัดทำแผน', PENDING_PLAN_APPROVAL: 'รออนุมัติแผน', IMPLEMENTING: 'อยู่ระหว่างดำเนินการตามแผน', PENDING_VERIFICATION: 'รอตรวจสอบประสิทธิผล', PENDING_CLOSURE: 'รอปิดใบ', CLOSED: 'ปิดใบแล้ว' };
type Due = { state: string; nextDueDate: string | null; overdueWork: { activityId: string | null; description: string; dueDate: string; responsible: Person | null; waitingRole: string; daysOverdue: number }[] };
type Summary = { id: string; requestNo: string; requestType: string; currentStatus: string; overallDueDate: string | null; owner: Person | null; finding: { description: string }; due: Due };
type Options = { records: { id: string; title: string }[]; canCreate: boolean; users: (Person & { roles: { role: string }[] })[]; departments: { id: string; nameTh: string }[] };
type Finding = { id: string; description: string; source: string; findingType: string; departmentId: string | null };
const errorText = (e: unknown) => e instanceof ApiError ? e.message : 'เชื่อมต่อระบบไม่ได้ กรุณาลองใหม่';
export function DueCell({ due }: { due: Due }) {
  if (due.state === 'NO_DUE_DATE') return <>ยังไม่มีกำหนดเวลาของงานปัจจุบัน</>;
  if (due.state === 'NO_ACTIVE_WORK') return <>กิจกรรมในแผนเสร็จแล้ว</>;
  if (due.state === 'NOT_ACTIVE') return <>ไม่มีงานที่ติดตามกำหนดเวลา</>;
  if (due.state !== 'OVERDUE') return <>ยังไม่เกินกำหนด · {due.nextDueDate}</>;
  return <><StatusBadge status="OVERDUE">เกินกำหนด</StatusBadge><ul>{due.overdueWork.map(work => <li key={work.activityId || `${work.description}-${work.dueDate}`}><strong>{work.description}</strong> · ครบกำหนด {work.dueDate} · เกิน {work.daysOverdue} วันปฏิทิน · รอ {work.waitingRole}{work.responsible && `: ${work.responsible.fullName}`}</li>)}</ul></>;
}

export function CarPage() {
  const [rows, setRows] = useState<Summary[]>([]), [options, setOptions] = useState<Options | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]), [selected, setSelected] = useState<CarDetail | null>(null);
  const [creating, setCreating] = useState(false), [busy, setBusy] = useState(false), [loading, setLoading] = useState(true), [error, setError] = useState(''), [notice, setNotice] = useState('');
  const [filter, setFilter] = useState(() => new URLSearchParams(window.location.hash.split('?')[1] || '').get('status') || ''), [search, setSearch] = useState(''), [findingId, setFindingId] = useState(''), [ownerFilter, setOwnerFilter] = useState('');
  const [overdueOnly, setOverdueOnly] = useState(() => new URLSearchParams(window.location.hash.split('?')[1] || '').get('overdue') === '1');
  const listUrl = overdueOnly ? '/cars?overdue=1' : '/cars';
  useEffect(() => {
    let active = true;
    setLoading(true); setError('');
    Promise.all([api<{ requests: Summary[] }>(listUrl), api<Options>('/cars/options')]).then(async ([list, opts]) => {
      if (!active) return; setRows(list.requests); setOptions(opts);
      if (opts.canCreate) { const result = await api<{ findings: Finding[] }>('/audit/findings'); if (active) setFindings(result.findings.filter(f => f.findingType === 'NONCONFORMITY' && ['INTERNAL_AUDIT', 'MANAGEMENT_REVIEW'].includes(f.source))); }
    }).catch(e => { if (active) setError(errorText(e)); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [listUrl]);
  async function open(id: string) { setBusy(true); setError(''); try { setSelected(await api<CarDetail>(`/cars/${id}`)); setCreating(false); } catch (e) { setError(errorText(e)); } finally { setBusy(false); } }
  async function save(path: string, body: unknown) {
    setBusy(true); setError(''); setNotice('');
    try {
      const result = await api<{ id?: string }>(path, body);
      const id = path === '/cars' ? result.id : selected?.request.id;
      if (id) setSelected(await api<CarDetail>(`/cars/${id}`));
      setRows((await api<{ requests: Summary[] }>(listUrl)).requests); setCreating(false); setNotice('บันทึกสำเร็จ'); return true;
    } catch (e) { setError(errorText(e)); return false; } finally { setBusy(false); }
  }
  function create(e: FormEvent<HTMLFormElement>) { e.preventDefault(); void save('/cars', Object.fromEntries(new FormData(e.currentTarget))); }
  const source = findings.find(f => f.id === findingId);
  const owners = [...new Map(rows.filter(r => r.owner).map(r => [r.owner!.id, r.owner!])).values()];
  const visibleRows = rows.filter(r => (!filter || r.currentStatus === filter) && (!ownerFilter || r.owner?.id === ownerFilter) && `${r.requestNo} ${r.finding.description}`.includes(search));
  return <main className="module-page registry-page"><div className="registry-heading"><div><h1>ใบคำร้อง CAR/NCR</h1><p>ติดตามการแก้ไขจากประเด็นที่พบจนถึงตรวจประสิทธิผล</p></div>{options?.canCreate && <button disabled={busy} onClick={() => { setCreating(true); setSelected(null); }}>＋ เปิดใบคำร้อง</button>}</div>
    <p className="registry-notice">QMR อนุมัติแผนทั้ง CAR และ NCR ในระบบทดลอง • การปิดใบยังรอยืนยันผู้ลงนาม • กำหนดเวลารายขั้นอัตโนมัติยังรอยืนยัน</p>
    {error && <p role="alert" className="registry-error">{error}</p>}{notice && <p role="status" className="registry-notice">{notice}</p>}{busy && <p role="status">กำลังดำเนินการ…</p>}
    {creating && options && <form className="registry-panel registry-form" onSubmit={create}><h2>เปิดใบจากประเด็น</h2><fieldset disabled={busy}><label>ประเด็นที่พบ<select required name="findingId" value={findingId} onChange={e => setFindingId(e.target.value)}><option value="">เลือกประเด็น</option>{findings.map(f => <option key={f.id} value={f.id}>{f.description}</option>)}</select></label>
      <p>ประเภทใบ: {source ? source.source === 'INTERNAL_AUDIT' ? 'CAR' : 'NCR' : 'เลือกประเด็นก่อน'} — แหล่งอื่นและข้อสังเกตยังรอยืนยันกติกา</p>
      <label>กลุ่มงาน<select name="departmentId" required key={findingId} defaultValue={source?.departmentId || ''}><option value="">เลือกกลุ่มงาน</option>{options.departments.filter(d => !source?.departmentId || d.id === source.departmentId).map(d => <option key={d.id} value={d.id}>{d.nameTh}</option>)}</select></label>
      <label>ผู้รับผิดชอบการแก้ไข<select name="ownerUserId" required><option value="">เลือกผู้รับผิดชอบ</option>{options.users.filter(u => u.roles.some(r => r.role === 'CAR_OWNER')).map(u => <option key={u.id} value={u.id}>{u.fullName}</option>)}</select></label>
      <label>กำหนดเวลารวมของใบ<input type="date" name="overallDueDate" required/></label><button>เปิดใบคำร้อง</button><button type="button" className="secondary" onClick={() => setCreating(false)}>ยกเลิก</button></fieldset></form>}
    {selected && options && <CarActions key={selected.request.id + selected.request.updatedAt} detail={selected} users={options.users} records={options.records} busy={busy} onSave={save} onClose={() => setSelected(null)}/>}
    <section className="registry-panel"><div className="registry-filters"><label>ค้นหาเลขใบหรือปัญหา<input value={search} onChange={e => setSearch(e.target.value)}/></label><label>สถานะ/ขั้นงาน<select value={filter} onChange={e => setFilter(e.target.value)}><option value="">ทุกสถานะ</option>{Object.entries(statusLabels).map(([key, label]) => <option value={key} key={key}>{label}</option>)}</select></label><label>ผู้รับผิดชอบใบ<select value={ownerFilter} onChange={e => setOwnerFilter(e.target.value)}><option value="">ทุกคน</option>{owners.map(owner => <option key={owner.id} value={owner.id}>{owner.fullName}</option>)}</select></label><label>รายการ<select value={overdueOnly ? 'overdue' : 'all'} onChange={e => { setRows([]); setOverdueOnly(e.target.value === 'overdue'); setOwnerFilter(''); }}><option value="all">ทุกใบ</option><option value="overdue">งานเกินกำหนด</option></select></label></div>
      <div className="table-scroll"><table><thead><tr><th>เลขใบ</th><th>ประเด็น</th><th>สถานะ</th><th>ผู้รับผิดชอบ</th><th>กำหนดเวลาของงานปัจจุบัน</th><th>กำหนดเวลารวมของใบ</th></tr></thead><tbody>{visibleRows.map(r => <tr key={r.id}><td><button className="secondary" disabled={busy} onClick={() => void open(r.id)}>{r.requestType} {r.requestNo}</button></td><td>{r.finding.description}</td><td><StatusBadge status={r.currentStatus}>{statusLabels[r.currentStatus]}</StatusBadge></td><td>{r.owner?.fullName || 'ยังไม่ระบุ'}</td><td><DueCell due={r.due}/></td><td>{r.overallDueDate?.slice(0, 10) || 'ยังไม่ระบุ'}</td></tr>)}</tbody></table></div>{visibleRows.length === 0 && <p className="registry-empty" role={loading ? 'status' : undefined}>{loading ? 'กำลังโหลดรายการ…' : overdueOnly ? 'ไม่มีงานเกินกำหนดตามวันที่บันทึกไว้' : search || filter || ownerFilter ? 'ไม่พบ CAR/NCR ที่ตรงกับเงื่อนไขการค้นหา' : 'ไม่มีใบคำร้องในขอบเขตสิทธิ์ของคุณ'}</p>}</section>
  </main>;
}


