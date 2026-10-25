// Fontes de resultado. As duas guardam os resultados num Map com a chave do
// arquivo do TSE ("br", "mg", "mg40002") e expõem a mesma interface:
// `atualizar(escopo)`, `resultados` e `atualizadoEm`.
import { CANDIDATOS, TSE } from "./config.js";
import { VAZIO, doPrimeiroTurno } from "./resultado.js";

const numero = (texto) => Number(texto.replace(",", "."));

// Um pedido pendurado prenderia a fila de atualizações para sempre; desistir dele
// conta como falha e a próxima leitura tenta de novo.
const TEMPO_LIMITE = 15_000;

async function buscar(url) {
  // no-cache revalida pelo ETag: quando nada mudou, o TSE responde 304 sem corpo.
  const resposta = await fetch(url, { cache: "no-cache", signal: AbortSignal.timeout(TEMPO_LIMITE) });
  if (!resposta.ok) throw new Error(`TSE respondeu ${resposta.status} em ${url}`);
  return resposta.json();
}

// Roda `tarefa` em todos os itens, alguns por vez, e devolve quantos falharam.
// O TSE serve por HTTP/2: dezenas de pedidos simultâneos dividem a mesma conexão.
async function emParalelo(itens, tarefa, simultaneas = 32) {
  const fila = [...itens];
  let falhas = 0;
  const trabalhador = async () => {
    while (fila.length) await tarefa(fila.shift()).catch(() => falhas++);
  };
  await Promise.all(Array.from({ length: simultaneas }, trabalhador));
  return falhas;
}

const progresso = (item) => ({
  urnas: numero(item.s.pst),
  eleitoresFaltando: Number(item.e.esnt),
});

function lerResultado(json) {
  const candidatos = json.carg[0].agr.flatMap((a) => a.par).flatMap((p) => p.cand);
  return {
    ...progresso(json),
    votos: Object.fromEntries(candidatos.map((c) => [c.n, Number(c.vap)])),
  };
}

export class FonteTSE {
  resultados = new Map();
  atualizadoEm = null;
  #secoes = new Map();
  #tse;

  constructor(tse = TSE) {
    this.#tse = tse;
  }

  // O arquivo de abrangência diz quantas seções cada lugar já totalizou;
  // só baixamos o resultado de quem mudou desde a última leitura.
  // `aoAvancar(feitos, total)` é chamado a cada arquivo lido, para a tela pintar aos poucos.
  async atualizar(escopo, aoAvancar = () => {}) {
    const { base, eleicao } = this.#tse;
    const abrangencia = await buscar(`${base}/${escopo}/${escopo}-e${eleicao}-ab.json`);
    this.atualizadoEm = abrangencia.hg.slice(0, 5);

    const mudaram = abrangencia.abr
      .map((item) => ({ item, chave: item.tpabr === "mun" ? escopo + item.cdabr : item.cdabr }))
      .filter(({ item, chave }) => this.#secoes.get(chave) !== item.s.st);

    let feitos = 0;
    const falhas = await emParalelo(mudaram, async (lugar) => {
      await this.#ler(lugar);
      aoAvancar(++feitos, mudaram.length);
    });
    if (falhas) throw new Error(`${falhas} arquivos do TSE não responderam`);
  }

  async #ler({ item, chave }) {
    const semSecoes = item.s.st === "0";
    const resultado = semSecoes
      ? { ...VAZIO, ...progresso(item) }
      : lerResultado(await buscar(this.#arquivo(chave)));

    this.resultados.set(chave, resultado);
    this.#secoes.set(chave, item.s.st);
  }

  #arquivo(chave) {
    const { base, cargo, eleicao } = this.#tse;
    return `${base}/${chave.slice(0, 2)}/${chave}-${cargo}-e${eleicao}-u.json`;
  }
}

// ---------- Simulação ----------

const DURACAO_DA_NOITE = 4 * 60_000;

// Número estável entre 0 e 1 para cada texto (FNV-1a), para a simulação não sortear de novo a cada leitura.
function semente(texto) {
  let hash = 2166136261;
  for (const letra of texto) hash = Math.imul(hash ^ letra.charCodeAt(0), 16777619);
  return (hash >>> 0) / 2 ** 32;
}

const limitar = (n) => Math.min(1, Math.max(0, n));

function somar(partes) {
  return partes.reduce(
    (total, parte) => ({
      eleitorado: total.eleitorado + parte.eleitorado,
      eleitoresFaltando: total.eleitoresFaltando + parte.eleitoresFaltando,
      a: total.a + parte.a,
      b: total.b + parte.b,
    }),
    { eleitorado: 0, eleitoresFaltando: 0, a: 0, b: 0 },
  );
}

// Reapresenta o 1º turno como se fosse a noite do 2º: cada lugar recebe uma
// pequena virada e é apurado num ritmo próprio. Nada disso é resultado real.
export class FonteSimulada {
  resultados = new Map();
  atualizadoEm = null;
  #inicio = performance.now();

  constructor(primeiroTurno, municipios) {
    this.primeiroTurno = primeiroTurno;
    this.municipios = municipios;
  }

  async atualizar() {
    const agora = limitar((performance.now() - this.#inicio) / DURACAO_DA_NOITE);
    this.atualizadoEm = new Date().toTimeString().slice(0, 5);

    // O exterior entra como mais uma "UF" (zz), com as cidades no lugar dos municípios.
    const estados = Object.entries(this.municipios).map(([uf, lista]) => {
      const cidades = lista.map(([cd]) => this.#guardar(uf + cd, this.#simular(this.primeiroTurno.mun[uf + cd], agora, uf, cd)));
      return this.#guardar(uf, somar(cidades));
    });
    this.#guardar("br", somar(estados));
  }

  #simular([a, b, validos], agora, uf, codigo) {
    const atraso = 0.3 * semente(uf) + 0.2 * semente(codigo);
    const apurado = limitar((agora - atraso) / 0.5);
    // Uma tendência por estado mais um desvio por município, para a virada aparecer nos dois níveis.
    const virada = 0.1 * (semente(`v${uf}`) - 0.5) + 0.08 * (semente(`v${codigo}`) - 0.5);
    return {
      eleitorado: validos,
      eleitoresFaltando: Math.round(validos * (1 - apurado)),
      a: Math.round(a * (1 + virada) * apurado),
      b: Math.round(b * (1 - virada) * apurado),
    };
  }

  #guardar(chave, parte) {
    const [a, b] = CANDIDATOS;
    this.resultados.set(chave, {
      // Cidade sem nenhum voto válido no 1º turno (0 de 0) conta como apurada.
      urnas: 100 * (1 - (parte.eleitoresFaltando / parte.eleitorado || 0)),
      eleitoresFaltando: parte.eleitoresFaltando,
      votos: { [a.numero]: parte.a, [b.numero]: parte.b },
    });
    return parte;
  }
}

// ---------- 1º turno ----------

// Resultado final do 1º turno, já guardado no site: nada a buscar nem a atualizar.
export class FontePrimeiroTurno {
  atualizadoEm = "04/10";

  constructor(primeiroTurno) {
    this.resultados = new Map(
      Object.entries({ ...primeiroTurno.uf, ...primeiroTurno.mun }).map(([chave, linha]) => [chave, doPrimeiroTurno(linha)]),
    );
  }

  async atualizar() {}
}
