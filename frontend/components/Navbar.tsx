"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Heart,
  MessageSquare,
  Image as ImageIcon,
  HelpCircle,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  Menu,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/analyze", label: "Signal Analyzer", icon: Heart },
  { href: "/reply", label: "Reply Coach", icon: MessageSquare },
  { href: "/screenshot", label: "Screenshot Decoder", icon: ImageIcon },
  { href: "/interpret", label: "Message Interpreter", icon: HelpCircle },
  { href: "/check", label: "Pre-Send Check", icon: ShieldCheck },
  { href: "/timeline", label: "Timeline", icon: TrendingUp },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header style={{
      position: "sticky",
      top: 0,
      zIndex: 100,
      width: "100%",
      background: "rgba(8, 9, 15, 0.85)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderBottom: "1px solid var(--border-subtle)",
    }}>
      <div className="container" style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "68px",
      }}>
        {/* Brand */}
        <Link
          href="/"
          onClick={() => setMobileMenuOpen(false)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontWeight: 800,
            fontSize: "1.25rem",
            letterSpacing: "-0.03em",
          }}
        >
          <div style={{
            width: "34px",
            height: "34px",
            borderRadius: "9px",
            background: "linear-gradient(135deg, #f43f5e, #8b5cf6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 14px rgba(244, 63, 94, 0.4)",
            flexShrink: 0,
          }}>
            <Heart size={18} color="#ffffff" fill="#ffffff" />
          </div>
          <span>
            Crush<span className="gradient-rose">Check</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="desktop-only" style={{
          alignItems: "center",
          gap: "4px",
          background: "rgba(255, 255, 255, 0.03)",
          padding: "4px 6px",
          borderRadius: "var(--radius-full)",
          border: "1px solid var(--border-subtle)",
        }}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 13px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: isActive ? "#ffffff" : "var(--text-muted)",
                  background: isActive ? "linear-gradient(135deg, rgba(244, 63, 94, 0.25), rgba(139, 92, 246, 0.25))" : "transparent",
                  border: isActive ? "1px solid rgba(244, 63, 94, 0.4)" : "1px solid transparent",
                  transition: "all var(--transition-fast)",
                }}
              >
                <Icon size={14} color={isActive ? "var(--rose-light)" : "var(--text-dim)"} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Desktop Privacy Pill */}
        <div className="desktop-only" style={{
          alignItems: "center",
          gap: "6px",
          padding: "6px 12px",
          borderRadius: "var(--radius-full)",
          background: "rgba(16, 185, 129, 0.08)",
          border: "1px solid rgba(16, 185, 129, 0.2)",
          color: "#6ee7b7",
          fontSize: "0.76rem",
          fontWeight: 600,
        }}>
          <Sparkles size={12} />
          <span>100% Anonymous</span>
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <button
          type="button"
          aria-label="Toggle navigation menu"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="mobile-only"
          style={{
            alignItems: "center",
            justifyContent: "center",
            width: "40px",
            height: "40px",
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-sm)",
            color: "var(--text-main)",
            cursor: "pointer",
          }}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          className="mobile-only"
          style={{
            flexDirection: "column",
            width: "100%",
            background: "rgba(10, 12, 20, 0.98)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            borderBottom: "1px solid var(--border-subtle)",
            padding: "16px",
            gap: "8px",
            animation: "fadeIn 0.2s ease-out",
          }}
        >
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  borderRadius: "var(--radius-md)",
                  fontSize: "0.92rem",
                  fontWeight: 600,
                  color: isActive ? "#ffffff" : "var(--text-muted)",
                  background: isActive ? "rgba(244, 63, 94, 0.15)" : "rgba(255, 255, 255, 0.02)",
                  border: isActive ? "1px solid rgba(244, 63, 94, 0.3)" : "1px solid var(--border-subtle)",
                }}
              >
                <Icon size={18} color={isActive ? "var(--rose-light)" : "var(--text-dim)"} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            padding: "10px",
            marginTop: "6px",
            borderRadius: "var(--radius-md)",
            background: "rgba(16, 185, 129, 0.08)",
            border: "1px solid rgba(16, 185, 129, 0.2)",
            color: "#6ee7b7",
            fontSize: "0.82rem",
            fontWeight: 600,
          }}>
            <Sparkles size={14} />
            <span>100% Anonymous &amp; Private</span>
          </div>
        </div>
      )}
    </header>
  );
}
