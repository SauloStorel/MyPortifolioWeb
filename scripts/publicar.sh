#!/usr/bin/env bash
# Prepara o site para publicar e, se você pedir, envia e confere o resultado.
#
#   ./scripts/publicar.sh                    só gera e confere (não mexe no git)
#   ./scripts/publicar.sh "Novo artigo: X"   gera, confere e pergunta se pode fazer o
#                                            commit e o envio; depois espera o deploy da
#                                            Vercel e confere o site publicado
#
# O que ele faz, nesta ordem:
#   1. gera as páginas de projeto e atualiza o sitemap.xml
#   2. gera o blog (sem rascunhos)
#   3. confere os artigos: descrição, versão nos dois idiomas e links internos
#   4. (com mensagem) commit, push, espera o deploy e confere o site no ar
set -euo pipefail
cd "$(dirname "$0")/.."

echo "1/3 Páginas de projeto"
node scripts/gerar-projetos.mjs

echo "2/3 Blog"
./blog-src/build.sh

echo "3/3 Conferindo os artigos"
node scripts/verificar-blog.mjs

message="${1:-}"
if [[ -z "$message" ]]; then
  echo
  echo "Nada foi enviado. Para publicar: ./scripts/publicar.sh \"mensagem do commit\""
  exit 0
fi

echo
git status --short
read -r -p "Fazer o commit com a mensagem \"$message\" e enviar (push)? [s/N] " answer
[[ "$answer" =~ ^[sSyY]$ ]] || { echo "Cancelado. Nada foi enviado."; exit 0; }

git add -A
git commit -m "$message"
git push

# Só a branch main vai para o endereço público; as outras geram uma pré-visualização protegida.
if [[ "$(git branch --show-current)" == "main" ]]; then
  echo
  node scripts/verificar-producao.mjs --esperar
  echo "No ar. Falta só pedir a indexação das páginas novas no Google Search Console."
else
  echo "Enviado para a branch $(git branch --show-current): a Vercel gera uma pré-visualização (veja o painel)."
fi
