# Groq AI Agent Platform

A production-ready full-stack application for chatting with AI models that can orchestrate and run agents, invoke tools (browser search, code interpreter), and stream responses in real time.

Built with Python 3.11 + FastAPI on the backend, Next.js on the frontend, and deployed serverlessly on Vercel — no Docker required.

---

## Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Backend   | Python 3.11, FastAPI, Groq SDK      |
| Frontend  | Next.js 14, React 18 (no extra deps)|
| Inference | Groq API                            |
| Deploy    | Vercel (serverless, no containers)  |

---

## Models

| Model ID                                        | Context  | Tools |
|-------------------------------------------------|----------|-------|
| `openai/gpt-oss-120b`                           | 65 536   | ✅    |
| `meta-llama/llama-4-maverick-17b-128e-instruct` | 8 192    | —     |
| `meta-llama/llama-4-scout-17b-16e-instruct`     | 8 192    | —     |
| `moonshotai/kimi-k2-instruct-0905`              | 16 384   | —     |
| `llama-3.3-70b-versatile`                       | 32 768   | —     |

---

## Local Setup

### 1. Clone & configure

```bash
git clone <repo-url>
cd <repo>
cp .env.example .env   # then add your GROQ_API_KEY
```

`.env`:
```
GROQ_API_KEY=your_key_here
```

### 2. Backend

```bash
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Run the API server:
```bash
python3 -m uvicorn api.chat:app --reload --port 8000
```

API available at `http://localhost:8000`
- `GET  /api/models` — list models
- `POST /api/chat`   — streaming chat (SSE)

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend at `http://localhost:3000`. The Next.js dev proxy forwards `/api/*` to the backend automatically.

---

## Deployment (Vercel)

1. Push to GitHub.
2. Import the repo in [vercel.com](https://vercel.com).
3. Add environment variable `GROQ_API_KEY` in project settings.
4. Deploy — `vercel.json` handles routing automatically.

No Dockerfile, no containers needed.

---

## API Reference

### POST /api/chat

```json
{
  "messages": [
    {"role": "system", "content": "You are a helpful agent."},
    {"role": "user",   "content": "Search for the latest AI news."}
  ],
  "model": "openai/gpt-oss-120b"
}
```

Response: `text/event-stream` (SSE)
```
data: Here are the latest...
data:  AI news stories:
data: [TOOL:browser_search] {"query": "latest AI news", "results": [...]}
data: Based on the search...
data: [DONE]
```

---

## Training Pipeline

The `training/` directory implements a 4-stage pipeline for fine-tuning models on agentic tasks. Each stage is a standalone CLI script.

### Stage 1 — Mid-Training Refinement

Continues pre-training on domain-specific corpora (agentic traces, tool-use examples, technical docs).

```bash
python -m training.mid_training \
  --base_model  meta-llama/Llama-3.1-8B \
  --dataset_path data/mid_train.jsonl \
  --output_dir   checkpoints/mid_trained \
  --epochs 1 --batch_size 4 --lr 2e-5
```

### Stage 2 — Supervised Fine-Tuning (SFT)

Fine-tunes on instruction-response pairs with instruction masking (loss only on assistant turns).

```bash
python -m training.sft \
  --base_model  checkpoints/mid_trained \
  --dataset_path data/sft.jsonl \
  --output_dir   checkpoints/sft \
  --epochs 3 --batch_size 2 --lr 1e-5
```

Dataset format:
```json
{"conversations": [
  {"role": "system",    "content": "You are a helpful agent."},
  {"role": "user",      "content": "What is 2+2?"},
  {"role": "assistant", "content": "4"}
]}
```

### Stage 3 — Reinforcement Fine-Tuning (RFT)

Trains a Bradley-Terry reward model on human preference pairs, then runs PPO with KL penalty.

```bash
python -m training.rft \
  --sft_model    checkpoints/sft \
  --dataset_path data/preferences.jsonl \
  --output_dir   checkpoints/rft \
  --ppo_epochs 4 --batch_size 8 --lr 1e-6
```

Dataset format:
```json
{"prompt": "Explain X", "chosen": "Good answer", "rejected": "Bad answer"}
```

### Stage 4 — Scalable Agentic RL

Uses GRPO (Group Relative Policy Optimisation) + Constitutional AI self-critique to train the model in a tool-use environment without a value network.

```bash
python -m training.rl \
  --rft_model    checkpoints/rft \
  --dataset_path data/agentic_tasks.jsonl \
  --output_dir   checkpoints/rl \
  --iterations 500 --group_size 8 --lr 5e-7
```

Dataset format:
```json
{"prompt": "Find the population of Tokyo.", "ground_truth": "13.96 million", "allowed_tools": ["browser_search"]}
```

---

## Project Structure

```
.
├── api/
│   └── chat.py              # Vercel serverless entry-point (re-exports src.app)
├── src/
│   ├── app.py               # FastAPI app, /api/chat + /api/models
│   ├── client.py            # Groq SDK wrapper (sync + async streaming)
│   ├── config.py            # Model registry with exact API parameters
│   └── tools.py             # browser_search + code_interpreter executors
├── frontend/
│   ├── pages/
│   │   ├── _app.js
│   │   └── index.js         # Full chat UI (streaming, tool badges, markdown)
│   ├── next.config.js       # Dev proxy → backend
│   └── package.json
├── training/
│   ├── mid_training.py      # Stage 1: domain adaptation
│   ├── sft.py               # Stage 2: instruction fine-tuning
│   ├── rft.py               # Stage 3: PPO / RLHF
│   └── rl.py                # Stage 4: GRPO + Constitutional AI
├── requirements.txt
├── vercel.json
└── .env
```
