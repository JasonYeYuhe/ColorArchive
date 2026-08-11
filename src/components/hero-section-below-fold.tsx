"use client";

import Link from "next/link";
import { useLocale } from "@/src/components/locale-provider";

// Slim shapes: ONLY the fields rendered below. The full guides/newsletter
// datasets (~1.4MB each) are trimmed server-side in app/page.tsx and threaded
// through as props so they never enter the homepage client/RSC payload.
export interface FeaturedGuide {
  slug: string;
  eyebrow: string;
  searchIntent: string;
  title: string;
  summary: string;
}

export interface RecentNote {
  slug: string;
  eyebrow?: string;
  title: string;
  summary: string;
}

interface HeroSectionBelowFoldProps {
  featuredGuides: FeaturedGuide[];
  recentNotes: RecentNote[];
}

export function HeroSectionBelowFold({ featuredGuides, recentNotes }: HeroSectionBelowFoldProps) {
  const { t } = useLocale();

  return (
    <>
      {/* Token pipeline showcase */}
      <section className="rounded-[2rem] border border-black/6 bg-white/72 px-6 py-8 shadow-[0_24px_80px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:px-10 sm:py-10 dark:border-white/10 dark:bg-neutral-900/80">
        <div className="mx-auto max-w-4xl">
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-neutral-400">
            {t("hero.tokenPipeline")}
          </div>
          <h2 className="font-display text-2xl font-light tracking-[-0.03em] text-neutral-950 sm:text-3xl dark:text-white">
            {t("hero.tokenHeading")}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600 sm:text-base dark:text-neutral-400">
            {t("hero.tokenDesc")}
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[1.3rem] border border-black/6 bg-neutral-950 p-4 dark:border-white/10">
              <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">CSS Variables</div>
              <pre className="text-xs leading-5 text-emerald-400"><code>{`:root {\n  --coral-sunset: #E8734A;\n  --ocean-depth: #1B4965;\n  --sage-mist: #A3B899;\n  --warm-sand: #D4A574;\n}`}</code></pre>
            </div>
            <div className="rounded-[1.3rem] border border-black/6 bg-neutral-950 p-4 dark:border-white/10">
              <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">Tailwind Config</div>
              <pre className="text-xs leading-5 text-sky-400"><code>{`colors: {\n  coral: "#E8734A",\n  ocean: "#1B4965",\n  sage: "#A3B899",\n  sand: "#D4A574",\n}`}</code></pre>
            </div>
            <div className="rounded-[1.3rem] border border-black/6 bg-neutral-950 p-4 dark:border-white/10">
              <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">Figma Tokens JSON</div>
              <pre className="text-xs leading-5 text-amber-400"><code>{`{\n  "coral-sunset": {\n    "value": "#E8734A",\n    "type": "color"\n  }\n}`}</code></pre>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-[0.14em] text-neutral-400">
            <span className="rounded-full border border-black/6 bg-white/80 px-3 py-1.5 dark:border-white/8 dark:bg-white/6">CSS</span>
            <span className="rounded-full border border-black/6 bg-white/80 px-3 py-1.5 dark:border-white/8 dark:bg-white/6">Tailwind</span>
            <span className="rounded-full border border-black/6 bg-white/80 px-3 py-1.5 dark:border-white/8 dark:bg-white/6">Figma JSON</span>
            <span className="rounded-full border border-black/6 bg-white/80 px-3 py-1.5 dark:border-white/8 dark:bg-white/6">Style Dictionary</span>
            <span className="rounded-full border border-black/6 bg-white/80 px-3 py-1.5 dark:border-white/8 dark:bg-white/6">SCSS</span>
            <span className="rounded-full border border-black/6 bg-white/80 px-3 py-1.5 dark:border-white/8 dark:bg-white/6">ACO</span>
            <span className="rounded-full border border-black/6 bg-white/80 px-3 py-1.5 dark:border-white/8 dark:bg-white/6">Procreate</span>
          </div>
        </div>
      </section>

      {/* Guides section */}
      <section className="rounded-[2rem] border border-black/6 bg-white/72 px-6 py-8 shadow-[0_24px_80px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:px-10 sm:py-10 dark:border-white/10 dark:bg-neutral-900/80">
        <div className="mx-auto max-w-4xl">
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-neutral-400">
            {t("hero.guides")}
          </div>
          <h2 className="font-display text-2xl font-light tracking-[-0.03em] text-neutral-950 sm:text-3xl dark:text-white">
            {t("hero.guidesHeading")}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600 sm:text-base dark:text-neutral-400">
            {t("hero.guidesDesc")}
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {featuredGuides.map((guide) => (
              <Link
                key={guide.slug}
                href={`/guides/${guide.slug}/`}
                className="group rounded-[1.5rem] border border-black/6 bg-white/85 p-5 transition hover:shadow-md dark:border-white/10 dark:bg-white/8"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
                    {guide.eyebrow}
                  </div>
                  <div className="rounded-full border border-black/6 bg-neutral-50 px-2 py-0.5 text-[11px] font-medium text-neutral-500 dark:border-white/10 dark:bg-white/8 dark:text-neutral-400">
                    {guide.searchIntent}
                  </div>
                </div>
                <h3 className="mt-3 text-base font-semibold text-neutral-950 group-hover:text-neutral-700 dark:text-white dark:group-hover:text-neutral-300">
                  {guide.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-neutral-500 dark:text-neutral-400">{guide.summary}</p>
              </Link>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/guides/"
              className="rounded-full bg-neutral-950 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800"
            >
              {t("hero.browseAllGuides")}
            </Link>
            <Link
              href="/notes/"
              className="rounded-full border border-black/8 bg-white/88 px-5 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-white dark:border-white/10 dark:bg-white/8 dark:text-neutral-300 dark:hover:bg-white/14"
            >
              {t("hero.readNotes")}
            </Link>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="rounded-[2rem] border border-black/6 bg-white/72 px-6 py-6 shadow-sm backdrop-blur-xl sm:px-10 dark:border-white/10 dark:bg-neutral-900/80">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { quote: "Finally, a color tool that gets naming right. The poetic names make client presentations so much easier.", author: "Brand Designer", org: "Freelance" },
              { quote: "The AI brand generator saved us hours. We went from brief to tokens in under 5 minutes.", author: "Product Lead", org: "SaaS Startup" },
              { quote: "5,446 colors with real structure, not random hex codes. This is what Coolors should have been.", author: "UI Engineer", org: "Design Studio" },
            ].map(({ quote, author, org }) => (
              <div key={author} className="rounded-xl border border-black/4 bg-white/80 p-4 dark:border-white/8 dark:bg-white/5">
                <p className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400 italic mb-3">&ldquo;{quote}&rdquo;</p>
                <p className="text-[11px] font-semibold text-neutral-800 dark:text-neutral-300">{author}</p>
                <p className="text-[10px] text-neutral-400">{org}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-[11px] text-neutral-400">
            <span>Product Hunt #1 Color Tool</span>
            <span className="hidden sm:inline">&#183;</span>
            <span>5,446 curated colors</span>
            <span className="hidden sm:inline">&#183;</span>
            <span>Figma plugin available</span>
          </div>
        </div>
      </section>

      {/* Tools hub */}
      <section className="rounded-[2rem] border border-black/6 bg-white/72 px-6 py-8 shadow-[0_24px_80px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:px-10 sm:py-10 dark:border-white/10 dark:bg-neutral-900/80">
        <div className="mx-auto max-w-4xl">
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-neutral-400">
            {t("hero.toolsSection")}
          </div>
          <h2 className="font-display text-2xl font-light tracking-[-0.03em] text-neutral-950 sm:text-3xl dark:text-white">
            {t("hero.toolsHeading")}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600 sm:text-base dark:text-neutral-400">
            {t("hero.toolsDesc")}
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { href: "/contrast/", label: t("tools.contrast.name"), desc: "WCAG AA/AAA", accent: "bg-neutral-100 text-neutral-700", icon: "◑" },
              { href: "/convert/", label: t("tools.convert.name"), desc: "HEX · RGB · HSL · CMYK", accent: "bg-neutral-100 text-neutral-700", icon: "⇄" },
              { href: "/colorblind/", label: t("tools.colorblind.name"), desc: "8 vision types", accent: "bg-neutral-100 text-neutral-700", icon: "◎" },
              { href: "/gradient/", label: t("tools.gradient.name"), desc: "CSS · linear · radial", accent: "bg-neutral-100 text-neutral-700", icon: "▣" },
              { href: "/harmonies/", label: t("tools.harmonies.name"), desc: "Complementary · analogous", accent: "bg-neutral-100 text-neutral-700", icon: "◇" },
              { href: "/palette/", label: t("tools.paletteGen.name"), desc: "Algorithmic palettes", accent: "bg-neutral-100 text-neutral-700", icon: "▦" },
            ].map((tool) => (
              <Link key={tool.href} href={tool.href}
                className="group flex items-center gap-3 rounded-[1.3rem] border border-black/6 bg-white/85 p-4 transition hover:shadow-md hover:bg-white dark:border-white/10 dark:bg-white/8 dark:hover:bg-white/12"
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base font-bold ${tool.accent}`}>{tool.icon}</div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-neutral-950 group-hover:text-neutral-700 dark:text-white dark:group-hover:text-neutral-300">{tool.label}</div>
                  <div className="truncate text-xs text-neutral-400">{tool.desc}</div>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-5">
            <Link href="/tools/" className="rounded-full border border-black/8 bg-white/88 px-5 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-white dark:border-white/10 dark:bg-white/8 dark:text-neutral-300 dark:hover:bg-white/14">
              {t("hero.browseAllTools")}
            </Link>
          </div>
        </div>
      </section>

      {/* Latest notes */}
      <section className="rounded-[2rem] border border-black/6 bg-white/72 px-6 py-8 shadow-[0_24px_80px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:px-10 sm:py-10 dark:border-white/10 dark:bg-neutral-900/80">
        <div className="mx-auto max-w-4xl">
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-neutral-400">
            {t("hero.latestNotes")}
          </div>
          <h2 className="font-display text-2xl font-light tracking-[-0.03em] text-neutral-950 sm:text-3xl dark:text-white">
            {t("hero.latestNotesHeading")}
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {recentNotes.map((note) => (
              <Link
                key={note.slug}
                href={`/notes/${note.slug}/`}
                className="rounded-[1.3rem] border border-black/6 bg-white/90 p-4 transition hover:-translate-y-0.5 hover:shadow-md dark:bg-neutral-800/60 dark:border-white/8"
              >
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                  {note.eyebrow}
                </div>
                <div className="mt-2 text-sm font-semibold text-neutral-950 dark:text-white">
                  {note.title}
                </div>
                <div className="mt-2 text-xs leading-5 text-neutral-500 dark:text-neutral-400">
                  {note.summary}
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-5">
            <Link
              href="/notes/"
              className="rounded-full border border-black/8 bg-white/88 px-5 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-white dark:border-white/10 dark:bg-white/8 dark:text-neutral-300 dark:hover:bg-white/14"
            >
              {t("hero.readNotes")}
            </Link>
          </div>
        </div>
      </section>

    </>
  );
}
