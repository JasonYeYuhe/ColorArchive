"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { useLocale } from "@/src/components/locale-provider";
import { FullscreenStage } from "@/src/components/screen-test/fullscreen-stage";
import { DEAD_PIXEL_CYCLE } from "@/src/lib/screen-test";
import { track } from "@/src/lib/track";

/**
 * Dead / stuck pixel test. Manual (or slow, user-initiated) cycling through
 * fullscreen solid fields. There is deliberately NO rapid-flash "fixer" mode —
 * cut permanently for photosensitive-epilepsy safety (dev-plan-2026-07-20 §2.2).
 */
export function DeadPixelTestPage() {
  const { locale } = useLocale();
  const zh = locale === "zh";

  const [active, setActive] = useState(false);
  const [index, setIndex] = useState(0);
  const [visited, setVisited] = useState(1);

  const start = useCallback(() => {
    track("screen_test_selected", { subtest: "dead-pixel", surface: "page" });
    track("screen_test_fullscreen", { subtest: "dead-pixel" });
    setIndex(0);
    setVisited(1);
    setActive(true);
  }, []);

  const advance = useCallback((dir: 1 | -1) => {
    setIndex((i) => {
      const n = DEAD_PIXEL_CYCLE.length;
      const next = (i + dir + n) % n;
      return next;
    });
    setVisited((v) => Math.min(v + 1, DEAD_PIXEL_CYCLE.length));
  }, []);

  const exit = useCallback(() => {
    // "Completed" = the user cycled through at least the five classic fields.
    if (visited >= 5) {
      track("screen_test_completed", { subtest: "dead-pixel", fields_seen: visited });
    }
    setActive(false);
  }, [visited]);

  const current = DEAD_PIXEL_CYCLE[index];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-20 pt-8 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
        {zh ? "坏点检测" : "Dead Pixel Test"}
      </h1>
      <p className="mt-3 text-sm leading-6 text-neutral-600 dark:text-neutral-400">
        {zh
          ? "全屏显示一组纯色,在每种颜色下仔细扫视整块屏幕:任何始终保持黑色的点是坏点(dead pixel),始终亮着某种颜色的点是亮点/卡点(stuck pixel)。测试完全在本地运行。"
          : "This shows a sequence of fullscreen solid colors. On each color, scan the whole panel slowly: a dot that stays black on every color is a dead pixel; one stuck glowing a single color is a stuck pixel. Runs entirely on your device."}
      </p>

      <div className="mt-6 rounded-2xl border border-neutral-200 bg-white/70 p-5 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/70">
        <ol className="list-decimal space-y-1.5 pl-5 text-sm text-neutral-700 dark:text-neutral-300">
          <li>{zh ? "先用干燥的超细纤维布清洁屏幕 —— 灰尘最像坏点。" : "Clean the screen with a dry microfiber cloth first — dust impersonates dead pixels."}</li>
          <li>{zh ? "点击开始,屏幕会全屏变为纯色。" : "Click start; the screen fills with a solid color."}</li>
          <li>{zh ? "点按 / 按 → 切换颜色(白、黑、红、绿、蓝……),每种颜色下扫视全屏。" : "Tap / press → to cycle colors (white, black, red, green, blue…), scanning the panel on each."}</li>
          <li>{zh ? "按 Esc 或双击退出。" : "Press Esc or double-tap to exit."}</li>
        </ol>
        <button
          type="button"
          onClick={start}
          className="mt-4 rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
        >
          {zh ? "开始测试(全屏)" : "Start test (fullscreen)"}
        </button>
      </div>

      {/* what did you find */}
      <section className="mt-10 space-y-5">
        <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
          {zh ? "发现了什么?" : "Found something?"}
        </h2>
        <div>
          <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
            {zh ? "坏点(所有颜色下都是黑的)" : "Dead pixel (black on every color)"}
          </h3>
          <p className="mt-1 text-sm leading-6 text-neutral-600 dark:text-neutral-400">
            {zh
              ? "像素的晶体管已失效,软件无法修复。查一下你的显示器质保 —— 多数厂商对坏点数量有明确的更换标准(ISO 9241-307 分级)。"
              : "The pixel's transistor has failed; no software can revive it. Check your monitor's warranty — most manufacturers publish an ISO 9241-307 class defining how many dead pixels qualify for replacement."}
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
            {zh ? "亮点 / 卡点(始终亮某一种颜色)" : "Stuck pixel (glowing one color)"}
          </h3>
          <p className="mt-1 text-sm leading-6 text-neutral-600 dark:text-neutral-400">
            {zh
              ? "子像素卡在常开状态。有时会随时间自行恢复。我们不提供\"快速闪色修复\"功能:其有效性缺乏证据,且快速闪烁对光敏人群有癫痫风险 —— 如果确实想尝试,请了解相关风险后自行选择工具。"
              : "A subpixel stuck on. It sometimes recovers on its own over time. We deliberately don't offer a rapid-flashing \"fixer\": evidence that flashing works is weak, and rapid flashing is a photosensitive-epilepsy risk — if you want to try one anyway, understand that risk before choosing a tool."}
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
            {zh ? "只是灰尘" : "Just dust"}
          </h3>
          <p className="mt-1 text-sm leading-6 text-neutral-600 dark:text-neutral-400">
            {zh
              ? "如果那个\"点\"在深色背景下消失、浅色背景下出现,而且位置随擦拭改变 —— 那是灰尘。"
              : "If the \"pixel\" disappears on dark fields, shows on light ones, and moves when wiped — it's dust."}
          </p>
        </div>
      </section>

      {/* cross-links */}
      <div className="mt-10 flex flex-wrap gap-3 text-sm">
        <Link
          href="/screen-test/"
          className="text-neutral-600 underline underline-offset-2 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
          onClick={() => track("screen_test_downstream_click", { target: "hub", from: "dead-pixel" })}
        >
          {zh ? "← 全部屏幕检测" : "← All screen tests"}
        </Link>
        <Link
          href="/screen-test/color-screens/"
          className="text-neutral-600 underline underline-offset-2 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
          onClick={() => track("screen_test_downstream_click", { target: "color-screens", from: "dead-pixel" })}
        >
          {zh ? "纯色全屏工具 →" : "Color screens tool →"}
        </Link>
      </div>

      <FullscreenStage
        active={active}
        background={current.hex}
        onExit={exit}
        onAdvance={advance}
        hudText={`${current.name} (${index + 1}/${DEAD_PIXEL_CYCLE.length})`}
      />
    </main>
  );
}
