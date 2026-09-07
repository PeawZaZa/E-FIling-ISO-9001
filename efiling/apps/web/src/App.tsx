import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { useAuth } from './lib/auth';
import { allNavItems } from './nav';
import { AuditTrailPage } from './pages/AuditTrailPage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { PlaceholderPage } from './pages/PlaceholderPage';

/**
 * ทะเบียนหน้าจอที่ทำงานได้จริง
 *
 * เป็นแหล่งความจริงเดียวว่างานใดเปิดใช้แล้ว เมนูและหน้าแรกอ่านจากตรงนี้
 * ไม่ต้องไปตั้งค่าซ้ำที่อื่น กรณีการใช้งานที่ไม่อยู่ในทะเบียนนี้
 * จะได้หน้าที่บอกว่ายังไม่เปิดใช้โดยอัตโนมัติ
 */
const pages: Record<string, () => JSX.Element> = {
  'UC-14': AuditTrailPage,
};

const ready = new Set(Object.keys(pages));

export function App() {
  const { user, loading, can } = useAuth();

  if (loading) return <p style={{ padding: '2rem' }}>กำลังเปิดระบบ</p>;
  if (!user) return <LoginPage />;

  return (
    <AppShell ready={ready}>
      <Routes>
        <Route path="/" element={<HomePage ready={ready} />} />
        {allNavItems.map((item) => {
          const Page = pages[item.useCase];
          return (
            <Route
              key={item.useCase}
              path={item.path}
              element={
                !can(item.useCase) ? (
                  <NoAccess useCase={item.useCase} />
                ) : Page ? (
                  <Page />
                ) : (
                  <PlaceholderPage useCase={item.useCase} />
                )
              }
            />
          );
        })}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}

function NoAccess({ useCase }: { useCase: string }) {
  return (
    <div className="sheet" style={{ maxWidth: '40rem', padding: 'var(--gap-5)' }}>
      <span className="stamp stamp--stop">ไม่มีสิทธิ์</span>
      <h1 style={{ margin: 'var(--gap-3) 0 var(--gap-2)' }}>เข้าถึงหน้านี้ไม่ได้</h1>
      <p style={{ color: 'var(--ink-soft)' }}>
        บทบาทของคุณไม่ได้รับสิทธิ์สำหรับงานนี้ หากต้องใช้งาน ติดต่อเจ้าหน้าที่ควบคุมเอกสาร
      </p>
      <p style={{ marginTop: 'var(--gap-3)', fontSize: 'var(--size-xs)', color: 'var(--ink-faint)' }}>
        กรณีการใช้งาน <span className="code">{useCase}</span>
      </p>
    </div>
  );
}
