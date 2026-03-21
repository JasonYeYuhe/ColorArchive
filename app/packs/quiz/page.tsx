import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { PackQuizPage } from "@/src/components/pack-quiz-page";

export const metadata: Metadata = {
  title: "Which Pack Is Right for You? — ColorArchive",
  description:
    "Answer a few quick questions and we'll recommend the best ColorArchive palette pack for your project — brand, UI, content creation, or full design system.",
  alternates: { canonical: "/packs/quiz/" },
};

export default function PackQuizRoute() {
  return (
    <>
      <SiteHeader currentPath="/packs" />
      <PackQuizPage />
    </>
  );
}
