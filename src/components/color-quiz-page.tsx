"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { colors as archiveColors } from "@/src/data/colors";
import type { ColorFamily, ColorRecord } from "@/src/types/color";
import { ShareLinkButton, ShareOnXButton } from "@/src/components/share-link-button";

/* ------------------------------------------------------------------ */
/*  Quiz data                                                          */
/* ------------------------------------------------------------------ */

type Family = ColorFamily;

interface Option {
  label: string;
  scores: Partial<Record<Family, number>>;
}

interface Question {
  text: string;
  options: Option[];
}

const QUESTIONS: Question[] = [
  {
    text: "Your ideal weekend looks like…",
    options: [
      { label: "A walk by the sea, waves and salt air", scores: { Teal: 3, Blue: 1 } },
      { label: "A forest hike, breathing pine and earth", scores: { Green: 3, Lime: 1 } },
      { label: "Home with a book and total quiet", scores: { Purple: 2, Blue: 2 } },
      { label: "Out with friends, loud and alive", scores: { Orange: 3, Red: 1 } },
    ],
  },
  {
    text: "Which light moves you most?",
    options: [
      { label: "Morning mist filtering through trees", scores: { Green: 2, Teal: 2 } },
      { label: "Warm amber dusk over rooftops", scores: { Orange: 3, Yellow: 1 } },
      { label: "City neon reflected in wet streets", scores: { Purple: 2, Blue: 2 } },
      { label: "Soft pink bloom of cherry blossoms", scores: { Pink: 3, Yellow: 1 } },
    ],
  },
  {
    text: "Your ideal workspace is…",
    options: [
      { label: "Clean white walls, nothing but essentials", scores: { Blue: 3, Teal: 1 } },
      { label: "Filled with plants, natural light flooding in", scores: { Green: 2, Yellow: 2 } },
      { label: "Dark wood and leather, rich and focused", scores: { Purple: 3, Red: 1 } },
      { label: "Soft blush tones, rounded edges, cozy", scores: { Pink: 3, Orange: 1 } },
    ],
  },
  {
    text: "Facing a new creative challenge, you…",
    options: [
      { label: "Brainstorm wildly until sparks fly", scores: { Yellow: 3, Orange: 1 } },
      { label: "Map it out calmly before touching it", scores: { Blue: 3, Teal: 1 } },
      { label: "Sit with the mood until something emerges", scores: { Purple: 2, Pink: 2 } },
      { label: "Dive in and figure it out as you go", scores: { Red: 2, Lime: 2 } },
    ],
  },
  {
    text: "Choose a scent that represents you…",
    options: [
      { label: "Sea salt and cold air", scores: { Teal: 3, Blue: 1 } },
      { label: "Cedar, soil, and green things", scores: { Green: 2, Yellow: 2 } },
      { label: "Sweet citrus and warm vanilla", scores: { Orange: 3, Pink: 1 } },
      { label: "Dark musk and night-blooming flowers", scores: { Purple: 3, Red: 1 } },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Personality result types                                           */
/* ------------------------------------------------------------------ */

interface ResultType {
  family: Family;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  traits: string[];
}

const RESULT_TYPES: ResultType[] = [
  {
    family: "Red",
    slug: "red",
    name: "The Trailblazer",
    tagline: "Bold, driven, and impossible to ignore.",
    description: "You don't wait for permission. Your color palette is as direct as you are — deep reds and charged magentas that signal confidence and make every design unforgettable.",
    traits: ["Decisive", "Energetic", "Bold"],
  },
  {
    family: "Orange",
    slug: "orange",
    name: "The Connector",
    tagline: "Warm, magnetic, and always in the room.",
    description: "You bring people together. Your palette runs in sunset tones and firelit ambers — colors that feel approachable, joyful, and brimming with possibility.",
    traits: ["Social", "Optimistic", "Warm"],
  },
  {
    family: "Yellow",
    slug: "yellow",
    name: "The Inventor",
    tagline: "Curious, quick, and full of ideas.",
    description: "You see connections others miss. Your palette captures that spark — honeyed golds and bright citrine that radiate intelligence and delight.",
    traits: ["Creative", "Curious", "Playful"],
  },
  {
    family: "Lime",
    slug: "lime",
    name: "The Pioneer",
    tagline: "Fresh, fearless, and always moving forward.",
    description: "You thrive at the frontier. Your colors are the fresh greens of new growth — lively, optimistic, and full of forward momentum.",
    traits: ["Adventurous", "Fresh", "Independent"],
  },
  {
    family: "Green",
    slug: "green",
    name: "The Grounded",
    tagline: "Calm, rooted, and quietly powerful.",
    description: "You don't rush. Your palette draws from deep forest greens and sage — colors that communicate trust, growth, and enduring quality.",
    traits: ["Calm", "Reliable", "Natural"],
  },
  {
    family: "Teal",
    slug: "teal",
    name: "The Curator",
    tagline: "Balanced, discerning, and effortlessly cool.",
    description: "You have an eye for the just-right. Your palette blends the precision of blue with the freshness of green — sophisticated, versatile, and always considered.",
    traits: ["Elegant", "Balanced", "Versatile"],
  },
  {
    family: "Blue",
    slug: "blue",
    name: "The Strategist",
    tagline: "Clear-minded, focused, and built to last.",
    description: "You think before you act — and that's your advantage. Your palette moves through cool sapphires and serene ceruleans, signaling clarity and quiet authority.",
    traits: ["Logical", "Trustworthy", "Focused"],
  },
  {
    family: "Purple",
    slug: "purple",
    name: "The Visionary",
    tagline: "Introspective, artistic, and quietly intense.",
    description: "You see things others feel but can't name. Your palette runs in deep violets and twilight plums — colors that hold mystery, imagination, and depth.",
    traits: ["Artistic", "Introspective", "Mysterious"],
  },
  {
    family: "Pink",
    slug: "pink",
    name: "The Nurturer",
    tagline: "Empathetic, expressive, and deeply attuned.",
    description: "You sense the room before anyone speaks. Your palette blooms in soft roses and warm blushes — colors that speak care, warmth, and emotional intelligence.",
    traits: ["Empathetic", "Gentle", "Expressive"],
  },
];

const RESULT_BY_SLUG = Object.fromEntries(RESULT_TYPES.map((r) => [r.slug, r]));
const RESULT_BY_FAMILY = Object.fromEntries(RESULT_TYPES.map((r) => [r.family, r]));

/* ------------------------------------------------------------------ */
/*  Palette selection from archive                                     */
/* ------------------------------------------------------------------ */

function getPaletteForFamily(family: Family): ColorRecord[] {
  // Pick saturated colors (Soft+) across 5 lightness tiers
  const candidates = archiveColors.filter(
    (c) => c.family === family && c.saturation >= 34
  );
  const targetLightness = [76, 60, 48, 34, 20];
  const picked: ColorRecord[] = [];
  const used = new Set<string>();
  for (const target of targetLightness) {
    const best = candidates
      .filter((c) => !used.has(c.id))
      .reduce<ColorRecord | null>((best, c) =>
        !best || Math.abs(c.lightness - target) < Math.abs(best.lightness - target) ? c : best
      , null);
    if (best) {
      picked.push(best);
      used.add(best.id);
    }
  }
  return picked;
}

/* ------------------------------------------------------------------ */
/*  Scoring                                                            */
/* ------------------------------------------------------------------ */

function computeResult(answers: number[]): ResultType {
  const totals: Partial<Record<Family, number>> = {};
  answers.forEach((optionIdx, questionIdx) => {
    const scores = QUESTIONS[questionIdx].options[optionIdx].scores;
    for (const [fam, pts] of Object.entries(scores) as [Family, number][]) {
      totals[fam] = (totals[fam] ?? 0) + pts;
    }
  });
  let topFamily: Family = "Blue";
  let topScore = 0;
  for (const [fam, score] of Object.entries(totals) as [Family, number][]) {
    if (score > topScore) { topScore = score; topFamily = fam; }
  }
  return RESULT_BY_FAMILY[topFamily] ?? RESULT_TYPES[6];
}

/* ------------------------------------------------------------------ */
/*  Result display component                                           */
/* ------------------------------------------------------------------ */

function QuizResult({ result, onRetake }: { result: ResultType; onRetake: () => void }) {
  const palette = useMemo(() => getPaletteForFamily(result.family), [result.family]);
  const shareUrl = `/color-quiz/?result=${result.slug}`;
  const xText = `I'm "${result.name}" on the ColorArchive Color Personality Quiz ✦ ${result.tagline} #colorarchive #colorpersonality`;

  const primaryColor = palette[2] ?? palette[0];

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Result card */}
      <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-100">
        {/* Hero swatch */}
        <div
          className="h-40 flex flex-col items-center justify-center text-center px-6"
          style={{ backgroundColor: primaryColor?.hex ?? "#6366f1" }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-2"
            style={{ color: (primaryColor?.lightness ?? 50) > 55 ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.6)" }}
          >
            Your color personality
          </p>
          <h1
            className="text-3xl sm:text-4xl font-display font-light"
            style={{ color: (primaryColor?.lightness ?? 50) > 55 ? "#1a1a1a" : "#ffffff" }}
          >
            {result.name}
          </h1>
        </div>

        <div className="bg-white p-6 space-y-5">
          {/* Tagline */}
          <p className="text-slate-500 text-sm italic">{result.tagline}</p>

          {/* Traits */}
          <div className="flex gap-2 flex-wrap">
            {result.traits.map((t) => (
              <span key={t} className="px-3 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-full">
                {t}
              </span>
            ))}
          </div>

          {/* Description */}
          <p className="text-slate-600 text-sm leading-relaxed">{result.description}</p>

          {/* Palette */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Your palette</p>
            <div className="flex gap-2">
              {palette.map((c) => (
                <div key={c.id} className="flex-1 group flex flex-col items-center gap-1">
                  <Link href={`/colors/${c.id}/`}>
                    <div
                      className="w-full h-12 rounded-lg shadow-sm hover:scale-105 transition-transform"
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  </Link>
                  <span className="text-[9px] font-mono text-slate-400 text-center leading-tight hidden sm:block">
                    {c.hex}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Share row */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <ShareLinkButton href={shareUrl} label="Copy result link" />
            <ShareOnXButton text={xText} href={shareUrl} />
          </div>

          {/* Pro CTA */}
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Take it further</p>
              <p className="text-sm font-semibold text-slate-800">Upgrade to Pro</p>
              <p className="text-xs text-slate-500">Unlimited exports, AI generation, and WCAG reports</p>
            </div>
            <Link
              href="/pro/"
              className="shrink-0 px-4 py-2 bg-slate-900 text-white text-xs font-medium rounded-lg hover:bg-slate-700 transition-colors"
            >
              View Pro plans
            </Link>
          </div>

          {/* Retake */}
          <div className="text-center">
            <button
              onClick={onRetake}
              className="text-sm text-slate-400 hover:text-slate-600 underline underline-offset-2"
            >
              Retake the quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main quiz component                                                */
/* ------------------------------------------------------------------ */

export function ColorQuizPage() {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<ResultType | null>(null);

  // Read ?result= param on mount for direct shared result links
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("result");
    if (slug && RESULT_BY_SLUG[slug]) {
      setResult(RESULT_BY_SLUG[slug]);
    }
  }, []);

  const handleSelect = (optionIdx: number) => {
    setSelected(optionIdx);
  };

  const handleNext = () => {
    if (selected === null) return;
    const newAnswers = [...answers, selected];
    if (currentQ < QUESTIONS.length - 1) {
      setAnswers(newAnswers);
      setCurrentQ(currentQ + 1);
      setSelected(null);
    } else {
      const r = computeResult(newAnswers);
      setResult(r);
      window.history.replaceState(null, "", `/color-quiz/?result=${r.slug}`);
    }
  };

  const handleRetake = () => {
    setCurrentQ(0);
    setAnswers([]);
    setSelected(null);
    setResult(null);
    window.history.replaceState(null, "", "/color-quiz/");
  };

  if (result) {
    return <QuizResult result={result} onRetake={handleRetake} />;
  }

  const q = QUESTIONS[currentQ];
  const progress = ((currentQ) / QUESTIONS.length) * 100;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-24">
      <div className="max-w-2xl mx-auto px-4 pt-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-2">Color Personality Quiz</p>
          <h1 className="text-3xl font-display font-light text-slate-900">What color type are you?</h1>
          <p className="text-slate-500 text-sm mt-2">5 questions. One palette that&apos;s entirely you.</p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-slate-400 mb-1.5">
            <span>Question {currentQ + 1} of {QUESTIONS.length}</span>
            <span>{Math.round(((currentQ + 1) / QUESTIONS.length) * 100)}%</span>
          </div>
          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-slate-800 rounded-full transition-all duration-500"
              style={{ width: `${((currentQ + 1) / QUESTIONS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-800 mb-6">{q.text}</h2>

          <div className="space-y-3">
            {q.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                className={`w-full text-left px-4 py-3.5 rounded-xl border text-sm transition-all duration-150 ${
                  selected === idx
                    ? "border-slate-800 bg-slate-800 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleNext}
              disabled={selected === null}
              className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                selected !== null
                  ? "bg-slate-900 text-white hover:bg-slate-700"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}
            >
              {currentQ < QUESTIONS.length - 1 ? "Next" : "See my result"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
