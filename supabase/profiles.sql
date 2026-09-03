-- Business profiles (one per user)
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name   TEXT NOT NULL DEFAULT '',
  business_handle TEXT NOT NULL DEFAULT '',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own profile"   ON profiles;
DROP POLICY IF EXISTS "Users insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users update own profile" ON profiles;

CREATE POLICY "Users read own profile"   ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);

-- Optional: set your existing account (replace with your sign-up email)
-- INSERT INTO profiles (user_id, business_name, business_handle)
-- SELECT id, 'Lash Finance', 'CharmMeUp' FROM auth.users WHERE email = 'your@email.com'
-- ON CONFLICT (user_id) DO UPDATE SET business_name = EXCLUDED.business_name, business_handle = EXCLUDED.business_handle;
