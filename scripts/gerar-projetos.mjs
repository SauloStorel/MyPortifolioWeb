#!/usr/bin/env node
/* ============================================================
   Gera uma página estática por estudo de caso, em português e inglês,
   a partir de projects.js:

     /projetos/<slug>/index.html       (pt-BR)
     /en/projects/<slug>/index.html    (en)

   Cada página já nasce com título, descrição, canonical, hreflang,
   Open Graph e dados estruturados próprios, para o Google ler sem
   executar JavaScript. Também atualiza o trecho de projetos do
   sitemap.xml (entre os marcadores <!-- projetos:inicio/fim -->).

   Uso: node scripts/gerar-projetos.mjs
   ============================================================ */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ORIGIN = "https://www.storell.dev.br";
const SAULO_ID = `${ORIGIN}/#saulo`;
const PROJECTS = vm.runInNewContext(`${readFileSync(join(ROOT, "projects.js"), "utf8")};PROJECTS`, {});

/* ---------- Textos e endereços por idioma ---------- */
const LANGUAGES = {
  pt: {
    htmlLang: "pt-BR",
    ogLocale: "pt_BR",
    home: "/",
    projectsHref: "/#projetos",
    projectPath: (slug) => `/projetos/${slug}/`,
    otherLabel: "EN",
    otherHtmlLang: "en",
    homeLabel: "Storell, início",
    menuLabel: "Navegação principal",
    openMenu: "Abrir menu",
    nav: [["/#servicos", "Serviços"], ["/#projetos", "Projetos"], ["/#processo", "Processo"], ["/#sobre", "Sobre"], ["/blog/", "Blog"]],
    contact: "/#contato",
    quote: "Pedir orçamento",
    resume: "Currículo",
    blogHref: "/blog/",
    backTop: "Voltar ao topo",
    whatsapp: "https://wa.me/5586998155687?text=Oi%2C%20Saulo%21%20Vim%20pelo%20site%20da%20Storell%20e%20queria%20conversar%20sobre%20um%20projeto.",
    titleSuffix: "estudo de caso",
    labels: {
      eyebrow: "Estudo de caso", back: "Todos os projetos", role: "Papel", stack: "Stack", year: "Ano",
      site: "Abrir site", code: "Ver código", private: "Código privado", next: "Próximo projeto",
      ctaTitle: "Quer algo assim <em>pro seu negócio?</em>",
      ctaText: "Me conta o que você precisa. Eu respondo em até um dia útil.",
      ctaButton: "Pedir orçamento", whatsapp: "Chamar no WhatsApp",
    },
  },
  en: {
    htmlLang: "en",
    ogLocale: "en_US",
    home: "/en/",
    projectsHref: "/en/#work",
    projectPath: (slug) => `/en/projects/${slug}/`,
    otherLabel: "PT",
    otherHtmlLang: "pt-BR",
    homeLabel: "Storell, home",
    menuLabel: "Main navigation",
    openMenu: "Open menu",
    nav: [["/en/#services", "Services"], ["/en/#work", "Work"], ["/en/#process", "Process"], ["/en/#about", "About"], ["/en/blog/", "Blog"]],
    contact: "/en/#contact",
    quote: "Get a quote",
    resume: "Résumé",
    blogHref: "/en/blog/",
    backTop: "Back to top",
    whatsapp: "https://wa.me/5586998155687?text=Hi%20Saulo%21%20I%20found%20you%20through%20the%20Storell%20website%20and%20I%27d%20like%20to%20talk%20about%20a%20project.",
    titleSuffix: "case study",
    labels: {
      eyebrow: "Case study", back: "All projects", role: "Role", stack: "Stack", year: "Year",
      site: "Open website", code: "See code", private: "Private code", next: "Next project",
      ctaTitle: "Want something like this <em>for your business?</em>",
      ctaText: "Tell me what you need. I'll reply within one business day.",
      ctaButton: "Get a quote", whatsapp: "Message on WhatsApp",
    },
  },
};

/* ---------- Pequenos auxiliares ---------- */
const esc = (text) => String(text).replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
const icon = (id) => `<svg class="icon" aria-hidden="true"><use href="#${id}"/></svg>`;
const pad = (index) => String(index + 1).padStart(2, "0");

// Descrição para o Google: até 160 caracteres, cortada numa palavra inteira.
const snippet = (text, limit = 160) => {
  if (text.length <= limit) return text;
  return `${text.slice(0, limit - 1).replace(/\s+\S*$/, "")}…`;
};

/* ---------- Blocos da página (os mesmos que o antigo case.js montava) ---------- */
const linkButton = (href, label, iconId) =>
  `<a class="btn btn-ghost btn-sm" href="${esc(href)}" target="_blank" rel="noopener noreferrer">${label}${icon(iconId)}</a>`;

const tagList = (items) => `<ul class="tags">${items.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>`;

function metaRow(project, study, labels) {
  const links = [
    project.site && linkButton(project.site, labels.site, "i-arrow-up-right"),
    project.repo ? linkButton(project.repo, labels.code, "i-arrow-up-right") : `<span class="study-private">${labels.private}</span>`,
  ].filter(Boolean).join("");

  return `
        <dl class="study-meta reveal">
          <div><dt>${labels.role}</dt><dd>${esc(study.role)}</dd></div>
          <div><dt>${labels.stack}</dt><dd>${tagList(project.stack)}</dd></div>
          ${project.year ? `<div><dt>${labels.year}</dt><dd>${project.year}</dd></div>` : ""}
          <div class="study-links">${links}</div>
        </dl>`;
}

const factList = (facts = []) => facts.length ? `
        <dl class="study-facts">
          ${facts.map(({ value, label }) => `<div class="reveal"><dt>${esc(value)}</dt><dd>${esc(label)}</dd></div>`).join("")}
        </dl>` : "";

const paragraphs = (items = []) => items.map((text) => `<p>${esc(text)}</p>`).join("");
const bullets = (items = []) => items.length ? `<ul>${items.map((text) => `<li>${esc(text)}</li>`).join("")}</ul>` : "";

const layerList = (items = []) => items.length ? `
          <ol class="layers">
            ${items.map(({ title, text }, index) => `
            <li class="service">
              <span class="tile">${pad(index)}</span>
              <h3>${esc(title)}</h3>
              <p>${esc(text)}</p>
            </li>`).join("")}
          </ol>` : "";

const section = ({ title, paragraphs: texts, bullets: items, layers }, index) => `
      <section class="study-section wrap">
        <div class="study-section-head reveal">
          <span>${pad(index)}</span>
          <h2>${esc(title)}</h2>
        </div>
        <div class="study-body reveal">${paragraphs(texts)}${bullets(items)}${layerList(layers)}</div>
      </section>`;

const gallery = (images = []) => images.length ? `
      <div class="study-gallery wrap">
        ${images.map(({ src, caption }) => `
        <figure class="reveal">
          <img src="${esc(src)}" alt="${esc(caption)}" width="1440" height="756" loading="lazy" />
          <figcaption>${esc(caption)}</figcaption>
        </figure>`).join("")}
      </div>` : "";

const cta = (language) => `
      <section class="cta wrap">
        <div class="contact-card reveal">
          <div class="contact-stripes" aria-hidden="true"></div>
          <div class="contact-copy">
            <h2 class="contact-title">${language.labels.ctaTitle}</h2>
            <p class="contact-lead">${language.labels.ctaText}</p>
          </div>
          <div class="cta-actions">
            <a class="btn btn-light" href="${language.contact}">${language.labels.ctaButton}${icon("i-arrow")}</a>
            <a class="btn btn-ghost" href="${language.whatsapp}" target="_blank" rel="noopener noreferrer">${language.labels.whatsapp}${icon("i-chat")}</a>
          </div>
        </div>
      </section>`;

const nextLink = (next, language) => `
      <a class="next wrap reveal" href="${language.projectPath(next.slug)}">
        <div>
          <p class="eyebrow">${language.labels.next}</p>
          <p class="next-name">${esc(next.name)}<span class="round-btn" aria-hidden="true">${icon("i-arrow")}</span></p>
        </div>
        <img src="${esc(next.thumb)}" alt="" width="1600" height="840" loading="lazy" />
      </a>`;

/* ---------- Cabeçalho do documento: SEO completo ---------- */
function structuredData(project, language, description, url) {
  const crumbs = [
    ["Storell", `${ORIGIN}${language.home}`],
    [language.labels.back, `${ORIGIN}${language.projectsHref}`],
    [project.name, url],
  ].map(([name, item], index) => ({ "@type": "ListItem", position: index + 1, name, item }));

  const work = {
    "@type": "CreativeWork",
    "@id": `${url}#project`,
    name: project.name,
    description,
    url,
    image: `${ORIGIN}${project.thumb}`,
    inLanguage: language.htmlLang,
    keywords: project.stack.join(", "),
    author: { "@type": "Person", "@id": SAULO_ID, name: "Saulo Storel", url: `${ORIGIN}/` },
    sameAs: [project.site, project.repo].filter(Boolean),
    ...(project.year && { dateCreated: String(project.year) }),
  };

  return JSON.stringify({ "@context": "https://schema.org", "@graph": [{ "@type": "BreadcrumbList", itemListElement: crumbs }, work] }, null, 2);
}

function head(project, language, other) {
  const study = project.study;
  const url = `${ORIGIN}${language.projectPath(project.slug)}`;
  const otherUrl = `${ORIGIN}${other.projectPath(project.slug)}`;
  const description = snippet(project.summary[language === LANGUAGES.pt ? "pt" : "en"]);
  const title = `${project.name} · ${language.titleSuffix} | Storell`;
  const image = `${ORIGIN}${project.thumb}`;
  const [ptUrl, enUrl] = language === LANGUAGES.pt ? [url, otherUrl] : [otherUrl, url];

  return `    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />
    <meta name="author" content="Saulo Storel" />
    <meta name="theme-color" content="#0e0e10" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <link rel="canonical" href="${url}" />
    <link rel="alternate" hreflang="pt-BR" href="${ptUrl}" />
    <link rel="alternate" hreflang="en" href="${enUrl}" />
    <link rel="alternate" hreflang="x-default" href="${ptUrl}" />

    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:width" content="1600" />
    <meta property="og:image:height" content="840" />
    <meta property="og:image:alt" content="${esc(project.name)}" />
    <meta property="og:locale" content="${language.ogLocale}" />
    <meta property="og:locale:alternate" content="${other.ogLocale}" />
    <meta property="og:site_name" content="Storell" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(title)}" />
    <meta name="twitter:description" content="${esc(description)}" />
    <meta name="twitter:image" content="${image}" />

    <script type="application/ld+json">
${structuredData(project, language, description, url)}
    </script>

    <link rel="icon" href="/favicon.ico" sizes="48x48" />
    <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96.png" />
    <link rel="icon" type="image/png" sizes="192x192" href="/favicon-192.png" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

    <!-- Google Analytics (GA4) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-M75ZHD8C4D"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag() {
        dataLayer.push(arguments);
      }
      gtag("js", new Date());
      gtag("config", "G-M75ZHD8C4D");
    </script>

    <link rel="preload" href="/fonts/schibsted-grotesk.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="stylesheet" href="/style.css?v=2026-10-31" />
    <script>document.documentElement.classList.add("js");</script>`;
}

/* ---------- Página completa ---------- */
function page(project, index, language, other) {
  const study = project.study[language === LANGUAGES.pt ? "pt" : "en"];
  const next = PROJECTS[(index + 1) % PROJECTS.length];
  const { labels } = language;
  const otherHref = other.projectPath(project.slug);

  return `<!DOCTYPE html>
<html lang="${language.htmlLang}">
  <head>
${head(project, language, other)}
  </head>
  <body>
    <svg hidden>
      <symbol id="i-arrow" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></symbol>
      <symbol id="i-arrow-up-right" viewBox="0 0 24 24"><path d="M7 17 17 7M8 7h9v9"/></symbol>
      <symbol id="i-chat" viewBox="0 0 24 24"><path d="M20.5 11.6a8.4 8.4 0 0 1-12.3 7.5L3.5 20.5l1.4-4.6A8.4 8.4 0 1 1 20.5 11.6Z"/></symbol>
    </svg>

    <header class="header">
      <div class="bar">
        <a class="logo" href="${language.home}" aria-label="${language.homeLabel}">Storell<span class="dot"></span></a>
        <nav class="nav" id="menu" aria-label="${language.menuLabel}">
          <div class="nav-links">
${language.nav.map(([href, label]) => `            <a href="${href}">${label}</a>`).join("\n")}
            <a class="lang" href="${otherHref}" hreflang="${language.otherHtmlLang}" lang="${language.otherHtmlLang}">${language.otherLabel}</a>
            <a class="btn btn-primary nav-cta" href="${language.contact}">${language.quote}${icon("i-arrow")}</a>
          </div>
        </nav>
        <a class="btn btn-primary btn-sm bar-cta" href="${language.contact}">${language.quote}${icon("i-arrow")}</a>
        <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="menu" aria-label="${language.openMenu}"><span></span><span></span></button>
      </div>
    </header>

    <main id="case">
      <section class="study-hero wrap">
        <a class="back-link" href="${language.projectsHref}"><span class="round-btn">${icon("i-arrow")}</span>${labels.back}</a>
        <p class="eyebrow reveal">${labels.eyebrow}${project.year ? ` · ${project.year}` : ""}</p>
        <h1 class="study-title reveal">${esc(project.name)}<span class="dot"></span></h1>
        <p class="study-tagline reveal">${esc(study.tagline)}</p>${metaRow(project, study, labels)}
        <figure class="study-cover reveal"><img src="${esc(project.thumb)}" alt="${esc(project.name)}" width="1600" height="840" fetchpriority="high" /></figure>${factList(study.facts)}
      </section>
${study.sections.map(section).join("")}${gallery(study.images)}${cta(language)}${nextLink(next, language)}
    </main>

    <footer class="footer wrap">
      <p class="footer-mark" aria-hidden="true">Storell<span class="dot"></span></p>
      <div class="footer-row">
        <p>© <span id="year"></span> Storell · Saulo Storel</p>
        <ul class="footer-links">
          <li><a class="link" href="https://wa.me/5586998155687" target="_blank" rel="noopener noreferrer">WhatsApp</a></li>
          <li><a class="link" href="https://github.com/SauloStorel" target="_blank" rel="noopener noreferrer">GitHub</a></li>
          <li><a class="link" href="https://www.linkedin.com/in/saulo-storel" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
          <li><a class="link" href="${language.blogHref}">Blog</a></li>
          <li><a class="link" href="/docs/curriculo.pdf" target="_blank" rel="noopener noreferrer">${language.resume}</a></li>
        </ul>
        <a class="round-btn" href="#case" aria-label="${language.backTop}">${icon("i-arrow").replace('class="icon"', 'class="icon icon-up"')}</a>
      </div>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/lenis@1.3.26/dist/lenis.min.js"></script>
    <script src="/common.js"></script>
    <script src="/study.js"></script>
  </body>
</html>
`;
}

/* ---------- Sitemap: só o trecho dos projetos ---------- */
const today = new Date().toISOString().slice(0, 10);
const sitemapPath = join(ROOT, "sitemap.xml");
const sitemap = readFileSync(sitemapPath, "utf8");
const previousLastmod = new Map([...sitemap.matchAll(/<loc>([^<]+)<\/loc>\s*(?:<xhtml[^>]*>\s*)*<lastmod>([^<]+)<\/lastmod>/g)].map((m) => [m[1], m[2]]));

const urlEntries = [];

PROJECTS.forEach((project, index) => {
  const pairs = [["pt", LANGUAGES.pt, LANGUAGES.en], ["en", LANGUAGES.en, LANGUAGES.pt]];
  const urls = {};

  for (const [code, language, other] of pairs) {
    const path = language.projectPath(project.slug);
    const file = join(ROOT, path, "index.html");
    const html = page(project, index, language, other);
    const unchanged = existsSync(file) && readFileSync(file, "utf8") === html;

    mkdirSync(dirname(file), { recursive: true });
    if (!unchanged) writeFileSync(file, html);

    urls[code] = { loc: `${ORIGIN}${path}`, lastmod: unchanged ? previousLastmod.get(`${ORIGIN}${path}`) ?? today : today };
  }

  for (const code of ["pt", "en"]) {
    urlEntries.push(`  <url>
    <loc>${urls[code].loc}</loc>
    <xhtml:link rel="alternate" hreflang="pt-BR" href="${urls.pt.loc}" />
    <xhtml:link rel="alternate" hreflang="en" href="${urls.en.loc}" />
    <lastmod>${urls[code].lastmod}</lastmod>
    <priority>0.7</priority>
  </url>`);
  }
});

const block = `  <!-- projetos:inicio (gerado por scripts/gerar-projetos.mjs) -->\n${urlEntries.join("\n")}\n  <!-- projetos:fim -->`;
const updated = sitemap.includes("<!-- projetos:inicio")
  ? sitemap.replace(/ {2}<!-- projetos:inicio[\s\S]*?<!-- projetos:fim -->/, block)
  : sitemap.replace(/ {2}<url><loc>[^<]*\/(?:projeto|en\/project)\.html\?p=[^<]*<\/loc>.*<\/url>\n/g, "").replace("</urlset>", `${block}\n</urlset>`);

writeFileSync(sitemapPath, updated);
console.log(`${PROJECTS.length} projetos x 2 idiomas gerados; sitemap.xml atualizado.`);
