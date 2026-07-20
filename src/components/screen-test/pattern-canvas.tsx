"use client";

import { useEffect, useRef } from "react";

/**
 * A canvas whose backing store is exactly device-pixel sized (CSS size ×
 * devicePixelRatio), so 1-unit lines land on physical pixels — the whole point
 * of gamma/sharpness patterns (dev-plan-2026-07-20 §2.3-1). Redraws on resize
 * and on devicePixelRatio changes (browser zoom, monitor drags).
 *
 * NOTE: with a fractional dPR (OS scaling / zoom) exact mapping is impossible;
 * callers surface that warning via ScreenFacts.fractionalDpr — this component
 * still rounds to the nearest device pixel and draws.
 */
interface PatternCanvasProps {
  draw: (ctx: CanvasRenderingContext2D, deviceWidth: number, deviceHeight: number, dpr: number) => void;
  className?: string;
}

export function PatternCanvas({ draw, className }: PatternCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawRef = useRef(draw);
  const renderRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    drawRef.current = draw;
  });

  /* Re-render when the draw callback itself changes (e.g. banding channel
     switch) — size/dPR listeners alone would leave the old pattern on screen. */
  useEffect(() => {
    renderRef.current?.();
  }, [draw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let disposed = false;
    let dprQuery: MediaQueryList | null = null;

    const render = () => {
      if (disposed) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(1, Math.round(rect.width * dpr));
      const h = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(1, 0, 0, 1, 0, 0); // draw in device pixels, no scaling
      ctx.clearRect(0, 0, w, h);
      drawRef.current(ctx, w, h, dpr);
      // Re-arm the dPR listener for the *current* ratio (standard trick: the
      // query stops matching when the ratio changes, firing exactly once).
      dprQuery?.removeEventListener("change", render);
      dprQuery = window.matchMedia(`(resolution: ${dpr}dppx)`);
      dprQuery.addEventListener("change", render);
    };

    const ro = new ResizeObserver(render);
    ro.observe(canvas);
    render();
    renderRef.current = render;

    return () => {
      disposed = true;
      renderRef.current = null;
      ro.disconnect();
      dprQuery?.removeEventListener("change", render);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
