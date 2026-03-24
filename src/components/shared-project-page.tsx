"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { fetchSharedProject, type SharedProject } from "@/src/lib/auth-client";
import { colors as archiveColors } from "@/src/data/colors";
import { hexToRgb } from "@/src/lib/color-utils";
import type { ColorRecord } from "@/src/types/color";

function colorDistance(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
  const dr = r1 - r2, dg = g1 - g2, db = b1 - b2;
  return Math.sqrt(2 * dr * dr + 4 * dg * dg + 3 * db * db);
}

function findClosest(hex: string): ColorRecord | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  let best: { color: ColorRecord; d: number } | null = null;
  for (const ac of archiveColors) {
    const acRgb = hexToRgb(ac.hex);
    if (!acRgb) continue;
    const d = colorDistance(rgb.r, rgb.g, rgb.b, acRgb.r, acRgb.g, acRgb.b);
    if (!best || d < best.d) best = { color: ac, d };
  }
  return best?.color ?? null;
}

function luminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

const SCORE_COLORS: Record<string, string> = {
  A: "bg-emerald-500", B: "bg-emerald-400", C: "bg-yellow-400", D: "bg-orange-400", F: "bg-red-500",
};

export function SharedProjectPage() {
  const pathname = usePathname();
  const shareId = pathname.split("/").pop() ?? "";
  const [project, setProject] = useState<SharedProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!shareId) return;
    fetchSharedProject(shareId)
      .then(setProject)
      .catch(() => setError("Project not found or link expired."))
      .finally(() => setLoading(false));
  }, [shareId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-950 dark:to-neutral-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
      </main>
    );
  }

  if (error || !project) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-950 dark:to-neutral-900 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <p className="text-slate-600 dark:text-slate-400">{error || "Project not found."}</p>
          <Link href="/projects" className="text-sm text-indigo-600 hover:underline">Go to Projects</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-950 dark:to-neutral-900 pb-24">
      <section className="max-w-3xl mx-auto px-4 pt-10 pb-6">
        <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-1">Shared Project</p>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white leading-tight mb-2">
          {project.name}
        </h1>
        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {project.tags.map((tag) => (
              <span key={tag} className="text-[10px] px-2 py-0.5 bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}
        {project.notes && (
          <p className="text-sm text-slate-500 dark:text-slate-400">{project.notes}</p>
        )}
      </section>

      <div className="max-w-3xl mx-auto px-4 space-y-6">
        {/* Palette strip */}
        {project.palette.length > 0 && (
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm overflow-hidden">
            <div className="flex h-20">
              {project.palette.map((hex, i) => (
                <div key={i} className="flex-1 relative group" style={{ backgroundColor: hex }}>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span
                      className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded"
                      style={{ color: luminance(hex) > 0.5 ? "#1a1a1a" : "#ffffff" }}
                    >
                      {hex.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="divide-y divide-slate-100 dark:divide-white/10">
              {project.palette.map((hex, i) => {
                const match = findClosest(hex);
                return (
                  <div key={i} className="flex items-center gap-3 px-5 py-2.5">
                    <div className="w-7 h-7 rounded-lg border border-black/10 dark:border-white/10 shrink-0" style={{ backgroundColor: hex }} />
                    <span className="text-sm font-mono text-slate-700 dark:text-slate-300">{hex.toUpperCase()}</span>
                    {match && (
                      <Link href={`/colors/${match.id}/`} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline ml-auto">
                        {match.name}
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Critique */}
        {project.critique && (
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm overflow-hidden">
            <div className="flex items-center gap-4 p-5 border-b border-slate-100 dark:border-white/10">
              <div className={`w-12 h-12 rounded-xl ${SCORE_COLORS[project.critique.score] || "bg-slate-400"} flex items-center justify-center text-white text-xl font-bold`}>
                {project.critique.score}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-white">Design Critique</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Harmony: {project.critique.harmony_type}</p>
              </div>
            </div>
            <div className="p-5">
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {project.critique.overall_assessment}
              </p>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="text-center pt-4">
          <Link
            href="/brand-generator/"
            className="inline-block px-6 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-700 transition-colors dark:bg-white dark:text-neutral-950"
          >
            Create your own palette
          </Link>
        </div>
      </div>
    </main>
  );
}
