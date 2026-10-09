/* ============================================================
   Página inicial: índice de projetos e formulário de contato.
   Depende de common.js (T, LANG, escHtml, icon) e projects.js.
   ============================================================ */

/* ---------- Índice de projetos ---------- */
function projectRow(project, index) {
  const caseUrl = project.study && `${T.caseStudyPath}${project.slug}`;
  const mainUrl = caseUrl || project.site;
  const mainTarget = caseUrl ? "" : ' target="_blank" rel="noopener noreferrer"';
  const links = [
    project.site && externalLink(project.site, T.site),
    project.repo && externalLink(project.repo, T.code),
  ].filter(Boolean).join("");

  return `
    <li class="row">
      <span class="row-num">${String(index + 1).padStart(2, "0")}</span>
      <div class="row-main">
        <h3 class="row-name">
          <a href="${escHtml(mainUrl)}"${mainTarget}>${escHtml(project.name)}${icon(caseUrl ? "i-arrow" : "i-external")}</a>
        </h3>
        <p class="row-desc">${escHtml(project.summary[LANG])}</p>
        ${links && `<p class="row-links">${links}</p>`}
      </div>
      <span class="row-stack">${project.stack.map(escHtml).join(", ")}</span>
      <span class="row-year">${project.year ?? ""}</span>
      <img class="row-thumb" src="${escHtml(project.thumb)}" alt="" loading="lazy" width="1600" height="840" />
    </li>
  `;
}

document.getElementById("projects-list").innerHTML = PROJECTS.map(projectRow).join("");
document.querySelectorAll("[data-project-count]").forEach((el) => { el.textContent = PROJECTS.length; });

/* ---------- Formulário de contato (Formspree) ---------- */
const contactForm = document.getElementById("contact-form");
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Cada campo devolve a mensagem de erro, ou "" quando está válido.
const VALIDATIONS = {
  "contact-name": (value) => (value ? "" : T.nameRequired),
  "contact-email": (value) => {
    if (!value) return T.emailRequired;
    return EMAIL_PATTERN.test(value) ? "" : T.emailInvalid;
  },
  "contact-message": (value) => (value ? "" : T.messageRequired),
};

function showFieldError(input, msg) {
  input.setAttribute("aria-invalid", String(Boolean(msg)));
  document.getElementById(input.getAttribute("aria-describedby")).textContent = msg;
}

function validateForm() {
  return Object.entries(VALIDATIONS)
    .map(([id, validate]) => {
      const input = document.getElementById(id);
      const msg = validate(input.value.trim());
      showFieldError(input, msg);
      return !msg;
    })
    .every(Boolean);
}

Object.keys(VALIDATIONS).forEach((id) => {
  const input = document.getElementById(id);
  input.addEventListener("input", () => showFieldError(input, ""));
});

contactForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  const btn = document.getElementById("form-submit");
  const label = btn.querySelector("span");
  btn.disabled = true;
  label.textContent = T.sending;

  try {
    const res = await fetch(contactForm.action, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: new FormData(contactForm),
    });
    if (!res.ok) throw new Error(`Formspree: ${res.status}`);

    showToast(T.sent);
    contactForm.reset();
  } catch {
    showToast(T.sendFailed);
  } finally {
    btn.disabled = false;
    label.textContent = T.send;
  }
});
