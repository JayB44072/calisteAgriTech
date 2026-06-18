CREATE TABLE calendrier_culture (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parcelle_id UUID REFERENCES parcelles(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  culture TEXT NOT NULL,
  etape TEXT NOT NULL,
  date_debut DATE NOT NULL,
  date_fin DATE NOT NULL,
  description TEXT,
  complete BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE calendrier_culture ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_calendrier" ON calendrier_culture FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_calendrier" ON calendrier_culture FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_calendrier" ON calendrier_culture FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_calendrier" ON calendrier_culture FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_calendrier_user_id ON calendrier_culture(user_id);
CREATE INDEX idx_calendrier_parcelle_id ON calendrier_culture(parcelle_id);