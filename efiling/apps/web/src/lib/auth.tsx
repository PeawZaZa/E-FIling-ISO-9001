import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { api, getToken, setToken, type CurrentUser, type LoginResult, type MeResult } from './api';

interface AuthState {
  user: CurrentUser | null;
  permissions: string[];
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  /** ผู้ใช้ปัจจุบันเข้าถึงกรณีการใช้งานนี้ได้หรือไม่ */
  can: (useCase: string) => boolean;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // คืนวาระการใช้งานเดิมเมื่อรีเฟรชหน้า
  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    api
      .get<MeResult>('/auth/me')
      .then((me) => {
        setUser(me.user);
        setPermissions(me.permissions);
      })
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await api.post<LoginResult>('/auth/login', { email, password });
    setToken(result.token);
    const me = await api.get<MeResult>('/auth/me');
    setUser(me.user);
    setPermissions(me.permissions);
  }, []);

  const signOut = useCallback(() => {
    setToken(null);
    setUser(null);
    setPermissions([]);
  }, []);

  const can = useCallback((useCase: string) => permissions.includes(useCase), [permissions]);

  const value = useMemo(
    () => ({ user, permissions, loading, signIn, signOut, can }),
    [user, permissions, loading, signIn, signOut, can],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth ต้องอยู่ภายใน AuthProvider');
  return ctx;
}
