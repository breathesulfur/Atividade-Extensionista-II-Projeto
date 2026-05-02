# InclusivChat 🌈

Plataforma social gamer inclusiva e segura voltada ao acolhimento de mulheres e da comunidade LGBTQIAPN+, promovendo interações respeitosas, pertencimento e bem-estar digital por meio de mecânicas positivas e não competitivas.

🔗 **Deploy:** [inclusivchat.vercel.app](https://inclusivchat.vercel.app)

---

## 🌟 Visão Geral

Desenvolvido como Atividade Extensionista II do curso de Análise e Desenvolvimento de Sistemas (UNINTER), o InclusivChat cria um ambiente digital seguro onde usuárias e usuários podem se expressar livremente, participar de grupos temáticos e ser incentivados a comportamentos saudáveis por meio de um sistema de recompensas simbólicas — sem rankings públicos nem comparações entre pessoas.

---

## 🧩 Funcionalidades

### 👤 Perfil
- Cadastro com nome, pronomes, cidade, estado e bio
- Foto de perfil personalizada
- Jogos de interesse e plataformas de jogo (Steam, Xbox, PlayStation, etc.)
- Redes sociais (Instagram, X/Twitter, YouTube, Discord)
- Exibição de conquistas: selos, títulos místicos e molduras de avatar
- Tema visual ativo refletido em todo o perfil

### 📰 Feed
- Criação e exclusão de postagens
- Comentários com **edição e exclusão** pelo próprio autor
- Reações com emojis personalizados
- Denúncia de conteúdo ofensivo
- Filtro automático de palavras inapropriadas
- Atualizações em tempo real via Supabase Realtime

### 👥 Grupos
- Criação, participação e saída de grupos temáticos por jogo
- Chat em tempo real dentro de cada grupo
- Notificação ao criador quando um novo membro entra ou envia mensagem

### 🔔 Notificações
- Sino no header com badge de não lidas
- Notificação em tempo real quando:
  - Alguém comenta em sua postagem
  - Alguém reage à sua postagem
  - Novo membro entra no seu grupo
  - Alguém envia mensagem no seu grupo
- Marcação automática como lida, exclusão individual e "Limpar tudo"

### 💜 Feedback
- Formulário de avaliação com estrelas (1–5), categorias (Geral, Bug, Sugestão, Elogio) e mensagem livre
- Respostas salvas na tabela `feedback` do Supabase

### ✨ Sistema de Essências e Recompensas

Essências são a moeda simbólica do app — sem valor competitivo, apenas reconhecimento positivo.

| Ação | Essências |
|---|---|
| Criar postagem respeitosa | +10 |
| Comentar com apoio (mín. 10 chars, cooldown 10 min) | +5 |
| Denunciar conteúdo ofensivo | +15 |
| Entrar em grupo inclusivo (1ª vez) | +10 |
| Completar perfil | +20 |
| Login diário | +5 |

Limite de **50 Essências por dia** para evitar uso excessivo.

**Recompensas desbloqueáveis:**
- 🏅 Selos (badges) por comportamentos positivos
- 🎭 Títulos místicos exibidos no perfil
- 🖼️ Molduras de avatar (Lunar, Aura, Ursinho, Gatinho…)
- 🎨 Temas visuais (Lua Serena, Floresta Encantada, Céu Suave, Coração Mágico, Amanhecer Lilás, Pétala Rosa)

---

## 🛠️ Tecnologias Utilizadas

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + Vite 5 |
| Estilização | CSS3 puro (sem framework) |
| Backend / BaaS | Supabase (PostgreSQL + Auth + Realtime) |
| E-mail (recuperação de senha) | EmailJS |
| Deploy | Vercel (CI/CD via GitHub) |
| Testes E2E | Playwright |
| Controle de versão | Git + GitHub |

---

## 🗄️ Banco de Dados (Supabase)

Todas as tabelas possuem **Row Level Security (RLS)** ativo.

| Tabela | Descrição |
|---|---|
| `profiles` | Dados do usuário (nome, pronome, bio, essências, recompensas…) |
| `posts` | Postagens do feed |
| `post_likes` | Curtidas nas postagens |
| `post_reactions` | Reações com emoji |
| `comments` | Comentários nas postagens (com suporte a edição via `updated_at`) |
| `groups` | Grupos temáticos por jogo |
| `group_members` | Membros de cada grupo |
| `group_messages` | Mensagens do chat dos grupos |
| `notifications` | Notificações em tempo real por usuário |
| `feedback` | Avaliações enviadas pelos usuários |

### Realtime
Atualizações ao vivo via `postgres_changes` nas tabelas: `posts`, `post_likes`, `post_reactions`, `comments`, `group_messages`, `notifications`.

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- Node.js 18+
- npm
- Conta no [Supabase](https://supabase.com) com projeto configurado

### Instalação

```bash
# Clone o repositório
git clone https://github.com/breathesulfur/Atividade-Extensionista-II-Projeto.git
cd Atividade-Extensionista-II-Projeto

# Instale as dependências
npm install
```

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Supabase
VITE_SUPABASE_URL=sua_url_do_projeto_supabase
VITE_SUPABASE_ANON_KEY=sua_anon_key_do_supabase

# EmailJS (recuperação de senha)
VITE_EMAILJS_SERVICE_ID=seu_service_id
VITE_EMAILJS_TEMPLATE_ID=seu_template_id
VITE_EMAILJS_PUBLIC_KEY=sua_public_key
```

Onde encontrar:
- **Supabase**: Dashboard → Project Settings → API
- **EmailJS**: [emailjs.com](https://www.emailjs.com) → Account → API Keys

### Schema do Banco

Execute os arquivos SQL no **Supabase → SQL Editor**, na ordem:

1. `supabase_schema.sql` — tabelas base (profiles, posts, groups, etc.)
2. `supabase_schema_v2.sql` — notifications, feedback e coluna `updated_at` em comments

### Executar

```bash
npm run dev
# Acesse: http://localhost:5173
```

### Build de Produção

```bash
npm run build
# Arquivos gerados em /dist
```

### Testes E2E

```bash
# Instala o navegador do Playwright (apenas na primeira vez)
npx playwright install chromium

# Roda toda a suíte
npm run test:e2e

# Modo interativo (UI do Playwright)
npm run test:e2e:ui
```

Credenciais de teste podem ser passadas via `TEST_EMAIL` e `TEST_PASSWORD`.

---

## 📁 Estrutura do Projeto

```
inclusivchat/
├── src/
│   ├── lib/
│   │   ├── supabase.js              # Cliente Supabase
│   │   └── db.js                    # Funções de acesso ao banco (CRUD + Realtime)
│   ├── components/
│   │   ├── Dashboard.jsx            # Layout principal pós-login
│   │   ├── Login.jsx                # Tela de login
│   │   ├── SignUp.jsx               # Cadastro em 3 etapas
│   │   ├── ForgotPassword.jsx       # Recuperação de senha
│   │   ├── Feed.jsx                 # Feed de postagens
│   │   ├── PostCard.jsx             # Card de postagem (reações, comentários, notificações)
│   │   ├── CreatePost.jsx           # Modal de nova postagem
│   │   ├── Groups.jsx               # Lista de grupos
│   │   ├── GroupCard.jsx            # Chat do grupo
│   │   ├── CreateGroup.jsx          # Modal de novo grupo
│   │   ├── Profile.jsx              # Visualização de perfil
│   │   ├── EditProfile.jsx          # Edição de perfil e recompensas
│   │   ├── NotificationBell.jsx     # Sino de notificações com Realtime
│   │   ├── FeedbackForm.jsx         # Formulário de feedback
│   │   ├── FAQ.jsx                  # Modal de perguntas frequentes
│   │   ├── ThemeSelector.jsx        # Seletor de temas visuais
│   │   ├── AvatarFrame.jsx          # Renderização de moldura de avatar
│   │   ├── AvatarFrameSelector.jsx  # Seletor de molduras
│   │   ├── MysticTitleSelector.jsx  # Seletor de títulos místicos
│   │   ├── EmojiPicker.jsx          # Picker de emojis para reações
│   │   ├── ReportModal.jsx          # Modal de denúncia
│   │   ├── Notification.jsx         # Toast de notificação
│   │   └── LoadingSpinner.jsx
│   ├── utils/
│   │   ├── gamification.js          # Essências, badges, temas, molduras, títulos
│   │   ├── profanityFilter.js       # Filtro de conteúdo ofensivo
│   │   ├── notifications.js         # Sistema de toasts
│   │   └── validation.js            # Validações de formulário
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── tests/                           # Testes E2E (Playwright)
│   ├── smoke.spec.js                # Fluxos públicos (login, cadastro)
│   ├── authenticated.spec.js        # Fluxos pós-login (notificações, feedback, temas)
│   └── fixtures.spec.js             # Fluxo de comentários e cooldown de essências
├── supabase_schema.sql              # Schema v1 (tabelas base)
├── supabase_schema_v2.sql           # Schema v2 (notifications + feedback)
├── playwright.config.js
├── index.html
├── vite.config.js
└── package.json
```

---

## ♿ Acessibilidade

- Navegação por teclado e foco visível
- `aria-label` descritivos em todos os controles interativos
- Contraste adequado em todos os temas visuais
- Estrutura HTML semântica
- Feedback visual e textual para todas as ações

---

## 🎯 Características Inclusivas

- Seleção de pronomes (Ela/Dela, Ele/Dele, Elu/Delu, Ela/Ele, Outro)
- Interface acolhedora e não-binária
- Filtro automático de conteúdo ofensivo
- Sem rankings públicos ou comparações entre usuários
- Limite diário de essências para incentivar equilíbrio
- Ambiente seguro para todas as identidades de gênero e orientações

---

## 🤝 Impacto Social

O InclusivChat contribui para:
- Criação de ambientes digitais mais seguros para grupos marginalizados
- Promoção de empatia e respeito online
- Fortalecimento de comunidades inclusivas no universo gamer
- Aplicação prática da tecnologia com responsabilidade social

---

## 📚 Contexto Acadêmico

| | |
|---|---|
| **Projeto** | Atividade Extensionista II |
| **Curso** | Análise e Desenvolvimento de Sistemas |
| **Instituição** | UNINTER |
| **Autora** | Luiza Costa |

---

Desenvolvido com 💜 para uma comunidade gamer mais inclusiva e segura.
