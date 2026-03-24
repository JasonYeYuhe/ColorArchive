"use client";

import { useRef, useState, useCallback } from "react";

interface PaletteColor {
  hex: string;
  name: string;
}

interface DownloadPaletteImageProps {
  colors: PaletteColor[];
  title?: string;
  subtitle?: string;
}

function luminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

export function DownloadPaletteImage({ colors, title, subtitle }: DownloadPaletteImageProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = useCallback(async () => {
    if (!canvasRef.current) return;
    setDownloading(true);
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(canvasRef.current, {
        width: 800,
        height: 600,
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      link.download = `${(title || "palette").toLowerCase().replace(/\s+/g, "-")}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      // Fallback: just ignore if export fails
    } finally {
      setDownloading(false);
    }
  }, [title]);

  return (
    <>
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="px-3 py-1.5 text-xs font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100"
      >
        {downloading ? "Exporting..." : "Download Image"}
      </button>

      {/* Hidden render target for html-to-image */}
      <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
        <div
          ref={canvasRef}
          style={{
            width: 800,
            height: 600,
            background: "#fafafa",
            fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <div style={{ padding: "32px 40px 20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              {title && (
                <div style={{ fontSize: 22, fontWeight: 700, color: "#1a1a2e", marginBottom: 4 }}>
                  {title}
                </div>
              )}
              {subtitle && (
                <div style={{ fontSize: 13, color: "#888", fontStyle: "italic" }}>
                  {subtitle}
                </div>
              )}
            </div>
            <div style={{ fontSize: 11, color: "#bbb", fontWeight: 600, letterSpacing: "0.05em" }}>
              colorarchive.me
            </div>
          </div>

          {/* Color swatches */}
          <div style={{ flex: 1, display: "flex", padding: "0 40px 24px", gap: 12 }}>
            {colors.map((c, i) => {
              const isLight = luminance(c.hex) > 0.5;
              return (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    borderRadius: 16,
                    backgroundColor: c.hex,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                    padding: 16,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: isLight ? "#1a1a1a" : "#ffffff",
                      marginBottom: 2,
                    }}
                  >
                    {c.name}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 500,
                      color: isLight ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.6)",
                      fontFamily: "monospace",
                    }}
                  >
                    {c.hex.toUpperCase()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div style={{
            padding: "12px 40px",
            borderTop: "1px solid #eee",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <div style={{ fontSize: 10, color: "#ccc" }}>
              {colors.length} colors
            </div>
            <div style={{ fontSize: 10, color: "#ccc" }}>
              Generated with ColorArchive
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
