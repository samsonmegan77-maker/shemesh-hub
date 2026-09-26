import { Building2, HeartHandshake, ShieldCheck, LogOut } from 'lucide-react';

interface HubProps {
  onEnter: (org: 'southdale' | 'bambanani') => void;
  onLogout?: () => void;
  userName?: string;
}

export default function Hub({ onEnter, onLogout, userName }: HubProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white px-4 py-4 flex items-center justify-between max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <HeartHandshake className="text-emerald-600" size={28} />
          <div>
            <h1 className="font-bold text-lg leading-tight">SheMesh Hub</h1>
            <p className="text-xs text-slate-500">One login • Two organisations</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {userName && (
            <span className="text-sm text-slate-600">
              Signed in as <strong>{userName}</strong>
            </span>
          )}
          {onLogout && (
            <button
              onClick={onLogout}
              className="text-xs flex items-center gap-1 text-slate-500 hover:text-red-600"
            >
              <LogOut size={14} /> Log out
            </button>
          )}
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <ShieldCheck size={14} />
            Strict data boundary
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 md:p-8">
        <p className="text-center text-slate-600 mb-8 max-w-xl mx-auto">
          Choose the organisation you want to work in. All financial and operational data stays
          completely separate.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <button
            onClick={() => onEnter('southdale')}
            className="text-left border-2 border-blue-200 bg-white rounded-2xl p-6 hover:border-blue-400 hover:shadow-md transition"
          >
            <div className="flex items-center gap-3 mb-3">
              <Building2 className="text-blue-600" size={28} />
              <h2 className="text-xl font-bold text-blue-900">Southdale Baptist Church</h2>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Sunday Service, Youth, Missions, Music, Departments, Payroll, Finance & Registers.
            </p>
            <ul className="text-xs text-slate-500 space-y-1 mb-4">
              <li>• Payroll (auto PAYE / UIF)</li>
              <li>• Bank statements, CSV import & reconciliation</li>
              <li>• Departments, rosters & registers</li>
              <li>• Missions tracking</li>
            </ul>
            <span className="inline-block bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg">
              Enter Southdale →
            </span>
          </button>

          <button
            onClick={() => onEnter('bambanani')}
            className="text-left border-2 border-emerald-200 bg-white rounded-2xl p-6 hover:border-emerald-400 hover:shadow-md transition"
          >
            <div className="flex items-center gap-3 mb-3">
              <HeartHandshake className="text-emerald-600" size={28} />
              <h2 className="text-xl font-bold text-emerald-900">Bambanani Community Care</h2>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Outreach, Feeding, Stock, Donations, Impact reporting & separate finance.
            </p>
            <ul className="text-xs text-slate-500 space-y-1 mb-4">
              <li>• Dorcas Wardrobe & Pantry</li>
              <li>• Soup Kitchen & Old Age Homes</li>
              <li>• Informal Settlements</li>
              <li>• Donations & Inventory</li>
            </ul>
            <span className="inline-block bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-lg">
              Enter Bambanani →
            </span>
          </button>
        </div>

        <footer className="mt-10 text-center text-xs text-slate-400">
          <p>Karren MacKenzie • Carol Lai • Pastor Michael Ford Ho</p>
          <p className="mt-1">
            SheMesh Tribe LLC • Data boundary enforced by organisation_id + RLS
          </p>
        </footer>
      </main>
    </div>
  );
}
