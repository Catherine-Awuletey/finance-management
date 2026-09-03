-- Migration v1 → v2 (if you already ran the old open-access schema)
-- Run AFTER signing up once in the app so auth.users has your account.
-- Replace YOUR_USER_ID with your UUID from: Authentication → Users

-- Or use this dynamic version (run while logged into SQL editor as postgres):

-- 1. Add customers & suppliers tables (same as schema.sql — safe to re-run)
--    Run the full supabase/schema.sql instead if starting fresh.

-- 2. Add columns to existing tables (skip if already exist)
ALTER TABLE orders   ADD COLUMN IF NOT EXISTS user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE orders   ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id) ON DELETE SET NULL;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL;

-- 3. Drop old permissive policies
DROP POLICY IF EXISTS "Allow all on orders"   ON orders;
DROP POLICY IF EXISTS "Allow all on expenses" ON expenses;

-- 4. Assign existing rows to your user (run once — set your email)
-- Find your id first:
--   SELECT id, email FROM auth.users;
-- Then uncomment and set:
-- UPDATE orders   SET user_id = 'YOUR-USER-UUID-HERE' WHERE user_id IS NULL;
-- UPDATE expenses SET user_id = 'YOUR-USER-UUID-HERE' WHERE user_id IS NULL;

-- 5. Make user_id required going forward (after backfill)
-- ALTER TABLE orders   ALTER COLUMN user_id SET NOT NULL;
-- ALTER TABLE expenses ALTER COLUMN user_id SET NOT NULL;

-- 6. Re-run the RLS policies section from schema.sql (customers, suppliers, orders, expenses)
