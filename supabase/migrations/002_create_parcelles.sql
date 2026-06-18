CREATE TABLE parcelles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nom TEXT NOT NULL,
  culture TEXT NOT NULL,
  superficie DECIMAL(10,2) NOT NULL DEFAULT 0,
  zone TEXT NOT NULL DEFAULT 'Centre',
  latitude DECIMAL(9,6),
  longitude DECIMAL(9,6),
  irrigation_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE parcelles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_parcelles" ON parcelles FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_parcelles" ON parcelles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_parcelles" ON parcelles FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_parcelles" ON parcelles FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX idx_parcelles_user_id ON parcelles(user_id);