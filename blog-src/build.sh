#!/usr/bin/env bash
# Gera o blog (Hugo) para dentro de /blog e /en/blog, ao lado do resto do site.
# Uso: ./blog-src/build.sh        publica só os posts prontos
#      ./blog-src/build.sh -D     inclui os rascunhos (para conferir no navegador)
set -euo pipefail
cd "$(dirname "$0")"

out="$(mktemp -d)"
trap 'rm -rf "$out"' EXIT

hugo --minify --quiet -d "$out" "$@"

rm -rf ../blog ../en/blog
cp -r "$out/blog" ../blog
cp -r "$out/en/blog" ../en/blog
# Um sitemap por idioma, dentro de cada pasta, para não brigar com o sitemap.xml do site.
cp "$out/pt/sitemap.xml" ../blog/sitemap.xml
cp "$out/en/sitemap.xml" ../en/blog/sitemap.xml
echo "Blog gerado em /blog e /en/blog"
