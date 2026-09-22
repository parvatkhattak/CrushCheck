"use client";

import { useState } from "react";
import {
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  AlertOctagon,
  CheckCircle,
} from "lucide-react";
import { checkMessage, CheckMessageResponse } from "@/lib/api";

const QUICK_DRAFTS = [
  { draft: "Hey why did you ignore my message from earlier? Did I do something wrong?", ctx: "She hasn't replied in 4 hours" },
  { draft: "Free this weekend? We should grab coffee at that spot you mentioned", ctx: "Talking for 10 days, vibing well" },
  { draft: "I've really enjoyed talking to you and feel like we have a genuine deep soul connection", ctx: "Talked for 5 days on Hinge, haven't met yet" },
];

export default function CheckPage() {
  const [draft, setDraft] = useState("");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckMessageResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCheck = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!draft.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const data = await checkMessage(draft, context);
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to evaluate draft");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container" style={{ padding: "40px 24px 80px", maxWidth: "860px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <span className="badge badge-success" style={{ marginBottom: "12px" }}>
          Dignity &amp; Pressure Filter
        </span>
        <h1 style={{ fontSize: "2.4rem", marginBottom: "12px" }}>Pre-Send Check</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "1.05rem", maxWidth: "580px", margin: "0 auto" }}>
          Run your drafted text through the wingman filter before hitting send. Measure pressure, cringe level, and naturalness — plus get an improved version.
        </p>
      </div>

      {/* Input Box */}
      <form onSubmit={handleCheck} className="glass-panel" style={{ padding: "32px", marginBottom: "36px" }}>
        {/* Quick examples */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", fontSize: "0.82rem", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 600, marginBottom: "8px" }}>
            Test a draft scenario:
          </label>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {QUICK_DRAFTS.map((ex, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setDraft(ex.draft);
                  setContext(ex.ctx);
                }}
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
                Draft {i + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Draft text */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", fontSize: "0.92rem", fontWeight: 600, marginBottom: "8px" }}>
            Your Draft Message <span style={{ color: "var(--rose-primary)" }}>*</span>
          </label>
          <textarea
            rows={3}
            required
            placeholder="Type your drafted text here before you send it..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="input-field"
          />
        </div>

        {/* Context */}
        <div style={{ marginBottom: "28px" }}>
          <label style={{ display: "block", fontSize: "0.92rem", fontWeight: 600, marginBottom: "8px" }}>
            Context <span style={{ color: "var(--text-dim)", fontWeight: 400 }}>(Optional)</span>
          </label>
          <input
            type="text"
            placeholder="e.g. 'She took 3 hours to reply', 'First text after getting her number'"
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
          disabled={loading || !draft.trim()}
          className="btn-primary"
          style={{ width: "100%", padding: "15px", fontSize: "1.05rem" }}
        >
          {loading ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <RefreshCw size={18} className="spin" />
              <span>Scanning Draft for Pressure &amp; Tone...</span>
            </span>
          ) : (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <ShieldCheck size={18} />
              <span>Scan Before Sending</span>
            </span>
          )}
        </button>
      </form>

      {/* ─── Results ─────────────────────────────────────────────────────────── */}
      {result && (
        <div className="glass-panel" style={{ padding: "36px", border: "1px solid var(--border-glow)", animation: "fadeIn 0.5s ease" }}>
          {/* Verdict Banner */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
            borderBottom: "1px solid var(--border-subtle)",
            paddingBottom: "24px",
            marginBottom: "28px",
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <span className="badge" style={{
                  background: result.context_fit === "Good" ? "rgba(16, 185, 129, 0.15)" : result.context_fit === "Risky" ? "rgba(239, 68, 68, 0.15)" : "rgba(245, 158, 11, 0.15)",
                  color: result.context_fit === "Good" ? "#6ee7b7" : result.context_fit === "Risky" ? "#fca5a5" : "#fcd34d",
                  border: `1px solid ${result.context_fit === "Good" ? "rgba(16, 185, 129, 0.3)" : result.context_fit === "Risky" ? "rgba(239, 68, 68, 0.3)" : "rgba(245, 158, 11, 0.3)"}`,
                }}>
                  Fit Verdict: {result.context_fit}
                </span>
              </div>
              <h3 style={{ fontSize: "1.3rem" }}>{result.verdict}</h3>
            </div>

            {/* Wingman Quip */}
            <div style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
              padding: "14px 18px",
              maxWidth: "340px",
            }}>
              <div style={{ fontSize: "0.75rem", color: "var(--rose-light)", fontWeight: 700, textTransform: "uppercase", marginBottom: "4px" }}>
                Honest Wingman Comment
              </div>
              <div style={{ fontSize: "0.9rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                &ldquo;{result.wingman_quip}&rdquo;
              </div>
            </div>
          </div>

          {/* 4 Gauges */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "32px" }}>
            {/* Pressure */}
            <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", fontWeight: 600, marginBottom: "8px" }}>
                <span>Pressure Level</span>
                <span style={{ color: result.pressure_score > 6 ? "#fca5a5" : "#6ee7b7" }}>{result.pressure_score}/10</span>
              </div>
              <div style={{ height: "6px", background: "rgba(255, 255, 255, 0.08)", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${result.pressure_score * 10}%`, background: result.pressure_score > 6 ? "#ef4444" : "#10b981" }} />
              </div>
              <span style={{ fontSize: "0.72rem", color: "var(--text-dim)", marginTop: "6px", display: "block" }}>
                {result.pressure_score > 6 ? "Puts high pressure on her" : "Comfortable & low-pressure"}
              </span>
            </div>

            {/* Clarity */}
            <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", fontWeight: 600, marginBottom: "8px" }}>
                <span>Clarity</span>
                <span style={{ color: "#c4b5fd" }}>{result.clarity_score}/10</span>
              </div>
              <div style={{ height: "6px", background: "rgba(255, 255, 255, 0.08)", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${result.clarity_score * 10}%`, background: "var(--violet-primary)" }} />
              </div>
              <span style={{ fontSize: "0.72rem", color: "var(--text-dim)", marginTop: "6px", display: "block" }}>
                Intent readability
              </span>
            </div>

            {/* Naturalness */}
            <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", fontWeight: 600, marginBottom: "8px" }}>
                <span>Naturalness</span>
                <span style={{ color: "#6ee7b7" }}>{result.naturalness_score}/10</span>
              </div>
              <div style={{ height: "6px", background: "rgba(255, 255, 255, 0.08)", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${result.naturalness_score * 10}%`, background: "#10b981" }} />
              </div>
              <span style={{ fontSize: "0.72rem", color: "var(--text-dim)", marginTop: "6px", display: "block" }}>
                Authentic conversational flow
              </span>
            </div>

            {/* Flirt level */}
            <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", fontWeight: 600, marginBottom: "8px" }}>
                <span>Flirt Level</span>
                <span style={{ color: "#fb7185" }}>{result.flirt_level}/10</span>
              </div>
              <div style={{ height: "6px", background: "rgba(255, 255, 255, 0.08)", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${result.flirt_level * 10}%`, background: "var(--rose-primary)" }} />
              </div>
              <span style={{ fontSize: "0.72rem", color: "var(--text-dim)", marginTop: "6px", display: "block" }}>
                Romantic / flirt heat
              </span>
            </div>
          </div>

          {/* Improved Version */}
          {result.improved_version && (
            <div style={{
              background: "linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(139, 92, 246, 0.08))",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              borderRadius: "var(--radius-md)",
              padding: "24px",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span className="badge badge-success" style={{ fontSize: "0.76rem" }}>
                  Wingman Calibrated Rewrite
                </span>

                <button
                  type="button"
                  onClick={() => handleCopy(result.improved_version!)}
                  className="btn-secondary"
                  style={{
                    padding: "6px 12px",
                    fontSize: "0.8rem",
                    borderRadius: "var(--radius-sm)",
                    background: copied ? "rgba(16, 185, 129, 0.2)" : undefined,
                    color: copied ? "#6ee7b7" : undefined,
                  }}
                >
                  {copied ? (
                    <>
                      <Check size={14} />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy Rewrite</span>
                    </>
                  )}
                </button>
              </div>

              <div style={{
                fontSize: "1.05rem",
                color: "#ffffff",
                lineHeight: 1.5,
                fontWeight: 500,
              }}>
                &ldquo;{result.improved_version}&rdquo;
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
