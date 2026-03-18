"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ShareLinkButton } from "@/src/components/share-link-button";
import type { ColorCollection } from "@/src/lib/collections";

interface CollectionsPageProps {
  collections: readonly ColorCollection[];
}

function CopyButton({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setCopied(false), 1400);
    return () => window.clearTimeout(timeoutId);
  }, [copied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-neutral-600 transition hover:bg-neutral-950 hover:text-white"
    >
      {copied ? `${label} copied` : `Copy ${label}`}
    </button>
  );
}

export function CollectionsPage({ collections }: CollectionsPageProps) {
  const [activeCollectionId, setActiveCollectionId] = useState<string>(collections[0]?.id ?? "");

  const activeCollection = useMemo(
    () => collections.find((collection) => collection.id === activeCollectionId) ?? collections[0],
    [activeCollectionId, collections],
  );

  const paletteExport = useMemo(() => {
    if (!activeCollection) {
      return "";
    }

    return activeCollection.palette
      .map((color, index) => `${index + 1}. ${color.name} ${color.hex}`)
      .join("\n");
  }, [activeCollection]);

  const cssVariableExport = useMemo(() => {
    if (!activeCollection) {
      return "";
    }

    return activeCollection.palette
      .map((color, index) => `--${activeCollection.id}-${index + 1}: ${color.hex};`)
      .join("\n");
  }, [activeCollection]);

  if (!activeCollection) {
    return null;
  }

  return (
    <main className="px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        <section className="relative overflow-hidden rounded-[2rem] border border-black/6 bg-white/74 px-6 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-10 sm:py-14">
          <div className="pointer-events-none absolute left-0 top-0 h-56 w-56 rounded-full bg-pink-200/28 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-10 h-64 w-64 rounded-full bg-sky-200/28 blur-3xl" />
          <div className="relative mx-auto max-w-4xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/85 px-3 py-1 text-xs font-medium tracking-[0.22em] text-neutral-500 uppercase">
              <span className="inline-block h-2 w-2 rounded-full bg-neutral-900" />
              Curated palette collections
            </div>

            <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-6xl">
              Collection sets built for real use
            </h1>

            <p className="mt-4 max-w-2xl text-balance text-base leading-7 text-neutral-600 sm:text-lg">
              These are not just random groups of swatches. Each collection is a reusable palette
              with a tone, context, and export-ready structure.
            </p>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(18rem,0.85fr)_minmax(0,1.15fr)]">
          <aside className="rounded-[1.75rem] border border-black/6 bg-white/80 p-4 shadow-[0_18px_48px_rgba(15,23,42,0.05)] sm:p-5">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
              Collections
            </div>
            <div className="mt-4 space-y-3">
              {collections.map((collection) => {
                const isActive = collection.id === activeCollection.id;

                return (
                  <button
                    key={collection.id}
                    type="button"
                    onClick={() => setActiveCollectionId(collection.id)}
                    className={`w-full rounded-[1.4rem] border px-4 py-4 text-left transition ${
                      isActive
                        ? "border-neutral-950/12 bg-neutral-950 text-white"
                        : "border-black/6 bg-white hover:bg-neutral-50"
                    }`}
                  >
                    <div
                      className={`text-xs uppercase tracking-[0.16em] ${
                        isActive ? "text-white/60" : "text-neutral-400"
                      }`}
                    >
                      {collection.tags.join(" · ")}
                    </div>
                    <div className="mt-2 text-lg font-semibold tracking-[-0.02em]">
                      {collection.title}
                    </div>
                    <div className={`mt-2 text-sm leading-6 ${isActive ? "text-white/78" : "text-neutral-600"}`}>
                      {collection.summary}
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="space-y-5">
            <div className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                    Active set
                  </div>
                  <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-neutral-950">
                    {activeCollection.title}
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
                    {activeCollection.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {activeCollection.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-neutral-500"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <CopyButton label="palette" value={paletteExport} />
                  <CopyButton label="CSS vars" value={cssVariableExport} />
                  <Link
                    href={`/collections/${activeCollection.id}`}
                    className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-neutral-600 transition hover:bg-neutral-950 hover:text-white"
                  >
                    Open detail
                  </Link>
                  <ShareLinkButton href={`/collections#${activeCollection.id}`} />
                </div>
              </div>
            </div>

            <div id={activeCollection.id} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {activeCollection.palette.map((color, index) => (
                <Link
                  key={color.id}
                  href={`/colors/${color.id}/`}
                  className="overflow-hidden rounded-[1.4rem] border border-black/6 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(15,23,42,0.08)]"
                >
                  <div className="h-36 border-b border-black/6" style={{ backgroundColor: color.hex }} />
                  <div className="p-4">
                    <div className="text-xs uppercase tracking-[0.16em] text-neutral-400">
                      {index + 1}
                    </div>
                    <div className="mt-2 text-lg font-semibold tracking-[-0.02em] text-neutral-950">
                      {color.name}
                    </div>
                    <div className="mt-1 text-sm text-neutral-500">{color.hex}</div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                Export preview
              </div>
              <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-[1.2rem] border border-black/6 bg-neutral-50 px-4 py-4 text-sm leading-6 text-neutral-600">
                {paletteExport}
              </pre>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
