"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { hexContrastRatio, wcagLabel } from "@/src/lib/brand-palette";
import { getPaletteIds } from "@/src/lib/palette-builder";
import { ProGate } from "@/src/components/pro-gate";
import { colors as allColors } from "@/src/data/colors";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Extract all valid 6-digit hex codes from a string. Returns uppercased #RRGGBB values. */
function parseHexColors(input: string): string[] {
  const matches = input.match(/#?[0-9A-Fa-f]{6}/g) ?? [];
  const unique = Array.from(
    new Set(matches.map((m) => (m.startsWith("#") ? m.toUpperCase() : `#${m.toUpperCase()}`))),
  );
  return unique.slice(0, 10); // cap at 10 colors
}

interface Pair {
  fg: string;
  bg: string;
  ratio: number;
  label: ReturnType<typeof wcagLabel>;
}

function buildMatrix(colors: string[]): Pair[] {
  const pairs: Pair[] = [];
  for (const bg of colors) {
    for (const fg of colors) {
      if (fg === bg) continue;
      const ratio = hexContrastRatio(fg, bg);
      pairs.push({ fg, bg, ratio, label: wcagLabel(ratio) });
    }
  }
  return pairs;
}

function buildCsv(pairs: Pair[]): string {
  const header = "foreground,background,ratio,AA,AAA";
  const rows = pairs.map((p) => {
    const aa = p.ratio >= 4.5 ? "pass" : p.ratio >= 3 ? "large only" : "fail";
    const aaa = p.ratio >= 7 ? "pass" : "fail";
    return `${p.fg},${p.bg},${p.ratio},${aa},${aaa}`;
  });
  return [header, ...rows].join("\n");
}

function luminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function badgeColor(label: ReturnType<typeof wcagLabel>): { bg: string; fg: string } {
  if (label === "AAA") return { bg: "#d1fae5", fg: "#047857" };
  if (label === "AA") return { bg: "#dcfce7", fg: "#15803d" };
  if (label === "AA Large") return { bg: "#fef9c3", fg: "#a16207" };
  return { bg: "#fee2e2", fg: "#ef4444" };
}

function badgeClasses(label: ReturnType<typeof wcagLabel>): string {
  if (label === "AAA") return "bg-emerald-100 text-emerald-700";
  if (label === "AA") return "bg-green-100 text-green-700";
  if (label === "AA Large") return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-500";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MatrixCell({ pair }: { pair: Pair }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-1 rounded-xl border border-black/6 p-2.5 dark:border-white/8"
      style={{ backgroundColor: pair.bg }}
      title={`${pair.fg} on ${pair.bg} — ${pair.ratio}:1`}
    >
      <span className="text-sm font-bold leading-none" style={{ color: pair.fg }}>
        Aa
      </span>
      <span className="text-[10px] font-semibold leading-none" style={{ color: pair.fg }}>
        {pair.ratio}:1
      </span>
      <span className={`rounded px-1 py-0.5 text-[9px] font-bold leading-none ${badgeClasses(pair.label)}`}>
        {pair.label}
      </span>
    </div>
  );
}

function ColorChip({ hex }: { hex: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="inline-block h-4 w-4 flex-shrink-0 rounded-md border border-black/10 dark:border-white/10"
        style={{ backgroundColor: hex }}
      />
      <span className="font-mono text-xs text-neutral-600 dark:text-neutral-400">{hex}</span>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const EXAMPLE = "#3B82F6\n#1E40AF\n#FFFFFF\n#111111\n#F3F4F6";

export function WcagAuditPage() {
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [csvCopied, setCsvCopied] = useState(false);
  const [reportDownloading, setReportDownloading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const colors = useMemo(() => (submitted ? parseHexColors(submitted) : []), [submitted]);
  const pairs = useMemo(() => buildMatrix(colors), [colors]);

  const passAA = pairs.filter((p) => p.ratio >= 4.5).length;
  const passAAA = pairs.filter((p) => p.ratio >= 7).length;
  const failCount = pairs.filter((p) => p.ratio < 3).length;
  const total = pairs.length;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(input);
  }

  async function handleCopyCsv() {
    try {
      await navigator.clipboard.writeText(buildCsv(pairs));
      setCsvCopied(true);
      window.setTimeout(() => setCsvCopied(false), 1400);
    } catch { /* noop */ }
  }

  const handleDownloadReport = useCallback(async () => {
    if (!reportRef.current) return;
    setReportDownloading(true);
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(reportRef.current, { pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = "wcag-contrast-audit.png";
      link.href = dataUrl;
      link.click();
    } catch {
      /* noop */
    } finally {
      setReportDownloading(false);
    }
  }, []);

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
          Accessibility
        </div>
        <h1 className="text-3xl font-bold tracking-[-0.03em] text-neutral-950 dark:text-white sm:text-4xl">
          WCAG Contrast Auditor
        </h1>
        <p className="mt-3 max-w-xl text-neutral-500 dark:text-neutral-400">
          Paste your design system colors — get a full WCAG AA/AAA compliance matrix for every foreground/background combination.
        </p>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="rounded-2xl border border-black/6 bg-white/60 p-5 dark:border-white/8 dark:bg-white/4">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400">
            Hex Colors (up to 10)
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={5}
            placeholder={"#3B82F6\n#1E40AF\n#FFFFFF\n#111111"}
            className="w-full rounded-xl border border-black/8 bg-white px-4 py-3 font-mono text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/20 dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-200 dark:placeholder:text-neutral-600 dark:focus:ring-white/20"
          />
          <p className="mt-1.5 text-xs text-neutral-400 dark:text-neutral-500">
            One per line, comma-separated, or mixed. Both #RRGGBB and RRGGBB accepted.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={!input.trim()}
              className="rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-40 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100"
            >
              Audit
            </button>
            <button
              type="button"
              onClick={() => { setInput(EXAMPLE); setSubmitted(EXAMPLE); }}
              className="rounded-full border border-black/8 bg-white px-4 py-2.5 text-sm font-medium text-neutral-600 transition hover:bg-neutral-50 dark:border-white/10 dark:bg-white/8 dark:text-neutral-300 dark:hover:bg-white/12"
            >
              Load example
            </button>
            <button
              type="button"
              onClick={() => {
                const ids = getPaletteIds();
                const hexes = ids
                  .map((id: string) => allColors.find((c) => c.id === id)?.hex)
                  .filter((h): h is string => Boolean(h))
                  .join("\n");
                if (hexes) { setInput(hexes); setSubmitted(hexes); }
              }}
              className="rounded-full border border-black/8 bg-white px-4 py-2.5 text-sm font-medium text-neutral-600 transition hover:bg-neutral-50 dark:border-white/10 dark:bg-white/8 dark:text-neutral-300 dark:hover:bg-white/12"
            >
              Load from Palette Builder
            </button>
          </div>
        </div>
      </form>

      {/* Results */}
      {colors.length >= 2 && (
        <div className="space-y-6">
          {/* Color chips + summary */}
          <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-black/6 bg-white/60 px-5 py-4 dark:border-white/8 dark:bg-white/4">
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400">
                {colors.length} colors · {total} pairs
              </div>
              <div className="flex flex-wrap gap-3">
                {colors.map((hex) => <ColorChip key={hex} hex={hex} />)}
              </div>
            </div>
            <div className="text-right text-sm">
              <div className="font-semibold text-neutral-800 dark:text-neutral-200">
                {passAA} / {total} pass AA
              </div>
              <div className="text-neutral-500 dark:text-neutral-400">
                {passAAA} / {total} pass AAA
              </div>
            </div>
          </div>

          {/* Matrix */}
          <div className="rounded-2xl border border-black/6 bg-white/60 p-5 dark:border-white/8 dark:bg-white/4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400">
                Contrast Matrix
              </h2>
              <div className="flex gap-2">
                <ProGate label="Download Report">
                  <button
                    type="button"
                    onClick={() => void handleDownloadReport()}
                    disabled={reportDownloading}
                    className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-neutral-600 transition hover:bg-neutral-950 hover:text-white disabled:opacity-40 dark:border-white/10 dark:bg-white/8 dark:text-neutral-300 dark:hover:bg-white dark:hover:text-neutral-950"
                  >
                    {reportDownloading ? "Exporting..." : "Download Report"}
                  </button>
                </ProGate>
                <ProGate label="Copy CSV">
                  <button
                    type="button"
                    onClick={() => void handleCopyCsv()}
                    className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-neutral-600 transition hover:bg-neutral-950 hover:text-white dark:border-white/10 dark:bg-white/8 dark:text-neutral-300 dark:hover:bg-white dark:hover:text-neutral-950"
                  >
                    {csvCopied ? "CSV Copied" : "Copy CSV"}
                  </button>
                </ProGate>
              </div>
            </div>

            {/* Grid: each row is a background, each column is a foreground */}
            <div className="space-y-3">
              {colors.map((bg) => (
                <div key={bg} className="flex items-center gap-2">
                  {/* Row label */}
                  <div className="flex w-24 flex-shrink-0 items-center gap-1.5">
                    <span
                      className="inline-block h-3.5 w-3.5 rounded border border-black/10 dark:border-white/10"
                      style={{ backgroundColor: bg }}
                    />
                    <span className="truncate font-mono text-[10px] text-neutral-500 dark:text-neutral-400">
                      {bg}
                    </span>
                  </div>
                  {/* Cells */}
                  <div
                    className="grid flex-1 gap-2"
                    style={{ gridTemplateColumns: `repeat(${colors.length - 1}, minmax(0, 1fr))` }}
                  >
                    {colors
                      .filter((fg) => fg !== bg)
                      .map((fg) => {
                        const pair = pairs.find((p) => p.bg === bg && p.fg === fg)!;
                        return <MatrixCell key={fg} pair={pair} />;
                      })}
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-3 text-xs text-neutral-400 dark:text-neutral-500">
              Row = background · Column = foreground. Same-color pairs skipped.
            </p>
          </div>
        </div>
      )}

      {colors.length === 1 && (
        <div className="flex h-24 items-center justify-center rounded-2xl border border-dashed border-black/10 dark:border-white/10">
          <p className="text-sm text-neutral-400 dark:text-neutral-500">
            Enter at least 2 colors to generate the matrix
          </p>
        </div>
      )}

      {submitted && colors.length === 0 && (
        <div className="flex h-24 items-center justify-center rounded-2xl border border-dashed border-red-200 dark:border-red-900">
          <p className="text-sm text-red-400">No valid hex colors found in input</p>
        </div>
      )}
      {/* Hidden render target for report image export */}
      {colors.length >= 2 && (
        <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
          <div
            ref={reportRef}
            style={{
              width: 1200,
              background: "#ffffff",
              fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
              padding: "40px 48px",
              color: "#111",
            }}
          >
            {/* Report header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
              <div>
                <div style={{ fontSize: 26, fontWeight: 700, color: "#0a0a0a", marginBottom: 4 }}>
                  WCAG Contrast Audit Report
                </div>
                <div style={{ fontSize: 13, color: "#888" }}>
                  {colors.length} colors &middot; {total} pairs &middot; Generated {new Date().toLocaleDateString()}
                </div>
              </div>
              <div style={{ fontSize: 12, color: "#bbb", fontWeight: 600, letterSpacing: "0.05em" }}>
                colorarchive.me
              </div>
            </div>

            {/* Color swatches */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "#999", marginBottom: 12 }}>
                Colors
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {colors.map((hex) => {
                  const isLight = luminance(hex) > 0.5;
                  return (
                    <div
                      key={hex}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        backgroundColor: hex,
                        borderRadius: 8,
                        padding: "8px 14px",
                        border: "1px solid rgba(0,0,0,0.08)",
                      }}
                    >
                      <span style={{
                        fontFamily: "monospace",
                        fontSize: 12,
                        fontWeight: 600,
                        color: isLight ? "#111" : "#fff",
                      }}>
                        {hex}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Summary stats */}
            <div style={{ display: "flex", gap: 16, marginBottom: 28 }}>
              {[
                { label: "Total Pairs", value: String(total), bg: "#f5f5f5", fg: "#333" },
                { label: "AAA", value: String(passAAA), bg: "#d1fae5", fg: "#047857" },
                { label: "AA", value: String(passAA), bg: "#dcfce7", fg: "#15803d" },
                { label: "Fail", value: String(failCount), bg: "#fee2e2", fg: "#ef4444" },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    flex: 1,
                    backgroundColor: s.bg,
                    borderRadius: 10,
                    padding: "14px 18px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 22, fontWeight: 700, color: s.fg }}>{s.value}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: s.fg, opacity: 0.7, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Contrast matrix */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "#999", marginBottom: 12 }}>
                Contrast Matrix
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {colors.map((bg) => (
                  <div key={bg} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {/* Row label */}
                    <div style={{ width: 90, display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                      <span style={{
                        display: "inline-block",
                        width: 14,
                        height: 14,
                        borderRadius: 3,
                        backgroundColor: bg,
                        border: "1px solid rgba(0,0,0,0.1)",
                      }} />
                      <span style={{ fontFamily: "monospace", fontSize: 10, color: "#777" }}>{bg}</span>
                    </div>
                    {/* Cells */}
                    <div style={{ display: "flex", gap: 6, flex: 1 }}>
                      {colors.filter((fg) => fg !== bg).map((fg) => {
                        const pair = pairs.find((p) => p.bg === bg && p.fg === fg)!;
                        const badge = badgeColor(pair.label);
                        return (
                          <div
                            key={fg}
                            style={{
                              flex: 1,
                              backgroundColor: bg,
                              borderRadius: 8,
                              padding: "8px 4px",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: 4,
                              border: "1px solid rgba(0,0,0,0.06)",
                            }}
                          >
                            <span style={{ fontSize: 13, fontWeight: 700, color: fg }}>Aa</span>
                            <span style={{ fontSize: 10, fontWeight: 600, color: fg }}>{pair.ratio}:1</span>
                            <span style={{
                              fontSize: 9,
                              fontWeight: 700,
                              backgroundColor: badge.bg,
                              color: badge.fg,
                              borderRadius: 3,
                              padding: "2px 5px",
                            }}>
                              {pair.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 10, color: "#bbb", marginTop: 8 }}>
                Row = background &middot; Column = foreground. Same-color pairs skipped.
              </div>
            </div>

            {/* Footer */}
            <div style={{
              borderTop: "1px solid #eee",
              paddingTop: 14,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <div style={{ fontSize: 10, color: "#ccc" }}>
                {passAAA} AAA &middot; {passAA} AA &middot; {failCount} Fail
              </div>
              <div style={{ fontSize: 10, color: "#ccc" }}>
                Generated with ColorArchive
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
