# SheMesh Hub — Build Plan

Single source of truth for Megan, Romano, Karren and Carol.

Last updated: 22 Sep 2026

---

## Phase Overview

| Phase | Focus | Status |
|-------|-------|--------|
| 0 | Foundation (schema, roles, org switcher) | **Mostly done** |
| 1 | Payroll (biggest stress) | **UI + calc done** |
| 2 | Treasurer Page (bank + reconciliation) | **UI done** |
| 3 | Expenses + Reimbursements | Planned |
| 4 | Monthly Payments + Control Report | Planned |
| 5 | Southdale Departments & Registers | Planned |
| 6 | Bambanani Programmes & Impact | Planned |
| 7 | Documents, full reporting, polish | Planned |
| 8 | Testing with Carol + Karren → train Pastor Mike | Planned |

---

## Phase 0 — Foundation

- [x] Combined architecture & schema designed
- [x] Repository created (`shemesh-hub`)
- [x] Migration files written (`0001`–`0005`)
- [x] Hub landing page (two org cards)
- [x] Org context switcher + permission helpers
- [x] `SETUP.md` with exact steps for Supabase
- [x] `seed.sql` for linking Karren / Carol / Pastor Mike
- [ ] Supabase project created & migrations applied *(you do this)*
- [ ] Real Auth users + memberships inserted *(you do this)*

---

## Phase 1 — Payroll (Karren’s #1 pain)

**Status:** Calculation engine + UI complete. Still needs Supabase save/load.

### Required fields
Gross | Travel Allowance | Bonus | Pension | Housing Allowance (fringe) | Medical Aid (fringe) | PAYE | UIF | Net | Leave due

### Logic
- PAYE: SARS 2025/2026 tax tables (auto)
- UIF: 1% of remuneration, capped at R177.12 (2025/26)
- Fringe benefits deducted before PAYE calculation
- Status flow: Draft → Review → Approved (only Treasurer/Full Admin can approve)
- Printable payslip with organisation details

### Files
- `supabase/migrations/0003_payroll.sql`
- `src/lib/payrollCalc.ts`
- `src/pages/Payroll.tsx`

### Acceptance
Karren or Carol can create a payroll run, see auto-calculated PAYE/UIF, move status to Approved, and print a clean payslip.

---

## Phase 2 — Treasurer Page

**Status:** UI complete (local state). Still needs Supabase persistence + CSV upload.

- [x] Colour highlight + category dropdown + notes for unclear payments
- [x] Opening balance (previous month) + closing balance validation (green/red)
- [x] Pre-loaded category list matching Karren’s monthly payments
- [ ] Upload bank statement (CSV)
- [ ] Link bank lines to `money_movements` / `bank_transactions` tables
- [ ] Save reconciliation record

### Files
- `src/pages/Treasurer.tsx`

---

## Phase 3 — Expenses & Reimbursements

- Mandatory **Who purchased?** field on every expense
- Receipt upload or “Missing receipt” + explanation
- Special toggle: “No receipt – prepaid airtime/WiFi”
- Reimbursement status: pending → approved → paid

---

## Phase 4 — Monthly Payments + Control Report

Pre-load standard payments for Southdale:
Water & Lights (CoJ), Wifi, Telkom, Carguard, SA Rangers, Insurance, General Maintenance, Fuel, Baptist Union, Theological College, Moller Family, Pieter Loots, POP Thailand, Salary, Repairs, Bank Charges

Buttons: + Unforeseen | + Bi-annual | + Once-off

**Monthly Control Report (printable):**
```
Opening Balance (Current + Investment)
+ Total Income
− Total Operating Expenses
= Surplus / Deficit
− Transfers Current → Investment
+ Transfers Investment → Current
− Asset / Bus Purchases
= Closing Current + Closing Investment = Combined Cash
+ Uncleared Items
```

---

## Phase 5 — Southdale Departments & Registers

Departments:
- Sunday Service (roster: Door Duty, Leader, Preacher, Offering, Music)
- Sunday School (Preschool, Gr1-3, Gr4-6, Gr7-9) + teachers + stationery stock
- Junior Youth / Senior Youth
- Music Department (4 teams + sound)
- Missions (Local 23 / Cross-border 23 / International 4-6)
- Ladies / Mens Fellowship
- Bible Study / Prayer

Each teacher keeps attendance + birthday register → sent to Karren as Superintendent.

---

## Phase 6 — Bambanani Programmes

Already partially built in previous pilot:
Dorcas Wardrobe, Dorcas Pantry, Soup Kitchen, Home for the Blind, Yellow Mountain, Booysens, Hong Ning, Karina, Annie Burger, Bellavista, Chrisville Women & Children.

Need: headcount, meals served, stock allocation, impact reporting.

---

## Phase 7 — Documents & Full Reporting

- Private storage bucket
- Minutes of Meeting (auto-pull activity + financials)
- Attendance, Donations, Expense, Income, Investment, YTD reports

---

## Phase 8 — Testing & Handover

1. Carol + Karren test finance & payroll
2. Confirm donor / inventory / outreach workflows
3. Karren trains Pastor Mike
4. Monthly payment to SheMesh Tribe (once Deacons sign off)

---

## Notes from Karren (17–21 Sep 2026)

- Payroll is currently the biggest stress and fear of error.
- Lost receipts and “someone else shopped” is a real problem → “Who purchased?” is mandatory.
- Airtime/WiFi reimbursements often have no receipt.
- Investment account kept around R50 000; excess transferred.
- Governance / Minutes of Meeting tab already loved in the pilot.
- They are happy with a modest monthly contribution once the system is live.

---

## Definition of Done for any module

- Reads and writes real Supabase data
- Respects organisation_id + RLS
- Role permissions enforced
- Works on a phone
- Clear empty / error / loading states
- Print-friendly where relevant
