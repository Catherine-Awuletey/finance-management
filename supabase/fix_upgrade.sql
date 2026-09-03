-- FIX: Run this if you get "column user_id does not exist"
-- You already have old orders/expenses tables from v1 — this upgrades them.
--
-- Steps:
--   1. Sign up in the app first (Authentication → Users must have your account)
--   2. Run THIS entire script in SQL Editor
--   3. Run the backfill block at the bottom (replace email)
--   4. Reload the app → Import sheet data

-- ─── Helper ──────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─── New tables (customers & suppliers) ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS customers (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  handle     TEXT NOT NULL DEFAULT '',
  platform   TEXT NOT NULL DEFAULT '',
  phone      TEXT NOT NULL DEFAULT '',
  notes      TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, name, handle)
);

CREATE TABLE IF NOT EXISTS suppliers (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  platform   TEXT NOT NULL DEFAULT '',
  handle     TEXT NOT NULL DEFAULT '',
  notes      TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, name)
);

-- ─── Upgrade existing orders table ───────────────────────────────────────────

ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id) ON DELETE SET NULL;

-- Ensure other v2 columns exist (safe if already there)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS seed_id    TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_date DATE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS client     TEXT DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS handle     TEXT DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS set_type   TEXT DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS mapping    TEXT DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS amount     NUMERIC(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS period     TEXT DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes      TEXT DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS status     TEXT DEFAULT 'completed';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- ─── Upgrade existing expenses table ─────────────────────────────────────────

ALTER TABLE expenses ADD COLUMN IF NOT EXISTS user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS supplier_id  UUID REFERENCES suppliers(id) ON DELETE SET NULL;

ALTER TABLE expenses ADD COLUMN IF NOT EXISTS seed_id      TEXT;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS expense_date DATE;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS vendor       TEXT DEFAULT '';
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS description  TEXT DEFAULT '';
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS amount       NUMERIC(10,2) DEFAULT 0;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS period       TEXT DEFAULT '';
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS notes        TEXT DEFAULT '';
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS created_at   TIMESTAMPTZ DEFAULT now();
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS updated_at   TIMESTAMPTZ DEFAULT now();

-- ─── Fix old unique constraint on seed_id ────────────────────────────────────

ALTER TABLE orders   DROP CONSTRAINT IF EXISTS orders_seed_id_key;
ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_seed_id_key;

CREATE UNIQUE INDEX IF NOT EXISTS orders_user_seed_idx
  ON orders (user_id, seed_id) WHERE seed_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS expenses_user_seed_idx
  ON expenses (user_id, seed_id) WHERE seed_id IS NOT NULL;

-- ─── Triggers ────────────────────────────────────────────────────────────────

DROP TRIGGER IF EXISTS customers_updated_at ON customers;
CREATE TRIGGER customers_updated_at
  BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS suppliers_updated_at ON suppliers;
CREATE TRIGGER suppliers_updated_at
  BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS orders_updated_at ON orders;
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS expenses_updated_at ON expenses;
CREATE TRIGGER expenses_updated_at
  BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Indexes ─────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS customers_user_id_idx    ON customers (user_id);
CREATE INDEX IF NOT EXISTS suppliers_user_id_idx    ON suppliers (user_id);
CREATE INDEX IF NOT EXISTS orders_user_id_idx       ON orders (user_id);
CREATE INDEX IF NOT EXISTS orders_customer_id_idx   ON orders (customer_id);
CREATE INDEX IF NOT EXISTS orders_order_date_idx    ON orders (order_date DESC);
CREATE INDEX IF NOT EXISTS expenses_user_id_idx     ON expenses (user_id);
CREATE INDEX IF NOT EXISTS expenses_supplier_id_idx ON expenses (supplier_id);
CREATE INDEX IF NOT EXISTS expenses_date_idx        ON expenses (expense_date DESC);

-- ─── Views ───────────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW income AS
SELECT id, user_id, customer_id, order_date AS income_date,
       client, handle, set_type, mapping, amount, period, notes, status, created_at
FROM orders;

CREATE OR REPLACE VIEW supplier_spend AS
SELECT s.id AS supplier_id, s.user_id, s.name, s.platform,
       COUNT(e.id) AS purchase_count, COALESCE(SUM(e.amount), 0) AS total_spent
FROM suppliers s
LEFT JOIN expenses e ON e.supplier_id = s.id
GROUP BY s.id, s.user_id, s.name, s.platform;

CREATE OR REPLACE VIEW customer_revenue AS
SELECT c.id AS customer_id, c.user_id, c.name, c.handle, c.platform,
       COUNT(o.id) AS order_count, COALESCE(SUM(o.amount), 0) AS total_spent
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
GROUP BY c.id, c.user_id, c.name, c.handle, c.platform;

-- ─── Row Level Security ────────────────────────────────────────────────────────

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders    ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on orders"   ON orders;
DROP POLICY IF EXISTS "Allow all on expenses" ON expenses;

DROP POLICY IF EXISTS "Users read own customers"   ON customers;
DROP POLICY IF EXISTS "Users insert own customers" ON customers;
DROP POLICY IF EXISTS "Users update own customers" ON customers;
DROP POLICY IF EXISTS "Users delete own customers" ON customers;
CREATE POLICY "Users read own customers"   ON customers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own customers" ON customers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own customers" ON customers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own customers" ON customers FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users read own suppliers"   ON suppliers;
DROP POLICY IF EXISTS "Users insert own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users update own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users delete own suppliers" ON suppliers;
CREATE POLICY "Users read own suppliers"   ON suppliers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own suppliers" ON suppliers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own suppliers" ON suppliers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own suppliers" ON suppliers FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users read own orders"   ON orders;
DROP POLICY IF EXISTS "Users insert own orders" ON orders;
DROP POLICY IF EXISTS "Users update own orders" ON orders;
DROP POLICY IF EXISTS "Users delete own orders" ON orders;
CREATE POLICY "Users read own orders"   ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own orders" ON orders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own orders" ON orders FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users read own expenses"   ON expenses;
DROP POLICY IF EXISTS "Users insert own expenses" ON expenses;
DROP POLICY IF EXISTS "Users update own expenses" ON expenses;
DROP POLICY IF EXISTS "Users delete own expenses" ON expenses;
CREATE POLICY "Users read own expenses"   ON expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own expenses" ON expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own expenses" ON expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own expenses" ON expenses FOR DELETE USING (auth.uid() = user_id);

-- ─── BACKFILL: assign your existing rows to your account ─────────────────────
-- Replace 'your@email.com' with the email you signed up with, then run this block:

-- UPDATE orders   SET user_id = (SELECT id FROM auth.users WHERE email = 'your@email.com') WHERE user_id IS NULL;
-- UPDATE expenses SET user_id = (SELECT id FROM auth.users WHERE email = 'your@email.com') WHERE user_id IS NULL;

-- Verify:
-- SELECT COUNT(*) AS orders FROM orders WHERE user_id IS NOT NULL;
-- SELECT COUNT(*) AS expenses FROM expenses WHERE user_id IS NOT NULL;
