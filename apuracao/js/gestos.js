// Arrastar e dar zoom no mapa com o dedo ou o mouse.
// - Um ponteiro arrasta; dois (pinça) aproximam ou afastam em volta do meio dos dedos.
// - No computador, Ctrl/⌘ + roda do mouse dá zoom (a roda sozinha continua rolando a página).
// O mapa decide quando os gestos valem (`ativo`), até onde o zoom vai (`limites`)
// e como aplicar o novo enquadramento. Um clique ou toque rápido continua sendo clique.

const DISTANCIA_PARA_ARRASTE = 6;

const distancia = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const meio = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

// Converte pixels da tela para as unidades do viewBox do SVG.
export function pontoNoSvg(svg, { x, y }) {
  const matriz = svg.getScreenCTM();
  return { x: (x - matriz.e) / matriz.a, y: (y - matriz.f) / matriz.d };
}

export function ligarGestos(svg, { ativo, ler, aplicar, limites }) {
  const toques = new Map();
  let anterior = null;
  let arrastou = false;

  const noSvg = (ponto) => pontoNoSvg(svg, ponto);

  // Aproxima por `fator` mantendo parado o ponto do mapa que está sob `centro`.
  function zoomEm(centro, fatorPedido, deslocamento = { x: 0, y: 0 }) {
    const zoom = ler();
    const { minimo, maximo } = limites();
    const k = Math.min(maximo, Math.max(minimo, zoom.k * fatorPedido));
    const fator = k / zoom.k;
    aplicar({
      k,
      x: centro.x - (centro.x - zoom.x) * fator + deslocamento.x,
      y: centro.y - (centro.y - zoom.y) * fator + deslocamento.y,
    });
  }

  const posicoes = () => [...toques.values()];

  svg.addEventListener("pointerdown", (evento) => {
    if (!ativo()) return;

    toques.set(evento.pointerId, noSvg({ x: evento.clientX, y: evento.clientY }));
    anterior = posicoes();
    arrastou = false;
  });

  svg.addEventListener("pointermove", (evento) => {
    if (!toques.has(evento.pointerId)) return;

    toques.set(evento.pointerId, noSvg({ x: evento.clientX, y: evento.clientY }));
    const atuais = posicoes();
    if (atuais.length !== anterior.length) {
      anterior = atuais;
      return;
    }

    if (atuais.length === 2) {
      const [a, b] = atuais;
      const [a0, b0] = anterior;
      const centro = meio(a, b);
      const centroAntes = meio(a0, b0);
      zoomEm(centro, distancia(a, b) / distancia(a0, b0), { x: centro.x - centroAntes.x, y: centro.y - centroAntes.y });
      arrastou = true;
    } else {
      const [agora] = atuais;
      const [antes] = anterior;
      arrastou ||= distancia(agora, antes) > DISTANCIA_PARA_ARRASTE / svg.getScreenCTM().a;
      if (!arrastou) return;

      const zoom = ler();
      aplicar({ ...zoom, x: zoom.x + agora.x - antes.x, y: zoom.y + agora.y - antes.y });
    }
    if (arrastou) svg.setPointerCapture(evento.pointerId);
    anterior = atuais;
  });

  // O "soltou" é ouvido na janela inteira: um dedo erguido fora do mapa não avisa o SVG,
  // ficaria registrado como ainda na tela e o próximo arraste de um dedo viraria pinça.
  const soltar = (evento) => {
    if (!toques.delete(evento.pointerId)) return;

    anterior = posicoes();
  };
  addEventListener("pointerup", soltar, true);
  addEventListener("pointercancel", soltar, true);

  // Um arraste não pode virar clique no lugar onde o dedo foi solto.
  svg.addEventListener("click", (evento) => {
    if (!arrastou) return;

    evento.stopPropagation();
    arrastou = false;
  }, true);

  svg.addEventListener("wheel", (evento) => {
    if (!ativo() || !(evento.ctrlKey || evento.metaKey)) return;

    evento.preventDefault();
    zoomEm(noSvg({ x: evento.clientX, y: evento.clientY }), Math.exp(-evento.deltaY * 0.0025));
  }, { passive: false });

  return { zoomEm };
}
