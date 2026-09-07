/** ตัวเรียกส่วนให้บริการข้อมูล เก็บวาระการใช้งานไว้ที่เดียว */

const TOKEN_KEY = 'efiling.token';

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* เบราว์เซอร์บางตัวปิดการเก็บข้อมูล ปล่อยให้ใช้งานต่อได้ในวาระเดียว */
  }
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly detail?: unknown,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  if (res.status === 204) return undefined as T;

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(res.status, body.error ?? 'เชื่อมต่อระบบไม่สำเร็จ', body.detail);
  }
  return body as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body ?? {}) }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body ?? {}) }),
};

export interface CurrentUser {
  id: string;
  email: string;
  fullName: string;
  roleCode: string;
  departmentId: string | null;
}

export interface LoginResult {
  token: string;
  user: CurrentUser & { roleName: string };
}

export interface MeResult {
  user: CurrentUser;
  permissions: string[];
}

export interface HealthResult {
  status: string;
  policy: {
    variant: string;
    source: string;
    carStates: string[];
    roles: string[];
  };
}
