/* ============================================================
   Estudo de caso: monta a página a partir de projects.js
   pelo parâmetro ?p=slug. Depende de common.js.
   ============================================================ */
const CASE_LABELS = {
  pt: {
    eyebrow: "Estudo de caso",
    back: "Todos os projetos",
    role: "Papel",
    stack: "Stack",
    year: "Ano",
    site: "Abrir site",
    code: "Ver código",
    private: "Código privado",
    next: "Próximo projeto",
    missing: "Esse projeto não existe",
    ctaTitle: "Quer algo assim <em>pro seu negócio?</em>",
    ctaText: "Me conta o que você precisa. Eu respondo em até um dia útil.",
    ctaButton: "Pedir orçamento",
    whatsapp: "Chamar no WhatsApp",
  },
  en: {
    eyebrow: "Case study",
    back: "All projects",
    role: "Role",
    stack: "Stack",
    year: "Year",
    site: "Open website",
    code: "See code",
    private: "Private code",
    next: "Next project",
    missing: "This project doesn't exist",
    ctaTitle: "Want something like this <em>for your business?</em>",
    ctaText: "Tell me what you need. I'll reply within one business day.",
    ctaButton: "Get a quote",
    whatsapp: "Message on WhatsApp",
  },
}[LANG];

const slug = new URLSearchParams(location.search).get("p");
const project = PROJECTS.find((p) => p.slug === slug);
const root = document.getElementById("case");

const linkButton = (href, label, iconId) =>
  `<a class="btn btn-ghost btn-sm" href="${escHtml(href)}" target="_blank" rel="noopener noreferrer">${label}${icon(iconId)}</a>`;

const tagList = (items) => `<ul class="tags">${items.map((item) => `<li>${escHtml(item)}</li>`).join("")}</ul>`;

function metaRow(current, study) {
  const links = [
    current.site && linkButton(current.site, CASE_LABELS.site, "i-arrow-up-right"),
    current.repo ? linkButton(current.repo, CASE_LABELS.code, "i-arrow-up-right") : `<span class="study-private">${CASE_LABELS.private}</span>`,
  ].filter(Boolean).join("");

  return `
    <dl class="study-meta reveal">
      <div><dt>${CASE_LABELS.role}</dt><dd>${escHtml(study.role)}</dd></div>
      <div><dt>${CASE_LABELS.stack}</dt><dd>${tagList(current.stack)}</dd></div>
      ${current.year ? `<div><dt>${CASE_LABELS.year}</dt><dd>${current.year}</dd></div>` : ""}
      <div class="study-links">${links}</div>
    </dl>
  `;
}

const factList = (facts = []) => facts.length ? `
  <dl class="study-facts">
    ${facts.map(({ value, label }) => `<div class="reveal"><dt>${escHtml(value)}</dt><dd>${escHtml(label)}</dd></div>`).join("")}
  </dl>
` : "";

const paragraphs = (items = []) => items.map((text) => `<p>${escHtml(text)}</p>`).join("");
const bullets = (items = []) => items.length ? `<ul>${items.map((text) => `<li>${escHtml(text)}</li>`).join("")}</ul>` : "";

// Camadas: a mesma linha dos Serviços da home, com o número no lugar do ícone.
const layerList = (items = []) => items.length ? `
  <ol class="layers">
    ${items.map(({ title, text }, index) => `
      <li class="service">
        <span class="tile">${String(index + 1).padStart(2, "0")}</span>
        <h3>${escHtml(title)}</h3>
        <p>${escHtml(text)}</p>
      </li>
    `).join("")}
  </ol>
` : "";

const section = ({ title, paragraphs: texts, bullets: items, layers }, index) => `
  <section class="study-section wrap">
    <div class="study-section-head reveal">
      <span>${String(index + 1).padStart(2, "0")}</span>
      <h2>${escHtml(title)}</h2>
    </div>
    <div class="study-body reveal">${paragraphs(texts)}${bullets(items)}${layerList(layers)}</div>
  </section>
`;

const gallery = (images) => images.length ? `
  <div class="study-gallery wrap">
    ${images.map(({ src, caption }) => `
      <figure class="reveal">
        <img src="${escHtml(src)}" alt="${escHtml(caption)}" width="1440" height="756" loading="lazy" />
        <figcaption>${escHtml(caption)}</figcaption>
      </figure>
    `).join("")}
  </div>
` : "";

const cta = () => `
  <section class="cta wrap">
    <div class="contact-card reveal">
      <div class="contact-stripes" aria-hidden="true"></div>
      <div class="contact-copy">
        <h2 class="contact-title">${CASE_LABELS.ctaTitle}</h2>
        <p class="contact-lead">${CASE_LABELS.ctaText}</p>
      </div>
      <div class="cta-actions">
        <a class="btn btn-light" href="${T.contact}">${CASE_LABELS.ctaButton}${icon("i-arrow")}</a>
        <a class="btn btn-ghost" href="${T.whatsapp}" target="_blank" rel="noopener noreferrer">${CASE_LABELS.whatsapp}${icon("i-chat")}</a>
      </div>
    </div>
  </section>
`;

const nextLink = (next) => `
  <a class="next wrap reveal" href="${T.caseStudyPath}${escHtml(next.slug)}">
    <div>
      <p class="eyebrow">${CASE_LABELS.next}</p>
      <p class="next-name">${escHtml(next.name)}<span class="round-btn" aria-hidden="true">${icon("i-arrow")}</span></p>
    </div>
    <img src="${escHtml(next.thumb)}" alt="" width="1600" height="840" loading="lazy" />
  </a>
`;

function renderCase(current) {
  const study = current.study[LANG];
  const next = PROJECTS[(PROJECTS.indexOf(current) + 1) % PROJECTS.length];

  document.title = `${current.name} · Storell`;
  document.querySelector('meta[name="description"]').setAttribute("content", current.summary[LANG]);

  root.innerHTML = `
    <section class="study-hero wrap">
      <a class="back-link" href="${T.projects}"><span class="round-btn">${icon("i-arrow")}</span>${CASE_LABELS.back}</a>
      <p class="eyebrow reveal">${CASE_LABELS.eyebrow}${current.year ? ` · ${current.year}` : ""}</p>
      <h1 class="study-title reveal">${escHtml(current.name)}<span class="dot"></span></h1>
      <p class="study-tagline reveal">${escHtml(study.tagline)}</p>
      ${metaRow(current, study)}
      <figure class="study-cover reveal"><img src="${escHtml(current.thumb)}" alt="" width="1600" height="840" /></figure>
      ${factList(study.facts)}
    </section>

    ${study.sections.map(section).join("")}
    ${gallery(study.images)}
    ${cta()}
    ${nextLink(next)}
  `;
}

function renderMissing() {
  root.innerHTML = `
    <section class="study-missing wrap">
      <h1 class="study-title">${CASE_LABELS.missing}<span class="dot"></span></h1>
      <a class="btn btn-primary" href="${T.projects}">${CASE_LABELS.back}${icon("i-arrow")}</a>
    </section>
  `;
}

project ? renderCase(project) : renderMissing();
revealWithin(root);
