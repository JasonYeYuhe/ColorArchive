"use client";

import Image from "next/image";
import Link from "next/link";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/src/components/auth-provider";
import { useLocale } from "@/src/components/locale-provider";
import { AiUsageBadge } from "@/src/components/ai-usage-badge";
import { ThemeToggle } from "./theme-toggle";
import type { Locale } from "@/src/lib/i18n";

const LOCALE_OPTIONS: { code: Locale; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "zh", label: "中文" },
];

interface SiteHeaderProps {
  currentPath:
    | "/"
    | "/analytics"
    | "/all-colors"
    | "/about"
    | "/collections"
    | "/favorites"
    | "/families"
    | "/guides"
    | "/free-resources"
    | "/notes"
    | "/recent"
    | "/spectrum"
    | "/support"
    | "/updates"
    | "/word-to-color"
    | "/contrast"
    | "/colors"
    | "/palette"
    | "/login"
    | "/convert"
    | "/gradient"
    | "/compare"
    | "/harmonies"
    | "/colorblind"
    | "/tools"
    | "/tints"
    | "/brand"
    | "/wcag-audit"
    | "/palette-audit"
    | "/api-docs"
    | "/mixer"
    | "/tokens"
    | "/image-palette"
    | "/combinations"
    | "/identify"
    | "/color-quiz"
    | "/brand-generator"
    | "/today"
    | "/mood-palette"
    | "/preview"
    | "/mesh-gradient"
    | "/stories"
    | "/pro"
    | "/projects"
    | "/analyze"
    | "/product-examples"
    | "/use-cases"
    | "/name"
    | "/css-colors"
    | "/famous-palettes"
    | "/decades"
    | "/seasonal"
    | "/industry"
    | "/trends"
    | "/validate"
    | "/pick-for-me"
    | "/embed/embed-code";
}

interface NavItem {
  href: string;
  labelKey: string;
  matchPaths?: string[];
}

interface NavGroup {
  labelKey: string;
  items: NavItem[];
}

const DESKTOP_NAV_GROUPS: NavGroup[] = [
  {
    labelKey: "nav.explore",
    items: [
      { href: "/", labelKey: "nav.archive", matchPaths: ["/", "/colors"] },
      { href: "/all-colors/", labelKey: "nav.allColors" },
      { href: "/families/", labelKey: "nav.families" },
      { href: "/collections/", labelKey: "nav.collections" },
      { href: "/notes/", labelKey: "nav.notes" },
      { href: "/guides/", labelKey: "nav.guides" },
      { href: "/stories/", labelKey: "nav.stories" },
      { href: "/use-cases/", labelKey: "nav.useCases" },
      { href: "/industry/", labelKey: "nav.industry" },
      { href: "/seasonal/", labelKey: "nav.seasonal" },
      { href: "/decades/", labelKey: "nav.decades" },
      { href: "/trends/", labelKey: "nav.trends" },
    ],
  },
  {
    labelKey: "nav.tools",
    items: [
      { href: "/tools/", labelKey: "nav.tools.all" },
      { href: "/pick-for-me/", labelKey: "nav.pickForMe" },
      { href: "/spectrum/", labelKey: "nav.spectrum" },
      { href: "/word-to-color/", labelKey: "nav.wordToColor" },
      { href: "/contrast/", labelKey: "nav.contrast" },
      { href: "/palette/", labelKey: "nav.palette" },
      { href: "/convert/", labelKey: "nav.convert" },
      { href: "/gradient/", labelKey: "nav.gradient" },
      { href: "/harmonies/", labelKey: "nav.harmonies" },
      { href: "/compare/", labelKey: "nav.compare" },
      { href: "/colorblind/", labelKey: "nav.colorblind" },
      { href: "/brand/", labelKey: "nav.brand" },
      { href: "/wcag-audit/", labelKey: "nav.wcagAudit" },
      { href: "/palette-audit/", labelKey: "nav.paletteAudit" },
      { href: "/image-palette/", labelKey: "nav.imagePalette" },
      { href: "/identify/", labelKey: "nav.colorFinder" },
      { href: "/today/", labelKey: "nav.today" },
      { href: "/mood-palette/", labelKey: "nav.moodPalette" },
      { href: "/preview/", labelKey: "nav.preview" },
      { href: "/mesh-gradient/", labelKey: "nav.meshGradient" },
      { href: "/color-quiz/", labelKey: "nav.colorQuiz" },
      { href: "/brand-generator/", labelKey: "nav.brandGenerator" },
      { href: "/analyze/", labelKey: "nav.analyze" },
      { href: "/combinations/", labelKey: "nav.combinations" },
      { href: "/api-docs/", labelKey: "nav.apiDocs" },
      { href: "https://www.figma.com/community/plugin/1616829363158218051", labelKey: "nav.figmaPlugin" },
      { href: "/favorites/", labelKey: "nav.favorites" },
    ],
  },
];

const MOBILE_PRIMARY_ITEMS: NavItem[] = [
  { href: "/", labelKey: "nav.archive", matchPaths: ["/", "/colors"] },
  { href: "/all-colors/", labelKey: "nav.allColors" },
  { href: "/collections/", labelKey: "nav.collections" },
];

const MOBILE_MENU_GROUPS: NavGroup[] = [
  ...DESKTOP_NAV_GROUPS,
  {
    labelKey: "nav.project",
    items: [
      { href: "/recent/", labelKey: "nav.recent" },
      { href: "/analytics/", labelKey: "nav.analytics" },
      { href: "/updates/", labelKey: "nav.updates" },
      { href: "/notes/", labelKey: "nav.notes" },
      { href: "/guides/", labelKey: "nav.guides" },
      { href: "/about/", labelKey: "nav.about" },
      { href: "/support/", labelKey: "nav.support" },
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
  const { analyticsAccess, logout, status, tier, user } = useAuth();
  const { locale, setLocale, t } = useLocale();
  const loginHref = currentPath === "/login" ? "/login" : `/login?next=${encodeURIComponent(currentPath)}`;
  const mobileMenuGroups = MOBILE_MENU_GROUPS.map((group) =>
    group.labelKey === "nav.project"
      ? {
          ...group,
          items: group.items.filter((item) => item.href !== "/analytics" || analyticsAccess),
        }
      : group,
  );

  useEffect(() => {
    setIsMenuOpen(false);
  }, [currentPath]);

  return (
    <>
    <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-neutral-900 focus:shadow-lg focus:ring-2 focus:ring-neutral-900 dark:focus:bg-neutral-800 dark:focus:text-white">
      Skip to content
    </a>
    <header className="px-4 pt-4 sm:px-6 sm:pt-6">
      <div className="mx-auto flex w-full max-w-[1600px] items-center gap-3 rounded-[1.5rem] border border-black/6 bg-white/72 px-4 py-3 shadow-[0_18px_48px_rgba(15,23,42,0.05)] backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/72 dark:shadow-[0_18px_48px_rgba(0,0,0,0.2)] sm:px-5">
          <Link href="/" className="flex shrink-0 items-center">
            <Image
              src="/logo-v1.png"
              alt="ColorArchive"
              width={512}
              height={341}
              className="h-auto w-[120px] dark:invert sm:w-[136px]"
              priority
            />
          </Link>

          {/* Desktop dropdown nav */}
          <nav className="hidden items-center gap-1 sm:flex" aria-label="Main navigation">
            {DESKTOP_NAV_GROUPS.map((group) => (
              <NavDropdown key={group.labelKey} group={group} currentPath={currentPath} t={t} />
            ))}
          </nav>

          <div className="flex-1" />

          <div className="flex shrink-0 items-center gap-2">
            {tier !== "pro" && (
              <>
                <AiUsageBadge />
                <Link
                  href="/pro/"
                  className="hidden rounded-full bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 sm:inline-flex"
                >
                  Pro
                </Link>
              </>
            )}
            <Link
              href={status === "authenticated" ? "/account" : loginHref}
              className={`hidden rounded-full border px-3 py-2 text-sm font-medium transition sm:inline-flex ${
                currentPath === "/login"
                  ? "border-neutral-950 bg-neutral-950 text-white dark:border-white dark:bg-white dark:text-neutral-950"
                  : "border-black/8 bg-white/85 text-neutral-700 hover:bg-white dark:border-white/10 dark:bg-white/8 dark:text-neutral-300 dark:hover:bg-white/14"
              }`}
            >
              {status === "authenticated" ? t("header.account") : t("header.login")}
            </Link>
            <LanguageSwitcher locale={locale} setLocale={setLocale} />
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setIsMenuOpen((open) => !open)}
              className="flex items-center gap-2 rounded-full border border-black/8 bg-white/85 px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-white dark:border-white/10 dark:bg-white/8 dark:text-neutral-300 dark:hover:bg-white/14 sm:hidden"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-site-menu"
            >
              <span>{isMenuOpen ? t("header.close") : t("header.menu")}</span>
              <span className="text-xs text-neutral-400">{isMenuOpen ? "×" : "≡"}</span>
            </button>
          </div>
      </div>

      {/* Mobile nav row */}
      <div className="mx-auto mt-2 w-full max-w-[1600px] px-0 sm:hidden">
        <nav className="flex gap-2 overflow-x-auto pb-1" aria-label="Primary mobile navigation">
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
              {t(item.labelKey)}
            </Link>
          ))}
        </nav>
      </div>

      {/* Mobile full menu */}
      {isMenuOpen ? (
        <nav
          id="mobile-site-menu"
          className="mx-auto mt-2 w-full max-w-[1600px] rounded-[1.35rem] border border-black/6 bg-white/92 p-4 shadow-[0_18px_48px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-neutral-900/92 sm:hidden"
          aria-label="Mobile menu"
        >
          <div className="space-y-4">
            <div>
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                {t("nav.account")}
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={loginHref}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                    currentPath === "/login"
                      ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
                      : "border border-black/8 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-white/10 dark:bg-white/8 dark:text-neutral-300 dark:hover:bg-white/14"
                  }`}
                >
                  {status === "authenticated" ? user?.email ?? t("header.account") : t("header.login")}
                </Link>
                {status === "authenticated" ? (
                  <button
                    type="button"
                    onClick={() => void logout()}
                    className="rounded-full border border-black/8 bg-white px-3.5 py-1.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 dark:border-white/10 dark:bg-white/8 dark:text-neutral-300 dark:hover:bg-white/14"
                  >
                    {t("header.logout")}
                  </button>
                ) : null}
              </div>
            </div>

            {mobileMenuGroups.map((group) => (
              <div key={group.labelKey}>
                <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                  {t(group.labelKey)}
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
                      {t(item.labelKey)}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
    </>
  );
}

function NavDropdown({ group, currentPath, t }: { group: NavGroup; currentPath: string; t: (key: string) => string }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const hasActiveItem = group.items.some((item) => isActive(item, currentPath));

  useEffect(() => { setMounted(true); }, []);

  const updatePos = useCallback(() => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 6, left: rect.left });
    }
  }, []);

  const handleEnter = useCallback(() => {
    clearTimeout(timerRef.current);
    updatePos();
    setOpen(true);
  }, [updatePos]);

  const handleLeave = useCallback(() => {
    timerRef.current = setTimeout(() => setOpen(false), 150);
  }, []);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  useEffect(() => {
    if (open) updatePos();
  }, [open, updatePos]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        btnRef.current && !btnRef.current.contains(e.target as Node) &&
        menuRef.current && !menuRef.current.contains(e.target as Node)
      ) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Keyboard navigation: Escape to close, arrow keys to navigate items
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      }
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const links = menuRef.current?.querySelectorAll("a");
        if (!links?.length) return;
        const current = document.activeElement as HTMLElement;
        const idx = Array.from(links).indexOf(current as HTMLAnchorElement);
        const next = e.key === "ArrowDown"
          ? links[(idx + 1) % links.length]
          : links[(idx - 1 + links.length) % links.length];
        next?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  // Wrapper div handles hover for both button and portal menu
  const wrapperRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={wrapperRef} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <button
        ref={btnRef}
        type="button"
        onClick={() => { updatePos(); setOpen((o) => !o); }}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium transition ${
          hasActiveItem
            ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
            : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-white/10"
        }`}
      >
        {t(group.labelKey)}
        <svg className={`h-3 w-3 transition ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 12 12">
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && mounted && createPortal(
        <div
          ref={menuRef}
          className="fixed z-[9999] min-w-[10rem] rounded-xl border border-black/8 bg-white/95 py-1.5 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/95"
          style={{ top: pos.top, left: pos.left }}
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
          role="menu"
          tabIndex={-1}
          aria-label={t(group.labelKey)}
        >
          {group.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              role="menuitem"
              className={`block px-3.5 py-1.5 text-sm font-medium transition ${
                isActive(item, currentPath)
                  ? "bg-neutral-100 text-neutral-950 dark:bg-white/10 dark:text-white"
                  : "text-neutral-600 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-white/8"
              }`}
            >
              {t(item.labelKey)}
            </Link>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}

function LanguageSwitcher({ locale, setLocale }: { locale: Locale; setLocale: (l: Locale) => void }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        btnRef.current && !btnRef.current.contains(e.target as Node) &&
        menuRef.current && !menuRef.current.contains(e.target as Node)
      ) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 6, left: rect.right - 112 });
    }
  }, [open]);

  const current = LOCALE_OPTIONS.find((o) => o.code === locale) ?? LOCALE_OPTIONS[0];

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen(!open)}
        className="rounded-full border border-black/8 bg-white/85 px-2.5 py-2 text-xs font-semibold tracking-wide text-neutral-500 transition hover:bg-white dark:border-white/10 dark:bg-white/8 dark:text-neutral-400 dark:hover:bg-white/14"
        aria-label="Switch language"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {current.label}
      </button>
      {open && mounted && createPortal(
        <div
          ref={menuRef}
          className="fixed z-[9999] min-w-[7rem] rounded-xl border border-black/8 bg-white py-1 shadow-lg dark:border-white/10 dark:bg-neutral-900"
          style={{ top: pos.top, left: pos.left }}
          role="menu"
          aria-label="Language options"
        >
          {LOCALE_OPTIONS.map((opt) => (
            <button
              key={opt.code}
              type="button"
              role="menuitem"
              onClick={() => { setLocale(opt.code); setOpen(false); }}
              className={`block w-full px-3 py-1.5 text-left text-xs font-medium transition hover:bg-neutral-50 dark:hover:bg-white/8 ${
                opt.code === locale ? "text-neutral-950 dark:text-white" : "text-neutral-500 dark:text-neutral-400"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}
