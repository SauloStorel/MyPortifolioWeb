#!/usr/bin/env node
/* ============================================================
   Confere os artigos do blog antes de publicar. Para cada post
   que não é rascunho, verifica:
     - título e descrição (de 120 a 160 caracteres, o que aparece no Google);
     - se não sobrou nenhum trecho marcado com [COMPLETAR];
     - se existe a versão no outro idioma (mesmo translationKey);
     - se os links internos do texto apontam para páginas que existem;
     - o resumo por IA (campo "resumo"): existe e foi feito para o texto atual.

   O resumo guarda um "resumo_hash", a impressão digital do texto do artigo
   quando o resumo foi escrito. Se o artigo mudar depois, o hash não bate e o
   verificador barra a publicação: um resumo desatualizado engana o leitor.

   Uso:
     node scripts/verificar-blog.mjs                      confere (rode depois de ./blog-src/build.sh)
     node scripts/verificar-blog.mjs --atualizar-hashes   depois de escrever ou revisar um resumo,
                                                          grava o hash do texto atual em cada post
   Sai com erro (código 1) se algo impedir a publicação.
   ============================================================ */
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LANGUAGES = ["pt", "en"];
const errors = [];
const warnings = [];
const drafts = [];

/* ---------- Leitura dos arquivos ---------- */
const split = (text) => {
  const match = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  return { block: match?.[1] ?? "", body: match?.[2] ?? text };
};

const frontMatter = (block) => {
  const field = (name) => block.match(new RegExp(`^${name}:\\s*(.*)$`, "m"))?.[1].trim() ?? "";
  const quoted = (value) => value.match(/^"(.*)"/)?.[1] ?? value.replace(/\s+#.*$/, "");
  return {
    title: quoted(field("title")),
    description: quoted(field("description")),
    draft: field("draft").startsWith("true"),
    translationKey: quoted(field("translationKey")),
    hasSummary: /^resumo:/m.test(block),
    summaryHash: quoted(field("resumo_hash")),
  };
};

// Impressão digital do texto do artigo (sem o cabeçalho), para saber se ele mudou.
const bodyHash = (body) => createHash("sha256").update(body.replace(/\r\n/g, "\n").trim()).digest("hex").slice(0, 12);

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
    .map((file) => ({ language, file, path: join(dir, file), text: readFileSync(join(dir, file), "utf8") }));
});

/* ---------- Modo: gravar os hashes dos resumos ---------- */
if (process.argv.includes("--atualizar-hashes")) {
  let updated = 0;
  for (const post of posts) {
    const { block, body } = split(post.text);
    if (!frontMatter(block).hasSummary) continue;

    const hashLine = `resumo_hash: "${bodyHash(body)}"`;
    const newBlock = /^resumo_hash:/m.test(block) ? block.replace(/^resumo_hash:.*$/m, hashLine) : `${block}\n${hashLine}`;
    writeFileSync(post.path, post.text.replace(block, newBlock));
    updated++;
  }
  console.log(`${updated} resumo(s) marcado(s) como atualizado(s) para o texto de hoje.`);
  process.exit(0);
}

/* ---------- Modo: conferir ---------- */
for (const post of posts) {
  const { block, body } = split(post.text);
  const meta = frontMatter(block);
  const label = `${post.language}/${post.file}`;

  if (meta.draft) { drafts.push(label); continue; }

  if (!meta.title) errors.push(`${label}: falta o título.`);

  const pending = post.text.match(/\[COMPLETAR[^\]]*\]/g) ?? [];
  if (pending.length) errors.push(`${label}: ainda tem ${pending.length} trecho(s) marcado(s) com [COMPLETAR].`);

  const size = meta.description.length;
  if (!size) errors.push(`${label}: falta a descrição (é o que aparece no Google).`);
  else if (size < 120 || size > 160) warnings.push(`${label}: a descrição tem ${size} caracteres (o ideal é de 120 a 160).`);

  const other = LANGUAGES.find((language) => language !== post.language);
  const hasTranslation = posts.some((candidate) => {
    const candidateMeta = frontMatter(split(candidate.text).block);
    return candidate.language === other && !candidateMeta.draft && candidateMeta.translationKey === meta.translationKey;
  });
  if (!meta.translationKey || !hasTranslation) warnings.push(`${label}: não achei a versão em ${other} com o mesmo translationKey.`);

  if (!meta.hasSummary) warnings.push(`${label}: sem resumo por IA (campo "resumo").`);
  else if (meta.summaryHash !== bodyHash(body)) errors.push(`${label}: o artigo mudou depois do resumo por IA. Atualize o "resumo" e rode: node scripts/verificar-blog.mjs --atualizar-hashes`);

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
