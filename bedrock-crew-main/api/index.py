"""
Vercel serverless entry point.

Self-contained FastAPI app using only the lightweight deps in root
requirements.txt (fastapi, pydantic, groq, httpx, slowapi).
The backend/ directory with crewai/langchain is not used here — those
deps exceed Vercel's 250 MB limit.
"""
import re
import json
import time
import logging
import os
from enum import Enum
from typing import Any, Dict, List, Optional, Tuple

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel, Field, field_validator
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from groq import AsyncGroq

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Models config
# ---------------------------------------------------------------------------

GROQ_MODELS = {
    "openai/gpt-oss-120b": {
        "name": "GPT OSS 120B",
        "description": "Most powerful model with reasoning and tools support",
        "max_tokens": 65536,
        "supports_reasoning": True,
        "supports_tools": True,
    },
    "llama-3.3-70b-versatile": {
        "name": "Llama 3.3 70B Versatile",
        "description": "Most versatile model for complex tasks",
        "max_tokens": 32768,
        "supports_reasoning": False,
        "supports_tools": False,
    },
    "llama-3.1-70b-versatile": {
        "name": "Llama 3.1 70B Versatile",
        "description": "High performance model with large context",
        "max_tokens": 32768,
        "supports_reasoning": False,
        "supports_tools": False,
    },
    "llama-3.1-8b-instant": {
        "name": "Llama 3.1 8B Instant",
        "description": "Extremely fast for simple tasks",
        "max_tokens": 8192,
        "supports_reasoning": False,
        "supports_tools": False,
    },
    "mixtral-8x7b-32768": {
        "name": "Mixtral 8x7B",
        "description": "High-quality Mixture of Experts model",
        "max_tokens": 32768,
        "supports_reasoning": False,
        "supports_tools": False,
    },
    "gemma2-9b-it": {
        "name": "Gemma 2 9B IT",
        "description": "Efficient and high-quality model from Google",
        "max_tokens": 8192,
        "supports_reasoning": False,
        "supports_tools": False,
    },
}

DEFAULT_MODEL = "llama-3.3-70b-versatile"

# ---------------------------------------------------------------------------
# Intent detection
# ---------------------------------------------------------------------------

class IntentType(str, Enum):
    SUMMARIZATION = "summarization"
    TRANSLATION = "translation"
    SENTIMENT = "sentiment"
    ENTITY_EXTRACTION = "entity_extraction"
    TEXT_GENERATION = "text_generation"
    CUSTOM = "custom"


_INTENT_PATTERNS: Dict[IntentType, list] = {
    IntentType.SUMMARIZATION: [
        r"\b(summarize|summary|tldr|brief|condense|overview)\b",
        r"\bsum(marize)?\s+(this|the|following)\b",
    ],
    IntentType.TRANSLATION: [
        r"\b(translate|translation|convert)\b.*\b(to|into|in)\b.*\b(language|english|spanish|french|german|chinese|japanese)\b",
        r"\b(english|spanish|french|german|chinese|japanese)\s+to\s+(english|spanish|french|german|chinese|japanese)\b",
    ],
    IntentType.SENTIMENT: [
        r"\b(sentiment|emotion|feeling|tone|mood)\b",
        r"\b(positive|negative|neutral)\b.*\b(analysis|analyze)\b",
        r"\banalyze\b.*\b(sentiment|emotion|feeling)\b",
    ],
    IntentType.ENTITY_EXTRACTION: [
        r"\b(extract|find|identify|list)\b.*\b(entities|names|people|organizations|locations|dates)\b",
        r"\b(named entity|ner|entity recognition)\b",
    ],
    IntentType.TEXT_GENERATION: [
        r"\b(generate|create|write|compose|draft)\b",
        r"\b(story|article|essay|email|letter|content)\b",
    ],
}

_SYSTEM_PROMPTS: Dict[IntentType, str] = {
    IntentType.SUMMARIZATION: "You are an expert at summarizing text. Provide a clear, concise summary that captures the key points.",
    IntentType.TRANSLATION: "You are an expert translator. Translate the text accurately while preserving meaning and tone.",
    IntentType.SENTIMENT: "You are an expert at sentiment analysis. Analyze the sentiment and provide a clear assessment (positive, negative, or neutral) with reasoning.",
    IntentType.ENTITY_EXTRACTION: "You are an expert at named entity recognition. Extract and list all relevant entities (people, organizations, locations, dates, etc.) from the text.",
    IntentType.TEXT_GENERATION: "You are an expert writer. Generate high-quality, coherent text based on the request.",
    IntentType.CUSTOM: "You are a highly capable AI assistant with expertise in natural language processing. Understand the user's request and provide accurate, helpful, and comprehensive responses.",
}


def detect_intent(text: str) -> Tuple[IntentType, float]:
    text_lower = text.lower()
    scores: Dict[IntentType, float] = {}
    for intent, patterns in _INTENT_PATTERNS.items():
        score = sum(1 for p in patterns if re.search(p, text_lower, re.IGNORECASE))
        if score > 0:
            scores[intent] = score / len(patterns)
    if scores:
        best = max(scores.items(), key=lambda x: x[1])
        return best[0], best[1]
    return IntentType.CUSTOM, 0.5

# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------

class ProcessOptions(BaseModel):
    temperature: Optional[float] = None
    max_tokens: Optional[int] = None
    top_p: Optional[float] = None
    enable_search: bool = False
    enable_code: bool = False


class ProcessRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=100000)
    api_key: str = Field(..., min_length=10)
    model: Optional[str] = Field(None)
    options: ProcessOptions = Field(default_factory=ProcessOptions)

    @field_validator("text")
    @classmethod
    def sanitize_text(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Text cannot be empty")
        return v.strip()

    @field_validator("api_key")
    @classmethod
    def validate_api_key(cls, v: str) -> str:
        if not v.startswith("gsk_"):
            raise ValueError("Invalid Groq API key format")
        return v


class ProcessResponse(BaseModel):
    intent: str
    result: str
    model: str
    tokens_used: Optional[int] = None
    processing_time: float
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)



class ChatMessage(BaseModel):
    role: str
    content: Optional[str] = None
    tool_call_id: Optional[str] = None
    tool_calls: Optional[List[Dict[str, Any]]] = None


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    api_key: str
    model: str = "llama-3.3-70b-versatile"
    tools: Optional[List[Dict[str, Any]]] = None


class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
    code: str

# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------

RATE_LIMIT = os.environ.get("RATE_LIMIT_PER_MINUTE", "20")
CORS_ORIGINS = os.environ.get(
    "CORS_ORIGINS",
    "http://localhost:5173,http://localhost:3000"
).split(",")

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="Universal NLP Interface API",
    description="NLP interface powered by Groq",
    version="1.0.0",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": time.time()}


@app.get("/api/models")
async def list_models():
    return {
        "models": [
            {
                "id": model_id,
                "name": cfg["name"],
                "description": cfg["description"],
                "max_tokens": cfg["max_tokens"],
                "supports_reasoning": cfg["supports_reasoning"],
                "supports_tools": cfg["supports_tools"],
            }
            for model_id, cfg in GROQ_MODELS.items()
        ]
    }



def _build_groq_messages(messages: List[ChatMessage]) -> List[Dict[str, Any]]:
    """Convert pydantic messages to Groq-compatible dicts."""
    result = []
    for m in messages:
        msg: Dict[str, Any] = {"role": m.role}
        if m.content is not None:
            msg["content"] = m.content
        else:
            msg["content"] = ""
        if m.tool_call_id:
            msg["tool_call_id"] = m.tool_call_id
        if m.tool_calls:
            msg["tool_calls"] = m.tool_calls
        result.append(msg)
    return result


@app.post("/api/chat")
@limiter.limit(f"{RATE_LIMIT}/minute")
async def chat_stream(request: Request, payload: ChatRequest):
    """Streaming chat endpoint — returns SSE with tool_calls support."""
    client = AsyncGroq(api_key=payload.api_key)

    async def event_stream():
        try:
            kwargs: Dict[str, Any] = dict(
                model=payload.model,
                messages=_build_groq_messages(payload.messages),
                stream=True,
                max_tokens=4096,
            )
            if payload.tools:
                kwargs["tools"] = payload.tools
                kwargs["tool_choice"] = "auto"

            stream = await client.chat.completions.create(**kwargs)
            async for chunk in stream:
                if not chunk.choices:
                    continue
                delta = chunk.choices[0].delta

                out: Dict[str, Any] = {}

                if delta.content:
                    out["content"] = delta.content

                # Forward tool_calls deltas
                if hasattr(delta, "tool_calls") and delta.tool_calls:
                    tc_list = []
                    for tc in delta.tool_calls:
                        tc_dict: Dict[str, Any] = {"index": tc.index}
                        if tc.id:
                            tc_dict["id"] = tc.id
                        if tc.function:
                            tc_dict["function"] = {}
                            if tc.function.name:
                                tc_dict["function"]["name"] = tc.function.name
                            if tc.function.arguments:
                                tc_dict["function"]["arguments"] = tc.function.arguments
                        tc_list.append(tc_dict)
                    out["tool_calls"] = tc_list

                if out:
                    data = json.dumps({"choices": [{"delta": out}]})
                    yield f"data: {data}\n\n"

            yield "data: [DONE]\n\n"
        except Exception as e:
            err = json.dumps({"error": str(e)})
            yield f"data: {err}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        }
    )


@app.post(
    "/api/process",
    response_model=ProcessResponse,
    responses={
        400: {"model": ErrorResponse},
        429: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def process_text(request: Request, payload: ProcessRequest):
    start = time.time()
    try:
        model_id = payload.model if payload.model and payload.model in GROQ_MODELS else DEFAULT_MODEL
        intent, _ = detect_intent(payload.text)
        system_prompt = _SYSTEM_PROMPTS.get(intent, _SYSTEM_PROMPTS[IntentType.CUSTOM])

        client = AsyncGroq(api_key=payload.api_key)
        completion = await client.chat.completions.create(
            model=model_id,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": payload.text},
            ],
            temperature=payload.options.temperature or 0.7,
            max_tokens=payload.options.max_tokens or 2048,
        )

        result_text = completion.choices[0].message.content or ""
        tokens = completion.usage.total_tokens if completion.usage else None

        return ProcessResponse(
            intent=intent.value,
            result=result_text,
            model=model_id,
            tokens_used=tokens,
            processing_time=round(time.time() - start, 3),
            metadata={"system_prompt": system_prompt},
        )

    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error("Processing error: %s", e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while processing your request",
        )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail, "code": f"HTTP_{exc.status_code}"},
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled exception: %s", exc, exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"error": "Internal server error", "code": "INTERNAL_ERROR"},
    )
