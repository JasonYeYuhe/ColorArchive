"use client";

import Link from "next/link";
import { useEffect, useState, useMemo, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { colors as allColors } from "@/src/data/colors";
import {
  addToPalette,
  addManyToPalette,
  buildPaletteCssExport,
  buildPaletteJsonExport,
  getPaletteIds,
  replacePalette,
  subscribeToPalette,
  MAX_SIZE,
} from "@/src/lib/palette-builder";
import { parsePaletteInput } from "@/src/lib/palette-import";
import type { ColorRecord } from "@/src/types/color";

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return undefined;
    const t = window.setTimeout(() => setCopied(false), 1400);
    return () => window.clearTimeout(t);
  }, [copied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void handleCopy()}
      className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-neutral-600 transition hover:bg-neutral-950 hover:text-white"
    >
      {copied ? `${label} copied` : `Copy ${label}`}
    </button>
  );
}

function ShareUrlButton({ ids }: { ids: string[] }) {
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
      {copied ? "Link copied!" : "Share link"}
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
          {inPalette ? "✓ In builder" : "+ Add to builder"}
        </button>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-black/10 bg-white/60 px-6 py-20 text-center">
      <div className="text-5xl" aria-hidden="true">
        🎨
      </div>
      <h2 className="mt-6 text-xl font-semibold tracking-[-0.03em] text-neutral-950">
        No colors in this palette
      </h2>
      <p className="mt-3 max-w-md text-sm leading-6 text-neutral-500">
        Add colors to your palette builder from any color card, then come back here to view and share
        your palette. Or paste a shared palette URL to see someone else&apos;s picks.
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          href="/all-colors"
          className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-white transition hover:bg-neutral-800"
        >
          Browse colors
        </Link>
        <Link
          href="/search"
          className="rounded-full border border-black/8 bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-neutral-600 transition hover:bg-neutral-50"
        >
          Search archive
        </Link>
      </div>
    </div>
  );
}

function PaletteContent() {
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
    return <EmptyState />;
  }

  const cssExport = buildPaletteCssExport(paletteColors);
  const jsonExport = buildPaletteJsonExport(paletteColors);

  return (
    <div className="space-y-6">
      {/* Swatch strip */}
      <PaletteSwatchRow colors={paletteColors} />

      {/* Info bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[1.4rem] border border-black/6 bg-white/78 px-5 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
            {isFromUrl ? "Shared palette" : "Your palette"} · {paletteColors.length} color
            {paletteColors.length === 1 ? "" : "s"}
          </div>
          {isFromUrl && (
            <p className="mt-1 text-sm text-neutral-500">
              Someone shared this palette with you. Add colors to your own builder to keep them.
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <CopyButton value={cssExport} label="CSS" />
          <CopyButton value={jsonExport} label="JSON" />
          <ShareUrlButton ids={paletteColors.map((c) => c.id)} />
          {isFromUrl && (
            <button
              type="button"
              onClick={addAllToBuilder}
              className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-neutral-600 transition hover:bg-neutral-950 hover:text-white"
            >
              + Add all to builder
            </button>
          )}
        </div>
      </div>

      <div className="rounded-[1.6rem] border border-black/6 bg-white/72 p-5">
        <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
          Import palette
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
            Replace builder
          </button>
          <button
            type="button"
            onClick={() => handleImport("append")}
            className="rounded-full border border-black/8 bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-neutral-600 transition hover:bg-neutral-50"
          >
            Append to builder
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
          CSS variables
        </div>
        <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-sm leading-6 text-neutral-600">
          {cssExport}
        </pre>
      </div>

      {/* JSON preview */}
      <div className="rounded-[1.6rem] border border-black/6 bg-white/72 p-5">
        <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
          JSON export
        </div>
        <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-sm leading-6 text-neutral-600">
          {jsonExport}
        </pre>
      </div>

      <div className="rounded-[1.6rem] border border-black/6 bg-white/72 p-5">
        <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
          Token workflow exports
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
            Figma tokens
          </a>
          <a
            href="/downloads/colorarchive-style-dictionary.json"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-black/8 bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-neutral-600 transition hover:bg-neutral-50"
          >
            Style Dictionary
          </a>
          <a
            href="/downloads/colorarchive.gpl"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-black/8 bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-neutral-600 transition hover:bg-neutral-50"
          >
            GPL palette
          </a>
          <a
            href="/downloads/colorarchive-sketchpalette.json"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-black/8 bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-neutral-600 transition hover:bg-neutral-50"
          >
            Sketch palette
          </a>
          <a
            href="/downloads/colorarchive.ase"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-black/8 bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-neutral-600 transition hover:bg-neutral-50"
          >
            ASE swatches
          </a>
        </div>
      </div>
    </div>
  );
}

export function PalettePage() {
  return (
    <main className="px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        <section className="rounded-[2rem] border border-black/6 bg-white/78 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="mb-6">
            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-4xl">
              Palette
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500">
              View, export, and share curated color palettes. Copy a shareable link or export as CSS
              variables and JSON.
            </p>
          </div>

          <Suspense
            fallback={
              <div className="flex items-center justify-center rounded-[1.6rem] border border-dashed border-black/10 bg-white/60 py-20">
                <div className="text-sm text-neutral-400">Loading palette...</div>
              </div>
            }
          >
            <PaletteContent />
          </Suspense>
        </section>
      </div>
    </main>
  );
}
