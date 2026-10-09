# Design

Índice suíço falando Rails, em grafite. A linguagem do framework entra como conteúdo verdadeiro (um model com dados ao vivo, o Gemfile, o ciclo de um request, a action de cada seção), nunca como fantasia de terminal.

## Cor

Fundo escuro único, com um vermelho Rails dessaturado em dois papéis.

| Token | Valor | Uso |
|---|---|---|
| `--paper` | `#0f0f11` | Fundo da página (grafite, nunca preto puro) |
| `--ink` | `#ededed` | Texto principal |
| `--muted` | `#9a9aa0` | Rótulos, descrições, metadados |
| `--line` | `#26262c` | Todas as linhas de 1px |
| `--accent` | `#d9615b` | Vermelho para texto e detalhes: actions nos rótulos, símbolos Ruby, stack dos projetos, bolinhas do fluxo (5.3:1 no fundo) |
| `--rails-red` | `#8b1e1e` | Vermelho para superfícies grandes: faixa em movimento e bloco de contato (branco por cima, 9.1:1) |
| `--code-bg` | `#16161a` | Blocos de código |
| `--code-string` | `#86c995` | Strings no código |

O mapa de atividade usa a mesma família: `#1d1d22`, `#3a1416`, `#5e191b`, `#8b1e1e`, `#c2504a`.

## Tipografia

Servidas pelo próprio site, em `/fonts/`.

- **Schibsted Grotesk** (400–800) para todo o texto.
  - Abertura: 500, `clamp(2.6rem, 6vw, 5.5rem)`, tracking −0.04em.
  - Título do estudo de caso: 500, até 5rem.
  - Nome do projeto: 500, até 2rem.
  - Lead de seção: 500, até 1.75rem.
  - Rótulos e metadados: 15px, 450, cinza.
- **JetBrains Mono** só em código de verdade: blocos de código, actions nos rótulos, stack dos projetos, períodos da experiência. Ligaduras desligadas, para `=>` e `->` aparecerem como no editor.
- `tabular-nums` só em `.row-num` e `.row-year`. Na Schibsted, o tnum também alarga a pontuação.

## Grade e layout

- Conteúdo contido em `--max: 1200px`, centralizado.
- `.grid`: 12 colunas, `--gap` `clamp(12px, 1.6vw, 24px)`, `--gutter` `clamp(16px, 2.5vw, 32px)`.
- Bloco: linha de 1px no topo, rótulo nas colunas 1–3 (com a action Rails em mono e vermelho embaixo), conteúdo a partir da coluna 4.
- Projetos: imagem grande (7 colunas) e texto ao lado, alternando os lados a cada linha.
- Quebras: 1100px (código da abertura desce), 900px (blocos ocupam a largura, fluxo vira vertical, imagem do projeto vai para cima), 640px (nav desce, tudo em uma coluna).

## Forma

- Raios: 4px em código, foto e botão; 8px nas imagens do índice; 12px na faixa, no contato e nas capturas do estudo de caso.
- Sem cards e sem sombras. Listas separadas por linhas de 1px.
- Links: sublinhado de 1px que cresce da esquerda no hover. Um gesto só para o site todo.
- Campos do formulário: só sublinhado, dentro do bloco vermelho.

## Movimento

**GSAP 3.15** (ScrollTrigger, SplitText) e **Lenis 1.3** via jsDelivr.

- `motion.js`: rolagem suave; entrada (cabeçalho, frase linha por linha, metadados); leads de seção linha por linha; itens em sequência (`ScrollTrigger.batch`); cortina na foto e na capa do estudo de caso; parallax só na foto.
- `sections.js`: faixa que acelera e inverte com a rolagem; fluxo request → response com trilho que avança e acende cada etapa; mapa de atividade entrando em onda; cortina nas imagens dos projetos.
- Hover: linhas do índice apagam para 35%, setas andam, a imagem cresce 1.5%.

Com `prefers-reduced-motion` ou falha do CDN, a página fica estática e completa (a classe `motion-pending` tem trava de 3s no `<head>`).

## Não fazer

Fundo branco, preto puro, vermelho saturado (`#d30001`), conteúdo de borda a borda, estética de terminal, eyebrows acima de títulos, cards, segundo acento, parallax em capturas de tela, texto dinâmico dentro de elementos animados pelo SplitText.
