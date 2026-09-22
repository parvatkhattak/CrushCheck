"""
routers/reply.py

POST /api/generate-reply — AI Reply Coach
Takes her last message + conversation context + user intent → 3 styled reply options.
"""

from fastapi import APIRouter, HTTPException
from models.schemas import ReplyRequest, ReplyResponse, ReplyOption
from llm.client import generate_json
from llm.prompts import reply_coach_prompt

router = APIRouter(prefix="/api", tags=["reply"])


@router.post("/generate-reply", response_model=ReplyResponse)
async def generate_reply(req: ReplyRequest) -> ReplyResponse:
    """
    Generate 3 context-aware reply options based on conversation tone and user intent.
    """
    try:
        system, user = reply_coach_prompt(
            her_message=req.her_message,
            context=req.conversation_context,
            intent=req.intent.value,
        )
        data = await generate_json(system, user)

        replies = [
            ReplyOption(
                style=r["style"],
                text=r["text"],
                explanation=r["explanation"],
            )
            for r in data["replies"]
        ]

        return ReplyResponse(
            replies=replies,
            detected_tone=data.get("detected_tone", "Neutral"),
            context_note=data.get("context_note", ""),
        )

    except RuntimeError as e:
        raise HTTPException(status_code=429, detail=str(e))
    except (KeyError, TypeError, ValueError) as e:
        raise HTTPException(status_code=502, detail=f"AI response parsing error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Reply generation failed: {str(e)}")
