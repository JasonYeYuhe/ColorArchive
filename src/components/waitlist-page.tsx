"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { EmailCaptureForm } from "@/src/components/email-capture-form";
import type { WaitlistConfig } from "@/src/lib/checkout-config";
import type { PalettePack } from "@/src/lib/palette-packs";

interface WaitlistPageProps {
  packs: readonly PalettePack[];
  waitlist: WaitlistConfig;
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
      className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
    >
      {copied ? `${label} copied` : `Copy ${label}`}
    </button>
  );
}

export function WaitlistPage({ packs, waitlist }: WaitlistPageProps) {
  const sampleRequest = useMemo(
    () =>
      [
        "Hi,",
        "",
        "I want updates when new ColorArchive palette packs go live.",
        "",
        "Most interested in:",
        "- Palette Pack Vol. 1",
        "- Brand Color Starter Kit",
        "",
        "Please keep me posted on preview drops, pricing, and launch timing.",
        "",
        `Preferred contact path: ${waitlist.provider}`,
      ].join("\n"),
    [waitlist.provider],
  );

  return (
    <main className="px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        <section className="relative overflow-hidden rounded-[2rem] border border-black/6 bg-white/74 px-6 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-10 sm:py-14">
          <div className="pointer-events-none absolute left-0 top-4 h-52 w-52 rounded-full bg-amber-200/30 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-fuchsia-200/24 blur-3xl" />
          <div className="relative mx-auto max-w-4xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/85 px-3 py-1 text-xs font-medium tracking-[0.22em] text-neutral-500 uppercase">
              <span className="inline-block h-2 w-2 rounded-full bg-neutral-900" />
              Product updates
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-6xl">
              Stay on the list for future drops and launch updates
            </h1>
            <p className="mt-4 max-w-2xl text-balance text-base leading-7 text-neutral-600 sm:text-lg">
              The current packs are already live. This page now works as the ongoing updates layer
              for seasonal releases, new bundle drops, monthly curated palettes, and archive product announcements.
            </p>

            <div className="mt-6">
              <p className="mb-2 text-sm text-neutral-500">
                Enter your email to get product updates and future release notices:
              </p>
              <EmailCaptureForm
                source="waitlist"
                buttonLabel="Join updates"
                successMessage="You're on the list — we'll email you about future drops and updates."
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/packs"
                className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                Browse packs
              </Link>
              <Link
                href="/product-examples"
                className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                Open product proof
              </Link>
              <Link
                href="/notes"
                className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                Read notes
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-3">
          {packs.map((pack) => {
            const request = [
              "Hi,",
              "",
              `I want updates about ${pack.title}.`,
              "",
              `Why I’m interested: ${pack.audience}`,
              `Preferred price lane: ${pack.priceHint}`,
              "",
              "Please send launch timing and final checkout details when available.",
            ].join("\n");

            return (
              <article
                key={pack.id}
                className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]"
              >
                <div className="text-xs uppercase tracking-[0.16em] text-neutral-400">{pack.ctaLabel}</div>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-neutral-950">
                  {pack.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-neutral-600">{pack.detail}</p>
                <div className="mt-4 rounded-[1.2rem] border border-black/6 bg-neutral-50 px-4 py-4">
                  <div className="text-xs uppercase tracking-[0.16em] text-neutral-400">Best for</div>
                  <p className="mt-2 text-sm leading-6 text-neutral-600">{pack.audience}</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <CopyButton label={`${pack.title} note`} value={request} />
                  <Link
                    href={`/packs/${pack.id}`}
                    className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                  >
                    Pack details
                  </Link>
                </div>
              </article>
            );
          })}
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)]">
          <div className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
              How to use this page now
            </div>
            <div className="mt-4 space-y-3 text-sm leading-6 text-neutral-600">
              <p>
                Enter your email above to hear about future pack launches, seasonal drops,
                archive expansions, pricing updates, and one curated palette direction at a time.
              </p>
              <p>
                The six current packs are already live. The list now exists for the next release
                cycle rather than the initial launch.
              </p>
            </div>
          </div>

          <aside className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
              Updates config
            </div>
            <div className="mt-4 space-y-2 text-sm text-neutral-600">
              <div className="rounded-[1rem] border border-black/6 bg-neutral-50 px-3 py-3">
                Provider: {waitlist.provider}
              </div>
              <div className="rounded-[1rem] border border-black/6 bg-neutral-50 px-3 py-3">
                {waitlist.url ? `Join URL: ${waitlist.url}` : `Contact: ${waitlist.contactEmail}`}
              </div>
              <div className="rounded-[1rem] border border-black/6 bg-neutral-50 px-3 py-3">
                {waitlist.note}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/support"
                className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
              >
                Support
              </Link>
              <Link
                href="/packs"
                className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                Packs
              </Link>
              <Link
                href="/notes"
                className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                Notes
              </Link>
              <Link
                href="/thanks"
                className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                Purchase thanks
              </Link>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
