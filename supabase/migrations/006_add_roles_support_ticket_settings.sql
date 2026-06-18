-- Add role to profiles (avatar_url already exists)
ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'agriculteur' CHECK (role IN ('agriculteur', 'gestionnaire', 'fournisseur'));
ALTER TABLE profiles ADD COLUMN phone TEXT;
ALTER TABLE profiles ADD COLUMN city TEXT;
ALTER TABLE profiles ADD COLUMN farm_address TEXT;
ALTER TABLE profiles ADD COLUMN farm_size DECIMAL(10,2);
ALTER TABLE profiles ADD COLUMN primary_crop TEXT;

-- Support tickets table
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  admin_reply TEXT,
  replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_tickets" ON support_tickets FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_tickets" ON support_tickets FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_tickets" ON support_tickets FOR UPDATE
  TO authenticated USING (auth.uid() = user_id);

-- Admin can see all tickets via service role or a special policy
CREATE POLICY "admin_select_all_tickets" ON support_tickets FOR SELECT
  TO authenticated USING (true);

-- Notification settings table
CREATE TABLE notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email_alerts BOOLEAN DEFAULT true,
  push_moisture_alerts BOOLEAN DEFAULT true,
  critical_moisture_threshold DECIMAL(5,2) DEFAULT 30.00,
  critical_temp_high DECIMAL(5,2) DEFAULT 40.00,
  critical_temp_low DECIMAL(5,2) DEFAULT 10.00,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_notif_settings" ON notification_settings FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_notif_settings" ON notification_settings FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_notif_settings" ON notification_settings FOR UPDATE
  TO authenticated USING (auth.uid() = user_id);

-- AI activity log
CREATE TABLE ai_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action_type TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE ai_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_ai_log" ON ai_activity_log FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_ai_log" ON ai_activity_log FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);