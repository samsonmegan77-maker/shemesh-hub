import { useMemo, useState } from 'react';
import { useOrg } from '../lib/orgContext';
import { loadJson, orgKey } from '../lib/localStore';
import { BarChart3 } from 'lucide-react';

export default function ReportsHub() {
  const { organisation, canAccessFinance } = useOrg();
  const orgId = organisation?.id;
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7));

  const expenses = useMemo(() => loadJson<{ amount: number; date?: string }[]>(orgKey(orgId, 'expenses'), []), [orgId]);
  const reimbursements = useMemo(() => loadJson<{ amount: number; date?: string }[]>(orgKey(orgId, 'reimbursements'), []), [orgId]);
  const payments = useMemo(() => loadJson<{ amount: number; status?: string }[]>(orgKey(orgId, 'monthly-payments'), []), [orgId]);
  const petty = useMemo(() => loadJson<{ amount: number; date?: string }[]>(orgKey(orgId, 'petty-cash'), []), [orgId]);
  const payroll = useMemo(() => loadJson<{ netPay?: number; gross?: number; period?: string }[]>(orgKey(orgId, 'payroll'), []), [orgId]);
  const investments = useMemo(() => loadJson<{ amount: number; type: string }[]>(orgKey(orgId, 'investments'), []), [orgId]);
  const budgets = useMemo(() => loadJson<{ amount: number; year: string }[]>(orgKey(orgId, 'budgets'), []), [orgId]);

  const monthExpenses = expenses.filter((e) => !e.date || e.date.startsWith(period)).reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const monthReimb = reimbursements.filter((e) => !e.date || e.date.startsWith(period)).reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const paymentsPlanned = payments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const paymentsPaid = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const pettyTotal = petty.filter((e) => !e.date || e.date.startsWith(period)).reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const payrollNet = payroll.filter((p) => !p.period || String(p.period).startsWith(period)).reduce((s, p) => s + (Number(p.netPay) || Number(p.gross) || 0), 0);
  const invNet = investments.reduce((s, t) => {
    const a = Math.abs(Number(t.amount) || 0);
    if (t.type === 'withdrawal' || t.type === 'transfer_out') return s - a;
    return s + a;
  }, 0);
  const budgetYear = period.slice(0, 4);
  const budgetTotal = budgets.filter((b) => b.year === budgetYear).reduce((s, b) => s + (Number(b.amount) || 0), 0);

  if (!canAccessFinance) {
    return (<div className="p-6"><h1 className="text-xl font-bold mb-2">Reports</h1><p className="text-red-600">Treasurer / Full Admin only.</p></div>);
  }

  const cards = [
    { label: 'Expenses (period)', value: monthExpenses },
    { label: 'Reimbursements (period)', value: monthReimb },
    { label: 'Monthly payments planned', value: paymentsPlanned },
    { label: 'Monthly payments paid', value: paymentsPaid },
    { label: 'Petty cash (period)', value: pettyTotal },
    { label: 'Payroll net (period)', value: payrollNet },
    { label: 'Investments net position', value: invNet },
    { label: `Budget total (${budgetYear})`, value: budgetTotal },
  ];

  return (
    <div className="p-4 md:p-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-1">
        <BarChart3 className="text-blue-600" size={28} />
        <h1 className="text-2xl font-bold">Reports</h1>
      </div>
      <p className="text-sm text-slate-500 mb-6">{organisation?.name} · Totals from data on this device</p>
      <label className="flex items-center gap-2 text-sm mb-6">
        <span className="font-medium">Period</span>
        <input type="month" className="border rounded-lg px-3 py-1.5" value={period} onChange={(e) => setPeriod(e.target.value)} />
      </label>
      <div className="grid md:grid-cols-2 gap-3 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-white border rounded-xl p-4">
            <p className="text-xs text-slate-500">{c.label}</p>
            <p className="text-xl font-semibold">R {c.value.toFixed(2)}</p>
          </div>
        ))}
      </div>
      <section className="bg-white border rounded-xl p-5 space-y-2 text-sm">
        <h2 className="font-semibold">Monthly control notes</h2>
        <p className="text-slate-600">Bank balance: use <strong>Treasurer</strong> (CSV + balance check).</p>
        <p className="text-slate-600">Leave and tax books: <strong>Leave book</strong> and <strong>Tax & fringe book</strong>.</p>
        <p className="text-slate-600">Shared multi-device totals need the database later.</p>
      </section>
    </div>
  );
}
