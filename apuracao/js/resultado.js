// Um resultado é { urnas, eleitoresFaltando, votos: { "13": n, "22": n } }, e no 1º turno
// também `validos` (os votos válidos de todos os candidatos) e `turno: 1`.
import { CANDIDATOS } from "./config.js";

const [A, B] = CANDIDATOS;

export const VAZIO = { urnas: 0, eleitoresFaltando: 0, votos: {} };

export const votos = (resultado, candidato) => resultado.votos[candidato.numero] ?? 0;

const dosDois = (resultado) => votos(resultado, A) + votos(resultado, B);

// Percentual dos votos válidos. No 2º turno só existem os dois, então é a soma deles;
// no 1º turno os outros candidatos também contam.
export const percentual = (resultado, candidato) =>
  (100 * votos(resultado, candidato)) / (resultado.validos ?? dosDois(resultado)) || 0;

// O quanto os outros candidatos somaram (só não é zero no 1º turno).
export const outros = (resultado) => 100 - percentual(resultado, A) - percentual(resultado, B);

export const temVotos = (resultado) => dosDois(resultado) > 0;

export const diferenca = (resultado) => Math.abs(votos(resultado, A) - votos(resultado, B));

// Empate (inclusive 0 × 0) não tem líder.
export function lider(resultado) {
  const saldo = votos(resultado, A) - votos(resultado, B);
  return saldo === 0 ? null : saldo > 0 ? A : B;
}

// Garantido quando nem todos os eleitores que faltam, votando no outro, viram o placar.
export const garantido = (resultado) =>
  temVotos(resultado) && diferenca(resultado) > resultado.eleitoresFaltando;

// Pontos percentuais que o primeiro candidato ganhou (positivo) ou perdeu desde o 1º turno.
// Compara só a divisão entre os dois, para os votos dos outros candidatos do 1º turno não
// parecerem uma virada.
const parcela = (resultado) => (100 * votos(resultado, A)) / dosDois(resultado) || 0;
export const virada = (agora, antes) => parcela(agora) - parcela(antes);

export const doPrimeiroTurno = ([votosA, votosB, validos]) => ({
  turno: 1,
  urnas: 100,
  eleitoresFaltando: 0,
  validos,
  votos: { [A.numero]: votosA, [B.numero]: votosB },
});
