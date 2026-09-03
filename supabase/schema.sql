-- Lash Finance — full Supabase schema (v2)
-- Run in: Supabase Dashboard → SQL Editor → New query → Run
--
-- Tables: customers, suppliers, orders (income), expenses
-- Security: Row Level Security — each user sees only their own data
--
-- BEFORE running: enable Email auth in Authentication → Providers → Email

-- ─── Helpers ───────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─── Customers ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS customers (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  handle     TEXT NOT NULL DEFAULT '',
  platform   TEXT NOT NULL DEFAULT '',  -- instagram, snapchat, whatsapp, phone, tiktok, other
  phone      TEXT NOT NULL DEFAULT '',
  email      TEXT NOT NULL DEFAULT '',
  notes      TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, name, handle)
);

-- ─── Suppliers ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS suppliers (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  platform   TEXT NOT NULL DEFAULT '',  -- instagram, tiktok, whatsapp, in_person, other
  handle     TEXT NOT NULL DEFAULT '',
  phone      TEXT NOT NULL DEFAULT '',
  email      TEXT NOT NULL DEFAULT '',
  notes      TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, name)
);

-- ─── Inventory (lash sets users build themselves) ────────────────────────────

CREATE TABLE IF NOT EXISTS inventory (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  mapping    TEXT NOT NULL DEFAULT '',
  price      NUMERIC(10, 2) NOT NULL DEFAULT 0,
  notes      TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, name)
);

-- ─── Orders (income / revenue) ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS orders (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seed_id     TEXT,
  order_date  DATE,
  client      TEXT NOT NULL DEFAULT '',
  handle      TEXT NOT NULL DEFAULT '',
  set_type    TEXT NOT NULL DEFAULT '',
  mapping     TEXT NOT NULL DEFAULT '',
  amount      NUMERIC(10, 2) NOT NULL DEFAULT 0,
  period      TEXT NOT NULL DEFAULT '',
  notes       TEXT NOT NULL DEFAULT '',
  status      TEXT NOT NULL DEFAULT 'completed',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Upgrade v1 → v2 columns (no-op if already present)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id) ON DELETE SET NULL;

-- ─── Expenses ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS expenses (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seed_id      TEXT,
  expense_date DATE,
  vendor       TEXT NOT NULL DEFAULT '',
  description  TEXT NOT NULL DEFAULT '',
  amount       NUMERIC(10, 2) NOT NULL DEFAULT 0,
  period       TEXT NOT NULL DEFAULT '',
  notes        TEXT NOT NULL DEFAULT '',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE expenses ADD COLUMN IF NOT EXISTS user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL;

-- Fix unique constraints (v1 had seed_id alone; v2 uses user_id + seed_id)
ALTER TABLE orders   DROP CONSTRAINT IF EXISTS orders_seed_id_key;
ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_seed_id_key;
CREATE UNIQUE INDEX IF NOT EXISTS orders_user_seed_idx   ON orders   (user_id, seed_id) WHERE seed_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS expenses_user_seed_idx ON expenses (user_id, seed_id) WHERE seed_id IS NOT NULL;

-- ─── Triggers ────────────────────────────────────────────────────────────────

DROP TRIGGER IF EXISTS customers_updated_at ON customers;
CREATE TRIGGER customers_updated_at
  BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS suppliers_updated_at ON suppliers;
CREATE TRIGGER suppliers_updated_at
  BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS inventory_updated_at ON inventory;
CREATE TRIGGER inventory_updated_at
  BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS orders_updated_at ON orders;
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS expenses_updated_at ON expenses;
CREATE TRIGGER expenses_updated_at
  BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Indexes ─────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS customers_user_id_idx   ON customers (user_id);
CREATE INDEX IF NOT EXISTS customers_name_idx      ON customers (name);
CREATE INDEX IF NOT EXISTS suppliers_user_id_idx   ON suppliers (user_id);
CREATE INDEX IF NOT EXISTS suppliers_name_idx      ON suppliers (name);
CREATE INDEX IF NOT EXISTS inventory_user_id_idx   ON inventory (user_id);
CREATE INDEX IF NOT EXISTS inventory_name_idx      ON inventory (name);
CREATE INDEX IF NOT EXISTS orders_user_id_idx      ON orders (user_id);
CREATE INDEX IF NOT EXISTS orders_customer_id_idx  ON orders (customer_id);
CREATE INDEX IF NOT EXISTS orders_order_date_idx   ON orders (order_date DESC);
CREATE INDEX IF NOT EXISTS expenses_user_id_idx    ON expenses (user_id);
CREATE INDEX IF NOT EXISTS expenses_supplier_id_idx ON expenses (supplier_id);
CREATE INDEX IF NOT EXISTS expenses_date_idx       ON expenses (expense_date DESC);

-- ─── Views ───────────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW income AS
SELECT
  id,
  user_id,
  customer_id,
  order_date AS income_date,
  client,
  handle,
  set_type,
  mapping,
  amount,
  period,
  notes,
  status,
  created_at
FROM orders;

CREATE OR REPLACE VIEW supplier_spend AS
SELECT
  s.id AS supplier_id,
  s.user_id,
  s.name,
  s.platform,
  COUNT(e.id) AS purchase_count,
  COALESCE(SUM(e.amount), 0) AS total_spent
FROM suppliers s
LEFT JOIN expenses e ON e.supplier_id = s.id
GROUP BY s.id, s.user_id, s.name, s.platform;

CREATE OR REPLACE VIEW customer_revenue AS
SELECT
  c.id AS customer_id,
  c.user_id,
  c.name,
  c.handle,
  c.platform,
  COUNT(o.id) AS order_count,
  COALESCE(SUM(o.amount), 0) AS total_spent
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
GROUP BY c.id, c.user_id, c.name, c.handle, c.platform;

-- ─── Row Level Security ──────────────────────────────────────────────────────

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders    ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses  ENABLE ROW LEVEL SECURITY;

-- Drop old open policies if upgrading from v1
DROP POLICY IF EXISTS "Allow all on orders"   ON orders;
DROP POLICY IF EXISTS "Allow all on expenses" ON expenses;

-- Customers
DROP POLICY IF EXISTS "Users read own customers"   ON customers;
DROP POLICY IF EXISTS "Users insert own customers" ON customers;
DROP POLICY IF EXISTS "Users update own customers" ON customers;
DROP POLICY IF EXISTS "Users delete own customers" ON customers;

CREATE POLICY "Users read own customers"   ON customers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own customers" ON customers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own customers" ON customers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own customers" ON customers FOR DELETE USING (auth.uid() = user_id);

-- Suppliers
DROP POLICY IF EXISTS "Users read own suppliers"   ON suppliers;
DROP POLICY IF EXISTS "Users insert own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users update own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users delete own suppliers" ON suppliers;

CREATE POLICY "Users read own suppliers"   ON suppliers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own suppliers" ON suppliers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own suppliers" ON suppliers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own suppliers" ON suppliers FOR DELETE USING (auth.uid() = user_id);

-- Inventory
DROP POLICY IF EXISTS "Users read own inventory"   ON inventory;
DROP POLICY IF EXISTS "Users insert own inventory" ON inventory;
DROP POLICY IF EXISTS "Users update own inventory" ON inventory;
DROP POLICY IF EXISTS "Users delete own inventory" ON inventory;

CREATE POLICY "Users read own inventory"   ON inventory FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own inventory" ON inventory FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own inventory" ON inventory FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own inventory" ON inventory FOR DELETE USING (auth.uid() = user_id);

-- Orders (income)
DROP POLICY IF EXISTS "Users read own orders"   ON orders;
DROP POLICY IF EXISTS "Users insert own orders" ON orders;
DROP POLICY IF EXISTS "Users update own orders" ON orders;
DROP POLICY IF EXISTS "Users delete own orders" ON orders;

CREATE POLICY "Users read own orders"   ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own orders" ON orders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own orders" ON orders FOR DELETE USING (auth.uid() = user_id);

-- Expenses
DROP POLICY IF EXISTS "Users read own expenses"   ON expenses;
DROP POLICY IF EXISTS "Users insert own expenses" ON expenses;
DROP POLICY IF EXISTS "Users update own expenses" ON expenses;
DROP POLICY IF EXISTS "Users delete own expenses" ON expenses;

CREATE POLICY "Users read own expenses"   ON expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own expenses" ON expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own expenses" ON expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own expenses" ON expenses FOR DELETE USING (auth.uid() = user_id);
