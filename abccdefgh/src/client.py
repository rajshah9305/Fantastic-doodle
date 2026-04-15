"""
Groq API client wrapper for the AI Agent Platform.

Wraps the official ``groq`` SDK to provide:
  - Synchronous streaming  (``stream_chat``)
  - Async-friendly streaming via a thread executor (``stream_chat_async``)

The caller passes the full model config dict from ``src.config.MODELS``; this
module strips internal-only keys (``label``, ``supports_tools``) before
forwarding to the SDK so the API never receives unexpected parameters.
"""

from __future__ import annotations

import asyncio
from typing import AsyncIterator, Iterator

from groq import Groq

# Keys that exist only in our config registry and must not be sent to the API.
_INTERNAL_KEYS = {"label", "supports_tools"}


def _build_params(model: str, messages: list, config: dict) -> dict:
    """Return a clean parameter dict ready for ``client.chat.completions.create``."""
    params = {k: v for k, v in config.items() if k not in _INTERNAL_KEYS}
    # Drop empty tools list – some models reject an explicit empty array.
    if "tools" in params and params["tools"] == []:
        del params["tools"]
    params["model"] = model
    params["messages"] = messages
    params["stream"] = True
    return params


class GroqStreamClient:
    """Thin wrapper around the Groq SDK that yields text chunks."""

    def __init__(self, api_key: str) -> None:
        self._client = Groq(api_key=api_key)

    # ------------------------------------------------------------------
    # Synchronous streaming
    # ------------------------------------------------------------------

    def stream_chat(
        self, model: str, messages: list, config: dict
    ) -> Iterator[str]:
        """Yield text delta chunks from a streaming Groq completion.

        Reasoning tokens (from models like gpt-oss-120b) are prefixed with
        the sentinel ``\\x00R:`` so the frontend can render them separately.
        Regular content tokens are yielded as-is.
        """
        params = _build_params(model, messages, config)
        completion = self._client.chat.completions.create(**params)
        for chunk in completion:
            delta = chunk.choices[0].delta
            reasoning = getattr(delta, "reasoning", None)
            if reasoning:
                yield f"\x00R:{reasoning}"
            elif delta.content:
                yield delta.content

    # ------------------------------------------------------------------
    # Async streaming (runs sync SDK in a thread to avoid blocking the loop)
    # ------------------------------------------------------------------

    async def stream_chat_async(
        self, model: str, messages: list, config: dict
    ) -> AsyncIterator[str]:
        """Async generator that yields text delta chunks.

        Runs the synchronous Groq SDK in a thread-pool executor so it never
        blocks the event loop, then forwards chunks via an asyncio.Queue.
        """
        loop = asyncio.get_running_loop()
        queue: asyncio.Queue[str | None] = asyncio.Queue()

        def _producer() -> None:
            try:
                for chunk in self.stream_chat(model, messages, config):
                    loop.call_soon_threadsafe(queue.put_nowait, chunk)
            except Exception as exc:
                # Surface errors as a special sentinel so the consumer can raise.
                loop.call_soon_threadsafe(queue.put_nowait, f"__ERROR__:{exc}")
            finally:
                loop.call_soon_threadsafe(queue.put_nowait, None)  # end sentinel

        # await the executor so the task is properly scheduled before we consume.
        asyncio.ensure_future(loop.run_in_executor(None, _producer))

        while True:
            item = await queue.get()
            if item is None:
                break
            if isinstance(item, str) and item.startswith("__ERROR__:"):
                raise RuntimeError(item[len("__ERROR__:"):])
            yield item
