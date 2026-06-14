/**
 * Per-guide SEO enrichment: FAQ blocks (rendered visibly AND emitted as FAQPage
 * JSON-LD) and query-optimized <title> overrides.
 *
 * Why a separate module (not fields on the 12k-line guides.ts):
 *  - keeps autopilot's bulk guide data untouched and easy to diff,
 *  - lets us enrich ONLY the highest-traffic guides. We deliberately do NOT
 *    blanket-fill all 314 guides — auto-generated FAQ on every page is exactly
 *    the thin-content pattern Google's Helpful-Content system penalizes.
 *
 * FAQs are hand-written to be accurate and *quotable* — this is also the GEO
 * lever (ChatGPT/Perplexity lift clean Q&A pairs as answers, and chatgpt.com is
 * already this site's #2 external source).
 *
 * Extend by adding the guide's slug below. Anything not listed renders unchanged.
 */

export interface GuideFaqItem {
  question: string;
  answer: string;
}

/** Query-optimized <title> overrides for the highest-impression guides. */
export const guideSeoTitles: Record<string, string> = {
  "blue-color-psychology-branding-guide":
    "Blue Color Psychology in Branding: Meaning, Hex Codes & Examples (2026)",
  "film-cinematography-color-guide":
    "Film Color Theory: How Cinematography Uses Color (with Palettes)",
  "color-trends-2026-design-guide":
    "2026 Color Trends: The Palettes Designers Are Using This Year",
  "color-theory-fundamentals-guide":
    "Color Theory Basics: The Complete Guide for Designers",
  "color-contrast-accessibility-guide":
    "Color Contrast & Accessibility: WCAG Ratios Explained",
  "color-psychology-branding":
    "Color Psychology in Branding: What Each Color Says About a Brand",
  "color-psychology-marketing-guide":
    "Color Psychology in Marketing: How Color Drives Conversions",
  "cultural-color-meanings-guide":
    "Color Meanings Around the World: A Cultural Color Guide",
  "color-palette-for-logo-design":
    "How to Choose Logo Colors: A Practical Palette Guide",
  "ecommerce-color-psychology-guide":
    "Ecommerce Color Psychology: Colors That Increase Conversions",
};

export const guideFaqs: Record<string, GuideFaqItem[]> = {
  "blue-color-psychology-branding-guide": [
    {
      question: "What does the color blue mean in branding?",
      answer:
        "Blue signals trust, stability, competence, and calm, which is why it dominates finance, healthcare, and technology brands. Lighter blues read as friendly and approachable; deep navy reads as authoritative and premium.",
    },
    {
      question: "Why do so many tech and finance companies use blue?",
      answer:
        "Blue is consistently rated the most trustworthy and least risky color across cultures, and it has low emotional volatility. For categories where customers are handing over money or data — banks, insurers, SaaS — that perceived reliability is worth more than standing out.",
    },
    {
      question: "What colors pair well with blue in a brand palette?",
      answer:
        "Blue pairs cleanly with warm neutrals and off-whites for a calm, professional system; with orange or coral for a high-energy complementary accent; and with teal or green for an analogous, modern tech feel.",
    },
    {
      question: "What are good blue hex codes for a brand?",
      answer:
        "Common, well-balanced choices include a deep navy around #1B2A4A, a confident mid-blue around #2563EB, and a friendly sky blue around #38BDF8. Browse ColorArchive's blue family for named variants with contrast data.",
    },
  ],
  "color-psychology-branding": [
    {
      question: "What is color psychology in branding?",
      answer:
        "Color psychology in branding is the study of how a brand's colors shape perception and behavior — trust, excitement, value, appetite — before a single word is read. It informs which palette best fits a brand's personality and category.",
    },
    {
      question: "Which colors work best for which industries?",
      answer:
        "Blue suits finance, tech, and healthcare (trust); green suits wellness, finance, and sustainability (growth, calm); red suits food, retail, and entertainment (energy, urgency); black and gold suit luxury (sophistication); orange and yellow suit value and friendliness.",
    },
    {
      question: "How many colors should a brand palette have?",
      answer:
        "Most strong brand systems use one dominant brand color, one or two supporting colors, and a set of neutrals for backgrounds and text. Limiting the core palette keeps the brand recognizable and the UI legible.",
    },
    {
      question: "Does color meaning change between cultures?",
      answer:
        "Yes. White means purity in much of the West but mourning in parts of East Asia; red means luck and celebration in China but danger or debt elsewhere. Global brands should validate color choices in each target market.",
    },
  ],
  "color-psychology-marketing-guide": [
    {
      question: "How does color affect marketing and conversions?",
      answer:
        "Color sets emotional context and guides attention. Used consistently it raises brand recognition; used for contrast it directs the eye to calls-to-action. The biggest conversion lever is usually contrast between the button and its surroundings, not the specific hue.",
    },
    {
      question: "What is the best color for a call-to-action button?",
      answer:
        "There is no universally best CTA color — what matters is that the button strongly contrasts with the page around it and meets accessibility contrast for its text. A color that stands out against your specific layout will outperform any 'magic' color.",
    },
    {
      question: "Which colors feel premium versus affordable?",
      answer:
        "Black, deep jewel tones, and metallic gold or silver read as premium; bright saturated reds, oranges, and yellows read as energetic and value-oriented, which is why discount retailers lean on them.",
    },
  ],
  "color-theory-fundamentals-guide": [
    {
      question: "What are the basics of color theory?",
      answer:
        "Color theory describes how colors relate on the color wheel and how to combine them. The core ideas are hue (the color), saturation (its intensity), and lightness (how light or dark), plus harmony schemes like complementary, analogous, and triadic.",
    },
    {
      question: "What is the difference between complementary and analogous colors?",
      answer:
        "Complementary colors sit opposite each other on the wheel (e.g. blue and orange) for high contrast and energy. Analogous colors sit next to each other (e.g. blue, teal, green) for a calm, cohesive look.",
    },
    {
      question: "What are HSL and hex codes?",
      answer:
        "Hex codes (e.g. #2563EB) are the six-digit RGB notation used in CSS and design tools. HSL describes the same color as Hue, Saturation, and Lightness, which is easier to reason about when building tints, shades, and palettes.",
    },
  ],
  "color-contrast-accessibility-guide": [
    {
      question: "What is a good color contrast ratio?",
      answer:
        "WCAG requires a contrast ratio of at least 4.5:1 for normal body text and 3:1 for large text (about 18px bold or 24px regular) to meet AA. AAA, the stricter level, requires 7:1 for normal text and 4.5:1 for large text.",
    },
    {
      question: "How do I check color contrast?",
      answer:
        "Compare the foreground and background colors with a contrast checker, which computes the ratio from their relative luminance. ColorArchive shows each color's contrast against black and white, and its contrast checker compares any two colors.",
    },
    {
      question: "Does contrast matter for buttons and icons?",
      answer:
        "Yes. Under WCAG 2.1, interactive controls and meaningful graphics (icons, form borders, focus indicators) need at least 3:1 contrast against adjacent colors so they're perceivable by low-vision users.",
    },
  ],
  "wcag-color-accessibility-guide": [
    {
      question: "What are the WCAG color contrast requirements?",
      answer:
        "For AA: 4.5:1 for normal text, 3:1 for large text and UI components. For AAA: 7:1 for normal text and 4.5:1 for large text. The ratio is calculated from the two colors' relative luminance.",
    },
    {
      question: "Can I rely on color alone to convey information?",
      answer:
        "No. WCAG requires that color is never the only way to convey meaning — pair it with text labels, icons, or patterns so the information survives color blindness and grayscale.",
    },
    {
      question: "What is the difference between WCAG 2 contrast and APCA?",
      answer:
        "WCAG 2 uses a fixed luminance-ratio formula. APCA (the contrast method explored for WCAG 3) models perceived lightness difference and text weight, often giving results that better match how text actually reads, especially in dark mode.",
    },
  ],
  "cultural-color-meanings-guide": [
    {
      question: "Do colors mean different things in different cultures?",
      answer:
        "Yes, often dramatically. Red signals luck and celebration in China but caution in the West; white means purity in Western weddings but mourning in parts of Asia; green carries strong religious meaning across the Islamic world.",
    },
    {
      question: "Why does cultural color meaning matter for design?",
      answer:
        "A palette that feels celebratory in one market can feel inappropriate or unlucky in another. For global brands, packaging, and campaigns, validating color choices per region avoids costly missteps.",
    },
  ],
  "film-cinematography-color-guide": [
    {
      question: "How do films use color?",
      answer:
        "Filmmakers use color to set mood, signal time and place, and guide attention. Through color grading they push palettes toward warm or cool, build contrast schemes like teal-and-orange, and assign colors to characters or arcs to tell story visually.",
    },
    {
      question: "What is the teal and orange look?",
      answer:
        "Teal-and-orange is a popular grade that pushes shadows toward teal and skin tones toward orange. Because they're near-complementary, skin pops against the background — a high-contrast, cinematic feel common in blockbusters.",
    },
    {
      question: "What is color grading?",
      answer:
        "Color grading is the post-production process of adjusting a film's color, contrast, and tone to achieve a consistent look and emotional intent — distinct from color correction, which just fixes exposure and white balance.",
    },
  ],
  "color-trends-2026-design-guide": [
    {
      question: "What are the color trends for 2026?",
      answer:
        "2026 palettes lean toward grounded, organic tones — warm earth neutrals, muted clays and terracottas, sage and olive greens — balanced by digital-native accents like electric blue and saturated violet, reflecting a blend of analog warmth and tech optimism.",
    },
    {
      question: "How should I use trend colors without dating my design?",
      answer:
        "Anchor your system in durable neutrals and a stable brand color, then express trends through accents, illustrations, and seasonal campaigns that are cheap to refresh. That keeps the core identity timeless while feeling current.",
    },
  ],
  "color-palette-for-logo-design": [
    {
      question: "How many colors should a logo have?",
      answer:
        "Most effective logos use one or two colors plus black and white. Fewer colors reproduce reliably across print, embroidery, favicons, and single-color contexts, and keep the mark memorable.",
    },
    {
      question: "How do I choose logo colors?",
      answer:
        "Start from the brand's personality and category conventions, pick one dominant color that carries the right association, and ensure it works in black, white, and on both light and dark backgrounds before committing.",
    },
    {
      question: "Should a logo work in black and white?",
      answer:
        "Yes. A logo should remain clear and recognizable in a single color, because it will appear in faxes, engravings, stamps, and other contexts where color isn't available. Design it in black and white first, then add color.",
    },
  ],
  "ecommerce-color-psychology-guide": [
    {
      question: "What colors increase ecommerce conversions?",
      answer:
        "There's no single best color; conversions rise when the 'add to cart' / checkout button has strong contrast against the page and the palette builds trust for the category. Test button contrast and placement before testing hue.",
    },
    {
      question: "What colors build trust in an online store?",
      answer:
        "Blue and green are widely associated with trust and safety, which is why they're common around payment and security messaging. Pair them with generous neutrals and clear typography so price and trust signals stay legible.",
    },
    {
      question: "Should sale and urgency elements use red?",
      answer:
        "Red and warm tones effectively draw attention to discounts and limited-time offers because they read as urgent. Use them sparingly for genuine urgency — overusing red dilutes its effect and can feel aggressive.",
    },
  ],
};
