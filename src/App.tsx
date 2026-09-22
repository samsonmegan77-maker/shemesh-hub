import { useState, useMemo } from 'react';
import Hub from './pages/Hub';
import Payroll from './pages/Payroll';
import Treasurer from './pages/Treasurer';
import { OrgContext, derivePermissions, type Organisation, type OrgRole } from './lib/orgContext';

// Temporary mock organisations (replace with real Supabase query later)
const ORGS: Record<string, Organisation> = {
  southdale: {
    id: 'southdale-id',
    name: 'Southdale Baptist Church',
    short_code: 'southdale',
  },
  bambanani: {
    id: 'bambanani-id',
    name: 'Bambanani Community Care',
    short_code: 'bambanani',
  },
};

export default function App() {
  const [currentOrg, setCurrentOrg] = useState<Organisation | null>(null);
  // Temporary role for testing — later comes from organisation_memberships
  const [role] = useState<OrgRole>('full_admin');
  const [page, setPage] = useState<'hub' | 'payroll' | 'treasurer' | 'dashboard'>('hub');

  const permissions = useMemo(() => derivePermissions(role), [role]);

  const ctx = {
    organisation: currentOrg,
    role,
    setOrganisation: setCurrentOrg,
    ...permissions,
  };

  function enterOrg(code: 'southdale' | 'bambanani') {
    setCurrentOrg(ORGS[code]);
    setPage('dashboard');
  }

  if (page === 'hub' || !currentOrg) {
    return (
      <OrgContext.Provider value={ctx}>
        <Hub onEnter={enterOrg} />
      </OrgContext.Provider>
    );
  }

  return (
    <OrgContext.Provider value={ctx}>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setCurrentOrg(null);
                setPage('hub');
              }}
              className="text-sm text-slate-500 hover:text-slate-800"
            >
              ← Hub
            </button>
            <span className="font-semibold">{currentOrg.name}</span>
          </div>
          <nav className="flex gap-2 text-sm">
            <button
              onClick={() => setPage('dashboard')}
              className={`px-3 py-1 rounded ${page === 'dashboard' ? 'bg-slate-800 text-white' : 'hover:bg-slate-100'}`}
            >
              Dashboard
            </button>
            {permissions.canAccessFinance && (
              <button
                onClick={() => setPage('treasurer')}
                className={`px-3 py-1 rounded ${page === 'treasurer' ? 'bg-slate-800 text-white' : 'hover:bg-slate-100'}`}
              >
                Treasurer
              </button>
            )}
            {permissions.canAccessPayroll && (
              <button
                onClick={() => setPage('payroll')}
                className={`px-3 py-1 rounded ${page === 'payroll' ? 'bg-slate-800 text-white' : 'hover:bg-slate-100'}`}
              >
                Payroll
              </button>
            )}
          </nav>
        </header>

        <main className="flex-1">
          {page === 'dashboard' && (
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
              <p className="text-slate-600 mb-4">
                Working in <strong>{currentOrg.name}</strong>. All data is filtered to this organisation only.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                {permissions.canAccessFinance && (
                  <button
                    onClick={() => setPage('treasurer')}
                    className="bg-white border rounded-xl p-4 text-left hover:border-blue-400"
                  >
                    <h3 className="font-semibold">Treasurer</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Bank statements, colour coding, balance check
                    </p>
                  </button>
                )}
                {permissions.canAccessPayroll && (
                  <button
                    onClick={() => setPage('payroll')}
                    className="bg-white border rounded-xl p-4 text-left hover:border-emerald-400"
                  >
                    <h3 className="font-semibold">Payroll</h3>
                    <p className="text-sm text-slate-500 mt-1">Auto PAYE / UIF • Biggest stress solved</p>
                  </button>
                )}
                <div className="bg-white border rounded-xl p-4">
                  <h3 className="font-semibold">Operations</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {currentOrg.short_code === 'southdale'
                      ? 'Departments, registers, missions'
                      : 'Programmes, feeding, stock, impact'}
                  </p>
                </div>
              </div>
            </div>
          )}
          {page === 'treasurer' && <Treasurer />}
          {page === 'payroll' && <Payroll />}
        </main>
      </div>
    </OrgContext.Provider>
  );
}
