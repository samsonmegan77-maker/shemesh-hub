import { useState, useEffect } from 'react';
import { useOrg } from '../lib/orgContext';
import { loadJson, saveJson, orgKey } from '../lib/localStore';
import { Heart, Plus, Package } from 'lucide-react';

interface Programme { id: string; name: string; active: boolean; }
interface Activity {
  id: string; programmeId: string; date: string;
  headcount: number; mealsServed: number; notes: string;
}
interface StockItem {
  id: string; programmeId: string; item: string; qty: number; notes: string;
}

const BAMBANANI_DEFAULTS = [
  'Dorcas Wardrobe', 'Dorcas Pantry', 'Soup Kitchen', 'Home for the Blind',
  'Yellow Mountain Informal Settlement', 'Booysens Informal Settlement',
  'Hong Ning Old Age Home', 'Karina Old Age Home', 'Annie Burger Old Age Home',
  'Bellavista Old Age Home', 'Chrisville Women & Children Outreach',
];

export default function Programmes() {
  const { organisation } = useOrg();
  const isBambanani = organisation?.short_code === 'bambanani';
  const keyBase = organisation?.id || 'none';

  const [programmes] = useState<Programme[]>(() =>
    isBambanani ? BAMBANANI_DEFAULTS.map((name) => ({ id: crypto.randomUUID(), name, active: true })) : []
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [tab, setTab] = useState<'activity' | 'stock'>('activity');
  const [activities, setActivities] = useState<Activity[]>(() => loadJson(orgKey(keyBase, 'programme-activities'), []));
  const [stock, setStock] = useState<StockItem[]>(() => loadJson(orgKey(keyBase, 'programme-stock'), []));
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), headcount: '', mealsServed: '', notes: '' });
  const [stockForm, setStockForm] = useState({ item: '', qty: '', notes: '' });

  useEffect(() => { saveJson(orgKey(keyBase, 'programme-activities'), activities); }, [activities, keyBase]);
  useEffect(() => { saveJson(orgKey(keyBase, 'programme-stock'), stock); }, [stock, keyBase]);

  if (!isBambanani) {
    return (<div className="p-6"><h1 className="text-xl font-bold mb-2">Programmes</h1><p className="text-slate-600">Outreach programmes are for Bambanani. Switch from the Hub.</p></div>);
  }

  function saveActivity() {
    if (!selected) return;
    setActivities((prev) => [{
      id: crypto.randomUUID(), programmeId: selected, date: form.date,
      headcount: Number(form.headcount) || 0, mealsServed: Number(form.mealsServed) || 0, notes: form.notes,
    }, ...prev]);
    setForm({ date: new Date().toISOString().slice(0, 10), headcount: '', mealsServed: '', notes: '' });
  }

  function addStock() {
    if (!selected || !stockForm.item.trim()) return;
    setStock((prev) => [{
      id: crypto.randomUUID(), programmeId: selected,
      item: stockForm.item.trim(), qty: Number(stockForm.qty) || 0, notes: stockForm.notes,
    }, ...prev]);
    setStockForm({ item: '', qty: '', notes: '' });
  }

  const active = programmes.find((p) => p.id === selected);
  const progActivities = activities.filter((a) => a.programmeId === selected);
  const progStock = stock.filter((s) => s.programmeId === selected);
  const totalHeadcount = progActivities.reduce((s, a) => s + a.headcount, 0);
  const totalMeals = progActivities.reduce((s, a) => s + a.mealsServed, 0);
  const monthPrefix = new Date().toISOString().slice(0, 7);
  const monthActivities = activities.filter((a) => a.date.startsWith(monthPrefix));
  const monthHeadcount = monthActivities.reduce((s, a) => s + a.headcount, 0);
  const monthMeals = monthActivities.reduce((s, a) => s + a.mealsServed, 0);

  return (
    <div className="p-4 md:p-6 max-w-5xl">
      <div className="flex items-center gap-3 mb-1">
        <Heart className="text-rose-600" size={28} />
        <h1 className="text-2xl font-bold">Bambanani programmes</h1>
      </div>
      <p className="text-sm text-slate-500 mb-4">Dorcas, soup kitchen, old age homes · Headcount, meals, stock</p>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white border rounded-xl p-4"><p className="text-xs text-slate-500">This month headcount</p><p className="text-xl font-bold">{monthHeadcount}</p></div>
        <div className="bg-white border rounded-xl p-4"><p className="text-xs text-slate-500">This month meals</p><p className="text-xl font-bold">{monthMeals}</p></div>
      </div>
      <div className="grid md:grid-cols-2 gap-2 mb-6">
        {programmes.map((p) => (
          <button key={p.id} onClick={() => setSelected(p.id === selected ? null : p.id)}
            className={`text-left border rounded-xl p-3 text-sm transition ${selected === p.id ? 'border-rose-500 bg-rose-50' : 'bg-white hover:border-slate-300'}`}>
            {p.name}
          </button>
        ))}
      </div>
      {active && (
        <section className="bg-white border rounded-xl p-5 space-y-4">
          <h2 className="text-lg font-bold">{active.name}</h2>
          <p className="text-sm text-slate-600">All-time here: {totalHeadcount} people · {totalMeals} meals</p>
          <div className="flex gap-2 border-b pb-2">
            <button onClick={() => setTab('activity')} className={`text-sm px-3 py-1.5 rounded ${tab === 'activity' ? 'bg-slate-800 text-white' : 'hover:bg-slate-100'}`}>Activity / impact</button>
            <button onClick={() => setTab('stock')} className={`flex items-center gap-1 text-sm px-3 py-1.5 rounded ${tab === 'stock' ? 'bg-slate-800 text-white' : 'hover:bg-slate-100'}`}><Package size={14} /> Stock / pantry</button>
          </div>
          {tab === 'activity' && (
            <div className="space-y-3">
              <div className="grid md:grid-cols-2 gap-2">
                <input type="date" className="border rounded-lg px-3 py-1.5 text-sm" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
                <input type="number" className="border rounded-lg px-3 py-1.5 text-sm" placeholder="Headcount" value={form.headcount} onChange={(e) => setForm((f) => ({ ...f, headcount: e.target.value }))} />
                <input type="number" className="border rounded-lg px-3 py-1.5 text-sm" placeholder="Meals served" value={form.mealsServed} onChange={(e) => setForm((f) => ({ ...f, mealsServed: e.target.value }))} />
                <input className="border rounded-lg px-3 py-1.5 text-sm" placeholder="Notes / impact" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
              </div>
              <button onClick={saveActivity} className="flex items-center gap-1 bg-slate-800 text-white text-sm px-3 py-1.5 rounded-lg"><Plus size={14} /> Save activity</button>
              <ul className="text-sm space-y-1">
                {progActivities.map((a) => (
                  <li key={a.id} className="border-t pt-1"><span className="text-slate-500">{a.date}</span> · {a.headcount} people · {a.mealsServed} meals{a.notes ? ` · ${a.notes}` : ''}</li>
                ))}
              </ul>
            </div>
          )}
          {tab === 'stock' && (
            <div className="space-y-3">
              <div className="grid md:grid-cols-3 gap-2">
                <input className="border rounded-lg px-3 py-1.5 text-sm" placeholder="Item (food, clothes…)" value={stockForm.item} onChange={(e) => setStockForm((f) => ({ ...f, item: e.target.value }))} />
                <input type="number" className="border rounded-lg px-3 py-1.5 text-sm" placeholder="Qty" value={stockForm.qty} onChange={(e) => setStockForm((f) => ({ ...f, qty: e.target.value }))} />
                <input className="border rounded-lg px-3 py-1.5 text-sm" placeholder="Notes" value={stockForm.notes} onChange={(e) => setStockForm((f) => ({ ...f, notes: e.target.value }))} />
              </div>
              <button onClick={addStock} className="flex items-center gap-1 bg-slate-800 text-white text-sm px-3 py-1.5 rounded-lg"><Plus size={14} /> Add stock</button>
              <ul className="text-sm space-y-1">
                {progStock.map((s) => (<li key={s.id} className="border-t pt-1"><strong>{s.item}</strong> × {s.qty}{s.notes ? ` · ${s.notes}` : ''}</li>))}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
