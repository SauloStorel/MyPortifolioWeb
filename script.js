// ===== Custom Cursor =====
const cursorDot = document.querySelector(".cursor-dot");
const cursorRing = document.querySelector(".cursor-ring");
let mouseX = 0, mouseY = 0;
let ringX = 0, ringY = 0;

document.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursorDot.style.left = mouseX + "px";
  cursorDot.style.top = mouseY + "px";
});

function animateCursor() {
  ringX += (mouseX - ringX) * 0.15;
  ringY += (mouseY - ringY) * 0.15;
  cursorRing.style.left = ringX + "px";
  cursorRing.style.top = ringY + "px";
  requestAnimationFrame(animateCursor);
}
animateCursor();

document.querySelectorAll("a, button, .tilt-card").forEach((el) => {
  el.addEventListener("mouseenter", () => cursorRing.classList.add("hover"));
  el.addEventListener("mouseleave", () => cursorRing.classList.remove("hover"));
});

// ===== Particle Background =====
const particleCanvas = document.getElementById("particles");
const pCtx = particleCanvas.getContext("2d");
let particles = [];

function resizeParticleCanvas() {
  particleCanvas.width = window.innerWidth;
  particleCanvas.height = window.innerHeight;
}
resizeParticleCanvas();
window.addEventListener("resize", resizeParticleCanvas);

class Particle {
  constructor() {
    this.reset();
  }
  reset() {
    this.x = Math.random() * particleCanvas.width;
    this.y = Math.random() * particleCanvas.height;
    this.size = Math.random() * 2 + 0.5;
    this.speedX = (Math.random() - 0.5) * 0.3;
    this.speedY = (Math.random() - 0.5) * 0.3;
    this.opacity = Math.random() * 0.3 + 0.05;
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.x < 0 || this.x > particleCanvas.width) this.speedX *= -1;
    if (this.y < 0 || this.y > particleCanvas.height) this.speedY *= -1;

    const dx = mouseX - this.x;
    const dy = mouseY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 120) {
      this.x -= dx * 0.01;
      this.y -= dy * 0.01;
      this.opacity = Math.min(this.opacity + 0.02, 0.5);
    }
  }
  draw() {
    pCtx.beginPath();
    pCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    pCtx.fillStyle = `rgba(0, 232, 123, ${this.opacity})`;
    pCtx.fill();
  }
}

for (let i = 0; i < 60; i++) particles.push(new Particle());

function drawParticles() {
  pCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
  particles.forEach((p) => {
    p.update();
    p.draw();
  });

  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        pCtx.beginPath();
        pCtx.moveTo(particles[i].x, particles[i].y);
        pCtx.lineTo(particles[j].x, particles[j].y);
        pCtx.strokeStyle = `rgba(0, 232, 123, ${0.06 * (1 - dist / 100)})`;
        pCtx.lineWidth = 0.5;
        pCtx.stroke();
      }
    }
  }
  requestAnimationFrame(drawParticles);
}
drawParticles();

// ===== Mobile menu toggle =====
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
    setTimeout(typeEffect, 100 + Math.random() * 80);
  }
}

setTimeout(typeEffect, 800);

// ===== Scroll Reveal =====
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.15 }
);

document
  .querySelectorAll(".about, .skills, .projects, .contact, .game-section")
  .forEach((el) => {
    el.classList.add("reveal");
    observer.observe(el);
  });

// ===== Skill Bars Animation =====
const skillObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const card = entry.target;
        const level = card.getAttribute("data-level");
        card.style.setProperty("--level", level + "%");
        card.classList.add("visible");
      }
    });
  },
  { threshold: 0.3 }
);

document.querySelectorAll(".skill-card").forEach((card) => {
  skillObserver.observe(card);
});

// ===== Counter Animation =====
const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute("data-target"));
        let current = 0;
        const increment = target / 40;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          el.textContent = Math.floor(current) + "+";
        }, 40);
        counterObserver.unobserve(el);
      }
    });
  },
  { threshold: 0.5 }
);

document.querySelectorAll(".stat-number").forEach((el) => {
  counterObserver.observe(el);
});

// ===== Active nav link on scroll =====
const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll("#navbar ul a");

window.addEventListener("scroll", () => {
  let current = "";
  sections.forEach((section) => {
    const top = section.offsetTop - 100;
    if (scrollY >= top) {
      current = section.getAttribute("id");
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href") === `#${current}`) {
      link.classList.add("active");
    }
  });
});

// ===== 3D Tilt Effect on Cards =====
document.querySelectorAll(".tilt-card").forEach((card) => {
  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;
    card.style.transform = `perspective(500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "perspective(500px) rotateX(0) rotateY(0) scale(1)";
  });
});

// ===== Ripple Effect on Buttons =====
document.querySelectorAll(".btn").forEach((btn) => {
  btn.style.position = "relative";
  btn.style.overflow = "hidden";
  btn.addEventListener("click", (e) => {
    const ripple = document.createElement("span");
    ripple.classList.add("ripple");
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + "px";
    ripple.style.left = e.clientX - rect.left - size / 2 + "px";
    ripple.style.top = e.clientY - rect.top - size / 2 + "px";
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
});

// ===== Magnetic Button Effect =====
document.querySelectorAll(".magnetic").forEach((btn) => {
  btn.addEventListener("mousemove", (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
  });
  btn.addEventListener("mouseleave", () => {
    btn.style.transform = "translate(0, 0)";
  });
});

// ========================================
// ===== SNAKE GAME =====
// ========================================
const snakeCanvas = document.getElementById("snake-canvas");
const sCtx = snakeCanvas.getContext("2d");
const gameOverlay = document.getElementById("game-overlay");
const scoreEl = document.getElementById("score");
const highscoreEl = document.getElementById("highscore");

const GRID = 20;
let canvasSize = Math.min(400, window.innerWidth - 60);
canvasSize = Math.floor(canvasSize / GRID) * GRID;
snakeCanvas.width = canvasSize;
snakeCanvas.height = canvasSize;

let snake, food, direction, nextDirection, score, highscore, gameLoop, gameRunning;

highscore = parseInt(localStorage.getItem("snakeHighscore") || "0");
highscoreEl.textContent = highscore;

function initGame() {
  const mid = Math.floor(canvasSize / GRID / 2);
  snake = [
    { x: mid, y: mid },
    { x: mid - 1, y: mid },
    { x: mid - 2, y: mid },
  ];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  scoreEl.textContent = 0;
  spawnFood();
}

function spawnFood() {
  const cols = canvasSize / GRID;
  let pos;
  do {
    pos = {
      x: Math.floor(Math.random() * cols),
      y: Math.floor(Math.random() * cols),
    };
  } while (snake.some((s) => s.x === pos.x && s.y === pos.y));
  food = pos;
}

function startGame() {
  if (gameRunning) return;
  gameRunning = true;
  gameOverlay.classList.add("hidden");
  initGame();
  gameLoop = setInterval(gameTick, 110);
}

function endGame() {
  gameRunning = false;
  clearInterval(gameLoop);
  if (score > highscore) {
    highscore = score;
    localStorage.setItem("snakeHighscore", highscore);
    highscoreEl.textContent = highscore;
  }
  gameOverlay.classList.remove("hidden");
  gameOverlay.querySelector("p").innerHTML = `Game Over! Score: <strong>${score}</strong><br>Pressione <kbd>Space</kbd> ou clique para jogar`;
}

function gameTick() {
  direction = { ...nextDirection };
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
  const cols = canvasSize / GRID;

  if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= cols) {
    endGame();
    return;
  }

  if (snake.some((s) => s.x === head.x && s.y === head.y)) {
    endGame();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score++;
    scoreEl.textContent = score;
    spawnFood();
  } else {
    snake.pop();
  }

  drawGame();
}

function drawGame() {
  sCtx.fillStyle = "#1a1a1a";
  sCtx.fillRect(0, 0, canvasSize, canvasSize);

  // Grid lines (subtle)
  sCtx.strokeStyle = "rgba(255,255,255,0.02)";
  sCtx.lineWidth = 0.5;
  for (let i = 0; i <= canvasSize; i += GRID) {
    sCtx.beginPath();
    sCtx.moveTo(i, 0);
    sCtx.lineTo(i, canvasSize);
    sCtx.stroke();
    sCtx.beginPath();
    sCtx.moveTo(0, i);
    sCtx.lineTo(canvasSize, i);
    sCtx.stroke();
  }

  // Food with glow
  sCtx.shadowColor = "#00e87b";
  sCtx.shadowBlur = 12;
  sCtx.fillStyle = "#00e87b";
  sCtx.beginPath();
  sCtx.arc(
    food.x * GRID + GRID / 2,
    food.y * GRID + GRID / 2,
    GRID / 2 - 2,
    0,
    Math.PI * 2
  );
  sCtx.fill();
  sCtx.shadowBlur = 0;

  // Snake
  snake.forEach((segment, i) => {
    const alpha = 1 - (i / snake.length) * 0.6;
    sCtx.fillStyle = `rgba(0, 232, 123, ${alpha})`;
    const padding = i === 0 ? 1 : 2;
    const radius = i === 0 ? 5 : 3;
    roundRect(
      sCtx,
      segment.x * GRID + padding,
      segment.y * GRID + padding,
      GRID - padding * 2,
      GRID - padding * 2,
      radius
    );
    sCtx.fill();
  });

  // Snake eyes
  if (snake.length > 0) {
    const head = snake[0];
    sCtx.fillStyle = "#1a1a1a";
    const eyeSize = 2.5;
    let e1x, e1y, e2x, e2y;
    const cx = head.x * GRID + GRID / 2;
    const cy = head.y * GRID + GRID / 2;

    if (direction.x === 1) {
      e1x = cx + 3; e1y = cy - 3; e2x = cx + 3; e2y = cy + 3;
    } else if (direction.x === -1) {
      e1x = cx - 3; e1y = cy - 3; e2x = cx - 3; e2y = cy + 3;
    } else if (direction.y === -1) {
      e1x = cx - 3; e1y = cy - 3; e2x = cx + 3; e2y = cy - 3;
    } else {
      e1x = cx - 3; e1y = cy + 3; e2x = cx + 3; e2y = cy + 3;
    }

    sCtx.beginPath();
    sCtx.arc(e1x, e1y, eyeSize, 0, Math.PI * 2);
    sCtx.fill();
    sCtx.beginPath();
    sCtx.arc(e2x, e2y, eyeSize, 0, Math.PI * 2);
    sCtx.fill();
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// Game controls
const gameKeys = new Set(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"]);

function isGameVisible() {
  const rect = snakeCanvas.getBoundingClientRect();
  return rect.top < window.innerHeight && rect.bottom > 0;
}

document.addEventListener("keydown", (e) => {
  if (e.code === "Space" && isGameVisible()) {
    e.preventDefault();
    if (!gameRunning) startGame();
    return;
  }
  if (!gameRunning) return;

  if (gameKeys.has(e.key) || gameKeys.has(e.code)) {
    e.preventDefault();
  }

  switch (e.key) {
    case "ArrowUp":
    case "w":
    case "W":
      if (direction.y === 0) nextDirection = { x: 0, y: -1 };
      break;
    case "ArrowDown":
    case "s":
    case "S":
      if (direction.y === 0) nextDirection = { x: 0, y: 1 };
      break;
    case "ArrowLeft":
    case "a":
    case "A":
      if (direction.x === 0) nextDirection = { x: -1, y: 0 };
      break;
    case "ArrowRight":
    case "d":
    case "D":
      if (direction.x === 0) nextDirection = { x: 1, y: 0 };
      break;
  }
});

gameOverlay.addEventListener("click", () => {
  if (!gameRunning) startGame();
});

// Mobile controls
document.getElementById("btn-up").addEventListener("click", () => {
  if (!gameRunning) { startGame(); return; }
  if (direction.y === 0) nextDirection = { x: 0, y: -1 };
});
document.getElementById("btn-down").addEventListener("click", () => {
  if (!gameRunning) { startGame(); return; }
  if (direction.y === 0) nextDirection = { x: 0, y: 1 };
});
document.getElementById("btn-left").addEventListener("click", () => {
  if (!gameRunning) { startGame(); return; }
  if (direction.x === 0) nextDirection = { x: -1, y: 0 };
});
document.getElementById("btn-right").addEventListener("click", () => {
  if (!gameRunning) { startGame(); return; }
  if (direction.x === 0) nextDirection = { x: 1, y: 0 };
});

// Touch swipe for mobile
let touchStartX = 0, touchStartY = 0;

snakeCanvas.addEventListener("touchstart", (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
  if (!gameRunning) startGame();
}, { passive: true });

snakeCanvas.addEventListener("touchmove", (e) => {
  if (!gameRunning) return;
  const dx = e.touches[0].clientX - touchStartX;
  const dy = e.touches[0].clientY - touchStartY;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 20 && direction.x === 0) nextDirection = { x: 1, y: 0 };
    else if (dx < -20 && direction.x === 0) nextDirection = { x: -1, y: 0 };
  } else {
    if (dy > 20 && direction.y === 0) nextDirection = { x: 0, y: 1 };
    else if (dy < -20 && direction.y === 0) nextDirection = { x: 0, y: -1 };
  }
}, { passive: true });

// Draw initial empty game
initGame();
drawGame();

// ===== Konami Code Easter Egg (Matrix Rain) =====
const konamiCode = [
  "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
  "b", "a",
];
let konamiIndex = 0;

document.addEventListener("keydown", (e) => {
  if (e.key === konamiCode[konamiIndex]) {
    konamiIndex++;
    if (konamiIndex === konamiCode.length) {
      konamiIndex = 0;
      triggerMatrixRain();
    }
  } else {
    konamiIndex = 0;
  }
});

function triggerMatrixRain() {
  const matrixCanvas = document.getElementById("matrix-canvas");
  const mCtx = matrixCanvas.getContext("2d");
  matrixCanvas.width = window.innerWidth;
  matrixCanvas.height = window.innerHeight;
  matrixCanvas.classList.add("active");

  const fontSize = 14;
  const columns = Math.floor(matrixCanvas.width / fontSize);
  const drops = Array(columns).fill(1);
  const chars = "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";

  let frameCount = 0;

  function drawMatrix() {
    mCtx.fillStyle = "rgba(30, 30, 30, 0.05)";
    mCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

    mCtx.fillStyle = "#00e87b";
    mCtx.font = fontSize + "px monospace";

    for (let i = 0; i < drops.length; i++) {
      const text = chars.charAt(Math.floor(Math.random() * chars.length));
      mCtx.fillText(text, i * fontSize, drops[i] * fontSize);

      if (drops[i] * fontSize > matrixCanvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }

    frameCount++;
    if (frameCount < 300) {
      requestAnimationFrame(drawMatrix);
    } else {
      matrixCanvas.classList.remove("active");
      setTimeout(() => {
        mCtx.clearRect(0, 0, matrixCanvas.width, matrixCanvas.height);
      }, 1000);
    }
  }

  drawMatrix();
}
