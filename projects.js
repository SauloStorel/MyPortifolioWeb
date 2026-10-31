// Projetos do portfólio, em português e inglês.
// A maioria dos repositórios é privada, por isso a lista é curada aqui em vez de vir da API do GitHub.
//
// Campos:
//   slug    — identificador na URL do estudo de caso (/projeto.html?p=slug)
//   repo    — URL pública do código, ou null quando o repositório é privado
//   site    — URL do projeto no ar, ou null
//   thumb   — imagem 40:21 usada nos cards e no topo do estudo de caso
//   year    — ano de referência, ou null quando não confirmado
//   study   — estudo de caso por idioma; todo projeto tem um
//
// Estudo de caso, além de tagline, role, sections e images:
//   facts           — números de destaque [{ value, label }], opcional
//   sections[].layers — partes do sistema [{ title, text }], mostradas como lista numerada

const PROJECTS = [
  {
    slug: "demolay-piaui",
    name: "DeMolay Piauí",
    repo: null,
    site: "https://demolaypiaui.com",
    thumb: "/images/demolay-pi.webp",
    year: 2026,
    stack: ["Rails 8.1", "Hotwire", "PostgreSQL", "InfinitePay", "Kamal"],
    summary: {
      pt: "Site institucional da Ordem DeMolay Piauí com loja de inscrições, pagamento via InfinitePay, portal de transparência, check-in e certificados dos eventos.",
      en: "Institutional website for the DeMolay Order in Piauí, with a registration store, InfinitePay payments, a transparency portal, event check-in and certificates.",
    },
    study: {
      pt: {
        tagline: "Site, loja de inscrições, finanças abertas e o dia do evento, num sistema só.",
        role: "Desenvolvimento completo, do model ao servidor, e participação na identidade visual",
        facts: [
          { value: "90+", label: "funcionalidades em produção" },
          { value: "427", label: "commits entre maio e outubro de 2026" },
          { value: "180", label: "arquivos de teste com RSpec" },
          { value: "0", label: "falhas em 21 mil requisições no teste de carga" },
        ],
        sections: [
          {
            title: "Contexto",
            paragraphs: [
              "A jurisdição precisava de um site público com história, documentos e transparência financeira e, principalmente, de um jeito de vender inscrições para os dois congressos estaduais do ano sem depender de planilhas.",
              "O projeto cresceu junto com a operação. Depois da loja vieram a portaria do evento, os certificados, as rifas e o controle das viagens da gestão. Hoje é a ferramenta do dia a dia da equipe estadual, e o site serve de referência para outras jurisdições.",
            ],
          },
          {
            title: "As camadas do sistema",
            layers: [
              { title: "Site institucional", text: "História, organizações por tipo, galeria de gestões, documentos oficiais com filtro, taxas, dúvidas e busca. Dados estruturados de organização e de evento para aparecer bem no Google." },
              { title: "Loja de inscrições", text: "O preço do lote vigente sai da data. Cada evento tem uma grade de lote, categoria e modalidade (kit, camisa, hospedagem), com cupons, inscrição de cortesia e aviso por email quando um lote abre." },
              { title: "Pagamento", text: "Checkout da InfinitePay com PIX, cartão e boleto em até 12x. O webhook é idempotente, os emails de confirmação saem em segundo plano e quem não pagou recebe um lembrete automático." },
              { title: "Portal de Transparência", text: "Extrato da jurisdição por exercício fiscal, liberado com uma senha temporária de 2 horas e exportável para Excel. Os exercícios abrem e fecham sozinhos em 1º de setembro." },
              { title: "Dia do evento", text: "Check-in na portaria com leitor e busca por nome. O certificado é gerado a partir da presença, não da inscrição: quem pagou e não foi não recebe." },
              { title: "Gestão do estado", text: "Viagens com a distância por estrada calculada pelo OpenStreetMap, quilometragem mensal no formato da planilha antiga, regularização das organizações com vencimento automático e trilha de auditoria de tudo que muda." },
              { title: "Painel administrativo", text: "Design system próprio, instalável no celular como um app separado do site, para a equipe abrir o painel direto da tela inicial." },
            ],
          },
          {
            title: "Decisões que fazem diferença",
            bullets: [
              "Rifa sem número vendido duas vezes: a reserva trava os números no PostgreSQL (FOR UPDATE SKIP LOCKED), então dois compradores nunca levam o mesmo. O sorteio grava a semente usada, e qualquer participante consegue refazer a conta e chegar ao mesmo vencedor.",
              "Certificado com a arte da comunicação: o admin escreve {nome} na peça, no próprio editor gráfico. O sistema acha o marcador no PDF, apaga e escreve o nome de cada participante exatamente ali.",
              "Evento do ano seguinte em um clique: a duplicação copia lotes, a grade de preços com dezenas de valores, cronograma, locais e hotéis, e todas as datas andam um ano. A cópia nasce desativada, para alguém revisar antes de abrir.",
              "Correção de pedido sem console: email digitado errado, camisa trocada, nome errado no crachá. Tudo numa transação, e um campo inválido desfaz o resto.",
              "Envios que podem ser repetidos: certificados e lembretes saem só para quem ainda não recebeu, então reenviar nunca manda em dobro.",
            ],
          },
          {
            title: "Qualidade e entrega",
            bullets: [
              "RSpec e FactoryBot, com Rubocop, Brakeman e bundler-audit a cada pull request no GitHub Actions.",
              "Deploy com Kamal 2 numa VPS, sem tirar o site do ar, e certificado SSL renovado sozinho.",
              "Backup diário do banco, com cópia fora do servidor no Cloudflare R2, e Sentry avisando de erros em produção.",
              "Teste de carga com k6 na mesma configuração do servidor: 21.056 requisições sem nenhuma falha, 95% delas respondidas em menos de 8 ms.",
            ],
          },
        ],
        images: [
          { src: "/images/demolay-celular.webp", caption: "No celular: a home, os capítulos por região e o Portal da Transparência." },
          { src: "/images/demolay-capitulos.webp", caption: "Capítulos por região, com busca, filtros e a situação de cada um, regular ou inativo, vinda do painel." },
          { src: "/images/demolay-transparencia.webp", caption: "Portal da Transparência: o extrato abre com uma senha temporária, e a sessão expira sozinha em 2 horas." },
          { src: "/images/demolay-numeros.webp", caption: "Os números da jurisdição na home, atualizados pela equipe no painel." },
          { src: "/images/demolay-estrutura.webp", caption: "Os sete tipos de organização, cada um com sua página e a contagem de unidades ativas." },
        ],
      },
      en: {
        tagline: "Website, registration store, open finances and event day, in a single system.",
        role: "Full development, from model to server, and part of the visual identity",
        facts: [
          { value: "90+", label: "features in production" },
          { value: "427", label: "commits between May and October 2026" },
          { value: "180", label: "RSpec test files" },
          { value: "0", label: "failures in 21k requests under load testing" },
        ],
        sections: [
          {
            title: "Context",
            paragraphs: [
              "The jurisdiction needed a public website with its history, documents and financial transparency, and above all a way to sell registrations for its two yearly state congresses without relying on spreadsheets.",
              "The project grew with the operation. After the store came event check-in, certificates, raffles and travel tracking for the state board. Today it is the state team's everyday tool, and other jurisdictions use the website as a reference.",
            ],
          },
          {
            title: "The layers of the system",
            layers: [
              { title: "Institutional website", text: "History, organizations by type, a gallery of past boards, official documents with filters, fees, FAQ and search. Organization and event structured data so it shows up well on Google." },
              { title: "Registration store", text: "The active batch price comes from the date. Each event has a grid of batch, category and option (kit, shirt, lodging), with coupons, complimentary registrations and an email alert when a batch opens." },
              { title: "Payments", text: "InfinitePay checkout with PIX, card and boleto in up to 12 installments. The webhook is idempotent, confirmation emails go out in the background and unpaid orders get an automatic reminder." },
              { title: "Transparency portal", text: "The jurisdiction's statement by fiscal year, unlocked with a 2-hour temporary password and exportable to Excel. Fiscal years open and close on their own on September 1st." },
              { title: "Event day", text: "Door check-in with a scanner and name search. Certificates come from attendance, not registration: whoever paid and didn't show up doesn't get one." },
              { title: "State management", text: "Trips with road distance calculated from OpenStreetMap, monthly mileage in the old spreadsheet's format, organization compliance with automatic expiry and an audit trail of every change." },
              { title: "Admin panel", text: "Its own design system, installable on the phone as an app separate from the website, so the team opens the panel straight from the home screen." },
            ],
          },
          {
            title: "Decisions that matter",
            bullets: [
              "No raffle number sold twice: reservations lock the numbers in PostgreSQL (FOR UPDATE SKIP LOCKED), so two buyers never get the same one. The draw stores its seed, so any participant can redo the math and reach the same winner.",
              "Certificates with the communications team's artwork: the admin types {nome} on the piece, in their own design tool. The system finds the marker in the PDF, erases it and writes each participant's name right there.",
              "Next year's event in one click: duplication copies batches, a price grid with dozens of values, schedule, venues and hotels, and every date moves forward a year. The copy starts disabled so someone reviews it before opening.",
              "Order fixes without a console: a mistyped email, a swapped shirt size, a wrong name on the badge. All in one transaction, so one invalid field rolls back the rest.",
              "Sends that can be repeated: certificates and reminders only go to whoever hasn't received them yet, so resending never doubles up.",
            ],
          },
          {
            title: "Quality and delivery",
            bullets: [
              "RSpec and FactoryBot, with Rubocop, Brakeman and bundler-audit on every pull request, on GitHub Actions.",
              "Deployed with Kamal 2 to a VPS with zero downtime, and SSL renewed automatically.",
              "Daily database backups with an off-site copy on Cloudflare R2, and Sentry reporting production errors.",
              "Load test with k6 on the same configuration as the server: 21,056 requests with no failures, 95% of them answered in under 8 ms.",
            ],
          },
        ],
        images: [
          { src: "/images/demolay-celular.webp", caption: "On the phone: the home page, chapters by region and the transparency portal." },
          { src: "/images/demolay-capitulos.webp", caption: "Chapters by region, with search, filters and each one's status, active or inactive, coming from the panel." },
          { src: "/images/demolay-transparencia.webp", caption: "Transparency portal: the statement opens with a temporary password, and the session expires on its own after 2 hours." },
          { src: "/images/demolay-numeros.webp", caption: "The jurisdiction's numbers on the home page, kept up to date by the team in the panel." },
          { src: "/images/demolay-estrutura.webp", caption: "The seven types of organization, each with its own page and a count of active units." },
        ],
      },
    },
  },
  {
    slug: "crn-cap",
    name: "CRN Cap",
    repo: null,
    site: "https://crncap.com.br",
    thumb: "/images/crncap.webp",
    year: 2026,
    stack: ["Rails 8.1", "Hotwire", "Tailwind"],
    summary: {
      pt: "Sistema das campanhas CRN e CNIE da Ordem DeMolay: registro das atividades corrigidas e acompanhamento dos capítulos em cada campanha, com acesso restrito a corretores e coordenadores.",
      en: "The DeMolay Order's CRN and CNIE campaign system: graded activities are recorded and each chapter is tracked across every campaign, with access restricted to graders and coordinators.",
    },
    study: {
      pt: {
        tagline: "Duas campanhas, cinco perfis e um ranking, sem planilha no meio.",
        role: "Desenvolvimento completo",
        facts: [
          { value: "2", label: "campanhas no mesmo sistema" },
          { value: "5", label: "perfis de acesso" },
          { value: "0 a 130", label: "pontos por atividade na CRN, com ranking" },
        ],
        sections: [
          {
            title: "Contexto",
            paragraphs: [
              "As campanhas CRN e CNIE da Ordem DeMolay avaliam as atividades que os capítulos enviam ao longo do ano. Corretores lançam o resultado de cada atividade corrigida, e a coordenação acompanha quem está participando, quem foi eliminado e, na CRN, quem lidera o ranking.",
              "O sistema começou só com a CRN. Quando a CNIE entrou, as duas passaram a dividir o cadastro de capítulos, mas cada uma com suas regras, seu histórico e sua eliminação.",
            ],
          },
          {
            title: "Regras de negócio",
            bullets: [
              "Cinco perfis exclusivos (corretor e coordenador de cada campanha, mais o Geral), com toda permissão conferida no servidor.",
              "CRN: vários envios por atividade, nota de 0 a 130 e ranking com posição, quem está logo acima e logo abaixo, e a curva de pontos ao lado da do líder.",
              "CNIE: um registro por capítulo e atividade, garantido pelo banco, então um duplo clique não grava duas vezes. A participação é calculada, sem ranking.",
              "A planilha antiga da CNIE é conferida inteira antes de gravar: com qualquer linha errada, nada entra, e a tela lista o que corrigir.",
              "Cada envio, ajuste e exclusão fica numa trilha de auditoria que não pode ser editada.",
              "Retrospectiva por período: cada corretor recebe por email o link da sua, e a coordenação recebe o resumo da equipe, sem email repetido se o envio rodar de novo.",
            ],
          },
          {
            title: "Qualidade e entrega",
            bullets: [
              "A migração para duas campanhas foi ensaiada numa cópia da produção, preservando IDs, pontuações e a classificação da CRN.",
              "Testes de permissões, concorrência, exportações e da própria migração.",
              "Exportações em Excel e PDF, e deploy com Kamal.",
            ],
          },
        ],
        images: [],
      },
      en: {
        tagline: "Two campaigns, five roles and a leaderboard, with no spreadsheet in between.",
        role: "Full development",
        facts: [
          { value: "2", label: "campaigns in one system" },
          { value: "5", label: "access roles" },
          { value: "0 to 130", label: "points per activity in CRN, with a leaderboard" },
        ],
        sections: [
          {
            title: "Context",
            paragraphs: [
              "The DeMolay Order's CRN and CNIE campaigns assess the activities chapters submit throughout the year. Graders record the result of each graded activity, and coordinators follow who is taking part, who was eliminated and, in CRN, who leads the leaderboard.",
              "The system started with CRN only. When CNIE joined, both began sharing the chapter registry, each with its own rules, history and eliminations.",
            ],
          },
          {
            title: "Business rules",
            bullets: [
              "Five exclusive roles (grader and coordinator for each campaign, plus a general admin), with every permission checked on the server.",
              "CRN: several submissions per activity, scores from 0 to 130 and a leaderboard with position, who is right above and below, and the points curve next to the leader's.",
              "CNIE: one record per chapter and activity, enforced by the database, so a double click never saves twice. Participation is calculated, with no ranking.",
              "CNIE's old spreadsheet is checked in full before saving: with any bad row, nothing goes in, and the screen lists what to fix.",
              "Every submission, adjustment and deletion lands in an audit trail that can't be edited.",
              "Period recaps: each grader gets an email with a link to theirs, and coordinators get the team summary, with no repeated email if the job runs again.",
            ],
          },
          {
            title: "Quality and delivery",
            bullets: [
              "The migration to two campaigns was rehearsed on a copy of production, preserving IDs, scores and the CRN leaderboard.",
              "Tests for permissions, concurrency, exports and the migration itself.",
              "Excel and PDF exports, deployed with Kamal.",
            ],
          },
        ],
        images: [],
      },
    },
  },
  {
    slug: "rhut",
    name: "rhut",
    repo: "https://github.com/SauloStorel/rhut",
    site: "https://rhut.storell.dev.br",
    thumb: "/images/rhut.webp",
    year: 2026,
    stack: ["WebRTC", "Cloudflare Workers", "Durable Objects"],
    summary: {
      pt: "Transmissão de tela para servidores do Discord, direto no navegador: /live abre uma sala com WebRTC P2P em até 1080p60.",
      en: "Screen sharing for Discord servers, right in the browser: /live opens a room with peer-to-peer WebRTC at up to 1080p60.",
    },
    study: {
      pt: {
        tagline: "1080p a 60 fps para o Discord, sem Nitro e sem servidor ligado.",
        role: "Projeto pessoal, código aberto",
        sections: [
          {
            title: "Por que existe",
            paragraphs: [
              "O compartilhamento de tela do Discord limita a qualidade para quem não tem Nitro. O rhut é a alternativa para grupos pequenos de amigos: alguém digita /live, o bot posta um aviso no canal e todo mundo entra numa sala na web.",
            ],
          },
          {
            title: "Como funciona",
            bullets: [
              "Bot sem servidor ligado: o Discord chama o Worker por HTTP só quando alguém usa o comando ou clica num botão.",
              "Uma sala, um Durable Object: ele só apresenta os navegadores (offer, answer e candidates) e guarda o estado do aviso. O vídeo nunca passa por ele.",
              "Identidade sem login: o bot responde a cada pessoa com um link assinado (HMAC), válido para aquela sala por 12 horas.",
              "Codec em hardware: a página prefere o codec que a GPU de quem transmite consegue codificar (AV1, H.264 ou VP9).",
              "A sala vazia por 15 minutos fecha sozinha e atualiza o aviso no canal.",
            ],
          },
          {
            title: "Limites assumidos",
            paragraphs: [
              "Cada pessoa assistindo recebe uma cópia direta do vídeo, então o upload de quem transmite é o teto: até 4 ou 5 pessoas fica tranquilo. Para muito mais gente, o caminho seria trocar o P2P por um SFU.",
            ],
          },
        ],
        images: [
          { src: "/images/rhut-sala.webp", caption: "A sala esperando alguém transmitir." },
          { src: "/images/rhut-guia.webp", caption: "Passo a passo antes de compartilhar a tela, para o áudio do jogo ir junto." },
        ],
      },
      en: {
        tagline: "1080p at 60 fps for Discord, no Nitro and no server running 24/7.",
        role: "Personal project, open source",
        sections: [
          {
            title: "Why it exists",
            paragraphs: [
              "Discord's own screen sharing caps the quality for people without Nitro. rhut is the alternative for small groups of friends: someone types /live, the bot posts a notice in the channel and everyone joins a room on the web.",
            ],
          },
          {
            title: "How it works",
            bullets: [
              "No always-on server: Discord calls the Worker over HTTP only when someone uses the command or clicks a button.",
              "One room, one Durable Object: it only introduces the browsers to each other (offer, answer and candidates) and keeps the notice's state. Video never goes through it.",
              "Identity without login: the bot replies to each person with a signed (HMAC) link, valid for that room for 12 hours.",
              "Hardware codecs: the page prefers whatever codec the broadcaster's GPU can encode (AV1, H.264 or VP9).",
              "A room left empty for 15 minutes closes itself and updates the notice in the channel.",
            ],
          },
          {
            title: "Known limits",
            paragraphs: [
              "Each viewer gets a direct copy of the video, so the broadcaster's upload is the ceiling: 4 or 5 people is comfortable. For many more, the next step would be replacing peer-to-peer with an SFU.",
            ],
          },
        ],
        images: [
          { src: "/images/rhut-sala.webp", caption: "The room waiting for someone to start streaming." },
          { src: "/images/rhut-guia.webp", caption: "A quick guide before sharing the screen, so the game audio goes along." },
        ],
      },
    },
  },
  {
    slug: "xfria",
    name: "Xfria",
    repo: "https://github.com/SauloStorel/xfria",
    site: "https://xfria.storell.dev.br",
    thumb: "/images/xfria.webp",
    year: 2026,
    stack: ["ESP32", "MQTT", "Tauri"],
    summary: {
      pt: "Controle do ar-condicionado Gree pelo computador e pelo celular: um ESP32 imita o controle remoto infravermelho, com custo mensal zero.",
      en: "Control a Gree air conditioner from your computer and phone: an ESP32 imitates the infrared remote, at zero monthly cost.",
    },
    study: {
      pt: {
        tagline: "O ar sem Wi-Fi ganha painel no computador, na barra e no celular.",
        role: "Projeto pessoal, código aberto",
        sections: [
          {
            title: "Por que existe",
            paragraphs: [
              "O controle remoto some, fica no outro cômodo ou acaba a pilha, e o ar não tem Wi-Fi. Em vez de trocar o aparelho, o Xfria imita o controle original: um LED infravermelho de poucos reais, um ESP32 e um painel próprio, sem nuvem paga, sem abrir porta no roteador e sem app de fabricante.",
            ],
          },
          {
            title: "Como funciona",
            bullets: [
              "O ESP32 fala o protocolo do Gree pela biblioteca IRremoteESP8266 e manda o estado completo a cada comando: ligado, modo, temperatura, ventilação e aleta.",
              "Painel e ESP32 conversam por MQTT no plano gratuito do Adafruit IO. O ESP32 só abre conexões de saída, então nada fica exposto na rede de casa.",
              "Estado de verdade: o ESP32 publica o estado depois de cada comando e avisa quando cai (last will), e todos os painéis mostram a mesma coisa.",
              "O mesmo painel em três lugares: app Tauri no Windows e no Linux, ícone na barra do Omarchy e app web instalável no celular.",
              "O último estado fica na flash e volta depois de uma queda de energia, e o firmware novo vai pelo Wi-Fi, com senha, sem tirar a placa do lugar.",
            ],
          },
          {
            title: "Limites assumidos",
            paragraphs: [
              "O infravermelho é de mão única: se alguém usar o controle original, o painel não fica sabendo. Cada placa controla um aparelho, só da Gree, e o plano grátis do Adafruit IO aceita até 30 mensagens por minuto, por isso a barra espera um instante antes de mandar a temperatura.",
            ],
          },
        ],
        images: [
          { src: "/images/xfria-painel.webp", caption: "O painel: temperatura, modo, ventilação e aleta, igual no computador e no celular." },
          { src: "/images/xfria-caixa.webp", caption: "A montagem: ESP32, emissor infravermelho e uma caixa impressa em 3D, sem solda." },
        ],
      },
      en: {
        tagline: "An air conditioner without Wi-Fi gets a panel on the desktop, the status bar and the phone.",
        role: "Personal project, open source",
        sections: [
          {
            title: "Why it exists",
            paragraphs: [
              "The remote goes missing, sits in another room or runs out of battery, and the air conditioner has no Wi-Fi. Instead of replacing the unit, Xfria imitates the original remote: a cheap infrared LED, an ESP32 and a panel of its own, with no paid cloud, no open router ports and no manufacturer app.",
            ],
          },
          {
            title: "How it works",
            bullets: [
              "The ESP32 speaks the Gree protocol through the IRremoteESP8266 library and sends the full state with every command: power, mode, temperature, fan and louver.",
              "Panel and ESP32 talk over MQTT on Adafruit IO's free plan. The ESP32 only opens outbound connections, so nothing on the home network is exposed.",
              "Real state: the ESP32 publishes its state after every command and announces when it drops (last will), so every panel shows the same thing.",
              "One panel in three places: a Tauri app on Windows and Linux, an icon in the Omarchy status bar and an installable web app on the phone.",
              "The last state is saved to flash and comes back after a power cut, and new firmware goes over Wi-Fi, password-protected, without taking the board down.",
            ],
          },
          {
            title: "Known limits",
            paragraphs: [
              "Infrared is one-way: if someone uses the original remote, the panel never finds out. Each board controls one unit, Gree only, and Adafruit IO's free plan allows up to 30 messages per minute, so the status bar waits a moment before sending the temperature.",
            ],
          },
        ],
        images: [
          { src: "/images/xfria-painel.webp", caption: "The panel: temperature, mode, fan and louver, the same on the desktop and the phone." },
          { src: "/images/xfria-caixa.webp", caption: "The build: an ESP32, an infrared emitter and a 3D-printed case, no soldering." },
        ],
      },
    },
  },
];
