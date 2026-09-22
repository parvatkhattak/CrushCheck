"""
main.py — CrushCheck FastAPI Application Entry Point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from models.schemas import HealthResponse
from routers import signals, reply, interpret, check, screenshot, timeline


# ─── Lifespan: preload model on startup ───────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 CrushCheck backend starting...")
    # Eagerly load model into memory so first request isn't slow
    from ml.scorer import get_model
    get_model()
    print("✅ Signal model loaded and ready")
    yield
    print("👋 CrushCheck backend shutting down")


# ─── App ──────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="CrushCheck API",
    description="AI-powered relationship signal analyzer and conversation coach",
    version="1.0.0",
    lifespan=lifespan,
)

# ─── CORS ─────────────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",   # Next.js dev server
        "http://localhost:3001",
        "https://*.vercel.app",    # Vercel deployment (Stage 6)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ──────────────────────────────────────────────────────────────────

app.include_router(signals.router)
app.include_router(reply.router)
app.include_router(interpret.router)
app.include_router(check.router)

app.include_router(screenshot.router)
app.include_router(timeline.router)


# ─── Health check ─────────────────────────────────────────────────────────────

@app.get("/health", response_model=HealthResponse, tags=["health"])
async def health_check() -> HealthResponse:
    """Server health, model status, and Ollama connectivity check."""
    from ml.scorer import MODEL_PATH
    from llm.client import check_ollama_health
    ollama = await check_ollama_health()
    return HealthResponse(
        status="ok" if ollama["ollama_running"] else "degraded",
        model_loaded=MODEL_PATH.exists(),
        version="1.0.0",
        ollama_running=ollama["ollama_running"],
        ollama_model_ready=ollama.get("model_ready", False),
    )


@app.get("/", tags=["health"])
async def root():
    return {"message": "CrushCheck API is running 💘", "docs": "/docs"}
