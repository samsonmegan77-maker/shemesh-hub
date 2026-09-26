import { useState, useEffect, useRef } from 'react';
import { calcPayroll } from '../lib/payrollCalc';
import { useOrg } from '../lib/orgContext';
import { loadJson, saveJson, orgKey } from '../lib/localStore';
import { Printer, Plus } from 'lucide-react';

type Status = 'draft' | 'review' | 'approved';

interface PayrollRecord {
  id: string;
  employeeName: string;
  period: string;
  gross: number;
  travel: number;
  bonus: number;
  pension: number;
  housing: number;
  medical: number;
  leaveDue: number;
  totalIncome: number;
  paye: number;
  uif: number;
  net: number;
  status: Status;
  createdAt: string;
}

export default function Payroll() {
  const { canAccessPayroll, organisation } = useOrg();
  const storageKey = orgKey(organisation?.id, 'payroll');
  const printRef = useRef<HTMLDivElement>(null);

  const [records, setRecords] = useState<PayrollRecord[]>(() =>
    loadJson<PayrollRecord[]>(storageKey, [])
  );
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
  const [printRecord, setPrintRecord] = useState<PayrollRecord | null>(null);

  useEffect(() => {
    saveJson(storageKey, records);
  }, [records, storageKey]);

  if (!canAccessPayroll) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold mb-2">Payroll</h1>
        <p className="text-red-600">You do not have permission to access payroll.</p>
        <p className="text-sm text-slate-500 mt-1">
          Only Full Admin and Treasurer can view or edit payroll.
        </p>
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

  function save(status: Status) {
    if (!form.employeeName.trim()) {
      alert('Employee name is required.');
      return;
    }
    const rec: PayrollRecord = {
      id: crypto.randomUUID(),
      employeeName: form.employeeName.trim(),
      period: form.period,
      gross: Number(form.gross) || 0,
      travel: Number(form.travel) || 0,
      bonus: Number(form.bonus) || 0,
      pension: Number(form.pension) || 0,
      housing: Number(form.housing) || 0,
      medical: Number(form.medical) || 0,
      leaveDue: Number(form.leaveDue) || 0,
      totalIncome: result.totalIncome,
      paye: result.paye,
      uif: result.uif,
      net: result.net,
      status,
      createdAt: new Date().toISOString(),
    };
    setRecords((prev) => [rec, ...prev]);
    setForm({
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
  }

  function setStatus(id: string, status: Status) {
    setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  }

  function openPrint(rec: PayrollRecord) {
    setPrintRecord(rec);
    setTimeout(() => window.print(), 100);
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl">
      <h1 className="text-2xl font-bold mb-1 no-print">Payroll</h1>
      <p className="text-sm text-slate-500 mb-6 no-print">
        {organisation?.name} • Auto PAYE & UIF • Draft → Review → Approved • Printable payslip
      </p>

      <div className="bg-white border rounded-xl p-5 space-y-4 no-print mb-8">
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
            <span className="text-right font-bold border-t pt-2 mt-1">
              R {result.net.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={() => save('draft')}
            className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1"
          >
            <Plus size={14} /> Save as Draft
          </button>
          <button
            onClick={() => save('review')}
            className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Save & Review
          </button>
          <button
            onClick={() => save('approved')}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Save & Approve
          </button>
        </div>

        <p className="text-xs text-slate-400 pt-2">
          PAYE uses 2025/26 SARS brackets + primary rebate. UIF is 1% capped at R177.12. Numbers are
          transparent so you can verify against SARS tables.
        </p>
      </div>

      <section className="no-print">
        <h2 className="font-semibold mb-3">Payroll history ({records.length})</h2>
        {records.length === 0 ? (
          <p className="text-sm text-slate-400">No payslips saved yet.</p>
        ) : (
          <ul className="space-y-2">
            {records.map((r) => (
              <li
                key={r.id}
                className="bg-white border rounded-lg px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-sm"
              >
                <div>
                  <p className="font-medium">
                    {r.employeeName} · {r.period.slice(0, 7)}
                  </p>
                  <p className="text-xs text-slate-500">
                    Net R {r.net.toFixed(2)} · PAYE R {r.paye.toFixed(2)} · UIF R {r.uif.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      r.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : r.status === 'review'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {r.status}
                  </span>
                  {r.status === 'draft' && (
                    <button
                      onClick={() => setStatus(r.id, 'review')}
                      className="text-xs text-amber-700"
                    >
                      → Review
                    </button>
                  )}
                  {r.status === 'review' && (
                    <button
                      onClick={() => setStatus(r.id, 'approved')}
                      className="text-xs text-emerald-700"
                    >
                      → Approve
                    </button>
                  )}
                  <button
                    onClick={() => openPrint(r)}
                    className="flex items-center gap-1 text-xs border px-2 py-1 rounded"
                  >
                    <Printer size={12} /> Payslip
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {printRecord && (
        <div ref={printRef} className="printable bg-white p-8 max-w-md mx-auto">
          <div className="text-center border-b pb-4 mb-4">
            <h1 className="text-xl font-bold">{organisation?.name}</h1>
            <p className="text-sm text-slate-600">Payslip</p>
          </div>
          <div className="space-y-1 text-sm mb-4">
            <p>
              <strong>Employee:</strong> {printRecord.employeeName}
            </p>
            <p>
              <strong>Period:</strong> {printRecord.period.slice(0, 7)}
            </p>
            <p>
              <strong>Status:</strong> {printRecord.status}
            </p>
          </div>
          <table className="w-full text-sm mb-4">
            <tbody>
              <tr>
                <td>Gross Salary</td>
                <td className="text-right">R {printRecord.gross.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Travel Allowance</td>
                <td className="text-right">R {printRecord.travel.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Bonus</td>
                <td className="text-right">R {printRecord.bonus.toFixed(2)}</td>
              </tr>
              <tr className="font-medium">
                <td>Total Income</td>
                <td className="text-right">R {printRecord.totalIncome.toFixed(2)}</td>
              </tr>
              <tr>
                <td colSpan={2} className="pt-2 text-slate-500">
                  Deductions
                </td>
              </tr>
              <tr>
                <td>Pension</td>
                <td className="text-right">R {printRecord.pension.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Housing Allowance (fringe)</td>
                <td className="text-right">R {printRecord.housing.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Medical Aid (fringe)</td>
                <td className="text-right">R {printRecord.medical.toFixed(2)}</td>
              </tr>
              <tr>
                <td>PAYE</td>
                <td className="text-right">R {printRecord.paye.toFixed(2)}</td>
              </tr>
              <tr>
                <td>UIF</td>
                <td className="text-right">R {printRecord.uif.toFixed(2)}</td>
              </tr>
              <tr className="font-bold border-t">
                <td className="pt-2">Net Salary</td>
                <td className="text-right pt-2">R {printRecord.net.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Leave days due</td>
                <td className="text-right">{printRecord.leaveDue}</td>
              </tr>
            </tbody>
          </table>
          <p className="text-xs text-slate-400 border-t pt-3">
            Generated by SheMesh Hub · {new Date().toLocaleDateString('en-ZA')} · Tax year 2025/26
            SARS brackets
          </p>
          <button
            onClick={() => setPrintRecord(null)}
            className="no-print mt-4 text-sm text-slate-500"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
