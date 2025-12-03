# AI STUDIO - No-Code AI App Builder

Transform natural language descriptions into fully functional web applications using AI.

## 🚀 Features

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

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS 4, Radix UI
- **Backend**: Express.js, tRPC, Groq API (GPT-OSS-120B)
- **Database**: SQLite with Drizzle ORM (optional)
- **Build**: Vite, esbuild
- **Deployment**: Vercel

## 📦 Quick Start

### Prerequisites

- Node.js 18+ and npm/pnpm
- Groq API key ([Get one here](https://console.groq.com))

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd no-code-ai-app-builder

# Install dependencies
npm install
# or
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your GROQ_API_KEY

# (Optional) Initialize database for session persistence
npm run db:push

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

## 🌐 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=<your-repo-url>)

### Manual Deployment

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variable:
   - `GROQ_API_KEY`: Your Groq API key (required)
4. Deploy!

## 📝 Environment Variables

Create a `.env` file with:

```env
# Required
GROQ_API_KEY=your_groq_api_key_here

# Optional (for local session persistence)
DATABASE_URL=sqlite://db.sqlite
NODE_ENV=development
```

**Note**: The app works without a database in serverless environments (Vercel). Sessions are stored in browser localStorage.

## 🎯 Usage

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

## 📚 Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - Get started in 5 minutes
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Detailed technical documentation
- **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** - Upgrade guide for existing users
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Contribution guidelines

## 📁 Project Structure

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

## 🔧 Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run start     # Start production server
npm run db:push   # Push database schema changes (optional)
npm run check     # TypeScript type checking
npm run format    # Format code with Prettier
npm test          # Run tests
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- Powered by [Groq](https://groq.com) for lightning-fast AI inference
- UI components from [Radix UI](https://www.radix-ui.com)
- Icons from [Lucide](https://lucide.dev)
- Code editor by [Monaco Editor](https://microsoft.github.io/monaco-editor/)

---

**© 2024 AI STUDIO. Built with ❤️ using AI**
