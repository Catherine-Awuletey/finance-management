# Lash Finance — CharmMeUp

Finance management for your custom strip lash business.

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite 6 |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Email/Password |
| Security | Row Level Security (RLS) — each user sees only their data |

## Database tables

| Table | Purpose |
|-------|---------|
| `orders` | Income / lash orders (revenue) |
| `expenses` | Supply purchases |
| `customers` | Client contacts (name, handle, platform) |
| `suppliers` | Vendors (Bibibeauty, Lash Supply Store, etc.) |
| `income` | View over orders |
| `customer_revenue` | View — total spent per customer |
| `supplier_spend` | View — total spent per supplier |

---

## Setup guide (step by step)

### Step 1 — Create Supabase project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. **New project** → name it `lash-finance`
3. Save your database password somewhere safe
4. Wait ~2 minutes for it to provision

### Step 2 — Enable email auth

1. In Supabase: **Authentication** → **Providers**
2. Make sure **Email** is enabled
3. For solo use, you can disable **Confirm email** under Email settings (optional — makes sign-up instant)

### Step 3 — Run the schema

1. Open **SQL Editor** → **New query**
2. Copy the entire contents of `supabase/schema.sql`
3. Click **Run**
4. Check **Table Editor** — you should see: `customers`, `suppliers`, `orders`, `expenses`

> **Already ran the old schema?** Run `supabase/migration_v2.sql` instead, then assign your `user_id` to existing rows.

### Step 4 — Add API keys to the app

```bash
cd ~/Desktop/Management
cp .env.example .env
```

Edit `.env` with values from **Project Settings → API**:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...your-anon-key
```

### Step 5 — Start the app

```bash
npm install
npm run dev
```

Open `http://localhost:5173`

### Step 6 — Sign up & import data

1. **Sign up** with your email and password
2. Click **Import sheet data** to load your original orders, expenses, customers, and suppliers
3. Done — everything syncs to Supabase automatically

---

## How RLS works

Every table has `user_id` linked to your Supabase account. Policies ensure:

```sql
-- You can only read/write rows where user_id = your auth id
auth.uid() = user_id
```

Nobody else can see your lash business data, even with the public anon key.

---

## What happens when you edit

| Action | Result |
|--------|--------|
| Add order | Creates/links a **customer** automatically from client + handle |
| Add expense | Creates/links a **supplier** automatically from vendor name |
| Edit / delete | Updates Supabase immediately |
| Sign in on another device | Same data loads from cloud |
| Reset data | Clears your rows and re-imports the original sheet |

---

## Project structure

```
Management/
├── supabase/
│   ├── schema.sql        ← Run once (new projects)
│   └── migration_v2.sql  ← Upgrade from old open schema
├── src/
│   ├── lib/supabase.js   ← Client + field mapping
│   ├── lib/db.js         ← CRUD + seed logic
│   ├── hooks/useAuth.js  ← Sign in / sign up
│   └── data/seedData.js  ← Original sheet
└── .env                  ← Your Supabase keys (never commit)
```

---

## Offline mode

Click **Continue offline (localStorage)** on the setup screen if you want to use the app without Supabase. Data stays in your browser only.

## Export CSV

Downloads a backup anytime — useful before resetting or for spreadsheets.
