"use client";

import { useState } from "react";
import Link from "next/link";
import { API_URL, type CritiqueResult } from "@/src/lib/auth-client";
import { UpgradeModal, useUpgradeModal } from "@/src/components/upgrade-modal";
import { AiUsageBadge } from "@/src/components/ai-usage-badge";

interface PaletteCritiquePanelProps {
  palette: string[];
  onReplace?: (index: number, newHex: string) => void;
}

const SCORE_COLORS: Record<string, string> = {
  A: "bg-emerald-500",
  B: "bg-emerald-400",
  C: "bg-yellow-400",
  D: "bg-orange-400",
  F: "bg-red-500",
};

export function PaletteCritiquePanel({ palette, onReplace }: PaletteCritiquePanelProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CritiqueResult | null>(null);
  const [error, setError] = useState("");
  const upgrade = useUpgradeModal();

  const handleCritique = async () => {
    if (palette.length < 2) {
      setError("Need at least 2 colors for a critique.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(`${API_URL}/ai/critique`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ colors: palette.map((hex) => ({ hex })) }),
      });

      if (res.status === 429) {
        const data = await res.json().catch(() => ({}));
        if (data.limit) {
          upgrade.handleRateLimitError(data);
          return;
        }
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate critique");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {!result && (
        <div className="flex justify-end">
          <AiUsageBadge />
        </div>
      )}
      {!result && (
        <button
          onClick={handleCritique}
          disabled={loading || palette.length < 2}
          className="w-full py-3 rounded-xl text-sm font-semibold transition-all border-2 border-dashed border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 disabled:opacity-40"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
              Analyzing your palette...
            </span>
          ) : (
            "Get AI Design Critique"
          )}
        </button>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      {result && (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm overflow-hidden">
          {/* Score header */}
          <div className="flex items-center gap-4 p-5 border-b border-slate-100 dark:border-white/10">
            <div className={`w-12 h-12 rounded-xl ${SCORE_COLORS[result.score] || "bg-slate-400"} flex items-center justify-center text-white text-xl font-bold`}>
              {result.score}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-800 dark:text-white">
                Design Critique
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Harmony: {result.harmony_type}
              </p>
            </div>
            <button
              onClick={() => setResult(null)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Re-analyze
            </button>
          </div>

          {/* Assessment */}
          <div className="p-5 border-b border-slate-100 dark:border-white/10">
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {result.overall_assessment}
            </p>
          </div>

          {/* Contrast issues */}
          {result.contrast_issues.length > 0 && (
            <div className="p-5 border-b border-slate-100 dark:border-white/10">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-red-500 mb-3">
                Contrast Issues ({result.contrast_issues.length})
              </h4>
              <div className="space-y-2">
                {result.contrast_issues.map((issue, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs">
                    <div className="flex gap-1">
                      {issue.pair.split(" / ").map((hex, j) => (
                        <div
                          key={j}
                          className="w-5 h-5 rounded border border-black/10 dark:border-white/10"
                          style={{ backgroundColor: hex.trim() }}
                        />
                      ))}
                    </div>
                    <span className="text-slate-600 dark:text-slate-400 font-mono">
                      {issue.ratio}:1
                    </span>
                    <span className="px-1.5 py-0.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded text-[10px] font-semibold">
                      {issue.wcag_level}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {result.suggestions.length > 0 && (
            <div className="p-5 border-b border-slate-100 dark:border-white/10">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-3">
                Suggestions
              </h4>
              <div className="space-y-3">
                {result.suggestions.map((s, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex items-center gap-1 shrink-0">
                      <div
                        className="w-6 h-6 rounded border border-black/10 dark:border-white/10"
                        style={{ backgroundColor: s.current_hex }}
                        title={`Current: ${s.current_hex}`}
                      />
                      <span className="text-slate-400 text-xs">→</span>
                      <div
                        className="w-6 h-6 rounded border border-black/10 dark:border-white/10"
                        style={{ backgroundColor: s.replacement_hex }}
                        title={`Suggested: ${s.replacement_hex}`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        {s.replacement_name} <span className="font-mono text-slate-400">{s.replacement_hex}</span>
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{s.reason}</p>
                    </div>
                    {onReplace && (
                      <button
                        onClick={() => onReplace(s.index, s.replacement_hex)}
                        className="shrink-0 text-[10px] px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 font-medium"
                      >
                        Apply
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cultural notes */}
          {result.cultural_notes && (
            <div className="p-5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Cultural Notes
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic">
                {result.cultural_notes}
              </p>
            </div>
          )}
        </div>
      )}

      <UpgradeModal
        open={upgrade.open}
        onClose={upgrade.close}
        tier={upgrade.info.tier}
        used={upgrade.info.used}
        limit={upgrade.info.limit}
      />
    </div>
  );
}
