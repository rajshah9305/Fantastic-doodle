# 📚 Codebase Architecture Guide

## Overview
This is a full-stack AI-powered web app builder using:
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Express + tRPC + Node.js
- **AI**: Groq API (OpenAI GPT-OSS model)
- **Database**: PostgreSQL with Drizzle ORM
- **Build**: Monorepo with shared types

---

## 📁 Directory Structure

### `/client` - React Frontend
```
client/
├── src/
│   ├── pages/
│   │   ├── Home.tsx          - Landing page with generation form
│   │   ├── Dashboard.tsx      - App listing & management
│   │   ├── Editor.tsx         - Main editor with AI chat
│   │   ├── AppViewer.tsx      - App preview & export
│   │   └── ...
│   ├── components/
│   │   ├── AIChat.tsx         - AI modification interface
│   │   ├── LivePreview.tsx    - Iframe-based preview
│   │   ├── CodeEditor.tsx     - Monaco editor
│   │   ├── Layout.tsx         - Main wrapper
│   │   └── ui/                - Shadcn components
│   ├── contexts/
│   │   ├── app-context.tsx    - Global app state
│   │   ├── auth-context.tsx   - Auth state
│   │   └── ThemeContext.tsx   - Theme switching
│   ├── lib/
│   │   ├── trpc.ts           - tRPC client setup
│   │   └── utils.ts          - Utility functions
│   ├── const.ts              - Constants & session mgmt
│   └── main.tsx              - Entry point
├── vite.config.ts            - Vite configuration
└── index.html                - HTML template
```

### `/server` - Express Backend
```
server/
├── _core/
│   ├── index.ts             - Express app setup & tRPC middleware
│   ├── context.ts           - tRPC context
│   ├── trpc.ts              - tRPC router & middleware setup
│   └── vite.ts              - Vite dev server integration
├── routers/
│   ├── apps.ts              - App CRUD & generation
│   ├── groq.ts              - Groq API integration
│   └── health.ts            - Health check endpoint
├── utils/
│   ├── config.ts            - Environment validation
│   ├── logging.ts           - Logger setup
│   ├── errorHandler.ts      - Error utilities
│   └── rateLimit.ts         - Rate limiting
├── db.ts                    - Database operations
├── groqClient.ts            - Groq SDK wrapper
└── routers.ts               - Router aggregation
```

### `/drizzle` - Database
```
drizzle/
└── schema.ts               - Table definitions (apps, sessions)
```

### `/shared` - Shared Code
```
shared/
├── types.ts                - TypeScript interfaces
├── validation.ts           - Zod schemas
└── const.ts                - Shared constants
```

### `/api` - Vercel Serverless
```
api/
└── trpc.ts                 - Vercel edge function handler
```

---

## 🔄 Data Flow

### App Generation Flow
```
User enters prompt (Home.tsx)
    ↓
trpc.apps.generate mutation
    ↓
Express: POST /api/trpc → appsRouter.generate
    ↓
Groq API call with system prompt
    ↓
Parse JSON response (HTML/CSS/JS)
    ↓
Store in Database
    ↓
Return to client
    ↓
Display in Editor.tsx (tabbed on mobile)
```

### App Modification Flow
```
User types instruction (AIChat.tsx)
    ↓
trpc.apps.modify mutation
    ↓
Express: POST /api/trpc → appsRouter.modify
    ↓
Fetch current app from database
    ↓
Groq API call with current code + instruction
    ↓
Parse modified HTML/CSS/JS
    ↓
Update database
    ↓
Return to client
    ↓
Update LivePreview (Editor.tsx)
```

---

## 🔌 API Endpoints (tRPC)

### Apps Router (`server/routers/apps.ts`)
```typescript
// Generation
trpc.apps.generate({ prompt, sessionId }) → GeneratedApp

// CRUD
trpc.apps.list() → GeneratedApp[]
trpc.apps.get({ id }) → GeneratedApp
trpc.apps.update({ id, ...updates }) → { success, result }
trpc.apps.delete({ id }) → { success }

// Modification
trpc.apps.modify({ id, instruction }) → GeneratedApp
```

---

## 🎨 Mobile Experience (New!)

### Editor Page Tabbed Interface
- **On Mobile**: Two tabs
  - "Generate" (AI Chat) - DEFAULT
  - "Preview" (Live preview)
- **On Desktop**: Side-by-side layout
  - Left: Code editor + title bar
  - Right: Tabs for preview and AI chat

### Implementation
- `Tabs` component from `@radix-ui/react-tabs`
- `TabsContent` wraps mobile-specific content
- `hidden md:*` classes hide on mobile
- `md:*` classes show desktop layout

---

## 🚀 Starting the App

### Prerequisites
```bash
# Required
- Node.js 24.x
- npm

# Environment variables
GROQ_API_KEY=your_key_here
NODE_ENV=development
PORT=3000
```

### Startup
```bash
# Install dependencies
npm install

# Type checking
npm run check

# Development server
npm run dev

# Production build
npm run build

# Production server
NODE_ENV=production node dist/index.js
```

---

## 🔑 Key Components Explained

### Editor.tsx (Main Editor Page)
- Handles tabbed interface on mobile
- "Generate" tab = AIChat component
- "Preview" tab = LivePreview component
- Default tab on mobile = "editor" (code generation)
- Integrates with tRPC for save/modify operations
- Responsive header with mobile-friendly buttons

### LivePreview.tsx
- Renders generated HTML in iframe
- `sandbox` attribute for security
- Updates when code changes
- Uses `contentDocument.write()` for dynamic content

### AIChat.tsx
- Textarea for user instructions
- Message history display
- Scroll-to-bottom behavior
- Send with Enter key
- Loading state during API calls

### AppViewer.tsx
- Full app preview page
- Download as HTML
- Copy code to clipboard
- Delete app with confirmation
- Responsive grid layout

---

## 📊 Database Schema

### Apps Table
```sql
generatedApps {
  id: number (PK)
  sessionId: string (FK)
  title: string
  description: string
  prompt: string (original)
  htmlCode: string
  cssCode: string
  jsCode: string
  generatedAt: Date
  updatedAt: Date
}
```

### Sessions Table
```sql
sessions {
  id: number (PK)
  sessionId: string (UNIQUE)
  createdAt: Date
  lastActiveAt: Date
}
```

---

## 🔒 Security Features

- **Iframe Sandboxing**: `sandbox="allow-scripts"` for preview
- **Input Validation**: Zod schemas on all inputs
- **API Key Protection**: Environment variable validation
- **CORS Headers**: Set in Express middleware
- **Session Isolation**: LocalStorage-based session IDs

---

## 🧪 Testing Locally

### Generate an App
```
1. Visit http://localhost:3000
2. Type: "Create a todo list app"
3. Click "Initialize"
4. Wait for Groq API response
5. See app in workspace
```

### Modify an App
```
1. In Editor, click "Generate" tab
2. Type: "Add dark mode support"
3. Watch preview update in real-time
```

### Export an App
```
1. Click "Export" button
2. HTML file downloads
3. Open in browser → fully functional
```

---

## 🛠 Development Workflow

### Adding a New Feature
1. Create components in `/client/src/components`
2. Add types to `/shared/types.ts`
3. Add tRPC procedures to `/server/routers`
4. Wire up in page components
5. Test with `npm run check` & `npm run dev`

### Adding a New Database Table
1. Define schema in `/drizzle/schema.ts`
2. Create migration: `npm run db:generate`
3. Apply migration: `npm run db:push`
4. Add queries to `/server/db.ts`
5. Create tRPC procedures to expose API

---

## 📈 Performance Optimizations

- **Code Splitting**: Monaco editor in separate chunk
- **Lazy Loading**: React Router with dynamic imports
- **Caching**: React Query with stale-while-revalidate
- **Minification**: Vite production build
- **Compression**: Gzip enabled in Express

---

## 🐛 Debugging Tips

### Console Logs to Watch
```
[Server] Running on http://localhost:3000
[Config] Environment variables loaded successfully
[Database] Connected successfully / Running in demo mode
[Groq] Using mock client / initialized
```

### Browser DevTools
- Network tab: Check `/api/trpc` calls
- Console: App errors and warnings
- Application > LocalStorage: Session ID tracking

### Common Issues
| Issue | Cause | Fix |
|-------|-------|-----|
| Blank page | Frontend error | Check browser console |
| API fails | No GROQ_API_KEY | Add to .env |
| Port busy | Another process | Change PORT in .env |
| Preview blank | Iframe error | Check app generation |

---

## 📝 File Summary

| File | Purpose |
|------|---------|
| `main.tsx` | tRPC provider initialization |
| `App.tsx` | Router setup |
| `Editor.tsx` | Main editor UI |
| `apps.ts` (router) | All app CRUD operations |
| `groqClient.ts` | AI integration |
| `db.ts` | Database queries |
| `vite.config.ts` | Build configuration |
| `_core/index.ts` | Server startup |

---

## ✨ Recent Updates

✅ **Mobile Tabbed Interface**: Editor now shows "Generate" and "Preview" tabs on mobile
✅ **Default Generate Tab**: Mobile users see AI chat by default
✅ **Type Safe**: Full TypeScript coverage verified
✅ **Fully Wired**: All APIs and components connected and tested
✅ **Production Ready**: All error handling and logging in place

---

## 🎯 Next Steps

1. Set `GROQ_API_KEY` in `.env`
2. Run `npm run dev`
3. Visit http://localhost:3000
4. Create your first AI app!

---

**Built with ❤️ by Raj Shah**
