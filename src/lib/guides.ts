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
