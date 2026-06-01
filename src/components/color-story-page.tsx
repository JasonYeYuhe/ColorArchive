import Link from "next/link";
import { colors as archiveColors } from "@/src/data/colors";
import type { ColorRecord } from "@/src/types/color";
import type { ColorFamily } from "@/src/types/color";

interface Story {
  slug: string;
  name: string;
  hex: string;
  hue: string;
  headline: string;
  summary: string;
  origin: string;
  psychology: string;
  design: string;
  brands: string;
  palette_tip: string;
}

const ALL_FAMILIES: ColorFamily[] = ["Red", "Orange", "Yellow", "Lime", "Green", "Teal", "Blue", "Purple", "Pink"];

function luminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

const SECTIONS = [
  { key: "origin", label: "Origins & History" },
  { key: "psychology", label: "Psychology & Emotion" },
  { key: "design", label: "In Design & Art" },
  { key: "brands", label: "Iconic Uses" },
  { key: "palette_tip", label: "Palette Tip" },
] as const;

export function ColorStoryPage({ story }: { story: Story }) {
  const textOnHero = luminance(story.hex) > 140 ? "#1a1a1a" : "#ffffff";

  // Pick 6 representative colors from this family
  const familyColors: ColorRecord[] = archiveColors
    .filter((c: ColorRecord) => c.family === story.name)
    .filter((c: ColorRecord) => c.saturation >= 30)
    .sort((a: ColorRecord, b: ColorRecord) => b.saturation - a.saturation)
    .slice(0, 6);

  return (
    <main className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Hero */}
      <section
        className="relative flex flex-col items-center justify-center min-h-[40vw] sm:min-h-[320px] px-6 py-16 text-center"
        style={{ backgroundColor: story.hex }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] mb-4 opacity-70" style={{ color: textOnHero }}>
          Color Story
        </p>
        <h1 className="text-3xl sm:text-5xl font-display font-light tracking-tight mb-4 max-w-2xl" style={{ color: textOnHero }}>
          {story.headline}
        </h1>
        <p className="text-sm max-w-lg opacity-75" style={{ color: textOnHero }}>
          {story.summary}
        </p>
      </section>

      {/* Article */}
      <article className="max-w-2xl mx-auto px-4 py-12 space-y-10">
        {SECTIONS.map(({ key, label }) => {
          const text = story[key];
          if (!text) return null;
          return (
            <section key={key}>
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 mb-3">{label}</h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[15px]">{text}</p>
            </section>
          );
        })}
      </article>

      {/* Color samples */}
      {familyColors.length > 0 && (
        <section className="max-w-2xl mx-auto px-4 pb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 mb-4">
            {story.name} Colors in the Archive
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {familyColors.map((c: ColorRecord) => {
              const tc = luminance(c.hex) > 140 ? "#1a1a1a" : "#ffffff";
              return (
                <Link key={c.id} href={`/colors/${c.id}/`}>
                  <div
                    className="h-20 rounded-xl shadow-sm hover:scale-105 transition-transform flex flex-col justify-end p-2"
                    style={{ backgroundColor: c.hex }}
                  >
                    <span className="text-[9px] font-medium truncate" style={{ color: tc, opacity: 0.85 }}>{c.name}</span>
                    <span className="text-[8px] font-mono" style={{ color: tc, opacity: 0.6 }}>{c.hex}</span>
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="mt-4 text-center">
            <Link
              href={`/families/${story.slug}/`}
              className="inline-block text-xs font-semibold px-4 py-2 rounded-full border border-slate-200 dark:border-white/15 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
            >
              Browse all {story.name} colors →
            </Link>
          </div>
        </section>
      )}

      {/* Other stories nav */}
      <section className="max-w-2xl mx-auto px-4 pb-16 border-t border-slate-100 dark:border-white/10 pt-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 mb-4 text-center">More Color Stories</p>
        <div className="flex flex-wrap justify-center gap-2">
          {ALL_FAMILIES.filter((f) => f.toLowerCase() !== story.slug).map((f) => (
            <Link
              key={f}
              href={`/stories/${f.toLowerCase()}/`}
              className="text-xs font-medium px-3 py-1.5 rounded-full border border-slate-200 dark:border-white/15 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
            >
              {f}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
