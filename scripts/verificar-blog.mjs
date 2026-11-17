#!/usr/bin/env node
/* ============================================================
   Confere os artigos do blog antes de publicar. Para cada post
   que não é rascunho, verifica:
     - título e descrição (de 120 a 160 caracteres, o que aparece no Google);
     - se existe a versão no outro idioma (mesmo translationKey);
     - se os links internos do texto apontam para páginas que existem.
   Sai com erro (código 1) se algo impedir a publicação.
   Uso: node scripts/verificar-blog.mjs   (rode depois de ./blog-src/build.sh)
   ============================================================ */
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LANGUAGES = ["pt", "en"];
const errors = [];
const warnings = [];
const drafts = [];

const frontMatter = (text) => {
  const block = text.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
  const field = (name) => block.match(new RegExp(`^${name}:\\s*(.*)$`, "m"))?.[1].trim() ?? "";
  const quoted = (value) => value.match(/^"(.*)"/)?.[1] ?? value.replace(/\s+#.*$/, "");
  return {
    title: quoted(field("title")),
    description: quoted(field("description")),
    draft: field("draft").startsWith("true"),
    translationKey: quoted(field("translationKey")),
  };
};

// Um link como /projetos/xfria/ ou /blog/index.xml precisa existir no site já gerado.
const linkExists = (href) => {
  const path = href.split("#")[0].split("?")[0];
  if (!path || path === "/") return true;
  const target = join(ROOT, path);
  return existsSync(target.endsWith("/") ? join(target, "index.html") : target);
};

const posts = LANGUAGES.flatMap((language) => {
  const dir = join(ROOT, "blog-src/content", language, "blog");
  return readdirSync(dir)
    .filter((file) => file.endsWith(".md") && file !== "_index.md")
    .map((file) => ({ language, file, text: readFileSync(join(dir, file), "utf8") }));
});

for (const post of posts) {
  const meta = frontMatter(post.text);
  const label = `${post.language}/${post.file}`;

  if (meta.draft) { drafts.push(label); continue; }

  if (!meta.title) errors.push(`${label}: falta o título.`);
  const size = meta.description.length;
  if (!size) errors.push(`${label}: falta a descrição (é o que aparece no Google).`);
  else if (size < 120 || size > 160) warnings.push(`${label}: a descrição tem ${size} caracteres (o ideal é de 120 a 160).`);

  const other = LANGUAGES.find((language) => language !== post.language);
  const hasTranslation = posts.some((candidate) => candidate.language === other && !frontMatter(candidate.text).draft && frontMatter(candidate.text).translationKey === meta.translationKey);
  if (!meta.translationKey || !hasTranslation) warnings.push(`${label}: não achei a versão em ${other} com o mesmo translationKey.`);

  for (const [, href] of post.text.matchAll(/\]\((\/[^)\s]*)\)/g)) {
    if (!linkExists(href)) errors.push(`${label}: o link ${href} não existe no site.`);
  }
}

const published = posts.length - drafts.length;
console.log(`${published} artigo(s) para publicar, ${drafts.length} rascunho(s)${drafts.length ? ` (${drafts.join(", ")})` : ""}.`);
warnings.forEach((message) => console.log(`  aviso: ${message}`));
errors.forEach((message) => console.log(`  ERRO: ${message}`));

if (errors.length) process.exit(1);
console.log("Tudo certo para publicar.");
