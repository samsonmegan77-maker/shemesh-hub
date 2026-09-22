import { useState } from 'react';
import { calcPayroll } from '../lib/payrollCalc';
import { useOrg } from '../lib/orgContext';

export default function Payroll() {
  const { canAccessPayroll, organisation } = useOrg();
  const [form, setForm] = useState({
    employeeName: '',
    period: new Date().toISOString().slice(0, 7) + '-01',
    gross: '',
    travel: '',
    bonus: '',
    pension: '',
    housing: '',
    medical: '',
    leaveDue: '',
  });

  if (!canAccessPayroll) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold mb-2">Payroll</h1>
        <p className="text-red-600">You do not have permission to access payroll.</p>
        <p className="text-sm text-slate-500 mt-1">Only Full Admin and Treasurer can view or edit payroll.</p>
      </div>
    );
  }

  const result = calcPayroll({
    gross: Number(form.gross),
    travelAllowance: Number(form.travel),
    bonus: Number(form.bonus),
    pension: Number(form.pension),
    housingAllowance: Number(form.housing),
    medicalAid: Number(form.medical),
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl">
      <h1 className="text-2xl font-bold mb-1">Payroll</h1>
      <p className="text-sm text-slate-500 mb-6">
        {organisation?.name} • Auto PAYE & UIF • Draft → Review → Approved
      </p>

      <div className="bg-white border rounded-xl p-5 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium">Employee name</span>
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={form.employeeName}
              onChange={(e) => update('employeeName', e.target.value)}
              placeholder="Full name"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Period (month)</span>
            <input
              type="month"
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={form.period.slice(0, 7)}
              onChange={(e) => update('period', e.target.value + '-01')}
            />
          </label>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {(
            [
              ['gross', 'Gross Salary'],
              ['travel', 'Travel Allowance'],
              ['bonus', 'Bonus'],
              ['pension', 'Pension'],
              ['housing', 'Housing Allowance (fringe)'],
              ['medical', 'Medical Aid (fringe)'],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block">
              <span className="text-sm font-medium">{label}</span>
              <input
                type="number"
                step="0.01"
                className="mt-1 w-full border rounded-lg px-3 py-2"
                value={form[key]}
                onChange={(e) => update(key, e.target.value)}
                placeholder="0.00"
              />
            </label>
          ))}
        </div>

        <label className="block max-w-xs">
          <span className="text-sm font-medium">Leave days due</span>
          <input
            type="number"
            step="0.5"
            className="mt-1 w-full border rounded-lg px-3 py-2"
            value={form.leaveDue}
            onChange={(e) => update('leaveDue', e.target.value)}
          />
        </label>

        {/* Live calculation */}
        <div className="bg-slate-50 border rounded-xl p-4 mt-4">
          <h3 className="font-semibold mb-3">Calculated (live)</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span>Total Income</span>
            <span className="text-right font-medium">R {result.totalIncome.toFixed(2)}</span>
            <span>Deductions before tax</span>
            <span className="text-right">R {result.totalDeductionsBeforeTax.toFixed(2)}</span>
            <span>Taxable</span>
            <span className="text-right">R {result.taxable.toFixed(2)}</span>
            <span className="text-blue-700">PAYE (auto)</span>
            <span className="text-right font-medium text-blue-700">R {result.paye.toFixed(2)}</span>
            <span className="text-blue-700">UIF (auto)</span>
            <span className="text-right font-medium text-blue-700">R {result.uif.toFixed(2)}</span>
            <span className="font-bold border-t pt-2 mt-1">Net Salary</span>
            <span className="text-right font-bold border-t pt-2 mt-1">R {result.net.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium">
            Save as Draft
          </button>
          <button className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
            Move to Review
          </button>
          <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
            Approve
          </button>
          <button className="border px-4 py-2 rounded-lg text-sm">
            Print Payslip
          </button>
        </div>

        <p className="text-xs text-slate-400 pt-2">
          PAYE uses 2025/26 SARS brackets + primary rebate. UIF is 1% capped at R177.12.
          Numbers are transparent so you can verify against SARS tables.
        </p>
      </div>
    </div>
  );
}
