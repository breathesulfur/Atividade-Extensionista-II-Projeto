-- InclusivChat — Schema V2
-- Execute no SQL Editor do Supabase
-- Adiciona: notifications, feedback, edição de comentários

-- =============================================
-- 1. COLUNA updated_at em comments (para edição)
-- =============================================
alter table public.comments
  add column if not exists updated_at timestamptz default null;

-- =============================================
-- 2. TABELA notifications
-- =============================================
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null, -- 'comment', 'reaction', 'group_join', 'group_message'
  source_user_id uuid references public.profiles(id) on delete set null,
  source_user_name text default '',
  post_id uuid references public.posts(id) on delete cascade,
  group_id uuid references public.groups(id) on delete cascade,
  message text not null,
  read boolean default false,
  created_at timestamptz default now()
);

alter table public.notifications enable row level security;

-- Usuário só vê as próprias notificações
create policy "notifications_select" on public.notifications
  for select using (auth.uid() = user_id);

-- Qualquer autenticado pode inserir notificações (para outros usuários)
create policy "notifications_insert" on public.notifications
  for insert with check (auth.role() = 'authenticated');

-- Usuário só atualiza as próprias (marcar como lida)
create policy "notifications_update" on public.notifications
  for update using (auth.uid() = user_id);

-- Usuário só deleta as próprias
create policy "notifications_delete" on public.notifications
  for delete using (auth.uid() = user_id);

-- =============================================
-- 3. TABELA feedback
-- =============================================
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  user_name text default '',
  rating integer check (rating between 1 and 5),
  category text default 'geral', -- 'geral', 'bug', 'sugestao', 'elogio'
  message text not null,
  created_at timestamptz default now()
);

alter table public.feedback enable row level security;

-- Usuário autenticado pode inserir
create policy "feedback_insert" on public.feedback
  for insert with check (auth.role() = 'authenticated');

-- Usuário só vê o próprio
create policy "feedback_select" on public.feedback
  for select using (auth.uid() = user_id);

-- =============================================
-- 4. REALTIME para notifications
-- =============================================
alter publication supabase_realtime add table public.notifications;
