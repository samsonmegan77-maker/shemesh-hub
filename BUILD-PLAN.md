# SheMesh Hub — Build Plan

Single source of truth for Megan, Romano, Karren and Carol.

Last updated: 22 Sep 2026

---

## Phase Overview

| Phase | Focus | Status |
|-------|-------|--------|
| 0 | Foundation (schema, roles, org switcher) | **Mostly done** |
| 1 | Payroll | **UI + calc done** |
| 2 | Treasurer Page | **UI done** |
| 3 | Expenses + Reimbursements | **UI done** |
| 4 | Monthly Payments + Control Report | **UI done** |
| 5 | Southdale Departments & Registers | **UI done** |
| 6 | Bambanani Programmes & Impact | **UI done** |
| 7 | Documents, full reporting, polish | Planned |
| 8 | Testing with Carol + Karren → train Pastor Mike | Planned |

---

## Phase 0 — Foundation

- [x] Schema, repo, Hub, org context, SETUP.md, seed.sql
- [ ] Supabase project + Auth users *(you do this)*

---

## Phase 1–4 — Finance core

All UI complete: Payroll, Treasurer, Expenses, Reimbursements, Monthly Payments, Control Report.
Still need Supabase persistence.

---

## Phase 5 — Southdale Departments & Registers

**Status:** UI complete.

- [x] All 11 departments from Karren pre-loaded with schedule + leaders + notes
- [x] Sunday Service, Sunday School (Superintendent notes), Junior/Senior Youth, Music, Missions, Ladies, Mens, Bible Study, Prayer, Social Care
- [x] Quick register / attendance note entry per department
- [x] Dedicated Missions page: Local (~23) / Cross-border (~23) / International (4–6), cooking team, budget, participants
- [ ] Full roster builder, birthday registers, stationery stock
- [ ] Persist to departments / registers / missions tables

Files: `Departments.tsx`, `Missions.tsx`

---

## Phase 6 — Bambanani Programmes & Impact

**Status:** UI complete.

- [x] All 11 programmes pre-loaded (Dorcas Wardrobe/Pantry, Soup Kitchen, Home for the Blind, Yellow Mountain, Booysens, Hong Ning, Karina, Annie Burger, Bellavista, Chrisville)
- [x] Log activity: date, headcount, meals served, notes
- [x] Per-programme totals + this-month impact summary cards
- [ ] Stock allocation + donor links
- [ ] Persist to programmes / beneficiaries tables

Files: `Programmes.tsx`

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
