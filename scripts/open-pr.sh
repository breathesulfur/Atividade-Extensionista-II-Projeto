#!/usr/bin/env bash
# Faz push do branch atual e abre um Pull Request para Main-Projeto.
# Uso: ./scripts/open-pr.sh [--draft]

set -e

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

if [ "$CURRENT_BRANCH" = "Main-Projeto" ]; then
  echo "✗ Você está em Main-Projeto. Crie um branch antes: ./scripts/new-feature.sh <nome>"
  exit 1
fi

# Garante que o gh encontre o token (se não estiver no gh auth)
if [ -z "$GH_TOKEN" ]; then
  export GH_TOKEN=$(git credential fill <<< $'protocol=https\nhost=github.com\n' 2>/dev/null | grep '^password=' | cut -d= -f2)
fi

GH="/c/Program Files/GitHub CLI/gh.exe"
[ ! -x "$GH" ] && GH="gh"

echo "→ Push $CURRENT_BRANCH → origin..."
git push -u origin "$CURRENT_BRANCH"

echo "→ Abrindo PR..."
DRAFT_FLAG=""
[ "$1" = "--draft" ] && DRAFT_FLAG="--draft"

"$GH" pr create \
  --base Main-Projeto \
  --head "$CURRENT_BRANCH" \
  --fill \
  $DRAFT_FLAG

echo ""
echo "✓ PR criado! Veja em: $("$GH" pr view --json url -q .url)"
