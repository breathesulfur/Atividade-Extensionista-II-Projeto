-- InclusivChat — Schema Supabase
-- Execute este arquivo no SQL Editor do Supabase (https://supabase.com/dashboard/project/gjarqrrvgjhlunnlzhlf/sql)

-- =============================================
-- TABELAS
-- =============================================

-- Perfis (estende auth.users do Supabase)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null,
  pronoun text not null default '',
  bio text default '',
  city text default '',
  state text default '',
  avatar text default null,
  games text[] default '{}',
  platforms jsonb default '{}',
  essence integer default 0,
  points integer default 0,
  badges text[] default '{}',
  last_login_dates text[] default '{}',
  last_daily_login_essence_date text default null,
  unlocked_themes text[] default '{}',
  unlocked_avatar_frames text[] default '{}',
  unlocked_titles text[] default '{}',
  active_theme text default null,
  active_avatar_frame text default null,
  active_title text default null,
  daily_essence jsonb default '{}',
  -- Mapa de { actionType -> ISO timestamp da última vez que essa ação foi
  -- realizada }. Usado pelos cooldowns (ver gamification.canPerformAction).
  -- Sem persistir, um refresh entre duas ações resetava o cooldown,
  -- permitindo farm de essência. Estrutura: { "SUPPORTIVE_COMMENT": "2026-...",
  -- "CREATE_POST": "2026-...", ... }.
  last_actions jsonb default '{}',
  has_seen_welcome boolean default false,
  created_at timestamptz default now()
);

-- Postagens do feed
create table public.posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);

-- Curtidas nos posts
create table public.post_likes (
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  primary key (post_id, user_id)
);

-- Reações nos posts (❤️, 🎉, etc.)
create table public.post_reactions (
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  emoji text not null,
  primary key (post_id, user_id, emoji)
);

-- Comentários
create table public.comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);

-- Grupos
create table public.groups (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text default '',
  game text not null,
  created_by uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now()
);

-- Membros dos grupos
create table public.group_members (
  group_id uuid references public.groups(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  joined_at timestamptz default now(),
  primary key (group_id, user_id)
);

-- Mensagens dos grupos
create table public.group_messages (
  id uuid default gen_random_uuid() primary key,
  group_id uuid references public.groups(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);

-- =============================================
-- ÍNDICES (performance)
-- =============================================
--
-- Sem esses índices, a query do feed (posts ⨝ likes/reactions/comments
-- com ORDER BY created_at + LIMIT 50) faz seq scan + nested loops sob
-- RLS — em produção isso virava ~60s na primeira carga ("Carregando
-- postagens..."). Para bancos existentes, ver supabase_migration_indexes.sql.

CREATE INDEX IF NOT EXISTS idx_posts_created_at
  ON public.posts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_post_likes_post_id
  ON public.post_likes(post_id);

CREATE INDEX IF NOT EXISTS idx_post_reactions_post_id
  ON public.post_reactions(post_id);

CREATE INDEX IF NOT EXISTS idx_comments_post_id_created_at
  ON public.comments(post_id, created_at);

CREATE INDEX IF NOT EXISTS idx_comments_user_id
  ON public.comments(user_id);

CREATE INDEX IF NOT EXISTS idx_group_members_user_id
  ON public.group_members(user_id);

CREATE INDEX IF NOT EXISTS idx_group_messages_group_created
  ON public.group_messages(group_id, created_at);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.post_likes enable row level security;
alter table public.post_reactions enable row level security;
alter table public.comments enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.group_messages enable row level security;

-- Profiles
create policy "perfis: leitura publica autenticada"
  on public.profiles for select to authenticated using (true);

create policy "perfis: insert proprio"
  on public.profiles for insert to authenticated
  with check (id = auth.uid());

create policy "perfis: update proprio"
  on public.profiles for update to authenticated
  using (id = auth.uid());

-- Posts
create policy "posts: leitura publica autenticada"
  on public.posts for select to authenticated using (true);

create policy "posts: insert autenticado"
  on public.posts for insert to authenticated
  with check (user_id = auth.uid());

create policy "posts: delete proprio"
  on public.posts for delete to authenticated
  using (user_id = auth.uid());

-- Post likes
create policy "likes: leitura publica autenticada"
  on public.post_likes for select to authenticated using (true);

create policy "likes: insert proprio"
  on public.post_likes for insert to authenticated
  with check (user_id = auth.uid());

create policy "likes: delete proprio"
  on public.post_likes for delete to authenticated
  using (user_id = auth.uid());

-- Post reactions
create policy "reacoes: leitura publica autenticada"
  on public.post_reactions for select to authenticated using (true);

create policy "reacoes: insert proprio"
  on public.post_reactions for insert to authenticated
  with check (user_id = auth.uid());

create policy "reacoes: delete proprio"
  on public.post_reactions for delete to authenticated
  using (user_id = auth.uid());

-- Comments
create policy "comentarios: leitura publica autenticada"
  on public.comments for select to authenticated using (true);

create policy "comentarios: insert autenticado"
  on public.comments for insert to authenticated
  with check (user_id = auth.uid());

create policy "comentarios: delete proprio"
  on public.comments for delete to authenticated
  using (user_id = auth.uid());

-- Groups
create policy "grupos: leitura publica autenticada"
  on public.groups for select to authenticated using (true);

create policy "grupos: insert autenticado"
  on public.groups for insert to authenticated
  with check (created_by = auth.uid());

create policy "grupos: delete proprio"
  on public.groups for delete to authenticated
  using (created_by = auth.uid());

-- Group members
create policy "membros: leitura publica autenticada"
  on public.group_members for select to authenticated using (true);

create policy "membros: entrar em grupo"
  on public.group_members for insert to authenticated
  with check (user_id = auth.uid());

create policy "membros: sair de grupo"
  on public.group_members for delete to authenticated
  using (user_id = auth.uid());

-- Group messages
create policy "mensagens: membros podem ler"
  on public.group_messages for select to authenticated
  using (
    exists (
      select 1 from public.group_members
      where group_id = group_messages.group_id
        and user_id = auth.uid()
    )
  );

create policy "mensagens: membros podem enviar"
  on public.group_messages for insert to authenticated
  with check (
    user_id = auth.uid() and
    exists (
      select 1 from public.group_members
      where group_id = group_messages.group_id
        and user_id = auth.uid()
    )
  );

-- =============================================
-- TRIGGER: cria perfil após cadastro
-- =============================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, pronoun, city, state, games, platforms)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'Usuário'),
    coalesce(new.raw_user_meta_data->>'pronoun', ''),
    coalesce(new.raw_user_meta_data->>'city', ''),
    coalesce(new.raw_user_meta_data->>'state', ''),
    case
      when new.raw_user_meta_data->'games' is not null
      then array(select jsonb_array_elements_text(new.raw_user_meta_data->'games'))
      else '{}'
    end,
    coalesce(new.raw_user_meta_data->'platforms', '{}')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================
-- REALTIME
-- =============================================

alter publication supabase_realtime add table public.posts;
alter publication supabase_realtime add table public.post_likes;
alter publication supabase_realtime add table public.post_reactions;
alter publication supabase_realtime add table public.comments;
alter publication supabase_realtime add table public.group_messages;
alter publication supabase_realtime add table public.group_members;
