import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/src/components/site-header";
import stories from "@/src/data/color-stories.json";

export const metadata: Metadata = {
  title: { absolute: "Color Stories | ColorArchive" },
  description:
    "Explore the history, psychology, and cultural significance of every color family. From the passion of Red to the calm of Teal.",
  alternates: { canonical: "/stories/" },
  openGraph: {
    title: "Color Stories | ColorArchive",
    description: "The history and psychology behind every color family.",
    images: ["https://colorarchive.me/og-image-v1.png"],
  },
};

type Story = { slug: string; name: string; hex: string; headline: string; summary: string };

function luminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

export default function StoriesIndexRoute() {
  const all = Object.values(stories) as Story[];

  return (
    <>
      <SiteHeader currentPath="/stories" />
      <main className="min-h-screen bg-white dark:bg-neutral-950">
        <section className="max-w-2xl mx-auto px-4 pt-12 pb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 mb-3">Editorial</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white mb-3">
            Color Stories
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            The history, psychology, and cultural significance of every color family.
          </p>
        </section>

        <section className="max-w-2xl mx-auto px-4 pb-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {all.map((story) => {
              const tc = luminance(story.hex) > 140 ? "#1a1a1a" : "#ffffff";
              return (
                <Link key={story.slug} href={`/stories/${story.slug}/`}>
                  <div
                    className="rounded-2xl p-5 shadow-sm hover:scale-[1.02] transition-transform"
                    style={{ backgroundColor: story.hex, minHeight: 140 }}
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-wider mb-2 opacity-60" style={{ color: tc }}>
                      Color Story
                    </p>
                    <p className="text-base font-bold leading-snug mb-1" style={{ color: tc }}>
                      {story.name}
                    </p>
                    <p className="text-[11px] opacity-75 line-clamp-2 leading-relaxed" style={{ color: tc }}>
                      {story.summary}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
    </>
  );
}
