"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import {
  simulateColorBlindness,
  hexToRgbCB,
  rgbToHexCB,
  luminance,
  COLOR_BLIND_INFO,
  SAMPLE_PALETTE,
  type ColorBlindType,
} from "@/src/lib/colorblind";
import { useLocale } from "@/src/components/locale-provider";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function isValidHex(s: string): boolean {
  return /^#?[0-9a-fA-F]{6}$/.test(s.trim()) || /^#?[0-9a-fA-F]{3}$/.test(s.trim());
}

function normalizeHex(s: string): string {
  const cleaned = s.replace(/^#/, "").trim();
  const expanded =
    cleaned.length === 3
      ? cleaned
          .split("")
          .map((c) => c + c)
          .join("")
      : cleaned;
  return `#${expanded.toUpperCase()}`;
}

function textColor(hex: string): string {
  const rgb = hexToRgbCB(hex);
  if (!rgb) return "#000000";
  return luminance(rgb) > 0.3 ? "#1a1a1a" : "#ffffff";
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    });
  }, [value]);
  return (
    <button
      onClick={handleCopy}
      className="text-xs opacity-60 hover:opacity-100 transition-opacity font-mono"
    >
      {copied ? "Copied!" : value}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Color Swatch Card                                                  */
/* ------------------------------------------------------------------ */

interface SwatchCardProps {
  hex: string;
  label: string;
  sublabel?: string;
  isOriginal?: boolean;
}

function SwatchCard({ hex, label, sublabel, isOriginal }: SwatchCardProps) {
  const fg = textColor(hex);
  return (
    <div className="flex flex-col overflow-hidden rounded-xl shadow-sm border border-black/5 dark:border-white/10">
      <div
        className="flex-1 min-h-[120px] flex items-end p-3 relative"
        style={{ backgroundColor: hex }}
      >
        {isOriginal && (
          <span
            className="absolute top-2 left-2 text-[10px] font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded-full"
            style={{
              backgroundColor: `${fg}22`,
              color: fg,
            }}
          >
            Original
          </span>
        )}
      </div>
      <div className="p-3 bg-white dark:bg-neutral-900">
        <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-0.5">{label}</p>
        {sublabel && (
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mb-1">{sublabel}</p>
        )}
        <CopyButton value={hex} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Single Color Row                                                   */
/* ------------------------------------------------------------------ */

interface ColorRowProps {
  inputHex: string;
  showLabels: boolean;
}

function ColorRow({ inputHex, showLabels }: ColorRowProps) {
  const rgb = hexToRgbCB(inputHex);
  if (!rgb) return null;

  const sims = COLOR_BLIND_INFO.map((info) => ({
    info,
    hex: rgbToHexCB(simulateColorBlindness(rgb, info.type)),
  }));

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      <SwatchCard hex={inputHex} label="Original" isOriginal />
      {sims.map(({ info, hex }) => (
        <SwatchCard
          key={info.type}
          hex={hex}
          label={info.label}
          sublabel={showLabels ? info.prevalence : undefined}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Palette Mode                                                       */
/* ------------------------------------------------------------------ */

function PaletteTable({ hexes }: { hexes: string[] }) {
  const rows = hexes.map((hex) => {
    const rgb = hexToRgbCB(hex);
    if (!rgb) return null;
    const sims = COLOR_BLIND_INFO.map((info) => ({
      type: info.type,
      label: info.shortLabel,
      hex: rgbToHexCB(simulateColorBlindness(rgb, info.type)),
    }));
    return { original: hex, sims };
  });

  return (
    <div className="overflow-x-auto rounded-xl border border-black/8 dark:border-white/10">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-neutral-50 dark:bg-neutral-800/60">
            <th className="px-3 py-2 text-left font-semibold text-neutral-600 dark:text-neutral-400 w-24">
              Original
            </th>
            {COLOR_BLIND_INFO.map((info) => (
              <th
                key={info.type}
                className="px-3 py-2 text-left font-semibold text-neutral-600 dark:text-neutral-400"
              >
                {info.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) =>
            row ? (
              <tr
                key={i}
                className="border-t border-black/5 dark:border-white/8 hover:bg-neutral-50/60 dark:hover:bg-neutral-800/30 transition-colors"
              >
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block w-7 h-7 rounded-md shadow-sm flex-shrink-0"
                      style={{ backgroundColor: row.original }}
                    />
                    <span className="font-mono text-neutral-500 dark:text-neutral-400">
                      {row.original}
                    </span>
                  </div>
                </td>
                {row.sims.map(({ type, hex }) => (
                  <td key={type} className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block w-7 h-7 rounded-md shadow-sm flex-shrink-0"
                        style={{ backgroundColor: hex }}
                      />
                      <span className="font-mono text-neutral-500 dark:text-neutral-400">
                        {hex}
                      </span>
                    </div>
                  </td>
                ))}
              </tr>
            ) : null
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Distinguishability Check                                           */
/* ------------------------------------------------------------------ */

function DistinguishabilityPanel({ hexes }: { hexes: string[] }) {
  if (hexes.length < 2) return null;

  type Pair = { a: string; b: string; ok: boolean; type: ColorBlindType };

  const pairs: { type: ColorBlindType; label: string; pairs: Pair[] }[] =
    COLOR_BLIND_INFO.map((info) => {
      const pairList: Pair[] = [];
      for (let i = 0; i < hexes.length; i++) {
        for (let j = i + 1; j < hexes.length; j++) {
          const rgbA = hexToRgbCB(hexes[i]);
          const rgbB = hexToRgbCB(hexes[j]);
          if (!rgbA || !rgbB) continue;
          const simA = simulateColorBlindness(rgbA, info.type);
          const simB = simulateColorBlindness(rgbB, info.type);
          // Perceived luminance difference + rough color distance in linear space
          const lumA = luminance(simA);
          const lumB = luminance(simB);
          const lumDiff = Math.abs(lumA - lumB);
          // Simple Euclidean delta in linearized RGB
          const dr =
            (simA.r / 255 - simB.r / 255) * (simA.r / 255 - simB.r / 255);
          const dg =
            (simA.g / 255 - simB.g / 255) * (simA.g / 255 - simB.g / 255);
          const db =
            (simA.b / 255 - simB.b / 255) * (simA.b / 255 - simB.b / 255);
          const colorDist = Math.sqrt(dr + dg + db);
          // Distinguishable if luminance diff > 0.1 OR color distance > 0.15
          const ok = lumDiff > 0.1 || colorDist > 0.15;
          pairList.push({ a: hexes[i], b: hexes[j], ok, type: info.type });
        }
      }
      return { type: info.type, label: info.label, pairs: pairList };
    });

  return (
    <div className="mt-8">
      <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-4">
        Pair Distinguishability
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {pairs.map(({ type, label, pairs: pairList }) => {
          const pass = pairList.filter((p) => p.ok).length;
          const total = pairList.length;
          const allPass = pass === total;
          return (
            <div
              key={type}
              className="rounded-xl border border-black/8 dark:border-white/10 p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  {label}
                </span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    allPass
                      ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                      : pass === 0
                      ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                  }`}
                >
                  {pass}/{total}
                </span>
              </div>
              <div className="space-y-1.5">
                {pairList.map((p, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span
                      className="inline-block w-4 h-4 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: p.a }}
                    />
                    <span className="text-neutral-300 dark:text-neutral-600 text-xs">vs</span>
                    <span
                      className="inline-block w-4 h-4 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: p.b }}
                    />
                    <span
                      className={`ml-auto text-[11px] font-medium ${
                        p.ok
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-500 dark:text-red-400"
                      }`}
                    >
                      {p.ok ? "✓ OK" : "✗ Risk"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export function ColorBlindSimulatorPage() {
  const { t } = useLocale();

  // Single color mode
  const [singleInput, setSingleInput] = useState("#E63946");
  const [singleHex, setSingleHex] = useState("#E63946");

  // Palette mode
  const [paletteMode, setPaletteMode] = useState(false);
  const [paletteInput, setPaletteInput] = useState(SAMPLE_PALETTE.join("\n"));
  const [showLabels, setShowLabels] = useState(true);

  const parsedPalette = useMemo(() => {
    return paletteInput
      .split(/[\n,\s]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .filter(isValidHex)
      .map(normalizeHex)
      .slice(0, 8);
  }, [paletteInput]);

  const handleSingleInput = useCallback((raw: string) => {
    setSingleInput(raw);
    const norm = normalizeHex(raw);
    if (isValidHex(raw) && hexToRgbCB(norm)) {
      setSingleHex(norm);
    }
  }, []);

  const handleColorPicker = useCallback((value: string) => {
    setSingleInput(value.toUpperCase());
    setSingleHex(value.toUpperCase());
  }, []);

  const loadSample = useCallback(() => {
    setPaletteInput(SAMPLE_PALETTE.join("\n"));
    setPaletteMode(true);
  }, []);

  return (
    <main className="max-w-5xl mx-auto px-4 py-10 sm:py-14">
      {/* Header */}
      <div className="mb-10">
        <nav className="text-xs text-neutral-400 mb-4 flex items-center gap-1.5">
          <Link href="/" className="hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
            ColorArchive
          </Link>
          <span>/</span>
          <span className="text-neutral-600 dark:text-neutral-300">Color Blindness Simulator</span>
        </nav>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
          Color Blindness Simulator
        </h1>
        <p className="text-base text-neutral-500 dark:text-neutral-400 max-w-2xl">
          See how your colors appear to people with color vision deficiency. Simulate deuteranopia,
          protanopia, tritanopia, and achromatopsia — and check if your palette is distinguishable
          across all types.
        </p>
      </div>

      {/* Mode toggle */}
      <div className="flex items-center gap-2 mb-8">
        <button
          onClick={() => setPaletteMode(false)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            !paletteMode
              ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
              : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
          }`}
        >
          Single color
        </button>
        <button
          onClick={() => setPaletteMode(true)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            paletteMode
              ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
              : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
          }`}
        >
          Palette mode
        </button>
      </div>

      {/* Single color mode */}
      {!paletteMode && (
        <div>
          {/* Input */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <div className="relative">
              <input
                type="color"
                value={singleHex}
                onChange={(e) => handleColorPicker(e.target.value)}
                className="w-12 h-12 rounded-xl cursor-pointer border-2 border-black/10 dark:border-white/10"
                title="Pick a color"
              />
            </div>
            <div className="flex items-center gap-2 bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2.5">
              <span className="text-neutral-400 text-sm">#</span>
              <input
                type="text"
                value={singleInput.replace(/^#/, "")}
                onChange={(e) => handleSingleInput(e.target.value)}
                maxLength={7}
                placeholder="E63946"
                className="font-mono text-sm bg-transparent text-neutral-900 dark:text-neutral-100 outline-none w-24 uppercase"
              />
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <label className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showLabels}
                  onChange={(e) => setShowLabels(e.target.checked)}
                  className="rounded"
                />
                Show prevalence
              </label>
            </div>
          </div>

          {/* Results grid */}
          <ColorRow inputHex={singleHex} showLabels={showLabels} />

          {/* Type info cards */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {COLOR_BLIND_INFO.map((info) => (
              <div
                key={info.type}
                className="rounded-xl border border-black/8 dark:border-white/10 bg-white/60 dark:bg-neutral-900/60 p-5"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                    {info.label}
                  </h3>
                  <span className="text-xs text-neutral-400 dark:text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full whitespace-nowrap">
                    {info.prevalence}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed mb-1.5">
                  {info.description}
                </p>
                <p className="text-xs text-neutral-400 dark:text-neutral-500 italic">{info.affected}</p>
              </div>
            ))}
          </div>

          {/* CTA to palette mode */}
          <div className="mt-8 p-5 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-black/6 dark:border-white/8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Test a full palette
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Paste up to 8 hex codes to see how your entire palette reads under each deficiency type.
              </p>
            </div>
            <button
              onClick={loadSample}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              Try with sample palette →
            </button>
          </div>
        </div>
      )}

      {/* Palette mode */}
      {paletteMode && (
        <div>
          {/* Palette input */}
          <div className="mb-8">
            <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
              Hex colors — one per line, comma-separated, or space-separated (max 8)
            </label>
            <textarea
              value={paletteInput}
              onChange={(e) => setPaletteInput(e.target.value)}
              rows={4}
              placeholder="#E63946&#10;#2A9D8F&#10;#E9C46A"
              className="w-full font-mono text-sm bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-neutral-300 dark:focus:ring-neutral-600 resize-none"
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-neutral-400">
                {parsedPalette.length} color{parsedPalette.length !== 1 ? "s" : ""} detected
              </span>
              <button
                onClick={loadSample}
                className="text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors underline"
              >
                Load sample palette
              </button>
            </div>
          </div>

          {parsedPalette.length > 0 ? (
            <>
              {/* Palette preview row */}
              <div className="mb-8">
                <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3">
                  Your palette
                </p>
                <div className="flex gap-2 flex-wrap">
                  {parsedPalette.map((hex, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div
                        className="w-12 h-12 rounded-lg shadow-sm"
                        style={{ backgroundColor: hex }}
                      />
                      <span className="text-[10px] font-mono text-neutral-400">{hex}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Simulation table */}
              <div>
                <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3">
                  Simulated appearance
                </p>
                <PaletteTable hexes={parsedPalette} />
              </div>

              {/* Distinguishability check */}
              {parsedPalette.length >= 2 && (
                <DistinguishabilityPanel hexes={parsedPalette} />
              )}
            </>
          ) : (
            <div className="text-center py-16 text-neutral-400 dark:text-neutral-600">
              <p className="text-lg mb-2">Paste hex codes above</p>
              <p className="text-sm">e.g. #FF5733 or FF5733, one per line</p>
            </div>
          )}
        </div>
      )}

      {/* Design tips */}
      <div className="mt-16 border-t border-black/8 dark:border-white/10 pt-10">
        <h2 className="text-lg font-bold text-neutral-800 dark:text-neutral-200 mb-5">
          Designing for color blindness
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            {
              title: "Don't rely on color alone",
              body: "Use shape, pattern, or text labels alongside color to convey information. Charts and status indicators should never rely solely on hue.",
            },
            {
              title: "Prioritize luminance contrast",
              body: "Strong light-dark contrast is perceivable by everyone. Even full achromatopsia preserves luminance — so a high-contrast palette is always accessible.",
            },
            {
              title: "Test the critical pairs",
              body: "Red/green pairs are the most commonly confused. For data visualization, prefer blue/orange or purple/yellow combinations that remain distinct under deuteranopia.",
            },
          ].map((tip) => (
            <div
              key={tip.title}
              className="rounded-xl bg-white/60 dark:bg-neutral-900/60 border border-black/8 dark:border-white/10 p-5"
            >
              <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
                {tip.title}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                {tip.body}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Related tools */}
      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/contrast/"
          className="px-4 py-2 rounded-lg text-sm bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors"
        >
          → WCAG Contrast Checker
        </Link>
        <Link
          href="/compare/"
          className="px-4 py-2 rounded-lg text-sm bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors"
        >
          → Color Comparison
        </Link>
        <Link
          href="/harmonies/"
          className="px-4 py-2 rounded-lg text-sm bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors"
        >
          → Color Harmonies
        </Link>
      </div>
    </main>
  );
}
