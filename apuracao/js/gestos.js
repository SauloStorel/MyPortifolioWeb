// Arrastar e dar zoom no mapa com o dedo ou o mouse.
// - Um ponteiro arrasta; dois (pinça) aproximam ou afastam em volta do meio dos dedos.
// - No computador, Ctrl/⌘ + roda do mouse dá zoom (a roda sozinha continua rolando a página),
//   deslizando até o zoom pedido em vez de saltar a cada dente da roda.
// O mapa decide quando os gestos valem (`ativo`), até onde o zoom vai (`limites`)
// e como aplicar o novo enquadramento. Um clique ou toque rápido continua sendo clique.

const DISTANCIA_PARA_ARRASTE = 6;
// Quanto cada pixel de roda aproxima: um dente (100 px) dá uns 16%.
const ZOOM_POR_PIXEL = 0.0015;
// A roda pode contar em pixels, linhas ou páginas (`deltaMode` 0, 1 e 2).
const PIXELS_POR_MODO = [1, 25, 500];
// Tempo, em ms, para a câmera andar uns dois terços do que falta até o zoom pedido.
const SUAVIDADE_DA_RODA = matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 90;

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

  const limitar = (k) => {
    const { minimo, maximo } = limites();
    return Math.min(maximo, Math.max(minimo, k));
  };

  // Aproxima por `fator` mantendo parado o ponto do mapa que está sob `centro`.
  function zoomEm(centro, fatorPedido, deslocamento = { x: 0, y: 0 }) {
    const zoom = ler();
    const k = limitar(zoom.k * fatorPedido);
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

  // Cada giro da roda soma ao zoom pedido (`roda.k`, já dentro dos limites, para girar
  // além do máximo não acumular) e, a cada quadro, a câmera anda uma fração do que falta.
  let roda = null;
  let quadro = null;
  let quadroAnterior = null;

  function seguirARoda(agora) {
    const passado = agora - (quadroAnterior ?? agora - 16);
    quadroAnterior = agora;
    const falta = Math.log(roda.k / ler().k);
    const chegou = Math.abs(falta) < 0.001;
    zoomEm(roda.centro, Math.exp(chegou ? falta : falta * (1 - Math.exp(-passado / SUAVIDADE_DA_RODA))));
    if (chegou) return pararARoda();

    quadro = requestAnimationFrame(seguirARoda);
  }

  // Também serve para um movimento automático da câmera (abrir um estado, voltar ao Brasil)
  // interromper a roda.
  function pararARoda() {
    cancelAnimationFrame(quadro);
    roda = quadro = quadroAnterior = null;
  }

  svg.addEventListener("wheel", (evento) => {
    if (!ativo() || !(evento.ctrlKey || evento.metaKey)) return;

    evento.preventDefault();
    const pixels = evento.deltaY * PIXELS_POR_MODO[evento.deltaMode];
    roda = {
      k: limitar((roda?.k ?? ler().k) * Math.exp(-pixels * ZOOM_POR_PIXEL)),
      centro: noSvg({ x: evento.clientX, y: evento.clientY }),
    };
    quadro ??= requestAnimationFrame(seguirARoda);
  }, { passive: false });

  return { zoomEm, pararARoda };
}
