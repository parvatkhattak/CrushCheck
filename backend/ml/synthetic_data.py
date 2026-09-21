"""
ml/synthetic_data.py

Generates ~1500 synthetic behavioral profiles for training the signal scorer.
Each profile is a dict of features with a ground-truth label (0=low interest, 1=high interest).

The data is hand-crafted with realistic behavioral rules to ensure the model
learns meaningful relationships — not just noise.
"""

import numpy as np
import random
from typing import List, Dict, Any

random.seed(42)
np.random.seed(42)


def _jitter(val: float, noise: float = 0.05) -> float:
    """Add small gaussian noise to a float, clamped to [0, 1]."""
    return float(np.clip(val + np.random.normal(0, noise), 0.0, 1.0))


def generate_synthetic_profiles(n: int = 1500) -> List[Dict[str, Any]]:
    """
    Returns a list of dicts:
      features dict + 'label' (float 0.0–1.0, represents interest signal strength)
    
    Label is NOT binary — it's a continuous signal score that we later scale to 0-10.
    """
    profiles = []

    # --- STRONG INTEREST profiles (~30%) ---
    for _ in range(int(n * 0.30)):
        profile = {
            "initiation_ratio": _jitter(random.uniform(0.4, 1.0), 0.05),
            "reply_speed_norm": _jitter(random.uniform(0.7, 1.0), 0.05),  # fast replies → high
            "frequency_encoded": random.randint(3, 4),  # daily or few/week
            "continues_conversations": 1,
            "asks_questions_back": 1,
            "remembers_details": random.choices([0, 1], weights=[1, 5])[0],
            "meetups_count_norm": _jitter(random.uniform(0.4, 1.0), 0.05),
            "who_suggests_encoded": random.choices([0, 1, 2], weights=[1, 3, 4])[0],  # 2=her
            "makes_time": 1,
            "inside_jokes": random.choices([0, 1], weights=[1, 4])[0],
            "flirty_teasing": random.choices([0, 1], weights=[1, 3])[0],
            "personal_conversations": 1,
            "future_plans": random.choices([0, 1], weights=[1, 3])[0],
            "trend_encoded": random.choices([0, 1, 2], weights=[1, 2, 3])[0],  # 2=more
            "label": random.uniform(0.72, 1.0),
        }
        profiles.append(profile)

    # --- MODERATE INTEREST profiles (~30%) ---
    for _ in range(int(n * 0.30)):
        profile = {
            "initiation_ratio": _jitter(random.uniform(0.2, 0.55), 0.07),
            "reply_speed_norm": _jitter(random.uniform(0.4, 0.75), 0.07),
            "frequency_encoded": random.randint(2, 3),
            "continues_conversations": random.choices([0, 1], weights=[2, 3])[0],
            "asks_questions_back": random.choices([0, 1], weights=[2, 3])[0],
            "remembers_details": random.choices([0, 1], weights=[2, 3])[0],
            "meetups_count_norm": _jitter(random.uniform(0.15, 0.5), 0.07),
            "who_suggests_encoded": random.choices([0, 1, 2], weights=[2, 4, 2])[0],
            "makes_time": random.choices([0, 1], weights=[2, 3])[0],
            "inside_jokes": random.choices([0, 1], weights=[3, 2])[0],
            "flirty_teasing": random.choices([0, 1], weights=[4, 2])[0],
            "personal_conversations": random.choices([0, 1], weights=[2, 3])[0],
            "future_plans": random.choices([0, 1], weights=[3, 2])[0],
            "trend_encoded": random.choices([0, 1, 2], weights=[2, 4, 2])[0],
            "label": random.uniform(0.40, 0.72),
        }
        profiles.append(profile)

    # --- LOW / AMBIGUOUS profiles (~25%) ---
    for _ in range(int(n * 0.25)):
        profile = {
            "initiation_ratio": _jitter(random.uniform(0.0, 0.25), 0.05),
            "reply_speed_norm": _jitter(random.uniform(0.1, 0.5), 0.07),
            "frequency_encoded": random.randint(0, 2),
            "continues_conversations": random.choices([0, 1], weights=[4, 1])[0],
            "asks_questions_back": random.choices([0, 1], weights=[4, 1])[0],
            "remembers_details": random.choices([0, 1], weights=[4, 1])[0],
            "meetups_count_norm": _jitter(random.uniform(0.0, 0.2), 0.04),
            "who_suggests_encoded": random.choices([0, 1, 2], weights=[5, 2, 1])[0],
            "makes_time": 0,
            "inside_jokes": 0,
            "flirty_teasing": 0,
            "personal_conversations": random.choices([0, 1], weights=[4, 1])[0],
            "future_plans": 0,
            "trend_encoded": random.choices([0, 1, 2], weights=[3, 3, 1])[0],
            "label": random.uniform(0.0, 0.40),
        }
        profiles.append(profile)

    # --- DECLINING / MIXED profiles (~15%) ---
    for _ in range(int(n * 0.15)):
        # Was strong, now declining — mid score, but trend pulls it down
        profile = {
            "initiation_ratio": _jitter(random.uniform(0.2, 0.5), 0.07),
            "reply_speed_norm": _jitter(random.uniform(0.3, 0.6), 0.07),
            "frequency_encoded": random.randint(1, 3),
            "continues_conversations": random.choices([0, 1], weights=[3, 2])[0],
            "asks_questions_back": random.choices([0, 1], weights=[3, 2])[0],
            "remembers_details": random.choices([0, 1], weights=[2, 2])[0],
            "meetups_count_norm": _jitter(random.uniform(0.2, 0.5), 0.07),
            "who_suggests_encoded": random.choices([0, 1, 2], weights=[3, 3, 1])[0],
            "makes_time": random.choices([0, 1], weights=[3, 2])[0],
            "inside_jokes": random.choices([0, 1], weights=[2, 2])[0],
            "flirty_teasing": random.choices([0, 1], weights=[3, 1])[0],
            "personal_conversations": random.choices([0, 1], weights=[3, 2])[0],
            "future_plans": random.choices([0, 1], weights=[4, 1])[0],
            "trend_encoded": 0,  # always declining
            "label": random.uniform(0.20, 0.55),
        }
        profiles.append(profile)

    random.shuffle(profiles)
    return profiles


FEATURE_NAMES = [
    "initiation_ratio",
    "reply_speed_norm",
    "frequency_encoded",
    "continues_conversations",
    "asks_questions_back",
    "remembers_details",
    "meetups_count_norm",
    "who_suggests_encoded",
    "makes_time",
    "inside_jokes",
    "flirty_teasing",
    "personal_conversations",
    "future_plans",
    "trend_encoded",
]


def profiles_to_xy(profiles: List[Dict[str, Any]]):
    """Convert profiles list to X (features array) and y (label array)."""
    import numpy as np
    X = np.array([[p[f] for f in FEATURE_NAMES] for p in profiles])
    y = np.array([p["label"] for p in profiles])
    return X, y


if __name__ == "__main__":
    profiles = generate_synthetic_profiles(1500)
    print(f"Generated {len(profiles)} profiles")
    labels = [p["label"] for p in profiles]
    print(f"Label distribution — min: {min(labels):.2f}, max: {max(labels):.2f}, mean: {sum(labels)/len(labels):.2f}")
