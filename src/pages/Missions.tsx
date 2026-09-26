import { useState, useEffect } from 'react';
import { useOrg } from '../lib/orgContext';
import { loadJson, saveJson, orgKey } from '../lib/localStore';
import { Cross, Plus } from 'lucide-react';

type MissionType = 'Local' | 'Cross-border' | 'International';

interface Mission {
  id: string;
  name: string;
  type: MissionType;
  startDate: string;
  endDate: string;
  budget: number;
  participants: number;
  cookingTeam: boolean;
  safetyNotes: string;
  medicalNotes: string;
  notes: string;
}

export default function Missions() {
  const { organisation } = useOrg();
  const isSouthdale = organisation?.short_code === 'southdale';
  const storageKey = orgKey(organisation?.id, 'missions');
  const [missions, setMissions] = useState<Mission[]>(() => loadJson(storageKey, []));
  const [form, setForm] = useState({
    name: '', type: 'Local' as MissionType, startDate: '', endDate: '',
    budget: '', participants: '', cookingTeam: false, safetyNotes: '', medicalNotes: '', notes: '',
  });

  useEffect(() => { saveJson(storageKey, missions); }, [missions, storageKey]);

  if (!isSouthdale) {
    return (<div className="p-6"><h1 className="text-xl font-bold mb-2">Missions</h1><p className="text-slate-600">Missions are for Southdale. Switch org from the Hub.</p></div>);
  }

  function save() {
    if (!form.name.trim()) return;
    setMissions((prev) => [{
      id: crypto.randomUUID(), name: form.name.trim(), type: form.type,
      startDate: form.startDate, endDate: form.endDate,
      budget: Number(form.budget) || 0, participants: Number(form.participants) || 0,
      cookingTeam: form.cookingTeam, safetyNotes: form.safetyNotes,
      medicalNotes: form.medicalNotes, notes: form.notes,
    }, ...prev]);
    setForm({ name: '', type: 'Local', startDate: '', endDate: '', budget: '', participants: '', cookingTeam: false, safetyNotes: '', medicalNotes: '', notes: '' });
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl">
      <div className="flex items-center gap-3 mb-1">
        <Cross className="text-blue-700" size={28} />
        <h1 className="text-2xl font-bold">Missions (Lighthouse)</h1>
      </div>
      <p className="text-sm text-slate-500 mb-6">Local / cross-border / international · Safety & medical notes · Cooking team</p>
      <section className="bg-white border rounded-xl p-5 mb-6 space-y-3">
        <h2 className="font-semibold text-sm">New mission</h2>
        <div className="grid md:grid-cols-2 gap-3">
          <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Mission name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <select className="border rounded-lg px-3 py-2 text-sm" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as MissionType }))}>
            <option value="Local">Local</option>
            <option value="Cross-border">Cross-border</option>
            <option value="International">International</option>
          </select>
          <input type="date" className="border rounded-lg px-3 py-2 text-sm" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
          <input type="date" className="border rounded-lg px-3 py-2 text-sm" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} />
          <input type="number" className="border rounded-lg px-3 py-2 text-sm" placeholder="Budget (R)" value={form.budget} onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))} />
          <input type="number" className="border rounded-lg px-3 py-2 text-sm" placeholder="Participants" value={form.participants} onChange={(e) => setForm((f) => ({ ...f, participants: e.target.value }))} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.cookingTeam} onChange={(e) => setForm((f) => ({ ...f, cookingTeam: e.target.checked }))} />
          Cooking team assigned
        </label>
        <textarea className="border rounded-lg px-3 py-2 text-sm w-full" rows={2} placeholder="Safety register / notes" value={form.safetyNotes} onChange={(e) => setForm((f) => ({ ...f, safetyNotes: e.target.value }))} />
        <textarea className="border rounded-lg px-3 py-2 text-sm w-full" rows={2} placeholder="Medical notes" value={form.medicalNotes} onChange={(e) => setForm((f) => ({ ...f, medicalNotes: e.target.value }))} />
        <input className="border rounded-lg px-3 py-2 text-sm w-full" placeholder="Other notes / sponsorships" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
        <button onClick={save} className="flex items-center gap-1 bg-slate-800 text-white text-sm px-3 py-1.5 rounded-lg"><Plus size={14} /> Save mission</button>
      </section>
      {missions.length === 0 ? (<p className="text-sm text-slate-400">No missions recorded yet.</p>) : (
        <ul className="space-y-3">
          {missions.map((m) => (
            <li key={m.id} className="bg-white border rounded-xl p-4 text-sm">
              <div className="flex justify-between gap-2"><strong>{m.name}</strong><span className="text-xs bg-slate-100 px-2 py-0.5 rounded">{m.type}</span></div>
              <p className="text-slate-500 mt-1">{m.startDate || '?'} → {m.endDate || '?'} · {m.participants} people · R {m.budget.toFixed(2)}{m.cookingTeam ? ' · Cooking team' : ''}</p>
              {m.safetyNotes && <p className="mt-1"><span className="text-slate-500">Safety:</span> {m.safetyNotes}</p>}
              {m.medicalNotes && <p><span className="text-slate-500">Medical:</span> {m.medicalNotes}</p>}
              {m.notes && <p className="text-slate-600">{m.notes}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
