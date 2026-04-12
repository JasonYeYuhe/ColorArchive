"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface ToolTarget {
  label: string;
  href: string;
  icon: string;
}

function buildTargets(hexColors: string[]): ToolTarget[] {
  const clean = hexColors.map((h) => h.replace("#", "").toUpperCase());
  const first = clean[0] ?? "";
  const second = clean[1] ?? clean[0] ?? "";
  const all = clean.join(",");

  return [
    {
      label: "Contrast Checker",
      href: `/contrast/?fg=${first}&bg=${second}`,
      icon: "\u2194",
    },
    {
      label: "Tints & Shades",
      href: `/tints/?hex=${first}`,
      icon: "\u2593",
    },
    {
      label: "Gradient Generator",
      href: `/gradient/?from=${first}&to=${second}`,
      icon: "\u25D0",
    },
    {
      label: "Compare Side by Side",
      href: `/compare/?a=${first}&b=${second}`,
      icon: "\u2B0C",
    },
    {
      label: "Palette Validator",
      href: `/validate/?colors=${all}`,
      icon: "\u2713",
    },
    {
      label: "Color Mixer",
      href: `/mixer/?a=${first}&b=${second}`,
      icon: "\u2A2F",
    },
  ];
}

interface SendToToolProps {
  hexColors: string[];
  label?: string;
}

/**
 * Dropdown button that lets users send colors to other tools.
 * Accepts 1+ hex colors and builds deep links with URL params.
 */
export function SendToTool({ hexColors, label = "Send to..." }: SendToToolProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (hexColors.length === 0) return null;

  const targets = buildTargets(hexColors);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-neutral-600 transition hover:bg-neutral-950 hover:text-white dark:border-white/10 dark:bg-white/10 dark:text-neutral-300 dark:hover:bg-white dark:hover:text-neutral-900"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
        </svg>
        {label}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-40 mt-1.5 w-56 rounded-xl border border-black/8 bg-white p-1.5 shadow-xl dark:border-white/10 dark:bg-neutral-900">
          {targets.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-neutral-700 transition hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-white/8"
            >
              <span className="w-5 text-center text-base">{t.icon}</span>
              {t.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
