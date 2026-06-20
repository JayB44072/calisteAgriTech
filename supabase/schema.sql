-- ============================================================
-- CalisteAgriTech — Schéma Supabase complet
-- Exécuter dans l'éditeur SQL de Supabase Dashboard
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ─── PROFILES ───────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  email text,
  role text not null default 'agriculteur' check (role in ('agriculteur', 'gestionnaire', 'fournisseur', 'admin', 'technicien')),
  phone text,
  city text,
  farm_address text,
  farm_size numeric,
  primary_crop text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "Users see own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Admins see all profiles" on public.profiles for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url',
    new.email,
    'agriculteur'
  )
  on conflict (id) do update set
    full_name = coalesce(excluded.full_name, profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, profiles.avatar_url),
    email = coalesce(excluded.email, profiles.email),
    updated_at = now();
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── PARCELLES ──────────────────────────────────────────────
create table if not exists public.parcelles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  nom text not null,
  description text,
  superficie numeric not null default 1,
  unite text not null default 'ha',
  culture text not null default '',
  variete text,
  type_sol text,
  ph_sol numeric,
  drainage text,
  fertilite text,
  statut text not null default 'active' check (statut in ('active', 'inactive', 'archivee', 'en_preparation')),
  irrigation_active boolean not null default false,
  type_irrigation text,
  source_eau text,
  latitude numeric,
  longitude numeric,
  adresse text,
  zone text,
  geometry jsonb,
  photo_url text,
  date_semis date,
  date_recolte_estimee date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.parcelles enable row level security;
create policy "Users manage own parcelles" on public.parcelles for all using (auth.uid() = user_id);
create policy "Admins see all parcelles" on public.parcelles for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'gestionnaire'))
);

-- ─── SENSOR DEVICES ─────────────────────────────────────────
create table if not exists public.sensor_devices (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  parcelle_id uuid references public.parcelles(id) on delete set null,
  nom text not null,
  type text not null check (type in ('humidite_sol', 'temperature_sol', 'temperature_air', 'humidite_air', 'niveau_eau', 'pluviometrie', 'multi')),
  fabricant text,
  numero_serie text unique,
  batterie integer check (batterie between 0 and 100),
  signal integer check (signal between 0 and 100),
  statut text not null default 'actif' check (statut in ('actif', 'inactif', 'maintenance', 'hors_ligne')),
  latitude numeric,
  longitude numeric,
  firmware_version text,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.sensor_devices enable row level security;
create policy "Users manage own devices" on public.sensor_devices for all using (auth.uid() = user_id);
create policy "Admins see all devices" on public.sensor_devices for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'technicien'))
);

-- ─── SENSOR READINGS ────────────────────────────────────────
create table if not exists public.sensor_readings (
  id uuid primary key default uuid_generate_v4(),
  device_id uuid references public.sensor_devices(id) on delete cascade,
  parcelle_id uuid references public.parcelles(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  temperature_sol numeric,
  temperature_air numeric,
  humidite_sol numeric,
  humidite_air numeric,
  niveau_eau numeric,
  pluviometrie numeric,
  created_at timestamptz not null default now()
);
alter table public.sensor_readings enable row level security;
create index if not exists sensor_readings_parcelle_created on public.sensor_readings(parcelle_id, created_at desc);
create index if not exists sensor_readings_user_created on public.sensor_readings(user_id, created_at desc);
create policy "Users see own readings" on public.sensor_readings for select using (auth.uid() = user_id);
create policy "Users insert own readings" on public.sensor_readings for insert with check (auth.uid() = user_id);
create policy "Admins see all readings" on public.sensor_readings for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'technicien'))
);

-- ─── IRRIGATION PLANS ───────────────────────────────────────
create table if not exists public.irrigation_plans (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  parcelle_id uuid not null references public.parcelles(id) on delete cascade,
  nom text not null,
  type text not null default 'manuel' check (type in ('manuel', 'programmé', 'automatique')),
  statut text not null default 'actif' check (statut in ('actif', 'inactif', 'en_cours', 'terminé')),
  debit_m3h numeric,
  duree_minutes integer,
  heure_debut time,
  jours_semaine integer[],
  volume_total_m3 numeric default 0,
  derniere_session timestamptz,
  prochaine_session timestamptz,
  actif boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.irrigation_plans enable row level security;
create policy "Users manage own irrigation" on public.irrigation_plans for all using (auth.uid() = user_id);

-- ─── IRRIGATION HISTORY ─────────────────────────────────────
create table if not exists public.irrigation_history (
  id uuid primary key default uuid_generate_v4(),
  plan_id uuid references public.irrigation_plans(id) on delete set null,
  parcelle_id uuid not null references public.parcelles(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  debut_at timestamptz not null default now(),
  fin_at timestamptz,
  duree_minutes integer,
  volume_m3 numeric,
  declenchement text default 'manuel' check (declenchement in ('manuel', 'programmé', 'automatique')),
  statut text default 'en_cours' check (statut in ('en_cours', 'terminé', 'interrompu')),
  created_at timestamptz not null default now()
);
alter table public.irrigation_history enable row level security;
create policy "Users see own irrigation history" on public.irrigation_history for all using (auth.uid() = user_id);

-- ─── MATERIALS ──────────────────────────────────────────────
create table if not exists public.materials (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  parcelle_id uuid references public.parcelles(id) on delete set null,
  nom text not null,
  type text not null check (type in ('capteur', 'pompe', 'station_meteo', 'drone', 'vehicule', 'outil', 'autre')),
  fabricant text,
  modele text,
  numero_serie text,
  batterie integer check (batterie between 0 and 100),
  signal integer check (signal between 0 and 100),
  statut text not null default 'actif' check (statut in ('actif', 'inactif', 'maintenance', 'hors_service')),
  localisation text,
  derniere_maintenance date,
  prochaine_maintenance date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.materials enable row level security;
create policy "Users manage own materials" on public.materials for all using (auth.uid() = user_id);
create policy "Admins see all materials" on public.materials for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'technicien'))
);

-- ─── NOTIFICATIONS ──────────────────────────────────────────
create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  titre text not null,
  message text not null,
  type text not null default 'info' check (type in ('info', 'alerte', 'succes', 'avertissement')),
  lu boolean not null default false,
  lien text,
  metadata jsonb,
  created_at timestamptz not null default now()
);
alter table public.notifications enable row level security;
create index if not exists notifications_user_created on public.notifications(user_id, created_at desc);
create policy "Users see own notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "Users update own notifications" on public.notifications for update using (auth.uid() = user_id);
create policy "Users delete own notifications" on public.notifications for delete using (auth.uid() = user_id);
create policy "System insert notifications" on public.notifications for insert with check (true);

-- ─── SUPPORT TICKETS ────────────────────────────────────────
create table if not exists public.support_tickets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  subject text not null,
  message text not null,
  statut text not null default 'ouvert' check (statut in ('ouvert', 'en_cours', 'resolu', 'ferme')),
  priorite text not null default 'medium' check (priorite in ('low', 'medium', 'high', 'critical')),
  admin_reply text,
  replied_at timestamptz,
  replied_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.support_tickets enable row level security;
create policy "Users manage own tickets" on public.support_tickets for select using (auth.uid() = user_id);
create policy "Users insert own tickets" on public.support_tickets for insert with check (auth.uid() = user_id);
create policy "Admins manage all tickets" on public.support_tickets for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- ─── NOTIFICATION SETTINGS ──────────────────────────────────
create table if not exists public.notification_settings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid unique not null references public.profiles(id) on delete cascade,
  email_alerts boolean not null default true,
  push_moisture_alerts boolean not null default true,
  push_weather_alerts boolean not null default true,
  push_irrigation_alerts boolean not null default true,
  push_sensor_alerts boolean not null default true,
  critical_moisture_threshold numeric not null default 30,
  critical_temp_high numeric not null default 40,
  critical_temp_low numeric not null default 5,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.notification_settings enable row level security;
create policy "Users manage own notif settings" on public.notification_settings for all using (auth.uid() = user_id);

-- ─── CALENDRIER CULTURAL ────────────────────────────────────
create table if not exists public.calendrier_culture (
  id uuid primary key default uuid_generate_v4(),
  parcelle_id uuid not null references public.parcelles(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  culture text not null,
  etape text not null,
  date_debut date not null,
  date_fin date not null,
  description text,
  complete boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.calendrier_culture enable row level security;
create policy "Users manage own calendrier" on public.calendrier_culture for all using (auth.uid() = user_id);

-- ─── AI ACTIVITY LOG ────────────────────────────────────────
create table if not exists public.ai_activity_log (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  action_type text not null,
  details text,
  created_at timestamptz not null default now()
);
alter table public.ai_activity_log enable row level security;
create policy "Users see own ai logs" on public.ai_activity_log for all using (auth.uid() = user_id);

-- ─── STORAGE BUCKETS ────────────────────────────────────────
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('parcelle-photos', 'parcelle-photos', true) on conflict do nothing;

create policy "Avatar upload" on storage.objects for insert with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Avatar public read" on storage.objects for select using (bucket_id = 'avatars');
create policy "Avatar update" on storage.objects for update using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Parcelle photo upload" on storage.objects for insert with check (bucket_id = 'parcelle-photos' and auth.role() = 'authenticated');
create policy "Parcelle photo public read" on storage.objects for select using (bucket_id = 'parcelle-photos');

-- ─── REALTIME ───────────────────────────────────────────────
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.sensor_readings;
alter publication supabase_realtime add table public.parcelles;
