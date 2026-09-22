import { useState } from 'react';
import { useOrg } from '../lib/orgContext';
import { FolderOpen, Upload, FileText } from 'lucide-react';

interface Doc {
  id: string;
  name: string;
  entityType: string;
  uploadedAt: string;
  notes: string;
}

const ENTITY_TYPES = [
  'Expense receipt',
  'Reimbursement proof',
  'Invoice / POP',
  'Bank statement',
  'Minutes of Meeting',
  'Policy / Governance',
  'Payroll / Payslip',
  'Other',
];

export default function Documents() {
  const { organisation, canAccessFinance } = useOrg();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [name, setName] = useState('');
  const [entityType, setEntityType] = useState('Expense receipt');
  const [notes, setNotes] = useState('');

  function add() {
    if (!name.trim()) return;
    setDocs((prev) => [
      {
        id: crypto.randomUUID(),
        name: name.trim(),
        entityType,
        uploadedAt: new Date().toISOString().slice(0, 10),
        notes,
      },
      ...prev,
    ]);
    setName('');
    setNotes('');
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl">
      <div className="flex items-center gap-3 mb-1">
        <FolderOpen className="text-slate-700" size={28} />
        <h1 className="text-2xl font-bold">Documents</h1>
      </div>
      <p className="text-sm text-slate-500 mb-6">
        {organisation?.name} • Private storage path:{" "}
        <code className="text-xs bg-slate-100 px-1 rounded">
          {'{org_id}/{entity_type}/{id}/{filename}'}
        </code>
      </p>

      <section className="bg-white border rounded-xl p-5 mb-6 space-y-3">
        <h2 className="font-semibold text-sm">Register a document</h2>
        <p className="text-xs text-slate-500">
          File upload to Supabase Storage will be wired after the private bucket{" "}
          <strong>organisation-documents</strong> is created (see SETUP.md). For now you can log the
          record so the audit trail is ready.
        </p>
        <div className="grid md:grid-cols-2 gap-3">
          <input
            className="border rounded-lg px-3 py-2 text-sm"
            placeholder="File name (e.g. July-bank-statement.pdf)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <select
            className="border rounded-lg px-3 py-2 text-sm"
            value={entityType}
            onChange={(e) => setEntityType(e.target.value)}
          >
            {ENTITY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <input
          className="border rounded-lg px-3 py-2 text-sm w-full"
          placeholder="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <button
          onClick={add}
          className="flex items-center gap-1 bg-slate-800 text-white text-sm px-3 py-1.5 rounded-lg"
        >
          <Upload size={14} /> Register document
        </button>
      </section>

      {docs.length === 0 ? (
        <p className="text-sm text-slate-400">No documents registered yet.</p>
      ) : (
        <ul className="space-y-2">
          {docs.map((d) => (
            <li key={d.id} className="bg-white border rounded-lg px-4 py-3 flex items-start gap-3">
              <FileText className="text-slate-400 mt-0.5" size={18} />
              <div>
                <p className="font-medium text-sm">{d.name}</p>
                <p className="text-xs text-slate-500">
                  {d.entityType} · {d.uploadedAt}
                  {d.notes && ` · ${d.notes}`}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!canAccessFinance && (
        <p className="text-xs text-amber-700 mt-4">
          Some document types may be restricted to Treasurer / Full Admin once RLS is fully applied.
        </p>
      )}
    </div>
  );
}
