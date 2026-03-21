"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { colors } from "@/src/data/colors";
import {
  hexToRgb,
  rgbToHsl,
  rgbToHsb,
  rgbToCmyk,
  rgbToHex,
  hslToRgb,
  findNearestArchiveColor,
} from "@/src/lib/color-utils";
import { useLocale } from "@/src/components/locale-provider";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type InputMode = "hex" | "rgb" | "hsl" | "hsb" | "cmyk";

interface ParsedColor {
  r: number;
  g: number;
  b: number;
  hex: string;
}

/* ------------------------------------------------------------------ */
/*  Parsing helpers                                                    */
/* ------------------------------------------------------------------ */

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function parseHexInput(raw: string): ParsedColor | null {
  const trimmed = raw.trim();
  const withHash = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  const rgb = hexToRgb(withHash);
  if (!rgb) return null;
  return { r: rgb.r, g: rgb.g, b: rgb.b, hex: rgbToHex(rgb).toUpperCase() };
}

function parseRgbInput(r: string, g: string, b: string): ParsedColor | null {
  const rn = parseInt(r, 10);
  const gn = parseInt(g, 10);
  const bn = parseInt(b, 10);
  if (isNaN(rn) || isNaN(gn) || isNaN(bn)) return null;
  const rc = clamp(rn, 0, 255);
  const gc = clamp(gn, 0, 255);
  const bc = clamp(bn, 0, 255);
  return { r: rc, g: gc, b: bc, hex: rgbToHex({ r: rc, g: gc, b: bc }) };
}

function parseHslInput(h: string, s: string, l: string): ParsedColor | null {
  const hn = parseInt(h, 10);
  const sn = parseInt(s, 10);
  const ln = parseInt(l, 10);
  if (isNaN(hn) || isNaN(sn) || isNaN(ln)) return null;
  const hc = ((hn % 360) + 360) % 360;
  const sc = clamp(sn, 0, 100);
  const lc = clamp(ln, 0, 100);
  const rgb = hslToRgb(hc, sc, lc);
  return { r: rgb.r, g: rgb.g, b: rgb.b, hex: rgbToHex(rgb) };
}

function parseHsbInput(h: string, s: string, b: string): ParsedColor | null {
  const hn = parseInt(h, 10);
  const sn = parseInt(s, 10) / 100;
  const bn = parseInt(b, 10) / 100;
  if (isNaN(hn) || isNaN(sn) || isNaN(bn)) return null;
  const hc = ((hn % 360) + 360) % 360;
  const sc = clamp(sn, 0, 1);
  const bc = clamp(bn, 0, 1);
  // HSB → RGB
  const i = Math.floor(hc / 60) % 6;
  const f = hc / 60 - Math.floor(hc / 60);
  const p = bc * (1 - sc);
  const q = bc * (1 - f * sc);
  const t = bc * (1 - (1 - f) * sc);
  const vals = [
    [bc, t, p],
    [q, bc, p],
    [p, bc, t],
    [p, q, bc],
    [t, p, bc],
    [bc, p, q],
  ][i];
  if (!vals) return null;
  const r = Math.round(vals[0] * 255);
  const g = Math.round(vals[1] * 255);
  const bv = Math.round(vals[2] * 255);
  return { r, g, b: bv, hex: rgbToHex({ r, g, b: bv }) };
}

function parseCmykInput(c: string, m: string, y: string, k: string): ParsedColor | null {
  const cn = parseInt(c, 10) / 100;
  const mn = parseInt(m, 10) / 100;
  const yn = parseInt(y, 10) / 100;
  const kn = parseInt(k, 10) / 100;
  if (isNaN(cn) || isNaN(mn) || isNaN(yn) || isNaN(kn)) return null;
  const cc = clamp(cn, 0, 1);
  const mc = clamp(mn, 0, 1);
  const yc = clamp(yn, 0, 1);
  const kc = clamp(kn, 0, 1);
  const r = Math.round(255 * (1 - cc) * (1 - kc));
  const g = Math.round(255 * (1 - mc) * (1 - kc));
  const b = Math.round(255 * (1 - yc) * (1 - kc));
  return { r, g, b, hex: rgbToHex({ r, g, b }) };
}

/* ------------------------------------------------------------------ */
/*  Copy button                                                        */
/* ------------------------------------------------------------------ */

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // fallback: ignore
    }
  }, [text]);

  return (
    <button
      type="button"
      onClick={() => void handleCopy()}
      className="ml-2 rounded-md border border-black/8 bg-white/70 px-2.5 py-1 text-xs font-medium text-neutral-500 transition hover:bg-white hover:text-neutral-800 dark:border-white/10 dark:bg-white/6 dark:text-neutral-400 dark:hover:bg-white/12 dark:hover:text-neutral-200"
      title={`Copy ${label}`}
    >
      {copied ? "✓" : "Copy"}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Format row                                                         */
/* ------------------------------------------------------------------ */

function FormatRow({ label, value, copyText }: { label: string; value: string; copyText: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-black/6 bg-white/50 px-4 py-3 dark:border-white/8 dark:bg-white/4">
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400">{label}</div>
        <div className="font-mono text-sm text-neutral-800 dark:text-neutral-200">{value}</div>
      </div>
      <CopyButton text={copyText} label={label} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Input fields per mode                                              */
/* ------------------------------------------------------------------ */

function HexInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">HEX</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="#3A86FF"
        maxLength={7}
        className="w-full rounded-xl border border-black/8 bg-white/70 px-4 py-3 font-mono text-sm text-neutral-800 placeholder-neutral-300 outline-none ring-0 transition focus:border-black/20 focus:bg-white dark:border-white/10 dark:bg-white/6 dark:text-neutral-200 dark:placeholder-neutral-600 dark:focus:border-white/20 dark:focus:bg-white/10"
      />
    </div>
  );
}

function RgbInput({
  r, g, b,
  onChange,
}: {
  r: string; g: string; b: string;
  onChange: (field: "r" | "g" | "b", v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">RGB</label>
      <div className="grid grid-cols-3 gap-2">
        {(["r", "g", "b"] as const).map((field, idx) => (
          <div key={field} className="flex flex-col gap-1">
            <span className="text-center text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
              {["R", "G", "B"][idx]}
            </span>
            <input
              type="number"
              min={0}
              max={255}
              value={field === "r" ? r : field === "g" ? g : b}
              onChange={(e) => onChange(field, e.target.value)}
              placeholder="0"
              className="w-full rounded-xl border border-black/8 bg-white/70 px-3 py-2.5 text-center font-mono text-sm text-neutral-800 outline-none transition focus:border-black/20 focus:bg-white dark:border-white/10 dark:bg-white/6 dark:text-neutral-200 dark:focus:border-white/20 dark:focus:bg-white/10"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function ThreeChannelInput({
  label,
  labels,
  values,
  placeholders,
  onChange,
}: {
  label: string;
  labels: [string, string, string];
  values: [string, string, string];
  placeholders: [string, string, string];
  onChange: (idx: 0 | 1 | 2, v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">{label}</label>
      <div className="grid grid-cols-3 gap-2">
        {labels.map((lbl, idx) => (
          <div key={lbl} className="flex flex-col gap-1">
            <span className="text-center text-[10px] font-semibold uppercase tracking-wider text-neutral-400">{lbl}</span>
            <input
              type="number"
              value={values[idx]}
              placeholder={placeholders[idx]}
              onChange={(e) => onChange(idx as 0 | 1 | 2, e.target.value)}
              className="w-full rounded-xl border border-black/8 bg-white/70 px-3 py-2.5 text-center font-mono text-sm text-neutral-800 outline-none transition focus:border-black/20 focus:bg-white dark:border-white/10 dark:bg-white/6 dark:text-neutral-200 dark:focus:border-white/20 dark:focus:bg-white/10"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function CmykInput({
  c, m, y, k,
  onChange,
}: {
  c: string; m: string; y: string; k: string;
  onChange: (field: "c" | "m" | "y" | "k", v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">CMYK</label>
      <div className="grid grid-cols-4 gap-2">
        {(["c", "m", "y", "k"] as const).map((field) => (
          <div key={field} className="flex flex-col gap-1">
            <span className="text-center text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
              {field.toUpperCase()}
            </span>
            <input
              type="number"
              min={0}
              max={100}
              value={field === "c" ? c : field === "m" ? m : field === "y" ? y : k}
              onChange={(e) => onChange(field, e.target.value)}
              placeholder="0"
              className="w-full rounded-xl border border-black/8 bg-white/70 px-2 py-2.5 text-center font-mono text-sm text-neutral-800 outline-none transition focus:border-black/20 focus:bg-white dark:border-white/10 dark:bg-white/6 dark:text-neutral-200 dark:focus:border-white/20 dark:focus:bg-white/10"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

const MODE_LABELS: Record<InputMode, string> = {
  hex: "HEX",
  rgb: "RGB",
  hsl: "HSL",
  hsb: "HSB",
  cmyk: "CMYK",
};

const PRESET_COLORS = [
  "#3A86FF", "#FF006E", "#FB5607", "#FFBE0B", "#8338EC",
  "#06D6A0", "#118AB2", "#EF476F", "#073B4C", "#F8F9FA",
];

export function ColorConverterPage() {
  const { t } = useLocale();

  // Input mode
  const [mode, setMode] = useState<InputMode>("hex");

  // Per-mode input state
  const [hexInput, setHexInput] = useState("#3A86FF");
  const [rgbR, setRgbR] = useState("58");
  const [rgbG, setRgbG] = useState("134");
  const [rgbB, setRgbB] = useState("255");
  const [hslH, setHslH] = useState("217");
  const [hslS, setHslS] = useState("100");
  const [hslL, setHslL] = useState("61");
  const [hsbH, setHsbH] = useState("217");
  const [hsbS, setHsbS] = useState("77");
  const [hsbBr, setHsbBr] = useState("100");
  const [cmykC, setCmykC] = useState("77");
  const [cmykM, setCmykM] = useState("47");
  const [cmykY, setCmykY] = useState("0");
  const [cmykK, setCmykK] = useState("0");

  // Parse current input into a unified ParsedColor
  const parsed: ParsedColor | null = useMemo(() => {
    switch (mode) {
      case "hex":
        return parseHexInput(hexInput);
      case "rgb":
        return parseRgbInput(rgbR, rgbG, rgbB);
      case "hsl":
        return parseHslInput(hslH, hslS, hslL);
      case "hsb":
        return parseHsbInput(hsbH, hsbS, hsbBr);
      case "cmyk":
        return parseCmykInput(cmykC, cmykM, cmykY, cmykK);
    }
  }, [mode, hexInput, rgbR, rgbG, rgbB, hslH, hslS, hslL, hsbH, hsbS, hsbBr, cmykC, cmykM, cmykY, cmykK]);

  // Derived conversions
  const conversions = useMemo(() => {
    if (!parsed) return null;
    const { r, g, b } = parsed;
    const hsl = rgbToHsl(r, g, b);
    const hsb = rgbToHsb(r, g, b);
    const cmyk = rgbToCmyk(r, g, b);
    return { r, g, b, hsl, hsb, cmyk, hex: parsed.hex };
  }, [parsed]);

  // Nearest archive color
  const nearestColor = useMemo(() => {
    if (!parsed) return null;
    return findNearestArchiveColor(colors, parsed.hex);
  }, [parsed]);

  // When user picks a preset or the nearest color link, sync all fields
  const loadColor = useCallback((hex: string) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return;
    const { r, g, b } = rgb;
    const hsl = rgbToHsl(r, g, b);
    const hsb = rgbToHsb(r, g, b);
    const cmyk = rgbToCmyk(r, g, b);
    setHexInput(hex.startsWith("#") ? hex : `#${hex}`);
    setRgbR(String(r));
    setRgbG(String(g));
    setRgbB(String(b));
    setHslH(String(hsl.h));
    setHslS(String(hsl.s));
    setHslL(String(hsl.l));
    setHsbH(String(hsb.h));
    setHsbS(String(hsb.s));
    setHsbBr(String(hsb.b));
    setCmykC(String(cmyk.c));
    setCmykM(String(cmyk.m));
    setCmykY(String(cmyk.y));
    setCmykK(String(cmyk.k));
  }, []);

  // Sync output fields when conversions update (only for non-active modes)
  // We do this lazily — the output display always derives from `conversions`,
  // but the other input fields stay editable by the user.

  const isLight = conversions ? (conversions.hsl.l > 55) : true;

  return (
    <main className="mx-auto max-w-[900px] px-4 py-8 sm:px-6">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="mb-2 text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-3xl">
          {t("converter.title")}
        </h1>
        <p className="max-w-xl text-sm text-neutral-500 dark:text-neutral-400">
          {t("converter.description")}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        {/* Left: Input panel */}
        <div className="flex flex-col gap-5 rounded-2xl border border-black/6 bg-white/60 p-5 shadow-[0_8px_32px_rgba(15,23,42,0.04)] backdrop-blur-xl dark:border-white/8 dark:bg-neutral-900/60">
          {/* Mode tabs */}
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(MODE_LABELS) as InputMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-wide transition ${
                  mode === m
                    ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
                    : "border border-black/8 bg-white/85 text-neutral-600 hover:bg-white dark:border-white/10 dark:bg-white/8 dark:text-neutral-400 dark:hover:bg-white/14"
                }`}
              >
                {MODE_LABELS[m]}
              </button>
            ))}
          </div>

          {/* Mode-specific input */}
          {mode === "hex" && (
            <HexInput value={hexInput} onChange={setHexInput} />
          )}
          {mode === "rgb" && (
            <RgbInput
              r={rgbR} g={rgbG} b={rgbB}
              onChange={(f, v) => {
                if (f === "r") setRgbR(v);
                else if (f === "g") setRgbG(v);
                else setRgbB(v);
              }}
            />
          )}
          {mode === "hsl" && (
            <ThreeChannelInput
              label="HSL"
              labels={["H", "S", "L"]}
              values={[hslH, hslS, hslL]}
              placeholders={["360", "100", "100"]}
              onChange={(idx, v) => {
                if (idx === 0) setHslH(v);
                else if (idx === 1) setHslS(v);
                else setHslL(v);
              }}
            />
          )}
          {mode === "hsb" && (
            <ThreeChannelInput
              label="HSB / HSV"
              labels={["H", "S", "B"]}
              values={[hsbH, hsbS, hsbBr]}
              placeholders={["360", "100", "100"]}
              onChange={(idx, v) => {
                if (idx === 0) setHsbH(v);
                else if (idx === 1) setHsbS(v);
                else setHsbBr(v);
              }}
            />
          )}
          {mode === "cmyk" && (
            <CmykInput
              c={cmykC} m={cmykM} y={cmykY} k={cmykK}
              onChange={(f, v) => {
                if (f === "c") setCmykC(v);
                else if (f === "m") setCmykM(v);
                else if (f === "y") setCmykY(v);
                else setCmykK(v);
              }}
            />
          )}

          {/* Color swatch preview */}
          <div
            className="relative flex h-28 items-center justify-center overflow-hidden rounded-xl transition-colors duration-200"
            style={{ backgroundColor: conversions ? conversions.hex : "#e5e7eb" }}
          >
            <span
              className="font-mono text-sm font-semibold tracking-wider"
              style={{ color: isLight ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.75)" }}
            >
              {conversions ? conversions.hex : "—"}
            </span>
          </div>

          {/* Preset swatches */}
          <div>
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
              {t("converter.presets")}
            </div>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => {
                    loadColor(hex);
                    setMode("hex");
                  }}
                  className="h-7 w-7 rounded-lg border border-black/8 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)] transition hover:scale-110 dark:border-white/10"
                  style={{ backgroundColor: hex }}
                  title={hex}
                  aria-label={`Load color ${hex}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right: Output panel */}
        <div className="flex flex-col gap-4">
          {conversions ? (
            <>
              <FormatRow
                label="HEX"
                value={conversions.hex}
                copyText={conversions.hex}
              />
              <FormatRow
                label="RGB"
                value={`rgb(${conversions.r}, ${conversions.g}, ${conversions.b})`}
                copyText={`rgb(${conversions.r}, ${conversions.g}, ${conversions.b})`}
              />
              <FormatRow
                label="HSL"
                value={`hsl(${conversions.hsl.h}, ${conversions.hsl.s}%, ${conversions.hsl.l}%)`}
                copyText={`hsl(${conversions.hsl.h}, ${conversions.hsl.s}%, ${conversions.hsl.l}%)`}
              />
              <FormatRow
                label="HSB / HSV"
                value={`hsb(${conversions.hsb.h}, ${conversions.hsb.s}%, ${conversions.hsb.b}%)`}
                copyText={`hsb(${conversions.hsb.h}, ${conversions.hsb.s}%, ${conversions.hsb.b}%)`}
              />
              <FormatRow
                label="CMYK"
                value={`cmyk(${conversions.cmyk.c}%, ${conversions.cmyk.m}%, ${conversions.cmyk.y}%, ${conversions.cmyk.k}%)`}
                copyText={`cmyk(${conversions.cmyk.c}%, ${conversions.cmyk.m}%, ${conversions.cmyk.y}%, ${conversions.cmyk.k}%)`}
              />

              {/* CSS snippet */}
              <div className="rounded-xl border border-black/6 bg-neutral-950/3 p-4 dark:border-white/8 dark:bg-white/3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400">CSS</span>
                  <CopyButton
                    text={`--color: ${conversions.hex};\n--color-rgb: ${conversions.r}, ${conversions.g}, ${conversions.b};\n--color-hsl: ${conversions.hsl.h}, ${conversions.hsl.s}%, ${conversions.hsl.l}%;`}
                    label="CSS variables"
                  />
                </div>
                <pre className="overflow-x-auto text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
{`--color: ${conversions.hex};
--color-rgb: ${conversions.r}, ${conversions.g}, ${conversions.b};
--color-hsl: ${conversions.hsl.h}, ${conversions.hsl.s}%, ${conversions.hsl.l}%;`}
                </pre>
              </div>

              {/* Nearest archive color */}
              {nearestColor && (
                <div className="flex items-center gap-4 rounded-xl border border-black/6 bg-white/50 px-4 py-3 dark:border-white/8 dark:bg-white/4">
                  <div
                    className="h-10 w-10 shrink-0 rounded-lg shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]"
                    style={{ backgroundColor: nearestColor.hex }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
                      {t("converter.nearestColor")}
                    </div>
                    <div className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                      {nearestColor.name}
                    </div>
                    <div className="font-mono text-xs text-neutral-500">{nearestColor.hex}</div>
                  </div>
                  <Link
                    href={`/colors/${nearestColor.id}/`}
                    className="shrink-0 rounded-full border border-black/8 bg-white/85 px-3 py-1.5 text-xs font-medium text-neutral-600 transition hover:bg-white dark:border-white/10 dark:bg-white/8 dark:text-neutral-400 dark:hover:bg-white/14"
                  >
                    {t("converter.viewInArchive")}
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-black/10 text-sm text-neutral-400 dark:border-white/10">
              {t("converter.invalidInput")}
            </div>
          )}
        </div>
      </div>

      {/* Info section */}
      <div className="mt-12 border-t border-black/6 pt-8 dark:border-white/8">
        <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          {t("converter.aboutTitle")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: "HEX", body: t("converter.aboutHex") },
            { title: "RGB", body: t("converter.aboutRgb") },
            { title: "HSL", body: t("converter.aboutHsl") },
            { title: "HSB / HSV", body: t("converter.aboutHsb") },
            { title: "CMYK", body: t("converter.aboutCmyk") },
          ].map(({ title, body }) => (
            <div key={title} className="rounded-xl border border-black/6 bg-white/50 p-4 dark:border-white/8 dark:bg-white/3">
              <div className="mb-1 text-xs font-semibold text-neutral-800 dark:text-neutral-200">{title}</div>
              <p className="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
