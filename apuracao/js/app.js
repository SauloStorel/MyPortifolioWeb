import { CANDIDATOS, ESCOPOS, INTERVALO, REGIOES_DO_EXTERIOR, TSE_ENSAIO, UFS } from "./config.js";
import { criarBusca } from "./busca.js";
import { renderizarMosaico, renderizarTabela } from "./estados.js";
import { FontePrimeiroTurno, FonteSimulada, FonteTSE } from "./fontes.js";
import { bandeira, escapar, pct, pctDe, pp, slug } from "./formato.js";
import { criarLugares } from "./lugares.js";
import { NOMES_DOS_MODOS, criarMapa } from "./mapa.js";
import { Historico, MEMORIA, NAVEGADOR, renderizarNoite } from "./noite.js";
import { renderizarDestaques } from "./destaques.js";
import { renderizarPlacar } from "./placar.js";
import { VAZIO, temVotos, virada } from "./resultado.js";

const $ = (seletor) => document.querySelector(seletor);
const carregar = (caminho) => fetch(caminho).then((resposta) => resposta.json());

const [topologiaDoBrasil, topologiaDoMundo, municipios, primeiroTurno, exterior] = await Promise.all([
  carregar("malhas/brasil.json"),
  carregar("malhas/mundo.json"),
  carregar("dados/municipios.json"),
  carregar("dados/1turno.json"),
  carregar("dados/exterior.json"),
]);

// ---------- Fonte dos dados ----------

const FONTES = {
  tse: () => ({ fonte: new FonteTSE(), historico: new Historico("tse", NAVEGADOR), intervalo: INTERVALO.tse }),
  ensaio: () => ({ fonte: new FonteTSE(TSE_ENSAIO), historico: new Historico("ensaio", MEMORIA), intervalo: INTERVALO.tse }),
  simular: () => ({
    fonte: new FonteSimulada(primeiroTurno, municipios),
    historico: new Historico("simulacao", MEMORIA),
    intervalo: INTERVALO.simulacao,
  }),
};

// ?simular reproduz a noite com dados inventados; ?ensaio lê os arquivos reais do 1º turno.
const parametros = new URLSearchParams(location.search);
const modoDaFonte = ["simular", "ensaio"].find((modo) => parametros.has(modo)) ?? "tse";
const { fonte, historico, intervalo } = FONTES[modoDaFonte]();
$("#aviso-simulacao").hidden = modoDaFonte !== "simular";

// O 2º turno vem ao vivo (ou da simulação); o 1º turno já está guardado no site.
const FONTES_DO_TURNO = { 1: new FontePrimeiroTurno(primeiroTurno), 2: fonte };
const resultado = (chave) => FONTES_DO_TURNO[estado.turno].resultados.get(chave) ?? VAZIO;

// ---------- Lugares ----------

const lugares = criarLugares({
  topologiaDoBrasil,
  topologiaDoMundo,
  municipios,
  exterior,
  primeiroTurno,
  carregarMalha: (uf) => carregar(`malhas/${uf}.json`),
});
const { cidades } = lugares;

// ---------- Estado da página ----------

const estado = { escopo: "br", cidade: null, modo: "lider", turno: 2, falha: false };

// Rotas: "#brasil" (ou nada) é o país, "#mg" abre um estado, "#mg/3106200" destaca
// um município, "#exterior" mostra o mundo e "#exterior/29254" destaca uma cidade.
// O Brasil não usa "#", que faria o navegador pular para o topo da página.
// Outras âncoras (como "#top") não são rotas e devolvem null.
const ESCOPO_DA_ROTA = new Map([
  ["", "br"],
  ["brasil", "br"],
  ["exterior", "zz"],
  ...Object.keys(UFS).map((uf) => [uf, uf]),
]);

function lerRota() {
  const [inicio, id] = location.hash.slice(1).split("/");
  const escopo = ESCOPO_DA_ROTA.get(inicio);
  return escopo ? { escopo, cidade: cidades.get(id) ?? null } : null;
}

// O lugar em foco no placar: a cidade escolhida, o estado aberto, o Brasil ou o exterior.
const emFoco = () =>
  estado.cidade
    ? { nome: estado.cidade.rotulo, chave: estado.cidade.chave, uf: estado.cidade.uf }
    : { nome: ESCOPOS[estado.escopo].nome, chave: estado.escopo, uf: estado.escopo };

// ---------- Dica ao passar o mouse ----------

const dica = $("#dica");

// Só para mouse: no toque, tocar escolhe o lugar e o resultado aparece no placar.
function mostrarDica(area, evento) {
  if (evento.pointerType !== "mouse") return;

  const r = resultado(area.chave);
  const linhas = CANDIDATOS.map((c) => `
    <p><i class="amostra" style="background:${c.cor}"></i>${c.nome}<b>${pctDe(r, c)}</b></p>`).join("");
  const andou = temVotos(r) ? `<small>${CANDIDATOS[0].nome} vs 1º turno: ${pp(virada(r, area.primeiroTurno))}</small>` : "";

  dica.innerHTML = `<strong>${bandeira(area.uf ?? area.chave)}${escapar(area.rotulo ?? area.nome)}</strong><small>${pct(r.urnas)} das urnas apuradas</small>${linhas}${andou}`;
  dica.hidden = false;
  const x = Math.min(evento.clientX + 16, innerWidth - dica.offsetWidth - 8);
  const y = Math.min(evento.clientY + 16, innerHeight - dica.offsetHeight - 8);
  dica.style.transform = `translate(${x}px, ${y}px)`;
}

const esconderDica = () => (dica.hidden = true);

// ---------- Mapa ----------

const mapa = criarMapa($("#mapa"), $("#legenda"), lugares, {
  aoPassar: mostrarDica,
  aoSair: esconderDica,
  aoEscolher: (area) => (location.hash = area.rota),
  aoMoverCamera: () => mirar(),
});

// Cada escopo diz de onde parte a trilha, como o mapa se chama e como abri-lo.
const BRASIL = { nome: "Brasil", rota: "brasil" };
const EXTERIOR = { nome: "Exterior", rota: "exterior" };

// `lugares()` são as partes do escopo, usadas nos destaques: estados, municípios ou cidades.
const ESCOPOS_DO_MAPA = {
  br: {
    raiz: BRASIL,
    descricao: "Mapa do Brasil por estado",
    abrir: () => mapa.voltarAoBrasil(),
    lugares: () => lugares.brasil.areas,
  },
  zz: {
    raiz: EXTERIOR,
    descricao: "Mapa das cidades onde se vota no exterior",
    abrir: () => mapa.abrirExterior(lugares.exterior),
    lugares: () => lugares.exterior,
  },
};

const escopoDoMapa = (escopo) => ESCOPOS_DO_MAPA[escopo] ?? {
  raiz: BRASIL,
  passo: { nome: UFS[escopo].nome, rota: escopo },
  descricao: `Mapa de ${UFS[escopo].nome} por município`,
  abrir: async () => mapa.abrirEstado(escopo, await lugares.estado(escopo)),
  lugares: () => [...cidades.values()].filter((cidade) => cidade.uf === escopo),
};

const rotaDoEscopo = (escopo) => {
  const { raiz, passo } = escopoDoMapa(escopo);
  return (passo ?? raiz).rota;
};

async function abrirEscopo(escopo) {
  const { descricao, abrir } = escopoDoMapa(escopo);
  $("#mapa").setAttribute("aria-label", descricao);
  await abrir();
}

function renderizarTrilha() {
  const { raiz, passo } = escopoDoMapa(estado.escopo);
  const passos = [raiz, ...(passo ? [passo] : []), ...(estado.cidade ? [estado.cidade] : [])];
  $("#trilha").innerHTML = passos.map((p, i) =>
    i === passos.length - 1
      ? `<span aria-current="page">${escapar(p.nome)}</span>`
      : `<a href="#${p.rota}">${escapar(p.nome)}</a>`).join(`<span aria-hidden="true">/</span>`);

  for (const aba of document.querySelectorAll("#abas a")) {
    aba.toggleAttribute("aria-current", aba.hash === `#${raiz.rota}`);
  }
  $("#regioes").hidden = raiz !== EXTERIOR;
  renderizarVoltar();
}

// "← brasil" no canto do mapa, sempre que um estado ou o exterior está aberto.
function renderizarVoltar() {
  const { escopo } = estado;
  $("#voltar").hidden = escopo === "br";
  $("#voltar").setAttribute("aria-label", `Voltar ao Brasil (agora em ${ESCOPOS[escopo].nome})`);
}

// ---------- Mira (telas de toque) ----------

// Como no G1: dentro de um estado ou no exterior, arrastar o mapa escolhe o lugar
// que fica sob a mira, no centro. O endereço acompanha sem encher o histórico.
const telaDeToque = matchMedia("(hover: none)");

let trocandoDeEstado = false;

function mirar() {
  if (!telaDeToque.matches || estado.escopo === "br" || trocandoDeEstado) return;

  const caixa = $("#mapa").getBoundingClientRect();
  const area = mapa.areaEm(caixa.left + caixa.width / 2, caixa.top + caixa.height / 2);
  const cruzouADivisa = estado.escopo in UFS && area?.chave in UFS && area.chave !== estado.escopo;
  if (cruzouADivisa) {
    trocandoDeEstado = true;  // já aqui: os próximos quadros do arraste não enfileiram a mesma troca
    return enfileirar(() => trocarDeEstado(area.chave));
  }

  const cidade = cidades.get(area?.id) ?? null;
  if (cidade === estado.cidade) return;

  estado.cidade = cidade;
  history.replaceState(null, "", `#${cidade?.rota ?? rotaDoEscopo(estado.escopo)}`);
  renderizarFoco();
}

// A mira entrou num estado vizinho: ele passa a ser o estado aberto, com os municípios
// e os dados dele, e a mira escolhe de novo o que está sob o centro.
async function trocarDeEstado(uf) {
  Object.assign(estado, { escopo: uf, cidade: null });
  history.replaceState(null, "", `#${uf}`);
  renderizarFoco();
  mapa.trocarEstado(uf, await lugares.estado(uf));
  await atualizar();
  trocandoDeEstado = false;
  mirar();
}

// O que depende só do lugar em foco: placar, contorno no mapa, trilha e etiqueta da mira.
function renderizarFoco() {
  const foco = emFoco();
  const { cidade } = estado;
  renderizarPlacar($("#placar"), foco, resultado(foco.chave));
  renderizarDestaques($("#destaques"), escopoDoMapa(estado.escopo).lugares(), resultado, estado.cidade?.chave);
  mapa.destacar(cidade?.chave);
  renderizarTrilha();
  // O lugar sob a mira escrito como rota: /pi/floriano, /exterior/toquio.
  $("#mira-rotulo").innerHTML = cidade ? `<span>/${rotaDoEscopo(cidade.uf)}/</span>${slug(cidade.nome)}` : "";
}

// ---------- Situação da apuração ----------

const FASES = [
  {
    quando: () => estado.turno === 1,
    texto: () => "Resultado oficial do 1º turno, de 4 de outubro. Flávio Bolsonaro e Lula foram ao 2º turno.",
  },
  {
    quando: () => estado.falha,
    texto: () => `Sem resposta do TSE agora. Mostrando os dados de ${fonte.atualizadoEm ?? "antes"}; tentando de novo em instantes.`,
  },
  {
    quando: (brasil) => brasil.urnas === 0,
    texto: () => "A apuração começa depois das 17h (horário de Brasília) de domingo, 25 de outubro. Esta página se atualiza sozinha.",
  },
  {
    quando: (brasil) => brasil.urnas >= 100,
    texto: () => `Apuração encerrada. Última atualização às ${fonte.atualizadoEm}.`,
  },
  {
    quando: () => true,
    texto: () => `<span class="ao-vivo">Ao vivo</span> Última atualização às ${fonte.atualizadoEm}. A página se atualiza sozinha.`,
  },
];

function renderizar() {
  $("#status").innerHTML = FASES.find((fase) => fase.quando(resultado("br"))).texto();
  mapa.pintar(resultado, estado.modo);
  renderizarFoco();
  renderizarMosaico($("#mosaico"), resultado);
  renderizarTabela($("#tabela"), resultado, lugares.primeiroTurnoDoEstado);
  renderizarNoite($("#noite"), historico.pontos);
}

// ---------- Atualização ----------

// Enquanto muitos arquivos chegam (abrir um estado já apurado), o mapa é repintado
// algumas vezes por segundo e o aviso mostra quantos faltam.
const INTERVALO_DE_PINTURA = 300;
let ultimaPintura = 0;

function mostrarAvanco(feitos, total) {
  if (total < 50) return;

  $("#carregando").hidden = feitos === total;
  $("#carregando").textContent = `Carregando os municípios… ${feitos} de ${total}`;
  if (performance.now() - ultimaPintura < INTERVALO_DE_PINTURA) return;

  ultimaPintura = performance.now();
  mapa.pintar(resultado, estado.modo);
}

// Avisos de marco: "São Paulo chegou a 50% das urnas apuradas". A cada leitura, no máximo
// um aviso, do estado com mais eleitores entre os que cruzaram um marco.
const MARCOS = [25, 50, 75, 90, 100];
const marcoDe = (urnas) => MARCOS.filter((marco) => urnas >= marco).at(-1) ?? 0;

function avisarMarcos(antes) {
  const cruzaram = Object.keys(UFS)
    .filter((uf) => antes.has(uf) && marcoDe(fonte.resultados.get(uf)?.urnas ?? 0) > marcoDe(antes.get(uf)))
    .sort((a, b) => primeiroTurno.uf[b][2] - primeiroTurno.uf[a][2]);
  const [maior] = cruzaram;
  if (!maior) return;

  const marco = marcoDe(fonte.resultados.get(maior).urnas);
  showToast(`${UFS[maior].nome} chegou a ${marco}% das urnas apuradas`);
}

async function atualizar() {
  const urnasAntes = new Map(Object.keys(UFS).flatMap((uf) => (fonte.resultados.has(uf) ? [[uf, fonte.resultados.get(uf).urnas]] : [])));
  try {
    for (const escopo of new Set(["br", estado.escopo])) await fonte.atualizar(escopo, mostrarAvanco);
    estado.falha = false;
  } catch {
    estado.falha = true;
  }
  historico.registrar(fonte.resultados.get("br") ?? VAZIO);
  avisarMarcos(urnasAntes);
  renderizar();
}

// Uma leitura por vez: navegar no meio de uma atualização entra na fila em vez de sobrepor.
let fila = Promise.resolve();
const enfileirar = (tarefa) => (fila = fila.then(tarefa));

async function seguirRota() {
  const rota = lerRota();
  if (!rota) return;

  const mudouDeEscopo = rota.escopo !== estado.escopo;
  Object.assign(estado, rota);
  esconderDica();
  renderizarTrilha();

  if (!mudouDeEscopo) return renderizar();

  for (const botao of $("#regioes").children) botao.setAttribute("aria-pressed", "false");

  // Primeiro a câmera chega, depois os resultados do estado: buscar e pintar
  // durante o zoom faria a animação engasgar.
  mostrarMapa();
  await abrirEscopo(estado.escopo);
  await atualizar();
}

// Quem escolhe um estado pelo mosaico ou pela tabela é levado até o mapa.
function mostrarMapa() {
  const caixa = $("#mapa").getBoundingClientRect();
  const foraDaTela = caixa.bottom < 0 || caixa.top > innerHeight;
  if (foraDaTela) $(".palco").scrollIntoView({ behavior: "smooth" });
}

function agendar() {
  setTimeout(async () => {
    if (!document.hidden) await enfileirar(atualizar);
    agendar();
  }, intervalo);
}

// ---------- Controles ----------

$("#modos").innerHTML = Object.entries(NOMES_DOS_MODOS).map(([modo, nome]) => `
  <label><input type="radio" name="modo" value="${modo}" ${modo === estado.modo ? "checked" : ""} /> ${nome}</label>`).join("");
$("#modos").addEventListener("change", (evento) => {
  estado.modo = evento.target.value;
  mapa.pintar(resultado, estado.modo);
});

criarBusca($("#busca"), cidades, (cidade) => (location.hash = cidade.rota));

// Atalhos de região: só aparecem no exterior e se desmarcam quando a vista muda.
$("#regioes").innerHTML = Object.entries(REGIOES_DO_EXTERIOR).map(([chave, { nome }]) =>
  `<button type="button" data-regiao="${chave}" aria-pressed="false">${nome}</button>`).join("");
$("#regioes").addEventListener("click", (evento) => {
  const regiao = REGIOES_DO_EXTERIOR[evento.target.dataset.regiao];
  if (!regiao) return;

  for (const botao of $("#regioes").children) botao.setAttribute("aria-pressed", String(botao === evento.target));
  mapa.aproximarCaixa(regiao.caixa);
});

// Turno: o 1º é só consulta (sem virada, que compara justamente os dois turnos).
$("#turnos").addEventListener("click", (evento) => {
  const turno = Number(evento.target.dataset.turno);
  if (!turno) return;

  estado.turno = turno;
  for (const botao of $("#turnos").children) botao.setAttribute("aria-pressed", String(botao === evento.target));
  const virada = $("#modos input[value=virada]");
  virada.disabled = turno === 1;
  if (turno === 1 && estado.modo === "virada") $("#modos input[value=lider]").click();
  renderizar();
});

// Compartilhar o lugar aberto: o endereço já guarda o estado ou a cidade. No celular abre a
// folha de compartilhamento do sistema; no computador, copia o link.
async function compartilhar() {
  const dados = { title: document.title, text: `Apuração do 2º turno: ${emFoco().nome}`, url: location.href };
  if (navigator.share) return navigator.share(dados).catch(() => {});

  await navigator.clipboard.writeText(location.href);
  showToast("Link copiado");
}

$("#placar").addEventListener("click", (evento) => evento.target.closest(".compartilhar") && compartilhar());

const ZOOM = { aproximar: () => mapa.aproximar(1.6), afastar: () => mapa.aproximar(1 / 1.6), reenquadrar: () => mapa.reenquadrar() };
$(".zoom").addEventListener("click", (evento) => ZOOM[evento.target.dataset.zoom]?.());

addEventListener("hashchange", () => enfileirar(seguirRota));
addEventListener("resize", () => renderizarNoite($("#noite"), historico.pontos));
document.addEventListener("visibilitychange", () => document.hidden || enfileirar(atualizar));

// ---------- Início ----------

renderizarTrilha();
await enfileirar(atualizar);
await enfileirar(seguirRota);
agendar();
