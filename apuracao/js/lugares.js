// Liga as bases: malhas (código IBGE), arquivos do TSE (código TSE), 1º turno e
// coordenadas das cidades do exterior.
import { feature, mesh } from "https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/+esm";
import { UFS } from "./config.js";
import { doPrimeiroTurno } from "./resultado.js";

const MINUSCULAS = new Set(["da", "das", "de", "do", "dos", "e"]);

// O TSE escreve os nomes em caixa alta: "SÃO JOÃO DEL REI" vira "São João del Rei".
const capitalizar = (nome) =>
  nome.toLowerCase().replace(/[^\s'-]+/g, (palavra, posicao) =>
    posicao && MINUSCULAS.has(palavra) ? palavra : palavra[0].toUpperCase() + palavra.slice(1));

// Fronteiras internas da topologia: cada linha entre dois vizinhos aparece uma vez só.
const fronteiras = (topologia, objeto) => mesh(topologia, objeto, (a, b) => a !== b);

// Uma cidade do Brasil é achada pelo código do IBGE; uma do exterior, pelo código do TSE.
function cidadeDoBrasil(uf, [cd, cdi, nome]) {
  const nomeBonito = capitalizar(nome);
  return { id: cdi, uf, chave: uf + cd, nome: nomeBonito, regiao: UFS[uf].nome, rotulo: `${nomeBonito} (${uf.toUpperCase()})`, rota: `${uf}/${cdi}` };
}

function cidadeDoExterior([cd, , nome], [longitude, latitude, pais]) {
  const nomeBonito = capitalizar(nome);
  return {
    id: cd,
    uf: "zz",
    chave: `zz${cd}`,
    nome: nomeBonito,
    regiao: pais,
    rotulo: `${nomeBonito}, ${pais}`,
    rota: `exterior/${cd}`,
    coordenadas: [longitude, latitude],
  };
}

// Cada lugar do mapa é { chave, nome, rota, primeiroTurno } mais a forma (`feature`)
// ou, no exterior, o ponto (`coordenadas`). `chave` acha o resultado na fonte e
// `rota` é o que vai na URL.
export function criarLugares({ topologiaDoBrasil, topologiaDoMundo, municipios, exterior, primeiroTurno, carregarMalha }) {
  const doPrimeiro = (chave) => doPrimeiroTurno(primeiroTurno.mun[chave] ?? primeiroTurno.uf[chave]);
  // Votos válidos no 1º turno dão o porte da cidade, para a busca mostrar as maiores primeiro.
  const completar = (cidade) => ({ ...cidade, porte: primeiroTurno.mun[cidade.chave]?.[2] ?? 0, primeiroTurno: doPrimeiro(cidade.chave) });

  const { zz: listaDoExterior, ...listasDoBrasil } = municipios;
  const cidadesDoExterior = listaDoExterior.map((linha) => completar(cidadeDoExterior(linha, exterior[linha[0]])));
  const cidades = new Map([
    ...Object.entries(listasDoBrasil).flatMap(([uf, lista]) => lista.map((linha) => completar(cidadeDoBrasil(uf, linha)))),
    ...cidadesDoExterior,
  ].map((cidade) => [cidade.id, cidade]));

  const estados = topologiaDoBrasil.objects.estados;
  const brasil = {
    areas: feature(topologiaDoBrasil, estados).features.map((forma) => ({
      chave: forma.id,
      nome: UFS[forma.id].nome,
      rota: forma.id,
      feature: forma,
      primeiroTurno: doPrimeiro(forma.id),
    })),
    bordas: fronteiras(topologiaDoBrasil, estados),
  };

  const paises = topologiaDoMundo.objects.paises;
  const mundo = { formas: feature(topologiaDoMundo, paises).features, bordas: fronteiras(topologiaDoMundo, paises) };

  const malhas = new Map();
  async function estado(uf) {
    malhas.set(uf, malhas.get(uf) ?? (await carregarMalha(uf)));
    const topologia = malhas.get(uf);
    const objeto = topologia.objects[uf];
    return {
      areas: feature(topologia, objeto).features
        .map((forma) => ({ forma, cidade: cidades.get(forma.id) }))
        .filter(({ cidade }) => cidade)
        .map(({ forma, cidade }) => ({ ...cidade, feature: forma })),
      bordas: fronteiras(topologia, objeto),
    };
  }

  return { cidades, brasil, mundo, exterior: cidadesDoExterior, estado, primeiroTurnoDoEstado: doPrimeiro };
}
