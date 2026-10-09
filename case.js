/* ============================================================
   Estudo de caso: monta a página a partir de projects.js
   pelo parâmetro ?p=slug. Depende de common.js.
   ============================================================ */
const CASE_LABELS = {
  pt: { back: "Todos os projetos", home: "/#projects", role: "Papel", stack: "Stack", year: "Ano", links: "Links", next: "Próximo projeto", missing: "Projeto não encontrado.", private: "Código privado" },
  en: { back: "All projects", home: "/en/#projects", role: "Role", stack: "Stack", year: "Year", links: "Links", next: "Next project", missing: "Project not found.", private: "Private code" },
}[LANG];

const studies = PROJECTS.filter((project) => project.study);
const slug = new URLSearchParams(window.location.search).get("p");
const project = studies.find((p) => p.slug === slug);
const root = document.getElementById("case");

const metaItem = (label, value) => `<div><dt>${label}</dt><dd>${value}</dd></div>`;

const paragraphs = (items = []) => items.map((text) => `<p>${escHtml(text)}</p>`).join("");
const bullets = (items = []) => (items.length ? `<ul>${items.map((text) => `<li>${escHtml(text)}</li>`).join("")}</ul>` : "");

function section({ title, paragraphs: texts, bullets: items }) {
  return `
    <section class="block grid case-section">
      <h2 class="label">${escHtml(title)}</h2>
      <div class="case-body">${paragraphs(texts)}${bullets(items)}</div>
    </section>
  `;
}

const figure = ({ src, caption }) => `
  <figure class="case-figure">
    <img src="${escHtml(src)}" alt="${escHtml(caption)}" loading="lazy" width="1440" height="756" />
    <figcaption>${escHtml(caption)}</figcaption>
  </figure>
`;

function renderCase(current) {
  const study = current.study[LANG];
  const next = studies[(studies.indexOf(current) + 1) % studies.length];
  const links = [
    current.site && externalLink(current.site, T.site),
    current.repo ? externalLink(current.repo, T.code) : `<span>${CASE_LABELS.private}</span>`,
  ].filter(Boolean).join("");

  document.title = `${current.name} · Saulo Storel`;
  document.querySelector('meta[name="description"]').setAttribute("content", current.summary[LANG]);

  root.innerHTML = `
    <header class="case-head grid">
      <a class="case-back" href="${CASE_LABELS.home}">${CASE_LABELS.back}</a>
      <h1 class="case-title">${escHtml(current.name)}</h1>
      <p class="lead">${escHtml(study.tagline)}</p>
      <dl class="case-meta">
        ${metaItem(CASE_LABELS.role, escHtml(study.role))}
        ${metaItem(CASE_LABELS.stack, `<span class="mono">${current.stack.map(escHtml).join(", ")}</span>`)}
        ${current.year ? metaItem(CASE_LABELS.year, current.year) : ""}
        ${metaItem(CASE_LABELS.links, `<span class="case-links">${links}</span>`)}
      </dl>
      <figure class="case-cover"><img src="${escHtml(current.thumb)}" alt="" width="1600" height="840" /></figure>
    </header>

    ${study.sections.map(section).join("")}

    <div class="grid">${study.images.map(figure).join("")}</div>

    <nav class="block grid case-next" aria-label="${CASE_LABELS.next}">
      <span class="label">${CASE_LABELS.next}</span>
      <a href="${T.caseStudyPath}${next.slug}">${escHtml(next.name)}${icon("i-arrow")}</a>
    </nav>
  `;
}

function renderMissing() {
  root.innerHTML = `
    <section class="case-missing grid">
      <h1 class="case-title">${CASE_LABELS.missing}</h1>
      <a href="${CASE_LABELS.home}">${CASE_LABELS.back}</a>
    </section>
  `;
}

project ? renderCase(project) : renderMissing();
