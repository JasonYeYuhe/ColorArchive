"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { applyDuotone, buildDuotoneLut, hexToRgbTuple } from "@/src/lib/duotone";
import { normalizeHexInput } from "@/src/lib/screen-test";
import { useLocale } from "@/src/components/locale-provider";
import { track } from "@/src/lib/track";

const PRESET_DUOS: Array<{ shadow: string; highlight: string; name: string }> = [
  { shadow: "#1a1a40", highlight: "#ffcf70", name: "Midnight Gold" },
  { shadow: "#0f2027", highlight: "#7ee8fa", name: "Deep Cyan" },
  { shadow: "#3d0000", highlight: "#ffb199", name: "Ember" },
  { shadow: "#12100e", highlight: "#eaeaea", name: "Ink" },
  { shadow: "#24243e", highlight: "#f78fb3", name: "Neon Rose" },
  { shadow: "#004d40", highlight: "#f9f871", name: "Acid Forest" },
];

const MAX_DIM = 1600;

export function DuotonePage() {
  const { locale } = useLocale();
  const zh = locale === "zh";

  const [shadowInput, setShadowInput] = useState("#1a1a40");
  const [highlightInput, setHighlightInput] = useState("#ffcf70");
  const [contrast, setContrast] = useState(0.3);
  // Counter, not boolean: a SECOND upload must still change state or React
  // bails out of the re-render and the canvas keeps showing the first image.
  const [imageVersion, setImageVersion] = useState(0);
  const hasImage = imageVersion > 0;
  const [dragOver, setDragOver] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sourceRef = useRef<HTMLCanvasElement | null>(null);

  const shadow = normalizeHexInput(shadowInput);
  const highlight = normalizeHexInput(highlightInput);

  /* Re-render the duotone whenever colors/contrast/image change. */
  const render = useCallback(() => {
    const src = sourceRef.current;
    const dst = canvasRef.current;
    if (!src || !dst || src.width === 0) return;
    const s = shadow ? hexToRgbTuple(shadow) : null;
    const h = highlight ? hexToRgbTuple(highlight) : null;
    if (!s || !h) return;
    dst.width = src.width;
    dst.height = src.height;
    const ctx = dst.getContext("2d");
    const sctx = src.getContext("2d");
    if (!ctx || !sctx) return;
    const img = sctx.getImageData(0, 0, src.width, src.height);
    applyDuotone(img.data, buildDuotoneLut(s, h, contrast));
    ctx.putImageData(img, 0, 0);
  }, [shadow, highlight, contrast]);

  useEffect(() => {
    render();
  }, [render, imageVersion]);

  const loadFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const src = sourceRef.current ?? document.createElement("canvas");
        src.width = w;
        src.height = h;
        src.getContext("2d")?.drawImage(img, 0, 0, w, h);
        sourceRef.current = src;
        setImageVersion((v) => v + 1);
        URL.revokeObjectURL(url);
        track("tool_action", { tool: "duotone", action: "image-loaded" });
      };
      img.onerror = () => URL.revokeObjectURL(url);
      img.src = url;
    },
    [],
  );

  const download = useCallback(() => {
    canvasRef.current?.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "duotone.png";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    });
    track("tool_action", { tool: "duotone", action: "download" });
  }, []);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 pb-20 pt-8 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
        {zh ? "Duotone 双色调生成器" : "Duotone Generator"}
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600 dark:text-neutral-400">
        {zh
          ? "上传图片,选阴影色与高光色,即刻得到 Spotify 风格的双色调效果。全部在浏览器本地处理,图片不上传。"
          : "Upload an image, pick a shadow and a highlight color, and get the Spotify-style duotone look instantly. Everything is processed locally — your image never leaves the browser."}
      </p>

      {/* dropzone / input */}
      <label
        htmlFor="duotone-file"
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f) loadFile(f);
        }}
        className={`mt-6 flex h-32 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed text-sm transition ${dragOver ? "border-neutral-900 bg-neutral-100 dark:border-neutral-100 dark:bg-neutral-800" : "border-neutral-300 text-neutral-500 hover:border-neutral-500 dark:border-neutral-700"}`}
      >
        <span>{zh ? "拖入图片,或点击选择" : "Drop an image here, or click to choose"}</span>
        <span className="mt-1 text-xs text-neutral-400">{zh ? "本地处理 · 不上传" : "Processed locally · never uploaded"}</span>
        <input
          id="duotone-file"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) loadFile(f);
          }}
        />
      </label>

      {/* color controls */}
      <div className="mt-5 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor="duo-shadow" className="text-sm text-neutral-600 dark:text-neutral-400">
            {zh ? "阴影" : "Shadow"}
          </label>
          <input
            id="duo-shadow"
            value={shadowInput}
            onChange={(e) => setShadowInput(e.target.value)}
            spellCheck={false}
            className={`w-28 rounded-lg border bg-white px-2.5 py-1.5 font-mono text-sm text-neutral-900 outline-none dark:bg-neutral-900 dark:text-neutral-100 ${shadow ? "border-neutral-300 dark:border-neutral-700" : "border-red-400"}`}
          />
          {shadow && <span className="swatch-shadow h-7 w-7 rounded-md" style={{ background: shadow }} />}
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="duo-highlight" className="text-sm text-neutral-600 dark:text-neutral-400">
            {zh ? "高光" : "Highlight"}
          </label>
          <input
            id="duo-highlight"
            value={highlightInput}
            onChange={(e) => setHighlightInput(e.target.value)}
            spellCheck={false}
            className={`w-28 rounded-lg border bg-white px-2.5 py-1.5 font-mono text-sm text-neutral-900 outline-none dark:bg-neutral-900 dark:text-neutral-100 ${highlight ? "border-neutral-300 dark:border-neutral-700" : "border-red-400"}`}
          />
          {highlight && <span className="swatch-shadow h-7 w-7 rounded-md" style={{ background: highlight }} />}
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="duo-contrast" className="text-sm text-neutral-600 dark:text-neutral-400">
            {zh ? "对比" : "Contrast"}
          </label>
          <input
            id="duo-contrast"
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={contrast}
            onChange={(e) => setContrast(Number(e.target.value))}
            className="w-28 accent-neutral-900 dark:accent-neutral-100"
          />
        </div>
      </div>

      {/* preset duos */}
      <div className="mt-4 flex flex-wrap gap-2">
        {PRESET_DUOS.map((d) => (
          <button
            key={d.name}
            type="button"
            onClick={() => {
              setShadowInput(d.shadow);
              setHighlightInput(d.highlight);
              track("tool_action", { tool: "duotone", action: "preset", preset: d.name });
            }}
            className="flex items-center gap-1.5 rounded-full border border-neutral-300 px-2.5 py-1 text-xs text-neutral-600 transition hover:border-neutral-500 dark:border-neutral-700 dark:text-neutral-400"
          >
            <span className="h-4 w-4 rounded-full" style={{ background: `linear-gradient(135deg, ${d.shadow} 50%, ${d.highlight} 50%)` }} />
            {d.name}
          </button>
        ))}
      </div>

      {/* result */}
      <div className={`mt-6 ${hasImage ? "" : "hidden"}`}>
        <canvas ref={canvasRef} className="w-full rounded-2xl border border-neutral-200 dark:border-neutral-800" />
        <button
          type="button"
          onClick={download}
          className="mt-3 rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
        >
          {zh ? "下载 PNG" : "Download PNG"}
        </button>
      </div>

      {/* SEO content */}
      <section className="mt-10 max-w-3xl space-y-4">
        <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
          {zh ? "Duotone 是怎么回事" : "How duotone works"}
        </h2>
        <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-400">
          {zh
            ? "双色调把图片的亮度映射到一条双色渐变上:暗部落在阴影色,亮部落在高光色。好的组合通常是一深一浅、色相拉开 —— 深蓝配暖金、墨绿配酸黄。它能把风格各异的照片统一成一套视觉语言,这也是它在品牌与封面设计里流行的原因。"
            : "Duotone maps an image's luminance onto a two-color ramp: darks land on the shadow color, lights on the highlight. Strong combos pair one deep and one bright hue set well apart — navy with warm gold, forest with acid yellow. It unifies wildly different photos into one visual language, which is why brands and cover art love it."}
        </p>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link
            href="/image-palette/"
            className="text-neutral-600 underline underline-offset-2 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
          >
            {zh ? "先从图片提取配色 →" : "Extract a palette from the image first →"}
          </Link>
          <Link
            href="/color-wheel/"
            className="text-neutral-600 underline underline-offset-2 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
          >
            {zh ? "用色轮找互补组合 →" : "Find complementary duos on the wheel →"}
          </Link>
        </div>
      </section>
    </main>
  );
}
