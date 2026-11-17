#!/usr/bin/env node
/* ============================================================
   Confere o site publicado de verdade, no endereço público.

     node scripts/verificar-producao.mjs             só confere
     node scripts/verificar-producao.mjs --esperar   antes, espera o deploy da
                                                     Vercel (pelo GitHub) terminar

   Verifica:
     - toda URL dos sitemaps abre (200), tem canonical apontando para ela mesma,
       título, descrição e um <h1>, e não está com noindex;
     - as URLs antigas dos projetos redirecionam para as novas;
     - o cache de imagens e de fontes está como o vercel.json manda.
   Sai com erro (código 1) se algo falhar.
   ============================================================ */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ORIGIN = "https://www.storell.dev.br";
const PROJECTS = vm.runInNewContext(`${readFileSync(join(ROOT, "projects.js"), "utf8")};PROJECTS`, {});
const failures = [];

const fail = (message) => { failures.push(message); console.log(`  ERRO: ${message}`); };
const get = (path, options = {}) => fetch(`${ORIGIN}${path}`, { headers: { "User-Agent": "verificacao-storell" }, ...options });

/* ---------- Espera o deploy terminar (status do commit no GitHub) ---------- */
async function waitForDeploy() {
  const sha = execFileSync("git", ["rev-parse", "HEAD"], { cwd: ROOT, encoding: "utf8" }).trim();
  const repo = execFileSync("gh", ["repo", "view", "--json", "nameWithOwner", "--jq", ".nameWithOwner"], { cwd: ROOT, encoding: "utf8" }).trim();
  process.stdout.write("Esperando o deploy da Vercel");

  for (let attempt = 0; attempt < 36; attempt++) {
    const state = execFileSync("gh", ["api", `repos/${repo}/commits/${sha}/status`, "--jq", ".statuses[0].state // \"pending\""], { cwd: ROOT, encoding: "utf8" }).trim();
    if (state === "success") return console.log(" pronto.");
    if (state === "failure" || state === "error") { console.log(""); throw new Error("o deploy falhou na Vercel. Veja o painel."); }
    process.stdout.write(".");
    await new Promise((resolve) => setTimeout(resolve, 10_000));
  }
  throw new Error("o deploy demorou mais de 6 minutos. Confira o painel da Vercel.");
}

/* ---------- Verificações ---------- */
async function sitemapUrls() {
  const urls = [];
  for (const path of ["/sitemap.xml", "/blog/sitemap.xml", "/en/blog/sitemap.xml"]) {
    const response = await get(path);
    if (!response.ok) { fail(`${path} não abre (${response.status}).`); continue; }
    urls.push(...[...(await response.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]));
  }
  return [...new Set(urls)];
}

async function checkPage(url) {
  const path = url.replace(ORIGIN, "");
  const response = await get(path);
  if (response.status !== 200) return fail(`${path} deu ${response.status}.`);

  const html = await response.text();
  const canonical = html.match(/<link rel="?canonical"? href="?([^"> ]+)/)?.[1];
  const description = html.match(/<meta name="?description"? content="([^"]*)"/)?.[1]
    ?? html.match(/<meta name="?description"? content=([^ >]+)/)?.[1];
  const h1Count = (html.match(/<h1[\s>]/g) ?? []).length;

  if (canonical !== url) fail(`${path}: canonical aponta para ${canonical ?? "nada"}.`);
  if (!/<title>[^<]+<\/title>/.test(html)) fail(`${path}: sem título.`);
  if (!description) fail(`${path}: sem descrição.`);
  if (h1Count !== 1) fail(`${path}: tem ${h1Count} <h1> (deveria ter 1).`);
  if (/name="?robots"? content="?[^">]*noindex/.test(html)) fail(`${path}: está com noindex, mas está no sitemap.`);
}

async function checkRedirects() {
  const cases = PROJECTS.flatMap(({ slug }) => [
    [`/projeto.html?p=${slug}`, `/projetos/${slug}/`],
    [`/en/project.html?p=${slug}`, `/en/projects/${slug}/`],
  ]);
  for (const [from, to] of cases) {
    const response = await get(from, { redirect: "manual" });
    const location = response.headers.get("location") ?? "";
    if (![301, 308].includes(response.status) || !location.startsWith(to)) fail(`${from} deveria redirecionar para ${to} (deu ${response.status} ${location}).`);
  }
}

async function checkCache() {
  const cases = [["/images/xfria.webp", /max-age=\d+/], ["/fonts/schibsted-grotesk.woff2", /immutable/]];
  for (const [path, expected] of cases) {
    const cache = (await get(path)).headers.get("cache-control") ?? "";
    if (!expected.test(cache)) fail(`${path}: cache-control inesperado (${cache}).`);
  }
}

/* ---------- Execução ---------- */
try {
  if (process.argv.includes("--esperar")) await waitForDeploy();

  console.log(`Conferindo ${ORIGIN}`);
  const urls = await sitemapUrls();
  for (const url of urls) await checkPage(url);
  await checkRedirects();
  await checkCache();

  console.log(`${urls.length} página(s) dos sitemaps conferidas.`);
} catch (error) {
  fail(error.message);
}

if (failures.length) {
  console.log(`\n${failures.length} problema(s) no site publicado.`);
  process.exit(1);
}
console.log("Site publicado conferido: tudo certo.");
