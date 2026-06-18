-- Admin access + account blocking support for profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_profiles_is_blocked ON profiles (is_blocked);

-- Allow the platform admin to manage every profile row from the client.
DROP POLICY IF EXISTS "admin_select_all_profiles" ON profiles;
CREATE POLICY "admin_select_all_profiles" ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.email() = 'admin@gmail.com');

DROP POLICY IF EXISTS "admin_update_all_profiles" ON profiles;
CREATE POLICY "admin_update_all_profiles" ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.email() = 'admin@gmail.com')
  WITH CHECK (auth.email() = 'admin@gmail.com');

DROP POLICY IF EXISTS "admin_delete_all_profiles" ON profiles;
CREATE POLICY "admin_delete_all_profiles" ON profiles
  FOR DELETE
  TO authenticated
  USING (auth.email() = 'admin@gmail.com');
