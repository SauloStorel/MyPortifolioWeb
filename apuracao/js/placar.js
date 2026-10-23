import { CANDIDATOS } from "./config.js";
import { bandeira, escapar, inteiro, pct, pctDe } from "./formato.js";
import { diferenca, garantido, lider, outros, percentual, temVotos, votos } from "./resultado.js";

// Só aritmética sobre o que já foi publicado; nenhuma projeção.
const SITUACOES = [
  {
    quando: (resultado) => resultado.turno === 1,
    texto: (resultado) =>
      `Resultado final do 1º turno, de 4 de outubro. Os outros candidatos somaram ${pct(outros(resultado))} dos votos válidos.`,
  },
  {
    quando: (resultado) => !temVotos(resultado),
    texto: () => "Aguardando os primeiros votos apurados.",
  },
  {
    quando: garantido,
    texto: (resultado) =>
      `<strong>Decidido.</strong> A vantagem de ${lider(resultado).nome} (${inteiro(diferenca(resultado))} votos)
      já é maior que os ${inteiro(resultado.eleitoresFaltando)} eleitores que faltam apurar.`,
  },
  {
    quando: () => true,
    texto: (resultado) =>
      `${lider(resultado)?.nome ?? "Empate"} à frente por ${inteiro(diferenca(resultado))} votos.
      Faltam apurar ${inteiro(resultado.eleitoresFaltando)} eleitores, então ainda pode virar.`,
  },
];

// Números e barras que andam do valor anterior até o novo a cada atualização do mesmo lugar.
// `data-valor` + `data-formato` animam o texto; `data-largura` anima a largura (%).
const DURACAO = matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 700;
const FORMATOS = { pct, votos: (n) => `${inteiro(Math.round(n))} votos` };

// `papel` identifica o número entre uma atualização e outra (o percentual de Lula, os votos de Flávio…).
const numero = (papel, valor, formato) =>
  `data-papel="${papel}" data-valor="${valor}" data-formato="${formato}">${FORMATOS[formato](valor)}`;

const candidato = (resultado) => (c) => `
  <li class="candidato" style="--cor:${c.cor}">
    <img class="candidato-foto" src="${c.foto}" alt="" width="44" height="44" />
    <p class="candidato-nome">${c.nome}</p>
    <p class="candidato-pct" ${temVotos(resultado) ? numero(`pct${c.numero}`, percentual(resultado, c), "pct") : `>${pctDe(resultado, c)}`}</p>
    <p class="candidato-ficha"><code>${c.numero}</code> ${c.partido} · <span ${numero(`votos${c.numero}`, votos(resultado, c), "votos")}</span></p>
  </li>`;

const barra = (resultado) => (c) =>
  `<span class="corrida-barra" style="--cor:${c.cor};width:${percentual(resultado, c)}%"
    data-papel="barra${c.numero}" data-largura="${percentual(resultado, c)}"></span>`;

let anterior = { chave: null, valores: new Map() };

function animar(elemento, chave) {
  const alvos = [...elemento.querySelectorAll("[data-papel]")];
  const valores = new Map(alvos.map((alvo) => [alvo.dataset.papel, Number(alvo.dataset.valor ?? alvo.dataset.largura)]));
  const mesmoLugar = anterior.chave === chave;
  const de = (papel) => (mesmoLugar ? anterior.valores.get(papel) : undefined) ?? valores.get(papel);
  anterior = { chave, valores };
  if (!DURACAO || alvos.every(({ dataset }) => de(dataset.papel) === valores.get(dataset.papel))) return;

  const desenhar = (progresso) => alvos.forEach((alvo) => {
    const { papel } = alvo.dataset;
    const valor = de(papel) + (valores.get(papel) - de(papel)) * progresso;
    if (alvo.dataset.largura) alvo.style.width = `${valor}%`;
    else alvo.textContent = FORMATOS[alvo.dataset.formato](valor);
  });

  const inicio = performance.now();
  const quadro = (agora) => {
    const t = Math.min(1, (agora - inicio) / DURACAO);
    desenhar(1 - (1 - t) ** 3);
    if (t < 1) requestAnimationFrame(quadro);
  };
  desenhar(0);
  requestAnimationFrame(quadro);
}

// `foco` é { nome, chave, bandeira }: o lugar mostrado, a chave do resultado (que diz se é
// o mesmo lugar da última vez, para animar a mudança) e o caminho da bandeira.
export function renderizarPlacar(elemento, foco, resultado) {
  const [A, B] = CANDIDATOS;
  const situacao = SITUACOES.find((s) => s.quando(resultado));

  elemento.innerHTML = `
    <p class="label">Placar <code>placar#show</code></p>
    <div class="placar-topo">
      <h2 class="placar-escopo">${bandeira(foco.bandeira)}${escapar(foco.nome)}</h2>
      <button class="compartilhar" type="button" aria-label="Compartilhar o resultado de ${escapar(foco.nome)}">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15V3M7 8l5-5 5 5"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg>
      </button>
    </div>
    <p class="placar-urnas"><span ${numero("urnas", resultado.urnas, "pct")}</span> das urnas apuradas</p>
    <div class="urnas" aria-hidden="true"><span style="width:${resultado.urnas}%" data-papel="barraUrnas" data-largura="${resultado.urnas}"></span></div>
    <ul class="placar-candidatos">${CANDIDATOS.map(candidato(resultado)).join("")}</ul>
    <div class="corrida" role="img"
      aria-label="${A.nome} ${pct(percentual(resultado, A))}, ${B.nome} ${pct(percentual(resultado, B))} dos votos válidos">
      ${CANDIDATOS.map(barra(resultado)).join("")}
      <i class="corrida-meio"></i>
    </div>
    <p class="corrida-texto">${situacao.texto(resultado)}</p>`;
  animar(elemento, foco.chave);
}
