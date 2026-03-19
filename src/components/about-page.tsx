import Link from "next/link";

const principles = [
  {
    title: "Static by design",
    detail:
      "The catalog still ships as static pages, but lightweight API endpoints now handle commerce, email, analytics, and optional account sync.",
  },
  {
    title: "Curated, not exhaustive",
    detail:
      "ColorArchive does not try to dump the entire RGB universe into one page. It focuses on a large but navigable archive with structure.",
  },
  {
    title: "Useful, not ornamental",
    detail:
      "Every route should either help someone find, compare, export, reuse, or eventually buy a color system.",
  },
] as const;

const routeGroups = [
  {
    title: "Archive",
    items: ["Main archive", "All Colors", "Color detail pages", "Spectrum"],
  },
  {
    title: "Workflow",
    items: ["Search", "Favorites", "Recent", "Word → Color"],
  },
  {
    title: "Product",
    items: ["Collections", "Packs", "Product Examples", "Free Sample Pack"],
  },
] as const;

const generationSteps = [
  {
    label: "Hue roots",
    value: "36",
    detail: "Evenly spaced hues across 0–360° in 10° increments.",
  },
  {
    label: "Lightness bands",
    value: "7",
    detail: "From near-white (95%) down to near-black (15%), stepped for perceptual evenness.",
  },
  {
    label: "Chroma bands",
    value: "8",
    detail: "Saturation steps from muted (12%) to vivid (95%), giving each hue depth.",
  },
  {
    label: "Total colors",
    value: "2016",
    detail: "36 × 7 × 8 = 2016 unique HSL entries. All generated in colors.ts at build time.",
  },
] as const;

const hostingTradeoffs = [
  {
    label: "GitHub Pages (current)",
    pros: ["Free, zero-ops", "Forces static discipline", "Great for the archive surface"],
    cons: ["Needs a separate API host", "Checkout must be off-site", "Dynamic features live elsewhere"],
  },
  {
    label: "Vercel / Netlify",
    pros: ["Edge functions available", "Instant deploy previews", "Could consolidate frontend and API"],
    cons: ["Paid tier for team use", "Adds infra dependency"],
  },
  {
    label: "Full backend (if needed)",
    pros: ["Licensed downloads", "Deeper account features", "API for token generation"],
    cons: ["Auth complexity", "Database ops", "Higher cost and maintenance"],
  },
] as const;

export function AboutPage() {
  return (
    <main className="px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        <section className="relative overflow-hidden rounded-[2rem] border border-black/6 bg-white/74 px-6 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-10 sm:py-14">
          <div className="pointer-events-none absolute left-0 top-0 h-56 w-56 rounded-full bg-sky-200/28 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-8 h-64 w-64 rounded-full bg-rose-200/24 blur-3xl" />
          <div className="relative mx-auto max-w-5xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/85 px-3 py-1 text-xs font-medium tracking-[0.22em] text-neutral-500 uppercase">
              <span className="inline-block h-2 w-2 rounded-full bg-neutral-900" />
              About ColorArchive
            </div>
            <h1 className="max-w-4xl text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-6xl">
              A static color library with product intent
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-600 sm:text-lg">
              ColorArchive started as a color archive and expanded into a lightweight static product:
              discovery routes, reusable palette exports, and product layers that can later support
              off-site checkout.
            </p>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {principles.map((principle) => (
            <article
              key={principle.title}
              className="rounded-[1.7rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]"
            >
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                Principle
              </div>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-neutral-950">
                {principle.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-neutral-600">{principle.detail}</p>
            </article>
          ))}
        </section>

        {/* Color generation algorithm */}
        <section className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
            How the 2016 colors are generated
          </div>
          <p className="mt-4 text-sm leading-6 text-neutral-600">
            Every color in the archive is produced algorithmically in{" "}
            <code className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-xs text-neutral-700">
              src/data/colors.ts
            </code>{" "}
            at build time — no database, no external color API. The generation
            multiplies three HSL dimensions: hue roots, lightness bands, and chroma bands.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {generationSteps.map((step) => (
              <div
                key={step.label}
                className="rounded-[1.2rem] border border-black/6 bg-neutral-50 px-4 py-4"
              >
                <div className="text-3xl font-semibold tracking-[-0.04em] text-neutral-950">
                  {step.value}
                </div>
                <div className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-neutral-400">
                  {step.label}
                </div>
                <p className="mt-2 text-xs leading-5 text-neutral-500">{step.detail}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-[1.2rem] border border-black/6 bg-neutral-50 px-4 py-4 text-sm leading-6 text-neutral-600">
            Each color gets a stable slug derived from its HSL values, so every color detail page
            can be pre-rendered with{" "}
            <code className="rounded bg-neutral-100 px-1 py-0.5 font-mono text-xs text-neutral-700">
              generateStaticParams()
            </code>{" "}
            and served as flat HTML — no runtime needed.
          </div>
        </section>

        {/* Why static + hosting tradeoffs */}
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)]">
          <div className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
              Hosting tradeoffs
            </div>
            <div className="mt-4 space-y-3">
              {hostingTradeoffs.map((tier) => (
                <div
                  key={tier.label}
                  className="rounded-[1.2rem] border border-black/6 bg-neutral-50 px-4 py-4"
                >
                  <div className="text-sm font-semibold text-neutral-950">{tier.label}</div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <div>
                      <div className="mb-1.5 text-xs font-medium uppercase tracking-[0.14em] text-emerald-600">
                        Pros
                      </div>
                      <ul className="space-y-1">
                        {tier.pros.map((pro) => (
                          <li key={pro} className="text-xs leading-5 text-neutral-600">
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="mb-1.5 text-xs font-medium uppercase tracking-[0.14em] text-rose-500">
                        Tradeoffs
                      </div>
                      <ul className="space-y-1">
                        {tier.cons.map((con) => (
                          <li key={con} className="text-xs leading-5 text-neutral-500">
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-sm leading-6 text-neutral-500">
              The current GitHub Pages setup is still the right default for the archive UI. Dynamic
              features already run on a separate API host, which keeps the browsing layer static
              while still supporting checkout webhooks, email delivery, analytics, and account sync.
            </div>
          </div>

          <aside className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
              Route groups
            </div>
            <div className="mt-4 space-y-4">
              {routeGroups.map((group) => (
                <div
                  key={group.title}
                  className="rounded-[1.2rem] border border-black/6 bg-neutral-50 px-4 py-4"
                >
                  <div className="text-sm font-semibold text-neutral-950">{group.title}</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-neutral-500"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
          <div className="flex flex-wrap gap-2">
            <Link
              href="/updates"
              className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              Open updates
            </Link>
            <Link
              href="/support"
              className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
            >
              Support
            </Link>
            <Link
              href="/free-pack"
              className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
            >
              Free sample
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
