interface HeroSectionProps {
  totalColors: number;
  visibleColors: number;
}

export function HeroSection({ totalColors, visibleColors }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-black/6 bg-white/72 px-6 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-10 sm:py-14">
      <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />
      <div className="mx-auto max-w-4xl">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/85 px-3 py-1 text-xs font-medium tracking-[0.22em] text-neutral-500 uppercase">
          <span className="inline-block h-2 w-2 rounded-full bg-neutral-900" />
          One-page visual archive
        </div>

        <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-6xl">
          ColorArchive
        </h1>

        <p className="mt-4 max-w-2xl text-balance text-base leading-7 text-neutral-600 sm:text-lg">
          A calm, searchable library of color. Browse a large curated spectrum, sort it with
          precision, and copy production-ready hex values in one click.
        </p>

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
