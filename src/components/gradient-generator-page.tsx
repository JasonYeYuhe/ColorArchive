"use client";

import Link from "next/link";
import { useState, useCallback, useRef, useEffect } from "react";

/* ------------------------------------------------------------------ */
/*  Local CopyButton                                                   */
/* ------------------------------------------------------------------ */

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => { clearTimeout(timerRef.current); }, []);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          timerRef.current = setTimeout(() => setCopied(false), 1500);
        } catch {
          /* clipboard not available */
        }
      }}
      className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-neutral-600 transition hover:bg-neutral-950 hover:text-white"
    >
      {copied ? "Copied!" : `Copy ${label}`}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function randomHex(): string {
  const hex = Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, "0");
  return `#${hex.toUpperCase()}`;
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function GradientGeneratorPage() {
  const [color1, setColor1] = useState("#4A90D9");
  const [color2, setColor2] = useState("#E74C3C");
  const [gradientType, setGradientType] = useState<"linear" | "radial">("linear");
  const [angle, setAngle] = useState(90);

  /* Derived CSS string */
  const cssValue =
    gradientType === "linear"
      ? `linear-gradient(${angle}deg, ${color1}, ${color2})`
      : `radial-gradient(circle, ${color1}, ${color2})`;

  const cssDeclaration = `background: ${cssValue};`;

  const tailwindHint =
    gradientType === "linear"
      ? `className="bg-gradient-to-r from-[${color1}] to-[${color2}]"`
      : `/* Radial gradients require arbitrary values in Tailwind:\n   className="[background:radial-gradient(circle,${color1},${color2})]" */`;

  const handleSwap = useCallback(() => {
    setColor1((prev) => {
      setColor2(prev);
      return color2;
    });
  }, [color2]);

  const handleRandomize = useCallback(() => {
    setColor1(randomHex());
    setColor2(randomHex());
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-neutral-50 pb-24 pt-28 dark:bg-neutral-950">
      {/* ---- decorative blobs ---- */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-violet-200/40 to-fuchsia-200/30 blur-3xl dark:from-violet-900/20 dark:to-fuchsia-900/15" />
      <div className="pointer-events-none absolute -right-32 top-40 h-[500px] w-[500px] rounded-full bg-gradient-to-bl from-sky-200/40 to-cyan-100/30 blur-3xl dark:from-sky-900/20 dark:to-cyan-900/15" />

      <div className="relative mx-auto max-w-3xl px-4 sm:px-6">
        {/* ---- hero ---- */}
        <section className="mb-12 text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-neutral-900 sm:text-5xl dark:text-white">
            CSS Gradient Generator
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-neutral-500 dark:text-neutral-400">
            Create beautiful CSS gradients with a visual editor. Adjust colors,
            angle, and type — then copy production-ready code instantly.
          </p>
        </section>

        {/* ---- preview panel ---- */}
        <div
          className="mb-8 w-full overflow-hidden rounded-[2rem] border border-black/6 shadow-sm dark:border-white/8"
          style={{
            background: cssValue,
            minHeight: 320,
          }}
        />

        {/* ---- controls card ---- */}
        <div className="rounded-[2rem] border border-black/6 bg-white/74 p-6 backdrop-blur-xl sm:p-8 dark:border-white/8 dark:bg-neutral-900/60">
          {/* type toggle */}
          <div className="mb-6">
            <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
              Gradient Type
            </span>
            <div className="inline-flex overflow-hidden rounded-full border border-black/8 dark:border-white/10">
              <button
                type="button"
                onClick={() => setGradientType("linear")}
                aria-pressed={gradientType === "linear"}
                className={`px-5 py-2 text-sm font-medium transition ${
                  gradientType === "linear"
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                    : "bg-white text-neutral-600 hover:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                }`}
              >
                Linear
              </button>
              <button
                type="button"
                onClick={() => setGradientType("radial")}
                aria-pressed={gradientType === "radial"}
                className={`px-5 py-2 text-sm font-medium transition ${
                  gradientType === "radial"
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                    : "bg-white text-neutral-600 hover:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                }`}
              >
                Radial
              </button>
            </div>
          </div>

          {/* color pickers */}
          <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Color 1 */}
            <div>
              <label htmlFor="color1-text" className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                Color 1
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  id="color1-picker"
                  aria-label="Color 1 picker"
                  value={color1}
                  onChange={(e) => setColor1(e.target.value.toUpperCase())}
                  className="h-10 w-14 cursor-pointer rounded-lg border border-black/8 bg-transparent dark:border-white/10"
                />
                <input
                  type="text"
                  id="color1-text"
                  value={color1}
                  onChange={(e) => {
                    const v = e.target.value.toUpperCase();
                    if (/^#[0-9A-F]{0,6}$/.test(v)) setColor1(v);
                  }}
                  maxLength={7}
                  className="w-28 rounded-lg border border-black/8 bg-white px-3 py-2 font-mono text-sm text-neutral-700 dark:border-white/10 dark:bg-neutral-800 dark:text-neutral-200"
                />
              </div>
            </div>

            {/* Color 2 */}
            <div>
              <label htmlFor="color2-text" className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                Color 2
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  id="color2-picker"
                  aria-label="Color 2 picker"
                  value={color2}
                  onChange={(e) => setColor2(e.target.value.toUpperCase())}
                  className="h-10 w-14 cursor-pointer rounded-lg border border-black/8 bg-transparent dark:border-white/10"
                />
                <input
                  type="text"
                  id="color2-text"
                  value={color2}
                  onChange={(e) => {
                    const v = e.target.value.toUpperCase();
                    if (/^#[0-9A-F]{0,6}$/.test(v)) setColor2(v);
                  }}
                  maxLength={7}
                  className="w-28 rounded-lg border border-black/8 bg-white px-3 py-2 font-mono text-sm text-neutral-700 dark:border-white/10 dark:bg-neutral-800 dark:text-neutral-200"
                />
              </div>
            </div>
          </div>

          {/* angle slider (linear only) */}
          {gradientType === "linear" && (
            <div className="mb-6">
              <label htmlFor="gradient-angle" className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                Angle: {angle}°
              </label>
              <input
                type="range"
                id="gradient-angle"
                min={0}
                max={360}
                value={angle}
                aria-label={`Gradient angle: ${angle} degrees`}
                onChange={(e) => setAngle(Number(e.target.value))}
                className="w-full accent-neutral-900 dark:accent-white"
              />
              <div className="mt-1 flex justify-between text-[11px] text-neutral-400">
                <span>0°</span>
                <span>90°</span>
                <span>180°</span>
                <span>270°</span>
                <span>360°</span>
              </div>
            </div>
          )}

          {/* action buttons */}
          <div className="mb-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleSwap}
              className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-950 hover:text-white dark:border-white/10 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-white dark:hover:text-neutral-900"
            >
              Swap Colors
            </button>
            <button
              type="button"
              onClick={handleRandomize}
              className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-950 hover:text-white dark:border-white/10 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-white dark:hover:text-neutral-900"
            >
              Randomize
            </button>
          </div>
        </div>

        {/* ---- CSS output card ---- */}
        <div className="mt-8 rounded-[2rem] border border-black/6 bg-white/74 p-6 backdrop-blur-xl sm:p-8 dark:border-white/8 dark:bg-neutral-900/60">
          {/* CSS */}
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                CSS
              </span>
              <CopyButton value={cssDeclaration} label="CSS" />
            </div>
            <pre className="overflow-x-auto rounded-xl border border-black/6 bg-neutral-50 p-4 font-mono text-sm leading-relaxed text-neutral-800 dark:border-white/8 dark:bg-neutral-800 dark:text-neutral-200">
              {cssDeclaration}
            </pre>
          </div>

          {/* Tailwind hint */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                Tailwind CSS
              </span>
              <CopyButton value={tailwindHint} label="Tailwind" />
            </div>
            <pre className="overflow-x-auto rounded-xl border border-black/6 bg-neutral-50 p-4 font-mono text-sm leading-relaxed text-neutral-800 dark:border-white/8 dark:bg-neutral-800 dark:text-neutral-200">
              {tailwindHint}
            </pre>
          </div>
        </div>

        {/* ─── About this tool ─── */}
        <section className="mt-8 rounded-[2rem] border border-black/6 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-neutral-900/80">
          <h2 className="text-lg font-semibold text-neutral-950 dark:text-white">
            How it works
          </h2>
          <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            CSS gradients create smooth transitions between two or more colors directly in the browser, with no images required. Linear gradients flow along an angle you define, while radial gradients expand outward from a center point. Both are resolution-independent and render crisply on any screen size.
          </p>
          <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Use gradients for hero backgrounds, button states, overlay effects, and decorative accents. This tool lets you pick colors, adjust the angle, and instantly copy production-ready CSS or Tailwind markup. Swap or randomize colors to discover unexpected combinations.
          </p>
        </section>

        {/* ─── Related tools ─── */}
        <section className="mt-6 rounded-[2rem] border border-black/6 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-neutral-900/80">
          <h2 className="mb-4 text-lg font-semibold text-neutral-950 dark:text-white">
            Related tools
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/mixer/" className="rounded-xl border border-black/6 bg-white/60 px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-white transition dark:border-white/10 dark:bg-white/8 dark:text-neutral-300">
              Color Mixer
            </Link>
            <Link href="/tints/" className="rounded-xl border border-black/6 bg-white/60 px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-white transition dark:border-white/10 dark:bg-white/8 dark:text-neutral-300">
              Tints &amp; Shades
            </Link>
            <Link href="/palette-generator/" className="rounded-xl border border-black/6 bg-white/60 px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-white transition dark:border-white/10 dark:bg-white/8 dark:text-neutral-300">
              Palette Generator
            </Link>
            <Link href="/css-colors/" className="rounded-xl border border-black/6 bg-white/60 px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-white transition dark:border-white/10 dark:bg-white/8 dark:text-neutral-300">
              CSS Colors
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
