"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { colors } from "@/src/data/colors";
import { findNearestArchiveColor } from "@/src/lib/color-utils";
import { interpretDeltaE } from "@/src/lib/color-difference";
import { normalizeHexInput } from "@/src/lib/screen-test";
import { PAINT_PRIMARIES, solvePaintRecipe } from "@/src/lib/paint-mix";
import { useLocale } from "@/src/components/locale-provider";
import { track } from "@/src/lib/track";

export function PaintMixPage() {
  const { locale } = useLocale();
  const zh = locale === "zh";

  const [input, setInput] = useState("#7a9b57");

  const hex = useMemo(() => normalizeHexInput(input), [input]);
  const recipes = useMemo(() => (hex ? solvePaintRecipe(hex) : []), [hex]);
  const nearestArchive = useMemo(() => (hex ? findNearestArchiveColor(colors, hex) : null), [hex]);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-20 pt-8 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
        {zh ? "颜料调色计算器" : "Paint Mixing Calculator"}
      </h1>
      <p className="mt-3 text-sm leading-6 text-neutral-600 dark:text-neutral-400">
        {zh
          ? "想调出某个颜色?输入目标色,得到经典五色(镉红、镉黄、群青、钛白、象牙黑)的调配比例建议。基于减色混合近似模型 —— 结果是起点配方,真实颜料因品牌与介质而异。"
          : "Trying to mix a specific color? Enter your target and get part-by-part recipes from a classic five-paint set (cadmium red, cadmium yellow, ultramarine, titanium white, ivory black). Built on a subtractive-mixing approximation — treat recipes as starting points; real pigments vary by brand and medium."}
      </p>

      {/* input */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <label htmlFor="pm-hex" className="text-sm text-neutral-600 dark:text-neutral-400">
          {zh ? "目标颜色:" : "Target color:"}
        </label>
        <input
          id="pm-hex"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="#7a9b57"
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

      {/* the paint set */}
      <div className="mt-5 flex flex-wrap gap-2">
        {PAINT_PRIMARIES.map((p) => (
          <span
            key={p.id}
            className="flex items-center gap-1.5 rounded-full border border-neutral-200 px-2.5 py-1 text-xs text-neutral-600 dark:border-neutral-800 dark:text-neutral-400"
          >
            <span className="swatch-shadow h-4 w-4 rounded-full" style={{ background: p.hex }} />
            {zh ? p.zh : p.en}
          </span>
        ))}
      </div>

      {/* recipes */}
      {hex && recipes.length > 0 && (
        <div className="mt-6 space-y-3">
          {recipes.map((r, i) => (
            <div
              key={i}
              className="rounded-2xl border border-neutral-200 bg-white/70 p-4 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/70"
            >
              <div className="flex flex-wrap items-center gap-3">
                {/* ratio bar */}
                <div className="flex h-9 min-w-40 flex-1 overflow-hidden rounded-lg">
                  {r.parts.map((p, k) => (
                    <div
                      key={k}
                      className="h-full"
                      style={{
                        background: p.primary.hex,
                        flexGrow: p.count,
                      }}
                      title={`${p.count} × ${zh ? p.primary.zh : p.primary.en}`}
                    />
                  ))}
                </div>
                <span className="text-neutral-400">≈</span>
                <span className="swatch-shadow h-9 w-9 rounded-lg" style={{ background: r.mixedHex }} />
                <span className="swatch-shadow h-9 w-9 rounded-lg" style={{ background: hex }} />
              </div>
              <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-700 dark:text-neutral-300">
                <span className="font-medium">
                  {r.parts
                    .map((p) => `${p.count} ${zh ? "份" : p.count === 1 ? "part" : "parts"} ${zh ? p.primary.zh : p.primary.en}`)
                    .join(" + ")}
                </span>
                <span className="text-xs text-neutral-500">
                  ΔE {r.deltaE.toFixed(1)} — {zh ? interpretDeltaE(r.deltaE).zh : interpretDeltaE(r.deltaE).en}
                </span>
              </div>
            </div>
          ))}
          <p className="text-[11px] leading-4 text-neutral-500">
            {zh
              ? "左 = 预测混合色,右 = 目标色。模型无法命中所有颜色(高饱和青/品红超出这套颜料的色域)——ΔE 大就说明该换颜料而不是换比例。"
              : "Left swatch = predicted mix, right = your target. The model can't reach every color (saturated cyans/magentas exceed this paint set's gamut) — a high ΔE means you need different paints, not different ratios."}
          </p>
        </div>
      )}

      {/* SEO content */}
      <section className="mt-10 max-w-3xl space-y-4">
        <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
          {zh ? "为什么颜料混合和屏幕不一样" : "Why paint doesn't mix like light"}
        </h2>
        <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-400">
          {zh
            ? "屏幕是加色:红光加绿光变亮变黄。颜料是减色:每种颜料吸走一部分光,混得越多越暗 —— 黄加蓝剩下的是绿。本页用线性空间的加权几何混合来近似这个过程,能给出方向正确的配方;严肃的颜料建模要用 Kubelka-Munk 理论和实测光谱。"
            : "Screens add light: red plus green gets brighter and yellower. Paints subtract it: each pigment absorbs part of the spectrum, so mixes get darker — yellow plus blue leaves green behind. This page approximates that with weighted geometric mixing in linear light, which gets recipes directionally right; serious pigment modeling needs Kubelka-Munk theory and measured spectra."}
        </p>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link
            href="/mixer/"
            className="text-neutral-600 underline underline-offset-2 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
          >
            {zh ? "数字混色(RGB/OKLCH)→" : "Digital color mixing (RGB/OKLCH) →"}
          </Link>
          <Link
            href="/color-wheel/"
            className="text-neutral-600 underline underline-offset-2 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
          >
            {zh ? "色轮与和声 →" : "The color wheel & harmonies →"}
          </Link>
        </div>
      </section>
    </main>
  );
}
