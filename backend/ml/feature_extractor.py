"""
ml/feature_extractor.py

Converts a SignalInput (questionnaire response) into a normalized feature vector
suitable for the ML scorer. All transformations are deterministic and invertible
for explanation purposes.
"""

import math
from models.schemas import SignalInput, ConversationFrequency, InitiationSide, RecentTrend
from ml.synthetic_data import FEATURE_NAMES


FREQUENCY_MAP = {
    ConversationFrequency.rarely: 0,
    ConversationFrequency.once_a_week: 1,
    ConversationFrequency.few_per_week: 2,
    ConversationFrequency.daily: 4,
}

INITIATION_MAP = {
    InitiationSide.me: 0,
    InitiationSide.both: 1,
    InitiationSide.her: 2,
}

TREND_MAP = {
    RecentTrend.less: 0,
    RecentTrend.sudden_change: 0,
    RecentTrend.same: 1,
    RecentTrend.more: 2,
}


def _normalize_reply_speed(avg_reply_time_minutes: int) -> float:
    """
    Converts average reply time (minutes) to a 0–1 score where:
    - 0–5 min  → ~1.0 (very fast)
    - 30 min   → ~0.75
    - 2 hours  → ~0.5
    - 6 hours  → ~0.25
    - 24 hours → ~0.0
    
    Uses an inverse log scale so fast responders score high.
    """
    if avg_reply_time_minutes <= 0:
        return 1.0
    # log1p(1) = 0.69, log1p(1440) = 7.27
    score = 1.0 - (math.log1p(avg_reply_time_minutes) / math.log1p(1440))
    return max(0.0, min(1.0, score))


def _normalize_meetups(meetups_count: int) -> float:
    """
    Normalizes meetup count to 0–1.
    - 0 meetups → 0.0
    - 1 meetup  → 0.2
    - 5 meetups → 0.7
    - 10+ meetups → ~1.0
    """
    return min(1.0, meetups_count / 10.0)


def extract_features(signal_input: SignalInput) -> list[float]:
    """
    Returns a list of floats in the same order as FEATURE_NAMES.
    """
    features = [
        float(signal_input.initiation_ratio),
        _normalize_reply_speed(signal_input.avg_reply_time_minutes),
        float(FREQUENCY_MAP[signal_input.conversation_frequency]),
        float(int(signal_input.continues_conversations)),
        float(int(signal_input.asks_questions_back)),
        float(int(signal_input.remembers_details)),
        _normalize_meetups(signal_input.meetups_count),
        float(INITIATION_MAP[signal_input.who_suggests_meetings]),
        float(int(signal_input.makes_time)),
        float(int(signal_input.inside_jokes)),
        float(int(signal_input.flirty_teasing)),
        float(int(signal_input.personal_conversations)),
        float(int(signal_input.future_plans)),
        float(TREND_MAP[signal_input.recent_trend]),
    ]
    assert len(features) == len(FEATURE_NAMES), \
        f"Feature count mismatch: got {len(features)}, expected {len(FEATURE_NAMES)}"
    return features


def build_breakdown_observations(signal_input: SignalInput) -> dict:
    """
    Returns human-readable observation strings for each signal dimension.
    Used by the scorer to generate the breakdown table.
    """
    freq_labels = {
        ConversationFrequency.daily: "Daily",
        ConversationFrequency.few_per_week: "A few times/week",
        ConversationFrequency.once_a_week: "Once a week",
        ConversationFrequency.rarely: "Rarely",
    }
    initiation_labels = {
        InitiationSide.me: "Mostly you",
        InitiationSide.both: "Both of you",
        InitiationSide.her: "Mostly her",
    }
    trend_labels = {
        RecentTrend.more: "Increasing ↑",
        RecentTrend.same: "Stable →",
        RecentTrend.less: "Decreasing ↓",
        RecentTrend.sudden_change: "Sudden change ⚠",
    }

    reply_time = signal_input.avg_reply_time_minutes
    if reply_time <= 5:
        reply_obs = "Within minutes"
    elif reply_time <= 30:
        reply_obs = "10–30 minutes"
    elif reply_time <= 120:
        reply_obs = "1–2 hours"
    elif reply_time <= 360:
        reply_obs = "Several hours"
    else:
        reply_obs = "Very slow (6h+)"

    return {
        "Conversation initiation": initiation_labels[signal_input.who_suggests_meetings],
        "Reply speed": reply_obs,
        "Conversation frequency": freq_labels[signal_input.conversation_frequency],
        "Continues conversations": "Yes" if signal_input.continues_conversations else "No",
        "Asks questions back": "Yes" if signal_input.asks_questions_back else "No",
        "Remembers details": "Yes" if signal_input.remembers_details else "No",
        "Meetups": f"{signal_input.meetups_count} times",
        "Makes time": "Yes" if signal_input.makes_time else "No",
        "Inside jokes": "Yes" if signal_input.inside_jokes else "No",
        "Flirty teasing": "Yes" if signal_input.flirty_teasing else "No",
        "Personal conversations": "Yes" if signal_input.personal_conversations else "No",
        "Future plans mentioned": "Yes" if signal_input.future_plans else "No",
        "Recent trend": trend_labels[signal_input.recent_trend],
    }
