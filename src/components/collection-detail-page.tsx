import Link from "next/link";
import { CopyActionButton } from "@/src/components/copy-action-button";
import { ShareOnXButton, ShareLinkButton } from "@/src/components/share-link-button";
import { BulkExportButton } from "@/src/components/bulk-export-button";
import { DarkModePairsCard } from "@/src/components/dark-mode-pairs-card";
import { ProGate } from "@/src/components/pro-gate";
import type { ColorCollection } from "@/src/lib/collections";
import { getGuidesForCollection } from "@/src/lib/guides";

interface CollectionDetailPageProps {
  collection: ColorCollection;
}

function buildPaletteExport(collection: ColorCollection) {
  return collection.palette.map((color, index) => `${index + 1}. ${color.name} ${color.hex}`).join("\n");
}

function buildCssExport(collection: ColorCollection) {
  return collection.palette
    .map((color, index) => `--${collection.id}-${index + 1}: ${color.hex};`)
    .join("\n");
}

function buildTailwindExport(collection: ColorCollection) {
  return `@theme {\n${collection.palette.map((color, index) => `  --color-${collection.id}-${index + 1}: ${color.hex};`).join("\n")}\n}`;
}

export function CollectionDetailPage({
  collection,
}: CollectionDetailPageProps) {
  const relatedGuides = getGuidesForCollection(collection.id, 3);
  return (
    <main className="px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        <section className="relative overflow-hidden rounded-[2rem] border border-black/6 bg-white/74 px-6 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-10 sm:py-14">
          <div className="pointer-events-none absolute left-0 top-0 h-56 w-56 rounded-full bg-pink-200/28 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-8 h-64 w-64 rounded-full bg-sky-200/26 blur-3xl" />
          <div className="relative mx-auto max-w-5xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/85 px-3 py-1 text-xs font-medium tracking-[0.22em] text-neutral-500 uppercase">
              <span className="inline-block h-2 w-2 rounded-full bg-neutral-900" />
              Collection detail
            </div>
            <h1 className="max-w-4xl text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-6xl">
              {collection.title}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-600 sm:text-lg">
              {collection.description}
            </p>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-500">
              {collection.editorialNote}
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {collection.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-black/8 bg-white/88 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-neutral-500"
                >
                  {tag}
                </span>
              ))}
              <CopyActionButton label="Copy CSS" copiedLabel="CSS copied" value={buildCssExport(collection)} />
              <CopyActionButton label="Copy Tailwind" copiedLabel="Tailwind copied" value={buildTailwindExport(collection)} />
              <ShareOnXButton href={`/collections/${collection.id}/`} text={`${collection.title} — a curated palette from ColorArchive`} />
              <ShareLinkButton href={`/collections/${collection.id}/`} />
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(20rem,0.95fr)]">
          <div className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
              Why this set works
            </div>
            <p className="mt-4 text-sm leading-6 text-neutral-600">{collection.summary}</p>

            <div className="mt-5 grid gap-2 sm:grid-cols-3">
              {collection.useCases.map((useCase) => (
                <div
                  key={useCase}
                  className="rounded-[1rem] border border-black/6 bg-neutral-50 px-4 py-3 text-sm leading-6 text-neutral-600"
                >
                  {useCase}
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-[1.2rem] border border-black/6 bg-neutral-50 px-4 py-4">
              <div className="text-xs font-medium uppercase tracking-[0.16em] text-neutral-400">
                Prompt words
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {collection.promptWords.map((word) => (
                  <span
                    key={word}
                    className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-neutral-500"
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <aside className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
              Export ready
            </div>
            <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-[1.2rem] border border-black/6 bg-neutral-50 px-4 py-4 text-sm leading-6 text-neutral-600">
              {buildPaletteExport(collection)}
            </pre>
            <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-[1.2rem] border border-black/6 bg-neutral-50 px-4 py-4 text-sm leading-6 text-neutral-600">
              {buildCssExport(collection)}
            </pre>
            <div className="mt-4">
              <ProGate label="Bulk export">
                <BulkExportButton collection={collection} />
              </ProGate>
            </div>
          </aside>

          <aside className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
              Dark mode pairs
            </div>
            <ProGate label="Dark mode tokens">
              <DarkModePairsCard collection={collection} />
            </ProGate>
          </aside>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3 px-1">
            <div>
              <h2 className="text-xl font-semibold tracking-[-0.03em] text-neutral-950">Palette</h2>
              <p className="mt-1 text-sm text-neutral-500">
                Each swatch links back to its individual archive detail page.
              </p>
            </div>
            <Link
              href="/collections/"
              className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
            >
              Back to collections
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {collection.palette.map((color, index) => (
              <Link
                key={color.id}
                href={`/colors/${color.id}/`}
                className="overflow-hidden rounded-[1.4rem] border border-black/6 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(15,23,42,0.08)]"
              >
                <div className="h-40 border-b border-black/6" style={{ backgroundColor: color.hex }} />
                <div className="p-4">
                  <div className="text-xs uppercase tracking-[0.16em] text-neutral-400">
                    {index + 1}
                  </div>
                  <div className="mt-2 text-lg font-semibold tracking-[-0.02em] text-neutral-950">
                    {color.name}
                  </div>
                  <div className="mt-1 text-sm text-neutral-500">{color.hex}</div>
                  <div className="mt-2 text-xs uppercase tracking-[0.16em] text-neutral-400">
                    {color.family} · {color.hsl}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)]">
          <div className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
              Editorial direction
            </div>
            <div className="mt-4 space-y-3 text-sm leading-6 text-neutral-600">
              <p>
                Collections should do more than group swatches. Each one should read like a usable
                design direction with a clear emotional lane and a real application surface.
              </p>
              <p>
                This detail route is the missing layer between a generic palette gallery and a
                convincing design reference. It gives the set a specific point of view.
              </p>
            </div>
          </div>

          <aside className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
              Go further
            </div>
            <div className="mt-4 rounded-[1.2rem] border border-black/6 bg-neutral-50 px-4 py-4">
              <div className="text-sm font-semibold text-neutral-950">Unlock Pro</div>
              <div className="mt-2 text-sm leading-6 text-neutral-600">
                Pro members get unlimited exports, advanced token formats, and priority access to new collections.
              </div>
              <div className="mt-3">
                <Link
                  href="/pro/"
                  className="rounded-full bg-neutral-950 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-neutral-800"
                >
                  Learn about Pro
                </Link>
              </div>
            </div>
          </aside>
        </section>

        <section className="rounded-[1.75rem] border border-black/6 bg-neutral-950 p-5 text-white shadow-[0_18px_48px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-white dark:text-neutral-950">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-white/40 dark:text-neutral-400">
            Take this palette further
          </div>
          <p className="mt-2 text-lg font-semibold tracking-[-0.02em]">
            Ready-made tokens for {collection.title}
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60 dark:text-neutral-500">
            Pro members can export these colors as Figma tokens, CSS variables, Tailwind config, and
            Procreate swatches — structured to drop directly into your project.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/pro/"
              className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-950 transition hover:bg-neutral-200 dark:bg-neutral-950 dark:text-white dark:hover:bg-neutral-800"
            >
              Upgrade to Pro
            </Link>
            <Link
              href="/collections/"
              className="rounded-full border border-white/16 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/80 transition hover:border-white/30 hover:text-white dark:border-black/16 dark:text-neutral-600 dark:hover:border-black/30 dark:hover:text-neutral-950"
            >
              Browse collections
            </Link>
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                Upgrade path
              </div>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-neutral-950">
                From collection to Pro
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-600">
                This collection proves the taste and color direction. Pro members get advanced token
                exports, usage guidance, and downloadable assets so the palette can move from reference
                to implementation.
              </p>
            </div>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 text-left text-sm text-neutral-600">
              <thead>
                <tr>
                  <th className="rounded-l-[1rem] border border-black/6 bg-neutral-50 px-4 py-3 font-medium text-neutral-500">
                    Layer
                  </th>
                  <th className="border border-black/6 bg-neutral-50 px-4 py-3 font-medium text-neutral-500">
                    What you have here
                  </th>
                  <th className="rounded-r-[1rem] border border-black/6 bg-neutral-50 px-4 py-3 font-medium text-neutral-500">
                    What Pro adds
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black/6 bg-white px-4 py-4 align-top font-medium text-neutral-950">
                    Scope
                  </td>
                  <td className="border border-black/6 bg-white px-4 py-4 align-top">
                    One curated five-color editorial direction.
                  </td>
                  <td className="border border-black/6 bg-white px-4 py-4 align-top">
                    Unlimited access to all collections, broader token coverage, and advanced exports.
                  </td>
                </tr>
                <tr>
                  <td className="border border-black/6 bg-white px-4 py-4 align-top font-medium text-neutral-950">
                    Output
                  </td>
                  <td className="border border-black/6 bg-white px-4 py-4 align-top">
                    Visual palette, copyable CSS preview, and per-color archive pages.
                  </td>
                  <td className="border border-black/6 bg-white px-4 py-4 align-top">
                    Downloadable CSS, JSON, Tailwind, Figma tokens, and Procreate swatches.
                  </td>
                </tr>
                <tr>
                  <td className="border border-black/6 bg-white px-4 py-4 align-top font-medium text-neutral-950">
                    Use case
                  </td>
                  <td className="border border-black/6 bg-white px-4 py-4 align-top">
                    Direction finding, inspiration, and public proof.
                  </td>
                  <td className="border border-black/6 bg-white px-4 py-4 align-top">
                    Real project handoff, implementation, and reusable production assets.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {relatedGuides.length > 0 ? (
          <section className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
              Related guides
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {relatedGuides.map((guide) => (
                <Link
                  key={guide.slug}
                  href={`/guides/${guide.slug}/`}
                  className="rounded-[1.2rem] border border-black/6 bg-neutral-50 px-4 py-4 transition hover:shadow-md"
                >
                  <div className="text-sm font-semibold text-neutral-950">{guide.title}</div>
                  <div className="mt-1 text-xs leading-5 text-neutral-500">{guide.summary}</div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
