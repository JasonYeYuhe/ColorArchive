"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ShareLinkButton, ShareOnXButton } from "@/src/components/share-link-button";
import { CopyButton } from "@/src/components/copy-button";
import { generateColorFromWord } from "@/src/lib/word-color";
import { wordToColorFaq } from "@/src/lib/word-color-faq";
import { wordToColorSeeds, slugifyWord, titleCaseWord } from "@/src/lib/word-to-color-seeds";
import { WordColorShareCard } from "@/src/components/word-color-share-card";
import { CotdSubscribeForm } from "@/src/components/cotd-subscribe-form";
import { track } from "@/src/lib/track";

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

// --- Willingness-to-pay probe: free-preview limit on the interactive generator ---
// After FREE_GENERATIONS distinct user-initiated word lookups in this browser, words
// OTHER than the one the visitor landed on gate behind a Pro upsell with an email-unlock
// escape hatch. This is a WTP experiment on the #1 traffic page, NOT DRM. Design rules
// that keep it SEO- and share-safe:
//   • The word the visitor landed on (initial ?q= / default) is ALWAYS viewable and is
//     never counted — so deep links, social shares (the page's growth loop), and crawlers
//     always render the result they came for, even for a returning, already-gated visitor.
//   • Only NEW words typed after landing count, against a persisted distinct-word set, so
//     "5 free palettes" stays honest across reloads (retyping a counted word is free).
//   • An email unlock lifts the gate permanently for that browser, turning the wall into
//     lead capture so casual traffic isn't simply lost; the Pro click is the paid-intent
//     signal we actually measure.
//   • Flip WORD_PAYWALL_ENABLED to false to remove the gate instantly (the static [word]
//     pages don't use this component, so they're unaffected regardless).
const WORD_PAYWALL_ENABLED = true;
const FREE_GENERATIONS = 5;
const GEN_WORDS_KEY = "colorarchive-word-gen-words";
const UNLOCK_KEY = "colorarchive-word-unlocked";

// Event names live in one place so a typo can't silently split a funnel. All fan out
// through track() to both the first-party /events table and PostHog under these names.
const PAYWALL_EVENT = {
  hit: "word_paywall_hit", // first-ever crossing of the free limit this browser
  restored: "word_paywall_restored", // returning visitor re-gated on load (funnel denominator)
  proClick: "word_paywall_pro_click", // clicked the in-gate Pro CTA (paid intent)
  emailUnlock: "word_paywall_email_unlock", // unlocked by subscribing (lead)
} as const;

const normalizeWord = (w: string) => w.trim().toLowerCase();

// The persisted set of distinct words already counted against the free limit (the seed
// word the visitor landed on is excluded — it's free). Count = its length.
function readCountedWords(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(GEN_WORDS_KEY) || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function isUnlocked(): boolean {
  try {
    return localStorage.getItem(UNLOCK_KEY) === "1";
  } catch {
    return false;
  }
}

// --- Interview/feedback recruitment banner (B4) -------------------------------
// A small, dismissible strip on the #1 traffic page that routes engaged visitors to
// the 2-min survey (which itself funnels to interviews via its "open to a call?" Q).
// Rendered only after mount (no SSR/first-paint output → no hydration mismatch, no flash
// for people who already dismissed it). Flip RECRUIT_BANNER_ENABLED to remove instantly.
const RECRUIT_BANNER_ENABLED = true;
const RECRUIT_SURVEY_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSf5dTPy9ccPgXdKx2SOf7ICKu5AHucxkm3VoWzBfaZXEZOm2Q/viewform";
const RECRUIT_DISMISS_KEY = "colorarchive-recruit-banner-dismissed";

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
  // WTP gate. Starts closed on the server + first client paint (so SSR output and shared
  // links always show content); a mount effect arms it for returning visitors who already
  // spent their free lookups. The word the visitor landed on is captured ONCE (the route
  // rewrites ?q= as the user types, so we can't recompute it) and is always free + viewable.
  const [gated, setGated] = useState(false);
  const [showRecruit, setShowRecruit] = useState(false);
  const landingWordRef = useRef(normalizeWord(initialWord));
  const countedWordsRef = useRef<Set<string> | null>(null);
  const getCountedWords = () => {
    if (!countedWordsRef.current) {
      // Seed with the persisted counted words + the landing word, so the landed-on word
      // is never counted and already-counted words stay free across reloads.
      countedWordsRef.current = new Set([landingWordRef.current, ...readCountedWords()]);
    }
    return countedWordsRef.current;
  };
  const onLandingWord = normalizeWord(input) === landingWordRef.current;
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

  // On mount, arm the gate for a returning visitor who already spent their free lookups
  // (unless they previously unlocked). They still see their landing word (onLandingWord),
  // but the next NEW word gates. `word_paywall_restored` gives the funnel a denominator for
  // these sessions, since `word_paywall_hit` only fires on the first-ever live crossing.
  useEffect(() => {
    if (!WORD_PAYWALL_ENABLED || isUnlocked()) return;
    const n = readCountedWords().length;
    if (n >= FREE_GENERATIONS) {
      setGated(true);
      track(PAYWALL_EVENT.restored, { count: n });
    }
  }, []);

  // Save word to history after debounce + count it toward the WTP free limit.
  useEffect(() => {
    const trimmed = input.trim();
    if (!trimmed || trimmed.length < 2) return;
    const timeout = setTimeout(() => {
      setWordHistory((prev) => {
        const next = [trimmed, ...prev.filter((w) => w !== trimmed)].slice(0, 10);
        try { localStorage.setItem("colorarchive-word-history", JSON.stringify(next)); } catch {}
        return next;
      });

      // Count only NEW distinct words. The landing word + already-counted words are
      // pre-loaded into the set, so the page the visitor landed on is always free and a
      // retyped word never double-counts across reloads.
      if (!WORD_PAYWALL_ENABLED || gated || isUnlocked()) return;
      const norm = normalizeWord(trimmed);
      const counted = getCountedWords();
      if (counted.has(norm)) return;
      counted.add(norm);
      const words = readCountedWords();
      if (!words.includes(norm)) words.push(norm);
      try { localStorage.setItem(GEN_WORDS_KEY, JSON.stringify(words)); } catch {}
      if (words.length >= FREE_GENERATIONS) {
        setGated(true);
        track(PAYWALL_EVENT.hit, { count: words.length });
      }
    }, 2000);
    return () => clearTimeout(timeout);
  }, [input, gated]);

  const handleEmailUnlock = () => {
    try { localStorage.setItem(UNLOCK_KEY, "1"); } catch {}
    track(PAYWALL_EVENT.emailUnlock, {});
    // Let the subscribe form's "You're in!" confirmation paint before revealing the
    // result, so the unlock reads as a completed action (and the beacon is sent first).
    setTimeout(() => setGated(false), 1400);
  };

  // Recruitment banner: show only after mount, and only if not previously dismissed.
  useEffect(() => {
    if (!RECRUIT_BANNER_ENABLED) return;
    try {
      if (localStorage.getItem(RECRUIT_DISMISS_KEY) !== "1") setShowRecruit(true);
    } catch {}
  }, []);

  const dismissRecruit = () => {
    setShowRecruit(false);
    try { localStorage.setItem(RECRUIT_DISMISS_KEY, "1"); } catch {}
    track("recruit_banner_dismiss", {});
  };

  // The landing word is always viewable; the gate only replaces the result once the
  // visitor moves on to a different word while gated. Conditions are written inline as
  // `generated && (...)` so TypeScript narrows `generated` to non-null inside each branch.
  const resultVisible = !gated || onLandingWord;

  return (
    <main className="px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        {showRecruit && (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-black/8 bg-neutral-950 px-4 py-2.5 text-sm text-white">
            <span className="min-w-0">
              <span aria-hidden="true">🎨 </span>
              Did ColorArchive help? Tell us in a 2-min survey —{" "}
              <a
                href={RECRUIT_SURVEY_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("recruit_banner_click", {})}
                className="font-semibold underline underline-offset-2 hover:text-neutral-200"
              >
                get a free month of Pro
              </a>
              .
            </span>
            <button
              type="button"
              onClick={dismissRecruit}
              aria-label="Dismiss"
              className="shrink-0 rounded-full px-2 py-0.5 text-lg leading-none text-neutral-400 transition hover:bg-white/10 hover:text-white"
            >
              ×
            </button>
          </div>
        )}
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

              {generated && resultVisible ? (
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
              ) : generated && gated ? (
                <div className="overflow-hidden rounded-[1.7rem] border border-black/6 bg-white/82 p-6 shadow-[0_18px_48px_rgba(15,23,42,0.06)]">
                  <div className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-neutral-50 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-500">
                    <span className="inline-block h-2 w-2 rounded-full bg-neutral-900" />
                    Free preview limit
                  </div>
                  <div className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-neutral-950">
                    You&rsquo;ve explored {FREE_GENERATIONS} free word palettes
                  </div>
                  <p className="mt-2 text-sm leading-6 text-neutral-600">
                    Keep going with unlimited word&rarr;color, full 5-shade palettes, and
                    production-ready CSS, Tailwind, and Figma token exports.
                  </p>
                  <Link
                    href="/pro/"
                    onClick={() => track(PAYWALL_EVENT.proClick, {})}
                    className="mt-5 block w-full rounded-full bg-neutral-950 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-neutral-800"
                  >
                    Unlock unlimited with Pro
                  </Link>
                  <div className="mt-5 border-t border-black/6 pt-4">
                    <p className="mb-2 text-xs leading-5 text-neutral-500">
                      Or keep generating free &mdash; get one curated color in your inbox each
                      morning and your palettes unlock right away.
                    </p>
                    <CotdSubscribeForm
                      source="word-to-color"
                      heading="Email me a color a day (free)"
                      onSuccess={handleEmailUnlock}
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        {generated && resultVisible ? (
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

              <div className="rounded-[1.75rem] border border-black/6 bg-white/80 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
                <p className="text-lg font-semibold tracking-[-0.02em] text-neutral-950">
                  Save your word colors
                </p>
                <p className="mt-1 mb-3 text-sm leading-6 text-neutral-600">
                  Get one curated color in your inbox each morning — and a standing reason to come
                  back. Free, one email a day.
                </p>
                <CotdSubscribeForm
                  colorHex={generated.hex}
                  source="word-to-color"
                  heading="Email me a color every morning"
                />
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href="/pro/"
                    onClick={() => track("word_pro_click", { placement: "lower" })}
                    className="rounded-full border border-black/8 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-600 transition hover:bg-neutral-950 hover:text-white"
                  >
                    Production-ready tokens with Pro
                  </Link>
                  <Link
                    href="/free-resources/"
                    className="rounded-full border border-black/8 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-600 transition hover:bg-neutral-950 hover:text-white"
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
