-- User-built lash set inventory
-- Run in Supabase → SQL Editor

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

DROP TRIGGER IF EXISTS inventory_updated_at ON inventory;
CREATE TRIGGER inventory_updated_at
  BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS inventory_user_id_idx ON inventory (user_id);
CREATE INDEX IF NOT EXISTS inventory_name_idx    ON inventory (name);

ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own inventory"   ON inventory;
DROP POLICY IF EXISTS "Users insert own inventory" ON inventory;
DROP POLICY IF EXISTS "Users update own inventory" ON inventory;
DROP POLICY IF EXISTS "Users delete own inventory" ON inventory;

CREATE POLICY "Users read own inventory"   ON inventory FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own inventory" ON inventory FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own inventory" ON inventory FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own inventory" ON inventory FOR DELETE USING (auth.uid() = user_id);
