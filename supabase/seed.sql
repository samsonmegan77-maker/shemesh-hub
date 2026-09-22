-- SheMesh Hub — Seed data
-- Run AFTER migrations and AFTER creating Auth users in Supabase Dashboard.
--
-- IMPORTANT:
-- 1. First create the three users in Supabase Auth (Authentication → Users → Add user)
--    using their real email addresses.
-- 2. Copy each user’s UUID from the Auth users list.
-- 3. Replace the placeholder UUIDs below with the real ones.
-- 4. Then run this file in the SQL Editor.

-- ============================================================
-- STEP 1: Replace these UUIDs with the real auth.users ids
-- ============================================================
-- Example: after creating the users, run:
--   select id, email from auth.users;
-- and paste the ids here.

do $$
declare
  karren_id uuid := '00000000-0000-0000-0000-000000000001';  -- REPLACE
  carol_id  uuid := '00000000-0000-0000-0000-000000000002';  -- REPLACE
  mike_id   uuid := '00000000-0000-0000-0000-000000000003';  -- REPLACE
  southdale_id uuid;
  bambanani_id uuid;
begin
  select id into southdale_id from public.organisations where short_code = 'southdale';
  select id into bambanani_id from public.organisations where short_code = 'bambanani';

  -- Profiles
  insert into public.profiles (id, email, full_name) values
    (karren_id, 'karren.desiree.mckenzie@gmail.com', 'Karren MacKenzie'),
    (carol_id,  'carol.lai@example.com',             'Carol Lai'),          -- update email if known
    (mike_id,   'pastor.mike@example.com',           'Michael Ford Ho')     -- update email if known
  on conflict (id) do update set
    email = excluded.email,
    full_name = excluded.full_name;

  -- Memberships — both organisations
  insert into public.organisation_memberships (user_id, organisation_id, role) values
    -- Karren = full admin on both
    (karren_id, southdale_id, 'full_admin'),
    (karren_id, bambanani_id, 'full_admin'),
    -- Carol = treasurer on both
    (carol_id, southdale_id, 'treasurer'),
    (carol_id, bambanani_id, 'treasurer'),
    -- Pastor Mike = expense_admin on both
    (mike_id, southdale_id, 'expense_admin'),
    (mike_id, bambanani_id, 'expense_admin')
  on conflict (user_id, organisation_id) do update set role = excluded.role;

  -- Default investment target
  insert into public.organisation_settings (organisation_id, investment_target) values
    (southdale_id, 50000),
    (bambanani_id, 50000)
  on conflict (organisation_id) do nothing;

  raise notice 'Seed complete. Karren, Carol and Pastor Mike linked to both organisations.';
end $$;
