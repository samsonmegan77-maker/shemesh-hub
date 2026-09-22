-- SheMesh Hub — Payroll (highest priority)
-- Auto PAYE + UIF. Fringe benefits. Draft → Review → Approved.

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  full_name text not null,
  id_number text,
  bank_details text,
  start_date date,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.payroll_runs (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  period date not null,                       -- first day of month
  gross numeric(14,2) not null default 0,
  travel_allowance numeric(14,2) not null default 0,
  bonus numeric(14,2) not null default 0,
  pension numeric(14,2) not null default 0,
  housing_allowance numeric(14,2) not null default 0,  -- fringe
  medical_aid numeric(14,2) not null default 0,        -- fringe
  paye numeric(14,2) not null default 0,
  uif numeric(14,2) not null default 0,
  net_salary numeric(14,2) not null default 0,
  leave_due numeric(8,2) default 0,
  status text not null default 'Draft' check (status in ('Draft', 'Review', 'Approved')),
  created_by uuid references public.profiles(id),
  approved_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  unique (employee_id, period)
);

create table if not exists public.leave_records (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  leave_type text not null check (leave_type in ('Annual', 'Sick')),
  days numeric(6,2) not null,
  start_date date,
  end_date date,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_payroll_org_period on public.payroll_runs(organisation_id, period);
create index if not exists idx_employees_org on public.employees(organisation_id);
