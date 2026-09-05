"use client";

import Link from "next/link";
import { useLocale } from "@/src/components/locale-provider";
import { EmailCaptureForm } from "@/src/components/email-capture-form";
import { track } from "@/src/lib/track";

const FREE_TOOLS = [
  { href: "/contrast/", label: "Contrast Checker", desc: "WCAG AA/AAA testing" },
  { href: "/harmonies/", label: "Color Harmonies", desc: "Complementary, analogous, triadic" },
  { href: "/gradient/", label: "Gradient Builder", desc: "CSS gradient generation" },
  { href: "/convert/", label: "Color Converter", desc: "HEX, RGB, HSL, OKLCH" },
  { href: "/colorblind/", label: "Colorblind Simulator", desc: "Test accessibility" },
  { href: "/mixer/", label: "Color Mixer", desc: "Blend and mix colors" },
  { href: "/word-to-color/", label: "Word to Color", desc: "Generate colors from any word" },
  { href: "/palette-generator/", label: "Palette Generator", desc: "Complementary, analogous, triadic harmonies" },
];

/**
 * THE TWO FULL PACKS WERE UNREACHABLE UNTIL 2026-09-06.
 *
 * scripts/generate-downloads.mjs builds them on every single build, and they
 * have been served publicly at /downloads/*.zip the whole time — but NOTHING in
 * the app linked to either one (grep for "downloads/.*\.zip" across src/ and
 * app/ returned zero hits). That is the actual reason /downloads/* shows 0
 * impressions and 0 clicks in 90 days of Search Console: not that nobody wants
 * them, but that there was no route to them from any page.
 *
 * They are the strongest free thing this site has — the complete archive is all
 * 5,446 colours in fifteen formats, no account — so they go first.
 */
const SAMPLE_DOWNLOADS = [
  {
    label: "Complete Archive — 5,446 colors, 15 formats",
    format: "ZIP",
    href: "/downloads/complete-archive.zip",
  },
  {
    label: "Brand Color Starter Kit — 3 curated palettes",
    format: "ZIP",
    href: "/downloads/brand-starter-kit.zip",
  },
  { label: "CSS Variable Tokens", format: "CSS", href: "/downloads/palette-pack-vol-1-preview.css" },
  { label: "JSON Color Data", format: "JSON", href: "/downloads/palette-pack-vol-1-preview.json" },
  { label: "Adobe Photoshop Swatches", format: "ACO", href: "/downloads/colorarchive.aco" },
  { label: "Framer Design Tokens", format: "CSS", href: "/downloads/colorarchive-framer-tokens.css" },
  { label: "Apple Color Swatches", format: "CLR", href: "/downloads/colorarchive.swatches" },
];

export function FreeResourcesPage() {
  const { t } = useLocale();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-950 dark:to-neutral-900 pb-24">
      {/* Hero */}
      <section className="max-w-3xl mx-auto px-4 pt-12 pb-10 text-center">
        <span className="inline-block px-3 py-1 text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full mb-4">
          100% Free
        </span>
        <h1 className="text-3xl sm:text-4xl font-display font-light text-slate-900 dark:text-white leading-tight mb-3">
          Free Color Resources
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base max-w-lg mx-auto">
          Sample downloads, 44 free tools, and 5,446 colors to browse. No account needed.
        </p>
      </section>

      <div className="max-w-4xl mx-auto px-4 space-y-10">
        {/* Sample Downloads */}
        <section>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Sample Downloads</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SAMPLE_DOWNLOADS.map((dl) => (
              <a
                key={dl.href}
                href={dl.href}
                download
                onClick={() =>
                  track("download_link_click", {
                    file: dl.href.replace("/downloads/", ""),
                    surface: "free-resources",
                  })
                }
                className="bg-white dark:bg-neutral-900 rounded-xl border border-slate-100 dark:border-white/10 shadow-sm p-4 flex items-center gap-3 hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-white/10 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                  {dl.format}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-white">{dl.label}</p>
                  <p className="text-xs text-slate-400">.{dl.format.toLowerCase()} file</p>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Free Tools */}
        <section>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Free Tools</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {FREE_TOOLS.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="bg-white dark:bg-neutral-900 rounded-xl border border-slate-100 dark:border-white/10 shadow-sm p-4 hover:shadow-md transition-shadow"
              >
                <p className="text-sm font-medium text-slate-800 dark:text-white">{tool.label}</p>
                <p className="text-xs text-slate-400 mt-1">{tool.desc}</p>
              </Link>
            ))}
          </div>
          <div className="text-center mt-4">
            <Link
              href="/tools/"
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              View all 44 tools &rarr;
            </Link>
          </div>
        </section>

        {/* Pro Upgrade CTA */}
        <section className="bg-white dark:bg-neutral-900 rounded-2xl border border-black/8 dark:border-white/10 p-8 text-center">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Need unlimited exports?
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
            Pro unlocks unlimited AI generations, unmetered exports (free accounts get 3 a day), and WCAG audit reports.
          </p>
          <Link
            href="/pro/"
            className="inline-block px-8 py-3 bg-neutral-900 text-white text-sm font-semibold rounded-xl hover:bg-neutral-700 transition-colors"
          >
            View Pro Plans
          </Link>
        </section>

        {/* Email Capture */}
        <section className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-8 text-center">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
            Stay updated
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
            Get notified when we add new collections, tools, and features.
          </p>
          <div className="max-w-sm mx-auto">
            <EmailCaptureForm source="free-resources" />
          </div>
        </section>
      </div>
    </main>
  );
}
