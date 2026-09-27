import { useEffect, useState } from 'react';
import { ApiError } from '../services/apiClient';
import { assignAcknowledgements, confirmAcknowledgement, getAckOptions, getAckVersion, getMyAcknowledgements, type AckAssignment, type AckOptions, type AckVersionDetail } from '../services/acknowledgementService';
import { StatusBadge } from '../components/StatusBadge';
import { CopyStatusNotice } from '../components/CopyStatusNotice';

const errorMessage = (error: unknown) => error instanceof ApiError ? error.message : 'เชื่อมต่อระบบไม่ได้ กรุณาลองใหม่';
const date = (value: string | null | undefined) => value ? new Date(value).toLocaleString('th-TH') : '—';
const revision = (item: { issueNo?: number | null; revisionNo?: number | null }) => `Issue ${item.issueNo ?? '—'} · Rev. ${item.revisionNo ?? '—'}`;
const fileUrl = (id: string) => `/api/documents/files/${encodeURIComponent(id)}?download=1`;

export function AcknowledgementsPage({ userId }: { userId: string }) {
  const isDcc = userId === 'dcc';
  const [mine, setMine] = useState<AckAssignment[]>([]);
  const [options, setOptions] = useState<AckOptions | null>(null);
  const [versionId, setVersionId] = useState('');
  const [detail, setDetail] = useState<AckVersionDetail | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [revisionNo, setRevisionNo] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError('');
    Promise.all([getMyAcknowledgements(), isDcc ? getAckOptions() : Promise.resolve(null)])
      .then(([work, choices]) => { if (!cancelled) { setMine(work.assignments); setOptions(choices); } })
      .catch(e => { if (!cancelled) setError(errorMessage(e)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [isDcc, revisionNo]);

  useEffect(() => {
    if (!versionId) { setDetail(null); return; }
    let cancelled = false;
    setDetail(null); setSelectedUsers([]);
    getAckVersion(versionId).then(result => { if (!cancelled) setDetail(result); })
      .catch(e => { if (!cancelled) setError(errorMessage(e)); });
    return () => { cancelled = true; };
  }, [versionId, revisionNo]);

  async function assign() {
    if (!versionId || !selectedUsers.length) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const result = await assignAcknowledgements(versionId, selectedUsers);
      setDetail(result); setSelectedUsers([]); setNotice('บันทึกรายการผู้รับทราบแล้ว');
      setRevisionNo(n => n + 1);
    } catch (e) { setError(errorMessage(e)); }
    finally { setBusy(false); }
  }

  async function confirm(id: string) {
    setBusy(true); setError(''); setNotice('');
    try {
      await confirmAcknowledgement(id);
      setNotice('บันทึกการรับทราบแล้ว');
      setRevisionNo(n => n + 1);
    } catch (e) { setError(errorMessage(e)); }
    finally { setBusy(false); }
  }

  const assigned = new Set(detail?.assignments.map(item => item.assigneeId) ?? []);
  return <main className="module-page registry-page ack-page">
    <div className="registry-heading"><div><h1>รับทราบเอกสาร</h1><p>รายการรับทราบแยกตามบุคคลและฉบับ การดาวน์โหลดไม่ใช่การยืนยันรับทราบ</p></div></div>
    {notice && <p className="registry-notice" role="status">{notice}</p>}
    {error && <div className="registry-error" role="alert">{error} <button className="secondary" onClick={() => setRevisionNo(n => n + 1)}>ลองใหม่</button></div>}
    {isDcc && <section className="registry-panel"><h2>กำหนดผู้รับทราบ</h2>
      <p className="ack-note">สิทธิ์กำหนดรายชื่อสำหรับระบบทดลองใช้บัญชี DCC เท่านั้น อำนาจใช้งานจริงยังรอข้อยุติ</p>
      <label className="ack-version-label">ฉบับเอกสาร<select value={versionId} onChange={e => setVersionId(e.target.value)}><option value="">เลือกฉบับที่ประกาศใช้</option>{options?.versions.map(v => <option key={v.id} value={v.id}>{v.documentCode ?? 'ไม่มีรหัส'} — {v.title} ({revision(v)})</option>)}</select></label>
      {detail && <>{detail.version.fileId && <CopyStatusNotice/>}<div className="registry-file"><div><strong>{detail.version.documentCode} — {detail.version.title}</strong><div>{revision(detail.version)}</div></div>{detail.version.fileId && <a href={fileUrl(detail.version.fileId)}>ดาวน์โหลด PDF ฉบับนี้</a>}</div>
        <h3>เลือกผู้ใช้ที่มีสิทธิ์อ่านฉบับนี้</h3>
        {detail.users.length ? <div className="ack-user-grid">{detail.users.map(user => <label key={user.id} className="ack-user"><input type="checkbox" checked={selectedUsers.includes(user.id) || assigned.has(user.id)} disabled={busy || assigned.has(user.id)} onChange={e => setSelectedUsers(current => e.target.checked ? [...current, user.id] : current.filter(id => id !== user.id))}/><span>{user.fullName}{user.position && <small>{user.position}</small>}{assigned.has(user.id) && <small>มอบหมายแล้ว</small>}</span></label>)}</div> : <p>ไม่มีผู้ใช้ที่เลือกได้สำหรับฉบับนี้</p>}
        <div className="registry-actions"><button disabled={busy || selectedUsers.length === 0} onClick={() => void assign()}>{busy ? 'กำลังบันทึก…' : `มอบหมาย ${selectedUsers.length} คน`}</button></div>
        <h3>ผลการรับทราบของฉบับนี้</h3>
        {detail.assignments.length ? <div className="registry-table-wrap"><table className="registry-table"><thead><tr><th>ผู้รับทราบ</th><th>มอบหมายเมื่อ</th><th>ผล</th></tr></thead><tbody>{detail.assignments.map(item => <tr key={item.id}><td>{item.assigneeName}</td><td>{date(item.assignedAt)}</td><td><StatusBadge status={item.confirmedAt ? 'ACKNOWLEDGED' : 'PENDING'}>{item.confirmedAt ? `รับทราบ ${date(item.confirmedAt)}` : 'ยังไม่รับทราบ'}</StatusBadge></td></tr>)}</tbody></table></div> : <p>ยังไม่มีรายการมอบหมายสำหรับฉบับนี้</p>}
      </>}
    </section>}
    <section className="registry-panel"><h2>งานรับทราบของฉัน</h2>
      {mine.some(item => item.fileId) && <><CopyStatusNotice/><p>การดาวน์โหลด PDF ไม่ใช่การยืนยันรับทราบ ต้องกดปุ่ม “ยืนยันรับทราบ” แยกต่างหาก</p></>}
      {loading ? <p role="status">กำลังโหลดรายการ…</p> : mine.length ? <div className="registry-table-wrap"><table className="registry-table"><thead><tr><th>เอกสาร</th><th>ฉบับ</th><th>มอบหมายเมื่อ</th><th>สถานะ</th><th>ดำเนินการ</th></tr></thead><tbody>{mine.map(item => <tr key={item.id}><td><strong>{item.documentCode ?? 'ไม่มีรหัส'}</strong><br/>{item.title}</td><td>{revision(item)}</td><td>{date(item.assignedAt)}</td><td><StatusBadge status={item.confirmedAt ? 'ACKNOWLEDGED' : item.canConfirm ? 'PENDING' : 'DOC_OBSOLETE'}>{item.confirmedAt ? `รับทราบ ${date(item.confirmedAt)}` : item.canConfirm ? 'รอรับทราบ' : 'ฉบับนี้ยืนยันไม่ได้ในขณะนี้'}</StatusBadge></td><td><div className="ack-actions">{item.fileId && <a href={fileUrl(item.fileId)} onClick={() => setReadIds(ids => ids.includes(item.id) ? ids : [...ids, item.id])}>ดาวน์โหลด PDF</a>}{item.canConfirm && <button disabled={busy || !readIds.includes(item.id)} onClick={() => void confirm(item.id)}>ยืนยันรับทราบ</button>}</div>{item.canConfirm && !readIds.includes(item.id) && <small>ดาวน์โหลด PDF ก่อนยืนยันรับทราบ</small>}</td></tr>)}</tbody></table></div> : <p className="registry-empty">ยังไม่มีงานรับทราบที่มอบหมายให้บัญชีนี้</p>}
    </section>
  </main>;
}

