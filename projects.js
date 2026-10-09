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
      pt: "Sistema com login onde cada capítulo DeMolay acompanha a própria campanha do CRN e da CNIE.",
      en: "A login-based system where each DeMolay chapter tracks its own CRN and CNIE campaign.",
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
    slug: "clausecheck",
    name: "ClauseCheck",
    repo: null,
    site: null,
    thumb: "/images/clausecheck.webp",
    year: null,
    stack: ["React Native", "Supabase", "pgvector"],
    summary: {
      pt: "App que lê contratos por foto, PDF ou texto, aponta cláusulas abusivas e explica o risco com base na lei.",
      en: "An app that reads contracts from a photo, PDF or text, flags abusive clauses and explains the risk based on the law.",
    },
    study: {
      pt: {
        tagline: "Análise de contratos com IA, fundamentada na legislação brasileira.",
        role: "Desenvolvimento completo: telas, componentes, serviços e arquitetura",
        sections: [
          {
            title: "O que faz",
            paragraphs: [
              "O app (React Native com Expo e TypeScript) lê um contrato por foto, PDF ou texto, identifica cláusulas abusivas, gera um relatório de risco em semáforo (alto, médio, baixo) e oferece um chat jurídico sobre aquele contrato.",
            ],
          },
          {
            title: "RAG jurídico próprio",
            bullets: [
              "Embeddings com Voyage AI (voyage-law-2), modelo treinado para textos jurídicos.",
              "Indexação vetorial com pgvector no Supabase, cobrindo Código Civil, CDC, CLT e Lei do Inquilinato.",
              "Os trechos recuperados entram no prompt do Claude para fundamentar cada análise na lei, em vez de na memória do modelo.",
            ],
          },
          {
            title: "Backend serverless",
            bullets: [
              "Supabase Auth com Row Level Security: cada pessoa só enxerga os próprios contratos.",
              "Edge Functions para análise, chat e ingestão da legislação.",
              "Geração e compartilhamento do relatório em PDF.",
            ],
          },
        ],
        images: [],
      },
      en: {
        tagline: "AI contract analysis, grounded in Brazilian law.",
        role: "Full development: screens, components, services and architecture",
        sections: [
          {
            title: "What it does",
            paragraphs: [
              "The app (React Native with Expo and TypeScript) reads a contract from a photo, PDF or text, flags abusive clauses, builds a traffic-light risk report (high, medium, low) and offers a legal chat about that contract.",
            ],
          },
          {
            title: "A custom legal RAG",
            bullets: [
              "Embeddings with Voyage AI (voyage-law-2), a model trained on legal text.",
              "Vector indexing with pgvector on Supabase, covering the Civil Code, the Consumer Protection Code, labor law and the Tenancy Law.",
              "Retrieved passages go into Claude's prompt, so each analysis rests on the law instead of on the model's memory.",
            ],
          },
          {
            title: "Serverless backend",
            bullets: [
              "Supabase Auth with Row Level Security: each person only sees their own contracts.",
              "Edge Functions for analysis, chat and law ingestion.",
              "PDF report generation and sharing.",
            ],
          },
        ],
        images: [],
      },
    },
  },
];
