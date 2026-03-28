"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { hslToRgb, rgbToHex } from "@/src/lib/color-utils";

interface HoveredColor {
  hex: string;
  hue: number;
  saturation: number;
  lightness: number;
  x: number;
  y: number;
}

export function ColorSpectrum() {
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => { clearTimeout(copiedTimerRef.current); }, []);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [saturation, setSaturation] = useState(80);
  const [hovered, setHovered] = useState<HoveredColor | null>(null);
  const [copied, setCopied] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const CANVAS_HEIGHT = 280;

  // Draw the spectrum
  const drawSpectrum = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvas;
    if (width === 0 || height === 0) return;

    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    for (let x = 0; x < width; x++) {
      const hue = (x / width) * 360;
      for (let y = 0; y < height; y++) {
        const lightness = 100 - (y / height) * 100;
        const rgb = hslToRgb(hue, saturation, lightness);
        const idx = (y * width + x) * 4;
        data[idx] = rgb.r;
        data[idx + 1] = rgb.g;
        data[idx + 2] = rgb.b;
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }, [saturation]);

  // Resize observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = Math.floor(entry.contentRect.width);
        setCanvasSize({ width, height: CANVAS_HEIGHT });
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Redraw on size or saturation change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvasSize.width === 0) return;
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    drawSpectrum();
  }, [canvasSize, drawSpectrum]);

  const getColorAt = (e: React.MouseEvent<HTMLCanvasElement>): HoveredColor | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    const hue = Math.round((x / canvas.width) * 360) % 360;
    const lightness = Math.round(100 - (y / canvas.height) * 100);
    const clampedL = Math.max(0, Math.min(100, lightness));
    const rgb = hslToRgb(hue, saturation, clampedL);
    const hex = rgbToHex(rgb);
    return { hex, hue, saturation, lightness: clampedL, x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const color = getColorAt(e);
    if (color) setHovered(color);
  };

  const handleClick = async (e: React.MouseEvent<HTMLCanvasElement>) => {
    const color = getColorAt(e);
    if (!color) return;
    try {
      await navigator.clipboard.writeText(color.hex);
      setCopied(true);
      copiedTimerRef.current = setTimeout(() => setCopied(false), 1200);
    } catch {
      // clipboard not available
    }
  };

  return (
    <section className="rounded-[1.75rem] border border-black/6 bg-white/78 p-4 shadow-[0_18px_48px_rgba(15,23,42,0.04)] sm:p-5 dark:border-white/8 dark:bg-white/4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-[-0.03em] text-neutral-950 dark:text-white">
            Full color spectrum
          </h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Every hue and lightness at a glance. Click any point to copy its hex code.
          </p>
        </div>
        <label className="flex items-center gap-3">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
            Saturation {saturation}%
          </span>
          <input
            type="range"
            min={0}
            max={100}
            value={saturation}
            onChange={(e) => setSaturation(Number(e.target.value))}
            className="h-1.5 w-36 cursor-pointer appearance-none rounded-full bg-neutral-200 accent-neutral-900 sm:w-48 dark:bg-neutral-700 dark:accent-white"
          />
        </label>
      </div>

      <div ref={containerRef} className="relative w-full">
        <canvas
          ref={canvasRef}
          className="w-full cursor-crosshair rounded-2xl border border-black/6 dark:border-white/8"
          style={{ height: CANVAS_HEIGHT, imageRendering: "pixelated" }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHovered(null)}
          onClick={handleClick}
        />

        {/* Axis labels */}
        <div className="mt-2 flex justify-between text-[10px] uppercase tracking-[0.16em] text-neutral-400">
          <span>0° Red</span>
          <span>60° Yellow</span>
          <span>120° Green</span>
          <span>180° Cyan</span>
          <span>240° Blue</span>
          <span>300° Magenta</span>
          <span>360°</span>
        </div>

        {/* Hover tooltip */}
        {hovered && (
          <div
            className="pointer-events-none fixed z-50 rounded-xl border border-black/8 bg-white/95 px-3 py-2 shadow-lg backdrop-blur-sm dark:border-white/12 dark:bg-neutral-900/95"
            style={{
              left: hovered.x + 16,
              top: hovered.y - 60,
            }}
          >
            <div className="flex items-center gap-2">
              <div
                className="h-6 w-6 rounded-md border border-black/10"
                style={{ backgroundColor: hovered.hex }}
              />
              <div>
                <div className="text-sm font-semibold text-neutral-950 dark:text-white">
                  {copied ? "Copied!" : hovered.hex}
                </div>
                <div className="text-[10px] text-neutral-500">
                  H{hovered.hue} S{hovered.saturation} L{hovered.lightness}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
