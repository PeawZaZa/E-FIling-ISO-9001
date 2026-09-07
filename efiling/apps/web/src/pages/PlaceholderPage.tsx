import { useLocation } from 'react-router-dom';
import { findNavItem } from '../nav';

/**
 * หน้าสำหรับงานที่ยังไม่ได้พัฒนา
 *
 * บอกตรง ๆ ว่ายังไม่เปิดใช้และจะทำอะไรได้เมื่อเปิดใช้ แทนการซ่อนเมนู
 * เพราะผู้ใช้ควรเห็นภาพรวมทั้งระบบตั้งแต่ต้น และตอนสาธิตจะได้อธิบายได้
 * ว่าส่วนไหนเสร็จแล้วส่วนไหนยัง
 */
export function PlaceholderPage({ useCase }: { useCase: string }) {
  const location = useLocation();
  const item = findNavItem(useCase);

  return (
    <div className="sheet" style={{ maxWidth: '44rem', padding: 'var(--gap-5)' }}>
      <p style={{ color: 'var(--ink-faint)', fontSize: 'var(--size-sm)' }}>ยังไม่เปิดใช้</p>
      <h1 style={{ margin: 'var(--gap-3) 0 var(--gap-2)' }}>{item?.label ?? location.pathname}</h1>
      <p style={{ color: 'var(--ink-soft)' }}>{item?.summary}</p>
      <p style={{ marginTop: 'var(--gap-4)', fontSize: 'var(--size-sm)', color: 'var(--ink-faint)' }}>
        งานส่วนนี้อยู่ในแผนพัฒนา ติดตามความคืบหน้าได้ที่รายการตรวจสอบของโครงงาน
        กรณีการใช้งาน <span className="code">{useCase}</span>
      </p>
    </div>
  );
}
