/**
 * Organisation-scoped localStorage persistence.
 * Complete local edition - no cloud backend required.
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

export const DATA_SUFFIXES = [
  'payroll', 'treasurer', 'expenses', 'reimbursements', 'monthly-payments',
  'pettycash', 'registers', 'rosters', 'stock', 'missions',
  'programme-activities', 'programme-stock', 'documents', 'minutes',
  'leave-book', 'tax-book', 'investments', 'budgets',
] as const;

export function exportOrgData(orgId: string): Record<string, unknown> {
  const out: Record<string, unknown> = {
    exportedAt: new Date().toISOString(),
    organisationId: orgId,
    version: 1,
  };
  for (const suffix of DATA_SUFFIXES) {
    const key = orgKey(orgId, suffix);
    const raw = localStorage.getItem(key);
    if (raw) {
      try { out[suffix] = JSON.parse(raw); }
      catch { out[suffix] = raw; }
    }
  }
  return out;
}

export function importOrgData(orgId: string, payload: Record<string, unknown>): string[] {
  const restored: string[] = [];
  for (const suffix of DATA_SUFFIXES) {
    if (payload[suffix] !== undefined) {
      saveJson(orgKey(orgId, suffix), payload[suffix]);
      restored.push(suffix);
    }
  }
  return restored;
}

export function clearOrgData(orgId: string): void {
  for (const suffix of DATA_SUFFIXES) {
    localStorage.removeItem(orgKey(orgId, suffix));
  }
}

export function downloadJson(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
