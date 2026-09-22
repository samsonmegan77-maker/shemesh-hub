import { useState } from 'react';
import { useOrg } from '../lib/orgContext';
import { Church, Users, Music, BookOpen, Heart, Cross, Plus } from 'lucide-react';

interface Department {
  id: string;
  name: string;
  description: string;
  schedule: string;
  leaders: string;
  notes: string;
}

const SOUTHDALE_DEFAULTS: Omit<Department, 'id'>[] = [
  {
    name: 'Sunday Service',
    description: 'Main Sunday morning service',
    schedule: 'Every Sunday 9:00 – 10:30',
    leaders: 'Pastor Mike (roster: Door Duty, Leader, Preacher, Offering, Music)',
    notes: 'Weekly roster rotated manually by Pastor',
  },
  {
    name: 'Sunday School',
    description: 'Children\'s ministry classes',
    schedule: 'Every Sunday during service',
    leaders: 'Preschool (5 teachers rotation), Gr1-3 (1), Gr4-6 (2 rotation), Gr7-9 (1)',
    notes: 'Karren is Superintendent. Registers + birthday lists + parent details + stationery stock per grade',
  },
  {
    name: 'Junior Youth',
    description: 'Grades 1 – 6',
    schedule: 'Every Friday 15:00 – 17:00',
    leaders: '4 Youth Leaders',
    notes: '',
  },
  {
    name: 'Senior Youth',
    description: 'Grades 7 – 12',
    schedule: 'Every Friday 19:00 – 21:00',
    leaders: '4 Youth Leaders on rotation',
    notes: '',
  },
  {
    name: 'Music Department',
    description: 'Worship teams + sound',
    schedule: 'Sunday services',
    leaders: '4 Music Teams on rotation, each with musicians + sound engineer',
    notes: 'Roster created manually',
  },
  {
    name: 'Missions (Lighthouse)',
    description: 'Local, cross-border and international trips',
    schedule: 'As planned',
    leaders: 'Mission teams + Cooking Team',
    notes: 'Local 23 / Cross-border 23 / International 4-6. Sponsorships cash + EFT. Safety register + medical notes',
  },
  {
    name: 'Ladies Fellowship',
    description: 'Quarterly activity / outreach',
    schedule: 'Every quarter',
    leaders: '',
    notes: '',
  },
  {
    name: 'Mens Fellowship',
    description: 'Annual planned activity',
    schedule: 'Once a year',
    leaders: '',
    notes: '',
  },
  {
    name: 'Bible Study',
    description: 'Weekly studies',
    schedule: 'Wed 19:00–20:30 · Thu 10:00–11:30',
    leaders: '',
    notes: '',
  },
  {
    name: 'Prayer Ministry',
    description: 'Weekly prayer',
    schedule: 'Thursday 19:00 – 20:00',
    leaders: '',
    notes: '',
  },
  {
    name: 'Social Care',
    description: 'Links to Bambanani (separate NPO)',
    schedule: 'Ongoing',
    leaders: 'Karren / Bambanani team',
    notes: 'Dorcas Wardrobe, Dorcas Pantry and outreaches run under Bambanani',
  },
];

const ICONS: Record<string, React.ReactNode> = {
  'Sunday Service': <Church size={20} />,
  'Sunday School': <Users size={20} />,
  'Junior Youth': <Users size={20} />,
  'Senior Youth': <Users size={20} />,
  'Music Department': <Music size={20} />,
  'Missions (Lighthouse)': <Cross size={20} />,
  'Ladies Fellowship': <Heart size={20} />,
  'Mens Fellowship': <Users size={20} />,
  'Bible Study': <BookOpen size={20} />,
  'Prayer Ministry': <Heart size={20} />,
  'Social Care': <Heart size={20} />,
};

export default function Departments() {
  const { organisation } = useOrg();
  const isSouthdale = organisation?.short_code === 'southdale';

  const [departments, setDepartments] = useState<Department[]>(() =>
    isSouthdale
      ? SOUTHDALE_DEFAULTS.map((d) => ({ ...d, id: crypto.randomUUID() }))
      : []
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [registerDate, setRegisterDate] = useState(new Date().toISOString().slice(0, 10));
  const [registerNotes, setRegisterNotes] = useState('');
  const [registers, setRegisters] = useState<
    { id: string; deptId: string; date: string; notes: string }[]
  >([]);

  if (!isSouthdale) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold mb-2">Departments</h1>
        <p className="text-slate-600">
          Departments are for Southdale Baptist Church. Switch to Southdale from the Hub, or use
          Programmes for Bambanani.
        </p>
      </div>
    );
  }

  function addRegister() {
    if (!selected) return;
    setRegisters((prev) => [
      {
        id: crypto.randomUUID(),
        deptId: selected,
        date: registerDate,
        notes: registerNotes,
      },
      ...prev,
    ]);
    setRegisterNotes('');
  }

  const active = departments.find((d) => d.id === selected);

  return (
    <div className="p-4 md:p-6 max-w-5xl">
      <h1 className="text-2xl font-bold mb-1">Southdale Departments</h1>
      <p className="text-sm text-slate-500 mb-6">
        Rosters, schedules and registers • Karren as Sunday School Superintendent
      </p>

      <div className="grid md:grid-cols-2 gap-3 mb-6">
        {departments.map((d) => (
          <button
            key={d.id}
            onClick={() => setSelected(d.id === selected ? null : d.id)}
            className={`text-left border rounded-xl p-4 transition ${
              selected === d.id
                ? 'border-blue-500 bg-blue-50'
                : 'bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-blue-600">{ICONS[d.name] || <Church size={20} />}</span>
              <h3 className="font-semibold">{d.name}</h3>
            </div>
            <p className="text-xs text-slate-500">{d.schedule}</p>
          </button>
        ))}
      </div>

      {active && (
        <section className="bg-white border rounded-xl p-5 mb-6 space-y-3">
          <h2 className="text-lg font-bold">{active.name}</h2>
          <p className="text-sm text-slate-600">{active.description}</p>
          <div className="grid md:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="font-medium text-slate-500">Schedule</span>
              <p>{active.schedule}</p>
            </div>
            <div>
              <span className="font-medium text-slate-500">Leaders / structure</span>
              <p>{active.leaders || '—'}</p>
            </div>
          </div>
          {active.notes && (
            <p className="text-sm bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              {active.notes}
            </p>
          )}

          {/* Quick register entry */}
          <div className="border-t pt-4 mt-2">
            <h3 className="font-semibold text-sm mb-2">Add register / attendance note</h3>
            <div className="flex flex-wrap gap-2">
              <input
                type="date"
                className="border rounded-lg px-3 py-1.5 text-sm"
                value={registerDate}
                onChange={(e) => setRegisterDate(e.target.value)}
              />
              <input
                className="border rounded-lg px-3 py-1.5 text-sm flex-1 min-w-[180px]"
                placeholder="Attendance count, birthdays, parent contacts, notes…"
                value={registerNotes}
                onChange={(e) => setRegisterNotes(e.target.value)}
              />
              <button
                onClick={addRegister}
                className="flex items-center gap-1 bg-slate-800 text-white text-sm px-3 py-1.5 rounded-lg"
              >
                <Plus size={14} /> Save
              </button>
            </div>
          </div>

          {registers.filter((r) => r.deptId === active.id).length > 0 && (
            <ul className="text-sm space-y-1 mt-2">
              {registers
                .filter((r) => r.deptId === active.id)
                .map((r) => (
                  <li key={r.id} className="border-t pt-1">
                    <span className="text-slate-500">{r.date}</span> — {r.notes || '(no notes)'}
                  </li>
                ))}
            </ul>
          )}
        </section>
      )}

      <p className="text-xs text-slate-400">
        Full roster builder, birthday registers and stationery stock tracking will connect to the
        registers table once Supabase is live. This screen already captures the structure Karren
        described.
      </p>
    </div>
  );
}
