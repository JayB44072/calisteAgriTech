-- ============================================================
-- ADMIN FEATURES: block/delete users, login logs, notifications
-- À exécuter dans Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Ajouter colonnes statut à profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
  ADD COLUMN IF NOT EXISTS blocked_until TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- 2. Table login_logs (historique connexions réel)
CREATE TABLE IF NOT EXISTS login_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT,
  ip_address TEXT,
  user_agent TEXT,
  status TEXT DEFAULT 'success' CHECK (status IN ('success', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE login_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_read_login_logs" ON login_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR email = 'calistembarga@gmail.com'))
  );

CREATE POLICY "insert_login_log" ON login_logs
  FOR INSERT WITH CHECK (true);

-- 3. Table notifications (si pas encore existante)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  titre TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'alerte', 'succes', 'avertissement')),
  lu BOOLEAN DEFAULT FALSE,
  lien TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own_notif" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_update_own_notif" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "admin_insert_notif" ON notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "users_delete_own_notif" ON notifications
  FOR DELETE USING (auth.uid() = user_id);

-- 4. Trigger: notifier l'utilisateur quand l'admin répond à un ticket
CREATE OR REPLACE FUNCTION notify_on_admin_reply()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.admin_reply IS NOT NULL AND (OLD.admin_reply IS NULL OR OLD.admin_reply != NEW.admin_reply) THEN
    INSERT INTO notifications (user_id, titre, message, type, lien, metadata)
    VALUES (
      NEW.user_id,
      'Réponse de l''équipe support',
      'L''équipe a répondu à votre ticket : ' || substring(NEW.subject, 1, 60),
      'succes',
      '/support',
      jsonb_build_object('ticket_id', NEW.id, 'subject', NEW.subject)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_admin_support_reply ON support_tickets;
CREATE TRIGGER on_admin_support_reply
  AFTER UPDATE ON support_tickets
  FOR EACH ROW EXECUTE FUNCTION notify_on_admin_reply();

-- 5. Trigger: notifier l'utilisateur quand son compte est suspendu
CREATE OR REPLACE FUNCTION notify_on_account_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status != OLD.status THEN
    IF NEW.status = 'suspended' THEN
      INSERT INTO notifications (user_id, titre, message, type, metadata)
      VALUES (
        NEW.id,
        'Compte suspendu',
        'Votre compte a été temporairement suspendu. Contactez le support pour plus d''informations.',
        'alerte',
        jsonb_build_object('blocked_until', NEW.blocked_until)
      );
    ELSIF NEW.status = 'active' AND OLD.status = 'suspended' THEN
      INSERT INTO notifications (user_id, titre, message, type)
      VALUES (
        NEW.id,
        'Compte réactivé',
        'Votre compte a été réactivé. Vous pouvez à nouveau accéder à toutes les fonctionnalités.',
        'succes'
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_status_change ON profiles;
CREATE TRIGGER on_profile_status_change
  AFTER UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION notify_on_account_status_change();

-- 6. Activer realtime sur notifications et support_tickets
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE support_tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE login_logs;

-- 7. Télémétrie: vue agrégée des lectures capteurs par heure
CREATE OR REPLACE VIEW telemetry_hourly AS
SELECT
  date_trunc('hour', created_at) AS heure,
  COUNT(*) AS nb_lectures,
  COUNT(DISTINCT user_id) AS utilisateurs_actifs,
  COUNT(DISTINCT parcelle_id) AS parcelles_actives,
  AVG(temperature_air)::NUMERIC(5,1) AS temp_moy,
  AVG(humidite_sol)::NUMERIC(5,1) AS humidite_moy
FROM sensor_readings
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY date_trunc('hour', created_at)
ORDER BY heure DESC;
