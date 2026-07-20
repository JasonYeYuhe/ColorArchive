"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FullscreenStage } from "@/src/components/screen-test/fullscreen-stage";

/* ================================================================== */
/*  Burn-in / image retention check                                    */
/* ================================================================== */

const BURN_IN_FIELDS = [
  { hex: "#808080", en: "50% Gray — retention shows best here", zh: "50% 灰 —— 残影最容易显形" },
  { hex: "#404040", en: "25% Gray", zh: "25% 灰" },
  { hex: "#ffffff", en: "White", zh: "白" },
];

interface BurnInStageProps {
  active: boolean;
  onExit: () => void;
  zh: boolean;
}

export function BurnInStage({ active, onExit, zh }: BurnInStageProps) {
  const [index, setIndex] = useState(0);
  const advance = useCallback((dir: 1 | -1) => {
    setIndex((i) => (i + dir + BURN_IN_FIELDS.length) % BURN_IN_FIELDS.length);
  }, []);
  const field = BURN_IN_FIELDS[index];

  return (
    <FullscreenStage
      active={active}
      background={field.hex}
      onExit={onExit}
      onAdvance={advance}
      hudText={`${zh ? field.zh : field.en} (${index + 1}/${BURN_IN_FIELDS.length})`}
    />
  );
}

/* ================================================================== */
/*  Touch tester — multitouch trails                                   */
/* ================================================================== */

const TOUCH_COLORS = ["#ff5252", "#40c4ff", "#69f0ae", "#ffd740", "#e040fb", "#ff6e40", "#18ffff", "#b2ff59"];

interface TouchStageProps {
  active: boolean;
  onExit: () => void;
  zh: boolean;
}

export function TouchStage({ active, onExit, zh }: TouchStageProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [pointerCount, setPointerCount] = useState(0);
  const activePointers = useRef(new Set<number>());

  /* Size the canvas to device pixels once per activation + on resize. */
  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const size = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, rect.width, rect.height);
      }
    };
    size();
    window.addEventListener("resize", size);
    activePointers.current.clear();
    setPointerCount(0);
    return () => window.removeEventListener("resize", size);
  }, [active]);

  const drawAt = useCallback((e: React.PointerEvent<HTMLCanvasElement>, isDown: boolean) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const color = TOUCH_COLORS[Math.abs(e.pointerId) % TOUCH_COLORS.length];
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, isDown ? 14 : 5, 0, Math.PI * 2);
    ctx.fill();
    if (isDown) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x, y, 26, 0, Math.PI * 2);
      ctx.stroke();
    }
  }, []);

  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, rect.width, rect.height);
  }, []);

  return (
    <FullscreenStage active={active} background="#000000" onExit={onExit} hudText={zh ? "触摸测试" : "Touch test"}>
      {/* The canvas owns its pointer/click events — stopPropagation keeps rapid
          taps from bubbling to the stage's double-click-exit (tapping fast is
          the whole point here). Exit stays available via ✕ and Esc. */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{ touchAction: "none" }}
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => {
          e.stopPropagation();
          // Capture so a release outside the canvas still fires pointerup
          // (otherwise the active-touch count leaks upward).
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
          activePointers.current.add(e.pointerId);
          setPointerCount(activePointers.current.size);
          drawAt(e, true);
        }}
        onPointerMove={(e) => {
          if (activePointers.current.has(e.pointerId)) drawAt(e, false);
        }}
        onPointerUp={(e) => {
          activePointers.current.delete(e.pointerId);
          setPointerCount(activePointers.current.size);
        }}
        onPointerCancel={(e) => {
          activePointers.current.delete(e.pointerId);
          setPointerCount(activePointers.current.size);
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-8 flex flex-col items-center gap-2">
        <span className="text-xs" style={{ color: "rgb(150,150,150)" }}>
          {zh
            ? `画一画 —— 断线或空洞 = 触摸盲区。当前触点:${pointerCount}`
            : `Draw around — gaps or dead zones reveal touch problems. Active touches: ${pointerCount}`}
        </span>
        <button
          type="button"
          className="pointer-events-auto rounded-full bg-white/15 px-4 py-1.5 text-xs text-white backdrop-blur-sm hover:bg-white/25"
          onClick={(e) => {
            e.stopPropagation();
            clear();
          }}
        >
          {zh ? "清空画布" : "Clear canvas"}
        </button>
      </div>
    </FullscreenStage>
  );
}
