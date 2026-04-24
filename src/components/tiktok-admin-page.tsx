"use client";
import { SITE_URL } from "@/src/lib/site-config";

import { useState, useCallback } from "react";

/* ------------------------------------------------------------------ */
/*  Simulated TikTok integration demo for API review                  */
/*  Shows: Login Kit → Content Posting API (draft upload) flow        */
/* ------------------------------------------------------------------ */

const TIKTOK_ICON = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1 0-5.78 2.92 2.92 0 0 1 .88.13v-3.5a6.37 6.37 0 0 0-.88-.07 6.26 6.26 0 0 0 0 12.51 6.26 6.26 0 0 0 6.26-6.26V9.42a8.24 8.24 0 0 0 3.84.96V6.94a4.8 4.8 0 0 1-.01-.25Z" />
  </svg>
);

type Step = "disconnected" | "connecting" | "connected" | "uploading" | "uploaded";

export function TikTokAdminPage() {
  const [step, setStep] = useState<Step>("disconnected");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [caption, setCaption] = useState(
    "Stunning color palettes for your next design project 🎨 #colorpalette #designinspiration #colorarchive"
  );
  const [visibility, setVisibility] = useState<"private" | "public">("private");
  const [uploadProgress, setUploadProgress] = useState(0);

  /* Simulate TikTok OAuth login */
  const handleLogin = useCallback(() => {
    setStep("connecting");
    setTimeout(() => setStep("connected"), 2000);
  }, []);

  /* Simulate disconnect */
  const handleDisconnect = useCallback(() => {
    setStep("disconnected");
    setVideoFile(null);
    setUploadProgress(0);
  }, []);

  /* Simulate upload */
  const handleUpload = useCallback(() => {
    if (!videoFile) return;
    setStep("uploading");
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setStep("uploaded");
          return 100;
        }
        return p + 5;
      });
    }, 120);
  }, [videoFile]);

  /* Reset to upload another */
  const handleReset = useCallback(() => {
    setStep("connected");
    setVideoFile(null);
    setUploadProgress(0);
  }, []);

  return (
    <main id="main-content" className="px-4 pb-20 pt-6 sm:px-6 sm:pt-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <section className="rounded-[2rem] border border-black/6 bg-white/72 px-6 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-10 sm:py-14">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/85 px-3 py-1 text-xs font-medium tracking-[0.22em] text-neutral-500 uppercase">
            <span className="inline-block h-2 w-2 rounded-full bg-neutral-900" />
            Internal Tool
          </div>

          <h1 className="text-3xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-4xl">
            TikTok Content Publishing
          </h1>
          <p className="mt-3 text-base leading-7 text-neutral-500">
            Manage ColorArchive&apos;s TikTok publishing workflow. Connect your
            account, upload videos, and publish content as drafts for internal
            review.
          </p>

          {/* ---- Step 1: Account Connection (Login Kit) ---- */}
          <div className="mt-10">
            <h2 className="text-lg font-semibold text-neutral-950">
              1. Account Connection
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              Sign in with TikTok using Login Kit to authorize this app.
            </p>

            <div className="mt-4 rounded-2xl border border-black/6 bg-neutral-50/80 p-6">
              {step === "disconnected" && (
                <div className="flex flex-col items-center gap-4 py-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-900 text-white">
                    {TIKTOK_ICON}
                  </div>
                  <p className="text-sm text-neutral-600">
                    No TikTok account connected.
                  </p>
                  <button
                    onClick={handleLogin}
                    className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800"
                  >
                    {TIKTOK_ICON}
                    Sign in with TikTok
                  </button>
                </div>
              )}

              {step === "connecting" && (
                <div className="flex flex-col items-center gap-4 py-4">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-neutral-200 border-t-neutral-900" />
                  <p className="text-sm text-neutral-600">
                    Redirecting to TikTok for authorization...
                  </p>
                  <div className="mt-2 w-full max-w-md rounded-xl border border-black/6 bg-white p-4 text-xs text-neutral-500">
                    <p className="font-medium text-neutral-700">OAuth Flow:</p>
                    <p className="mt-1">
                      → Requesting scopes: <code className="rounded bg-neutral-100 px-1.5 py-0.5">user.info.basic</code>,{" "}
                      <code className="rounded bg-neutral-100 px-1.5 py-0.5">video.publish</code>,{" "}
                      <code className="rounded bg-neutral-100 px-1.5 py-0.5">video.upload</code>
                    </p>
                    <p className="mt-1">
                      → Redirect URI: <code className="rounded bg-neutral-100 px-1.5 py-0.5">{`${SITE_URL}/api/auth/tiktok/callback`}</code>
                    </p>
                  </div>
                </div>
              )}

              {(step === "connected" || step === "uploading" || step === "uploaded") && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-900 text-white">
                      {TIKTOK_ICON}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-950">
                        @colorarchive
                      </p>
                      <p className="text-xs text-neutral-500">
                        Connected via Login Kit • TikTok Business Account
                      </p>
                      <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Authorized
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleDisconnect}
                    className="rounded-full border border-black/10 px-4 py-1.5 text-xs font-medium text-neutral-600 transition hover:bg-neutral-100"
                  >
                    Disconnect
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ---- Step 2: Content Upload (Content Posting API) ---- */}
          {(step === "connected" || step === "uploading" || step === "uploaded") && (
            <div className="mt-10">
              <h2 className="text-lg font-semibold text-neutral-950">
                2. Upload Content
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                Upload a video using the Content Posting API. Videos are created
                as drafts for internal review before publishing.
              </p>

              <div className="mt-4 rounded-2xl border border-black/6 bg-neutral-50/80 p-6">
                {step === "uploaded" ? (
                  /* Success state */
                  <div className="flex flex-col items-center gap-4 py-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                      <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-neutral-950">
                        Draft Created Successfully
                      </p>
                      <p className="mt-1 text-sm text-neutral-500">
                        Video uploaded via Content Posting API as a{" "}
                        <span className="font-medium text-neutral-700">private draft</span>.
                      </p>
                    </div>
                    <div className="w-full max-w-md rounded-xl border border-black/6 bg-white p-4 text-xs text-neutral-500">
                      <div className="flex justify-between border-b border-neutral-100 pb-2 mb-2">
                        <span>Publish ID</span>
                        <span className="font-mono text-neutral-700">7483920156...</span>
                      </div>
                      <div className="flex justify-between border-b border-neutral-100 pb-2 mb-2">
                        <span>Status</span>
                        <span className="font-medium text-amber-600">Draft / Private</span>
                      </div>
                      <div className="flex justify-between border-b border-neutral-100 pb-2 mb-2">
                        <span>Upload Method</span>
                        <span className="text-neutral-700">Content Posting API v2</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Created</span>
                        <span className="text-neutral-700">{new Date().toLocaleString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={handleReset}
                      className="rounded-full bg-neutral-900 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800"
                    >
                      Upload Another Video
                    </button>
                  </div>
                ) : (
                  /* Upload form */
                  <div className="space-y-6">
                    {/* Video file */}
                    <div>
                      <div className="block text-sm font-medium text-neutral-800">
                        Video File
                      </div>
                      {!videoFile ? (
                        <label className="mt-2 flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-neutral-200 bg-white p-8 transition hover:border-neutral-400">
                          <span className="sr-only">Upload video file</span>
                          <svg className="h-10 w-10 text-neutral-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                          </svg>
                          <p className="text-sm text-neutral-500">
                            Click to select a video file (mp4, mov)
                          </p>
                          <input
                            type="file"
                            accept="video/mp4,video/quicktime"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) setVideoFile(f);
                            }}
                          />
                        </label>
                      ) : (
                        <div className="mt-2 flex items-center justify-between rounded-xl border border-black/6 bg-white p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100">
                              <svg className="h-5 w-5 text-neutral-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-neutral-800">
                                {videoFile.name}
                              </p>
                              <p className="text-xs text-neutral-500">
                                {(videoFile.size / (1024 * 1024)).toFixed(1)} MB
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => setVideoFile(null)}
                            className="text-xs text-neutral-500 hover:text-neutral-800"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Caption */}
                    <div>
                      <label htmlFor="tiktok-caption" className="block text-sm font-medium text-neutral-800">
                        Caption
                      </label>
                      <textarea
                        id="tiktok-caption"
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        rows={3}
                        className="mt-2 w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm text-neutral-800 outline-none transition focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400"
                      />
                      <p className="mt-1 text-xs text-neutral-400">
                        {caption.length}/2200 characters
                      </p>
                    </div>

                    {/* Visibility */}
                    <div role="group" aria-label="Visibility">
                      <div className="block text-sm font-medium text-neutral-800" aria-hidden="true">
                        Visibility
                      </div>
                      <div className="mt-2 flex gap-3">
                        <button
                          onClick={() => setVisibility("private")}
                          className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                            visibility === "private"
                              ? "border-neutral-900 bg-neutral-900 text-white"
                              : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400"
                          }`}
                        >
                          🔒 Private Draft
                        </button>
                        <button
                          onClick={() => setVisibility("public")}
                          className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                            visibility === "public"
                              ? "border-neutral-900 bg-neutral-900 text-white"
                              : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400"
                          }`}
                        >
                          🌐 Public
                        </button>
                      </div>
                    </div>

                    {/* Upload progress */}
                    {step === "uploading" && (
                      <div>
                        <div className="flex justify-between text-xs text-neutral-500">
                          <span>Uploading via Content Posting API...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="mt-2 h-2 w-full rounded-full bg-neutral-200">
                          <div
                            className="h-2 rounded-full bg-neutral-900 transition-all duration-150"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Submit */}
                    <button
                      onClick={handleUpload}
                      disabled={!videoFile || step === "uploading"}
                      className="w-full rounded-xl bg-neutral-900 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {step === "uploading"
                        ? "Uploading..."
                        : "Upload as Draft"}
                    </button>

                    <p className="text-center text-xs text-neutral-400">
                      Content is uploaded using TikTok Content Posting API v2.
                      All uploads start as private drafts for internal review.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
