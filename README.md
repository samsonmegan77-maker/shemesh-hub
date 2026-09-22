# SheMesh Hub

**One login. Two organisations. Strict data separation.**

Unified operational system for:

- **Southdale Baptist Church**
- **Bambanani Community Care**

Built for Karren MacKenzie, Carol Lai and Pastor Michael Ford Ho.

---

## Core Principles

| Rule | How it is enforced |
|------|--------------------|
| One login for all three users | Supabase Auth + `organisation_memberships` |
| Strict data boundary | Every table has `organisation_id`. RLS blocks cross-org access |
| No shared financials | Transfers, payroll, investments and reports stay inside their organisation |
| Roles are organisation-scoped | Same user can have different roles per org |
| Security is server-side | Frontend role selectors are **never** security |

---

## Users & Roles

| Person | Southdale | Bambanani |
|--------|-----------|-----------|
| **Karren MacKenzie** | Full Admin | Full Admin |
| **Carol Lai** | Treasurer / Finance | Treasurer / Finance |
| **Michael Ford Ho** | Expense Reports + Church Admin (registers/rosters) | Expense Reports only |

---

## Highest Priority (from Karren)

1. **Payroll** — auto PAYE/UIF, fringe benefits, Draft → Review → Approved, printable payslip
2. Bank statements + colour coding + opening/closing balance validation
3. Expenses with mandatory **“Who purchased?”** field
4. Reimbursements with “No receipt – prepaid airtime/WiFi” toggle
5. Monthly Payments screen + Monthly Control Report

See **BUILD-PLAN.md** for the full phased roadmap.

---

## Quick Start

```bash
npm install
cp .env.example .env   # add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev
```

### Supabase Setup

1. Create a **dedicated** Supabase project for this hub only.
2. Run migrations in order:
   - `supabase/migrations/0001_foundation.sql`
   - `supabase/migrations/0002_finance_core.sql`
   - `supabase/migrations/0003_payroll.sql`
   - `supabase/migrations/0004_operations.sql`
   - `supabase/migrations/0005_rls.sql`
3. Create Auth users for Karren, Carol and Pastor Mike (use their real emails).
4. Insert `organisation_memberships` rows linking them to both organisations with the correct roles.
5. Create a private Storage bucket named `organisation-documents`.

Never put the service-role key in the frontend.

---

## Data Boundary

- Southdale records can never appear in Bambanani views and vice-versa.
- Shared purchases are recorded as two separate expense lines (or one line with clear allocation notes) — the financial pools remain separate.
- Payroll is currently Southdale-only (extendable later if needed).

---

## Related

- Previous Bambanani pilot: `bambanani-community-care-app`
- Live pilot links (temporary):  
  https://bambanani-care-hub.lovable.app  
  https://southdalebaptistchurch.lovable.app

This repository replaces both as the single source of truth.
