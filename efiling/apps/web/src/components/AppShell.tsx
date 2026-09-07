import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { findActivePath } from '../lib/active-nav';
import { useAuth } from '../lib/auth';
import { allNavItems, navSections } from '../nav';
import './app-shell.css';

interface Props {
  children: React.ReactNode;
  /** กรณีการใช้งานที่มีหน้าจอทำงานได้จริงแล้ว ใช้ทำเครื่องหมายในเมนู */
  ready: Set<string>;
}

export function AppShell({ children, ready }: Props) {
  const { user, signOut, can } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  // ปิดลิ้นชักเมนูเมื่อเปลี่ยนหน้า เพื่อไม่ให้บังเนื้อหาบนจอเล็ก
  useEffect(() => setDrawerOpen(false), [location.pathname]);

  // มีได้เพียงเมนูเดียวที่ทำงานอยู่ คือเส้นทางที่เจาะจงที่สุดที่ตรงกับหน้าปัจจุบัน
  const activePath = useMemo(
    () => findActivePath(allNavItems.map((i) => i.path), location.pathname),
    [location.pathname],
  );

  const visibleSections = navSections
    .map((s) => ({ ...s, items: s.items.filter((i) => can(i.useCase)) }))
    .filter((s) => s.items.length > 0);

  return (
    <div className="shell">
      <header className="shell__bar">
        <button
          type="button"
          className="shell__menu"
          aria-expanded={drawerOpen}
          aria-controls="shell-nav"
          onClick={() => setDrawerOpen((v) => !v)}
        >
          <span aria-hidden="true">{drawerOpen ? '✕' : '☰'}</span>
          <span className="sr-only">เมนู</span>
        </button>

        <div className="shell__title">
          <strong>ทะเบียนเอกสารคุณภาพ</strong>
          <span>สำนักงานคณบดีคณะวิศวกรรมศาสตร์</span>
        </div>

        <div className="shell__who">
          <span className="shell__name">{user?.fullName}</span>
          <button type="button" className="btn btn--quiet shell__signout" onClick={signOut}>
            ออกจากระบบ
          </button>
        </div>
      </header>

      <div className="shell__body">
        <nav
          id="shell-nav"
          className={`shell__nav${drawerOpen ? ' shell__nav--open' : ''}`}
          aria-label="เมนูหลัก"
        >
          {visibleSections.map((section) => (
            <section key={section.key} className="shell__group">
              <h2>
                {section.title}
                {section.procedure && <span className="code">{section.procedure}</span>}
              </h2>
              <ul>
                {section.items.map((item) => (
                  <li key={item.useCase}>
                    <Link
                      to={item.path}
                      aria-current={item.path === activePath ? 'page' : undefined}
                      className={
                        [
                          item.path === activePath ? 'is-current' : '',
                          ready.has(item.useCase) ? '' : 'is-pending',
                        ]
                          .filter(Boolean)
                          .join(' ') || undefined
                      }
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </nav>

        <main className="shell__main">{children}</main>
      </div>
    </div>
  );
}
