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
| 3 | Expenses + Reimbursements | **UI done** |
| 4 | Monthly Payments + Control Report | **UI done** |
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

## Phase 1 — Payroll

**Status:** Calculation engine + UI complete. Still needs Supabase save/load.

Files: `0003_payroll.sql`, `payrollCalc.ts`, `Payroll.tsx`

---

## Phase 2 — Treasurer Page

**Status:** UI complete. Still needs Supabase + CSV upload.

Files: `Treasurer.tsx`

---

## Phase 3 — Expenses & Reimbursements

**Status:** UI complete. Still needs Supabase + file upload.

- Mandatory "Who purchased?"
- No-receipt prepaid airtime/WiFi with required explanation
- Reimbursement status: pending → approved → paid

Files: `Expenses.tsx`, `Reimbursements.tsx`

---

## Phase 4 — Monthly Payments + Control Report

**Status:** UI complete. Still needs live data from money_movements.

### Monthly Payments
- [x] Pre-loaded Southdale list from Karren (Water & Lights, Wifi, Telkom, Carguard, SA Rangers, Insurance, General Maintenance, Fuel, Baptist Union, Theological College, Moller Family, Pieter Loots, POP Thailand, Salary, Repairs, Bank Charges)
- [x] Editable amounts + planned/paid toggle
- [x] Add unforeseen / bi-annual / once-off
- [ ] Persist to `monthly_payments` table

### Monthly Control Report (printable)
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
- [x] Layout matches Requirements Register v0.2
- [x] Print button (hides chrome via `.no-print`)
- [x] Demo figures editable until live aggregates are wired
- [ ] Auto-pull from `money_movements`

Files: `MonthlyPayments.tsx`, `Reports.tsx`

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

## Definition of Done for any module

- Reads and writes real Supabase data
- Respects organisation_id + RLS
- Role permissions enforced
- Works on a phone
- Clear empty / error / loading states
- Print-friendly where relevant
