# 📘 Documentação de Referência: Tema "Céu Suave" (soft_sky)

## 🎯 Status: Tema Base do Sistema

Este documento identifica e documenta o schema completo do tema **"Céu Suave"** (`soft_sky`) como tema base do sistema. Nenhuma alteração foi realizada - apenas documentação e validação.

---

## 📋 1. Definição do Tema (Schema Base)

### Localização: `src/utils/gamification.js`

```javascript
SOFT_SKY: {
  id: 'soft_sky',
  name: 'Céu Suave',
  icon: '☁️',
  description: 'Serenidade, leveza e paz interior.',
  colors: {
    primary: '#B8D4E8',      // Azul claro suave (primária)
    background: '#F0F8FF',   // Azul céu muito claro (fundo)
    secondary: '#E6F3FF',    // Azul quase branco (detalhes)
    text: '#6B9AC4',         // Azul claro suave (texto)
    accent: '#A8D0E8',       // Azul claro (acento)
    glow: 'rgba(184, 212, 232, 0.3)'
  },
  requiredEssence: 70,
  theme: 'light'
}
```

### 🎨 Paleta de Cores Completa

| Token CSS | Valor Hex | Descrição | Uso |
|-----------|-----------|-----------|-----|
| `--theme-primary` | `#B8D4E8` | Azul claro suave | Botões primários, bordas principais |
| `--theme-background` | `#F0F8FF` | Azul céu muito claro | Fundo principal |
| `--theme-secondary` | `#E6F3FF` | Azul quase branco | Fundo secundário, cards, detalhes |
| `--theme-text` | `#6B9AC4` | Azul claro suave | Texto principal |
| `--theme-textSecondary` | `#6B9AC4` (com opacity) | Azul claro suave | Texto secundário |
| `--theme-accent` | `#A8D0E8` | Azul claro | Destaques, hover, focus |
| `--theme-glow` | `rgba(184, 212, 232, 0.3)` | Glow azul suave | Sombras, efeitos de brilho |

### 🔑 Variáveis CSS Derivadas

As seguintes variáveis são derivadas e aplicadas dinamicamente:

- `--theme-textPrimary`: `#6B9AC4` (fallback para `--theme-text`)
- `--theme-textDisabled`: `#6B9AC4` com opacity (fallback para `--theme-textSecondary`)
- `--theme-links`: `#6B9AC4` (fallback para `--theme-primary`)
- `--theme-hover`: `#A8D0E8` (fallback para `--theme-accent`)
- `--theme-disabled`: `#E6F3FF` (fallback para `--theme-secondary`)

---

## 📍 2. Pontos de Aplicação do Tema

### 2.1 Dashboard (`src/components/Dashboard.css`)

**Seletor Base:** `.dashboard.theme-soft_sky`, `.dashboard-content.theme-soft_sky`

**Aplicações:**
- ✅ Fundo principal: `#F0F8FF`
- ✅ Navegação: fundo `#F0F8FF`, borda inferior `#B8D4E8`
- ✅ Botões de navegação: borda `#B8D4E8`, texto `#6B9AC4`
- ✅ Botões hover: fundo `rgba(184, 212, 232, 0.2)`, borda `#A8D0E8`
- ✅ Botão ativo: gradiente `linear-gradient(135deg, #B8D4E8 0%, #E6F3FF 100%)`, sombra `rgba(184, 212, 232, 0.3)`

**Linhas:** 399-425

---

### 2.2 Feed (`src/components/Feed.css`)

**Seletor Base:** `.theme-soft_sky`

**Aplicações:**
- ✅ Cabeçalho h2: cor `#6B9AC4`
- ✅ Botão criar post: gradiente `linear-gradient(135deg, #B8D4E8 0%, #E6F3FF 100%)`, texto `#6B9AC4`, sombra `rgba(196, 213, 232, 0.3)`
- ✅ Estado vazio: aplicação do tema

**Linhas:** 112-121

---

### 2.3 PostCard (`src/components/PostCard.css`)

**Seletor Base:** `.theme-soft_sky .post-card`

**Aplicações:**
- ✅ Card de post: fundo `#F0F5FA`, borda `#B8D4E8`
- ✅ Nome do autor e conteúdo: cor `#6B9AC4`
- ✅ Pronome e data: cor `#6B9AC4` com opacity 0.8
- ✅ Avatar: borda `#B8D4E8`, gradiente `linear-gradient(135deg, #B8D4E8 0%, #E6F3FF 100%)`, sombra `rgba(196, 213, 232, 0.3)`
- ✅ Comentários: fundo `#F0F5FA`, borda `#B8D4E8`
- ✅ Botão like quando curtido: aplicação do tema
- ✅ Input de comentário: aplicação do tema
- ✅ Botão enviar comentário: aplicação do tema

**Linhas:** 449-586

---

### 2.4 Profile (`src/components/Profile.css`)

**Seletor Base:** `.profile-theme-soft_sky`, `.theme-soft_sky`

**Aplicações:**
- ✅ Fundo principal: `#F0F8FF`
- ✅ Conteúdo do perfil: fundo `#F0F8FF`
- ✅ Seções: fundo `#F0F8FF`, borda `#B8D4E8`
- ✅ Seção principal: fundo `#F0F8FF`, borda `2px solid #C4D5E8`
- ✅ Avatar grande: aplicação do tema
- ✅ Nome, títulos, seções: cor `#6B9AC4`
- ✅ Pronome, bio, descrições: cor `#6B9AC4` com opacity
- ✅ Badges: aplicação do tema
- ✅ Estatísticas: aplicação do tema
- ✅ Links sociais: aplicação do tema
- ✅ Tags de jogos: aplicação do tema
- ✅ Plataformas: aplicação do tema
- ✅ Botão editar perfil: aplicação do tema

**Linhas:** 835-967

---

### 2.5 EditProfile (`src/components/EditProfile.css`)

**Seletor Base:** `.theme-soft_sky .edit-profile`

**Aplicações:**
- ✅ Container principal: fundo `#F0F5FA`, padding completo
- ✅ Formulário: fundo `#F0F8FF`, texto `#6B9AC4`
- ✅ Cabeçalho: fundo `#F0F8FF`, borda inferior `2px solid #C4D5E8`
- ✅ Título h2: cor `#6B9AC4`, peso 700
- ✅ Seções de formulário: fundo `#F0F8FF`, borda `2px solid #C4D5E8`
- ✅ Labels: cor `#6B9AC4`, peso 600
- ✅ Inputs, selects, textareas: fundo `#FFFFFF`, borda `2px solid #C4D5E8`, texto `#6B9AC4`
- ✅ Placeholders: cor `#6B9AC4` com opacity 0.6
- ✅ Focus: borda `#A8D0E8`, sombra `rgba(184, 212, 232, 0.3)`
- ✅ Contador de caracteres: cor `#6B9AC4` com opacity
- ✅ Botão cancelar: fundo `#FFFFFF`, borda `#B8D4E8`, texto `#6B9AC4`
- ✅ Botão salvar: gradiente `linear-gradient(135deg, #B8D4E8 0%, #A8D0E8 100%)`, texto `#6B9AC4`
- ✅ Avatar preview: borda `#B8D4E8`, sombra `rgba(196, 213, 232, 0.3)`
- ✅ Chips de jogos: fundo `#FFFFFF`, borda `#B8D4E8`, texto `#6B9AC4`
- ✅ Botões de jogos customizados: aplicação do tema
- ✅ Estados desabilitados: aplicação do tema

**Linhas:** 393-658

---

### 2.6 Groups (`src/components/Groups.css`)

**Seletor Base:** `.theme-soft_sky`

**Aplicações:**
- ✅ Botão visualizar grupo: aplicação do tema
- ✅ Botão entrar no grupo: aplicação do tema
- ✅ Botão já entrou: aplicação do tema
- ✅ Cabeçalho h2 e títulos: cor `#6B9AC4`
- ✅ Botão criar grupo: aplicação do tema
- ✅ Item de grupo: aplicação do tema
- ✅ Descrição do grupo: aplicação do tema
- ✅ Meta informações: aplicação do tema
- ✅ Jogo do grupo: aplicação do tema
- ✅ Estado vazio: aplicação do tema

**Linhas:** 372-542

---

### 2.7 GroupCard (Chat) (`src/components/GroupCard.css`)

**Seletor Base:** `.theme-soft_sky .group-chat`

**⚠️ OBSERVAÇÃO:** Este componente apresenta cores que não correspondem ao schema do tema Céu Suave (usa tons roxos/escuros). Validação necessária.

**Aplicações Atuais (inconsistente):**
- ⚠️ Chat container: fundo `rgba(46, 26, 59, 0.9)`, borda `#B88FE6` (roxo)
- ⚠️ Cabeçalho do chat: gradiente roxo `linear-gradient(135deg, #4B2C5E 0%, #B88FE6 100%)`
- ⚠️ Mensagens: fundo `rgba(75, 44, 94, 0.6)` (roxo escuro)
- ⚠️ Formulário de mensagem: fundo `rgba(46, 26, 59, 0.8)`, borda `#B88FE6`

**Linhas:** 254-343

**Status:** ❌ Requer correção para alinhar com schema do tema

---

### 2.8 CreateGroup (`src/components/CreateGroup.css`)

**Seletor Base:** `.theme-soft_sky .create-group-card`

**Aplicações:**
- ✅ Card: fundo `#F0F8FF`, borda `#B8D4E8`
- ✅ Título h3 e labels: cor `#6B9AC4`, peso 700
- ✅ Inputs, selects, textareas: fundo `#E6F3FF`, borda `#B8D4E8`, texto `#6B9AC4`
- ✅ Placeholders: cor `#6B9AC4` com opacity 0.6
- ✅ Focus: borda `#A8D0E8`, sombra `rgba(184, 212, 232, 0.2)`
- ✅ Contador de caracteres: cor `#6B9AC4` com opacity 0.8
- ✅ Botão submit: gradiente `linear-gradient(135deg, #B8D4E8 0%, #A8D0E8 100%)`

**Linhas:** 162-201

---

### 2.9 CreatePost (`src/components/CreatePost.css`)

**Seletor Base:** `.theme-soft_sky .create-post-card`

**Aplicações:**
- ✅ Card: fundo `#F0F5FA`, borda `#B8D4E8`
- ✅ Título h3 e labels: cor `#6B9AC4`
- ✅ Textarea: fundo `#F0F5FA`, borda `#B8D4E8`, texto `#6B9AC4`
- ✅ Placeholder: cor `#6B9AC4` com opacity 0.6
- ✅ Focus: borda `#A8D0E8`, sombra `rgba(196, 213, 232, 0.2)`
- ✅ Contador de caracteres: cor `#6B9AC4` com opacity 0.8
- ✅ Botão submit: gradiente `linear-gradient(135deg, #B8D4E8 0%, #E6F3FF 100%)`, texto `#6B9AC4`, sombra `rgba(196, 213, 232, 0.3)`

**Linhas:** 152-186

---

### 2.10 ThemeSelector (`src/components/ThemeSelector.css`)

**Seletor Base:** `.theme-soft_sky .theme-selector`

**Aplicações:**
- ✅ Seletor de temas: cor `#6B9AC4`
- ✅ Descrição: cor `#6B9AC4` com opacity 0.9
- ✅ Título da seção: cor `#6B9AC4`, peso 700
- ✅ Cards de tema: fundo `#F0F8FF`, borda `#B8D4E8`, texto `#6B9AC4`
- ✅ Cards desbloqueados: borda `#B8D4E8`, fundo `#F0F8FF`
- ✅ Cards hover: borda `#A8D0E8`, fundo `#E6F3FF`, sombra `rgba(184, 212, 232, 0.3)`
- ✅ Card ativo: fundo `#E6F3FF`, borda `#B8D4E8` (3px), sombra `rgba(184, 212, 232, 0.4)`
- ✅ Badge ativo: gradiente com cores do tema
- ✅ Botão aplicar: gradiente com cores do tema

**Linhas:** 176-278

---

## ✅ 3. Validação de Aplicação

### Componentes Validados:

| Componente | Status | Observações |
|------------|--------|-------------|
| **Dashboard** | ✅ Aplicado | Todas as cores e estilos aplicados corretamente |
| **Feed** | ✅ Aplicado | Cabeçalho, botões e estados vazios estilizados |
| **PostCard** | ✅ Aplicado | Cards, avatares, comentários e interações estilizados |
| **Profile** | ✅ Aplicado | Perfil completo com todas as seções estilizadas |
| **EditProfile** | ✅ Aplicado | Formulário completo com todos os campos estilizados |
| **Groups** | ✅ Aplicado | Lista de grupos e botões estilizados |
| **GroupCard (Chat)** | ❌ Inconsistente | Usa cores roxas/escuras que não correspondem ao tema |
| **CreateGroup** | ✅ Aplicado | Formulário de criação estilizado |
| **CreatePost** | ✅ Aplicado | Formulário de criação estilizado |
| **ThemeSelector** | ✅ Aplicado | Seletor de temas estilizado |

---

## 🔍 4. Mecanismo de Aplicação

### 4.1 Aplicação Dinâmica via JavaScript

O tema é aplicado dinamicamente através de:

1. **Definição no objeto THEMES** (`src/utils/gamification.js`)
2. **Aplicação via `applyTheme()`** que define `user.activeTheme = 'soft_sky'`
3. **Injeção de variáveis CSS** via `themeStyles` no componente React
4. **Aplicação de classe CSS** `.theme-soft_sky` no container principal

### 4.2 Variáveis CSS Aplicadas

```css
--theme-primary: #B8D4E8
--theme-background: #F0F8FF
--theme-secondary: #E6F3FF
--theme-text: #6B9AC4
--theme-textSecondary: #6B9AC4 (com opacity)
--theme-accent: #A8D0E8
--theme-glow: rgba(184, 212, 232, 0.3)
```

### 4.3 Estrutura de Seletores CSS

Todos os estilos seguem o padrão:
```css
.theme-soft_sky .component-class {
  /* estilos específicos do tema */
}
```

---

## 📊 5. Estatísticas de Cobertura

- **Total de arquivos CSS com tema:** 10
- **Total de linhas de código CSS do tema:** ~500+
- **Componentes cobertos:** 9/10 (90%)
- **Componente com inconsistência:** GroupCard (Chat)

---

## 🎯 6. Conclusão

O tema **"Céu Suave"** (`soft_sky`) está **amplamente implementado** como tema base do sistema, com aplicação consistente em:

✅ Dashboard  
✅ Feed  
✅ PostCard  
✅ Profile  
✅ EditProfile  
✅ Groups  
✅ CreateGroup  
✅ CreatePost  
✅ ThemeSelector  

⚠️ **Exceção:** O componente `GroupCard` (Chat) apresenta cores inconsistentes com o schema do tema e requer revisão.

---

## 📝 Notas Finais

- Este documento serve como **referência reutilizável** do schema do tema
- Nenhuma alteração foi realizada - apenas documentação e validação
- O tema está **estável e funcional** em 90% dos componentes
- A inconsistência no componente de chat não afeta a funcionalidade geral do tema

---

**Documento gerado em:** 2024  
**Versão do Schema:** 1.0  
**Status:** ✅ Validado e Documentado
