/* ============================================================
   Tela de erro: um modelo para todos os códigos.
   A Vercel serve o 404.html em qualquer endereço que não existe;
   os outros códigos ficam prontos para reaproveitar em outros
   projetos e aparecem aqui com ?codigo=500, ?codigo=503 etc.
   Endereços em /en/ mostram a tela em inglês.
   Roda antes de common.js, que lê o idioma do <html lang>.
   ============================================================ */
const ERRORS = {
  400: {
    help: "projects",
    pt: { title: ["Algo nesse pedido", "veio errado"], text: "O navegador mandou um pedido que o site não entendeu. Volte ao início e tente de novo." },
    en: { title: ["Something in this", "request went wrong"], text: "Your browser sent a request the site couldn't understand. Go back home and try again." },
  },
  401: {
    help: "whatsapp",
    pt: { title: ["Você precisa", "entrar primeiro"], text: "Essa página é só para quem tem acesso. Entre com a sua conta e tente de novo." },
    en: { title: ["You need to", "sign in first"], text: "This page is only for people with access. Sign in to your account and try again." },
  },
  403: {
    help: "whatsapp",
    pt: { title: ["Essa área", "é restrita"], text: "Você não tem permissão para ver esta página. Se acha que deveria ter, me chama no WhatsApp." },
    en: { title: ["This area", "is restricted"], text: "You don't have permission to see this page. If you think you should, message me on WhatsApp." },
  },
  404: {
    help: "projects",
    pt: { title: ["Essa página", "não existe"], text: "Ninguém encontrou {path} por aqui. O endereço pode ter mudado, mas os projetos e o contato continuam no mesmo lugar." },
    en: { title: ["This page", "doesn't exist"], text: "Nobody found {path} around here. The address may have changed, but the projects and contact are right where they were." },
  },
  408: {
    help: "projects",
    pt: { title: ["A página", "demorou demais"], text: "O pedido levou tempo demais para chegar. Recarregue a página e tente de novo." },
    en: { title: ["The page", "took too long"], text: "The request took too long to arrive. Reload the page and try again." },
  },
  429: {
    help: "projects",
    pt: { title: ["Muitos pedidos", "de uma vez"], text: "Chegaram pedidos demais em pouco tempo. Espere alguns segundos e tente de novo." },
    en: { title: ["Too many requests", "at once"], text: "Too many requests arrived in a short time. Wait a few seconds and try again." },
  },
  500: {
    help: "whatsapp",
    pt: { title: ["Algo quebrou", "do meu lado"], text: "O erro foi no servidor, não em você. Tente de novo em alguns minutos; se continuar, me avisa no WhatsApp." },
    en: { title: ["Something broke", "on my end"], text: "The error was on the server, not on you. Try again in a few minutes; if it keeps happening, let me know on WhatsApp." },
  },
  502: {
    help: "whatsapp",
    pt: { title: ["O servidor não", "respondeu direito"], text: "Uma parte do sistema devolveu uma resposta inválida. Tente de novo em alguns minutos." },
    en: { title: ["The server didn't", "answer properly"], text: "Part of the system sent back an invalid response. Try again in a few minutes." },
  },
  503: {
    help: "whatsapp",
    pt: { title: ["Volto", "já já"], text: "O site está em manutenção ou com muito acesso agora. Tente de novo em alguns minutos." },
    en: { title: ["Back", "in a moment"], text: "The site is under maintenance or very busy right now. Try again in a few minutes." },
  },
  504: {
    help: "whatsapp",
    pt: { title: ["O servidor", "demorou a responder"], text: "Uma parte do sistema não respondeu a tempo. Tente de novo em alguns minutos." },
    en: { title: ["The server", "took too long"], text: "Part of the system didn't answer in time. Try again in a few minutes." },
  },
};

const ERROR_LABELS = {
  pt: {
    eyebrow: "Erro",
    home: ["Voltar ao início", "/"],
    projects: ["Ver projetos", "/#projetos"],
    whatsapp: ["Chamar no WhatsApp", "https://wa.me/5586998155687"],
    pageTitle: "Storell",
  },
  en: {
    eyebrow: "Error",
    home: ["Back to home", "/en/"],
    projects: ["See projects", "/en/#work"],
    whatsapp: ["Message on WhatsApp", "https://wa.me/5586998155687"],
    pageTitle: "Storell",
  },
};

(() => {
  const lang = location.pathname.startsWith("/en/") ? "en" : "pt";
  const requested = Number(new URLSearchParams(location.search).get("codigo"));
  const code = ERRORS[requested] ? requested : 404;
  const error = ERRORS[code];
  const copy = error[lang];
  const labels = ERROR_LABELS[lang];
  const esc = (text) => String(text).replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
  const slot = (name) => document.querySelector(`[data-error="${name}"]`);

  // A última palavra do título fica colada no ponto vermelho.
  const [firstLine, secondLine] = copy.title;
  const words = secondLine.split(" ");
  const lastWord = words.pop();

  slot("eyebrow").textContent = `${labels.eyebrow} ${code}`;
  slot("line-1").textContent = firstLine;
  slot("line-2").innerHTML = `${esc(words.join(" "))} <span class="nowrap">${esc(lastWord)}<span class="dot"></span></span>`;
  slot("text").innerHTML = esc(copy.text).replace("{path}", `<code>${esc(location.pathname)}</code>`);
  slot("code").firstChild.nodeValue = code;

  const [homeLabel, homeHref] = labels.home;
  const [helpLabel, helpHref] = labels[error.help];
  slot("primary").firstChild.nodeValue = homeLabel;
  slot("primary").href = homeHref;
  slot("secondary").firstChild.nodeValue = helpLabel;
  slot("secondary").href = helpHref;

  // Erro do lado do servidor ou de acesso: o segundo botão é o WhatsApp, abrindo em outra aba.
  if (error.help === "whatsapp") {
    Object.assign(slot("secondary"), { target: "_blank", rel: "noopener noreferrer" });
    slot("secondary").querySelector("use").setAttribute("href", "#i-chat");
  }

  document.title = `${code} · ${firstLine} ${secondLine} · ${labels.pageTitle}`;

  if (lang === "pt") return;

  // Em inglês: troca idioma do documento e os textos fixos marcados com data-en.
  document.documentElement.lang = "en";
  document.querySelectorAll("[data-en]").forEach((el) => { el.firstChild.nodeValue = el.dataset.en; });
  document.querySelectorAll("[data-en-href]").forEach((el) => { el.href = el.dataset.enHref; });
  document.querySelectorAll("[data-en-label]").forEach((el) => el.setAttribute("aria-label", el.dataset.enLabel));
})();
