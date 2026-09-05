"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { hexToRgb, rgbToHsl, rgbToHex } from "@/src/lib/color-utils";
import {
  generateMixSteps,
  toCssColorMix,
  toCssVarsMix,
  toJsonMix,
  type MixMode,
  type MixStep,
} from "@/src/lib/color-mix";
import { useLocale } from "@/src/components/locale-provider";
import { track } from "@/src/lib/track";
import { writeClipboard } from "@/src/lib/clipboard";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const MIX_STEPS = 11;

const PRESETS: { name: string; a: string; b: string }[] = [
  { name: "Ocean Depth", a: "#0EA5E9", b: "#1E1B4B" },
  { name: "Sunset", a: "#F97316", b: "#DB2777" },
  { name: "Forest", a: "#166534", b: "#D97706" },
  { name: "Lavender Mist", a: "#A78BFA", b: "#E0F2FE" },
  { name: "Ember", a: "#EF4444", b: "#FDE68A" },
  { name: "Slate to Snow", a: "#334155", b: "#F8FAFC" },
  { name: "Mint to Navy", a: "#34D399", b: "#1E3A5F" },
  { name: "Mocha Rose", a: "#6B3F3F", b: "#FBBF24" },
];

type ExportFormat = "css-var" | "json" | "css-mix";

/* ------------------------------------------------------------------ */
/*  Utility                                                            */
/* ------------------------------------------------------------------ */

function isValidHex(hex: string): boolean {
  const cleaned = hex.replace(/^#/, "");
  return /^[0-9A-Fa-f]{6}$/.test(cleaned) || /^[0-9A-Fa-f]{3}$/.test(cleaned);
}

function normalizeHex(hex: string): string {
  const cleaned = hex.replace(/^#/, "");
  const expanded =
    cleaned.length === 3
      ? cleaned
          .split("")
          .map((c) => c + c)
          .join("")
      : cleaned;
  return `#${expanded.toUpperCase()}`;
}

function contrastColor(r: number, g: number, b: number): string {
  const lum = 0.2126 * (r / 255) + 0.7152 * (g / 255) + 0.0722 * (b / 255);
  return lum > 0.45 ? "#000000" : "#FFFFFF";
}

/* ------------------------------------------------------------------ */
/*  CopyButton                                                         */
/* ------------------------------------------------------------------ */

function CopyButton({
  value,
  label,
  small,
  className,
  kind = "step",
}: {
  value: string;
  label: string;
  small?: boolean;
  className?: string;
  /** Bounded surface descriptor — never a runtime value. */
  kind?: "step" | "all" | "snippet";
}) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => { clearTimeout(timerRef.current); }, []);
  const handleCopy = useCallback(async () => {
    const result = await writeClipboard(value);
    if (!result.ok) {
      track("color_copy_failed", {
        format: "mixer-value",
        variant: "compact",
        value_kind: kind,
        reason: result.reason,
      });
      return;
    }
    track("color_copied", { format: "mixer-value", variant: "compact", value_kind: kind });
    setCopied(true);
    timerRef.current = setTimeout(() => setCopied(false), 1500);
  }, [value, kind]);

  if (small) {
    return (
      <button
        type="button"
        onClick={handleCopy}
        className={`text-[10px] font-medium uppercase tracking-widest transition ${className ?? "text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"}`}
      >
        {copied ? "✓" : "Copy"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-neutral-600 transition hover:bg-neutral-950 hover:text-white dark:border-white/10 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-white dark:hover:text-neutral-900 ${className ?? ""}`}
    >
      {copied ? "Copied!" : label}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  ColorInput                                                         */
/* ------------------------------------------------------------------ */

function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const valid = isValidHex(value);
  const normalized = valid ? normalizeHex(value) : null;

  return (
    <div className="flex-1 min-w-0">
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
        {label}
      </label>
      <div className="flex items-center gap-2">
        {/* Color swatch preview */}
        <div
          className="h-10 w-10 flex-none rounded-xl border border-black/10 shadow-sm transition-colors"
          style={{ background: normalized ?? "#cccccc" }}
        />
        {/* Native color picker */}
        <input
          type="color"
          value={normalized ?? "#cccccc"}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-10 flex-none cursor-pointer rounded-lg border border-black/10 bg-white p-0.5 shadow-sm"
          title="Pick a color"
        />
        {/* Hex text input */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#3A86FF"
          maxLength={7}
          className={`h-10 w-full rounded-xl border px-3 font-mono text-sm transition focus:outline-none focus:ring-2 ${
            valid || value === ""
              ? "border-black/10 bg-white focus:ring-neutral-900/20 dark:border-white/10 dark:bg-neutral-900 dark:text-white"
              : "border-red-300 bg-red-50 text-red-700 focus:ring-red-200"
          }`}
        />
      </div>
      {normalized && (
        <div className="mt-1 flex items-center gap-2 text-xs text-neutral-400">
          <span>{normalized}</span>
          {(() => {
            const rgb = hexToRgb(normalized);
            if (!rgb) return null;
            const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);
            return <span>· hsl({h}, {s}%, {l}%)</span>;
          })()}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  StepSwatch                                                         */
/* ------------------------------------------------------------------ */

function StepSwatch({ step, index }: { step: MixStep; index: number }) {
  const fg = contrastColor(step.r, step.g, step.b);
  const label = index === 0 ? "A" : index === MIX_STEPS - 1 ? "B" : `${step.pct}%`;

  return (
    <div className="group relative flex flex-col items-center gap-1.5">
      <div
        className="relative flex h-14 w-full items-center justify-center rounded-xl border border-black/8 shadow-sm transition-transform hover:scale-[1.06] sm:h-16"
        style={{ background: step.hex }}
      >
        <span
          className="text-[10px] font-bold uppercase tracking-widest opacity-0 transition group-hover:opacity-100"
          style={{ color: fg }}
        >
          {label}
        </span>
      </div>
      <div className="flex flex-col items-center gap-0.5">
        <span className="font-mono text-[11px] text-neutral-700 dark:text-neutral-300">
          {step.hex}
        </span>
        <CopyButton value={step.hex} label="Copy" small />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function MixerPage() {
  const [hexA, setHexA] = useState("#0EA5E9");
  const [hexB, setHexB] = useState("#DB2777");
  const [mode, setMode] = useState<MixMode>("oklch");
  const [exportFormat, setExportFormat] = useState<ExportFormat>("css-var");
  const [mixName, setMixName] = useState("blend");

  // Dedupe per endpoint: the colour picker and the hex field share one handler,
  // and a picker drag / a keystroke both re-enter it. Only a NEW valid colour
  // counts as a pick. Handler-only — never fires from state or on mount.
  const lastPickedA = useRef<string | null>(null);
  const lastPickedB = useRef<string | null>(null);

  const handleChangeA = useCallback((v: string) => {
    setHexA(v);
    if (!isValidHex(v)) return;
    const normalized = normalizeHex(v);
    if (lastPickedA.current === normalized) return;
    lastPickedA.current = normalized;
    track("tool_action", { tool: "mixer", action: "pick" });
  }, []);

  const handleChangeB = useCallback((v: string) => {
    setHexB(v);
    if (!isValidHex(v)) return;
    const normalized = normalizeHex(v);
    if (lastPickedB.current === normalized) return;
    lastPickedB.current = normalized;
    track("tool_action", { tool: "mixer", action: "pick" });
  }, []);

  const validA = isValidHex(hexA) ? normalizeHex(hexA) : null;
  const validB = isValidHex(hexB) ? normalizeHex(hexB) : null;
  const bothValid = !!validA && !!validB;

  const steps = useMemo(() => {
    if (!bothValid) return [];
    return generateMixSteps(validA!, validB!, MIX_STEPS, mode);
  }, [validA, validB, mode, bothValid]);

  const exportCode = useMemo(() => {
    if (!steps.length) return "";
    if (exportFormat === "css-var") return toCssVarsMix(steps, mixName);
    if (exportFormat === "json") return toJsonMix(steps);
    // css-mix: show all steps as color-mix() calls
    return steps
      .map((s) => `/* Step ${s.pct}% */\n${toCssColorMix(validA!, validB!, s.pct, mode)}`)
      .join("\n");
  }, [steps, exportFormat, mixName, validA, validB, mode]);

  const { t } = useLocale();

  return (
    <main id="main-content" className="px-4 pb-20 pt-6 sm:px-6 sm:pt-8">
      <div className="mx-auto max-w-4xl space-y-6">

        {/* ─── Header ─── */}
        <section className="relative overflow-hidden rounded-[2rem] border border-black/6 bg-white/72 px-6 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:bg-neutral-900/70 sm:px-10 sm:py-12">
          <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />

          <div className="relative">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/85 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-neutral-500 dark:bg-neutral-800/85 dark:text-neutral-400">
              <span className="inline-block h-2 w-2 rounded-full bg-neutral-900 dark:bg-neutral-200" />
              Color Tool
            </div>
            <h1 className="font-display text-4xl font-light tracking-[-0.04em] text-neutral-950 dark:text-white sm:text-5xl">
              Color Mixer
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-neutral-600 dark:text-neutral-400 sm:text-lg">
              Blend any two colors across 11 steps using RGB, HSL, or perceptually uniform OKLCH interpolation. Copy hex values or export as CSS variables.
            </p>
          </div>
        </section>

        {/* ─── Input Panel ─── */}
        <section className="rounded-2xl border border-black/6 bg-white/80 px-6 py-6 shadow-sm backdrop-blur-xl dark:bg-neutral-900/70">
          {/* Color inputs */}
          <div className="flex flex-col gap-5 sm:flex-row">
            <ColorInput label="Color A" value={hexA} onChange={handleChangeA} />
            <div className="flex flex-none items-center justify-center text-xl text-neutral-300">
              ⟷
            </div>
            <ColorInput label="Color B" value={hexB} onChange={handleChangeB} />
          </div>

          {/* Swap button */}
          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => { setHexA(hexB); setHexB(hexA); }}
              className="rounded-full border border-black/8 bg-white px-4 py-1.5 text-xs font-medium text-neutral-600 transition hover:bg-neutral-100 dark:border-white/10 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-300"
            >
              ⇄ Swap Colors
            </button>

            {/* Mode selector */}
            <div className="flex items-center gap-1 rounded-full border border-black/8 bg-neutral-50 p-1 dark:border-white/10 dark:bg-neutral-800">
              {(["rgb", "hsl", "oklch"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`rounded-full px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] transition ${
                    mode === m
                      ? "bg-neutral-900 text-white shadow-sm dark:bg-white dark:text-neutral-900"
                      : "text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Mode description */}
          <p className="mt-3 text-xs text-neutral-400">
            {mode === "rgb" && "RGB interpolation: mixes red, green, and blue channels linearly. Fast but can produce muddy browns through complementary pairs."}
            {mode === "hsl" && "HSL interpolation: blends hue, saturation, and lightness. Preserves saturation better than RGB but hue can arc unexpectedly."}
            {mode === "oklch" && "OKLCH interpolation: perceptually uniform — lightness and chroma change at a constant perceived rate. Recommended for UI gradients."}
          </p>
        </section>

        {/* ─── Presets ─── */}
        <section className="rounded-2xl border border-black/6 bg-white/80 px-6 py-5 shadow-sm backdrop-blur-xl dark:bg-neutral-900/70">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
            Presets
          </h2>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => { setHexA(p.a); setHexB(p.b); }}
                className="flex items-center gap-2 rounded-full border border-black/8 bg-white/85 px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-white hover:shadow-sm dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-300"
              >
                <span className="flex gap-0.5">
                  <span className="inline-block h-4 w-4 rounded-l-full" style={{ background: p.a }} />
                  <span className="inline-block h-4 w-4 rounded-r-full" style={{ background: p.b }} />
                </span>
                {p.name}
              </button>
            ))}
          </div>
        </section>

        {/* ─── Result swatches ─── */}
        {bothValid && steps.length > 0 && (
          <section className="rounded-2xl border border-black/6 bg-white/80 px-6 py-6 shadow-sm backdrop-blur-xl dark:bg-neutral-900/70">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                {MIX_STEPS}-Step Blend · {mode.toUpperCase()}
              </h2>
              <CopyButton
                value={steps.map((s) => s.hex).join(", ")}
                label="Copy All Hex"
                kind="all"
              />
            </div>

            {/* Gradient preview bar */}
            <div
              className="mb-6 h-6 w-full rounded-xl shadow-sm"
              style={{
                background: `linear-gradient(to right, ${steps.map((s) => s.hex).join(", ")})`,
              }}
            />

            {/* Individual swatches */}
            <div className="grid grid-cols-11 gap-1.5">
              {steps.map((step, i) => (
                <StepSwatch key={i} step={step} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* ─── CSS color-mix() snippet ─── */}
        {bothValid && validA && validB && (
          <section className="rounded-2xl border border-black/6 bg-white/80 px-6 py-6 shadow-sm backdrop-blur-xl dark:bg-neutral-900/70">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
              CSS <code className="font-mono">color-mix()</code> — Midpoint
            </h2>
            <div className="relative overflow-x-auto rounded-xl border border-black/6 bg-neutral-950 px-5 py-4">
              <code className="block whitespace-nowrap font-mono text-sm text-emerald-400">
                {toCssColorMix(validA, validB, 50, mode)}
              </code>
              <div className="absolute right-3 top-3">
                <CopyButton
                  value={toCssColorMix(validA, validB, 50, mode)}
                  label="Copy"
                  kind="snippet"
                />
              </div>
            </div>
            <p className="mt-2 text-xs text-neutral-400">
              Native CSS <code className="font-mono">color-mix()</code> is supported in all modern browsers (Chrome 111+, Firefox 113+, Safari 16.2+).
            </p>
          </section>
        )}

        {/* ─── Export panel ─── */}
        {bothValid && steps.length > 0 && (
          <section className="rounded-2xl border border-black/6 bg-white/80 px-6 py-6 shadow-sm backdrop-blur-xl dark:bg-neutral-900/70">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                Export
              </h2>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={mixName}
                  onChange={(e) => setMixName(e.target.value)}
                  placeholder="blend"
                  className="h-7 w-28 rounded-lg border border-black/10 bg-white px-2 font-mono text-xs dark:border-white/10 dark:bg-neutral-800 dark:text-white"
                  title="Name for CSS variable prefix"
                />
                <span className="text-xs text-neutral-400">name</span>
              </div>
            </div>

            {/* Format tabs */}
            <div className="mb-4 flex gap-1 rounded-xl border border-black/6 bg-neutral-50 p-1 dark:bg-neutral-800">
              {(
                [
                  { key: "css-var", label: "CSS Vars" },
                  { key: "json", label: "JSON" },
                  { key: "css-mix", label: "color-mix()" },
                ] as const
              ).map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setExportFormat(key)}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition ${
                    exportFormat === key
                      ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white"
                      : "text-neutral-500 hover:text-neutral-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Code block */}
            <div className="relative">
              <pre className="overflow-x-auto rounded-xl border border-black/6 bg-neutral-950 p-5 text-xs leading-6 text-neutral-100">
                <code>{exportCode}</code>
              </pre>
              <div className="absolute right-3 top-3">
                <CopyButton value={exportCode} label="Copy All" kind="all" />
              </div>
            </div>
          </section>
        )}

        {/* ─── Info box ─── */}
        <section className="rounded-2xl border border-black/6 bg-white/80 px-6 py-6 shadow-sm backdrop-blur-xl dark:bg-neutral-900/70">
          <h2 className="mb-3 text-sm font-semibold text-neutral-800 dark:text-white">
            Which mode should I use?
          </h2>
          <div className="grid gap-4 text-sm text-neutral-600 dark:text-neutral-400 sm:grid-cols-3">
            <div>
              <p className="mb-1 font-semibold text-neutral-800 dark:text-white">RGB</p>
              <p>Direct channel mixing. Simple but can produce unexpectedly desaturated midpoints through complementary pairs (e.g., red + green → gray).</p>
            </div>
            <div>
              <p className="mb-1 font-semibold text-neutral-800 dark:text-white">HSL</p>
              <p>Better than RGB for most cases — preserves saturation and takes the short hue arc. Can still produce unexpected hue shifts near 0°/360°.</p>
            </div>
            <div>
              <p className="mb-1 font-semibold text-neutral-800 dark:text-white">OKLCH ✦ Recommended</p>
              <p>Perceptually uniform — every step looks equally spaced to the eye. Vivid midpoints, no muddy grays. Best choice for UI gradients and scale generation.</p>
            </div>
          </div>
        </section>

        {/* ─── Related tools ─── */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-500">
          <span>Related tools:</span>
          <Link href="/tints/" className="text-neutral-700 underline underline-offset-2 hover:text-neutral-900 dark:text-neutral-300">
            Tints & Shades
          </Link>
          <Link href="/gradient/" className="text-neutral-700 underline underline-offset-2 hover:text-neutral-900 dark:text-neutral-300">
            Gradient Generator
          </Link>
          <Link href="/harmonies/" className="text-neutral-700 underline underline-offset-2 hover:text-neutral-900 dark:text-neutral-300">
            Color Harmonies
          </Link>
          <Link href="/tools/" className="text-neutral-700 underline underline-offset-2 hover:text-neutral-900 dark:text-neutral-300">
            All Tools →
          </Link>
        </div>
      </div>
    </main>
  );
}
