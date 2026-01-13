# InclusivChat

Plataforma gamer inclusiva e segura voltada para mulheres e pessoas da comunidade LGBTQIAPN+.

## 🎮 Sobre o Projeto

O InclusivChat é uma aplicação web desenvolvida em React que oferece um ambiente seguro e acolhedor para gamers se conectarem, compartilharem experiências e formarem grupos de jogo. O projeto foi desenvolvido com foco em inclusividade, acessibilidade e prevenção de discurso de ódio.

## ✨ Funcionalidades

### 🔐 Autenticação
- Login com e-mail e senha
- Login com Google OAuth
- Login com Facebook OAuth
- Cadastro de novos usuários
- Recuperação de senha por e-mail (EmailJS)
- Indicadores de carregamento durante autenticação
- Armazenamento de dados do usuário no localStorage

### 📱 Feed de Postagens
- Criar novas postagens
- Curtir postagens
- Comentar em postagens
- Visualização em tempo real

### 🎮 Grupos de Jogos
- Criar grupos de jogos
- Entrar e sair de grupos
- Chat em tempo real dentro dos grupos
- Filtro por jogos de interesse

### 🏆 Sistema de Gamificação
- Pontos por ações (postar, curtir, comentar, criar grupos, enviar mensagens)
- Badges/Conquistas desbloqueáveis:
  - 📝 Primeira Postagem
  - 🦋 Borboleta Social (10 comentários)
  - ⭐ Popular (50 curtidas recebidas)
  - 👑 Líder de Grupo
  - 💬 Conversador (20 mensagens)
  - 🤝 Ajudante

### 🛡️ Filtro de Conteúdo
- Filtro automático de palavras ofensivas
- Prevenção de discurso de ódio
- Substituição automática por asteriscos

### 👤 Perfil
- Visualização de estatísticas
- Badges conquistados
- Pontos acumulados
- Jogos de interesse

## 🚀 Como Executar

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm ou yarn

### Instalação

1. Clone o repositório ou navegue até a pasta do projeto:
```bash
cd inclusivchat
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
   - Crie um arquivo `.env` na raiz do projeto
   - Adicione as seguintes variáveis (obtenha as credenciais nos links abaixo):
   ```env
   VITE_GOOGLE_CLIENT_ID=seu_google_client_id
   VITE_FACEBOOK_APP_ID=seu_facebook_app_id
   VITE_EMAILJS_SERVICE_ID=seu_emailjs_service_id
   VITE_EMAILJS_TEMPLATE_ID=seu_emailjs_template_id
   VITE_EMAILJS_PUBLIC_KEY=seu_emailjs_public_key
   ```
   
   **Onde obter as credenciais:**
   - Google OAuth: https://console.cloud.google.com/apis/credentials
   - Facebook App: https://developers.facebook.com/apps/
   - EmailJS: https://www.emailjs.com/

4. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

5. Abra o navegador em `http://localhost:5173` (ou a porta indicada no terminal)

**Nota:** Se não configurar as variáveis de ambiente, os logins sociais e envio de e-mail funcionarão em modo de simulação (apenas para desenvolvimento).

### Build para Produção

```bash
npm run build
```

Os arquivos otimizados estarão na pasta `dist/`.

## 📁 Estrutura do Projeto

```
inclusivchat/
├── src/
│   ├── components/          # Componentes React
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Feed.jsx
│   │   ├── PostCard.jsx
│   │   ├── CreatePost.jsx
│   │   ├── Groups.jsx
│   │   ├── GroupCard.jsx
│   │   ├── CreateGroup.jsx
│   │   └── Profile.jsx
│   ├── utils/               # Utilitários
│   │   ├── storage.js        # Gerenciamento do localStorage
│   │   ├── profanityFilter.js # Filtro de palavras ofensivas
│   │   ├── gamification.js   # Sistema de pontos e badges
│   │   └── auth.js           # Utilitários de autenticação (Facebook)
│   ├── components/
│   │   ├── Login.jsx         # Tela de login
│   │   ├── SignUp.jsx        # Tela de cadastro
│   │   ├── ForgotPassword.jsx # Recuperação de senha
│   │   └── LoadingSpinner.jsx # Componente de carregamento
│   ├── App.jsx              # Componente principal
│   ├── main.jsx             # Ponto de entrada
│   ├── index.css            # Estilos globais
│   └── App.css
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 🎨 Tecnologias Utilizadas

- **React 18** - Biblioteca JavaScript para construção de interfaces
- **Vite** - Build tool e servidor de desenvolvimento
- **CSS3** - Estilização moderna e responsiva
- **localStorage** - Armazenamento de dados no navegador
- **@react-oauth/google** - Integração com Google OAuth
- **@emailjs/browser** - Envio de e-mails via EmailJS
- **Facebook SDK** - Integração com Facebook Login

## 🔒 Armazenamento de Dados

Todos os dados são armazenados localmente no navegador usando `localStorage`:
- Dados do usuário logado
- Postagens
- Grupos
- Mensagens dos grupos

**Nota:** Os dados são específicos do navegador e serão perdidos se o localStorage for limpo.

## ♿ Acessibilidade

O projeto foi desenvolvido com foco em acessibilidade:
- Navegação por teclado
- Indicadores de foco visíveis
- Labels descritivos
- Contraste adequado de cores
- Estrutura semântica HTML

## 🎯 Características Inclusivas

- Seleção de pronomes personalizada
- Interface acolhedora e não-binária
- Filtro automático de conteúdo ofensivo
- Ambiente seguro para todos os gêneros e identidades

## 📝 Notas do Desenvolvedor

Este é um projeto acadêmico desenvolvido apenas com frontend. Não há backend real, e todos os dados são armazenados localmente. Para um ambiente de produção, seria necessário:

- Backend com banco de dados
- Sistema de autenticação real
- Moderação de conteúdo mais robusta
- Servidor de mensagens em tempo real
- Sistema de notificações

## 📄 Licença

Este projeto é acadêmico e foi desenvolvido para fins educacionais.

## 👥 Contribuindo

Este é um projeto acadêmico, mas sugestões e melhorias são bem-vindas!

---

Desenvolvido com ❤️ para uma comunidade gamer mais inclusiva e segura.
