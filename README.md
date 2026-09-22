# 💘 CrushCheck

> **AI Relationship Signal Analyzer & Honest Dating Wingman**  
> Decode mixed signals, diagnose conversation dynamics from screenshots, get tone-matched replies, and check your drafts before sending — 100% anonymously.

---

## 🌟 Overview

CrushCheck solves the common dilemma: *"Is she into me, or just being nice?"*

Instead of ungrounded advice or cheesy pickup lines, CrushCheck uses:
1. **Calibrated ML Scorer**: A trained Gradient Boosting model ($R^2 = 0.835$) that evaluates 14 behavioral metrics to compute an explainable connection score ($0–10$).
2. **Ultra-Fast Multimodal AI (Groq API)**: Real-time tone-matched reply coaching, message ambiguity interpretation, pre-send draft vetting, and in-memory screenshot analysis.
3. **Zero-Knowledge Privacy**: No login, no accounts, no tracking. Screenshots are processed in RAM only and never saved to disk. Session history is stored anonymously in `localStorage` and SQLite.

---

## 🚀 Key Features

| Tool | Path | What It Does |
| :--- | :--- | :--- |
| **Signal Analyzer** | `/analyze` | 14-variable behavioral questionnaire with score ring, positive & unclear indicators, and detailed breakdown. |
| **Reply Coach** | `/reply` | Analyzes her message and context to generate 3 tone-matched replies (Flirty, Funny, Caring, Invite, etc.). |
| **Screenshot Decoder** | `/screenshot` | In-memory multimodal vision analysis of chat screenshots with client-side header redaction. |
| **Message Interpreter** | `/interpret` | Decodes dry texts (*"k"*, *"maybe"*, *"up to you"*) with charitable-to-realistic readings and an overthinking alert. |
| **Pre-Send Check** | `/check` | Evaluates your draft for pressure level, clarity, and flirtiness, with honest wingman quips and rewrites. |
| **Timeline Tracker** | `/timeline` | Tracks how connection signals evolve over time with trajectory badges, delta points, and milestones. |

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: Next.js 16 (App Router + Turbopack), TypeScript, Vanilla CSS design system (dark glassmorphism, responsive micro-animations, Outfit & Plus Jakarta Sans typography), Lucide icons.
- **Backend**: FastAPI (Python 3.11), Uvicorn, Scikit-learn (Gradient Boosting Regressor), SQLite.
- **LLM Engine**: Groq API (`openai/gpt-oss-20b` for text generation, `qwen/qwen3.8-27b` for vision).

---

## 🏃 Getting Started Locally

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ (tested on v22)
- Free Groq API key from [console.groq.com](https://console.groq.com)

### 2. Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create .env file:
cat << 'EOF' > .env
GROQ_API_KEY=your_groq_key_here
GROQ_MODEL=openai/gpt-oss-20b
GROQ_VISION_MODEL=qwen/qwen3.8-27b
ENVIRONMENT=development
SESSION_TTL_HOURS=24
EOF

# Train ML model & start server
uvicorn main:app --reload --port 8000
```
Backend API will be live at `http://localhost:8000` (docs at `http://localhost:8000/docs`).

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev -- -p 3000
```
Web app will be running at `http://localhost:3000`.

---

## 🔒 Privacy & Safety Guarantee

- **No Authentication Required**: Every visitor gets an anonymous client-side session ID.
- **Ephemeral Screenshot Analysis**: Uploaded images are held in memory as base64 buffers and destroyed immediately after inference.
- **Client-Side Redaction**: Built-in canvas feature masks contact names and profile photos before sending.
- **Session Wipe**: Single-click *"Reset My Anonymous Session"* instantly deletes all timeline records from the server and local storage.

---

## 📜 License
MIT License.
