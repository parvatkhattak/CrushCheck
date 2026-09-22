/**
 * lib/api.ts
 * Type definitions and client-side API helper functions for CrushCheck.
 */

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/, "");

// ─── Session Management ───────────────────────────────────────────────────────

export function getSessionId(): string {
  if (typeof window === "undefined") return "server-session";
  let sessionId = localStorage.getItem("crushcheck_session_id");
  if (!sessionId) {
    sessionId = "cc_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now().toString(36);
    localStorage.setItem("crushcheck_session_id", sessionId);
  }
  return sessionId;
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface HealthStatus {
  status: string;
  model_loaded: boolean;
  version: string;
  ollama_running: boolean;
  ollama_model_ready: boolean;
}

export type ConversationFrequency = "daily" | "few_per_week" | "once_a_week" | "rarely";
export type InitiationSide = "me" | "her" | "both";
export type RecentTrend = "more" | "same" | "less" | "sudden_change";

export interface SignalInput {
  initiation_ratio: number;
  avg_reply_time_minutes: number;
  conversation_frequency: ConversationFrequency;
  continues_conversations: boolean;
  asks_questions_back: boolean;
  remembers_details: boolean;
  meetups_count: number;
  who_suggests_meetings: InitiationSide;
  makes_time: boolean;
  inside_jokes: boolean;
  flirty_teasing: boolean;
  personal_conversations: boolean;
  future_plans: boolean;
  recent_trend: RecentTrend;
}

export interface SignalBreakdownRow {
  signal: string;
  observation: string;
  interpretation: string;
  color: "positive" | "neutral" | "negative";
}

export interface SignalResponse {
  signal_score: number;
  level: "Strong" | "Moderate" | "Weak" | "Ambiguous" | string;
  positive_indicators: string[];
  unclear_indicators: string[];
  disclaimer: string;
  breakdown: SignalBreakdownRow[];
  dont_overthink?: string | null;
}

export type ReplyIntent = "caring" | "funny" | "flirty" | "supportive" | "keep_going" | "ask_out";

export interface ReplyRequest {
  her_message: string;
  conversation_context?: string;
  intent: ReplyIntent;
}

export interface ReplyOption {
  style: string;
  text: string;
  explanation: string;
}

export interface ReplyResponse {
  detected_tone: string;
  context_note: string;
  replies: ReplyOption[];
}

export interface InterpretReading {
  emoji: string;
  label: string;
  color: string;
  explanation: string;
}

export interface InterpretResponse {
  readings: InterpretReading[];
  most_useful_next_move: string;
  overthinking_warning?: string | null;
}

export interface CheckMessageResponse {
  pressure_score: number;
  clarity_score: number;
  naturalness_score: number;
  flirt_level: number;
  context_fit: "Good" | "Okay" | "Risky" | string;
  verdict: string;
  improved_version?: string | null;
  wingman_quip: string;
}

export interface ExtractedMessage {
  speaker: "you" | "her" | string;
  text: string;
  timestamp?: string | null;
}

export interface ScreenshotAnalysisResponse {
  extracted_messages: ExtractedMessage[];
  tone: string;
  engagement_level: string;
  reciprocity: string;
  momentum: string;
  insights: string[];
  suggested_next_move: string;
}

export interface TimelineEntry {
  entry_id: string;
  session_id: string;
  signal_score: number;
  level: string;
  notes?: string | null;
  features_snapshot: Record<string, unknown>;
  created_at: string;
}

export interface TimelineResponse {
  session_id: string;
  entries: TimelineEntry[];
  trend_label: string;
  trend_delta?: number | null;
  milestones: string[];
}

// ─── API Methods ─────────────────────────────────────────────────────────────

export async function fetchHealth(): Promise<HealthStatus> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error("Health check failed");
  return res.json();
}

export async function analyzeSignals(data: SignalInput): Promise<SignalResponse> {
  const res = await fetch(`${API_BASE}/api/analyze-signals`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Analysis failed" }));
    throw new Error(err.detail || "Signal analysis failed");
  }
  return res.json();
}

export async function generateReplies(data: ReplyRequest): Promise<ReplyResponse> {
  const res = await fetch(`${API_BASE}/api/generate-reply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Reply generation failed" }));
    throw new Error(err.detail || "Reply generation failed");
  }
  return res.json();
}

export async function interpretMessage(message: string, context?: string): Promise<InterpretResponse> {
  const res = await fetch(`${API_BASE}/api/interpret-message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, context: context || null }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Message interpretation failed" }));
    throw new Error(err.detail || "Message interpretation failed");
  }
  return res.json();
}

export async function checkMessage(draft_message: string, context?: string): Promise<CheckMessageResponse> {
  const res = await fetch(`${API_BASE}/api/check-message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ draft_message, context: context || null }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Message check failed" }));
    throw new Error(err.detail || "Message check failed");
  }
  return res.json();
}

export async function uploadScreenshot(file: File): Promise<ScreenshotAnalysisResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/api/analyze-screenshot`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Screenshot analysis failed" }));
    throw new Error(err.detail || "Screenshot analysis failed");
  }
  return res.json();
}

export async function saveTimelineEntry(
  score: number,
  level: string,
  snapshot: Record<string, unknown>,
  notes?: string
): Promise<TimelineEntry> {
  const session_id = getSessionId();
  const res = await fetch(`${API_BASE}/api/timeline/entry`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      session_id,
      signal_score: score,
      level,
      features_snapshot: snapshot,
      notes: notes || null,
    }),
  });
  if (!res.ok) {
    throw new Error("Failed to save timeline entry");
  }
  return res.json();
}

export async function fetchTimeline(): Promise<TimelineResponse> {
  const session_id = getSessionId();
  const res = await fetch(`${API_BASE}/api/timeline/${session_id}`);
  if (!res.ok) {
    throw new Error("Failed to load timeline");
  }
  return res.json();
}

export async function clearTimeline(): Promise<void> {
  const session_id = getSessionId();
  await fetch(`${API_BASE}/api/timeline/${session_id}`, { method: "DELETE" });
}
