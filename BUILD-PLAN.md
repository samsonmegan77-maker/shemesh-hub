# SheMesh Hub — Build Plan

Single source of truth for Megan, Romano, Karren and Carol.

Last updated: 23 Sep 2026

---

## Phase Overview

| Phase | Focus | Status |
|-------|-------|--------|
| 0 | Foundation | **Done** |
| 1 | Payroll | **Done (UI + calc + history + printable payslip)** |
| 2 | Treasurer | **Done (UI + CSV import + balance check)** |
| 3 | Expenses + Reimbursements | **Done** |
| 4 | Monthly Payments + Petty Cash + Control Report | **Done** |
| 5 | Southdale Departments & Missions | **Done (rosters, registers, birthdays, stock)** |
| 6 | Bambanani Programmes & Impact | **UI done** |
| 7 | Documents + reporting + Minutes | **Done (file pick + sample reports)** |
| 8 | Testing with Carol + Karren → train Pastor Mike | **Next** |
| 9 | Supabase connection | **Deferred (by request)** |

---

## Completed without Supabase (23 Sep 2026)

- Demo login screen (Karren / Carol / Pastor Mike) with correct roles per org
- localStorage persistence for all finance & department data (survives refresh)
- Payroll: multi-record history, Draft → Review → Approved, full printable payslip
- Treasurer: CSV bank statement import (Date/Description/Amount or Debit/Credit)
- Petty Cash screen (debit-card summary + slips)
- Departments: Register (attendance, birthdays, parent details), Weekly roster, Stationery stock
- Documents: choose file from device + register by name
- Reports: sample figures for Donations, Expenses, Income, Investment, YTD, Attendance
- Role-gated navigation

---

## Still requires Supabase (not done — per request)

- Real Auth (email login)
- Shared multi-device database (RLS)
- File upload to private Storage bucket
- Live report aggregates from DB
- Minutes auto-pull from registers / Control Report

---

## Definition of Done for any module

- Reads and writes real Supabase data (when connected)
- Respects organisation_id + RLS
- Role permissions enforced
- Works on a phone
- Clear empty / error / loading states
- Print-friendly where relevant
