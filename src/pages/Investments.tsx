import { useState, useEffect } from 'react';
import { useOrg } from '../lib/orgContext';
import { loadJson, saveJson, orgKey } from '../lib/localStore';
import { TrendingUp, Plus } from 'lucide-react';

type TxType = 'deposit' | 'withdrawal' | 'interest' | 'transfer_in' | 'transfer_out';

interface InvestmentTx {
  id: string;
  date: string;
  account: string;
  type: TxType;
  amount: number;
  notes: string;
}

const ACCOUNTS = ['Church investment account', 'Fixed deposit', 'Money market', 'Other'];

export default function Investments() {
  const { organisation, canAccessFinance } = useOrg();
  const storageKey = orgKey(organisation?.id, 'investments');
  const [txs, setTxs] = useState<InvestmentTx[]>(() => loadJson(storageKey, []));
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    account: ACCOUNTS[0],
    type: 'deposit' as TxType,
    amount: '',
    notes: '',
  });

  useEffect(() => { saveJson(storageKey, txs); }, [txs, storageKey]);

  if (!canAccessFinance) {
    return (<div className="p-6"><h1 className="text-xl font-bold mb-2">Investments</h1><p className="text-red-600">Treasurer / Full Admin only.</p></div>);
  }

  function add() {
    const amount = Number(form.amount);
    if (!amount) return;
    setTxs((prev) => [{
      id: crypto.randomUUID(), date: form.date, account: form.account,
      type: form.type, amount, notes: form.notes,
    }, ...prev]);
    setForm((f) => ({ ...f, amount: '', notes: '' }));
  }

  function signed(t: InvestmentTx) {
    if (t.type === 'withdrawal' || t.type === 'transfer_out') return -Math.abs(t.amount);
    return Math.abs(t.amount);
  }

  const byAccount = ACCOUNTS.map((name) => {
    const list = txs.filter((t) => t.account === name);
    return { name, balance: list.reduce((s, t) => s + signed(t), 0), count: list.length };
  }).filter((a) => a.count > 0);
  const total = txs.reduce((s, t) => s + signed(t), 0);

  return (
    <div className="p-4 md:p-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-1">
        <TrendingUp className="text-emerald-600" size={28} />
        <h1 className="text-2xl font-bold">Investments</h1>
      </div>
      <p className="text-sm text-slate-500 mb-6">{organisation?.name} · Deposits, withdrawals, interest & transfers</p>
      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-6">
        <p className="text-xs text-emerald-800">Net investment position (this device)</p>
        <p className="text-2xl font-bold text-emerald-900">R {total.toFixed(2)}</p>
      </div>
      <section className="bg-white border rounded-xl p-5 mb-6 space-y-3">
        <h2 className="font-semibold text-sm">Record movement</h2>
        <div className="grid md:grid-cols-2 gap-3">
          <input type="date" className="border rounded-lg px-3 py-2 text-sm" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
          <select className="border rounded-lg px-3 py-2 text-sm" value={form.account} onChange={(e) => setForm((f) => ({ ...f, account: e.target.value }))}>
            {ACCOUNTS.map((a) => (<option key={a} value={a}>{a}</option>))}
          </select>
          <select className="border rounded-lg px-3 py-2 text-sm" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as TxType }))}>
            <option value="deposit">Deposit</option>
            <option value="withdrawal">Withdrawal</option>
            <option value="interest">Interest earned</option>
            <option value="transfer_in">Transfer in (from operating)</option>
            <option value="transfer_out">Transfer out (to operating)</option>
          </select>
          <input type="number" step="0.01" className="border rounded-lg px-3 py-2 text-sm" placeholder="Amount (R)" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} />
          <input className="border rounded-lg px-3 py-2 text-sm md:col-span-2" placeholder="Notes / reference" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
        </div>
        <button onClick={add} className="flex items-center gap-1 bg-slate-800 text-white text-sm px-3 py-1.5 rounded-lg"><Plus size={14} /> Save</button>
      </section>
      {byAccount.length > 0 && (
        <div className="grid md:grid-cols-2 gap-3 mb-6">
          {byAccount.map((a) => (
            <div key={a.name} className="bg-white border rounded-xl p-4">
              <p className="text-sm text-slate-500">{a.name}</p>
              <p className="text-lg font-semibold">R {a.balance.toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}
      <section className="bg-white border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b font-semibold text-sm">History ({txs.length})</div>
        {txs.length === 0 ? (<p className="p-4 text-sm text-slate-400">No investment movements yet.</p>) : (
          <ul className="divide-y text-sm">
            {txs.map((t) => (
              <li key={t.id} className="px-4 py-3 flex justify-between gap-2">
                <span><span className="text-slate-500">{t.date}</span> · {t.account} · {t.type}{t.notes ? ` · ${t.notes}` : ''}</span>
                <span className={signed(t) < 0 ? 'text-red-600 font-medium' : 'text-emerald-700 font-medium'}>R {signed(t).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
