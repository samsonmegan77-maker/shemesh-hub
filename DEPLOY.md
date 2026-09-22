# Deploy SheMesh Hub on Vercel

## One-time setup

1. Open **https://vercel.com** and sign in with **GitHub** (same account that owns `samsonmegan77-maker`).
2. Click **Add New…** → **Project**.
3. Import **`samsonmegan77-maker/shemesh-hub`**.
4. Settings (usually auto-detected):
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
5. **Environment Variables** (Project → Settings → Environment Variables):
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon/public key  
   (Add for Production, Preview, and Development if offered.)
6. Click **Deploy**.

## Your live link

After deploy succeeds, Vercel shows a URL like:

`https://shemesh-hub.vercel.app`

or

`https://shemesh-hub-xxxx.vercel.app`

You can rename it under **Project → Settings → Domains**.

## After every GitHub push

Pushing to `main` on GitHub automatically redeploys (if you left the Git integration on).

## Send to Karren & Carol

> Test link: **https://YOUR-APP.vercel.app**  
> Open on your phone. Choose Southdale or Bambanani.  
> Try: Payroll, Expenses (Who purchased?), Treasurer, Minutes, Reports.

## Important

- Without Supabase env vars the **UI still loads** (demo mode with local state).
- For real login and saved data, complete **SETUP.md** (Supabase project + migrations + users) and add the two env vars above, then **Redeploy**.
