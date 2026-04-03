"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/src/components/auth-provider";
import {
  fetchProjects,
  createProject,
  deleteProject,
  shareProject,
  type Project,
} from "@/src/lib/auth-client";
import { useLocale } from "@/src/components/locale-provider";

function ProjectCard({
  project,
  onDelete,
  onShare,
}: {
  project: Project;
  onDelete: (id: number) => void;
  onShare: (id: number) => void;
}) {
  const { t } = useLocale();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const palette = project.palette.slice(0, 8);

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm overflow-hidden">
      {/* Color swatches */}
      <div className="flex h-16">
        {palette.length > 0 ? (
          palette.map((hex, i) => (
            <div
              key={i}
              className="flex-1"
              style={{ backgroundColor: hex }}
            />
          ))
        ) : (
          <div className="flex-1 bg-slate-100 dark:bg-white/8 flex items-center justify-center">
            <span className="text-xs text-slate-400">{t("projects.noColors")}</span>
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-white truncate">
            {project.name}
          </h3>
          {project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {project.tags.map((tag) => (
                <span key={tag} className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-white/8 text-slate-500 dark:text-slate-400 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}
          {project.notes && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{project.notes}</p>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400">
              {palette.length} {t("projects.colors")}
            </span>
            {project.hasCritique && (
              <span className="text-[10px] px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full">
                {t("projects.reviewed")}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onShare(project.id)}
              className="text-[10px] px-2 py-1 text-slate-500 hover:text-indigo-600 transition-colors"
              title={t("projects.share")}
            >
              {t("projects.share")}
            </button>
            {confirmDelete ? (
              <button
                onClick={() => { onDelete(project.id); setConfirmDelete(false); }}
                className="text-[10px] px-2 py-1 text-red-600 font-semibold"
              >
                {t("projects.confirm")}
              </button>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="text-[10px] px-2 py-1 text-slate-400 hover:text-red-500 transition-colors"
              >
                {t("projects.delete")}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProjectsPage() {
  const { t } = useLocale();
  const { status, tier } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  const loadProjects = useCallback(async () => {
    try {
      const { projects: data } = await fetchProjects();
      setProjects(data);
    } catch {
      setError(t("projects.loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (status === "authenticated") {
      loadProjects();
    } else if (status === "anonymous") {
      setLoading(false);
    }
  }, [status, loadProjects]);

  const handleDelete = async (id: number) => {
    try {
      await deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch {
      setError(t("projects.deleteError"));
    }
  };

  const handleShare = async (id: number) => {
    try {
      const { shareId } = await shareProject(id);
      const url = `${window.location.origin}/projects/shared/${shareId}`;
      await navigator.clipboard.writeText(url);
      setShareUrl(url);
      setTimeout(() => setShareUrl(null), 3000);
    } catch {
      setError(t("projects.shareError"));
    }
  };

  if (status === "anonymous") {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-950 dark:to-neutral-900 flex items-center justify-center p-4">
        <div className="text-center max-w-sm space-y-4">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t("projects.signInTitle")}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t("projects.signInDesc")}
          </p>
          <Link
            href="/login?next=/projects"
            className="inline-block px-6 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-700 transition-colors"
          >
            {t("projects.signIn")}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-950 dark:to-neutral-900 pb-24">
      <section className="max-w-4xl mx-auto px-4 pt-10 pb-6">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-1">{t("projects.workspace")}</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white leading-tight">
              {t("projects.title")}
            </h1>
          </div>
          {tier !== "pro" && (
            <Link
              href="/pro"
              className="text-xs text-indigo-600 hover:text-indigo-500 font-medium"
            >
              {projects.length}/5 {t("projects.freeUpgrade")} &middot; {t("projects.upgrade")}
            </Link>
          )}
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          {t("projects.desc")}
        </p>
      </section>

      <div className="max-w-4xl mx-auto px-4 space-y-6">
        {shareUrl && (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
            {t("projects.linkCopied")}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 rounded-2xl bg-white dark:bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-10 text-center">
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
              {t("projects.noProjects")}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Link href="/brand-generator/" className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-700 transition-colors">
                {t("projects.brandGenerator")}
              </Link>
              <Link href="/mood-palette/" className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-500 transition-colors">
                {t("projects.moodPalette")}
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onDelete={handleDelete}
                onShare={handleShare}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
