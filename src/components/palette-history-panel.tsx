"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getHistory, removeFromHistory, clearHistory, type PaletteHistoryEntry } from "@/src/lib/palette-history";
import { useAuth } from "@/src/components/auth-provider";

interface PaletteHistoryPanelProps {
  onRestore?: (entry: PaletteHistoryEntry) => void;
}

export function PaletteHistoryPanel({ onRestore }: PaletteHistoryPanelProps) {
  const { tier } = useAuth();
  const [history, setHistory] = useState<PaletteHistoryEntry[]>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  if (history.length === 0) return null;

  const FREE_LIMIT = 3;
  const isPro = tier === "pro";
  const visible = expanded ? (isPro ? history : history.slice(0, FREE_LIMIT)) : history.slice(0, 3);
  const hasMore = !expanded && history.length > 3;
  const isLocked = !isPro && history.length > FREE_LIMIT;

  function handleRemove(id: string) {
    removeFromHistory(id);
    setHistory(getHistory());
  }

  function handleClear() {
    clearHistory();
    setHistory([]);
  }

  function timeAgo(ts: number): string {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
          Generation History
        </h3>
        {history.length > 0 && (
          <button
            onClick={handleClear}
            className="text-[10px] text-neutral-400 hover:text-red-500 transition"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-2">
        {visible.map((entry) => (
          <div
            key={entry.id}
            role="button"
            tabIndex={0}
            aria-label="Restore palette from history"
            className="group flex items-center gap-2 rounded-xl border border-black/4 bg-neutral-50 dark:bg-white/5 px-3 py-2 hover:bg-neutral-100 dark:hover:bg-white/8 transition cursor-pointer"
            onClick={() => onRestore?.(entry)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onRestore?.(entry); } }}
          >
            {/* Color swatches */}
            <div className="flex -space-x-1">
              {entry.palette.slice(0, 4).map((c, i) => (
                <div
                  key={i}
                  className="w-5 h-5 rounded-full border-2 border-white dark:border-neutral-900"
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300 truncate">
                {entry.inputs.industry || entry.inputs.style || entry.inputs.keywords || "Custom palette"}
              </p>
              <p className="text-[10px] text-neutral-400">{timeAgo(entry.timestamp)}</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); handleRemove(entry.id); }}
              className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-500 transition p-1"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {hasMore && (
        <button
          onClick={() => setExpanded(true)}
          className="mt-2 w-full text-center text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Show {history.length - 3} more
        </button>
      )}

      {isLocked && expanded && (
        <div className="mt-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 px-3 py-2 text-center">
          <p className="text-[11px] text-indigo-700 dark:text-indigo-400">
            Free users see last {FREE_LIMIT} generations.{" "}
            <Link href="/pro/" className="font-semibold underline">Upgrade to Pro</Link> for full history.
          </p>
        </div>
      )}
    </div>
  );
}
