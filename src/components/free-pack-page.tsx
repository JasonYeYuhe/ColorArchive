import Link from "next/link";
import { CopyActionButton } from "@/src/components/copy-action-button";
import type { ColorCollection } from "@/src/lib/collections";
import type { WaitlistConfig } from "@/src/lib/checkout-config";
import type { PalettePack } from "@/src/lib/palette-packs";

interface FreePackPageProps {
  featuredCollection: ColorCollection;
  pack: PalettePack;
  waitlist: WaitlistConfig;
}

export function FreePackPage({
  featuredCollection,
  pack,
  waitlist,
}: FreePackPageProps) {
  const emailHref = `mailto:${waitlist.contactEmail}?subject=ColorArchive%20free%20sample`;
  const requestTemplate = [
    "Hi,",
    "",
    "I downloaded the free ColorArchive sample pack and want updates when the paid packs go live.",
    "",
    `Most interested in: ${pack.title}`,
    "Please send launch timing, final pricing, and checkout links when available.",
    "",
    `Preferred contact path: ${waitlist.provider}`,
  ].join("\n");
  const comparisonRows = [
    {
      label: "Price",
      freeValue: "Free",
      paidValue: pack.priceHint,
    },
    {
      label: "Formats",
      freeValue: `${pack.sampleDownloads.map((sample) => sample.format).join(" · ")}`,
      paidValue: pack.formatList.join(" · "),
    },
    {
      label: "Scope",
      freeValue: "Preview files and one featured collection",
      paidValue: pack.deliverables.slice(0, 2).join(" · "),
    },
    {
      label: "Use case",
      freeValue: "Try the style and export shape",
      paidValue: "Ship a fuller palette system into a real project",
    },
  ] as const;

  return (
    <main className="px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        <section className="relative overflow-hidden rounded-[2rem] border border-black/6 bg-white/74 px-6 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-10 sm:py-14">
          <div className="pointer-events-none absolute left-0 top-0 h-56 w-56 rounded-full bg-emerald-200/28 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-8 h-64 w-64 rounded-full bg-violet-200/24 blur-3xl" />
          <div className="relative mx-auto max-w-5xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/85 px-3 py-1 text-xs font-medium tracking-[0.22em] text-neutral-500 uppercase">
              <span className="inline-block h-2 w-2 rounded-full bg-neutral-900" />
              Free sample drop
            </div>
            <h1 className="max-w-4xl text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-6xl">
              Download a free sample before paid checkout goes live
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-600 sm:text-lg">
              Get a taste of the paid packs before checkout goes live. Download preview CSS tokens
              and a JSON palette export — no signup, no email required.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {pack.sampleDownloads.map((sample) => (
                <a
                  key={sample.href}
                  href={sample.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
                >
                  {sample.label}
                </a>
              ))}
              {waitlist.url ? (
                <a
                  href={waitlist.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                >
                  Join waitlist
                </a>
              ) : (
                <a
                  href={emailHref}
                  className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                >
                  Email for updates
                </a>
              )}
              <CopyActionButton label="Copy request note" value={requestTemplate} />
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(20rem,0.95fr)]">
          <div className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
              What is included in the free layer
            </div>
            <div className="mt-4 grid gap-2">
              {pack.sampleDownloads.map((sample) => (
                <a
                  key={sample.href}
                  href={sample.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-[1rem] border border-black/6 bg-neutral-50 px-4 py-3 text-sm leading-6 text-neutral-600 transition hover:bg-white"
                >
                  {sample.label} · {sample.format}
                </a>
              ))}
              <div className="rounded-[1rem] border border-black/6 bg-neutral-50 px-4 py-3 text-sm leading-6 text-neutral-600">
                Curated preview collection: {featuredCollection.title}
              </div>
            </div>
          </div>

          <aside className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
              Why this exists
            </div>
            <div className="mt-4 space-y-3 text-sm leading-6 text-neutral-600">
              <p>
                The free sample gives you the exact file shapes used in the paid packs — CSS
                variables, JSON color data, and a featured palette — so you can decide whether the
                format fits your project before buying.
              </p>
              <p>
                When paid checkout goes live, this page stays as a permanent free tier. The
                full packs add more collections, higher-resolution boards, and structured usage
                guidance on top of what you see here.
              </p>
            </div>

            <div className="mt-5 rounded-[1.2rem] border border-black/6 bg-neutral-50 px-4 py-4">
              <div className="text-xs font-medium uppercase tracking-[0.16em] text-neutral-400">
                Claim flow
              </div>
              <div className="mt-3 space-y-2 text-sm leading-6 text-neutral-600">
                <div className="rounded-[1rem] border border-black/6 bg-white px-3 py-3">
                  1. Download the preview files below.
                </div>
                <div className="rounded-[1rem] border border-black/6 bg-white px-3 py-3">
                  2. Review the featured collection and export shape.
                </div>
                <div className="rounded-[1rem] border border-black/6 bg-white px-3 py-3">
                  3. Join the waitlist or email if you want the full paid version.
                </div>
              </div>
            </div>
          </aside>
        </section>

        <section className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                Free vs paid
              </div>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-neutral-950">
                What changes when the paid pack goes live
              </h2>
            </div>
            <Link
              href={`/packs/${pack.id}`}
              className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              Open paid pack
            </Link>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 text-left text-sm text-neutral-600">
              <thead>
                <tr>
                  <th className="rounded-l-[1rem] border border-black/6 bg-neutral-50 px-4 py-3 font-medium text-neutral-500">
                    Layer
                  </th>
                  <th className="border border-black/6 bg-neutral-50 px-4 py-3 font-medium text-neutral-500">
                    Free sample
                  </th>
                  <th className="rounded-r-[1rem] border border-black/6 bg-neutral-50 px-4 py-3 font-medium text-neutral-500">
                    Paid pack
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.label}>
                    <td className="border border-black/6 bg-white px-4 py-4 align-top font-medium text-neutral-950">
                      {row.label}
                    </td>
                    <td className="border border-black/6 bg-white px-4 py-4 align-top">
                      {row.freeValue}
                    </td>
                    <td className="border border-black/6 bg-white px-4 py-4 align-top">
                      {row.paidValue}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                Featured preview collection
              </div>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-neutral-950">
                {featuredCollection.title}
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-600">
                {featuredCollection.summary}
              </p>
            </div>
            <Link
              href={`/collections/${featuredCollection.id}`}
              className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
            >
              Open collection
            </Link>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {featuredCollection.palette.map((color) => (
              <Link
                key={color.id}
                href={`/colors/${color.id}/`}
                className="overflow-hidden rounded-[1.3rem] border border-black/6 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(15,23,42,0.08)]"
              >
                <div className="h-36 border-b border-black/6" style={{ backgroundColor: color.hex }} />
                <div className="p-4">
                  <div className="text-base font-semibold tracking-[-0.02em] text-neutral-950">
                    {color.name}
                  </div>
                  <div className="mt-1 text-sm text-neutral-500">{color.hex}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
          <div className="flex flex-wrap gap-2">
            <Link
              href="/packs"
              className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              View paid packs
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
              Product proof
            </Link>
            <a
              href={waitlist.url ?? emailHref}
              target={waitlist.url ? "_blank" : undefined}
              rel={waitlist.url ? "noreferrer" : undefined}
              className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
            >
              {waitlist.url ? "Join waitlist" : "Email for launch"}
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
