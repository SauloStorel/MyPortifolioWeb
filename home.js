/* ============================================================
   Página inicial: cards de projeto, pílula de vidro sobre eles
   e formulário de contato. Depende de common.js e projects.js.
   ============================================================ */

/* ---------- Projetos: todo card abre o estudo de caso ---------- */
function caseCard(project) {
  return `
    <li class="case reveal">
      <a href="${T.caseStudyPath}${escHtml(project.slug)}">
        <div class="case-media">
          <img src="${escHtml(project.thumb)}" alt="" width="1600" height="840" loading="lazy" />
        </div>
        <div class="case-head">
          <h3>${escHtml(project.name)}</h3>
          <span class="round-btn" aria-hidden="true">${icon("i-arrow")}</span>
        </div>
        <p>${escHtml(project.summary[LANG])}</p>
        <ul class="tags">${project.stack.map((tech) => `<li>${escHtml(tech)}</li>`).join("")}</ul>
      </a>
    </li>
  `;
}

const workGrid = document.getElementById("work-grid");
workGrid.innerHTML = PROJECTS.map(caseCard).join("");
revealWithin(workGrid);

/* ---------- Pílula de vidro que segue o cursor sobre os prints ---------- */
// Persegue o cursor com atraso (lerp), para parecer um objeto com peso.
function followCursorOverCases() {
  const pill = document.querySelector(".cursor-pill");
  pill.querySelector("span").textContent = T.seeProject;
  const target = { x: 0, y: 0 };
  const current = { x: 0, y: 0 };
  let visible = false;

  // O loop só roda enquanto a pílula está à vista.
  function tick() {
    current.x += (target.x - current.x) * 0.2;
    current.y += (target.y - current.y) * 0.2;
    pill.style.translate = `${current.x}px ${current.y}px`;
    if (visible) requestAnimationFrame(tick);
  }

  function show(event) {
    Object.assign(target, { x: event.clientX, y: event.clientY });
    Object.assign(current, target);
    visible = true;
    pill.classList.add("is-visible");
    tick();
  }

  function hide() {
    visible = false;
    pill.classList.remove("is-visible");
  }

  workGrid.querySelectorAll(".case-media").forEach((media) => {
    media.addEventListener("pointerenter", show);
    media.addEventListener("pointerleave", hide);
  });

  addEventListener("pointermove", (event) => Object.assign(target, { x: event.clientX, y: event.clientY }));
  document.documentElement.classList.add("has-cursor-pill");
}

if (finePointer) followCursorOverCases();

/* ---------- Formulário (Formspree) ---------- */
const form = document.getElementById("contact-form");
const formStatus = form.querySelector(".form-status");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const invalid = [...form.elements].filter((field) => field.willValidate && !field.checkValidity());
  form.querySelectorAll("input, textarea").forEach((field) => field.removeAttribute("aria-invalid"));
  invalid.forEach((field) => field.setAttribute("aria-invalid", "true"));

  if (invalid.length) {
    formStatus.textContent = T.formInvalid;
    invalid[0].focus();
    return;
  }

  formStatus.textContent = T.sending;

  try {
    const response = await fetch(form.action, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error(response.statusText);

    form.reset();
    formStatus.textContent = T.sent;
  } catch {
    formStatus.textContent = T.sendFailed;
  }
});
