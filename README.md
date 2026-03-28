# CraigsCatch — Craigslist Item Scanner

A full-stack web application that monitors Craigslist RSS feeds for free items, with real-time Telegram alerts and an AI chat assistant powered by Ollama.

## Features

- **RSS Feed Monitoring** — Add Craigslist search URLs and automatically scan for new listings
- **Telegram Alerts** — Get instant notifications when new free items appear
- **AI Assistant** — Chat with a local Ollama-powered AI about your finds
- **Dashboard** — Browse, filter, and manage discovered items
- **Auto-Sync** — Configurable interval for automatic feed checking

## Tech Stack

- **Frontend:** React 18, Vite, TailwindCSS, shadcn/ui, Framer Motion
- **Backend:** Express 5, TypeScript, Drizzle ORM
- **Database:** PostgreSQL (Neon, Supabase, or local)
- **Alerts:** Telegram Bot API
- **AI:** Ollama (local LLM)

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database
- (Optional) [Ollama](https://ollama.ai) for the AI assistant
- (Optional) Telegram Bot for notifications

### Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Craigslist-Item-Scanner.git
   cd Craigslist-Item-Scanner
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database URL and optional API keys
   ```

4. **Push database schema**
   ```bash
   npm run db:push
   ```

5. **Start the dev server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5000`

### Production Build

```bash
npm run build
npm run start
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `PORT` | ❌ | Server port (default: 5000) |
| `OLLAMA_URL` | ❌ | Ollama API URL (default: localhost:11434) |
| `OLLAMA_MODEL` | ❌ | Ollama model name (default: qwen) |
| `CHECK_INTERVAL_MINUTES` | ❌ | Feed check interval (default: 15) |
| `TELEGRAM_BOT_TOKEN` | ❌ | Telegram bot token from @BotFather |
| `TELEGRAM_CHAT_ID` | ❌ | Your Telegram chat ID |

## License

MIT
