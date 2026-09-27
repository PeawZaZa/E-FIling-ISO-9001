import { useState, type FormEvent } from 'react';
import { DEMO_PASSWORD, type Account } from '../services/authService';
type Props = { accounts: Account[]; busy: boolean; error: string; initialEmail: string;
  onLogin: (email: string, password: string) => void; onRetry: () => void; onSelect: () => void };
export function LoginPage({ accounts, busy, error, initialEmail, onLogin, onRetry, onSelect }: Props) {
  const [selected, setSelected] = useState(accounts.find(a => a.email === initialEmail)?.id || 'dcc');
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  function selectAccount(account: Account) {
    setSelected(account.id); setEmail(account.email); setPassword(DEMO_PASSWORD); onSelect();
  }
  function submit(event: FormEvent) { event.preventDefault(); onLogin(email, password); }
  return <>
    <header><span className="brand">E-Filing</span><span>ระบบบริหารงานคุณภาพ ISO 9001</span></header>
    <main className="login-page">
      <div className="login-heading"><p className="eyebrow">บัญชีสำหรับสาธิต</p><h1>เลือกบทบาทเพื่อเข้าใช้งาน</h1>
      <p>เลือกบทบาทเพื่อเติมบัญชีตัวอย่าง แล้วกดเข้าสู่ระบบ</p></div>
      <div className="login-layout">
        <div className="account-grid" aria-label="บัญชีตัวอย่าง 14 บทบาท">
          {accounts.map(account => <button type="button" key={account.id} className="account-option"
            aria-pressed={selected === account.id} disabled={busy} onClick={() => selectAccount(account)}>
            <strong>{account.roleLabel}</strong><span>{account.name}</span>
          </button>)}
        </div>
        <form onSubmit={submit} className="login-form">
          <h2>เข้าสู่ระบบ</h2>
          <label htmlFor="email">อีเมล</label><input id="email" type="email" required autoComplete="username" value={email} disabled={busy} onChange={e => setEmail(e.target.value)}/>
          <label htmlFor="password">รหัสผ่าน</label><input id="password" type="password" required autoComplete="current-password" value={password} disabled={busy} onChange={e => setPassword(e.target.value)}/>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button disabled={busy || accounts.length === 0}>{busy ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ'}</button>
          {accounts.length === 0 && <button type="button" className="secondary" onClick={() => onRetry()}>โหลดบัญชีใหม่</button>}
          <p className="demo-hint">บัญชีสมมติสำหรับสาธิตระบบในเครื่อง</p>
        </form>
      </div>
    </main></>;
}
