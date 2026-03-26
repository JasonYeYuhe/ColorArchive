"use client";

import { useState } from "react";
import { useLocale } from "@/src/components/locale-provider";
import {
  colorDecades,
  MOVEMENT_LABELS,
  MOVEMENT_LABELS_ZH,
  type ColorDecade,
  type DecadeMovement,
} from "@/src/lib/color-decades";

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="font-mono text-[10px] uppercase tracking-wider text-neutral-500 transition hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
      title={`Copy ${value}`}
    >
      {copied ? "✓" : label}
    </button>
  );
}

function DecadeCard({
  decade,
  locale,
}: {
  decade: ColorDecade;
  locale: string;
}) {
  const [expanded, setExpanded] = useState(false);

  const movementLabel =
    locale === "zh"
      ? MOVEMENT_LABELS_ZH[decade.movement]
      : MOVEMENT_LABELS[decade.movement];

  const loadInPalette = () => {
    const hexes = decade.colors
      .slice(0, 8)
      .map((c) => c.hex.replace("#", "").toLowerCase());
    const url = `/palette/?colors=${hexes.join(",")}`;
    window.open(url, "_blank");
  };

  return (
    <article className="group flex flex-col rounded-2xl border border-black/8 bg-white transition hover:border-black/12 hover:shadow-md dark:border-white/8 dark:bg-neutral-900 dark:hover:border-white/12">
      {/* Swatch strip */}
      <div className="flex h-20 overflow-hidden rounded-t-2xl">
        {decade.colors.map((color, i) => (
          <div
            key={i}
            className="flex-1 transition-all duration-300 group-hover:first:flex-[1.4]"
            style={{ backgroundColor: color.hex }}
            title={`${color.name} — ${color.hex}`}
          />
        ))}
      </div>

      <div className="flex flex-1 flex-col p-5">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <div className="mb-1.5 flex items-center gap-2 flex-wrap">
              <span className="text-2xl font-black tracking-tighter text-neutral-900 dark:text-neutral-100">
                {decade.decade}
              </span>
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                {movementLabel}
              </span>
            </div>
            <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              {decade.era}
            </p>
            <p className="text-[11px] text-neutral-400 dark:text-neutral-600 mt-0.5">
              {decade.period}
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="mb-4 text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">
          {decade.description}
        </p>

        {/* Color swatches with labels */}
        <div className="mb-4 grid grid-cols-3 gap-2">
          {decade.colors.map((color, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className="h-7 w-7 flex-shrink-0 rounded-md ring-1 ring-black/10 dark:ring-white/10"
                style={{ backgroundColor: color.hex }}
              />
              <div className="min-w-0">
                <p className="truncate text-[11px] font-medium text-neutral-700 dark:text-neutral-300">
                  {color.name}
                </p>
                <CopyButton value={color.hex} label={color.hex} />
              </div>
            </div>
          ))}
        </div>

        {/* Expandable context */}
        {expanded && (
          <div className="mb-4 rounded-xl border border-black/6 bg-neutral-50 p-4 dark:border-white/6 dark:bg-neutral-800/50">
            <p className="mb-3 text-[12px] leading-relaxed text-neutral-600 dark:text-neutral-400">
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                Historical context:{" "}
              </span>
              {decade.context}
            </p>
            <p className="text-[12px] leading-relaxed text-neutral-600 dark:text-neutral-400">
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                Modern influence:{" "}
              </span>
              {decade.influence}
            </p>
          </div>
        )}

        {/* Tags */}
        <div className="mb-4 flex flex-wrap gap-1.5">
          {decade.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-black/8 bg-neutral-50 px-2 py-0.5 text-[10px] text-neutral-500 dark:border-white/8 dark:bg-neutral-800 dark:text-neutral-400"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex-1 rounded-lg border border-black/10 py-1.5 text-[12px] font-medium text-neutral-600 transition hover:border-black/20 hover:bg-neutral-50 dark:border-white/10 dark:text-neutral-400 dark:hover:border-white/20 dark:hover:bg-neutral-800"
          >
            {expanded ? "Hide context" : "Show context"}
          </button>
          <button
            type="button"
            onClick={loadInPalette}
            className="flex-1 rounded-lg bg-neutral-900 py-1.5 text-[12px] font-medium text-white transition hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
          >
            Open palette →
          </button>
        </div>
      </div>
    </article>
  );
}

export function ColorDecadesPage() {
  const { locale } = useLocale();
  const [selectedMovement, setSelectedMovement] =
    useState<DecadeMovement | "all">("all");

  const allMovements = Array.from(
    new Set(colorDecades.map((d) => d.movement))
  );

  const filtered =
    selectedMovement === "all"
      ? colorDecades
      : colorDecades.filter((d) => d.movement === selectedMovement);

  const movementLabel = (m: DecadeMovement) =>
    locale === "zh" ? MOVEMENT_LABELS_ZH[m] : MOVEMENT_LABELS[m];

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 max-w-3xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-600">
            {locale === "zh" ? "色彩历史参考" : "Color History Reference"}
          </p>
          <h1 className="mb-4 text-4xl font-black tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-5xl">
            {locale === "zh"
              ? "色彩年代：百年设计配色史"
              : "Color Through the Decades"}
          </h1>
          <p className="text-base leading-relaxed text-neutral-600 dark:text-neutral-400 sm:text-lg">
            {locale === "zh"
              ? "探索从1920年代爵士时代到2020年代亲生物设计，每个十年如何形成其独特的色彩美学——以及这些色彩今天如何影响当代设计。"
              : "Explore how each decade from the 1920s Jazz Age to the 2020s Biophilic era shaped its own color aesthetic — and how those palettes continue to influence contemporary design."}
          </p>
        </div>

        {/* Stats bar */}
        <div className="mb-8 flex items-center gap-6 text-[12px] text-neutral-500 dark:text-neutral-500">
          <span>
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">
              {colorDecades.length}
            </span>{" "}
            {locale === "zh" ? "个年代" : "decades"}
          </span>
          <span>
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">
              {colorDecades.reduce((s, d) => s + d.colors.length, 0)}
            </span>{" "}
            {locale === "zh" ? "种色彩" : "signature colors"}
          </span>
          <span>
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">
              100
            </span>{" "}
            {locale === "zh" ? "年设计史" : "years of design history"}
          </span>
        </div>

        {/* Movement filter */}
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedMovement("all")}
            className={`rounded-full px-3.5 py-1.5 text-[12px] font-medium transition ${
              selectedMovement === "all"
                ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                : "border border-black/10 bg-white text-neutral-600 hover:border-black/20 dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:border-white/20"
            }`}
          >
            {locale === "zh" ? "全部" : "All Eras"}
          </button>
          {allMovements.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setSelectedMovement(m)}
              className={`rounded-full px-3.5 py-1.5 text-[12px] font-medium transition ${
                selectedMovement === m
                  ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                  : "border border-black/10 bg-white text-neutral-600 hover:border-black/20 dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:border-white/20"
              }`}
            >
              {movementLabel(m)}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((decade) => (
            <DecadeCard
              key={decade.id}
              decade={decade}
              locale={locale}
            />
          ))}
        </div>

        {/* Context section */}
        <div className="mt-16 border-t border-black/8 pt-12 dark:border-white/8">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-4 text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              {locale === "zh"
                ? "色彩如何定义时代"
                : "How Color Defines an Era"}
            </h2>
            <div className="space-y-4 text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">
              <p>
                Each decade&apos;s characteristic palette emerges from the
                intersection of three forces: the available pigment and dye
                technology of the time, the economic and cultural conditions
                that shaped what people could afford and aspired to, and the
                creative movements that translated those conditions into
                aesthetic language.
              </p>
              <p>
                The 1950s&apos; pastel appliance colors were impossible before
                cheap synthetic dyes made them affordable at manufacturing
                scale. The 1980s&apos; fluorescent neons required day-glo
                technology developed for safety signage. The 2020s&apos; Very
                Peri emerged from screens — a blue-violet possible only in
                digital RGB space — reflecting a decade spent primarily on
                digital surfaces.
              </p>
              <p>
                When you reach for a &quot;retro&quot; color palette, you are
                reaching for a specific historical moment. Burnt orange is not
                just warm — it is 1973, harvest tables, vinyl record sleeves,
                the end of psychedelic excess. Millennial pink is not just soft
                — it is Instagram 2015, rose gold hardware, a particular decade
                of aspirational femininity. Color carries history.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
