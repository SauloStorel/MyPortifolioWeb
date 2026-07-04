history.scrollRestoration = "manual";

const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const FINE_POINTER = window.matchMedia("(pointer: fine)").matches;

/* ============================================================
   Campo de profundidade — partículas e glifos de código que
   sobem (gravidade invertida), em 3 camadas de parallax.
   ============================================================ */
(function depthField() {
  const canvas = document.getElementById("depth-field");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const GLYPHS = ["{", "}", ";", "=>", "def", "end", "&&", "nil"];
  let particles = [];
  let W = 0, H = 0, DPR = 1;
  let mouseX = 0, mouseY = 0;       // alvo (-1..1)
  let px = 0, py = 0;               // posição suavizada

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function spawn() {
    const count = Math.min(130, Math.floor((W * H) / 14000));
    particles = [];
    for (let i = 0; i < count; i++) {
      const z = 0.2 + Math.random() * 0.8; // profundidade: 0.2 (longe) → 1 (perto)
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        z,
        r: z * 1.6,
        vy: -(0.08 + z * 0.25),          // sobem
        glyph: Math.random() < 0.1 ? GLYPHS[(Math.random() * GLYPHS.length) | 0] : null,
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    px += (mouseX - px) * 0.04;
    py += (mouseY - py) * 0.04;

    for (const p of particles) {
      if (!REDUCED_MOTION) {
        p.y += p.vy;
        if (p.y < -20) {
          p.y = H + 20;
          p.x = Math.random() * W;
        }
      }
      // parallax: camadas próximas deslocam mais
      const ox = px * 28 * p.z;
      const oy = py * 18 * p.z;
      const alpha = 0.12 + p.z * 0.35;

      if (p.glyph) {
        ctx.fillStyle = `rgba(181, 181, 181, ${alpha * 0.8})`;
        ctx.font = `${9 + p.z * 5}px "JetBrains Mono", monospace`;
        ctx.fillText(p.glyph, p.x + ox, p.y + oy);
      } else {
        ctx.fillStyle = `rgba(245, 245, 245, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x + ox, p.y + oy, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function loop() {
    draw();
    requestAnimationFrame(loop);
  }

  resize();
  spawn();

  window.addEventListener("resize", () => {
    resize();
    spawn();
    if (REDUCED_MOTION) draw();
  });

  if (REDUCED_MOTION) {
    draw(); // uma vez, estático
    return;
  }

  if (FINE_POINTER) {
    window.addEventListener("mousemove", (e) => {
      mouseX = (e.clientX / W) * 2 - 1;
      mouseY = (e.clientY / H) * 2 - 1;
    }, { passive: true });
  }

  loop();
})();

/* ============================================================
   Hero: eyebrow digitando + refração do nome fatiado
   ============================================================ */
(function heroIntro() {
  const typedCmd = document.getElementById("typed-cmd");
  const caret = document.getElementById("hero-caret");
  const CMD = "whoami";

  if (typedCmd) {
    if (REDUCED_MOTION) {
      typedCmd.textContent = CMD;
    } else {
      let i = 0;
      setTimeout(function tick() {
        if (i < CMD.length) {
          typedCmd.textContent += CMD[i++];
          setTimeout(tick, 90 + Math.random() * 60);
        } else if (caret) {
          setTimeout(() => { caret.style.opacity = "0"; }, 2400);
        }
      }, 500);
    }
  }

  // Refração: cada fatia desliza horizontalmente conforme o mouse,
  // como o nome visto através de um vidro líquido.
  const slices = document.querySelectorAll("#shatter .slice");
  if (!slices.length || REDUCED_MOTION || !FINE_POINTER) return;

  const AMPS = [16, -26, 34, -22, 28, -14];
  let target = 0;
  let current = 0;
  let running = false;

  window.addEventListener("mousemove", (e) => {
    target = (e.clientX / window.innerWidth) * 2 - 1;
    if (!running) {
      running = true;
      requestAnimationFrame(step);
    }
  }, { passive: true });

  function step() {
    current += (target - current) * 0.07; // inércia
    slices.forEach((slice, i) => {
      slice.style.transform = `translateX(${(current * AMPS[i]).toFixed(2)}px)`;
    });
    if (Math.abs(target - current) > 0.001) {
      requestAnimationFrame(step);
    } else {
      running = false;
    }
  }
})();

/* ============================================================
   Cursor customizado com anel de inércia
   ============================================================ */
(function customCursor() {
  if (!FINE_POINTER || REDUCED_MOTION) return;

  const dot = document.getElementById("cursor-dot");
  const ring = document.getElementById("cursor-ring");
  if (!dot || !ring) return;

  document.body.classList.add("has-cursor");

  let mx = -100, my = -100;
  let rx = -100, ry = -100;

  window.addEventListener("mousemove", (e) => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px)`;
  }, { passive: true });

  (function follow() {
    rx += (mx - rx) * 0.16;
    ry += (my - ry) * 0.16;
    ring.style.transform = `translate(${rx.toFixed(1)}px, ${ry.toFixed(1)}px)`;
    requestAnimationFrame(follow);
  })();

  const INTERACTIVE = "a, button, input, textarea, label, .chip";
  document.addEventListener("mouseover", (e) => {
    if (e.target.closest(INTERACTIVE)) ring.classList.add("is-active");
  });
  document.addEventListener("mouseout", (e) => {
    if (e.target.closest(INTERACTIVE)) ring.classList.remove("is-active");
  });
})();

/* ============================================================
   Botões magnéticos
   ============================================================ */
(function magneticButtons() {
  if (!FINE_POINTER || REDUCED_MOTION) return;

  document.querySelectorAll(".magnetic").forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      el.style.transform = `translate(${dx * 0.18}px, ${dy * 0.28}px)`;
    });
    el.addEventListener("mouseleave", () => {
      el.style.transform = "";
    });
  });
})();

/* ============================================================
   Tilt 3D nos cards de projeto (aplicado após render dinâmico)
   ============================================================ */
function initTilt(container) {
  if (!FINE_POINTER || REDUCED_MOTION) return;

  container.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform =
        `perspective(700px) rotateX(${(-ny * 6).toFixed(2)}deg) rotateY(${(nx * 6).toFixed(2)}deg)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
}

/* ============================================================
   Navegação: link ativo + medidor de profundidade
   ============================================================ */
const navLinks = document.querySelectorAll(".topbar-nav a");
const depthMeter = document.getElementById("depth-meter");
const sections = document.querySelectorAll("section[id]");

let scrollTicking = false;

function updateOnScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const top = window.scrollY;

  if (depthMeter && max > 0) {
    const depth = Math.round((top / max) * 500);
    depthMeter.textContent = `−${String(depth).padStart(3, "0")}m`;
  }

  let current = "";
  sections.forEach((section) => {
    if (top >= section.offsetTop - window.innerHeight * 0.4) {
      current = section.getAttribute("id");
    }
  });

  navLinks.forEach((link) => {
    const active = link.getAttribute("href") === `#${current}`;
    link.classList.toggle("active", active);
    if (active) link.setAttribute("aria-current", "true");
    else link.removeAttribute("aria-current");
  });

  scrollTicking = false;
}

window.addEventListener("scroll", () => {
  if (!scrollTicking) {
    requestAnimationFrame(updateOnScroll);
    scrollTicking = true;
  }
}, { passive: true });

updateOnScroll();

/* ============================================================
   Skills: ícone ganha a cor da marca ao passar o mouse
   ============================================================ */
document.querySelectorAll(".chip img[data-hover-color]").forEach((icon) => {
  const dimSrc = icon.src;
  const brandSrc = dimSrc.replace(/\/[0-9a-fA-F]{3,6}$/, `/${icon.dataset.hoverColor}`);
  const chip = icon.closest(".chip");
  if (!chip) return;

  chip.addEventListener("mouseenter", () => { icon.src = brandSrc; });
  chip.addEventListener("mouseleave", () => { icon.src = dimSrc; });
});

/* ============================================================
   Links âncora: rola até a seção sem alterar a URL
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const targetId = anchor.getAttribute("href").slice(1);
    const target = document.getElementById(targetId);
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

/* ============================================================
   Scroll reveal
   ============================================================ */
const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.08 }
);

document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

/* ============================================================
   Toast
   ============================================================ */
const toast = document.getElementById("toast");
let toastTimer;

function showToast(msg) {
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2500);
}

/* ============================================================
   Copiar email
   ============================================================ */
function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  }
  return new Promise((resolve, reject) => {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      const ok = document.execCommand("copy");
      ok ? resolve() : reject(new Error("execCommand copy failed"));
    } catch (err) {
      reject(err);
    } finally {
      document.body.removeChild(ta);
    }
  });
}

document.querySelectorAll('a[href^="mailto:"]').forEach((link) => {
  link.addEventListener("click", (e) => {
    const email = link.getAttribute("href").replace("mailto:", "");
    e.preventDefault();
    copyToClipboard(email)
      .then(() => showToast("email copiado!"))
      .catch(() => {
        showToast("abrindo cliente de email...");
        window.location.href = link.getAttribute("href");
      });
  });
});

/* ============================================================
   Projetos via GitHub API (com cache de 1h)
   ============================================================ */
const GH_CACHE_KEY = "gh_repos_cache_v1";
const GH_CACHE_TTL = 60 * 60 * 1000;

function readGithubCache() {
  try {
    const raw = localStorage.getItem(GH_CACHE_KEY);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts > GH_CACHE_TTL) return null;
    return data;
  } catch {
    return null;
  }
}

function writeGithubCache(data) {
  try {
    localStorage.setItem(GH_CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
  } catch {
    // quota exceeded ou storage desabilitado — ignora
  }
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function timeAgo(iso) {
  if (!iso) return "";
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return "hoje";
  if (days === 1) return "ontem";
  if (days < 30) return `há ${days} dias`;
  const months = Math.floor(days / 30);
  if (months < 12) return `há ${months} ${months === 1 ? "mês" : "meses"}`;
  const years = Math.floor(days / 365);
  return `há ${years} ${years === 1 ? "ano" : "anos"}`;
}

// linguagem do GitHub → slug do Simple Icons (só onde o nome difere)
const LANG_ICON_SLUGS = {
  "html": "html5",
  "shell": "gnubash",
  "dockerfile": "docker",
  "c++": "cplusplus",
  "c#": "dotnet",
  "vue": "vuedotjs",
  "scss": "sass",
  "jupyter notebook": "jupyter",
};

function langIconHtml(lang) {
  const slug = LANG_ICON_SLUGS[lang.toLowerCase()] || lang.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!slug) return "";
  // cinza --ghost (b5b5b5); se o ícone não existir, o onerror remove a imagem
  return `<img src="https://cdn.simpleicons.org/${encodeURIComponent(slug)}/b5b5b5" alt="" width="14" height="14" loading="lazy" onerror="this.remove()" />`;
}

function projectCard({ name, url, lang, desc, stars, homepage, detailsSlug, topics, pushedAt, featured, index }) {
  const langHtml = lang
    ? `<span class="card-lang">${langIconHtml(lang)}${escHtml(lang)}</span>`
    : "";
  const badgeHtml = featured ? `<span class="card-badge" title="repositório com push mais recente">HEAD</span>` : "";
  const starsHtml = stars > 0 ? `<span>★ ${stars}</span>` : "";
  const pushedHtml = pushedAt
    ? `<span class="card-updated">push ${escHtml(timeAgo(pushedAt))}</span>`
    : `<span class="card-updated"></span>`;
  const liveHtml = homepage
    ? `<a href="${escHtml(homepage)}" target="_blank" rel="noopener noreferrer">demo ↗</a>`
    : "";
  const detailsHtml = detailsSlug
    ? `<a href="project.html?slug=${encodeURIComponent(detailsSlug)}">detalhes →</a>`
    : "";
  const topicsHtml = topics && topics.length
    ? `<ul class="card-topics" aria-label="Tópicos">${topics.map(t => `<li>${escHtml(t)}</li>`).join("")}</ul>`
    : "";

  return `
    <article class="card${featured ? " card-featured" : ""}" style="animation-delay: ${index * 90}ms">
      <header class="card-head">
        <h3 class="card-name"><a href="${escHtml(url)}" target="_blank" rel="noopener noreferrer">${escHtml(name)}</a></h3>
        ${badgeHtml}
        ${langHtml}
      </header>
      <p class="card-desc">${escHtml(desc)}</p>
      ${topicsHtml}
      <footer class="card-foot">
        ${pushedHtml}
        ${starsHtml}
        ${liveHtml}
        ${detailsHtml}
      </footer>
    </article>
  `;
}

function renderProjects(list, repos) {
  const nonForks = repos.filter(r => !r.fork);
  const pinned = nonForks.filter(r => r.topics?.includes("portfolio"));
  const toShow = (pinned.length > 0 ? pinned : nonForks).slice(0, 6);

  if (toShow.length === 0) return false;

  // o repo com push mais recente vira o destaque (HEAD)
  toShow.sort((a, b) => new Date(b.pushed_at || 0) - new Date(a.pushed_at || 0));

  list.innerHTML = toShow.map((repo, i) => {
    const slug = repo.name.toLowerCase();
    const manualData = typeof PROJECTS_DATA !== "undefined"
      ? PROJECTS_DATA.find(p => p.slug === slug)
      : null;

    return projectCard({
      name: repo.name,
      url: repo.html_url,
      lang: repo.language || "",
      desc: repo.description || "Sem descrição.",
      stars: repo.stargazers_count,
      homepage: repo.homepage,
      detailsSlug: manualData ? slug : null,
      topics: (repo.topics || []).filter(t => t !== "portfolio").slice(0, 4),
      pushedAt: repo.pushed_at,
      featured: i === 0,
      index: i,
    });
  }).join("");

  initTilt(list);
  return true;
}

async function fetchGithubProjects() {
  const list = document.getElementById("projects-list");
  if (!list) return;

  const cached = readGithubCache();
  if (cached && renderProjects(list, cached)) return;

  try {
    const res = await fetch(
      "https://api.github.com/users/SauloStorel/repos?sort=updated&direction=desc&per_page=100&type=owner"
    );
    if (!res.ok) throw new Error(`GitHub API: ${res.status}`);

    const repos = await res.json();
    if (!renderProjects(list, repos)) throw new Error("Nenhum repo encontrado");
    writeGithubCache(repos);

  } catch (err) {
    console.warn("GitHub API indisponível.", err);
    list.innerHTML = projectCard({
      name: "MyPortifolioWeb",
      url: "https://github.com/SauloStorel/MyPortifolioWeb",
      lang: "HTML",
      desc: "Site construído do zero, sem frameworks — exercício de domínio completo de HTML, CSS e JS vanilla.",
      stars: 0,
      homepage: "https://storel.space",
      detailsSlug: null,
      topics: [],
      pushedAt: null,
      featured: true,
      index: 0,
    });
    initTilt(list);
  }
}

fetchGithubProjects();

/* ============================================================
   Formulário de contato (Formspree)
   ============================================================ */
const contactForm = document.getElementById("contact-form");

function setError(inputId, errorId, msg) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  if (!input || !error) return;
  input.classList.add("invalid");
  input.setAttribute("aria-invalid", "true");
  error.textContent = msg;
  error.classList.add("visible");
}

function clearError(inputId, errorId) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  if (!input || !error) return;
  input.classList.remove("invalid");
  input.removeAttribute("aria-invalid");
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
    btn.querySelector("span").textContent = "enviando...";

    try {
      const res = await fetch(contactForm.action, {
        method: "POST",
        headers: { "Accept": "application/json" },
        body: new FormData(contactForm),
      });

      if (res.ok) {
        showToast("mensagem enviada!");
        contactForm.reset();
      } else {
        showToast("erro ao enviar. tente novamente.");
      }
    } catch {
      showToast("erro de conexão. tente novamente.");
    } finally {
      btn.classList.remove("btn-loading");
      btn.querySelector("span").textContent = "enviar mensagem";
    }
  });
}

/* ============================================================
   Hora local (Teresina) e ano do rodapé
   ============================================================ */
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
setInterval(updateLocalTime, 30000);

const yearEl = document.getElementById("footer-year");
if (yearEl) yearEl.textContent = new Date().getFullYear();
