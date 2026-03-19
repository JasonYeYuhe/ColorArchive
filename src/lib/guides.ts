export interface GuideSection {
  heading: string;
  body: string;
}

export interface GuideLink {
  label: string;
  href: string;
}

export interface LandingGuide {
  category: string;
  slug: string;
  title: string;
  summary: string;
  eyebrow: string;
  priority: number;
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
    category: "Brand & Marketing",
    slug: "brand-color-palette",
    title: "Brand Color Palette Ideas That Hold Up Beyond the Launch",
    summary:
      "A practical guide to building a brand color palette that survives product growth, campaign work, and interface expansion without turning into disconnected swatches.",
    eyebrow: "Brand Guide",
    priority: 100,
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
    category: "Interface Systems",
    slug: "dark-mode-color-palette",
    title: "Dark Mode Color Palette Ideas for Real Product Interfaces",
    summary:
      "How to build a dark mode color palette that keeps contrast, separation, and enough chroma to avoid the usual generic neon-on-black look.",
    eyebrow: "Dark Mode Guide",
    priority: 95,
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
    category: "Free & Conversion",
    slug: "free-color-palette-download",
    title: "Free Color Palette Download That Actually Proves the Product",
    summary:
      "What makes a free color palette download useful, what users expect after signup, and why the free layer should feel like a smaller version of the paid product rather than a random teaser.",
    eyebrow: "Free Download Guide",
    priority: 96,
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
    category: "Tokens & Workflow",
    slug: "figma-color-tokens",
    title: "Figma Color Tokens and the Fastest Route to a Shared Color System",
    summary:
      "A guide to keeping Figma, CSS variables, Tailwind tokens, and JSON exports aligned so color decisions survive handoff instead of drifting by file type.",
    eyebrow: "Token Guide",
    priority: 93,
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
  {
    category: "Interface Systems",
    slug: "ui-color-palette",
    title: "UI Color Palette Ideas for Clear, Calm Product Surfaces",
    summary:
      "How to build a UI color palette that stays readable, calm, and consistent across product surfaces instead of turning into a pile of unrelated accent colors.",
    eyebrow: "UI Guide",
    priority: 89,
    searchIntent: "ui color palette",
    featuredCollectionId: "nordic-frost",
    featuredPackId: "brand-starter-kit",
    tags: ["UI", "Palette", "Product"],
    highlights: [
      "Strong UI palettes define surfaces, borders, text, and accents as separate jobs.",
      "Calm product interfaces usually outperform louder palettes over time because they scale better.",
      "Nordic Frost and the Brand Starter Kit are a clean starting pair for restrained product work.",
    ],
    sections: [
      {
        heading: "A UI palette is a hierarchy problem",
        body:
          "Most interface palettes fail because they treat every color as an accent opportunity. Real product surfaces need a stronger hierarchy than that. Backgrounds, panels, muted dividers, primary actions, status colors, and body text all need different jobs. Once those jobs are clear, the palette becomes easier to extend and much harder to break.",
      },
      {
        heading: "Why calm beats loud in product work",
        body:
          "Loud UI palettes can work for a launch, but calmer systems tend to survive longer because they leave more room for content, hierarchy, and interaction feedback. Nordic Frost is useful because it stays crisp without becoming sterile. The cool restraint gives the interface clarity, while subtle chroma keeps it from feeling generic.",
      },
      {
        heading: "Move into tokens before the UI grows",
        body:
          "As soon as the palette needs to power more than a few surfaces, the real issue becomes consistency in implementation. The Brand Starter Kit helps here by structuring export-ready roles and pairings so the palette can move from design taste into repeatable UI decisions.",
      },
    ],
    links: [
      { label: "Open Nordic Frost", href: "/collections/nordic-frost/" },
      { label: "Open Brand Starter Kit", href: "/packs/brand-starter-kit/" },
      { label: "Browse all collections", href: "/collections/" },
    ],
  },
  {
    category: "Brand & Marketing",
    slug: "website-color-palette",
    title: "Website Color Palette Ideas for Landing Pages That Still Convert",
    summary:
      "A practical guide to choosing a website color palette that supports hierarchy, CTA contrast, and brand tone without overwhelming the page.",
    eyebrow: "Website Guide",
    priority: 92,
    searchIntent: "website color palette",
    featuredCollectionId: "modern-seaside",
    featuredPackId: "palette-pack-vol-1",
    tags: ["Website", "Landing pages", "Palette"],
    highlights: [
      "Landing page color has to support hierarchy before it supports personality.",
      "One strong accent and one clear surface system usually outperform overdesigned gradients and too many CTA colors.",
      "Modern Seaside and Palette Pack Vol. 1 are a useful pair for clean, high-clarity website work.",
    ],
    sections: [
      {
        heading: "A website palette should help the page convert",
        body:
          "Website color decisions are rarely judged in isolation. The real question is whether the page reads clearly, whether CTAs stand out at the right moment, and whether the overall tone matches the offer. Too many accents flatten hierarchy. Too little contrast makes the page forgettable. The best website palettes make those tradeoffs feel deliberate.",
      },
      {
        heading: "Use one directional mood, not three",
        body:
          "Landing pages usually get weaker when they combine multiple moods at once: a cool hero gradient, warm cards, and random bright CTA states. Modern Seaside works because it stays within one directional lane. The palette feels fresh, open, and product-ready, which gives the page identity without making every section compete for attention.",
      },
      {
        heading: "Why starter packs help here",
        body:
          "Website work moves fast, which means teams often skip structure and improvise colors directly in components. Palette Pack Vol. 1 is useful because it shortens that setup time. Instead of inventing a palette and then exporting it, the team starts from something already coherent and implementation-friendly.",
      },
    ],
    links: [
      { label: "Open Modern Seaside", href: "/collections/modern-seaside/" },
      { label: "Open Palette Pack Vol. 1", href: "/packs/palette-pack-vol-1/" },
      { label: "Open free pack", href: "/free-pack/" },
    ],
  },
  {
    category: "Brand & Marketing",
    slug: "luxury-neutral-color-palette",
    title: "Luxury Neutral Color Palette Ideas Without Defaulting to Black and White",
    summary:
      "How to build a luxury-neutral color palette that feels premium, warm, and editorial rather than empty, flat, or aggressively minimal.",
    eyebrow: "Neutral Guide",
    priority: 88,
    searchIntent: "luxury neutral color palette",
    featuredCollectionId: "quiet-luxury",
    featuredPackId: "brand-starter-kit",
    tags: ["Luxury", "Neutral", "Brand"],
    highlights: [
      "Premium palettes often work better with warmth than with pure grayscale minimalism.",
      "Luxury-neutral systems need material references: paper, linen, blush stone, smoke, sand.",
      "Quiet Luxury remains the clearest proof of this lane inside ColorArchive.",
    ],
    sections: [
      {
        heading: "Neutral does not mean colorless",
        body:
          "A luxury-neutral palette is not just black, white, and one beige accent. What makes it feel premium is controlled temperature and material reference. Soft blush, oat, sand, smoke, and deep grounding neutrals create more emotional range than a pure grayscale system while still feeling restrained.",
      },
      {
        heading: "Warmth is what keeps it human",
        body:
          "Many minimal palettes age badly because they mistake emptiness for refinement. Quiet Luxury works because it keeps warmth in the system. That warmth is what makes the palette feel tactile rather than clinical. It also gives more room for editorial layout, product photography, and soft-surface interface work.",
      },
      {
        heading: "From visual direction to usable system",
        body:
          "The visual lane becomes more valuable when it is mapped into something the team can reuse. That is where the Brand Starter Kit helps. Instead of keeping luxury-neutral color as a vague mood board, it turns the lane into grouped roles and exportable design tokens.",
      },
    ],
    links: [
      { label: "Open Quiet Luxury", href: "/collections/quiet-luxury/" },
      { label: "Open Brand Starter Kit", href: "/packs/brand-starter-kit/" },
      { label: "Read brand palette guide", href: "/guides/brand-color-palette/" },
    ],
  },
  {
    category: "Tokens & Workflow",
    slug: "tailwind-color-tokens",
    title: "Tailwind Color Tokens Without Losing the Design System in Handoff",
    summary:
      "A guide to structuring Tailwind color tokens so the system stays aligned with CSS variables, JSON exports, and design files instead of fragmenting during implementation.",
    eyebrow: "Tailwind Guide",
    priority: 91,
    searchIntent: "tailwind color tokens",
    featuredCollectionId: "monochrome-studio",
    featuredPackId: "complete-archive",
    tags: ["Tailwind", "Tokens", "Implementation"],
    highlights: [
      "Tailwind becomes fragile when token names mirror raw values instead of semantic roles.",
      "Reference and alias layers matter just as much in code as they do in design files.",
      "The Complete Archive Token Set is the fastest route if you need broad palette coverage in code-friendly formats.",
    ],
    sections: [
      {
        heading: "Do not let Tailwind become the only source of truth",
        body:
          "Teams often move quickly in Tailwind and then realize too late that the framework config has become the real palette, while every other export lags behind. That works for a prototype and breaks in a growing product. A stronger setup keeps Tailwind aligned with a broader token model rather than letting utility names define the design system.",
      },
      {
        heading: "Name tokens by role, not by hex",
        body:
          "The best Tailwind color tokens behave like product roles: surface, panel, subtle border, brand accent, or muted text. Naming by value locks the codebase to temporary decisions and makes refactors painful. Semantic names let the team change colors without rewriting the architecture every time the palette evolves.",
      },
      {
        heading: "When full archive coverage makes sense",
        body:
          "If implementation is the main use case, the Complete Archive Token Set is the more direct path than manually extracting colors one by one. It gives broad coverage in code-friendly formats, which makes it useful when the team wants to test multiple palette directions without rebuilding the export layer each time.",
      },
    ],
    links: [
      { label: "Open Complete Archive Token Set", href: "/packs/complete-archive/" },
      { label: "Open All Access Bundle", href: "/packs/all-access-bundle/" },
      { label: "Read Figma token guide", href: "/guides/figma-color-tokens/" },
    ],
  },
];

export function getLandingGuide(slug: string) {
  return landingGuides.find((guide) => guide.slug === slug) ?? null;
}

export function getGuidesForCollection(collectionId?: string | null, limit = 3) {
  if (!collectionId) {
    return [];
  }

  return landingGuides
    .filter((guide) => guide.featuredCollectionId === collectionId)
    .slice(0, limit);
}

export function getGuidesForPack(packId?: string | null, limit = 3) {
  if (!packId) {
    return [];
  }

  return landingGuides
    .filter((guide) => guide.featuredPackId === packId)
    .slice(0, limit);
}
