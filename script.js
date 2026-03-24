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
    navigator.clipboard.writeText(email).then(() => {
      showToast("Email copiado!");
    });
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

document.querySelectorAll(".project-item").forEach((item) => {
  const title = item.querySelector("h3").textContent;
  const tags  = [...item.querySelectorAll(".project-tags span")].map(s => s.textContent);
  const index = item.querySelector(".project-index")?.textContent || "";

  item.addEventListener("mouseenter", () => {
    previewCard.innerHTML = `
      <div class="preview-label">Projeto ${index}</div>
      <div class="preview-title">${title}</div>
      <div class="preview-tags">${tags.map(t => `<span>${t}</span>`).join("")}</div>
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
