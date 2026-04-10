# ColorArchive

ColorArchive is a color exploration and design-token product built with Next.js (App Router), TypeScript, and Tailwind CSS, deployed to Vercel. A separate Express API on DigitalOcean handles auth, email capture, checkout webhooks, and analytics.

## Stack

- Next.js with App Router (deployed to Vercel)
- TypeScript
- Tailwind CSS 4
- Express API + SQLite on DigitalOcean (auth, webhooks, analytics)
- Vitest (465 tests)

## Architecture

- `app/` — Next.js routes (80+ pages, 3,800+ statically generated at build time)
- `server/` — Express API for auth (magic link + Google OAuth), Stripe/Gumroad webhooks, admin, analytics
- `src/data/colors.ts` — Generates all 5,446 colors algorithmically (48 hue roots × 14 lightness × 8 chroma + 5 neutral gray groups × 14)
- `src/components/` — 127+ TSX components
- `src/lib/` — Pure utility modules for color conversion, contrast, relationships, filtering, search, palette building, i18n (EN/ZH)
- `src/types/color.ts` — Core `ColorRecord` interface and enums

## Local Development

```bash
npm install        # Install frontend dependencies
npm run dev        # Start Next.js dev server
npm run build      # Production build (Vercel)
npm run typecheck  # TypeScript type checking
npm test           # Run Vitest test suite
```

API server:

```bash
cd server
npm install
npm run dev
```

## Deployment

- **Frontend**: Vercel (auto-deploy on push to `main`). `next.config.ts` uses `trailingSlash: true`.
- **API**: DigitalOcean Droplet at `api.colorarchive.org`, managed via PM2.
- **Payments**: Gumroad (active provider) with Stripe as fallback. Configured in `src/lib/checkout-config.ts`.
