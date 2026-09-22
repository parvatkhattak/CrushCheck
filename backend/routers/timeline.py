"""
routers/timeline.py

Timeline endpoints for tracking connection signal changes over time.
Backed by lightweight SQLite storage.
Zero PII stored — only anonymous session_id, scores, timestamps, and optional notes.
"""

import sqlite3
import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from fastapi import APIRouter, HTTPException
from models.schemas import (
    TimelineEntry,
    TimelineEntryResponse,
    TimelineResponse,
)

router = APIRouter(prefix="/api/timeline", tags=["timeline"])

DB_DIR = Path(__file__).parent.parent / "data"
DB_DIR.mkdir(parents=True, exist_ok=True)
DB_PATH = DB_DIR / "timeline.db"


def _get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def _init_db():
    with _get_db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS timeline_entries (
                entry_id TEXT PRIMARY KEY,
                session_id TEXT NOT NULL,
                signal_score REAL NOT NULL,
                level TEXT NOT NULL,
                notes TEXT,
                features_json TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
        """)
        conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_session_created
            ON timeline_entries(session_id, created_at);
        """)
        conn.commit()


# Initialize table on import
_init_db()


@router.post("/entry", response_model=TimelineEntryResponse)
async def create_timeline_entry(entry: TimelineEntry) -> TimelineEntryResponse:
    """Save an analysis check to the user's session timeline."""
    entry_id = str(uuid.uuid4())
    created_at = datetime.now(timezone.utc).isoformat()

    try:
        with _get_db() as conn:
            conn.execute(
                """
                INSERT INTO timeline_entries (
                    entry_id, session_id, signal_score, level, notes, features_json, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    entry_id,
                    entry.session_id,
                    entry.signal_score,
                    entry.level,
                    entry.notes,
                    json.dumps(entry.features_snapshot),
                    created_at,
                ),
            )
            conn.commit()

        return TimelineEntryResponse(
            entry_id=entry_id,
            session_id=entry.session_id,
            signal_score=entry.signal_score,
            level=entry.level,
            notes=entry.notes,
            features_snapshot=entry.features_snapshot,
            created_at=created_at,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save timeline entry: {str(e)}")


@router.get("/{session_id}", response_model=TimelineResponse)
async def get_timeline(session_id: str) -> TimelineResponse:
    """Retrieve full timeline history, trend trajectory, and milestones for a session."""
    try:
        with _get_db() as conn:
            rows = conn.execute(
                """
                SELECT entry_id, session_id, signal_score, level, notes, features_json, created_at
                FROM timeline_entries
                WHERE session_id = ?
                ORDER BY created_at ASC
                """,
                (session_id,),
            ).fetchall()

        entries = [
            TimelineEntryResponse(
                entry_id=row["entry_id"],
                session_id=row["session_id"],
                signal_score=row["signal_score"],
                level=row["level"],
                notes=row["notes"],
                features_snapshot=json.loads(row["features_json"]),
                created_at=row["created_at"],
            )
            for row in rows
        ]

        if not entries:
            return TimelineResponse(
                session_id=session_id,
                entries=[],
                trend_label="Not enough data",
                trend_delta=None,
                milestones=["Take your first CrushCheck to start tracking your timeline!"],
            )

        # Compute trend
        first_score = entries[0].signal_score
        last_score = entries[-1].signal_score
        delta = round(last_score - first_score, 1)

        if len(entries) == 1:
            trend_label = "Baseline recorded"
        elif delta >= 1.0:
            trend_label = "Improving"
        elif delta <= -1.0:
            trend_label = "Declining"
        else:
            trend_label = "Stable"

        # Milestones
        milestones = []
        if len(entries) >= 2:
            milestones.append(f"Tracked {len(entries)} check-ins over time")
            if delta > 0:
                milestones.append(f"Connection score increased by +{delta} points")
            elif delta < 0:
                milestones.append(f"Connection score shifted by {delta} points")
            else:
                milestones.append("Signals have remained steady and consistent")

        max_entry = max(entries, key=lambda e: e.signal_score)
        milestones.append(f"Highest signal score recorded: {max_entry.signal_score}/10 ({max_entry.level})")

        return TimelineResponse(
            session_id=session_id,
            entries=entries,
            trend_label=trend_label,
            trend_delta=delta if len(entries) > 1 else None,
            milestones=milestones,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch timeline: {str(e)}")


@router.delete("/{session_id}")
async def clear_timeline(session_id: str):
    """Delete all timeline records for this session (privacy reset)."""
    try:
        with _get_db() as conn:
            conn.execute("DELETE FROM timeline_entries WHERE session_id = ?", (session_id,))
            conn.commit()
        return {"status": "cleared", "session_id": session_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to clear timeline: {str(e)}")
