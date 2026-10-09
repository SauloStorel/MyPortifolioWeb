/* ============================================================
   Movimento: GSAP (ScrollTrigger + SplitText) e Lenis.
   Uma gramática só: o conteúdo sobe de trás de uma máscara,
   sempre com expo.out. Sem as bibliotecas, ou com
   prefers-reduced-motion, a página fica estática e completa.
   ============================================================ */
(function motion() {
  const root = document.documentElement;
  const revealPage = () => root.classList.remove("motion-pending");

  if (!window.gsap || !window.ScrollTrigger || !window.SplitText || !window.Lenis) {
    revealPage();
    return;
  }

  gsap.registerPlugin(ScrollTrigger, SplitText);
  gsap.defaults({ ease: "expo.out", duration: 1.2 });

  const mm = gsap.matchMedia();

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    /* ---------- Rolagem suave ---------- */
    const lenis = new Lenis({ anchors: true });
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    /* ---------- Entrada ---------- */
    const mastheadItems = gsap.utils.toArray(".masthead > *");
    const metaItems = gsap.utils.toArray(".intro-meta li");
    const statement = document.querySelector(".intro-statement");
    gsap.set([...mastheadItems, ...metaItems], { autoAlpha: 0, y: 12 });
    gsap.set(statement, { autoAlpha: 0 });
    revealPage();

    const intro = gsap.timeline({ delay: 0.1 }).to(mastheadItems, { autoAlpha: 1, y: 0, stagger: 0.06 });

    // Só a página inicial tem a frase de abertura.
    document.fonts.ready.then(() => {
      if (!statement) return;
      const { lines } = SplitText.create(statement, { type: "lines", mask: "lines", linesClass: "line" });
      intro
        .set(statement, { autoAlpha: 1 }, 0.15)
        .from(lines, { yPercent: 100, duration: 1.4, stagger: 0.09 }, 0.15)
        .to(metaItems, { autoAlpha: 1, y: 0, stagger: 0.08 }, 0.7);
    });

    /* ---------- Textos de seção, linha por linha ---------- */
    gsap.utils.toArray(".block .lead, .case-head .lead").forEach((lead) => {
      SplitText.create(lead, {
        type: "lines",
        mask: "lines",
        linesClass: "line",
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 100,
            stagger: 0.08,
            scrollTrigger: { trigger: lead, start: "top 88%" },
          }),
      });
    });

    /* ---------- Itens entram em sequência ---------- */
    const staggerIn = (targets) =>
      ScrollTrigger.batch(targets, {
        start: "top 92%",
        once: true,
        onEnter: (items) => gsap.from(items, { autoAlpha: 0, y: 24, stagger: 0.06 }),
      });

    staggerIn(".block > .label, .index-head .label, .index-more, .row-main, .row-stack, .row-year");
    staggerIn(".about-text p:not(.lead), .facts > div, .xp-item");
    staggerIn(".stack-group li, .code");
    staggerIn(".email, .links li, .field, .submit");
    staggerIn(".case-meta > div, .case-body, .case-figure, .case-next a");

    /* ---------- Foto e capa: cortina; só a foto tem parallax (capturas não podem ser cortadas) ---------- */
    gsap.utils.toArray(".about-photo, .case-cover").forEach((frame) => {
      gsap.from(frame, {
        clipPath: "inset(100% 0% 0% 0%)",
        duration: 1.6,
        scrollTrigger: { trigger: frame, start: "top 90%" },
      });
    });

    gsap.utils.toArray(".about-photo img").forEach((photo) => {
      gsap.fromTo(photo, { yPercent: -4, scale: 1.08 }, {
        yPercent: 4,
        ease: "none",
        scrollTrigger: { trigger: photo.parentElement, start: "top bottom", end: "bottom top", scrub: true },
      });
    });

    window.addEventListener("load", () => ScrollTrigger.refresh());

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  });

  // Com movimento reduzido nada fica escondido.
  mm.add("(prefers-reduced-motion: reduce)", revealPage);
})();
