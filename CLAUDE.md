# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

The repo root holds deployment files (`Dockerfile`, `railway.json`), docs (`README.md`, `PROGRESS.md`), reference assets (`example-styleguide.pdf`, `docbuildr-logo.svg`), and a single `style-guide-app/` directory containing the entire Next.js application.

**All `npm` / `next` commands must run from `style-guide-app/`, not the repo root.**

## Common commands

Run from `style-guide-app/`:

- First-time setup: `npm install` then `npx playwright install chromium` (the analyzer needs Chromium).
- `npm run dev` — Next.js dev server on http://localhost:3000.
- `npm run build` — production build.
- `npm start` — run the production build.
- `npm run lint` — ESLint via `eslint-config-next` (core-web-vitals + typescript). No test runner is configured.

From the repo root: `docker build -t style-guide-generator .` builds the production image (the Dockerfile copies `style-guide-app/` into the Playwright base image).

## Architecture

A single Next.js 16 (App Router) + React 19 service that scrapes a target website with Playwright, derives a partial design system, and renders it to a PDF.

Request flow:

1. **`POST /api/analyze`** (`src/app/api/analyze/route.ts`) — validates the URL, creates a job, kicks off `processJob` in the background, and returns a `jobId` immediately. The handler does **not** await analysis; clients poll status.
2. **`GET /api/status/[id]`** — returns `{ status, progress, error }` from the job store.
3. **`analyzeWebsite(url)`** in `src/lib/analyzer.ts` — launches headless Chromium, dismisses popups/cookie banners/age gates, auto-scrolls for lazy content, walks `getComputedStyle` for every element to harvest colors/fonts/sizes/weights/spacing, and also pulls colors out of `CSSStyleRule`s. It then deduplicates, classifies colors by role (primary/text/background/success/warning/error/accent) using lightness+saturation heuristics, builds a typography scale, and assembles the full `StyleGuideData`. Most of the resulting `StyleGuideData` (design principles, logo specs, content tone, button variants, breakpoints, etc.) is **template content**, not extracted — only colors, typography, brand name, description, and contrast pairs are actually derived from the site.
4. **`GET /api/results/[id]`** — returns the completed `StyleGuideData` to the client.
5. **`POST /api/generate-pdf`** (`src/app/api/generate-pdf/route.ts`) — accepts `StyleGuideData`, renders `<StyleGuideDocument>` via `@react-pdf/renderer`'s `renderToBuffer`, and streams a PDF download.

UI pages: `src/app/page.tsx` (URL form) → `src/app/processing/page.tsx` (polls status) → `src/app/results/page.tsx` (preview + PDF download).

PDF template: `src/lib/pdf/StyleGuideDocument.tsx` with shared styles in `src/lib/pdf/styles.ts`. Uses Helvetica (built into react-pdf) — do not require external font files.

The canonical data shape is `StyleGuideData` in `src/types/style-guide.ts`. Any change to the analyzer, PDF template, or API responses must stay in sync with this interface.

## Important gotchas

- **In-memory job store** (`src/lib/job-store.ts`) is a `globalThis`-pinned `Map`. Jobs vanish on server restart and are not shared across instances. Treat this as a known limitation, not a bug — see `PROGRESS.md` for the upgrade path (Redis/Postgres). The `globalThis` pinning exists to survive Next.js dev hot-reloads.
- **TypeScript build errors are suppressed** in `next.config.ts` (`typescript.ignoreBuildErrors: true`) because `@react-pdf/renderer`'s types conflict with React 19. `npm run lint` still runs; don't re-enable strict build checking without first resolving the react-pdf typing issue. The PDF route also uses a `@ts-ignore` on `renderToBuffer` for the same reason.
- **Playwright requires system deps.** Local dev needs `npx playwright install chromium`. The production Dockerfile uses `mcr.microsoft.com/playwright:v1.57.0-noble` as the base image — bumping the `playwright` npm package means bumping that tag too.
- **No concurrency control or browser pooling.** Each `/api/analyze` call spawns a fresh Chromium (~150–300MB). Be cautious adding features that fan out analyses.
- **Path alias:** `@/*` → `src/*` (see `tsconfig.json`).
- **shadcn/ui** is configured with the `new-york` style, `neutral` base color, CSS variables, and `lucide-react` icons (`components.json`). Add new shadcn components into `src/components/ui/` and use the existing `cn()` helper from `src/lib/utils.ts`.
- **Tailwind v4** (not v3) — configuration lives in `src/app/globals.css` via `@tailwindcss/postcss`; there is no `tailwind.config.*` file.

## Deployment

Railway builds from the root `Dockerfile` (declared in `railway.json`). The Dockerfile copies `style-guide-app/`, runs `npm ci` + `npm run build`, and starts via `npm start` on port 3000.
