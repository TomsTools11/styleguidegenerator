# Style Guide Generator

> Automatically generate professional style guide PDFs from any website in seconds

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://styleguidegenerator-production.up.railway.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Playwright](https://img.shields.io/badge/Playwright-1.57-green)](https://playwright.dev/)

## Overview

Style Guide Generator is a web application that analyzes any website's design system and generates a comprehensive, professionally formatted style guide PDF. Simply enter a URL, and within seconds you'll have a detailed document covering colors, typography, components, layout, and accessibility standards.

**Live Demo:** [https://styleguidegenerator-production.up.railway.app](https://styleguidegenerator-production.up.railway.app)

## Features

- **One-Click Analysis** - Enter any website URL and get instant design system extraction
- **Comprehensive Extraction** - Automatically identifies:
  - Color palettes with semantic classification (primary, secondary, accent, text, backgrounds)
  - Typography system (font families, sizes, weights, line heights)
  - Spacing values and patterns
  - Component inventory
  - Layout and responsive breakpoints
  - Accessibility compliance (WCAG contrast ratios)
- **Professional PDF Output** - Industry-standard style guide format ready for team distribution
- **Real-Time Progress** - Live status updates during website analysis
- **Smart Color Classification** - Automatically categorizes colors by role and usage
- **WCAG Compliance Checking** - Built-in contrast ratio calculations for accessibility

## Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Utility-first styling
- **shadcn/ui** - Accessible component library
- **TanStack Query** - Async state management
- **Lucide React** - Icon library

### Backend & Analysis
- **Playwright** - Headless browser for website analysis
- **@react-pdf/renderer** - PDF generation
- **Zod** - Schema validation

### Infrastructure
- **Railway** - Cloud deployment platform
- **Docker** - Containerized deployment
- **Node.js** - Runtime environment

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/TomsTools11/styleguidegenerator.git
cd styleguidegenerator
```

2. Navigate to the app directory:
```bash
cd style-guide-app
```

3. Install dependencies:
```bash
npm install
```

4. Install Playwright browsers:
```bash
npx playwright install chromium
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## How It Works

### Analysis Pipeline

1. **URL Submission** - User enters a website URL
2. **Browser Launch** - Playwright spawns a headless Chromium instance
3. **Page Loading** - Navigates to the URL with smart popup dismissal and lazy-load handling
4. **Style Extraction** - Analyzes computed styles from all page elements:
   - Colors from backgrounds, text, borders, and CSS variables
   - Font families, sizes, weights, and line heights
   - Spacing values (margins, paddings, gaps)
5. **Classification** - Intelligently categorizes extracted data:
   - Colors grouped by semantic role (primary, secondary, accent, text, backgrounds)
   - Typography organized into type scales and hierarchies
   - Contrast ratios calculated for accessibility compliance
6. **PDF Generation** - Creates a professional style guide using industry-standard template structure
7. **Download** - User receives downloadable PDF

### PDF Structure

Generated style guides follow professional documentation standards:

1. **Cover Page** - Website name, URL, generation date
2. **Color Palette** - Primary, secondary, accent, text, and background colors with hex/RGB values
3. **Typography** - Font families, type scale, weights, and line heights
4. **Spacing System** - Margin and padding patterns
5. **Components** - UI elements and patterns identified
6. **Layout & Grid** - Breakpoints and container widths
7. **Accessibility** - WCAG contrast ratios and compliance notes

## Project Structure

```
styleguidegenerator/
├── Dockerfile                    # Production deployment configuration
├── railway.json                  # Railway deployment settings
├── PROGRESS.md                   # Development progress and notes
└── style-guide-app/              # Main Next.js application
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx          # Landing page with URL input
    │   │   ├── processing/       # Analysis progress page
    │   │   │   └── page.tsx
    │   │   ├── results/          # Results display and PDF download
    │   │   │   └── page.tsx
    │   │   └── api/
    │   │       ├── analyze/      # Start analysis job
    │   │       │   └── route.ts
    │   │       ├── status/       # Check job status
    │   │       │   └── [id]/route.ts
    │   │       ├── results/      # Get analysis results
    │   │       │   └── [id]/route.ts
    │   │       └── generate-pdf/ # Generate PDF from results
    │   │           └── route.ts
    │   ├── components/
    │   │   └── ui/               # shadcn/ui components
    │   ├── lib/
    │   │   ├── analyzer.ts       # Website analysis engine (Playwright)
    │   │   ├── job-store.ts      # In-memory job storage
    │   │   ├── utils.ts          # Utility functions
    │   │   └── pdf/
    │   │       ├── StyleGuideDocument.tsx  # PDF template
    │   │       └── styles.ts               # PDF styling
    │   └── types/
    │       └── style-guide.ts    # TypeScript interfaces
    ├── package.json
    └── tsconfig.json
```

## Deployment

### Vercel (recommended)

The app is configured for Vercel deployment via [`style-guide-app/vercel.json`](style-guide-app/vercel.json).

1. Push the repo to GitHub.
2. In Vercel, click **Add New → Project** and import the repo.
3. **Set Root Directory to `style-guide-app`** ← critical. If you skip this, Vercel will still build (it auto-detects Next.js inside the subfolder) but the Lambda's working directory ends up as `/var/task/style-guide-app/...` instead of `/var/task/...`, which silently breaks any path resolution from `process.cwd()`. Verify under **Settings → General → Root Directory** before you deploy.
4. Framework preset: **Next.js** (auto-detected).
5. Build command, output, and install command: leave as defaults.
6. Click **Deploy**.

#### Notes specific to this app

- **Vercel Pro is required.** The `/api/analyze` route launches headless Chromium and runs for ~30–60s per request; Hobby caps function `maxDuration` at 10s, which kills every analyze request. Pro lifts that to 300s. The `vercel.json` requests 60s for `/api/analyze` and 30s for `/api/generate-pdf`.
- **Chromium runs via [`@sparticuz/chromium-min`](https://github.com/Sparticuz/chromium#-min-package).** Regular Playwright won't fit in a Vercel function bundle (~300 MB), and the standard `@sparticuz/chromium` package's binary doesn't always survive Next/Webpack file tracing. `chromium-min` ships only the JS shim and downloads the binary from the GitHub release matching `SPARTICUZ_CHROMIUM_VERSION` in [`analyzer.ts`](style-guide-app/src/lib/analyzer.ts) to `/tmp` on first invocation. **When you bump the npm package, bump the URL in lockstep** — the binary version must match the JS API version.
- **No environment variables are required** for the basic flow. Optional extras: `ANTHROPIC_API_KEY` for the planned brand-copy generation, `REDIS_URL` for persistent job storage (the current in-memory `Map` resets on every cold start, which on Vercel happens often).
- **Function memory is set to 1024 MB** (default 1024 on Vercel) for both Chromium-bearing routes.

### Railway (legacy)

The original deployment uses [`Dockerfile`](Dockerfile) + [`railway.json`](railway.json) at the repo root, built on the Microsoft Playwright base image. Both files are kept in the repo so the Railway service keeps working as a fallback, but the Vercel migration is now the primary deployment path. Delete those two files when you're ready to commit fully to Vercel.

### Docker (local)

Build and run locally with Docker (matches the Railway production image):

```bash
docker build -t style-guide-generator .
docker run -p 3000:3000 style-guide-generator
```

### Environment Variables

Currently, no environment variables are required for basic operation. Future features may require:

- `REDIS_URL` - For persistent job storage
- `DATABASE_URL` - For user accounts and history
- `ANTHROPIC_API_KEY` - For planned creative brief feature

## Known Limitations

### Current Constraints

1. **In-Memory Job Storage** - Jobs are lost on server restart. Recommended to implement Redis or PostgreSQL for production.
2. **No Concurrency Control** - Unlimited browser instances can spawn under high load. Implement job queue with concurrency limits.
3. **No Browser Pooling** - Each analysis spawns a new Chromium instance (~150-300MB). Consider browser reuse or connection pooling.
4. **Fixed Timeouts** - 30-second page load timeout may be too short for slow sites. Make configurable via environment variables.
5. **Limited Error Handling** - No retry logic for flaky websites or handling of auth-protected sites.

### Recommended Improvements

1. Add Redis for persistent job storage
2. Implement job queue with max 2-3 concurrent browser instances
3. Add browser connection pooling
4. Implement job cleanup/TTL (prevent memory leaks)
5. Add environment variable configuration
6. Enhance error handling with retry logic

See [PROGRESS.md](PROGRESS.md) for detailed technical notes and improvement roadmap.

## Roadmap

### Planned Features

- **User Accounts** - Save analysis history and re-download past guides
- **Creative Brief Generator** - Upload screenshots to generate marketing content briefs using Claude Vision AI
- **Multiple URL Analysis** - Analyze multiple pages for comprehensive design system extraction
- **Custom Templates** - Choose from different PDF templates and styles
- **Export Formats** - JSON, Figma tokens, CSS variables
- **API Access** - Programmatic style guide generation for developers
- **Team Workspaces** - Collaborate on style guides
- **Custom Branding** - Add company logo to generated PDFs

## Development

### Running Tests

```bash
npm run lint
```

### Building

```bash
npm run build
```

### Local Development Tips

- The analyzer uses Playwright's `domcontentloaded` strategy for faster, more reliable loading
- Auto-scrolling triggers lazy-loaded content
- Popup dismissal automatically handles cookie banners and modals
- Colors are deduplicated and classified by luminance and usage patterns

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Website analysis powered by [Playwright](https://playwright.dev/)
- PDF generation using [@react-pdf/renderer](https://react-pdf.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)

## Support

For issues, questions, or suggestions:
- Open an issue on [GitHub](https://github.com/TomsTools11/styleguidegenerator/issues)
- Check [PROGRESS.md](PROGRESS.md) for technical details and development notes

---

Made with ❤️ by [TomsTools11](https://github.com/TomsTools11)
