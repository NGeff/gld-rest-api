# GLD REST API

Uma API REST multifuncional com dashboard de gerenciamento, sistema de autenticação, planos de assinatura e pagamentos integrados via Mercado Pago.

## Visão Geral

O projeto é dividido em duas partes principais:

- **`/api`** — Backend Node.js/Express com MongoDB
- **`/dashboard/frontend`** — Frontend React para gerenciamento de usuários, chaves de API, planos e suporte

## Funcionalidades

### API
- Tradução de textos
- Consulta de CEP e CNPJ
- Cotação de criptomoedas e moedas
- Download de YouTube, Spotify, TikTok e Instagram
- Busca no Spotify e IMDB
- Reconhecimento de músicas via Shazam
- Geração de QR Code
- Previsão do tempo
- Busca de imagens e Pinterest
- Busca de letras de músicas
- Texto para áudio (TTS)
- Conversor de mídia (áudio/imagem)
- Cálculo matemático
- Dicionário
- Feriados nacionais
- URL encurtada
- Busca de jogos na Steam
- Chat com IA
- Efeitos em imagens e memes de áudio

### Dashboard
- Autenticação (registro, login, verificação de e-mail, recuperação de senha)
- Gerenciamento de chaves de API
- Visualização de logs de requisições
- Sistema de planos com pagamento via Mercado Pago (PIX)
- Suporte via tickets
- Painel administrativo

## Stack

| Camada | Tecnologia |
|---|---|
| Backend | Node.js, Express |
| Banco de dados | MongoDB (Mongoose) |
| Frontend | React 18, React Router v6 |
| Autenticação | JWT + bcryptjs |
| E-mail | Nodemailer + Brevo (SMTP) |
| Pagamentos | Mercado Pago |
| Agendamentos | node-cron |

## Pré-requisitos

- Node.js 18+
- MongoDB
- Conta Brevo (e-mail transacional)
- Conta Mercado Pago

## Instalação

```bash
git clone https://github.com/NGeff/gld-rest-api.git
cd gld-rest-api
```

Copie o arquivo de variáveis de ambiente e preencha com suas credenciais:

```bash
cp .env.example api/.env
```

Instale todas as dependências e faça o build:

```bash
npm run deploy
```

## Scripts

| Comando | Descrição |
|---|---|
| `npm run deploy` | Instala dependências, faz build e inicia em produção |
| `npm run dev` | Inicia backend e frontend em modo desenvolvimento (concorrente) |
| `npm run build` | Faz build do frontend React |
| `npm run start` | Inicia apenas o servidor Node.js |

## Variáveis de Ambiente

Crie o arquivo `api/.env` com base no `api/.env.example`:

```env
NODE_ENV=production
PORT=3000

MONGODB_URI=mongodb://localhost:27017/gld-api

JWT_SECRET=sua-chave-secreta-jwt
API_KEY_SECRET=sua-chave-de-criptografia-api

BREVO_API_KEY=
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=
BREVO_SMTP_PASS=
EMAIL_FROM=noreply@seudominio.com

MERCADO_PAGO_ACCESS_TOKEN=
MERCADO_PAGO_PUBLIC_KEY=

FRONTEND_URL=https://seudominio.com
```

## Estrutura do Projeto

```
gld-rest-api/
├── api/
│   ├── controllers/       # Lógica de cada rota
│   ├── jobs/              # Tarefas agendadas (ex: expiração de planos)
│   ├── middleware/        # Auth, admin, rate limiter, API key
│   ├── models/            # Schemas MongoDB
│   ├── services/          # Serviços externos e lógica de negócio
│   ├── server.js          # Entry point do servidor
│   └── package.json
├── dashboard/
│   └── frontend/
│       ├── public/
│       └── src/
│           ├── components/
│           ├── contexts/
│           ├── pages/
│           └── styles/
├── .env.example
├── .gitignore
└── package.json
```

## Endpoints Principais

### Autenticação
```
POST   /auth/register
POST   /auth/login
GET    /auth/verify/:token
POST   /auth/forgot-password
POST   /auth/reset-password/:token
```

### API (requer API Key no header `x-api-key`)
```
GET    /api/translate
GET    /api/cep/:cep
GET    /api/cnpj/:cnpj
GET    /api/crypto
GET    /api/currency
GET    /api/weather
GET    /api/qrcode
GET    /api/youtube/download
GET    /api/spotify/download
GET    /api/tiktok/download
GET    /api/instagram/download
GET    /api/shazam
GET    /api/lyrics
GET    /api/imdb
GET    /api/steam/game
GET    /api/images/search
GET    /api/pinterest/search
POST   /api/tts
POST   /api/ai/chat
POST   /api/image/effect
...
```

### Saúde
```
GET    /health
```

## Licença

MIT © [NGeff](https://github.com/NGeff)
