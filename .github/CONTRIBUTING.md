# Fluxo de contribuição

Para manter o histórico limpo, **não commite direto em `Main-Projeto`**.
Sempre abra uma Pull Request a partir de um branch de feature.

## Passo a passo

### 1. Crie um branch para a feature

```bash
./scripts/new-feature.sh nome-da-feature
```

Isso faz:
- `git checkout Main-Projeto`
- `git pull`
- `git checkout -b feat/nome-da-feature`

### 2. Desenvolva e commite normalmente

```bash
# ... edita arquivos ...
git add .
git commit -m "feat: descrição curta"
```

### 3. Abra o PR

```bash
./scripts/open-pr.sh
# ou, para draft:
./scripts/open-pr.sh --draft
```

Isso faz:
- `git push -u origin feat/nome-da-feature`
- `gh pr create --base Main-Projeto --fill`

### 4. Depois de aprovado, faça merge pelo GitHub

No site do GitHub, clique **Merge pull request** na PR.
Depois, localmente:

```bash
git checkout Main-Projeto
git pull
git branch -d feat/nome-da-feature   # apaga o branch local
```

## Convenção de mensagens de commit

- `feat:` nova funcionalidade
- `fix:` correção de bug
- `docs:` só documentação
- `style:` formatação / CSS
- `refactor:` refatoração sem mudar comportamento
- `chore:` tarefas gerais (deps, config…)

## Pré-requisitos

- Git
- Node.js 18+
- GitHub CLI (`gh`) — já instalado e configurado via `GH_TOKEN`
