"use client";

import Link from "next/link";
import { SiteHeader } from "@/src/components/site-header";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <>
      <SiteHeader currentPath="/" />
      <main className="px-4 py-4 sm:px-6 sm:py-6">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
          <section className="rounded-[2rem] border border-black/6 bg-white/80 px-6 py-16 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:px-10 sm:py-20 dark:bg-neutral-900 dark:border-white/10">
            <div className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/90 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-neutral-500 dark:bg-white/10 dark:border-white/10">
              <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
              Error
            </div>
            <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-6xl dark:text-white">
              Something went wrong
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-neutral-600 dark:text-neutral-400">
              An unexpected error occurred. You can try again, or navigate back
              to the archive.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              <button
                onClick={reset}
                className="rounded-full border border-black/8 bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
              >
                Try again
              </button>
              <Link
                href="/"
                className="rounded-full border border-black/8 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 dark:bg-white/10 dark:text-neutral-300 dark:border-white/10 dark:hover:bg-white/15"
              >
                Back to archive
              </Link>
              <Link
                href="/all-colors/"
                className="rounded-full border border-black/8 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 dark:bg-white/10 dark:text-neutral-300 dark:border-white/10 dark:hover:bg-white/15"
              >
                All colors
              </Link>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
