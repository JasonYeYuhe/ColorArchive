"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ThemeToggle } from "./theme-toggle";

interface SiteHeaderProps {
  currentPath:
    | "/"
    | "/analytics"
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

const DESKTOP_NAV_GROUPS: NavGroup[] = [
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

const MOBILE_PRIMARY_ITEMS: NavItem[] = [
  { href: "/", label: "Archive", matchPaths: ["/", "/colors"] },
  { href: "/search", label: "Search" },
  { href: "/packs", label: "Packs" },
  { href: "/collections", label: "Collections" },
];

const MOBILE_MENU_GROUPS: NavGroup[] = [
  ...DESKTOP_NAV_GROUPS,
  {
    label: "Project",
    items: [
      { href: "/recent", label: "Recent" },
      { href: "/analytics", label: "Analytics" },
      { href: "/updates", label: "Updates" },
      { href: "/about", label: "About" },
      { href: "/support", label: "Support" },
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [currentPath]);

  return (
    <header className="px-4 pt-4 sm:px-6 sm:pt-6">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-3 rounded-[1.5rem] border border-black/6 bg-white/72 px-4 py-3 shadow-[0_18px_48px_rgba(15,23,42,0.05)] backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/72 dark:shadow-[0_18px_48px_rgba(0,0,0,0.2)] sm:px-5">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <Image
              src="/logo-v1.png"
              alt="ColorArchive"
              width={512}
              height={341}
              className="h-auto w-[148px] dark:invert sm:w-[164px]"
              priority
            />
          </Link>

          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setIsMenuOpen((open) => !open)}
              className="flex items-center gap-2 rounded-full border border-black/8 bg-white/85 px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-white dark:border-white/10 dark:bg-white/8 dark:text-neutral-300 dark:hover:bg-white/14 sm:hidden"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-site-menu"
            >
              <span>{isMenuOpen ? "Close" : "Menu"}</span>
              <span className="text-xs text-neutral-400">{isMenuOpen ? "×" : "≡"}</span>
            </button>
          </div>
        </div>

        <nav className="flex gap-2 overflow-x-auto pb-1 sm:hidden" aria-label="Primary mobile navigation">
          {MOBILE_PRIMARY_ITEMS.map((item) => (
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
        </nav>

        {isMenuOpen ? (
          <div
            id="mobile-site-menu"
            className="rounded-[1.35rem] border border-black/6 bg-white/92 p-4 shadow-[0_18px_48px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-neutral-900/92 sm:hidden"
          >
            <div className="space-y-4">
              {MOBILE_MENU_GROUPS.map((group) => (
                <div key={group.label}>
                  <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                    {group.label}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                          isActive(item, currentPath)
                            ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
                            : "border border-black/8 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-white/10 dark:bg-white/8 dark:text-neutral-300 dark:hover:bg-white/14"
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <nav className="-mx-1 hidden w-full items-center gap-1 overflow-x-auto px-1 sm:mx-0 sm:flex sm:w-auto sm:px-0">
          {DESKTOP_NAV_GROUPS.map((group, groupIndex) => (
            <div key={group.label} className="flex shrink-0 items-center gap-1">
              {groupIndex > 0 && (
                <div className="mx-1.5 h-6 w-px bg-black/8 dark:bg-white/10" aria-hidden="true" />
              )}

              <span className="mr-1 hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400 lg:inline">
                {group.label}
              </span>

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
