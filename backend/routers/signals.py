"""
routers/signals.py

POST /analyze-signals — takes questionnaire input, returns signal score + breakdown.
"""

from fastapi import APIRouter, HTTPException
from models.schemas import SignalInput, SignalResponse
from ml.scorer import predict

router = APIRouter(prefix="/api", tags=["signals"])


@router.post("/analyze-signals", response_model=SignalResponse)
async def analyze_signals(signal_input: SignalInput) -> SignalResponse:
    """
    Analyze behavioral signals and return a calibrated connection score (0–10).
    
    This endpoint uses the ML scoring model — NOT an LLM — so results are
    deterministic and explainable.
    """
    try:
        result = predict(signal_input)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scoring error: {str(e)}")
