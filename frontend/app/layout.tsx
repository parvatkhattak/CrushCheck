import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#08090f",
};

export const metadata: Metadata = {
  title: "CrushCheck — AI Relationship Signal Analyzer & Honest Wingman",
  description: "Decode mixed signals, analyze conversation screenshots, get witty reply recommendations, and check your drafts before sending.",
  keywords: ["crush signals", "dating coach", "ai wingman", "text analyzer", "relationship advice"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main style={{ minHeight: "calc(100vh - 72px)" }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
