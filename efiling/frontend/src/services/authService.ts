import { api, type Account, type Identity } from './apiClient';
export { ApiError, type Account, type Identity } from './apiClient';
export const DEMO_PASSWORD = 'Demo1234!';
export const getDemoAccounts = () => api<{ accounts: Account[] }>('/auth/demo-accounts');
export const getIdentity = () => api<Identity>('/auth/me');
export const login = (email: string, password: string) => api<Identity>('/auth/login', { email, password });
export const logout = () => api<void>('/auth/logout', {});
export const getMenuAccess = (page: string) => api<{ label: string }>(`/modules/${encodeURIComponent(page)}/access`);
