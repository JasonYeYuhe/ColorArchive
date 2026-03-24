"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import Link from "next/link";
import { ProGate } from "@/src/components/pro-gate";
import { hexToRgb, rgbToHsl, rgbToHex } from "@/src/lib/color-utils";
import { colors as archiveColors } from "@/src/data/colors";
import { addManyToPalette } from "@/src/lib/palette-builder";
import { useLocale } from "@/src/components/locale-provider";
import { t } from "@/src/lib/i18n";
import { ShareLinkButton, ShareOnXButton } from "@/src/components/share-link-button";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ExtractedColor {
  hex: string;
  r: number;
  g: number;
  b: number;
  h: number;
  s: number;
  l: number;
  count: number;
  percentage: number;
}

interface MatchedColor {
  extracted: ExtractedColor;
  archiveId: string | null;
  archiveName: string | null;
  archiveHex: string | null;
  distance: number;
}

type CopyState = Record<string, "idle" | "copied">;
type ExportFormat = "hex" | "rgb" | "hsl" | "css" | "json";

/* ------------------------------------------------------------------ */
/*  Color Extraction Algorithm                                         */
/* ------------------------------------------------------------------ */

function colorDistance(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
  // Weighted Euclidean distance in RGB (human perception weights)
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  return Math.sqrt(2 * dr * dr + 4 * dg * dg + 3 * db * db);
}

function quantize(r: number, g: number, b: number, level: number): string {
  const qr = Math.round(r / level) * level;
  const qg = Math.round(g / level) * level;
  const qb = Math.round(b / level) * level;
  return `${qr},${qg},${qb}`;
}

function extractDominantColors(imageData: ImageData, count: number = 8): ExtractedColor[] {
  const { data, width, height } = imageData;
  const totalPixels = width * height;

  // Sample every Nth pixel for performance
  const step = Math.max(1, Math.floor(totalPixels / 10000)) * 4;

  // First pass: coarse quantization bucket
  const coarseBuckets = new Map<string, number>();
  for (let i = 0; i < data.length; i += step) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    if (a < 128) continue; // skip transparent
    const key = quantize(r, g, b, 32);
    coarseBuckets.set(key, (coarseBuckets.get(key) ?? 0) + 1);
  }

  // Sort by frequency
  const sorted = Array.from(coarseBuckets.entries())
    .sort((a, b) => b[1] - a[1]);

  // Pick initial cluster centers: top N colors that are sufficiently different
  const centers: { r: number; g: number; b: number }[] = [];
  for (const [key] of sorted) {
    if (centers.length >= count * 2) break;
    const [r, g, b] = key.split(",").map(Number);
    const tooClose = centers.some((c) => colorDistance(c.r, c.g, c.b, r, g, b) < 48);
    if (!tooClose) centers.push({ r, g, b });
  }

  if (centers.length === 0) return [];

  // K-means: assign pixels to nearest center and recompute centroids
  const clusterRSum = new Array(centers.length).fill(0);
  const clusterGSum = new Array(centers.length).fill(0);
  const clusterBSum = new Array(centers.length).fill(0);
  const clusterCount = new Array(centers.length).fill(0);

  for (let i = 0; i < data.length; i += step) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    if (a < 128) continue;

    let minDist = Infinity;
    let minIdx = 0;
    for (let ci = 0; ci < centers.length; ci++) {
      const d = colorDistance(centers[ci].r, centers[ci].g, centers[ci].b, r, g, b);
      if (d < minDist) { minDist = d; minIdx = ci; }
    }
    clusterRSum[minIdx] += r;
    clusterGSum[minIdx] += g;
    clusterBSum[minIdx] += b;
    clusterCount[minIdx]++;
  }

  // Build final colors from clusters
  const totalSampled = clusterCount.reduce((a, b) => a + b, 0) || 1;
  const results: ExtractedColor[] = [];

  for (let ci = 0; ci < centers.length; ci++) {
    if (clusterCount[ci] === 0) continue;
    const r = Math.round(clusterRSum[ci] / clusterCount[ci]);
    const g = Math.round(clusterGSum[ci] / clusterCount[ci]);
    const b = Math.round(clusterBSum[ci] / clusterCount[ci]);
    const hex = rgbToHex({ r, g, b });
    const { h, s, l } = rgbToHsl(r, g, b);
    results.push({
      hex,
      r, g, b, h, s, l,
      count: clusterCount[ci],
      percentage: Math.round((clusterCount[ci] / totalSampled) * 100),
    });
  }

  // Sort by count, take top N, filter out near-duplicates at final step
  results.sort((a, b) => b.count - a.count);
  const final: ExtractedColor[] = [];
  for (const color of results) {
    if (final.length >= count) break;
    const tooClose = final.some((c) => colorDistance(c.r, c.g, c.b, color.r, color.g, color.b) < 32);
    if (!tooClose) final.push(color);
  }

  return final;
}

/* ------------------------------------------------------------------ */
/*  Archive Matching                                                   */
/* ------------------------------------------------------------------ */

function findClosestArchiveColor(r: number, g: number, b: number): { id: string; name: string; hex: string; distance: number } | null {
  let best: { id: string; name: string; hex: string; distance: number } | null = null;
  for (const ac of archiveColors) {
    const rgb = hexToRgb(ac.hex);
    if (!rgb) continue;
    const d = colorDistance(r, g, b, rgb.r, rgb.g, rgb.b);
    if (!best || d < best.distance) {
      best = { id: ac.id, name: ac.name, hex: ac.hex, distance: d };
    }
  }
  return best;
}

/* ------------------------------------------------------------------ */
/*  Export helpers                                                     */
/* ------------------------------------------------------------------ */

function formatForExport(colors: ExtractedColor[], format: ExportFormat): string {
  switch (format) {
    case "hex":
      return colors.map((c) => c.hex).join("\n");
    case "rgb":
      return colors.map((c) => `rgb(${c.r}, ${c.g}, ${c.b})`).join("\n");
    case "hsl":
      return colors.map((c) => `hsl(${Math.round(c.h)}, ${Math.round(c.s)}%, ${Math.round(c.l)}%)`).join("\n");
    case "css":
      return colors.map((c, i) => `--color-${i + 1}: ${c.hex};`).join("\n");
    case "json":
      return JSON.stringify(
        colors.map((c, i) => ({
          name: `color-${i + 1}`,
          hex: c.hex,
          rgb: { r: c.r, g: c.g, b: c.b },
          hsl: { h: Math.round(c.h), s: Math.round(c.s), l: Math.round(c.l) },
          percentage: c.percentage,
        })),
        null,
        2
      );
  }
}

function buildShareUrl(matched: MatchedColor[]): string {
  const ids = matched
    .map((m) => m.archiveId)
    .filter((id): id is string => Boolean(id))
    .join(",");
  return `/image-palette/?ids=${ids}`;
}

function generatePaletteSvg(matched: MatchedColor[]): string {
  const cols = matched.length;
  const W = 800;
  const swatchH = 140;
  const H = 200;
  const colW = W / cols;

  const textColor = (hex: string) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return "#1a1a1a";
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    return luminance > 0.5 ? "#1a1a1a" : "#ffffff";
  };

  const rects = matched.map((mc, i) => {
    const hex = (mc.archiveHex ?? mc.extracted.hex).toUpperCase();
    const name = mc.archiveName ?? hex;
    const tc = textColor(hex);
    const x = Math.round(i * colW);
    const w = Math.round(colW);
    return `<rect x="${x}" y="0" width="${w}" height="${swatchH}" fill="${hex}"/><text x="${x + w / 2}" y="${swatchH - 10}" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10" fill="${tc}" opacity="0.7">${hex}</text>`;
  }).join("\n  ");

  const labels = matched.map((mc, i) => {
    const hex = (mc.archiveHex ?? mc.extracted.hex).toUpperCase();
    const name = mc.archiveName ?? hex;
    const x = Math.round(i * colW);
    const w = Math.round(colW);
    return `<text x="${x + w / 2}" y="${swatchH + 18}" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10" fill="#374151">${name.length > 18 ? name.slice(0, 17) + "…" : name}</text>`;
  }).join("\n  ");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#f8fafc"/>
  ${rects}
  ${labels}
  <text x="${W - 8}" y="${H - 6}" text-anchor="end" font-family="system-ui,sans-serif" font-size="8" fill="#9ca3af">colorarchive.me</text>
</svg>`;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

function AddMatchesToPaletteButton({ matchedColors }: { matchedColors: { archiveId: string | null }[] }) {
  const [added, setAdded] = useState(false);
  const ids = matchedColors.map((m) => m.archiveId).filter((id): id is string => Boolean(id));
  if (ids.length === 0) return null;
  const handleAdd = () => {
    addManyToPalette(ids);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };
  return added ? (
    <Link href="/palette/" className="text-sm text-indigo-600 hover:underline font-medium">
      ✓ Added to Palette Builder →
    </Link>
  ) : (
    <button
      onClick={handleAdd}
      className="px-3 py-1.5 text-sm bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors font-medium"
    >
      + Add all to Palette Builder
    </button>
  );
}

export function ImagePalettePage() {
  const { locale } = useLocale();
  const [isDragging, setIsDragging] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedColors, setExtractedColors] = useState<ExtractedColor[]>([]);
  const [matchedColors, setMatchedColors] = useState<MatchedColor[]>([]);
  const [colorCount, setColorCount] = useState(6);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("hex");
  const [exportCopied, setExportCopied] = useState(false);
  const [copyStates, setCopyStates] = useState<CopyState>({});
  const [showMatches, setShowMatches] = useState(true);
  const [sampleUrlInput, setSampleUrlInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isSharedView, setIsSharedView] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const processImage = useCallback((url: string) => {
    setIsProcessing(true);
    setError(null);
    setExtractedColors([]);
    setMatchedColors([]);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Scale down for performance if needed
      const maxDim = 400;
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const colors = extractDominantColors(imageData, colorCount);

      const matched: MatchedColor[] = colors.map((color) => {
        const closest = findClosestArchiveColor(color.r, color.g, color.b);
        return {
          extracted: color,
          archiveId: closest?.id ?? null,
          archiveName: closest?.name ?? null,
          archiveHex: closest?.hex ?? null,
          distance: closest?.distance ?? Infinity,
        };
      });

      setExtractedColors(colors);
      setMatchedColors(matched);
      setIsProcessing(false);
      setIsSharedView(false);
      const url = buildShareUrl(matched);
      setShareUrl(url);
      window.history.replaceState(null, "", url);
    };
    img.onerror = () => {
      setError("Could not load image. Try a different file or URL.");
      setIsProcessing(false);
    };
    img.src = url;
  }, [colorCount]);

  // Re-process when color count changes (if image is loaded)
  useEffect(() => {
    if (imageUrl) processImage(imageUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colorCount]);

  // Read ?ids= on mount to reconstruct a shared palette view
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ids = params.get("ids");
    if (!ids) return;
    const idList = ids.split(",").filter(Boolean);
    const reconstructed: MatchedColor[] = idList.flatMap((id) => {
      const ac = archiveColors.find((c) => c.id === id);
      if (!ac) return [];
      const rgb = hexToRgb(ac.hex);
      if (!rgb) return [];
      const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);
      const extracted: ExtractedColor = {
        hex: ac.hex,
        r: rgb.r, g: rgb.g, b: rgb.b,
        h, s, l,
        count: 0,
        percentage: 0,
      };
      return [{
        extracted,
        archiveId: ac.id,
        archiveName: ac.name,
        archiveHex: ac.hex,
        distance: 0,
      }];
    });
    if (reconstructed.length > 0) {
      setMatchedColors(reconstructed);
      setExtractedColors(reconstructed.map((m) => m.extracted));
      setIsSharedView(true);
      const url = `/image-palette/?ids=${idList.join(",")}`;
      setShareUrl(url);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (PNG, JPG, GIF, WebP, etc.).");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError("Image is too large. Please use a file under 20MB.");
      return;
    }
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setImageName(file.name);
    processImage(url);
  }, [processImage]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleCopyHex = useCallback((hex: string) => {
    navigator.clipboard.writeText(hex).then(() => {
      setCopyStates((prev) => ({ ...prev, [hex]: "copied" }));
      setTimeout(() => setCopyStates((prev) => ({ ...prev, [hex]: "idle" })), 1800);
    });
  }, []);

  const handleExport = useCallback(() => {
    const text = formatForExport(extractedColors, exportFormat);
    navigator.clipboard.writeText(text).then(() => {
      setExportCopied(true);
      setTimeout(() => setExportCopied(false), 2000);
    });
  }, [extractedColors, exportFormat]);

  const exportText = useMemo(
    () => (extractedColors.length > 0 ? formatForExport(extractedColors, exportFormat) : ""),
    [extractedColors, exportFormat]
  );

  const handleDownloadSvg = useCallback(() => {
    const svg = generatePaletteSvg(matchedColors);
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "colorarchive-palette.svg";
    a.click();
    URL.revokeObjectURL(url);
  }, [matchedColors]);

  const xShareText = useMemo(() => {
    if (!shareUrl || matchedColors.length === 0) return "";
    const names = matchedColors
      .map((m) => m.archiveName ?? m.extracted.hex)
      .slice(0, 5)
      .join(" · ");
    return `My image palette from @ColorArchive ✦ ${names} #colorarchive #colorpalette`;
  }, [matchedColors, shareUrl]);

  const SAMPLE_IMAGES = [
    { label: "Ocean Sunset", url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80" },
    { label: "Forest Morning", url: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80" },
    { label: "Desert Dunes", url: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&q=80" },
    { label: "City Lights", url: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80" },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-24">
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 pt-10 pb-8">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-2">
          <div>
            <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-1">Tool</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
              Image Color Extractor
            </h1>
          </div>
          <p className="text-slate-500 sm:mb-1 sm:ml-2 text-sm max-w-md">
            Upload any image to extract its dominant color palette. Find the closest ColorArchive match for each color.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 space-y-8">
        {/* Upload Area */}
        <div
          className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer bg-white ${
            isDragging
              ? "border-indigo-400 bg-indigo-50"
              : "border-slate-200 hover:border-slate-300"
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {imageUrl ? (
            <div className="p-4 flex flex-col sm:flex-row items-start gap-6">
              {/* Preview */}
              <div className="shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={imageRef}
                  src={imageUrl}
                  alt="Uploaded image"
                  className="w-full sm:w-56 h-40 object-cover rounded-xl shadow-sm"
                />
                <p className="text-xs text-slate-400 mt-1 truncate max-w-[14rem]">{imageName}</p>
              </div>
              {/* Extracted palette preview */}
              {extractedColors.length > 0 && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                    Extracted palette
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {extractedColors.map((color) => (
                      <div
                        key={color.hex}
                        className="group flex flex-col items-center gap-1"
                        style={{ minWidth: 52 }}
                      >
                        <div
                          className="w-12 h-12 rounded-lg shadow-sm cursor-pointer hover:scale-110 transition-transform"
                          style={{ backgroundColor: color.hex }}
                          onClick={(e) => { e.stopPropagation(); handleCopyHex(color.hex); }}
                          title={`Copy ${color.hex}`}
                        />
                        <span className="text-[10px] font-mono text-slate-500 group-hover:text-slate-700">
                          {copyStates[color.hex] === "copied" ? "✓" : color.hex}
                        </span>
                        <span className="text-[10px] text-slate-400">{color.percentage}%</span>
                      </div>
                    ))}
                  </div>
                  <button
                    className="mt-3 text-xs text-indigo-600 hover:text-indigo-800 underline"
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  >
                    Upload different image
                  </button>
                </div>
              )}
              {isProcessing && (
                <div className="flex-1 flex items-center justify-center py-8">
                  <div className="flex items-center gap-2 text-slate-400">
                    <div className="w-4 h-4 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
                    <span className="text-sm">Analyzing colors…</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl mb-4">
                🖼
              </div>
              <p className="text-slate-700 font-medium mb-1">
                {isDragging ? "Drop image here" : "Drop an image or click to upload"}
              </p>
              <p className="text-slate-400 text-sm">PNG, JPG, GIF, WebP — up to 20MB</p>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-500 font-medium whitespace-nowrap">Colors to extract:</label>
            <select
              value={colorCount}
              onChange={(e) => setColorCount(Number(e.target.value))}
              className="text-sm border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              {[4, 5, 6, 7, 8, 10, 12].map((n) => (
                <option key={n} value={n}>{n} colors</option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-500">
            <input
              type="checkbox"
              checked={showMatches}
              onChange={(e) => setShowMatches(e.target.checked)}
              className="rounded"
            />
            Show closest archive match
          </label>
        </div>

        {/* Sample images */}
        {!imageUrl && (
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Try a sample image
            </p>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_IMAGES.map((sample) => (
                <button
                  key={sample.label}
                  onClick={(e) => {
                    e.stopPropagation();
                    setImageUrl(sample.url);
                    setImageName(sample.label);
                    processImage(sample.url);
                  }}
                  className="px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-600 hover:border-indigo-300 hover:text-indigo-700 transition-colors"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results: matched colors detail */}
        {matchedColors.length > 0 && (
          <section>
            {/* Shared palette banner */}
            {isSharedView && (
              <div className="mb-4 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm">
                <span>Shared palette</span>
                <span className="text-indigo-400">·</span>
                <span className="text-indigo-500 text-xs">Upload your own image to extract a new palette</span>
              </div>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="text-lg font-semibold text-slate-800">Color Details</h2>
              <div className="flex flex-wrap items-center gap-2">
                <AddMatchesToPaletteButton matchedColors={matchedColors} />
                {shareUrl && (
                  <>
                    <ShareLinkButton href={shareUrl} label="Copy link" />
                    <ShareOnXButton text={xShareText} href={shareUrl} />
                    <ProGate label="Download SVG">
                      <button
                        onClick={handleDownloadSvg}
                        className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-neutral-600 transition hover:bg-neutral-950 hover:text-white"
                      >
                        Download SVG
                      </button>
                    </ProGate>
                  </>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {matchedColors.map((mc, i) => {
                const c = mc.extracted;
                const isLight = c.l > 60;
                return (
                  <div key={c.hex} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    {/* Swatch */}
                    <div
                      className="h-24 w-full relative"
                      style={{ backgroundColor: c.hex }}
                    >
                      {!isSharedView && (
                        <span
                          className={`absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full ${
                            isLight ? "bg-black/10 text-black/60" : "bg-white/20 text-white/80"
                          }`}
                        >
                          #{i + 1} · {c.percentage}%
                        </span>
                      )}
                      <button
                        className={`absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full transition-colors ${
                          isLight
                            ? "bg-black/10 hover:bg-black/20 text-black/70"
                            : "bg-white/20 hover:bg-white/30 text-white/90"
                        }`}
                        onClick={() => handleCopyHex(c.hex)}
                      >
                        {copyStates[c.hex] === "copied" ? "✓ Copied" : "Copy hex"}
                      </button>
                    </div>

                    {/* Values */}
                    <div className="p-3 space-y-1.5">
                      <p className="font-mono text-sm text-slate-800 font-medium">{c.hex}</p>
                      <p className="text-xs text-slate-400">
                        RGB {c.r}, {c.g}, {c.b}
                      </p>
                      <p className="text-xs text-slate-400">
                        HSL {Math.round(c.h)}°, {Math.round(c.s)}%, {Math.round(c.l)}%
                      </p>

                      {/* Archive match */}
                      {showMatches && mc.archiveId && (
                        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-2">
                          <div
                            className="w-5 h-5 rounded shrink-0 border border-slate-100"
                            style={{ backgroundColor: mc.archiveHex ?? c.hex }}
                          />
                          <div className="min-w-0">
                            <Link
                              href={`/colors/${mc.archiveId}/`}
                              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium truncate block"
                            >
                              {mc.archiveName}
                            </Link>
                            <p className="text-[10px] text-slate-400">Closest archive color</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Export */}
        {extractedColors.length > 0 && (
          <ProGate label="Export Palette">
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <h2 className="text-lg font-semibold text-slate-800">Export Palette</h2>
              <div className="flex items-center gap-2 flex-wrap">
                {(["hex", "rgb", "hsl", "css", "json"] as ExportFormat[]).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setExportFormat(fmt)}
                    className={`px-3 py-1 text-xs font-mono rounded-lg transition-colors ${
                      exportFormat === fmt
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {fmt.toUpperCase()}
                  </button>
                ))}
                <button
                  onClick={handleExport}
                  className="px-4 py-1.5 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors ml-2"
                >
                  {exportCopied ? "✓ Copied!" : "Copy"}
                </button>
              </div>
            </div>
            <pre className="text-xs font-mono text-slate-600 bg-slate-50 rounded-xl p-4 overflow-auto whitespace-pre-wrap max-h-48">
              {exportText}
            </pre>
          </section>
          </ProGate>
        )}

        {/* How it works */}
        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-slate-800 mb-3">How it works</h2>
          <div className="grid sm:grid-cols-3 gap-4 text-sm text-slate-500">
            <div>
              <p className="font-medium text-slate-700 mb-1">1. Sample</p>
              <p>The image is drawn to a canvas and sampled — up to 10,000 pixels are read across the full image area.</p>
            </div>
            <div>
              <p className="font-medium text-slate-700 mb-1">2. Cluster</p>
              <p>Pixels are grouped into color clusters using a quantize-then-refine algorithm. Similar colors merge into one representative.</p>
            </div>
            <div>
              <p className="font-medium text-slate-700 mb-1">3. Match</p>
              <p>Each cluster centroid is matched against the full 2,016-color ColorArchive using weighted RGB distance.</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-4">
            All processing happens locally in your browser — images are never uploaded to any server.
          </p>
        </section>

        {/* Related tools */}
        <section>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Related tools</p>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/contrast/", label: "Contrast Checker" },
              { href: "/palette/", label: "Palette Builder" },
              { href: "/harmonies/", label: "Color Harmonies" },
              { href: "/tokens/", label: "Token Generator" },
              { href: "/brand/", label: "Brand Color System" },
              { href: "/convert/", label: "Color Converter" },
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

      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />
    </main>
  );
}
