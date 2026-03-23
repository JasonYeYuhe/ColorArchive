"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { hexToRgb, rgbToHsl, rgbToHex } from "@/src/lib/color-utils";
import { findNearestArchiveColor, getNearestColors } from "@/src/lib/color-relationships";
import { colors as archiveColors } from "@/src/data/colors";
import type { ColorRecord } from "@/src/types/color";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Mode = "image" | "camera" | "eyedropper";

interface IdentifiedColor {
  hex: string;
  r: number;
  g: number;
  b: number;
  h: number;
  s: number;
  l: number;
  match: ColorRecord | null;
  similar: ColorRecord[];
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function pixelToIdentified(r: number, g: number, b: number): IdentifiedColor {
  const hex = rgbToHex({ r, g, b });
  const { h, s, l } = rgbToHsl(r, g, b);
  const match = findNearestArchiveColor(archiveColors, hex);
  const similar = match ? getNearestColors(archiveColors, match, 4).filter((c) => c.id !== match.id).slice(0, 3) : [];
  return { hex, r, g, b, h, s, l, match, similar };
}

function isLight(l: number) {
  return l > 60;
}

/* ------------------------------------------------------------------ */
/*  Result Panel                                                       */
/* ------------------------------------------------------------------ */

function ResultPanel({ result, onClear }: { result: IdentifiedColor; onClear: () => void }) {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 1600);
    });
  };

  const textColor = isLight(result.l) ? "text-black/60" : "text-white/80";
  const btnBase = isLight(result.l)
    ? "bg-black/10 hover:bg-black/18 text-black/70"
    : "bg-white/15 hover:bg-white/25 text-white/90";

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-white">
      {/* Swatch */}
      <div className="h-32 w-full relative flex items-end p-4 gap-2" style={{ backgroundColor: result.hex }}>
        <button
          className={`px-3 py-1 rounded-full text-xs font-mono transition-colors ${btnBase}`}
          onClick={() => copy(result.hex, "hex")}
        >
          {copied === "hex" ? "✓" : result.hex}
        </button>
        <button
          className={`px-3 py-1 rounded-full text-xs transition-colors ${btnBase}`}
          onClick={() => copy(`rgb(${result.r}, ${result.g}, ${result.b})`, "rgb")}
        >
          {copied === "rgb" ? "✓" : `RGB ${result.r}, ${result.g}, ${result.b}`}
        </button>
        <button
          className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs transition-colors ${btnBase}`}
          onClick={onClear}
          aria-label="Clear result"
        >
          ✕
        </button>
      </div>

      {/* Values */}
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-3 gap-2 text-xs text-slate-500">
          <div>
            <span className="block font-semibold text-slate-400 uppercase tracking-wider text-[10px] mb-0.5">HEX</span>
            <span className="font-mono text-slate-800">{result.hex}</span>
          </div>
          <div>
            <span className="block font-semibold text-slate-400 uppercase tracking-wider text-[10px] mb-0.5">HSL</span>
            <span className="font-mono text-slate-800">{Math.round(result.h)}° {Math.round(result.s)}% {Math.round(result.l)}%</span>
          </div>
          <div>
            <span className="block font-semibold text-slate-400 uppercase tracking-wider text-[10px] mb-0.5">RGB</span>
            <span className="font-mono text-slate-800">{result.r} {result.g} {result.b}</span>
          </div>
        </div>

        {/* Archive match */}
        {result.match && (
          <div className="pt-3 border-t border-slate-100">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Closest archive color</p>
            <Link
              href={`/colors/${result.match.id}/`}
              className="flex items-center gap-3 group hover:bg-slate-50 rounded-xl p-2 -mx-2 transition-colors"
            >
              <div
                className="w-10 h-10 rounded-lg shrink-0 border border-slate-100"
                style={{ backgroundColor: result.match.hex }}
              />
              <div>
                <p className="text-sm font-medium text-slate-900 group-hover:text-indigo-700 transition-colors">
                  {result.match.name}
                </p>
                <p className="text-xs text-slate-400 font-mono">{result.match.hex} · {result.match.family}</p>
              </div>
              <span className="ml-auto text-slate-300 group-hover:text-indigo-400 transition-colors text-sm">→</span>
            </Link>
          </div>
        )}

        {/* Similar colors */}
        {result.similar.length > 0 && (
          <div className="pt-3 border-t border-slate-100">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Similar colors</p>
            <div className="flex gap-2">
              {result.similar.map((c) => (
                <Link key={c.id} href={`/colors/${c.id}/`} title={c.name}>
                  <div
                    className="w-9 h-9 rounded-lg border border-slate-100 hover:scale-110 transition-transform"
                    style={{ backgroundColor: c.hex }}
                  />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Image Mode                                                         */
/* ------------------------------------------------------------------ */

function ImageMode({ onResult }: { onResult: (r: IdentifiedColor) => void }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [crosshair, setCrosshair] = useState<{ x: number; y: number } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const drawToCanvas = useCallback((url: string) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const maxDim = 800;
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = url;
  }, []);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setCrosshair(null);
    drawToCanvas(url);
  }, [drawToCanvas]);

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.round((e.clientX - rect.left) * scaleX);
    const y = Math.round((e.clientY - rect.top) * scaleY);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
    setCrosshair({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    onResult(pixelToIdentified(r, g, b));
  }, [onResult]);

  return (
    <div className="space-y-4">
      {imageUrl ? (
        <div ref={containerRef} className="relative rounded-xl overflow-hidden border border-slate-200 cursor-crosshair">
          <canvas
            ref={canvasRef}
            className="w-full h-auto block max-h-[480px] object-contain"
            onClick={handleCanvasClick}
          />
          {crosshair && (
            <div
              className="pointer-events-none absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2"
              style={{ left: crosshair.x, top: crosshair.y }}
            >
              <div className="absolute inset-0 border-2 border-white rounded-full shadow-md" />
              <div className="absolute inset-[3px] border border-black/40 rounded-full" />
            </div>
          )}
          <button
            className="absolute top-2 right-2 px-2.5 py-1 bg-black/50 text-white/90 text-xs rounded-full hover:bg-black/70 transition-colors"
            onClick={() => { setImageUrl(null); setCrosshair(null); }}
          >
            Change image
          </button>
        </div>
      ) : (
        <div
          className={`rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center py-16 px-8 text-center ${
            isDragging ? "border-indigo-400 bg-indigo-50" : "border-slate-200 hover:border-slate-300 bg-white"
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="text-3xl mb-3">🖼</div>
          <p className="text-slate-700 font-medium mb-1">Drop an image or click to upload</p>
          <p className="text-slate-400 text-sm">Then click anywhere in the image to identify that color</p>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
      {imageUrl && (
        <p className="text-xs text-slate-400 text-center">Click anywhere on the image to identify that color</p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Camera Mode                                                        */
/* ------------------------------------------------------------------ */

function CameraMode({ onResult }: { onResult: (r: IdentifiedColor) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCapture, setLastCapture] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setActive(true);
    } catch {
      setError("Could not access camera. Please allow camera permission and try again.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setActive(false);
    setLastCapture(null);
  }, []);

  useEffect(() => () => { streamRef.current?.getTracks().forEach((t) => t.stop()); }, []);

  const handleCapture = useCallback((e: React.MouseEvent<HTMLVideoElement> | React.TouchEvent<HTMLVideoElement>) => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    let clientX: number, clientY: number;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const rect = video.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.round((clientX - rect.left) * scaleX);
    const y = Math.round((clientY - rect.top) * scaleY);
    const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;

    setLastCapture(`rgb(${r},${g},${b})`);
    onResult(pixelToIdentified(r, g, b));
  }, [onResult]);

  if (!active) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 px-6 text-center bg-white rounded-xl border border-slate-200">
        <div className="text-4xl">📷</div>
        <div>
          <p className="text-slate-700 font-medium mb-1">Use your camera to identify any color</p>
          <p className="text-slate-400 text-sm">Point at any surface and tap to identify its color</p>
        </div>
        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{error}</p>
        )}
        <button
          onClick={startCamera}
          className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-full hover:bg-indigo-700 transition-colors"
        >
          Open Camera
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative rounded-xl overflow-hidden border border-slate-200 cursor-crosshair bg-black">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          ref={videoRef}
          className="w-full h-auto block max-h-[480px] object-cover"
          autoPlay
          playsInline
          muted
          onClick={handleCapture}
          onTouchStart={handleCapture}
        />
        {lastCapture && (
          <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 rounded-full px-3 py-1.5">
            <div className="w-4 h-4 rounded-full border border-white/40" style={{ backgroundColor: lastCapture }} />
            <span className="text-white/80 text-xs">Captured</span>
          </div>
        )}
        <button
          className="absolute top-3 right-3 px-3 py-1.5 bg-black/50 text-white/90 text-xs rounded-full hover:bg-black/70 transition-colors"
          onClick={stopCamera}
        >
          Stop Camera
        </button>
      </div>
      <p className="text-xs text-slate-400 text-center">Tap anywhere on the video to identify that color</p>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  EyeDropper Mode                                                    */
/* ------------------------------------------------------------------ */

function EyeDropperMode({ onResult }: { onResult: (r: IdentifiedColor) => void }) {
  const [supported] = useState(() => typeof window !== "undefined" && "EyeDropper" in window);
  const [picking, setPicking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePick = useCallback(async () => {
    setError(null);
    setPicking(true);
    try {
      // @ts-expect-error EyeDropper is not in TS lib yet
      const ed = new EyeDropper();
      const { sRGBHex } = await ed.open();
      const rgb = hexToRgb(sRGBHex);
      if (rgb) onResult(pixelToIdentified(rgb.r, rgb.g, rgb.b));
    } catch {
      // User cancelled — not an error
    } finally {
      setPicking(false);
    }
  }, [onResult]);

  if (!supported) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 px-6 text-center bg-white rounded-xl border border-slate-200">
        <div className="text-4xl">🔬</div>
        <div>
          <p className="text-slate-700 font-medium mb-1">Screen Eyedropper</p>
          <p className="text-slate-400 text-sm max-w-xs">
            The EyeDropper API is not supported in this browser. Try Chrome or Edge on desktop.
          </p>
        </div>
        <p className="text-xs text-slate-300 bg-slate-50 rounded-lg px-4 py-2">
          Use the Image or Camera tab instead
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 py-12 px-6 text-center bg-white rounded-xl border border-slate-200">
      <div className="text-4xl">🔬</div>
      <div>
        <p className="text-slate-700 font-medium mb-1">Pick any color from your screen</p>
        <p className="text-slate-400 text-sm max-w-xs">
          Click the button, then use your cursor to pick any pixel visible on screen — even outside this browser window.
        </p>
      </div>
      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{error}</p>
      )}
      <button
        onClick={handlePick}
        disabled={picking}
        className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-full hover:bg-indigo-700 transition-colors disabled:opacity-60 flex items-center gap-2"
      >
        {picking ? (
          <>
            <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Picking…
          </>
        ) : (
          "Pick from Screen"
        )}
      </button>
      <p className="text-xs text-slate-400">Works on Chrome and Edge (desktop)</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export function ColorFinderPage() {
  const [mode, setMode] = useState<Mode>("image");
  const [result, setResult] = useState<IdentifiedColor | null>(null);

  const tabs: { id: Mode; label: string; icon: string }[] = [
    { id: "image", label: "Image", icon: "🖼" },
    { id: "camera", label: "Camera", icon: "📷" },
    { id: "eyedropper", label: "Screen", icon: "🔬" },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-24">
      {/* Hero */}
      <section className="max-w-3xl mx-auto px-4 pt-10 pb-6">
        <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-1">Tool</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight mb-2">
          Color Finder
        </h1>
        <p className="text-slate-500 text-sm max-w-lg">
          Identify any color from a photo, your camera, or anywhere on your screen. Get the exact color name, values, and archive match.
        </p>
      </section>

      <div className="max-w-3xl mx-auto px-4 space-y-6">
        {/* Mode tabs */}
        <div className="flex gap-1 bg-white rounded-xl border border-slate-200 p-1 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setMode(tab.id); setResult(null); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                mode === tab.id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Input mode */}
        <div>
          {mode === "image" && <ImageMode onResult={setResult} />}
          {mode === "camera" && <CameraMode onResult={setResult} />}
          {mode === "eyedropper" && <EyeDropperMode onResult={setResult} />}
        </div>

        {/* Result */}
        {result && (
          <ResultPanel result={result} onClear={() => setResult(null)} />
        )}

        {/* Related tools */}
        <section>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Related tools</p>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/image-palette/", label: "Image Palette Extractor" },
              { href: "/contrast/", label: "Contrast Checker" },
              { href: "/convert/", label: "Color Converter" },
              { href: "/harmonies/", label: "Color Harmonies" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-600 hover:border-indigo-300 hover:text-indigo-700 transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
