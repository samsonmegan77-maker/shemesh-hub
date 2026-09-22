-- SheMesh Hub — Row Level Security
-- RLS is the only security authority.

alter table public.organisations enable row level security;
alter table public.profiles enable row level security;
alter table public.organisation_memberships enable row level security;
alter table public.money_movements enable row level security;
alter table public.bank_transactions enable row level security;
alter table public.bank_reconciliations enable row level security;
alter table public.expenses enable row level security;
alter table public.reimbursements enable row level security;
alter table public.invoices enable row level security;
alter table public.monthly_payments enable row level security;
alter table public.organisation_settings enable row level security;
alter table public.employees enable row level security;
alter table public.payroll_runs enable row level security;
alter table public.leave_records enable row level security;
alter table public.departments enable row level security;
alter table public.programmes enable row level security;
alter table public.registers enable row level security;
alter table public.missions enable row level security;
alter table public.mission_participants enable row level security;
alter table public.documents enable row level security;
alter table public.reports enable row level security;

-- Helper: is the current user a member of this organisation?
create or replace function public.is_org_member(org uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.organisation_memberships
    where organisation_id = org and user_id = auth.uid()
  );
$$;

-- Helper: current role in this organisation
create or replace function public.current_org_role(org uuid)
returns text
language sql
security definer
set search_path = public
as $$
  select role from public.organisation_memberships
  where organisation_id = org and user_id = auth.uid()
  limit 1;
$$;

-- Profiles: users can read/update their own
create policy "users can view own profile"
  on public.profiles for select using (id = auth.uid());
create policy "users can update own profile"
  on public.profiles for update using (id = auth.uid());

-- Memberships: users can see their own
create policy "users can view own memberships"
  on public.organisation_memberships for select using (user_id = auth.uid());

-- Organisations: members can see orgs they belong to
create policy "members can view their organisations"
  on public.organisations for select using (public.is_org_member(id));

-- Generic org-scoped policy for most tables
do $$
declare
  t text;
begin
  foreach t in array array[
    'money_movements', 'bank_transactions', 'bank_reconciliations',
    'expenses', 'reimbursements', 'invoices', 'monthly_payments',
    'organisation_settings', 'employees', 'payroll_runs',
    'departments', 'programmes', 'registers', 'missions',
    'documents', 'reports'
  ] loop
    execute format(
      'create policy "org members full access" on public.%I for all using (public.is_org_member(organisation_id)) with check (public.is_org_member(organisation_id))',
      t
    );
  end loop;
end $$;

-- Leave records follow the employee’s organisation
create policy "org members access leave via employee"
  on public.leave_records for all
  using (
    exists (
      select 1 from public.employees e
      where e.id = leave_records.employee_id
        and public.is_org_member(e.organisation_id)
    )
  )
  with check (
    exists (
      select 1 from public.employees e
      where e.id = leave_records.employee_id
        and public.is_org_member(e.organisation_id)
    )
  );

-- Mission participants follow the mission
create policy "org members access mission participants"
  on public.mission_participants for all
  using (
    exists (
      select 1 from public.missions m
      where m.id = mission_participants.mission_id
        and public.is_org_member(m.organisation_id)
    )
  )
  with check (
    exists (
      select 1 from public.missions m
      where m.id = mission_participants.mission_id
        and public.is_org_member(m.organisation_id)
    )
  );
