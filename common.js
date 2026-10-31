/* ============================================================
   Compartilhado por todas as páginas: idioma, menu do celular,
   entrada ao rolar, logotipo do rodapé e ano.
   ============================================================ */
const STRINGS = {
  pt: {
    caseStudyPath: "/projeto.html?p=",
    home: "/",
    projects: "/#projetos",
    contact: "/#contato",
    whatsapp: "https://wa.me/5586998155687?text=Oi%2C%20Saulo%21%20Vim%20pelo%20site%20da%20Storell%20e%20queria%20conversar%20sobre%20um%20projeto.",
    openMenu: "Abrir menu",
    closeMenu: "Fechar menu",
    seeProject: "Ver projeto",
    formInvalid: "Preencha nome, um email válido e uma linha sobre o projeto.",
    sending: "Enviando…",
    sent: "Recebi. Respondo em até um dia útil.",
    sendFailed: "Não consegui enviar agora. Me escreve direto no WhatsApp ou no email ao lado.",
  },
  en: {
    caseStudyPath: "/en/project.html?p=",
    home: "/en/",
    projects: "/en/#work",
    contact: "/en/#contact",
    whatsapp: "https://wa.me/5586998155687?text=Hi%20Saulo%21%20I%20found%20you%20through%20the%20Storell%20website%20and%20I%27d%20like%20to%20talk%20about%20a%20project.",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    seeProject: "See project",
    formInvalid: "Please fill in your name, a valid email and a line about the project.",
    sending: "Sending…",
    sent: "Got it. I'll reply within one business day.",
    sendFailed: "Couldn't send it right now. Reach me on WhatsApp or by email instead.",
  },
};

const LANG = Object.keys(STRINGS).find((code) => document.documentElement.lang.startsWith(code)) ?? "pt";
const T = STRINGS[LANG];

const escHtml = (text) =>
  String(text).replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

const icon = (id) => `<svg class="icon" aria-hidden="true"><use href="#${id}"/></svg>`;

document.getElementById("year").textContent = new Date().getFullYear();

const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Rolagem suave ---------- */
// Só com mouse: no toque o celular já rola do jeito nativo.
const lenis = window.Lenis && finePointer && !reducedMotion ? new Lenis({ autoRaf: true }) : null;

/* ---------- Âncoras sem # no endereço ---------- */
// Os dois caminhos param abaixo da navbar flutuante (scroll-padding-top do CSS).
function scrollToSection(target) {
  lenis ? lenis.scrollTo(target) : target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
}

document.addEventListener("click", (event) => {
  const link = event.target.closest('a[href*="#"]');
  if (!link || link.origin !== location.origin || link.pathname !== location.pathname) return;

  const target = document.getElementById(link.hash.slice(1));
  if (!target) return;
  event.preventDefault();
  scrollToSection(target);
});

// Chegou de outra página com #secao: vai até ela e tira o # do endereço.
if (location.hash) {
  const target = document.getElementById(location.hash.slice(1));
  history.replaceState(null, "", location.pathname + location.search);
  if (target) requestAnimationFrame(() => target.scrollIntoView());
}

/* ---------- Troca de idioma mantém o projeto aberto (?p=slug) ---------- */
document.querySelectorAll("[data-keep-query]").forEach((link) => { link.search = location.search; });

/* ---------- Menu do celular: a pílula se desdobra ---------- */
const header = document.querySelector(".header");
const menuToggle = header.querySelector(".menu-toggle");

function setMenu(open) {
  header.classList.toggle("is-open", open);
  menuToggle.setAttribute("aria-expanded", open);
  menuToggle.setAttribute("aria-label", open ? T.closeMenu : T.openMenu);
}

menuToggle.addEventListener("click", () => setMenu(!header.classList.contains("is-open")));
header.querySelector(".nav").addEventListener("click", (event) => event.target.closest("a") && setMenu(false));
addEventListener("keydown", (event) => event.key === "Escape" && setMenu(false));

/* ---------- Entrada ao rolar ---------- */
// Irmãos entram em sequência: a posição de cada um no pai vira o atraso (--i).
// As páginas chamam revealWithin() de novo depois de montar conteúdo vindo de projects.js.
const revealObserver = new IntersectionObserver((entries) => {
  entries.filter((entry) => entry.isIntersecting).forEach((entry) => {
    entry.target.classList.add("is-in");
    revealObserver.unobserve(entry.target);
  });
}, { rootMargin: "0px 0px -10% 0px" });

function revealWithin(root) {
  root.querySelectorAll(".reveal").forEach((el) => {
    el.style.setProperty("--i", [...el.parentElement.children].indexOf(el));
    revealObserver.observe(el);
  });
}

/* ---------- Logotipo do rodapé que reage ao mouse ---------- */

// Cada letra engorda e acende conforme a distância do cursor (--k de 0 a 1).
// Cada letra fica numa caixa com a largura do peso máximo, então engordar não empurra as
// vizinhas; os centros são medidos uma vez e o cálculo roda no máximo uma vez por quadro.
function waveFooterMark() {
  const mark = document.querySelector(".footer-mark");
  const footer = mark.parentElement;
  mark.innerHTML = [..."Storell"].map((char) => `<span class="char">${char}</span>`).join("") + '<span class="dot"></span>';
  const chars = [...mark.querySelectorAll(".char")];
  let centers = [];
  let pointer = null;
  let frame = 0;

  // Em em, para a caixa acompanhar o tamanho da fonte quando a janela muda.
  function fixWidths() {
    const fontSize = parseFloat(getComputedStyle(mark).fontSize);
    const widths = chars.map((char) => char.getBoundingClientRect().width / fontSize);
    chars.forEach((char, index) => { char.style.width = `${widths[index]}em`; });
  }

  // Centro de cada letra relativo ao logotipo: vale mesmo depois de rolar a página.
  function measureCenters() {
    const base = mark.getBoundingClientRect();
    centers = chars.map((char) => {
      const box = char.getBoundingClientRect();
      return { x: box.left - base.left + box.width / 2, y: box.top - base.top + box.height / 2 };
    });
  }

  function update() {
    frame = 0;
    const base = mark.getBoundingClientRect();
    const reach = base.width * 0.28;
    chars.forEach((char, index) => {
      const distance = pointer ? Math.hypot(pointer.x - base.left - centers[index].x, pointer.y - base.top - centers[index].y) : reach;
      char.style.setProperty("--k", Math.max(0, 1 - distance / reach).toFixed(3));
    });
  }

  const schedule = () => { frame ||= requestAnimationFrame(update); };

  fixWidths();
  mark.classList.add("is-live");
  measureCenters();

  footer.addEventListener("pointermove", (event) => {
    pointer = { x: event.clientX, y: event.clientY };
    schedule();
  });
  footer.addEventListener("pointerleave", () => {
    pointer = null;
    schedule();
  });
  addEventListener("resize", measureCenters);
}

if (finePointer) waveFooterMark();

revealWithin(document);
