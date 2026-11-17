/* ============================================================
   Blog: tema claro/escuro, busca e filtro por tag, progresso de
   leitura, índice do artigo e botões de copiar. O conteúdo já vem
   completo no HTML (bom para o Google): aqui só entra o que é
   interativo, sem depender de nada de fora.
   ============================================================ */

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

/* ---------- Ano do rodapé ---------- */
$("[data-year]").textContent = new Date().getFullYear();

/* ---------- Tema ---------- */
// O tema inicial já foi aplicado no <head>; aqui só alternamos e lembramos a escolha.
$("[data-theme-toggle]").addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem("theme", next); } catch (error) { /* navegação privada */ }
});

/* ---------- Listagem: busca e filtro por tag ---------- */
function setupListing(list) {
  const search = $("[data-search]");
  const chips = $$("[data-tag-chip]");
  const rows = $$("[data-row]", list);
  const months = $$("[data-month]", list);
  const empty = $("[data-empty]", list);
  const countText = (count) => (count === 1 ? list.dataset.one : list.dataset.other).replace(/\d+/, count);
  let activeTag = "";

  function apply() {
    const query = search.value.trim().toLowerCase();
    rows.forEach((row) => {
      const matchesTag = !activeTag || row.dataset.tags.split(" ").includes(activeTag);
      const matchesQuery = !query || row.dataset.search.includes(query);
      row.hidden = !(matchesTag && matchesQuery);
    });
    months.forEach((month) => {
      const visible = $$("[data-row]:not([hidden])", month).length;
      month.hidden = visible === 0;
      $("[data-count]", month).textContent = countText(visible);
    });
    empty.hidden = rows.some((row) => !row.hidden);
  }

  chips.forEach((chip) => chip.addEventListener("click", () => {
    activeTag = chip.dataset.tagChip;
    chips.forEach((other) => {
      const on = other === chip;
      other.classList.toggle("is-on", on);
      other.setAttribute("aria-pressed", on);
    });
    apply();
  }));

  search.addEventListener("input", apply);

  // "/" leva direto para a busca, como em vários blogs técnicos.
  addEventListener("keydown", (event) => {
    if (event.key !== "/" || /input|textarea/i.test(document.activeElement.tagName)) return;
    event.preventDefault();
    search.focus();
  });
}

const list = $("[data-blog-list]");
if (list) setupListing(list);

/* ---------- Artigo: progresso de leitura ---------- */
const progress = $("[data-progress]");
const prose = $("[data-prose]");

if (progress && prose) {
  let frame = 0;
  const update = () => {
    frame = 0;
    const { top, height } = prose.getBoundingClientRect();
    const read = (innerHeight * 0.5 - top) / height; // 0 quando o texto começa, 1 quando termina
    progress.style.transform = `scaleX(${Math.min(Math.max(read, 0), 1)})`;
  };
  addEventListener("scroll", () => { frame ||= requestAnimationFrame(update); }, { passive: true });
  update();
}

/* ---------- Artigo: índice acompanha a leitura ---------- */
const tocLinks = $$(".toc a");

if (tocLinks.length) {
  const linkFor = new Map(tocLinks.map((link) => [decodeURIComponent(link.hash.slice(1)), link]));
  const headings = [...linkFor.keys()].map((id) => document.getElementById(id)).filter(Boolean);

  const observer = new IntersectionObserver((entries) => {
    const entry = entries.find((item) => item.isIntersecting);
    if (!entry) return;
    tocLinks.forEach((link) => link.classList.remove("is-active"));
    linkFor.get(entry.target.id).classList.add("is-active");
  }, { rootMargin: "-80px 0px -70% 0px" });

  headings.forEach((heading) => observer.observe(heading));
}

/* ---------- Artigo: copiar código ---------- */
if (prose) {
  $$(".highlight", prose).forEach((block) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "copy-code";
    button.textContent = prose.dataset.copy;
    button.addEventListener("click", async () => {
      await navigator.clipboard.writeText($("pre", block).innerText);
      button.textContent = prose.dataset.copied;
      setTimeout(() => { button.textContent = prose.dataset.copy; }, 1800);
    });
    block.append(button);
  });
}

/* ---------- Artigo: copiar o link ---------- */
const copyLink = $("[data-copy-link]");

if (copyLink) {
  const label = $("span", copyLink);
  const original = label.textContent;
  copyLink.addEventListener("click", async () => {
    await navigator.clipboard.writeText(location.href);
    label.textContent = copyLink.dataset.done;
    setTimeout(() => { label.textContent = original; }, 1800);
  });
}
