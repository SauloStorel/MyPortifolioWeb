# Design

Estúdio de uma pessoa só, em grafite e vermelho. A base é o kit de identidade da Storell (logo "S.", paleta, formas, ícones, botões, banner e diagonais). A assinatura é o ponto vermelho no fim das frases. O design anterior, com tema Rails, está guardado nos branches `design-rails-producao` e `design-rails-marca`.

## Cor

Medidas direto dos PNGs do kit.

| Token | Valor | Uso |
|---|---|---|
| `--bg` | `#0e0e10` | Fundo |
| `--surface` | `#141417` | Painel dos projetos, campos, ícones |
| `--surface-2` | `#1f1f23` | Fundo das imagens, logotipo gigante do rodapé |
| `--line` / `--line-strong` | `#2a2a2f` / `#3a3a41` | Linhas de 1px e contornos |
| `--ink` | `#f4f4f5` | Texto principal |
| `--muted` / `--faint` | `#a1a1aa` / `#6b6b73` | Texto de apoio / rótulos e a linha do meio do título |
| `--red` | `#e35d5d` | O ponto, ícones, detalhes e texto em destaque (5.5:1 no fundo) |
| `--red-strong` | `#c84646` | Fundo de botão: branco por cima passa de 4.5:1, o que o `#e35d5d` não passa |
| `--red-deep` / `--red-night` | `#b03a3a` / `#3a1416` | Degradês do quadrado e do banner |
| `--rose` | `#f4caca` | Mensagens do formulário, hover do botão claro |

## Marca

"Storell" em Schibsted 800, tracking −0.05em, terminando num círculo vermelho de verdade (`.dot`, 0.19em, apoiado na linha de base). A última palavra de um título e o ponto ficam juntos (`.nowrap`). Saulo Storel aparece como a pessoa por trás da marca: no Sobre, no rodapé e nos dados estruturados.

## Tipografia

Schibsted Grotesk (400–800, servida em `/fonts/`) para tudo. O kit sugere Inter, mas a Schibsted tem o mesmo desenho e uma voz própria.

- Títulos 800, tracking entre −0.045em e −0.055em, entrelinha perto de 0.95.
- Rótulos em caixa alta, 13px, 600, tracking 0.2em (`.eyebrow`).
- Texto 17px, 450.

## Formas e componentes

- **Abertura:** a foto do Saulo recortada (`images/saulo-recorte.webp`) na frente do quadrado em degradê do kit. O quadrado corta a foto embaixo e dos lados, e a cabeça sai do quadro por cima. Em volta ficam o "S." como selo, o anel, a barra, os pontos e o selo "Agenda aberta". Uma pessoa real no lugar de formas genéricas.
- **Botões:** vermelho com seta, contorno, claro (sobre o vermelho) e redondo com seta. Raio de 14px.
- **Ícones:** traço de 1.75 em quadrado arredondado de 64px (Serviços). Nas camadas dos estudos, o número vai no lugar do ícone.
- **Navbar:** pílula de vidro líquido flutuante (desfoque com saturação, véu claro, reflexo na borda de cima). No celular, ela se desdobra com os links.
- **Tela de erro:** um modelo só (`404.html` + `errors.js`) para 400, 401, 403, 404, 408, 429, 500, 502, 503 e 504, em português ou inglês conforme o endereço (`/en/...`). A Vercel serve o 404; os outros códigos aparecem com `?codigo=500` e ficam prontos para outros projetos.
- **Banner de contato:** degradê do grafite ao vermelho com as diagonais do kit, e o logotipo com "SEU DESENVOLVEDOR".
- Raios: 14px em botões e campos, 20px nas imagens, de 24px a 48px nos painéis. Sombra só no vidro e no selo "S." da abertura.

## Movimento

CSS e JS próprios, mais o Lenis 1.3 (jsDelivr) para a rolagem suave, ligado só com mouse e sem "reduzir movimento". Os links internos rolam até a seção sem colocar # no endereço.

- Entrada ao rolar (`.reveal`), com os irmãos em sequência.
- O ponto do título cai e quica uma vez.
- Pílula de vidro "Ver projeto" seguindo o cursor sobre os prints.
- Logotipo do rodapé engordando perto do cursor (eixo de peso da fonte variável).
- Trilho vermelho do Processo se preenchendo.

Os efeitos de mouse só ligam com ponteiro fino. Com `prefers-reduced-motion`, tudo fica parado e completo.

## Não fazer

Vidro fora da navbar e da pílula do cursor, cards iguais em fila, segundo acento de cor, sombra suave em tudo, números ou depoimentos inventados, travessão nos textos da interface.
