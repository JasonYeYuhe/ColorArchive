"use client";

import Link from "next/link";
import { useEffect, useState, useMemo, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale } from "@/src/components/locale-provider";
import { ShareOnXButton } from "@/src/components/share-link-button";
import { ProGate } from "@/src/components/pro-gate";
import { hexToRgb } from "@/src/lib/color-utils";
import { colors as allColors } from "@/src/data/colors";
import { CopyButton } from "@/src/components/copy-button";
import {
  addToPalette,
  addManyToPalette,
  buildPaletteCssExport,
  buildPaletteJsonExport,
  buildPaletteTailwindExport,
  buildPaletteFigmaExport,
  buildPaletteStyleDictionaryExport,
  generatePaletteName,
  getPaletteIds,
  replacePalette,
  subscribeToPalette,
  MAX_SIZE,
} from "@/src/lib/palette-builder";
import { parsePaletteInput } from "@/src/lib/palette-import";
import { buildRecommendedColors } from "@/src/lib/color-recommendations";
import type { ColorRecord } from "@/src/types/color";

/* ------------------------------------------------------------------ */
/*  Binary export helpers                                              */
/* ------------------------------------------------------------------ */

/** CRC-32 used by ZIP */
function crc32(data: Uint8Array): number {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    t[i] = c;
  }
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) crc = t[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

/** Minimal ZIP archive with a single stored (uncompressed) file */
function singleFileZip(filename: string, content: Uint8Array): Uint8Array {
  const fn = new TextEncoder().encode(filename);
  const crc = crc32(content);
  const sz = content.length;

  const lh = new Uint8Array(30 + fn.length);
  const lv = new DataView(lh.buffer);
  lv.setUint32(0, 0x04034B50, true); // local file header sig
  lv.setUint16(4, 20, true);
  lv.setUint32(14, crc, true);
  lv.setUint32(18, sz, true);
  lv.setUint32(22, sz, true);
  lv.setUint16(26, fn.length, true);
  lh.set(fn, 30);

  const cdOffset = lh.length + sz;
  const cd = new Uint8Array(46 + fn.length);
  const cv = new DataView(cd.buffer);
  cv.setUint32(0, 0x02014B50, true); // central dir sig
  cv.setUint16(4, 20, true);
  cv.setUint16(6, 20, true);
  cv.setUint32(16, crc, true);
  cv.setUint32(20, sz, true);
  cv.setUint32(24, sz, true);
  cv.setUint16(28, fn.length, true);
  cd.set(fn, 46);

  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054B50, true);
  ev.setUint16(8, 1, true);
  ev.setUint16(10, 1, true);
  ev.setUint32(12, cd.length, true);
  ev.setUint32(16, cdOffset, true);

  const out = new Uint8Array(lh.length + sz + cd.length + eocd.length);
  let p = 0;
  out.set(lh, p); p += lh.length;
  out.set(content, p); p += sz;
  out.set(cd, p); p += cd.length;
  out.set(eocd, p);
  return out;
}

/** Procreate .swatches — ZIP containing Swatches.json */
function buildProcreateSwatches(colors: { name: string; hex: string }[]): Uint8Array {
  const swatches = colors.map((c) => {
    const rgb = hexToRgb(c.hex);
    return {
      name: c.name,
      colorSpace: 0,
      red: rgb ? rgb.r / 255 : 0,
      green: rgb ? rgb.g / 255 : 0,
      blue: rgb ? rgb.b / 255 : 0,
      alpha: 1.0,
    };
  });
  const json = JSON.stringify({ name: "ColorArchive Palette", swatches }, null, 2);
  return singleFileZip("Swatches.json", new TextEncoder().encode(json));
}

/** Adobe Swatch Exchange (.ase) binary format */
function buildAseBuffer(colors: { name: string; hex: string }[]): Uint8Array {
  const blocks: Uint8Array[] = [];
  for (const color of colors) {
    const rgb = hexToRgb(color.hex);
    if (!rgb) continue;
    // UTF-16 BE name + null terminator
    const units = color.name.length + 1;
    const nameBytes = new Uint8Array(units * 2);
    for (let i = 0; i < color.name.length; i++) {
      const ch = color.name.charCodeAt(i);
      nameBytes[i * 2] = (ch >> 8) & 0xFF;
      nameBytes[i * 2 + 1] = ch & 0xFF;
    }
    const blockLen = 2 + nameBytes.length + 4 + 4 + 4 + 4 + 2;
    const block = new Uint8Array(6 + blockLen);
    const v = new DataView(block.buffer);
    let p = 0;
    v.setUint16(p, 0x0001, false); p += 2;  // color entry
    v.setUint32(p, blockLen, false); p += 4;
    v.setUint16(p, units, false); p += 2;   // name length incl null
    block.set(nameBytes, p); p += nameBytes.length;
    block[p] = 0x52; block[p + 1] = 0x47; block[p + 2] = 0x42; block[p + 3] = 0x20; p += 4; // "RGB "
    v.setFloat32(p, rgb.r / 255, false); p += 4;
    v.setFloat32(p, rgb.g / 255, false); p += 4;
    v.setFloat32(p, rgb.b / 255, false); p += 4;
    v.setUint16(p, 0, false); // global color
    blocks.push(block);
  }
  const header = new Uint8Array(12);
  const hv = new DataView(header.buffer);
  header[0] = 0x41; header[1] = 0x53; header[2] = 0x45; header[3] = 0x46; // ASEF
  hv.setUint16(4, 1, false);
  hv.setUint16(6, 0, false);
  hv.setUint32(8, blocks.length, false);
  const total = new Uint8Array(header.length + blocks.reduce((s, b) => s + b.length, 0));
  let pos = 0;
  total.set(header, pos); pos += header.length;
  for (const b of blocks) { total.set(b, pos); pos += b.length; }
  return total;
}

function downloadBinary(data: Uint8Array, filename: string) {
  const blob = new Blob([data.buffer as ArrayBuffer], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function DownloadProcreateButton({ colors }: { colors: { name: string; hex: string }[] }) {
  if (colors.length === 0) return null;
  return (
    <button
      type="button"
      onClick={() => downloadBinary(buildProcreateSwatches(colors), "palette.swatches")}
      className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-neutral-600 transition hover:bg-neutral-950 hover:text-white"
    >
      Procreate
    </button>
  );
}

function DownloadAseButton({ colors }: { colors: { name: string; hex: string }[] }) {
  if (colors.length === 0) return null;
  return (
    <button
      type="button"
      onClick={() => downloadBinary(buildAseBuffer(colors), "palette.ase")}
      className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-neutral-600 transition hover:bg-neutral-950 hover:text-white"
    >
      Adobe (.ase)
    </button>
  );
}

/* ------------------------------------------------------------------ */

function DownloadPaletteSvgButton({ colors }: { colors: { id: string; name: string; hex: string }[] }) {
  function handleDownload() {
    const count = colors.length || 1;
    const w = 1200;
    const h = 400;
    const sw = w / count;
    const rects = colors.map((c, i) => `<rect x="${i * sw}" y="0" width="${sw}" height="${h - 60}" fill="${c.hex}"/>
<text x="${i * sw + sw / 2}" y="${h - 35}" text-anchor="middle" font-family="system-ui,sans-serif" font-size="13" font-weight="600" fill="#1a1a1a">${c.name.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</text>
<text x="${i * sw + sw / 2}" y="${h - 15}" text-anchor="middle" font-family="monospace" font-size="12" fill="#666">${c.hex}</text>`).join("\n");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="#fafaf9"/>${rects}</svg>`;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "palette.svg";
    a.click();
    URL.revokeObjectURL(url);
  }
  if (colors.length === 0) return null;
  return (
    <button type="button" onClick={handleDownload} className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-neutral-600 transition hover:bg-neutral-950 hover:text-white">
      Download SVG
    </button>
  );
}

function ShareUrlButton({ ids }: { ids: string[] }) {
  const { t } = useLocale();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return undefined;
    const t = window.setTimeout(() => setCopied(false), 1400);
    return () => window.clearTimeout(t);
  }, [copied]);

  const handleCopy = async () => {
    try {
      const url = new URL("/palette", window.location.origin);
      url.searchParams.set("ids", ids.join(","));
      await navigator.clipboard.writeText(url.toString());
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void handleCopy()}
      className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-white transition hover:bg-neutral-800"
    >
      {copied ? t("palette.linkCopied") : t("palette.shareLink")}
    </button>
  );
}

function PaletteSwatchRow({ colors }: { colors: ColorRecord[] }) {
  return (
    <div className="flex w-full overflow-hidden rounded-[1.6rem] border border-black/6 shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
      {colors.map((c) => (
        <Link
          key={c.id}
          href={`/colors/${c.id}/`}
          className="group relative flex-1 transition hover:flex-[1.3]"
          style={{ backgroundColor: c.hex, minHeight: "12rem" }}
          title={c.name}
        >
          <div className="absolute inset-x-0 bottom-0 translate-y-1 opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
            <div className="bg-gradient-to-t from-black/50 to-transparent px-3 pb-3 pt-8">
              <div className="text-sm font-semibold text-white">{c.name}</div>
              <div className="text-xs text-white/70">{c.hex}</div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function PaletteColorDetail({ color }: { color: ColorRecord }) {
  const { t } = useLocale();
  const [inPalette, setInPalette] = useState(false);
  const [paletteSize, setPaletteSize] = useState(0);

  useEffect(() => {
    const update = (ids: string[]) => {
      setInPalette(ids.includes(color.id));
      setPaletteSize(ids.length);
    };
    update(getPaletteIds());
    return subscribeToPalette(update);
  }, [color.id]);

  return (
    <div className="rounded-[1.6rem] border border-black/6 bg-white/84 p-4 transition hover:shadow-[0_18px_36px_rgba(15,23,42,0.06)]">
      <div className="flex items-start gap-3">
        <Link
          href={`/colors/${color.id}/`}
          className="swatch-shadow h-14 w-14 flex-shrink-0 rounded-xl border border-black/6"
          style={{ backgroundColor: color.hex }}
          title={`Open ${color.name}`}
        />
        <div className="min-w-0 flex-1">
          <Link
            href={`/colors/${color.id}/`}
            className="block truncate text-base font-semibold tracking-[-0.02em] text-neutral-950 hover:underline"
          >
            {color.name}
          </Link>
          <dl className="mt-1.5 space-y-1 text-sm text-neutral-500">
            <div className="flex items-center gap-2">
              <dt className="text-neutral-400">Hex</dt>
              <dd className="font-medium text-neutral-700">{color.hex}</dd>
            </div>
            <div className="flex items-center gap-2">
              <dt className="text-neutral-400">HSL</dt>
              <dd className="font-medium text-neutral-700">{color.hsl}</dd>
            </div>
            <div className="flex items-center gap-2">
              <dt className="text-neutral-400">RGB</dt>
              <dd className="font-medium text-neutral-700">{color.rgb}</dd>
            </div>
          </dl>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => addToPalette(color.id)}
          disabled={inPalette || paletteSize >= MAX_SIZE}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
            inPalette
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : paletteSize >= MAX_SIZE
                ? "cursor-not-allowed border-black/8 bg-neutral-50 text-neutral-300"
                : "border-black/8 bg-white text-neutral-600 hover:border-neutral-950/10 hover:bg-neutral-950 hover:text-white"
          }`}
        >
          {inPalette ? t("palette.inBuilder") : t("palette.addToBuilder")}
        </button>
      </div>
    </div>
  );
}

function EmptyState({ colors }: { colors: ColorRecord[] }) {
  const { t } = useLocale();
  const handleRandom = () => {
    const idx1 = Math.floor(Math.random() * colors.length);
    let idx2 = Math.floor(Math.random() * colors.length);
    while (idx2 === idx1) idx2 = Math.floor(Math.random() * colors.length);
    const seedIds = [colors[idx1].id, colors[idx2].id];
    const recommended = buildRecommendedColors({ colors, seedIds, excludeIds: seedIds, limit: 4 });
    addManyToPalette([...seedIds, ...recommended.map((c) => c.id)]);
  };
  return (
    <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-black/10 bg-white/60 px-6 py-20 text-center">
      <div className="text-5xl" aria-hidden="true">
        🎨
      </div>
      <h2 className="mt-6 text-xl font-semibold tracking-[-0.03em] text-neutral-950">
        {t("palette.noColors")}
      </h2>
      <p className="mt-3 max-w-md text-sm leading-6 text-neutral-500">
        Add colors to your palette builder from any color card, then come back here to view and share
        your palette. Or paste a shared palette URL to see someone else&apos;s picks.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={handleRandom}
          className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-white transition hover:bg-neutral-800"
        >
          ✦ Generate random palette
        </button>
        <Link
          href="/all-colors/"
          className="rounded-full border border-black/8 bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-neutral-600 transition hover:bg-neutral-50"
        >
          {t("palette.browseColors")}
        </Link>
        <Link
          href="/all-colors"
          className="rounded-full border border-black/8 bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-neutral-600 transition hover:bg-neutral-50"
        >
          {t("palette.searchArchive")}
        </Link>
      </div>
    </div>
  );
}

function PaletteContent() {
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const idsParam = searchParams.get("ids");

  const [builderIds, setBuilderIds] = useState<string[]>([]);
  const [importValue, setImportValue] = useState("");
  const [importStatus, setImportStatus] = useState("");

  useEffect(() => {
    setBuilderIds(getPaletteIds());
    return subscribeToPalette(setBuilderIds);
  }, []);

  const resolvedIds = useMemo(() => {
    if (idsParam) {
      return idsParam.split(",").filter(Boolean);
    }
    return builderIds;
  }, [idsParam, builderIds]);

  const paletteColors = useMemo(
    () =>
      resolvedIds
        .map((id) => allColors.find((c) => c.id === id))
        .filter((c): c is ColorRecord => Boolean(c)),
    [resolvedIds],
  );

  const isFromUrl = Boolean(idsParam);

  const addAllToBuilder = useCallback(() => {
    addManyToPalette(paletteColors.map((c) => c.id));
  }, [paletteColors]);

  const handleImport = useCallback(
    (mode: "replace" | "append") => {
      const { ids, error } = parsePaletteInput(importValue, allColors);

      if (ids.length === 0) {
        setImportStatus(error);
        return;
      }

      if (mode === "replace") {
        replacePalette(ids);
        setImportStatus(`Replaced builder with ${Math.min(ids.length, MAX_SIZE)} imported colors.`);
      } else {
        addManyToPalette(ids);
        setImportStatus(`Added up to ${Math.min(ids.length, MAX_SIZE)} imported colors to the builder.`);
      }
    },
    [importValue],
  );

  if (paletteColors.length === 0) {
    return <EmptyState colors={allColors} />;
  }

  const paletteName = generatePaletteName(paletteColors);

  useEffect(() => {
    if (isFromUrl) {
      document.title = `${paletteName} — ColorArchive`;
      return () => { document.title = "Palette Builder — ColorArchive"; };
    }
  }, [isFromUrl, paletteName]);

  const cssExport = buildPaletteCssExport(paletteColors);
  const jsonExport = buildPaletteJsonExport(paletteColors);
  const tailwindExport = buildPaletteTailwindExport(paletteColors);
  const figmaExport = buildPaletteFigmaExport(paletteColors);
  const styleDictExport = buildPaletteStyleDictionaryExport(paletteColors);

  return (
    <div className="space-y-6">
      {/* Swatch strip */}
      <PaletteSwatchRow colors={paletteColors} />

      {/* Info bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[1.4rem] border border-black/6 bg-white/78 px-5 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
            {isFromUrl ? t("palette.sharedPalette") : t("palette.yourPalette")} · {paletteColors.length} {paletteColors.length === 1 ? t("palette.color") : t("palette.colors")}
          </div>
          <div className="mt-1 text-lg font-semibold tracking-[-0.02em] text-neutral-950">
            {paletteName}
          </div>
          {isFromUrl && (
            <p className="mt-1 text-sm text-neutral-500">
              Someone shared this palette with you. Add colors to your own builder to keep them.
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <ProGate label="Export">
            <CopyButton value={cssExport} label="CSS" />
          </ProGate>
          <ProGate label="Export">
            <CopyButton value={jsonExport} label="JSON" />
          </ProGate>
          <ProGate label="Download">
            <DownloadPaletteSvgButton colors={paletteColors} />
          </ProGate>
          <ProGate label="Download">
            <DownloadProcreateButton colors={paletteColors} />
          </ProGate>
          <ProGate label="Download">
            <DownloadAseButton colors={paletteColors} />
          </ProGate>
          <ShareUrlButton ids={paletteColors.map((c) => c.id)} />
          <ShareOnXButton
            href={`/palette?ids=${paletteColors.map((c) => c.id).join(",")}`}
            text={`Check out this ${paletteColors.length}-color palette from ColorArchive`}
          />
          {isFromUrl && (
            <button
              type="button"
              onClick={addAllToBuilder}
              className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-neutral-600 transition hover:bg-neutral-950 hover:text-white"
            >
              {t("palette.addAllToBuilder")}
            </button>
          )}
        </div>
      </div>

      <div className="rounded-[1.6rem] border border-black/6 bg-white/72 p-5">
        <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
          {t("palette.importPalette")}
        </div>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
          Paste a ColorArchive share URL, color ids, HEX values, or JSON with `id` / `hex` fields.
        </p>
        <textarea
          value={importValue}
          onChange={(event) => setImportValue(event.target.value)}
          placeholder={`Examples:
https://colorarchive.me/palette?ids=orchid-bloom-clear,rose-core-soft

orchid-bloom-clear
rose-core-soft
#E8C4B8

[{"hex":"#E8C4B8"},{"id":"rose-core-soft"}]`}
          className="mt-4 min-h-40 w-full rounded-[1.2rem] border border-black/8 bg-white px-4 py-3 text-sm leading-6 text-neutral-900 outline-none transition focus:border-neutral-900/20 focus:ring-4 focus:ring-neutral-900/8"
        />
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleImport("replace")}
            className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-white transition hover:bg-neutral-800"
          >
            {t("palette.replaceBuilder")}
          </button>
          <button
            type="button"
            onClick={() => handleImport("append")}
            className="rounded-full border border-black/8 bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-neutral-600 transition hover:bg-neutral-50"
          >
            {t("palette.appendToBuilder")}
          </button>
        </div>
        {importStatus ? (
          <div className="mt-3 text-sm text-neutral-500">{importStatus}</div>
        ) : null}
      </div>

      {/* Color detail cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {paletteColors.map((c) => (
          <PaletteColorDetail key={c.id} color={c} />
        ))}
      </div>

      {/* CSS preview */}
      <div className="rounded-[1.6rem] border border-black/6 bg-white/72 p-5">
        <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
          {t("palette.cssVariables")}
        </div>
        <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-sm leading-6 text-neutral-600">
          {cssExport}
        </pre>
      </div>

      {/* JSON preview */}
      <div className="rounded-[1.6rem] border border-black/6 bg-white/72 p-5">
        <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
          {t("palette.jsonExport")}
        </div>
        <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-sm leading-6 text-neutral-600">
          {jsonExport}
        </pre>
      </div>

      {/* Tailwind preview */}
      <div className="rounded-[1.6rem] border border-black/6 bg-white/72 p-5">
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
            Tailwind Config
          </div>
          <CopyButton value={tailwindExport} label="Tailwind" />
        </div>
        <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-sm leading-6 text-neutral-600">
          {tailwindExport}
        </pre>
      </div>

      {/* Figma tokens preview */}
      <div className="rounded-[1.6rem] border border-black/6 bg-white/72 p-5">
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
            Figma Design Tokens
          </div>
          <CopyButton value={figmaExport} label="Figma" />
        </div>
        <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-sm leading-6 text-neutral-600">
          {figmaExport}
        </pre>
      </div>

      {/* Style Dictionary preview */}
      <div className="rounded-[1.6rem] border border-black/6 bg-white/72 p-5">
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
            Style Dictionary
          </div>
          <CopyButton value={styleDictExport} label="Style Dict" />
        </div>
        <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-sm leading-6 text-neutral-600">
          {styleDictExport}
        </pre>
      </div>

      <div className="rounded-[1.6rem] border border-black/6 bg-white/72 p-5">
        <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
          {t("palette.tokenWorkflows")}
        </div>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
          For larger design-system workflows, use the prebuilt static exports generated from the archive.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href="/downloads/colorarchive-figma-tokens.json"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-black/8 bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-neutral-600 transition hover:bg-neutral-50"
          >
            {t("palette.figmaTokens")}
          </a>
          <a
            href="/downloads/colorarchive-style-dictionary.json"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-black/8 bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-neutral-600 transition hover:bg-neutral-50"
          >
            {t("palette.styleDictionary")}
          </a>
          <a
            href="/downloads/colorarchive.gpl"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-black/8 bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-neutral-600 transition hover:bg-neutral-50"
          >
            {t("palette.gplPalette")}
          </a>
          <a
            href="/downloads/colorarchive-sketchpalette.json"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-black/8 bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-neutral-600 transition hover:bg-neutral-50"
          >
            {t("palette.sketchPalette")}
          </a>
          <a
            href="/downloads/colorarchive.ase"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-black/8 bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-neutral-600 transition hover:bg-neutral-50"
          >
            {t("palette.aseSwatches")}
          </a>
        </div>
      </div>
    </div>
  );
}

function PaletteGeneratorSection() {
  const { t } = useLocale();
  const [hexInput, setHexInput] = useState("4A90D9");
  const [expanded, setExpanded] = useState(false);

  const hsl = useMemo(() => {
    const match = hexInput.match(/^([0-9a-f]{6})$/i);
    if (!match) return null;
    const r = parseInt(match[1].slice(0, 2), 16) / 255;
    const g = parseInt(match[1].slice(2, 4), 16) / 255;
    const b = parseInt(match[1].slice(4, 6), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const l = (max + min) / 2;
    if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h = 0;
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  }, [hexInput]);

  const hslToHex = useCallback((h: number, s: number, l: number): string => {
    const sN = s / 100, lN = l / 100;
    const q = lN < 0.5 ? lN * (1 + sN) : lN + sN - lN * sN;
    const p = 2 * lN - q;
    const hN = h / 360;
    const hue2rgb = (p2: number, q2: number, t: number) => {
      let t2 = t;
      if (t2 < 0) t2 += 1;
      if (t2 > 1) t2 -= 1;
      if (t2 < 1 / 6) return p2 + (q2 - p2) * 6 * t2;
      if (t2 < 1 / 2) return q2;
      if (t2 < 2 / 3) return p2 + (q2 - p2) * (2 / 3 - t2) * 6;
      return p2;
    };
    const rv = Math.round(hue2rgb(p, q, hN + 1 / 3) * 255);
    const gv = Math.round(hue2rgb(p, q, hN) * 255);
    const bv = Math.round(hue2rgb(p, q, hN - 1 / 3) * 255);
    return `#${[rv, gv, bv].map(c => c.toString(16).padStart(2, "0")).join("").toUpperCase()}`;
  }, []);

  const harmonies = useMemo(() => {
    if (!hsl) return [];
    const { h, s, l } = hsl;
    return [
      { name: "Complementary", colors: [{ hex: hslToHex(h, s, l), label: "Base" }, { hex: hslToHex((h + 180) % 360, s, l), label: "Complement" }] },
      { name: "Analogous", colors: [{ hex: hslToHex((h + 330) % 360, s, l), label: "-30°" }, { hex: hslToHex(h, s, l), label: "Base" }, { hex: hslToHex((h + 30) % 360, s, l), label: "+30°" }] },
      { name: "Triadic", colors: [{ hex: hslToHex(h, s, l), label: "Base" }, { hex: hslToHex((h + 120) % 360, s, l), label: "+120°" }, { hex: hslToHex((h + 240) % 360, s, l), label: "+240°" }] },
      { name: "Split-Complementary", colors: [{ hex: hslToHex(h, s, l), label: "Base" }, { hex: hslToHex((h + 150) % 360, s, l), label: "+150°" }, { hex: hslToHex((h + 210) % 360, s, l), label: "+210°" }] },
      { name: "Monochromatic", colors: [{ hex: hslToHex(h, s, 90), label: "Lightest" }, { hex: hslToHex(h, s, 70), label: "Light" }, { hex: hslToHex(h, s, 50), label: "Mid" }, { hex: hslToHex(h, s, 30), label: "Dark" }, { hex: hslToHex(h, s, 15), label: "Darkest" }] },
    ];
  }, [hsl, hslToHex]);

  const seedHex = hsl ? hslToHex(hsl.h, hsl.s, hsl.l) : "#000000";

  return (
    <section className="rounded-[2rem] border border-black/6 bg-white/78 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-neutral-900/78">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.04em] text-neutral-950 dark:text-white sm:text-3xl">
            {t("palette_generator_title") || "Palette Generator"}
          </h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Enter a seed color to generate harmonious palettes
          </p>
        </div>
        <span className={`text-xl text-neutral-400 transition ${expanded ? "rotate-180" : ""}`}>▾</span>
      </button>

      {expanded && (
        <div className="mt-6 space-y-6">
          <div className="flex items-center gap-4">
            <div
              className="h-14 w-14 shrink-0 rounded-2xl shadow-sm ring-1 ring-black/6 dark:ring-white/10"
              style={{ backgroundColor: hsl ? seedHex : "#000000" }}
            />
            <div className="flex flex-1 items-center rounded-xl border border-black/8 bg-white px-3 py-2.5 font-mono text-lg focus-within:ring-2 focus-within:ring-blue-500 dark:border-white/10 dark:bg-white/10">
              <span className="mr-0.5 select-none text-neutral-400">#</span>
              <input
                type="text"
                value={hexInput}
                onChange={(e) => setHexInput(e.target.value.replace(/[^0-9a-fA-F]/g, "").slice(0, 6))}
                maxLength={6}
                spellCheck={false}
                autoComplete="off"
                className="w-full bg-transparent uppercase text-neutral-900 outline-none placeholder:text-neutral-300 dark:text-white"
                placeholder="4A90D9"
              />
            </div>
            <input
              type="color"
              value={hsl ? seedHex : "#000000"}
              onChange={(e) => setHexInput(e.target.value.replace("#", "").toUpperCase())}
              className="h-10 w-10 shrink-0 cursor-pointer appearance-none rounded-xl border-0 bg-transparent p-0"
              aria-label="Pick a color"
            />
          </div>

          {harmonies.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2">
              {harmonies.map((harmony) => (
                <div key={harmony.name} className="rounded-[1.4rem] border border-black/6 bg-white/74 p-5 dark:border-white/8 dark:bg-white/5">
                  <h3 className="mb-4 text-base font-semibold text-neutral-900 dark:text-white">{harmony.name}</h3>
                  <div className="grid auto-cols-fr grid-flow-col gap-2">
                    {harmony.colors.map((c) => (
                      <div key={`${c.hex}-${c.label}`} className="flex flex-col items-center gap-1.5">
                        <button
                          type="button"
                          onClick={async () => { try { await navigator.clipboard.writeText(c.hex); } catch {} }}
                          className="aspect-square w-full rounded-xl shadow-sm transition-transform hover:scale-105"
                          style={{ backgroundColor: c.hex }}
                          title={`Copy ${c.hex}`}
                        />
                        <span className="text-[10px] font-medium tracking-wide text-neutral-500 dark:text-neutral-400">{c.hex}</span>
                        <span className="text-[9px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500">{c.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export function PalettePage() {
  const { t } = useLocale();
  return (
    <main className="px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        <nav className="mb-4 text-sm text-neutral-400">
          <Link href="/" className="transition hover:text-neutral-600">ColorArchive</Link>
          <span className="mx-2">&rsaquo;</span>
          <span className="text-neutral-600">{t("palette.heading")}</span>
        </nav>
        <section className="rounded-[2rem] border border-black/6 bg-white/78 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="mb-6">
            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-4xl">
              {t("palette.heading")}
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500">
              View, export, and share curated color palettes. Copy a shareable link or export as CSS
              variables and JSON.
            </p>
          </div>

          <Suspense
            fallback={
              <div className="flex items-center justify-center rounded-[1.6rem] border border-dashed border-black/10 bg-white/60 py-20">
                <div className="text-sm text-neutral-400">{t("palette.loadingPalette")}</div>
              </div>
            }
          >
            <PaletteContent />
          </Suspense>
        </section>

        {/* Palette Generator section */}
        <PaletteGeneratorSection />
      </div>
    </main>
  );
}
