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
  {
    category: "Tokens & Workflow",
    slug: "brand-color-tokens",
    title: "Brand Color Tokens That Keep Marketing and Product in Sync",
    summary:
      "How to structure brand color tokens so campaign pages, product UI, and ongoing brand work can share one palette system instead of drifting into separate color stacks.",
    eyebrow: "Brand Token Guide",
    priority: 94,
    searchIntent: "brand color tokens",
    featuredCollectionId: "quiet-luxury",
    featuredPackId: "brand-starter-kit",
    tags: ["Brand", "Tokens", "Systems"],
    highlights: [
      "Brand tokens are what keep the landing page palette from splitting away from product UI.",
      "The stable layer is role naming, not the exact launch palette.",
      "The Brand Starter Kit is the shortest path if the team needs a shared export base now.",
    ],
    sections: [
      {
        heading: "Treat brand color as a system, not a launch deck",
        body:
          "A brand palette often starts life in marketing and then gets copied loosely into product, lifecycle email, and sales collateral. That is where drift begins. Brand color tokens matter because they force the team to define reusable roles such as hero accent, muted surface, primary text, or soft background rather than re-deciding the palette every time a new asset is made.",
      },
      {
        heading: "Roles should survive while values can evolve",
        body:
          "The exact shade of a brand accent may change over time. The role usually does not. That is why token systems work best when they separate semantic naming from raw values. Quiet Luxury is a useful example because the system can flex between warmer and cooler edits without losing the premium tone or the role structure underneath it.",
      },
      {
        heading: "Why this becomes a product problem quickly",
        body:
          "Once product UI, landing pages, and campaign assets all depend on the same palette, token drift becomes expensive. The Brand Starter Kit reduces that cost by giving teams grouped roles, exports, and pairings that can travel across files instead of living in disconnected style experiments.",
      },
    ],
    links: [
      { label: "Open Brand Starter Kit", href: "/packs/brand-starter-kit/" },
      { label: "Read brand palette guide", href: "/guides/brand-color-palette/" },
      { label: "Open Quiet Luxury", href: "/collections/quiet-luxury/" },
    ],
  },
  {
    category: "Interface Systems",
    slug: "design-system-palette",
    title: "Design System Palette Ideas That Survive Component Growth",
    summary:
      "A practical guide to building a design system palette that still works after the component library gets larger, more stateful, and harder to maintain by taste alone.",
    eyebrow: "System Guide",
    priority: 90,
    searchIntent: "design system palette",
    featuredCollectionId: "monochrome-studio",
    featuredPackId: "complete-archive",
    tags: ["Design systems", "UI", "Tokens"],
    highlights: [
      "A design system palette has to scale across states, surfaces, and component density.",
      "Monochrome or restrained lanes usually scale better because they leave more room for hierarchy.",
      "The Complete Archive Token Set helps when the team needs broad palette testing without rebuilding exports.",
    ],
    sections: [
      {
        heading: "Component growth is what exposes weak palettes",
        body:
          "A palette can look fine in a hero and still fail inside a real component library. Once you add tables, empty states, alerts, filters, overlays, charts, and multiple interaction states, the system needs more than a few attractive swatches. It needs predictable roles and enough tonal range to keep every layer legible.",
      },
      {
        heading: "Start restrained so the system has headroom",
        body:
          "Many design systems age badly because they begin with too much personality in the base layer. Monochrome Studio is useful because it starts from restraint: subtle warm and cool shifts, clean hierarchy, and enough nuance to support editorial or product surfaces without visual noise. That gives the system headroom for status colors and accents later.",
      },
      {
        heading: "Broad coverage matters when the team is still deciding",
        body:
          "If the design system is still in flux, buying or exporting one narrow palette at a time creates rework. The Complete Archive Token Set is more useful in that stage because it gives a wider color base in implementation-ready formats, so the team can test directions without rebuilding the token layer every week.",
      },
    ],
    links: [
      { label: "Open Complete Archive Token Set", href: "/packs/complete-archive/" },
      { label: "Open Monochrome Studio", href: "/collections/monochrome-studio/" },
      { label: "Read Tailwind token guide", href: "/guides/tailwind-color-tokens/" },
    ],
  },
  {
    category: "Interface Systems",
    slug: "saas-website-color-scheme",
    title: "Website Color Scheme for SaaS Products That Need Trust Before Flash",
    summary:
      "How to choose a SaaS website color scheme that communicates clarity, trust, and product maturity without collapsing into the same generic blue startup palette.",
    eyebrow: "SaaS Guide",
    priority: 90,
    searchIntent: "website color scheme for saas",
    featuredCollectionId: "nordic-frost",
    featuredPackId: "palette-pack-vol-1",
    tags: ["SaaS", "Website", "UI"],
    highlights: [
      "SaaS landing pages need trust and hierarchy before they need novelty.",
      "Cool, restrained palettes often convert better than louder systems because the product can breathe.",
      "Nordic Frost and Palette Pack Vol. 1 are a practical starting pair for clean SaaS surfaces.",
    ],
    sections: [
      {
        heading: "Trust comes from clarity more than decoration",
        body:
          "A SaaS website usually has to explain workflow, features, pricing, proof, and product UI all on the same page. That means the color system has to support comprehension first. Strong CTA contrast, readable screenshots, and stable section hierarchy matter more than trying to impress with novelty in every block.",
      },
      {
        heading: "Use cool restraint without becoming generic",
        body:
          "The trap is not using blue. The trap is using a dead, interchangeable startup blue with no supporting structure. Nordic Frost works because it keeps the clean trust signals people expect from software while introducing enough temperature variation to feel considered. The result is calm rather than bland.",
      },
      {
        heading: "A starter pack is usually enough to move faster",
        body:
          "Most SaaS teams do not need a giant color program on day one. They need a coherent lane that can power the site, a few screenshots, and the first product surfaces without debate. Palette Pack Vol. 1 is useful there because it shortens decision time and gives an implementation-friendly palette base immediately.",
      },
    ],
    links: [
      { label: "Open Nordic Frost", href: "/collections/nordic-frost/" },
      { label: "Open Palette Pack Vol. 1", href: "/packs/palette-pack-vol-1/" },
      { label: "Read website palette guide", href: "/guides/website-color-palette/" },
    ],
  },
  {
    category: "Free & Conversion",
    slug: "free-figma-color-palette",
    title: "Free Figma Color Palette Files That Show Enough Quality to Earn the Upgrade",
    summary:
      "What people actually expect from a free Figma color palette, how much structure the file needs, and how to use the free layer to prove the paid system instead of underselling it.",
    eyebrow: "Free Figma Guide",
    priority: 87,
    searchIntent: "free figma color palette",
    featuredCollectionId: "modern-seaside",
    featuredPackId: "content-creator-bundle",
    tags: ["Free", "Figma", "Download"],
    highlights: [
      "A free Figma palette should feel organized enough to use in a real mockup immediately.",
      "The right free file proves naming, structure, and taste rather than trying to give everything away.",
      "The free layer works best when the upgrade path into a paid pack is obvious and believable.",
    ],
    sections: [
      {
        heading: "People want a usable file, not a teaser screenshot",
        body:
          "When someone searches for a free Figma color palette, they are not asking for abstract inspiration. They want something they can drop into a frame and use right away. If the sample lacks clear naming, grouping, or export discipline, it suggests that the paid product will be messy too. The free layer has to prove the opposite.",
      },
      {
        heading: "A smaller system can still feel complete",
        body:
          "The best free files feel intentionally scoped rather than incomplete. Modern Seaside is a good example of a lane that still feels coherent even in a smaller sample because the mood, spacing, and role logic are obvious immediately. That is what gives the user confidence to keep moving through the catalog.",
      },
      {
        heading: "The upgrade path should follow the same tone",
        body:
          "Free converts better when the next paid step feels like the same system expanded, not a different product entirely. That is why a creator-facing bundle or broader pack should inherit the same discipline around naming, formats, and file quality. The user should understand the upgrade in one glance.",
      },
    ],
    links: [
      { label: "Get the Free Sample Pack", href: "/free-pack/" },
      { label: "Open Creator Bundle", href: "/packs/content-creator-bundle/" },
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

export function getRelatedGuides(slug: string, limit = 3) {
  const guide = getLandingGuide(slug);

  if (!guide) {
    return [];
  }

  const scoredGuides = landingGuides
    .filter((entry) => entry.slug !== slug)
    .map((entry) => {
      let score = 0;

      if (entry.category === guide.category) {
        score += 3;
      }

      if (guide.featuredPackId && entry.featuredPackId === guide.featuredPackId) {
        score += 3;
      }

      if (guide.featuredCollectionId && entry.featuredCollectionId === guide.featuredCollectionId) {
        score += 3;
      }

      const sharedTags = entry.tags.filter((tag) => guide.tags.includes(tag)).length;
      score += Math.min(sharedTags, 2);

      return { entry, score };
    })
    .sort((a, b) => b.score - a.score || b.entry.priority - a.entry.priority);

  const primaryMatches = scoredGuides
    .filter(({ score }) => score > 0)
    .slice(0, limit)
    .map(({ entry }) => entry);

  if (primaryMatches.length >= limit) {
    return primaryMatches;
  }

  const fallbackMatches = scoredGuides
    .map(({ entry }) => entry)
    .filter((entry) => !primaryMatches.some((match) => match.slug === entry.slug))
    .slice(0, limit - primaryMatches.length);

  return [...primaryMatches, ...fallbackMatches];
}
