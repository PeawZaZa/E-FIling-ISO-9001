export async function isHealthy(path: string): Promise<boolean> {
  try {
    const response = await fetch(path, { cache: 'no-store', signal: AbortSignal.timeout(6000) });
    const data: unknown = await response.json();
    return response.ok && typeof data === 'object' && data !== null && 'status' in data && data.status === 'ok';
  } catch { return false; }
}
