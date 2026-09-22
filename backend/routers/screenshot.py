"""
routers/screenshot.py

POST /api/analyze-screenshot — analyzes conversation screenshot using vision model.
Privacy first:
- Image bytes are read into memory only
- Never written to disk
- Discarded immediately after inference
- Contact names / PII instructed to be anonymized to 'you' and 'her'
"""

from fastapi import APIRouter, File, UploadFile, HTTPException
from models.schemas import ScreenshotAnalysisResponse
from llm.client import analyze_image
from llm.prompts import SCREENSHOT_SYSTEM, SCREENSHOT_USER

router = APIRouter(prefix="/api", tags=["screenshot"])

ALLOWED_MIMETYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


@router.post("/analyze-screenshot", response_model=ScreenshotAnalysisResponse)
async def analyze_screenshot(
    file: UploadFile = File(...),
) -> ScreenshotAnalysisResponse:
    """
    Analyze conversation screenshot dynamics in-memory.
    Extracts text messages, detects tone, engagement, reciprocity, and actionable insights.
    """
    if file.content_type not in ALLOWED_MIMETYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported image format: {file.content_type}. Please upload a PNG, JPEG, or WebP screenshot.",
        )

    # Read image into memory
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="Image file too large (max 5MB).",
        )

    if len(content) < 100:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty or corrupted.",
        )

    try:
        data = await analyze_image(
            image_bytes=content,
            mime_type=file.content_type,
            prompt=SCREENSHOT_USER,
            system_prompt=SCREENSHOT_SYSTEM,
        )
        return ScreenshotAnalysisResponse(**data)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Vision analysis failed: {str(e)}",
        )
