"""
FastAPI application for the Groq AI Agent Platform.

Endpoints
---------
GET  /api/models   – list available models and their metadata
POST /api/chat     – stream a multi-turn chat completion (SSE)

Request body for /api/chat:
  {
    "messages": [{"role": "user", "content": "..."}],
    "model":    "<model-id>"   // optional, defaults to DEFAULT_MODEL
  }

Responses are streamed as Server-Sent Events:
  data: <text chunk>\\n\\n
  data: [DONE]\\n\\n

Tool calls returned by the model are executed locally and their results are
injected back into the conversation before the model continues.
"""

from __future__ import annotations

import json
import os
from typing import AsyncIterator

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel, Field

from .client import GroqStreamClient
from .config import DEFAULT_MODEL, MODELS
from .tools import execute_tool

load_dotenv()

app = FastAPI(title="Groq AI Agent Platform", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _get_client() -> GroqStreamClient:
    api_key = os.getenv("GROQ_API_KEY", "")
    if not api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured")
    return GroqStreamClient(api_key=api_key)


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[Message]
    model: str = Field(default=DEFAULT_MODEL)


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/api/models")
async def list_models() -> JSONResponse:
    """Return available models with display metadata."""
    payload = [
        {
            "id": model_id,
            "label": cfg.get("label", model_id),
            "supports_tools": cfg.get("supports_tools", False),
            "max_tokens": cfg.get("max_completion_tokens", 0),
        }
        for model_id, cfg in MODELS.items()
    ]
    return JSONResponse(content=payload)


@app.post("/api/chat")
async def chat_endpoint(req: ChatRequest) -> StreamingResponse:
    """Stream a chat completion as Server-Sent Events."""
    model_id = req.model
    if model_id not in MODELS:
        raise HTTPException(status_code=400, detail=f"Unknown model: {model_id}")

    config = MODELS[model_id]
    client = _get_client()
    messages: list[dict] = [m.model_dump() for m in req.messages]

    async def event_stream() -> AsyncIterator[str]:
        current_messages = list(messages)
        max_tool_rounds = 5

        for _round in range(max_tool_rounds):
            full_response = ""
            tool_call_buffer = ""
            in_tool_call = False
            got_tool_call = False

            async for chunk in client.stream_chat_async(model_id, current_messages, config):
                # ── Tool-call detection ──────────────────────────────────────
                # The Groq API may return tool calls as a JSON array in the
                # content stream.  We detect the opening bracket and buffer
                # until we have a complete, parseable JSON array.
                if not in_tool_call:
                    stripped = (full_response + chunk).lstrip()
                    if stripped.startswith("[{") or stripped.startswith("[  {"):
                        in_tool_call = True
                        tool_call_buffer = stripped
                        full_response = ""
                        continue

                if in_tool_call:
                    tool_call_buffer += chunk
                    try:
                        calls = json.loads(tool_call_buffer)
                        got_tool_call = True
                        in_tool_call = False
                        for call in calls:
                            name = call.get("name", "")
                            args = call.get("arguments", {})
                            if isinstance(args, str):
                                try:
                                    args = json.loads(args)
                                except json.JSONDecodeError:
                                    args = {"input": args}
                            result = execute_tool(name, args)
                            tool_line = f"[TOOL:{name}] {result}"
                            yield f"data: {tool_line}\n\n"
                            current_messages.append(
                                {
                                    "role": "tool",
                                    "content": result,
                                    "tool_call_id": call.get("id", name),
                                }
                            )
                        break
                    except json.JSONDecodeError:
                        continue
                elif chunk.startswith("\x00R:"):
                    # Reasoning token – forward with a distinct event type.
                    reasoning_text = chunk[3:]
                    yield f"event: reasoning\ndata: {reasoning_text}\n\n"
                else:
                    full_response += chunk
                    yield f"data: {chunk}\n\n"

            if not got_tool_call:
                # Normal completion – no more rounds needed.
                break

            # Append the assistant's accumulated text (if any) before tool results.
            if full_response:
                current_messages.append({"role": "assistant", "content": full_response})

        yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
