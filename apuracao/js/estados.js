// As duas visões dos 27 estados: o mosaico (todos do mesmo tamanho) e a tabela.
import { CANDIDATOS, ESCOPOS, SEM_VOTOS, UFS } from "./config.js";
import { corDoLider, forca } from "./cores.js";
import { bandeira, bandeiraDoEstado, pct, pctDe, pp } from "./formato.js";
import { lider, temVotos, virada } from "./resultado.js";

const descrever = (nome, resultado) =>
  lider(resultado)
    ? `${nome}: ${lider(resultado).nome} lidera com ${pctDe(resultado, lider(resultado))}, ${pct(resultado.urnas)} apurado`
    : `${nome}: sem líder ainda`;

// A cor perde força misturada ao fundo; assim o texto claro continua legível por cima.
const fundo = (resultado) =>
  `color-mix(in srgb, ${corDoLider(resultado)} ${Math.round(forca(resultado) * 100)}%, ${SEM_VOTOS})`;

export function renderizarMosaico(elemento, resultado) {
  elemento.innerHTML = Object.entries(UFS).map(([uf, { nome, col, lin }]) => {
    const r = resultado(uf);
    const placar = lider(r) ? pctDe(r, lider(r)) : "–";
    return `
      <a class="ladrilho" href="#${uf}" style="grid-area:${lin + 1}/${col + 1};background:${fundo(r)}"
        aria-label="${descrever(nome, r)}" title="${descrever(nome, r)}">
        <b>${bandeira(bandeiraDoEstado(uf), "ladrilho-bandeira")}${uf.toUpperCase()}</b><span>${placar}</span>
        <i style="width:${r.urnas}%"></i>
      </a>`;
  }).join("");
}

const linhaDaTabela = (resultado, primeiroTurno) => ([uf, { nome }]) => {
  const r = resultado(uf);
  const andou = temVotos(r) ? pp(virada(r, primeiroTurno(uf))) : "–";
  const titulo = uf in UFS ? `<a href="#${uf}">${bandeira(bandeiraDoEstado(uf))}${nome}</a>` : nome;
  return `
    <tr>
      <th scope="row">${titulo}</th>
      <td>${pct(r.urnas)}</td>
      ${CANDIDATOS.map((c) => `<td>${pctDe(r, c)}</td>`).join("")}
      <td>${andou}</td>
    </tr>`;
};

export function renderizarTabela(elemento, resultado, primeiroTurno) {
  const linhas = Object.entries(ESCOPOS)
    .filter(([uf]) => uf !== "br")
    .sort(([, a], [, b]) => a.nome.localeCompare(b.nome, "pt-BR"));

  elemento.innerHTML = `
    <thead>
      <tr>
        <th scope="col">Estado</th>
        <th scope="col">Urnas</th>
        ${CANDIDATOS.map((c) => `<th scope="col">${c.nome}</th>`).join("")}
        <th scope="col">${CANDIDATOS[0].nome} vs 1º turno</th>
      </tr>
    </thead>
    <tbody>${linhas.map(linhaDaTabela(resultado, primeiroTurno)).join("")}</tbody>`;
}
