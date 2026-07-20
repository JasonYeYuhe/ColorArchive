"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { colors } from "@/src/data/colors";
import { findNearestArchiveColor } from "@/src/lib/color-utils";
import { deltaE2000Hex, interpretDeltaE } from "@/src/lib/color-difference";
import { normalizeHexInput } from "@/src/lib/screen-test";
import { TAILWIND_COLORS, TAILWIND_FAMILIES, type TailwindColor } from "@/src/lib/tailwind-colors";
import { useLocale } from "@/src/components/locale-provider";
import { track } from "@/src/lib/track";

interface Match {
  tw: TailwindColor;
  deltaE: number;
}

function nearestTailwind(hex: string, count = 5): Match[] {
  const scored: Match[] = [];
  for (const tw of TAILWIND_COLORS) {
    const d = deltaE2000Hex(hex, tw.hex);
    if (d !== null) scored.push({ tw, deltaE: d });
  }
  scored.sort((a, b) => a.deltaE - b.deltaE);
  return scored.slice(0, count);
}

function CopyChip({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        } catch {}
      }}
      className="rounded-full border border-neutral-300 px-2.5 py-1 font-mono text-[11px] text-neutral-600 transition hover:border-neutral-500 dark:border-neutral-700 dark:text-neutral-400"
    >
      {copied ? "✓" : (label ?? text)}
    </button>
  );
}

export function TailwindColorsPage() {
  const { locale } = useLocale();
  const zh = locale === "zh";

  const [input, setInput] = useState("#1e90ff");
  const [selected, setSelected] = useState<TailwindColor | null>(null);

  const hex = useMemo(() => normalizeHexInput(input), [input]);
  const matches = useMemo(() => (hex ? nearestTailwind(hex) : []), [hex]);
  const nearestArchive = useMemo(() => (hex ? findNearestArchiveColor(colors, hex) : null), [hex]);
  const selectedArchive = useMemo(
    () => (selected ? findNearestArchiveColor(colors, selected.hex) : null),
    [selected],
  );

  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-20 pt-8 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
        {zh ? "Tailwind 颜色工具" : "Tailwind Color Finder"}
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600 dark:text-neutral-400">
        {zh
          ? "任意 hex 找最近的 Tailwind CSS 类,或浏览完整 v4 调色板 —— 每个颜色都标注最近的 ColorArchive 命名色。"
          : "Match any hex to its closest Tailwind CSS class, or browse the full v4 palette — every color cross-named with its nearest ColorArchive color."}
      </p>

      {/* ---------------- hex → class matcher ---------------- */}
      <section className="mt-8 rounded-2xl border border-neutral-200 bg-white/70 p-5 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/70">
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="tw-hex" className="text-sm text-neutral-600 dark:text-neutral-400">
            {zh ? "你的颜色:" : "Your color:"}
          </label>
          <input
            id="tw-hex"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="#1e90ff"
            spellCheck={false}
            className={`w-32 rounded-lg border bg-white px-3 py-1.5 font-mono text-sm text-neutral-900 outline-none transition focus:border-neutral-500 dark:bg-neutral-900 dark:text-neutral-100 ${hex ? "border-neutral-300 dark:border-neutral-700" : "border-red-400"}`}
          />
          {hex && <span className="swatch-shadow h-8 w-8 rounded-lg" style={{ background: hex }} />}
          {nearestArchive && hex && (
            <span className="text-xs text-neutral-500">
              {zh ? "≈ 档案色 " : "≈ archive "}
              <Link className="underline underline-offset-2" href={`/colors/${nearestArchive.id}/`}>
                {nearestArchive.name}
              </Link>
            </span>
          )}
        </div>

        {hex && matches.length > 0 && (
          <div className="mt-4 space-y-2">
            {matches.map(({ tw, deltaE }, i) => (
              <div
                key={tw.class}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-neutral-200 px-3 py-2.5 dark:border-neutral-800"
              >
                <span className="swatch-shadow h-9 w-9 shrink-0 rounded-lg" style={{ background: tw.hex }} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="font-mono text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {tw.class}
                    </span>
                    <span className="font-mono text-xs text-neutral-500">{tw.hex}</span>
                    {i === 0 && (
                      <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                        {zh ? "最接近" : "closest"}
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 text-[11px] text-neutral-500">
                    ΔE {deltaE.toFixed(2)} — {zh ? interpretDeltaE(deltaE).zh : interpretDeltaE(deltaE).en}
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <CopyChip text={`bg-${tw.class}`} />
                  <CopyChip text={`text-${tw.class}`} />
                  <CopyChip text={tw.hex} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ---------------- palette browser ---------------- */}
      <section className="mt-10">
        <h2 className="mb-4 text-lg font-medium text-neutral-900 dark:text-neutral-100">
          {zh ? "Tailwind v4 完整调色板" : "The full Tailwind v4 palette"}
        </h2>
        <div className="space-y-2">
          {TAILWIND_FAMILIES.map((family) => {
            const shades = TAILWIND_COLORS.filter((c) => c.family === family);
            if (shades.length === 0) return null;
            return (
              <div key={family} className="flex items-center gap-2">
                <span className="w-16 shrink-0 text-right font-mono text-[11px] text-neutral-500">{family}</span>
                <div className="flex flex-1 gap-1">
                  {shades.map((c) => (
                    <button
                      key={c.class}
                      type="button"
                      title={c.class}
                      aria-label={c.class}
                      onClick={() => {
                        setSelected(c);
                        track("tool_action", { tool: "tailwind-colors", action: "pick", cls: c.class });
                      }}
                      className={`h-9 flex-1 rounded-md transition hover:scale-105 ${selected?.class === c.class ? "ring-2 ring-neutral-900 ring-offset-1 dark:ring-neutral-100" : ""}`}
                      style={{ background: c.hex }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {selected && (
          <div className="mt-5 flex flex-wrap items-center gap-4 rounded-2xl border border-neutral-200 bg-white/70 p-4 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/70">
            <span className="swatch-shadow h-12 w-12 rounded-xl" style={{ background: selected.hex }} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="font-mono text-base font-medium text-neutral-900 dark:text-neutral-100">
                  {selected.class}
                </span>
                <span className="font-mono text-xs text-neutral-500">{selected.hex}</span>
              </div>
              {selectedArchive && (
                <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                  {zh ? "最近档案色:" : "Nearest archive color: "}
                  <Link
                    className="underline underline-offset-2"
                    href={`/colors/${selectedArchive.id}/`}
                    onClick={() => track("tool_action", { tool: "tailwind-colors", action: "archive-link" })}
                  >
                    {selectedArchive.name}
                  </Link>
                </div>
              )}
            </div>
            <div className="flex gap-1.5">
              <CopyChip text={`bg-${selected.class}`} />
              <CopyChip text={`text-${selected.class}`} />
              <CopyChip text={`border-${selected.class}`} />
              <CopyChip text={selected.hex} />
            </div>
          </div>
        )}
      </section>

      {/* ---------------- SEO content ---------------- */}
      <section className="mt-10 max-w-3xl space-y-4">
        <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
          {zh ? "关于 Tailwind 颜色" : "About Tailwind colors"}
        </h2>
        <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-400">
          {zh
            ? "Tailwind CSS v4 内置 22 个色族 × 11 级明度(50–950),在 OKLCH 空间定义,感知均匀。本页数据直接由安装的 tailwindcss 包生成,与官方值一致。匹配用 CIEDE2000 色差(ΔE < 2 基本不可分辨)。"
            : "Tailwind CSS v4 ships 22 color families × 11 shades (50–950), defined in OKLCH for perceptual evenness. The values on this page are generated straight from the installed tailwindcss package, and matching uses CIEDE2000 — a ΔE below 2 is effectively indistinguishable in UI."}
        </p>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link
            href="/convert/"
            className="text-neutral-600 underline underline-offset-2 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
          >
            {zh ? "颜色格式转换(含 OKLCH)→" : "Convert formats (incl. OKLCH) →"}
          </Link>
          <Link
            href="/tints/"
            className="text-neutral-600 underline underline-offset-2 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
          >
            {zh ? "生成自己的 Tailwind 色阶 →" : "Generate your own Tailwind scale →"}
          </Link>
        </div>
      </section>
    </main>
  );
}
