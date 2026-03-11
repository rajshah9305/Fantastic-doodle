# Universal NLP Interface

A production-ready full-stack application powered by crewAI agents and Groq API for natural language processing tasks. Features a modern two-pane interface with live execution tracking and intelligent output rendering.

## Features

- **Universal NLP Interface**: Support for any natural language task
- **5 Groq AI Models**: Choose from Llama 3.3 70B, Llama 3.1 70B/8B, Mixtral 8x7B, and Gemma 2 9B
- **Automatic Intent Detection**: Routes tasks to appropriate processing (summarization, translation, sentiment analysis, entity extraction, text generation, custom)
- **Two-Pane Layout**: Live execution tracking (left) + generated output (right)
- **Real-Time Execution Logs**: Watch AI processing with timestamped, color-coded logs
- **Intelligent Output Rendering**: Automatic code detection with terminal-style display
- **crewAI Agent Orchestration**: Optional advanced processing with specialized agents
- **Secure API Key Handling**: Memory-only storage, never persisted
- **Rate Limiting**: Built-in protection with configurable limits
- **Production-Ready**: Optimized for Vercel serverless deployment

## Architecture

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: FastAPI + Groq API + optional crewAI
- **Deployment**: Vercel-optimized (lightweight dependencies for serverless)

### Two-Pane Interface
```
┌─────────────────────────────────────────────────────┐
│         Header: Logo | API Key                      │
├──────────────────────┬──────────────────────────────┤
│   Execution Pane     │      Output Pane             │
│   • Real-time logs   │  • Generated output          │
│   • Execution history│  • Code/text detection       │
│   • Status tracking  │  • Terminal-style rendering  │
├──────────────────────┴──────────────────────────────┤
│   Chat Input: Model Selector | Text Input | Execute │
└─────────────────────────────────────────────────────┘
```

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.11 (required for crewAI)
- Groq API key ([Get one here](https://console.groq.com))

### Automated Setup

```bash
chmod +x setup.sh
./setup.sh
```

### Manual Setup

#### Backend

```bash
cd backend
python3.11 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your configuration
uvicorn app.main:app --reload
```

Backend runs on `http://localhost:8000`

#### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with backend URL
npm run dev
```

Frontend runs on `http://localhost:5173`

## API Endpoints

### GET /api/models

List all available Groq models.

**Response:**
```json
{
  "models": [
    {
      "id": "llama-3.3-70b-versatile",
      "name": "Llama 3.3 70B Versatile",
      "description": "Most versatile model for complex tasks",
      "max_tokens": 32768,
      "supports_reasoning": false,
      "supports_tools": false
    }
  ]
}
```

### POST /api/process

Process natural language requests with automatic intent detection.

**Request:**
```json
{
  "text": "Your NLP task in natural language",
  "api_key": "gsk_...",
  "model": "llama-3.3-70b-versatile",
  "options": {
    "temperature": 0.7,
    "max_tokens": 8192,
    "top_p": 1,
    "enable_search": false,
    "enable_code": false
  }
}
```

**Response:**
```json
{
  "intent": "custom",
  "result": "...",
  "model": "llama-3.3-70b-versatile",
  "tokens_used": 150,
  "processing_time": 1.23,
  "metadata": {
    "confidence": 0.8,
    "model_name": "Llama 3.3 70B Versatile"
  }
}
```

## Environment Variables

### Backend (.env)

```env
ENVIRONMENT=development
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
RATE_LIMIT_PER_MINUTE=20
DEFAULT_GROQ_MODEL=llama-3.3-70b-versatile
LOG_LEVEL=INFO
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:8000
```

## Vercel Deployment

### One-Click Deploy

1. **Import to Vercel**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Vercel auto-detects configuration from `vercel.json`

2. **Add Environment Variables**
   - `GROQ_API_KEY`: Your Groq API key (optional, can be entered in UI)
   - `VITE_API_URL`: Leave empty for auto-detection
   - `CORS_ORIGINS`: Your Vercel URL (update after first deploy)

3. **Deploy**
   - Click "Deploy" and wait 2-3 minutes
   - Note your deployment URL

4. **Update CORS (Optional)**
   - Update `CORS_ORIGINS` environment variable with your Vercel URL
   - Redeploy to apply changes

### How It Works

- **Frontend**: Built with Vite, served as static files
- **Backend**: Runs as Vercel serverless functions via `/api/*` routes
- **Auto-scaling**: Vercel handles scaling automatically
- **Lightweight**: Uses direct Groq API calls to stay within 250MB serverless limit
- **crewAI**: Available for local development with full `backend/requirements.txt`

## Project Structure

```
.
├── api/                    # Vercel serverless function entry point
│   └── index.py           # Routes to backend app
├── backend/               # FastAPI backend
│   ├── app/
│   │   ├── main.py       # FastAPI application
│   │   ├── processor.py  # NLP processing logic
│   │   ├── models.py     # Pydantic models
│   │   ├── config.py     # Configuration
│   │   ├── intent_detector.py
│   │   ├── models_config.py
│   │   └── retry_handler.py
│   └── requirements.txt  # Python dependencies (full)
├── frontend/              # React frontend
│   ├── src/
│   │   ├── App.jsx       # Main application
│   │   ├── components/   # React components
│   │   └── index.css     # Tailwind styles
│   ├── package.json
│   └── vite.config.js
├── requirements.txt       # Python dependencies (Vercel-optimized)
├── vercel.json           # Vercel configuration
├── runtime.txt           # Python version
└── setup.sh              # Automated setup script
```

## Features in Detail

### Intent Detection

Automatically detects and routes tasks:
- **Summarization**: Text summarization and condensing
- **Translation**: Language translation
- **Sentiment Analysis**: Emotion and tone detection
- **Entity Extraction**: Named entity recognition
- **Text Generation**: Creative content writing
- **Custom**: General-purpose AI assistance

### crewAI Integration

When confidence is high and crewAI is available, tasks are routed to specialized agents:
- Specialized agent roles based on intent
- Optional web search capability
- Optional code execution
- Automatic fallback to direct Groq API

### Security

- API keys stored in memory only, never persisted
- Input sanitization and validation
- Rate limiting per session (20 requests/minute default)
- CORS configuration for production
- No sensitive data logging

## Development

### Running Tests

```bash
cd backend
source venv/bin/activate
pytest
```

### Code Quality

```bash
# Backend
cd backend
ruff check .
black .

# Frontend
cd frontend
npm run lint
```

## Troubleshooting

### crewAI Not Available

If you see "crewAI dependencies not available" warnings, this is normal for Vercel deployment. The app will automatically fall back to direct Groq API calls.

For local development with full crewAI features:
```bash
cd backend
pip install -r requirements.txt
```

### CORS Errors

Update `CORS_ORIGINS` in backend/.env to include your frontend URL.

### Rate Limiting

Adjust `RATE_LIMIT_PER_MINUTE` in backend/.env if needed.

## License

MIT License - see LICENSE file for details

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
