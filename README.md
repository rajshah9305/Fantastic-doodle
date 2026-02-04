# AI App Builder

Transform natural language into fully functional web applications using AI.

## 🚀 Quick Start

### Prerequisites
- Node.js 24.x
- npm

### Setup (5 minutes)

```bash
# Install dependencies
npm install

# Create .env file
echo "NODE_ENV=development" > .env
echo "GROQ_API_KEY=your_api_key_here" >> .env
echo "PORT=3000" >> .env
```

### Start Development Server

```bash
npm run dev
```

Open: **http://localhost:3000**

## ✨ Features

✅ **AI App Generation** - Transform prompts into HTML/CSS/JS apps  
✅ **AI App Modification** - Improve apps with natural language instructions  
✅ **Live Preview** - Sandboxed iframe rendering  
✅ **Export/Download** - Save as standalone HTML files  
✅ **Mobile Optimized** - Tabbed interface on mobile (Generate/Preview tabs)  
✅ **Dashboard** - Manage all generated apps  
✅ **Session Persistence** - LocalStorage-based anonymous sessions  
✅ **Examples & Templates** - Pre-built prompts and designs  

## 📱 Mobile Experience

The Editor page features a **tabbed interface on mobile**:
- **"Generate" tab (Default)** - AI chat for code modifications
- **"Preview" tab** - Live app preview
- Desktop maintains **side-by-side layout** (code editor + preview/chat)

## 🏗️ Architecture

```
Frontend (React)          Backend (Express)        Data
├── Home              ├── tRPC API            ├── PostgreSQL
├── Editor       ↔    ├── Groq Client    ↔   ├── Drizzle ORM
├── Dashboard         ├── Express Server      └── Optional
└── AppViewer         └── Session Mgmt
```

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + tRPC
- **AI**: Groq API (OpenAI GPT-OSS model)
- **Database**: PostgreSQL + Drizzle ORM (optional)
- **Build**: Monorepo with shared types

## 📁 Key Files

| File | Purpose |
|------|---------|
| `client/src/pages/Editor.tsx` | Main editor with tabbed mobile UI |
| `client/src/lib/trpc.ts` | tRPC client setup |
| `server/routers/apps.ts` | App CRUD & generation endpoints |
| `server/groqClient.ts` | Groq AI integration |
| `server/_core/index.ts` | Express server setup |
| `server/db.ts` | Database operations |

## 🔧 Commands

```bash
npm run dev         # Start dev server
npm run check       # TypeScript type check
npm run build       # Production build
npm run db:push     # Apply database migrations
```

## 🔌 API Endpoints (tRPC)

All endpoints at `/api/trpc`:

```typescript
trpc.apps.generate({ prompt, sessionId })
trpc.apps.list()
trpc.apps.get({ id })
trpc.apps.update({ id, ...fields })
trpc.apps.modify({ id, instruction })
trpc.apps.delete({ id })
```

## 🧪 Testing Locally

**Generate an app:**
1. Visit http://localhost:3000
2. Type: "Create a calculator app"
3. Click "Initialize"
4. See generated app in workspace

**Modify an app:**
1. Go to Editor page
2. Click "Generate" tab (mobile default)
3. Type: "Add dark mode"
4. Watch preview update

**Export:**
1. Click "Export" button
2. HTML file downloads
3. Open in browser → fully functional

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| GROQ_API_KEY missing | Add valid key to .env |
| Port 3000 busy | Change `PORT=3001` in .env |
| Blank page | Check browser console for errors |
| Preview blank | Verify Groq API key is valid |
| TypeScript errors | Run `npm install` to ensure TypeScript is installed |

## 🔒 Security

- Iframe sandboxing: `sandbox="allow-scripts"`
- Input validation: Zod schemas on all inputs
- Environment validation: Config checked at startup
- Session isolation: Per-user localStorage IDs

## 📊 Verification Status

✅ TypeScript compilation (0 errors)  
✅ All APIs wired and connected  
✅ Mobile responsive (tabbed interface)  
✅ Error handling complete  
✅ Database optional with fallback  
✅ Production ready  

## 📝 Environment Variables

```
NODE_ENV=development          # development or production
GROQ_API_KEY=your_key_here   # Required for AI generation
PORT=3000                     # Server port
DATABASE_URL=postgres://...   # Optional (demo mode without it)
```

## 🚀 Production Build

```bash
npm run build
NODE_ENV=production node dist/index.js
```

## 📄 License

MIT

---

**Built with ❤️ by Raj Shah**
