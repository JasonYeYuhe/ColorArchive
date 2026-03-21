import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { PackQuizPage } from "@/src/components/pack-quiz-page";

export const metadata: Metadata = {
  title: "Which Pack Is Right for You? — ColorArchive",
  description:
    "Answer a few quick questions and we'll recommend the best ColorArchive palette pack for your project — brand, UI, content creation, or full design system.",
  alternates: { canonical: "/packs/quiz/" },
};

const quizStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "ColorArchive Pack Finder Quiz",
  description: "Answer 5 quick questions and get a personalized color palette pack recommendation for your project.",
  url: "https://colorarchive.me/packs/quiz/",
  applicationCategory: "DesignApplication",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "JPY",
  },
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://colorarchive.me" },
      { "@type": "ListItem", position: 2, name: "Packs", item: "https://colorarchive.me/packs/" },
      { "@type": "ListItem", position: 3, name: "Pack Finder Quiz", item: "https://colorarchive.me/packs/quiz/" },
    ],
  },
};

export default function PackQuizRoute() {
  return (
    <>
      <StructuredDataScript data={quizStructuredData} />
      <SiteHeader currentPath="/packs" />
      <PackQuizPage />
    </>
  );
}
