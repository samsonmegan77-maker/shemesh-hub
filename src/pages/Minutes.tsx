import { useState, useEffect } from 'react';
import { useOrg } from '../lib/orgContext';
import { loadJson, saveJson, orgKey } from '../lib/localStore';
import { ClipboardList, Plus, Printer } from 'lucide-react';

interface Minute {
  id: string;
  date: string;
  title: string;
  attendees: string;
  ministryActivity: string;
  actionItems: string;
  financialNotes: string;
  status: 'draft' | 'final';
}

export default function Minutes() {
  const { organisation, canAccessFinance } = useOrg();
  const storageKey = orgKey(organisation?.id, 'minutes');

  const [items, setItems] = useState<Minute[]>(() => loadJson<Minute[]>(storageKey, []));
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    title: 'Monthly Deacons / Committee Meeting',
    attendees: '',
    ministryActivity: '',
    actionItems: '',
    financialNotes: '',
  });

  useEffect(() => {
    saveJson(storageKey, items);
  }, [items, storageKey]);

  function save(status: 'draft' | 'final') {
    if (!form.title.trim()) return;
    setItems((prev) => [
      {
        id: crypto.randomUUID(),
        ...form,
        status,
      },
      ...prev,
    ]);
    setForm({
      date: new Date().toISOString().slice(0, 10),
      title: 'Monthly Deacons / Committee Meeting',
      attendees: '',
      ministryActivity: '',
      actionItems: '',
      financialNotes: '',
    });
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl">
      <div className="flex items-center gap-3 mb-1">
        <ClipboardList className="text-indigo-600" size={28} />
        <h1 className="text-2xl font-bold">Minutes of Meeting</h1>
      </div>
      <p className="text-sm text-slate-500 mb-6">
        {organisation?.name} · Activity per ministry + action items + financials · Saved on this device
      </p>

      <section className="bg-white border rounded-xl p-5 mb-6 space-y-3 no-print">
        <h2 className="font-semibold text-sm">New minutes</h2>
        <div className="grid md:grid-cols-2 gap-3">
          <input type="date" className="border rounded-lg px-3 py-2 text-sm" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Meeting title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <textarea className="border rounded-lg px-3 py-2 text-sm w-full" rows={2} placeholder="Attendees" value={form.attendees} onChange={(e) => setForm({ ...form, attendees: e.target.value })} />
        <textarea className="border rounded-lg px-3 py-2 text-sm w-full" rows={3} placeholder="Ministry / department activity summary" value={form.ministryActivity} onChange={(e) => setForm({ ...form, ministryActivity: e.target.value })} />
        <textarea className="border rounded-lg px-3 py-2 text-sm w-full" rows={3} placeholder="Action items" value={form.actionItems} onChange={(e) => setForm({ ...form, actionItems: e.target.value })} />
        <textarea className="border rounded-lg px-3 py-2 text-sm w-full" rows={2} placeholder="Financial notes (link to Control Report figures)" value={form.financialNotes} onChange={(e) => setForm({ ...form, financialNotes: e.target.value })} />
        <div className="flex gap-2">
          <button onClick={() => save('draft')} className="flex items-center gap-1 border text-sm px-3 py-1.5 rounded-lg">
            <Plus size={14} /> Save draft
          </button>
          <button onClick={() => save('final')} className="flex items-center gap-1 bg-indigo-600 text-white text-sm px-3 py-1.5 rounded-lg">
            Finalise
          </button>
        </div>
      </section>

      {items.length === 0 ? (
        <p className="text-sm text-slate-400">No minutes yet. This is the Governance workflow Karren liked in the pilot.</p>
      ) : (
        <div className="space-y-4">
          {items.map((m) => (
            <article key={m.id} className="bg-white border rounded-xl p-5 printable">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold">{m.title}</h3>
                  <p className="text-sm text-slate-500">{organisation?.name} · {m.date}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded ${m.status === 'final' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>{m.status}</span>
              </div>
              {m.attendees && (<div className="mb-2"><p className="text-xs font-medium text-slate-500">Attendees</p><p className="text-sm whitespace-pre-wrap">{m.attendees}</p></div>)}
              {m.ministryActivity && (<div className="mb-2"><p className="text-xs font-medium text-slate-500">Ministry activity</p><p className="text-sm whitespace-pre-wrap">{m.ministryActivity}</p></div>)}
              {m.actionItems && (<div className="mb-2"><p className="text-xs font-medium text-slate-500">Action items</p><p className="text-sm whitespace-pre-wrap">{m.actionItems}</p></div>)}
              {m.financialNotes && (<div className="mb-2"><p className="text-xs font-medium text-slate-500">Financial notes</p><p className="text-sm whitespace-pre-wrap">{m.financialNotes}</p></div>)}
              <button onClick={() => window.print()} className="no-print mt-2 flex items-center gap-1 text-xs border px-2 py-1 rounded">
                <Printer size={12} /> Print
              </button>
            </article>
          ))}
        </div>
      )}

      {canAccessFinance && (
        <p className="text-xs text-slate-400 mt-4">Data is saved in this browser. Shared multi-device minutes come with the database later.</p>
      )}
    </div>
  );
}
