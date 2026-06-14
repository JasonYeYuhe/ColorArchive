import { ImageResponse } from "next/og";
import { SITE_DOMAIN } from "@/src/lib/site-config";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// A few example word->color results to make the card feel alive.
const SWATCHES = ["#3b6ea5", "#caa45d", "#8c5a8f", "#4f8f6b", "#b5563f", "#5d6f8c"];

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: "#0a0a0a",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        {/* Spectrum strip */}
        <div style={{ display: "flex", height: 120 }}>
          {SWATCHES.map((hex) => (
            <div key={hex} style={{ flex: 1, background: hex }} />
          ))}
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "64px 72px",
          }}
        >
          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.55)",
              marginBottom: 20,
            }}
          >
            Free Tool
          </div>
          <div
            style={{
              fontSize: 76,
              fontWeight: 800,
              lineHeight: 1.05,
              color: "#ffffff",
              marginBottom: 24,
            }}
          >
            Word to Color
          </div>
          <div
            style={{
              fontSize: 28,
              lineHeight: 1.35,
              color: "rgba(255,255,255,0.72)",
              maxWidth: 760,
            }}
          >
            Turn any word or phrase into a unique hex color with five tonal variants — instant,
            deterministic, free.
          </div>
        </div>

        <div
          style={{
            padding: "0 72px 48px",
            fontSize: 15,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.45)",
          }}
        >
          {SITE_DOMAIN}
        </div>
      </div>
    ),
    { ...size },
  );
}
