-- ============================================================
-- FIX: Support tickets RLS + colonnes status/priority
-- Exécuter dans Supabase Dashboard → SQL Editor
-- ⚠️  EMAIL ADMIN — modifier ici ET dans src/lib/constants.ts
-- ============================================================

-- 1. Corriger la politique admin : vérifier par email (pas role)
DROP POLICY IF EXISTS "Admins manage all tickets" ON public.support_tickets;

CREATE POLICY "Admins manage all tickets" ON public.support_tickets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND (role = 'admin' OR email = 'calistembarga@gmail.com') -- ⚠️ ADMIN_EMAIL
    )
  );

-- 2. Permettre aux admins de modifier les tickets (UPDATE pour répondre)
DROP POLICY IF EXISTS "Admins update all tickets" ON public.support_tickets;

CREATE POLICY "Admins update all tickets" ON public.support_tickets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND (role = 'admin' OR email = 'calistembarga@gmail.com') -- ⚠️ ADMIN_EMAIL
    )
  );

-- 3. S'assurer que le profil admin a le bon rôle
UPDATE public.profiles
SET role = 'admin', updated_at = now()
WHERE email = 'calistembarga@gmail.com'; -- ⚠️ ADMIN_EMAIL

-- 4. Activer realtime sur support_tickets (si pas déjà fait)
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_tickets;

-- 5. Vérification : lister les policies actuelles sur support_tickets
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'support_tickets';
