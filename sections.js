/* ============================================================
   Seções da página inicial: mapa de atividade do GitHub,
   fluxo request → response, faixa em movimento e imagens
   dos projetos. O conteúdo funciona sem GSAP; o movimento
   é só camada. Depende de common.js (T).
   ============================================================ */
(function homeSections() {
  const hasGsap = Boolean(window.gsap && window.ScrollTrigger);
  const prefersMotion = matchMedia("(prefers-reduced-motion: no-preference)").matches;
  const animate = hasGsap && prefersMotion;

  /* ---------- Atividade do GitHub (dados reais) ---------- */
  const heatmap = document.getElementById("heatmap");
  const totalEl = document.querySelector("[data-contrib-total]");

  const dateLabel = new Intl.DateTimeFormat(T.locale, { day: "numeric", month: "short", timeZone: "UTC" });

  function renderHeatmap({ total, contributions }) {
    totalEl.textContent = total.lastYear;

    // Alinha a primeira coluna no domingo, como o GitHub.
    const offset = new Date(`${contributions[0].date}T00:00:00Z`).getUTCDay();
    const blanks = Array.from({ length: offset }, () => `<li data-level="0" aria-hidden="true" style="visibility:hidden"></li>`);
    const days = contributions.map(({ date, count, level }) => {
      const label = T.contributionsOn(count, dateLabel.format(new Date(`${date}T00:00:00Z`)));
      return `<li data-level="${level}" title="${label}"></li>`;
    });
    heatmap.innerHTML = [...blanks, ...days].join("");

    // Mostra primeiro as semanas mais recentes quando não cabe tudo.
    const scroller = heatmap.parentElement;
    scroller.scrollLeft = scroller.scrollWidth;

    if (!animate) return;
    gsap.from(heatmap.children, {
      scale: 0,
      duration: 0.6,
      ease: "back.out(2)",
      stagger: { amount: 1.2, grid: "auto", from: "end" },
      scrollTrigger: { trigger: heatmap, start: "top 85%" },
    });
  }

  fetch("https://github-contributions-api.jogruber.de/v4/SauloStorel?y=last")
    .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`Contribuições: ${res.status}`))))
    .then(renderHeatmap)
    .catch((err) => {
      console.warn("Mapa de atividade indisponível.", err);
      document.getElementById("activity").hidden = true;
    });

  /* ---------- Fluxo request → response ---------- */
  const flow = document.querySelector(".flow");
  const steps = [...document.querySelectorAll(".flow-step")];

  function setFlowProgress(progress) {
    flow.style.setProperty("--p", progress.toFixed(4));
    steps.forEach((step, i) => step.classList.toggle("is-active", progress >= i / (steps.length - 1) - 0.001));
  }

  if (!animate) {
    setFlowProgress(1);
    return;
  }

  ScrollTrigger.create({
    trigger: flow,
    start: "top 75%",
    end: "bottom 45%",
    scrub: 0.6,
    onUpdate: (self) => setFlowProgress(self.progress),
  });

  /* ---------- Faixa: anda sozinha e acelera com a rolagem ---------- */
  const marquee = gsap.to(".marquee-track", { xPercent: -50, duration: 28, ease: "none", repeat: -1 });

  ScrollTrigger.create({
    onUpdate: (self) => {
      const direction = self.direction || 1;
      const boost = Math.min(Math.abs(self.getVelocity()) / 300, 6);
      // Acelera no sentido da rolagem e volta ao ritmo normal ao parar.
      gsap.to(marquee, {
        timeScale: direction * (1 + boost),
        duration: 0.3,
        overwrite: true,
        onComplete: () => gsap.to(marquee, { timeScale: direction, duration: 1.2, overwrite: true }),
      });
    },
  });

  /* ---------- Projetos: imagens entram com cortina ---------- */
  gsap.utils.toArray(".row-thumb").forEach((thumb) => {
    gsap.from(thumb, {
      clipPath: "inset(0% 0% 100% 0%)",
      scale: 1.06,
      duration: 1.6,
      ease: "expo.out",
      scrollTrigger: { trigger: thumb, start: "top 85%" },
    });
  });
})();
