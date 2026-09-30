# SheMesh Hub — Complete Local Edition

**One login. Two organisations. Strict data separation. No cloud required.**

**Authors:** Romano Samson & Megan Robyn Samson · **Licence:** MIT (see `LICENSE`)

Unified operational system for:

- **Southdale Baptist Church**
- **Bambanani Community Care**

Built for Karren MacKenzie, Carol Lai and Pastor Michael Ford Ho.

---

## Project overview

Complete **local-only** edition. Everything runs in the browser:

- All modules work end-to-end with create + delete
- Data saved in **localStorage**, scoped by organisation
- Southdale data never appears in Bambanani (and vice versa)
- **Data backup** module: export / import JSON between devices
- Usage tracking for builder visibility (navigation metadata only)

## Prerequisites

- Node.js 20+
- npm 10+

## Local setup

```bash
npm install
npm run dev
```

Open the URL shown. Choose a user, then Southdale or Bambanani.

```bash
npm test
npm run build   # → dist/
```

Deploy `dist/` to any static host (Vercel, Netlify, GitHub Pages).

Optional cloud path: see `SETUP.md` and `supabase/migrations/` (not required for local edition).

## Architecture summary

| Concern | Approach |
|---------|----------|
| Local state | **localStorage** with `shemesh:{orgId}:{suffix}` keys |
| Isolation | Strict per-organisation key scoping |
| Payroll | Pure SA PAYE/UIF helpers (`src/lib/payrollCalc.ts`) |
| Backup | Export / import / clear per org |
| Optional API | Vercel `api/usage.js` for usage events only |

See **[ARCHITECTURE.md](./ARCHITECTURE.md)** for persistence, workflows, and fallbacks.

## Operational status

**Complete for local use** (no Supabase required). Cloud / multi-device sync
deliberately omitted for this edition. Last reviewed: Sep 2026.

## Security

Vulnerability reports: see [`.github/SECURITY.md`](./.github/SECURITY.md)  
Primary contact: **romanosamson3@gmail.com**

---

SheMesh Tribe LLC · romanosamson3@gmail.com
