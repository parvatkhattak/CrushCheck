"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Heart,
  MessageSquare,
  Image as ImageIcon,
  HelpCircle,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Zap,
  Lock,
} from "lucide-react";
import { fetchHealth, HealthStatus } from "@/lib/api";

export default function HomePage() {
  const [health, setHealth] = useState<HealthStatus | null>(null);

  useEffect(() => {
    fetchHealth()
      .then(setHealth)
      .catch(() => setHealth({ status: "offline", model_loaded: false, version: "1.0", ollama_running: false, ollama_model_ready: false }));
  }, []);

  return (
    <div style={{ position: "relative", paddingBottom: "60px" }}>
      {/* ─── Hero Section ──────────────────────────────────────────────────────── */}
      <section style={{
        padding: "80px 0 60px",
        textAlign: "center",
        position: "relative",
      }}>
        <div className="container" style={{ maxWidth: "900px" }}>
          {/* Eyebrow */}
          <div style={{ display: "inline-flex", marginBottom: "20px" }}>
            <span className="badge badge-rose" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", padding: "6px 16px" }}>
              <Sparkles size={14} />
              <span>Calibrated AI Wingman & Signal Analyzer</span>
            </span>
          </div>

          {/* Heading */}
          <h1 style={{
            fontSize: "clamp(2.5rem, 5vw, 4.2rem)",
            lineHeight: 1.1,
            fontWeight: 800,
            marginBottom: "24px",
          }}>
            Is she into you, or <br />
            <span className="gradient-text">just being nice?</span>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: "clamp(1.05rem, 2vw, 1.25rem)",
            color: "var(--text-muted)",
            lineHeight: 1.6,
            marginBottom: "36px",
            maxWidth: "700px",
            margin: "0 auto 36px",
          }}>
            Stop overthinking 3-word texts and second-guessing every interaction. CrushCheck uses calibrated behavioral modeling and emotionally intelligent AI to decode mixed signals, coach your replies, and protect your dignity.
          </p>

          {/* CTA Buttons */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            flexWrap: "wrap",
            marginBottom: "48px",
          }}>
            <Link href="/analyze" className="btn-primary" style={{ padding: "14px 28px", fontSize: "1.05rem" }}>
              <Heart size={18} fill="#ffffff" />
              <span>Analyze Her Signals</span>
              <ArrowRight size={18} />
            </Link>

            <Link href="/screenshot" className="btn-secondary" style={{ padding: "14px 26px", fontSize: "1.05rem" }}>
              <ImageIcon size={18} />
              <span>Decode Screenshot</span>
            </Link>
          </div>

          {/* Health indicator */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "0.82rem",
            color: health?.status === "ok" ? "#6ee7b7" : "var(--text-dim)",
            background: "rgba(255, 255, 255, 0.03)",
            padding: "6px 14px",
            borderRadius: "var(--radius-full)",
            border: "1px solid var(--border-subtle)",
          }}>
            <span style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: health?.status === "ok" ? "#10b981" : "#f59e0b",
              boxShadow: health?.status === "ok" ? "0 0 10px #10b981" : "none",
            }} />
            <span>{health?.status === "ok" ? "Groq Multimodal AI & ML Model Online" : "Connecting to Local Backend..."}</span>
          </div>
        </div>
      </section>

      {/* ─── Interactive Signal Preview Card ───────────────────────────────────── */}
      <section style={{ padding: "20px 0 80px" }}>
        <div className="container" style={{ maxWidth: "860px" }}>
          <div className="glass-panel" style={{
            padding: "36px",
            border: "1px solid rgba(244, 63, 94, 0.25)",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5), 0 0 40px rgba(244, 63, 94, 0.12)",
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: "20px",
              borderBottom: "1px solid var(--border-subtle)",
              paddingBottom: "24px",
              marginBottom: "24px",
            }}>
              <div>
                <span className="badge badge-rose" style={{ marginBottom: "8px" }}>Live Example Breakdown</span>
                <h3 style={{ fontSize: "1.4rem", marginTop: "4px" }}>&quot;We talk daily and met 4 times, but replies are getting shorter&quot;</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "4px" }}>
                  Observed: 3 months talking • 15 min reply time • Inside jokes present • Recent replies shortening
                </p>
              </div>

              <div style={{
                background: "linear-gradient(135deg, rgba(244, 63, 94, 0.15), rgba(139, 92, 246, 0.15))",
                border: "1px solid rgba(244, 63, 94, 0.3)",
                borderRadius: "var(--radius-md)",
                padding: "12px 20px",
                textAlign: "center",
              }}>
                <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#fb7185", lineHeight: 1 }}>6.4 / 10</div>
                <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginTop: "4px" }}>
                  Moderate Positive
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px", marginBottom: "24px" }}>
              <div style={{ background: "rgba(16, 185, 129, 0.05)", border: "1px solid rgba(16, 185, 129, 0.15)", borderRadius: "var(--radius-md)", padding: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#6ee7b7", fontWeight: 600, fontSize: "0.9rem", marginBottom: "10px" }}>
                  <CheckCircle2 size={16} />
                  <span>Strong Positive Signals</span>
                </div>
                <ul style={{ listStyle: "none", fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "6px" }}>
                  <li>• Remembers small personal details</li>
                  <li>• Has agreed to meet in person 4 times</li>
                  <li>• Asks questions back consistently</li>
                </ul>
              </div>

              <div style={{ background: "rgba(245, 158, 11, 0.05)", border: "1px solid rgba(245, 158, 11, 0.15)", borderRadius: "var(--radius-md)", padding: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#fcd34d", fontWeight: 600, fontSize: "0.9rem", marginBottom: "10px" }}>
                  <AlertCircle size={16} />
                  <span>Watch-out Signals</span>
                </div>
                <ul style={{ listStyle: "none", fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "6px" }}>
                  <li>• Replies becoming shorter recently</li>
                  <li>• You are initiating slightly more often</li>
                </ul>
              </div>
            </div>

            <div style={{
              background: "rgba(255, 255, 255, 0.02)",
              borderRadius: "var(--radius-md)",
              padding: "14px 18px",
              fontSize: "0.86rem",
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
            }}>
              <span>💡 <strong>Wingman Verdict:</strong> Good baseline chemistry, but don&apos;t double-text. Match her energy and suggest a relaxed in-person plan.</span>
              <Link href="/analyze" style={{ color: "var(--rose-light)", fontWeight: 600, fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                <span>Try with your crush</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6 Tools Grid ──────────────────────────────────────────────────────── */}
      <section style={{ padding: "40px 0 80px" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <span className="badge badge-violet" style={{ marginBottom: "12px" }}>Complete Toolkit</span>
            <h2 style={{ fontSize: "2.2rem" }}>Six ways to navigate modern dating</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "1rem", marginTop: "8px" }}>
              From initial chemistry checks to everyday texting dilemmas.
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "24px",
          }}>
            {/* Tool 1 */}
            <Link href="/analyze" className="glass-panel glass-panel-hover" style={{ padding: "30px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ width: "46px", height: "46px", borderRadius: "12px", background: "rgba(244, 63, 94, 0.15)", border: "1px solid rgba(244, 63, 94, 0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Heart size={22} color="var(--rose-light)" />
              </div>
              <h3 style={{ fontSize: "1.25rem" }}>Signal Analyzer</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.5, flex: 1 }}>
                Evaluate 14 behavioral variables through our calibrated ML model to get an objective score from 0–10 with clear positive & unclear indicators.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--rose-light)", fontWeight: 600, fontSize: "0.85rem" }}>
                <span>Run Signal Check</span>
                <ArrowRight size={15} />
              </div>
            </Link>

            {/* Tool 2 */}
            <Link href="/reply" className="glass-panel glass-panel-hover" style={{ padding: "30px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ width: "46px", height: "46px", borderRadius: "12px", background: "rgba(139, 92, 246, 0.15)", border: "1px solid rgba(139, 92, 246, 0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <MessageSquare size={22} color="#c4b5fd" />
              </div>
              <h3 style={{ fontSize: "1.25rem" }}>Reply Coach</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.5, flex: 1 }}>
                Paste her last message and pick your intent (playful, flirty, caring, or ask-out). Get 3 tone-matched replies that never sound like cheesy pickup lines.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#c4b5fd", fontWeight: 600, fontSize: "0.85rem" }}>
                <span>Generate Replies</span>
                <ArrowRight size={15} />
              </div>
            </Link>

            {/* Tool 3 */}
            <Link href="/screenshot" className="glass-panel glass-panel-hover" style={{ padding: "30px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ width: "46px", height: "46px", borderRadius: "12px", background: "rgba(217, 70, 239, 0.15)", border: "1px solid rgba(217, 70, 239, 0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ImageIcon size={22} color="#f0abfc" />
              </div>
              <h3 style={{ fontSize: "1.25rem" }}>Screenshot Decoder</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.5, flex: 1 }}>
                Drop in a conversation screenshot. Our vision AI extracts chat dynamics, measures reciprocity and momentum, and suggests your best next move in-memory.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#f0abfc", fontWeight: 600, fontSize: "0.85rem" }}>
                <span>Drop Screenshot</span>
                <ArrowRight size={15} />
              </div>
            </Link>

            {/* Tool 4 */}
            <Link href="/interpret" className="glass-panel glass-panel-hover" style={{ padding: "30px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ width: "46px", height: "46px", borderRadius: "12px", background: "rgba(245, 158, 11, 0.15)", border: "1px solid rgba(245, 158, 11, 0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <HelpCircle size={22} color="#fcd34d" />
              </div>
              <h3 style={{ fontSize: "1.25rem" }}>Message Interpreter</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.5, flex: 1 }}>
                Staring at &quot;k&quot;, &quot;haha sure&quot;, or &quot;idk maybe&quot;? Get 2–4 calibrated interpretations (charitable to realistic) plus an overthinking check.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#fcd34d", fontWeight: 600, fontSize: "0.85rem" }}>
                <span>Decode Ambiguity</span>
                <ArrowRight size={15} />
              </div>
            </Link>

            {/* Tool 5 */}
            <Link href="/check" className="glass-panel glass-panel-hover" style={{ padding: "30px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ width: "46px", height: "46px", borderRadius: "12px", background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ShieldCheck size={22} color="#6ee7b7" />
              </div>
              <h3 style={{ fontSize: "1.25rem" }}>Pre-Send Check</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.5, flex: 1 }}>
                Test your draft before hitting send. Checks pressure level, clarity, and tone fit — with honest wingman feedback and a calibrated rewrite.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#6ee7b7", fontWeight: 600, fontSize: "0.85rem" }}>
                <span>Check Your Draft</span>
                <ArrowRight size={15} />
              </div>
            </Link>

            {/* Tool 6 */}
            <Link href="/timeline" className="glass-panel glass-panel-hover" style={{ padding: "30px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ width: "46px", height: "46px", borderRadius: "12px", background: "rgba(59, 130, 246, 0.15)", border: "1px solid rgba(59, 130, 246, 0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <TrendingUp size={22} color="#93c5fd" />
              </div>
              <h3 style={{ fontSize: "1.25rem" }}>Timeline Tracker</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.5, flex: 1 }}>
                Track how connection signals change over days or weeks. Anonymous session storage computes trajectory, score delta, and key milestones.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#93c5fd", fontWeight: 600, fontSize: "0.85rem" }}>
                <span>View Trajectory</span>
                <ArrowRight size={15} />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Philosophy & Privacy ──────────────────────────────────────────────── */}
      <section style={{ padding: "40px 0 60px" }}>
        <div className="container" style={{ maxWidth: "960px" }}>
          <div className="glass-panel" style={{ padding: "48px 36px", textAlign: "center" }}>
            <h2 style={{ fontSize: "1.8rem", marginBottom: "16px" }}>Built on three non-negotiables</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "30px", marginTop: "36px", textAlign: "left" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#fb7185", fontWeight: 700, marginBottom: "8px" }}>
                  <Lock size={18} />
                  <span>100% Anonymous</span>
                </div>
                <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", lineHeight: 1.6 }}>
                  No accounts, no phone numbers, no tracking. Screenshots are analyzed in memory and immediately discarded. Never stored on disk.
                </p>
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#c4b5fd", fontWeight: 700, marginBottom: "8px" }}>
                  <Zap size={18} />
                  <span>Calibrated ML Scorer</span>
                </div>
                <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", lineHeight: 1.6 }}>
                  Signal scores are computed by a trained Gradient Boosting model rather than ungrounded LLM hallucinations, ensuring consistent and explainable scores.
                </p>
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#6ee7b7", fontWeight: 700, marginBottom: "8px" }}>
                  <Heart size={18} />
                  <span>Honest Wingman Persona</span>
                </div>
                <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", lineHeight: 1.6 }}>
                  No cheesy pickup lines or false promises. We tell you when you are overthinking, when to match her pace, and when to let the conversation breathe.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
