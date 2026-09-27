import { useState } from 'react';
import { useOrg } from '../lib/orgContext';
import { getUsageLog, clearUsageLog, type UsageEvent } from '../lib/usage';
import { Activity, Trash2, RefreshCw } from 'lucide-react';

export default function UsageLog() {
  const { role } = useOrg();
  const [events, setEvents] = useState<UsageEvent[]>(() => getUsageLog());

  if (role !== 'full_admin') {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold mb-2">Usage log</h1>
        <p className="text-red-600">Full Admin only.</p>
      </div>
    );
  }

  function refresh() {
    setEvents(getUsageLog());
  }

  function clear() {
    if (!confirm('Clear the local usage log on this device?')) return;
    clearUsageLog();
    setEvents([]);
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl space-y-4">
      <div className="flex items-center gap-3">
        <Activity className="text-slate-700" size={28} />
        <div>
          <h1 className="text-2xl font-bold">Usage log</h1>
          <p className="text-sm text-slate-500">
            Local events on <strong>this browser</strong>. Remote events also appear in
            Vercel → Project → Logs (filter <code className="text-xs bg-slate-100 px-1 rounded">SHEMESH-USAGE</code>).
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-900 space-y-2">
        <p className="font-medium">How to see real visits from other people</p>
        <ol className="list-decimal ml-4 space-y-1">
          <li>Open your Vercel project → <strong>Logs</strong> (or Runtime Logs).</li>
          <li>Filter for <code className="bg-white px-1 rounded">SHEMESH-USAGE</code>.</li>
          <li>You will see login, org, and page events with timestamps.</li>
          <li>Optional: set env var <code className="bg-white px-1 rounded">USAGE_WEBHOOK_URL</code> to a Discord webhook for instant pings.</li>
        </ol>
      </div>

      <div className="flex gap-2">
        <button onClick={refresh} className="flex items-center gap-1 text-sm border px-3 py-1.5 rounded-lg hover:bg-slate-50">
          <RefreshCw size={14} /> Refresh
        </button>
        <button onClick={clear} className="flex items-center gap-1 text-sm text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50">
          <Trash2 size={14} /> Clear local log
        </button>
      </div>

      {events.length === 0 ? (
        <p className="text-sm text-slate-400">No local events yet. Open modules to generate some.</p>
      ) : (
        <ul className="bg-white border rounded-xl divide-y text-sm">
          {events.map((e) => (
            <li key={e.id} className="px-4 py-2.5">
              <div className="flex justify-between gap-2 flex-wrap">
                <span className="font-medium">{e.type}</span>
                <span className="text-xs text-slate-400">{new Date(e.at).toLocaleString()}</span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {[e.userName, e.org, e.page, e.detail].filter(Boolean).join(' · ') || '—'}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
