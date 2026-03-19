export interface GuideSection {
  heading: string;
  body: string;
}

export interface GuideLink {
  label: string;
  href: string;
}

export interface LandingGuide {
  slug: string;
  title: string;
  summary: string;
  eyebrow: string;
  searchIntent: string;
  featuredCollectionId?: string;
  featuredPackId?: string;
  tags: string[];
  highlights: string[];
  sections: GuideSection[];
  links: GuideLink[];
}

export const landingGuides: LandingGuide[] = [
  {
    slug: "brand-color-palette",
    title: "Brand Color Palette Ideas That Hold Up Beyond the Launch",
    summary:
      "A practical guide to building a brand color palette that survives product growth, campaign work, and interface expansion without turning into disconnected swatches.",
    eyebrow: "Brand Guide",
    searchIntent: "brand color palette ideas",
    featuredCollectionId: "quiet-luxury",
    featuredPackId: "brand-starter-kit",
    tags: ["Brand", "Palette", "Systems"],
    highlights: [
      "A brand palette needs roles, not just pretty colors.",
      "The strongest starter palettes already imply surfaces, accents, and text hierarchy.",
      "Quiet Luxury and the Brand Starter Kit are the clearest starting pair for premium, calm brands.",
    ],
    sections: [
      {
        heading: "Start with roles before variety",
        body:
          "Most brand palettes break because they expand in the wrong order. The team starts with a hero color, then keeps adding shades without assigning clear jobs. A stronger route is to define roles first: primary, surface, muted support, text, and accent. That structure reduces the chance that every new screen invents its own version of the brand.",
      },
      {
        heading: "Use one calm lane as the anchor",
        body:
          "If the palette needs to feel premium or editorial, one restrained lane should do most of the work. Quiet Luxury is useful because it shows how a brand can feel expensive without defaulting to black and white. Warm neutrals, soft blush, and grounded dark tones create a wider application surface than a single loud signature color.",
      },
      {
        heading: "When to move into a pack",
        body:
          "Once the palette has to work in implementation, the problem changes from taste to structure. That is where the Brand Starter Kit becomes useful: role-based groupings, light and dark pairings, and token exports reduce the amount of interpretation required between design and code.",
      },
    ],
    links: [
      { label: "Open Quiet Luxury", href: "/collections/quiet-luxury/" },
      { label: "Open Brand Starter Kit", href: "/packs/brand-starter-kit/" },
      { label: "Browse all collections", href: "/collections/" },
    ],
  },
  {
    slug: "dark-mode-color-palette",
    title: "Dark Mode Color Palette Ideas for Real Product Interfaces",
    summary:
      "How to build a dark mode color palette that keeps contrast, separation, and enough chroma to avoid the usual generic neon-on-black look.",
    eyebrow: "Dark Mode Guide",
    searchIntent: "dark mode color palette",
    featuredCollectionId: "nocturne-tech",
    featuredPackId: "dark-mode-ui-kit",
    tags: ["Dark mode", "UI", "Contrast"],
    highlights: [
      "Dark mode palettes fail when every surface collapses into the same black.",
      "A useful dark palette needs hierarchy, not just bright accents.",
      "Nocturne Tech and the Dark Mode UI Kit are built around paired implementation rather than inspiration alone.",
    ],
    sections: [
      {
        heading: "Dark mode needs separation first",
        body:
          "A dark interface stops feeling intentional when surfaces, borders, and text all sit too close together in lightness. The goal is not maximum darkness. The goal is readable separation. Strong dark-mode palettes keep enough range for panels, navigation, muted text, and interactive accents to each have a clear role.",
      },
      {
        heading: "Use chroma strategically",
        body:
          "The quickest path to a generic dark product is to throw one electric accent on pure black and call it done. A better pattern is controlled chroma against deep but not dead neutrals. Nocturne Tech works because cobalt, violet, and aqua are balanced against surfaces that still hold nuance rather than disappearing into flat black.",
      },
      {
        heading: "Implementation is the real bottleneck",
        body:
          "Most dark mode problems show up after design approval: missing token pairs, low-contrast text, or hand-tuned one-off component colors. The Dark Mode UI Kit is valuable because it handles the paired export layer directly. That is what shortens the gap between palette taste and a usable interface system.",
      },
    ],
    links: [
      { label: "Open Nocturne Tech", href: "/collections/nocturne-tech/" },
      { label: "Open Dark Mode UI Kit", href: "/packs/dark-mode-ui-kit/" },
      { label: "Open contrast checker", href: "/contrast/" },
    ],
  },
  {
    slug: "free-color-palette-download",
    title: "Free Color Palette Download That Actually Proves the Product",
    summary:
      "What makes a free color palette download useful, what users expect after signup, and why the free layer should feel like a smaller version of the paid product rather than a random teaser.",
    eyebrow: "Free Download Guide",
    searchIntent: "free color palette download",
    featuredCollectionId: "editorial-warmth",
    featuredPackId: "content-creator-bundle",
    tags: ["Free", "Download", "Conversion"],
    highlights: [
      "A free pack should prove structure and file quality, not just hand over a few colors.",
      "Users want clear formats, usable naming, and an obvious next step after download.",
      "The strongest upgrade path from the free layer is into a creator-facing or starter pack with the same tone and file discipline.",
    ],
    sections: [
      {
        heading: "The free layer should still feel complete",
        body:
          "A weak freebie creates doubt, not demand. If the file names are vague, the exports feel improvised, or the palette looks disconnected from the paid product, the user learns the wrong lesson. A strong free download should feel orderly and usable on first open, even if it intentionally covers less ground than the paid packs.",
      },
      {
        heading: "Match the taste of the paid catalog",
        body:
          "The free layer works best when it clearly belongs to the same design system as the paid catalog. Editorial Warmth is a useful example because the taste is immediately legible: warm, human, publishing-friendly, and not throwaway. That makes the upgrade path to the Creator Bundle feel natural instead of forced.",
      },
      {
        heading: "Turn free into a next step, not a dead end",
        body:
          "The goal is not just to collect an email. It is to let the user open the files, understand the quality bar, and know exactly where to go next if they want more. That is why the free route should point into packs, examples, and notes rather than acting like an isolated giveaway.",
      },
    ],
    links: [
      { label: "Get the Free Sample Pack", href: "/free-pack/" },
      { label: "Open Creator Bundle", href: "/packs/content-creator-bundle/" },
      { label: "Open product examples", href: "/product-examples/" },
    ],
  },
  {
    slug: "figma-color-tokens",
    title: "Figma Color Tokens and the Fastest Route to a Shared Color System",
    summary:
      "A guide to keeping Figma, CSS variables, Tailwind tokens, and JSON exports aligned so color decisions survive handoff instead of drifting by file type.",
    eyebrow: "Token Guide",
    searchIntent: "figma color tokens",
    featuredCollectionId: "monochrome-studio",
    featuredPackId: "all-access-bundle",
    tags: ["Figma", "Tokens", "Workflow"],
    highlights: [
      "Token drift is usually a workflow problem, not a color problem.",
      "Reference and alias layers make it possible to update values without renaming product roles every week.",
      "The All Access Bundle gives teams one export base across archive, brand, creator, seasonal, and dark-mode lanes.",
    ],
    sections: [
      {
        heading: "One palette should not become four competing files",
        body:
          "Teams often think they have one palette when they really have four versions of it: one in Figma, one in CSS variables, one in framework config, and one in ad-hoc docs. Once those versions diverge, every redesign takes longer because the handoff layer becomes guesswork. A token system exists to prevent that divergence from starting.",
      },
      {
        heading: "Separate value storage from product meaning",
        body:
          "Reference tokens hold raw color values. Alias tokens connect those values to roles such as surface, border, muted text, or accent. That split matters because roles tend to persist while exact color values evolve. When the product changes, the team updates the values without rewriting the role model from scratch.",
      },
      {
        heading: "Why a broader bundle can be the cheaper decision",
        body:
          "If the team already needs multiple lanes, piecemeal buying creates more stitching work. The All Access Bundle is useful because it gives one consistent export base across all the main product directions. That lowers decision overhead and keeps the workflow cleaner than collecting separate assets over time.",
      },
    ],
    links: [
      { label: "Open All Access Bundle", href: "/packs/all-access-bundle/" },
      { label: "Open Complete Archive Token Set", href: "/packs/complete-archive/" },
      { label: "Read notes on token workflow", href: "/notes/june-2026-design-tokens-that-dont-drift/" },
    ],
  },
];

export function getLandingGuide(slug: string) {
  return landingGuides.find((guide) => guide.slug === slug) ?? null;
}
