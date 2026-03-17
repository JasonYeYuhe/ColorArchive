"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ShareLinkButton } from "@/src/components/share-link-button";
import { generateColorFromWord } from "@/src/lib/word-color";

const PROMPT_SUGGESTIONS = [
  "ocean memory",
  "quiet luxury",
  "midnight jazz",
  "soft archive",
  "electric plum",
] as const;

export function WordColorGeneratorPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialWord = searchParams.get("q") ?? "quiet luxury";
  const [input, setInput] = useState(initialWord);
  const generated = useMemo(() => generateColorFromWord(input), [input]);

  useEffect(() => {
    const trimmed = input.trim();
    const href = trimmed.length > 0 ? `${pathname}?q=${encodeURIComponent(trimmed)}` : pathname;
    router.replace(href, { scroll: false });
  }, [input, pathname, router]);

  return (
    <main className="px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        <section className="relative overflow-hidden rounded-[2rem] border border-black/6 bg-white/74 px-6 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-10 sm:py-14">
          <div className="pointer-events-none absolute -right-10 top-0 h-64 w-64 rounded-full bg-violet-200/45 blur-3xl" />
          <div className="pointer-events-none absolute left-0 top-10 h-48 w-48 rounded-full bg-amber-200/30 blur-3xl" />
          <div className="relative mx-auto max-w-4xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/85 px-3 py-1 text-xs font-medium tracking-[0.22em] text-neutral-500 uppercase">
              <span className="inline-block h-2 w-2 rounded-full bg-neutral-900" />
              Deterministic word palette
            </div>

            <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-6xl">
              Turn a word into color
            </h1>

            <p className="mt-4 max-w-2xl text-balance text-base leading-7 text-neutral-600 sm:text-lg">
              Enter any word or phrase. ColorArchive maps it to a repeatable color signature using
              a local deterministic hash, with no API and no backend.
            </p>

            <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.8fr)]">
              <div className="rounded-[1.7rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
                <label className="block">
                  <span className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                    Input
                  </span>
                  <input
                    type="text"
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="Type a word, phrase, or mood"
                    className="mt-3 w-full rounded-2xl border border-black/8 bg-white px-4 py-3 text-base text-neutral-950 outline-none transition focus:border-neutral-900/20 focus:ring-4 focus:ring-neutral-900/8"
                  />
                </label>

                <div className="mt-4 flex flex-wrap gap-2">
                  {PROMPT_SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setInput(suggestion)}
                      className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-sm text-neutral-700 transition hover:bg-neutral-950 hover:text-white"
                    >
                      {suggestion}
                    </button>
                  ))}
                  <ShareLinkButton
                    href={
                      input.trim().length > 0
                        ? `/word-to-color?q=${encodeURIComponent(input.trim())}`
                        : "/word-to-color"
                    }
                  />
                </div>
              </div>

              {generated ? (
                <div className="overflow-hidden rounded-[1.7rem] border border-black/6 bg-white/82 shadow-[0_18px_48px_rgba(15,23,42,0.06)]">
                  <div className="h-52 border-b border-black/6" style={{ backgroundColor: generated.hex }} />
                  <div className="space-y-4 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-xs uppercase tracking-[0.18em] text-neutral-400">
                          Token
                        </div>
                        <div className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-neutral-950">
                          {generated.token}
                        </div>
                      </div>
                      <div className="rounded-full border border-black/6 bg-neutral-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-neutral-500">
                        {generated.family}
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl border border-black/6 bg-neutral-50 px-4 py-3">
                        <div className="text-xs uppercase tracking-[0.16em] text-neutral-400">Hex</div>
                        <div className="mt-1 font-medium text-neutral-950">{generated.hex}</div>
                      </div>
                      <div className="rounded-2xl border border-black/6 bg-neutral-50 px-4 py-3">
                        <div className="text-xs uppercase tracking-[0.16em] text-neutral-400">RGB</div>
                        <div className="mt-1 font-medium text-neutral-950">{generated.rgb}</div>
                      </div>
                      <div className="rounded-2xl border border-black/6 bg-neutral-50 px-4 py-3">
                        <div className="text-xs uppercase tracking-[0.16em] text-neutral-400">HSL</div>
                        <div className="mt-1 font-medium text-neutral-950">{generated.hsl}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        {generated ? (
          <section className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(22rem,0.8fr)]">
            <div className="rounded-[1.75rem] border border-black/6 bg-white/80 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold tracking-[-0.03em] text-neutral-950">
                    Generated palette
                  </h2>
                  <p className="mt-1 text-sm text-neutral-500">
                    Five linked colors around the same generated signature.
                  </p>
                </div>
                <div className="rounded-full border border-black/6 bg-neutral-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-neutral-500">
                  Hue {generated.hue}
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                {generated.variants.map((variant) => (
                  <div
                    key={variant.label}
                    className="overflow-hidden rounded-[1.4rem] border border-black/6 bg-white shadow-sm"
                  >
                    <div className="h-28 border-b border-black/6" style={{ backgroundColor: variant.hex }} />
                    <div className="p-4">
                      <div className="text-xs uppercase tracking-[0.16em] text-neutral-400">
                        {variant.label}
                      </div>
                      <div className="mt-2 text-lg font-semibold tracking-[0.02em] text-neutral-950">
                        {variant.hex}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-black/6 bg-white/80 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                How it works
              </div>
              <div className="mt-3 space-y-3 text-sm leading-6 text-neutral-600">
                <p>
                  The input string is normalized and hashed locally in the browser.
                </p>
                <p>
                  That hash is mapped into stable hue, saturation, and lightness values.
                </p>
                <p>
                  The same word always returns the same color, making it useful as a lightweight
                  visual signature.
                </p>
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
