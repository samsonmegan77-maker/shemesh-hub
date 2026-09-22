import { useState } from 'react';
import { useOrg } from '../lib/orgContext';
import { FileText, Printer } from 'lucide-react';

export default function Reports() {
  const { canAccessFinance, organisation } = useOrg();

  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7));

  // Demo figures — replace with real aggregates from money_movements later
  const [figures, setFigures] = useState({
    openingCurrent: 48500,
    openingInvestment: 120000,
    totalIncome: 18500,
    totalOperatingExpenses: 22340,
    transferToInvestment: 0,
    transferFromInvestment: 5000,
    assetPurchases: 0,
    uncleared: 350,
  });

  if (!canAccessFinance) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold mb-2">Reports</h1>
        <p className="text-red-600">You do not have permission to view financial reports.</p>
      </div>
    );
  }

  const openingCombined = figures.openingCurrent + figures.openingInvestment;
  const surplusDeficit = figures.totalIncome - figures.totalOperatingExpenses;
  const closingCurrent =
    figures.openingCurrent +
    figures.totalIncome -
    figures.totalOperatingExpenses -
    figures.transferToInvestment +
    figures.transferFromInvestment -
    figures.assetPurchases;
  const closingInvestment =
    figures.openingInvestment + figures.transferToInvestment - figures.transferFromInvestment;
  const closingCombined = closingCurrent + closingInvestment;

  function update(field: keyof typeof figures, value: string) {
    setFigures((prev) => ({ ...prev, [field]: Number(value) || 0 }));
  }

  function printReport() {
    window.print();
  }

  const row = (label: string, value: number, bold = false, colour?: string) => (
    <div className={`flex justify-between py-1.5 ${bold ? 'font-bold border-t mt-1 pt-2' : ''}`}>
      <span>{label}</span>
      <span className={colour || ''}>
        R {value.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
    </div>
  );

  return (
    <div className="p-4 md:p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-1 no-print">
        <div className="flex items-center gap-3">
          <FileText className="text-slate-700" size={28} />
          <h1 className="text-2xl font-bold">Monthly Control Report</h1>
        </div>
        <button
          onClick={printReport}
          className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg text-sm"
        >
          <Printer size={16} /> Print
        </button>
      </div>
      <p className="text-sm text-slate-500 mb-6 no-print">
        {organisation?.name} • Printable executive summary for Carol & Karren
      </p>

      <div className="no-print mb-4">
        <label className="text-sm font-medium mr-2">Period</label>
        <input
          type="month"
          className="border rounded-lg px-3 py-1.5 text-sm"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        />
      </div>

      {/* Editable inputs for demo / until live data */}
      <details className="no-print mb-4 bg-slate-50 border rounded-lg p-3 text-sm">
        <summary className="cursor-pointer font-medium">Adjust figures (demo / until live data)</summary>
        <div className="grid grid-cols-2 gap-2 mt-3">
          {(
            [
              ['openingCurrent', 'Opening Current'],
              ['openingInvestment', 'Opening Investment'],
              ['totalIncome', 'Total Income'],
              ['totalOperatingExpenses', 'Operating Expenses'],
              ['transferToInvestment', 'Transfer Current→Investment'],
              ['transferFromInvestment', 'Transfer Investment→Current'],
              ['assetPurchases', 'Asset / Bus Purchases'],
              ['uncleared', 'Uncleared items'],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block">
              <span className="text-xs text-slate-500">{label}</span>
              <input
                type="number"
                step="0.01"
                className="w-full border rounded px-2 py-1"
                value={figures[key]}
                onChange={(e) => update(key, e.target.value)}
              />
            </label>
          ))}
        </div>
      </details>

      {/* Printable report */}
      <article className="bg-white border rounded-xl p-6 printable">
        <header className="border-b pb-4 mb-4">
          <h2 className="text-lg font-bold">{organisation?.name}</h2>
          <p className="text-sm text-slate-600">Monthly Financial Control Report</p>
          <p className="text-sm text-slate-500">Period: {period}</p>
        </header>

        <section className="space-y-0.5 text-sm">
          {row('Opening Balance — Current', figures.openingCurrent)}
          {row('Opening Balance — Investment', figures.openingInvestment)}
          {row('Opening Combined Cash', openingCombined, true)}

          <div className="h-3" />

          {row('+ Total Income', figures.totalIncome, false, 'text-emerald-700')}
          {row('− Total Operating Expenses', figures.totalOperatingExpenses, false, 'text-red-700')}
          {row(
            '= Surplus / (Deficit)',
            surplusDeficit,
            true,
            surplusDeficit >= 0 ? 'text-emerald-700' : 'text-red-700'
          )}

          <div className="h-3" />

          {row('− Transfers Current → Investment', figures.transferToInvestment)}
          {row('+ Transfers Investment → Current', figures.transferFromInvestment)}
          {row('− Asset / Bus Purchases', figures.assetPurchases)}

          <div className="h-3" />

          {row('Closing Balance — Current', closingCurrent)}
          {row('Closing Balance — Investment', closingInvestment)}
          {row('Closing Combined Cash', closingCombined, true)}

          <div className="h-3" />

          {row('+ Uncleared Items', figures.uncleared, false, 'text-amber-700')}
        </section>

        <footer className="mt-6 pt-4 border-t text-xs text-slate-400">
          <p>
            Classification rule: Transfers and asset/bus purchases do not inflate operating expenses.
          </p>
          <p className="mt-1">
            Generated for {organisation?.name} • SheMesh Hub • {new Date().toLocaleDateString('en-ZA')}
          </p>
        </footer>
      </article>

      <p className="text-xs text-slate-400 mt-4 no-print">
        This matches the control calculation from your Requirements Register v0.2. When live data is
        connected, figures will pull automatically from money_movements.
      </p>
    </div>
  );
}
