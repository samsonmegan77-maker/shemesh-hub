import { useState } from 'react';
import { useOrg } from '../lib/orgContext';
import { HeartHandshake, Plus, Utensils, Package, Users } from 'lucide-react';

interface Programme {
  id: string;
  name: string;
  active: boolean;
}

interface Activity {
  id: string;
  programmeId: string;
  date: string;
  headcount: number;
  mealsServed: number;
  notes: string;
}

const BAMBANANI_DEFAULTS = [
  'Dorcas Wardrobe',
  'Dorcas Pantry',
  'Soup Kitchen',
  'Home for the Blind',
  'Yellow Mountain Informal Settlement',
  'Booysens Informal Settlement',
  'Hong Ning Old Age Home',
  'Karina Old Age Home',
  'Annie Burger Old Age Home',
  'Bellavista Old Age Home',
  'Chrisville Women & Children Outreach',
];

export default function Programmes() {
  const { organisation } = useOrg();
  const isBambanani = organisation?.short_code === 'bambanani';

  const [programmes] = useState<Programme[]>(() =>
    isBambanani
      ? BAMBANANI_DEFAULTS.map((name) => ({
          id: crypto.randomUUID(),
          name,
          active: true,
        }))
      : []
  );

  const [selected, setSelected] = useState<string | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    headcount: '',
    mealsServed: '',
    notes: '',
  });

  if (!isBambanani) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold mb-2">Programmes</h1>
        <p className="text-slate-600">
          Outreach programmes are for Bambanani Community Care. Switch to Bambanani from the Hub.
        </p>
      </div>
    );
  }

  function saveActivity() {
    if (!selected) return;
    setActivities((prev) => [
      {
        id: crypto.randomUUID(),
        programmeId: selected,
        date: form.date,
        headcount: Number(form.headcount) || 0,
        mealsServed: Number(form.mealsServed) || 0,
        notes: form.notes,
      },
      ...prev,
    ]);
    setForm({
      date: new Date().toISOString().slice(0, 10),
      headcount: '',
      mealsServed: '',
      notes: '',
    });
  }

  const active = programmes.find((p) => p.id === selected);
  const progActivities = activities.filter((a) => a.programmeId === selected);
  const totalHeadcount = progActivities.reduce((s, a) => s + a.headcount, 0);
  const totalMeals = progActivities.reduce((s, a) => s + a.mealsServed, 0);

  // Monthly impact across all programmes
  const monthPrefix = new Date().toISOString().slice(0, 7);
  const monthActivities = activities.filter((a) => a.date.startsWith(monthPrefix));
  const monthHeadcount = monthActivities.reduce((s, a) => s + a.headcount, 0);
  const monthMeals = monthActivities.reduce((s, a) => s + a.mealsServed, 0);

  return (
    <div className="p-4 md:p-6 max-w-5xl">
      <div className="flex items-center gap-3 mb-1">
        <HeartHandshake className="text-emerald-600" size={28} />
        <h1 className="text-2xl font-bold">Bambanani Programmes</h1>
      </div>
      <p className="text-sm text-slate-500 mb-4">
        Outreach locations • Headcount • Meals • Impact
      </p>

      {/* Monthly impact summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white border rounded-xl p-3">
          <p className="text-xs text-slate-500">This month headcount</p>
          <p className="text-xl font-bold flex items-center gap-1">
            <Users size={18} /> {monthHeadcount}
          </p>
        </div>
        <div className="bg-white border rounded-xl p-3">
          <p className="text-xs text-slate-500">This month meals</p>
          <p className="text-xl font-bold flex items-center gap-1">
            <Utensils size={18} /> {monthMeals}
          </p>
        </div>
        <div className="bg-white border rounded-xl p-3">
          <p className="text-xs text-slate-500">Active programmes</p>
          <p className="text-xl font-bold">{programmes.filter((p) => p.active).length}</p>
        </div>
        <div className="bg-white border rounded-xl p-3">
          <p className="text-xs text-slate-500">Activities logged</p>
          <p className="text-xl font-bold">{activities.length}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {programmes.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelected(p.id === selected ? null : p.id)}
            className={`text-left border rounded-xl p-4 transition ${
              selected === p.id
                ? 'border-emerald-500 bg-emerald-50'
                : 'bg-white hover:border-slate-300'
            }`}
          >
            <h3 className="font-semibold text-sm">{p.name}</h3>
            <p className="text-xs text-slate-400 mt-1">
              {activities.filter((a) => a.programmeId === p.id).length} activities
            </p>
          </button>
        ))}
      </div>

      {active && (
        <section className="bg-white border rounded-xl p-5 space-y-4">
          <h2 className="text-lg font-bold">{active.name}</h2>

          <div className="flex gap-4 text-sm">
            <span className="flex items-center gap-1">
              <Users size={16} /> Headcount total: <strong>{totalHeadcount}</strong>
            </span>
            <span className="flex items-center gap-1">
              <Utensils size={16} /> Meals total: <strong>{totalMeals}</strong>
            </span>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold text-sm mb-2">Log activity / outreach</h3>
            <div className="grid md:grid-cols-4 gap-2">
              <input
                type="date"
                className="border rounded-lg px-3 py-1.5 text-sm"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
              <input
                type="number"
                className="border rounded-lg px-3 py-1.5 text-sm"
                placeholder="Headcount"
                value={form.headcount}
                onChange={(e) => setForm({ ...form, headcount: e.target.value })}
              />
              <input
                type="number"
                className="border rounded-lg px-3 py-1.5 text-sm"
                placeholder="Meals served"
                value={form.mealsServed}
                onChange={(e) => setForm({ ...form, mealsServed: e.target.value })}
              />
              <button
                onClick={saveActivity}
                className="flex items-center justify-center gap-1 bg-emerald-600 text-white text-sm px-3 py-1.5 rounded-lg"
              >
                <Plus size={14} /> Log
              </button>
            </div>
            <input
              className="border rounded-lg px-3 py-1.5 text-sm w-full mt-2"
              placeholder="Notes / evidence"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          {progActivities.length > 0 && (
            <table className="w-full text-sm mt-2">
              <thead className="text-left text-slate-500">
                <tr>
                  <th className="py-1">Date</th>
                  <th className="py-1">Headcount</th>
                  <th className="py-1">Meals</th>
                  <th className="py-1">Notes</th>
                </tr>
              </thead>
              <tbody>
                {progActivities.map((a) => (
                  <tr key={a.id} className="border-t">
                    <td className="py-1.5">{a.date}</td>
                    <td className="py-1.5">{a.headcount}</td>
                    <td className="py-1.5">{a.mealsServed}</td>
                    <td className="py-1.5 text-slate-500">{a.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}

      <p className="text-xs text-slate-400 mt-4">
        Stock allocation and donor links will connect to inventory / donations tables once Supabase is
        live. Monthly impact totals above are ready for the impact report.
      </p>
    </div>
  );
}
