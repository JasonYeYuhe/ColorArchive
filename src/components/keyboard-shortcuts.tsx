"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Shortcut {
  keys: string[];
  label: string;
  category: string;
}

const SHORTCUTS: Shortcut[] = [
  { keys: ["?"], label: "Show keyboard shortcuts", category: "General" },
  { keys: ["/"], label: "Focus search", category: "General" },
  { keys: ["G", "H"], label: "Go to Home", category: "Navigation" },
  { keys: ["G", "P"], label: "Go to Palette Generator", category: "Navigation" },
  { keys: ["G", "F"], label: "Go to Favorites", category: "Navigation" },
  { keys: ["G", "T"], label: "Go to Tools", category: "Navigation" },
  { keys: ["G", "C"], label: "Go to Collections", category: "Navigation" },
  { keys: ["G", "S"], label: "Go to Search", category: "Navigation" },
  { keys: ["G", "A"], label: "Go to All Colors", category: "Navigation" },
  { keys: ["Space"], label: "Generate palette (on palette page)", category: "Tools" },
];

const NAV_MAP: Record<string, string> = {
  h: "/",
  p: "/palette-generator/",
  f: "/favorites/",
  t: "/tools/",
  c: "/collections/",
  s: "/search/",
  a: "/all-colors/",
};

function isInputFocused(): boolean {
  const tag = document.activeElement?.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (document.activeElement as HTMLElement)?.isContentEditable === true;
}

/**
 * Global keyboard shortcut handler. Renders a help modal when `?` is pressed.
 * Mounts once at the root layout level.
 */
export function KeyboardShortcuts() {
  const router = useRouter();
  const [showHelp, setShowHelp] = useState(false);
  const [pendingG, setPendingG] = useState(false);
  const timerRef = { current: undefined as ReturnType<typeof setTimeout> | undefined };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (isInputFocused()) return;

      const key = e.key.toLowerCase();

      // Two-key "g + ..." sequences
      if (pendingG) {
        setPendingG(false);
        clearTimeout(timerRef.current);
        const path = NAV_MAP[key];
        if (path) {
          e.preventDefault();
          router.push(path);
          return;
        }
      }

      if (key === "g" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        setPendingG(true);
        timerRef.current = setTimeout(() => setPendingG(false), 800);
        return;
      }

      if (key === "?" || (e.shiftKey && key === "/")) {
        e.preventDefault();
        setShowHelp((prev) => !prev);
        return;
      }

      if (key === "/" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>('input[type="search"], input[name="search"], input[placeholder*="earch"], #search-input');
        if (searchInput) {
          searchInput.focus();
        } else {
          router.push("/search/");
        }
        return;
      }

      if (key === "escape" && showHelp) {
        setShowHelp(false);
      }
    },
    [pendingG, showHelp, router],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!showHelp) {
    return pendingG ? (
      <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-neutral-900 px-3 py-2 text-xs font-medium text-white shadow-lg dark:bg-white dark:text-neutral-900">
        g + ...
      </div>
    ) : null;
  }

  // Group shortcuts by category
  const categories = SHORTCUTS.reduce(
    (acc, s) => {
      (acc[s.category] ??= []).push(s);
      return acc;
    },
    {} as Record<string, Shortcut[]>,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => setShowHelp(false)}
        role="presentation"
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-neutral-900"
        role="dialog"
        aria-modal="true"
        aria-label="Keyboard shortcuts"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            Keyboard Shortcuts
          </h2>
          <button
            type="button"
            onClick={() => setShowHelp(false)}
            className="rounded-lg p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-white/10 dark:hover:text-neutral-300"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-5">
          {Object.entries(categories).map(([category, shortcuts]) => (
            <div key={category}>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                {category}
              </h3>
              <div className="space-y-1.5">
                {shortcuts.map((s) => (
                  <div
                    key={s.label}
                    className="flex items-center justify-between rounded-lg px-2 py-1.5"
                  >
                    <span className="text-sm text-neutral-600 dark:text-neutral-300">
                      {s.label}
                    </span>
                    <div className="flex gap-1">
                      {s.keys.map((k, i) => (
                        <span key={i}>
                          {i > 0 && (
                            <span className="mx-0.5 text-[10px] text-neutral-400">then</span>
                          )}
                          <kbd className="inline-flex min-w-[24px] items-center justify-center rounded-md border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 text-xs font-semibold text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                            {k}
                          </kbd>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-5 text-center text-[10px] text-neutral-400 dark:text-neutral-500">
          Press <kbd className="rounded border border-neutral-200 bg-neutral-50 px-1 text-[10px] font-semibold dark:border-neutral-700 dark:bg-neutral-800">?</kbd> to toggle this dialog
        </p>
      </div>
    </div>
  );
}
