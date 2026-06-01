"use client";

import { useMemo } from "react";
import Link from "next/link";
import { getColorOfDay, getAnalogousColors, todayDateStr, formatDateStr } from "@/src/lib/color-of-day";
import { ShareOnXButton, ShareLinkButton } from "@/src/components/share-link-button";
import { CotdSubscribeForm } from "@/src/components/cotd-subscribe-form";
import { LogToJournalButton } from "@/src/components/log-to-journal-button";

export function ColorOfDayPage() {
  const dateStr = useMemo(() => todayDateStr(), []);
  const color = useMemo(() => getColorOfDay(dateStr), [dateStr]);
  const analogous = useMemo(() => getAnalogousColors(color, 3), [color]);
  const formattedDate = useMemo(() => formatDateStr(dateStr), [dateStr]);

  const rgb = color.rgb;
  const luminance = (() => {
    const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!match) return 128;
    return 0.299 * Number(match[1]) + 0.587 * Number(match[2]) + 0.114 * Number(match[3]);
  })();
  const isLight = luminance > 150;
  const textColor = isLight ? "text-black/70" : "text-white/80";
  const textColorStrong = isLight ? "text-black/90" : "text-white";
  const badgeBg = isLight ? "bg-black/8" : "bg-white/15";

  const xText = `Today's ColorArchive color is ${color.name} — ${color.hex} ✦ ${formattedDate} #colorarchive #coloroftheday`;
  const shareUrl = "/today/";

  return (
    <main className="min-h-screen">
      {/* Hero swatch — full viewport height on mobile, 50vh on desktop */}
      <section
        className="relative flex flex-col items-center justify-center min-h-[55vw] sm:min-h-[45vh] px-6 py-16 text-center"
        style={{ backgroundColor: color.hex }}
      >
        {/* Date badge */}
        <div className={`text-xs font-semibold uppercase tracking-[0.2em] mb-4 ${textColor}`}>
          {formattedDate}
        </div>

        {/* Color name */}
        <h1 className={`font-display text-4xl sm:text-6xl font-light tracking-tight mb-3 ${textColorStrong}`}>
          {color.name}
        </h1>

        {/* Hex */}
        <div className={`font-mono text-base sm:text-lg mb-6 ${textColor}`}>
          {color.hex.toUpperCase()}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          <span className={`text-xs font-medium px-3 py-1 rounded-full ${badgeBg} ${textColor}`}>
            {color.family}
          </span>
          <span className={`text-xs font-mono px-3 py-1 rounded-full ${badgeBg} ${textColor}`}>
            {color.hsl}
          </span>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Link
            href={`/colors/${color.id}/`}
            className={`px-4 py-2 rounded-full text-xs font-semibold border transition-colors ${
              isLight
                ? "border-black/20 text-black/80 hover:bg-black/8"
                : "border-white/30 text-white hover:bg-white/15"
            }`}
          >
            View in Archive →
          </Link>
          <ShareLinkButton href={shareUrl} label="Copy link" />
          <ShareOnXButton text={xText} href={shareUrl} />
          <LogToJournalButton color={color} variant="primary" />
        </div>
      </section>

      {/* Analogous companions */}
      {analogous.length > 0 && (
        <section className="max-w-2xl mx-auto px-4 py-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-4 text-center">
            Today&apos;s palette companions
          </p>
          <div className="grid grid-cols-3 gap-3">
            {analogous.map((c) => {
              const cLum = (() => {
                const m = c.rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
                if (!m) return 128;
                return 0.299 * Number(m[1]) + 0.587 * Number(m[2]) + 0.114 * Number(m[3]);
              })();
              const cIsLight = cLum > 150;
              return (
                <Link key={c.id} href={`/colors/${c.id}/`}>
                  <div
                    className="h-24 rounded-xl shadow-sm hover:scale-105 transition-transform flex flex-col justify-end p-2.5"
                    style={{ backgroundColor: c.hex }}
                  >
                    <span className={`text-[10px] font-medium truncate ${cIsLight ? "text-neutral-800/80" : "text-white/80"}`}>
                      {c.name}
                    </span>
                    <span className={`text-[9px] font-mono ${cIsLight ? "text-neutral-700/60" : "text-white/60"}`}>
                      {c.hex}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Color values */}
      <section className="max-w-2xl mx-auto px-4 pb-8">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-sm p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-3">Color values</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: "HEX", value: color.hex.toUpperCase() },
              { label: "RGB", value: color.rgb },
              { label: "HSL", value: color.hsl },
            ].map(({ label, value }) => (
              <button
                key={label}
                onClick={() => navigator.clipboard.writeText(value)}
                className="text-left p-3 bg-neutral-50 hover:bg-neutral-100 dark:bg-white/5 dark:hover:bg-white/10 rounded-xl transition-colors"
              >
                <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-1">{label}</div>
                <div className="text-xs font-mono text-neutral-700 dark:text-neutral-300 truncate">{value}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Subscribe widget */}
      <section className="max-w-2xl mx-auto px-4 pb-16">
        <CotdSubscribeForm colorHex={color.hex} />
      </section>
    </main>
  );
}
