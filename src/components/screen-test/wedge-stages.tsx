"use client";

import { FullscreenStage } from "@/src/components/screen-test/fullscreen-stage";
import { grayLevel, NEAR_BLACK_STEPS, NEAR_WHITE_STEPS } from "@/src/lib/screen-test";

/**
 * Near-black / near-white step wedges, shared by the hub's standalone buttons
 * and the guided wizard. The user taps the last step they can still separate
 * from the background — captured verbatim as "you reported seeing…".
 */
interface WedgeStageProps {
  kind: "black" | "white";
  active: boolean;
  onExit: () => void;
  onPick: (value: number) => void;
  zh: boolean;
}

export function WedgeStage({ kind, active, onExit, onPick, zh }: WedgeStageProps) {
  const black = kind === "black";
  const steps = black ? NEAR_BLACK_STEPS : NEAR_WHITE_STEPS;
  const labelColor = black ? "rgb(70, 70, 70)" : "rgb(185, 185, 185)";
  const promptColor = black ? "rgb(90, 90, 90)" : "rgb(160, 160, 160)";

  return (
    <FullscreenStage
      active={active}
      background={black ? "#000000" : "#ffffff"}
      onExit={onExit}
      hudText={black ? (zh ? "黑位测试" : "Black level") : zh ? "白位测试" : "White saturation"}
    >
      <div className="flex h-full w-full items-center justify-center">
        <div className="flex gap-3">
          {steps.map((v) => (
            <button
              key={v}
              type="button"
              className="flex h-24 w-14 flex-col items-center justify-end rounded-sm pb-1 sm:h-32 sm:w-16"
              style={{ background: grayLevel(v) }}
              onClick={(e) => {
                e.stopPropagation();
                onPick(v);
              }}
            >
              <span className="text-[10px]" style={{ color: labelColor }}>
                {v}
              </span>
            </button>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-8 text-center text-xs" style={{ color: promptColor }}>
          {black
            ? zh
              ? "点按你能看清的最暗一格"
              : "Tap the darkest square you can still see"
            : zh
              ? "点按你能看清的最亮一格"
              : "Tap the brightest square you can still see"}
        </div>
      </div>
    </FullscreenStage>
  );
}
