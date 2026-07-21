"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  buildDarkModeCss,
  buildDarkModePairs,
  buildDarkModeTailwind,
} from "@/src/lib/dark-mode-pairs";
import { normalizeHexInput } from "@/src/lib/screen-test";
import { useLocale } from "@/src/components/locale-provider";
import { track } from "@/src/lib/track";

const SAMPLE = ["#f8fafc", "#0f172a", "#3b82f6", "#f59e0b", "#e2e8f0"].join("\n");

function CopyBlock({ label, text, onCopy }: { label: string; text: string; onCopy?: () => void }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white/70 p-4 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/70">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400">{label}</span>
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(text);
              setCopied(true);
              setTimeout(() => setCopied(false), 1200);
              onCopy?.();
            } catch {}
          }}
          className="rounded-full bg-neutral-900 px-3 py-1 text-xs font-medium text-white transition hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
        >
          {copied ? "✓" : "Copy"}
        </button>
      </div>
      <pre className="max-h-56 overflow-auto text-xs leading-relaxed text-neutral-700 dark:text-neutral-300">{text}</pre>
    </div>
  );
}

export function DarkModeColorsPage() {
  const { locale } = useLocale();
  const zh = locale === "zh";

  const [input, setInput] = useState(SAMPLE);

  const hexes = useMemo(
    () =>
      input
        .split(/[\n,;\s]+/)
        .map((t) => normalizeHexInput(t))
        .filter((h): h is string => h !== null)
        .slice(0, 24),
    [input],
  );

  const pairs = useMemo(
    () => buildDarkModePairs(hexes.map((hex, i) => ({ name: `color-${i + 1}`, hex }))),
    [hexes],
  );

  const css = useMemo(() => buildDarkModeCss(pairs), [pairs]);
  const tailwind = useMemo(() => buildDarkModeTailwind(pairs), [pairs]);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 pb-20 pt-8 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
        {zh ? "暗色模式配色转换器" : "Dark Mode Palette Converter"}
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600 dark:text-neutral-400">
        {zh
          ? "粘贴亮色模式的配色,得到调好的暗色对应版本:亮度围绕中间调翻转、轻微降饱和防止霓虹感,并直接导出 CSS 变量或 Tailwind 配置。"
          : "Paste your light-mode palette and get a tuned dark-mode counterpart: lightness flipped around the midtones, saturation eased to avoid neon glare — exported straight to CSS variables or a Tailwind config."}
      </p>

      {/* input */}
      <div className="mt-6">
        <label htmlFor="dm-input" className="text-sm text-neutral-600 dark:text-neutral-400">
          {zh ? "亮色配色(每行一个 hex,最多 24 个):" : "Light-mode colors (one hex per line, up to 24):"}
        </label>
        <textarea
          id="dm-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={5}
          spellCheck={false}
          className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 font-mono text-sm text-neutral-900 outline-none transition focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
        />
      </div>

      {/* pairs preview */}
      {pairs.length > 0 && (
        <div className="mt-6 space-y-2">
          {pairs.map((p, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border border-neutral-200 px-3 py-2 dark:border-neutral-800">
              <div className="flex flex-1 items-center gap-2">
                <span className="swatch-shadow h-9 w-14 rounded-lg" style={{ background: p.light }} />
                <span className="font-mono text-xs text-neutral-500">{p.light}</span>
              </div>
              <span className="text-neutral-400">→</span>
              <div className="flex flex-1 items-center justify-end gap-2">
                <span className="font-mono text-xs text-neutral-500">{p.dark}</span>
                <span className="swatch-shadow h-9 w-14 rounded-lg" style={{ background: p.dark }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* exports */}
      {pairs.length > 0 && (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <CopyBlock
            label="CSS variables"
            text={css}
            onCopy={() => track("tool_action", { tool: "dark-mode-colors", action: "copy-css" })}
          />
          <CopyBlock
            label="Tailwind config"
            text={tailwind}
            onCopy={() => track("tool_action", { tool: "dark-mode-colors", action: "copy-tailwind" })}
          />
        </div>
      )}

      {/* SEO content */}
      <section className="mt-10 max-w-3xl space-y-4">
        <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
          {zh ? "暗色模式不是简单反色" : "Dark mode is not just inversion"}
        </h2>
        <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-400">
          {zh
            ? "直接反转颜色会让品牌色刺眼、层级混乱。这里的映射保持色相不变:极亮的表面色转为深色表面,中间调小步移动,同时把饱和度压低约 15% —— 高饱和色在深背景上会\"发光\"。转换结果是起点,关键界面还是要在真实环境里核对对比度。"
            : "Naive inversion makes brand colors glare and flattens hierarchy. This mapping keeps hue fixed: very light surfaces become dark surfaces, midtones move gently, and saturation is eased about 15% — saturated colors appear to glow on dark backgrounds. Treat the output as a starting point and verify contrast in the real interface."}
        </p>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link
            href="/contrast/"
            className="text-neutral-600 underline underline-offset-2 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
            onClick={() => track("tool_action", { tool: "dark-mode-colors", action: "to-contrast" })}
          >
            {zh ? "核对暗色对比度 →" : "Check dark-mode contrast →"}
          </Link>
          <Link
            href={`/preview/?colors=${encodeURIComponent(pairs.slice(0, 5).map((p) => p.dark).join(","))}`}
            className="text-neutral-600 underline underline-offset-2 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
            onClick={() => track("tool_action", { tool: "dark-mode-colors", action: "to-preview" })}
          >
            {zh ? "在 UI 里预览暗色版 →" : "Preview the dark set on UI →"}
          </Link>
        </div>
      </section>
    </main>
  );
}
