"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Award,
  Calendar,
  Trash2,
  ArrowRight,
  Heart,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { fetchTimeline, clearTimeline, TimelineResponse } from "@/lib/api";

export default function TimelinePage() {
  const [data, setData] = useState<TimelineResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchTimeline();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleClear = async () => {
    if (confirm("Are you sure you want to permanently clear your anonymous timeline records?")) {
      setClearing(true);
      try {
        await clearTimeline();
        await loadData();
      } catch (err) {
        console.error(err);
      } finally {
        setClearing(false);
      }
    }
  };

  return (
    <div className="container" style={{ padding: "40px 24px 80px", maxWidth: "900px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <span className="badge badge-rose" style={{ marginBottom: "12px" }}>
          Anonymous Signal Trajectory
        </span>
        <h1 style={{ fontSize: "2.4rem", marginBottom: "12px" }}>Connection Timeline</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "1.05rem", maxWidth: "580px", margin: "0 auto" }}>
          Track how her signals and reciprocity evolve over weeks. No account or email needed — stored safely under your anonymous browser session.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <RefreshCw size={24} className="spin" color="var(--rose-light)" />
          <p style={{ marginTop: "12px", color: "var(--text-dim)", fontSize: "0.9rem" }}>Loading timeline...</p>
        </div>
      ) : !data || data.entries.length === 0 ? (
        /* Empty State */
        <div className="glass-panel" style={{ padding: "60px 20px", textAlign: "center" }}>
          <div style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: "rgba(244, 63, 94, 0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}>
            <TrendingUp size={28} color="var(--rose-light)" />
          </div>
          <h3 style={{ fontSize: "1.3rem", marginBottom: "8px" }}>No check-ins recorded yet</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", maxWidth: "440px", margin: "0 auto 24px" }}>
            Take your first Signal Analysis or save a check to start tracking your connection trajectory.
          </p>
          <Link href="/analyze" className="btn-primary">
            <Heart size={16} fill="#ffffff" />
            <span>Run Your First Signal Check</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        /* Populated Timeline */
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          {/* Summary Trajectory Banner */}
          <div className="glass-panel" style={{
            padding: "28px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "20px",
            border: "1px solid var(--border-glow)",
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <span className="badge" style={{
                  background: data.trend_label === "Improving" ? "rgba(16, 185, 129, 0.2)" : data.trend_label === "Declining" ? "rgba(239, 68, 68, 0.2)" : "rgba(139, 92, 246, 0.2)",
                  color: data.trend_label === "Improving" ? "#6ee7b7" : data.trend_label === "Declining" ? "#fca5a5" : "#c4b5fd",
                  border: `1px solid ${data.trend_label === "Improving" ? "rgba(16, 185, 129, 0.4)" : data.trend_label === "Declining" ? "rgba(239, 68, 68, 0.4)" : "rgba(139, 92, 246, 0.4)"}`,
                }}>
                  Trajectory: {data.trend_label}
                </span>
                {typeof data.trend_delta === "number" && (
                  <span style={{ fontSize: "0.85rem", fontWeight: 700, color: data.trend_delta >= 0 ? "#6ee7b7" : "#fca5a5" }}>
                    {data.trend_delta >= 0 ? `+${data.trend_delta}` : `${data.trend_delta}`} pts
                  </span>
                )}
              </div>
              <h3 style={{ fontSize: "1.4rem" }}>{data.entries.length} Check-ins Tracked</h3>
            </div>

            <button
              onClick={handleClear}
              disabled={clearing}
              className="btn-ghost"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                color: "#fca5a5",
                fontSize: "0.85rem",
              }}
            >
              <Trash2 size={15} />
              <span>{clearing ? "Clearing..." : "Clear Timeline History"}</span>
            </button>
          </div>

          {/* Milestones Card */}
          {data.milestones.length > 0 && (
            <div className="glass-panel" style={{ padding: "24px 30px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#fb7185", fontWeight: 700, fontSize: "0.95rem", marginBottom: "14px" }}>
                <Award size={18} />
                <span>Observed Milestones</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {data.milestones.map((m, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.88rem", color: "var(--text-muted)" }}>
                    <Sparkles size={14} color="#fcd34d" />
                    <span>{m}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Entries Feed */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h4 style={{ fontSize: "1.1rem", color: "var(--text-main)", marginBottom: "4px" }}>
              History Log
            </h4>

            {data.entries.map((entry, idx) => {
              const dateStr = new Date(entry.created_at).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={entry.entry_id}
                  className="glass-panel"
                  style={{
                    padding: "20px 24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "16px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
                    {/* Score badge */}
                    <div style={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "14px",
                      background: "radial-gradient(circle, rgba(244, 63, 94, 0.25) 0%, rgba(18, 22, 36, 0.8) 70%)",
                      border: "1px solid var(--rose-primary)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "#ffffff", lineHeight: 1 }}>
                        {entry.signal_score}
                      </span>
                      <span style={{ fontSize: "0.62rem", color: "var(--rose-light)", fontWeight: 700 }}>
                        /10
                      </span>
                    </div>

                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontWeight: 700, fontSize: "1.05rem" }}>
                          {entry.level} Signal
                        </span>
                        <span style={{ fontSize: "0.78rem", color: "var(--text-dim)" }}>
                          #{idx + 1}
                        </span>
                      </div>

                      {entry.notes && (
                        <p style={{ fontSize: "0.86rem", color: "var(--text-muted)", marginTop: "4px" }}>
                          &ldquo;{entry.notes}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Date & snapshot */}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: "var(--text-dim)" }}>
                    <Calendar size={13} />
                    <span>{dateStr}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
