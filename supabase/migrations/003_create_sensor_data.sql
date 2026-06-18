CREATE TABLE sensor_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parcelle_id UUID REFERENCES parcelles(id) ON DELETE CASCADE NOT NULL,
  temperature DECIMAL(5,2),
  humidite_sol DECIMAL(5,2),
  humidite_air DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE sensor_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_sensor_data" ON sensor_data FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM parcelles WHERE parcelles.id = sensor_data.parcelle_id AND parcelles.user_id = auth.uid())
  );
CREATE POLICY "insert_own_sensor_data" ON sensor_data FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM parcelles WHERE parcelles.id = sensor_data.parcelle_id AND parcelles.user_id = auth.uid())
  );
CREATE POLICY "update_own_sensor_data" ON sensor_data FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM parcelles WHERE parcelles.id = sensor_data.parcelle_id AND parcelles.user_id = auth.uid())
  );
CREATE POLICY "delete_own_sensor_data" ON sensor_data FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM parcelles WHERE parcelles.id = sensor_data.parcelle_id AND parcelles.user_id = auth.uid())
  );

CREATE INDEX idx_sensor_data_parcelle_id ON sensor_data(parcelle_id);
CREATE INDEX idx_sensor_data_created_at ON sensor_data(created_at DESC);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE sensor_data;