import { useState, useEffect, useRef } from 'react';
import { useOrg } from '../lib/orgContext';
import { loadJson, saveJson, orgKey } from '../lib/localStore';
import { FolderOpen, Upload, FileText } from 'lucide-react';

interface Doc {
  id: string;
  name: string;
  entityType: string;
  uploadedAt: string;
  notes: string;
  fileName?: string;
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
  const storageKey = orgKey(organisation?.id, 'documents');
  const fileRef = useRef<HTMLInputElement>(null);

  const [docs, setDocs] = useState<Doc[]>(() => loadJson<Doc[]>(storageKey, []));
  const [name, setName] = useState('');
  const [entityType, setEntityType] = useState('Expense receipt');
  const [notes, setNotes] = useState('');
  const [pickedFile, setPickedFile] = useState('');

  useEffect(() => {
    saveJson(storageKey, docs);
  }, [docs, storageKey]);

  function add() {
    const label = name.trim() || pickedFile;
    if (!label) return;
    setDocs((prev) => [
      {
        id: crypto.randomUUID(),
        name: label,
        entityType,
        uploadedAt: new Date().toISOString().slice(0, 10),
        notes,
        fileName: pickedFile || undefined,
      },
      ...prev,
    ]);
    setName('');
    setNotes('');
    setPickedFile('');
    if (fileRef.current) fileRef.current.value = '';
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl">
      <div className="flex items-center gap-3 mb-1">
        <FolderOpen className="text-slate-700" size={28} />
        <h1 className="text-2xl font-bold">Documents</h1>
      </div>
      <p className="text-sm text-slate-500 mb-6">
        {organisation?.name} · Register receipts & statements · Saved on this device until cloud storage is connected
      </p>

      <section className="bg-white border rounded-xl p-5 mb-6 space-y-3">
        <h2 className="font-semibold text-sm">Register a document</h2>
        <p className="text-xs text-slate-500">
          Choose a file from your phone/computer to record the name. Cloud upload comes later; the register stays here so nothing is lost.
        </p>
        <div className="grid md:grid-cols-2 gap-3">
          <input
            className="border rounded-lg px-3 py-2 text-sm"
            placeholder="Display name (e.g. July bank statement)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <select
            className="border rounded-lg px-3 py-2 text-sm"
            value={entityType}
            onChange={(e) => setEntityType(e.target.value)}
          >
            {ENTITY_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1 border text-sm px-3 py-1.5 rounded-lg"
          >
            <Upload size={14} /> Choose file
          </button>
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) {
                setPickedFile(f.name);
                if (!name.trim()) setName(f.name);
              }
            }}
          />
          {pickedFile && <span className="text-xs text-slate-600">{pickedFile}</span>}
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
                  {d.fileName && ` · file: ${d.fileName}`}
                  {d.notes && ` · ${d.notes}`}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!canAccessFinance && (
        <p className="text-xs text-amber-700 mt-4">
          Some document types may be restricted to Treasurer / Full Admin later.
        </p>
      )}
    </div>
  );
}
