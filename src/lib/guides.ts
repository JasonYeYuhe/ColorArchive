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
  {
    category: "Tools & Workflow",
    slug: "color-palette-generator",
    title: "Color Palette Generator: How to Go From a Word or Mood to a Real Palette",
    summary:
      "Most palette generators give you random swatches. This guide covers how to derive a palette from a concept or keyword, then refine it into something production-ready across formats.",
    eyebrow: "Generator Guide",
    priority: 93,
    searchIntent: "color palette generator",
    featuredCollectionId: "modern-seaside",
    featuredPackId: "free-palette-pack",
    tags: ["Tools", "Workflow", "Palette"],
    highlights: [
      "Concept-first generation produces more coherent palettes than random hue picking.",
      "A good generator resolves to named, exportable colors — not just inspiration screenshots.",
      "ColorArchive's word-to-color tool turns any concept into a structured 5-variant palette instantly.",
    ],
    sections: [
      {
        heading: "The problem with random generators",
        body:
          "Most online palette generators produce adjacent swatches by spinning a color wheel. The output looks fine in a screenshot but collapses when you try to apply it — the lightness values conflict, the contrast ratios fail WCAG checks, and nothing maps cleanly to a primary/secondary/surface role. Starting from a concept instead of a random seed produces better results because mood and use case constrain the hue range before you touch a slider.",
      },
      {
        heading: "Word-to-color: concept as input",
        body:
          "ColorArchive's word-to-color tool turns any word or phrase into a deterministic 5-variant palette by mapping the input to hue, saturation, and lightness ranges that match its semantic feel. \"ocean\" resolves to cool blue-greens with restrained chroma. \"ember\" pulls warm oranges with a push toward lower lightness. The result is a starting palette with mood coherence baked in rather than added later.",
      },
      {
        heading: "From generator output to production palette",
        body:
          "A generated palette is a starting point, not a finished system. The next step is finding the named archive equivalents, checking contrast on intended surfaces, and exporting in the format your workflow needs. The Free Palette Pack includes the first 100 named archive colors in Figma, CSS, and JSON so you can test a generated palette against a real system within minutes.",
      },
    ],
    links: [
      { label: "Try Word-to-Color", href: "/word-to-color/" },
      { label: "Get the Free Palette Pack", href: "/free-pack/" },
      { label: "Browse the full archive", href: "/all-colors/" },
    ],
  },
  {
    category: "Export & Formats",
    slug: "procreate-color-palette",
    title: "Procreate Color Palette: Export, Install, and Use Archive Colors on iPad",
    summary:
      "How to get a production-ready Procreate color palette from a named archive into your iPad workflow — including the .swatches format, installation steps, and which collections work best for illustration.",
    eyebrow: "Procreate Guide",
    priority: 88,
    searchIntent: "procreate color palette",
    featuredCollectionId: "editorial-warmth",
    featuredPackId: "content-creator-bundle",
    tags: ["Procreate", "Download", "Illustration"],
    highlights: [
      "Procreate uses the .swatches format — ColorArchive exports this directly from the full archive.",
      "Named, structured palettes speed up illustration work compared to eyedropping reference images.",
      "Editorial Warmth and the Creator Bundle are the strongest starting points for illustration use.",
    ],
    sections: [
      {
        heading: "What Procreate needs from a color file",
        body:
          "Procreate imports palettes via the .swatches format, which is a flat JSON file Apple Books or Files can hand off to the app. Each color needs an HSBA value. ColorArchive's download packs include a .swatches file generated from the full named archive so you can install hundreds of production-quality colors in one tap rather than eyedropping reference images one by one.",
      },
      {
        heading: "Which collections fit illustration best",
        body:
          "Not every archive collection works equally well for illustration. Editorial Warmth is a strong starting point because the warm-leaning mid-tones work across skin, fabric, wood, and ambient light without pushing into oversaturation. The palette has enough range to cover both shadow and highlight anchors without fighting the paper texture Procreate's brushes naturally add.",
      },
      {
        heading: "Installing and organizing on iPad",
        body:
          "Once you have the .swatches file in Files or Downloads, open Procreate, go to the Palettes panel, tap the plus button, and choose Import. The full archive installs as a single named palette. From there you can duplicate it and delete colors you do not need to build illustration-specific subsets. The Content Creator Bundle includes the .swatches export plus CSS and JSON for the same set, so the colors stay consistent if you move between Procreate and a web or brand context.",
      },
    ],
    links: [
      { label: "Get the Content Creator Bundle", href: "/packs/content-creator-bundle/" },
      { label: "Open Editorial Warmth", href: "/collections/editorial-warmth/" },
      { label: "Browse all colors", href: "/all-colors/" },
    ],
  },
  {
    category: "Interface Systems",
    slug: "color-scheme-for-app",
    title: "Color Scheme for an App: How to Build a Mobile Palette That Works Across Screens",
    summary:
      "Choosing a color scheme for a mobile app is different from web — smaller viewports, mixed lighting, and OS-level dark mode mean your palette choices have tighter constraints and higher stakes.",
    eyebrow: "App UI Guide",
    priority: 91,
    searchIntent: "color scheme for app",
    featuredCollectionId: "nocturne-tech",
    featuredPackId: "dark-mode-ui-kit",
    tags: ["UI", "Product", "Dark mode"],
    highlights: [
      "Mobile palettes need higher contrast ratios than desktop because rendering and ambient light vary more.",
      "A dual-mode palette (light + dark) is the baseline expectation for any shipped iOS or Android app.",
      "Nocturne Tech and the Dark Mode UI Kit are built for exactly this constraint set.",
    ],
    sections: [
      {
        heading: "Mobile rendering changes how color behaves",
        body:
          "An app runs on OLED screens in direct sunlight, on LCD in dim rooms, and in accessibility modes that can invert or reduce contrast. A palette that looks fine on your design laptop will often wash out or vibrate in those conditions. That means your app color scheme needs higher contrast margins than a typical web design, and the dark mode variant is not optional — it is the default for a significant share of users.",
      },
      {
        heading: "System roles matter more than individual swatches",
        body:
          "App UI palettes work by role: background, surface, border, interactive, destructive, success. The mistake is picking beautiful swatches and assigning roles afterward. The right approach is defining the roles first — primary action, disabled state, error indicator, ambient surface — and then choosing archive colors that satisfy the contrast requirements for each. This is exactly the structure the Dark Mode UI Kit provides.",
      },
      {
        heading: "Nocturne Tech as a dark mode foundation",
        body:
          "Nocturne Tech is calibrated for dark surface work. The blues and teals in the collection sit at lightness levels that pop clearly against a very dark background without blooming on OLED. Pair the collection's lighter values as interactive or highlight tokens and the darker values as surface or border tokens, and you have a functional dark mode skeleton in a few decisions rather than from scratch.",
      },
    ],
    links: [
      { label: "Open Dark Mode UI Kit", href: "/packs/dark-mode-ui-kit/" },
      { label: "Open Nocturne Tech", href: "/collections/nocturne-tech/" },
      { label: "Read dark mode palette guide", href: "/guides/dark-mode-color-palette/" },
    ],
  },
  {
    category: "Accessibility",
    slug: "accessible-color-palette",
    title: "Accessible Color Palette Ideas That Pass WCAG Without Looking Clinical",
    summary:
      "How to build an accessible color palette that meets WCAG contrast requirements while still feeling warm, branded, and intentional rather than defaulting to black text on white.",
    eyebrow: "Accessibility Guide",
    priority: 92,
    searchIntent: "accessible color palette",
    featuredCollectionId: "editorial-warmth",
    featuredPackId: "brand-starter-kit",
    tags: ["Accessibility", "Contrast", "WCAG"],
    highlights: [
      "WCAG compliance is a contrast ratio problem, not a color restriction — most hues can work if lightness is managed.",
      "Accessible palettes become easier to build when you test pairings early instead of remediating after launch.",
      "ColorArchive's contrast checker lets you validate any two archive colors against AA and AAA thresholds instantly.",
    ],
    sections: [
      {
        heading: "Accessibility is a lightness discipline, not a hue limitation",
        body:
          "The most common misconception about accessible palettes is that they require dull or desaturated colors. In practice, WCAG contrast ratios depend almost entirely on the lightness difference between foreground and background. A vivid teal on a sufficiently dark surface can pass AAA. A muted sage on a slightly lighter sage will fail AA. Once you internalize that contrast is about luminance distance, palette building becomes a solvable math problem rather than a creative compromise.",
      },
      {
        heading: "Test pairings before you commit to a system",
        body:
          "Many teams build their palette in isolation, approve it visually, and then discover during development that half their text-on-surface pairings fail contrast checks. The fix is simple: test every intended pairing before locking the palette. ColorArchive's contrast checker accepts any two colors and returns the exact ratio against AA and AAA thresholds for both normal and large text. Running those checks during the palette phase saves weeks of remediation later.",
      },
      {
        heading: "Warm palettes can be fully accessible",
        body:
          "Editorial Warmth proves that a warm, human-feeling palette can meet accessibility standards without looking sterile. The key is anchoring body text and interactive elements to high-contrast pairings while reserving lower-contrast combinations for decorative or non-essential elements. The Brand Starter Kit reinforces this by assigning role-based tokens that separate must-be-accessible pairings from ambient surface treatments, so the team does not have to guess which combinations need to pass.",
      },
    ],
    links: [
      { label: "Open contrast checker", href: "/contrast/" },
      { label: "Open Editorial Warmth", href: "/collections/editorial-warmth/" },
      { label: "Open Brand Starter Kit", href: "/packs/brand-starter-kit/" },
    ],
  },
  {
    category: "Content & Social",
    slug: "color-palette-for-social-media",
    title: "Color Palette for Social Media That Stays Recognizable Across Platforms",
    summary:
      "A practical guide to choosing a social media color palette that holds up across Instagram carousels, TikTok overlays, YouTube thumbnails, and Stories without fragmenting into platform-specific chaos.",
    eyebrow: "Social Media Guide",
    priority: 78,
    searchIntent: "color palette for social media",
    featuredCollectionId: "candy-gradient",
    featuredPackId: "content-creator-bundle",
    tags: ["Social media", "Content", "Creator"],
    highlights: [
      "Social palettes need to survive compression, small thumbnails, and wildly different feed backgrounds.",
      "Consistency across platforms matters more than perfection on any single one.",
      "The Content Creator Bundle includes export formats designed for fast social asset production.",
    ],
    sections: [
      {
        heading: "Social color has to survive the feed",
        body:
          "A color palette for social media faces constraints that brand guidelines rarely anticipate. Instagram compresses images and shifts color slightly. TikTok overlays white text on everything. YouTube thumbnails render at tiny sizes next to dozens of competitors. Your palette needs enough contrast and saturation to remain identifiable after compression and scaling. That usually means fewer colors with more deliberate lightness separation rather than a wide, subtle range that flattens to mush at 120 pixels wide.",
      },
      {
        heading: "Pick a recognizable lane and stay in it",
        body:
          "The creators who build the strongest visual brands on social media tend to own one clear color lane rather than rotating palettes by post. Candy Gradient works well for social because the high-chroma, warm-to-cool transitions read instantly even at thumbnail scale. Whether you lean into that direction or something more restrained, the discipline is the same: choose a palette that is identifiable in the first half-second of scrolling, then apply it consistently across every platform rather than reinventing per channel.",
      },
      {
        heading: "Export once, use everywhere",
        body:
          "Social content production is fast, which means any friction in finding or applying colors slows down output. The Content Creator Bundle is built for this workflow. It includes HEX, RGB, and HSL exports alongside Figma and Canva-ready formats so the same palette travels from thumbnail design to story templates to video overlays without manual conversion. That consistency is what makes a social color system feel professional instead of improvised.",
      },
    ],
    links: [
      { label: "Open Content Creator Bundle", href: "/packs/content-creator-bundle/" },
      { label: "Open Candy Gradient", href: "/collections/candy-gradient/" },
      { label: "Get the Free Sample Pack", href: "/free-pack/" },
    ],
  },
  {
    category: "Aesthetic & Mood",
    slug: "earth-tone-color-palette",
    title: "Earth Tone Color Palette Ideas for Warm, Grounded Design Work",
    summary:
      "How to build an earth tone palette that feels natural and grounded without turning muddy, and how to pair warm neutrals with enough range for real design systems.",
    eyebrow: "Earth Tones Guide",
    priority: 85,
    searchIntent: "earth tone color palette",
    featuredCollectionId: "editorial-warmth",
    featuredPackId: "brand-starter-kit",
    tags: ["Earth tones", "Warm", "Natural"],
    highlights: [
      "Earth tones work best when they reference real materials — clay, sand, olive, walnut — not just desaturated brown.",
      "The biggest risk with earthy palettes is losing contrast and hierarchy as everything drifts toward the same muddy middle.",
      "Editorial Warmth anchors the earth tone lane with enough lightness range to support text, surfaces, and accents.",
    ],
    sections: [
      {
        heading: "Ground the palette in material, not just mood",
        body:
          "The strongest earth tone palettes reference tangible materials rather than abstract warmth. Terra cotta, raw linen, wet stone, dried sage, dark walnut — each carries a specific lightness and chroma range that keeps the palette from collapsing into undifferentiated brown. When you name your earth tones by material reference, you also give the team a shared language that survives handoff better than hex codes alone. That specificity is what separates a considered earthy system from a muddy one.",
      },
      {
        heading: "Protect the hierarchy with deliberate lightness steps",
        body:
          "Earth tones tend to cluster in the mid-lightness range, which creates a hierarchy problem. If your background, card surface, and body text all sit between 40 and 60 percent lightness, the interface becomes hard to parse. Editorial Warmth handles this by including both very light warm values for surfaces and deep grounding darks for text and anchors. That spread is what keeps the earthy feel alive without sacrificing readability or visual structure across real layouts.",
      },
      {
        heading: "Pair earth tones with a structured system",
        body:
          "An earth tone palette on its own can feel directionless once it has to power buttons, alerts, disabled states, and multiple surface levels. The Brand Starter Kit helps here by mapping warm, grounded colors into role-based tokens. Instead of guessing which terra cotta works for a CTA versus a decorative border, the kit assigns those roles explicitly. That structure turns an aesthetic preference into something a product team can actually ship without debating every component.",
      },
    ],
    links: [
      { label: "Open Editorial Warmth", href: "/collections/editorial-warmth/" },
      { label: "Open Brand Starter Kit", href: "/packs/brand-starter-kit/" },
      { label: "Search warm colors", href: "/search?family=orange" },
    ],
  },
  {
    category: "Web Design",
    slug: "color-palette-for-portfolio-website",
    title: "Color Palette for a Portfolio Website That Lets the Work Lead",
    summary:
      "How to choose a portfolio website color palette that supports your work without competing with it — including when to go neutral, when to add one accent, and how to keep it cohesive.",
    eyebrow: "Portfolio Guide",
    priority: 80,
    searchIntent: "color palette for portfolio website",
    featuredCollectionId: "quiet-luxury",
    featuredPackId: "palette-pack-vol-1",
    tags: ["Portfolio", "Web Design", "Minimal"],
    highlights: [
      "A portfolio palette should frame work, not fight it — restraint is usually the smarter move.",
      "One accent color with a disciplined neutral system covers more portfolio types than a multi-hue palette.",
      "Palette Pack Vol. 1 gives a coherent starting system that can be tuned to match any portfolio direction.",
    ],
    sections: [
      {
        heading: "The portfolio should be quieter than the work",
        body:
          "A portfolio website exists to present work, which means the color system needs to recede. The most common mistake is building a portfolio palette that competes with the projects it displays. Photography, UI screenshots, illustrations, and brand work all bring their own color. If the site wrapper is too loud, the visitor sees palette conflicts instead of a curated body of work. Start with a surface system that stays neutral enough to frame anything, then add personality through one controlled accent.",
      },
      {
        heading: "Use restraint as a signal of confidence",
        body:
          "Quiet Luxury is a strong reference for portfolio work because it communicates taste through restraint rather than decoration. The warm neutrals, soft contrast, and grounded darks create a surface that feels intentional without pulling attention from project imagery. Designers often worry that a restrained palette will feel boring, but in a portfolio context the opposite is true — visual quiet signals confidence and lets the viewer focus on craft rather than chrome.",
      },
      {
        heading: "Start from a system, then subtract",
        body:
          "Building a portfolio palette from scratch is slower than starting from an existing coherent system and removing what you do not need. Palette Pack Vol. 1 is useful here because it provides a complete set of roles and pairings. From that base, you can strip the palette down to a surface tone, a text color, one accent, and a hover state. That subtraction process is faster and more reliable than assembling colors one at a time and hoping they feel unified.",
      },
    ],
    links: [
      { label: "Open Palette Pack Vol. 1", href: "/packs/palette-pack-vol-1/" },
      { label: "Open Quiet Luxury", href: "/collections/quiet-luxury/" },
      { label: "Browse all collections", href: "/collections/" },
    ],
  },
  {
    category: "Brand & Marketing",
    slug: "pastel-color-palette-for-branding",
    title: "Pastel Color Palette for Branding That Feels Modern, Not Childish",
    summary:
      "How to use pastel colors in brand work without drifting into baby-shower territory — including how to anchor soft hues with structure, contrast, and intentional pairings.",
    eyebrow: "Pastel Branding Guide",
    priority: 82,
    searchIntent: "pastel color palette for branding",
    featuredCollectionId: "candy-gradient",
    featuredPackId: "seasonal-spring-2026",
    tags: ["Pastel", "Brand", "Modern"],
    highlights: [
      "Pastels read as modern when paired with dark anchors and confident typography — softness needs a frame.",
      "The risk is not the colors themselves but the lack of contrast and hierarchy around them.",
      "Seasonal Spring 2026 delivers a curated pastel system with enough range for brand applications beyond a single mood board.",
    ],
    sections: [
      {
        heading: "Pastels need a structural anchor to feel professional",
        body:
          "Soft lavender, mint, blush, and butter yellow can all work in brand contexts, but only when they are paired with elements that provide visual authority. A near-black or deep charcoal for text, confident type sizing, and generous white space are what let pastels read as contemporary rather than juvenile. Without those anchors, soft palettes collapse into vagueness. The strongest pastel brands treat the soft hues as surface and accent colors while letting dark text and clear hierarchy do the structural work.",
      },
      {
        heading: "Choose a pastel lane with enough internal range",
        body:
          "A common pastel mistake is selecting five colors that all sit at the same lightness and saturation level. The result feels flat because nothing separates foreground from background. Candy Gradient is a useful reference because it shows how pastels can maintain variety through hue shifts and subtle chroma differences even when the overall tone stays soft. Seasonal Spring 2026 builds on that approach with a curated set that includes lighter and slightly deeper variants, giving the brand enough range to handle cards, backgrounds, CTAs, and secondary elements without everything blending together.",
      },
      {
        heading: "From pastel mood board to usable brand system",
        body:
          "The gap between a pastel mood board and a working brand palette is usually structure. Mood boards collect inspiration; brand systems assign roles. Seasonal Spring 2026 bridges that gap by packaging pastel-range colors into export-ready formats with clear groupings. Instead of pulling colors from a Pinterest board and hoping they work together in a Figma file, the team starts with a system that already handles the pairing and contrast questions. That is what makes the pastel direction feel like a decision rather than an aesthetic accident.",
      },
    ],
    links: [
      { label: "Open Seasonal Spring 2026", href: "/packs/seasonal-spring-2026/" },
      { label: "Open Candy Gradient", href: "/collections/candy-gradient/" },
      { label: "Get the Free Sample Pack", href: "/free-pack/" },
    ],
  },
  {
    slug: "minimalist-color-palette",
    category: "Brand & Marketing",
    title: "Minimalist Color Palette: How to Do More With Less",
    summary:
      "A guide to building restrained, high-impact palettes that use fewer colors more effectively — covering tone, proportion, and how to avoid the flatness trap in minimal design.",
    eyebrow: "Minimalist Design Guide",
    priority: 83,
    searchIntent: "minimalist color palette",
    featuredCollectionId: "nordic-frost",
    featuredPackId: "brand-starter-kit",
    tags: ["Minimal", "UI", "Brand"],
    highlights: [
      "Minimalism is not about using gray everywhere — it is about using each color with clear intent and generous white space.",
      "Nordic Frost gives you a cool, restrained five-color system purpose-built for focused, uncluttered interfaces.",
      "The danger in minimal palettes is monotony — a single accent color with strong lightness contrast solves it.",
    ],
    sections: [
      {
        heading: "Minimalism is a discipline of subtraction, not neutrality",
        body:
          "The most common mistake in minimal palettes is defaulting to gray on gray on white and calling the result clean. True minimalism means that every color in the system has a defined purpose and enough contrast to carry it. Nordic Frost illustrates this well: ice blue, pale grey, soft lavender, and cobalt give the interface enough temperature variation to feel considered rather than inert. The colors are quiet, but they are not featureless. Each hue earns its place by solving a specific role — surface, text, border, accent, or state.",
      },
      {
        heading: "Proportion and white space are the real palette tools",
        body:
          "In minimal design, the amount of white space surrounding a color matters as much as the color itself. A single saturated accent on a pale background reads as intentional and precise. The same accent used on every button, badge, and link reads as noise. The rule that holds across most minimal systems is to reserve your highest-chroma color for one primary action and let the rest of the interface live in low-chroma territory. Brand Starter Kit includes a structured version of this approach: a primary accent, a range of functional neutrals, and clear export-ready groupings that make the proportion decisions upfront.",
      },
      {
        heading: "How to avoid the flatness trap",
        body:
          "When a minimal palette uses colors that are too similar in lightness, the result is flat rather than clean. The fix is to introduce enough lightness contrast between levels of the visual hierarchy even if all the hues stay muted. In Nordic Frost, the cobalt-bloom-soft sits noticeably darker than the azure-mist-muted background, which keeps the contrast legible without breaking the minimal register. When building your own minimal system, plot your palette colors on a lightness scale before finalizing — if three or more swatches cluster at the same value, add contrast by shifting one step darker or lighter rather than introducing a new hue.",
      },
    ],
    links: [
      { label: "Open Nordic Frost", href: "/collections/nordic-frost/" },
      { label: "Open Brand Starter Kit", href: "/packs/brand-starter-kit/" },
      { label: "Get the Free Sample Pack", href: "/free-pack/" },
    ],
  },
  {
    slug: "retro-color-palette",
    category: "Brand & Marketing",
    title: "Retro Color Palette: Warm, Worn, and Deliberately Off",
    summary:
      "How to build retro and vintage-inspired palettes that feel authentic rather than costumey — covering the hue shifts, muting techniques, and structural anchors that make retro work.",
    eyebrow: "Retro Design Guide",
    priority: 81,
    searchIntent: "retro color palette",
    featuredCollectionId: "editorial-warmth",
    featuredPackId: "palette-pack-vol-1",
    tags: ["Retro", "Vintage", "Warm"],
    highlights: [
      "Retro palettes work because of how colors age — hues shift warm, saturation drops, and darks go brown rather than black.",
      "Editorial Warmth captures that paper-and-ink register without leaning into parody.",
      "The key to retro authenticity is muting without muddying — keep hues distinct even as they soften.",
    ],
    sections: [
      {
        heading: "Why retro colors look the way they do",
        body:
          "Vintage print materials, old film photography, and aged paper share a common color signature: everything has shifted slightly warm, blacks have softened to brown-black or dark sienna, and saturated colors have faded toward their muted cousins. This happens physically because pigments and film emulsions degrade in predictable ways. When designers recreate this effect, the goal is to simulate that same optical aging. Editorial Warmth does this by anchoring the palette in apricot, amber, garnet, and muted olive — tones that sit in the warm-muted register where most printed materials land after a decade or two on a shelf.",
      },
      {
        heading: "Muting without muddying",
        body:
          "The technical challenge in retro palettes is pulling saturation down without making every color look the same. Muddy palettes happen when you desaturate indiscriminately — every hue collapses toward the same warm beige. The better approach is to reduce chroma selectively while keeping each color's hue identity clear. Amber should still read unmistakably as amber; garnet as garnet. Palette Pack Vol. 1 includes a curated set of warm-muted colors that demonstrate this balance: they are distinctly different hues that happen to share the same worn, analog quality. That shared quality is the system; the distinct hues are the variety.",
      },
      {
        heading: "Using retro colors in modern interfaces",
        body:
          "Retro palettes do not have to live only in print-inspired layouts. They translate well to modern web contexts when you pair the warm-muted hues with clean typography and generous spacing. The warmth reads as distinctive and considered rather than antiquated when the layout around it is structured. Where retro palettes tend to fail in digital contexts is when designers push the effect too far — adding grain, worn textures, and faded colors all at once overwhelms the user. Use the palette to set a warm, editorial register and let the content carry the message. The colors should feel warm and human, not like a costume.",
      },
    ],
    links: [
      { label: "Open Editorial Warmth", href: "/collections/editorial-warmth/" },
      { label: "Open Palette Pack Vol. 1", href: "/packs/palette-pack-vol-1/" },
      { label: "Get the Free Sample Pack", href: "/free-pack/" },
    ],
  },
  {
    slug: "color-palette-for-print-design",
    category: "Brand & Marketing",
    title: "Color Palette for Print Design: What Changes When You Leave the Screen",
    summary:
      "A practical guide to choosing and preparing color palettes for print — covering gamut limitations, ink behavior, contrast adjustments, and why screen-based palettes often need recalibration.",
    eyebrow: "Print Design Color Guide",
    priority: 80,
    searchIntent: "color palette for print design",
    featuredCollectionId: "monochrome-studio",
    featuredPackId: "complete-archive",
    tags: ["Print", "Design", "Professional"],
    highlights: [
      "CMYK has a smaller gamut than RGB — vivid screen colors often need to be adjusted before they print correctly.",
      "Monochrome Studio shows how neutral palettes stay stable across print and screen without gamut conversion loss.",
      "High contrast and clear tonal separation matter more in print because you cannot use hover states or animation to communicate hierarchy.",
    ],
    sections: [
      {
        heading: "The gamut gap between screen and print",
        body:
          "RGB screens emit light; CMYK print absorbs it. The result is that screens can display a much wider range of saturated colors than offset or digital printing can reproduce. Vivid cyan, electric violet, and neon green look dramatically different when converted to CMYK — they lose saturation and appear flatter. Designers who build palettes entirely on screen without checking CMYK equivalents often receive proof prints that look nothing like what they approved on monitor. The safest approach is to verify your palette against CMYK gamut warnings in your color tool of choice before production, or to start with hues that are known to sit within the CMYK gamut: warm reds, warm oranges, most neutrals, and earth tones translate reliably.",
      },
      {
        heading: "Why neutrals and earth tones work well in print",
        body:
          "Palettes in the neutral, warm, and earth-tone range tend to survive the screen-to-print transition better than vivid palettes because they do not depend on gamut extremes to create their effect. Monochrome Studio is a useful reference here: its range of near-neutral tones with subtle warm and cool shifts stays stable across output methods. The palette achieves its visual interest through lightness contrast and temperature variation rather than raw saturation. In print contexts, that approach is almost always more reliable than trying to force vivid colors through CMYK conversion. Complete Archive gives designers access to a full range of ColorArchive colors and is a practical resource for testing which specific swatches from each family print well versus which need adjustment.",
      },
      {
        heading: "Contrast and hierarchy without interactivity",
        body:
          "Digital interfaces can use hover states, animation, and interactive affordances to guide users through hierarchy. Print cannot. Every level of priority — headline, subhead, body, caption, footnote — must be legible and distinguishable from the static page alone. This means print color palettes typically need stronger lightness contrast between levels than their screen equivalents. Colors that are close in value but different in hue can work as adjacent swatches in a digital interface; in print they blend into each other. When testing a palette for print, reduce the design to grayscale and check that every meaningful contrast relationship still holds. If hierarchy disappears in grayscale, the palette needs adjustment before going to production.",
      },
    ],
    links: [
      { label: "Open Monochrome Studio", href: "/collections/monochrome-studio/" },
      { label: "Open Complete Archive", href: "/packs/complete-archive/" },
      { label: "Get the Free Sample Pack", href: "/free-pack/" },
    ],
  },
  {
    category: "Events & Lifestyle",
    slug: "wedding-color-palette",
    title: "Wedding Color Palette Ideas That Stay Timeless After the Day Itself",
    summary:
      "Wedding color palettes need to work across florals, stationery, attire, lighting, and photography — often simultaneously. This guide covers palette structures that hold together across every medium, from save-the-date printing to venue décor.",
    eyebrow: "Events Guide",
    priority: 72,
    searchIntent: "wedding color palette ideas",
    featuredCollectionId: "orchid-bloom",
    featuredPackId: "brand-starter-kit",
    tags: ["Events", "Palette", "Print"],
    highlights: [
      "Wedding palettes function across more substrates than almost any other design context — paper, fabric, flowers, candles, lighting gels, and digital screens all interpret color differently.",
      "The most durable wedding palettes anchor around two to three neutrals and use one or two accent tones. Broader palettes tend to fragment across mediums.",
      "Orchid Bloom and soft blush/ivory pairings are reliably safe in mixed lighting — candlelight and daylight both read them as warm and flattering.",
    ],
    sections: [
      {
        heading: "Why wedding palettes need different rules",
        body:
          "A brand palette usually appears on one or two consistent substrates — screens and print collateral. A wedding palette appears on dozens: cotton napkins, silk ribbons, floral arrangements, paper invitations, digital RSVPs, venue draping, cake decoration, and photography editing. Each substrate interprets color differently. Flowers are organic and vary by season. Fabric dyes shift under different light sources. Paper printing has CMYK gamut constraints. This is why wedding palettes built primarily around vivid, heavily saturated colors tend to fragment — the exact hue rarely survives the translation from screen reference to real-world substrate. Palettes built around soft neutrals and gently saturated accents maintain cohesion better because their visual character depends on warmth and tone rather than specific hue values.",
      },
      {
        heading: "Choosing anchor neutrals first",
        body:
          "The most reliable approach is to choose two anchor neutrals before selecting accent colors. For warm weddings, ivory and warm linen work well — they photograph beautifully in natural light, work in candlelight, and translate to fabric and paper without surprises. For cooler, more modern settings, soft gray and dusty white provide a cleaner base. Once the neutrals are established, accent colors can be chosen knowing they will appear against a predictable ground. A blush pink that reads muddy against pure white may read beautifully against ivory. The Orchid Bloom collection demonstrates this approach: soft blush, dusty rose, lavender, and warm white are all anchored around a common warmth and lightness level, making them naturally cohesive across any substrate.",
      },
      {
        heading: "Photography and color grading considerations",
        body:
          "Wedding photography almost always involves some degree of color grading — adjusting warmth, tones, and saturation in post-production to create a consistent look across thousands of images taken in varied lighting conditions. A palette that is easy to grade toward will produce more consistent photo delivery than one that fights the camera's white balance. Warm, muted palettes photograph consistently across both natural and artificial light. Highly saturated palettes, especially those with vivid cyans or magentas, can shift dramatically between different light sources and are harder to normalize in editing. When selecting a wedding palette, it is worth asking whether the hues will look similar in morning ceremony light, afternoon portraits, and evening reception light — colors with a clear warmth or coolness that matches the expected lighting will perform most reliably.",
      },
    ],
    links: [
      { label: "Open Orchid Bloom collection", href: "/collections/orchid-bloom/" },
      { label: "Browse Brand Starter Kit", href: "/packs/brand-starter-kit/" },
      { label: "Browse all collections", href: "/collections/" },
    ],
  },
  {
    category: "Photography & Film",
    slug: "color-grading-palette",
    title: "Color Grading Palettes for Photography and Video: How Archive Colors Map to Grade Looks",
    summary:
      "Color grading in photography and video is fundamentally a palette operation — the grade establishes a dominant hue/tone balance that reads as a unified visual world. Understanding how grade looks map to palette structures helps designers and photographers align brand photography with product color systems.",
    eyebrow: "Photography Guide",
    priority: 68,
    searchIntent: "color grading palette photography",
    featuredCollectionId: "editorial-warmth",
    featuredPackId: "content-creator-bundle",
    tags: ["Photography", "Palette", "Brand"],
    highlights: [
      "A color grade is a palette operation applied to time-based media — it sets the dominant hue, establishes shadow and highlight temperatures, and constrains the saturation envelope of the entire piece.",
      "The most recognizable film and photography looks — warm golden-hour, cool cinematic, muted film, high-contrast editorial — each have a specific palette signature that can be reverse-engineered into discrete color swatches.",
      "Aligning product photography color grades with the design system palette reduces corrections between photo assets and UI components — the same warmth that reads well in shots also reads well in the interface.",
    ],
    sections: [
      {
        heading: "What color grading actually does to a palette",
        body:
          "A color grade applies a controlled shift to the entire tonal range of an image. The most common moves are: warming the highlights (shifting yellows and whites toward amber), cooling the shadows (shifting blacks and dark midtones toward blue or teal), and controlling midtone saturation. The sum of these shifts defines the perceptual character of the image — a warm-highlight, cool-shadow grade produces the teal-orange look common in cinematic work. A warm-through-all-tones grade produces the golden-hour look common in lifestyle photography. A desaturated, cooled grade produces the muted editorial look. Each look corresponds to a specific palette behavior: warm highlights map to amber and honey tones, cool shadows map to deep teal and cobalt, desaturated midtones map to muted mid-range hues.",
      },
      {
        heading: "Matching brand photography grades to design system colors",
        body:
          "Brand consistency across photography and digital product is easier to achieve when the grade look and the design system palette share a common temperature and saturation target. If the design system uses a warm amber as its primary brand color, photography graded toward warm amber highlights will feel brand-consistent without additional effort. If the design system is cool and blue-toned but the photography is graded warm, the two will conflict in any layout that combines photos with UI components. The Editorial Warmth collection is designed for this use case — its amber, coral, and warm neutral tones translate directly to the warm-grade photography style common in food, lifestyle, and artisan brand photography. Using these colors in both the UI and the photography brief creates a closed loop that makes every touchpoint feel unified.",
      },
      {
        heading: "Content creator palettes and social media consistency",
        body:
          "Social media content creators face a version of the brand photography problem at smaller scale: their feed needs to read as a unified visual world across many individual posts, each shot in different conditions. A consistent color grade is the most efficient way to achieve this — once a grade preset is established that matches the target palette, every post run through it will share the same temperature and saturation character. The Content Creator Bundle is designed for this workflow: its included palettes and token exports correspond directly to grade-ready warm and cool palette signatures. The bundle includes CSS variables and Figma tokens, and the palette structure maps to grade parameters — highlight temperature, shadow temperature, and midtone saturation are all derivable from the included color values.",
      },
    ],
    links: [
      { label: "Open Editorial Warmth collection", href: "/collections/editorial-warmth/" },
      { label: "Explore Content Creator Bundle", href: "/packs/content-creator-bundle/" },
      { label: "Browse all packs", href: "/packs/" },
    ],
  },
  {
    category: "Home & Lifestyle",
    slug: "interior-design-color-palette",
    title: "Interior Design Color Palette: Choosing Colors That Work Across Light, Materials, and Scale",
    summary:
      "Interior color palettes face constraints that digital palettes do not: natural light shifts throughout the day, materials absorb and reflect differently, and what reads well at swatch scale can disappear or overwhelm at room scale. This guide covers how to select and structure palettes for interior work.",
    eyebrow: "Interior Design Guide",
    priority: 67,
    searchIntent: "interior design color palette",
    featuredCollectionId: "terracotta-loft",
    featuredPackId: "brand-starter-kit",
    tags: ["Interior", "Home", "Warm"],
    highlights: [
      "Light changes throughout the day — a color that reads warm at noon may shift cool by late afternoon in north-facing rooms.",
      "Terracotta Loft's fired clay and warm stucco tones sit in the range that holds well under both natural and artificial light.",
      "The most durable interior palettes anchor around two neutrals and use saturated colors as accents on smaller surfaces.",
    ],
    sections: [
      {
        heading: "How light changes the palette throughout the day",
        body:
          "The dominant challenge in interior color work is that the light source changes continuously. A north-facing room receives cool, indirect daylight that can push warm paint colors into muddy territory. A south-facing room receives warm afternoon light that can make pale yellows disappear entirely. West-facing rooms receive golden-hour warmth that transforms even cool colors into something glowing by evening. This means interior palettes cannot be evaluated in one lighting condition — the same paint swatch needs to be assessed at different times of day before committing. Palettes built around warm earth tones and fired clay colors, like those in Terracotta Loft, perform more consistently across light changes because they are designed to work with warmth rather than fight it. When daylight shifts cool, the warmth in the paint acts as a correction. When daylight shifts warm, the earthiness deepens rather than washing out.",
      },
      {
        heading: "Scale effects: swatches versus rooms",
        body:
          "Color perception is nonlinear at scale. A paint sample that looks pleasant at 10 cm × 10 cm can feel overwhelming when applied to four walls of a room. This happens because large fields of color appear more saturated and more intense than small samples of the same hue. Interior designers account for this by choosing colors that appear slightly less saturated than the desired result at room scale — the visual system will amplify the saturation in the final environment. In practice, this means choosing muted, toned-down versions of colors rather than pure or vivid options for large wall surfaces. Terracotta Loft's palette demonstrates this principle: the coral velvet and ember dusk tones are warm and rich at swatch scale, but because they are already in the muted register, they will read as warm and grounded rather than loud at room scale.",
      },
      {
        heading: "Building an interior palette structure",
        body:
          "A well-structured interior palette follows a similar logic to a design system: base surfaces, mid-range support tones, and accent colors each play different roles. In a room, the base surfaces are typically the largest expanses — walls and ceilings. These benefit from lighter, quieter versions of the palette hue. Mid-range support tones appear on upholstery, larger furniture, and rugs — the surfaces that define character without dominating. Accent colors appear on cushions, ceramics, art, and small decorative objects. The ratio is roughly 60 percent base, 30 percent support, 10 percent accent. Palettes like Terracotta Loft are built for exactly this structure: the warm whisper and muted honey tones work as base surfaces, the coral velvet serves as a support upholstery register, and the amber tone and ember dusk add depth as accent-scale materials.",
      },
    ],
    links: [
      { label: "Open Terracotta Loft", href: "/collections/terracotta-loft/" },
      { label: "Open Brand Starter Kit", href: "/packs/brand-starter-kit/" },
      { label: "Browse all collections", href: "/collections/" },
    ],
  },
  {
    category: "Photography & Film",
    slug: "photography-color-palette",
    title: "Photography Color Palette: Building a Consistent Visual Look Across Your Work",
    summary:
      "Photographers who shoot a consistent look — the same warmth, tonal signature, and saturation character across images — build more recognizable bodies of work than those who vary the grade from shoot to shoot. This guide explains how to define, reverse-engineer, and apply a consistent color palette to photography.",
    eyebrow: "Photography Color Guide",
    priority: 66,
    searchIntent: "photography color palette",
    featuredCollectionId: "sunset-boulevard",
    featuredPackId: "content-creator-bundle",
    tags: ["Photography", "Brand", "Warm"],
    highlights: [
      "A consistent photography palette is defined by three variables: highlight temperature, shadow temperature, and midtone saturation.",
      "Sunset Boulevard's coral-to-garnet range maps directly to the golden-hour warm-highlight grade signature common in lifestyle and portrait photography.",
      "The Content Creator Bundle includes palette boards and token exports that can be translated into Lightroom presets and editing profiles.",
    ],
    sections: [
      {
        heading: "Defining your photographic palette in three variables",
        body:
          "Most photographers approach consistency through preset development — applying a fixed Lightroom or Capture One profile to every image. But a preset is really just an encoded palette decision: it defines how the software will render highlights, shadows, and midtones. Understanding the underlying palette makes it easier to refine presets and communicate the look to editors, clients, or collaborators. The three core variables are: highlight temperature (how warm or cool the brightest areas of the image are), shadow temperature (how warm or cool the darkest areas are), and midtone saturation (how rich or muted the mid-range colors appear). A warm-highlight, cool-shadow, moderate-saturation signature produces the teal-orange cinematic look. A warm-through-all-tones, slightly desaturated signature produces the golden-hour lifestyle look. Sunset Boulevard captures the warm-lifestyle signature: coral highlights, amber warmth in the midtones, and a rose-garnet depth in the shadows.",
      },
      {
        heading: "Reverse-engineering your favorite photograph's palette",
        body:
          "When a photographer wants to replicate a specific look, the most efficient approach is to use eyedropper sampling to extract the dominant hue values from representative areas of the image: the brightest highlights, the deepest shadows, a mid-gray surface, and a saturated foreground element. These four samples will reveal the palette signature of the grade. Warm highlights with cool shadows are the teal-orange signature. Warm highlights with warm shadows are the golden-hour signature. Cool throughout with high saturation is the fashion-editorial signature. Once the signature is identified, it can be replicated with reference swatches in any grading tool. ColorArchive colors can be used as target references during the grading process — the archive's hue names make it easy to communicate the target grade to an editor without requiring screen reference images.",
      },
      {
        heading: "Using palette boards to maintain consistency across series",
        body:
          "For photographers working in series — editorial spreads, brand campaigns, or ongoing content programs — palette boards are a practical tool for maintaining visual consistency across shoots that may happen weeks apart with different conditions. A palette board for a campaign defines the highlight target, shadow target, accent color, and neutral base as specific swatches. Every image in the series is graded to match those swatches rather than graded independently. This prevents the visual drift that happens when editors adjust images by eye across different sessions. The Content Creator Bundle is designed for this workflow: its palette boards, CSS variables, and Figma tokens can be used directly in both the design system and the photography brief, creating a single color language across all content surfaces.",
      },
    ],
    links: [
      { label: "Open Sunset Boulevard", href: "/collections/sunset-boulevard/" },
      { label: "Open Content Creator Bundle", href: "/packs/content-creator-bundle/" },
      { label: "Browse all collections", href: "/collections/" },
    ],
  },
  {
    category: "Interface Systems",
    slug: "monochromatic-color-palette",
    title: "Monochromatic Color Palette: The Case for Staying in One Hue",
    summary:
      "A monochromatic palette uses a single hue at multiple lightness and saturation levels to build hierarchy, contrast, and depth without introducing color variety. When executed well, it produces interfaces that feel cohesive, sophisticated, and highly legible. When executed poorly, it produces flat, undifferentiated surfaces with no clear hierarchy.",
    eyebrow: "Color Theory Guide",
    priority: 65,
    searchIntent: "monochromatic color palette",
    featuredCollectionId: "monochrome-studio",
    featuredPackId: "palette-pack-vol-1",
    tags: ["Minimal", "Systems", "UI"],
    highlights: [
      "Monochromatic palettes succeed by maximizing lightness contrast within a single hue — not by adding more colors.",
      "Monochrome Studio spans pale mist to deep ink across a single warm-neutral axis, showing how much hierarchy is achievable in one hue lane.",
      "Temperature shifts — slightly warmer or cooler — can be used as a subtle second axis without breaking the monochromatic constraint.",
    ],
    sections: [
      {
        heading: "What makes a monochromatic palette actually work",
        body:
          "The most common failure in monochromatic design is insufficient lightness span. Designers pick three or four shades that are too similar in value and end up with an interface where nothing has clear visual weight — the primary button looks the same as the secondary one, the card background blends into the page background, and interactive elements are indistinguishable from static ones. A working monochromatic palette needs to span at minimum 40-50 points of lightness (on a 0-100 scale) between its lightest and darkest tones. Monochrome Studio is built around this principle: each step in the palette is meaningfully different in lightness from the adjacent ones, which creates the hierarchy needed to build full interfaces. The palette's subtle warm and cool undertone shifts add a second dimension of differentiation without introducing new hues.",
      },
      {
        heading: "Using temperature as a secondary tool",
        body:
          "Strictly identical hue monochrome palettes can feel flat because the eye has no chromatic variation to create visual interest. One effective technique is to introduce micro-temperature shifts — making shadows slightly cooler and highlights slightly warmer (or the reverse) without changing the dominant hue identity. This is the same technique used in quality printing and cinema color grading, where pure achromatic grays are almost never used because they feel lifeless compared to grays with a subtle warm or cool cast. Monochrome Studio uses this approach: across its range from pale mist to deep ink, the underlying tones shift very subtly between warm and cool, creating the appearance of depth without breaking the monochromatic character. The effect is most visible when the palette is used in a layout with both light and dark surfaces side by side.",
      },
      {
        heading: "When to use monochromatic and when to add color",
        body:
          "Monochromatic palettes are strongest when the product's content is the primary source of visual variety — journalism, photography portfolios, data dashboards, and reading interfaces all benefit from a neutral, non-competing palette. The single-hue constraint ensures the interface never visually competes with the content. Monochromatic approaches are weaker for action-heavy applications — consumer apps with many competing call-to-action elements, social platforms where content must stand out — because a single hue cannot carry enough differentiation signals on its own. In those contexts, a constrained multi-hue palette (two or three hues with intentional roles) performs better. Palette Pack Vol. 1's curated groupings demonstrate both approaches: some groupings are near-monochromatic anchored in warm neutrals; others use a two or three hue structure with clearly differentiated roles.",
      },
    ],
    links: [
      { label: "Open Monochrome Studio", href: "/collections/monochrome-studio/" },
      { label: "Open Palette Pack Vol. 1", href: "/packs/palette-pack-vol-1/" },
      { label: "Browse all collections", href: "/collections/" },
    ],
  },
  {
    category: "Interface Systems",
    slug: "game-ui-color-palette",
    title: "Game UI Color Palette: Designing for High Contrast, Fast Reading, and Dark Environments",
    summary:
      "Game interfaces are read at speed, often in suboptimal lighting conditions, on screens with widely varying calibration, and by users whose attention is divided between UI and gameplay. The color constraints this creates are different from standard product design — contrast requirements are higher, palette saturation tends toward vivid, and dark base surfaces are the dominant pattern.",
    eyebrow: "Game Design Guide",
    priority: 63,
    searchIntent: "game UI color palette",
    featuredCollectionId: "neon-after-dark",
    featuredPackId: "dark-mode-ui-kit",
    tags: ["Gaming", "Dark mode", "UI"],
    highlights: [
      "Game UIs are typically read in 200-400ms — contrast ratios for interactive elements need to be significantly higher than standard WCAG AA minimums.",
      "Neon After Dark's vivid accent system is designed exactly for this use case: electric contrast against deep dark bases without losing legibility.",
      "Dark bases dominate game UI because they reduce eye strain during extended sessions and improve perceived color vibrancy for in-game content.",
    ],
    sections: [
      {
        heading: "Why game UI contrast requirements are higher than standard",
        body:
          "Standard WCAG AA contrast requirements (4.5:1 for body text, 3:1 for large text and UI components) are calibrated for reading environments where users are paying full attention and have time to re-read if something is unclear. Game UIs do not operate in this environment. Players are tracking multiple things simultaneously — game state, enemy positions, inventory, health — and UI elements need to be readable in peripheral vision and in under half a second of attention. Research on gaming ergonomics suggests that interactive elements in game UIs benefit from contrast ratios of 7:1 or higher for critical information, and that color hue differentiation (not just lightness contrast) plays a larger role than in standard interface design because hue is processed faster at peripheral viewing angles. Neon After Dark is built for exactly this environment: its vivid fuchsia, aqua, and lime accents provide both high lightness contrast and strong hue differentiation against the deep cobalt and violet bases.",
      },
      {
        heading: "Dark backgrounds: why they dominate game UI",
        body:
          "The dominance of dark base colors in game UI is not purely aesthetic — it solves several real usability problems. First, dark interfaces reduce the perceived brightness difference between the UI layer and the game world, which typically contains many bright, high-saturation elements. A bright white UI overlay on a dark game world creates eye strain as the player's eyes repeatedly adjust. Dark UI matches the perceptual register of the game environment. Second, dark backgrounds make vivid accent colors appear more saturated and more luminous — the same electric blue reads as significantly brighter against near-black than against mid-gray. This is useful for status indicators, health bars, and interactive button states that need to communicate urgency or availability. Third, dark UI reduces visible burn-in risk on OLED panels, which are increasingly common in gaming monitors. The Dark Mode UI Kit provides contrast-checked dark pairings that are designed to solve all three problems simultaneously.",
      },
      {
        heading: "Building a readable game UI color hierarchy",
        body:
          "Game UI color systems typically use four layers: a deep base (the darkest background), a panel layer (slightly lighter than base, for menus and cards), a muted informational layer (for secondary stats, labels, and non-critical text), and a vivid action layer (for interactive elements, alerts, health indicators). Each layer should be distinguishable at a glance without requiring close attention. The vivid action layer should use colors that do not appear anywhere else in the base layers — pure coincidental color matching between UI and game-world elements causes dangerous confusion. Neon After Dark separates these layers cleanly: deep cobalt ink and violet nocturne as the base register, vivid fuchsia and aqua as the action register, with lime as a tertiary accent for tertiary affordances. The palette's tonal separation is large enough that each layer reads distinctly even on uncalibrated displays with compressed contrast.",
      },
    ],
    links: [
      { label: "Open Neon After Dark", href: "/collections/neon-after-dark/" },
      { label: "Open Dark Mode UI Kit", href: "/packs/dark-mode-ui-kit/" },
      { label: "Browse all collections", href: "/collections/" },
    ],
  },
  {
    category: "Brand & Marketing",
    slug: "architecture-color-palette",
    title: "Architecture Color Palette: Tone Systems for Firms, Portfolios, and Built Environment Brands",
    summary:
      "Architecture practices and built environment brands face a specific color problem: the palette has to work at three scales simultaneously — digital presentation, printed material, and the physical space itself. A color system that solves this requires restraint, material awareness, and a different approach to contrast than most digital-first palettes.",
    eyebrow: "Architecture Guide",
    priority: 61,
    searchIntent: "architecture color palette",
    featuredCollectionId: "concrete-modernism",
    featuredPackId: "brand-starter-kit",
    tags: ["Architecture", "Brand", "Neutral"],
    highlights: [
      "Architecture portfolios fail when the palette competes with the photography. The strongest architecture brand palettes are near-neutral — they frame the work rather than fight it.",
      "Concrete Modernism was built specifically for this use case: a cool, restrained system from pale mist to near-black charcoal that works across digital and print without adjustment.",
      "Material references are a reliable shortcut for architectural palette selection: poured concrete, brushed steel, raw linen, and weathered oak all have precise color equivalents that carry implicit material intelligence.",
    ],
    sections: [
      {
        heading: "Why architecture palettes need to stay near-neutral",
        body:
          "The central challenge of an architecture brand palette is that the work is the star, not the brand. An architecture firm's portfolio lives or dies by the quality of its project photography — and the brand palette exists to give that photography a disciplined container. A saturated brand color in the same visual field as a complex building photograph creates competition, not context. The strongest architecture brand palettes are almost always near-neutral: warm off-whites, cool concrete grays, slate blues, and muted warm stone tones. These palettes frame work rather than fight it. Concrete Modernism was built around exactly this logic: each tone in the palette references a real material — poured concrete at the mid-range, brushed steel at the cool end, raw limestone at the light end, charcoal slate at the base.",
      },
      {
        heading: "Material references as a palette design method",
        body:
          "The most reliable shortcut for architectural palette selection is working from material references rather than abstract color theory. Every significant material in the built environment has a precise HSL equivalent: raw concrete sits around HSL(210°, 8%, 62%), structural steel around HSL(215°, 12%, 48%), aged bronze around HSL(35°, 30%, 38%), weathered corten around HSL(20°, 55%, 38%). Starting from these material references rather than from color wheels produces palettes that carry implicit credibility — they look right to an architecture audience because they reference familiar textures and surface qualities. The Brand Starter Kit provides token formats that make it easy to specify these material-referenced hues with precision for both screen and print output.",
      },
      {
        heading: "Designing across scales: digital, print, and built",
        body:
          "Architecture brand materials operate across three distinct scales: a responsive website viewed on screens with varying calibration, printed collateral on coated and uncoated stocks, and physical signage in the built space itself. A single HEX value will look different at each scale. The practical solution is over-specification: for each core brand color, define the screen value (HEX/HSL), the print value (CMYK for coated, separate CMYK for uncoated), and the closest paint or Pantone match for physical applications. The muted, near-neutral tones in Concrete Modernism are particularly forgiving of cross-medium translation: they fall outside the saturated gamut zones that typically shift unpredictably between digital and print, making consistent cross-scale application more achievable.",
      },
    ],
    links: [
      { label: "Open Concrete Modernism", href: "/collections/concrete-modernism/" },
      { label: "Explore Brand Starter Kit", href: "/packs/brand-starter-kit/" },
      { label: "Browse neutral family colors", href: "/families/neutral/" },
    ],
  },
  {
    category: "Brand & Marketing",
    slug: "startup-brand-color-palette",
    title: "Startup Brand Color Palette: Building a Color System Before You Have a Full Design Team",
    summary:
      "Early-stage startups face a specific color challenge: the palette needs to work before there is a design team, a brand guide, or a production budget. A well-chosen early palette does most of the work automatically — reducing decisions at component level and making the product feel intentional even when built quickly.",
    eyebrow: "Startup Guide",
    priority: 59,
    searchIntent: "startup brand color palette",
    featuredCollectionId: "nocturne-tech",
    featuredPackId: "brand-starter-kit",
    tags: ["Brand", "Startup", "Systems"],
    highlights: [
      "The single most important startup palette decision is: one primary, one accent, one neutral. Three colors with clear roles produce more coherent products than ten colors without them.",
      "Startups in the same category converge on the same blue. The best palette differentiation move is a deliberate category break — choosing the hue family that no major competitor occupies.",
      "A dark-first product palette (using Nocturne Tech as the base) has a structural advantage: dark surfaces tolerate inconsistency better than light surfaces, giving you more margin while the system is immature.",
    ],
    sections: [
      {
        heading: "Three colors with roles beats ten colors without them",
        body:
          "The most common startup palette mistake is addition without structure. The team picks a hero color, adds a second for variety, then keeps extending — until the product has seventeen colors and none of them have defined jobs. The minimum viable palette structure is three colors with explicit roles: a primary action color (buttons, links, CTAs), a background neutral (the surface the product lives on), and an accent (for emphasis, status, or energy). This three-color system with clear roles produces more visually coherent products than any expanded palette without role assignments. The Brand Starter Kit is built around role-first organization: each color token has an explicit purpose, which means the palette works immediately in implementation even without a detailed brand guide.",
      },
      {
        heading: "Category color differentiation as a competitive move",
        body:
          "SaaS products default to blue. Fintech products default to blue or dark teal. Healthcare startups default to blue or green. The predictability of category color conventions means that differentiation through hue selection is genuinely achievable — it requires only choosing the hue family that no category leader occupies. A cold storage startup in a blue-dominant market that chooses a warm amber primary will be immediately visually distinct. A design tool startup in the blue/purple space that chooses deep sage green will stand out at the product listing level before anyone reads the value proposition. Nocturne Tech provides a differentiated base for technical and product startups: cobalt-to-violet with vivid aqua accents, positioned away from the generic 'enterprise blue' but close enough in tone to read as credible and technical.",
      },
      {
        heading: "The dark-first advantage for resource-constrained teams",
        body:
          "Dark-mode-first palettes have a structural benefit for resource-constrained product teams: dark backgrounds are more forgiving of component-level inconsistency than light surfaces. On a light background, every shadow, border radius, and elevation inconsistency is visible. On a deep dark surface, minor inconsistencies in component treatment disappear into the base. This means a product built on a dark foundation looks more intentional during its rough early state — before all the edge cases have been styled. Nocturne Tech was designed around this property: deep cobalt and indigo surfaces that are rich enough to have character but dark enough to absorb the small mistakes that accumulate during fast iteration.",
      },
    ],
    links: [
      { label: "Open Nocturne Tech", href: "/collections/nocturne-tech/" },
      { label: "Explore Brand Starter Kit", href: "/packs/brand-starter-kit/" },
      { label: "Browse all guides", href: "/guides/" },
    ],
  },
  {
    category: "Brand & Marketing",
    slug: "fashion-color-palette",
    title: "Fashion Color Palette: Building Brand Color Systems for Apparel, Beauty, and Style Brands",
    summary:
      "Fashion and beauty brands have color requirements that differ from product and tech — the palette must work on fabric, in photography, in retail environments, and in editorial contexts simultaneously. Building a fashion color system means thinking about how color reads when it is the product, not just the brand.",
    eyebrow: "Fashion & Beauty Guide",
    priority: 57,
    searchIntent: "fashion brand color palette",
    featuredCollectionId: "blossom-season",
    featuredPackId: "content-creator-bundle",
    tags: ["Fashion", "Brand", "Editorial"],
    highlights: [
      "Fashion palettes work differently because color is the product. The brand palette has to create space for merchandise colors rather than compete with them — which means fashion brand neutrals are more important than fashion brand accents.",
      "Editorial context is everything. The same color reads as cheap or luxurious depending on the typography, photography style, and whitespace around it — not the hue itself.",
      "Seasonal palette extensions are more important in fashion than in any other category. A flexible accent system that can shift between seasonal color stories without replacing the brand base is the most valuable structural decision.",
    ],
    sections: [
      {
        heading: "Brand color that creates space for merchandise",
        body:
          "In most categories, the brand palette is the foreground and the product photography is secondary. In fashion and apparel, this relationship inverts: the product color is the primary communication, and the brand palette exists to make space for it. A brand system that uses vivid, saturated colors will fight with merchandise in every editorial layout. The strongest fashion brand neutrals are carefully chosen near-neutrals — warm off-whites, cool dove grays, pale blush or stone tones — that give merchandise photography room to read without color competition. Blossom Season demonstrates this in a spring/summer register: rose-to-plum tones at controlled saturation that can frame light-colored merchandise without fighting it.",
      },
      {
        heading: "Editorial context shapes how color reads",
        body:
          "Color perception in fashion is highly context-dependent. A specific shade of sage green reads as premium and understated in a magazine layout with clean typography and generous whitespace — and reads as cheap in a cluttered e-commerce grid with dense price tags. This means fashion brand palettes cannot be evaluated in isolation: they must be judged in the editorial context where they will actually appear. The Content Creator Bundle includes export formats designed for content production — CSS variables, HEX exports, and image-ready color swatches — which makes it easier to test palette colors in real photographic and editorial contexts before committing to brand guidelines.",
      },
      {
        heading: "Seasonal accent flexibility as a structural requirement",
        body:
          "Fashion operates on seasonal cycles in a way that most other industries do not. A fashion brand palette needs to feel current in January collections and fresh again in August lookbooks without triggering a brand redesign twice a year. The solution is a stable neutral base with a flexible accent layer: the core palette — surfaces, typography, structural brand elements — stays consistent. The seasonal accent colors shift within a defined range. Spring gets a blush or apricot accent. Fall gets a terracotta or amber accent. The brand reads as seasonally engaged without the fragmentation that comes from starting a completely new palette twice a year. Building this flexibility into the initial palette structure — deciding which accent slots are 'seasonal' versus 'permanent' — is the most important early structural decision for fashion brand color systems.",
      },
    ],
    links: [
      { label: "Open Blossom Season", href: "/collections/blossom-season/" },
      { label: "Explore Content Creator Bundle", href: "/packs/content-creator-bundle/" },
      { label: "Browse all collections", href: "/collections/" },
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
