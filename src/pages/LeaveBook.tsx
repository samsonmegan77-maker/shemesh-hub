import { useState, useEffect } from 'react';
import { useOrg } from '../lib/orgContext';
import { loadJson, saveJson, orgKey } from '../lib/localStore';
import { CalendarDays, Plus } from 'lucide-react';

type LeaveType = 'annual' | 'sick' | 'family' | 'unpaid' | 'other';

interface LeaveEntry {
  id: string;
  employee: string;
  type: LeaveType;
  from: string;
  to: string;
  days: number;
  notes: string;
}

const EMPLOYEES = ['Pastor Mike', 'Karren MacKenzie', 'Carol Lai', 'General Worker', 'Other'];

export default function LeaveBook() {
  const { organisation, canAccessFinance } = useOrg();
  const storageKey = orgKey(organisation?.id, 'leave-book');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [entries, setEntries] = useState<LeaveEntry[]>(() => loadJson(storageKey, []));
  const [form, setForm] = useState({
    employee: EMPLOYEES[0],
    type: 'annual' as LeaveType,
    from: new Date().toISOString().slice(0, 10),
    to: new Date().toISOString().slice(0, 10),
    days: '1',
    notes: '',
  });

  useEffect(() => { saveJson(storageKey, entries); }, [entries, storageKey]);

  if (!canAccessFinance) {
    return (<div className="p-6"><h1 className="text-xl font-bold mb-2">Leave book</h1><p className="text-red-600">Treasurer / Full Admin only.</p></div>);
  }

  function add() {
    const days = Number(form.days) || 0;
    if (days <= 0) return;
    setEntries((prev) => [{
      id: crypto.randomUUID(), employee: form.employee, type: form.type,
      from: form.from, to: form.to, days, notes: form.notes,
    }, ...prev]);
    setForm((f) => ({ ...f, days: '1', notes: '' }));
  }

  const yearEntries = entries.filter((e) => e.from.startsWith(year) || e.to.startsWith(year));
  const byEmployee = EMPLOYEES.map((name) => {
    const list = yearEntries.filter((e) => e.employee === name);
    const annual = list.filter((e) => e.type === 'annual').reduce((s, e) => s + e.days, 0);
    const sick = list.filter((e) => e.type === 'sick').reduce((s, e) => s + e.days, 0);
    const other = list.filter((e) => e.type !== 'annual' && e.type !== 'sick').reduce((s, e) => s + e.days, 0);
    return { name, annual, sick, other, total: annual + sick + other };
  }).filter((r) => r.total > 0);

  return (
    <div className="p-4 md:p-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-1">
        <CalendarDays className="text-teal-600" size={28} />
        <h1 className="text-2xl font-bold">Leave book</h1>
      </div>
      <p className="text-sm text-slate-500 mb-6">{organisation?.name} · Annual, sick & other leave · Replaces the paper leave record</p>
      <div className="mb-4">
        <label className="text-sm font-medium mr-2">Year</label>
        <input type="number" className="border rounded-lg px-3 py-1.5 w-28" value={year} onChange={(e) => setYear(e.target.value)} />
      </div>
      <section className="bg-white border rounded-xl p-5 mb-6 space-y-3">
        <h2 className="font-semibold text-sm">Record leave</h2>
        <div className="grid md:grid-cols-3 gap-3">
          <select className="border rounded-lg px-3 py-2 text-sm" value={form.employee} onChange={(e) => setForm((f) => ({ ...f, employee: e.target.value }))}>
            {EMPLOYEES.map((n) => (<option key={n} value={n}>{n}</option>))}
          </select>
          <select className="border rounded-lg px-3 py-2 text-sm" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as LeaveType }))}>
            <option value="annual">Annual leave</option>
            <option value="sick">Sick leave</option>
            <option value="family">Family responsibility</option>
            <option value="unpaid">Unpaid</option>
            <option value="other">Other</option>
          </select>
          <input type="number" step="0.5" className="border rounded-lg px-3 py-2 text-sm" placeholder="Days" value={form.days} onChange={(e) => setForm((f) => ({ ...f, days: e.target.value }))} />
          <input type="date" className="border rounded-lg px-3 py-2 text-sm" value={form.from} onChange={(e) => setForm((f) => ({ ...f, from: e.target.value }))} />
          <input type="date" className="border rounded-lg px-3 py-2 text-sm" value={form.to} onChange={(e) => setForm((f) => ({ ...f, to: e.target.value }))} />
          <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Notes" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
        </div>
        <button onClick={add} className="flex items-center gap-1 bg-slate-800 text-white text-sm px-3 py-1.5 rounded-lg"><Plus size={14} /> Save leave</button>
      </section>
      {byEmployee.length > 0 && (
        <section className="bg-white border rounded-xl overflow-hidden mb-6">
          <div className="px-4 py-3 border-b font-semibold text-sm">Summary {year}</div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left"><tr><th className="px-3 py-2">Employee</th><th className="px-3 py-2 text-right">Annual</th><th className="px-3 py-2 text-right">Sick</th><th className="px-3 py-2 text-right">Other</th><th className="px-3 py-2 text-right">Total</th></tr></thead>
            <tbody>
              {byEmployee.map((r) => (
                <tr key={r.name} className="border-t">
                  <td className="px-3 py-2 font-medium">{r.name}</td>
                  <td className="px-3 py-2 text-right">{r.annual || '—'}</td>
                  <td className="px-3 py-2 text-right">{r.sick || '—'}</td>
                  <td className="px-3 py-2 text-right">{r.other || '—'}</td>
                  <td className="px-3 py-2 text-right font-medium">{r.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
      <section className="bg-white border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b font-semibold text-sm">Entries ({yearEntries.length})</div>
        {yearEntries.length === 0 ? (<p className="p-4 text-sm text-slate-400">No leave recorded for {year} yet.</p>) : (
          <ul className="divide-y text-sm">
            {yearEntries.map((e) => (
              <li key={e.id} className="px-4 py-3 flex flex-wrap gap-2 justify-between">
                <span><strong>{e.employee}</strong> · {e.type} · {e.days} day(s)</span>
                <span className="text-slate-500">{e.from}{e.to !== e.from ? ` → ${e.to}` : ''}{e.notes ? ` · ${e.notes}` : ''}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
