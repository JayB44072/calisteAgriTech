-- ============================================================
-- PATCH 1 : Corriger la récursion infinie dans les policies RLS
-- ============================================================
-- Le problème : les policies "Admins see all *" font un SELECT sur
-- profiles pendant l'évaluation d'une query sur profiles → boucle infinie → 500.
-- La solution : une fonction SECURITY DEFINER qui lit le rôle SANS déclencher RLS.

create or replace function public.get_my_role()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(
    (select role from profiles where id = auth.uid()),
    'agriculteur'
  );
$$;

-- ─── Remplacer les policies récursives sur profiles ───────────────────────────
drop policy if exists "Admins see all profiles" on public.profiles;
create policy "Admins see all profiles" on public.profiles
  for select using (public.get_my_role() in ('admin', 'gestionnaire'));

-- ─── Remplacer les policies récursives sur parcelles ─────────────────────────
drop policy if exists "Admins see all parcelles" on public.parcelles;
create policy "Admins see all parcelles" on public.parcelles
  for select using (public.get_my_role() in ('admin', 'gestionnaire'));

-- ─── Remplacer les policies récursives sur sensor_devices ────────────────────
drop policy if exists "Admins see all devices" on public.sensor_devices;
create policy "Admins see all devices" on public.sensor_devices
  for select using (public.get_my_role() in ('admin', 'technicien'));

-- ─── Remplacer les policies récursives sur sensor_readings ───────────────────
drop policy if exists "Admins see all readings" on public.sensor_readings;
create policy "Admins see all readings" on public.sensor_readings
  for select using (public.get_my_role() in ('admin', 'technicien'));

-- Policy INSERT : l'utilisateur peut insérer ses propres lectures (simulation IoT)
drop policy if exists "Users insert own readings" on public.sensor_readings;
create policy "Users insert own readings" on public.sensor_readings
  for insert with check (auth.uid() = user_id);

-- ─── Storage : bucket avatars pour les photos de profil ──────────────────────
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "Avatar upload" on storage.objects;
create policy "Avatar upload" on storage.objects
  for insert with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "Avatar read" on storage.objects;
create policy "Avatar read" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "Avatar update" on storage.objects;
create policy "Avatar update" on storage.objects
  for update using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "Avatar delete" on storage.objects;
create policy "Avatar delete" on storage.objects
  for delete using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

-- ─── Remplacer les policies récursives sur materials ─────────────────────────
drop policy if exists "Admins see all materials" on public.materials;
create policy "Admins see all materials" on public.materials
  for select using (public.get_my_role() in ('admin', 'technicien'));

-- ─── Remplacer les policies récursives sur support_tickets ───────────────────
drop policy if exists "Admins manage all tickets" on public.support_tickets;
create policy "Admins manage all tickets" on public.support_tickets
  for all using (public.get_my_role() = 'admin');

-- ============================================================
-- PATCH 2 : Le trigger handle_new_user ne crée pas de profil
-- pour les utilisateurs Google OAuth déjà existants → forcer
-- ============================================================
-- S'assurer que le profil existe pour l'utilisateur connecté
-- (à exécuter une seule fois, pas de risque)
insert into public.profiles (id, email, full_name, role)
select
  au.id,
  au.email,
  coalesce(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)),
  'agriculteur'
from auth.users au
left join public.profiles p on p.id = au.id
where p.id is null
on conflict (id) do nothing;
