-- SheMesh Hub — Operations (departments, programmes, registers, missions)

create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  name text not null,
  description text,
  unique (organisation_id, name)
);

create table if not exists public.programmes (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  name text not null,
  active boolean not null default true,
  unique (organisation_id, name)
);

create table if not exists public.registers (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  department_id uuid references public.departments(id),
  programme_id uuid references public.programmes(id),
  register_date date not null,
  register_type text,
  data jsonb not null default '{}',
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.missions (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  name text not null,
  mission_type text check (mission_type in ('Local', 'Cross-border', 'International')),
  start_date date,
  end_date date,
  budget numeric(14,2),
  notes text
);

create table if not exists public.mission_participants (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references public.missions(id) on delete cascade,
  full_name text not null,
  role text,
  emergency_contact text,
  medical_notes text
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  entity_type text,
  entity_id uuid,
  file_path text not null,
  file_name text,
  uploaded_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  period date,
  report_type text,
  status text default 'draft',
  document_path text,
  generated_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

-- Seed common Southdale departments and Bambanani programmes
insert into public.departments (organisation_id, name)
select id, d from public.organisations,
  unnest(array[
    'Sunday Service',
    'Sunday School',
    'Junior Youth',
    'Senior Youth',
    'Music Department',
    'Missions',
    'Ladies Fellowship',
    'Mens Fellowship',
    'Bible Study',
    'Prayer Ministry',
    'Social Care'
  ]) as d
where short_code = 'southdale'
on conflict do nothing;

insert into public.programmes (organisation_id, name)
select id, p from public.organisations,
  unnest(array[
    'Dorcas Wardrobe',
    'Dorcas Pantry',
    'Soup Kitchen',
    'Home for the Blind',
    'Yellow Mountain Informal Settlement',
    'Booysens Informal Settlement',
    'Hong Ning Old Age Home',
    'Karina Old Age Home',
    'Annie Burger Old Age Home',
    'Bellavista Old Age Home',
    'Chrisville Women & Children Outreach'
  ]) as p
where short_code = 'bambanani'
on conflict do nothing;
