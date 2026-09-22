"""
routers/interpret.py

POST /api/interpret-message — "What Does She Mean?"
Takes an ambiguous message + optional context → multi-reading analysis.
"""

from fastapi import APIRouter, HTTPException
from models.schemas import InterpretRequest, InterpretResponse, InterpretReading
from llm.client import generate_json
from llm.prompts import interpret_message_prompt

router = APIRouter(prefix="/api", tags=["interpret"])


@router.post("/interpret-message", response_model=InterpretResponse)
async def interpret_message(req: InterpretRequest) -> InterpretResponse:
    """
    Return 2–4 possible interpretations of an ambiguous message,
    plus a concrete recommended next move.
    """
    try:
        system, user = interpret_message_prompt(
            message=req.message,
            context=req.context,
        )
        data = await generate_json(system, user)

        readings = [
            InterpretReading(
                emoji=r["emoji"],
                label=r["label"],
                color=r["color"],
                explanation=r["explanation"],
            )
            for r in data["readings"]
        ]

        return InterpretResponse(
            readings=readings,
            most_useful_next_move=data["most_useful_next_move"],
            overthinking_warning=data.get("overthinking_warning"),
        )

    except RuntimeError as e:
        raise HTTPException(status_code=429, detail=str(e))
    except (KeyError, TypeError, ValueError) as e:
        raise HTTPException(status_code=502, detail=f"AI response parsing error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Interpretation failed: {str(e)}")
