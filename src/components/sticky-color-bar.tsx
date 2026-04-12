"use client";

import { useState, useEffect, useRef } from "react";

interface StickyColorBarProps {
  name: string;
  hex: string;
  rgb: string;
  hsl: string;
}

function CopyChip({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          timer.current = setTimeout(() => setCopied(false), 1200);
        } catch { /* noop */ }
      }}
      className="rounded-lg px-2.5 py-1 text-xs font-mono font-medium transition hover:bg-white/20 active:scale-95"
      title={`Copy ${value}`}
    >
      {copied ? "\u2713" : label}
    </button>
  );
}

/**
 * Sticky bar that appears when the color hero section scrolls out of view.
 * Shows color swatch + name + quick-copy chips for HEX/RGB/HSL.
 */
export function StickyColorBar({ name, hex, rgb, hsl }: StickyColorBarProps) {
  const [visible, setVisible] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // Determine text color based on luminance
  const isLight = (() => {
    const m = hex.match(/^#([0-9a-f]{6})$/i);
    if (!m) return false;
    const r = parseInt(m[1].slice(0, 2), 16);
    const g = parseInt(m[1].slice(2, 4), 16);
    const b = parseInt(m[1].slice(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 160;
  })();

  const textClass = isLight ? "text-neutral-900" : "text-white";

  return (
    <>
      {/* Invisible sentinel placed at the top of the hero */}
      <div ref={sentinelRef} className="absolute top-0 left-0 h-px w-px" aria-hidden />

      {/* Sticky bar */}
      <div
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          visible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
        }`}
        aria-hidden={!visible}
      >
        <div
          className="flex items-center justify-between gap-3 px-4 py-2.5 backdrop-blur-xl sm:px-6"
          style={{ backgroundColor: `${hex}e6` }}
        >
          {/* Left: swatch + name */}
          <div className={`flex items-center gap-3 ${textClass}`}>
            <div
              className="h-7 w-7 shrink-0 rounded-lg ring-1 ring-inset ring-white/20"
              style={{ backgroundColor: hex }}
            />
            <span className="text-sm font-semibold tracking-tight">{name}</span>
          </div>

          {/* Right: copy chips */}
          <div className={`flex items-center gap-1 ${textClass}`}>
            <CopyChip label={hex} value={hex} />
            <span className="hidden sm:contents">
              <CopyChip label="RGB" value={rgb} />
              <CopyChip label="HSL" value={hsl} />
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
