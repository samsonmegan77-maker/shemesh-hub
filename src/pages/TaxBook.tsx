import { useState, useEffect } from 'react';
import { useOrg } from '../lib/orgContext';
import { loadJson, saveJson, orgKey } from '../lib/localStore';
import { BookOpen, Plus } from 'lucide-react';

type Category = 'pension' | 'fringe' | 'uif_employee' | 'paye' | 'other_deductible';

interface TaxLine {
  id: string;
  taxYear: string;
  month: string;
  employee: string;
  category: Category;
  amount: number;
  notes: string;
}

const EMPLOYEES = ['Pastor Mike', 'Karren MacKenzie', 'Carol Lai', 'General Worker', 'Other'];
const CAT_LABEL: Record<Category, string> = {
  pension: 'Pension / retirement',
  fringe: 'Fringe benefit',
  uif_employee: 'UIF (employee)',
  paye: 'PAYE',
  other_deductible: 'Other deductible',
};

export default function TaxBook() {
  const { organisation, canAccessFinance } = useOrg();
  const storageKey = orgKey(organisation?.id, 'tax-book');
  const [lines, setLines] = useState<TaxLine[]>(() => loadJson(storageKey, []));
  const [form, setForm] = useState({
    taxYear: '2026/27',
    month: new Date().toISOString().slice(0, 7),
    employee: EMPLOYEES[0],
    category: 'pension' as Category,
    amount: '',
    notes: '',
  });

  useEffect(() => { saveJson(storageKey, lines); }, [lines, storageKey]);

  if (!canAccessFinance) {
    return (<div className="p-6"><h1 className="text-xl font-bold mb-2">Tax & fringe book</h1><p className="text-red-600">Treasurer / Full Admin only.</p></div>);
  }

  function add() {
    const amount = Number(form.amount);
    if (!amount) return;
    setLines((prev) => [{
      id: crypto.randomUUID(), taxYear: form.taxYear, month: form.month,
      employee: form.employee, category: form.category, amount, notes: form.notes,
    }, ...prev]);
    setForm((f) => ({ ...f, amount: '', notes: '' }));
  }

  const yearLines = lines.filter((l) => l.taxYear === form.taxYear);
  const totals = {
    pension: yearLines.filter((l) => l.category === 'pension').reduce((s, l) => s + l.amount, 0),
    fringe: yearLines.filter((l) => l.category === 'fringe').reduce((s, l) => s + l.amount, 0),
    uif: yearLines.filter((l) => l.category === 'uif_employee').reduce((s, l) => s + l.amount, 0),
    paye: yearLines.filter((l) => l.category === 'paye').reduce((s, l) => s + l.amount, 0),
    other: yearLines.filter((l) => l.category === 'other_deductible').reduce((s, l) => s + l.amount, 0),
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-1">
        <BookOpen className="text-amber-700" size={28} />
        <h1 className="text-2xl font-bold">Tax & fringe book</h1>
      </div>
      <p className="text-sm text-slate-500 mb-6">{organisation?.name} · Pension, fringe, PAYE & UIF · Replaces the handwritten tax book</p>
      <section className="bg-white border rounded-xl p-5 mb-6 space-y-3">
        <h2 className="font-semibold text-sm">Add line</h2>
        <div className="grid md:grid-cols-3 gap-3">
          <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Tax year e.g. 2026/27" value={form.taxYear} onChange={(e) => setForm((f) => ({ ...f, taxYear: e.target.value }))} />
          <input type="month" className="border rounded-lg px-3 py-2 text-sm" value={form.month} onChange={(e) => setForm((f) => ({ ...f, month: e.target.value }))} />
          <select className="border rounded-lg px-3 py-2 text-sm" value={form.employee} onChange={(e) => setForm((f) => ({ ...f, employee: e.target.value }))}>
            {EMPLOYEES.map((n) => (<option key={n} value={n}>{n}</option>))}
          </select>
          <select className="border rounded-lg px-3 py-2 text-sm" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as Category }))}>
            {(Object.keys(CAT_LABEL) as Category[]).map((c) => (<option key={c} value={c}>{CAT_LABEL[c]}</option>))}
          </select>
          <input type="number" step="0.01" className="border rounded-lg px-3 py-2 text-sm" placeholder="Amount (R)" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} />
          <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Notes" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
        </div>
        <button onClick={add} className="flex items-center gap-1 bg-slate-800 text-white text-sm px-3 py-1.5 rounded-lg"><Plus size={14} /> Save line</button>
      </section>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[['Pension', totals.pension], ['Fringe', totals.fringe], ['UIF', totals.uif], ['PAYE', totals.paye], ['Other', totals.other]].map(([label, val]) => (
          <div key={String(label)} className="bg-white border rounded-xl p-3 text-center">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="font-semibold">R {(val as number).toFixed(2)}</p>
          </div>
        ))}
      </div>
      <section className="bg-white border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b font-semibold text-sm">Tax year {form.taxYear} ({yearLines.length} lines)</div>
        {yearLines.length === 0 ? (<p className="p-4 text-sm text-slate-400">No lines yet for this tax year.</p>) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left"><tr><th className="px-3 py-2">Month</th><th className="px-3 py-2">Employee</th><th className="px-3 py-2">Category</th><th className="px-3 py-2 text-right">Amount</th><th className="px-3 py-2">Notes</th></tr></thead>
              <tbody>
                {yearLines.map((l) => (
                  <tr key={l.id} className="border-t">
                    <td className="px-3 py-2 whitespace-nowrap">{l.month}</td>
                    <td className="px-3 py-2">{l.employee}</td>
                    <td className="px-3 py-2">{CAT_LABEL[l.category]}</td>
                    <td className="px-3 py-2 text-right">R {l.amount.toFixed(2)}</td>
                    <td className="px-3 py-2 text-slate-500 text-xs">{l.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
