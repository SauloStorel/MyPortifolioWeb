#!/usr/bin/env bash
# Mostra os rascunhos (draft: true) em localhost:8000/blog/ para você ler como ficam.
#
# ATENÇÃO: isso grava os rascunhos dentro de /blog e /en/blog. Antes de qualquer commit,
# volte ao normal com ./blog-src/build.sh (o ./scripts/publicar.sh já faz isso sozinho).
set -euo pipefail
cd "$(dirname "$0")"

./build.sh -D
echo
echo "Rascunhos visíveis em http://localhost:8000/blog/ (com o servidor local ligado)."
echo "Quando terminar de ler: ./blog-src/build.sh  para tirar os rascunhos."
