// Projetos do portfólio, em português e inglês.
// A maioria dos repositórios é privada, por isso a lista é curada aqui em vez de vir da API do GitHub.
//
// Campos:
//   slug    — identificador na URL do estudo de caso (/projeto.html?p=slug)
//   repo    — URL pública do código, ou null quando o repositório é privado
//   site    — URL do projeto no ar, ou null
//   thumb   — imagem 40:21 usada no índice e no topo do estudo de caso
//   year    — ano de referência, ou null quando não confirmado
//   study   — estudo de caso por idioma, ou null (a linha do índice leva direto ao site)

const PROJECTS = [
  {
    slug: "demolay-piaui",
    name: "DeMolay Piauí",
    repo: null,
    site: "https://demolaypiaui.com",
    thumb: "/images/demolay-pi.webp",
    year: 2026,
    stack: ["Rails 8.1", "Hotwire", "PostgreSQL"],
    summary: {
      pt: "Site institucional da Ordem DeMolay Piauí com e-commerce de eventos e inscrições, painel administrativo próprio e pagamento via InfinitePay.",
      en: "Institutional website for the DeMolay Order in Piauí, with an events and registration store, a custom admin panel and InfinitePay payments.",
    },
    study: {
      pt: {
        tagline: "Site institucional com loja de eventos, do model ao deploy.",
        role: "Desenvolvimento completo e participação na identidade visual",
        sections: [
          {
            title: "Contexto",
            paragraphs: [
              "A jurisdição precisava de um site público com história, documentos, galeria, transparência financeira e, principalmente, um jeito de vender inscrições para os congressos estaduais sem depender de planilhas.",
            ],
          },
          {
            title: "Regras de negócio",
            bullets: [
              "Camada de services para a precificação por lote, a validação do carrinho, o checkout e a confirmação do pedido.",
              "Pagamento via InfinitePay, com webhook idempotente: a mesma notificação recebida duas vezes não confirma o pedido duas vezes.",
              "Painel administrativo próprio para conteúdo, produtos, lotes, pedidos e financeiro, com autenticação via Devise.",
            ],
          },
          {
            title: "Qualidade e entrega",
            bullets: [
              "Testes com RSpec e FactoryBot.",
              "Rubocop, Brakeman e bundler-audit a cada pull request, no GitHub Actions.",
              "Deploy com Kamal 2 numa VPS.",
            ],
          },
        ],
        images: [
          { src: "/images/demolay-loja.webp", caption: "Eventos: as inscrições abrem por lote, cerca de três meses antes de cada congresso." },
          { src: "/images/demolay-transparencia.webp", caption: "Portal da Transparência: o extrato da jurisdição abre com senha fornecida pela diretoria." },
        ],
      },
      en: {
        tagline: "An institutional website with an events store, from model to deploy.",
        role: "Full development and part of the visual identity",
        sections: [
          {
            title: "Context",
            paragraphs: [
              "The jurisdiction needed a public website with its history, documents, gallery and financial transparency, and above all a way to sell registrations for the state congresses without relying on spreadsheets.",
            ],
          },
          {
            title: "Business rules",
            bullets: [
              "A services layer for batch pricing, cart validation, checkout and order confirmation.",
              "InfinitePay payments with an idempotent webhook: the same notification received twice never confirms an order twice.",
              "A custom admin panel for content, products, batches, orders and finances, with Devise authentication.",
            ],
          },
          {
            title: "Quality and delivery",
            bullets: [
              "Tests with RSpec and FactoryBot.",
              "Rubocop, Brakeman and bundler-audit on every pull request, on GitHub Actions.",
              "Deployed with Kamal 2 to a VPS.",
            ],
          },
        ],
        images: [
          { src: "/images/demolay-loja.webp", caption: "Events: registrations open in batches, about three months before each congress." },
          { src: "/images/demolay-transparencia.webp", caption: "Transparency portal: the financial statement opens with a password provided by the board." },
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
    stack: ["Rails", "Hotwire", "Tailwind"],
    summary: {
      pt: "Sistema das campanhas CRN e CNIE da Ordem DeMolay: registro das atividades corrigidas e acompanhamento dos capítulos em cada campanha, com acesso restrito a corretores e coordenadores.",
      en: "The DeMolay Order's CRN and CNIE campaign system: graded activities are recorded and each chapter is tracked across every campaign, with access restricted to graders and coordinators.",
    },
    study: null,
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
