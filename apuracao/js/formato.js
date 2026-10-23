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

// Bandeira de um estado (só as 27 UFs; Brasil e exterior não têm).
export const bandeiraDoEstado = (uf) => (uf in UFS ? `bandeiras/${uf}.png` : null);

// A bandeira de um lugar, a partir do caminho que ele traz em `bandeira`; sem caminho, nada.
export const bandeira = (caminho, classe = "bandeira") =>
  caminho ? `<img class="${classe}" src="${caminho}" alt="" width="24" height="16" />` : "";

// "São Gonçalo do Gurguéia" vira "sao-goncalo-do-gurgueia", para escrever o lugar como rota.
export const slug = (texto) =>
  texto.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
