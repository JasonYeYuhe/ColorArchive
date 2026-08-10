"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FullscreenStage } from "@/src/components/screen-test/fullscreen-stage";
import { GammaStage, BandingStage } from "@/src/components/screen-test/canvas-stages";
import { DistanceStage, type DistanceOutcome } from "@/src/components/screen-test/archive-stages";
import { WedgeStage } from "@/src/components/screen-test/wedge-stages";
import {
  encodeWizardResult,
  parseWizardResult,
  UNIFORMITY_LEVELS,
  type ScreenFacts,
  type WizardResult,
} from "@/src/lib/screen-test";
import { track } from "@/src/lib/track";

/** Read a shared wizard result from the URL hash ("#st=v1.b4…"), if present. */
export function readWizardHash(): WizardResult | null {
  if (typeof window === "undefined") return null;
  const m = /^#st=([A-Za-z0-9.\-]+)$/.exec(window.location.hash);
  return m ? parseWizardResult(m[1]) : null;
}

/* ---------------- uniformity with in-stage verdict ---------------- */

function WizardUniformityStage({
  active,
  onExit,
  onAnswer,
  zh,
}: {
  active: boolean;
  onExit: () => void;
  onAnswer: (even: boolean) => void;
  zh: boolean;
}) {
  const [index, setIndex] = useState(0);
  const advance = useCallback((dir: 1 | -1) => {
    setIndex((i) => (i + dir + UNIFORMITY_LEVELS.length) % UNIFORMITY_LEVELS.length);
  }, []);
  const level = UNIFORMITY_LEVELS[index];
  return (
    <FullscreenStage
      active={active}
      background={level.hex}
      onExit={onExit}
      onAdvance={advance}
      hudText={`${level.name} (${index + 1}/${UNIFORMITY_LEVELS.length})`}
    >
      <div className="absolute inset-x-0 bottom-8 flex flex-col items-center gap-3">
        <p className="pointer-events-none px-4 text-center text-xs" style={{ color: "rgb(150,150,150)" }}>
          {zh ? "轮流看完三个灰场:亮度均匀吗?有云斑或漏光吗?" : "Cycle all three fields: does brightness look even? Any clouding or bleed?"}
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            className="rounded-full bg-white/15 px-5 py-1.5 text-xs text-white backdrop-blur-sm hover:bg-white/25"
            onClick={(e) => {
              e.stopPropagation();
              onAnswer(true);
            }}
          >
            {zh ? "看起来均匀" : "Looks even"}
          </button>
          <button
            type="button"
            className="rounded-full bg-white/15 px-5 py-1.5 text-xs text-white backdrop-blur-sm hover:bg-white/25"
            onClick={(e) => {
              e.stopPropagation();
              onAnswer(false);
            }}
          >
            {zh ? "有云斑 / 漏光" : "I see clouding / bleed"}
          </button>
        </div>
      </div>
    </FullscreenStage>
  );
}

/* ---------------- result card rendering ---------------- */

const CARD_ACCENTS = ["#c94f4f", "#d99a3e", "#8fb85a", "#4fa98f", "#5a86c2", "#9a6bb5"];

function drawResultCard(
  canvas: HTMLCanvasElement,
  facts: ScreenFacts | null,
  result: WizardResult,
  zh: boolean,
) {
  const W = 1200;
  const H = 630;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.fillStyle = "#0f1013";
  ctx.fillRect(0, 0, W, H);
  // Archive accent strip
  CARD_ACCENTS.forEach((hex, i) => {
    ctx.fillStyle = hex;
    ctx.fillRect((W / CARD_ACCENTS.length) * i, 0, W / CARD_ACCENTS.length + 1, 10);
  });

  ctx.fillStyle = "#f5f5f4";
  ctx.font = "600 52px system-ui, -apple-system, sans-serif";
  ctx.fillText(zh ? "屏幕检测报告" : "Screen Test Report", 64, 110);
  ctx.fillStyle = "#8a8a8a";
  ctx.font = "26px system-ui, -apple-system, sans-serif";
  ctx.fillText("colorarchive.org/screen-test", 64, 152);

  const lines: Array<[string, string]> = [];
  if (facts) {
    lines.push([zh ? "屏幕" : "Display", `${facts.resolution} @ ${facts.devicePixelRatio}x · ${facts.colorGamut.toUpperCase()}${facts.hdrCapable ? " · HDR-capable" : ""}`]);
  }
  if (result.black !== undefined)
    lines.push([zh ? "暗部" : "Shadows", zh ? `可分辨至 RGB ${result.black}` : `distinguished down to RGB ${result.black}`]);
  if (result.white !== undefined)
    lines.push([zh ? "高光" : "Highlights", zh ? `可分辨至 RGB ${result.white}` : `distinguished up to RGB ${result.white}`]);
  if (result.uniformityOk !== undefined)
    lines.push([
      zh ? "均匀性" : "Uniformity",
      result.uniformityOk ? (zh ? "报告均匀" : "reported even") : zh ? "报告有云斑/漏光" : "clouding / bleed reported",
    ]);
  if (result.gamma !== undefined)
    lines.push([zh ? "Gamma" : "Gamma", zh ? `最接近 ${result.gamma.toFixed(1)}(视觉检查)` : `closest to ${result.gamma.toFixed(1)} (visual check)`]);
  if (result.bandingSmooth !== undefined)
    lines.push([
      zh ? "渐变" : "Gradients",
      result.bandingSmooth ? (zh ? "报告平滑" : "reported smooth") : zh ? "报告可见阶梯" : "visible steps reported",
    ]);
  if (result.distanceSeen !== undefined && result.distanceTotal !== undefined)
    lines.push([
      zh ? "档案色分辨" : "Archive pairs",
      zh
        ? `${result.distanceSeen}/${result.distanceTotal} 组近似色可分辨`
        : `${result.distanceSeen}/${result.distanceTotal} near-identical pairs separated`,
    ]);

  let y = 236;
  for (const [label, value] of lines) {
    ctx.fillStyle = "#6f6f6f";
    ctx.font = "500 26px system-ui, -apple-system, sans-serif";
    ctx.fillText(label, 64, y);
    ctx.fillStyle = "#e7e5e4";
    ctx.font = "30px system-ui, -apple-system, sans-serif";
    ctx.fillText(value, 320, y);
    y += 56;
  }

  ctx.fillStyle = "#5c5c5c";
  ctx.font = "22px system-ui, -apple-system, sans-serif";
  ctx.fillText(
    zh ? "视觉自检 · 非硬件校准 —— colorarchive.org" : "Visual self-check · not hardware calibration — colorarchive.org",
    64,
    H - 48,
  );
}

/* ---------------- the wizard ---------------- */

type WizardStep = "idle" | "black" | "white" | "uniformity" | "gamma" | "banding" | "distance" | "done";

interface ScreenTestWizardProps {
  zh: boolean;
  facts: ScreenFacts | null;
  /** Lets the hub mirror wizard captures into its own observation cards. */
  onComplete?: (result: WizardResult, missed: Array<{ a: string; b: string }>) => void;
}

export function ScreenTestWizard({ zh, facts, onComplete }: ScreenTestWizardProps) {
  const [step, setStep] = useState<WizardStep>("idle");
  const [result, setResult] = useState<WizardResult>({});
  const [missed, setMissed] = useState<Array<{ a: string; b: string }>>([]);
  const [shared, setShared] = useState<WizardResult | null>(null);
  const cardRef = useRef<HTMLCanvasElement | null>(null);
  const [canShareFiles, setCanShareFiles] = useState(false);

  /* Shared-result view (hash) — read once on mount. */
  useEffect(() => {
    setShared(readWizardHash());
  }, []);

  /* Render the card whenever the wizard completes. */
  useEffect(() => {
    if (step === "done" && cardRef.current) {
      drawResultCard(cardRef.current, facts, result, zh);
      if (typeof navigator !== "undefined" && "canShare" in navigator) {
        try {
          const probe = new File([""], "probe.png", { type: "image/png" });
          setCanShareFiles(navigator.canShare({ files: [probe] }));
        } catch {
          setCanShareFiles(false);
        }
      }
    }
  }, [step, facts, result, zh]);

  const start = useCallback(() => {
    track("screen_test_selected", { subtest: "wizard" });
    track("screen_test_fullscreen", { subtest: "wizard" });
    // Drop any stale shared-result hash so an abandoned run can't re-share old data.
    if (window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname);
    }
    setResult({});
    setMissed([]);
    setStep("black");
  }, []);

  const abort = useCallback(() => {
    // User exited a stage without answering — abandon (funnel signal), keep partials.
    track("screen_test_abandoned", { subtest: "wizard" });
    setStep("idle");
  }, []);

  const finish = useCallback(
    (final: WizardResult) => {
      setStep("done");
      track("screen_test_completed", { subtest: "wizard" });
      // Shareable state lives in the hash — never a crawlable query variant.
      window.history.replaceState(null, "", `#st=${encodeWizardResult(final)}`);
    },
    [],
  );

  const download = useCallback(() => {
    cardRef.current?.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "colorarchive-screen-test.png";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    });
    track("screen_test_downstream_click", { target: "card-download" });
  }, []);

  const share = useCallback(() => {
    cardRef.current?.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], "colorarchive-screen-test.png", { type: "image/png" });
      try {
        await navigator.share({ files: [file], title: "Screen Test Report", url: window.location.href });
        track("screen_test_downstream_click", { target: "card-share" });
      } catch {
        // User cancelled the share sheet — fine.
      }
    });
  }, []);

  /* ---------------- shared-result banner ---------------- */
  if (shared && step === "idle") {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white/70 p-5 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/70">
        <h3 className="text-base font-medium text-neutral-900 dark:text-neutral-100">
          {zh ? "查看分享的检测结果" : "Viewing a shared test result"}
        </h3>
        <ul className="mt-2 space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
          {shared.black !== undefined && <li>{zh ? `暗部:RGB ${shared.black}` : `Shadows: down to RGB ${shared.black}`}</li>}
          {shared.white !== undefined && <li>{zh ? `高光:RGB ${shared.white}` : `Highlights: up to RGB ${shared.white}`}</li>}
          {shared.uniformityOk !== undefined && (
            <li>{zh ? `均匀性:${shared.uniformityOk ? "均匀" : "有云斑/漏光"}` : `Uniformity: ${shared.uniformityOk ? "even" : "clouding/bleed"}`}</li>
          )}
          {shared.gamma !== undefined && <li>{zh ? `Gamma:≈${shared.gamma.toFixed(1)}` : `Gamma: ≈${shared.gamma.toFixed(1)}`}</li>}
          {shared.bandingSmooth !== undefined && (
            <li>{zh ? `渐变:${shared.bandingSmooth ? "平滑" : "有阶梯"}` : `Gradients: ${shared.bandingSmooth ? "smooth" : "steps visible"}`}</li>
          )}
          {shared.distanceSeen !== undefined && (
            <li>{zh ? `档案色分辨:${shared.distanceSeen}/${shared.distanceTotal}` : `Archive pairs: ${shared.distanceSeen}/${shared.distanceTotal}`}</li>
          )}
        </ul>
        <button
          type="button"
          className="mt-4 rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
          onClick={() => {
            window.history.replaceState(null, "", window.location.pathname);
            setShared(null);
            start();
          }}
        >
          {zh ? "测测我自己的屏幕 →" : "Test my own screen →"}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white/70 p-5 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/70">
      {step !== "done" ? (
        <>
          <h3 className="text-base font-medium text-neutral-900 dark:text-neutral-100">
            {zh ? "5 分钟完整检测(含报告卡)" : "5-minute guided test (with report card)"}
          </h3>
          <p className="mt-1.5 text-sm text-neutral-600 dark:text-neutral-400">
            {zh
              ? "依次跑完黑位 → 白位 → 均匀性 → gamma → 渐变 → 档案色分辨,每步记录你的观察,最后生成可下载的命名报告卡。"
              : "Runs black level → white saturation → uniformity → gamma → gradients → archive color pairs, records what you report at each step, and ends with a downloadable report card."}
          </p>
          <button
            type="button"
            onClick={start}
            className="mt-4 rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
          >
            {zh ? "开始完整检测" : "Start the guided test"}
          </button>
        </>
      ) : (
        <>
          <h3 className="text-base font-medium text-neutral-900 dark:text-neutral-100">
            {zh ? "你的检测报告" : "Your test report"}
          </h3>
          {missed.length > 0 && (
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              {zh ? "未能分辨的档案色对:" : "Pairs you couldn't separate: "}
              {missed.map((m) => `${m.a} ↔ ${m.b}`).join(" · ")}
            </p>
          )}
          <canvas ref={cardRef} className="mt-4 w-full max-w-xl rounded-lg border border-neutral-200 dark:border-neutral-800" />
          <p className="mt-2 text-xs text-neutral-500">
            {zh ? "iPhone:长按图片保存。链接已带上你的结果,可直接分享。" : "On iPhone: press and hold the image to save. The page URL now carries your result — share it directly."}
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={download}
              className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
            >
              {zh ? "下载 PNG" : "Download PNG"}
            </button>
            {canShareFiles && (
              <button
                type="button"
                onClick={share}
                className="rounded-full border border-neutral-300 px-5 py-2 text-sm text-neutral-700 transition hover:border-neutral-500 dark:border-neutral-700 dark:hover:border-neutral-500 dark:text-neutral-300"
              >
                {zh ? "分享…" : "Share…"}
              </button>
            )}
            <button
              type="button"
              onClick={start}
              className="rounded-full border border-neutral-300 px-5 py-2 text-sm text-neutral-700 transition hover:border-neutral-500 dark:border-neutral-700 dark:hover:border-neutral-500 dark:text-neutral-300"
            >
              {zh ? "重新测试" : "Run again"}
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <Link
              href="/contrast/"
              className="text-neutral-600 underline underline-offset-2 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
              onClick={() => track("screen_test_downstream_click", { target: "contrast", from: "wizard" })}
            >
              {zh ? "接着查配色对比度 →" : "Check your palette's contrast next →"}
            </Link>
            <Link
              href="/palette-audit/"
              className="text-neutral-600 underline underline-offset-2 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
              onClick={() => track("screen_test_downstream_click", { target: "palette-audit", from: "wizard" })}
            >
              {zh ? "审计你的设计系统色板 →" : "Audit your design-system palette →"}
            </Link>
          </div>
        </>
      )}

      {/* ---------------- staged flow ---------------- */}
      <WedgeStage
        kind="black"
        active={step === "black"}
        zh={zh}
        onExit={abort}
        onPick={(v) => {
          setResult((r) => ({ ...r, black: v }));
          setStep("white");
        }}
      />
      <WedgeStage
        kind="white"
        active={step === "white"}
        zh={zh}
        onExit={abort}
        onPick={(v) => {
          setResult((r) => ({ ...r, white: v }));
          setStep("uniformity");
        }}
      />
      <WizardUniformityStage
        active={step === "uniformity"}
        zh={zh}
        onExit={abort}
        onAnswer={(even) => {
          setResult((r) => ({ ...r, uniformityOk: even }));
          setStep("gamma");
        }}
      />
      <GammaStage
        active={step === "gamma"}
        zh={zh}
        fractionalDpr={facts?.fractionalDpr ?? false}
        onExit={abort}
        onPick={(g) => {
          setResult((r) => ({ ...r, gamma: g }));
          setStep("banding");
        }}
      />
      <BandingStage
        active={step === "banding"}
        zh={zh}
        onExit={abort}
        onAnswer={(smooth) => {
          setResult((r) => ({ ...r, bandingSmooth: smooth }));
          setStep("distance");
        }}
      />
      <DistanceStage
        active={step === "distance"}
        zh={zh}
        onExit={abort}
        onDone={(outcome: DistanceOutcome) => {
          setMissed(outcome.missed);
          // `result` is current here: each answered step re-rendered before this
          // stage opened, so the closure carries every prior capture. Side effects
          // stay OUT of the setState updater (StrictMode double-invokes those).
          const final = { ...result, distanceSeen: outcome.seen, distanceTotal: outcome.total };
          setResult(final);
          finish(final);
          onComplete?.(final, outcome.missed);
        }}
      />
    </div>
  );
}
