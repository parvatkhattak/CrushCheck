"""
routers/check.py

POST /api/check-message — "Should I Send This?"
Evaluates a draft message before sending: pressure, clarity, naturalness, flirt level.
"""

from fastapi import APIRouter, HTTPException
from models.schemas import CheckMessageRequest, CheckMessageResponse
from llm.client import generate_json
from llm.prompts import check_message_prompt

router = APIRouter(prefix="/api", tags=["check"])


@router.post("/check-message", response_model=CheckMessageResponse)
async def check_message(req: CheckMessageRequest) -> CheckMessageResponse:
    """
    Pre-send evaluation of a draft message.
    Returns scores for pressure, clarity, naturalness, flirt level,
    plus a verdict, optional improved version, and an honest wingman quip.
    """
    try:
        system, user = check_message_prompt(
            draft=req.draft_message,
            context=req.context,
        )
        data = await generate_json(system, user)

        return CheckMessageResponse(
            pressure_score=int(data["pressure_score"]),
            clarity_score=int(data["clarity_score"]),
            naturalness_score=int(data["naturalness_score"]),
            flirt_level=int(data["flirt_level"]),
            context_fit=data.get("context_fit", "Okay"),
            verdict=data["verdict"],
            improved_version=data.get("improved_version"),
            wingman_quip=data["wingman_quip"],
        )

    except RuntimeError as e:
        raise HTTPException(status_code=429, detail=str(e))
    except (KeyError, TypeError, ValueError) as e:
        raise HTTPException(status_code=502, detail=f"AI response parsing error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Message check failed: {str(e)}")
