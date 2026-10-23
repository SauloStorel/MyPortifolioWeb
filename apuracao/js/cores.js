import { FAIXAS, SEM_VOTOS } from "./config.js";
import { lider, percentual, temVotos } from "./resultado.js";

// Cor de quem lidera; a intensidade sobe com a folga (50–55, 55–60, 60–70, 70%+).
export function corDoLider(resultado) {
  const candidato = lider(resultado);
  if (!candidato) return SEM_VOTOS;

  const degrau = FAIXAS.filter((limite) => percentual(resultado, candidato) >= limite).length;
  return candidato.rampa[degrau];
}

// Pouca urna apurada fica translúcida; a cor só fica plena perto de 100%.
// Sem votos não há o que desbotar: o cinza fica inteiro e os contornos continuam visíveis.
export const forca = (resultado) => (temVotos(resultado) ? 0.3 + 0.7 * (resultado.urnas / 100) : 1);
