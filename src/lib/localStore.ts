/**
 * Simple localStorage-backed persistence so data survives refresh
 * until Supabase is connected. Keys are scoped by organisation.
 */

export function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('localStorage save failed', e);
  }
}

export function orgKey(orgId: string | undefined | null, suffix: string): string {
  return `shemesh:${orgId || 'none'}:${suffix}`;
}
