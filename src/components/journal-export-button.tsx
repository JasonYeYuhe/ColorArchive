"use client";

import { useRef, useState } from "react";
import { useAuth } from "@/src/components/auth-provider";
import { track } from "@/src/lib/track";
import { JournalCalendarGrid } from "@/src/components/journal-calendar-grid";
import type { JournalEntry } from "@/src/lib/color-journal";

interface Props {
  entriesByDate: Map<string, JournalEntry>;
  today: string;
  monthKey: string;
  monthLabel: string;
  /** Total count for the title — defaults to entries in this month, but caller may override. */
  countOverride?: number;
}

/**
 * "Download as PNG" — renders an off-screen 1080x1080 calendar tile,
 * captures it via html-to-image, and triggers a browser download.
 *
 * Free + anon users get a watermark stamp ("colorarchive.org") in the
 * caption row of the rendered tile, plus a small footer credit.
 * Pro users get a clean export.
 *
 * The off-screen render is positioned absolutely with negative-left
 * 9999px so it never affects layout while still being a real DOM node
 * that html-to-image can read.
 */
export function JournalExportButton({
  entriesByDate,
  today,
  monthKey,
  monthLabel,
  countOverride,
}: Props) {
  const { tier } = useAuth();
  const exportRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const isPro = tier === "pro";

  const handleExport = async () => {
    if (!exportRef.current || exporting) return;
    setExporting(true);
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(exportRef.current, {
        width: 1080,
        height: 1080,
        backgroundColor: "#ffffff",
        pixelRatio: 2,
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `colorarchive-journal-${monthKey}.png`;
      a.click();
      track("export", { format: "png", method: "download", type: "journal", tier });
    } catch (err) {
      console.warn("Journal export failed:", err);
      alert("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const totalCount =
    countOverride ??
    Array.from(entriesByDate.keys()).filter((k) => k.startsWith(monthKey)).length;

  return (
    <>
      <button
        type="button"
        onClick={handleExport}
        disabled={exporting}
        className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-neutral-600 transition hover:bg-neutral-950 hover:text-white dark:border-white/10 dark:bg-white/5 dark:text-neutral-200 disabled:opacity-50"
      >
        {exporting ? "Rendering…" : "Export PNG"}
      </button>

      {/* Off-screen 1080×1080 export surface */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: -9999,
          top: -9999,
          width: 1080,
          height: 1080,
          pointerEvents: "none",
        }}
      >
        <div
          ref={exportRef}
          style={{
            width: 1080,
            height: 1080,
            backgroundColor: "#ffffff",
            color: "#0a0a0a",
            padding: 64,
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
          }}
        >
          <div style={{ flex: "0 0 auto" }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#94a3b8",
                marginBottom: 6,
              }}
            >
              Color Journal
            </div>
            <div
              style={{
                fontSize: 44,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: "#0a0a0a",
                marginBottom: 4,
              }}
            >
              {monthLabel}
            </div>
            <div style={{ fontSize: 15, color: "#64748b" }}>
              {totalCount} {totalCount === 1 ? "color" : "colors"} logged this month
            </div>
          </div>

          <div style={{ flex: "1 1 auto", marginTop: 32, display: "flex", alignItems: "center" }}>
            <div style={{ width: "100%" }}>
              <JournalCalendarGrid
                entriesByDate={entriesByDate}
                today={today}
                monthKey={monthKey}
              />
            </div>
          </div>

          <div
            style={{
              flex: "0 0 auto",
              marginTop: 28,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 12,
              color: "#94a3b8",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            {isPro ? <span /> : <span>Made with colorarchive.org</span>}
            <span style={{ color: "#cbd5e1" }}>{monthKey}</span>
          </div>
        </div>
      </div>
    </>
  );
}
