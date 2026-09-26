import { useState, useEffect } from 'react';
import { useOrg } from '../lib/orgContext';
import { loadJson, saveJson, orgKey } from '../lib/localStore';
import { Coins, Plus, Trash2 } from 'lucide-react';

interface PettyLine {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  allocatedBy: string;
  hasSlip: boolean;
  notes: string;
}

const CATEGORIES = [
  'Groceries / Feeding',
  'Stationery',
  'Transport / Fuel',
  'Cleaning',
  'Small repairs',
  'Refreshments',
  'Other',
];

export default function PettyCash() {
  const { canAccessFinance, organisation } = useOrg();
  const storageKey = orgKey(organisation?.id, 'pettycash');

  const [lines, setLines] = useState<PettyLine[]>(() =>
    loadJson<PettyLine[]>(storageKey, [])
  );
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    description: '',
    amount: '',
    category: 'Other',
    allocatedBy: '',
    hasSlip: true,
    notes: '',
  });

  useEffect(() => {
    saveJson(storageKey, lines);
  }, [lines, storageKey]);

  if (!canAccessFinance) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold mb-2">Petty Cash</h1>
        <p className="text-red-600">Restricted to Treasurer and Full Admin.</p>
      </div>
    );
  }

  function add() {
    if (!form.description.trim() || !form.amount) return;
    setLines((prev) => [
      {
        id: crypto.randomUUID(),
        date: form.date,
        description: form.description.trim(),
        amount: Number(form.amount),
        category: form.category,
        allocatedBy: form.allocatedBy.trim(),
        hasSlip: form.hasSlip,
        notes: form.notes,
      },
      ...prev,
    ]);
    setForm({
      date: new Date().toISOString().slice(0, 10),
      description: '',
      amount: '',
      category: 'Other',
      allocatedBy: '',
      hasSlip: true,
      notes: '',
    });
  }

  function remove(id: string) {
    setLines((prev) => prev.filter((l) => l.id !== id));
  }

  const total = lines.reduce((s, l) => s + l.amount, 0);

  return (
    <div className="p-4 md:p-6 max-w-3xl">
      <div className="flex items-center gap-3 mb-1">
        <Coins className="text-teal-600" size={28} />
        <h1 className="text-2xl font-bold">Petty Cash</h1>
      </div>
      <p className="text-sm text-slate-500 mb-6">
        {organisation?.name} · Debit-card only (no physical cash) · Summary + slips for allocation
      </p>

      <section className="bg-white border rounded-xl p-5 mb-6 space-y-3">
        <h2 className="font-semibold text-sm">Add petty cash line</h2>
        <div className="grid md:grid-cols-2 gap-3">
          <label className="block text-sm">
            Date
            <input
              type="date"
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            />
          </label>
          <label className="block text-sm">
            Amount (R)
            <input
              type="number"
              step="0.01"
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              placeholder="0.00"
            />
          </label>
        </div>
        <input
          className="w-full border rounded-lg px-3 py-2 text-sm"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
        <div className="grid md:grid-cols-2 gap-3">
          <select
            className="border rounded-lg px-3 py-2 text-sm"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            className="border rounded-lg px-3 py-2 text-sm"
            placeholder="Allocated / spent by"
            value={form.allocatedBy}
            onChange={(e) => setForm((f) => ({ ...f, allocatedBy: e.target.value }))}
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.hasSlip}
            onChange={(e) => setForm((f) => ({ ...f, hasSlip: e.target.checked }))}
          />
          Cash slip / receipt attached
        </label>
        <input
          className="w-full border rounded-lg px-3 py-2 text-sm"
          placeholder="Notes"
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
        />
        <button
          onClick={add}
          className="flex items-center gap-1 bg-teal-700 text-white text-sm px-3 py-1.5 rounded-lg"
        >
          <Plus size={14} /> Add line
        </button>
      </section>

      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b flex justify-between items-center">
          <h2 className="font-semibold text-sm">Summary</h2>
          <span className="font-medium">
            Total: R {total.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
          </span>
        </div>
        {lines.length === 0 ? (
          <p className="p-4 text-sm text-slate-400">No petty cash lines yet.</p>
        ) : (
          <ul className="divide-y">
            {lines.map((l) => (
              <li key={l.id} className="px-4 py-3 flex items-start justify-between gap-2 text-sm">
                <div>
                  <p className="font-medium">
                    {l.date} · R {l.amount.toFixed(2)} · {l.category}
                  </p>
                  <p className="text-slate-600">{l.description}</p>
                  <p className="text-xs text-slate-400">
                    By: {l.allocatedBy || '—'} · Slip: {l.hasSlip ? 'Yes' : 'No'}
                    {l.notes && ` · ${l.notes}`}
                  </p>
                </div>
                <button
                  onClick={() => remove(l.id)}
                  className="text-slate-400 hover:text-red-600"
                  title="Remove"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-xs text-slate-400 mt-4">
        Matches Karren's process: summary written for allocation, handed in with slips. Petty cash
        is paid via debit card only.
      </p>
    </div>
  );
}
