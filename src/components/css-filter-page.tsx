"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { colors } from "@/src/data/colors";
import { findNearestArchiveColor } from "@/src/lib/color-utils";
import { interpretDeltaE } from "@/src/lib/color-difference";
import { normalizeHexInput } from "@/src/lib/screen-test";
import { applyFilters, solveFilters, type FilterSolution } from "@/src/lib/css-filter";
import { useLocale } from "@/src/components/locale-provider";
import { track } from "@/src/lib/track";

export function CssFilterPage() {
  const { locale } = useLocale();
  const zh = locale === "zh";

  const [input, setInput] = useState("#1e90ff");
  const [seed, setSeed] = useState(42);
  const [copied, setCopied] = useState(false);

  const hex = useMemo(() => normalizeHexInput(input), [input]);
  const solution: FilterSolution | null = useMemo(
    () => (hex ? solveFilters(hex, seed) : null),
    [hex, seed],
  );
  const achieved = useMemo(() => {
    if (!solution) return null;
    const { r, g, b } = applyFilters(solution.values);
    return `rgb(${r}, ${g}, ${b})`;
  }, [solution]);
  const nearestArchive = useMemo(() => (hex ? findNearestArchiveColor(colors, hex) : null), [hex]);

  const filterValue = solution ? solution.css.replace(/^filter:\s*/, "").replace(/;$/, "") : "";

  const rerun = useCallback(() => {
    // A different seed gives the stochastic solver a fresh path — sometimes closer.
    setSeed((s) => s + 1);
    track("tool_action", { tool: "css-filter", action: "rerun" });
  }, []);

  const copy = useCallback(async () => {
    if (!solution) return;
    try {
      await navigator.clipboard.writeText(solution.css);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
      track("tool_action", { tool: "css-filter", action: "copy" });
    } catch {}
  }, [solution]);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-20 pt-8 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
        {zh ? "CSS Filter 生成器" : "CSS Filter Generator"}
      </h1>
      <p className="mt-3 text-sm leading-6 text-neutral-600 dark:text-neutral-400">
        {zh
          ? "把黑色图标变成任意颜色 —— 输入目标色,得到一条 filter 链(invert → sepia → saturate → hue-rotate → brightness → contrast)。适用于无法改填充色的黑色 SVG/PNG 图标。"
          : "Recolor black icons with pure CSS — enter a target color and get a filter chain (invert → sepia → saturate → hue-rotate → brightness → contrast). Perfect for black SVG/PNG icons whose fill you can't touch."}
      </p>

      {/* input */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <label htmlFor="cf-hex" className="text-sm text-neutral-600 dark:text-neutral-400">
          {zh ? "目标颜色:" : "Target color:"}
        </label>
        <input
          id="cf-hex"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="#1e90ff"
          spellCheck={false}
          className={`w-32 rounded-lg border bg-white px-3 py-1.5 font-mono text-sm text-neutral-900 outline-none transition focus:border-neutral-500 dark:bg-neutral-900 dark:text-neutral-100 ${hex ? "border-neutral-300 dark:border-neutral-700" : "border-red-400"}`}
        />
        {nearestArchive && hex && (
          <span className="text-xs text-neutral-500">
            {zh ? "≈ 档案色 " : "≈ archive "}
            <Link className="underline underline-offset-2" href={`/colors/${nearestArchive.id}/`}>
              {nearestArchive.name}
            </Link>
          </span>
        )}
      </div>

      {hex && solution && (
        <>
          {/* preview: target vs filtered */}
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="text-center">
              <div className="swatch-shadow mx-auto h-20 w-20 rounded-2xl" style={{ background: hex }} />
              <div className="mt-1.5 text-xs text-neutral-500">{zh ? "目标" : "Target"}</div>
            </div>
            <div className="text-center">
              <div
                className="swatch-shadow mx-auto h-20 w-20 rounded-2xl"
                style={{ background: "#000000", filter: filterValue }}
              />
              <div className="mt-1.5 text-xs text-neutral-500">{zh ? "黑色 + filter" : "Black + filter"}</div>
            </div>
            <div className="text-center">
              <div
                className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-neutral-200 dark:border-neutral-800"
              >
                {/* a "black icon" glyph recolored by the filter */}
                <span className="text-5xl" style={{ color: "#000", filter: filterValue }}>
                  ★
                </span>
              </div>
              <div className="mt-1.5 text-xs text-neutral-500">{zh ? "图标示例" : "Icon example"}</div>
            </div>
            <div className="flex flex-col items-center justify-center text-center">
              <div className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                ΔE {solution.loss.toFixed(1)}
              </div>
              <div className="mt-1 text-[11px] leading-4 text-neutral-500">
                {zh ? interpretDeltaE(solution.loss).zh : interpretDeltaE(solution.loss).en}
              </div>
            </div>
          </div>

          {/* css output */}
          <div className="mt-6 rounded-2xl border border-neutral-200 bg-white/70 p-4 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/70">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400">CSS</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={rerun}
                  className="rounded-full border border-neutral-300 px-3 py-1 text-xs text-neutral-600 transition hover:border-neutral-500 dark:border-neutral-700 dark:text-neutral-400"
                >
                  {zh ? "换个解" : "Try another"}
                </button>
                <button
                  type="button"
                  onClick={copy}
                  className="rounded-full bg-neutral-900 px-3.5 py-1 text-xs font-medium text-white transition hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
                >
                  {copied ? (zh ? "已复制!" : "Copied!") : (zh ? "复制" : "Copy")}
                </button>
              </div>
            </div>
            <pre className="overflow-x-auto whitespace-pre-wrap break-all text-xs leading-relaxed text-neutral-700 dark:text-neutral-300">
              {solution.css}
            </pre>
            {achieved && (
              <p className="mt-2 text-[11px] text-neutral-500">
                {zh
                  ? `实际得到 ${achieved}(求解是随机近似 —— ΔE 偏大时点"换个解")。仅对纯黑源生效;非黑元素先加 brightness(0) saturate(100%)。`
                  : `Lands on ${achieved} (the solver is a stochastic approximation — hit "Try another" if ΔE looks high). Works on pure-black sources; prepend brightness(0) saturate(100%) to force non-black elements to black first.`}
              </p>
            )}
          </div>
        </>
      )}

      {/* SEO content */}
      <section className="mt-10 max-w-3xl space-y-4">
        <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
          {zh ? "什么时候用 CSS filter 换色?" : "When to recolor with CSS filters"}
        </h2>
        <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-400">
          {zh
            ? "第三方黑色图标、无法内联的 <img> SVG、雪碧图 —— 都改不了 fill。filter 链在渲染管线里把黑变成任意颜色,零资源修改。如果 SVG 是内联的,直接改 fill/currentColor 永远是更好的方案。"
            : "Third-party black icons, SVGs loaded via <img>, sprite sheets — none of them let you touch fill. A filter chain recolors black at render time with zero asset changes. If your SVG is inline, changing fill/currentColor is always the better option."}
        </p>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link
            href="/convert/"
            className="text-neutral-600 underline underline-offset-2 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
          >
            {zh ? "颜色格式转换 →" : "Convert color formats →"}
          </Link>
          <Link
            href="/tailwind-colors/"
            className="text-neutral-600 underline underline-offset-2 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
          >
            {zh ? "找最近的 Tailwind 类 →" : "Find the closest Tailwind class →"}
          </Link>
        </div>
      </section>
    </main>
  );
}
