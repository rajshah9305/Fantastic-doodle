# Universal NLP Interface

A production-ready full-stack application powered by Groq API for natural language processing tasks. This repository features a unified architecture optimized for Vercel deployment.

## Architecture

- **Frontend**: React + Vite + Tailwind CSS (located in `src/`)
- **Backend**: FastAPI (Python) running as Vercel Serverless Functions (located in `api/`)
- **Deployment**: Configured for Vercel via `vercel.json`

## Features

- **Real-time Chat**: AI-powered chat with streaming support (SSE).
- **Model Selection**: Choose from 5+ Groq models (Llama 3.3, Mixtral, Gemma, etc.).
- **Intent Detection**: Automatic routing of requests based on text analysis.
- **Pipeline & Dashboard**: Monitor AI execution and history.
- **Production-Ready**: Secure API key handling and rate limiting.

## Quick Start

### Local Development

1. **Install Dependencies**:
   ```bash
   npm install
   pip install -r requirements.txt
   ```

2. **Environment Variables**:
   Create a `.env` file based on `.env.example`:
   ```bash
   VITE_API_URL=http://localhost:3000
   GROQ_API_KEY=your_groq_api_key
   ```

3. **Run Application**:
   For development, use npm dev scripts.
   The frontend will be at http://localhost:5173 and the API at http://localhost:3000/api.

### Vercel Deployment

1. Connect this repository to Vercel.
2. Set `GROQ_API_KEY` in the Vercel Dashboard.
3. Vercel will automatically build and deploy the application.

## API Endpoints

- `GET /api/models`: List available models.
- `POST /api/chat`: Streaming chat completion.
- `POST /api/process`: Process text with intent detection.

## Legacy Code

Unused code from previous iterations is preserved in the `legacy/` directory for reference.
