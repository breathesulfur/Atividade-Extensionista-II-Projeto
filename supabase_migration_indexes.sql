-- ============================================================
-- Migration: índices para acelerar o feed e queries relacionadas
-- ============================================================
--
-- Problema: em produção o login estava demorando ~1 minuto na tela
-- "Carregando postagens...". A causa raiz é a query do feed:
--
--   SELECT * FROM posts
--   LEFT JOIN profiles ON profiles.id = posts.user_id
--   LEFT JOIN post_likes ON post_likes.post_id = posts.id
--   LEFT JOIN post_reactions ON post_reactions.post_id = posts.id
--   LEFT JOIN comments ON comments.post_id = posts.id
--   LEFT JOIN profiles (autor do comentário)
--   ORDER BY posts.created_at DESC
--   LIMIT 50
--
-- Sem os índices abaixo, o Postgres faz seq scan + sort sobre a tabela
-- inteira de posts e nested loops nos joins de comments/likes/reactions.
-- O custo cresce com o volume e RLS multiplica tudo.
--
-- Com os índices, a mesma query vira index scans pontuais.
-- Estimativa: cai de ~60s para <500ms na primeira carga.
--
-- Como rodar:
--   1. Abra o SQL Editor do Supabase do projeto:
--      https://supabase.com/dashboard/project/<seu-projeto>/sql
--   2. Cole este arquivo inteiro e clique em "Run".
--   3. Cada CREATE INDEX é IF NOT EXISTS — seguro para re-executar.
--
-- Sem downtime: CREATE INDEX por padrão bloqueia escritas, mas em
-- tabelas pequenas (caso atual) leva milissegundos. Para tabelas
-- grandes (>1M linhas), trocar por CREATE INDEX CONCURRENTLY.
-- ============================================================

-- ORDER BY posts.created_at DESC + LIMIT 50 vira index scan dos N
-- mais recentes, sem precisar varrer a tabela inteira.
CREATE INDEX IF NOT EXISTS idx_posts_created_at
  ON public.posts(created_at DESC);

-- A PK de post_likes é (post_id, user_id), então em teoria o planner
-- consegue usar pra lookup por post_id. Na prática, sob RLS ele às
-- vezes prefere seq scan. Índice dedicado força o caminho rápido.
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id
  ON public.post_likes(post_id);

-- Mesmo raciocínio para post_reactions.
CREATE INDEX IF NOT EXISTS idx_post_reactions_post_id
  ON public.post_reactions(post_id);

-- Maior ofensor do feed: comments tem PK só em id, então o JOIN
-- por post_id era seq scan. Composto (post_id, created_at) também
-- resolve o ORDER BY dos comentários por post.
CREATE INDEX IF NOT EXISTS idx_comments_post_id_created_at
  ON public.comments(post_id, created_at);

-- Resolve o nested profile lookup do autor do comentário e queries
-- "comentários deste usuário" usadas em Profile.computeStats.
CREATE INDEX IF NOT EXISTS idx_comments_user_id
  ON public.comments(user_id);

-- Acelera fetch dos grupos do usuário e a query "grupos que eu sou
-- membro" usada em Groups.jsx.
CREATE INDEX IF NOT EXISTS idx_group_members_user_id
  ON public.group_members(user_id);

-- Acelera fetch das mensagens de um grupo + ordenação cronológica
-- em group-chat (subscribeToGroupMessages).
CREATE INDEX IF NOT EXISTS idx_group_messages_group_created
  ON public.group_messages(group_id, created_at);

-- Notificações: fetchNotifications filtra por user_id e ordena por
-- created_at DESC com LIMIT 50.
CREATE INDEX IF NOT EXISTS idx_notifications_user_created
  ON public.notifications(user_id, created_at DESC);

-- Verifica o que foi criado.
SELECT
  schemaname,
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
