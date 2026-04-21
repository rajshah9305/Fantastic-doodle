# No-Code AI App Builder

Transform natural language descriptions into fully functional web applications using AI. Powered by Groq and Llama 3.

## Features

- **Natural Language App Generation**: Describe your app idea and watch it come to life.
- **Real-time Preview**: See changes instantly as the AI generates code.
- **AI Chat Assistant**: Modify and refine your apps using chat instructions.
- **Type-safe API**: Built with tRPC for end-to-end type safety.
- **Modern Tech Stack**: React 18, Tailwind 4, TypeScript, and Drizzle ORM.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Framer Motion, Lucide Icons
- **Backend**: Node.js, Express, tRPC
- **AI**: Groq SDK (Llama 3.3 70B)
- **Database**: Drizzle ORM, PostgreSQL (Postgres.js)
- **Deployment**: Optimized for Vercel

## Getting Started

### Prerequisites

- Node.js 24.x or later
- A Groq API Key (get one at [console.groq.com](https://console.groq.com))
- (Optional) A PostgreSQL database (e.g., Supabase)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/rajshah9305/Fantastic-doodle.git
   cd Fantastic-doodle
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Copy `.env.example` to `.env` and add your `GROQ_API_KEY`.
   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:3000`.

## Deployment

This project is optimized for deployment on Vercel. See the [Deployment Guide](DEPLOYMENT_GUIDE.md) for detailed instructions.

### Environment Variables for Vercel

Ensure the following environment variables are set in your Vercel project:

- `GROQ_API_KEY`: Your Groq API key (Required)
- `DATABASE_URL`: Your PostgreSQL connection string (Optional)
- `NODE_ENV`: Set to `production`

## Scripts

- `npm run dev`: Start development server with Vite and tsx watch
- `npm run build`: Type-check and build the client for production
- `npm run start`: Start the production server
- `npm run check`: Run TypeScript type-checking
- `npm run db:generate`: Generate database migrations

## License

MIT
