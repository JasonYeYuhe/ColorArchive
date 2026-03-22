"use client";

import Link from "next/link";
import { landingGuides } from "@/src/lib/guides";
import { newsletterIssues } from "@/src/lib/newsletter-issues";
import { palettePacks } from "@/src/lib/palette-packs";
import { useLocale } from "@/src/components/locale-provider";

const featuredGuides = landingGuides.slice(0, 4);
const recentNotes = newsletterIssues.slice(0, 3);

export function HeroSectionBelowFold() {
  const { t } = useLocale();

  return (
    <>
      {/* Token pipeline showcase */}
      <section className="rounded-[2rem] border border-black/6 bg-white/72 px-6 py-8 shadow-[0_24px_80px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:px-10 sm:py-10 dark:border-white/10 dark:bg-neutral-900/80">
        <div className="mx-auto max-w-4xl">
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-neutral-400">
            {t("hero.tokenPipeline")}
          </div>
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-neutral-950 sm:text-3xl dark:text-white">
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
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-neutral-950 sm:text-3xl dark:text-white">
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

      {/* Tools hub */}
      <section className="rounded-[2rem] border border-black/6 bg-white/72 px-6 py-8 shadow-[0_24px_80px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:px-10 sm:py-10 dark:border-white/10 dark:bg-neutral-900/80">
        <div className="mx-auto max-w-4xl">
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-neutral-400">
            {t("hero.toolsSection")}
          </div>
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-neutral-950 sm:text-3xl dark:text-white">
            {t("hero.toolsHeading")}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600 sm:text-base dark:text-neutral-400">
            {t("hero.toolsDesc")}
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { href: "/contrast/", label: t("tools.contrast.name"), desc: "WCAG AA/AAA", accent: "bg-violet-100 text-violet-700", icon: "◑" },
              { href: "/convert/", label: t("tools.convert.name"), desc: "HEX · RGB · HSL · CMYK", accent: "bg-sky-100 text-sky-700", icon: "⇄" },
              { href: "/colorblind/", label: t("tools.colorblind.name"), desc: "8 vision types", accent: "bg-indigo-100 text-indigo-700", icon: "◎" },
              { href: "/gradient/", label: t("tools.gradient.name"), desc: "CSS · linear · radial", accent: "bg-rose-100 text-rose-700", icon: "▣" },
              { href: "/harmonies/", label: t("tools.harmonies.name"), desc: "Complementary · analogous", accent: "bg-teal-100 text-teal-700", icon: "◇" },
              { href: "/palette/", label: t("tools.paletteGen.name"), desc: "Algorithmic palettes", accent: "bg-orange-100 text-orange-700", icon: "▦" },
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
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-neutral-950 sm:text-3xl dark:text-white">
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

      {/* Product showcase — pack cards */}
      <section className="rounded-[2rem] border border-black/6 bg-white/72 px-6 py-8 shadow-[0_24px_80px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:px-10 sm:py-10 dark:border-white/10 dark:bg-neutral-900/80">
        <div className="mx-auto max-w-4xl">
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-neutral-400">
            {t("hero.palettePacks")}
          </div>
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-neutral-950 sm:text-3xl dark:text-white">
            {t("hero.readyToUse")}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600 sm:text-base dark:text-neutral-400">
            {t("hero.packsDesc")}
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {palettePacks.map((pack) => (
              <Link
                key={pack.id}
                href={`/packs/${pack.id}/`}
                className="group rounded-[1.5rem] border border-black/6 bg-white/85 p-5 transition hover:shadow-md dark:border-white/10 dark:bg-white/8"
              >
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex -space-x-1.5">
                    {pack.previewCollections.slice(0, 3).map((name, i) => (
                      <div
                        key={name}
                        className="h-6 w-6 rounded-full border-2 border-white dark:border-neutral-900"
                        style={{
                          backgroundColor: [
                            "#E8C4B8", "#6DB7FF", "#7FD7B4", "#FF8A7A", "#B4A0D9",
                          ][i % 5],
                        }}
                      />
                    ))}
                  </div>
                </div>
                <h3 className="text-base font-semibold text-neutral-950 group-hover:text-neutral-700 dark:text-white dark:group-hover:text-neutral-300">
                  {pack.title}
                </h3>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  {pack.priceHint}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {pack.formatList.slice(0, 2).map((format) => (
                    <span
                      key={format}
                      className="rounded-full border border-black/6 bg-neutral-50 px-2 py-0.5 text-[11px] font-medium text-neutral-500 dark:border-white/10 dark:bg-white/8 dark:text-neutral-400"
                    >
                      {format}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/free-pack/"
              className="rounded-full bg-neutral-950 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800"
            >
              {t("hero.getStartedFree")}
            </Link>
            <Link
              href="/packs/"
              className="rounded-full border border-black/8 bg-white/88 px-5 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-white dark:border-white/10 dark:bg-white/8 dark:text-neutral-300 dark:hover:bg-white/14"
            >
              {t("hero.browseAllPacks")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
