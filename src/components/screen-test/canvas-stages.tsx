"use client";

import { useCallback, useState } from "react";
import { FullscreenStage } from "@/src/components/screen-test/fullscreen-stage";
import { PatternCanvas } from "@/src/components/screen-test/pattern-canvas";
import {
  BANDING_CHANNELS,
  bandFillStyle,
  GAMMA_PATCHES,
  grayLevel,
  type BandingChannel,
} from "@/src/lib/screen-test";

/* ================================================================== */
/*  Gamma check — stripes vs solid patches                             */
/* ================================================================== */

/** Alternating 1-device-pixel black/white lines: optically ~50% light. */
function drawGammaStripes(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#ffffff";
  for (let y = 0; y < h; y += 2) {
    ctx.fillRect(0, y, w, 1);
  }
}

interface GammaStageProps {
  active: boolean;
  onExit: () => void;
  /** User picked the patch that blends best (gamma value like 2.2). */
  onPick: (gamma: number) => void;
  zh: boolean;
  /** Fractional dPR → exact 1-pixel lines impossible; show the caveat. */
  fractionalDpr: boolean;
}

export function GammaStage({ active, onExit, onPick, zh, fractionalDpr }: GammaStageProps) {
  return (
    <FullscreenStage active={active} background="#000000" onExit={onExit} hudText={zh ? "Gamma 检查" : "Gamma check"}>
      <PatternCanvas draw={drawGammaStripes} className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
        <div className="flex gap-4">
          {GAMMA_PATCHES.map((p) => (
            <button
              key={p.gamma}
              type="button"
              className="flex h-20 w-16 flex-col items-center justify-center rounded-sm sm:h-28 sm:w-20"
              style={{ background: grayLevel(p.value) }}
              onClick={(e) => {
                e.stopPropagation();
                onPick(p.gamma);
              }}
            >
              <span className="text-xs font-medium" style={{ color: "rgba(0,0,0,0.55)" }}>
                {p.gamma.toFixed(1)}
              </span>
            </button>
          ))}
        </div>
        <div className="pointer-events-none max-w-md px-4 text-center text-xs" style={{ color: "rgb(140,140,140)" }}>
          {zh
            ? "眯起眼或后退一步:点按与条纹背景融为一体的那块。"
            : "Squint or step back: tap the patch that melts into the striped background."}
          {fractionalDpr && (
            <span className="mt-1 block" style={{ color: "rgb(190,150,60)" }}>
              {zh
                ? "检测到非整数缩放 —— 条纹可能失真,结果仅供参考。"
                : "Non-integer scaling detected — stripes may be distorted; treat the result as indicative only."}
            </span>
          )}
        </div>
      </div>
    </FullscreenStage>
  );
}

/* ================================================================== */
/*  Banding — 256 exact per-value bands (never CSS gradients)          */
/* ================================================================== */

function drawBands(channel: BandingChannel) {
  return (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    for (let i = 0; i < 256; i++) {
      const x0 = Math.floor((i * w) / 256);
      const x1 = Math.floor(((i + 1) * w) / 256);
      ctx.fillStyle = bandFillStyle(channel, i);
      ctx.fillRect(x0, 0, Math.max(1, x1 - x0), h);
    }
  };
}

const CHANNEL_LABELS: Record<BandingChannel, { en: string; zh: string }> = {
  gray: { en: "Grayscale", zh: "灰阶" },
  red: { en: "Red", zh: "红通道" },
  green: { en: "Green", zh: "绿通道" },
  blue: { en: "Blue", zh: "蓝通道" },
};

interface BandingStageProps {
  active: boolean;
  onExit: () => void;
  /** Final verdict across channels: did the ramps look smooth? */
  onAnswer: (smooth: boolean) => void;
  zh: boolean;
}

export function BandingStage({ active, onExit, onAnswer, zh }: BandingStageProps) {
  const [channelIndex, setChannelIndex] = useState(0);
  const channel = BANDING_CHANNELS[channelIndex];

  const advance = useCallback((dir: 1 | -1) => {
    setChannelIndex((i) => {
      const n = BANDING_CHANNELS.length;
      return (i + dir + n) % n;
    });
  }, []);

  return (
    <FullscreenStage
      active={active}
      background="#000000"
      onExit={onExit}
      onAdvance={advance}
      hudText={`${zh ? CHANNEL_LABELS[channel].zh : CHANNEL_LABELS[channel].en} (${channelIndex + 1}/${BANDING_CHANNELS.length})`}
    >
      <PatternCanvas draw={drawBands(channel)} className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-x-0 bottom-8 flex flex-col items-center gap-3">
        <p className="pointer-events-none px-4 text-center text-xs" style={{ color: "rgb(150,150,150)" }}>
          {zh
            ? "0→255 每值一条色带。平滑 = 好;可见的阶梯或杂色 = 色带问题。这是视觉检查 —— 浏览器渲染管线也可能引入色带。"
            : "One band per value, 0→255. Smooth = good; visible steps or tinting = banding. Visual check only — the browser pipeline can introduce banding of its own."}
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            className="rounded-full bg-white/15 px-4 py-1.5 text-xs text-white backdrop-blur-sm hover:bg-white/25"
            onClick={(e) => {
              e.stopPropagation();
              onAnswer(true);
            }}
          >
            {zh ? "看起来平滑" : "Looks smooth"}
          </button>
          <button
            type="button"
            className="rounded-full bg-white/15 px-4 py-1.5 text-xs text-white backdrop-blur-sm hover:bg-white/25"
            onClick={(e) => {
              e.stopPropagation();
              onAnswer(false);
            }}
          >
            {zh ? "能看到阶梯" : "I see steps"}
          </button>
        </div>
      </div>
    </FullscreenStage>
  );
}

/* ================================================================== */
/*  Sharpness — pixel patterns + zone plate (observational)            */
/* ================================================================== */

function makePattern(ctx: CanvasRenderingContext2D, kind: "checker" | "vlines" | "hlines"): CanvasPattern | null {
  const tile = document.createElement("canvas");
  tile.width = 2;
  tile.height = 2;
  const t = tile.getContext("2d");
  if (!t) return null;
  t.fillStyle = "#000";
  t.fillRect(0, 0, 2, 2);
  t.fillStyle = "#fff";
  if (kind === "checker") {
    t.fillRect(0, 0, 1, 1);
    t.fillRect(1, 1, 1, 1);
  } else if (kind === "vlines") {
    t.fillRect(0, 0, 1, 2);
  } else {
    t.fillRect(0, 0, 2, 1);
  }
  return ctx.createPattern(tile, "repeat");
}

function drawSharpness(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, w, h);
  // Guard tiny/degenerate sizes (early layout passes) — createImageData(≤0)
  // throws IndexSizeError and would take the whole stage down.
  if (w < 64 || h < 64) return;
  const gap = Math.round(Math.min(w, h) * 0.04);
  const cellW = Math.floor((w - gap * 3) / 2);
  const cellH = Math.floor((h - gap * 3) / 2);

  const cells: Array<[number, number]> = [
    [gap, gap],
    [gap * 2 + cellW, gap],
    [gap, gap * 2 + cellH],
    [gap * 2 + cellW, gap * 2 + cellH],
  ];

  // Quadrants 1-3: 1-device-pixel checkerboard / vertical / horizontal line pairs.
  (["checker", "vlines", "hlines"] as const).forEach((kind, i) => {
    const pattern = makePattern(ctx, kind);
    if (!pattern) return;
    ctx.fillStyle = pattern;
    ctx.fillRect(cells[i][0], cells[i][1], cellW, cellH);
  });

  // Quadrant 4: zone plate — concentric rings reaching Nyquist at the edge.
  const [zx, zy] = cells[3];
  const S = Math.min(cellW, cellH);
  const R = S / 2;
  const img = ctx.createImageData(S, S);
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const dx = x - R;
      const dy = y - R;
      const r = Math.sqrt(dx * dx + dy * dy);
      const v = r > R ? 128 : Math.round(127.5 * (1 + Math.cos((Math.PI * r * r) / (2 * R))));
      const o = (y * S + x) * 4;
      img.data[o] = v;
      img.data[o + 1] = v;
      img.data[o + 2] = v;
      img.data[o + 3] = 255;
    }
  }
  ctx.putImageData(img, zx + Math.floor((cellW - S) / 2), zy + Math.floor((cellH - S) / 2));
}

interface SharpnessStageProps {
  active: boolean;
  onExit: () => void;
  zh: boolean;
  fractionalDpr: boolean;
}

export function SharpnessStage({ active, onExit, zh, fractionalDpr }: SharpnessStageProps) {
  return (
    <FullscreenStage active={active} background="#808080" onExit={onExit} hudText={zh ? "锐度 / 缩放" : "Sharpness / scaling"}>
      <PatternCanvas draw={drawSharpness} className="absolute inset-0 h-full w-full" />
      <div className="pointer-events-none absolute inset-x-0 bottom-8 px-4 text-center text-xs" style={{ color: "rgb(60,60,60)" }}>
        {zh
          ? "四块图案应当均匀、无彩色条纹、无水波纹(摩尔纹)。灰糊 = 缩放;彩纹 = 子像素/锐化处理。"
          : "All four patterns should look even — no color fringes, no ripples (moiré). Gray mush = scaling; colored patterns = subpixel/sharpening processing."}
        {fractionalDpr && (
          <span className="mt-1 block" style={{ color: "rgb(120,90,20)" }}>
            {zh ? "检测到非整数缩放 —— 图案必然失真,先把系统/浏览器缩放调到 100%。" : "Non-integer scaling detected — patterns will distort; set OS/browser zoom to 100% first."}
          </span>
        )}
      </div>
    </FullscreenStage>
  );
}
