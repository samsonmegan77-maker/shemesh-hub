import { useRef, useState } from 'react';
import { useOrg } from '../lib/orgContext';
import {
  exportOrgData, importOrgData, clearOrgData, downloadJson,
  DATA_SUFFIXES, orgKey, loadJson,
} from '../lib/localStore';
import { Download, Upload, Trash2, Database, AlertTriangle } from 'lucide-react';

export default function DataBackup() {
  const { organisation, canAccessFinance } = useOrg();
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState('');
  const [counts, setCounts] = useState<Record<string, number>>({});

  function refreshCounts() {
    if (!organisation) return;
    const c: Record<string, number> = {};
    for (const s of DATA_SUFFIXES) {
      const data = loadJson<unknown[]>(orgKey(organisation.id, s), []);
      c[s] = Array.isArray(data) ? data.length : data ? 1 : 0;
    }
    setCounts(c);
  }

  if (organisation && Object.keys(counts).length === 0) setTimeout(refreshCounts, 0);
  if (!organisation) return null;
  if (!canAccessFinance) {
    return (<div className="p-6"><h1 className="text-xl font-bold mb-2">Data backup</h1><p className="text-red-600">Treasurer / Full Admin only.</p></div>);
  }

  function doExport() {
    const data = exportOrgData(organisation!.id);
    downloadJson(`shemesh-${organisation!.short_code}-backup-${new Date().toISOString().slice(0, 10)}.json`, data);
    setMessage('Backup downloaded. Keep this file safe — it is the only copy outside this browser.');
  }

  function doImport(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const payload = JSON.parse(String(reader.result)) as Record<string, unknown>;
        const restored = importOrgData(organisation!.id, payload);
        refreshCounts();
        setMessage(`Imported ${restored.length} datasets. Open modules to see data.`);
      } catch {
        setMessage('Import failed — file is not valid SheMesh backup JSON.');
      }
    };
    reader.readAsText(file);
  }

  function doClear() {
    if (!confirm(`Delete ALL saved data for ${organisation!.name} on this device?`)) return;
    clearOrgData(organisation!.id);
    refreshCounts();
    setMessage('All local data for this organisation cleared on this device.');
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="p-4 md:p-6 max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Database className="text-slate-700" size={28} />
        <div>
          <h1 className="text-2xl font-bold">Data backup</h1>
          <p className="text-sm text-slate-500">Everything for <strong>{organisation.name}</strong> is stored only in this browser.</p>
        </div>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-sm text-amber-900">
        <AlertTriangle className="shrink-0 mt-0.5" size={18} />
        <div>
          <p className="font-medium">No cloud sync</p>
          <p className="mt-1">Clearing browser data or switching devices without a backup loses data. Southdale and Bambanani never mix.</p>
        </div>
      </div>
      <section className="bg-white border rounded-xl p-5 space-y-3">
        <h2 className="font-semibold text-sm">Records on this device</h2>
        <p className="text-2xl font-bold">{total} <span className="text-base font-normal text-slate-500">items</span></p>
        <ul className="grid grid-cols-2 gap-1 text-xs text-slate-600">
          {DATA_SUFFIXES.map((s) => (
            <li key={s} className="flex justify-between border-b border-slate-50 py-0.5">
              <span>{s}</span><span className="font-mono">{counts[s] ?? 0}</span>
            </li>
          ))}
        </ul>
        <button onClick={refreshCounts} className="text-xs text-blue-600 hover:underline">Refresh counts</button>
      </section>
      <section className="bg-white border rounded-xl p-5 space-y-3">
        <h2 className="font-semibold text-sm">Export / Import</h2>
        <div className="flex flex-wrap gap-2">
          <button onClick={doExport} className="flex items-center gap-2 bg-slate-800 text-white text-sm px-4 py-2 rounded-lg">
            <Download size={16} /> Download backup JSON
          </button>
          <button onClick={() => fileRef.current?.click()} className="flex items-center gap-2 border text-sm px-4 py-2 rounded-lg hover:bg-slate-50">
            <Upload size={16} /> Import backup JSON
          </button>
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) doImport(f); e.target.value = ''; }} />
        </div>
        <button onClick={doClear} className="flex items-center gap-2 text-red-700 text-sm px-3 py-1.5 rounded-lg hover:bg-red-50">
          <Trash2 size={14} /> Clear this organisation on this device
        </button>
      </section>
      {message && <p className="text-sm bg-slate-100 border rounded-lg px-4 py-3 text-slate-700">{message}</p>}
    </div>
  );
}
