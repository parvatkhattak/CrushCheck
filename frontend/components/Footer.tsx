"use client";

import Link from "next/link";
import { Heart, Shield, RefreshCw } from "lucide-react";
import { clearTimeline } from "@/lib/api";
import { useState } from "react";

export default function Footer() {
  const [cleared, setCleared] = useState(false);

  const handleReset = async () => {
    if (confirm("Reset anonymous session and clear all saved timeline records?")) {
      try {
        await clearTimeline();
        localStorage.removeItem("crushcheck_session_id");
        setCleared(true);
        setTimeout(() => setCleared(false), 3000);
        window.location.reload();
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <footer style={{
      marginTop: "120px",
      borderTop: "1px solid var(--border-subtle)",
      background: "rgba(10, 11, 18, 0.9)",
      padding: "60px 0 40px",
      position: "relative",
      zIndex: 10,
    }}>
      <div className="container" style={{
        display: "flex",
        flexDirection: "column",
        gap: "36px",
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "30px",
        }}>
          {/* Left brand */}
          <div style={{ maxWidth: "420px" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontWeight: 800,
              fontSize: "1.25rem",
              marginBottom: "12px",
            }}>
              <Heart size={18} color="var(--rose-primary)" fill="var(--rose-primary)" />
              <span>Crush<span className="gradient-rose">Check</span></span>
            </div>
            <p style={{
              fontSize: "0.88rem",
              color: "var(--text-muted)",
              lineHeight: 1.6,
            }}>
              Calibrated behavioral signal analysis and AI wingman coaching. Real advice for modern communication without the cheesy pickup lines or false certainties.
            </p>
          </div>

          {/* Quick links */}
          <div style={{ display: "flex", gap: "48px", flexWrap: "wrap" }}>
            <div>
              <h4 style={{ fontSize: "0.85rem", color: "var(--text-main)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "14px" }}>
                Tools
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                <Link href="/analyze" style={{ transition: "color var(--transition-fast)" }}>Signal Analyzer</Link>
                <Link href="/reply" style={{ transition: "color var(--transition-fast)" }}>Reply Coach</Link>
                <Link href="/screenshot" style={{ transition: "color var(--transition-fast)" }}>Screenshot Decoder</Link>
                <Link href="/interpret" style={{ transition: "color var(--transition-fast)" }}>Message Interpreter</Link>
                <Link href="/check" style={{ transition: "color var(--transition-fast)" }}>Pre-Send Check</Link>
                <Link href="/timeline" style={{ transition: "color var(--transition-fast)" }}>Timeline Tracker</Link>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: "0.85rem", color: "var(--text-main)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "14px" }}>
                Privacy & Data
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#6ee7b7" }}>
                  <Shield size={14} />
                  <span>No login / No tracking</span>
                </div>
                <button
                  onClick={handleReset}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "transparent",
                    border: "none",
                    color: cleared ? "#6ee7b7" : "var(--rose-light)",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    padding: 0,
                    textAlign: "left",
                  }}
                >
                  <RefreshCw size={13} className={cleared ? "" : ""} />
                  <span>{cleared ? "Session Reset Complete" : "Reset My Anonymous Session"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer banner */}
        <div style={{
          padding: "16px 20px",
          borderRadius: "var(--radius-md)",
          background: "rgba(255, 255, 255, 0.02)",
          border: "1px solid var(--border-subtle)",
          fontSize: "0.82rem",
          color: "var(--text-dim)",
          lineHeight: 1.5,
        }}>
          <strong style={{ color: "var(--text-muted)" }}>Ethical AI Wingman Notice:</strong> CrushCheck evaluates behavioral patterns and provides conversational guidance based on calibrated heuristics. Human connection is complex and subtle — behaviors can indicate friendliness, polite reciprocity, or romantic interest. The model cannot determine anyone’s feelings with certainty.
        </div>

        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "0.8rem",
          color: "var(--text-dim)",
          paddingTop: "10px",
        }}>
          <span>© {new Date().getFullYear()} CrushCheck. All rights reserved.</span>
          <span>Powered by Groq Ultra-Fast AI & Calibrated Machine Learning</span>
        </div>
      </div>
    </footer>
  );
}
