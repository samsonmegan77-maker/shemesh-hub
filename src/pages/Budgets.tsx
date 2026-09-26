import { useState, useEffect } from 'react';
import { useOrg } from '../lib/orgContext';
import { loadJson, saveJson, orgKey } from '../lib/localStore';
import { PiggyBank, Plus } from 'lucide-react';

interface BudgetLine {
  id: string;
  year: string;
  department: string;
  category: string;
  amount: number;
  notes: string;
}

const DEPTS = [
  'Sunday Service', 'Sunday School', 'Junior Youth', 'Senior Youth', 'Music',
  'Missions', 'Ladies Fellowship', 'Mens Fellowship', 'Bible Study', 'Prayer Ministry',
  'Social Care / Bambanani link', 'General / Building', 'Payroll', 'Other',
];

export default function Budgets() {
  const { organisation, canAccessFinance } = useOrg();
  const storageKey = orgKey(organisation?.id, 'budgets');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [lines, setLines] = useState<BudgetLine[]>(() => loadJson(storageKey, []));
  const [form, setForm] = useState({ department: DEPTS[0], category: '', amount: '', notes: '' });

  useEffect(() => { saveJson(storageKey, lines); }, [lines, storageKey]);

  if (!canAccessFinance) {
    return (<div className="p-6"><h1 className="text-xl font-bold mb-2">Budgets</h1><p className="text-red-600">Treasurer / Full Admin only.</p></div>);
  }

  function add() {
    const amount = Number(form.amount);
    if (!amount) return;
    setLines((prev) => [{
      id: crypto.randomUUID(), year, department: form.department,
      category: form.category || form.department, amount, notes: form.notes,
    }, ...prev]);
    setForm((f) => ({ ...f, category: '', amount: '', notes: '' }));
  }

  const yearLines = lines.filter((l) => l.year === year);
  const total = yearLines.reduce((s, l) => s + l.amount, 0);
  const byDept = DEPTS.map((d) => ({
    d, amount: yearLines.filter((l) => l.department === d).reduce((s, l) => s + l.amount, 0),
  })).filter((x) => x.amount > 0);

  return (
    <div className="p-4 md:p-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-1">
        <PiggyBank className="text-rose-600" size={28} />
        <h1 className="text-2xl font-bold">Yearly budgets</h1>
      </div>
      <p className="text-sm text-slate-500 mb-6">{organisation?.name} · Planned spend per department</p>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <label className="text-sm font-medium">Year{' '}
          <input type="number" className="border rounded-lg px-3 py-1.5 w-28 ml-1" value={year} onChange={(e) => setYear(e.target.value)} />
        </label>
        <span className="text-sm text-slate-600">Total planned: <strong>R {total.toFixed(2)}</strong></span>
      </div>
      <section className="bg-white border rounded-xl p-5 mb-6 space-y-3">
        <h2 className="font-semibold text-sm">Add budget line</h2>
        <div className="grid md:grid-cols-2 gap-3">
          <select className="border rounded-lg px-3 py-2 text-sm" value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}>
            {DEPTS.map((d) => (<option key={d} value={d}>{d}</option>))}
          </select>
          <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Category (optional)" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} />
          <input type="number" step="0.01" className="border rounded-lg px-3 py-2 text-sm" placeholder="Amount (R)" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} />
          <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Notes" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
        </div>
        <button onClick={add} className="flex items-center gap-1 bg-slate-800 text-white text-sm px-3 py-1.5 rounded-lg"><Plus size={14} /> Save</button>
      </section>
      {byDept.length > 0 && (
        <div className="grid md:grid-cols-2 gap-2 mb-6">
          {byDept.map((x) => (
            <div key={x.d} className="bg-white border rounded-lg px-3 py-2 flex justify-between text-sm">
              <span>{x.d}</span><strong>R {x.amount.toFixed(2)}</strong>
            </div>
          ))}
        </div>
      )}
      <section className="bg-white border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b font-semibold text-sm">Lines for {year}</div>
        {yearLines.length === 0 ? (<p className="p-4 text-sm text-slate-400">No budget lines for this year yet.</p>) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left"><tr><th className="px-3 py-2">Department</th><th className="px-3 py-2">Category</th><th className="px-3 py-2 text-right">Amount</th><th className="px-3 py-2">Notes</th></tr></thead>
            <tbody>
              {yearLines.map((l) => (
                <tr key={l.id} className="border-t">
                  <td className="px-3 py-2">{l.department}</td>
                  <td className="px-3 py-2 text-slate-600">{l.category}</td>
                  <td className="px-3 py-2 text-right">R {l.amount.toFixed(2)}</td>
                  <td className="px-3 py-2 text-xs text-slate-500">{l.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
