export interface LicenseTier {
  id: "personal" | "commercial";
  label: string;
  priceNote: string;
  summary: string;
  rights: string[];
  support: string[];
}

export const licenseTiers: LicenseTier[] = [
  {
    id: "personal",
    label: "Personal",
    priceNote: "Included by default today",
    summary: "Best for solo exploration, mood boards, side projects, and internal product work.",
    rights: [
      "Use in your own design and development workflow",
      "Ship one personal site, prototype, or client draft while evaluating fit",
      "Keep local copies of exported tokens and download bundles",
    ],
    support: [
      "Purchase support by email",
      "File-location help and resend support",
      "Replies usually within 2 business days",
    ],
  },
  {
    id: "commercial",
    label: "Commercial",
    priceNote: "Planned next tier",
    summary: "For agencies, client delivery, production brands, and broader team use.",
    rights: [
      "Use on shipped commercial websites and product interfaces",
      "Include in client-facing brand systems and production token pipelines",
      "Share internally with a small delivery team under one project scope",
    ],
    support: [
      "Priority clarification on file usage",
      "Faster purchase support target for active clients",
      "Clearer invoice / license wording for procurement",
    ],
  },
];

export const supportPolicy = {
  purchaseResponseWindow: "Usually within 2 business days",
  resendCoverage: "Download link resend, receipt lookup, and pack routing help",
  escalation: "Commercial or edge-case usage can be clarified directly over email",
};
