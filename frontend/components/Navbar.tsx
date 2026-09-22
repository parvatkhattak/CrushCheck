"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, MessageSquare, Image as ImageIcon, HelpCircle, ShieldCheck, TrendingUp, Sparkles } from "lucide-react";

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

  return (
    <header style={{
      position: "sticky",
      top: 0,
      zIndex: 50,
      width: "100%",
      background: "rgba(8, 9, 15, 0.75)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderBottom: "1px solid var(--border-subtle)",
    }}>
      <div className="container" style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "72px",
      }}>
        {/* Brand */}
        <Link href="/" style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          fontWeight: 800,
          fontSize: "1.35rem",
          letterSpacing: "-0.03em",
        }}>
          <div style={{
            width: "38px",
            height: "38px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #f43f5e, #8b5cf6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 16px rgba(244, 63, 94, 0.4)",
          }}>
            <Heart size={20} color="#ffffff" fill="#ffffff" />
          </div>
          <span>
            Crush<span className="gradient-rose">Check</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav style={{
          display: "flex",
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
                  padding: "8px 14px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: isActive ? "#ffffff" : "var(--text-muted)",
                  background: isActive ? "linear-gradient(135deg, rgba(244, 63, 94, 0.25), rgba(139, 92, 246, 0.25))" : "transparent",
                  border: isActive ? "1px solid rgba(244, 63, 94, 0.4)" : "1px solid transparent",
                  transition: "all var(--transition-fast)",
                }}
              >
                <Icon size={15} color={isActive ? "var(--rose-light)" : "var(--text-dim)"} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Privacy Pill */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "6px 14px",
          borderRadius: "var(--radius-full)",
          background: "rgba(16, 185, 129, 0.08)",
          border: "1px solid rgba(16, 185, 129, 0.2)",
          color: "#6ee7b7",
          fontSize: "0.78rem",
          fontWeight: 600,
        }}>
          <Sparkles size={13} />
          <span>100% Anonymous</span>
        </div>
      </div>
    </header>
  );
}
