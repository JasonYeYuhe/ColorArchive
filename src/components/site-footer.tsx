import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="px-4 pb-4 pt-2 sm:px-6 sm:pb-6">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 rounded-[1.75rem] border border-black/6 bg-white/66 px-5 py-5 text-sm text-neutral-500 shadow-[0_18px_48px_rgba(15,23,42,0.04)] backdrop-blur-xl sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div className="space-y-3">
          <Link href="/" className="inline-flex items-center">
            <Image
              src="/logo-footer.png"
              alt="ColorArchive"
              width={320}
              height={213}
              className="h-auto w-[180px]"
              priority
            />
          </Link>
          <p className="max-w-2xl leading-6">
            Static, local-only color archive built for GitHub Pages. The archive, search tools,
            and generators all run from local data with no backend dependency.
          </p>
          <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.16em] text-neutral-400">
            <Link href="/recent" className="rounded-full border border-black/8 bg-white px-3 py-1.5 transition hover:bg-neutral-50">
              Recent
            </Link>
            <Link href="/favorites" className="rounded-full border border-black/8 bg-white px-3 py-1.5 transition hover:bg-neutral-50">
              Favorites
            </Link>
            <Link href="/about" className="rounded-full border border-black/8 bg-white px-3 py-1.5 transition hover:bg-neutral-50">
              About
            </Link>
            <Link href="/updates" className="rounded-full border border-black/8 bg-white px-3 py-1.5 transition hover:bg-neutral-50">
              Updates
            </Link>
            <Link href="/packs" className="rounded-full border border-black/8 bg-white px-3 py-1.5 transition hover:bg-neutral-50">
              Packs
            </Link>
          </div>
        </div>

        <div className="space-y-2 text-left sm:text-right">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-neutral-400 sm:justify-end">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            Ready for static export
          </div>
          <div className="text-xs uppercase tracking-[0.16em] text-neutral-400">
            colorarchive.me · © 2026 ColorArchive
          </div>
        </div>
      </div>
    </footer>
  );
}
