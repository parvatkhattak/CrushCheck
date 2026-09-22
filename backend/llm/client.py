"""
llm/client.py

Groq API client — uses Groq's OpenAI-compatible endpoint with llama-3.1-8b-instant.
Free tier: 14,400 requests/day, extremely fast inference.

All public functions are async (run blocking SDK calls via asyncio.to_thread).
No rate-limit issues for normal usage patterns.
"""

import json
import re
import asyncio
import os
import base64
from pathlib import Path
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv(Path(__file__).parent.parent / ".env")

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL   = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b")

if not GROQ_API_KEY:
    raise RuntimeError(
        "GROQ_API_KEY not set.\n"
        "1. Get a free key at https://console.groq.com\n"
        "2. Add GROQ_API_KEY=your_key to backend/.env"
    )

# ─── Groq client (OpenAI-compatible) ─────────────────────────────────────────

def _get_client() -> OpenAI:
    return OpenAI(
        api_key=GROQ_API_KEY,
        base_url="https://api.groq.com/openai/v1",
    )


# ─── JSON extraction ──────────────────────────────────────────────────────────

def _extract_json(text: str) -> dict | list:
    """
    Extract JSON from model response.
    Strips markdown fences and any preamble before first { or [.
    """
    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    text = text.strip()
    start = min(
        (text.find("{") if text.find("{") != -1 else len(text)),
        (text.find("[") if text.find("[") != -1 else len(text)),
    )
    if start > 0:
        text = text[start:]
    return json.loads(text)


# ─── Synchronous Groq call (runs in thread pool) ──────────────────────────────

def _sync_generate(
    system_prompt: str,
    user_prompt: str,
    temperature: float = 0.8,
    max_tokens: int = 4096,
) -> str:
    """
    Blocking call to Groq API.
    Always call via asyncio.to_thread() to avoid blocking uvicorn's event loop.
    """
    client = _get_client()
    completion = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=temperature,
        max_tokens=max_tokens,
    )
    return completion.choices[0].message.content


# ─── Async public API ─────────────────────────────────────────────────────────

async def generate_text(system: str, user: str, temperature: float = 0.8) -> str:
    """Async text generation via Groq — offloads blocking SDK to thread pool."""
    return await asyncio.to_thread(_sync_generate, system, user, temperature)


async def generate_json(system: str, user: str) -> dict | list:
    """
    Async JSON generation. Uses system prompt to enforce JSON-only output.
    """
    json_system = (
        system
        + "\n\nCRITICAL OUTPUT RULE: Respond with ONLY valid JSON. "
        "No explanation, no markdown fences, no preamble text. "
        "Your response must start directly with { or [."
    )
    raw = await asyncio.to_thread(_sync_generate, json_system, user, 0.7, 4096)
    return _extract_json(raw)


async def analyze_image(
    image_bytes: bytes,
    mime_type: str,
    prompt: str,
    system_prompt: str | None = None,
) -> dict | list:
    """
    Multimodal vision analysis via Groq using qwen/qwen3.8-27b.
    Image is processed in-memory as base64 and never written to disk.
    """
    vision_model = os.getenv("GROQ_VISION_MODEL", "qwen/qwen3.8-27b")
    b64 = base64.b64encode(image_bytes).decode("utf-8")
    data_url = f"data:{mime_type};base64,{b64}"

    def _sync_vision():
        client = _get_client()
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({
            "role": "user",
            "content": [
                {"type": "text", "text": prompt},
                {"type": "image_url", "image_url": {"url": data_url}},
            ],
        })
        completion = client.chat.completions.create(
            model=vision_model,
            messages=messages,
            temperature=0.3,
            max_tokens=4096,
        )
        return completion.choices[0].message.content

    raw = await asyncio.to_thread(_sync_vision)
    return _extract_json(raw)


# ─── Health check ─────────────────────────────────────────────────────────────

async def check_ollama_health() -> dict:
    """
    Check LLM provider health (named check_ollama_health for API compatibility,
    but now checks Groq connectivity).
    """
    try:
        result = await generate_text(
            system="You are a health check bot.",
            user="Reply with exactly: ok",
            temperature=0.0,
        )
        return {
            "ollama_running": True,   # kept for API compat
            "model_ready": True,
            "provider": "groq",
            "model": GROQ_MODEL,
            "response": result.strip(),
        }
    except Exception as e:
        return {
            "ollama_running": False,
            "model_ready": False,
            "provider": "groq",
            "model": GROQ_MODEL,
            "error": str(e),
        }
