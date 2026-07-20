"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FullscreenStage } from "@/src/components/screen-test/fullscreen-stage";
import {
  generateHueChips,
  hueArrangementScore,
  HUE_SHUFFLE,
  pickDistancePairs,
  type DistancePair,
  type HueChip,
} from "@/src/lib/screen-test";

/* ================================================================== */
/*  Color distance — adjacent archive pairs (the moat)                 */
/* ================================================================== */

export interface DistanceOutcome {
  seen: number;
  total: number;
  /** Names of pairs the viewer could NOT separate, for named feedback. */
  missed: Array<{ a: string; b: string }>;
}

interface DistanceStageProps {
  active: boolean;
  onExit: () => void;
  onDone: (outcome: DistanceOutcome) => void;
  zh: boolean;
}

export function DistanceStage({ active, onExit, onDone, zh }: DistanceStageProps) {
  const [pairs, setPairs] = useState<DistancePair[] | null>(null);
  const [index, setIndex] = useState(0);
  const resultsRef = useRef<{ seen: number; missed: Array<{ a: string; b: string }> }>({ seen: 0, missed: [] });

  /* Lazy-load the archive ONLY when the stage opens — the 5,446-color dataset
     must never reach the main chunk (perf red line, commit 96ff99e lesson). */
  useEffect(() => {
    if (!active) return;
    setIndex(0);
    resultsRef.current = { seen: 0, missed: [] };
    let cancelled = false;
    import("@/src/data/colors").then((mod) => {
      if (!cancelled) setPairs(pickDistancePairs(mod.colorsById));
    });
    return () => {
      cancelled = true;
    };
  }, [active]);

  const answer = useCallback(
    (sawBoundary: boolean) => {
      if (!pairs) return;
      // Progress derives from the answer count, NOT closure state — rapid
      // double-taps would otherwise double-count one pair and desync `index`.
      const answered = resultsRef.current.seen + resultsRef.current.missed.length;
      if (answered >= pairs.length) return; // already finished — ignore extra taps
      const pair = pairs[answered];
      if (sawBoundary) resultsRef.current.seen += 1;
      else resultsRef.current.missed.push({ a: pair.a.name, b: pair.b.name });
      const nowAnswered = answered + 1;
      if (nowAnswered >= pairs.length) {
        onDone({ seen: resultsRef.current.seen, total: pairs.length, missed: resultsRef.current.missed });
      } else {
        setIndex(nowAnswered);
      }
    },
    [onDone, pairs],
  );

  const pair = pairs?.[index];

  return (
    <FullscreenStage
      active={active}
      background="#000000"
      onExit={onExit}
      hudText={pair ? `${zh ? "色差辨别" : "Color distance"} (${index + 1}/${pairs?.length ?? 0})` : undefined}
    >
      {pair ? (
        <>
          <div className="absolute inset-x-0 top-[12%] bottom-[22%] mx-auto flex w-[86%] overflow-hidden rounded-sm">
            <div className="h-full w-1/2" style={{ background: pair.a.hex }} />
            <div className="h-full w-1/2" style={{ background: pair.b.hex }} />
          </div>
          <div className="absolute inset-x-0 bottom-8 flex flex-col items-center gap-3">
            <p className="pointer-events-none px-4 text-center text-xs" style={{ color: "rgb(150,150,150)" }}>
              {zh ? "两半之间能看到一条分界线吗?" : "Can you see a boundary between the two halves?"}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                className="rounded-full bg-white/15 px-5 py-1.5 text-xs text-white backdrop-blur-sm hover:bg-white/25"
                onClick={(e) => {
                  e.stopPropagation();
                  answer(true);
                }}
              >
                {zh ? "能看到" : "Yes, I see it"}
              </button>
              <button
                type="button"
                className="rounded-full bg-white/15 px-5 py-1.5 text-xs text-white backdrop-blur-sm hover:bg-white/25"
                onClick={(e) => {
                  e.stopPropagation();
                  answer(false);
                }}
              >
                {zh ? "看不出来" : "Looks like one color"}
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-xs" style={{ color: "rgb(120,120,120)" }}>
          {zh ? "载入档案色…" : "Loading archive colors…"}
        </div>
      )}
    </FullscreenStage>
  );
}

/* ================================================================== */
/*  Hue arrangement game — FM-100 style, anchored ends                 */
/* ================================================================== */

/** Deterministic scramble of the 10 middle chips, derived from HUE_SHUFFLE. */
function scrambleMiddle(chips: HueChip[]): HueChip[] {
  const perm = HUE_SHUFFLE.filter((i) => i >= 1 && i <= 10);
  const middle = chips.slice(1, 11);
  return perm.map((i) => middle[i - 1]);
}

interface HueGameProps {
  zh: boolean;
  onScore?: (score: number) => void;
}

export function HueGame({ zh, onScore }: HueGameProps) {
  const [chips] = useState(() => generateHueChips());
  const [middle, setMiddle] = useState<HueChip[]>(() => scrambleMiddle(chips));
  const [score, setScore] = useState<number | null>(null);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  // pointermove fires faster than React state flushes — the ref is the
  // source of truth mid-drag, `dragFrom` state only drives the highlight.
  const dragRef = useRef<number | null>(null);
  const rowRef = useRef<HTMLDivElement | null>(null);

  const anchorStart = chips[0];
  const anchorEnd = chips[chips.length - 1];

  /** Map a pointer x to a middle-row slot index. */
  const slotFromX = useCallback(
    (clientX: number) => {
      const row = rowRef.current;
      if (!row) return null;
      const rect = row.getBoundingClientRect();
      const rel = (clientX - rect.left) / rect.width;
      return Math.max(0, Math.min(middle.length - 1, Math.floor(rel * middle.length)));
    },
    [middle.length],
  );

  const onPointerDown = useCallback((index: number) => (e: React.PointerEvent<HTMLButtonElement>) => {
    if (score !== null) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = index;
    setDragFrom(index);
  }, [score]);

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      const from = dragRef.current;
      if (from === null) return;
      const slot = slotFromX(e.clientX);
      if (slot === null || slot === from) return;
      setMiddle((arr) => {
        const next = [...arr];
        const [moved] = next.splice(from, 1);
        next.splice(slot, 0, moved);
        return next;
      });
      dragRef.current = slot;
      setDragFrom(slot);
    },
    [slotFromX],
  );

  const onPointerUp = useCallback(() => {
    dragRef.current = null;
    setDragFrom(null);
  }, []);

  const finish = useCallback(() => {
    const s = hueArrangementScore([anchorStart, ...middle, anchorEnd]);
    setScore(s);
    onScore?.(s);
  }, [anchorEnd, anchorStart, middle, onScore]);

  const reset = useCallback(() => {
    setMiddle(scrambleMiddle(chips));
    setScore(null);
  }, [chips]);

  return (
    <div>
      <p className="mb-3 text-sm text-neutral-600 dark:text-neutral-400">
        {zh
          ? "把中间的色块拖成从左到右平滑过渡的顺序(两端已固定)。分数 0 = 完美。"
          : "Drag the middle chips into a smooth left-to-right hue order (the ends are fixed). A score of 0 is perfect."}
      </p>
      <div className="flex items-stretch gap-1.5" style={{ touchAction: "none" }}>
        <div className="h-16 w-8 shrink-0 rounded-l-md sm:h-20" style={{ background: anchorStart.hex }} aria-hidden />
        <div ref={rowRef} className="flex flex-1 gap-1.5">
          {middle.map((chip, i) => (
            <button
              key={chip.hex}
              type="button"
              aria-label={zh ? `色块 ${i + 1}` : `Chip ${i + 1}`}
              className={`h-16 flex-1 rounded-sm transition-transform sm:h-20 ${dragFrom === i ? "scale-110 ring-2 ring-neutral-900 dark:ring-neutral-100" : ""} ${score !== null ? "cursor-default" : "cursor-grab active:cursor-grabbing"}`}
              style={{ background: chip.hex }}
              onPointerDown={onPointerDown(i)}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            />
          ))}
        </div>
        <div className="h-16 w-8 shrink-0 rounded-r-md sm:h-20" style={{ background: anchorEnd.hex }} aria-hidden />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {score === null ? (
          <button
            type="button"
            onClick={finish}
            className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
          >
            {zh ? "打分" : "Score my arrangement"}
          </button>
        ) : (
          <>
            <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              {zh ? `错误分:${score}` : `Error score: ${score}`}
              {score === 0 && " 🎯"}
            </span>
            <span className="text-xs text-neutral-500">
              {score === 0
                ? zh
                  ? "完美排序 —— 你的屏幕和眼睛在这段色相上区分良好。"
                  : "Perfect — your screen and eyes separate this hue range cleanly."
                : zh
                  ? "有错位 —— 可能是屏幕在此色相段压缩了差异,也可能只是眼睛的正常个体差异。这不是医学检测;如担心色觉请咨询专业人士。"
                  : "Some chips are out of sequence — the display may compress this hue range, or it may simply be normal person-to-person variation. Not a medical test; consult a professional if you have concerns about color vision."}
            </span>
            <button
              type="button"
              onClick={reset}
              className="rounded-full border border-neutral-300 px-4 py-1.5 text-xs text-neutral-700 transition hover:border-neutral-500 dark:border-neutral-700 dark:text-neutral-300"
            >
              {zh ? "再来一局" : "Play again"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
