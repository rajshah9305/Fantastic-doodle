# AI STUDIO - No-Code AI App Builder

Transform natural language descriptions into fully functional web applications using AI.

## Features

### Core Features

- **AI-Powered Generation**: Describe your app idea and get complete HTML, CSS, and JavaScript code
- **Live Code Editor**: Full-featured Monaco editor with syntax highlighting and auto-completion
- **Real-Time Preview**: See your app running instantly with mobile/desktop device switching
- **AI Chat Assistant**: Refine and modify your app using natural language commands
- **Export & Download**: Download your app as a standalone, production-ready HTML file

### New Production Features

- **Dashboard**: Manage all your generated apps in one centralized location
- **Advanced Editor**: Professional code editing experience with AI-powered modifications
- **Settings Panel**: Customize your experience with theme preferences and app settings
- **App Management**: Search, filter, edit, and delete your apps with ease
- **Session Persistence**: Apps are saved to database with full history
- **Type-Safe APIs**: End-to-end type safety with tRPC
- **Modern UI**: Beautiful, responsive design with dark mode support

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS 4, Radix UI
- **Backend**: Express.js, tRPC, Groq API (Llama 3.3 70B)
- **Database**: Supabase (PostgreSQL) with Drizzle ORM
- **Build**: Vite, esbuild
- **Deployment**: Vercel

## Quick Start

### Prerequisites

- Node.js 18+ and npm/pnpm
- Groq API key ([Get one here](https://console.groq.com))
- Supabase account ([Sign up here](https://supabase.com))

### Installation

```bash
# Clone the repository
git clone https://github.com/rajshah9305/Fantastic-doodle.git
cd Fantastic-doodle

# Install dependencies
npm install

# Set up database tables in Supabase SQL Editor
# Run the SQL from the "Database Setup" section below

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

## Database Setup

Run this SQL in your Supabase SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS "sessions" (
  "id" SERIAL PRIMARY KEY,
  "session_id" TEXT NOT NULL UNIQUE,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "last_active_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "session_id_idx" ON "sessions" ("session_id");

CREATE TABLE IF NOT EXISTS "generated_apps" (
  "id" SERIAL PRIMARY KEY,
  "session_id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "prompt" TEXT NOT NULL,
  "html_code" TEXT NOT NULL,
  "css_code" TEXT,
  "js_code" TEXT,
  "generated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "generated_apps_session_id_idx" ON "generated_apps" ("session_id");
CREATE INDEX IF NOT EXISTS "generated_apps_generated_at_idx" ON "generated_apps" ("generated_at");
```

## Deploy to Vercel

1. Push your code to GitHub
2. Go to https://vercel.com/new
3. Import your repository
4. Add environment variables:
   - `GROQ_API_KEY`: Your Groq API key
   - `DATABASE_URL`: Your Supabase connection string
   - `NODE_ENV=production`
5. Deploy

## Environment Variables

Create a `.env` file in the root directory:

```env
GROQ_API_KEY=your_groq_api_key_here
DATABASE_URL=your_supabase_connection_string_here
NODE_ENV=development
```

Get your credentials from:
- **Groq API Key**: https://console.groq.com/keys
- **Supabase Connection String**: https://supabase.com/dashboard (Project Settings > Database > Connection String)

## Usage

### Quick Workflow

1. **Generate**: Enter a description on the home page and click "Initialize"
2. **Edit**: Open the app in the Editor to modify code or use AI chat
3. **Manage**: View all your apps in the Dashboard
4. **Export**: Download as standalone HTML file
5. **Customize**: Adjust settings and preferences

### Available Routes

- `/` - Home page with AI generation
- `/dashboard` - View and manage all apps
- `/editor/:id` - Edit app with AI assistance
- `/settings` - User preferences and settings
- `/app/:id` - View app in preview mode
- `/examples` - Browse example apps
- `/templates` - Explore app templates

### Example Prompts

- "A todo list app with add, delete, and mark complete functionality"
- "A calculator with basic arithmetic operations and a modern design"
- "A weather dashboard showing temperature, humidity, and forecast"
- "A timer app with start, stop, and reset buttons"
- "A kanban board for project management with drag and drop"
- "A markdown editor with live preview"

## Project Structure

```
├── client/              # React frontend
│   ├── src/
│   │   ├── pages/      # Page components
│   │   ├── components/ # Reusable UI components
│   │   ├── lib/        # Utilities and tRPC client
│   │   └── contexts/   # React contexts
├── server/              # Express backend
│   ├── _core/          # Core server setup
│   ├── routers.ts      # tRPC API routes
│   ├── db.ts           # Database functions
│   └── groqClient.ts   # Groq API integration
├── drizzle/            # Database schema
├── shared/             # Shared types and constants
└── vercel.json         # Vercel deployment config
```

## Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run start     # Start production server
npm run db:push   # Push database schema changes (optional)
npm run check     # TypeScript type checking
npm run format    # Format code with Prettier
npm test          # Run tests
```

## Contributing

Contributions are welcome. Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Acknowledgments

- Powered by [Groq](https://groq.com) for lightning-fast AI inference
- UI components from [Radix UI](https://www.radix-ui.com)
- Icons from [Lucide](https://lucide.dev)
- Code editor by [Monaco Editor](https://microsoft.github.io/monaco-editor/)

---

© 2024 AI STUDIO. Built with care using AI
