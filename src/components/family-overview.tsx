"use client";

import Link from "next/link";
import { useLocale } from "@/src/components/locale-provider";
import { COLOR_FAMILIES, sortColors } from "@/src/lib/color-utils";
import { getFamilySlug } from "@/src/lib/color-family-pages";
import type { ColorFamily, ColorRecord } from "@/src/types/color";

interface FamilyOverviewProps {
  activeFamily: ColorFamily | "All";
  colors: readonly ColorRecord[];
  onFamilySelect: (family: ColorFamily | "All") => void;
}

function getFamilySamples(colors: readonly ColorRecord[]) {
  if (colors.length === 0) {
    return ["#F2F0EB", "#E7E2D8", "#D7D1C4"];
  }

  const hueSorted = sortColors(colors, "hue");
  const first = hueSorted[0]?.hex ?? "#F2F0EB";
  const middle = hueSorted[Math.floor(hueSorted.length / 2)]?.hex ?? first;
  const last = hueSorted[hueSorted.length - 1]?.hex ?? middle;

  return [first, middle, last];
}

export function FamilyOverview({ activeFamily, colors, onFamilySelect }: FamilyOverviewProps) {
  const { t } = useLocale();
  return (
    <section className="space-y-4 px-1">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-[-0.03em] text-neutral-950">
            {t("family.colorFamilies")}
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            {t("family.desc")}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onFamilySelect("All")}
          className={`w-fit rounded-full px-3 py-1.5 text-sm transition ${
            activeFamily === "All"
              ? "bg-neutral-950 text-white"
              : "border border-black/8 bg-white/80 text-neutral-700 hover:bg-white"
          }`}
        >
          {t("family.viewAll")}
        </button>
        <Link
          href="/families/"
          className="w-fit rounded-full border border-black/8 bg-white/80 px-3 py-1.5 text-sm text-neutral-700 transition hover:bg-white"
        >
          {t("family.openFamilyPages")}
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {COLOR_FAMILIES.map((family) => {
          const familyColors = colors.filter((color) => color.family === family);
          const [first, middle, last] = getFamilySamples(familyColors);
          const isActive = activeFamily === family;

          return (
            <article
              key={family}
              className={`overflow-hidden rounded-[1.4rem] border text-left transition ${
                isActive
                  ? "border-neutral-950/15 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.08)]"
                  : "border-black/6 bg-white/78 hover:bg-white hover:shadow-[0_18px_40px_rgba(15,23,42,0.06)]"
              }`}
            >
              <div
                className="h-24 w-full border-b border-black/6"
                style={{
                  background: `linear-gradient(135deg, ${first} 0%, ${middle} 50%, ${last} 100%)`,
                }}
                aria-hidden="true"
              />
              <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-base font-semibold tracking-[-0.02em] text-neutral-950">
                      {family}
                    </div>
                    <div className="mt-1 text-sm text-neutral-500">
                      {familyColors.length === 0
                        ? t("family.noMatches")
                        : `${familyColors.length} ${familyColors.length === 1 ? t("family.colorSingular") : t("family.colorPlural")}`}
                    </div>
                  </div>
                  <div
                    className={`rounded-full px-2.5 py-1 text-xs font-medium uppercase tracking-[0.16em] ${
                      isActive
                        ? "bg-neutral-950 text-white"
                        : "border border-black/6 bg-neutral-50 text-neutral-400"
                    }`}
                  >
                    {isActive ? t("family.active") : t("family.familyLabel")}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onFamilySelect(family)}
                    className={`rounded-full px-3 py-1.5 text-sm transition ${
                      isActive
                        ? "bg-neutral-950 text-white"
                        : "border border-black/8 bg-white text-neutral-700 hover:bg-neutral-50"
                    }`}
                  >
                    {isActive ? t("family.filtered") : t("family.filterArchive")}
                  </button>
                  <Link
                    href={`/families/${getFamilySlug(family)}`}
                    className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-sm text-neutral-700 transition hover:bg-neutral-50"
                  >
                    {t("family.familyPage")}
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
