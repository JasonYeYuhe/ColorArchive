import Link from "next/link";
import { SiteHeader } from "@/src/components/site-header";

export default function NotFound() {
  return (
    <>
      <SiteHeader currentPath="/" />
      <main className="px-4 py-4 sm:px-6 sm:py-6">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
          <section className="rounded-[2rem] border border-black/6 bg-white/80 px-6 py-16 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:px-10 sm:py-20">
            <div className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/90 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-neutral-500">
              <span className="inline-block h-2 w-2 rounded-full bg-neutral-900" />
              404
            </div>
            <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-6xl">
              Page not found
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-neutral-600">
              This route doesn't exist in the archive. The color, collection, or page you're looking
              for may have moved or never existed.
            </p>
            <div className="mt-6 rounded-2xl border border-black/6 bg-white/60 px-5 py-4 backdrop-blur">
              <p className="text-sm text-neutral-500">
                Try searching for a color by name, hex code, or family —{" "}
                <Link href="/search/" className="font-medium text-neutral-950 underline underline-offset-2 transition hover:text-neutral-700">
                  go to search
                </Link>
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              <Link
                href="/"
                className="rounded-full border border-black/8 bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800"
              >
                Back to archive
              </Link>
              <Link
                href="/all-colors/"
                className="rounded-full border border-black/8 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                All colors
              </Link>
              <Link
                href="/collections/"
                className="rounded-full border border-black/8 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                Collections
              </Link>
              <Link
                href="/packs/"
                className="rounded-full border border-black/8 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                Packs
              </Link>
              <Link
                href="/free-pack/"
                className="rounded-full border border-black/8 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                Free pack
              </Link>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
