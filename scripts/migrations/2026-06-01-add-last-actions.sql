-- Migration: adiciona coluna last_actions em public.profiles
--
-- Contexto: o sistema de cooldowns (ACTION_COOLDOWNS em
-- src/utils/gamification.js) usa user.lastActions para impedir que o
-- usuário ganhe essência repetidamente em sequência (ex.: 1 comentário a
-- cada 10 minutos). Antes desta migração, o campo não era persistido no
-- BD — sobrevivia apenas na sessão. Um simples refresh apagava o estado
-- e permitia farm de essência via repetição de ação + F5.
--
-- Esta migration é idempotente (IF NOT EXISTS).
--
-- Como aplicar:
--   1. Abrir o SQL Editor do Supabase:
--      https://supabase.com/dashboard/project/gjarqrrvgjhlunnlzhlf/sql
--   2. Colar o conteúdo abaixo e executar.

alter table public.profiles
  add column if not exists last_actions jsonb default '{}';

-- Opcional: backfill explícito para perfis existentes (já está default '{}',
-- mas garante que linhas pré-existentes tenham um objeto vazio em vez de NULL):
update public.profiles
  set last_actions = '{}'::jsonb
  where last_actions is null;
