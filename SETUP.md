# SheMesh Hub — Setup Guide (Steps 2, 3, 4)

Follow this exact order.

---

## 2. Create Supabase project & run migrations

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

## 3. Create Auth users (real emails)

In Supabase Dashboard → **Authentication** → **Users** → **Add user**:

| Name | Email | Notes |
|------|-------|-------|
| Karren MacKenzie | `karren.desiree.mckenzie@gmail.com` | Full Admin |
| Carol Lai | *(her real email)* | Treasurer |
| Michael Ford Ho | *(his real email)* | Expense Admin |

- Set a temporary password and tick “Auto Confirm User” so they can log in immediately.
- After creation, copy each user’s **UUID** (click the user row).

---

## 4. Link users to organisations (seed)

1. Open `supabase/seed.sql`.
2. Replace the three placeholder UUIDs with the real ones from step 3.
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

## Environment variables

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

## Storage bucket (for receipts later)

Dashboard → Storage → New bucket:
- Name: `organisation-documents`
- Public: **No** (private)
- Then add policies so only org members can read/write their own folder.

---

## Run the app locally

```bash
npm install
npm run dev
```

Open the URL shown (usually http://localhost:5173).
