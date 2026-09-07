import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import './table.css';

/** @trace UC-14 FR-SH04 */

interface AuditEntry {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  reason: string | null;
  createdAt: string;
  actor: { id: string; fullName: string; email: string } | null;
}

const actionLabels: Record<string, string> = {
  LOGIN: 'เข้าสู่ระบบ',
  CREATE: 'สร้าง',
  UPDATE: 'แก้ไข',
  PUBLISH: 'เผยแพร่',
  OBSOLETE: 'ยกเลิก',
  APPROVE: 'อนุมัติ',
  REJECT: 'ไม่อนุมัติ',
  ACKNOWLEDGE: 'รับทราบ',
  VERIFY: 'ทวนสอบ',
  CLOSE: 'ปิดงาน',
};

const entityLabels: Record<string, string> = {
  User: 'ผู้ใช้',
  Document: 'เอกสาร',
  Dar: 'คำขอแก้ไขเอกสาร',
  Record: 'บันทึกหลักฐาน',
  Finding: 'ประเด็นที่พบ',
  Car: 'ใบคำร้องแก้ไข',
};

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function AuditTrailPage() {
  const [entries, setEntries] = useState<AuditEntry[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get<AuditEntry[]>('/audit-trail?take=100')
      .then(setEntries)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="page">
      <header className="page__head">
        <h1>ร่องรอยการตรวจสอบ</h1>
        <p>ทุกเหตุการณ์สำคัญในระบบถูกบันทึกไว้ถาวรและลบไม่ได้ แสดง 100 รายการล่าสุด</p>
      </header>

      {error && (
        <p className="notice" role="alert">
          {error}
        </p>
      )}

      {!entries && !error && <p className="page__loading">กำลังโหลด</p>}

      {entries?.length === 0 && (
        <div className="sheet page__empty">
          <p>ยังไม่มีเหตุการณ์ในระบบ</p>
          <p>เมื่อมีผู้ใช้เข้าสู่ระบบหรือแก้ไขข้อมูล รายการจะปรากฏที่นี่</p>
        </div>
      )}

      {entries && entries.length > 0 && (
        <div className="table-wrap sheet">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">เมื่อ</th>
                <th scope="col">ผู้กระทำ</th>
                <th scope="col">การกระทำ</th>
                <th scope="col">รายการ</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id}>
                  <td className="table__when">{formatWhen(e.createdAt)}</td>
                  <td>{e.actor?.fullName ?? 'ระบบ'}</td>
                  <td>
                    <span className="stamp stamp--draft">
                      {actionLabels[e.action] ?? e.action}
                    </span>
                  </td>
                  <td>
                    {entityLabels[e.entityType] ?? e.entityType}
                    <span className="code table__ref">{e.entityId.slice(-8)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
