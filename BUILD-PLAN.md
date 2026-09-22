# SheMesh Hub — Build Plan

Single source of truth for Megan, Romano, Karren and Carol.

Last updated: 22 Sep 2026

---

## Phase Overview

| Phase | Focus | Status |
|-------|-------|--------|
| 0 | Foundation | **Mostly done** |
| 1 | Payroll | **UI + calc done** |
| 2 | Treasurer | **UI done** |
| 3 | Expenses + Reimbursements | **UI done** |
| 4 | Monthly Payments + Control Report | **UI done** |
| 5 | Southdale Departments & Missions | **UI done** |
| 6 | Bambanani Programmes & Impact | **UI done** |
| 7 | Documents + full reporting + Minutes | **UI done** |
| 8 | Testing with Carol + Karren → train Pastor Mike | **Next** |

---

## Phase 7 — Documents, Minutes & Report suite

**Status:** UI complete.

### Documents
- [x] Document register with entity types (receipt, invoice, bank statement, minutes, policy, payslip…)
- [x] Path convention documented: `{org_id}/{entity_type}/{id}/{filename}`
- [x] Storage bucket setup in SETUP.md (`organisation-documents`, private)
- [ ] Real file upload to Supabase Storage

### Minutes of Meeting
- [x] Title, date, attendees, ministry activity, action items, financial notes
- [x] Draft → Final status
- [x] Print-friendly layout (Karren loved Governance in the pilot)
- [ ] Auto-pull from registers + Control Report

### Reports suite
- [x] Monthly Control Report (full calculation, printable)
- [x] Donations, Expenses, Income, Investment, YTD, Attendance report shells (print-ready placeholders)
- [ ] Live aggregates from Supabase

Files: `Documents.tsx`, `Minutes.tsx`, `ReportsHub.tsx`, `Reports.tsx`

---

## Phase 8 — Testing & Handover

1. Create Supabase project + run migrations + seed users (SETUP.md)
2. Carol + Karren test finance & payroll on real data
3. Confirm donor / inventory / outreach workflows
4. Karren trains Pastor Mike
5. Monthly contribution to SheMesh Tribe (once Deacons sign off)

---

## Remaining technical work

- Wire all pages to Supabase (read/write + RLS)
- Auth login screen (replace mock role)
- File upload for receipts/documents
- CSV bank statement import
- Live report aggregates

---

## Definition of Done for any module

- Reads and writes real Supabase data
- Respects organisation_id + RLS
- Role permissions enforced
- Works on a phone
- Clear empty / error / loading states
- Print-friendly where relevant
