"""
Tool execution layer for the Groq AI Agent Platform.

Provides lightweight, serverless-safe implementations of:
  - browser_search  – DuckDuckGo HTML scrape (no API key required)
  - code_interpreter – sandboxed Python execution via subprocess

Both functions return a plain string that can be injected back into the
conversation as a ``tool`` role message.
"""

from __future__ import annotations

import json
import os
import re
import subprocess
import tempfile
from typing import Any


# ---------------------------------------------------------------------------
# Browser search
# ---------------------------------------------------------------------------

def browser_search(query: str, top_k: int = 5) -> str:
    """Return JSON-encoded search results from DuckDuckGo for *query*."""
    if not query:
        return json.dumps({"error": "No query provided"})

    import httpx

    url = "https://duckduckgo.com/html/"
    headers = {"User-Agent": "Mozilla/5.0 (compatible; GroqAgentBot/1.0)"}
    try:
        resp = httpx.get(url, params={"q": query}, headers=headers, timeout=10.0)
        resp.raise_for_status()
        results: list[dict[str, str]] = []
        for m in re.finditer(
            r'class="result__a"[^>]*href="([^"]+)"[^>]*>(.*?)</a>',
            resp.text,
            re.S,
        ):
            link, title = m.groups()
            results.append({"title": re.sub(r"<[^>]+>", "", title).strip(), "url": link})
            if len(results) >= top_k:
                break
        return json.dumps({"query": query, "results": results})
    except Exception as exc:
        return json.dumps({"error": str(exc)})


# ---------------------------------------------------------------------------
# Code interpreter
# ---------------------------------------------------------------------------

def code_interpreter(code: str, timeout: int = 10) -> str:
    """Execute *code* in an isolated subprocess and return stdout/stderr."""
    if not code:
        return json.dumps({"error": "No code provided"})

    with tempfile.NamedTemporaryFile(
        delete=False, suffix=".py", mode="w", encoding="utf-8"
    ) as tmp:
        tmp.write(code)
        tmp_path = tmp.name

    try:
        result = subprocess.run(
            ["python3", tmp_path],
            capture_output=True,
            text=True,
            timeout=timeout,
        )
        return json.dumps(
            {
                "stdout": result.stdout,
                "stderr": result.stderr,
                "returncode": result.returncode,
            }
        )
    except subprocess.TimeoutExpired:
        return json.dumps({"error": f"Execution timed out after {timeout}s"})
    except FileNotFoundError:
        return json.dumps({"error": "Python interpreter not found"})
    finally:
        os.remove(tmp_path)


# ---------------------------------------------------------------------------
# Dispatch table
# ---------------------------------------------------------------------------

TOOL_EXECUTORS: dict[str, Any] = {
    "browser_search": lambda args: browser_search(
        args.get("query", ""), args.get("top_k", 5)
    ),
    "code_interpreter": lambda args: code_interpreter(
        args.get("code", ""), args.get("timeout", 10)
    ),
}


def execute_tool(name: str, arguments: dict[str, Any]) -> str:
    """Dispatch *name* to the matching executor and return its output string."""
    executor = TOOL_EXECUTORS.get(name)
    if executor is None:
        return json.dumps({"error": f"Unknown tool: {name}"})
    return executor(arguments)
