# Prompt para IA de layout — Portfólio Saulo Storel

Crie um site de portfólio de uma única página para um desenvolvedor back-end júnior
(Saulo Storel, estudante de ADS, estagiário de TI na FMS em Teresina-PI, stack Ruby
on Rails / JavaScript / SQL). Idioma: português do Brasil.

## CONCEITO CENTRAL

O site inteiro simula um editor de código / IDE aberto em tela cheia. Não é uma
landing page com navbar e seções tradicionais — é uma "janela de aplicação" fixa
ocupando 100vh, e o conteúdo do portfólio é apresentado como arquivos abertos
dentro do editor.

## PALETA (monocromática, sem NENHUMA outra cor)

- Tema escuro (padrão): fundo #050505, superfícies elevadas #0e0e0e,
  bordas/linhas #232323, texto #e8e8e8, texto forte #ffffff,
  texto secundário #8f8f8f, texto apagado #4c4c4c.
- Tema claro: inversão exata (fundo #fafafa, texto #161616, etc.),
  alternável por botão, persistido em localStorage.
- Proibido: cores de marca em ícones, dots verde/vermelho/amarelo de macOS,
  gradientes coloridos, qualquer accent color.

## TIPOGRAFIA

- Uma única família: JetBrains Mono (pesos 400–800), em 100% do site.
- Hierarquia apenas por tamanho, peso e inversão. Nome no hero em ExtraBold 800
  com letter-spacing negativo. Cantos retos em tudo (border-radius: 0).

## ASSINATURA VISUAL: "reverse video" de terminal

Todo estado ativo/hover importante é texto selecionado: bloco branco com texto
preto (no tema claro, bloco preto com texto branco). Vale para: arquivo ativo na
árvore, títulos de arquivo, tokens de skill no hover, links no hover, o chip de
modo da statusbar.

## ESTRUTURA DA JANELA (layout fixo, só o miolo rola)

1. **Titlebar** (topo, ~42px): três dots vazados monocromáticos à esquerda, título
   centralizado "saulo@storel: ~/portfolio", botão de tema e hambúrguer (mobile)
   à direita.
2. **Sidebar esquerda** (~232px): file explorer com label "EXPLORER" e árvore ASCII:

   ```
   ▾ portfolio/
   ├─ hello.sh          (hero)
   ├─ 01_sobre.md       (sobre)
   ├─ 02_skills.json    (skills)
   ├─ 03_projetos/      (projetos)
   └─ 04_contato.sh     (contato)
   ```

   Cada item é âncora para a seção; o item da seção visível fica com fundo
   invertido. No rodapé da sidebar: "9 arquivos · 0 bugs*" / "* conhecidos".
   No mobile a sidebar vira drawer deslizante.
3. **Área do editor** (rola): gutter fixo à esquerda com números de linha (1, 2, 3…)
   acompanhando toda a altura do conteúdo, separado por borda de 1px.
4. **Statusbar** (rodapé, ~30px, estilo vim): chip invertido "NORMAL" (muda para
   "INSERT" quando um campo do formulário está focado) · "git:(main)" · nome do
   arquivo/seção atual · espaçador · progresso de scroll estilo vim
   ("top" / "64%" / "bot") · "Teresina 18:21" (hora local ao vivo) · "utf-8".

## CONTEÚDO DAS SEÇÕES

Cada seção abre com um cabeçalho de arquivo: "── [nome]" com o nome em bloco
invertido e uma linha que se desvanece à direita.

### hello.sh (hero, altura de viewport)

Sessão de terminal à esquerda — "saulo@storel:~$ whoami" seguido do nome
"Saulo Storel" gigante com efeito de digitação e cursor de bloco piscante;
"$ cat status" → "▪ estagiário na FMS · aberto a novas conexões" (dot pulsando);
"$ cat sobre-mim.txt" → parágrafo curto de apresentação; botões "./ver_projetos"
(sólido invertido, hover com sombra dura deslocada 4px) e "curriculo.pdf"
(outline); links "github ↗ linkedin ↗ email". À direita, foto do dev em preto e
branco (grayscale, ganha leve cor no hover) dentro de moldura com barra superior
"$ feh ~/images/foto.jpg".

### 01_sobre.md

Markdown renderizado — título "# Sobre mim" (o # em cinza apagado), dois
parágrafos, e um bloco frontmatter YAML entre "---":

```
formacao: ADS — UNINASSAU Teresina  # em andamento · 2026.1
local: Teresina, PI                 # remoto & presencial
estagio: Fundação Municipal de Saúde — FMS  # gestão de pessoas · abr–out 2026
foco: Back-End & Automação
```

### 02_skills.json

Um JSON real renderizado com indentação, chaves em cinza, pontuação apagada e
strings em branco forte:

```
{
  "stack_do_dia_a_dia": ["HTML5", "CSS3", "JavaScript", "Git",
    "PostgreSQL", "Claude", "Linux", "Ruby", "Rails"],
  "aprendendo_agora": ["React", "TypeScript", "UIkit", "Docker", "Node.js"]
}
```

Tokens invertem no hover; os de "aprendendo_agora" em cinza mais fraco.

### 03_projetos/

Linha de comando "saulo@storel:~/projetos$ ls -la --sort=updated" seguida de
listagem estilo ls: cada repositório é uma linha com
"drwxr-xr-x  nome-do-repo/  [linguagem]  ★ stars  demo ↗", e a descrição
embaixo como comentário "# descrição". Dados vêm da API pública do GitHub
(usuário SauloStorel, repos não-fork, cache de 1h em localStorage, fallback
estático se a API falhar).

### 04_contato.sh

"#!/bin/sh" apagado, comentário "# Prefiro resolver problemas reais. Se tiver
um, me manda.", hora local de Teresina ao vivo, formulário com labels
"$ read nome", "$ read email", "$ read mensagem" (inputs com fundo elevado,
borda 1px, foco = borda branca; erros de validação prefixados com "!!"),
botão "./enviar.sh", envio via Formspree com toast de confirmação.
Fecha com os tils "~" de fim de buffer do vim e "© 2026 Saulo Storel · exit 0".

## COMPORTAMENTO E QUALIDADE

- HTML, CSS e JS vanilla, sem frameworks, arquivos separados.
- Scroll suave dentro do container do editor; seção ativa sincronizada com a
  árvore e a statusbar; reveal sutil das seções ao rolar.
- Clicar em email copia o endereço (saulostorell@gmail.com) e mostra toast.
- Acessibilidade: skip link, foco visível em tudo, aria-current na navegação,
  headings para leitores de tela, prefers-reduced-motion respeitado, contraste
  alto nos dois temas.
- Responsivo: em mobile o gutter some, a foto vai para cima do texto, o form
  vira uma coluna e a statusbar esconde itens secundários.
- Redes: github.com/SauloStorel, linkedin.com/in/saulo-storel.
