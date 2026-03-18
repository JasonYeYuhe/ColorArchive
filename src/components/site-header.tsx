import Image from "next/image";
import Link from "next/link";

interface SiteHeaderProps {
  currentPath:
    | "/"
    | "/all-colors"
    | "/about"
    | "/collections"
    | "/favorites"
    | "/packs"
    | "/recent"
    | "/search"
    | "/spectrum"
    | "/support"
    | "/surprise"
    | "/updates"
    | "/word-to-color"
    | "/colors";
}

export function SiteHeader({ currentPath }: SiteHeaderProps) {
  return (
    <header className="px-4 pt-4 sm:px-6 sm:pt-6">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-3 rounded-[1.5rem] border border-black/6 bg-white/72 px-4 py-3 shadow-[0_18px_48px_rgba(15,23,42,0.05)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo-header.png"
            alt="ColorArchive"
            width={512}
            height={341}
            className="h-auto w-[168px] sm:w-[188px]"
            priority
          />
        </Link>

        <nav className="-mx-1 flex w-full items-center gap-2 overflow-x-auto px-1 sm:mx-0 sm:w-auto sm:px-0">
          <Link
            href="/"
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
              currentPath === "/" || currentPath === "/colors"
                ? "bg-neutral-950 text-white"
                : "border border-black/8 bg-white/85 text-neutral-700 hover:bg-white"
            }`}
          >
            Archive
          </Link>
          <Link
            href="/all-colors"
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
              currentPath === "/all-colors"
                ? "bg-neutral-950 text-white"
                : "border border-black/8 bg-white/85 text-neutral-700 hover:bg-white"
            }`}
          >
            All Colors
          </Link>
          <Link
            href="/search"
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
              currentPath === "/search"
                ? "bg-neutral-950 text-white"
                : "border border-black/8 bg-white/85 text-neutral-700 hover:bg-white"
            }`}
          >
            Search
          </Link>
          <Link
            href="/collections"
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
              currentPath === "/collections"
                ? "bg-neutral-950 text-white"
                : "border border-black/8 bg-white/85 text-neutral-700 hover:bg-white"
            }`}
          >
            Collections
          </Link>
          <Link
            href="/favorites"
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
              currentPath === "/favorites"
                ? "bg-neutral-950 text-white"
                : "border border-black/8 bg-white/85 text-neutral-700 hover:bg-white"
            }`}
          >
            Favorites
          </Link>
          <Link
            href="/recent"
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
              currentPath === "/recent"
                ? "bg-neutral-950 text-white"
                : "border border-black/8 bg-white/85 text-neutral-700 hover:bg-white"
            }`}
          >
            Recent
          </Link>
          <Link
            href="/spectrum"
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
              currentPath === "/spectrum"
                ? "bg-neutral-950 text-white"
                : "border border-black/8 bg-white/85 text-neutral-700 hover:bg-white"
            }`}
          >
            Spectrum
          </Link>
          <Link
            href="/word-to-color"
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
              currentPath === "/word-to-color"
                ? "bg-neutral-950 text-white"
                : "border border-black/8 bg-white/85 text-neutral-700 hover:bg-white"
            }`}
          >
            Word → Color
          </Link>
          <Link
            href="/surprise"
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
              currentPath === "/surprise"
                ? "bg-neutral-950 text-white"
                : "border border-black/8 bg-white/85 text-neutral-700 hover:bg-white"
            }`}
          >
            Surprise
          </Link>
          <Link
            href="/support"
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
              currentPath === "/support"
                ? "bg-neutral-950 text-white"
                : "border border-black/8 bg-white/85 text-neutral-700 hover:bg-white"
            }`}
          >
            Support
          </Link>
          <Link
            href="/about"
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
              currentPath === "/about"
                ? "bg-neutral-950 text-white"
                : "border border-black/8 bg-white/85 text-neutral-700 hover:bg-white"
            }`}
          >
            About
          </Link>
          <Link
            href="/updates"
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
              currentPath === "/updates"
                ? "bg-neutral-950 text-white"
                : "border border-black/8 bg-white/85 text-neutral-700 hover:bg-white"
            }`}
          >
            Updates
          </Link>
          <Link
            href="/packs"
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
              currentPath === "/packs"
                ? "bg-neutral-950 text-white"
                : "border border-black/8 bg-white/85 text-neutral-700 hover:bg-white"
            }`}
          >
            Packs
          </Link>
        </nav>
      </div>
    </header>
  );
}
