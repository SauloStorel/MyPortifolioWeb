# Storell: regras do projeto e a voz do Saulo

Site e blog do Saulo Storel (Teresina, PI). Leia este arquivo antes de escrever qualquer texto ou mexer no visual. O design está em `DESIGN.md` e o produto em `PRODUCT.md`.

## Como o Saulo escreve (vale para blog, site e qualquer texto em nome dele)

- **Primeira pessoa, simples e direto.** Frases curtas, do jeito que ele falaria. Ele escreve "eu", "meu", "me chama".
- **Ortografia correta, sem ficar artificial.** Português padrão ("para", não "pra"; "para o", não "pro"), com todos os acentos. Mas sem rebuscar: o tom continua de conversa.
- **Nada de texto com cara de IA.** Ele rejeitou frases de efeito, como "quem conversa com você é quem escreve o código, e o projeto não passa de mão em mão", "sem tecniquês" e promessas de calendário. Se uma frase parece slogan, é para cortar.
- **Não invente.** Nada de fatos, números, motivos, histórias ou promessas que ele não disse. Use só o que ele contou ou o que já está nos estudos de caso (`projects.js`).
- **O que ele conta para me orientar é contexto, não texto para publicar.** Exemplo: ele explicou o rumo do blog para eu entender, e eu publiquei o parágrafo por engano. Pergunte antes de transformar uma explicação em texto publicado.
- **Mostre o texto antes de publicar** e diga o que veio dele e o que eu acrescentei, para ele poder apagar.
- Português do Brasil nas conversas. Sem travessão (—) nos textos da interface.

## Quem é o Saulo (fatos que ele mesmo deu)

- Tem 20 anos e mora em Teresina, no Piauí.
- Gosta de programação desde pequeno, por influência do tio, que também é programador.
- Está no primeiro emprego, que na verdade é um estágio, na FMS de Teresina (Fundação Municipal de Saúde). Trabalha no setor de RH como desenvolvedor de sistemas e cuida de todo o sistema de RH da FMS e das ramificações dele.
- Fora do estágio faz a Storell: sites e sistemas, quase sempre com Ruby on Rails.
- Projetos: DeMolay Piauí, CRN Cap, Xfria, Cairn e rhut (detalhes em `projects.js`).

## O blog

- **Propósito:** é um blog de desenvolvedor. Ele escreve sobre os projetos que faz: as ideias, os desafios de cada projeto, como fez e quais tecnologias usou. A ideia veio do tio dele. Também ajuda o site a ser achado no Google, mas esse não é o assunto dos textos.
- **Não** posicionar o blog como vitrine de "sistemas sob medida" nem falar de "tirar o negócio da planilha". Ele disse que não sabe de onde veio isso. (O mesmo texto está na página inicial do site, que veio de antes: se for mexer nela, converse com ele primeiro.)
- **É o blog pessoal do Saulo, não de uma empresa.** O nome é "Blog do Saulo" (em inglês, "Saulo's blog"), definido por idioma em `blog-src/hugo.toml` (`title`). Cabeçalho com "Saulo Storel", rodapé "© Saulo Storel", abas do navegador, RSS e dados do Google com esse nome. "Storell" só aparece como o trabalho dele e no link para o portfólio. Nos textos, "meu blog", nunca "blog da Storell".
- **Dois idiomas:** cada artigo existe em português e inglês, com o mesmo `translationKey`.
- **Como escrever um post:** `cd blog-src && hugo new content --kind projeto content/pt/blog/nome.md`, e o mesmo em `content/en/blog/`. O modelo tem a estrutura que ele pediu: A ideia, Os desafios, Como eu fiz, Tecnologias. Nasce com `draft: true`.
- **Resumo por IA em cada artigo:** o botão "Resumo por IA" mostra o campo `resumo` (lista de 4 a 6 frases curtas) do front matter. O resumo é gerado pelo Claude **quando o texto do artigo está pronto**, só com o que está no artigo, sem acrescentar nada, e a página avisa que foi feito por IA. Sempre que o artigo mudar, refaça o resumo e rode `node scripts/verificar-blog.mjs --atualizar-hashes` (grava o `resumo_hash`). O verificador barra a publicação se o artigo mudou depois do resumo. Faça um resumo em cada idioma.
- **Descrição de cada artigo:** de 120 a 160 caracteres, escrita por ele ou revisada com ele. É o que aparece no Google.
- **Publicar (um comando só):** `./scripts/publicar.sh` gera as páginas de projeto e o blog e confere os artigos (descrição de 120 a 160 caracteres, versão nos dois idiomas, links internos). Com uma mensagem, `./scripts/publicar.sh "Novo artigo: nome"` também pergunta se pode fazer o commit e o push, e o deploy na Vercel sai do push. Estando na `main`, depois do push ele espera o deploy da Vercel terminar e confere o site publicado (`scripts/verificar-producao.mjs`: todas as páginas dos sitemaps abrem, têm `canonical` certo, título, descrição e um `<h1>`, sem `noindex`; os redirecionamentos das URLs antigas e o cache também). Em outra branch, a Vercel só gera uma pré-visualização protegida por login. Só rode com mensagem quando o Saulo pedir. A Vercel usa o `main` como produção.
- **Ver rascunhos no navegador:** `./blog-src/preview.sh` (grava os rascunhos em `/blog`). **Antes de qualquer commit, volte ao normal** com `./blog-src/build.sh`, senão rascunho vai para o repositório. O `publicar.sh` já faz isso sozinho.
- **Gerar só o blog:** `./blog-src/build.sh` (só posts prontos) ou `./blog-src/build.sh -D` (com rascunhos, para conferir). Antes de publicar, rode **sem** o `-D`.
- **Gerar as páginas de projeto:** `node scripts/gerar-projetos.mjs` (depois de mudar o `projects.js`). Ele também atualiza o `sitemap.xml`.

## Visual

- **Nada de fonte serifada, nunca.** Só Schibsted Grotesk e JetBrains Mono (nos rótulos e dados).
- Ele já rejeitou vários redesenhos do site seguidos (tema claro, hero tipográfico, estilo 21st.dev, painel "Em resumo") e pediu para voltar ao original. **Não proponha redesenho por conta própria.** Mexa só no que ele apontar. Se ele pedir mudança de visual, pergunte o que incomoda ou peça uma referência, em vez de chutar.
- Hoje o site está no visual original (escuro), e no início, à direita, fica a marca "S." da Storell sobre o quadrado vermelho, sem foto e sem enfeites (ele pediu para tirar a foto e os enfeites por parecerem de IA). O blog tem cabeçalho e rodapé próprios, e tema claro e escuro.
- Referências que ele já citou: 21st.dev (heros) e o blog do Akita (`akitaonrails.com`, para o formato da lista do blog).

## Trabalho

- **Não faça commit** sem ele pedir. Nada de coautoria nem menção a Claude nos commits (regra global dele).
- Confira no navegador antes de dizer que está pronto (o servidor local usa `python3 -m http.server 8000` na raiz).
- Antes de apagar ou desfazer trabalho, guarde uma cópia ou pergunte.
