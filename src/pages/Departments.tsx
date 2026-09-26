import { useState, useEffect } from 'react';
import { useOrg } from '../lib/orgContext';
import { loadJson, saveJson, orgKey } from '../lib/localStore';
import { Church, Users, Music, BookOpen, Heart, Cross, Plus, Calendar, Package } from 'lucide-react';

interface Department {
  id: string;
  name: string;
  description: string;
  schedule: string;
  leaders: string;
  notes: string;
}

interface RegisterEntry {
  id: string;
  deptId: string;
  date: string;
  attendance: string;
  birthdays: string;
  parentDetails: string;
  notes: string;
}

interface RosterSlot {
  id: string;
  deptId: string;
  weekOf: string;
  role: string;
  person: string;
}

interface StockItem {
  id: string;
  deptId: string;
  item: string;
  qty: number;
  notes: string;
}

const SOUTHDALE_DEFAULTS: Omit<Department, 'id'>[] = [
  { name: 'Sunday Service', description: 'Main Sunday morning service', schedule: 'Every Sunday 9:00 – 10:30', leaders: 'Pastor Mike (roster: Door Duty, Leader, Preacher, Offering, Music)', notes: 'Weekly roster rotated by Pastor' },
  { name: 'Sunday School', description: "Children's ministry classes", schedule: 'Every Sunday during service', leaders: 'Preschool (5 teachers rotation), Gr1-3 (1), Gr4-6 (2 rotation), Gr7-9 (1)', notes: 'Karren is Superintendent. Registers + birthday lists + parent details + stationery stock per grade' },
  { name: 'Junior Youth', description: 'Grades 1 – 6', schedule: 'Every Friday 15:00 – 17:00', leaders: '4 Youth Leaders', notes: '' },
  { name: 'Senior Youth', description: 'Grades 7 – 12', schedule: 'Every Friday 19:00 – 21:00', leaders: '4 Youth Leaders on rotation', notes: '' },
  { name: 'Music Department', description: 'Worship teams + sound', schedule: 'Sunday services', leaders: '4 Music Teams on rotation, each with musicians + sound engineer', notes: 'Roster created manually' },
  { name: 'Missions (Lighthouse)', description: 'Local, cross-border and international trips', schedule: 'As planned', leaders: 'Mission teams + Cooking Team', notes: 'Sponsorships cash + EFT. Safety register + medical notes' },
  { name: 'Ladies Fellowship', description: 'Quarterly activity / outreach', schedule: 'Every quarter', leaders: '', notes: '' },
  { name: 'Mens Fellowship', description: 'Annual planned activity', schedule: 'Once a year', leaders: '', notes: '' },
  { name: 'Bible Study', description: 'Weekly studies', schedule: 'Wed 19:00–20:30 · Thu 10:00–11:30', leaders: '', notes: '' },
  { name: 'Prayer Ministry', description: 'Weekly prayer', schedule: 'Thursday 19:00 – 20:00', leaders: '', notes: '' },
  { name: 'Social Care', description: 'Links to Bambanani (separate NPO)', schedule: 'Ongoing', leaders: 'Karren / Bambanani team', notes: 'Dorcas Wardrobe, Dorcas Pantry and outreaches run under Bambanani' },
];

const SERVICE_ROLES = [
  'Door Duty / Door Steward',
  'Service Leader',
  'Preacher',
  'Offering',
  'Music team',
  'Sound engineer',
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
  const { organisation, canManageDepartments } = useOrg();
  const isSouthdale = organisation?.short_code === 'southdale';
  const keyBase = organisation?.id || 'none';

  const [departments] = useState<Department[]>(() =>
    isSouthdale ? SOUTHDALE_DEFAULTS.map((d) => ({ ...d, id: crypto.randomUUID() })) : []
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [tab, setTab] = useState<'register' | 'roster' | 'stock'>('register');

  const [registers, setRegisters] = useState<RegisterEntry[]>(() => loadJson(orgKey(keyBase, 'registers'), []));
  const [rosters, setRosters] = useState<RosterSlot[]>(() => loadJson(orgKey(keyBase, 'rosters'), []));
  const [stock, setStock] = useState<StockItem[]>(() => loadJson(orgKey(keyBase, 'stock'), []));

  const [regForm, setRegForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    attendance: '',
    birthdays: '',
    parentDetails: '',
    notes: '',
  });
  const [rosterForm, setRosterForm] = useState({
    weekOf: new Date().toISOString().slice(0, 10),
    role: SERVICE_ROLES[0],
    person: '',
  });
  const [stockForm, setStockForm] = useState({ item: '', qty: '', notes: '' });

  useEffect(() => { saveJson(orgKey(keyBase, 'registers'), registers); }, [registers, keyBase]);
  useEffect(() => { saveJson(orgKey(keyBase, 'rosters'), rosters); }, [rosters, keyBase]);
  useEffect(() => { saveJson(orgKey(keyBase, 'stock'), stock); }, [stock, keyBase]);

  if (!isSouthdale) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold mb-2">Departments</h1>
        <p className="text-slate-600">Departments are for Southdale Baptist Church. Switch to Southdale from the Hub, or use Programmes for Bambanani.</p>
      </div>
    );
  }

  if (!canManageDepartments) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold mb-2">Departments</h1>
        <p className="text-red-600">Department registers and rosters are available to Full Admin and Expense Admin (Pastor Mike).</p>
      </div>
    );
  }

  const active = departments.find((d) => d.id === selected);

  function addRegister() {
    if (!selected) return;
    setRegisters((prev) => [{ id: crypto.randomUUID(), deptId: selected, ...regForm }, ...prev]);
    setRegForm({ date: new Date().toISOString().slice(0, 10), attendance: '', birthdays: '', parentDetails: '', notes: '' });
  }

  function addRoster() {
    if (!selected || !rosterForm.person.trim()) return;
    setRosters((prev) => [
      { id: crypto.randomUUID(), deptId: selected, weekOf: rosterForm.weekOf, role: rosterForm.role, person: rosterForm.person.trim() },
      ...prev,
    ]);
    setRosterForm((f) => ({ ...f, person: '' }));
  }

  function addStock() {
    if (!selected || !stockForm.item.trim()) return;
    setStock((prev) => [
      { id: crypto.randomUUID(), deptId: selected, item: stockForm.item.trim(), qty: Number(stockForm.qty) || 0, notes: stockForm.notes },
      ...prev,
    ]);
    setStockForm({ item: '', qty: '', notes: '' });
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl">
      <h1 className="text-2xl font-bold mb-1">Southdale Departments</h1>
      <p className="text-sm text-slate-500 mb-6">Rosters, attendance registers, birthdays, parent contacts & stationery stock · Saved on this device</p>

      <div className="grid md:grid-cols-2 gap-3 mb-6">
        {departments.map((d) => (
          <button
            key={d.id}
            onClick={() => setSelected(d.id === selected ? null : d.id)}
            className={`text-left border rounded-xl p-4 transition ${selected === d.id ? 'border-blue-500 bg-blue-50' : 'bg-white hover:border-slate-300'}`}
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
        <section className="bg-white border rounded-xl p-5 mb-6 space-y-4">
          <h2 className="text-lg font-bold">{active.name}</h2>
          <p className="text-sm text-slate-600">{active.description}</p>
          <div className="grid md:grid-cols-2 gap-3 text-sm">
            <div><span className="font-medium text-slate-500">Schedule</span><p>{active.schedule}</p></div>
            <div><span className="font-medium text-slate-500">Leaders / structure</span><p>{active.leaders || '—'}</p></div>
          </div>
          {active.notes && (
            <p className="text-sm bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">{active.notes}</p>
          )}

          <div className="flex gap-2 border-b pb-2 flex-wrap">
            {([['register', 'Register / Birthdays', Calendar], ['roster', 'Weekly Roster', Users], ['stock', 'Stationery stock', Package]] as const).map(([id, label, Icon]) => (
              <button key={id} onClick={() => setTab(id)} className={`flex items-center gap-1 text-sm px-3 py-1.5 rounded ${tab === id ? 'bg-slate-800 text-white' : 'hover:bg-slate-100'}`}>
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>

          {tab === 'register' && (
            <div className="space-y-3">
              <div className="grid md:grid-cols-2 gap-2">
                <input type="date" className="border rounded-lg px-3 py-1.5 text-sm" value={regForm.date} onChange={(e) => setRegForm((f) => ({ ...f, date: e.target.value }))} />
                <input className="border rounded-lg px-3 py-1.5 text-sm" placeholder="Attendance count / names" value={regForm.attendance} onChange={(e) => setRegForm((f) => ({ ...f, attendance: e.target.value }))} />
                <input className="border rounded-lg px-3 py-1.5 text-sm" placeholder="Birthdays this week" value={regForm.birthdays} onChange={(e) => setRegForm((f) => ({ ...f, birthdays: e.target.value }))} />
                <input className="border rounded-lg px-3 py-1.5 text-sm" placeholder="Parent details (via children)" value={regForm.parentDetails} onChange={(e) => setRegForm((f) => ({ ...f, parentDetails: e.target.value }))} />
              </div>
              <input className="border rounded-lg px-3 py-1.5 text-sm w-full" placeholder="Notes" value={regForm.notes} onChange={(e) => setRegForm((f) => ({ ...f, notes: e.target.value }))} />
              <button onClick={addRegister} className="flex items-center gap-1 bg-slate-800 text-white text-sm px-3 py-1.5 rounded-lg"><Plus size={14} /> Save register</button>
              <ul className="text-sm space-y-2 mt-2">
                {registers.filter((r) => r.deptId === active.id).map((r) => (
                  <li key={r.id} className="border-t pt-2">
                    <span className="text-slate-500">{r.date}</span>
                    {r.attendance && ` · Att: ${r.attendance}`}
                    {r.birthdays && ` · 🎂 ${r.birthdays}`}
                    {r.parentDetails && ` · Parents: ${r.parentDetails}`}
                    {r.notes && ` · ${r.notes}`}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tab === 'roster' && (
            <div className="space-y-3">
              <div className="grid md:grid-cols-3 gap-2">
                <input type="date" className="border rounded-lg px-3 py-1.5 text-sm" value={rosterForm.weekOf} onChange={(e) => setRosterForm((f) => ({ ...f, weekOf: e.target.value }))} />
                <select className="border rounded-lg px-3 py-1.5 text-sm" value={rosterForm.role} onChange={(e) => setRosterForm((f) => ({ ...f, role: e.target.value }))}>
                  {SERVICE_ROLES.map((r) => (<option key={r} value={r}>{r}</option>))}
                </select>
                <input className="border rounded-lg px-3 py-1.5 text-sm" placeholder="Person name" value={rosterForm.person} onChange={(e) => setRosterForm((f) => ({ ...f, person: e.target.value }))} />
              </div>
              <button onClick={addRoster} className="flex items-center gap-1 bg-slate-800 text-white text-sm px-3 py-1.5 rounded-lg"><Plus size={14} /> Add to roster</button>
              <ul className="text-sm space-y-1 mt-2">
                {rosters.filter((r) => r.deptId === active.id).map((r) => (
                  <li key={r.id} className="border-t pt-1"><span className="text-slate-500">{r.weekOf}</span> · {r.role}: <strong>{r.person}</strong></li>
                ))}
              </ul>
            </div>
          )}

          {tab === 'stock' && (
            <div className="space-y-3">
              <div className="grid md:grid-cols-3 gap-2">
                <input className="border rounded-lg px-3 py-1.5 text-sm" placeholder="Item (e.g. crayons, workbooks)" value={stockForm.item} onChange={(e) => setStockForm((f) => ({ ...f, item: e.target.value }))} />
                <input type="number" className="border rounded-lg px-3 py-1.5 text-sm" placeholder="Qty" value={stockForm.qty} onChange={(e) => setStockForm((f) => ({ ...f, qty: e.target.value }))} />
                <input className="border rounded-lg px-3 py-1.5 text-sm" placeholder="Notes / grade" value={stockForm.notes} onChange={(e) => setStockForm((f) => ({ ...f, notes: e.target.value }))} />
              </div>
              <button onClick={addStock} className="flex items-center gap-1 bg-slate-800 text-white text-sm px-3 py-1.5 rounded-lg"><Plus size={14} /> Add stock item</button>
              <ul className="text-sm space-y-1 mt-2">
                {stock.filter((s) => s.deptId === active.id).map((s) => (
                  <li key={s.id} className="border-t pt-1"><strong>{s.item}</strong> × {s.qty}{s.notes && ` · ${s.notes}`}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      <p className="text-xs text-slate-400">
        Matches Karren’s Sunday School Superintendent workflow: registers, birthdays, parent details, stationery per grade, and weekly service roster rotation.
      </p>
    </div>
  );
}
