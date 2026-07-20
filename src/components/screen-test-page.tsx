"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale } from "@/src/components/locale-provider";
import { FullscreenStage } from "@/src/components/screen-test/fullscreen-stage";
import {
  detectScreenFacts,
  grayLevel,
  NEAR_BLACK_STEPS,
  NEAR_WHITE_STEPS,
  REACTIVE_SCREEN_QUERIES,
  UNIFORMITY_LEVELS,
  type ScreenFacts,
} from "@/src/lib/screen-test";
import { track } from "@/src/lib/track";

/* ------------------------------------------------------------------ */
/*  Long-form prep guide (component-local; too long for i18n.ts keys)  */
/* ------------------------------------------------------------------ */

const GUIDE = {
  en: {
    title: "How to run a meaningful screen test",
    sections: [
      {
        h: "Prepare the room",
        p: "Ambient light changes what your eyes can distinguish far more than most people expect. For black-level and uniformity checks, dim the room and avoid light sources behind or beside the display — a lamp reflecting off the panel will mask both backlight bleed and shadow detail. For general color checks, neutral indirect daylight is the most honest environment; avoid strongly colored walls or RGB bias lighting while testing.",
      },
      {
        h: "Warm up the display",
        p: "LCD backlights and OLED panels shift slightly in brightness and tint during their first minutes of operation. If you are inspecting uniformity or faint shadow steps, let the screen run for 15–20 minutes first. Laptops on battery may also silently reduce brightness or refresh rate — plug in before testing.",
      },
      {
        h: "Turn off automatic adjustments",
        p: "Night Shift, True Tone, f.lux, auto-brightness, battery saver and \"eye comfort\" modes all rewrite the colors this page asks your screen to show. Disable them for the duration of the test, then re-enable them afterwards. On Windows, HDR mode and Night Light interact — if the report above shows HDR capability, test once with HDR on and once off.",
      },
      {
        h: "Use native resolution and 100% zoom",
        p: "Fine test patterns are only meaningful when one pattern pixel maps cleanly onto device pixels. Set the OS to the display's native resolution and your browser zoom to 100% (Cmd/Ctrl+0). If the report above shows a fractional device-pixel-ratio, zoom or OS scaling may be active and fine patterns may look softer than the panel really is.",
      },
      {
        h: "Clean the screen first",
        p: "A surprising number of \"dead pixels\" are dust. Wipe the panel with a dry microfiber cloth before hunting for defects — especially before the solid-color pixel check, where a dark speck on white looks exactly like a dead pixel.",
      },
      {
        h: "What this page can and cannot tell you",
        p: "Everything here is a visual check running inside your browser: it can reveal defects (dead pixels, backlight bleed, banding, crushed shadows) and report what the browser says about the display. It cannot measure color accuracy, set gamma, or calibrate anything — real calibration requires a hardware colorimeter that reads light from the panel. Treat results as observations you made, not scores the tool assigned.",
      },
    ],
  },
  zh: {
    title: "如何做一次有意义的屏幕检测",
    sections: [
      {
        h: "准备环境",
        p: "环境光对肉眼分辨能力的影响远超预期。做黑位与均匀性检查时,请调暗房间,避免屏幕背后或侧面的光源——面板上的反光会同时掩盖背光渗漏和暗部细节。做一般颜色检查时,中性的间接自然光最诚实;测试期间避免彩色墙面或 RGB 氛围灯。",
      },
      {
        h: "让屏幕预热",
        p: "LCD 背光和 OLED 面板在开机头几分钟内亮度和色调会轻微漂移。若要检查均匀性或极暗的阶梯,先让屏幕运行 15–20 分钟。用电池的笔记本可能会悄悄降低亮度或刷新率——测试前请接上电源。",
      },
      {
        h: "关闭自动调节",
        p: "夜览、原彩显示、f.lux、自动亮度、省电与护眼模式都会改写本页要求屏幕显示的颜色。测试期间请暂时关闭,结束后再恢复。Windows 上 HDR 与夜间模式会相互影响——若上方报告显示支持 HDR,建议开、关各测一次。",
      },
      {
        h: "使用原生分辨率与 100% 缩放",
        p: "精细测试图案只有在图案像素与设备像素一一对应时才有意义。请把系统设为显示器原生分辨率,浏览器缩放设为 100%(Cmd/Ctrl+0)。若上方报告显示 device-pixel-ratio 为小数,说明可能处于缩放状态,精细图案会显得比面板实际更模糊。",
      },
      {
        h: "先清洁屏幕",
        p: "相当一部分\"坏点\"其实是灰尘。找坏点前先用干燥的超细纤维布擦拭面板——尤其是纯色检查:白底上的一粒深色灰尘看起来和坏点一模一样。",
      },
      {
        h: "本页能告诉你什么、不能告诉你什么",
        p: "这里的一切都是在浏览器内运行的视觉检查:它能暴露缺陷(坏点、背光渗漏、色带、暗部丢失),并报告浏览器所声称的显示器信息。它无法测量色准、设置 gamma,也无法校准任何东西——真正的校准需要读取面板发光的硬件色度计。请把结果当作你自己做出的观察,而不是工具打出的分数。",
      },
    ],
  },
};

/* ------------------------------------------------------------------ */

type StageKind = null | "black-level" | "white-saturation" | "uniformity";

export function ScreenTestPage() {
  const { locale, t } = useLocale();
  const guide = GUIDE[locale === "zh" ? "zh" : "en"];

  const [facts, setFacts] = useState<ScreenFacts | null>(null);
  const [stage, setStage] = useState<StageKind>(null);
  const [uniformityIndex, setUniformityIndex] = useState(0);
  const [blackReport, setBlackReport] = useState<number | null>(null);
  const [whiteReport, setWhiteReport] = useState<number | null>(null);

  /* Screen facts — initial + reactive (multi-monitor drags, mode switches). */
  useEffect(() => {
    setFacts(detectScreenFacts());
    const refresh = () => setFacts(detectScreenFacts());
    const lists = REACTIVE_SCREEN_QUERIES.map((q) => {
      const mql = window.matchMedia(q);
      mql.addEventListener("change", refresh);
      return mql;
    });
    window.addEventListener("resize", refresh);
    return () => {
      lists.forEach((mql) => mql.removeEventListener("change", refresh));
      window.removeEventListener("resize", refresh);
    };
  }, []);

  const startStage = useCallback((kind: Exclude<StageKind, null>) => {
    track("screen_test_selected", { subtest: kind });
    track("screen_test_fullscreen", { subtest: kind });
    setUniformityIndex(0);
    setStage(kind);
  }, []);

  const endStage = useCallback(() => setStage(null), []);

  const advanceUniformity = useCallback((dir: 1 | -1) => {
    setUniformityIndex((i) => {
      const next = i + dir;
      if (next < 0) return UNIFORMITY_LEVELS.length - 1;
      if (next >= UNIFORMITY_LEVELS.length) return 0;
      return next;
    });
  }, []);

  const gamutLabel = useMemo(() => {
    if (!facts) return "…";
    if (facts.colorGamut === "rec2020") return "Rec. 2020 (wide)";
    if (facts.colorGamut === "p3") return "Display P3 (wide)";
    if (facts.colorGamut === "srgb") return "sRGB (standard)";
    return locale === "zh" ? "未报告" : "Not reported";
  }, [facts, locale]);

  const zh = locale === "zh";

  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-20 pt-8 sm:px-6">
      {/* -------- intro -------- */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          {zh ? "屏幕检测" : "Screen Test"}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600 dark:text-neutral-400">
          {zh
            ? "在浏览器里检查你的显示器:坏点、背光渗漏、暗部与高光细节,以及浏览器报告的屏幕能力。所有检查都在本地运行,不上传任何数据。"
            : "Check your display right in the browser: dead pixels, backlight bleed, shadow and highlight detail, plus what your browser reports about the screen. Everything runs locally — nothing is uploaded."}
        </p>
        <p className="mt-2 max-w-2xl text-xs leading-5 text-neutral-500 dark:text-neutral-500">
          {zh
            ? "这是视觉检查,不是校准。硬件校准需要色度计。"
            : "This is a visual check, not calibration. Hardware calibration requires a colorimeter."}
        </p>
      </div>

      {/* -------- forced-colors warning -------- */}
      {facts && (facts.forcedColors || facts.prefersMoreContrast) && (
        <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
          {zh
            ? "检测到系统级对比度/强制颜色模式已开启 —— 操作系统正在改写页面颜色,以下所有测试结果都不可信。请先临时关闭该模式再测试。"
            : "An OS-level contrast / forced-colors mode is active — your operating system is rewriting the colors on this page, which invalidates every test below. Temporarily disable it before testing."}
        </div>
      )}

      {/* -------- screen report (facts only) -------- */}
      <section className="mb-10 rounded-2xl border border-neutral-200 bg-white/70 p-5 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/70">
        <div className="mb-1 flex items-baseline justify-between gap-4">
          <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
            {zh ? "屏幕报告" : "Screen Report"}
          </h2>
          <span className="text-[11px] text-neutral-500">
            {zh ? "由你的浏览器报告 —— 非实测值" : "As reported by your browser — not measured"}
          </span>
        </div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 pt-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-xs text-neutral-500">{zh ? "分辨率" : "Resolution"}</dt>
            <dd className="mt-0.5 font-medium text-neutral-900 dark:text-neutral-100">
              {facts?.resolution ?? "…"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-neutral-500">Device pixel ratio</dt>
            <dd className="mt-0.5 font-medium text-neutral-900 dark:text-neutral-100">
              {facts ? facts.devicePixelRatio : "…"}
              {facts?.fractionalDpr && (
                <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                  {zh ? "可能处于缩放状态" : "zoom/scaling may be active"}
                </span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-neutral-500">{zh ? "色域(能力)" : "Color gamut (capability)"}</dt>
            <dd className="mt-0.5 font-medium text-neutral-900 dark:text-neutral-100">{gamutLabel}</dd>
          </div>
          <div>
            <dt className="text-xs text-neutral-500">HDR</dt>
            <dd className="mt-0.5 font-medium text-neutral-900 dark:text-neutral-100">
              {facts
                ? facts.hdrCapable
                  ? zh
                    ? "支持 HDR 内容"
                    : "HDR-capable"
                  : zh
                    ? "标准动态范围"
                    : "Standard dynamic range"
                : "…"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-neutral-500">{zh ? "颜色深度(名义)" : "Color depth (nominal)"}</dt>
            <dd className="mt-0.5 font-medium text-neutral-900 dark:text-neutral-100">
              {facts ? `${facts.colorDepth}-bit` : "…"}
              <span className="ml-2 text-[10px] text-neutral-400">
                {zh ? "浏览器可能固定报告 24" : "browsers may always report 24"}
              </span>
            </dd>
          </div>
        </dl>
      </section>

      {/* -------- test launchers -------- */}
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-medium text-neutral-900 dark:text-neutral-100">
          {zh ? "检测项目" : "Tests"}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {/* dedicated routes */}
          <Link
            href="/screen-test/dead-pixel/"
            className="group rounded-2xl border border-neutral-200 bg-white/70 p-5 backdrop-blur transition hover:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-900/70 dark:hover:border-neutral-600"
            onClick={() => track("screen_test_selected", { subtest: "dead-pixel", surface: "hub" })}
          >
            <div className="text-base font-medium text-neutral-900 group-hover:underline dark:text-neutral-100">
              {zh ? "坏点检测" : "Dead Pixel Test"} →
            </div>
            <p className="mt-1.5 text-sm text-neutral-600 dark:text-neutral-400">
              {zh
                ? "全屏纯色循环,找出常亮或不亮的像素。"
                : "Cycle fullscreen solid colors to spot stuck or dead pixels."}
            </p>
          </Link>
          <Link
            href="/screen-test/color-screens/"
            className="group rounded-2xl border border-neutral-200 bg-white/70 p-5 backdrop-blur transition hover:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-900/70 dark:hover:border-neutral-600"
            onClick={() => track("screen_test_selected", { subtest: "color-screens", surface: "hub" })}
          >
            <div className="text-base font-medium text-neutral-900 group-hover:underline dark:text-neutral-100">
              {zh ? "纯色全屏" : "Color Screens"} →
            </div>
            <p className="mt-1.5 text-sm text-neutral-600 dark:text-neutral-400">
              {zh
                ? "白屏、黑屏或任意颜色全屏 —— 清洁、打光、描图都好用。"
                : "Fullscreen white, black, or any color — for cleaning, lighting, or tracing."}
            </p>
          </Link>

          {/* in-page stages */}
          <button
            type="button"
            onClick={() => startStage("black-level")}
            className="rounded-2xl border border-neutral-200 bg-white/70 p-5 text-left backdrop-blur transition hover:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-900/70 dark:hover:border-neutral-600"
          >
            <div className="text-base font-medium text-neutral-900 dark:text-neutral-100">
              {zh ? "黑位 / 暗部细节" : "Black Level / Shadow Detail"}
            </div>
            <p className="mt-1.5 text-sm text-neutral-600 dark:text-neutral-400">
              {zh
                ? "全黑背景上的近黑阶梯 —— 你能分辨到第几阶?"
                : "A near-black step wedge on pure black — how low can you distinguish?"}
            </p>
            {blackReport !== null && (
              <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-400">
                {zh
                  ? `你报告能看到 RGB ${blackReport} 阶`
                  : `You reported seeing step RGB ${blackReport}`}
              </p>
            )}
          </button>
          <button
            type="button"
            onClick={() => startStage("white-saturation")}
            className="rounded-2xl border border-neutral-200 bg-white/70 p-5 text-left backdrop-blur transition hover:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-900/70 dark:hover:border-neutral-600"
          >
            <div className="text-base font-medium text-neutral-900 dark:text-neutral-100">
              {zh ? "白位 / 高光细节" : "White Saturation / Highlight Detail"}
            </div>
            <p className="mt-1.5 text-sm text-neutral-600 dark:text-neutral-400">
              {zh
                ? "全白背景上的近白阶梯 —— 高光有没有被裁掉?"
                : "A near-white step wedge on pure white — are highlights clipping?"}
            </p>
            {whiteReport !== null && (
              <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-400">
                {zh
                  ? `你报告能看到 RGB ${whiteReport} 阶`
                  : `You reported seeing step RGB ${whiteReport}`}
              </p>
            )}
          </button>
          <button
            type="button"
            onClick={() => startStage("uniformity")}
            className="rounded-2xl border border-neutral-200 bg-white/70 p-5 text-left backdrop-blur transition hover:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-900/70 dark:hover:border-neutral-600"
          >
            <div className="text-base font-medium text-neutral-900 dark:text-neutral-100">
              {zh ? "均匀性 / 背光渗漏" : "Uniformity / Backlight Bleed"}
            </div>
            <p className="mt-1.5 text-sm text-neutral-600 dark:text-neutral-400">
              {zh
                ? "纯黑与灰场全屏 —— 找云斑、渗漏与偏色。轻微移动头部可区分渗漏(固定)与 IPS 眩光(随视角移动)。"
                : "Fullscreen black and gray fields — look for clouding, bleed, and tint. Shift your head slightly: bleed stays put, IPS glow moves with your viewing angle."}
            </p>
          </button>
          <a
            href="https://www.testufo.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-2xl border border-dashed border-neutral-300 bg-transparent p-5 text-left transition hover:border-neutral-400 dark:border-neutral-700"
            onClick={() => track("screen_test_downstream_click", { target: "testufo" })}
          >
            <div className="text-base font-medium text-neutral-900 dark:text-neutral-100">
              {zh ? "动态 / 响应时间 ↗" : "Motion / Response Time ↗"}
            </div>
            <p className="mt-1.5 text-sm text-neutral-600 dark:text-neutral-400">
              {zh
                ? "动态测试我们推荐 Blur Busters 的 TestUFO —— 那是他们的专长。"
                : "For motion testing we recommend Blur Busters' TestUFO — it's what they do best."}
            </p>
          </a>
        </div>
      </section>

      {/* -------- step reports -------- */}
      {(blackReport !== null || whiteReport !== null) && (
        <section className="mb-10 rounded-2xl border border-neutral-200 bg-white/70 p-5 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/70">
          <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
            {zh ? "你的观察" : "Your observations"}
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
            {blackReport !== null && (
              <li>
                {zh
                  ? `暗部:你报告能分辨到 RGB ${blackReport}。${blackReport <= 4 ? "暗部细节保留得很好。" : "较暗的阶不可见 —— 可尝试降低对比度或检查显示器的黑位设置。"}`
                  : `Shadows: you reported distinguishing down to RGB ${blackReport}. ${blackReport <= 4 ? "Shadow detail is well preserved." : "Darker steps were invisible — try lowering contrast or checking the monitor's black-level setting."}`}
              </li>
            )}
            {whiteReport !== null && (
              <li>
                {zh
                  ? `高光:你报告能分辨到 RGB ${whiteReport}。${whiteReport >= 250 ? "高光细节保留得很好。" : "较亮的阶不可见 —— 亮度或对比度可能设得过高。"}`
                  : `Highlights: you reported distinguishing up to RGB ${whiteReport}. ${whiteReport >= 250 ? "Highlight detail is well preserved." : "Brighter steps were invisible — brightness or contrast may be set too high."}`}
              </li>
            )}
          </ul>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <Link
              href="/contrast/"
              className="text-neutral-600 underline underline-offset-2 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
              onClick={() => track("screen_test_downstream_click", { target: "contrast" })}
            >
              {zh ? "顺便查一下配色对比度 →" : "Check your palette's contrast next →"}
            </Link>
            <Link
              href="/colors/"
              className="text-neutral-600 underline underline-offset-2 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
              onClick={() => track("screen_test_downstream_click", { target: "archive" })}
            >
              {zh ? "浏览 5,446 个命名颜色 →" : "Browse 5,446 named colors →"}
            </Link>
          </div>
        </section>
      )}

      {/* -------- prep guide (long-form content) -------- */}
      <section className="prose-sm mb-6 max-w-3xl">
        <h2 className="mb-4 text-lg font-medium text-neutral-900 dark:text-neutral-100">{guide.title}</h2>
        <div className="space-y-5">
          {guide.sections.map((s) => (
            <div key={s.h}>
              <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{s.h}</h3>
              <p className="mt-1 text-sm leading-6 text-neutral-600 dark:text-neutral-400">{s.p}</p>
            </div>
          ))}
        </div>
      </section>

      {/* -------- fullscreen stages -------- */}
      <FullscreenStage
        active={stage === "black-level"}
        background="#000000"
        onExit={endStage}
        hudText={zh ? "黑位测试" : "Black level"}
      >
        <div className="flex h-full w-full items-center justify-center">
          <div className="flex gap-3">
            {NEAR_BLACK_STEPS.map((v) => (
              <button
                key={v}
                type="button"
                className="flex h-24 w-14 flex-col items-center justify-end rounded-sm pb-1 sm:h-32 sm:w-16"
                style={{ background: grayLevel(v) }}
                onClick={(e) => {
                  e.stopPropagation();
                  setBlackReport(v);
                  track("screen_test_completed", { subtest: "black-level", step: v });
                  endStage();
                }}
              >
                <span className="text-[10px]" style={{ color: "rgb(70, 70, 70)" }}>
                  {v}
                </span>
              </button>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-8 text-center text-xs" style={{ color: "rgb(90, 90, 90)" }}>
            {zh ? "点按你能看清的最暗一格" : "Tap the darkest square you can still see"}
          </div>
        </div>
      </FullscreenStage>

      <FullscreenStage
        active={stage === "white-saturation"}
        background="#ffffff"
        onExit={endStage}
        hudText={zh ? "白位测试" : "White saturation"}
      >
        <div className="flex h-full w-full items-center justify-center">
          <div className="flex gap-3">
            {NEAR_WHITE_STEPS.map((v) => (
              <button
                key={v}
                type="button"
                className="flex h-24 w-14 flex-col items-center justify-end rounded-sm pb-1 sm:h-32 sm:w-16"
                style={{ background: grayLevel(v) }}
                onClick={(e) => {
                  e.stopPropagation();
                  setWhiteReport(v);
                  track("screen_test_completed", { subtest: "white-saturation", step: v });
                  endStage();
                }}
              >
                <span className="text-[10px]" style={{ color: "rgb(185, 185, 185)" }}>
                  {v}
                </span>
              </button>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-8 text-center text-xs" style={{ color: "rgb(160, 160, 160)" }}>
            {zh ? "点按你能看清的最亮一格" : "Tap the brightest square you can still see"}
          </div>
        </div>
      </FullscreenStage>

      <FullscreenStage
        active={stage === "uniformity"}
        background={UNIFORMITY_LEVELS[uniformityIndex].hex}
        onExit={() => {
          track("screen_test_completed", { subtest: "uniformity" });
          endStage();
        }}
        onAdvance={advanceUniformity}
        hudText={UNIFORMITY_LEVELS[uniformityIndex].name}
      />
    </main>
  );
}
