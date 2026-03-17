import Link from "next/link";

interface SiteHeaderProps {
  currentPath: "/" | "/all-colors" | "/search" | "/word-to-color" | "/colors";
}

export function SiteHeader({ currentPath }: SiteHeaderProps) {
  return (
    <header className="px-4 pt-4 sm:px-6 sm:pt-6">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-3 rounded-[1.5rem] border border-black/6 bg-white/72 px-4 py-3 shadow-[0_18px_48px_rgba(15,23,42,0.05)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-950 text-sm font-semibold text-white">
            CA
          </span>
          <span>
            <span className="block text-base font-semibold tracking-[-0.03em] text-neutral-950">
              ColorArchive
            </span>
            <span className="block text-xs uppercase tracking-[0.18em] text-neutral-400">
              Archive and generator
            </span>
          </span>
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
            href="/word-to-color"
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
              currentPath === "/word-to-color"
                ? "bg-neutral-950 text-white"
                : "border border-black/8 bg-white/85 text-neutral-700 hover:bg-white"
            }`}
          >
            Word → Color
          </Link>
        </nav>
      </div>
    </header>
  );
}
