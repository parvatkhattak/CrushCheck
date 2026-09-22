"use client";

import { useState, useRef } from "react";
import {
  Image as ImageIcon,
  Upload,
  Lock,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  TrendingUp,
  MessageCircle,
  EyeOff,
  ArrowRight,
} from "lucide-react";
import { uploadScreenshot, ScreenshotAnalysisResponse } from "@/lib/api";

export default function ScreenshotPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [blurHeader, setBlurHeader] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ScreenshotAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      setResult(null);
      setError(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      setFile(dropped);
      setPreviewUrl(URL.createObjectURL(dropped));
      setResult(null);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      let uploadFile = file;

      // If blurHeader is active, apply client-side canvas blur to top 15% (avatar + name)
      if (blurHeader && previewUrl) {
        uploadFile = await applyClientBlur(file);
      }

      const data = await uploadScreenshot(uploadFile);
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to analyze screenshot");
    } finally {
      setLoading(false);
    }
  };

  const applyClientBlur = (sourceFile: File): Promise<File> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(sourceFile);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(sourceFile);
          return;
        }

        // Draw image
        ctx.drawImage(img, 0, 0);

        // Black-out / Blur top 12% header for contact privacy
        const headerHeight = Math.floor(img.height * 0.12);
        ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
        ctx.fillRect(0, 0, img.width, headerHeight);

        // Optional redaction banner
        ctx.fillStyle = "#ffffff";
        ctx.font = `${Math.max(14, Math.floor(img.width * 0.03))}px sans-serif`;
        ctx.fillText("🔒 [Contact Anonymized for Privacy]", 20, Math.floor(headerHeight / 2) + 6);

        canvas.toBlob((blob) => {
          if (blob) {
            const redactedFile = new File([blob], sourceFile.name, { type: "image/png" });
            resolve(redactedFile);
          } else {
            resolve(sourceFile);
          }
        }, "image/png");
      };
      img.onerror = () => resolve(sourceFile);
    });
  };

  return (
    <div className="container" style={{ padding: "32px 16px 80px", maxWidth: "900px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <span className="badge badge-rose" style={{ marginBottom: "12px" }}>
          Multimodal Vision AI
        </span>
        <h1 style={{ fontSize: "2.4rem", marginBottom: "12px" }}>Screenshot Decoder</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "1.05rem", maxWidth: "600px", margin: "0 auto" }}>
          Drop in a chat screenshot from iMessage, WhatsApp, or Instagram. We extract the transcript, measure reciprocity and momentum, and diagnose her vibe.
        </p>
      </div>

      {/* Upload Box */}
      <div className="glass-panel" style={{ padding: "36px", marginBottom: "36px" }}>
        {/* Privacy notice banner */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          background: "rgba(16, 185, 129, 0.06)",
          border: "1px solid rgba(16, 185, 129, 0.2)",
          borderRadius: "var(--radius-md)",
          padding: "12px 18px",
          fontSize: "0.85rem",
          color: "#6ee7b7",
          marginBottom: "24px",
        }}>
          <Lock size={16} />
          <span>
            <strong>Zero Storage Guarantee:</strong> Your screenshot is processed in RAM only and never saved to any database or hard drive.
          </span>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: "2px dashed var(--border-hover)",
            borderRadius: "var(--radius-lg)",
            padding: "40px 20px",
            textAlign: "center",
            cursor: "pointer",
            background: "rgba(255, 255, 255, 0.01)",
            transition: "all var(--transition-fast)",
            marginBottom: "20px",
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />

          <div style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: "rgba(244, 63, 94, 0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}>
            <Upload size={24} color="var(--rose-light)" />
          </div>

          <h3 style={{ fontSize: "1.1rem", marginBottom: "6px" }}>
            {file ? file.name : "Click to browse or drag & drop screenshot"}
          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-dim)" }}>
            Supports PNG, JPG, WebP up to 5MB
          </p>
        </div>

        {/* Preview & Privacy Options */}
        {previewUrl && (
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
            background: "rgba(255, 255, 255, 0.02)",
            padding: "16px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-subtle)",
            marginBottom: "20px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Upload preview"
                style={{ width: "48px", height: "48px", objectFit: "cover", borderRadius: "8px" }}
              />
              <div>
                <div style={{ fontSize: "0.88rem", fontWeight: 600 }}>{file?.name}</div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-dim)" }}>
                  {file && `${(file.size / 1024).toFixed(0)} KB`}
                </div>
              </div>
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", color: "var(--text-muted)", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={blurHeader}
                onChange={(e) => setBlurHeader(e.target.checked)}
                style={{ accentColor: "var(--rose-primary)" }}
              />
              <EyeOff size={15} color="var(--rose-light)" />
              <span>Redact top contact bar before upload</span>
            </label>
          </div>
        )}

        {error && (
          <div style={{ padding: "12px 16px", borderRadius: "var(--radius-sm)", background: "rgba(239, 68, 68, 0.15)", border: "1px solid var(--danger)", color: "#fca5a5", fontSize: "0.9rem", marginBottom: "20px" }}>
            {error}
          </div>
        )}

        <button
          type="button"
          disabled={!file || loading}
          onClick={handleAnalyze}
          className="btn-primary"
          style={{ width: "100%", padding: "15px", fontSize: "1.05rem" }}
        >
          {loading ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <RefreshCw size={18} className="spin" />
              <span>Reading Screenshot with Vision AI...</span>
            </span>
          ) : (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <Sparkles size={18} />
              <span>Decode Conversation Dynamics</span>
            </span>
          )}
        </button>
      </div>

      {/* ─── Results ─────────────────────────────────────────────────────────── */}
      {result && (
        <div className="glass-panel" style={{ padding: "36px", border: "1px solid var(--border-glow)", animation: "fadeIn 0.5s ease" }}>
          {/* Metrics Row */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 140px), 1fr))",
            gap: "14px",
            marginBottom: "32px",
          }}>
            <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "16px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: "0.78rem", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 600 }}>Detected Tone</div>
              <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--rose-light)", marginTop: "4px" }}>{result.tone}</div>
            </div>

            <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "16px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: "0.78rem", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 600 }}>Engagement</div>
              <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#6ee7b7", marginTop: "4px" }}>{result.engagement_level}</div>
            </div>

            <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "16px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: "0.78rem", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 600 }}>Reciprocity</div>
              <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#c4b5fd", marginTop: "4px" }}>{result.reciprocity}</div>
            </div>

            <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "16px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: "0.78rem", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 600 }}>Momentum</div>
              <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fcd34d", marginTop: "4px" }}>{result.momentum}</div>
            </div>
          </div>

          {/* Extracted Chat Bubbles */}
          <div style={{ marginBottom: "32px" }}>
            <h4 style={{ fontSize: "1.1rem", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <MessageCircle size={18} color="var(--rose-light)" />
              <span>Extracted Conversation Transcript</span>
            </h4>
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              background: "rgba(10, 12, 20, 0.7)",
              padding: "20px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-subtle)",
              maxHeight: "360px",
              overflowY: "auto",
            }}>
              {result.extracted_messages.map((msg, i) => {
                const isYou = msg.speaker.toLowerCase() === "you";
                return (
                  <div
                    key={i}
                    style={{
                      alignSelf: isYou ? "flex-end" : "flex-start",
                      maxWidth: "75%",
                      padding: "12px 16px",
                      borderRadius: isYou ? "16px 16px 2px 16px" : "16px 16px 16px 2px",
                      background: isYou ? "linear-gradient(135deg, #f43f5e, #e11d48)" : "rgba(255, 255, 255, 0.08)",
                      color: "#ffffff",
                      fontSize: "0.92rem",
                      border: isYou ? "none" : "1px solid var(--border-subtle)",
                    }}
                  >
                    <div style={{ fontSize: "0.72rem", color: isYou ? "rgba(255, 255, 255, 0.8)" : "var(--rose-light)", fontWeight: 700, marginBottom: "2px", textTransform: "uppercase" }}>
                      {msg.speaker}
                    </div>
                    <div>{msg.text}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Key Insights */}
          <div style={{ marginBottom: "32px" }}>
            <h4 style={{ fontSize: "1.1rem", marginBottom: "14px" }}>Key Behavioral Insights</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {result.insights.map((insight, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                    padding: "14px 18px",
                    background: "rgba(255, 255, 255, 0.02)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-subtle)",
                    fontSize: "0.9rem",
                    color: "var(--text-muted)",
                  }}
                >
                  <CheckCircle2 size={16} color="#6ee7b7" style={{ flexShrink: 0, marginTop: "2px" }} />
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Suggested Next Move */}
          <div style={{
            background: "linear-gradient(135deg, rgba(244, 63, 94, 0.12), rgba(139, 92, 246, 0.12))",
            border: "1px solid rgba(244, 63, 94, 0.3)",
            borderRadius: "var(--radius-md)",
            padding: "24px",
          }}>
            <h4 style={{ fontSize: "1rem", color: "#fb7185", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
              <Sparkles size={16} />
              <span>Recommended Next Move</span>
            </h4>
            <p style={{ fontSize: "0.96rem", color: "#ffffff", lineHeight: 1.6 }}>
              {result.suggested_next_move}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
