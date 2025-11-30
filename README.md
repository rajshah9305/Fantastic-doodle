# No-Code AI App Builder

Transform natural language descriptions into fully functional web applications instantly using AI.

## 🚀 Features

- **AI-Powered Generation**: Describe your app idea and get complete HTML, CSS, and JavaScript code
- **Live Preview**: See your app running in real-time as you generate it
- **Code Editor**: View and edit generated code with Monaco Editor
- **AI Chat Modifications**: Refine your app using natural language commands
- **Export & Download**: Download your app as a standalone HTML file
- **Session Persistence**: Your apps are saved to your browser session
- **Modern UI**: Beautiful, responsive design with dark mode support

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS 4, shadcn/ui
- **Backend**: Express.js, tRPC, Groq API (Llama 3.3 70B)
- **Database**: SQLite with Drizzle ORM
- **Build**: Vite, esbuild
- **Deployment**: Vercel

## 📦 Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- Groq API key ([Get one here](https://console.groq.com))

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd no-code-ai-app-builder

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your GROQ_API_KEY

# Initialize database
pnpm db:push

# Start development server
pnpm dev
```

The app will be available at `http://localhost:3000`

## 🌐 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=<your-repo-url>)

### Manual Deployment

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables:
   - `GROQ_API_KEY`: Your Groq API key
   - `DATABASE_URL`: `sqlite://db.sqlite`
   - `JWT_SECRET`: Any random string
   - `NODE_ENV`: `production`
4. Deploy!

## 📝 Environment Variables

Create a `.env` file with:

```env
GROQ_API_KEY=your_groq_api_key_here
DATABASE_URL=sqlite://db.sqlite
JWT_SECRET=your_random_secret_key
NODE_ENV=development
```

## 🎯 Usage

1. **Describe Your App**: Enter a natural language description of what you want to build
2. **Generate**: Press Enter or click the Generate button
3. **View & Edit**: See your code and live preview side by side
4. **Refine**: Use the AI chat to make modifications
5. **Export**: Download your app as a standalone HTML file

### Example Prompts

- "A todo list app with add, delete, and mark complete functionality"
- "A calculator with basic arithmetic operations and a modern design"
- "A weather dashboard showing temperature, humidity, and forecast"
- "A timer app with start, stop, and reset buttons"

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
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm db:push      # Push database schema changes
pnpm check        # TypeScript type checking
pnpm format       # Format code with Prettier
pnpm test         # Run tests
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- Powered by [Groq](https://groq.com) for lightning-fast AI inference
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide](https://lucide.dev)

---

**Built with ❤️ using AI**
