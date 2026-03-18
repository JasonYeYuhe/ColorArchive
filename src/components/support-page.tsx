import Link from "next/link";

const revenueTracks = [
  {
    title: "Digital Palette Packs",
    summary:
      "Sell curated palette sets, brand-ready color systems, wallpaper bundles, and downloadable token packs.",
    detail:
      "This is the cleanest fit for a static site because the product is already the color system itself.",
  },
  {
    title: "Support / Sponsorship",
    summary:
      "Add a sponsor lane for people who want to support the archive, the open-source code, or future experiments.",
    detail:
      "This works well if the project keeps shipping in public and you want a low-friction way to capture goodwill.",
  },
  {
    title: "Custom Curation",
    summary:
      "Offer bespoke palette curation for founders, designers, landing pages, and brand refreshes.",
    detail:
      "Higher ticket, lower volume. Good once the site itself proves taste and consistency.",
  },
  {
    title: "Affiliate Layer",
    summary:
      "Add carefully chosen design-tool or productivity-tool recommendations around the collections and workflow pages.",
    detail:
      "Only worth it if the editorial quality stays high. Otherwise it weakens the brand quickly.",
  },
] as const;

const implementationSteps = [
  "Launch paid collection downloads before building a heavy product stack.",
  "Use off-site checkout first so the main site stays static and simple.",
  "Keep at least one free collection as a preview and trust builder.",
  "Only add accounts, licensing, or member systems if demand is real.",
] as const;

const upgradeComparison = [
  {
    label: "Free layer",
    summary: "Preview assets and one strong sample collection",
    detail: "Best for proving taste, getting shares, and giving people a clear first step while checkout is pending.",
  },
  {
    label: "Paid packs",
    summary: "Broader exports, more collections, clearer usage guidance",
    detail: "Best for people who need to move from inspiration to an actual landing page, brand system, or content workflow.",
  },
] as const;

const staticFriendlyTools = [
  {
    title: "Lemon Squeezy",
    summary: "Merchant-of-record flow for digital products and software without building checkout yourself.",
    href: "https://www.lemonsqueezy.com/",
  },
  {
    title: "Stripe Payment Links",
    summary: "No-code payment pages you can link from a static site or embed as buy buttons.",
    href: "https://docs.stripe.com/payment-links",
  },
  {
    title: "GitHub Sponsors",
    summary: "Low-friction support lane if you keep ColorArchive public and continue shipping in the open.",
    href: "https://docs.github.com/en/sponsors",
  },
] as const;

export function SupportPage() {
  return (
    <main className="px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        <section className="relative overflow-hidden rounded-[2rem] border border-black/6 bg-white/74 px-6 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-10 sm:py-14">
          <div className="pointer-events-none absolute -left-10 top-8 h-52 w-52 rounded-full bg-amber-200/30 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-emerald-200/24 blur-3xl" />
          <div className="relative mx-auto max-w-4xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/85 px-3 py-1 text-xs font-medium tracking-[0.22em] text-neutral-500 uppercase">
              <span className="inline-block h-2 w-2 rounded-full bg-neutral-900" />
              Support and monetization
            </div>

            <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-6xl">
              Build revenue around the archive, not against it
            </h1>

            <p className="mt-4 max-w-2xl text-balance text-base leading-7 text-neutral-600 sm:text-lg">
              The strongest commercial path here is still the simplest one: sell curated color
              assets and keep the main product lightweight, shareable, and static.
            </p>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          {revenueTracks.map((track) => (
            <article
              key={track.title}
              className="rounded-[1.7rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]"
            >
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                Revenue track
              </div>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-neutral-950">
                {track.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-neutral-600">{track.summary}</p>
              <p className="mt-3 text-sm leading-6 text-neutral-500">{track.detail}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(20rem,0.95fr)]">
          <div className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
              Recommended launch sequence
            </div>
            <div className="mt-4 space-y-3">
              {implementationSteps.map((step, index) => (
                <div
                  key={step}
                  className="flex gap-3 rounded-[1.2rem] border border-black/6 bg-neutral-50 px-4 py-4"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-sm font-medium text-white">
                    {index + 1}
                  </div>
                  <div className="text-sm leading-6 text-neutral-600">{step}</div>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
              Suggested first offers
            </div>
            <div className="mt-4 space-y-3 text-sm leading-6 text-neutral-600">
              <p>
                <strong className="font-semibold text-neutral-950">Palette Pack Vol. 1</strong>
                {" "}— 24 curated sets exported as PNG, CSS variables, and Tailwind tokens.
              </p>
              <p>
                <strong className="font-semibold text-neutral-950">Brand Color Starter Kit</strong>
                {" "}— premium neutrals, campaign accents, landing-page presets, and usage notes.
              </p>
              <p>
                <strong className="font-semibold text-neutral-950">Supporter tier</strong>
                {" "}— simple sponsorship for people who want to support the public archive.
              </p>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href="/free-pack"
                className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
              >
                Open free sample
              </Link>
              <Link
                href="/collections"
                className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                Browse collections
              </Link>
              <Link
                href="/waitlist"
                className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                Open waitlist
              </Link>
              <Link
                href="/product-examples"
                className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                Product examples
              </Link>
              <Link
                href="/word-to-color"
                className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                Open generator
              </Link>
            </div>
          </aside>
        </section>

        <section className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
            Static-friendly commerce stack
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            {staticFriendlyTools.map((tool) => (
              <a
                key={tool.title}
                href={tool.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-[1.4rem] border border-black/6 bg-neutral-50 px-4 py-4 transition hover:-translate-y-0.5 hover:bg-white"
              >
                <div className="text-lg font-semibold tracking-[-0.02em] text-neutral-950">
                  {tool.title}
                </div>
                <p className="mt-2 text-sm leading-6 text-neutral-600">{tool.summary}</p>
              </a>
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          {upgradeComparison.map((lane) => (
            <article
              key={lane.label}
              className="rounded-[1.7rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]"
            >
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                {lane.label}
              </div>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-neutral-950">
                {lane.summary}
              </h2>
              <p className="mt-3 text-sm leading-6 text-neutral-600">{lane.detail}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(20rem,0.95fr)]">
          <div className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
              Payment review prep
            </div>
            <div className="mt-4 space-y-3 text-sm leading-6 text-neutral-600">
              <p>
                If Lemon Squeezy, Stripe, or another provider asks for product proof, use the live
                site itself: the packs page, collections page, and dedicated product examples page
                now show concrete digital deliverables rather than generic promises.
              </p>
              <p>
                The important point is that ColorArchive already has a business URL, public
                examples, and product framing. What remains is wiring the final checkout links.
              </p>
            </div>
          </div>

          <aside className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
              Share these routes
            </div>
            <div className="mt-4 space-y-2 text-sm text-neutral-600">
              <div className="rounded-[1rem] border border-black/6 bg-neutral-50 px-3 py-3">
                `/packs`
              </div>
              <div className="rounded-[1rem] border border-black/6 bg-neutral-50 px-3 py-3">
                `/product-examples`
              </div>
              <div className="rounded-[1rem] border border-black/6 bg-neutral-50 px-3 py-3">
                `/free-pack`
              </div>
              <div className="rounded-[1rem] border border-black/6 bg-neutral-50 px-3 py-3">
                `/collections`
              </div>
              <div className="rounded-[1rem] border border-black/6 bg-neutral-50 px-3 py-3">
                `/waitlist`
              </div>
              <div className="rounded-[1rem] border border-black/6 bg-neutral-50 px-3 py-3">
                `/thanks`
              </div>
              <div className="rounded-[1rem] border border-black/6 bg-neutral-50 px-3 py-3">
                `/cancel`
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
