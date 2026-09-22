"use client";

import { useState } from "react";
import {
  MessageSquare,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Heart,
  Smile,
  Flame,
  HandHeart,
  Forward,
  Calendar,
} from "lucide-react";
import { generateReplies, ReplyIntent, ReplyResponse } from "@/lib/api";

const INTENTS: { id: ReplyIntent; label: string; icon: React.ElementType; desc: string }[] = [
  { id: "flirty", label: "Flirty & Playful", icon: Flame, desc: "Light tease matching her tone" },
  { id: "funny", label: "Funny / Witty", icon: Smile, desc: "Make her laugh naturally" },
  { id: "keep_going", label: "Keep Going", icon: Forward, desc: "Keep momentum without escalating" },
  { id: "caring", label: "Warm & Caring", icon: Heart, desc: "Show genuine interest and warmth" },
  { id: "ask_out", label: "Suggest Meetup", icon: Calendar, desc: "Low pressure, confident invite" },
  { id: "supportive", label: "Supportive", icon: HandHeart, desc: "Emotionally present and grounded" },
];

export default function ReplyCoachPage() {
  const [herMessage, setHerMessage] = useState("");
  const [context, setContext] = useState("");
  const [intent, setIntent] = useState<ReplyIntent>("flirty");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReplyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!herMessage.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const data = await generateReplies({
        her_message: herMessage,
        conversation_context: context.trim() || undefined,
        intent,
      });
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to generate replies");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="container" style={{ padding: "40px 24px 80px", maxWidth: "860px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <span className="badge badge-violet" style={{ marginBottom: "12px" }}>
          Tone-Matched AI Coach
        </span>
        <h1 style={{ fontSize: "2.4rem", marginBottom: "12px" }}>Reply Coach</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "1.05rem", maxWidth: "580px", margin: "0 auto" }}>
          Paste her text, choose your vibe, and get three natural, calibrated reply options that fit the conversation without sounding desperate or robotic.
        </p>
      </div>

      {/* Input Box */}
      <form onSubmit={handleGenerate} className="glass-panel" style={{ padding: "32px", marginBottom: "36px" }}>
        {/* Her Message */}
        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", fontSize: "0.92rem", fontWeight: 600, marginBottom: "8px" }}>
            Her Last Message <span style={{ color: "var(--rose-primary)" }}>*</span>
          </label>
          <textarea
            required
            rows={3}
            placeholder="e.g. 'haha that is so random, what are you even doing this weekend?'"
            value={herMessage}
            onChange={(e) => setHerMessage(e.target.value)}
            className="input-field"
          />
        </div>

        {/* Context */}
        <div style={{ marginBottom: "28px" }}>
          <label style={{ display: "flex", justifyContent: "space-between", fontSize: "0.92rem", fontWeight: 600, marginBottom: "8px" }}>
            <span>Recent Context <span style={{ color: "var(--text-dim)", fontWeight: 400 }}>(Optional)</span></span>
          </label>
          <input
            type="text"
            placeholder="e.g. 'Talking for 2 weeks, we met once for coffee, mostly teasing banter'"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            className="input-field"
          />
        </div>

        {/* Intent Selector */}
        <div style={{ marginBottom: "28px" }}>
          <label style={{ display: "block", fontSize: "0.92rem", fontWeight: 600, marginBottom: "12px" }}>
            Your Intended Vibe:
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" }}>
            {INTENTS.map((item) => {
              const Icon = item.icon;
              const isSelected = intent === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setIntent(item.id)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    padding: "12px 14px",
                    borderRadius: "var(--radius-md)",
                    border: isSelected ? "1px solid var(--violet-primary)" : "1px solid var(--border-subtle)",
                    background: isSelected ? "rgba(139, 92, 246, 0.2)" : "rgba(255, 255, 255, 0.02)",
                    color: isSelected ? "#ffffff" : "var(--text-muted)",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all var(--transition-fast)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 600, fontSize: "0.9rem", color: isSelected ? "#ffffff" : "var(--text-main)", marginBottom: "4px" }}>
                    <Icon size={16} color={isSelected ? "var(--violet-light)" : "var(--text-dim)"} />
                    <span>{item.label}</span>
                  </div>
                  <span style={{ fontSize: "0.76rem", color: "var(--text-dim)", lineHeight: 1.3 }}>
                    {item.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div style={{ padding: "12px 16px", borderRadius: "var(--radius-sm)", background: "rgba(239, 68, 68, 0.15)", border: "1px solid var(--danger)", color: "#fca5a5", fontSize: "0.9rem", marginBottom: "20px" }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !herMessage.trim()}
          className="btn-primary"
          style={{ width: "100%", padding: "15px", fontSize: "1.05rem" }}
        >
          {loading ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <RefreshCw size={18} className="spin" />
              <span>Generating Tone-Matched Options...</span>
            </span>
          ) : (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <Sparkles size={18} />
              <span>Coach My Reply</span>
            </span>
          )}
        </button>
      </form>

      {/* Generated Replies Display */}
      {result && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", animation: "fadeIn 0.4s ease" }}>
          {/* Tone & Context note */}
          <div className="glass-panel" style={{ padding: "20px 24px", borderLeft: "4px solid var(--violet-primary)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <span className="badge badge-violet">Detected Tone: {result.detected_tone}</span>
            </div>
            <p style={{ fontSize: "0.92rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
              💡 <strong>Wingman Insight:</strong> {result.context_note}
            </p>
          </div>

          {/* 3 Reply Options */}
          {result.replies.map((reply, idx) => (
            <div
              key={idx}
              className="glass-panel glass-panel-hover"
              style={{
                padding: "24px",
                position: "relative",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <span className="badge badge-rose" style={{ fontSize: "0.76rem" }}>
                  Option {idx + 1}: {reply.style}
                </span>

                <button
                  type="button"
                  onClick={() => handleCopy(reply.text, idx)}
                  className="btn-secondary"
                  style={{
                    padding: "6px 12px",
                    fontSize: "0.8rem",
                    borderRadius: "var(--radius-sm)",
                    background: copiedIndex === idx ? "rgba(16, 185, 129, 0.2)" : undefined,
                    color: copiedIndex === idx ? "#6ee7b7" : undefined,
                    borderColor: copiedIndex === idx ? "rgba(16, 185, 129, 0.4)" : undefined,
                  }}
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check size={14} />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy Text</span>
                    </>
                  )}
                </button>
              </div>

              {/* Message bubble */}
              <div style={{
                padding: "16px 20px",
                background: "rgba(244, 63, 94, 0.08)",
                border: "1px solid rgba(244, 63, 94, 0.2)",
                borderRadius: "var(--radius-md)",
                fontSize: "1.05rem",
                fontWeight: 500,
                color: "#ffffff",
                lineHeight: 1.5,
                marginBottom: "12px",
              }}>
                &ldquo;{reply.text}&rdquo;
              </div>

              <p style={{ fontSize: "0.85rem", color: "var(--text-dim)", lineHeight: 1.4 }}>
                <strong>Why it works:</strong> {reply.explanation}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
