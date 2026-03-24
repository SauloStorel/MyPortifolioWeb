// ===== Ambient Background =====
const ambientCanvas = document.getElementById("ambient-canvas");
const aCtx = ambientCanvas.getContext("2d");

function resizeAmbient() {
  ambientCanvas.width = window.innerWidth;
  ambientCanvas.height = window.innerHeight;
}
resizeAmbient();
window.addEventListener("resize", resizeAmbient);

// Subtle floating orbs (warm gold hue to match palette)
const orbs = [];
for (let i = 0; i < 3; i++) {
  orbs.push({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: 200 + Math.random() * 200,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    hue: 32 + Math.random() * 12,
  });
}

function drawAmbient() {
  aCtx.clearRect(0, 0, ambientCanvas.width, ambientCanvas.height);

  orbs.forEach((orb) => {
    orb.x += orb.vx;
    orb.y += orb.vy;

    if (orb.x < -orb.r) orb.x = ambientCanvas.width + orb.r;
    if (orb.x > ambientCanvas.width + orb.r) orb.x = -orb.r;
    if (orb.y < -orb.r) orb.y = ambientCanvas.height + orb.r;
    if (orb.y > ambientCanvas.height + orb.r) orb.y = -orb.r;

    const gradient = aCtx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r);
    gradient.addColorStop(0, `hsla(${orb.hue}, 40%, 45%, 0.035)`);
    gradient.addColorStop(1, "transparent");
    aCtx.fillStyle = gradient;
    aCtx.fillRect(0, 0, ambientCanvas.width, ambientCanvas.height);
  });

  requestAnimationFrame(drawAmbient);
}
drawAmbient();

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

// ===== Typing Effect =====
const typedName = document.getElementById("typed-name");
const nameText = "Saulo Storel";
let charIndex = 0;

function typeEffect() {
  if (charIndex < nameText.length) {
    typedName.textContent += nameText.charAt(charIndex);
    charIndex++;
    setTimeout(typeEffect, 80 + Math.random() * 50);
  }
}
setTimeout(typeEffect, 900);

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

// ===== Active Nav on Scroll =====
const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll("#navbar ul a");

window.addEventListener("scroll", () => {
  let current = "";
  sections.forEach((section) => {
    if (scrollY >= section.offsetTop - 120) current = section.getAttribute("id");
  });
  navLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href") === `#${current}`) link.classList.add("active");
  });
});
