"""
backend/tests/test_e2e_robustness.py

Comprehensive end-to-end test suite for CrushCheck:
- Tests frontend page accessibility (200 OK)
- Tests backend health, ML model scoring, boundary conditions, and validation
- Tests Groq text generation (Reply Coach, Message Interpreter, Pre-send Check)
- Tests Groq multimodal vision (Screenshot Decoder) and file validation
- Tests SQLite Timeline persistence lifecycle (Create, Read, Trend computation, Reset)
"""

import sys
import io
import time
import httpx
from PIL import Image, ImageDraw

BACKEND = "http://localhost:8000"
FRONTEND = "http://localhost:3000"

client = httpx.Client(timeout=45.0)
passed = 0
failed = 0


def test(name, fn):
    global passed, failed
    print(f"\n👉 Testing: {name}...", end=" ", flush=True)
    try:
        fn()
        print("✅ PASSED")
        passed += 1
    except Exception as e:
        print(f"❌ FAILED: {e}")
        failed += 1


# 1. Frontend Route Checks
def check_frontend():
    routes = ["/", "/analyze", "/reply", "/screenshot", "/interpret", "/check", "/timeline"]
    for r in routes:
        res = client.get(f"{FRONTEND}{r}")
        assert res.status_code == 200, f"Route {r} returned {res.status_code}"
        assert "<html" in res.text or "<!DOCTYPE html>" in res.text, f"Route {r} did not return HTML"


# 2. Backend Health & Connectivity
def check_health():
    res = client.get(f"{BACKEND}/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert data["model_loaded"] is True
    assert data["ollama_running"] is True


# 3. Signal Scorer Tests
def check_signals_normal():
    payload = {
        "initiation_ratio": 0.5,
        "avg_reply_time_minutes": 20,
        "conversation_frequency": "daily",
        "continues_conversations": True,
        "asks_questions_back": True,
        "remembers_details": True,
        "meetups_count": 4,
        "who_suggests_meetings": "both",
        "makes_time": True,
        "inside_jokes": True,
        "flirty_teasing": True,
        "personal_conversations": True,
        "future_plans": True,
        "recent_trend": "same",
    }
    res = client.post(f"{BACKEND}/api/analyze-signals", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert 0.0 <= data["signal_score"] <= 10.0
    assert len(data["positive_indicators"]) > 0
    assert len(data["breakdown"]) == 13


def check_signals_cold_edge_case():
    payload = {
        "initiation_ratio": 0.0,
        "avg_reply_time_minutes": 720,
        "conversation_frequency": "rarely",
        "continues_conversations": False,
        "asks_questions_back": False,
        "remembers_details": False,
        "meetups_count": 0,
        "who_suggests_meetings": "me",
        "makes_time": False,
        "inside_jokes": False,
        "flirty_teasing": False,
        "personal_conversations": False,
        "future_plans": False,
        "recent_trend": "less",
    }
    res = client.post(f"{BACKEND}/api/analyze-signals", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["signal_score"] <= 3.5, f"Expected low score for cold signals, got {data['signal_score']}"


def check_signals_validation_error():
    payload = {
        "initiation_ratio": 5.0,  # Invalid: must be <= 1.0
        "avg_reply_time_minutes": 20,
        "conversation_frequency": "daily",
        "continues_conversations": True,
        "asks_questions_back": True,
        "remembers_details": True,
        "meetups_count": 4,
        "who_suggests_meetings": "both",
        "makes_time": True,
        "inside_jokes": True,
        "flirty_teasing": True,
        "personal_conversations": True,
        "future_plans": True,
        "recent_trend": "same",
    }
    res = client.post(f"{BACKEND}/api/analyze-signals", json=payload)
    assert res.status_code == 422, f"Expected 422 Unprocessable Entity, got {res.status_code}"


# 4. Reply Coach LLM Generation
def check_reply_coach():
    payload = {
        "her_message": "haha no way, that sounds crazy!",
        "conversation_context": "Talking about an awkward situation at work",
        "intent": "funny",
    }
    res = client.post(f"{BACKEND}/api/generate-reply", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "detected_tone" in data
    assert len(data["replies"]) == 3
    for r in data["replies"]:
        assert len(r["text"].strip()) > 0
        assert len(r["style"].strip()) > 0


# 5. Message Interpreter
def check_interpreter():
    payload = {
        "message": "fine",
        "context": "She took all day to respond after an argument",
    }
    res = client.post(f"{BACKEND}/api/interpret-message", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert len(data["readings"]) >= 2
    assert len(data["most_useful_next_move"]) > 0


# 6. Pre-Send Draft Check
def check_draft():
    payload = {
        "draft_message": "Are you avoiding me? Why haven't you answered my text?",
        "context": "Sent message 2 hours ago",
    }
    res = client.post(f"{BACKEND}/api/check-message", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert 1 <= data["pressure_score"] <= 10
    assert 1 <= data["clarity_score"] <= 10
    assert len(data["verdict"]) > 0
    assert len(data["wingman_quip"]) > 0


# 7. Screenshot Analyzer
def check_screenshot_valid():
    img = Image.new("RGB", (300, 150), color=(255, 255, 255))
    d = ImageDraw.Draw(img)
    d.text((20, 30), "Her: See you at 8!", fill=(0, 0, 0))
    d.text((20, 80), "You: Can't wait :)", fill=(0, 0, 0))
    buf = io.BytesIO()
    img.save(buf, format="PNG")

    files = {"file": ("test.png", buf.getvalue(), "image/png")}
    res = client.post(f"{BACKEND}/api/analyze-screenshot", files=files)
    assert res.status_code == 200
    data = res.json()
    assert len(data["extracted_messages"]) > 0
    assert "tone" in data
    assert "suggested_next_move" in data


def check_screenshot_invalid_file():
    files = {"file": ("malicious.txt", b"not an image", "text/plain")}
    res = client.post(f"{BACKEND}/api/analyze-screenshot", files=files)
    assert res.status_code == 400, f"Expected 400 Bad Request, got {res.status_code}"


# 8. Timeline CRUD & Persistence
def check_timeline_lifecycle():
    session_id = f"test_e2e_{int(time.time())}"

    # Check empty
    r1 = client.get(f"{BACKEND}/api/timeline/{session_id}")
    assert r1.status_code == 200
    assert len(r1.json()["entries"]) == 0

    # Add entry 1
    r2 = client.post(
        f"{BACKEND}/api/timeline/entry",
        json={
            "session_id": session_id,
            "signal_score": 4.5,
            "level": "Moderate",
            "notes": "Baseline",
            "features_snapshot": {"frequency": "weekly"},
        },
    )
    assert r2.status_code == 200

    # Add entry 2
    r3 = client.post(
        f"{BACKEND}/api/timeline/entry",
        json={
            "session_id": session_id,
            "signal_score": 7.5,
            "level": "Strong",
            "notes": "After date",
            "features_snapshot": {"frequency": "daily"},
        },
    )
    assert r3.status_code == 200

    # Fetch updated timeline
    r4 = client.get(f"{BACKEND}/api/timeline/{session_id}")
    assert r4.status_code == 200
    data = r4.json()
    assert len(data["entries"]) == 2
    assert data["trend_label"] == "Improving"
    assert data["trend_delta"] == 3.0

    # Delete / reset timeline
    r5 = client.delete(f"{BACKEND}/api/timeline/{session_id}")
    assert r5.status_code == 200

    # Verify empty again
    r6 = client.get(f"{BACKEND}/api/timeline/{session_id}")
    assert len(r6.json()["entries"]) == 0


if __name__ == "__main__":
    print("\n" + "=" * 55)
    print("🚀 RUNNING CRUSHCHECK E2E ROBUSTNESS TEST SUITE")
    print("=" * 55)

    test("Frontend All Routes Render (200 OK)", check_frontend)
    test("Backend Health Check", check_health)
    test("Signal Scorer (Balanced Profile)", check_signals_normal)
    test("Signal Scorer (Extreme Cold Profile)", check_signals_cold_edge_case)
    test("Signal Scorer Input Validation (Reject Invalid Range)", check_signals_validation_error)
    test("Reply Coach Generation (Tone + 3 Replies)", check_reply_coach)
    test("Message Interpreter (Readings + Next Move)", check_interpreter)
    test("Pre-Send Check (Pressure Scoring & Feedback)", check_draft)
    test("Screenshot Vision Analysis (PNG Image)", check_screenshot_valid)
    test("Screenshot Security (Reject Non-Image Files)", check_screenshot_invalid_file)
    test("Timeline Lifecycle (Create, Read, Trend Delta, Delete)", check_timeline_lifecycle)

    print("\n" + "=" * 55)
    print(f"FINAL RESULT: {passed} PASSED, {failed} FAILED")
    print("=" * 55 + "\n")

    if failed > 0:
        sys.exit(1)
