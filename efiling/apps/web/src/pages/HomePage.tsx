import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { navSections } from '../nav';
import './home.css';

interface Props {
  ready: Set<string>;
}

/**
 * หน้าแรกตอบคำถามเดียว: บทบาทของฉันทำอะไรได้บ้าง
 *
 * ไม่ใช่แดชบอร์ดสถิติ ตัวเลขภาพรวมอยู่ที่ UC-12 แยกต่างหาก
 */
export function HomePage({ ready }: Props) {
  const { user, can } = useAuth();

  const sections = navSections
    .map((s) => ({ ...s, items: s.items.filter((i) => can(i.useCase)) }))
    .filter((s) => s.items.length > 0);

  const total = sections.reduce((n, s) => n + s.items.length, 0);
  const open = sections.reduce((n, s) => n + s.items.filter((i) => ready.has(i.useCase)).length, 0);

  return (
    <div className="home">
      <header className="home__head">
        <h1>สวัสดี {user?.fullName}</h1>
        <p>
          บทบาทของคุณเข้าถึงงานได้ {total} รายการ เปิดใช้แล้ว {open} รายการ
        </p>
      </header>

      {sections.map((section) => (
        <section key={section.key} className="home__section">
          <h2>
            {section.title}
            {section.procedure && <span className="code">{section.procedure}</span>}
          </h2>

          <ul className="home__list">
            {section.items.map((item) => {
              const isReady = ready.has(item.useCase);
              return (
                <li key={item.useCase} className={isReady ? undefined : 'is-pending'}>
                  <Link to={item.path}>
                    <span className="home__label">{item.label}</span>
                    <span className="home__summary">{item.summary}</span>
                    {!isReady && <span className="home__pending">ยังไม่เปิดใช้</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
