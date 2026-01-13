# InclusivChat

Aplicativo social inclusivo voltado ao acolhimento da comunidade feminina e LGBTQIAPN+, promovendo interações respeitosas, pertencimento e bem-estar por meio de mecânicas positivas e não competitivas.

🌈 Visão Geral

Este projeto foi desenvolvido como parte da Atividade Extensionista do curso de Análise e Desenvolvimento de Sistemas, com foco social e comunitário.
O aplicativo busca criar um ambiente digital seguro, onde usuárias e usuários possam se expressar livremente, participar de grupos inclusivos e serem incentivados a comportamentos saudáveis por meio de um sistema de recompensas simbólicas.

🎯 Objetivos do Projeto

- Promover um espaço digital acolhedor e inclusivo
- Incentivar interações respeitosas e empáticas
- Evitar rankings e comparações entre usuários
- Valorizar ações positivas por meio de recompensas simbólicas
- Aplicar conceitos de UX, acessibilidade e bem-estar digital

🧩 Funcionalidades Principais

👤 Perfil do Usuário:

- Foto com moldura padrão
- Nome, pronomes, cidade e estado
- Bio personalizada
- Jogos de interesse
- Redes sociais e plataformas de jogos
- Estatísticas de interação
- Exibição de conquistas (selos, títulos e molduras)

✏️ Edição de Perfil:

- Edição de dados pessoais (nome, pronomes, bio, cidade, estado)
- Atualização de redes sociais e plataformas de jogos
- Gerenciamento de recompensas desbloqueadas
- Interface com seções expansíveis para melhor UX

📰 Feed e Postagens:

- Criação de postagens respeitosas
- Comentários de apoio
- Sistema de denúncias de conteúdo ofensivo
- Notificações contextuais e não invasivas

👥 Grupos Inclusivos:

- Criação e participação em grupos
- Interações comunitárias
- Recompensas coletivas por ações positivas

✨ Sistema de Essências e Recompensas

O aplicativo utiliza Essências como forma simbólica de reconhecimento por ações positivas, com limite diário para evitar uso excessivo.

🪄 Ações Positivas (exemplos):

- Criar postagem respeitosa
- Comentar com apoio
- Denunciar conteúdo ofensivo corretamente
- Participar de grupos inclusivos
- Completar o perfil
- Login em dias consecutivos

🏆 Recompensas

Selos (badges): 

- Títulos místicos exibidos no perfil
- Molduras de avatar
- Temas visuais desbloqueáveis
- Mensagens narrativas de reconhecimento
- Recompensas coletivas para grupos
🚫 Não há ranking público nem comparação entre usuários.

🎨 Temas Visuais

O app utiliza uma identidade visual baseada em gradiente rosa e roxo, com temas desbloqueáveis inspirados em elementos místicos e naturais, como:

- Lua Serena 🌙
- Aura Rosa ✨
- Bruma Rosada 🌿
- Amanhecer Lilás 🌅
- Pétala Rosa 🌸

Cada tema ajusta:
- Paleta de cores
- Botões
- Destaques visuais
- Contraste e legibilidade

🛠️ Tecnologias Utilizadas

Frontend: CSS, HTML e JavaScript
Tests manuais

Controle de versão: Git + GitHub

🧪 Testes e Validação
Testes manuais focados em UX
Validação de fluxo de recompensas
Testes de estabilidade da tela de edição
Verificação de acessibilidade e contraste
Registro de resultados por meio de vídeo demonstrativo

🤝 Impacto Social

O projeto contribui para:

Criação de ambientes digitais mais seguros
Promoção de empatia e respeito online
Fortalecimento de comunidades inclusivas
Aplicação prática da tecnologia com foco social

📚 Contexto Acadêmico

Projeto desenvolvido para a Atividade Extensionista II - Projeto
Curso: Análise e Desenvolvimento de Sistemas
Instituição: UNINTER

🧠 Considerações Finais

Durante o desenvolvimento, foram enfrentados desafios relacionados à experiência do usuário, gerenciamento de estado e estabilidade da interface. Esses desafios proporcionaram aprendizados significativos sobre desenvolvimento incremental, foco em UX e responsabilidade social no uso da tecnologia.

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
