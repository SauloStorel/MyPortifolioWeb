---
title: "Como eu fiz o site do DeMolay Piauí"
description: "Como eu fiz o site e a loja de inscrições do DeMolay Piauí, meu primeiro projeto real: três versões, vários desafios e o que aprendi com Rails."
date: 2026-11-17
translationKey: "como-fiz-o-site-do-demolay-piaui"
tags: ["rails", "demolay-piaui", "seguranca"]
resumo:
  - "O site do DeMolay Piauí foi o primeiro projeto real do Saulo. Ele o criou quando era Mestre Conselheiro Estadual do Piauí, para resolver problemas da organização: documentos que se perdiam, dificuldade no registro de contas e inscrições feitas por Google Forms, conferidas Pix por Pix."
  - "O projeto teve três versões: primeiro HTML, JS e CSS misturados; depois React; e por fim Rails, feita do zero quando ele começou o estágio na FMS."
  - "A loja usa o checkout da InfinitePay, que aceita cartão, Pix e boleto, tem webhook com o status do pagamento e taxas baixas. O pagamento é confirmado por um único caminho que trava o lote no banco, para nunca vender a mesma vaga duas vezes, e o lote seguinte entra sozinho."
  - "A rifa também entrou no site. Os números são reservados travando as linhas no banco (FOR UPDATE SKIP LOCKED), então dois compradores nunca levam o mesmo número, e as reservas não pagas voltam em 10 minutos. O sorteio grava a semente, e qualquer participante consegue refazer a conta e chegar ao mesmo vencedor."
  - "A segurança do painel é em camadas: honeypot e Cloudflare Turnstile, limite de tentativas, senha criada por link de uso único, auditoria e dados pessoais criptografados. A prestação de contas usa uma senha temporária que dura 2 horas."
  - "O valor cobrado é sempre calculado no servidor, e o cupom só é consumido quando o pagamento é confirmado. No credenciamento, o QR code mostra kit, hospedagem e lote, e quem esteve presente recebe o certificado por e-mail."
  - "As fotos demoravam a carregar na loja e na aba de gestões. Elas ficam no Cloudflare R2, com CDN e cache de um ano, e o Rails passou a gerar em segundo plano versões em WebP, recortadas no tamanho que cada página usa. A causa era que a versão gerada antes não era a mesma que a página pedia, então só era processada no primeiro acesso."
  - "No lançamento, a loja teve mais de 100 inscrições em 24 horas e mais de 300 no total, sem problemas. O projeto usa Rails 8.1, PostgreSQL, Hotwire, Tailwind, Docker com Kamal, Cloudflare R2, Resend e Sentry."
resumo_hash: "dbbbe8b141fc"
---

O site do DeMolay Piauí foi o meu primeiro projeto real, e foi um grande desafio do começo ao fim. Você pode ver o resultado na [página do projeto](/projetos/demolay-piaui/) ou em [demolaypiaui.com](https://demolaypiaui.com).

## A ideia

A Ordem DeMolay é uma ordem paramaçônica e a maior instituição de jovens do sexo masculino do mundo. Ela recebe jovens de 12 a 21 anos e tem como objetivo formar líderes e cidadãos melhores para a sociedade. Faz filantropia, entretenimento e outras atividades.

Eu faço parte da Ordem e, na época, era o Mestre Conselheiro Estadual do Piauí. Esse é o cargo de liderança juvenil mais alto dentro de um estado, e quem o ocupa é responsável por acompanhar os capítulos e garantir que as regras da instituição sejam cumpridas.

Por isso eu via de perto os problemas da organização do nosso estado: documentos que se perdiam, dificuldade no registro de contas, dificuldade para criar formulários de eventos e para acompanhar o pagamento de cada congressista.

Antes, tudo era feito por Google Forms. O interessado preenchia o formulário, mandava o Pix para a chave informada e anexava o comprovante. Isso dava muito trabalho, porque todo dia era preciso conferir Pix por Pix, comprovante por comprovante. Muitas vezes o Forms também dava problema e não dava para anexar o comprovante, o que comprometia a venda.

Tinha ainda a história do estado, que muitas vezes se alterava, porque era passada de boca em boca e não existia um local certo para ela. Faltava um site que contasse a história, com o histórico das gestões passadas, a lista de organizações do estado e a situação de cada uma. Tudo isso era muito difícil de acessar por falta de um portal oficial.

## As três versões

Como foi o meu primeiro projeto real, foram várias tentativas. A primeira versão eu fiz só com HTML, JS e CSS, tudo muito misturado nos arquivos. Uma verdadeira bagunça.

A segunda foi em React, e já estava boa. Foi nessa época que fui selecionado para o estágio na FMS, onde usamos Ruby on Rails, e aproveitei o projeto do DeMolay Piauí para aprender e treinar coisas que melhorassem as minhas habilidades no estágio.

Aí veio a terceira versão, feita do zero em Rails. Além da dificuldade com a linguagem Ruby e com o framework, eu tive vários outros desafios.

## Os desafios

### Pagamento além do Pix

Como colocar uma forma de pagamento além do Pix? Foi aí que descobri o checkout da InfinitePay. Ele já vinha com tudo pronto e aceita cartão, Pix e boleto.

Ele também já tem um webhook, que retorna o status do pagamento: se foi aprovado ou recusado. E tem outra vantagem, que são as taxas, que são bem baixas.

### Os lotes

Como funcionaria quando um lote acabasse por quantidade de inscritos e mudasse automaticamente para o próximo? E se duas pessoas tentassem comprar a última vaga do mesmo lote ao mesmo tempo?

A solução foi confirmar o pagamento por um único caminho, que é o mesmo para o webhook, para o redirect e para o ambiente de testes. Nele, o lote fica travado no banco enquanto a vaga é conferida, então só uma confirmação passa por vez e é impossível vender mais vagas do que existem.

Se a vaga acabou antes de o pagamento ser confirmado, o pedido é cancelado, os dados da transação ficam guardados para o reembolso e a pessoa é avisada por e-mail. A confirmação também não se repete: se o webhook e o redirect chegarem juntos, nada acontece em dobro, nem o e-mail nem o uso do cupom.

O lote seguinte entra em vigor sozinho. Quando o atual esgota, o próximo é promovido, e o carrinho segue a mesma regra, para ninguém fechar uma compra num lote que já foi superado.

### A rifa

Depois da loja de inscrições, a rifa também entrou no site. O desafio era parecido com o dos lotes: dois compradores não podem levar o mesmo número.

Os números ficam numa tabela própria, que é a única fonte de verdade sobre quantos restam. Na hora da compra, o sistema reserva os números travando as linhas no banco (`FOR UPDATE SKIP LOCKED`): quem compra ao mesmo tempo pula as linhas travadas em vez de esperar, e dois pedidos nunca levam o mesmo número. Ou reserva a quantidade inteira ou não reserva nada, para ninguém pagar por 3 e levar 2. Se o pagamento não acontece, os números voltam em 10 minutos. Para ter certeza, fiz um teste com quatro threads reais disputando o mesmo estoque: sem o lock, ele falha.

O sorteio é feito com um clique. O sistema sorteia e grava a semente, e qualquer participante consegue refazer a conta, com a semente e a lista de vendidos, e chegar ao mesmo vencedor.

### Confirmação de pagamento

Para a confirmação do pagamento, descobri os servidores SMTP. Estudei sobre eles para entender por que usar, o que fazem e quais as vantagens. Os e-mails saem pelo Resend.

### O painel de administração e a segurança

Como seria a parte administrativa do site, o painel do admin? Como seria a segurança dessa aba e qual seria o sistema de login? Nessa época aprendi sobre rate limit, verificação de humano e criptografia de senha, entre outras coisas de segurança.

O painel mexe com dinheiro e dados pessoais, então a proteção é em camadas, e nenhuma delas pode trancar o próprio time fora:

- **Verificação de humano:** um campo-armadilha (honeypot) e, quando configurado, o Cloudflare Turnstile. Se o serviço de captcha estiver fora do ar, o login continua protegido pelas outras camadas.
- **Limite de tentativas:** o login e a recuperação de senha limitam as tentativas por IP e por e-mail.
- **Senhas:** ninguém define a senha de ninguém. O administrador cadastra o e-mail da pessoa, que recebe um link de uso único para criar a própria senha. A recuperação de senha responde igual para e-mails cadastrados ou não, para não revelar quem tem conta.
- **Auditoria:** toda alteração em registros sensíveis fica numa trilha de auditoria que só pode ser lida, nunca editada.
- **Privacidade:** os dados pessoais dos pedidos são criptografados no banco, de acordo com a LGPD.

### Prestação de contas

Todos os DeMolays do estado têm direito de acessar a prestação de contas. Já quem é de fora do estado ou da organização não precisa, até por privacidade e segurança. Por isso a aba de prestação de contas tem uma senha temporária, que precisa ser gerada por um admin do site. Depois de gerada, ela dura 2 horas, e fica registrado quando e por quem foi gerada, para uma auditoria mais apurada. A senha é um código hexadecimal.

### Cupons e os valores do front-end

Os cupons me levaram a outro problema que descobri durante a produção do site: nunca confiar em valores enviados pelo front-end. Se alguém mal-intencionado interceptasse o comando de compra e mudasse o valor, poderia se dar desconto. O pagamento seria gerado com o valor que ele definiu, seria aprovado, e a inscrição também.

Por isso o desconto que aparece na tela é só uma prévia. O valor cobrado é sempre calculado no servidor: o preço vem do banco, a validade do cupom é conferida de novo e o desconto é recalculado quando o pedido é criado. Mexer no navegador não muda o que é cobrado. E o cupom só é consumido quando o pagamento é confirmado, nunca na criação do pedido, então quem abandona o checkout não gasta o cupom de ninguém.

### Check-in e certificados

Nos congressos, os kits eram contados e, no final, alguém ficava sem kit por erro no credenciamento, que era manual.

Hoje, depois que o pagamento é conferido, a pessoa recebe no e-mail de confirmação um QR code. Ela apresenta no credenciamento e já aparecem todas as informações dela: se tem kit ou não, se tem hospedagem ou não e qual lote comprou. Tudo isso vai para uma lista de presentes e, no final do congresso, todos os presentes recebem por e-mail um certificado de participação. É tudo automatizado com tasks, e os e-mails saem pelo Resend.

### As imagens demoravam para carregar

Outro desafio foram as imagens. Quando abria a loja ou a aba de gestões passadas, as fotos demoravam bem mais que o normal para carregar.

As imagens ficam no Cloudflare R2 e são entregues por um CDN, com cache de um ano. Mas o que resolveu de verdade foi o que o Rails fazia com elas:

- **Versões prontas:** depois do upload, o sistema gera em segundo plano versões da foto no tamanho exato que cada página usa, em WebP e já recortadas no servidor, para o navegador não baixar a foto inteira.
- **O erro que eu tinha:** a versão gerada com antecedência não era igual à que a página pedia. Por isso ela nunca era aproveitada, e a imagem era processada só no primeiro acesso, o que causava a demora. Algumas fotos (local, hotel, hospedagem e a do topo da home) nem eram preparadas e saíam por um caminho bem mais lento: de 335 a 467 ms por foto, contra cerca de 130 ms pelo CDN.
- **Acima da dobra:** as imagens que aparecem logo ao abrir a página passaram a carregar com prioridade e sem depender de JavaScript. Enquanto a foto não chega, o espaço dela usa a cor média da imagem, em vez de um retângulo branco.

## O lançamento

Nada disso foi feito de uma vez. Foram vários meses de desenvolvimento, várias horas por dia e muitos testes, para que no dia do lançamento da loja, que seria a primeira parte a ser divulgada, nenhum desses problemas acontecesse.

A loja foi divulgada e tivemos mais de 100 inscrições em 24 horas, sem nenhum problema com pagamento ou registro. Tudo ocorreu dentro do planejamento inicial. No final foram mais de 300 inscrições, 100% sem problemas, graças aos cuidados que fui tomando ao fazer as funcionalidades e testá-las de várias formas diferentes. Isso me custou tempo, mas no fim me livrou de muita dor de cabeça.

## Tecnologias

- **Back-end:** Ruby on Rails 8.1, com Ruby 3.3 e PostgreSQL 16. Os jobs em segundo plano rodam no Solid Queue.
- **Front-end:** Hotwire (Turbo e Stimulus) e Tailwind CSS v4, com um design system próprio no painel administrativo.
- **Hospedagem:** um VPS rodando tudo em containers Docker, com deploy por Kamal sem tirar o site do ar. O certificado SSL é renovado automaticamente pelo Let's Encrypt.
- **Arquivos:** Cloudflare R2, com CDN para as imagens públicas e armazenamento privado para os comprovantes e documentos.
- **Serviços:** InfinitePay para os pagamentos, Resend para os e-mails, Sentry para o monitoramento e backup diário do banco.

Foi nessa época que aprendi sobre o CI do GitHub, que me ajudou muito, e sobre o Kamal, para fazer o deploy automático pelo GitHub Actions.
