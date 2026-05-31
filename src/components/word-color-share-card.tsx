"use client";

import { useRef, useState } from "react";

interface Variant {
  label: string;
  hex: string;
}

interface Props {
  word: string;
  hex: string;
  family: string;
  variants: Variant[];
}

/**
 * "Download image" for the Word to Color generator.
 *
 * Renders an off-screen 1080×1350 (portrait, IG/Xiaohongshu-friendly)
 * share card and captures it via html-to-image. Every export carries a
 * "colorarchive.org/word-to-color" footer — word-to-color is the site's
 * #1 entry and already gets shared, so the card turns that organic
 * sharing into self-attributing traffic. Open to all users (no Pro gate);
 * the footer credit is the point.
 *
 * Off-screen node uses absolute left/top -9999 so it never affects layout
 * while staying a real DOM node html-to-image can read. Inline styles only
 * (Tailwind classes are unreliable under html-to-image capture).
 */
function readableText(hex: string): string {
  const h = hex.replace("#", "");
  if (h.length < 6) return "#0a0a0a";
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? "#0a0a0a" : "#ffffff";
}

export function WordColorShareCard({ word, hex, family, variants }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  const handleDownload = async () => {
    if (!ref.current || busy) return;
    setBusy(true);
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(ref.current, {
        width: 1080,
        height: 1350,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });
      const slug =
        word
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
          .slice(0, 40) || "color";
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `colorarchive-${slug}.png`;
      a.click();
    } catch (err) {
      console.warn("Share card export failed:", err);
      alert("Image export failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const onHex = readableText(hex);

  return (
    <>
      <button
        type="button"
        onClick={handleDownload}
        disabled={busy}
        className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-950 hover:text-white disabled:opacity-50"
      >
        {busy ? "Rendering…" : "↓ Image"}
      </button>

      {/* Off-screen 1080×1350 share card */}
      <div
        aria-hidden="true"
        style={{ position: "absolute", left: -9999, top: -9999, width: 1080, height: 1350, pointerEvents: "none" }}
      >
        <div
          ref={ref}
          style={{
            width: 1080,
            height: 1350,
            backgroundColor: "#ffffff",
            padding: 80,
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
          }}
        >
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: "#94a3b8",
              marginBottom: 14,
            }}
          >
            Word → Color
          </div>
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              letterSpacing: "-0.03em",
              color: "#0a0a0a",
              lineHeight: 1.05,
              marginBottom: 36,
              wordBreak: "break-word",
            }}
          >
            &ldquo;{word}&rdquo;
          </div>

          <div
            style={{
              flex: "1 1 auto",
              minHeight: 420,
              borderRadius: 32,
              backgroundColor: hex,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              padding: 48,
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                fontSize: 24,
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: onHex,
                opacity: 0.82,
              }}
            >
              {family}
            </div>
            <div style={{ fontSize: 84, fontWeight: 700, letterSpacing: "0.01em", color: onHex }}>{hex}</div>
          </div>

          <div style={{ display: "flex", gap: 14, marginTop: 28 }}>
            {variants.slice(0, 5).map((variant) => {
              const t = readableText(variant.hex);
              return (
                <div
                  key={variant.label}
                  style={{
                    flex: 1,
                    height: 136,
                    borderRadius: 18,
                    backgroundColor: variant.hex,
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "center",
                    padding: 12,
                    boxSizing: "border-box",
                  }}
                >
                  <span style={{ fontSize: 17, fontWeight: 600, color: t }}>{variant.hex}</span>
                </div>
              );
            })}
          </div>

          <div
            style={{
              marginTop: 32,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 18,
              color: "#94a3b8",
              letterSpacing: "0.08em",
            }}
          >
            <span style={{ fontWeight: 600, color: "#475569" }}>colorarchive.org/word-to-color</span>
            <span style={{ color: "#cbd5e1" }}>Turn any word into a color</span>
          </div>
        </div>
      </div>
    </>
  );
}
