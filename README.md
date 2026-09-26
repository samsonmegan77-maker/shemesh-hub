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
| One login for all three users | Demo login now · Supabase Auth later |
| Strict data boundary | Every table has `organisation_id`. RLS when connected |
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

## What's ready (without Supabase)

1. **Demo login** — pick Karren / Carol / Pastor Mike (roles applied per org)
2. **Payroll** — auto PAYE/UIF, fringe benefits, history, Draft→Review→Approved, **printable payslip**
3. **Treasurer** — bank lines, **CSV import**, colour coding, opening/closing balance check
4. **Expenses** — mandatory "Who purchased?", receipt status
5. **Reimbursements** — no-receipt prepaid airtime/WiFi toggle, approve/pay workflow
6. **Monthly Payments** — standard list + unforeseen / bi-annual / once-off
7. **Petty Cash** — debit-card summary + slips (no physical cash)
8. **Departments** — registers (attendance, birthdays, parent details), weekly roster, stationery stock
9. **Documents** — file picker + register by name
10. **Reports** — Control Report + sample Donations / Expenses / Income / Investment / YTD / Attendance
11. **Minutes of Meeting** — draft/final, print-friendly
12. **localStorage** — all of the above survives browser refresh until Supabase is wired

See **BUILD-PLAN.md** for the full roadmap.

---

## Quick Start

```bash
npm install
npm run dev
```

Open the URL shown. Choose a demo user, then Southdale or Bambanani.

### When you connect Supabase

1. Create a **dedicated** Supabase project.
2. Run migrations in order (`0001` → `0005`).
3. Create Auth users + seed `organisation_memberships`.
4. Create private Storage bucket `organisation-documents`.
5. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

Never put the service-role key in the frontend.

---

## Data Boundary

- Southdale records can never appear in Bambanani views and vice-versa.
- Shared purchases are recorded as two separate expense lines — financial pools remain separate.
- Payroll is currently Southdale-focused (extendable later).

---

## Related

- Live front-end: https://shemesh-hub.vercel.app  
- This repository is the single source of truth.
