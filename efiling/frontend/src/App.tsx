import { useCallback, useEffect, useState } from 'react';
import { ApiError, DEMO_PASSWORD, getDemoAccounts, getIdentity, getMenuAccess, login, logout as endSession, type Account, type Identity } from './services/authService';
import { HealthPage } from './pages/HealthPage';
import { LoginPage } from './pages/LoginPage';
import { AppLayout } from './pages/AppLayout';
import { ModulePage } from './pages/ModulePage';
import { DocumentsPage } from './pages/DocumentsPage';
import { DarPage } from './pages/DarPage';
import { AcknowledgementsPage } from './pages/AcknowledgementsPage';
import { RecordsPage } from './pages/RecordsPage';
import { AuditPage } from './pages/AuditPage';
import { CarPage } from './pages/CarPage';
import { DashboardPage } from './pages/DashboardPage';
function message(error: unknown) {
  return error instanceof ApiError ? error.message : 'เชื่อมต่อระบบไม่ได้ กรุณาลองใหม่';
}
function currentPage() { return window.location.hash.slice(1).split('?')[0]; }

export function App() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [email, setEmail] = useState('dcc@example.test');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(currentPage);
  const [access, setAccess] = useState<{ label: string } | null>(null);
  const [pageError, setPageError] = useState('');

  const initialize = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const result = await getDemoAccounts();
      setAccounts(result.accounts);
      try { setIdentity(await getIdentity()); }
      catch (error) { if (!(error instanceof ApiError && error.status === 401)) throw error; }
    } catch (error) { setError(message(error)); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void initialize(); }, [initialize]);
  useEffect(() => {
    const update = () => setPage(currentPage());
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);
  useEffect(() => {
    if (!identity) return;
    if (!page) { window.location.hash = identity.menus[0].id; return; }
    if (page === 'health') return;
    let cancelled = false;
    setAccess(null); setPageError('');
    getMenuAccess(page)
      .then(result => { if (!cancelled) setAccess(result); })
      .catch(error => {
        if (cancelled) return;
        setPageError(message(error));
        if (error instanceof ApiError && error.status === 401) {
          setIdentity(null); setError('หมดเวลาเข้าใช้งาน กรุณาเข้าสู่ระบบอีกครั้ง');
        }
      });
    return () => { cancelled = true; };
  }, [identity, page]);

  async function signIn(loginEmail: string, loginPassword: string) {
    setBusy(true); setError('');
    try {
      const result = await login(loginEmail, loginPassword);
      setAccess(null); setPageError(''); setIdentity(result);
      setEmail(result.user.email);
      window.location.hash = result.menus[0].id;
    } catch (error) { setError(message(error)); }
    finally { setBusy(false); }
  }
  async function logout() {
    setBusy(true); setError('');
    try { await endSession(); setIdentity(null); window.location.hash = ''; }
    catch (error) { setError(message(error)); }
    finally { setBusy(false); }
  }
  if (loading) return <main><h1>E-Filing</h1><p role="status">กำลังตรวจสอบการเข้าใช้งาน…</p></main>;
  if (!identity) return <LoginPage accounts={accounts} busy={busy} error={error} initialEmail={email}
    onLogin={(email, password) => void signIn(email, password)} onRetry={() => void initialize()} onSelect={() => setError('')}/>;
  return <AppLayout identity={identity} accounts={accounts} page={page} busy={busy} error={error}
    onSwitch={email => void signIn(email, DEMO_PASSWORD)} onLogout={() => void logout()}>
    {busy ? <main className="module-page"><p role="status">กำลังเปลี่ยนการเข้าใช้งาน…</p></main> : page === 'health' ? <HealthPage/> : page === 'documents' && access && !pageError ? <DocumentsPage key={identity.user.id} userId={identity.user.id} canViewDar={identity.menus.some(menu => menu.id === 'dar')}/> : page === 'dar' && access && !pageError ? <DarPage key={identity.user.id}/> : page === 'ack' && access && !pageError ? <AcknowledgementsPage key={identity.user.id} userId={identity.user.id}/> : page === 'records' && access && !pageError ? <RecordsPage key={identity.user.id} userId={identity.user.id}/> : page === 'audit' && access && !pageError ? <AuditPage key={identity.user.id}/> : page === 'cars' && access && !pageError ? <CarPage key={identity.user.id}/> : page === 'dashboard' && access && !pageError ? <DashboardPage key={identity.user.id}/> : <ModulePage userId={identity.user.id} page={page} pageError={pageError} access={access} firstMenu={identity.menus[0].id}/>}
  </AppLayout>;
}
