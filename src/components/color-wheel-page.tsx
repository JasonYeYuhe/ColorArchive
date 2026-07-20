"use client";

import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";
import { colors } from "@/src/data/colors";
import { findNearestArchiveColor, hslToRgb, rgbToHex } from "@/src/lib/color-utils";
import { useLocale } from "@/src/components/locale-provider";
import { track } from "@/src/lib/track";

type HarmonyKey = "complementary" | "analogous" | "triadic" | "tetradic" | "split";

const HARMONIES: Record<HarmonyKey, { offsets: number[]; en: string; zh: string; blurb: { en: string; zh: string } }> = {
  complementary: {
    offsets: [0, 180],
    en: "Complementary",
    zh: "互补色",
    blurb: {
      en: "Opposite on the wheel — maximum contrast and energy. Use one as the dominant, the other as an accent.",
      zh: "色轮上正对的两色 —— 对比与张力最大。一个作主色,另一个点缀。",
    },
  },
  analogous: {
    offsets: [-30, 0, 30],
    en: "Analogous",
    zh: "邻近色",
    blurb: {
      en: "Neighbors on the wheel — harmonious and calm. Pick one to dominate and let the others support.",
      zh: "色轮上相邻的颜色 —— 和谐、安静。选一个当主角,其余辅助。",
    },
  },
  triadic: {
    offsets: [0, 120, 240],
    en: "Triadic",
    zh: "三等分",
    blurb: {
      en: "Three colors evenly spaced — vibrant but balanced. Mute two of them for real-world palettes.",
      zh: "三等分色轮 —— 鲜明而平衡。实际使用时通常压低其中两个的饱和度。",
    },
  },
  tetradic: {
    offsets: [0, 90, 180, 270],
    en: "Tetradic",
    zh: "四等分",
    blurb: {
      en: "Two complementary pairs — rich but hard to balance. Let one color lead clearly.",
      zh: "两组互补色 —— 层次丰富但难驾驭。必须让一个颜色明确领跑。",
    },
  },
  split: {
    offsets: [0, 150, 210],
    en: "Split-Complementary",
    zh: "分裂互补",
    blurb: {
      en: "A base plus the two neighbors of its complement — contrast with less tension than pure complementary.",
      zh: "基色 + 互补色两侧的邻居 —— 保留对比,但比纯互补更从容。",
    },
  },
};

const WHEEL_SIZE = 320;

function hueToHex(hue: number): string {
  const h = ((hue % 360) + 360) % 360;
  return rgbToHex(hslToRgb(h, 70, 50));
}

export function ColorWheelPage() {
  const { locale } = useLocale();
  const zh = locale === "zh";

  const [hue, setHue] = useState(210);
  const [harmony, setHarmony] = useState<HarmonyKey>("complementary");
  const [dragging, setDragging] = useState(false);
  const wheelRef = useRef<HTMLDivElement | null>(null);

  const setHueFromPointer = useCallback((clientX: number, clientY: number) => {
    const el = wheelRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    // 0° at the top, clockwise — matches the conic-gradient below.
    const angle = (Math.atan2(clientX - cx, cy - clientY) * 180) / Math.PI;
    // Round BEFORE the modulo: 359.9 must wrap to 0, not round up to 360
    // (360 would violate aria-valuemax and desync the readout from the swatches).
    setHue(Math.round(angle + 360) % 360);
  }, []);

  const swatches = useMemo(() => {
    return HARMONIES[harmony].offsets.map((off) => {
      const h = ((hue + off) % 360 + 360) % 360;
      const hex = hueToHex(h);
      const archive = findNearestArchiveColor(colors, hex);
      return { h, hex, archive, isBase: off === 0 };
    });
  }, [hue, harmony]);

  const markerPos = useCallback((h: number) => {
    const r = WHEEL_SIZE / 2 - 22;
    const rad = ((h - 90) * Math.PI) / 180;
    return {
      left: WHEEL_SIZE / 2 + r * Math.cos(rad),
      top: WHEEL_SIZE / 2 + r * Math.sin(rad),
    };
  }, []);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 pb-20 pt-8 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
        {zh ? "色轮" : "Color Wheel"}
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600 dark:text-neutral-400">
        {zh
          ? "拖动色轮选基色,切换五种经典和声关系 —— 每个点位都吸附到最近的 ColorArchive 命名色。"
          : "Drag around the wheel to pick a base hue and explore five classic harmony relationships — every point snapped to its nearest named ColorArchive color."}
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[auto_1fr]">
        {/* ---------------- the wheel ---------------- */}
        <div className="mx-auto">
          <div
            ref={wheelRef}
            role="slider"
            aria-label={zh ? "色相选择轮" : "Hue selection wheel"}
            aria-valuemin={0}
            aria-valuemax={359}
            aria-valuenow={hue}
            tabIndex={0}
            className="relative cursor-crosshair touch-none select-none rounded-full"
            style={{
              width: WHEEL_SIZE,
              height: WHEEL_SIZE,
              background:
                "conic-gradient(hsl(0,70%,50%), hsl(30,70%,50%), hsl(60,70%,50%), hsl(90,70%,50%), hsl(120,70%,50%), hsl(150,70%,50%), hsl(180,70%,50%), hsl(210,70%,50%), hsl(240,70%,50%), hsl(270,70%,50%), hsl(300,70%,50%), hsl(330,70%,50%), hsl(360,70%,50%))",
            }}
            onPointerDown={(e) => {
              // currentTarget, not target: a press starting on the donut-hole child
              // must still capture on the wheel that owns the move handler. Focus
              // explicitly too — Safari doesn't focus tabIndex divs on pointerdown,
              // which would leave the arrow-key handlers inert.
              e.currentTarget.setPointerCapture(e.pointerId);
              e.currentTarget.focus();
              setDragging(true);
              setHueFromPointer(e.clientX, e.clientY);
              track("tool_action", { tool: "color-wheel", action: "pick" });
            }}
            onPointerMove={(e) => {
              if (dragging) setHueFromPointer(e.clientX, e.clientY);
            }}
            onPointerUp={() => setDragging(false)}
            onPointerCancel={() => setDragging(false)}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
                e.preventDefault();
                setHue((h) => (h + 359) % 360);
              } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
                e.preventDefault();
                setHue((h) => (h + 1) % 360);
              }
            }}
          >
            {/* donut hole */}
            <div className="absolute inset-[26%] rounded-full bg-white dark:bg-neutral-950" />
            {/* center readout */}
            <div className="pointer-events-none absolute inset-[26%] flex flex-col items-center justify-center rounded-full">
              <span className="swatch-shadow h-10 w-10 rounded-full" style={{ background: hueToHex(hue) }} />
              <span className="mt-1.5 font-mono text-xs text-neutral-600 dark:text-neutral-400">{hue}°</span>
            </div>
            {/* harmony markers */}
            {swatches.map(({ h, hex, isBase }) => {
              const pos = markerPos(h);
              return (
                <span
                  key={`${h}-${isBase}`}
                  className="pointer-events-none absolute rounded-full border-[3px] border-white shadow-md dark:border-neutral-900"
                  style={{
                    left: pos.left,
                    top: pos.top,
                    width: isBase ? 26 : 18,
                    height: isBase ? 26 : 18,
                    marginLeft: isBase ? -13 : -9,
                    marginTop: isBase ? -13 : -9,
                    background: hex,
                  }}
                />
              );
            })}
          </div>
          <p className="mt-3 text-center text-xs text-neutral-500">
            {zh ? "拖动或用方向键微调" : "Drag, or nudge with arrow keys"}
          </p>
        </div>

        {/* ---------------- harmonies ---------------- */}
        <div>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(HARMONIES) as HarmonyKey[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setHarmony(key);
                  track("tool_action", { tool: "color-wheel", action: "harmony", harmony: key });
                }}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                  harmony === key
                    ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                    : "border border-neutral-300 text-neutral-600 hover:border-neutral-500 dark:border-neutral-700 dark:text-neutral-400"
                }`}
              >
                {zh ? HARMONIES[key].zh : HARMONIES[key].en}
              </button>
            ))}
          </div>
          <p className="mt-3 text-sm leading-6 text-neutral-600 dark:text-neutral-400">
            {zh ? HARMONIES[harmony].blurb.zh : HARMONIES[harmony].blurb.en}
          </p>

          <div className="mt-4 space-y-2">
            {swatches.map(({ h, hex, archive, isBase }) => (
              <div
                key={`${h}-${isBase}`}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-neutral-200 px-3 py-2.5 dark:border-neutral-800"
              >
                <span className="swatch-shadow h-9 w-9 shrink-0 rounded-lg" style={{ background: hex }} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="font-mono text-sm text-neutral-900 dark:text-neutral-100">{hex}</span>
                    <span className="text-xs text-neutral-500">{h}°</span>
                    {isBase && (
                      <span className="rounded bg-neutral-200 px-1.5 py-0.5 text-[10px] text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                        {zh ? "基色" : "base"}
                      </span>
                    )}
                  </div>
                  {archive && (
                    <div className="mt-0.5 text-xs text-neutral-500">
                      {zh ? "≈ " : "≈ "}
                      <Link
                        className="underline underline-offset-2"
                        href={`/colors/${archive.id}/`}
                        onClick={() => track("tool_action", { tool: "color-wheel", action: "archive-link" })}
                      >
                        {archive.name}
                      </Link>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => navigator.clipboard?.writeText(hex).catch(() => {})}
                  className="rounded-full border border-neutral-300 px-2.5 py-1 text-[11px] text-neutral-600 transition hover:border-neutral-500 dark:border-neutral-700 dark:text-neutral-400"
                >
                  {zh ? "复制" : "Copy"}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <Link
              href="/harmonies/"
              className="text-neutral-600 underline underline-offset-2 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
              onClick={() => track("tool_action", { tool: "color-wheel", action: "to-harmonies" })}
            >
              {zh ? "在和声计算器里展开 →" : "Open the harmonies calculator →"}
            </Link>
            <Link
              href={`/preview/?colors=${encodeURIComponent(swatches.map((s) => s.hex).join(","))}`}
              className="text-neutral-600 underline underline-offset-2 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
              onClick={() => track("tool_action", { tool: "color-wheel", action: "to-preview" })}
            >
              {zh ? "在 UI 里预览这组配色 →" : "Preview this palette on UI →"}
            </Link>
          </div>
        </div>
      </div>

      {/* ---------------- SEO content ---------------- */}
      <section className="mt-12 max-w-3xl space-y-4">
        <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
          {zh ? "读懂色轮" : "How to read the color wheel"}
        </h2>
        <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-400">
          {zh
            ? "本页色轮基于 HSL 色相环(RGB 光色模型,红 0° → 绿 120° → 蓝 240°)。传统绘画教学常用 RYB 颜料轮,两者的\"互补\"位置略有差异 —— 数字设计里按 RGB/HSL 轮取色即可。上半轮(红-黄)偏暖,下半轮(蓝-青)偏冷;和声关系只是起点,最终以实际界面里的对比度与层次为准。"
            : "This wheel is the HSL hue circle (the RGB light model: red 0° → green 120° → blue 240°). Traditional painting classes use the RYB pigment wheel, whose \"complements\" sit slightly differently — for digital design, the RGB/HSL wheel is the one to use. Reds through yellows read warm, blues through cyans read cool; harmony rules are starting points, and real contrast in a real interface has the final say."}
        </p>
      </section>
    </main>
  );
}
