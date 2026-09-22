import { useState } from 'react';
import { useOrg } from '../lib/orgContext';
import { ReceiptText, Plus, AlertTriangle } from 'lucide-react';

type ReceiptStatus = 'Attached' | 'Missing' | 'No receipt – prepaid';

interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  purchaser: string;          // REQUIRED
  category: string;
  allocation: string;
  receiptStatus: ReceiptStatus;
  noReceiptReason: string;
  notes: string;
}

const CATEGORIES = [
  'Water and Lights',
  'Wifi',
  'Telkom',
  'Sunday Security - Carguard',
  'SA Rangers Security',
  'Insurance',
  'General Maintenance',
  'Fuel',
  'Baptist Union',
  'Theological College',
  'Moller Family',
  'Pieter Loots',
  'POP Thailand',
  'Salary',
  'Repairs and Maintenance',
  'Bank Charges',
  'Groceries / Feeding',
  'Stationery',
  'Other',
];

const ALLOCATIONS = ['Southdale', 'Bambanani', 'Shared'];

export default function Expenses() {
  const { canCreateExpenses, organisation } = useOrg();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    description: '',
    amount: '',
    purchaser: '',
    category: '',
    allocation: organisation?.short_code === 'bambanani' ? 'Bambanani' : 'Southdale',
    receiptStatus: 'Attached' as ReceiptStatus,
    noReceiptReason: '',
    notes: '',
  });
  const [error, setError] = useState('');

  if (!canCreateExpenses) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold mb-2">Expenses</h1>
        <p className="text-red-600">You do not have permission to create expenses.</p>
      </div>
    );
  }

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError('');
  }

  function save() {
    if (!form.purchaser.trim()) {
      setError('"Who purchased?" is required. This stops the lost-receipt problem.');
      return;
    }
    if (!form.description.trim()) {
      setError('Description is required.');
      return;
    }
    if (!form.amount || Number(form.amount) === 0) {
      setError('Amount is required.');
      return;
    }
    if (form.receiptStatus === 'No receipt – prepaid' && !form.noReceiptReason.trim()) {
      setError('Please explain why there is no receipt (e.g. prepaid airtime/WiFi).');
      return;
    }

    const newExpense: Expense = {
      id: crypto.randomUUID(),
      date: form.date,
      description: form.description,
      amount: Number(form.amount),
      purchaser: form.purchaser.trim(),
      category: form.category,
      allocation: form.allocation,
      receiptStatus: form.receiptStatus,
      noReceiptReason: form.noReceiptReason,
      notes: form.notes,
    };

    setExpenses((prev) => [newExpense, ...prev]);
    setForm({
      date: new Date().toISOString().slice(0, 10),
      description: '',
      amount: '',
      purchaser: '',
      category: '',
      allocation: organisation?.short_code === 'bambanani' ? 'Bambanani' : 'Southdale',
      receiptStatus: 'Attached',
      noReceiptReason: '',
      notes: '',
    });
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-1">
        <ReceiptText className="text-amber-600" size={28} />
        <h1 className="text-2xl font-bold">Expenses & Receipts</h1>
      </div>
      <p className="text-sm text-slate-500 mb-6">
        {organisation?.name} • "Who purchased?" is always required
      </p>

      {/* Form */}
      <section className="bg-white border rounded-xl p-5 mb-6 space-y-4">
        <h2 className="font-semibold">New expense</h2>

        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium">Date</span>
            <input
              type="date"
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={form.date}
              onChange={(e) => update('date', e.target.value)}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">
              Who purchased? <span className="text-red-500">*</span>
            </span>
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={form.purchaser}
              onChange={(e) => update('purchaser', e.target.value)}
              placeholder="e.g. Pastor Mike, Carol, volunteer name"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium">Description</span>
          <input
            className="mt-1 w-full border rounded-lg px-3 py-2"
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            placeholder="What was bought"
          />
        </label>

        <div className="grid md:grid-cols-3 gap-4">
          <label className="block">
            <span className="text-sm font-medium">Amount (R)</span>
            <input
              type="number"
              step="0.01"
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={form.amount}
              onChange={(e) => update('amount', e.target.value)}
              placeholder="0.00"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Category</span>
            <select
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={form.category}
              onChange={(e) => update('category', e.target.value)}
            >
              <option value="">—</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium">Allocation</span>
            <select
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={form.allocation}
              onChange={(e) => update('allocation', e.target.value)}
            >
              {ALLOCATIONS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium">Receipt status</span>
            <select
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={form.receiptStatus}
              onChange={(e) => update('receiptStatus', e.target.value)}
            >
              <option value="Attached">Attached</option>
              <option value="Missing">Missing</option>
              <option value="No receipt – prepaid">No receipt – prepaid (airtime/WiFi)</option>
            </select>
          </label>

          {form.receiptStatus === 'No receipt – prepaid' && (
            <label className="block">
              <span className="text-sm font-medium">
                Explanation <span className="text-red-500">*</span>
              </span>
              <input
                className="mt-1 w-full border rounded-lg px-3 py-2"
                value={form.noReceiptReason}
                onChange={(e) => update('noReceiptReason', e.target.value)}
                placeholder="e.g. Prepaid airtime for church WiFi – no slip issued"
              />
            </label>
          )}
        </div>

        <label className="block">
          <span className="text-sm font-medium">Notes</span>
          <input
            className="mt-1 w-full border rounded-lg px-3 py-2"
            value={form.notes}
            onChange={(e) => update('notes', e.target.value)}
            placeholder="Optional"
          />
        </label>

        <button
          onClick={save}
          className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          <Plus size={16} /> Save expense
        </button>
      </section>

      {/* List */}
      <section className="bg-white border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b font-semibold">
          Recent expenses ({expenses.length})
        </div>
        {expenses.length === 0 ? (
          <p className="p-4 text-sm text-slate-400">No expenses recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left">
                <tr>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Who purchased</th>
                  <th className="px-3 py-2">Description</th>
                  <th className="px-3 py-2 text-right">Amount</th>
                  <th className="px-3 py-2">Receipt</th>
                  <th className="px-3 py-2">Allocation</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((e) => (
                  <tr key={e.id} className="border-t">
                    <td className="px-3 py-2 whitespace-nowrap">{e.date}</td>
                    <td className="px-3 py-2 font-medium">{e.purchaser}</td>
                    <td className="px-3 py-2">{e.description}</td>
                    <td className="px-3 py-2 text-right">R {e.amount.toFixed(2)}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          e.receiptStatus === 'Attached'
                            ? 'bg-emerald-100 text-emerald-800'
                            : e.receiptStatus === 'Missing'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {e.receiptStatus}
                      </span>
                      {e.noReceiptReason && (
                        <p className="text-xs text-slate-500 mt-0.5">{e.noReceiptReason}</p>
                      )}
                    </td>
                    <td className="px-3 py-2">{e.allocation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="text-xs text-slate-400 mt-4">
        The "Who purchased?" field is mandatory so Pastor Mike and anyone else who shops is always recorded.
        Use "No receipt – prepaid" for airtime/WiFi claims that have no slip.
      </p>
    </div>
  );
}
