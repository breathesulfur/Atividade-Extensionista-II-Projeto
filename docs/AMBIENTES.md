# 🌍 Separação de Ambientes (dev / staging / prod)

> Documento criado depois que descobrimos que **testes em localhost
> estavam refletindo direto em produção**. O fluxo de deploy do brief
> exige um ambiente de homologação separado.

## Problema detectado

O arquivo `.env` apontava para o **mesmo projeto Supabase usado em produção**
(`inclusivchat.vercel.app`). Consequência: qualquer post, comentário,
reação ou criação de grupo feita pelo `npm run dev` localmente gravava
no banco real.

## Arquitetura recomendada

Dois projetos Supabase independentes:

| Ambiente | Projeto Supabase | Usado por |
|---|---|---|
| **Produção** | `inclusivchat-prod` (o atual) | Deploy do Vercel em `inclusivchat.vercel.app` |
| **Homologação / Dev** | `inclusivchat-staging` (a criar) | `npm run dev` local + QA |

Cada projeto Supabase é uma instância separada: banco, autenticação,
storage e realtime independentes. Free tier permite até 2 projetos
ativos por organização.

## Setup inicial (1ª vez)

### 1. Criar o projeto de staging no Supabase

1. Acesse <https://app.supabase.com/projects>
2. Clique em **"New Project"**
3. Configure:
   - **Name**: `inclusivchat-staging`
   - **Database Password**: gere uma senha forte e guarde
   - **Region**: a mesma do projeto de produção (ex.: `South America (São Paulo)`)
   - **Pricing Plan**: Free
4. Aguarde o provisionamento (~2 minutos)

### 2. Aplicar o schema

No novo projeto, vá em **SQL Editor** → **New query** e execute:

1. Conteúdo de `supabase_schema.sql` (tabelas base: profiles, posts,
   groups, comments, reactions, group_members, group_messages, etc.)
2. Conteúdo de `supabase_schema_v2.sql` (notifications, feedback e
   coluna `updated_at` em comments)

Verifique em **Database → Tables** que as tabelas foram criadas.

### 3. Copiar credenciais

No projeto staging: **Settings → API**:

- `Project URL` → copie (ex.: `https://abcdefgh.supabase.co`)
- `anon` key (em "Project API keys") → copie

### 4. Criar `.env.development.local` na raiz do repo

```env
VITE_SUPABASE_URL=https://abcdefgh.supabase.co   # ← URL do staging
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiI...    # ← anon key do staging
```

> O Vite carrega `.env.development.local` automaticamente em
> `npm run dev` e ignora em produção. O `.gitignore` já cobre esse
> arquivo — não precisa se preocupar com commit acidental.

### 5. (Opcional) Criar usuário de teste no staging

No projeto staging, **Authentication → Users → Add user**:
- Email: `teste.inclusivchat@gmail.com`
- Password: `Teste@123`
- ✅ Auto Confirm User

Isso replica o login de QA usado em produção.

## Uso no dia a dia

| Comando | Arquivo lido | Aponta para |
|---|---|---|
| `npm run dev` | `.env.development.local` | Staging |
| `npm run build` | `.env.production` (ou Vercel env vars) | Produção |
| `npm run preview` | `.env.production` se existir, senão `.env` | Depende |

**Recomendação para o Vercel:** configurar as `VITE_SUPABASE_*` direto
no painel do Vercel (Settings → Environment Variables → Production).
Assim o repo não precisa ter `.env.production`.

## Migrar mudanças de schema entre ambientes

Quando alterar o schema (criar coluna, índice, etc.):

1. **Desenvolva no staging** primeiro
2. Salve o SQL em um arquivo: `supabase_schema_v3.sql`, `migration_YYYY_MM_DD.sql`
3. Commit no repo
4. **Aplique manualmente em produção** quando o PR for aprovado

> Tooling automatizado (Supabase CLI com migrations) é o próximo passo
> recomendado, mas exige instalação local do CLI + Docker.

## Limpando dados de teste em produção

Caso algum dado de teste tenha vazado para produção, veja
[`scripts/cleanup-test-data.sql`](../scripts/cleanup-test-data.sql).

## Checklist para confirmar a separação

Após o setup:

- [ ] `npm run dev` rodando localmente → criar um post → conferir que
      ele aparece no Supabase **staging** (não no prod)
- [ ] `inclusivchat.vercel.app` em produção → posts feitos ali continuam
      indo para o Supabase **prod**
- [ ] O usuário `teste.inclusivchat@gmail.com` em staging NÃO existe em prod
      (e vice-versa)
- [ ] `git status` não mostra nenhum `.env*` como não-ignorado
