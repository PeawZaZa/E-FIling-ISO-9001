import { useCallback, useEffect, useState } from 'react';
import { StatusRow } from '../components/StatusRow';
import { isHealthy } from '../services/healthService';
export function HealthPage() {
  const [result, setResult] = useState<{ api: boolean; db: boolean } | null>(null);
  const [checking, setChecking] = useState(true);
  const check = useCallback(async () => {
    setChecking(true);
    const [api, db] = await Promise.all([isHealthy('/api/health'), isHealthy('/api/health/db')]);
    setResult({ api, db }); setChecking(false);
  }, []);
  useEffect(() => { void check(); }, [check]);
  return <main><p className="eyebrow">เตรียมระบบสำหรับการพัฒนา</p><h1>สถานะการเชื่อมต่อ</h1>
    <p>ตรวจความพร้อมของระบบก่อนเริ่มพัฒนาฟีเจอร์</p>
    <section aria-label="สถานะระบบ" aria-live="polite" aria-busy={checking}>
      <StatusRow title="API" status={checking ? null : result?.api ?? null}/>
      <StatusRow title="ฐานข้อมูล PostgreSQL" status={checking ? null : result?.db ?? null}/>
    </section>
    {!checking && result && (!result.api || !result.db) && <p role="status">ตรวจว่า API และฐานข้อมูลเปิดอยู่ แล้วกดตรวจใหม่ ดูวิธีตั้งค่าได้ใน README ของแอป</p>}
    <button disabled={checking} onClick={() => void check()}>{checking ? 'กำลังตรวจสอบ…' : 'ตรวจใหม่'}</button>
    <footer>โครงระบบเริ่มต้น · ยังไม่เปิดใช้งานฟีเจอร์เอกสาร</footer></main>;
}
