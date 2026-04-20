history.scrollRestoration = "manual";

// ===== Typing Effect =====
const typedName = document.getElementById("typed-name");
const cursorEl = document.querySelector(".cursor-blink");

const typeSequence = [
  { action: "type",      text: "Saulo Xtorel" },
  { action: "pause",     ms: 420 },
  { action: "backspace", count: 6 },
  { action: "pause",     ms: 180 },
  { action: "type",      text: "Storel" },
  { action: "done" },
];

function runType(steps, i = 0) {
  if (i >= steps.length) return;
  const step = steps[i];
  const next = () => runType(steps, i + 1);

  if (step.action === "type") {
    let c = 0;
    (function tick() {
      if (c < step.text.length) {
        typedName.textContent += step.text[c++];
        setTimeout(tick, 75 + Math.random() * 55);
      } else { next(); }
    })();
  } else if (step.action === "backspace") {
    let c = 0;
    (function tick() {
      if (c < step.count) {
        typedName.textContent = typedName.textContent.slice(0, -1);
        c++;
        setTimeout(tick, 55 + Math.random() * 30);
      } else { next(); }
    })();
  } else if (step.action === "pause") {
    setTimeout(next, step.ms);
  } else if (step.action === "done") {
    setTimeout(() => {
      if (cursorEl) {
        cursorEl.style.transition = "opacity 0.6s";
        cursorEl.style.opacity = "0";
        setTimeout(() => { cursorEl.style.animation = "none"; }, 600);
      }
    }, 2000);
  }
}

setTimeout(() => runType(typeSequence), 800);

// ===== Mobile Menu =====
const menuToggle = document.querySelector(".menu-toggle");
const navList = document.querySelector("#navbar ul");

menuToggle.addEventListener("click", () => {
  menuToggle.classList.toggle("active");
  navList.classList.toggle("active");
});

navList.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    menuToggle.classList.remove("active");
    navList.classList.remove("active");
    const target = document.querySelector(link.getAttribute("href"));
    if (target) target.scrollIntoView({ behavior: "smooth" });
    history.replaceState(null, "", location.pathname);
  });
});

// ===== Scroll Reveal =====
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  },
  { threshold: 0.1 }
);

document.querySelectorAll(".section").forEach((el) => {
  el.classList.add("reveal");
  revealObserver.observe(el);
});

// ===== Dynamic Year =====
const yearEl = document.getElementById("footer-year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ===== Scroll Progress + Active Nav =====
const scrollProgress = document.getElementById("scroll-progress");
const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll("#navbar ul a");

window.addEventListener("scroll", () => {
  const scrolled = scrollY / (document.body.scrollHeight - window.innerHeight);
  scrollProgress.style.width = Math.min(scrolled * 100, 100) + "%";

  let current = "";
  const nearBottom = window.innerHeight + scrollY >= document.body.offsetHeight - 80;

  if (nearBottom) {
    current = sections[sections.length - 1].getAttribute("id");
  } else {
    sections.forEach((section) => {
      if (scrollY >= section.offsetTop - 120) current = section.getAttribute("id");
    });
  }

  navLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href") === `#${current}`) link.classList.add("active");
  });
});

// ===== Toast =====
const toast = document.getElementById("toast");
let toastTimer;

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2500);
}

// ===== Copy Email =====
document.querySelectorAll('a[href^="mailto:"]').forEach((link) => {
  link.addEventListener("click", () => {
    const email = link.getAttribute("href").replace("mailto:", "");
    navigator.clipboard.writeText(email)
      .then(() => showToast("Email copiado!"))
      .catch(() => showToast("Abrindo cliente de email..."));
  });
});

// ===== Theme Toggle =====
const themeToggleBtn = document.getElementById("theme-toggle");

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
  themeToggleBtn.querySelector("i").className =
    theme === "dark" ? "fas fa-sun" : "fas fa-moon";
}

applyTheme(document.documentElement.getAttribute("data-theme") || "dark");

themeToggleBtn.addEventListener("click", () => {
  applyTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark");
});

// ===== GitHub Projects =====
function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatRepoName(name) {
  return name.replace(/[-_]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

async function fetchGithubProjects() {
  const list = document.getElementById("projects-list");
  if (!list) return;

  try {
    const res = await fetch(
      "https://api.github.com/users/saulostorel/repos?sort=updated&direction=desc&per_page=100&type=owner"
    );
    if (!res.ok) throw new Error(`GitHub API: ${res.status}`);

    const repos = await res.json();
    const nonForks = repos.filter(r => !r.fork);
    const pinned = nonForks.filter(r => r.topics?.includes("portfolio"));
    const toShow = (pinned.length > 0 ? pinned : nonForks).slice(0, 6);

    if (toShow.length === 0) throw new Error("Nenhum repo encontrado");

    list.innerHTML = toShow.map((repo, i) => {
      const index = String(i + 1).padStart(2, "0");
      const title = formatRepoName(repo.name);
      const desc  = repo.description || "Sem descrição.";
      const tags  = repo.topics?.length > 0
        ? repo.topics.slice(0, 3)
        : (repo.language ? [repo.language] : []);
      const live = repo.homepage
        ? `<a href="${escHtml(repo.homepage)}" target="_blank" rel="noopener noreferrer" aria-label="Demo"><i class="fas fa-up-right-from-square"></i></a>`
        : "";

      return `
        <article class="project-item">
          <div class="project-index">${escHtml(index)}</div>
          <div class="project-info">
            <h3>${escHtml(title)}</h3>
            <p>${escHtml(desc)}</p>
          </div>
          <div class="project-tags">
            ${tags.map(t => `<span>${escHtml(t)}</span>`).join("")}
          </div>
          <div class="project-links">
            <a href="${escHtml(repo.html_url)}" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <i class="fab fa-github"></i>
            </a>
            ${live}
          </div>
        </article>
      `;
    }).join("");

  } catch (err) {
    console.warn("GitHub API indisponível.", err);
    list.innerHTML = `
      <article class="project-item">
        <div class="project-index">01</div>
        <div class="project-info">
          <h3>Portfólio Pessoal</h3>
          <p>Site construído do zero, sem frameworks — exercício de domínio completo de HTML, CSS e JS vanilla.</p>
        </div>
        <div class="project-tags"><span>HTML</span><span>CSS</span><span>JS</span></div>
        <div class="project-links">
          <a href="https://github.com/SauloStorel/MyPortifolioWeb" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            <i class="fab fa-github"></i>
          </a>
        </div>
      </article>
    `;
  }
}

fetchGithubProjects();

// ===== Contact Form =====
const contactForm = document.getElementById("contact-form");

function setError(inputId, errorId, msg) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  if (!input || !error) return;
  input.classList.add("invalid");
  error.textContent = msg;
  error.classList.add("visible");
}

function clearError(inputId, errorId) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  if (!input || !error) return;
  input.classList.remove("invalid");
  error.classList.remove("visible");
}

if (contactForm) {
  ["contact-name", "contact-email", "contact-message"].forEach((id, i) => {
    const errorIds = ["error-name", "error-email", "error-message"];
    document.getElementById(id)?.addEventListener("input", () => clearError(id, errorIds[i]));
  });

  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name    = document.getElementById("contact-name");
    const email   = document.getElementById("contact-email");
    const message = document.getElementById("contact-message");
    const btn     = document.getElementById("form-submit");
    let valid = true;

    clearError("contact-name",    "error-name");
    clearError("contact-email",   "error-email");
    clearError("contact-message", "error-message");

    if (!name.value.trim()) {
      setError("contact-name", "error-name", "Informe seu nome.");
      valid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim()) {
      setError("contact-email", "error-email", "Informe seu email.");
      valid = false;
    } else if (!emailRegex.test(email.value.trim())) {
      setError("contact-email", "error-email", "Email inválido.");
      valid = false;
    }

    if (!message.value.trim()) {
      setError("contact-message", "error-message", "Escreva sua mensagem.");
      valid = false;
    }

    if (!valid) return;

    btn.classList.add("btn-loading");
    btn.querySelector("span").textContent = "Enviando...";

    try {
      const res = await fetch(contactForm.action, {
        method: "POST",
        headers: { "Accept": "application/json" },
        body: new FormData(contactForm),
      });

      if (res.ok) {
        showToast("Mensagem enviada!");
        contactForm.reset();
      } else {
        showToast("Erro ao enviar. Tente novamente.");
      }
    } catch {
      showToast("Erro de conexão. Tente novamente.");
    } finally {
      btn.classList.remove("btn-loading");
      btn.querySelector("span").textContent = "Enviar mensagem";
    }
  });
}

// ===== Local Time =====
const localTimeEl = document.getElementById("local-time-display");

function updateLocalTime() {
  if (!localTimeEl) return;
  localTimeEl.textContent = new Date().toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Fortaleza",
  });
}
updateLocalTime();
setInterval(updateLocalTime, 1000);

// ===== Loader =====
window.addEventListener("load", () => {
  setTimeout(() => {
    document.getElementById("loader").classList.add("out");
  }, 500);
});
