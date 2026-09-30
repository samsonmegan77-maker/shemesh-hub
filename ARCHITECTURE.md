# Architecture — SheMesh Hub

## Overview

SheMesh Hub is a **local-first** operational system for two organisations
(Southdale Baptist Church and Bambanani Community Care) with **strict data
separation**. The Complete Local Edition stores all application data in the
browser; optional Supabase migrations exist for a future cloud path but are not
required for daily use.

## Offline-first / local persistence

| Layer | Technology | Role |
|-------|------------|------|
| Primary store | **localStorage** | Organisation-scoped JSON blobs |
| Key scheme | `shemesh:{orgId}:{suffix}` | Isolates Southdale vs Bambanani |
| Helpers | `src/lib/localStore.ts` | `loadJson`, `saveJson`, export/import/clear |
| Suffixes | payroll, treasurer, expenses, … | One key per module dataset |

Data never crosses organisation boundaries: every read/write is keyed by `orgId`.

## State & workflow model

- **No global Zustand store** in the local edition; pages load/save via
  `localStore` helpers and React component state.
- Login selects a demo user + organisation; subsequent navigation stays scoped.
- Payroll calculations (`src/lib/payrollCalc.ts`) are pure functions (PAYE/UIF
  2025/26) with no side effects — easy to unit test.
- Usage events (`src/lib/usage.ts`) report lightweight navigation metadata to a
  Vercel API route; no financial data leaves the browser.

## Fallback mechanisms

- **localStorage quota / failure:** `saveJson` catches and warns; user can export
  backup first.
- **Missing keys:** `loadJson(key, fallback)` always returns a safe default.
- **Device switch:** Data Backup module export/import JSON restores another browser.
- **Supabase path (optional):** migrations under `supabase/migrations/`; client
  stub in `src/lib/supabase.ts` — not used by the local edition default path.

## Modules

Finance (payroll, treasurer, expenses, reimbursements, monthly payments, petty
cash), people/ops (leave, departments, missions, programmes), governance
(documents, minutes, reports), and backup/usage.

## Security boundaries

- Org-scoped keys enforce isolation in the local edition.
- Secrets (Supabase, webhooks) live only in environment variables / Vercel config.
- `.env` is gitignored; `.env.example` documents required names without values.

See `README.md` for setup and operational status.
