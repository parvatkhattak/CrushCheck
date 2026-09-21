"""
ml/scorer.py

Trains a calibrated regression model on synthetic behavioral profiles and saves it.
Also exposes the predict() function used at runtime.

Model: GradientBoostingRegressor (continuous label prediction)
Output: signal_score 0.0–10.0

Run this file directly to retrain: python -m ml.scorer
"""

import os
import joblib
import numpy as np
from pathlib import Path

from sklearn.ensemble import GradientBoostingRegressor
from sklearn.preprocessing import MinMaxScaler
from sklearn.pipeline import Pipeline
from sklearn.model_selection import cross_val_score

from ml.synthetic_data import generate_synthetic_profiles, profiles_to_xy, FEATURE_NAMES
from ml.feature_extractor import (
    extract_features, build_breakdown_observations,
    FREQUENCY_MAP, INITIATION_MAP, TREND_MAP
)
from models.schemas import (
    SignalInput, SignalResponse, SignalBreakdownRow, RecentTrend
)

MODEL_PATH = Path(__file__).parent / "signal_model.pkl"


def train_and_save(n_samples: int = 1500, verbose: bool = True) -> Pipeline:
    """Train the model on synthetic data and save to disk."""
    profiles = generate_synthetic_profiles(n_samples)
    X, y = profiles_to_xy(profiles)

    pipeline = Pipeline([
        ("scaler", MinMaxScaler()),
        ("model", GradientBoostingRegressor(
            n_estimators=200,
            max_depth=4,
            learning_rate=0.05,
            subsample=0.8,
            random_state=42,
        ))
    ])

    pipeline.fit(X, y)

    if verbose:
        scores = cross_val_score(pipeline, X, y, cv=5, scoring="r2")
        print(f"[Scorer] Trained on {n_samples} samples")
        print(f"[Scorer] Cross-val R² scores: {scores.round(3)}")
        print(f"[Scorer] Mean R²: {scores.mean():.3f} ± {scores.std():.3f}")
        print(f"[Scorer] Model saved to {MODEL_PATH}")

    joblib.dump(pipeline, MODEL_PATH)
    return pipeline


def load_model() -> Pipeline:
    """Load model from disk, training first if not present."""
    if not MODEL_PATH.exists():
        print("[Scorer] Model not found — training now...")
        return train_and_save()
    return joblib.load(MODEL_PATH)


# ─── Singleton model cache ─────────────────────────────────────────────────────
_model: Pipeline | None = None


def get_model() -> Pipeline:
    global _model
    if _model is None:
        _model = load_model()
    return _model


# ─── Interpretation helpers ────────────────────────────────────────────────────

def _score_to_level(score: float) -> str:
    if score >= 7.5:
        return "Strong"
    elif score >= 5.5:
        return "Moderate"
    elif score >= 3.5:
        return "Weak"
    else:
        return "Ambiguous"


def _build_indicators(signal_input: SignalInput, score: float) -> tuple[list[str], list[str]]:
    """Returns (positive_indicators, unclear_indicators) based on input."""
    positive = []
    unclear = []

    from models.schemas import InitiationSide, RecentTrend, ConversationFrequency

    if signal_input.initiation_ratio >= 0.4:
        positive.append("She initiates conversations regularly")
    elif signal_input.initiation_ratio >= 0.2:
        unclear.append("She initiates sometimes but not consistently")

    if signal_input.avg_reply_time_minutes <= 15:
        positive.append("Replies very quickly")
    elif signal_input.avg_reply_time_minutes <= 60:
        positive.append("Replies within a reasonable time")
    elif signal_input.avg_reply_time_minutes > 180:
        unclear.append("Slow reply times")

    if signal_input.continues_conversations:
        positive.append("Keeps conversations going")
    else:
        unclear.append("Conversations often end without her continuing")

    if signal_input.asks_questions_back:
        positive.append("Asks questions back — shows genuine interest")
    else:
        unclear.append("Rarely asks questions back")

    if signal_input.remembers_details:
        positive.append("Remembers small personal details")

    if signal_input.meetups_count >= 4:
        positive.append(f"Has met up {signal_input.meetups_count} times")
    elif signal_input.meetups_count >= 1:
        unclear.append(f"Met {signal_input.meetups_count} time(s) — limited data")

    if signal_input.makes_time:
        positive.append("Makes time specifically for you")

    if signal_input.inside_jokes:
        positive.append("Shares inside jokes — signals closeness")

    if signal_input.flirty_teasing:
        unclear.append("Flirty teasing present — could be friendliness or interest")

    if signal_input.personal_conversations:
        positive.append("Has shared personal/vulnerable things")

    if signal_input.future_plans:
        positive.append("Mentions future plans involving you")

    if signal_input.recent_trend == RecentTrend.more:
        positive.append("Engagement is increasing recently")
    elif signal_input.recent_trend == RecentTrend.less:
        unclear.append("Recent engagement has been decreasing")
    elif signal_input.recent_trend == RecentTrend.sudden_change:
        unclear.append("Sudden change in behavior — worth noting")

    return positive, unclear


def _build_breakdown(signal_input: SignalInput) -> list[SignalBreakdownRow]:
    """Build signal breakdown table rows."""
    from models.schemas import InitiationSide, RecentTrend

    observations = build_breakdown_observations(signal_input)

    def color_for(signal: str, obs: str) -> str:
        positive_triggers = [
            "Mostly her", "Both", "Within minutes", "10–30",
            "Daily", "A few", "Yes", "Increasing"
        ]
        negative_triggers = [
            "Mostly you", "No", "Decreasing", "Sudden", "Very slow", "Rarely"
        ]
        for t in positive_triggers:
            if t.lower() in obs.lower():
                return "positive"
        for t in negative_triggers:
            if t.lower() in obs.lower():
                return "negative"
        return "neutral"

    def interpret(signal: str, obs: str) -> str:
        interp_map = {
            "Conversation initiation": {
                "Mostly her": "Strong positive",
                "Both of you": "Positive",
                "Mostly you": "Needs attention",
            },
            "Reply speed": {
                "Within minutes": "Very positive",
                "10–30 minutes": "Positive",
                "1–2 hours": "Neutral",
                "Several hours": "Slightly negative",
                "Very slow": "Negative",
            },
            "Conversation frequency": {
                "Daily": "Very positive",
                "A few times/week": "Positive",
                "Once a week": "Neutral",
                "Rarely": "Weak",
            },
            "Recent trend": {
                "Increasing ↑": "Encouraging",
                "Stable →": "Neutral",
                "Decreasing ↓": "Needs attention",
                "Sudden change ⚠": "Ambiguous",
            },
        }
        if signal in interp_map:
            for key, val in interp_map[signal].items():
                if key.lower() in obs.lower():
                    return val
        return "Positive" if "Yes" in obs else ("Negative" if "No" in obs else "Neutral")

    rows = []
    for signal, obs in observations.items():
        color = color_for(signal, obs)
        interp = interpret(signal, obs)
        rows.append(SignalBreakdownRow(
            signal=signal,
            observation=obs,
            interpretation=interp,
            color=color,
        ))
    return rows


def _dont_overthink_message(signal_input: SignalInput, score: float) -> str | None:
    """Returns a wingman quip if the user might be overthinking it."""
    from models.schemas import RecentTrend
    if score < 2.5:
        return "The signals are pretty thin right now. That's okay — it means there's room for things to develop, not that it's over."
    if signal_input.recent_trend == RecentTrend.sudden_change and score > 5.0:
        return "One change in behavior isn't a verdict. Overall patterns are what matter, not a single off day."
    return None


# ─── Main predict function ─────────────────────────────────────────────────────

def predict(signal_input: SignalInput) -> SignalResponse:
    """Full prediction pipeline: features → score → structured response."""
    model = get_model()

    features = extract_features(signal_input)
    X = np.array([features])

    raw_score = float(model.predict(X)[0])
    signal_score = round(float(np.clip(raw_score * 10, 0.0, 10.0)), 1)

    level = _score_to_level(signal_score)
    positive, unclear = _build_indicators(signal_input, signal_score)
    breakdown = _build_breakdown(signal_input)
    dont_overthink = _dont_overthink_message(signal_input, signal_score)

    return SignalResponse(
        signal_score=signal_score,
        level=level,
        positive_indicators=positive,
        unclear_indicators=unclear,
        disclaimer=(
            "These behaviors can indicate interest, friendliness, comfort, or simply "
            "an established friendship. This score reflects observed interaction patterns, "
            "not her actual feelings."
        ),
        breakdown=breakdown,
        dont_overthink=dont_overthink,
    )


if __name__ == "__main__":
    print("Training CrushCheck signal model...")
    train_and_save(verbose=True)
    print("Done.")
