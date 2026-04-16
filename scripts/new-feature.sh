#!/usr/bin/env bash
# Cria um branch de feature a partir de Main-Projeto atualizado.
# Uso: ./scripts/new-feature.sh nome-da-feature
#   ex: ./scripts/new-feature.sh temas-redesign

set -e

if [ -z "$1" ]; then
  echo "Uso: $0 <nome-da-feature>"
  echo "Exemplo: $0 temas-redesign"
  exit 1
fi

NAME="$1"
BRANCH="feat/$NAME"

echo "→ Atualizando Main-Projeto..."
git checkout Main-Projeto
git pull origin Main-Projeto

echo "→ Criando branch $BRANCH..."
git checkout -b "$BRANCH"

echo ""
echo "✓ Pronto! Faça suas alterações e depois rode:"
echo "    git add ."
echo "    git commit -m 'feat: sua mensagem'"
echo "    ./scripts/open-pr.sh"
