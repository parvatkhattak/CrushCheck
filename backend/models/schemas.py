from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


# ─── Enums ────────────────────────────────────────────────────────────────────

class InitiationSide(str, Enum):
    me = "me"
    her = "her"
    both = "both"

class ConversationFrequency(str, Enum):
    daily = "daily"
    few_per_week = "few_per_week"
    once_a_week = "once_a_week"
    rarely = "rarely"

class RecentTrend(str, Enum):
    more = "more"
    same = "same"
    less = "less"
    sudden_change = "sudden_change"

class ReplyIntent(str, Enum):
    caring = "caring"
    funny = "funny"
    flirty = "flirty"
    supportive = "supportive"
    keep_going = "keep_going"
    ask_out = "ask_out"


# ─── Signal Analyzer ──────────────────────────────────────────────────────────

class SignalInput(BaseModel):
    # Communication
    initiation_ratio: float = Field(..., ge=0.0, le=1.0,
        description="0 = she never starts, 1 = she always starts")
    avg_reply_time_minutes: int = Field(..., ge=0, le=1440,
        description="Average reply time in minutes")
    conversation_frequency: ConversationFrequency
    continues_conversations: bool = Field(...,
        description="Does she keep the convo going or let it die?")
    asks_questions_back: bool = Field(...,
        description="Does she ask questions back?")
    remembers_details: bool = Field(...,
        description="Does she remember small things you told her?")

    # Real-life interaction
    meetups_count: int = Field(..., ge=0, le=50,
        description="Number of times you've met in person")
    who_suggests_meetings: InitiationSide
    makes_time: bool = Field(...,
        description="Does she make time for you specifically?")

    # Social signals
    inside_jokes: bool
    flirty_teasing: bool
    personal_conversations: bool = Field(...,
        description="Does she share personal/vulnerable things?")
    future_plans: bool = Field(...,
        description="Does she mention future plans that include you?")

    # Trend
    recent_trend: RecentTrend


class SignalBreakdownRow(BaseModel):
    signal: str
    observation: str
    interpretation: str
    color: str  # "positive" | "neutral" | "negative"


class SignalResponse(BaseModel):
    signal_score: float = Field(..., ge=0.0, le=10.0)
    level: str  # "Strong" | "Moderate" | "Weak" | "Ambiguous"
    positive_indicators: list[str]
    unclear_indicators: list[str]
    disclaimer: str
    breakdown: list[SignalBreakdownRow]
    dont_overthink: Optional[str] = None  # shown when score is very low or input is thin


# ─── Reply Coach ──────────────────────────────────────────────────────────────

class ReplyRequest(BaseModel):
    her_message: str = Field(..., max_length=500)
    conversation_context: Optional[str] = Field(None, max_length=2000,
        description="Last few messages as plain text (optional)")
    intent: ReplyIntent


class ReplyOption(BaseModel):
    style: str        # e.g. "Caring", "Funny", "Smooth"
    text: str
    explanation: str  # why this works in context


class ReplyResponse(BaseModel):
    replies: list[ReplyOption]
    detected_tone: str
    context_note: str


# ─── Message Interpreter ──────────────────────────────────────────────────────

class InterpretRequest(BaseModel):
    message: str = Field(..., max_length=300)
    context: Optional[str] = Field(None, max_length=1000)


class InterpretReading(BaseModel):
    emoji: str
    label: str   # "Open-ended", "Uncertain", "Polite deflection"
    color: str   # "green" | "yellow" | "orange"
    explanation: str


class InterpretResponse(BaseModel):
    readings: list[InterpretReading]
    most_useful_next_move: str
    overthinking_warning: Optional[str] = None


# ─── Pre-send Check ───────────────────────────────────────────────────────────

class CheckMessageRequest(BaseModel):
    draft_message: str = Field(..., max_length=500)
    context: Optional[str] = Field(None, max_length=1000)


class CheckMessageResponse(BaseModel):
    pressure_score: int = Field(..., ge=1, le=10)
    clarity_score: int = Field(..., ge=1, le=10)
    naturalness_score: int = Field(..., ge=1, le=10)
    flirt_level: int = Field(..., ge=1, le=10)
    context_fit: str  # "Good" | "Okay" | "Risky"
    verdict: str
    improved_version: Optional[str] = None
    wingman_quip: str


# ─── Screenshot Analyzer ──────────────────────────────────────────────────────

class ExtractedMessage(BaseModel):
    speaker: str   # "you" | "her"
    text: str
    timestamp: Optional[str] = None


class ScreenshotAnalysisResponse(BaseModel):
    extracted_messages: list[ExtractedMessage]
    tone: str
    engagement_level: str
    reciprocity: str
    momentum: str
    insights: list[str]
    suggested_next_move: str


# ─── Timeline ─────────────────────────────────────────────────────────────────

class TimelineEntry(BaseModel):
    session_id: str
    signal_score: float
    level: str
    notes: Optional[str] = None
    features_snapshot: dict


class TimelineEntryResponse(TimelineEntry):
    entry_id: str
    created_at: str


class TimelineResponse(BaseModel):
    session_id: str
    entries: list[TimelineEntryResponse]
    trend_label: str     # "Improving" | "Stable" | "Declining" | "Not enough data"
    trend_delta: Optional[float] = None  # change from first to last
    milestones: list[str]


# ─── Health ───────────────────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    model_config = {"protected_namespaces": ()}
    status: str
    model_loaded: bool
    version: str = "1.0.0"
    ollama_running: bool = False
    ollama_model_ready: bool = False
