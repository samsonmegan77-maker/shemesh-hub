-- SheMesh Hub — Foundation
-- One project, two organisations, strict separation via organisation_id + RLS

create extension if not exists pgcrypto;

-- Organisations
create table if not exists public.organisations (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  short_code text unique not null,
  created_at timestamptz not null default now()
);

insert into public.organisations (name, short_code) values
  ('Southdale Baptist Church', 'southdale'),
  ('Bambanani Community Care', 'bambanani')
on conflict (name) do nothing;

-- Profiles (linked to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  created_at timestamptz not null default now()
);

-- Membership + role per organisation
create table if not exists public.organisation_memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  role text not null check (role in ('full_admin', 'treasurer', 'expense_admin')),
  unique (user_id, organisation_id)
);

create index if not exists idx_memberships_user on public.organisation_memberships(user_id);
create index if not exists idx_memberships_org on public.organisation_memberships(organisation_id);
