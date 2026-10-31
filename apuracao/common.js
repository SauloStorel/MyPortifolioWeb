/* ============================================================
   Compartilhado por todas as páginas: idioma, utilitários,
   toast, copiar email, hora de Teresina e ano do rodapé.
   ============================================================ */
const STRINGS = {
  pt: {
    locale: "pt-BR",
    caseStudyPath: "/projeto.html?p=",
    emailCopied: "Email copiado",
    sending: "Enviando…",
    send: "Enviar mensagem",
    sent: "Mensagem enviada. Respondo em breve.",
    sendFailed: "Não consegui enviar. Tente de novo ou use o email.",
    nameRequired: "Informe seu nome.",
    emailRequired: "Informe seu email.",
    emailInvalid: "Esse email parece incompleto.",
    messageRequired: "Escreva sua mensagem.",
    site: "Site",
    code: "Código",
    caseStudy: "Estudo de caso",
    contributionsOn: (count, date) => `${count} em ${date}`,
  },
  en: {
    locale: "en-US",
    caseStudyPath: "/en/project.html?p=",
    emailCopied: "Email copied",
    sending: "Sending…",
    send: "Send message",
    sent: "Message sent. I'll get back to you soon.",
    sendFailed: "Couldn't send it. Try again or use the email.",
    nameRequired: "Please enter your name.",
    emailRequired: "Please enter your email.",
    emailInvalid: "That email looks incomplete.",
    messageRequired: "Please write a message.",
    site: "Website",
    code: "Code",
    caseStudy: "Case study",
    contributionsOn: (count, date) => `${count} on ${date}`,
  },
};

const LANG = Object.keys(STRINGS).find((code) => document.documentElement.lang.startsWith(code)) ?? "pt";
const T = STRINGS[LANG];

function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const icon = (id, className = "icon") =>
  `<svg class="${className}" aria-hidden="true"><use href="#${id}"/></svg>`;

const externalLink = (href, label) =>
  `<a href="${escHtml(href)}" target="_blank" rel="noopener noreferrer">${label}${icon("i-external")}</a>`;

/* ---------- Toast ---------- */
const toast = document.getElementById("toast");
let toastTimer;

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2500);
}

/* ---------- Copiar email (cai no cliente de email se o clipboard falhar) ---------- */
document.querySelectorAll('a[href^="mailto:"]').forEach((link) => {
  link.addEventListener("click", (e) => {
    if (!navigator.clipboard || !window.isSecureContext) return;

    e.preventDefault();
    const email = link.getAttribute("href").replace("mailto:", "");
    navigator.clipboard.writeText(email)
      .then(() => showToast(T.emailCopied))
      .catch(() => { window.location.href = link.href; });
  });
});

/* ---------- Troca de idioma mantém o projeto aberto (?p=slug) ---------- */
document.querySelectorAll("[data-keep-query]").forEach((link) => { link.search = window.location.search; });

/* ---------- Hora local (Teresina) e ano do rodapé ---------- */
const teresinaTime = new Intl.DateTimeFormat(T.locale, {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Fortaleza",
});

// Busca os elementos a cada vez: o SplitText (motion.js) recria o HTML dos textos animados.
function updateLocalTime() {
  const now = teresinaTime.format(new Date());
  document.querySelectorAll("[data-local-time]").forEach((el) => { el.textContent = now; });
}

updateLocalTime();
setInterval(updateLocalTime, 30000);

document.getElementById("footer-year").textContent = new Date().getFullYear();
