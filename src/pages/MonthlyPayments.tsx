import { useState, useEffect } from 'react';
import { useOrg } from '../lib/orgContext';
import { loadJson, saveJson, orgKey } from '../lib/localStore';
import { CalendarDays, Plus } from 'lucide-react';

type Frequency = 'monthly' | 'bi-annual' | 'once-off' | 'unforeseen';

interface Payment {
  id: string;
  payee: string;
  amount: number;
  category: string;
  frequency: Frequency;
  status: 'planned' | 'paid';
  notes: string;
}

const DEFAULT_SOUTHDALE: Omit<Payment, 'id'>[] = [
  { payee: 'City of Johannesburg', amount: 0, category: 'Water and Lights', frequency: 'monthly', status: 'planned', notes: '' },
  { payee: 'Wifi provider', amount: 0, category: 'Wifi', frequency: 'monthly', status: 'planned', notes: '' },
  { payee: 'Telkom', amount: 0, category: 'Telkom', frequency: 'monthly', status: 'planned', notes: '' },
  { payee: 'Carguard', amount: 0, category: 'Sunday Security - Carguard', frequency: 'monthly', status: 'planned', notes: '' },
  { payee: 'SA Rangers Security', amount: 0, category: 'SA Rangers Security', frequency: 'monthly', status: 'planned', notes: '' },
  { payee: 'Insurance', amount: 0, category: 'Insurance', frequency: 'monthly', status: 'planned', notes: 'Building / equipment / vehicles' },
  { payee: 'General Worker', amount: 0, category: 'General Maintenance', frequency: 'monthly', status: 'planned', notes: 'Wages' },
  { payee: 'Fuel', amount: 0, category: 'Fuel', frequency: 'monthly', status: 'planned', notes: '' },
  { payee: 'Baptist Union', amount: 0, category: 'Baptist Union', frequency: 'monthly', status: 'planned', notes: '' },
  { payee: 'Theological College', amount: 0, category: 'Theological College', frequency: 'monthly', status: 'planned', notes: '' },
  { payee: 'Moller Family', amount: 0, category: 'Moller Family', frequency: 'monthly', status: 'planned', notes: '' },
  { payee: 'Pieter Loots', amount: 0, category: 'Pieter Loots', frequency: 'monthly', status: 'planned', notes: '' },
  { payee: 'POP Thailand', amount: 0, category: 'POP Thailand', frequency: 'monthly', status: 'planned', notes: '' },
  { payee: 'Salary', amount: 0, category: 'Salary', frequency: 'monthly', status: 'planned', notes: '' },
  { payee: 'Repairs and Maintenance', amount: 0, category: 'Repairs and Maintenance', frequency: 'monthly', status: 'planned', notes: '' },
  { payee: 'Bank Charges', amount: 0, category: 'Bank Charges', frequency: 'monthly', status: 'planned', notes: '' },
];

export default function MonthlyPayments() {
  const { canAccessFinance, organisation } = useOrg();
  const isSouthdale = organisation?.short_code === 'southdale';
  const storageKey = orgKey(organisation?.id, 'monthly-payments');

  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7));
  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = loadJson<Payment[]>(storageKey, []);
    if (saved.length) return saved;
    return isSouthdale ? DEFAULT_SOUTHDALE.map((p) => ({ ...p, id: crypto.randomUUID() })) : [];
  });
  const [showAdd, setShowAdd] = useState(false);
  const [newPayee, setNewPayee] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newFreq, setNewFreq] = useState<Frequency>('unforeseen');
  const [newNotes, setNewNotes] = useState('');

  useEffect(() => {
    saveJson(storageKey, payments);
  }, [payments, storageKey]);

  if (!canAccessFinance) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold mb-2">Monthly Payments</h1>
        <p className="text-red-600">You do not have permission to manage monthly payments.</p>
      </div>
    );
  }

  function updateAmount(id: string, amount: number) {
    setPayments((prev) => prev.map((p) => (p.id === id ? { ...p, amount } : p)));
  }
  function togglePaid(id: string) {
    setPayments((prev) => prev.map((p) => (p.id === id ? { ...p, status: p.status === 'paid' ? 'planned' : 'paid' } : p)));
  }
  function addPayment() {
    if (!newPayee.trim()) return;
    setPayments((prev) => [
      ...prev,
      { id: crypto.randomUUID(), payee: newPayee.trim(), amount: Number(newAmount) || 0, category: newPayee.trim(), frequency: newFreq, status: 'planned', notes: newNotes },
    ]);
    setNewPayee('');
    setNewAmount('');
    setNewFreq('unforeseen');
    setNewNotes('');
    setShowAdd(false);
  }

  const totalPlanned = payments.reduce((s, p) => s + p.amount, 0);
  const totalPaid = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const freqBadge = (f: Frequency) =>
    ({ monthly: 'bg-slate-100 text-slate-700', 'bi-annual': 'bg-purple-100 text-purple-700', 'once-off': 'bg-blue-100 text-blue-700', unforeseen: 'bg-amber-100 text-amber-800' }[f]);

  return (
    <div className="p-4 md:p-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-1">
        <CalendarDays className="text-indigo-600" size={28} />
        <h1 className="text-2xl font-bold">Monthly Payments</h1>
      </div>
      <p className="text-sm text-slate-500 mb-6">
        {organisation?.name} · Pre-loaded list + unforeseen / bi-annual / once-off · Saved on this device
      </p>

      <div className="flex flex-wrap items-center gap-4 mb-4">
        <label className="flex items-center gap-2 text-sm">
          <span className="font-medium">Period</span>
          <input type="month" className="border rounded-lg px-3 py-1.5" value={period} onChange={(e) => setPeriod(e.target.value)} />
        </label>
        <div className="text-sm text-slate-600">
          Planned: <strong>R {totalPlanned.toFixed(2)}</strong> · Paid: <strong>R {totalPaid.toFixed(2)}</strong>
        </div>
        <button onClick={() => setShowAdd(true)} className="ml-auto flex items-center gap-1 text-sm bg-slate-800 text-white px-3 py-1.5 rounded-lg">
          <Plus size={16} /> Add payment
        </button>
      </div>

      {showAdd && (
        <div className="bg-white border rounded-xl p-4 mb-4 space-y-3">
          <h3 className="font-semibold text-sm">New payment (unforeseen / bi-annual / once-off)</h3>
          <div className="grid md:grid-cols-4 gap-3">
            <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Payee" value={newPayee} onChange={(e) => setNewPayee(e.target.value)} />
            <input type="number" step="0.01" className="border rounded-lg px-3 py-2 text-sm" placeholder="Amount" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} />
            <select className="border rounded-lg px-3 py-2 text-sm" value={newFreq} onChange={(e) => setNewFreq(e.target.value as Frequency)}>
              <option value="unforeseen">Unforeseen</option>
              <option value="bi-annual">Bi-annual</option>
              <option value="once-off">Once-off</option>
              <option value="monthly">Monthly</option>
            </select>
            <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Notes" value={newNotes} onChange={(e) => setNewNotes(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <button onClick={addPayment} className="text-sm bg-emerald-600 text-white px-3 py-1.5 rounded-lg">Save</button>
            <button onClick={() => setShowAdd(false)} className="text-sm border px-3 py-1.5 rounded-lg">Cancel</button>
          </div>
        </div>
      )}

      <section className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="px-3 py-2">Payee</th>
              <th className="px-3 py-2">Category</th>
              <th className="px-3 py-2">Frequency</th>
              <th className="px-3 py-2 text-right">Amount</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Notes</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="px-3 py-2 font-medium">{p.payee}</td>
                <td className="px-3 py-2 text-slate-600">{p.category}</td>
                <td className="px-3 py-2"><span className={`text-xs px-2 py-0.5 rounded ${freqBadge(p.frequency)}`}>{p.frequency}</span></td>
                <td className="px-3 py-2 text-right">
                  <input type="number" step="0.01" className="w-24 border rounded px-2 py-1 text-right" value={p.amount || ''} onChange={(e) => updateAmount(p.id, Number(e.target.value))} />
                </td>
                <td className="px-3 py-2">
                  <button onClick={() => togglePaid(p.id)} className={`text-xs px-2 py-1 rounded ${p.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>{p.status}</button>
                </td>
                <td className="px-3 py-2 text-slate-500 text-xs">{p.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {payments.length === 0 && <p className="p-4 text-sm text-slate-400">No payments yet. Click “Add payment” to start.</p>}
      </section>

      <p className="text-xs text-slate-400 mt-4">
        Southdale list is pre-loaded from Karren’s prioritised email. Amounts feed the Monthly Control Report.
      </p>
    </div>
  );
}
