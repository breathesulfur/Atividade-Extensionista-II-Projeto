-- ============================================================================
-- LIMPEZA DE DADOS DE TESTE EM PRODUÇÃO
-- ============================================================================
-- Script para identificar e remover dados criados durante testes que
-- acidentalmente foram para o banco de produção (antes da separação de
-- ambientes documentada em docs/AMBIENTES.md).
--
-- ⚠️ COMO USAR:
--   1. Abra o Supabase Dashboard → SQL Editor do projeto inclusivchat-prod
--   2. Execute primeiro os SELECTs (Seção 1) e CONFIRME que os dados
--      mostrados são realmente de teste
--   3. Só depois rode os DELETEs (Seção 2), AJUSTANDO o user_id de teste
--      e a janela de tempo conforme a sua avaliação
--   4. SEMPRE faça um backup (Supabase → Database → Backups → Create
--      backup) antes de rodar DELETEs em produção
-- ============================================================================

-- ---------------------------------------------------------------------------
-- SEÇÃO 1 — IDENTIFICAÇÃO (apenas SELECT, seguros para rodar)
-- ---------------------------------------------------------------------------

-- 1.1 Encontrar o usuário de teste pelo e-mail
SELECT id, email, raw_user_meta_data->>'name' AS name, created_at
FROM auth.users
WHERE email IN ('teste.inclusivchat@gmail.com')
ORDER BY created_at DESC;

-- ▲ Anote o UUID retornado. Substitua nos blocos abaixo onde aparecer
--   :test_user_id (ou cole o UUID literal).

-- 1.2 Posts criados pelo usuário de teste nas últimas 72 horas
SELECT id, content, created_at
FROM posts
WHERE user_id = :test_user_id
  AND created_at >= NOW() - INTERVAL '72 hours'
ORDER BY created_at DESC;

-- 1.3 Comentários criados pelo usuário de teste nas últimas 72 horas
SELECT c.id, c.post_id, c.content, c.created_at,
       p.content AS parent_post
FROM comments c
LEFT JOIN posts p ON p.id = c.post_id
WHERE c.user_id = :test_user_id
  AND c.created_at >= NOW() - INTERVAL '72 hours'
ORDER BY c.created_at DESC;

-- 1.4 Reações (post_reactions) dadas pelo usuário de teste nas últimas 72h
SELECT pr.post_id, pr.emoji, pr.created_at, p.content
FROM post_reactions pr
LEFT JOIN posts p ON p.id = pr.post_id
WHERE pr.user_id = :test_user_id
  AND pr.created_at >= NOW() - INTERVAL '72 hours'
ORDER BY pr.created_at DESC;

-- 1.5 Likes legados (post_likes) do usuário de teste
SELECT pl.post_id, pl.created_at, p.content
FROM post_likes pl
LEFT JOIN posts p ON p.id = pl.post_id
WHERE pl.user_id = :test_user_id
ORDER BY pl.created_at DESC;

-- 1.6 Grupos criados PELO usuário de teste (vão ser DELETADOS em cascata)
SELECT id, name, game, created_at
FROM groups
WHERE created_by = :test_user_id
ORDER BY created_at DESC;

-- 1.7 Participações em grupos (group_members) do usuário de teste
SELECT gm.group_id, gm.joined_at, g.name AS group_name
FROM group_members gm
LEFT JOIN groups g ON g.id = gm.group_id
WHERE gm.user_id = :test_user_id
ORDER BY gm.joined_at DESC;

-- 1.8 Mensagens de chat (group_messages) do usuário de teste
SELECT gm.id, gm.group_id, gm.content, gm.created_at, g.name AS group_name
FROM group_messages gm
LEFT JOIN groups g ON g.id = gm.group_id
WHERE gm.user_id = :test_user_id
  AND gm.created_at >= NOW() - INTERVAL '72 hours'
ORDER BY gm.created_at DESC;

-- 1.9 Notificações geradas pelo usuário de teste (source_user_id)
SELECT id, user_id, type, message, created_at
FROM notifications
WHERE source_user_id = :test_user_id
  AND created_at >= NOW() - INTERVAL '72 hours'
ORDER BY created_at DESC;

-- 1.10 Saldo atual do perfil de teste (para conferir antes de zerar)
SELECT id, name, essence, badges, unlocked_titles, daily_essence
FROM profiles
WHERE id = :test_user_id;


-- ---------------------------------------------------------------------------
-- SEÇÃO 2 — REMOÇÃO (DELETEs — rode APENAS após revisar Seção 1)
-- ---------------------------------------------------------------------------
-- Cada bloco é independente. Comente os que NÃO quiser executar.
-- A ordem importa: deletar filhos antes dos pais para não violar FKs.

BEGIN;

-- 2.1 Notificações disparadas pelo usuário de teste
DELETE FROM notifications
WHERE source_user_id = :test_user_id
  AND created_at >= NOW() - INTERVAL '72 hours';

-- 2.2 Reações (post_reactions) recentes
DELETE FROM post_reactions
WHERE user_id = :test_user_id
  AND created_at >= NOW() - INTERVAL '72 hours';

-- 2.3 Likes legados (post_likes) — sem filtro de data porque é tabela
-- pequena e legada; ajuste se quiser preservar histórico anterior
DELETE FROM post_likes
WHERE user_id = :test_user_id;

-- 2.4 Comentários recentes
DELETE FROM comments
WHERE user_id = :test_user_id
  AND created_at >= NOW() - INTERVAL '72 hours';

-- 2.5 Mensagens de chat recentes
DELETE FROM group_messages
WHERE user_id = :test_user_id
  AND created_at >= NOW() - INTERVAL '72 hours';

-- 2.6 Participações em grupos
DELETE FROM group_members
WHERE user_id = :test_user_id;

-- 2.7 Grupos criados pelo usuário de teste — CUIDADO: deleta em cascata
-- todas as mensagens e membros. Comente se NÃO quiser excluir grupos.
DELETE FROM groups
WHERE created_by = :test_user_id;

-- 2.8 Posts criados pelo usuário de teste — deleta também via FK cascade
-- todos os comments/reactions associados. Confira antes.
DELETE FROM posts
WHERE user_id = :test_user_id
  AND created_at >= NOW() - INTERVAL '72 hours';

-- 2.9 Reseta saldo do perfil de teste para ZERO (em vez de deletar)
UPDATE profiles
SET essence = 0,
    badges = '{}',
    unlocked_themes = '{}',
    unlocked_avatar_frames = '{}',
    unlocked_titles = '{}',
    active_theme = NULL,
    active_avatar_frame = NULL,
    active_title = NULL,
    daily_essence = '{}'
WHERE id = :test_user_id;

-- ⚠️ Confira via SELECT do passo 1.10 ANTES de COMMIT
-- Se algo estiver errado, rode ROLLBACK; em vez de COMMIT;
COMMIT;
-- ROLLBACK;


-- ---------------------------------------------------------------------------
-- SEÇÃO 3 — (Opcional) DELETAR O USUÁRIO DE TESTE INTEIRO
-- ---------------------------------------------------------------------------
-- Use APENAS se quiser eliminar completamente o usuário e tudo associado.
-- Em geral é melhor manter o usuário e zerar dados (Seção 2.9).
--
-- DELETE FROM auth.users WHERE id = :test_user_id;
-- ▲ Isso cascateia para a tabela `profiles` se o FK estiver com ON DELETE CASCADE.
