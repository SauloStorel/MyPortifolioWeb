// Sempre volta ao topo ao recarregar
history.scrollRestoration = "manual";

// ===== Spotlight + Cursor + Dust =====
let mouseX = -2000, mouseY = -2000;

document.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  document.documentElement.style.setProperty("--mouse-x", e.clientX + "px");
  document.documentElement.style.setProperty("--mouse-y", e.clientY + "px");
});

// Dust particles
const dustCanvas = document.getElementById("dust-canvas");
const dCtx = dustCanvas.getContext("2d");

function resizeDust() {
  dustCanvas.width = window.innerWidth;
  dustCanvas.height = window.innerHeight;
}
resizeDust();
window.addEventListener("resize", resizeDust);

class Particle {
  constructor() { this.init(true); }

  init(randomY = false) {
    this.x = Math.random() * window.innerWidth;
    this.y = randomY ? Math.random() * window.innerHeight : window.innerHeight + 5;
    this.size = Math.random() * 1.2 + 0.4;
    this.vx = (Math.random() - 0.5) * 0.15;
    this.vy = -(Math.random() * 0.25 + 0.05);
    this.opacity = Math.random() * 0.35 + 0.08;
    this.life = randomY ? Math.random() : 0;
    this.lifeSpeed = Math.random() * 0.0015 + 0.0008;
  }

  update() {
    const dx = this.x - mouseX;
    const dy = this.y - mouseY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 120 && dist > 0) {
      const force = (120 - dist) / 120;
      this.vx += (dx / dist) * force * 0.4;
      this.vy += (dy / dist) * force * 0.4;
    }

    this.vx *= 0.97;
    this.vy *= 0.97;
    this.vy -= 0.008;

    this.x += this.vx;
    this.y += this.vy;
    this.life += this.lifeSpeed;

    if (this.life >= 1 || this.y < -10) this.init();
    if (this.x < -5) this.x = window.innerWidth + 5;
    if (this.x > window.innerWidth + 5) this.x = -5;
  }

  draw() {
    const alpha = Math.sin(this.life * Math.PI) * this.opacity;
    dCtx.beginPath();
    dCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    dCtx.fillStyle = `rgba(200, 169, 126, ${alpha})`;
    dCtx.fill();
  }
}

const particles = Array.from({ length: 70 }, () => new Particle());

let dustRafId;
function drawDust() {
  dCtx.clearRect(0, 0, dustCanvas.width, dustCanvas.height);
  particles.forEach(p => { p.update(); p.draw(); });
  dustRafId = requestAnimationFrame(drawDust);
}
drawDust();

document.addEventListener("visibilitychange", () => {
  if (document.hidden) cancelAnimationFrame(dustRafId);
  else drawDust();
});

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
  link.addEventListener("click", () => {
    menuToggle.classList.remove("active");
    navList.classList.remove("active");
  });
});

// ===== Scroll Reveal =====
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".section").forEach((el) => {
  el.classList.add("reveal");
  revealObserver.observe(el);
});

// ===== Dynamic Year =====
const yearEl = document.getElementById("footer-year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ===== Scroll Progress Bar =====
const scrollProgress = document.getElementById("scroll-progress");

// ===== Active Nav on Scroll =====
const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll("#navbar ul a");

window.addEventListener("scroll", () => {
  // Progress bar
  const scrolled = scrollY / (document.body.scrollHeight - window.innerHeight);
  scrollProgress.style.width = Math.min(scrolled * 100, 100) + "%";

  // Active nav
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

// ===== Copy Email on Click =====
document.querySelectorAll('a[href^="mailto:"]').forEach((link) => {
  link.addEventListener("click", (e) => {
    const email = link.getAttribute("href").replace("mailto:", "");
    navigator.clipboard.writeText(email)
      .then(() => showToast("Email copiado!"))
      .catch(() => showToast("Abrindo cliente de email..."));
  });
});

// ===== Photo Tilt 3D =====
const photoFrame = document.querySelector(".photo-frame");
if (photoFrame) {
  photoFrame.addEventListener("mousemove", (e) => {
    const rect = photoFrame.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    photoFrame.style.transform = `perspective(800px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) scale(1.02)`;
  });

  photoFrame.addEventListener("mouseleave", () => {
    photoFrame.style.transition = "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)";
    photoFrame.style.transform = "perspective(800px) rotateY(0deg) rotateX(0deg) scale(1)";
    setTimeout(() => { photoFrame.style.transition = ""; }, 600);
  });
}

// ===== Magnetic Buttons =====
document.querySelectorAll(".btn-primary").forEach((btn) => {
  btn.addEventListener("mousemove", (e) => {
    const rect = btn.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.25;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.25;
    btn.style.transform = `translate(${x}px, ${y}px) translateY(-1px)`;
  });

  btn.addEventListener("mouseleave", () => {
    btn.style.transform = "";
  });
});

// ===== Theme Toggle =====
const themeToggleBtn = document.getElementById("theme-toggle");

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
  const icon = themeToggleBtn.querySelector("i");
  icon.className = theme === "dark" ? "fas fa-sun" : "fas fa-moon";
}

// Sync icon on load
applyTheme(document.documentElement.getAttribute("data-theme") || "dark");

themeToggleBtn.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  applyTheme(current === "dark" ? "light" : "dark");
});

// ===== Project Preview =====
const previewCard = document.createElement("div");
previewCard.className = "project-preview";
document.body.appendChild(previewCard);

function attachProjectPreviews() {
  document.querySelectorAll(".project-item").forEach((item) => {
    const titleEl = item.querySelector("h3");
    const tags    = [...item.querySelectorAll(".project-tags span")].map(s => s.textContent);
    const index   = item.querySelector(".project-index")?.textContent || "";
    if (!titleEl) return;

    item.addEventListener("mouseenter", () => {
      previewCard.innerHTML = `
        <div class="preview-label">Projeto ${escHtml(index)}</div>
        <div class="preview-title">${escHtml(titleEl.textContent)}</div>
        <div class="preview-tags">${tags.map(t => `<span>${escHtml(t)}</span>`).join("")}</div>
      `;
      previewCard.classList.add("visible");
    });

    item.addEventListener("mousemove", (e) => {
      const x = e.clientX + 28;
      const y = e.clientY - 60;
      const maxX = window.innerWidth - 250;
      previewCard.style.left = Math.min(x, maxX) + "px";
      previewCard.style.top  = Math.max(y, 10) + "px";
    });

    item.addEventListener("mouseleave", () => {
      previewCard.classList.remove("visible");
    });
  });
}

attachProjectPreviews();

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

    // Prioriza repos marcados com o tópico "portfolio"
    const pinned  = nonForks.filter(r => r.topics?.includes("portfolio"));
    const toShow  = (pinned.length > 0 ? pinned : nonForks).slice(0, 6);

    if (toShow.length === 0) throw new Error("Nenhum repo encontrado");

    list.innerHTML = toShow.map((repo, i) => {
      const index = String(i + 1).padStart(2, "0");
      const title = formatRepoName(repo.name);
      const desc  = repo.description || "Sem descrição.";
      const tags  = (repo.topics?.length > 0 ? repo.topics.slice(0, 3) : (repo.language ? [repo.language] : []));
      const live  = repo.homepage
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

    attachProjectPreviews();

  } catch (err) {
    console.warn("GitHub API indisponível, exibindo projetos estáticos.", err);
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
    attachProjectPreviews();
  }
}

fetchGithubProjects();

// ===== Contact Form Validation =====
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
  // Limpa erro enquanto o usuário digita
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
  }, 600);
});

// ===== Easter Egg: Matue Mode (333) =====
const MATUE_CHARS = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン★☽◈◉✦✧⟡0123456789";
const MATUE_COLORS = ["#b347d9", "#9b30c8", "#c86cdf", "#7b2fbe", "#e040fb"];
let matueActive = false;
let matueRafId  = null;
let eggBuffer   = "";

document.addEventListener("keydown", (e) => {
  if (matueActive) { exitMatue(); return; }

  eggBuffer += e.key;
  if (eggBuffer.length > 3) eggBuffer = eggBuffer.slice(-3);
  if (eggBuffer === "333") { eggBuffer = ""; enterMatue(); }
});

function enterMatue() {
  matueActive = true;

  const canvas = document.createElement("canvas");
  canvas.id = "matrix-overlay";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  const FS  = 15;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  const cols = () => Math.floor(canvas.width / FS);
  let drops  = Array.from({ length: cols() }, () => Math.random() * -120);
  let hue    = 270; // começa no roxo

  showToast("MATUE MODE — pressione qualquer tecla para sair");

  function draw() {
    // fundo escuro com leve rastro psicodélico
    ctx.fillStyle = "rgba(8, 0, 18, 0.08)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    hue = (hue + 0.4) % 360;

    drops.forEach((y, i) => {
      const char  = MATUE_CHARS[Math.floor(Math.random() * MATUE_CHARS.length)];
      const color = MATUE_COLORS[Math.floor(Math.random() * MATUE_COLORS.length)];

      ctx.font = `${FS}px monospace`;

      // cabeça da coluna brilha em branco/rosa
      if (y > 0 && y < 2) {
        ctx.shadowBlur  = 12;
        ctx.shadowColor = "#ff69b4";
        ctx.fillStyle   = "#ffaaff";
      } else {
        ctx.shadowBlur  = 6;
        ctx.shadowColor = color;
        ctx.fillStyle   = color;
      }

      ctx.fillText(char, i * FS, y * FS);
      ctx.shadowBlur = 0;

      if (y * FS > canvas.height && Math.random() > 0.97) drops[i] = 0;
      drops[i] += 0.4 + Math.random() * 0.6;
    });

    const c = cols();
    if (drops.length !== c) drops = Array.from({ length: c }, () => Math.random() * -120);

    matueRafId = requestAnimationFrame(draw);
  }

  draw();
  canvas.addEventListener("click", exitMatue);
}

function exitMatue() {
  matueActive = false;
  cancelAnimationFrame(matueRafId);
  document.getElementById("matrix-overlay")?.remove();
}
