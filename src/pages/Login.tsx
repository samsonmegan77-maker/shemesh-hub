import { HeartHandshake, ShieldCheck, User } from 'lucide-react';
import { DEMO_USERS } from '../lib/orgContext';
import type { UserProfile } from '../lib/orgContext';

interface LoginProps {
  onLogin: (user: UserProfile) => void;
}

export default function Login({ onLogin }: LoginProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="border-b bg-white px-4 py-4 flex items-center justify-between max-w-lg mx-auto w-full">
        <div className="flex items-center gap-2">
          <HeartHandshake className="text-emerald-600" size={28} />
          <div>
            <h1 className="font-bold text-lg leading-tight">SheMesh Hub</h1>
            <p className="text-xs text-slate-500">One login · Two organisations</p>
          </div>
        </div>
        <div className="text-xs text-slate-500 flex items-center gap-1">
          <ShieldCheck size={14} />
          Demo login
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full p-4 md:p-8">
        <p className="text-center text-slate-600 mb-6">
          Choose who you are. Real email login arrives when Supabase Auth is connected.
          Roles match Karren's prioritised list.
        </p>

        <div className="space-y-3">
          {DEMO_USERS.map((u) => (
            <button
              key={u.id}
              onClick={() =>
                onLogin({ id: u.id, fullName: u.fullName, email: u.email })
              }
              className="w-full text-left bg-white border-2 border-slate-200 rounded-xl p-4 hover:border-emerald-400 hover:shadow-md transition flex items-start gap-3"
            >
              <div className="bg-slate-100 rounded-full p-2 mt-0.5">
                <User size={20} className="text-slate-600" />
              </div>
              <div>
                <p className="font-semibold">{u.fullName}</p>
                <p className="text-xs text-slate-500">{u.email}</p>
                <p className="text-xs text-slate-400 mt-1">
                  Southdale: {labelRole(u.roles.southdale)} · Bambanani:{' '}
                  {labelRole(u.roles.bambanani)}
                </p>
              </div>
            </button>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">
          Carol &amp; Karren test first · Pastor Mike after training
        </p>
      </main>
    </div>
  );
}

function labelRole(r: string) {
  if (r === 'full_admin') return 'Full Admin';
  if (r === 'treasurer') return 'Treasurer / Finance';
  return 'Expense + Church Admin';
}
