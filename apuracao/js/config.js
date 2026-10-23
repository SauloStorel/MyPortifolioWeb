// Tudo o que identifica a eleição mora aqui; o resto do código só consome.

export const TSE = {
  base: "https://resultados.tse.jus.br/oficial/ele2026/6258/dados",
  eleicao: "006258",
  cargo: "c0001",
};

// Ensaio (?ensaio): os arquivos oficiais do 1º turno, no mesmo formato do 2º e já com
// todos os votos, para testar a leitura do TSE de ponta a ponta antes do domingo.
export const TSE_ENSAIO = { ...TSE, base: "https://resultados.tse.jus.br/oficial/ele2026/6257/dados", eleicao: "006257" };

export const INTERVALO = { tse: 30_000, simulacao: 2_000 };

// Ordem de exibição: Lula à esquerda, Flávio à direita (também o sentido das setas da virada).
// `curto` é o nome para espaços apertados, como a legenda.
// `rampa` vai do mais apertado (50–55%) ao mais folgado (70%+), sempre legível com texto claro.
// `foto` é a foto oficial da candidatura, publicada pelo TSE.
export const CANDIDATOS = [
  {
    numero: "13",
    nome: "Lula",
    curto: "Lula",
    partido: "PT",
    cor: "#f2555a",
    foto: "fotos/13.jpeg",
    rampa: ["#4f1a1e", "#7d2227", "#a82a30", "#c8353b"],
  },
  {
    numero: "22",
    nome: "Flávio Bolsonaro",
    curto: "Flávio",
    partido: "PL",
    cor: "#3d8bfd",
    foto: "fotos/22.jpeg",
    rampa: ["#14325f", "#1c4688", "#245bb0", "#2c69cc"],
  },
];

// Percentual do líder a partir do qual a cor sobe um degrau na rampa.
export const FAIXAS = [55, 60, 70];

export const SEM_VOTOS = "#1d1d22";

// `col`/`lin` posicionam o estado no mosaico, numa grade que imita o mapa.
export const UFS = {
  rr: { nome: "Roraima", ibge: "14", col: 1, lin: 0 },
  ap: { nome: "Amapá", ibge: "16", col: 2, lin: 0 },
  am: { nome: "Amazonas", ibge: "13", col: 1, lin: 1 },
  pa: { nome: "Pará", ibge: "15", col: 2, lin: 1 },
  ma: { nome: "Maranhão", ibge: "21", col: 3, lin: 1 },
  ce: { nome: "Ceará", ibge: "23", col: 4, lin: 1 },
  rn: { nome: "Rio Grande do Norte", ibge: "24", col: 5, lin: 1 },
  ac: { nome: "Acre", ibge: "12", col: 0, lin: 2 },
  ro: { nome: "Rondônia", ibge: "11", col: 1, lin: 2 },
  to: { nome: "Tocantins", ibge: "17", col: 2, lin: 2 },
  pi: { nome: "Piauí", ibge: "22", col: 3, lin: 2 },
  pe: { nome: "Pernambuco", ibge: "26", col: 4, lin: 2 },
  pb: { nome: "Paraíba", ibge: "25", col: 5, lin: 2 },
  mt: { nome: "Mato Grosso", ibge: "51", col: 1, lin: 3 },
  go: { nome: "Goiás", ibge: "52", col: 2, lin: 3 },
  ba: { nome: "Bahia", ibge: "29", col: 3, lin: 3 },
  se: { nome: "Sergipe", ibge: "28", col: 4, lin: 3 },
  al: { nome: "Alagoas", ibge: "27", col: 5, lin: 3 },
  ms: { nome: "Mato Grosso do Sul", ibge: "50", col: 1, lin: 4 },
  df: { nome: "Distrito Federal", ibge: "53", col: 2, lin: 4 },
  mg: { nome: "Minas Gerais", ibge: "31", col: 3, lin: 4 },
  es: { nome: "Espírito Santo", ibge: "32", col: 4, lin: 4 },
  pr: { nome: "Paraná", ibge: "41", col: 1, lin: 5 },
  sp: { nome: "São Paulo", ibge: "35", col: 2, lin: 5 },
  rj: { nome: "Rio de Janeiro", ibge: "33", col: 3, lin: 5 },
  sc: { nome: "Santa Catarina", ibge: "42", col: 1, lin: 6 },
  rs: { nome: "Rio Grande do Sul", ibge: "43", col: 1, lin: 7 },
};

export const ESCOPOS = { br: { nome: "Brasil" }, zz: { nome: "Exterior" }, ...UFS };

// Atalhos da vista do exterior: [[oeste, sul], [leste, norte]] em graus.
export const REGIOES_DO_EXTERIOR = {
  americas: { nome: "Américas", caixa: [[-124, -42], [-35, 50]] },
  europa: { nome: "Europa", caixa: [[-10, 36], [32, 61]] },
  africa: { nome: "África", caixa: [[-18, -35], [48, 37]] },
  asia: { nome: "Ásia e Oceania", caixa: [[34, -42], [176, 42]] },
};
