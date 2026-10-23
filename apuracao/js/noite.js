// Evolução do placar nacional conforme as urnas são apuradas. O TSE não publica
// esse histórico, então o navegador vai guardando cada leitura desde que a
// página foi aberta pela primeira vez.
import { CANDIDATOS } from "./config.js";
import { pct } from "./formato.js";
import { percentual, temVotos } from "./resultado.js";

const [A, B] = CANDIDATOS;
const ALTURA = 300;
const MARGEM = { cima: 16, direita: 132, baixo: 36, esquerda: 48 };
const URNAS_MINIMAS = 1;

// Onde o histórico fica: no navegador (sobrevive a recarregar a página) ou só na memória.
export const NAVEGADOR = {
  ler(chave) {
    try {
      return JSON.parse(localStorage.getItem(chave)) ?? [];
    } catch {
      return [];
    }
  },
  gravar(chave, pontos) {
    try {
      localStorage.setItem(chave, JSON.stringify(pontos));
    } catch {
      // Sem armazenamento (aba anônima, cota cheia): o gráfico vale só para esta visita.
    }
  },
};

export const MEMORIA = { ler: () => [], gravar: () => {} };

export class Historico {
  #chave;
  #armazenamento;
  pontos;

  constructor(chave, armazenamento) {
    this.#chave = `apuracao:${chave}`;
    this.#armazenamento = armazenamento;
    this.pontos = armazenamento.ler(this.#chave);
  }

  // Um ponto por avanço nas urnas: [% de urnas apuradas, % do primeiro candidato].
  // Abaixo de 1% das urnas o placar oscila demais e só achataria o gráfico.
  registrar(resultado) {
    const ultimo = this.pontos.at(-1)?.[0] ?? URNAS_MINIMAS;
    if (!temVotos(resultado) || resultado.urnas <= ultimo) return;

    this.pontos.push([resultado.urnas, percentual(resultado, A)]);
    this.#armazenamento.gravar(this.#chave, this.pontos);
  }
}

const series = (pontos) => [
  { candidato: A, valores: pontos.map(([x, y]) => [x, y]) },
  { candidato: B, valores: pontos.map(([x, y]) => [x, 100 - y]) },
];

export function renderizarNoite(figura, pontos) {
  if (pontos.length < 2) {
    figura.innerHTML = `<p class="noite-vazia">O gráfico se forma conforme as urnas são apuradas.
      Deixe esta página aberta durante a noite para acompanhar a evolução.</p>`;
    return;
  }

  // Desenhado na largura real da tela, para o texto não encolher junto com o SVG.
  const largura = Math.max(320, figura.clientWidth);
  const folga = Math.max(5, ...pontos.map(([, y]) => Math.abs(y - 50) + 1.5));
  const x = (urnas) => MARGEM.esquerda + (urnas / 100) * (largura - MARGEM.esquerda - MARGEM.direita);
  const y = (valor) => MARGEM.cima + ((50 + folga - valor) / (2 * folga)) * (ALTURA - MARGEM.cima - MARGEM.baixo);
  const linha = (valores) => valores.map(([u, v], i) => `${i ? "L" : "M"}${x(u).toFixed(1)} ${y(v).toFixed(1)}`).join("");

  const marcasX = [0, 25, 50, 75, 100].map((u) =>
    `<text class="eixo" x="${x(u)}" y="${ALTURA - 12}" text-anchor="middle">${u}%</text>`).join("");
  const marcasY = [50 - folga, 50, 50 + folga].map((v) =>
    `<text class="eixo" x="${MARGEM.esquerda - 10}" y="${y(v) + 4}" text-anchor="end">${Math.round(v)}%</text>`).join("");

  // O rótulo de quem está na frente sobe e o do outro desce, para não se encostarem perto dos 50%.
  const linhas = series(pontos).map(({ candidato, valores }) => {
    const [ux, uy] = valores.at(-1);
    const deslocamento = uy >= 50 ? -6 : 16;
    return `
      <path class="noite-linha" d="${linha(valores)}" stroke="${candidato.cor}" />
      <circle cx="${x(ux)}" cy="${y(uy)}" r="4" fill="${candidato.cor}" />
      <text class="noite-rotulo" x="${x(ux) + 10}" y="${y(uy) + deslocamento}">${candidato.nome} ${pct(uy)}</text>`;
  }).join("");

  figura.innerHTML = `
    <svg viewBox="0 0 ${largura} ${ALTURA}" role="img"
      aria-label="${A.nome} e ${B.nome} ao longo da apuração; agora ${pct(pontos.at(-1)[1])} e ${pct(100 - pontos.at(-1)[1])}">
      <line class="noite-meio" x1="${x(0)}" x2="${x(100)}" y1="${y(50)}" y2="${y(50)}" />
      ${marcasX}${marcasY}${linhas}
      <line class="noite-cursor" y1="${MARGEM.cima}" y2="${ALTURA - MARGEM.baixo}" visibility="hidden" />
      <rect class="noite-alvo" x="${x(0)}" y="0" width="${x(100) - x(0)}" height="${ALTURA}" />
    </svg>
    <p class="noite-leitura" aria-hidden="true"></p>
    <figcaption>Eixo horizontal: urnas apuradas no Brasil. Eixo vertical: votos válidos.</figcaption>`;

  ligarCursor(figura, pontos, x, largura);
}

// Ao passar o mouse, mostra o placar no ponto da apuração mais próximo.
function ligarCursor(figura, pontos, x, largura) {
  const svg = figura.querySelector("svg");
  const cursor = svg.querySelector(".noite-cursor");
  const leitura = figura.querySelector(".noite-leitura");

  svg.querySelector(".noite-alvo").addEventListener("pointermove", (evento) => {
    const caixa = svg.getBoundingClientRect();
    const posicao = ((evento.clientX - caixa.left) / caixa.width) * largura;
    const [urnas, valor] = pontos.reduce((perto, ponto) =>
      Math.abs(x(ponto[0]) - posicao) < Math.abs(x(perto[0]) - posicao) ? ponto : perto);

    cursor.setAttribute("x1", x(urnas));
    cursor.setAttribute("x2", x(urnas));
    cursor.setAttribute("visibility", "visible");
    leitura.textContent = `Com ${pct(urnas)} das urnas: ${A.nome} ${pct(valor)} · ${B.nome} ${pct(100 - valor)}`;
  });

  svg.addEventListener("pointerleave", () => {
    cursor.setAttribute("visibility", "hidden");
    leitura.textContent = "";
  });
}
