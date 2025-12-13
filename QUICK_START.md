# ⚡ Quick Start Guide

## 1️⃣ Setup (5 minutes)

```bash
# Clone & install
cd /path/to/Fantastic-doodle-main
npm install

# Create .env file
echo "NODE_ENV=development" > .env
echo "GROQ_API_KEY=your_api_key_here" >> .env
echo "PORT=3000" >> .env
```

## 2️⃣ Start Server (1 command)

```bash
npm run dev
```

Open browser: **http://localhost:3000**

## 3️⃣ Verify Working

**Test Generation:**
```
1. Type: "Create a calculator app"
2. Click "Initialize"
3. See app generated ✅
```

**Test Mobile UI:**
```
1. Open DevTools → Device toolbar
2. Select "iPhone 12"
3. See "Generate" tab selected
4. Click "Preview" tab
5. See live preview ✅
```

**Test Modification:**
```
1. In Editor, switch to "Generate" tab
2. Type: "Make buttons bigger"
3. Watch preview update ✅
```

---

## 🗂️ Project Structure (TL;DR)

```
Frontend (React)        Backend (Express)      Data
├── Home.tsx           ├── routers/           └── PostgreSQL
├── Editor.tsx    ↔    │   └── apps.ts   ↔    (optional)
├── Dashboard.tsx      ├── db.ts
└── AppViewer.tsx      ├── groqClient.ts
                       └── _core/index.ts
```

---

## 🎯 Common Commands

```bash
npm run dev         # Start dev server (watches files)
npm run check       # TypeScript type check
npm run build       # Production build
npm run db:push     # Apply database migrations
npm run db:studio   # GUI for database (if connected)
```

---

## 🔑 API Endpoints (Used by Frontend)

All endpoints go through tRPC at `/api/trpc`:

```typescript
// Generate new app
trpc.apps.generate({ prompt, sessionId })

// Get all apps
trpc.apps.list()

// Get specific app
trpc.apps.get({ id })

// Modify existing app
trpc.apps.modify({ id, instruction })

// Save changes
trpc.apps.update({ id, ...fields })

// Delete app
trpc.apps.delete({ id })
```

---

## 📱 Mobile UI (NEW!)

**Editor Page on Mobile:**
- Tab 1: "Generate" (AI Chat) - **DEFAULT**
- Tab 2: "Preview" (Live Preview)

**Editor Page on Desktop:**
- Left side: Code editor
- Right side: Tabs with Preview & AI Chat

---

## 🚨 Troubleshooting

| Problem | Solution |
|---------|----------|
| "GROQ_API_KEY missing" | Add it to `.env` file |
| Port 3000 busy | Change `PORT=3001` in `.env` |
| Blank page | Check browser console for errors |
| Preview shows nothing | Verify Groq API key is valid |
| TypeScript errors | Run `npm run check` to see them |

---

## 💡 Key Files to Know

| File | What It Does |
|------|--------------|
| `client/src/pages/Editor.tsx` | Main editor (tabbed on mobile) |
| `server/routers/apps.ts` | All API endpoints |
| `server/groqClient.ts` | Groq AI integration |
| `client/src/main.tsx` | App initialization |
| `vite.config.ts` | Build config |

---

## 🔄 How It Works (Simplified)

```
User enters prompt in Home.tsx
    ↓
Sends to backend via tRPC
    ↓
Backend calls Groq AI API
    ↓
Groq returns HTML/CSS/JS as JSON
    ↓
Backend saves to database
    ↓
Returns to frontend
    ↓
Frontend displays in Editor with:
  • Code editor (read-only on save)
  • Live preview in iframe
  • AI chat for modifications
```

---

## ✅ Verification Checklist

Before deploying, verify:

- [ ] `npm run check` passes (0 TypeScript errors)
- [ ] `npm run dev` starts without errors
- [ ] Can generate an app from prompt
- [ ] Can modify app with AI chat
- [ ] Can download generated app
- [ ] Mobile tabs work (Generate/Preview)
- [ ] GROQ_API_KEY is valid

---

## 🎨 Tech Stack at a Glance

**Frontend:**
- React 18 (UI)
- TypeScript (Type safety)
- Vite (Build)
- Tailwind CSS (Styling)
- tRPC (API client)

**Backend:**
- Node.js + Express (Server)
- tRPC (API router)
- Groq SDK (AI)
- Drizzle ORM (Database)

**Database:** PostgreSQL (optional, has fallback)

---

## 📞 Getting Help

Check browser console for errors:
```
Press F12 → Console tab → Look for red errors
```

Check server logs:
```
Terminal where you ran npm run dev
Look for [Server], [Database], [Groq] logs
```

---

## 🎉 You're Ready!

```bash
npm run dev
# Then open http://localhost:3000
```

**Start building AI-powered apps! 🚀**

---

*For detailed info, see CODEBASE_GUIDE.md*
