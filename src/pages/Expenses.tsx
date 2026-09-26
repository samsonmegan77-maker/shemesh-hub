import { useState, useEffect } from 'react';
import { useOrg } from '../lib/orgContext';
import { loadJson, saveJson, orgKey } from '../lib/localStore';
import { Receipt, AlertCircle } from 'lucide-react';

interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  purchasedBy: string;
  receiptStatus: 'attached' | 'missing' | 'not_required';
  notes: string;
}

const CATEGORIES = [
  'Groceries / Feeding',
  'Stationery',
  'Fuel / Transport',
  'Repairs / Maintenance',
  'Utilities',
  'Security',
  'Missions',
  'Office / Admin',
  'Other',
];

export default function Expenses() {
  const { canCreateExpenses, organisation, user } = useOrg();
  const storageKey = orgKey(organisation?.id, 'expenses');

  const [expenses, setExpenses] = useState<Expense[]>(() => loadJson<Expense[]>(storageKey, []));
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    description: '',
    amount: '',
    category: 'Other',
    purchasedBy: '',
    receiptStatus: 'attached' as Expense['receiptStatus'],
    notes: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    saveJson(storageKey, expenses);
  }, [expenses, storageKey]);

  if (!canCreateExpenses) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold mb-2">Expenses</h1>
        <p className="text-red-600">You do not have permission to create expenses.</p>
      </div>
    );
  }

  function submit() {
    setError('');
    if (!form.purchasedBy.trim()) {
      setError('Who purchased? is required — this stops lost receipts and unclear card spend.');
      return;
    }
    if (!form.description.trim() || !form.amount) {
      setError('Description and amount are required.');
      return;
    }
    setExpenses((prev) => [
      {
        id: crypto.randomUUID(),
        date: form.date,
        description: form.description.trim(),
        amount: Number(form.amount),
        category: form.category,
        purchasedBy: form.purchasedBy.trim(),
        receiptStatus: form.receiptStatus,
        notes: form.notes,
      },
      ...prev,
    ]);
    setForm({
      date: new Date().toISOString().slice(0, 10),
      description: '',
      amount: '',
      category: 'Other',
      purchasedBy: user?.fullName || '',
      receiptStatus: 'attached',
      notes: '',
    });
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl">
      <div className="flex items-center gap-3 mb-1">
        <Receipt className="text-amber-600" size={28} />
        <h1 className="text-2xl font-bold">Expenses</h1>
      </div>
      <p className="text-sm text-slate-500 mb-6">
        {organisation?.name} · Who purchased is mandatory · Data saved in this browser
      </p>

      <section className="bg-white border rounded-xl p-5 mb-6 space-y-3">
        <h2 className="font-semibold text-sm">Add expense</h2>
        {error && (
          <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}
        <div className="grid md:grid-cols-2 gap-3">
          <label className="block text-sm">
            Date
            <input type="date" className="mt-1 w-full border rounded-lg px-3 py-2" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
          </label>
          <label className="block text-sm">
            Amount (R)
            <input type="number" step="0.01" className="mt-1 w-full border rounded-lg px-3 py-2" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} placeholder="0.00" />
          </label>
        </div>
        <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        <div className="grid md:grid-cols-2 gap-3">
          <select className="border rounded-lg px-3 py-2 text-sm" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
            {CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
          </select>
          <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Who purchased? (required)" value={form.purchasedBy} onChange={(e) => setForm((f) => ({ ...f, purchasedBy: e.target.value }))} />
        </div>
        <select className="border rounded-lg px-3 py-2 text-sm w-full" value={form.receiptStatus} onChange={(e) => setForm((f) => ({ ...f, receiptStatus: e.target.value as Expense['receiptStatus'] }))}>
          <option value="attached">Receipt attached</option>
          <option value="missing">Receipt missing</option>
          <option value="not_required">No receipt required</option>
        </select>
        <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Notes" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
        <button onClick={submit} className="bg-amber-600 text-white text-sm px-4 py-2 rounded-lg font-medium">Save expense</button>
      </section>

      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b font-semibold text-sm">Recent expenses ({expenses.length})</div>
        {expenses.length === 0 ? (
          <p className="p-4 text-sm text-slate-400">No expenses yet.</p>
        ) : (
          <ul className="divide-y">
            {expenses.map((e) => (
              <li key={e.id} className="px-4 py-3 text-sm">
                <p className="font-medium">{e.date} · R {e.amount.toFixed(2)} · {e.category}</p>
                <p className="text-slate-600">{e.description}</p>
                <p className="text-xs text-slate-400">Purchased by: {e.purchasedBy} · Receipt: {e.receiptStatus.replace('_', ' ')}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
