// O mapa é uma cena só: os outros países e o Brasil por estado ficam sempre por
// baixo; abrir um estado é dar zoom na cena até ele, com os municípios surgindo
// por cima, e o exterior é afastar a câmera até o mundo, com um ponto por cidade.
// Fronteiras são linhas próprias (cada uma desenhada uma vez), com espessura
// constante em qualquer zoom.
import { geoMercator, geoPath } from "https://cdn.jsdelivr.net/npm/d3-geo@3.1.1/+esm";
import { CANDIDATOS, FAIXAS, SEM_VOTOS } from "./config.js";
import { corDoLider, forca } from "./cores.js";
import { escapar } from "./formato.js";
import { ligarGestos, pontoNoSvg } from "./gestos.js";
import { lider, temVotos, virada } from "./resultado.js";

const [A, B] = CANDIDATOS;
const LARGURA = 800;
const ALTURA = 720;
const NS = "http://www.w3.org/2000/svg";
const DURACAO = matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 900;
const PIXELS_POR_PONTO = 6;
const SETA_MAXIMA = 52;
// Até onde o zoom do usuário vai, a partir do enquadramento de cada vista. Num estado,
// dá para afastar até o Brasil inteiro.
const ZOOM_MINIMO = 0.8;
const ZOOM_MAXIMO = 12;
// Num estado, afastar até menos que este tanto do enquadramento dele é sair do estado; no
// Brasil, aproximar até este tanto do enquadramento do estado no centro é entrar nele.
// A folga entre os dois evita entrar e sair sem parar perto do limite.
const AFASTAMENTO_PARA_SAIR = 0.6;
const APROXIMACAO_PARA_ENTRAR = 0.8;
// Escolher uma cidade aproxima de leve: até caber na tela, mas no máximo este tanto.
const ZOOM_NA_CIDADE = 2.5;
// Raio, em pixels de tela, em que um toque ou o mouse "pega" a cidade do exterior mais próxima;
// a mira do celular alcança mais longe, já que o dedo não precisa estar em cima do ponto.
const ALCANCE_DO_PONTO = 22;
const ALCANCE_DA_MIRA = 60;
// Ponto de cidade sem votos: o cinza das áreas sumiria no fundo escuro.
const PONTO_SEM_VOTOS = "#55555c";
// Quantas das maiores cidades do estado aberto ganham nome no mapa.
const CIDADES_COM_NOME = 5;
// Largura média de uma letra do rótulo (12px), em unidades do viewBox, para estimar colisões.
const LARGURA_DA_LETRA = 6.5;

const esperar = (ms) => new Promise((resolver) => setTimeout(resolver, ms));
const proximoQuadro = () => new Promise((resolver) => requestAnimationFrame(() => requestAnimationFrame(resolver)));

// ---------- Setas da virada ----------

// A seta aponta para a esquerda quando Lula ganhou espaço e para a direita quando Flávio ganhou.
function seta({ resultado, primeiroTurno }, [x, y], escala) {
  if (!temVotos(resultado)) return "";

  const pontos = virada(resultado, primeiroTurno);
  const candidato = pontos > 0 ? A : B;
  const sentido = pontos > 0 ? -1 : 1;
  const comprimento = escala * Math.min(SETA_MAXIMA, Math.abs(pontos) * PIXELS_POR_PONTO);
  // A ponta é medida em espessuras de traço, então encolhe junto com a linha.
  return `<line x1="${x}" y1="${y}" x2="${x + sentido * comprimento * 0.8}" y2="${y - comprimento * 0.6}"
    stroke="${candidato.cor}" stroke-width="${Math.max(1, 2 * escala).toFixed(2)}"
    marker-end="url(#ponta-${candidato.numero})" opacity="${forca(resultado)}" />`;
}

// ---------- Legendas ----------

const amostra = (cor) => `<i class="amostra" style="background:${cor}"></i>`;
const rotulosDasFaixas = [`<${FAIXAS[0]}`, ...FAIXAS.slice(0, -1).map((f, i) => `${f}–${FAIXAS[i + 1]}`), `${FAIXAS.at(-1)}+`];

const legendaLider = () => `
  ${CANDIDATOS.map((c) => `
    <div class="legenda-linha">
      <span class="legenda-nome">${c.curto}</span>
      <span class="legenda-rampa">${c.rampa.map(amostra).join("")}</span>
    </div>`).join("")}
  <div class="legenda-linha legenda-escala"><span></span><span class="legenda-rampa">${rotulosDasFaixas.map((r) => `<small>${r}</small>`).join("")}</span></div>
  <p class="legenda-nota">% dos votos válidos de quem lidera. ${amostra(SEM_VOTOS)} sem votos apurados; translúcido: poucas urnas apuradas.</p>`;

const legendaVirada = () => `
  <p class="legenda-nota">Quanto o placar andou desde o 1º turno, entre os dois candidatos.</p>
  <p class="legenda-virada"><span>${amostra(A.cor)} ← ${A.nome} ganhou espaço</span><span>${B.nome} ganhou espaço → ${amostra(B.cor)}</span></p>
  <p class="legenda-nota">Quanto mais longa a seta, maior a virada. Só aparece onde já há votos apurados.</p>`;

// Cada modo diz como pintar a área e o ponto do exterior, se desenha setas e qual legenda mostrar.
const MODOS = {
  lider: {
    fundo: corDoLider,
    opacidade: forca,
    ponto: (resultado) => lider(resultado)?.cor ?? PONTO_SEM_VOTOS,
    setas: false,
    legenda: legendaLider,
  },
  virada: { fundo: () => SEM_VOTOS, opacidade: () => 1, ponto: () => PONTO_SEM_VOTOS, setas: true, legenda: legendaVirada },
};

export const NOMES_DOS_MODOS = { lider: "Quem lidera", virada: "Virada" };

// ---------- Mapa ----------

const pontas = CANDIDATOS.map((c) => `
  <marker id="ponta-${c.numero}" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
    <path d="M0 0 10 5 0 10z" fill="${c.cor}" />
  </marker>`).join("");

const elemento = (tag, atributos = {}) => {
  const criado = document.createElementNS(NS, tag);
  for (const [nome, valor] of Object.entries(atributos)) criado.setAttribute(nome, valor);
  return criado;
};

// `brasil` e cada estado chegam como { areas, bordas }: áreas são
// { chave, nome, rota, feature, primeiroTurno } e bordas é uma geometria de linhas.
// `mundo` é { formas, bordas }: os outros países, só de fundo. As cidades do
// exterior trazem `coordenadas` no lugar de `feature`.
export function criarMapa(svg, legenda, { brasil, mundo }, { aoPassar, aoSair, aoEscolher, aoMoverComGesto, aoAfastar }) {
  svg.setAttribute("viewBox", `0 0 ${LARGURA} ${ALTURA}`);
  svg.innerHTML = `
    <defs>${pontas}</defs>
    <g class="cena">
      <path class="paises" />
      <path class="bordas-paises" />
      <path class="silhueta" />
      <g class="base"></g>
      <g class="detalhes"></g>
      <path class="bordas-estados" />
      <path class="contorno-atual" />
      <path class="selecao" />
      <path class="realce" />
    </g>
    <g class="rotulos"></g>
    <g class="pontos"></g>
    <g class="marcas"></g>`;

  const $ = (seletor) => svg.querySelector(seletor);
  const cena = $(".cena");
  const projecao = geoMercator().fitExtent(
    [[12, 12], [LARGURA - 12, ALTURA - 12]],
    { type: "FeatureCollection", features: brasil.areas.map((area) => area.feature) },
  );
  const caminho = geoPath(projecao);

  const INICIO = { k: 1, x: 0, y: 0 };
  let zoom = INICIO;
  let enquadramento = INICIO;
  let pintura = null;
  let selecionada = null;
  const areaDaForma = new WeakMap();

  // ---------- Áreas ----------

  function desenharAreas(grupo, areas, { focaveis }) {
    return areas.map((area) => {
      const forma = elemento("path", { d: caminho(area.feature) });
      forma.addEventListener("pointermove", (evento) => passar(area, evento));
      forma.addEventListener("click", () => aoEscolher(area));
      if (focaveis) tornarFocavel(forma, area);
      grupo.append(forma);
      const desenhada = { ...area, forma, centro: caminho.centroid(area.feature) };
      areaDaForma.set(forma, desenhada);
      return desenhada;
    });
  }

  function tornarFocavel(forma, area) {
    forma.setAttribute("tabindex", "0");
    forma.setAttribute("role", "button");
    forma.setAttribute("aria-label", `Ver municípios de ${area.nome}`);
    forma.addEventListener("focus", () => $(".realce").setAttribute("d", caminho(area.feature)));
    forma.addEventListener("keydown", (evento) => evento.key === "Enter" && aoEscolher(area));
  }

  function passar(area, evento) {
    $(".realce").setAttribute("d", caminho(area.feature));
    aoPassar(area, evento);
  }

  $(".paises").setAttribute("d", caminho({ type: "FeatureCollection", features: mundo.formas }));
  $(".bordas-paises").setAttribute("d", caminho(mundo.bordas));

  // Silhueta opaca do Brasil sob os estados: com os vizinhos esmaecidos, o mapa-múndi
  // não pode aparecer através deles.
  $(".silhueta").setAttribute("d", caminho({ type: "FeatureCollection", features: brasil.areas.map((area) => area.feature) }));

  const base = desenharAreas($(".base"), brasil.areas, { focaveis: true });
  $(".bordas-estados").setAttribute("d", caminho(brasil.bordas));
  let visiveis = base;
  let pontos = [];

  // ---------- Pontos do exterior ----------

  // Os pontos são criados uma vez por visita ao exterior; cada atualização só muda cor e posição.
  function desenharPontos(cidades) {
    $(".pontos").replaceChildren();
    return cidades.map((cidade) => {
      const circulo = elemento("circle", { r: 5 });
      $(".pontos").append(circulo);
      return { ...cidade, circulo, centro: projecao(cidade.coordenadas) };
    });
  }

  const naTela = ([x, y]) => [zoom.x + zoom.k * x, zoom.y + zoom.k * y];

  // Pontos pequenos e próximos (Europa, fronteiras) são difíceis de acertar com o dedo:
  // em vez do alvo exato, vale a cidade mais perto do toque, dentro de um raio generoso.
  function pontoMaisProximo(evento, alcanceNaTela = ALCANCE_DO_PONTO) {
    if (!pontos.length) return null;

    const alvo = pontoNoSvg(svg, { x: evento.clientX, y: evento.clientY });
    const alcance = alcanceNaTela / svg.getScreenCTM().a;
    const [maisPerto] = pontos
      .map((ponto) => {
        const [x, y] = naTela(ponto.centro);
        return { ponto, distancia: Math.hypot(x - alvo.x, y - alvo.y) };
      })
      .sort((a, b) => a.distancia - b.distancia);
    return maisPerto.distancia <= alcance ? maisPerto.ponto : null;
  }

  function marcarPontoSobOPonteiro(ponto) {
    for (const outro of pontos) outro.circulo.classList.toggle("sob-ponteiro", outro === ponto);
  }

  // Fora de qualquer área (no mar, nos outros países) o realce e a dica somem; sobre uma
  // área, quem cuida é o pointermove dela.
  svg.addEventListener("pointermove", (evento) => {
    const ponto = pontoMaisProximo(evento);
    marcarPontoSobOPonteiro(ponto);
    if (ponto) return aoPassar(ponto, evento);
    if (!areaDaForma.has(evento.target)) soltarRealce();
  });

  svg.addEventListener("click", (evento) => {
    const ponto = pontoMaisProximo(evento);
    if (!ponto) return;

    evento.stopPropagation();
    aoEscolher(ponto);
  }, true);

  // O lugar no centro do mapa (usado pela mira e para trocar de estado): a área desenhada
  // ali ou, no exterior, a cidade mais perto.
  function areaNoCentro() {
    const caixa = svg.getBoundingClientRect();
    const [x, y] = [caixa.left + caixa.width / 2, caixa.top + caixa.height / 2];
    return pontos.length
      ? pontoMaisProximo({ clientX: x, clientY: y }, ALCANCE_DA_MIRA)
      : areaDaForma.get(document.elementFromPoint(x, y)) ?? null;
  }

  function soltarRealce() {
    $(".realce").removeAttribute("d");
    marcarPontoSobOPonteiro(null);
    aoSair();
  }

  svg.addEventListener("pointerleave", soltarRealce);

  // ---------- Câmera ----------

  function aplicar(destino) {
    zoom = destino;
    cena.style.transform = `translate(${zoom.x}px, ${zoom.y}px) scale(${zoom.k})`;
  }

  // O espaço visível de verdade, em unidades do viewBox: o SVG pode ser mais largo (ou alto)
  // que o viewBox, e o zoom deve aproveitar a área toda entre os painéis.
  function areaVisivel() {
    const caixa = svg.getBoundingClientRect();
    const de = pontoNoSvg(svg, { x: caixa.left, y: caixa.top });
    const ate = pontoNoSvg(svg, { x: caixa.right, y: caixa.bottom });
    return { x: de.x, y: de.y, largura: ate.x - de.x, altura: ate.y - de.y };
  }

  function enquadrar(geometria) {
    const [[x0, y0], [x1, y1]] = caminho.bounds(geometria);
    const area = areaVisivel();
    const k = 0.9 / Math.max((x1 - x0) / area.largura, (y1 - y0) / area.altura);
    return {
      k,
      x: area.x + area.largura / 2 - (k * (x0 + x1)) / 2,
      y: area.y + area.altura / 2 - (k * (y0 + y1)) / 2,
    };
  }

  // Enquadra onde está a maior parte das cidades: as poucas das pontas (Oceania, oeste
  // dos EUA) não podem afastar a câmera do resto; chega-se nelas arrastando o mapa.
  function miolo(coordenadas, corte = 0.06) {
    const faixa = (eixo) => {
      const valores = coordenadas.map((c) => c[eixo]).sort((a, b) => a - b);
      return [valores[Math.floor(corte * valores.length)], valores[Math.ceil((1 - corte) * valores.length) - 1]];
    };
    const [[oeste, leste], [sul, norte]] = [faixa(0), faixa(1)];
    return { type: "MultiPoint", coordinates: [[oeste, sul], [leste, norte]] };
  }

  // Durante o movimento só a câmera anda: nada é criado, pintado ou esmaecido
  // ao mesmo tempo, senão o navegador engasga redesenhando centenas de municípios.
  async function mover(destino) {
    gestos.pararARoda();
    svg.classList.add("movendo");
    aplicar(destino);
    await esperar(DURACAO);
    svg.classList.remove("movendo");
    repintar();
  }

  async function irPara(destino) {
    enquadramento = destino;
    await mover(destino);
  }

  const limitarZoom = (k) =>
    Math.min(enquadramento.k * ZOOM_MAXIMO, Math.max(Math.min(enquadramento.k, INICIO.k) * ZOOM_MINIMO, k));

  // O zoom do usuário (dedo, roda ou botões) também navega: afastar bem além do estado
  // aberto é sair dele e, no Brasil, aproximar até o estado do centro quase encher a tela
  // é escolhê-lo.
  function conferirZoom({ k }) {
    const saiuDoEstado = svg.classList.contains("em-estado") && k < zoom.k && k < enquadramento.k * AFASTAMENTO_PARA_SAIR;
    if (saiuDoEstado) return aoAfastar();
    if (visiveis !== base || k <= zoom.k) return;

    const estado = areaNoCentro();
    if (estado && k >= enquadrar(estado.feature).k * APROXIMACAO_PARA_ENTRAR) aoEscolher(estado);
  }

  // Durante o gesto a cena acompanha o dedo e, uma vez por quadro, as marcas são
  // reposicionadas e a mira é avisada. Só o gesto avisa a mira: quando a própria câmera
  // anda (abrir um estado, os botões de zoom), o lugar em foco continua o mesmo.
  let quadroPedido = false;
  const gestos = ligarGestos(svg, {
    ativo: () => true,
    ler: () => zoom,
    limites: () => ({ minimo: limitarZoom(0), maximo: limitarZoom(Infinity) }),
    aplicar: (destino) => {
      conferirZoom(destino);
      aplicar(destino);
      if (quadroPedido) return;

      quadroPedido = true;
      requestAnimationFrame(() => {
        quadroPedido = false;
        posicionarMarcas();
        aoMoverComGesto();
      });
    },
  });

  // Botões de zoom: aproximam em volta do centro do que está na tela.
  async function aproximar(fator) {
    const k = limitarZoom(zoom.k * fator);
    const real = k / zoom.k;
    const area = areaVisivel();
    const [cx, cy] = [area.x + area.largura / 2, area.y + area.altura / 2];
    conferirZoom({ k });
    await mover({ k, x: cx - (cx - zoom.x) * real, y: cy - (cy - zoom.y) * real });
  }

  const reenquadrar = () => mover(enquadramento);

  // Centraliza a cidade escolhida e aproxima até ela caber na tela, sem passar de
  // ZOOM_NA_CIDADE vezes o enquadramento da vista nem afastar quem já estava mais perto.
  // Os pontos do exterior não têm tamanho, então só o limite vale.
  async function aproximarLugar(chave) {
    const lugar = visiveis.find((area) => area.chave === chave);
    if (!lugar) return;

    const cabe = lugar.feature ? enquadrar(lugar.feature).k : Infinity;
    const k = limitarZoom(Math.max(zoom.k, Math.min(cabe, enquadramento.k * ZOOM_NA_CIDADE)));
    const area = areaVisivel();
    const [x, y] = lugar.centro;
    await mover({ k, x: area.x + area.largura / 2 - k * x, y: area.y + area.altura / 2 - k * y });
  }

  // Aproxima uma caixa [[oeste, sul], [leste, norte]] sem mudar o enquadramento da vista,
  // então "voltar ao enquadramento" ainda mostra o mundo todo.
  const aproximarCaixa = ([sudoeste, nordeste]) => mover(enquadrar({ type: "MultiPoint", coordinates: [sudoeste, nordeste] }));

  // ---------- Navegação ----------

  function removerDetalhes() {
    for (const antigo of $(".detalhes").children) {
      antigo.classList.add("saindo");
      setTimeout(() => antigo.remove(), 250);
    }
  }

  function sairDoEstado() {
    removerDetalhes();
    svg.classList.remove("em-estado");
    $(".contorno-atual").removeAttribute("d");
    for (const area of base) area.forma.classList.remove("atual");
  }

  function sairDoExterior() {
    svg.classList.remove("no-exterior");
    pontos = [];
    $(".pontos").replaceChildren();
  }

  // Troca o estado aberto: municípios novos (invisíveis até `revelar`), contorno e vizinhos.
  function mostrarEstado(uf, { areas, bordas }) {
    removerDetalhes();
    sairDoExterior();
    const grupo = elemento("g", { class: "detalhe escondido" });
    const municipios = desenharAreas(grupo, areas, { focaveis: false });
    grupo.append(elemento("path", { class: "bordas-municipios", d: caminho(bordas) }));
    $(".detalhes").append(grupo);

    const contorno = base.find((area) => area.chave === uf).feature;
    for (const area of base) area.forma.classList.toggle("atual", area.chave === uf);
    $(".contorno-atual").setAttribute("d", caminho(contorno));
    svg.classList.add("em-estado");
    visiveis = municipios;
    repintar();
    return { grupo, enquadramentoDoEstado: enquadrar(contorno) };
  }

  // Os municípios entram invisíveis, a câmera chega no estado e só então eles aparecem.
  async function abrirEstado(uf, detalhe) {
    const { grupo, enquadramentoDoEstado } = mostrarEstado(uf, detalhe);
    await proximoQuadro();
    await irPara(enquadramentoDoEstado);
    grupo.classList.remove("escondido");
  }

  // A mira cruzou a divisa: o vizinho vira o estado aberto sem a câmera sair do lugar.
  function trocarEstado(uf, detalhe) {
    const { grupo, enquadramentoDoEstado } = mostrarEstado(uf, detalhe);
    enquadramento = enquadramentoDoEstado;
    grupo.classList.remove("escondido");
  }

  async function voltarAoBrasil() {
    sairDoEstado();
    sairDoExterior();
    visiveis = base;
    await irPara(INICIO);
  }

  // A câmera se afasta do Brasil até enquadrar todas as cidades onde se vota fora do país.
  async function abrirExterior(cidades) {
    sairDoEstado();
    svg.classList.add("no-exterior");
    pontos = desenharPontos(cidades);
    visiveis = pontos;
    repintar();
    await irPara(enquadrar(miolo(cidades.map((cidade) => cidade.coordenadas))));
  }

  // ---------- Pintura ----------

  // As marcas (setas e pontos) ficam fora da cena para não engordarem com o zoom;
  // a posição acompanha o enquadramento.
  function posicionarMarcas() {
    if (!pintura) return;

    const { resultado, estrategia } = pintura;
    for (const ponto of pontos) {
      const [x, y] = naTela(ponto.centro);
      ponto.circulo.setAttribute("cx", x.toFixed(1));
      ponto.circulo.setAttribute("cy", y.toFixed(1));
    }

    // Sigla de cada estado no centro dele, para reconhecer os vizinhos com um estado aberto;
    // dentro do estado, o nome das maiores cidades, como referência para se localizar.
    const siglas = base
      .filter((area) => !area.forma.classList.contains("atual"))
      .map((area) => {
        const [x, y] = naTela(area.centro);
        return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}">${area.chave.toUpperCase()}</text>`;
      });
    const maioresCidades = semColisao(
      visiveis.filter((area) => area.forma && area.porte).sort((a, b) => b.porte - a.porte),
    ).map(({ area, x, y }) => `<g class="cidade" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})">
        <circle r="2.5" /><text x="6">${escapar(area.nome)}</text></g>`);
    $(".rotulos").innerHTML = [...siglas, ...maioresCidades].join("");

    const escala = Math.min(1, 12 / Math.sqrt(visiveis.length));
    $(".marcas").innerHTML = estrategia.setas
      ? visiveis.map((area) => seta({ ...area, resultado: resultado(area.chave) }, naTela(area.centro), escala)).join("")
      : "";
  }

  // As maiores cidades entram primeiro; quem esbarraria num nome já posto fica de fora
  // (aproximando a região, ela volta a caber).
  function semColisao(cidades) {
    const postas = [];
    for (const area of cidades) {
      if (postas.length === CIDADES_COM_NOME) break;

      const [x, y] = naTela(area.centro);
      const caixa = { x0: x - 4, x1: x + 10 + area.nome.length * LARGURA_DA_LETRA, y0: y - 9, y1: y + 9 };
      const esbarra = postas.some(({ caixa: outra }) =>
        caixa.x0 < outra.x1 && outra.x0 < caixa.x1 && caixa.y0 < outra.y1 && outra.y0 < caixa.y1);
      if (!esbarra) postas.push({ area, x, y, caixa });
    }
    return postas;
  }

  function pintar(resultado, modo) {
    const estrategia = MODOS[modo];
    pintura = { resultado, modo, estrategia };

    for (const area of new Set([...base, ...visiveis].filter((area) => area.forma))) {
      const r = resultado(area.chave);
      area.forma.setAttribute("fill", estrategia.fundo(r));
      area.forma.setAttribute("fill-opacity", estrategia.opacidade(r));
    }
    for (const ponto of pontos) {
      const r = resultado(ponto.chave);
      ponto.circulo.setAttribute("fill", estrategia.ponto(r));
      ponto.circulo.setAttribute("fill-opacity", estrategia.opacidade(r));
      ponto.circulo.classList.toggle("selecionado", ponto.chave === selecionada);
    }
    posicionarMarcas();
    legenda.innerHTML = estrategia.legenda();
  }

  const repintar = () => pintura && pintar(pintura.resultado, pintura.modo);

  function destacar(chave) {
    selecionada = chave;
    const area = visiveis.find((a) => a.chave === chave);
    $(".selecao").setAttribute("d", area?.feature ? caminho(area.feature) : "");
    for (const ponto of pontos) ponto.circulo.classList.toggle("selecionado", ponto.chave === chave);
  }

  return {
    abrirEstado, trocarEstado, abrirExterior, voltarAoBrasil, pintar, destacar,
    aproximar, reenquadrar, aproximarCaixa, aproximarLugar, areaNoCentro,
  };
}
