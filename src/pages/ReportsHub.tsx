import { useState } from 'react';
import { useOrg } from '../lib/orgContext';
import { FileText, Printer } from 'lucide-react';
import Reports from './Reports';

type ReportId =
  | 'control'
  | 'donations'
  | 'expenses'
  | 'income'
  | 'investment'
  | 'ytd'
  | 'attendance';

const REPORT_LIST: { id: ReportId; title: string; blurb: string }[] = [
  { id: 'control', title: 'Monthly Control Report', blurb: 'Opening → Income → Expenses → Transfers → Closing' },
  { id: 'donations', title: 'Donations Report', blurb: 'Incoming and outgoing donations / sponsorships' },
  { id: 'expenses', title: 'Expense Report', blurb: 'All operating expenses by category' },
  { id: 'income', title: 'Income Report', blurb: 'Offerings, donations, other income' },
  { id: 'investment', title: 'Investment Report', blurb: 'Balance, interest, transfers in/out' },
  { id: 'ytd', title: 'Year-to-Date Report', blurb: 'Cumulative income, expenses, surplus' },
  { id: 'attendance', title: 'Attendance Report', blurb: 'Pulls from department registers & programmes' },
];

export default function ReportsHub() {
  const { canAccessFinance, organisation } = useOrg();
  const [active, setActive] = useState<ReportId | null>(null);
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7));

  if (!canAccessFinance) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold mb-2">Reports</h1>
        <p className="text-red-600">Finance reports are restricted to Treasurer and Full Admin.</p>
      </div>
    );
  }

  if (active === 'control') {
    return (
      <div>
        <button
          onClick={() => setActive(null)}
          className="m-4 text-sm text-slate-500 hover:text-slate-800 no-print"
        >
          ← All reports
        </button>
        <Reports />
      </div>
    );
  }

  if (active) {
    const meta = REPORT_LIST.find((r) => r.id === active)!;
    return (
      <div className="p-4 md:p-6 max-w-2xl">
        <button
          onClick={() => setActive(null)}
          className="text-sm text-slate-500 hover:text-slate-800 mb-4 no-print"
        >
          ← All reports
        </button>
        <div className="flex items-center justify-between mb-4 no-print">
          <div>
            <h1 className="text-2xl font-bold">{meta.title}</h1>
            <p className="text-sm text-slate-500">{organisation?.name}</p>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg text-sm"
          >
            <Printer size={16} /> Print
          </button>
        </div>
        <label className="text-sm no-print mr-2">Period</label>
        <input
          type="month"
          className="border rounded-lg px-3 py-1.5 text-sm mb-4 no-print"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        />

        <article className="bg-white border rounded-xl p-6 printable">
          <h2 className="text-lg font-bold">{meta.title}</h2>
          <p className="text-sm text-slate-500 mb-4">
            {organisation?.name} · {period}
          </p>
          <p className="text-sm text-slate-600 mb-4">{meta.blurb}</p>
          <div className="border border-dashed rounded-lg p-6 text-center text-sm text-slate-400">
            Live figures will appear here once money_movements, donations, registers and programmes
            are connected to Supabase.
            <br />
            <span className="text-xs">Placeholder keeps the print layout ready for Carol & Karren.</span>
          </div>
          <footer className="mt-6 pt-4 border-t text-xs text-slate-400">
            SheMesh Hub · {new Date().toLocaleDateString('en-ZA')}
          </footer>
        </article>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl">
      <div className="flex items-center gap-3 mb-1">
        <FileText className="text-slate-700" size={28} />
        <h1 className="text-2xl font-bold">Reports</h1>
      </div>
      <p className="text-sm text-slate-500 mb-6">
        {organisation?.name} • Print-friendly suite for Deacons, funders and internal control
      </p>

      <div className="grid md:grid-cols-2 gap-3">
        {REPORT_LIST.map((r) => (
          <button
            key={r.id}
            onClick={() => setActive(r.id)}
            className="text-left bg-white border rounded-xl p-4 hover:border-slate-400"
          >
            <h3 className="font-semibold">{r.title}</h3>
            <p className="text-sm text-slate-500 mt-1">{r.blurb}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
