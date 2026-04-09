# AI Studio — App Builder

Transform natural language into fully functional web applications using Groq AI.

## Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS v4
- **Backend**: Node.js + Express + tRPC v11
- **AI**: Groq API (`llama-3.3-70b-versatile`)
- **Database**: PostgreSQL + Drizzle ORM (optional — runs without it)
- **Deployment**: Vercel (serverless functions + static hosting)

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/rajshah9305/Fantastic-doodle.git
cd Fantastic-doodle
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
NODE_ENV=development
GROQ_API_KEY=gsk_your_key_here
PORT=3000
# DATABASE_URL=postgres://user:password@host:5432/dbname  # optional
```

Get a free Groq API key at [console.groq.com](https://console.groq.com).

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

### One-click

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/rajshah9305/Fantastic-doodle)

### Manual

1. Push to GitHub
2. Import project in [Vercel dashboard](https://vercel.com/new)
3. Add environment variables:
   - `GROQ_API_KEY` — required
   - `DATABASE_URL` — optional (Supabase, Neon, etc.)
4. Deploy

## Features

- **Generate** — describe any app in plain English, get working HTML/CSS/JS
- **Edit** — Monaco code editor with live preview
- **AI Modify** — chat-based modifications to existing apps
- **Export** — download as standalone HTML file
- **Dashboard** — manage all generated apps
- **Examples & Templates** — 24 pre-built prompts to get started

## Project Structure

```
├── api/
│   └── trpc.ts              # Vercel serverless function
├── client/
│   └── src/
│       ├── pages/           # Home, Editor, Dashboard, AppViewer, ...
│       ├── components/      # UI components + Radix primitives
│       ├── contexts/        # ThemeContext
│       ├── hooks/           # useTypewriter, useComposition
│       └── lib/             # tRPC client, utils
├── server/
│   ├── _core/               # Express server, tRPC setup, Vite dev middleware
│   ├── routers/             # apps, health
│   ├── utils/               # config, logging
│   ├── db.ts                # Drizzle database operations
│   └── groqClient.ts        # Groq AI client
├── shared/
│   └── types.ts             # Shared TypeScript types
├── drizzle/
│   ├── schema.ts            # Database schema
│   └── migrations/          # SQL migrations
└── vercel.json              # Vercel deployment config
```

## Database (Optional)

The app runs fully without a database — generated apps are not persisted between sessions. To enable persistence:

1. Create a PostgreSQL database (e.g., [Supabase](https://supabase.com), [Neon](https://neon.tech))
2. Set `DATABASE_URL` in your environment
3. Run migrations:

```bash
npm run db:push
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run check` | TypeScript type check |
| `npm run db:push` | Apply schema to database |
| `npm run db:studio` | Open Drizzle Studio |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | Yes | Groq API key from console.groq.com |
| `DATABASE_URL` | No | PostgreSQL connection string |
| `PORT` | No | Server port (default: 3000) |
| `NODE_ENV` | No | `development` or `production` |

## License

MIT
