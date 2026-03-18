import Link from "next/link";

interface HeroSectionProps {
  activeFamily: string;
  searchQuery: string;
  totalColors: number;
  visibleColors: number;
}

export function HeroSection({
  activeFamily,
  searchQuery,
  totalColors,
  visibleColors,
}: HeroSectionProps) {
  const searchSummary = searchQuery.trim().length > 0 ? `Matching “${searchQuery.trim()}”` : "Showing full archive";

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-black/6 bg-white/72 px-6 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-10 sm:py-14">
      <div className="pointer-events-none absolute -left-16 top-8 h-48 w-48 rounded-full bg-rose-200/45 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-sky-200/35 blur-3xl" />
      <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />
      <div className="relative mx-auto max-w-4xl">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/85 px-3 py-1 text-xs font-medium tracking-[0.22em] text-neutral-500 uppercase">
          <span className="inline-block h-2 w-2 rounded-full bg-neutral-900" />
          Curated color archive
        </div>

        <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-6xl">
          ColorArchive
        </h1>

        <p className="mt-4 max-w-2xl text-balance text-base leading-7 text-neutral-600 sm:text-lg">
          A calm, searchable library of color. Browse a large curated spectrum, sort it with
          precision, and copy production-ready hex values in one click.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-neutral-500">
          <span className="rounded-full border border-black/6 bg-white/80 px-3 py-1.5">
            {searchSummary}
          </span>
          <span className="rounded-full border border-black/6 bg-white/80 px-3 py-1.5">
            {activeFamily === "All" ? "All families" : `${activeFamily} family`}
          </span>
          <a
            href="#archive"
            className="rounded-full border border-neutral-950/10 bg-neutral-950 px-4 py-1.5 font-medium text-white transition hover:bg-neutral-800 focus:outline-none focus:ring-4 focus:ring-neutral-900/10"
          >
            Browse archive
          </a>
          <Link
            href="/word-to-color"
            className="rounded-full border border-black/8 bg-white/88 px-4 py-1.5 font-medium text-neutral-700 transition hover:bg-white focus:outline-none focus:ring-4 focus:ring-neutral-900/10"
          >
            Try word → color
          </Link>
          <Link
            href="/search"
            className="rounded-full border border-black/8 bg-white/88 px-4 py-1.5 font-medium text-neutral-700 transition hover:bg-white focus:outline-none focus:ring-4 focus:ring-neutral-900/10"
          >
            Open search page
          </Link>
          <Link
            href="/all-colors"
            className="rounded-full border border-black/8 bg-white/88 px-4 py-1.5 font-medium text-neutral-700 transition hover:bg-white focus:outline-none focus:ring-4 focus:ring-neutral-900/10"
          >
            View all 2016
          </Link>
          <Link
            href="/spectrum"
            className="rounded-full border border-black/8 bg-white/88 px-4 py-1.5 font-medium text-neutral-700 transition hover:bg-white focus:outline-none focus:ring-4 focus:ring-neutral-900/10"
          >
            Open spectrum
          </Link>
          <Link
            href="/surprise"
            className="rounded-full border border-black/8 bg-white/88 px-4 py-1.5 font-medium text-neutral-700 transition hover:bg-white focus:outline-none focus:ring-4 focus:ring-neutral-900/10"
          >
            Surprise me
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <div className="rounded-2xl border border-black/6 bg-white/85 px-4 py-3">
            <div className="text-xs uppercase tracking-[0.18em] text-neutral-400">Archive</div>
            <div className="mt-1 text-lg font-semibold text-neutral-950">{totalColors} colors</div>
          </div>
          <div className="rounded-2xl border border-black/6 bg-white/85 px-4 py-3">
            <div className="text-xs uppercase tracking-[0.18em] text-neutral-400">Showing</div>
            <div className="mt-1 text-lg font-semibold text-neutral-950">{visibleColors} colors</div>
          </div>
          <div className="rounded-2xl border border-black/6 bg-white/85 px-4 py-3">
            <div className="text-xs uppercase tracking-[0.18em] text-neutral-400">Default sort</div>
            <div className="mt-1 text-lg font-semibold text-neutral-950">Hue → Sat → Light</div>
          </div>
        </div>
      </div>
    </section>
  );
}
