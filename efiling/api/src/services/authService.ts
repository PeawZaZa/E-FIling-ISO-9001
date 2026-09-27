import { accounts, menus } from '../data/demoAccounts.js';

export function identity(id: string) {
  const user = accounts.find(account => account.id === id);
  if (!user) return null;
  return { user, menus: menus.filter(menu => menu.roles.includes(user.id)).map(({ id, label }) => ({ id, label })) };
}

export function authenticate(email: string, password: string) {
  const user = accounts.find(account => account.email === email.trim().toLowerCase());
  return password === 'Demo1234!' ? user : undefined;
}
export function menuAccess(userId: string, module: string) {
  const menu = menus.find(item => item.id === module);
  if (!menu) return { status: 404, body: { message: 'ไม่พบเมนู' } };
  if (!menu.roles.includes(userId)) return { status: 403, body: { message: 'บัญชีนี้ไม่มีสิทธิ์เข้าเมนูนี้' } };
  return { status: 200, body: { id: menu.id, label: menu.label, implemented: ['documents','dar','ack','records','audit','cars','dashboard'].includes(module) } };
}
export function demoAccounts() { return accounts; }
