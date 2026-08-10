"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { colors } from "@/src/data/colors";
import { findNearestArchiveColor } from "@/src/lib/color-utils";
import {
  KELVIN_MAX,
  KELVIN_MIN,
  kelvinToHex,
  kelvinToRgb,
  TEMPERATURE_PRESETS,
  temperatureLabel,
} from "@/src/lib/color-temperature";
import { useLocale } from "@/src/components/locale-provider";
import { track } from "@/src/lib/track";

function CopyChip({ text }: { text: string }) {
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
      className="rounded-full border border-neutral-300 px-2.5 py-1 font-mono text-[11px] text-neutral-600 transition hover:border-neutral-500 dark:border-neutral-700 dark:hover:border-neutral-500 dark:text-neutral-400"
    >
      {copied ? "✓" : text}
    </button>
  );
}

export function ColorTemperaturePage() {
  const { locale } = useLocale();
  const zh = locale === "zh";

  const [kelvin, setKelvin] = useState(3200);

  const rgb = useMemo(() => kelvinToRgb(kelvin), [kelvin]);
  const hex = useMemo(() => kelvinToHex(kelvin), [kelvin]);
  const label = temperatureLabel(kelvin);
  const nearestArchive = useMemo(() => findNearestArchiveColor(colors, hex), [hex]);

  const gradientStops = useMemo(() => {
    const stops: string[] = [];
    for (let k = KELVIN_MIN; k <= KELVIN_MAX; k += 500) stops.push(kelvinToHex(k));
    return `linear-gradient(to right, ${stops.join(", ")})`;
  }, []);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-20 pt-8 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
        {zh ? "色温转换器" : "Color Temperature Converter"}
      </h1>
      <p className="mt-3 text-sm leading-6 text-neutral-600 dark:text-neutral-400">
        {zh
          ? "Kelvin 色温 → RGB/HEX。从烛光的暖橙到北窗的冷蓝,基于经典黑体曲线拟合 —— 适合灯光设计、摄影白平衡与界面暖冷氛围取色。"
          : "Kelvin → RGB/HEX. From candle-warm orange to north-sky blue, using the classic black-body curve fit — handy for lighting design, photo white balance, and warm/cool UI moods."}
      </p>

      {/* big swatch + values */}
      <div className="mt-8 overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800">
        <div className="flex h-40 items-end justify-between p-4 transition-colors" style={{ background: hex }}>
          <span className="rounded-full bg-black/45 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
            {kelvin}K · {zh ? label.zh : label.en}
          </span>
          <span className="rounded-full bg-black/45 px-3 py-1 font-mono text-sm text-white backdrop-blur-sm">
            {hex}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 bg-white/70 p-3 backdrop-blur dark:bg-neutral-900/70">
          <CopyChip text={hex} />
          <CopyChip text={`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`} />
          {nearestArchive && (
            <span className="ml-auto text-xs text-neutral-500">
              {zh ? "≈ 档案色 " : "≈ archive "}
              <Link
                className="underline underline-offset-2"
                href={`/colors/${nearestArchive.id}/`}
                onClick={() => track("tool_action", { tool: "color-temperature", action: "archive-link" })}
              >
                {nearestArchive.name}
              </Link>
            </span>
          )}
        </div>
      </div>

      {/* slider on the kelvin gradient */}
      <div className="mt-6">
        <div className="h-4 rounded-full" style={{ background: gradientStops }} />
        <input
          type="range"
          min={KELVIN_MIN}
          max={KELVIN_MAX}
          step={50}
          value={kelvin}
          onChange={(e) => setKelvin(Number(e.target.value))}
          aria-label={zh ? "色温(Kelvin)" : "Color temperature (Kelvin)"}
          className="mt-2 w-full accent-neutral-900 dark:accent-neutral-100"
        />
        <div className="mt-1 flex justify-between text-[11px] text-neutral-500">
          <span>{KELVIN_MIN}K</span>
          <span>{KELVIN_MAX}K</span>
        </div>
      </div>

      {/* presets */}
      <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {TEMPERATURE_PRESETS.map((p) => (
          <button
            key={p.kelvin}
            type="button"
            onClick={() => {
              setKelvin(p.kelvin);
              track("tool_action", { tool: "color-temperature", action: "preset", kelvin: p.kelvin });
            }}
            className={`overflow-hidden rounded-xl border text-left transition hover:border-neutral-400 dark:hover:border-neutral-600 ${kelvin === p.kelvin ? "border-neutral-900 dark:border-neutral-100" : "border-neutral-200 dark:border-neutral-800"}`}
          >
            <div className="h-8 w-full" style={{ background: kelvinToHex(p.kelvin) }} />
            <div className="px-2 py-1.5">
              <div className="text-[11px] font-medium text-neutral-800 dark:text-neutral-200">
                {p.kelvin}K
              </div>
              <div className="text-[10px] leading-tight text-neutral-500">{zh ? p.zh : p.en}</div>
            </div>
          </button>
        ))}
      </div>

      {/* SEO content */}
      <section className="mt-10 max-w-3xl space-y-4">
        <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
          {zh ? "关于色温" : "About color temperature"}
        </h2>
        <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-400">
          {zh
            ? "色温描述黑体辐射体在某个温度下发出的光色:数值越低越暖(偏橙红),越高越冷(偏蓝)。摄影里 5600K 约等于正午日光,3200K 是影棚钨丝灯;室内照明常用 2700–4000K。本页换算是经典近似(Tanner Helland 拟合),用于设计与照明取色足够,但不是色度学仪器。"
            : "Color temperature describes the light a black-body radiator emits at a given temperature: lower is warmer (orange-red), higher is cooler (blue). In photography, 5600K approximates midday daylight and 3200K is studio tungsten; homes usually light between 2700–4000K. The conversion here is the classic approximation (Tanner Helland's fit) — plenty for design and lighting work, but not a colorimetry instrument."}
        </p>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link
            href="/convert/"
            className="text-neutral-600 underline underline-offset-2 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
          >
            {zh ? "颜色格式转换 →" : "Convert color formats →"}
          </Link>
          <Link
            href="/screen-test/color-screens/"
            className="text-neutral-600 underline underline-offset-2 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
          >
            {zh ? "把屏幕变成这个颜色的补光灯 →" : "Turn your screen into this light →"}
          </Link>
        </div>
      </section>
    </main>
  );
}
