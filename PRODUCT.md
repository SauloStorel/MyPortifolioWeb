# Produto

Site da Storell, o estúdio de uma pessoa só de Saulo Storel, publicado em https://www.storell.dev.br. A página `/apuracao/` é um projeto à parte, com CSS e JS próprios dentro da pasta.

## Quem é

Desenvolvedor Ruby on Rails. Estudante do último período de Análise e Desenvolvimento de Sistemas (Uninassau Teresina, conclusão em dez/2026) e estagiário de desenvolvimento na Fundação Municipal de Saúde de Teresina (abr 2026 – jan 2027). Foi Coordenador Geral Estadual da Ordem DeMolay do Piauí (2025–2026). Mora em Teresina, PI; aceita remoto e presencial. Fonte dos fatos: `docs/curriculo.pdf`.

## Para quem

Em primeiro lugar, quem pode contratar: donos de negócio, instituições e equipes que hoje controlam o trabalho em planilha, papel ou WhatsApp. A maioria abre pelo celular. Em segundo lugar, recrutadores e pessoas da comunidade, que chegam por LinkedIn ou GitHub.

## O que a página precisa fazer

1. Dizer em segundos o que a Storell faz: sites, sistemas e painéis sob medida, com Rails.
2. Mostrar projetos reais, todos com estudo de caso (DeMolay Piauí, CRN Cap, rhut, Xfria). O card sempre abre o estudo, nunca o site direto.
3. Levar ao orçamento: formulário (Formspree), WhatsApp (86 99815-5687) e email.

## Tom

Honesto e direto, em primeira pessoa ("eu faço"): a Storell é uma pessoa, e o site nunca finge ter uma equipe. Sem inflar experiência e sem frases de autopromoção. Nada de alegações que não estejam no currículo, nos READMEs ou nos sites no ar. Não citar "construir o novo sistema de RH" (pedido do dono do site).

## Restrições

- HTML, CSS e JS puros, sem frameworks nem build. Deploy estático na Vercel.
- Manter SEO (meta tags, JSON-LD, sitemap) e o GA4.
- Projetos e estudos de caso são curados em `projects.js` (a maioria dos repositórios é privada). Os números dos estudos vêm dos repositórios (commits, testes, teste de carga), nunca de estimativa.
- Site bilíngue: `/` e `/projeto.html` em português, `/en/` e `/en/project.html` em inglês.

## Compromissos de marca

- Identidade do kit da Storell (aprovada em 2026-10-31), descrita em `DESIGN.md`. O tema Rails anterior está guardado no branch `design-rails-producao`.
- Interações em CSS e JS próprios; a única biblioteca é o Lenis, para a rolagem suave.
- Sem link de "pular para o conteúdo" (pedido do dono do site); o resto da navegação por teclado continua funcionando.
