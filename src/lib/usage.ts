/**
 * Lightweight usage tracking for the complete local edition.
 * - Keeps a ring buffer in localStorage (last 200 events) for on-device review
 * - POSTs to /api/usage so events appear in Vercel function logs
 * - Optional remote notify via server env USAGE_WEBHOOK_URL (Discord etc.)
 */

import { loadJson, saveJson } from './localStore';

export type UsageType =
  | 'app_open'
  | 'login'
  | 'logout'
  | 'org_enter'
  | 'org_leave'
  | 'page_view';

export interface UsageEvent {
  id: string;
  at: string;
  type: UsageType;
  userId?: string | null;
  userName?: string | null;
  org?: string | null;
  page?: string | null;
  detail?: string | null;
  sessionId: string;
  ua?: string;
}

const LOG_KEY = 'shemesh:usage-log';
const SESSION_KEY = 'shemesh:session-id';
const MAX = 200;

function sessionId(): string {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return 'unknown';
  }
}

function pushLocal(ev: UsageEvent) {
  const list = loadJson<UsageEvent[]>(LOG_KEY, []);
  list.unshift(ev);
  saveJson(LOG_KEY, list.slice(0, MAX));
}

function postRemote(ev: UsageEvent) {
  try {
    const payload = JSON.stringify({
      at: ev.at,
      type: ev.type,
      userId: ev.userId,
      userName: ev.userName,
      org: ev.org,
      page: ev.page,
      detail: ev.detail,
      sessionId: ev.sessionId,
      ua: ev.ua,
    });
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' });
      navigator.sendBeacon('/api/usage', blob);
      return;
    }
    fetch('/api/usage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // never block the UI
  }
}

export function trackUsage(
  type: UsageType,
  meta: {
    userId?: string | null;
    userName?: string | null;
    org?: string | null;
    page?: string | null;
    detail?: string | null;
  } = {}
) {
  const ev: UsageEvent = {
    id: crypto.randomUUID(),
    at: new Date().toISOString(),
    type,
    userId: meta.userId ?? null,
    userName: meta.userName ?? null,
    org: meta.org ?? null,
    page: meta.page ?? null,
    detail: meta.detail ?? null,
    sessionId: sessionId(),
    ua: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 180) : undefined,
  };
  pushLocal(ev);
  postRemote(ev);
}

export function getUsageLog(): UsageEvent[] {
  return loadJson<UsageEvent[]>(LOG_KEY, []);
}

export function clearUsageLog() {
  saveJson(LOG_KEY, []);
}
