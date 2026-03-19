import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

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
    | "/contrast"
    | "/colors"
    | "/palette"
    | "/free-pack";
}

interface NavItem {
  href: string;
  label: string;
  matchPaths?: string[];
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Explore",
    items: [
      { href: "/", label: "Archive", matchPaths: ["/", "/colors"] },
      { href: "/all-colors", label: "All Colors" },
      { href: "/search", label: "Search" },
      { href: "/collections", label: "Collections" },
    ],
  },
  {
    label: "Tools",
    items: [
      { href: "/spectrum", label: "Spectrum" },
      { href: "/word-to-color", label: "Word \u2192 Color" },
      { href: "/contrast", label: "Contrast" },
      { href: "/surprise", label: "Surprise" },
      { href: "/favorites", label: "Favorites" },
    ],
  },
  {
    label: "Shop",
    items: [
      { href: "/packs", label: "Packs" },
      { href: "/free-pack", label: "Free Pack" },
    ],
  },
];

function isActive(item: NavItem, currentPath: string): boolean {
  if (item.matchPaths) {
    return item.matchPaths.includes(currentPath);
  }
  return currentPath === item.href;
}

export function SiteHeader({ currentPath }: SiteHeaderProps) {
  return (
    <header className="px-4 pt-4 sm:px-6 sm:pt-6">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-3 rounded-[1.5rem] border border-black/6 bg-white/72 px-4 py-3 shadow-[0_18px_48px_rgba(15,23,42,0.05)] backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/72 dark:shadow-[0_18px_48px_rgba(0,0,0,0.2)] sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo-v1.png"
              alt="ColorArchive"
              width={512}
              height={341}
              className="h-auto w-[148px] dark:invert sm:w-[164px]"
              priority
            />
          </Link>
          <ThemeToggle />
        </div>

        <nav className="-mx-1 flex w-full items-center gap-1 overflow-x-auto px-1 sm:mx-0 sm:w-auto sm:px-0">
          {NAV_GROUPS.map((group, groupIndex) => (
            <div key={group.label} className="flex shrink-0 items-center gap-1">
              {/* Separator between groups */}
              {groupIndex > 0 && (
                <div className="mx-1.5 h-6 w-px bg-black/8 dark:bg-white/10" aria-hidden="true" />
              )}

              {/* Group label */}
              <span className="mr-1 hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400 lg:inline">
                {group.label}
              </span>

              {/* Group items */}
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                    isActive(item, currentPath)
                      ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
                      : "border border-black/8 bg-white/85 text-neutral-700 hover:bg-white dark:border-white/10 dark:bg-white/8 dark:text-neutral-300 dark:hover:bg-white/14"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </div>
    </header>
  );
}
