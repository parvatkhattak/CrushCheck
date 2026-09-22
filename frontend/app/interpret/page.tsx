"use client";

import { useState } from "react";
import {
  HelpCircle,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Compass,
} from "lucide-react";
import { interpretMessage, InterpretResponse } from "@/lib/api";

const QUICK_EXAMPLES = [
  { text: "k", ctx: "I sent a long message about my day" },
  { text: "haha yeah", ctx: "After I shared an funny story and asked what she thought" },
  { text: "maybe next week, super busy rn!", ctx: "Asked her out for dinner this Friday" },
  { text: "up to you haha", ctx: "Asked if she wanted to grab drinks or coffee" },
];

export default function InterpretPage() {
  const [message, setMessage] = useState("");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InterpretResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInterpret = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const data = await interpretMessage(message, context);
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to interpret message");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectExample = (ex: { text: string; ctx: string }) => {
    setMessage(ex.text);
    setContext(ex.ctx);
  };

  const getColorStyles = (color: string) => {
    switch (color) {
      case "green":
        return { bg: "rgba(16, 185, 129, 0.1)", border: "rgba(16, 185, 129, 0.3)", text: "#6ee7b7" };
      case "yellow":
        return { bg: "rgba(245, 158, 11, 0.1)", border: "rgba(245, 158, 11, 0.3)", text: "#fcd34d" };
      case "orange":
        return { bg: "rgba(249, 115, 22, 0.1)", border: "rgba(249, 115, 22, 0.3)", text: "#fdba74" };
      case "red":
      default:
        return { bg: "rgba(239, 68, 68, 0.1)", border: "rgba(239, 68, 68, 0.3)", text: "#fca5a5" };
    }
  };

  return (
    <div className="container" style={{ padding: "40px 24px 80px", maxWidth: "860px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <span className="badge badge-warning" style={{ marginBottom: "12px" }}>
          Overthinking Cure
        </span>
        <h1 style={{ fontSize: "2.4rem", marginBottom: "12px" }}>Message Interpreter</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "1.05rem", maxWidth: "580px", margin: "0 auto" }}>
          Stuck deciphering a dry or ambiguous text? Get 2–4 calibrated perspectives from charitable to realistic, without spirals of overthinking.
        </p>
      </div>

      {/* Input Box */}
      <form onSubmit={handleInterpret} className="glass-panel" style={{ padding: "32px", marginBottom: "36px" }}>
        {/* Quick Examples */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", fontSize: "0.82rem", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 600, marginBottom: "8px" }}>
            Try a common dry text:
          </label>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {QUICK_EXAMPLES.map((ex, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectExample(ex)}
                style={{
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-full)",
                  padding: "6px 12px",
                  fontSize: "0.82rem",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                }}
              >
                &ldquo;{ex.text}&rdquo;
              </button>
            ))}
          </div>
        </div>

        {/* Message */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", fontSize: "0.92rem", fontWeight: 600, marginBottom: "8px" }}>
            The Ambiguous Message <span style={{ color: "var(--rose-primary)" }}>*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. 'k' or 'haha sure' or 'maybe next time!'"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="input-field"
          />
        </div>

        {/* Context */}
        <div style={{ marginBottom: "28px" }}>
          <label style={{ display: "block", fontSize: "0.92rem", fontWeight: 600, marginBottom: "8px" }}>
            Conversation Context
          </label>
          <textarea
            rows={2}
            placeholder="What did you text before this? How long did it take her to reply?"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            className="input-field"
          />
        </div>

        {error && (
          <div style={{ padding: "12px 16px", borderRadius: "var(--radius-sm)", background: "rgba(239, 68, 68, 0.15)", border: "1px solid var(--danger)", color: "#fca5a5", fontSize: "0.9rem", marginBottom: "20px" }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !message.trim()}
          className="btn-primary"
          style={{ width: "100%", padding: "15px", fontSize: "1.05rem" }}
        >
          {loading ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <RefreshCw size={18} className="spin" />
              <span>Calibrating Possible Readings...</span>
            </span>
          ) : (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <Sparkles size={18} />
              <span>Decode This Message</span>
            </span>
          )}
        </button>
      </form>

      {/* ─── Results ─────────────────────────────────────────────────────────── */}
      {result && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", animation: "fadeIn 0.4s ease" }}>
          {/* Overthinking Alert */}
          {result.overthinking_warning && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "16px 20px",
              borderRadius: "var(--radius-md)",
              background: "rgba(245, 158, 11, 0.12)",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              color: "#fcd34d",
              fontSize: "0.92rem",
            }}>
              <AlertTriangle size={20} style={{ flexShrink: 0 }} />
              <div>
                <strong>Overthinking Reality Check:</strong> {result.overthinking_warning}
              </div>
            </div>
          )}

          {/* Readings */}
          <div className="glass-panel" style={{ padding: "32px" }}>
            <h3 style={{ fontSize: "1.2rem", marginBottom: "20px" }}>Possible Interpretations</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
              {result.readings.map((reading, i) => {
                const style = getColorStyles(reading.color);
                return (
                  <div
                    key={i}
                    style={{
                      background: style.bg,
                      border: `1px solid ${style.border}`,
                      borderRadius: "var(--radius-md)",
                      padding: "20px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                      <span style={{ fontSize: "1.4rem" }}>{reading.emoji}</span>
                      <span style={{ fontWeight: 700, fontSize: "0.95rem", color: style.text }}>
                        {reading.label}
                      </span>
                    </div>
                    <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                      {reading.explanation}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Next Move */}
          <div style={{
            background: "linear-gradient(135deg, rgba(244, 63, 94, 0.12), rgba(139, 92, 246, 0.12))",
            border: "1px solid rgba(244, 63, 94, 0.3)",
            borderRadius: "var(--radius-md)",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--rose-light)", fontWeight: 700, fontSize: "0.95rem" }}>
              <Compass size={18} />
              <span>Recommended Next Move</span>
            </div>
            <p style={{ fontSize: "0.95rem", color: "#ffffff", lineHeight: 1.6 }}>
              {result.most_useful_next_move}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
