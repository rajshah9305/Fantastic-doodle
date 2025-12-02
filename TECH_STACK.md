# Tech Stack - No-Code AI App Builder

## Overview

A modern, full-stack application that transforms natural language descriptions into functional web applications using AI. Built with performance, type safety, and developer experience in mind.

---

## Core Architecture

### NLP to App Pipeline

```
User Input (NLP) → Groq API (LLM) → Code Generation → Live Preview → Refinement Loop
```

**Flow:**
1. User provides natural language description
2. Groq API processes with Llama 3.3 70B model
3. Structured prompt engineering generates HTML/CSS/JS
4. Real-time preview renders in sandboxed iframe
5. Iterative refinement through conversational AI

---

## Frontend Stack

### Core Framework
- **React 18.2** - UI library with concurrent features
- **TypeScript 5.3** - Type safety and developer experience
- **Vite 7.1** - Lightning-fast build tool and dev server

### Styling
- **Tailwind CSS 4.1** - Utility-first CSS framework
- **Tailwind Typography** - Beautiful typographic defaults
- **tailwindcss-animate** - Animation utilities
- **Framer Motion 12** - Production-ready animations

### UI Components
- **Radix UI** - Unstyled, accessible component primitives
  - Dialog, Tooltip, Slot components
- **Lucide React** - Beautiful, consistent icons
- **Monaco Editor** - VS Code's editor for code viewing/editing
- **Sonner** - Toast notifications

### State & Data Fetching
- **TanStack Query 5** - Async state management
- **tRPC React Query 11** - End-to-end typesafe APIs
- **Wouter 3.3** - Lightweight routing (3.7.1 with patches)

### Utilities
- **clsx** - Conditional className utility
- **class-variance-authority** - Component variant management
- **tailwind-merge** - Merge Tailwind classes intelligently
- **nanoid** - Unique ID generation

---

## Backend Stack

### Runtime & Framework
- **Node.js 20+** - JavaScript runtime
- **Express 4.21** - Web application framework
- **tRPC Server 11.6** - Type-safe API layer

### AI & NLP
- **Groq SDK 0.37** - Ultra-fast LLM inference
  - Model: Llama 3.3 70B Versatile
  - Speed: ~300 tokens/second
  - Context: 8K tokens
- **Custom Prompt Engineering** - Structured code generation prompts

### Database (Optional)
- **SQLite** - Embedded database
- **better-sqlite3 11.7** - Fast SQLite driver
- **Drizzle ORM 0.44** - Type-safe ORM
- **Drizzle Kit 0.31** - Schema migrations

### Utilities
- **dotenv 16.3** - Environment variable management
- **SuperJSON 1.13** - JSON serialization with type preservation
- **Zod 3.22** - Schema validation

---

## Build & Development Tools

### Build Tools
- **esbuild 0.25** - Extremely fast bundler for server code
- **tsx 4.19** - TypeScript execution for development
- **Vite 7.1** - Frontend bundler with HMR

### Code Quality
- **TypeScript 5.3** - Static type checking
- **Prettier 3.6** - Code formatting
- **Vitest 2.1** - Unit testing framework

### Deployment
- **Vercel** - Serverless deployment platform
  - Automatic deployments from GitHub
  - Edge functions for API routes
  - Zero-config setup

---

## Key Technical Decisions

### Why Groq?
- **Speed**: 10-100x faster than traditional LLM APIs
- **Cost**: Competitive pricing for high-volume usage
- **Quality**: Llama 3.3 70B provides excellent code generation
- **Reliability**: Consistent response times and uptime

### Why tRPC?
- **Type Safety**: End-to-end TypeScript without code generation
- **DX**: Autocomplete and type checking across client/server
- **Performance**: Minimal overhead, direct function calls
- **Simplicity**: No REST/GraphQL boilerplate

### Why SQLite + Drizzle?
- **Simplicity**: Single file database, no server needed
- **Performance**: Fast for read-heavy workloads
- **Type Safety**: Drizzle provides full TypeScript support
- **Portability**: Easy to migrate to PostgreSQL/MySQL if needed

### Why Vite?
- **Speed**: Instant server start with native ESM
- **HMR**: Fast hot module replacement
- **Modern**: Built for modern JavaScript ecosystem
- **Plugins**: Rich ecosystem (React, TypeScript, etc.)

---

## NLP Processing Architecture

### Prompt Engineering Strategy

**System Prompt:**
- Role definition (expert web developer)
- Output format specification (HTML/CSS/JS)
- Constraints (self-contained, no external dependencies)
- Best practices (responsive, accessible, modern)

**User Prompt Structure:**
```
Context: Previous conversation history
Task: User's natural language description
Requirements: Technical constraints
Output: Structured code format
```

### Code Generation Pipeline

1. **Input Sanitization**: Clean and validate user input
2. **Context Building**: Include conversation history
3. **Prompt Construction**: Build structured prompt
4. **LLM Inference**: Call Groq API with streaming
5. **Response Parsing**: Extract code from markdown
6. **Validation**: Basic syntax checking
7. **Delivery**: Stream to client in real-time

### Refinement Loop

- Conversational context maintained across requests
- Previous code included in refinement prompts
- Incremental changes rather than full regeneration
- User feedback incorporated into next iteration

---

## Performance Optimizations

### Frontend
- Code splitting with React.lazy
- Memoization with useMemo/useCallback
- Virtual scrolling for large code files
- Debounced user input
- Optimistic UI updates

### Backend
- Response streaming for real-time feedback
- Connection pooling for database
- Caching of common prompts
- Rate limiting to prevent abuse

### Deployment
- Edge functions for low latency
- Static asset CDN
- Automatic code minification
- Tree shaking for smaller bundles

---

## Security Considerations

### API Security
- API key stored in environment variables
- Rate limiting on endpoints
- Input validation with Zod schemas
- CORS configuration

### Code Execution
- Generated code runs in sandboxed iframe
- No server-side code execution
- CSP headers for XSS prevention
- Sanitized user inputs

### Data Privacy
- No user data stored on server (serverless mode)
- Optional local SQLite for persistence
- Session data in browser localStorage
- No tracking or analytics

---

## Scalability

### Current Architecture
- Serverless functions (auto-scaling)
- Stateless API design
- Client-side session management
- CDN for static assets

### Future Considerations
- Redis for session caching
- PostgreSQL for multi-user support
- WebSocket for real-time collaboration
- Queue system for long-running generations

---

## Development Workflow

```bash
# Local Development
npm run dev          # Start dev server (port 3000)
npm run check        # Type checking
npm run format       # Code formatting
npm test             # Run tests

# Database (Optional)
npm run db:push      # Apply schema changes

# Production Build
npm run build        # Build client + server
npm run start        # Start production server
```

---

## Environment Configuration

### Required
```env
GROQ_API_KEY=gsk_...    # Groq API key
```

### Optional
```env
DATABASE_URL=sqlite://db.sqlite  # Database connection
NODE_ENV=development             # Environment mode
PORT=3000                        # Server port
```

---

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Modern mobile browsers

**Requirements:**
- ES2020 support
- CSS Grid & Flexbox
- LocalStorage API
- Fetch API

---

## License

MIT License - Free for personal and commercial use

---

**Built by RAJ SHAH** | Powered by Groq & Llama 3.3
