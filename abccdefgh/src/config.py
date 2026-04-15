"""
Model configurations for the Groq AI Agent Platform.

Each entry maps a model ID to its exact API parameters as specified in the
official Groq documentation. Parameters are preserved verbatim from the
reference examples so callers never need to guess defaults.
"""

from typing import Any

# ---------------------------------------------------------------------------
# Model registry
# ---------------------------------------------------------------------------

MODELS: dict[str, dict[str, Any]] = {
    "openai/gpt-oss-120b": {
        "temperature": 1,
        "max_completion_tokens": 65536,
        "top_p": 1,
        "reasoning_effort": "medium",
        "stop": None,
        "tools": [{"type": "browser_search"}, {"type": "code_interpreter"}],
        "label": "GPT-OSS 120B (tools)",
        "supports_tools": True,
    },
    "llama-3.1-8b-instant": {
        "temperature": 1,
        "max_completion_tokens": 8192,
        "top_p": 1,
        "stop": None,
        "label": "Llama 3.1 8B Instant",
        "supports_tools": False,
    },
    "meta-llama/llama-4-scout-17b-16e-instruct": {
        "temperature": 1,
        "max_completion_tokens": 8192,
        "top_p": 1,
        "stop": None,
        "label": "Llama 4 Scout 17B",
        "supports_tools": False,
    },
    "moonshotai/kimi-k2-instruct-0905": {
        "temperature": 0.7,
        "max_completion_tokens": 16384,
        "top_p": 1,
        "stop": None,
        "label": "Kimi K2 Instruct",
        "supports_tools": False,
    },
    "llama-3.3-70b-versatile": {
        "temperature": 1,
        "max_completion_tokens": 32768,
        "top_p": 1,
        "stop": None,
        "label": "Llama 3.3 70B Versatile",
        "supports_tools": False,
    },
}

# Default model used when none is specified.
DEFAULT_MODEL = "openai/gpt-oss-120b"
