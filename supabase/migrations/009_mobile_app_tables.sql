-- ============================================================
-- Migration 009 — Tables supplémentaires pour l'app mobile AgriSmart
-- Exécuter dans Supabase Dashboard → SQL Editor
-- ============================================================

-- ─── DIAGNOSTICS PHYTOSANITAIRES ─────────────────────────────
create table if not exists public.diagnostics (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  parcelle_id uuid references public.parcelles(id) on delete set null,
  image_url text,
  disease text not null,
  confidence numeric not null default 0 check (confidence between 0 and 100),
  causes text[] not null default '{}',
  treatment text not null default '',
  preventive_actions text[] not null default '{}',
  severite text default 'modere' check (severite in ('faible', 'modere', 'severe', 'critique')),
  created_at timestamptz not null default now()
);
alter table public.diagnostics enable row level security;
create policy "Users manage own diagnostics" on public.diagnostics for all using (auth.uid() = user_id);
create index if not exists diagnostics_user_created on public.diagnostics(user_id, created_at desc);

-- Storage bucket pour les images de diagnostics
insert into storage.buckets (id, name, public) values ('diagnostics', 'diagnostics', true) on conflict do nothing;
create policy "Diagnostics upload" on storage.objects for insert with check (
  bucket_id = 'diagnostics' and auth.role() = 'authenticated'
);
create policy "Diagnostics public read" on storage.objects for select using (bucket_id = 'diagnostics');

-- ─── MARKETPLACE — PRODUITS ──────────────────────────────────
create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  price numeric not null default 0,
  unit text not null default 'kg',
  quantity numeric not null default 0,
  city text,
  region text,
  phone text,
  crop text,
  image_url text,
  created_at timestamptz not null default now()
);
alter table public.products enable row level security;
create policy "Products public read" on public.products for select using (true);
create policy "Users manage own products" on public.products for all using (auth.uid() = owner_id);

-- ─── PORTEFEUILLES MOBILE MONEY ──────────────────────────────
create table if not exists public.wallets (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  phone text not null,
  carrier text not null default 'MTN' check (carrier in ('MTN', 'Orange')),
  balance numeric not null default 0,
  created_at timestamptz not null default now()
);
alter table public.wallets enable row level security;
create policy "Users manage own wallet" on public.wallets for all using (auth.uid() = owner_id);

create table if not exists public.wallet_transactions (
  id uuid primary key default uuid_generate_v4(),
  wallet_id uuid not null references public.wallets(id) on delete cascade,
  type text not null check (type in ('deposit', 'withdrawal', 'payment', 'receive')),
  amount numeric not null,
  description text,
  reference text,
  status text not null default 'pending' check (status in ('pending', 'completed', 'failed')),
  created_at timestamptz not null default now()
);
alter table public.wallet_transactions enable row level security;
create policy "Users see own transactions" on public.wallet_transactions for select using (
  exists (select 1 from public.wallets w where w.id = wallet_id and w.owner_id = auth.uid())
);
create policy "Users insert transactions" on public.wallet_transactions for insert with check (
  exists (select 1 from public.wallets w where w.id = wallet_id and w.owner_id = auth.uid())
);

-- ─── COMMANDES ───────────────────────────────────────────────
create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  total_amount numeric not null default 0,
  status text not null default 'pending' check (status in ('pending', 'completed', 'cancelled')),
  created_at timestamptz not null default now()
);
alter table public.orders enable row level security;
create policy "Users see own orders" on public.orders for all using (auth.uid() = buyer_id);

create table if not exists public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  quantity numeric not null default 1,
  price numeric not null default 0,
  created_at timestamptz not null default now()
);
alter table public.order_items enable row level security;
create policy "Users see own order items" on public.order_items for select using (
  exists (select 1 from public.orders o where o.id = order_id and o.buyer_id = auth.uid())
);
create policy "Users insert order items" on public.order_items for insert with check (
  exists (select 1 from public.orders o where o.id = order_id and o.buyer_id = auth.uid())
);

-- ─── FINANCES ────────────────────────────────────────────────
create table if not exists public.finances (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('income', 'expense')),
  category text not null default '',
  amount numeric not null default 0,
  transaction_date date not null default current_date,
  notes text,
  created_at timestamptz not null default now()
);
alter table public.finances enable row level security;
create policy "Users manage own finances" on public.finances for all using (auth.uid() = owner_id);
create index if not exists finances_owner_date on public.finances(owner_id, transaction_date desc);

-- ─── RÉCOLTES ────────────────────────────────────────────────
create table if not exists public.harvests (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  parcelle_id uuid references public.parcelles(id) on delete set null,
  crop text not null,
  quantity numeric not null default 0,
  yield numeric,
  revenue numeric,
  harvest_date date not null default current_date,
  created_at timestamptz not null default now()
);
alter table public.harvests enable row level security;
create policy "Users manage own harvests" on public.harvests for all using (auth.uid() = owner_id);
create index if not exists harvests_owner_date on public.harvests(owner_id, harvest_date desc);

-- ─── MESSAGERIE ──────────────────────────────────────────────
create table if not exists public.conversations (
  id uuid primary key default uuid_generate_v4(),
  name text,
  is_group boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.conversations enable row level security;
-- La policy sur conversations est ajoutée APRÈS la création de conversation_participants

create table if not exists public.conversation_participants (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (conversation_id, user_id)
);
alter table public.conversation_participants enable row level security;
create policy "Users see own participations" on public.conversation_participants for all using (auth.uid() = user_id);
create policy "Users insert participations" on public.conversation_participants for insert with check (auth.uid() = user_id);

-- Policy sur conversations ajoutée ici car elle dépend de conversation_participants
create policy "Participants see conversations" on public.conversations for select using (
  exists (select 1 from public.conversation_participants cp where cp.conversation_id = id and cp.user_id = auth.uid())
);

create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);
alter table public.messages enable row level security;
create policy "Participants see messages" on public.messages for select using (
  exists (select 1 from public.conversation_participants cp where cp.conversation_id = messages.conversation_id and cp.user_id = auth.uid())
);
create policy "Authenticated send messages" on public.messages for insert with check (auth.uid() = sender_id);
create index if not exists messages_conv_created on public.messages(conversation_id, created_at asc);

-- ─── COOPÉRATIVES ────────────────────────────────────────────
create table if not exists public.cooperatives (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  creator_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.cooperatives enable row level security;
create policy "Cooperatives public read" on public.cooperatives for select using (true);
create policy "Creators manage own cooperatives" on public.cooperatives for all using (auth.uid() = creator_id);

create table if not exists public.cooperative_members (
  id uuid primary key default uuid_generate_v4(),
  cooperative_id uuid not null references public.cooperatives(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('member', 'manager')),
  status text not null default 'pending' check (status in ('pending', 'approved')),
  created_at timestamptz not null default now(),
  unique (cooperative_id, user_id)
);
alter table public.cooperative_members enable row level security;
create policy "Members see coop memberships" on public.cooperative_members for select using (
  exists (select 1 from public.cooperative_members cm where cm.cooperative_id = cooperative_id and cm.user_id = auth.uid())
);
create policy "Users join cooperatives" on public.cooperative_members for insert with check (auth.uid() = user_id);
create policy "Managers approve members" on public.cooperative_members for update using (
  exists (select 1 from public.cooperative_members cm where cm.cooperative_id = cooperative_id and cm.user_id = auth.uid() and cm.role = 'manager' and cm.status = 'approved')
);

create table if not exists public.cooperative_posts (
  id uuid primary key default uuid_generate_v4(),
  cooperative_id uuid not null references public.cooperatives(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  content text not null,
  created_at timestamptz not null default now()
);
alter table public.cooperative_posts enable row level security;
create policy "Members read coop posts" on public.cooperative_posts for select using (
  exists (select 1 from public.cooperative_members cm where cm.cooperative_id = cooperative_posts.cooperative_id and cm.user_id = auth.uid() and cm.status = 'approved')
);
create policy "Members create posts" on public.cooperative_posts for insert with check (
  exists (select 1 from public.cooperative_members cm where cm.cooperative_id = cooperative_posts.cooperative_id and cm.user_id = auth.uid() and cm.status = 'approved') and auth.uid() = author_id
);

-- ─── PUSH TOKENS ─────────────────────────────────────────────
create table if not exists public.push_tokens (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  token text not null,
  created_at timestamptz not null default now(),
  unique (user_id, token)
);
alter table public.push_tokens enable row level security;
create policy "Users manage own push tokens" on public.push_tokens for all using (auth.uid() = user_id);

-- ─── REALTIME ────────────────────────────────────────────────
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.diagnostics;
