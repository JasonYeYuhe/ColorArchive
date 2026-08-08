"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale } from "@/src/components/locale-provider";
import { FullscreenStage } from "@/src/components/screen-test/fullscreen-stage";
import { COLOR_SCREEN_PRESETS, normalizeHexInput } from "@/src/lib/screen-test";
import { track } from "@/src/lib/track";

/**
 * Fullscreen color screens: the "white screen / black screen" utility family.
 *
 * ?color= accepts a hex value or an archive color id (e.g. amber-pearl-muted).
 * PERF: the 5,446-color dataset must NEVER be imported statically here — that
 * exact mistake once shipped 1.38MB client chunks (commit 96ff99e). Archive ids
 * are resolved through a dynamic import that stays in a lazy-loaded chunk and
 * only fetches when the param isn't plain hex.
 */
export function ColorScreensPage() {
  const { locale } = useLocale();
  const zh = locale === "zh";
  const params = useSearchParams();

  const [current, setCurrent] = useState<{ hex: string; name: string } | null>(null);
  const [customHex, setCustomHex] = useState("");
  const [customError, setCustomError] = useState(false);

  /* Resolve ?color= once on mount: hex directly; otherwise archive id via lazy chunk. */
  useEffect(() => {
    const raw = params.get("color");
    if (!raw) return;
    const hex = normalizeHexInput(raw);
    if (hex) {
      setCurrent({ hex, name: hex.toUpperCase() });
      return;
    }
    let cancelled = false;
    import("@/src/data/colors").then((mod) => {
      if (cancelled) return;
      const match = mod.colorsById.get(raw.toLowerCase());
      if (match) setCurrent({ hex: match.hex, name: match.name });
    });
    return () => {
      cancelled = true;
    };
  }, [params]);

  const show = useCallback((hex: string, name: string) => {
    track("screen_test_selected", { subtest: "color-screens", color: hex });
    track("screen_test_fullscreen", { subtest: "color-screens" });
    setCurrent({ hex, name });
  }, []);

  const submitCustom = useCallback(() => {
    const hex = normalizeHexInput(customHex);
    if (!hex) {
      setCustomError(true);
      return;
    }
    setCustomError(false);
    show(hex, hex.toUpperCase());
  }, [customHex, show]);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-20 pt-8 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
        {zh ? "纯色全屏" : "Color Screens"}
      </h1>
      <p className="mt-3 text-sm leading-6 text-neutral-600 dark:text-neutral-400">
        {zh
          ? "一键把整块屏幕变成任意纯色。白屏可当补光灯或检查灰尘,黑屏看背光渗漏,红绿蓝找卡点,或者描图、测试相机白平衡 —— 点一下颜色即全屏,Esc / 双击退出。"
          : "Turn the whole screen into a single solid color. Use white as a fill light or to spot dust, black to check backlight bleed, red/green/blue to find stuck pixels — or for tracing and camera white-balance checks. Click a color to go fullscreen; Esc or double-tap exits."}
      </p>

      {/* preset grid */}
      <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4">
        {COLOR_SCREEN_PRESETS.map((c) => (
          <button
            key={c.hex}
            type="button"
            onClick={() => show(c.hex, c.name)}
            className="group overflow-hidden rounded-xl border border-neutral-200 text-left transition hover:border-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-600"
          >
            <div className="swatch-shadow h-16 w-full" style={{ background: c.hex }} />
            <div className="px-2.5 py-2 text-xs font-medium text-neutral-700 group-hover:underline dark:text-neutral-300">
              {c.name}
            </div>
          </button>
        ))}
      </div>

      {/* custom hex */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <label htmlFor="custom-hex" className="text-sm text-neutral-600 dark:text-neutral-400">
          {zh ? "自定义颜色:" : "Custom color:"}
        </label>
        <input
          id="custom-hex"
          value={customHex}
          onChange={(e) => {
            setCustomHex(e.target.value);
            setCustomError(false);
          }}
          onKeyDown={(e) => e.key === "Enter" && submitCustom()}
          placeholder="#1e90ff"
          spellCheck={false}
          className={`w-32 rounded-lg border bg-white px-3 py-1.5 font-mono text-sm text-neutral-900 outline-none transition focus:border-neutral-500 dark:bg-neutral-900 dark:text-neutral-100 ${customError ? "border-red-400" : "border-neutral-300 dark:border-neutral-700"}`}
        />
        <button
          type="button"
          onClick={submitCustom}
          className="rounded-full bg-neutral-900 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
        >
          {zh ? "全屏显示" : "Go fullscreen"}
        </button>
        {customError && (
          <span className="text-xs text-red-500">
            {zh ? "请输入有效的 hex 值,如 #1e90ff" : "Enter a valid hex value like #1e90ff"}
          </span>
        )}
      </div>
      <p className="mt-2 text-xs text-neutral-500">
        {zh ? (
          <>
            也支持档案色 id:比如{" "}
            <Link className="underline underline-offset-2" href="/screen-test/color-screens/?color=amber-pearl-muted">
              ?color=amber-pearl-muted
            </Link>
            。在 <Link className="underline underline-offset-2" href="/all-colors/">色彩档案</Link> 里找到你要的颜色。
          </>
        ) : (
          <>
            Archive color ids work too, e.g.{" "}
            <Link className="underline underline-offset-2" href="/screen-test/color-screens/?color=amber-pearl-muted">
              ?color=amber-pearl-muted
            </Link>
            . Find yours in the <Link className="underline underline-offset-2" href="/all-colors/">color archive</Link>.
          </>
        )}
      </p>

      {/* use cases — content depth for the query family */}
      <section className="mt-10 space-y-4">
        <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
          {zh ? "常见用途" : "Common uses"}
        </h2>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-6 text-neutral-600 dark:text-neutral-400">
          <li>{zh ? "白屏:视频通话补光、检查屏幕灰尘与划痕、验光箱替代。" : "White screen: fill light for video calls, spotting dust and scratches on the panel."}</li>
          <li>{zh ? "黑屏:检查背光渗漏与 OLED 纯黑表现,或让副屏\"熄灭\"。" : "Black screen: checking backlight bleed and OLED true-black, or visually \"turning off\" a second monitor."}</li>
          <li>{zh ? "红 / 绿 / 蓝:逐通道找卡点,检查子像素。" : "Red / green / blue: hunting stuck subpixels channel by channel."}</li>
          <li>{zh ? "暖光 / 冷光:临时氛围灯与摄影白平衡参照。" : "Warm / cool light: makeshift mood lighting and a white-balance reference for cameras."}</li>
          <li>{zh ? "任意颜色:配合灯箱描图,或在会议室投屏时当背景板。" : "Any color: tracing on a light box, or a clean backdrop when screen-sharing."}</li>
        </ul>
      </section>

      {/* cross-links */}
      <div className="mt-10 flex flex-wrap gap-3 text-sm">
        <Link
          href="/screen-test/"
          className="text-neutral-600 underline underline-offset-2 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
          onClick={() => track("screen_test_downstream_click", { target: "hub", from: "color-screens" })}
        >
          {zh ? "← 全部屏幕检测" : "← All screen tests"}
        </Link>
        <Link
          href="/screen-test/dead-pixel/"
          className="text-neutral-600 underline underline-offset-2 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
          onClick={() => track("screen_test_downstream_click", { target: "dead-pixel", from: "color-screens" })}
        >
          {zh ? "坏点检测 →" : "Dead pixel test →"}
        </Link>
      </div>

      <FullscreenStage
        active={current !== null}
        background={current?.hex ?? "#ffffff"}
        onExit={() => {
          track("screen_test_completed", { subtest: "color-screens" });
          setCurrent(null);
        }}
        hudText={current?.name}
      />
    </main>
  );
}
