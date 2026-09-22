import { useState } from 'react';
import { useOrg } from '../lib/orgContext';
import { Cross, Plus, Users } from 'lucide-react';

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
  notes: string;
}

export default function Missions() {
  const { organisation } = useOrg();
  const isSouthdale = organisation?.short_code === 'southdale';

  const [missions, setMissions] = useState<Mission[]>([]);
  const [form, setForm] = useState({
    name: '',
    type: 'Local' as MissionType,
    startDate: '',
    endDate: '',
    budget: '',
    participants: '',
    cookingTeam: false,
    notes: '',
  });

  if (!isSouthdale) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold mb-2">Missions</h1>
        <p className="text-slate-600">Missions department is under Southdale Baptist Church.</p>
      </div>
    );
  }

  function save() {
    if (!form.name.trim()) return;
    setMissions((prev) => [
      {
        id: crypto.randomUUID(),
        name: form.name,
        type: form.type,
        startDate: form.startDate,
        endDate: form.endDate,
        budget: Number(form.budget) || 0,
        participants: Number(form.participants) || 0,
        cookingTeam: form.cookingTeam,
        notes: form.notes,
      },
      ...prev,
    ]);
    setForm({
      name: '',
      type: 'Local',
      startDate: '',
      endDate: '',
      budget: '',
      participants: '',
      cookingTeam: false,
      notes: '',
    });
  }

  const typeHint: Record<MissionType, string> = {
    Local: '~23 people',
    'Cross-border': '~23 people',
    International: '4 – 6 people',
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl">
      <div className="flex items-center gap-3 mb-1">
        <Cross className="text-rose-600" size={28} />
        <h1 className="text-2xl font-bold">Missions (Lighthouse)</h1>
      </div>
      <p className="text-sm text-slate-500 mb-6">
        Local / Cross-border / International • Sponsorships • Safety register
      </p>

      <section className="bg-white border rounded-xl p-5 mb-6 space-y-3">
        <h2 className="font-semibold">New mission trip</h2>
        <div className="grid md:grid-cols-2 gap-3">
          <input
            className="border rounded-lg px-3 py-2 text-sm"
            placeholder="Mission name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <select
            className="border rounded-lg px-3 py-2 text-sm"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as MissionType })}
          >
            <option value="Local">Local (~23)</option>
            <option value="Cross-border">Cross-border (~23)</option>
            <option value="International">International (4–6)</option>
          </select>
          <input
            type="date"
            className="border rounded-lg px-3 py-2 text-sm"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
          />
          <input
            type="date"
            className="border rounded-lg px-3 py-2 text-sm"
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
          />
          <input
            type="number"
            className="border rounded-lg px-3 py-2 text-sm"
            placeholder="Budget (R)"
            value={form.budget}
            onChange={(e) => setForm({ ...form, budget: e.target.value })}
          />
          <input
            type="number"
            className="border rounded-lg px-3 py-2 text-sm"
            placeholder={`Participants (${typeHint[form.type]})`}
            value={form.participants}
            onChange={(e) => setForm({ ...form, participants: e.target.value })}
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.cookingTeam}
            onChange={(e) => setForm({ ...form, cookingTeam: e.target.checked })}
          />
          Includes Cooking Team
        </label>
        <input
          className="border rounded-lg px-3 py-2 text-sm w-full"
          placeholder="Notes (sponsorships, medical, safety…)"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
        <button
          onClick={save}
          className="flex items-center gap-1 bg-slate-800 text-white text-sm px-3 py-1.5 rounded-lg"
        >
          <Plus size={14} /> Save mission
        </button>
      </section>

      {missions.length === 0 ? (
        <p className="text-sm text-slate-400">No missions recorded yet.</p>
      ) : (
        <div className="space-y-3">
          {missions.map((m) => (
            <div key={m.id} className="bg-white border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{m.name}</h3>
                <span className="text-xs bg-rose-100 text-rose-800 px-2 py-0.5 rounded">{m.type}</span>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                {m.startDate || '?'} → {m.endDate || '?'}
                {m.budget > 0 && ` · Budget R ${m.budget.toFixed(2)}`}
              </p>
              <p className="text-sm mt-1 flex items-center gap-1">
                <Users size={14} /> {m.participants} participants
                {m.cookingTeam && ' · Cooking Team'}
              </p>
              {m.notes && <p className="text-xs text-slate-500 mt-1">{m.notes}</p>}
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-slate-400 mt-4">
        Participant register (names, emergency contacts, restricted medical notes) and sponsorship
        tracking (cash/EFT receipts) will connect to mission_participants once Supabase is live.
      </p>
    </div>
  );
}
