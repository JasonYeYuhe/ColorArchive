export interface ProjectUpdateEntry {
  date: string;
  id: string;
  summary: string;
  title: string;
  bullets: string[];
}

export const projectUpdates: ProjectUpdateEntry[] = [
  {
    id: "2026-03-18-trust-layer",
    date: "2026-03-18",
    title: "Added trust and product-proof layers",
    summary:
      "Collection detail pages, free sample pack, and clearer upgrade paths are now part of the static product surface.",
    bullets: [
      "Added editorial collection detail pages.",
      "Added a free sample pack landing page based on real preview assets.",
      "Strengthened support and monetization routes with clearer free-to-paid framing.",
    ],
  },
  {
    id: "2026-03-18-local-archive",
    date: "2026-03-18",
    title: "Strengthened local archive workflows",
    summary:
      "Recent browsing, favorites export, and empty-state recovery now make the archive easier to resume and reuse without accounts.",
    bullets: [
      "Added Recent trail and Favorites hub on the homepage.",
      "Added JSON export for Recent and Favorites.",
      "Added stronger recovery actions for empty search and filter states.",
    ],
  },
  {
    id: "2026-03-18-search-spectrum",
    date: "2026-03-18",
    title: "Expanded exploration routes",
    summary:
      "The archive now supports dedicated search, full-spectrum browsing, random discovery, and word-to-color generation.",
    bullets: [
      "Added dedicated search with shareable URL state.",
      "Added All Colors, Spectrum, and Surprise routes.",
      "Added Word → Color as a local-only generator.",
    ],
  },
] as const;
