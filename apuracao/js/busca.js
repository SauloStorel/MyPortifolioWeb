// Busca de município com sugestões próprias: o datalist nativo despeja os 5.570
// de uma vez e não aceita estilo. Ignora acentos e caixa ("feijo" acha "Feijó").
import { bandeira, escapar } from "./formato.js";

const LIMITE = 8;
const MINIMO_DE_LETRAS = 2;

const normalizar = (texto) => texto.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();

export function criarBusca(formulario, cidades, aoEscolher) {
  const campo = formulario.querySelector("[role=combobox]");
  const lista = formulario.querySelector("[role=listbox]");
  const indice = [...cidades.values()].map((cidade) => ({ cidade, nome: normalizar(cidade.nome) }));
  let sugestoes = [];
  let ativa = 0;

  // Quem começa com o termo vem antes de quem só o contém; em cada grupo, as maiores cidades primeiro.
  function buscar(termo) {
    const procurado = normalizar(termo);
    if (procurado.length < MINIMO_DE_LETRAS) return null;

    const porPorte = (a, b) => b.cidade.porte - a.cidade.porte;
    const comecam = indice.filter((item) => item.nome.startsWith(procurado)).sort(porPorte);
    const contem = indice.filter((item) => !item.nome.startsWith(procurado) && item.nome.includes(procurado)).sort(porPorte);
    return [...comecam, ...contem].slice(0, LIMITE).map((item) => item.cidade);
  }

  const opcao = (cidade, i) => `
    <li role="option" id="sugestao-${i}" aria-selected="${i === ativa}" data-indice="${i}">
      ${bandeira(cidade.bandeira)}${escapar(cidade.nome)} <span>${escapar(cidade.regiao)}</span>
    </li>`;

  function mostrar(encontradas) {
    sugestoes = encontradas ?? [];
    ativa = 0;
    lista.innerHTML = sugestoes.length
      ? sugestoes.map(opcao).join("")
      : `<li class="sugestao-vazia">Nenhuma cidade com esse nome</li>`;
    lista.hidden = !encontradas;
    campo.setAttribute("aria-expanded", String(Boolean(encontradas)));
    marcarAtiva();
  }

  function marcarAtiva() {
    for (const item of lista.querySelectorAll("[role=option]")) {
      item.setAttribute("aria-selected", String(Number(item.dataset.indice) === ativa));
    }
    campo.setAttribute("aria-activedescendant", sugestoes.length ? `sugestao-${ativa}` : "");
  }

  function escolher(cidade) {
    if (!cidade) return;

    campo.value = "";
    mostrar(null);
    campo.blur();
    aoEscolher(cidade);
  }

  const mover = (passo) => {
    ativa = (ativa + passo + sugestoes.length) % sugestoes.length;
    marcarAtiva();
  };

  const TECLAS = {
    ArrowDown: () => mover(1),
    ArrowUp: () => mover(-1),
    Enter: () => escolher(sugestoes[ativa]),
    Escape: () => mostrar(null),
  };

  campo.addEventListener("input", () => mostrar(buscar(campo.value)));
  campo.addEventListener("keydown", (evento) => {
    const tecla = TECLAS[evento.key];
    if (!tecla || lista.hidden) return;

    evento.preventDefault();
    tecla();
  });
  campo.addEventListener("blur", () => mostrar(null));
  // pointerdown com preventDefault: o campo não perde o foco antes do clique contar.
  lista.addEventListener("pointerdown", (evento) => {
    evento.preventDefault();
    const item = evento.target.closest("[role=option]");
    if (item) escolher(sugestoes[Number(item.dataset.indice)]);
  });
  formulario.addEventListener("submit", (evento) => evento.preventDefault());
}
