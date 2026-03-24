"use client";

import { useState, useMemo } from "react";
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

  const colors = useMemo(() => (submitted ? parseHexColors(submitted) : []), [submitted]);
  const pairs = useMemo(() => buildMatrix(colors), [colors]);

  const passAA = pairs.filter((p) => p.ratio >= 4.5).length;
  const passAAA = pairs.filter((p) => p.ratio >= 7).length;
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
    </main>
  );
}
