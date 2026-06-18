export interface WordColorFaqItem {
  question: string;
  answer: string;
}

/**
 * Shared FAQ data for the Word to Color generator.
 * Rendered as visible content in the page component AND emitted as
 * FAQPage structured data in the route's metadata — single source of
 * truth keeps the two in sync (a Google rich-result requirement).
 */
export const wordToColorFaq: WordColorFaqItem[] = [
  {
    question: "How does the word to color generator work?",
    answer:
      "It normalizes your text and runs a deterministic hash entirely in your browser — no API and no server. That hash maps to stable hue, saturation, and lightness values, producing one base color plus five tonal variants.",
  },
  {
    question: "Will the same word always produce the same color?",
    answer:
      "Yes. The algorithm is fully deterministic, so a given word or phrase always returns the identical hex code and palette on any device. That makes it useful as a lightweight, repeatable visual signature for names, tags, or brands.",
  },
  {
    question: "Is the word to color generator free?",
    answer:
      "Yes — you can generate and copy color palettes for free, no sign-up required. Free use covers five word palettes; unlock unlimited generation plus production-ready CSS/Tailwind/Figma exports with Pro, or keep generating free by subscribing to the daily color email.",
  },
  {
    question: "Can I use the generated colors commercially?",
    answer:
      "Yes. Hex color values are factual data and are not copyrightable, so you are free to use any generated color or palette in personal and commercial projects.",
  },
  {
    question: "What are the five color variants?",
    answer:
      "Each word generates a base color plus tonal variants — lighter and darker steps around the same hue — giving you a small, ready-to-use palette instead of a single swatch.",
  },
];
