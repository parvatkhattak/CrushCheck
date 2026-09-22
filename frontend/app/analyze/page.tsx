"use client";

import { useState } from "react";
import {
  Heart,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  BookmarkPlus,
  RefreshCw,
  Info,
  Sparkles,
} from "lucide-react";
import {
  analyzeSignals,
  saveTimelineEntry,
  SignalInput,
  SignalResponse,
  ConversationFrequency,
  InitiationSide,
  RecentTrend,
} from "@/lib/api";

export default function AnalyzePage() {
  // Form State
  const [initiationSide, setInitiationSide] = useState<"me" | "her" | "both">("both");
  const [avgReplyTime, setAvgReplyTime] = useState<number>(25);
  const [frequency, setFrequency] = useState<ConversationFrequency>("daily");
  const [continuesConvo, setContinuesConvo] = useState<boolean>(true);
  const [asksQuestions, setAsksQuestions] = useState<boolean>(true);
  const [remembersDetails, setRemembersDetails] = useState<boolean>(true);
  const [meetupsCount, setMeetupsCount] = useState<number>(3);
  const [whoSuggests, setWhoSuggests] = useState<InitiationSide>("both");
  const [makesTime, setMakesTime] = useState<boolean>(true);
  const [insideJokes, setInsideJokes] = useState<boolean>(true);
  const [flirtyTeasing, setFlirtyTeasing] = useState<boolean>(true);
  const [personalConvo, setPersonalConvo] = useState<boolean>(true);
  const [futurePlans, setFuturePlans] = useState<boolean>(false);
  const [recentTrend, setRecentTrend] = useState<RecentTrend>("same");

  // Request State
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<SignalResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedNotes, setSavedNotes] = useState<string>("");
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSavedSuccess(false);

    // Map initiationSide to 0.0 - 1.0 ratio
    const initiation_ratio = initiationSide === "her" ? 0.8 : initiationSide === "both" ? 0.5 : 0.2;

    const payload: SignalInput = {
      initiation_ratio,
      avg_reply_time_minutes: avgReplyTime,
      conversation_frequency: frequency,
      continues_conversations: continuesConvo,
      asks_questions_back: asksQuestions,
      remembers_details: remembersDetails,
      meetups_count: meetupsCount,
      who_suggests_meetings: whoSuggests,
      makes_time: makesTime,
      inside_jokes: insideJokes,
      flirty_teasing: flirtyTeasing,
      personal_conversations: personalConvo,
      future_plans: futurePlans,
      recent_trend: recentTrend,
    };

    try {
      const data = await analyzeSignals(payload);
      setResult(data);
      // Smooth scroll to results
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight / 3, behavior: "smooth" });
      }, 100);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to analyze signals");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTimeline = async () => {
    if (!result) return;
    try {
      await saveTimelineEntry(
        result.signal_score,
        result.level,
        { meetups: meetupsCount, avgReplyTime, frequency },
        savedNotes || "Questionnaire analysis"
      );
      setSavedSuccess(true);
    } catch {
      alert("Failed to save to timeline");
    }
  };

  return (
    <div className="container" style={{ padding: "32px 16px 80px", maxWidth: "900px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <span className="badge badge-rose" style={{ marginBottom: "12px" }}>
          Calibrated Signal Model
        </span>
        <h1 style={{ fontSize: "2.4rem", marginBottom: "12px" }}>Analyze Her Signals</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "1.05rem", maxWidth: "600px", margin: "0 auto" }}>
          Answer these 14 behavioral questions. Our trained Machine Learning model evaluates real patterns to compute a calibrated 0–10 connection score.
        </p>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: "32px 24px", marginBottom: "36px" }}>
        {/* Section 1: Communication */}
        <div style={{ marginBottom: "32px" }}>
          <h3 style={{ fontSize: "1.2rem", display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px", color: "var(--rose-light)" }}>
            <span>1. Texting &amp; Communication Dynamics</span>
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 250px), 1fr))", gap: "20px" }}>
            {/* Initiation */}
            <div>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, marginBottom: "8px" }}>
                Who initiates conversations most often?
              </label>
              <div style={{ display: "flex", gap: "6px" }}>
                {(["me", "both", "her"] as const).map((side) => (
                  <button
                    key={side}
                    type="button"
                    onClick={() => setInitiationSide(side)}
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: "var(--radius-sm)",
                      border: initiationSide === side ? "1px solid var(--rose-primary)" : "1px solid var(--border-subtle)",
                      background: initiationSide === side ? "rgba(244, 63, 94, 0.2)" : "rgba(255, 255, 255, 0.03)",
                      color: initiationSide === side ? "#ffffff" : "var(--text-muted)",
                      fontWeight: 600,
                      cursor: "pointer",
                      textTransform: "capitalize",
                      fontSize: "0.88rem",
                    }}
                  >
                    {side === "me" ? "Mostly Me" : side === "her" ? "Mostly Her" : "Both Equal"}
                  </button>
                ))}
              </div>
            </div>

            {/* Reply Speed */}
            <div>
              <label style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", fontWeight: 600, marginBottom: "8px" }}>
                <span>Average reply time</span>
                <span style={{ color: "var(--rose-light)" }}>
                  {avgReplyTime < 60 ? `${avgReplyTime} mins` : `${Math.round(avgReplyTime / 60)} hours`}
                </span>
              </label>
              <input
                type="range"
                min="5"
                max="360"
                step="5"
                value={avgReplyTime}
                onChange={(e) => setAvgReplyTime(Number(e.target.value))}
                style={{ width: "100%", accentColor: "var(--rose-primary)" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-dim)", marginTop: "4px" }}>
                <span>&lt; 15m (Fast)</span>
                <span>1-2 hrs</span>
                <span>6+ hrs (Slow)</span>
              </div>
            </div>

            {/* Frequency */}
            <div>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, marginBottom: "8px" }}>
                Conversation Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as ConversationFrequency)}
                className="input-field"
                style={{ cursor: "pointer" }}
              >
                <option value="daily">Daily texting</option>
                <option value="few_per_week">A few times a week</option>
                <option value="once_a_week">Once a week</option>
                <option value="rarely">Rarely / sporadic</option>
              </select>
            </div>
          </div>

          {/* Yes/No pills */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px", marginTop: "20px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", background: "rgba(255, 255, 255, 0.02)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={continuesConvo}
                onChange={(e) => setContinuesConvo(e.target.checked)}
                style={{ accentColor: "var(--rose-primary)", width: "18px", height: "18px" }}
              />
              <span style={{ fontSize: "0.88rem" }}>Keeps conversations going (doesn&apos;t let them die)</span>
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", background: "rgba(255, 255, 255, 0.02)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={asksQuestions}
                onChange={(e) => setAsksQuestions(e.target.checked)}
                style={{ accentColor: "var(--rose-primary)", width: "18px", height: "18px" }}
              />
              <span style={{ fontSize: "0.88rem" }}>Asks questions back about you</span>
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", background: "rgba(255, 255, 255, 0.02)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={remembersDetails}
                onChange={(e) => setRemembersDetails(e.target.checked)}
                style={{ accentColor: "var(--rose-primary)", width: "18px", height: "18px" }}
              />
              <span style={{ fontSize: "0.88rem" }}>Remembers small personal details you mentioned</span>
            </label>
          </div>
        </div>

        {/* Section 2: Real Life */}
        <div style={{ marginBottom: "36px", borderTop: "1px solid var(--border-subtle)", paddingTop: "28px" }}>
          <h3 style={{ fontSize: "1.2rem", display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px", color: "var(--violet-light)" }}>
            <span>2. In-Person &amp; Real-Life Connection</span>
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 250px), 1fr))", gap: "20px" }}>
            <div>
              <label style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", fontWeight: 600, marginBottom: "8px" }}>
                <span>Times met in person</span>
                <span style={{ color: "var(--violet-light)" }}>{meetupsCount} times</span>
              </label>
              <input
                type="range"
                min="0"
                max="20"
                value={meetupsCount}
                onChange={(e) => setMeetupsCount(Number(e.target.value))}
                style={{ width: "100%", accentColor: "var(--violet-primary)" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, marginBottom: "8px" }}>
                Who suggests plans to hang out?
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                {(["me", "both", "her"] as const).map((side) => (
                  <button
                    key={side}
                    type="button"
                    onClick={() => setWhoSuggests(side)}
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: "var(--radius-sm)",
                      border: whoSuggests === side ? "1px solid var(--violet-primary)" : "1px solid var(--border-subtle)",
                      background: whoSuggests === side ? "rgba(139, 92, 246, 0.2)" : "rgba(255, 255, 255, 0.03)",
                      color: whoSuggests === side ? "#ffffff" : "var(--text-muted)",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontSize: "0.88rem",
                    }}
                  >
                    {side === "me" ? "I do" : side === "her" ? "She does" : "Both"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginTop: "16px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", background: "rgba(255, 255, 255, 0.02)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={makesTime}
                onChange={(e) => setMakesTime(e.target.checked)}
                style={{ accentColor: "var(--violet-primary)", width: "18px", height: "18px" }}
              />
              <span style={{ fontSize: "0.88rem" }}>Makes time specifically for you (reschedules rather than canceling outright)</span>
            </label>
          </div>
        </div>

        {/* Section 3: Social & Trend */}
        <div style={{ marginBottom: "36px", borderTop: "1px solid var(--border-subtle)", paddingTop: "28px" }}>
          <h3 style={{ fontSize: "1.2rem", display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px", color: "#fcd34d" }}>
            <span>3. Chemistry &amp; Recent Momentum</span>
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px", marginBottom: "24px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", background: "rgba(255, 255, 255, 0.02)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={insideJokes}
                onChange={(e) => setInsideJokes(e.target.checked)}
                style={{ accentColor: "#f59e0b", width: "18px", height: "18px" }}
              />
              <span style={{ fontSize: "0.88rem" }}>Inside jokes / recurring banter</span>
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", background: "rgba(255, 255, 255, 0.02)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={flirtyTeasing}
                onChange={(e) => setFlirtyTeasing(e.target.checked)}
                style={{ accentColor: "#f59e0b", width: "18px", height: "18px" }}
              />
              <span style={{ fontSize: "0.88rem" }}>Playful teasing or flirty banter</span>
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", background: "rgba(255, 255, 255, 0.02)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={personalConvo}
                onChange={(e) => setPersonalConvo(e.target.checked)}
                style={{ accentColor: "#f59e0b", width: "18px", height: "18px" }}
              />
              <span style={{ fontSize: "0.88rem" }}>Shares vulnerable / personal stories</span>
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", background: "rgba(255, 255, 255, 0.02)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={futurePlans}
                onChange={(e) => setFuturePlans(e.target.checked)}
                style={{ accentColor: "#f59e0b", width: "18px", height: "18px" }}
              />
              <span style={{ fontSize: "0.88rem" }}>Mentions future plans involving you</span>
            </label>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, marginBottom: "8px" }}>
              Recent Trend (Over last 1–2 weeks)
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "8px" }}>
              {(["more", "same", "less", "sudden_change"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setRecentTrend(t)}
                  style={{
                    padding: "10px",
                    borderRadius: "var(--radius-sm)",
                    border: recentTrend === t ? "1px solid #f59e0b" : "1px solid var(--border-subtle)",
                    background: recentTrend === t ? "rgba(245, 158, 11, 0.2)" : "rgba(255, 255, 255, 0.03)",
                    color: recentTrend === t ? "#ffffff" : "var(--text-muted)",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontSize: "0.85rem",
                  }}
                >
                  {t === "more" ? "📈 More active" : t === "same" ? "➡️ Steady" : t === "less" ? "📉 Slower/less" : "⚡ Sudden shift"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div style={{ padding: "12px 16px", borderRadius: "var(--radius-sm)", background: "rgba(239, 68, 68, 0.15)", border: "1px solid var(--danger)", color: "#fca5a5", fontSize: "0.9rem", marginBottom: "20px" }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
          style={{ width: "100%", padding: "16px", fontSize: "1.1rem" }}
        >
          {loading ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <RefreshCw size={18} className="spin" />
              <span>Calculating Model Signals...</span>
            </span>
          ) : (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <Sparkles size={18} />
              <span>Analyze Connection Signals</span>
            </span>
          )}
        </button>
      </form>

      {/* ─── Results Display ─────────────────────────────────────────────────── */}
      {result && (
        <div className="glass-panel" style={{ padding: "36px", border: "1px solid var(--border-glow)", animation: "fadeIn 0.5s ease" }}>
          {/* Top Score Banner */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "24px",
            borderBottom: "1px solid var(--border-subtle)",
            paddingBottom: "28px",
            marginBottom: "28px",
          }}>
            <div>
              <span className="badge badge-rose" style={{ marginBottom: "8px" }}>Signal Assessment</span>
              <h2 style={{ fontSize: "2rem" }}>
                {result.level} Positive Signals
              </h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", marginTop: "4px" }}>
                Model Confidence: Calibrated behavioral score evaluated across 14 signals
              </p>
            </div>

            {/* Score Ring */}
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(244, 63, 94, 0.2) 0%, rgba(18, 22, 36, 0.9) 70%)",
              border: "2px solid var(--rose-primary)",
              boxShadow: "0 0 25px rgba(244, 63, 94, 0.35)",
            }}>
              <span style={{ fontSize: "2.4rem", fontWeight: 900, lineHeight: 1, color: "#ffffff" }}>
                {result.signal_score}
              </span>
              <span style={{ fontSize: "0.75rem", color: "var(--rose-light)", fontWeight: 700, textTransform: "uppercase", marginTop: "2px" }}>
                out of 10
              </span>
            </div>
          </div>

          {/* Indicators Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginBottom: "32px" }}>
            <div style={{ background: "rgba(16, 185, 129, 0.05)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "var(--radius-md)", padding: "20px" }}>
              <h4 style={{ display: "flex", alignItems: "center", gap: "8px", color: "#6ee7b7", fontSize: "1rem", marginBottom: "12px" }}>
                <CheckCircle2 size={18} />
                <span>Positive Indicators ({result.positive_indicators.length})</span>
              </h4>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.88rem", color: "var(--text-muted)" }}>
                {result.positive_indicators.map((ind, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
                    <span style={{ color: "#6ee7b7" }}>•</span>
                    <span>{ind}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ background: "rgba(245, 158, 11, 0.05)", border: "1px solid rgba(245, 158, 11, 0.2)", borderRadius: "var(--radius-md)", padding: "20px" }}>
              <h4 style={{ display: "flex", alignItems: "center", gap: "8px", color: "#fcd34d", fontSize: "1rem", marginBottom: "12px" }}>
                <AlertCircle size={18} />
                <span>Unclear / Watch-out Signals ({result.unclear_indicators.length})</span>
              </h4>
              {result.unclear_indicators.length > 0 ? (
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.88rem", color: "var(--text-muted)" }}>
                  {result.unclear_indicators.map((ind, i) => (
                    <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
                      <span style={{ color: "#fcd34d" }}>•</span>
                      <span>{ind}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ fontSize: "0.88rem", color: "var(--text-dim)" }}>No negative or concerning signals detected.</p>
              )}
            </div>
          </div>

          {/* Detailed Signal Breakdown Table */}
          <div style={{ marginBottom: "32px" }}>
            <h4 style={{ fontSize: "1.1rem", marginBottom: "14px" }}>Signal Breakdown</h4>
            <div className="table-scroll-wrapper">
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-subtle)", textAlign: "left", color: "var(--text-dim)" }}>
                    <th style={{ padding: "10px 12px" }}>Signal</th>
                    <th style={{ padding: "10px 12px" }}>Observation</th>
                    <th style={{ padding: "10px 12px" }}>Interpretation</th>
                  </tr>
                </thead>
                <tbody>
                  {result.breakdown.map((row, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                      <td style={{ padding: "12px", fontWeight: 600, color: "var(--text-main)" }}>{row.signal}</td>
                      <td style={{ padding: "12px", color: "var(--text-muted)" }}>{row.observation}</td>
                      <td style={{ padding: "12px" }}>
                        <span style={{
                          padding: "3px 8px",
                          borderRadius: "var(--radius-full)",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          background: row.color === "positive" ? "rgba(16, 185, 129, 0.15)" : row.color === "negative" ? "rgba(239, 68, 68, 0.15)" : "rgba(245, 158, 11, 0.15)",
                          color: row.color === "positive" ? "#6ee7b7" : row.color === "negative" ? "#fca5a5" : "#fcd34d",
                        }}>
                          {row.interpretation}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Disclaimer */}
          <div style={{
            padding: "16px",
            borderRadius: "var(--radius-md)",
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px solid var(--border-subtle)",
            fontSize: "0.85rem",
            color: "var(--text-dim)",
            lineHeight: 1.5,
            marginBottom: "28px",
            display: "flex",
            gap: "10px",
          }}>
            <Info size={18} style={{ flexShrink: 0, marginTop: "2px", color: "var(--rose-light)" }} />
            <span><strong>What this does NOT establish:</strong> {result.disclaimer}</span>
          </div>

          {/* Save to Timeline */}
          <div style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            padding: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}>
            <div style={{ flex: 1, minWidth: "min(100%, 240px)" }}>
              <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-main)" }}>
                Track this check-in over time
              </div>
              <input
                type="text"
                placeholder="Optional note (e.g. 'After our 3rd coffee date')"
                value={savedNotes}
                onChange={(e) => setSavedNotes(e.target.value)}
                className="input-field"
                style={{ marginTop: "8px", padding: "8px 12px", fontSize: "0.85rem" }}
              />
            </div>

            <button
              onClick={handleSaveTimeline}
              disabled={savedSuccess}
              className="btn-secondary"
              style={{
                alignSelf: "flex-end",
                background: savedSuccess ? "rgba(16, 185, 129, 0.2)" : undefined,
                color: savedSuccess ? "#6ee7b7" : undefined,
                borderColor: savedSuccess ? "rgba(16, 185, 129, 0.4)" : undefined,
              }}
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 size={16} />
                  <span>Saved to Timeline!</span>
                </>
              ) : (
                <>
                  <BookmarkPlus size={16} />
                  <span>Save to Anonymous Timeline</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
