"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ProGate } from "@/src/components/pro-gate";
import { SaveToProjectButton } from "@/src/components/save-to-project";

// --- Color utilities ---

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function hexToHsl(hex: string): [number, number, number] {
  let [r, g, b] = hexToRgb(hex);
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function saturation(hex: string): number {
  return hexToHsl(hex)[1];
}

interface Roles {
  bg: string;
  surface: string;
  primary: string;
  text: string;
  accent: string;
}

function assignRoles(hexes: string[]): Roles {
  const valid = hexes.filter((h) => /^#[0-9a-fA-F]{6}$/.test(h));
  if (valid.length < 5) {
    return { bg: "#f8f9fa", surface: "#ffffff", primary: "#6366f1", text: "#1a1a2e", accent: "#f59e0b" };
  }
  const sorted = [...valid].sort((a, b) => luminance(b) - luminance(a));
  const bySat = [...valid].sort((a, b) => saturation(b) - saturation(a));
  return {
    bg: sorted[0],
    surface: sorted[1],
    primary: bySat[0],
    text: sorted[sorted.length - 1],
    accent: bySat[1] !== bySat[0] ? bySat[1] : sorted[Math.floor(sorted.length / 2)],
  };
}

function readable(bg: string): string {
  return luminance(bg) > 140 ? "#1a1a1a" : "#ffffff";
}

// --- Scene previews ---

function HeroPreview({ roles }: { roles: Roles }) {
  return (
    <div
      className="rounded-2xl overflow-hidden shadow-sm min-h-[260px]"
      style={{ backgroundColor: roles.bg }}
    >
      {/* Nav */}
      <div
        className="flex items-center justify-between px-6 py-3"
        style={{ backgroundColor: roles.surface, borderBottom: `1px solid ${roles.text}18` }}
      >
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: roles.primary }} />
          <span className="text-xs font-bold" style={{ color: roles.text }}>YourBrand</span>
        </div>
        <div className="flex gap-3">
          {["Home", "About", "Pricing"].map((item) => (
            <span key={item} className="text-[10px] font-medium" style={{ color: `${roles.text}99` }}>{item}</span>
          ))}
        </div>
        <div
          className="text-[10px] font-semibold px-3 py-1 rounded-full"
          style={{ backgroundColor: roles.primary, color: readable(roles.primary) }}
        >
          Get Started
        </div>
      </div>
      {/* Hero body */}
      <div className="px-8 py-10">
        <div
          className="inline-block text-[10px] font-semibold uppercase tracking-widest px-2.5 py-0.5 rounded-full mb-4"
          style={{ backgroundColor: `${roles.accent}30`, color: roles.accent }}
        >
          New Release
        </div>
        <h2 className="text-2xl font-bold leading-tight mb-3" style={{ color: roles.text }}>
          Build something<br />beautiful today
        </h2>
        <p className="text-xs leading-relaxed mb-6" style={{ color: `${roles.text}99` }}>
          A minimal, thoughtful product for designers and developers who care about craft.
        </p>
        <div className="flex gap-3">
          <div
            className="text-xs font-semibold px-4 py-2 rounded-xl"
            style={{ backgroundColor: roles.primary, color: readable(roles.primary) }}
          >
            Start Free
          </div>
          <div
            className="text-xs font-semibold px-4 py-2 rounded-xl border"
            style={{ borderColor: `${roles.text}30`, color: roles.text }}
          >
            See Demo
          </div>
        </div>
      </div>
    </div>
  );
}

function CardPreview({ roles }: { roles: Roles }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {[
        { label: "Design", icon: "◈", desc: "Craft with intention and precision." },
        { label: "Develop", icon: "⌥", desc: "Ship clean, maintainable code fast." },
      ].map((card) => (
        <div
          key={card.label}
          className="rounded-2xl p-5 shadow-sm"
          style={{ backgroundColor: roles.surface, border: `1px solid ${roles.text}12` }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-base mb-4"
            style={{ backgroundColor: `${roles.primary}22`, color: roles.primary }}
          >
            {card.icon}
          </div>
          <p className="text-sm font-bold mb-1.5" style={{ color: roles.text }}>{card.label}</p>
          <p className="text-[11px] leading-relaxed mb-4" style={{ color: `${roles.text}77` }}>{card.desc}</p>
          <div
            className="text-[10px] font-semibold inline-block px-3 py-1.5 rounded-lg"
            style={{ backgroundColor: roles.accent, color: readable(roles.accent) }}
          >
            Learn more →
          </div>
        </div>
      ))}
      {/* Wide stat card */}
      <div
        className="col-span-2 rounded-2xl p-5 shadow-sm flex items-center justify-between"
        style={{ backgroundColor: roles.primary }}
      >
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: `${readable(roles.primary)}88` }}>Total Revenue</p>
          <p className="text-2xl font-bold" style={{ color: readable(roles.primary) }}>¥48,200</p>
        </div>
        <div
          className="text-xs font-semibold px-3 py-1.5 rounded-xl"
          style={{ backgroundColor: `${readable(roles.primary)}18`, color: readable(roles.primary) }}
        >
          +12.4% ↑
        </div>
      </div>
    </div>
  );
}

function FormPreview({ roles }: { roles: Roles }) {
  return (
    <div
      className="rounded-2xl p-6 shadow-sm max-w-sm mx-auto"
      style={{ backgroundColor: roles.surface, border: `1px solid ${roles.text}12` }}
    >
      <h3 className="text-base font-bold mb-1" style={{ color: roles.text }}>Create account</h3>
      <p className="text-[11px] mb-5" style={{ color: `${roles.text}66` }}>Join thousands of designers worldwide.</p>
      <div className="space-y-3">
        {["Full name", "Email address"].map((label) => (
          <div key={label}>
            <p className="text-[10px] font-semibold mb-1" style={{ color: `${roles.text}88` }}>{label}</p>
            <div
              className="w-full rounded-xl px-3 py-2.5 text-[11px]"
              style={{
                border: `1px solid ${roles.text}20`,
                backgroundColor: roles.bg,
                color: `${roles.text}55`,
              }}
            >
              {label === "Full name" ? "Jane Smith" : "jane@example.com"}
            </div>
          </div>
        ))}
        <div
          className="w-full text-center text-xs font-semibold py-2.5 rounded-xl mt-1"
          style={{ backgroundColor: roles.primary, color: readable(roles.primary) }}
        >
          Create Account
        </div>
        <p className="text-[9px] text-center" style={{ color: `${roles.text}55` }}>
          Already have an account?{" "}
          <span style={{ color: roles.accent }}>Sign in</span>
        </p>
      </div>
    </div>
  );
}

// --- Buttons & States ---

function ButtonsPreview({ roles }: { roles: Roles }) {
  return (
    <div className="space-y-6 p-6" style={{ backgroundColor: roles.bg }}>
      {/* Primary buttons */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider mb-3" style={{ color: `${roles.text}66` }}>
          Primary Button States
        </p>
        <div className="flex flex-wrap gap-3">
          {[
            { label: "Default", opacity: 1 },
            { label: "Hover", opacity: 0.85 },
            { label: "Active", opacity: 0.7 },
            { label: "Disabled", opacity: 0.4 },
          ].map(({ label, opacity }) => (
            <div
              key={label}
              className="text-xs font-semibold px-4 py-2 rounded-xl text-center"
              style={{
                backgroundColor: roles.primary,
                color: readable(roles.primary),
                opacity,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Secondary / outline */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider mb-3" style={{ color: `${roles.text}66` }}>
          Secondary &amp; Outline
        </p>
        <div className="flex flex-wrap gap-3">
          <div
            className="text-xs font-semibold px-4 py-2 rounded-xl"
            style={{ backgroundColor: roles.surface, color: roles.text, border: `1px solid ${roles.text}20` }}
          >
            Secondary
          </div>
          <div
            className="text-xs font-semibold px-4 py-2 rounded-xl"
            style={{ backgroundColor: "transparent", color: roles.primary, border: `2px solid ${roles.primary}` }}
          >
            Outline
          </div>
          <div
            className="text-xs font-semibold px-4 py-2 rounded-xl"
            style={{ backgroundColor: `${roles.accent}20`, color: roles.accent }}
          >
            Accent Soft
          </div>
        </div>
      </div>

      {/* Badges & tags */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider mb-3" style={{ color: `${roles.text}66` }}>
          Badges &amp; Tags
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Active", bg: `${roles.primary}20`, color: roles.primary },
            { label: "Warning", bg: "#fef3c7", color: "#d97706" },
            { label: "Error", bg: "#fee2e2", color: "#dc2626" },
            { label: "Success", bg: "#dcfce7", color: "#16a34a" },
            { label: "Neutral", bg: `${roles.text}10`, color: `${roles.text}88` },
          ].map(({ label, bg, color }) => (
            <span
              key={label}
              className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full"
              style={{ backgroundColor: bg, color }}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Navigation bar */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider mb-3" style={{ color: `${roles.text}66` }}>
          Navigation
        </p>
        <div
          className="flex items-center justify-between px-4 py-2.5 rounded-xl"
          style={{ backgroundColor: roles.surface, border: `1px solid ${roles.text}10` }}
        >
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: roles.primary }} />
            <span className="text-[11px] font-bold" style={{ color: roles.text }}>Brand</span>
          </div>
          <div className="flex gap-4">
            {["Dashboard", "Projects", "Settings"].map((item, i) => (
              <span
                key={item}
                className="text-[10px] font-medium"
                style={{ color: i === 0 ? roles.primary : `${roles.text}66` }}
              >
                {item}
              </span>
            ))}
          </div>
          <div className="w-6 h-6 rounded-full" style={{ backgroundColor: `${roles.primary}25` }} />
        </div>
      </div>
    </div>
  );
}

// --- Dark Mode Preview ---

function invertLightness(hex: string): string {
  const [h, s, l] = hexToHsl(hex);
  const newL = 100 - l;
  // HSL to hex
  const hNorm = h / 360;
  const sNorm = Math.min(s, 80) / 100; // slightly desaturate for dark mode
  const lNorm = newL / 100;
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  let r: number, g: number, b: number;
  if (sNorm === 0) {
    r = g = b = lNorm;
  } else {
    const q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm;
    const p = 2 * lNorm - q;
    r = hue2rgb(p, q, hNorm + 1 / 3);
    g = hue2rgb(p, q, hNorm);
    b = hue2rgb(p, q, hNorm - 1 / 3);
  }
  const toHex = (c: number) => Math.round(c * 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function DarkModePreview({ roles }: { roles: Roles }) {
  const dark: Roles = {
    bg: invertLightness(roles.bg),
    surface: invertLightness(roles.surface),
    primary: roles.primary, // keep primary hue
    text: invertLightness(roles.text),
    accent: roles.accent, // keep accent hue
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Light */}
      <div className="rounded-xl overflow-hidden border border-slate-200">
        <div className="text-[9px] font-semibold uppercase tracking-wider text-center py-1.5 bg-slate-100 text-slate-500">
          Light Mode
        </div>
        <MiniPreview roles={roles} />
      </div>
      {/* Dark */}
      <div className="rounded-xl overflow-hidden border border-slate-700">
        <div className="text-[9px] font-semibold uppercase tracking-wider text-center py-1.5 bg-neutral-800 text-slate-400">
          Dark Mode
        </div>
        <MiniPreview roles={dark} />
      </div>
    </div>
  );
}

function MiniPreview({ roles }: { roles: Roles }) {
  return (
    <div className="p-4 space-y-3" style={{ backgroundColor: roles.bg }}>
      {/* Nav */}
      <div className="flex items-center justify-between" style={{ color: roles.text }}>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: roles.primary }} />
          <span className="text-[9px] font-bold">Brand</span>
        </div>
        <div
          className="text-[8px] font-semibold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: roles.primary, color: readable(roles.primary) }}
        >
          CTA
        </div>
      </div>
      {/* Card */}
      <div className="rounded-lg p-3" style={{ backgroundColor: roles.surface, border: `1px solid ${roles.text}12` }}>
        <div className="h-1.5 w-16 rounded-full mb-2 opacity-80" style={{ backgroundColor: roles.text }} />
        <div className="h-1 w-24 rounded-full mb-1.5 opacity-30" style={{ backgroundColor: roles.text }} />
        <div className="h-1 w-20 rounded-full opacity-20" style={{ backgroundColor: roles.text }} />
        <div className="mt-2 flex gap-1.5">
          <span
            className="text-[7px] font-semibold px-1.5 py-0.5 rounded"
            style={{ backgroundColor: `${roles.primary}20`, color: roles.primary }}
          >
            Tag
          </span>
          <span
            className="text-[7px] font-semibold px-1.5 py-0.5 rounded"
            style={{ backgroundColor: `${roles.accent}20`, color: roles.accent }}
          >
            Badge
          </span>
        </div>
      </div>
      {/* Input */}
      <div
        className="rounded-lg px-2.5 py-1.5 text-[8px]"
        style={{ backgroundColor: roles.surface, border: `1px solid ${roles.text}18`, color: `${roles.text}55` }}
      >
        Enter email...
      </div>
    </div>
  );
}

// --- Main component ---

const SCENES = ["Landing Page", "Cards & Data", "Form & Auth", "Buttons & States", "Dark Mode"] as const;
type Scene = typeof SCENES[number];

const EXAMPLE_PALETTES: { label: string; colors: string[] }[] = [
  { label: "Ocean Deep", colors: ["#e8f4f8", "#b8d8e8", "#2d7dd2", "#1a1a2e", "#38b2ac"] },
  { label: "Warm Earth", colors: ["#fdf6ec", "#f2d9b3", "#c67c52", "#2c1810", "#e8a87c"] },
  { label: "Neon Night", colors: ["#0d0d14", "#1a1a2e", "#7c3aed", "#f8fafc", "#06ffa5"] },
  { label: "Minimal Rose", colors: ["#fff5f5", "#fce7e7", "#e53e3e", "#1a0a0a", "#f6a0a0"] },
];

export function PalettePreviewPage() {
  const [inputs, setInputs] = useState(["#e8f4f8", "#b8d8e8", "#2d7dd2", "#1a1a2e", "#38b2ac"]);
  const [activeScene, setActiveScene] = useState<Scene>("Landing Page");
  const [copied, setCopied] = useState(false);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const twCopiedTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => { clearTimeout(copiedTimerRef.current); clearTimeout(twCopiedTimerRef.current); }, []);

  const roles = assignRoles(inputs);

  // Load from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const c = params.get("colors");
    if (c) {
      const hexes = c.split(",").slice(0, 5);
      if (hexes.length === 5) setInputs(hexes);
    }
  }, []);

  const updateColor = (i: number, val: string) => {
    const next = [...inputs];
    next[i] = val;
    setInputs(next);
  };

  const loadPreset = (colors: string[]) => setInputs(colors);

  const cssVars = `--color-bg: ${roles.bg};
--color-surface: ${roles.surface};
--color-primary: ${roles.primary};
--color-text: ${roles.text};
--color-accent: ${roles.accent};`;

  const copyCss = useCallback(() => {
    navigator.clipboard.writeText(`:root {\n  ${cssVars.split("\n").join("\n  ")}\n}`);
    setCopied(true);
    copiedTimerRef.current = setTimeout(() => setCopied(false), 1400);
  }, [cssVars]);

  const [twCopied, setTwCopied] = useState(false);
  const tailwindConfig = `// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        bg: "${roles.bg}",
        surface: "${roles.surface}",
        primary: "${roles.primary}",
        text: "${roles.text}",
        accent: "${roles.accent}",
      },
    },
  },
};`;

  const copyTailwind = useCallback(() => {
    navigator.clipboard.writeText(tailwindConfig);
    setTwCopied(true);
    twCopiedTimerRef.current = setTimeout(() => setTwCopied(false), 1400);
  }, [tailwindConfig]);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-neutral-950">
      {/* Header */}
      <section className="max-w-5xl mx-auto px-4 pt-12 pb-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 mb-3">Design Tool</p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white mb-3">
          Palette UI Preview
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          See how your palette looks on real components before you build.
        </p>
      </section>

      <div className="max-w-5xl mx-auto px-4 pb-16 flex flex-col lg:flex-row gap-6">
        {/* Left: controls */}
        <div className="lg:w-72 shrink-0 space-y-4">
          {/* Color inputs */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Your Colors</p>
            <div className="space-y-2">
              {inputs.map((hex, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="color"
                    value={/^#[0-9a-fA-F]{6}$/.test(hex) ? hex : "#000000"}
                    onChange={(e) => updateColor(i, e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 dark:border-white/10"
                  />
                  <input
                    type="text"
                    value={hex}
                    onChange={(e) => updateColor(i, e.target.value)}
                    maxLength={7}
                    className="flex-1 font-mono text-xs border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1.5 bg-white dark:bg-neutral-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-300"
                  />
                  <span className="text-[9px] font-medium text-slate-400 w-12">
                    {i === 0 ? "BG" : i === 1 ? "Surface" : i === 2 ? "Primary" : i === 3 ? "Text" : "Accent"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Role assignments (read-only) */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Auto Roles</p>
            <div className="space-y-2">
              {Object.entries(roles).map(([role, hex]) => (
                <div key={role} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md border border-slate-100 dark:border-white/10 shrink-0" style={{ backgroundColor: hex }} />
                  <span className="text-[11px] capitalize font-medium text-slate-600 dark:text-slate-300 w-16">{role}</span>
                  <span className="text-[10px] font-mono text-slate-400">{hex.toUpperCase()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Presets */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Example Palettes</p>
            <div className="space-y-2">
              {EXAMPLE_PALETTES.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => loadPreset(preset.colors)}
                  className="w-full flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg p-1.5 transition-colors text-left"
                >
                  <div className="flex gap-0.5">
                    {preset.colors.map((c) => (
                      <div key={c} className="w-4 h-4 rounded" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">{preset.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Export */}
          <div className="space-y-2">
            <ProGate label="Export CSS">
              <button
                type="button"
                onClick={copyCss}
                className="w-full text-xs font-semibold py-2.5 rounded-xl border border-slate-200 dark:border-white/15 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
              >
                {copied ? "✓ Copied CSS Variables" : "Copy CSS Variables"}
              </button>
            </ProGate>
            <ProGate label="Export Tailwind">
              <button
                type="button"
                onClick={copyTailwind}
                className="w-full text-xs font-semibold py-2.5 rounded-xl border border-slate-200 dark:border-white/15 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
              >
                {twCopied ? "✓ Copied Tailwind Config" : "Copy Tailwind Config"}
              </button>
            </ProGate>
            <SaveToProjectButton
              palette={Object.values(roles)}
              defaultName="UI Preview Palette"
            />
          </div>
        </div>

        {/* Right: preview */}
        <div className="flex-1 min-w-0">
          {/* Scene tabs */}
          <div className="flex gap-2 mb-4">
            {SCENES.map((scene) => (
              <button
                key={scene}
                type="button"
                onClick={() => setActiveScene(scene)}
                className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-colors ${
                  activeScene === scene
                    ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
                    : "border border-slate-200 dark:border-white/15 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-white/8"
                }`}
              >
                {scene}
              </button>
            ))}
          </div>

          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-5">
            {activeScene === "Landing Page" && <HeroPreview roles={roles} />}
            {activeScene === "Cards & Data" && <CardPreview roles={roles} />}
            {activeScene === "Form & Auth" && <FormPreview roles={roles} />}
            {activeScene === "Buttons & States" && <ButtonsPreview roles={roles} />}
            {activeScene === "Dark Mode" && <DarkModePreview roles={roles} />}
          </div>
        </div>
      </div>
    </main>
  );
}
