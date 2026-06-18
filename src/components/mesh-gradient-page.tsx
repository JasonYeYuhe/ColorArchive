"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface Stop {
  color: string;
  x: number; // 0-100
  y: number; // 0-100
  size: number; // 40-80
}

const PRESETS: { label: string; base: string; stops: Stop[] }[] = [
  {
    label: "Pastel Dream",
    base: "#fdf4ff",
    stops: [
      { color: "#fbc2eb", x: 10, y: 20, size: 65 },
      { color: "#a18cd1", x: 85, y: 15, size: 60 },
      { color: "#ffecd2", x: 50, y: 80, size: 70 },
      { color: "#c2e9fb", x: 20, y: 70, size: 55 },
      { color: "#a1c4fd", x: 80, y: 60, size: 60 },
    ],
  },
  {
    label: "Vivid Burst",
    base: "#0d0d14",
    stops: [
      { color: "#7c3aed", x: 15, y: 25, size: 60 },
      { color: "#06b6d4", x: 80, y: 10, size: 55 },
      { color: "#f59e0b", x: 55, y: 75, size: 65 },
      { color: "#ef4444", x: 20, y: 80, size: 50 },
      { color: "#10b981", x: 85, y: 65, size: 55 },
    ],
  },
  {
    label: "Ocean Depths",
    base: "#0a1628",
    stops: [
      { color: "#1e3a5f", x: 10, y: 30, size: 70 },
      { color: "#0e7490", x: 75, y: 10, size: 60 },
      { color: "#06b6d4", x: 85, y: 70, size: 55 },
      { color: "#0284c7", x: 30, y: 75, size: 65 },
      { color: "#164e63", x: 55, y: 40, size: 70 },
    ],
  },
  {
    label: "Earth Tones",
    base: "#fdf6ec",
    stops: [
      { color: "#c67c52", x: 15, y: 20, size: 65 },
      { color: "#e8a87c", x: 80, y: 15, size: 55 },
      { color: "#8b5e3c", x: 50, y: 85, size: 60 },
      { color: "#d4a76a", x: 20, y: 75, size: 70 },
      { color: "#f2d9b3", x: 85, y: 65, size: 65 },
    ],
  },
  {
    label: "Neon Night",
    base: "#09090b",
    stops: [
      { color: "#a855f7", x: 10, y: 20, size: 60 },
      { color: "#06ffa5", x: 85, y: 15, size: 55 },
      { color: "#f43f5e", x: 50, y: 80, size: 65 },
      { color: "#3b82f6", x: 20, y: 70, size: 55 },
      { color: "#fbbf24", x: 80, y: 65, size: 50 },
    ],
  },
];

function buildCss(base: string, stops: Stop[]): string {
  const gradients = stops
    .map((s) => `radial-gradient(at ${s.x}% ${s.y}%, ${s.color} 0px, transparent ${s.size}%)`)
    .join(",\n    ");
  return `background-color: ${base};\nbackground-image:\n    ${gradients};`;
}

function randomColor(): string {
  return "#" + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0");
}

function randomStop(): Stop {
  return {
    color: randomColor(),
    x: Math.floor(Math.random() * 90) + 5,
    y: Math.floor(Math.random() * 90) + 5,
    size: Math.floor(Math.random() * 30) + 45,
  };
}

export function MeshGradientPage() {
  const [base, setBase] = useState(PRESETS[0].base);
  const [stops, setStops] = useState<Stop[]>(PRESETS[0].stops);
  const [activeStop, setActiveStop] = useState(0);
  const [copied, setCopied] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => { clearTimeout(copiedTimerRef.current); }, []);
  const previewRef = useRef<HTMLDivElement>(null);

  const css = buildCss(base, stops);

  const updateStop = (i: number, patch: Partial<Stop>) => {
    setStops((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  };

  const randomize = () => {
    setBase(randomColor());
    setStops(stops.map(() => randomStop()));
  };

  const loadPreset = (preset: typeof PRESETS[number]) => {
    setBase(preset.base);
    setStops(preset.stops);
  };

  const copyCss = useCallback(() => {
    navigator.clipboard.writeText(css);
    setCopied(true);
    copiedTimerRef.current = setTimeout(() => setCopied(false), 1400);
  }, [css]);

  const downloadPng = useCallback(async () => {
    if (!previewRef.current) return;
    try {
      setDownloadError(null);
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(previewRef.current, { width: 800, height: 800 });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "mesh-gradient.png";
      a.click();
    } catch {
      setDownloadError("Download failed. Try copying the CSS instead.");
    }
  }, []);

  const s = stops[activeStop];

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-neutral-950">
      {/* Header */}
      <section className="max-w-5xl mx-auto px-4 pt-12 pb-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 mb-3">Design Tool</p>
        <h1 className="text-3xl sm:text-4xl font-display font-light tracking-tight text-neutral-900 dark:text-white mb-3">
          Mesh Gradient Generator
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Create beautiful layered gradients. Export as CSS or download as PNG.
        </p>
      </section>

      <div className="max-w-5xl mx-auto px-4 pb-16 flex flex-col lg:flex-row gap-6">
        {/* Left: controls */}
        <div className="lg:w-72 shrink-0 space-y-4">
          {/* Presets */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Presets</p>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => loadPreset(p)}
                  className="text-xs px-2.5 py-1 rounded-full border border-slate-200 dark:border-white/15 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Base color */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Base Color</p>
            <div className="flex items-center gap-2">
              <input type="color" value={base} onChange={(e) => setBase(e.target.value)}
                aria-label="Base color"
                className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200" />
              <span className="font-mono text-xs text-slate-600 dark:text-slate-300">{base.toUpperCase()}</span>
            </div>
          </div>

          {/* Color stops */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Color Stops</p>
            {/* Stop selector */}
            <div className="flex gap-1.5 mb-4">
              {stops.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveStop(i)}
                  className={`w-8 h-8 rounded-lg border-2 transition-all ${activeStop === i ? "border-neutral-950 dark:border-white scale-110" : "border-transparent"}`}
                  style={{ backgroundColor: s.color }}
                />
              ))}
            </div>

            {/* Active stop controls */}
            {s && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input type="color" value={s.color}
                    onChange={(e) => updateStop(activeStop, { color: e.target.value })}
                    aria-label="Stop color"
                    className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200" />
                  <span className="font-mono text-xs text-slate-600 dark:text-slate-300">{s.color.toUpperCase()}</span>
                </div>
                {[
                  { label: "X Position", key: "x" as const, min: 0, max: 100 },
                  { label: "Y Position", key: "y" as const, min: 0, max: 100 },
                  { label: "Size", key: "size" as const, min: 20, max: 90 },
                ].map(({ label, key, min, max }) => (
                  <div key={key}>
                    <div className="flex justify-between mb-1">
                      <span className="text-[10px] font-semibold text-slate-500">{label}</span>
                      <span className="text-[10px] font-mono text-slate-400">{s[key]}%</span>
                    </div>
                    <input
                      type="range" min={min} max={max} value={s[key]}
                      onChange={(e) => updateStop(activeStop, { [key]: Number(e.target.value) })}
                      aria-label={label}
                      className="w-full accent-neutral-950 dark:accent-white"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button type="button" onClick={randomize}
              className="w-full text-xs font-semibold py-2.5 rounded-xl bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 hover:opacity-90 transition-opacity">
              ⟳ Randomize
            </button>
            <button type="button" onClick={copyCss}
              className="w-full text-xs font-semibold py-2.5 rounded-xl border border-slate-200 dark:border-white/15 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-white/8 transition-colors">
              {copied ? "✓ Copied CSS" : "Copy CSS"}
            </button>
            <button type="button" onClick={downloadPng}
              className="w-full text-xs font-semibold py-2.5 rounded-xl border border-slate-200 dark:border-white/15 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-white/8 transition-colors">
              Download PNG
            </button>
            {downloadError && <p className="text-xs text-red-500 mt-1">{downloadError}</p>}
          </div>
        </div>

        {/* Right: preview */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Gradient preview */}
          <div
            ref={previewRef}
            className="w-full rounded-2xl shadow-sm overflow-hidden"
            style={{ aspectRatio: "1 / 1", ...Object.fromEntries(
              css.split("\n").map((line) => {
                const [k, ...v] = line.split(":");
                return [
                  k.trim() === "background-color" ? "backgroundColor" : "backgroundImage",
                  v.join(":").trim().replace(/;$/, ""),
                ];
              })
            ) }}
          />

          {/* CSS output */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">CSS</p>
            <pre className="text-[10px] font-mono text-slate-600 dark:text-slate-300 whitespace-pre-wrap break-all leading-relaxed">
              {css}
            </pre>
          </div>
        </div>
      </div>
    </main>
  );
}
