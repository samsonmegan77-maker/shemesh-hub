import { useState } from 'react';
import { useOrg } from '../lib/orgContext';
import { WalletCards, Plus, AlertTriangle } from 'lucide-react';

type ReceiptStatus = 'Attached' | 'Missing' | 'No receipt – prepaid';
type Status = 'pending' | 'approved' | 'paid';

interface Reimbursement {
  id: string;
  date: string;
  requester: string;
  amount: number;
  bankDetails: string;
  receiptStatus: ReceiptStatus;
  noReceiptReason: string;
  status: Status;
  notes: string;
}

export default function Reimbursements() {
  const { canCreateExpenses, canAccessFinance, organisation } = useOrg();

  const [items, setItems] = useState<Reimbursement[]>([]);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    requester: '',
    amount: '',
    bankDetails: '',
    receiptStatus: 'Attached' as ReceiptStatus,
    noReceiptReason: '',
    notes: '',
  });
  const [error, setError] = useState('');

  if (!canCreateExpenses) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold mb-2">Reimbursements</h1>
        <p className="text-red-600">You do not have permission to create reimbursements.</p>
      </div>
    );
  }

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError('');
  }

  function save() {
    if (!form.requester.trim()) {
      setError('Requester name is required.');
      return;
    }
    if (!form.amount || Number(form.amount) === 0) {
      setError('Amount is required.');
      return;
    }
    if (form.receiptStatus === 'No receipt – prepaid' && !form.noReceiptReason.trim()) {
      setError('Please explain the prepaid airtime/WiFi claim.');
      return;
    }

    const newItem: Reimbursement = {
      id: crypto.randomUUID(),
      date: form.date,
      requester: form.requester.trim(),
      amount: Number(form.amount),
      bankDetails: form.bankDetails,
      receiptStatus: form.receiptStatus,
      noReceiptReason: form.noReceiptReason,
      status: 'pending',
      notes: form.notes,
    };

    setItems((prev) => [newItem, ...prev]);
    setForm({
      date: new Date().toISOString().slice(0, 10),
      requester: '',
      amount: '',
      bankDetails: '',
      receiptStatus: 'Attached',
      noReceiptReason: '',
      notes: '',
    });
  }

  function setStatus(id: string, status: Status) {
    if (!canAccessFinance) return;
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
  }

  const statusColour = (s: Status) =>
    s === 'paid'
      ? 'bg-emerald-100 text-emerald-800'
      : s === 'approved'
      ? 'bg-blue-100 text-blue-800'
      : 'bg-amber-100 text-amber-800';

  return (
    <div className="p-4 md:p-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-1">
        <WalletCards className="text-violet-600" size={28} />
        <h1 className="text-2xl font-bold">Reimbursements</h1>
      </div>
      <p className="text-sm text-slate-500 mb-6">
        {organisation?.name} • Includes no-receipt airtime/WiFi claims
      </p>

      {/* Form */}
      <section className="bg-white border rounded-xl p-5 mb-6 space-y-4">
        <h2 className="font-semibold">New reimbursement claim</h2>

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
              Requester <span className="text-red-500">*</span>
            </span>
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={form.requester}
              onChange={(e) => update('requester', e.target.value)}
              placeholder="Who is claiming back"
            />
          </label>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
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
            <span className="text-sm font-medium">Bank details / account</span>
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={form.bankDetails}
              onChange={(e) => update('bankDetails', e.target.value)}
              placeholder="For repayment"
            />
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
                placeholder="e.g. IT person bought prepaid WiFi – no receipt"
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
          <Plus size={16} /> Submit claim
        </button>
      </section>

      {/* List */}
      <section className="bg-white border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b font-semibold">Claims ({items.length})</div>
        {items.length === 0 ? (
          <p className="p-4 text-sm text-slate-400">No reimbursement claims yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left">
                <tr>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Requester</th>
                  <th className="px-3 py-2 text-right">Amount</th>
                  <th className="px-3 py-2">Receipt</th>
                  <th className="px-3 py-2">Status</th>
                  {canAccessFinance && <th className="px-3 py-2">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {items.map((i) => (
                  <tr key={i.id} className="border-t">
                    <td className="px-3 py-2 whitespace-nowrap">{i.date}</td>
                    <td className="px-3 py-2 font-medium">{i.requester}</td>
                    <td className="px-3 py-2 text-right">R {i.amount.toFixed(2)}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          i.receiptStatus === 'Attached'
                            ? 'bg-emerald-100 text-emerald-800'
                            : i.receiptStatus === 'Missing'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {i.receiptStatus}
                      </span>
                      {i.noReceiptReason && (
                        <p className="text-xs text-slate-500 mt-0.5">{i.noReceiptReason}</p>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${statusColour(i.status)}`}>
                        {i.status}
                      </span>
                    </td>
                    {canAccessFinance && (
                      <td className="px-3 py-2 space-x-1">
                        {i.status === 'pending' && (
                          <button
                            onClick={() => setStatus(i.id, 'approved')}
                            className="text-xs bg-blue-600 text-white px-2 py-1 rounded"
                          >
                            Approve
                          </button>
                        )}
                        {i.status === 'approved' && (
                          <button
                            onClick={() => setStatus(i.id, 'paid')}
                            className="text-xs bg-emerald-600 text-white px-2 py-1 rounded"
                          >
                            Mark paid
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="text-xs text-slate-400 mt-4">
        Treasurer/Full Admin can Approve → Mark paid. The "No receipt – prepaid" option covers the
        airtime/WiFi claims that previously had no paper trail.
      </p>
    </div>
  );
}
