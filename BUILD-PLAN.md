# SheMesh Hub — Build Plan

Last updated: 26 Sep 2026

## Phase Overview

| Phase | Focus | Status on GitHub/Vercel |
|-------|-------|-------------------------|
| 0 | Foundation + demo login | **Done** |
| 1 | Payroll + payslip history + print | **Done** |
| 2 | Treasurer + **working CSV import** | **Done** |
| 3 | Expenses (Who purchased?) + persistence | **Done** |
| 4 | Petty Cash + Monthly Payments + Reimbursements | **UI Done** (Petty Cash persists; others may need refresh-safe pass) |
| 5 | Departments (roster, birthdays, stationery) | **Basic UI on GitHub** · full tabs still local |
| 6 | Bambanani Programmes | **UI done** |
| 7 | Documents + Minutes + Reports | **UI done** |
| 8 | Testing with Carol + Karren | **Next** |
| 9 | Supabase multi-device DB + Storage | **Needs your Supabase project keys** |

## Done on live repo (26 Sep 2026)

- Demo login: Karren / Carol / Pastor Mike with roles
- Payroll: history, Draft→Review→Approved, **printable payslip**, localStorage
- Treasurer: balance check, colour coding, **working CSV upload**, localStorage
- Expenses: **Who purchased?** required, localStorage
- Petty Cash: debit-card lines + slips, localStorage
- csvParse + localStore helpers

## Still needs work / your input

1. **Full Departments** (roster / birthdays / parent details / stationery stock tabs) — enhanced file exists locally; push remaining if needed
2. **localStorage** on Reimbursements, Monthly Payments, Minutes, Documents — UI works; persistence pass incomplete on some screens
3. **Supabase** — shared multi-device data + private Storage for receipts:
   - Create project at supabase.com
   - Run migrations in `supabase/migrations/`
   - Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` on Vercel
   - Create Storage bucket `organisation-documents`

## Definition of Done (when Supabase connected)

- Auth email login
- Data shared across phones
- Files in private bucket
- RLS by organisation_id
