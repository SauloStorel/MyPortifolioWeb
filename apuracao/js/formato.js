import { UFS } from "./config.js";
import { percentual, temVotos } from "./resultado.js";

const inteiroBR = new Intl.NumberFormat("pt-BR");
const decimalBR = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export const inteiro = (n) => inteiroBR.format(n);
export const pct = (n) => `${decimalBR.format(n)}%`;
export const pp = (n) => `${n > 0 ? "+" : ""}${decimalBR.format(n)} p.p.`;

// Percentual de um candidato, ou um traço enquanto não há voto apurado.
export const pctDe = (resultado, candidato) => (temVotos(resultado) ? pct(percentual(resultado, candidato)) : "–");

const ENTIDADES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };
export const escapar = (texto) => String(texto).replace(/[&<>"]/g, (c) => ENTIDADES[c]);

// Bandeira do estado (só para as 27 UFs; Brasil e exterior não levam).
export const bandeira = (uf, classe = "bandeira") =>
  uf in UFS ? `<img class="${classe}" src="bandeiras/${uf}.png" alt="" width="24" height="16" />` : "";
