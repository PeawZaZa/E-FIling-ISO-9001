export type Account = { id: string; name: string; roleLabel: string; email: string };
export type Identity = { user: Account; menus: { id: string; label: string }[] };
export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export async function api<T>(path: string, body?: unknown, method?: 'POST' | 'PATCH'): Promise<T> {
  const multipart = body instanceof FormData;
  const response = await fetch(`/api${path}`, {
    method: method ?? (body === undefined ? 'GET' : 'POST'), credentials: 'same-origin', cache: 'no-store',
    headers: body === undefined ? {} : multipart ? { 'X-EFiling-Client': 'web' } : { 'Content-Type': 'application/json', 'X-EFiling-Client': 'web' },
    body: body === undefined ? undefined : multipart ? body : JSON.stringify(body), signal: AbortSignal.timeout(multipart ? 180000 : 8000),
  });
  if (response.status === 204) return undefined as T;
  const data = await response.json();
  if (!response.ok) throw new ApiError(response.status, data.message || 'ดำเนินการไม่สำเร็จ');
  return data as T;
}
