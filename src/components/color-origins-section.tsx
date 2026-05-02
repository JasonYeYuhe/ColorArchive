"use client";

import type { ColorRecord } from "@/src/types/color";
import {
  getOriginFamily,
  getFamilyHeritage,
  getModifierProse,
} from "@/src/lib/color-origins";

interface Props {
  color: ColorRecord;
}

export function ColorOriginsSection({ color }: Props) {
  const family = getOriginFamily(color);
  const heritage = getFamilyHeritage(family);
  const modifier = getModifierProse(color);

  if (!heritage) return null;

  return (
    <section
      aria-labelledby={`origins-heading-${color.id}`}
      className="rounded-[1.6rem] border border-black/6 bg-white/72 p-5 dark:border-white/8 dark:bg-white/5"
    >
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <h2
          id={`origins-heading-${color.id}`}
          className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400 dark:text-neutral-500"
        >
          Color Origins
        </h2>
        <span className="text-[10px] uppercase tracking-wider text-neutral-300 dark:text-neutral-600">
          {family} family
        </span>
      </div>

      <p className="mt-3 text-sm font-medium text-neutral-700 dark:text-neutral-200">
        {heritage.tagline}
      </p>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <Article title="Heritage" body={heritage.heritage} />
        <Article title="Across cultures" body={heritage.cultures} />
        <Article title="In the wild" body={heritage.inTheWild} />
        <Article title="How it reads" body={heritage.howItReads} />
      </div>

      <div className="mt-6 rounded-xl bg-neutral-50 p-4 dark:bg-white/5">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
          This particular tone
        </div>
        <p className="mt-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-200">
          {modifier.composite}
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
          <p>
            <span className="font-medium text-neutral-600 dark:text-neutral-300">
              Lightness band:{" "}
            </span>
            {modifier.lightness}
          </p>
          <p>
            <span className="font-medium text-neutral-600 dark:text-neutral-300">
              Saturation band:{" "}
            </span>
            {modifier.saturation}
          </p>
        </div>
      </div>
    </section>
  );
}

function Article({ title, body }: { title: string; body: string }) {
  return (
    <article>
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
        {title}
      </h3>
      <p className="mt-1.5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
        {body}
      </p>
    </article>
  );
}
