"use client";

import type { ColorCollection } from "@/src/lib/collections";
import { hexContrastRatio, wcagLabel } from "@/src/lib/brand-palette";

function RatioBadge({ ratio }: { ratio: number }) {
  const label = wcagLabel(ratio);
  const color = label === "Fail" ? "text-red-500" : label === "AAA" ? "text-emerald-600" : "text-amber-600";
  return (
    <span className={`text-[10px] font-semibold ${color}`}>
      {ratio}:1 {label}
    </span>
  );
}

export function CollectionContrastCard({ collection }: { collection: ColorCollection }) {
  const colors = collection.palette;
  if (colors.length < 2) return null;

  return (
    <div className="mt-4 space-y-3">
      <p className="text-xs text-neutral-500">
        WCAG contrast ratios for all palette color pairs against white and black text.
      </p>

      {/* Color vs White/Black text */}
      <div className="space-y-1.5">
        {colors.map((c) => {
          const vsWhite = hexContrastRatio(c.hex, "#FFFFFF");
          const vsBlack = hexContrastRatio(c.hex, "#000000");
          return (
            <div key={c.hex} className="flex items-center gap-2 px-2 py-1.5 rounded-lg border border-black/4 bg-neutral-50 dark:bg-neutral-900">
              <div className="w-6 h-6 rounded-md border border-black/10 shrink-0" style={{ backgroundColor: c.hex }} />
              <span className="text-[10px] font-mono text-neutral-500 w-16 shrink-0 truncate">{c.hex}</span>
              <div className="flex-1 flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-sm bg-white border border-black/10" />
                  <RatioBadge ratio={vsWhite} />
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-sm bg-black" />
                  <RatioBadge ratio={vsBlack} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cross-pair matrix for first 5 colors */}
      {colors.length >= 3 && (
        <>
          <p className="text-xs text-neutral-500 pt-2">Color-on-color pairs:</p>
          <div className="space-y-1">
            {colors.slice(0, 5).flatMap((bg, i) =>
              colors.slice(i + 1, 5).map((fg) => {
                const ratio = hexContrastRatio(bg.hex, fg.hex);
                return (
                  <div key={`${bg.hex}-${fg.hex}`} className="flex items-center gap-2 px-2 py-1 rounded-lg border border-black/4 bg-neutral-50 dark:bg-neutral-900">
                    <div className="w-5 h-5 rounded-md border border-black/10" style={{ backgroundColor: bg.hex }} />
                    <span className="text-[10px] text-neutral-400">+</span>
                    <div className="w-5 h-5 rounded-md border border-black/10" style={{ backgroundColor: fg.hex }} />
                    <span className="flex-1" />
                    <RatioBadge ratio={ratio} />
                  </div>
                );
              }),
            )}
          </div>
        </>
      )}
    </div>
  );
}
