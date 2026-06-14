"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ShareLinkButton, ShareOnXButton } from "@/src/components/share-link-button";
import { CopyButton } from "@/src/components/copy-button";
import { generateColorFromWord } from "@/src/lib/word-color";
import { wordToColorFaq } from "@/src/lib/word-color-faq";
import { wordToColorSeeds, slugifyWord, titleCaseWord } from "@/src/lib/word-to-color-seeds";
import { WordColorShareCard } from "@/src/components/word-color-share-card";

const PROMPT_SUGGESTIONS = [
  "ocean memory",
  "quiet luxury",
  "midnight jazz",
  "soft archive",
  "electric plum",
] as const;

// A diverse spread of ~60 word pages for the index hub — links the static
// /word-to-color/[word]/ pages from the highest-traffic page in one hop.
const BROWSE_WORDS = wordToColorSeeds.filter(
  (_, i) => i % Math.ceil(wordToColorSeeds.length / 60) === 0,
);

export function WordColorGeneratorPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialWord = searchParams.get("q") ?? "quiet luxury";
  const [input, setInput] = useState(initialWord);
  const [wordHistory, setWordHistory] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem("colorarchive-word-history") || "[]"); } catch { return []; }
  });
  const generated = useMemo(() => generateColorFromWord(input), [input]);
  const paletteExport = useMemo(() => {
    if (!generated) {
      return "";
    }

    return generated.variants
      .map((variant) => `${variant.label}: ${variant.hex}`)
      .join("\n");
  }, [generated]);
  const cssVariableExport = useMemo(() => {
    if (!generated) {
      return "";
    }

    return generated.variants
      .map((variant) => {
        const slug = variant.label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        return `--${generated.token.replace(/[^a-z0-9]+/g, "-")}-${slug}: ${variant.hex};`;
      })
      .join("\n");
  }, [generated]);
  const tailwindExport = useMemo(() => {
    if (!generated) return "";
    const token = generated.token.replace(/[^a-z0-9]+/g, "-");
    return `@theme {\n${generated.variants.map((v) => {
      const slug = v.label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      return `  --color-${token}-${slug}: ${v.hex};`;
    }).join("\n")}\n}`;
  }, [generated]);

  useEffect(() => {
    const trimmed = input.trim();
    const href = trimmed.length > 0 ? `${pathname}?q=${encodeURIComponent(trimmed)}` : pathname;
    router.replace(href, { scroll: false });
  }, [input, pathname, router]);

  // Save word to history after debounce
  useEffect(() => {
    if (!input.trim() || input.trim().length < 2) return;
    const timeout = setTimeout(() => {
      setWordHistory((prev) => {
        const next = [input.trim(), ...prev.filter((w) => w !== input.trim())].slice(0, 10);
        try { localStorage.setItem("colorarchive-word-history", JSON.stringify(next)); } catch {}
        return next;
      });
    }, 2000);
    return () => clearTimeout(timeout);
  }, [input]);

  return (
    <main className="px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        <section className="relative overflow-hidden rounded-[2rem] border border-black/6 bg-white/74 px-6 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-10 sm:py-14">
          <div className="relative mx-auto max-w-4xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/85 px-3 py-1 text-xs font-medium tracking-[0.22em] text-neutral-500 uppercase">
              <span className="inline-block h-2 w-2 rounded-full bg-neutral-900" />
              Deterministic word palette
            </div>

            <h1 className="font-display max-w-3xl text-4xl font-light tracking-[-0.04em] text-neutral-950 sm:text-6xl">
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
                  {input.trim().length > 0 && (
                    <ShareOnXButton
                      href={`/word-to-color?q=${encodeURIComponent(input.trim())}`}
                      text={`I turned "${input.trim()}" into a color palette on ColorArchive`}
                    />
                  )}
                </div>
                {wordHistory.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-400">Recent</span>
                    {wordHistory.filter((w) => w !== input.trim()).slice(0, 6).map((w) => (
                      <button key={w} type="button" onClick={() => setInput(w)} className="rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs text-neutral-600 transition hover:bg-neutral-100">
                        {w}
                      </button>
                    ))}
                  </div>
                )}
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

                    <div className="flex flex-wrap gap-2">
                      <CopyButton label="hex" value={generated.hex} />
                      <CopyButton label="rgb" value={generated.rgb} />
                      <CopyButton label="hsl" value={generated.hsl} />
                      <CopyButton label="palette" value={paletteExport} />
                      <CopyButton label="CSS vars" value={cssVariableExport} />
                      <CopyButton label="Tailwind" value={tailwindExport} />
                      <WordColorShareCard
                        word={input}
                        hex={generated.hex}
                        family={generated.family}
                        variants={generated.variants}
                      />
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

            <div className="space-y-4">
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

              <div className="rounded-[1.75rem] border border-black/6 bg-white/80 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                  Find in archive
                </div>
                <p className="mt-2 text-sm leading-6 text-neutral-600">
                  Search the curated ColorArchive for colors nearest to this generated hex.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/all-colors?hex=${encodeURIComponent(generated.hex)}`}
                    className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-neutral-800"
                  >
                    Search by hex
                  </Link>
                  <Link
                    href="/all-colors/"
                    className="rounded-full border border-black/8 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-600 transition hover:bg-neutral-950 hover:text-white"
                  >
                    Browse archive
                  </Link>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-black/6 bg-white/80 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                      Export pack
                    </div>
                    <p className="mt-2 text-sm leading-6 text-neutral-600">
                      Copy this generated palette as plain text or CSS variables and drop it into a
                      design doc, prompt, or codebase.
                    </p>
                  </div>
                  <div className="rounded-full border border-black/6 bg-neutral-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-neutral-500">
                    Static
                  </div>
                </div>

                <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-[1.2rem] border border-black/6 bg-neutral-50 px-4 py-4 text-sm leading-6 text-neutral-600">
                  {paletteExport}
                </pre>
              </div>

              <div className="rounded-[1.75rem] border border-black/6 bg-neutral-950 p-5 text-white shadow-[0_18px_48px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-white dark:text-neutral-950">
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-white/40 dark:text-neutral-400">
                  Want production-ready tokens?
                </div>
                <p className="mt-2 text-lg font-semibold tracking-[-0.02em]">
                  Take it further with Pro
                </p>
                <p className="mt-2 text-sm leading-6 text-white/60 dark:text-neutral-500">
                  ColorArchive Pro goes beyond generated colors — structured CSS variables, Figma
                  tokens, Tailwind config, and editorial palette directions built for real projects.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href="/pro/"
                    className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-950 transition hover:bg-neutral-200 dark:bg-neutral-950 dark:text-white dark:hover:bg-neutral-800"
                  >
                    Upgrade to Pro
                  </Link>
                  <Link
                    href="/free-resources/"
                    className="rounded-full border border-white/16 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/80 transition hover:border-white/30 hover:text-white dark:border-black/16 dark:text-neutral-600 dark:hover:border-black/30 dark:hover:text-neutral-950"
                  >
                    Free resources
                  </Link>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <section className="rounded-[1.75rem] border border-black/6 bg-white/80 p-6 shadow-[0_18px_48px_rgba(15,23,42,0.05)] sm:p-8">
          <h2 className="text-xl font-semibold tracking-[-0.03em] text-neutral-950 sm:text-2xl">
            Word to Color — frequently asked questions
          </h2>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            {wordToColorFaq.map((item) => (
              <div
                key={item.question}
                className="rounded-[1.4rem] border border-black/6 bg-neutral-50/70 p-5"
              >
                <dt className="text-base font-semibold text-neutral-900">{item.question}</dt>
                <dd className="mt-2 text-sm leading-6 text-neutral-600">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="rounded-[1.75rem] border border-black/6 bg-white/80 p-6 shadow-[0_18px_48px_rgba(15,23,42,0.05)] sm:p-8">
          <h2 className="text-base font-semibold tracking-[-0.02em] text-neutral-950">
            Browse word colors
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            Ready-made pages with the exact hex, a 5-shade palette, and the nearest
            named color for popular words.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {BROWSE_WORDS.map((w) => (
              <Link
                key={w}
                href={`/word-to-color/${slugifyWord(w)}/`}
                className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-sm text-neutral-700 transition hover:bg-neutral-950 hover:text-white"
              >
                {titleCaseWord(w)}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
