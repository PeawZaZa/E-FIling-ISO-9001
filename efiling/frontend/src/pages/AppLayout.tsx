import type { ReactNode } from 'react';
import type { Account, Identity } from '../services/authService';
type Props = { identity: Identity; accounts: Account[]; page: string; busy: boolean; error: string; children: ReactNode; onSwitch: (email: string) => void; onLogout: () => void };
export function AppLayout({ identity, accounts, page, busy, error, children, onSwitch, onLogout }: Props) {
  return <div className="app-shell">
    <aside className="sidebar"><div className="brand">E-Filing</div><p>ระบบบริหารงานคุณภาพ</p>
      <nav aria-label="เมนูหลัก">{identity.menus.map(menu => <a key={menu.id} href={`#${menu.id}`} aria-current={page === menu.id ? 'page' : undefined}>{menu.label}</a>)}</nav>
      <a className="health-link" href="#health">ตรวจการเชื่อมต่อ</a>
    </aside>
    <div className="workspace"><header className="workspace-header">
      <div><strong>{identity.user.name}</strong><div>{identity.user.roleLabel}</div></div>
      <div className="account-actions"><label htmlFor="switch-account">สลับบัญชีเดโม</label>
        <select id="switch-account" disabled={busy} value={identity.user.id} onChange={event => {
          const account = accounts.find(item => item.id === event.target.value);
          if (account) onSwitch(account.email);
        }}>{accounts.map(account => <option value={account.id} key={account.id}>{account.roleLabel} — {account.name}</option>)}</select>
        <button className="secondary" disabled={busy} onClick={() => onLogout()}>ออกจากระบบ</button>
      </div>
    </header>
    {error && <p className="shell-error" role="alert">{error}</p>}
    {children}
    </div>
  </div>;
}
