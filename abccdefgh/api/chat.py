"""
Vercel serverless entry-point.

Vercel's Python runtime expects a module-level ASGI/WSGI ``app`` object.
We re-export the FastAPI app from ``src.app`` so the entire application
logic lives in the importable ``src`` package while this thin shim satisfies
Vercel's file-based routing convention.

Route: /api/chat  →  POST  (streaming SSE)
Route: /api/models →  GET
"""

import sys
import os

# Ensure the project root is on sys.path so ``src`` is importable.
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from src.app import app  # noqa: F401  – re-exported for Vercel

# Local development convenience runner.
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("api.chat:app", host="0.0.0.0", port=8000, reload=True)
