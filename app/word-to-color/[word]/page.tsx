import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { SITE_URL } from "@/src/lib/site-config";
import { colors } from "@/src/data/colors";
import { generateColorFromWord } from "@/src/lib/word-color";
import { findClosestArchiveColor } from "@/src/lib/color-relationships";
import { wordToColorFaq } from "@/src/lib/word-color-faq";
import {
  wordToColorSeeds,
  wordSeedBySlug,
  slugifyWord,
  titleCaseWord,
} from "@/src/lib/word-to-color-seeds";

// Only the curated seed words become static pages. Arbitrary words are still
// handled by the interactive generator at /word-to-color/?q=... — keeping
// dynamicParams = false prevents an unbounded index of low-value URLs.
export const dynamicParams = false;

interface WordPageProps {
  params: Promise<{ word: string }>;
}

export function generateStaticParams() {
  return Object.keys(wordSeedBySlug).map((word) => ({ word }));
}

function resolveWord(slug: string): string | null {
  return wordSeedBySlug[slug] ?? null;
}

export async function generateMetadata({ params }: WordPageProps): Promise<Metadata> {
  const { word: slug } = await params;
  const word = resolveWord(slug);
  const generated = word ? generateColorFromWord(word) : null;
  if (!word || !generated) {
    return { title: "Word not found" };
  }

  const display = titleCaseWord(word);
  const title = `What Color Is "${display}"? ${generated.hex} — Word to Color | ColorArchive`;
  const description = `The word "${word}" maps to ${generated.hex}, a ${generated.family.toLowerCase()} tone (${generated.rgb}, ${generated.hsl}), plus a 5-shade palette. A deterministic word-to-color result — "${word}" always returns this exact color.`;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `/word-to-color/${slug}/` },
    twitter: { card: "summary_large_image" },
  };
}

export default async function WordToColorWordPage({ params }: WordPageProps) {
  const { word: slug } = await params;
  const word = resolveWord(slug);
  const generated = word ? generateColorFromWord(word) : null;
  if (!word || !generated) {
    notFound();
  }

  const display = titleCaseWord(word);
  const pageUrl = `${SITE_URL}/word-to-color/${slug}/`;
  const closest = findClosestArchiveColor(colors, generated.hex);

  // Sibling links — a rotating window of other word pages so the ~280 pages
  // form a dense internal-link graph (crawlable + spreads authority).
  const startIdx = wordToColorSeeds.indexOf(word);
  const siblings = Array.from({ length: 14 }, (_, i) =>
    wordToColorSeeds[(Math.max(0, startIdx) + i + 1) % wordToColorSeeds.length],
  ).filter((w) => w !== word);

  const faq = [
    {
      question: `What color is the word "${display}"?`,
      answer: `The word "${word}" maps to ${generated.hex} — a ${generated.family.toLowerCase()} tone (${generated.rgb}, ${generated.hsl}). ColorArchive derives it with a deterministic hash that runs in the browser, so "${word}" always produces this exact hex code and the same five-shade palette on any device.`,
    },
    ...wordToColorFaq,
  ];

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "DefinedTerm",
      name: `${display} color`,
      description: `The word "${word}" maps to the hex color ${generated.hex} (${generated.rgb}, ${generated.hsl}), a ${generated.family.toLowerCase()} tone, via ColorArchive's deterministic word-to-color algorithm.`,
      url: pageUrl,
      inDefinedTermSet: {
        "@type": "DefinedTermSet",
        name: "ColorArchive Word to Color",
        url: `${SITE_URL}/word-to-color/`,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "ColorArchive", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Word to Color", item: `${SITE_URL}/word-to-color/` },
        { "@type": "ListItem", position: 3, name: `"${display}"`, item: pageUrl },
      ],
    },
  ];

  return (
    <>
      <SiteHeader currentPath="/word-to-color" />
      <StructuredDataScript data={structuredData} />
      <main className="px-4 py-4 sm:px-6 sm:py-6">
        <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-6">
          {/* Hero */}
          <section className="overflow-hidden rounded-[2rem] border border-black/6 bg-white/78 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <div className="h-56 border-b border-black/6 sm:h-72" style={{ backgroundColor: generated.hex }} aria-hidden="true" />
            <div className="p-6 sm:p-8">
              <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-400">
                Word to Color
              </div>
              <h1 className="font-display mt-2 text-3xl font-light tracking-[-0.03em] text-neutral-950 sm:text-5xl">
                The color of &ldquo;{display}&rdquo; is {generated.hex}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-600">
                The word <strong className="font-semibold text-neutral-900">{word}</strong> maps to{" "}
                <strong className="font-semibold text-neutral-900">{generated.hex}</strong>, a{" "}
                {generated.family.toLowerCase()} tone ({generated.rgb}, {generated.hsl}). This is a
                deterministic result — the same word always produces the same color, plus the five-shade
                palette below.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-4">
                {[
                  { label: "HEX", value: generated.hex },
                  { label: "RGB", value: generated.rgb },
                  { label: "HSL", value: generated.hsl },
                  { label: "Family", value: generated.family },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-black/6 bg-neutral-50 px-4 py-3">
                    <div className="text-xs uppercase tracking-[0.16em] text-neutral-400">{stat.label}</div>
                    <div className="mt-1 font-medium text-neutral-950">{stat.value}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <Link
                  href={`/word-to-color/?q=${encodeURIComponent(word)}`}
                  className="rounded-full bg-neutral-950 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-neutral-800"
                >
                  Open, copy &amp; share in the generator
                </Link>
                <Link
                  href={`/all-colors?hex=${encodeURIComponent(generated.hex)}`}
                  className="rounded-full border border-black/8 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-600 transition hover:bg-neutral-950 hover:text-white"
                >
                  Find nearest archive colors
                </Link>
              </div>
            </div>
          </section>

          {/* Palette */}
          <section className="rounded-[1.75rem] border border-black/6 bg-white/80 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)] sm:p-6">
            <h2 className="text-xl font-semibold tracking-[-0.03em] text-neutral-950">
              {display} palette — 5 shades
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              Five linked tones generated around the same color signature.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
              {generated.variants.map((variant) => (
                <div key={variant.label} className="overflow-hidden rounded-[1.4rem] border border-black/6 bg-white shadow-sm">
                  <div className="h-24 border-b border-black/6" style={{ backgroundColor: variant.hex }} />
                  <div className="p-3">
                    <div className="text-[10px] uppercase tracking-[0.16em] text-neutral-400">{variant.label}</div>
                    <div className="mt-1 text-sm font-semibold tracking-[0.02em] text-neutral-950">{variant.hex}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Nearest named color */}
          {closest && (
            <section className="rounded-[1.75rem] border border-black/6 bg-white/80 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)] sm:p-6">
              <h2 className="text-xl font-semibold tracking-[-0.03em] text-neutral-950">
                Nearest named color
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                The closest hand-named color in the ColorArchive to {generated.hex}.
              </p>
              <Link
                href={`/colors/${closest.id}/`}
                className="group mt-4 flex items-center gap-4 rounded-2xl border border-black/6 bg-white px-4 py-3 transition hover:border-black/12 hover:shadow-sm"
              >
                <span className="h-12 w-12 shrink-0 rounded-xl border border-black/6" style={{ backgroundColor: closest.hex }} aria-hidden="true" />
                <span className="min-w-0">
                  <span className="block font-semibold text-neutral-950 group-hover:underline">{closest.name}</span>
                  <span className="mt-0.5 block text-sm text-neutral-500">{closest.hex} · {closest.hsl}</span>
                </span>
              </Link>
            </section>
          )}

          {/* FAQ */}
          <section className="rounded-[1.75rem] border border-black/6 bg-white/80 p-6 shadow-[0_18px_48px_rgba(15,23,42,0.05)] sm:p-8">
            <h2 className="text-xl font-semibold tracking-[-0.03em] text-neutral-950 sm:text-2xl">
              &ldquo;{display}&rdquo; color — frequently asked questions
            </h2>
            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              {faq.map((item) => (
                <div key={item.question} className="rounded-[1.4rem] border border-black/6 bg-neutral-50/70 p-5">
                  <dt className="text-base font-semibold text-neutral-900">{item.question}</dt>
                  <dd className="mt-2 text-sm leading-6 text-neutral-600">{item.answer}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Sibling links — internal-link graph across word pages */}
          {siblings.length > 0 && (
            <section className="rounded-[1.75rem] border border-black/6 bg-white/80 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)] sm:p-6">
              <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                More word colors
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {siblings.map((w) => (
                  <Link
                    key={w}
                    href={`/word-to-color/${slugifyWord(w)}/`}
                    className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-sm text-neutral-700 transition hover:bg-neutral-950 hover:text-white"
                  >
                    {titleCaseWord(w)}
                  </Link>
                ))}
                <Link
                  href="/word-to-color/"
                  className="rounded-full border border-black/8 bg-neutral-950 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-neutral-800"
                >
                  Try any word →
                </Link>
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
