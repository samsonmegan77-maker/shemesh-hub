import { useState, useEffect, useRef } from 'react';
import { useOrg } from '../lib/orgContext';
import { loadJson, saveJson, orgKey } from '../lib/localStore';
import { parseBankCsv } from '../lib/csvParse';
import { Upload, CheckCircle2, AlertCircle, Plus, Landmark } from 'lucide-react';

type Colour = 'green' | 'blue' | 'amber' | 'red' | 'purple' | 'slate';

interface BankLine {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  colour: Colour;
  notes: string;
  isReconciled: boolean;
}

const COLOURS: { value: Colour; label: string; class: string }[] = [
  { value: 'green', label: 'Income / Donation', class: 'bg-emerald-100 border-emerald-300' },
  { value: 'blue', label: 'Salary / Payroll', class: 'bg-blue-100 border-blue-300' },
  { value: 'amber', label: 'Utilities / Ops', class: 'bg-amber-100 border-amber-300' },
  { value: 'red', label: 'Unclear / No ref', class: 'bg-red-100 border-red-300' },
  { value: 'purple', label: 'Transfer / Investment', class: 'bg-purple-100 border-purple-300' },
  { value: 'slate', label: 'Other', class: 'bg-slate-100 border-slate-300' },
];

const CATEGORIES = [
  'Income',
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
  'Transfer to Investment',
  'Transfer from Investment',
  'Unclear / No reference',
  'Other',
];

export default function Treasurer() {
  const { canAccessFinance, organisation } = useOrg();
  const storageKey = orgKey(organisation?.id, 'treasurer');
  const fileRef = useRef<HTMLInputElement>(null);

  const [openingBalance, setOpeningBalance] = useState('');
  const [closingBalance, setClosingBalance] = useState('');
  const [lines, setLines] = useState<BankLine[]>([]);
  const [csvMsg, setCsvMsg] = useState('');

  useEffect(() => {
    const saved = loadJson<{ opening: string; closing: string; lines: BankLine[] }>(storageKey, {
      opening: '',
      closing: '',
      lines: [],
    });
    setOpeningBalance(saved.opening);
    setClosingBalance(saved.closing);
    setLines(saved.lines.length ? saved.lines : []);
  }, [storageKey]);

  useEffect(() => {
    saveJson(storageKey, { opening: openingBalance, closing: closingBalance, lines });
  }, [openingBalance, closingBalance, lines, storageKey]);

  if (!canAccessFinance) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold mb-2">Treasurer</h1>
        <p className="text-red-600">You do not have permission to access finance tools.</p>
      </div>
    );
  }

  const calculated = lines.reduce((sum, l) => sum + l.amount, 0);
  const opening = Number(openingBalance) || 0;
  const closing = Number(closingBalance) || 0;
  const expectedClosing = opening + calculated;
  const balanced = Math.abs(expectedClosing - closing) < 0.01;

  function updateLine(id: string, field: keyof BankLine, value: string | number | boolean) {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  }

  function addLine() {
    setLines((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        date: new Date().toISOString().slice(0, 10),
        description: '',
        amount: 0,
        category: '',
        colour: 'slate',
        notes: '',
        isReconciled: false,
      },
    ]);
  }

  function colourClass(c: Colour) {
    return COLOURS.find((x) => x.value === c)?.class || 'bg-slate-50';
  }

  function handleCsv(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result || '');
        const parsed = parseBankCsv(text);
        if (parsed.length === 0) {
          setCsvMsg('No rows found. Check the CSV has Date, Description, Amount columns.');
          return;
        }
        const newLines: BankLine[] = parsed.map((p) => ({
          id: crypto.randomUUID(),
          date: p.date,
          description: p.description,
          amount: p.amount,
          category: '',
          colour: (p.amount >= 0 ? 'green' : 'amber') as Colour,
          notes: '',
          isReconciled: false,
        }));
        setLines((prev) => [...newLines, ...prev]);
        setCsvMsg(`Imported ${parsed.length} line(s). Categorise and colour-code them.`);
      } catch {
        setCsvMsg('Could not parse CSV. Try a simple Date,Description,Amount file.');
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl">
      <div className="flex items-center gap-3 mb-1">
        <Landmark className="text-blue-600" size={28} />
        <h1 className="text-2xl font-bold">Treasurer</h1>
      </div>
      <p className="text-sm text-slate-500 mb-6">
        {organisation?.name} • Bank statements • CSV import • Colour coding • Balance check
      </p>

      <section className="bg-white border rounded-xl p-5 mb-6">
        <h2 className="font-semibold mb-4">Monthly Balance Check</h2>
        <div className="grid md:grid-cols-4 gap-4">
          <label className="block">
            <span className="text-sm font-medium">Opening balance</span>
            <input type="number" step="0.01" className="mt-1 w-full border rounded-lg px-3 py-2" value={openingBalance} onChange={(e) => setOpeningBalance(e.target.value)} placeholder="From previous month" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Closing balance (bank)</span>
            <input type="number" step="0.01" className="mt-1 w-full border rounded-lg px-3 py-2" value={closingBalance} onChange={(e) => setClosingBalance(e.target.value)} placeholder="From this month statement" />
          </label>
          <div className="block">
            <span className="text-sm font-medium">Calculated closing</span>
            <div className="mt-1 w-full border rounded-lg px-3 py-2 bg-slate-50 font-medium">R {expectedClosing.toFixed(2)}</div>
          </div>
          <div className="flex items-end">
            {openingBalance && closingBalance ? (
              balanced ? (
                <div className="flex items-center gap-2 text-emerald-700 font-medium"><CheckCircle2 size={20} /> Balanced</div>
              ) : (
                <div className="flex items-center gap-2 text-red-600 font-medium"><AlertCircle size={20} /> Discrepancy of R {Math.abs(expectedClosing - closing).toFixed(2)}</div>
              )
            ) : (
              <span className="text-sm text-slate-400">Enter both balances</span>
            )}
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-2 mb-4">
        {COLOURS.map((c) => (
          <span key={c.value} className={`text-xs px-2 py-1 rounded border ${c.class}`}>{c.label}</span>
        ))}
      </div>

      <section className="bg-white border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between flex-wrap gap-2">
          <h2 className="font-semibold">Bank Statement Lines</h2>
          <div className="flex gap-2">
            <button onClick={addLine} className="flex items-center gap-1 text-sm bg-slate-800 text-white px-3 py-1.5 rounded-lg"><Plus size={16} /> Add line</button>
            <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1 text-sm border px-3 py-1.5 rounded-lg text-slate-700 hover:bg-slate-50"><Upload size={16} /> Upload CSV</button>
            <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCsv(f); e.target.value = ''; }} />
          </div>
        </div>
        {csvMsg && <p className="px-4 py-2 text-sm bg-blue-50 text-blue-800 border-b">{csvMsg}</p>}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="px-3 py-2 font-medium">Date</th>
                <th className="px-3 py-2 font-medium">Description</th>
                <th className="px-3 py-2 font-medium text-right">Amount</th>
                <th className="px-3 py-2 font-medium">Category</th>
                <th className="px-3 py-2 font-medium">Colour</th>
                <th className="px-3 py-2 font-medium">Notes (unclear?)</th>
                <th className="px-3 py-2 font-medium">Done</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line) => (
                <tr key={line.id} className={`border-t ${colourClass(line.colour)}`}>
                  <td className="px-3 py-2"><input type="date" className="bg-transparent border-0 w-32" value={line.date} onChange={(e) => updateLine(line.id, 'date', e.target.value)} /></td>
                  <td className="px-3 py-2"><input className="bg-transparent border-0 w-full min-w-[160px]" value={line.description} onChange={(e) => updateLine(line.id, 'description', e.target.value)} placeholder="Description" /></td>
                  <td className="px-3 py-2 text-right"><input type="number" step="0.01" className="bg-transparent border-0 w-24 text-right" value={line.amount} onChange={(e) => updateLine(line.id, 'amount', Number(e.target.value))} /></td>
                  <td className="px-3 py-2"><select className="bg-transparent border rounded px-1 py-0.5 text-xs" value={line.category} onChange={(e) => updateLine(line.id, 'category', e.target.value)}><option value="">—</option>{CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}</select></td>
                  <td className="px-3 py-2"><select className="bg-transparent border rounded px-1 py-0.5 text-xs" value={line.colour} onChange={(e) => updateLine(line.id, 'colour', e.target.value)}>{COLOURS.map((c) => (<option key={c.value} value={c.value}>{c.label}</option>))}</select></td>
                  <td className="px-3 py-2"><input className="bg-transparent border-0 w-full min-w-[120px] text-xs" value={line.notes} onChange={(e) => updateLine(line.id, 'notes', e.target.value)} placeholder="Unclear payment notes…" /></td>
                  <td className="px-3 py-2 text-center"><input type="checkbox" checked={line.isReconciled} onChange={(e) => updateLine(line.id, 'isReconciled', e.target.checked)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t bg-slate-50 flex justify-between text-sm">
          <span>{lines.length} line(s)</span>
          <span className="font-medium">Net movement: R {calculated.toFixed(2)}</span>
        </div>
      </section>

      <p className="text-xs text-slate-400 mt-4">
        CSV import accepts common bank exports (Date, Description, Amount or Debit/Credit columns).
        Colour highlighting matches the manual process. Opening balance from previous month; closing from current statement.
      </p>
    </div>
  );
}
