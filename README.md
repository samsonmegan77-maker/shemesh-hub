# SheMesh Hub — Complete Local Edition

**One login. Two organisations. Strict data separation. No cloud required.**

Unified operational system for:

- **Southdale Baptist Church**
- **Bambanani Community Care**

Built for Karren MacKenzie, Carol Lai and Pastor Michael Ford Ho.

---

## What this edition is

Complete **local-only** edition. Everything runs in the browser:

- All modules work end-to-end with full create + delete
- Data saved in **localStorage**, scoped by organisation
- Southdale data never appears in Bambanani (and vice versa)
- **Data backup** module: export / import JSON between devices
- **No Supabase**, no server for app data, no monthly cloud bill
- **Usage tracking** so the builder can see when someone opens the app

---

## Users & Roles

| Person | Southdale | Bambanani |
|--------|-----------|-----------|
| **Karren MacKenzie** | Full Admin | Full Admin |
| **Carol Lai** | Treasurer / Finance | Treasurer / Finance |
| **Michael Ford Ho** | Expense + Church Admin | Expense Admin |

---

## Modules

1. Payroll — auto PAYE/UIF, fringe, Draft→Review→Approved, printable payslip
2. Treasurer — bank lines, CSV import, colour coding, balance check
3. Expenses — mandatory "Who purchased?", receipt status
4. Reimbursements — no-receipt prepaid airtime/WiFi, approve/pay
5. Monthly Payments — standard + unforeseen / bi-annual / once-off
6. Petty Cash — debit-card summary + slips
7. Leave book, Tax & fringe book, Investments, Budgets
8. Departments — registers, roster, stationery (Southdale)
9. Missions — local / cross-border / international + safety/medical (Southdale)
10. Programmes — headcount, meals, pantry stock (Bambanani)
11. Documents register, Minutes of Meeting, Reports (live totals from local data)
12. **Data backup** — export / import / clear per organisation
13. **Usage log** (Full Admin) + remote Vercel logs

---

## Quick start

```bash
npm install
npm run dev
```

Open the URL shown. Choose a user, then Southdale or Bambanani.

```bash
npm run build   # → dist/
```

Deploy `dist/` to any static host (Vercel, Netlify, GitHub Pages).

---

## Important

- Data lives **only** in the current browser until you export a backup.
- Clearing site data or switching devices without a backup = data loss.
- Always use **Backup → Download backup JSON** before major changes.
- Each organisation has its own data store. They never mix.

---

## Usage tracking (builder only)

The app reports lightweight events so you can see **when** someone uses it and **which demo user / org / page**.

### What is logged
- App open
- Login (demo user name)
- Organisation entered (Southdale / Bambanani)
- Page views
- Logout

### Where to read it

1. **Vercel Logs (real remote visits)**  
   Project → **Logs** → filter `SHEMESH-USAGE`  
   Each event includes user, org, page, time, session id.

2. **In-app Usage page** (Full Admin only)  
   Shows the local ring buffer for the current browser.

3. **Optional Discord / Slack ping**  
   In Vercel → Settings → Environment Variables, add:
   ```
   USAGE_WEBHOOK_URL=https://discord.com/api/webhooks/...
   ```
   Redeploy after setting. Server forwards each event as a short message.

No personal church financial data is sent — only navigation/session metadata.

---

SheMesh Tribe LLC · romanosamson3@gmail.com
