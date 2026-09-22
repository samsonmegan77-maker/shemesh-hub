# SheMesh Hub — Setup Guide

Follow this exact order.

---

## 1. Create Supabase project & run migrations

1. Go to [https://supabase.com](https://supabase.com) → New project.
2. Name it something like `shemesh-hub` (dedicated project — do not share with other apps).
3. Once the project is ready, open **SQL Editor**.
4. Run the migration files **in this order**, one at a time:

   - `supabase/migrations/0001_foundation.sql`
   - `supabase/migrations/0002_finance_core.sql`
   - `supabase/migrations/0003_payroll.sql`
   - `supabase/migrations/0004_operations.sql`
   - `supabase/migrations/0005_rls.sql`

5. Confirm the tables exist under **Table Editor**.

---

## 2. Create Auth users (real emails)

In Supabase Dashboard → **Authentication** → **Users** → **Add user**:

| Name | Email | Notes |
|------|-------|-------|
| Karren MacKenzie | `karren.desiree.mckenzie@gmail.com` | Full Admin |
| Carol Lai | *(her real email)* | Treasurer |
| Michael Ford Ho | *(his real email)* | Expense Admin |

- Set a temporary password and tick “Auto Confirm User” so they can log in immediately.
- After creation, copy each user’s **UUID** (click the user row).

---

## 3. Link users to organisations (seed)

1. Open `supabase/seed.sql`.
2. Replace the three placeholder UUIDs with the real ones from step 2.
3. Update Carol’s and Pastor Mike’s email addresses if you have the real ones.
4. Paste the whole file into the SQL Editor and run it.
5. Verify:

```sql
select p.full_name, o.name, m.role
from organisation_memberships m
join profiles p on p.id = m.user_id
join organisations o on o.id = m.organisation_id
order by p.full_name, o.name;
```

You should see 6 rows (3 people × 2 orgs).

---

## 4. Environment variables

In the repo root:

```bash
cp .env.example .env
```

Fill in:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

(Find these under Project Settings → API.)

Never put the **service_role** key in the frontend.

---

## 5. Storage bucket (Phase 7 — Documents)

Dashboard → **Storage** → **New bucket**:

| Setting | Value |
|---------|--------|
| Name | `organisation-documents` |
| Public | **No** (private) |
| File size limit | e.g. 10 MB |
| Allowed MIME | `application/pdf`, `image/*` |

### Path convention

```
{organisation_id}/{entity_type}/{record_id}/{filename}
```

Examples:
- `a1b2c3.../expense/uuid/receipt-2026-09-12.jpg`
- `a1b2c3.../bank_statement/uuid/july-statement.pdf`
- `a1b2c3.../minutes/uuid/deacons-sep-2026.pdf`

### Suggested storage policies (SQL Editor)

After the bucket exists, run policies so only authenticated org members can access files under their organisation folder. Example pattern (adjust to your exact helper functions):

```sql
-- Allow authenticated users to upload to paths they are allowed to see
-- (Refine with organisation_id checks once client always prefixes with org id)

create policy "authenticated upload"
on storage.objects for insert
to authenticated
with check (bucket_id = 'organisation-documents');

create policy "authenticated read own org paths"
on storage.objects for select
to authenticated
using (bucket_id = 'organisation-documents');

create policy "authenticated update"
on storage.objects for update
to authenticated
using (bucket_id = 'organisation-documents');

create policy "authenticated delete"
on storage.objects for delete
to authenticated
using (bucket_id = 'organisation-documents');
```

Tighten these later so the first folder segment must match an organisation the user belongs to.

---

## 6. Run the app locally

```bash
npm install
npm run dev
```

Open the URL shown (usually http://localhost:5173).
