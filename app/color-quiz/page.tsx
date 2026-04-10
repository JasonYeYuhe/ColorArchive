import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { ColorQuizPage } from "@/src/components/color-quiz-page";
import { SITE_URL } from "@/src/lib/site-config";

export const metadata: Metadata = {
  title: { absolute: "Color Personality Quiz — Discover Your Color Type | ColorArchive" },
  description:
    "Answer 5 questions and discover your color personality. Get a custom palette matched to your aesthetic and a shareable color type card.",
  alternates: { canonical: "/color-quiz/" },
  openGraph: {
    title: "Color Personality Quiz | ColorArchive",
    description:
      "What color type are you? Answer 5 questions to get your personalized palette and color personality.",
    images: [`${SITE_URL}/og-image-v1.png`],
  },
  twitter: {
    title: "Color Personality Quiz | ColorArchive",
    description:
      "Discover your color personality in 5 questions. Share your result and explore your custom palette.",
    images: [`${SITE_URL}/og-image-v1.png`],
  },
};

export default function ColorQuizRoute() {
  return (
    <>
      <SiteHeader currentPath="/color-quiz" />
      <ColorQuizPage />
    </>
  );
}
