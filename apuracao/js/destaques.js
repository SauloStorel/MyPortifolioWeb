// "Onde cada um foi mais forte": os lugares do recorte aberto (estados, municípios ou
// cidades do exterior) com o maior percentual de cada candidato.
import { CANDIDATOS } from "./config.js";
import { bandeira, escapar, inteiro, pct } from "./formato.js";
import { percentual, temVotos, votos } from "./resultado.js";

const QUANTOS = 5;

const linha = (candidato, selecionado) => ({ lugar, resultado }) => `
  <li>
    <a href="#${lugar.rota}" ${lugar.chave === selecionado ? 'aria-current="true"' : ""}>
      <span class="destaque-nome">${bandeira(lugar.bandeira)}${escapar(lugar.nome)}</span>
      <span class="destaque-votos">${inteiro(votos(resultado, candidato))} votos</span>
      <b>${pct(percentual(resultado, candidato))}</b>
      <i style="--cor:${candidato.cor};width:${percentual(resultado, candidato)}%"></i>
    </a>
  </li>`;

const coluna = (comVotos, selecionado) => (candidato) => {
  const maisFortes = [...comVotos]
    .sort((a, b) => percentual(b.resultado, candidato) - percentual(a.resultado, candidato))
    .slice(0, QUANTOS);
  return `
    <div class="destaque">
      <h3><i class="amostra" style="background:${candidato.cor}"></i>${candidato.nome}</h3>
      <ol>${maisFortes.map(linha(candidato, selecionado)).join("")}</ol>
    </div>`;
};

// `lugares` são { chave, nome, rota, bandeira }; `selecionado` é a chave do lugar em foco, se houver.
export function renderizarDestaques(elemento, lugares, resultado, selecionado) {
  const comVotos = lugares
    .map((lugar) => ({ lugar, resultado: resultado(lugar.chave) }))
    .filter(({ resultado: r }) => temVotos(r));

  elemento.innerHTML = `
    <p class="label">Onde cada um foi mais forte <code>destaques#index</code></p>
    ${comVotos.length
      ? CANDIDATOS.map(coluna(comVotos, selecionado)).join("")
      : `<p class="destaques-vazio">Aparece assim que os primeiros votos forem apurados.</p>`}`;
}
