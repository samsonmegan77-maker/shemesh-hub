import { useState, useMemo, useEffect } from 'react';
import Hub from './pages/Hub';
import Login from './pages/Login';
import Payroll from './pages/Payroll';
import Treasurer from './pages/Treasurer';
import Expenses from './pages/Expenses';
import Reimbursements from './pages/Reimbursements';
import MonthlyPayments from './pages/MonthlyPayments';
import ReportsHub from './pages/ReportsHub';
import Departments from './pages/Departments';
import Missions from './pages/Missions';
import Programmes from './pages/Programmes';
import Documents from './pages/Documents';
import Minutes from './pages/Minutes';
import PettyCash from './pages/PettyCash';
import {
  OrgContext,
  derivePermissions,
  DEMO_USERS,
  type Organisation,
  type OrgRole,
  type UserProfile,
} from './lib/orgContext';
import { loadJson, saveJson } from './lib/localStore';

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

type Page =
  | 'hub'
  | 'dashboard'
  | 'treasurer'
  | 'payroll'
  | 'expenses'
  | 'reimbursements'
  | 'payments'
  | 'reports'
  | 'departments'
  | 'missions'
  | 'programmes'
  | 'documents'
  | 'minutes'
  | 'pettycash';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(() =>
    loadJson<UserProfile | null>('shemesh:user', null)
  );
  const [currentOrg, setCurrentOrg] = useState<Organisation | null>(null);
  const [role, setRole] = useState<OrgRole | null>(null);
  const [page, setPage] = useState<Page>('hub');

  useEffect(() => {
    saveJson('shemesh:user', user);
  }, [user]);

  useEffect(() => {
    if (!user || !currentOrg) {
      setRole(null);
      return;
    }
    const demo = DEMO_USERS.find((u) => u.id === user.id);
    if (demo) {
      setRole(demo.roles[currentOrg.short_code]);
    }
  }, [user, currentOrg]);

  const permissions = useMemo(() => derivePermissions(role), [role]);
  const isSouthdale = currentOrg?.short_code === 'southdale';
  const isBambanani = currentOrg?.short_code === 'bambanani';

  const ctx = {
    organisation: currentOrg,
    role,
    user,
    setOrganisation: setCurrentOrg,
    setRole,
    setUser,
    ...permissions,
  };

  function enterOrg(code: 'southdale' | 'bambanani') {
    setCurrentOrg(ORGS[code]);
    setPage('dashboard');
  }

  function logout() {
    setUser(null);
    setCurrentOrg(null);
    setRole(null);
    setPage('hub');
  }

  if (!user) {
    return (
      <OrgContext.Provider value={ctx}>
        <Login onLogin={setUser} />
      </OrgContext.Provider>
    );
  }

  if (page === 'hub' || !currentOrg) {
    return (
      <OrgContext.Provider value={ctx}>
        <Hub onEnter={enterOrg} onLogout={logout} userName={user.fullName} />
      </OrgContext.Provider>
    );
  }

  const navBtn = (id: Page, label: string) => (
    <button
      key={id}
      onClick={() => setPage(id)}
      className={`px-3 py-1 rounded ${page === id ? 'bg-slate-800 text-white' : 'hover:bg-slate-100'}`}
    >
      {label}
    </button>
  );

  return (
    <OrgContext.Provider value={ctx}>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <header className="bg-white border-b px-4 py-3 flex items-center justify-between flex-wrap gap-2">
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
            <span className="text-xs text-slate-400 hidden sm:inline">
              {user.fullName} · {roleLabel(role)}
            </span>
          </div>
          <nav className="flex flex-wrap gap-1 text-sm">
            {navBtn('dashboard', 'Dashboard')}
            {permissions.canAccessFinance && navBtn('treasurer', 'Treasurer')}
            {permissions.canCreateExpenses && navBtn('expenses', 'Expenses')}
            {permissions.canCreateExpenses && navBtn('reimbursements', 'Reimburse')}
            {permissions.canAccessFinance && navBtn('payments', 'Payments')}
            {permissions.canAccessFinance && navBtn('pettycash', 'Petty Cash')}
            {permissions.canAccessFinance && navBtn('reports', 'Reports')}
            {permissions.canAccessPayroll && navBtn('payroll', 'Payroll')}
            {isSouthdale && permissions.canManageDepartments && navBtn('departments', 'Departments')}
            {isSouthdale && navBtn('missions', 'Missions')}
            {isBambanani && navBtn('programmes', 'Programmes')}
            {navBtn('minutes', 'Minutes')}
            {navBtn('documents', 'Documents')}
            <button
              onClick={logout}
              className="px-3 py-1 rounded text-slate-500 hover:bg-red-50 hover:text-red-700"
            >
              Log out
            </button>
          </nav>
        </header>

        <main className="flex-1">
          {page === 'dashboard' && (
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
              <p className="text-slate-600 mb-4">
                Working in <strong>{currentOrg.name}</strong> as{' '}
                <strong>{user.fullName}</strong> ({roleLabel(role)}). All data is
                filtered to this organisation only. Data is saved in this browser
                until Supabase is connected.
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {permissions.canAccessFinance && (
                  <button onClick={() => setPage('treasurer')} className="bg-white border rounded-xl p-4 text-left hover:border-blue-400">
                    <h3 className="font-semibold">Treasurer</h3>
                    <p className="text-sm text-slate-500 mt-1">Bank statements, CSV import, colour coding, balance check</p>
                  </button>
                )}
                {permissions.canCreateExpenses && (
                  <button onClick={() => setPage('expenses')} className="bg-white border rounded-xl p-4 text-left hover:border-amber-400">
                    <h3 className="font-semibold">Expenses</h3>
                    <p className="text-sm text-slate-500 mt-1">Who purchased? + receipt status</p>
                  </button>
                )}
                {permissions.canCreateExpenses && (
                  <button onClick={() => setPage('reimbursements')} className="bg-white border rounded-xl p-4 text-left hover:border-violet-400">
                    <h3 className="font-semibold">Reimbursements</h3>
                    <p className="text-sm text-slate-500 mt-1">Including no-receipt airtime/WiFi</p>
                  </button>
                )}
                {permissions.canAccessFinance && (
                  <button onClick={() => setPage('payments')} className="bg-white border rounded-xl p-4 text-left hover:border-indigo-400">
                    <h3 className="font-semibold">Monthly Payments</h3>
                    <p className="text-sm text-slate-500 mt-1">Standard list + unforeseen / bi-annual</p>
                  </button>
                )}
                {permissions.canAccessFinance && (
                  <button onClick={() => setPage('pettycash')} className="bg-white border rounded-xl p-4 text-left hover:border-teal-400">
                    <h3 className="font-semibold">Petty Cash</h3>
                    <p className="text-sm text-slate-500 mt-1">Debit-card summary + slips (no physical cash)</p>
                  </button>
                )}
                {permissions.canAccessFinance && (
                  <button onClick={() => setPage('reports')} className="bg-white border rounded-xl p-4 text-left hover:border-slate-400">
                    <h3 className="font-semibold">Reports</h3>
                    <p className="text-sm text-slate-500 mt-1">Control, donations, YTD, attendance…</p>
                  </button>
                )}
                {permissions.canAccessPayroll && (
                  <button onClick={() => setPage('payroll')} className="bg-white border rounded-xl p-4 text-left hover:border-emerald-400">
                    <h3 className="font-semibold">Payroll</h3>
                    <p className="text-sm text-slate-500 mt-1">Auto PAYE / UIF · printable payslip</p>
                  </button>
                )}
                {isSouthdale && permissions.canManageDepartments && (
                  <button onClick={() => setPage('departments')} className="bg-white border rounded-xl p-4 text-left hover:border-blue-300">
                    <h3 className="font-semibold">Departments</h3>
                    <p className="text-sm text-slate-500 mt-1">Rosters, registers, birthdays, stationery</p>
                  </button>
                )}
                {isSouthdale && (
                  <button onClick={() => setPage('missions')} className="bg-white border rounded-xl p-4 text-left hover:border-rose-300">
                    <h3 className="font-semibold">Missions</h3>
                    <p className="text-sm text-slate-500 mt-1">Local / Cross-border / International</p>
                  </button>
                )}
                {isBambanani && (
                  <button onClick={() => setPage('programmes')} className="bg-white border rounded-xl p-4 text-left hover:border-emerald-300">
                    <h3 className="font-semibold">Programmes</h3>
                    <p className="text-sm text-slate-500 mt-1">Outreach, headcount, meals, impact</p>
                  </button>
                )}
                <button onClick={() => setPage('minutes')} className="bg-white border rounded-xl p-4 text-left hover:border-indigo-300">
                  <h3 className="font-semibold">Minutes of Meeting</h3>
                  <p className="text-sm text-slate-500 mt-1">Activity + actions + financials</p>
                </button>
                <button onClick={() => setPage('documents')} className="bg-white border rounded-xl p-4 text-left hover:border-slate-300">
                  <h3 className="font-semibold">Documents</h3>
                  <p className="text-sm text-slate-500 mt-1">Receipts, invoices, policies, minutes</p>
                </button>
              </div>
            </div>
          )}
          {page === 'treasurer' && <Treasurer />}
          {page === 'expenses' && <Expenses />}
          {page === 'reimbursements' && <Reimbursements />}
          {page === 'payments' && <MonthlyPayments />}
          {page === 'pettycash' && <PettyCash />}
          {page === 'reports' && <ReportsHub />}
          {page === 'payroll' && <Payroll />}
          {page === 'departments' && <Departments />}
          {page === 'missions' && <Missions />}
          {page === 'programmes' && <Programmes />}
          {page === 'minutes' && <Minutes />}
          {page === 'documents' && <Documents />}
        </main>
      </div>
    </OrgContext.Provider>
  );
}

function roleLabel(r: OrgRole | null) {
  if (r === 'full_admin') return 'Full Admin';
  if (r === 'treasurer') return 'Treasurer';
  if (r === 'expense_admin') return 'Expense Admin';
  return '';
}
