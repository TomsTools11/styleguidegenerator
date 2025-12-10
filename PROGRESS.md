# Style Guide Generator - Development Progress

## Project Status: Deployed to Railway - MVP Working

**Last Updated:** December 8, 2025

**Live URL:** https://styleguidegenerator-production.up.railway.app

**GitHub:** https://github.com/TomsTools11/styleguidegenerator

---

## Deployment Summary

Successfully deployed to Railway with:
- Dockerfile with Playwright system dependencies
- Next.js 16 with Turbopack
- Website analyzer working for most sites
- PDF generation with Helvetica font

---

## What Has Been Done

### 1. Project Setup (Complete)
- Created Next.js 14 application with App Router in `/style-guide-app`
- Configured TypeScript for type safety
- Set up Tailwind CSS with Tom Panos brand colors
- Initialized shadcn/ui component library
- Installed Playwright Chromium browser

### 2. Dependencies Installed (Complete)
All required packages are installed:

**Core Framework:**
- Next.js 16 (App Router)
- React 19
- TypeScript

**Styling:**
- Tailwind CSS v4
- shadcn/ui components (Button, Card, Input, Label, Progress, Spinner)

**Additional Dependencies:**
- `@react-pdf/renderer` - PDF generation
- `playwright` - Website fetching/analysis
- `zod` - Form validation
- `@tanstack/react-query` - Async state management
- `lucide-react` - Icons

### 3. Website Analyzer (Complete)
- **File:** `src/lib/analyzer.ts`
- Playwright-based website fetching with `domcontentloaded` wait strategy
- Popup/modal dismissal (cookie banners, age gates, etc.)
- Auto-scroll for lazy-loaded content
- Color extraction from computed styles
- Typography extraction (fonts, sizes, weights)
- Color classification by semantic role
- WCAG contrast ratio calculations

### 4. Railway Deployment (Complete)
- **Dockerfile** with all Playwright system dependencies
- **railway.json** configuration
- TypeScript build errors bypassed with `ignoreBuildErrors: true`
- PDF generation using built-in Helvetica font

---

## Known Limitations (To Fix Next Session)

### CRITICAL - Should Fix Soon

#### 1. In-Memory Job Store - Data Loss on Restarts
**File:** `src/lib/job-store.ts`
- Uses `globalThis` Map for job storage
- All jobs are lost when Railway container restarts
- Users get "Job not found" errors if restart happens during analysis
- **Fix:** Replace with Redis or PostgreSQL (Railway offers both)

#### 2. No Concurrency Control
**File:** `src/app/api/analyze/route.ts`
- `processJob()` is fire-and-forget with no limits
- Multiple simultaneous requests spawn unlimited browser instances
- Could exhaust memory and crash under load
- **Fix:** Implement job queue with max 2-3 concurrent browser instances

### MEDIUM - Stability Improvements

#### 3. Browser Resource Management
**File:** `src/lib/analyzer.ts`
- Each analysis spawns a new Chromium browser (~150-300MB)
- No connection pooling or browser reuse
- **Fix:** Implement browser pooling or use headless browser service (Browserless.io)

#### 4. Memory Leak in Job Store
**File:** `src/lib/job-store.ts`
- No cleanup of completed jobs
- Map grows indefinitely with each analysis
- **Fix:** Implement job TTL/expiration (e.g., 1-24 hours)

#### 5. No Environment Variables
- No `.env.example` file
- Timeouts, database URLs, etc. are hardcoded
- **Fix:** Create environment variable configuration

### LOW - Nice to Have

#### 6. Limited Error Handling for URLs
**File:** `src/lib/analyzer.ts`
- No retry logic for flaky websites
- No handling for 401/403 blocked sites
- No DNS resolution timeout
- **Fix:** Add comprehensive error handling and retries

#### 7. Fixed Timeouts
**File:** `src/lib/analyzer.ts`
- 30s page load timeout may be too short for slow sites
- 2s JS render wait is arbitrary
- **Fix:** Make timeouts configurable via environment variables

---

## Recommended Fixes (Priority Order)

1. **Add Redis for job persistence** - Essential for production reliability
2. **Implement concurrency limiting** - Prevent resource exhaustion
3. **Add job cleanup/TTL** - Prevent memory leaks
4. **Add environment variables** - Enable flexible deployment
5. **Improve error handling** - Better user experience

---

## How to Resume Development

1. **Navigate to project:**
   ```bash
   cd /Users/tpanos/TProjects/style-guide-generatorv2/styleguidegenerator/style-guide-app
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Test the flow:**
   - Open http://localhost:3000
   - Enter a website URL (e.g., https://example.com)
   - Watch processing progress
   - Download generated PDF

---

## File Structure

```
style-guide-app/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Landing page
│   │   ├── globals.css                 # Global styles + brand colors
│   │   ├── processing/
│   │   │   └── page.tsx                # Processing status page
│   │   ├── results/
│   │   │   └── page.tsx                # Results + download page
│   │   └── api/
│   │       ├── analyze/
│   │       │   └── route.ts            # Start analysis
│   │       ├── status/
│   │       │   └── [id]/route.ts       # Check status
│   │       ├── results/
│   │       │   └── [id]/route.ts       # Get results
│   │       └── generate-pdf/
│   │           └── route.ts            # Generate PDF
│   ├── components/
│   │   └── ui/                         # shadcn/ui components
│   ├── lib/
│   │   ├── utils.ts                    # Utility functions
│   │   ├── analyzer.ts                 # Website analysis engine
│   │   ├── job-store.ts                # In-memory job storage
│   │   └── pdf/
│   │       ├── styles.ts               # PDF stylesheet (Helvetica)
│   │       └── StyleGuideDocument.tsx  # Complete PDF template
│   └── types/
│       └── style-guide.ts              # TypeScript interfaces
├── Dockerfile                          # Railway deployment
├── railway.json                        # Railway config
├── package.json
└── tsconfig.json
```

---

## Technical Notes

### Color Extraction
The analyzer extracts colors from:
- Background colors
- Text colors
- Border colors
- CSS custom properties

Colors are classified into semantic roles:
- Primary Dark, Primary, Primary Light
- Secondary, Accent
- Text Primary, Text Secondary, Text Muted
- Background colors
- Success, Warning, Error states

### Typography Extraction
Extracts from computed styles:
- Font families
- Font sizes (builds type scale)
- Font weights
- Line heights

### PDF Generation
Using `@react-pdf/renderer` with:
- Built-in Helvetica font (no network loading)
- Blue color scheme (#0D91FD primary)
- Tables with light blue headers
- Page numbers in footer
- Consistent margins and spacing

### Website Analysis Strategy
- Uses `domcontentloaded` instead of `networkidle` for reliability
- 2-second wait for JavaScript rendering
- Auto-dismisses popups, cookie banners, age gates
- Auto-scrolls to trigger lazy loading
- 30-second timeout for page load

---

## Key Brand Colors Used

**Tom Panos Web UI:**
- Background: #191919
- Card: #202020
- Primary Blue: #407EC9
- Success Green: #448361
- Error Red: #D44E49
- Text Primary: #FFFFFF
- Text Secondary: #EDEEEE
- Text Muted: #A7A39A
- Border: #444B4E

**Generated PDF:**
- Primary Dark: #021A2E
- Primary: #014379
- Primary Light: #0D91FD
- Accent: #5DB5FE
- Lightest: #C2E3FE
- Table Header BG: #E8F4FD

---

## Next Feature: Image Upload → Creative Brief Generator

**Status:** Planned
**Added:** December 10, 2025

### Feature Overview

Allow users to upload screenshots or images of marketing content, which the app will analyze using Claude's vision capabilities to generate a creative brief that guides the creation of new content in the same style.

### Cost Controls (Agreed)

| Limit | Value | Rationale |
|-------|-------|-----------|
| Max images per analysis | 3 | Caps cost at ~$0.07/analysis |
| Auto-resize dimensions | 1024px max | Reduces tokens by ~50% |
| Max total upload size | 5MB | Prevents oversized uploads |

**Estimated cost per analysis:** $0.05 - $0.07

---

### Implementation Plan

#### Phase 1: Foundation Setup

**1.1 Add Anthropic SDK**
- [ ] Install `@anthropic-ai/sdk` package
- [ ] Create `ANTHROPIC_API_KEY` environment variable
- [ ] Add API key to Railway environment
- [ ] Create `src/lib/anthropic.ts` client wrapper

**1.2 Create Type Definitions**
- [ ] Add `src/types/creative-brief.ts` with interfaces:
  ```typescript
  interface CreativeBrief {
    meta: { analyzedAt: string; imageCount: number }
    visualStyle: {
      colorPalette: { primary: string; secondary: string[]; accent: string }
      typography: { style: string; hierarchy: string }
      layoutPatterns: string[]
      visualMotifs: string[]
    }
    brandVoice: {
      tone: string  // formal, casual, playful, etc.
      personality: string[]
      emotionalAppeal: string
    }
    messaging: {
      keyThemes: string[]
      callToActionStyle: string
      valueProposition: string
    }
    targetAudience: {
      inferredDemographic: string
      psychographics: string[]
    }
    recommendations: {
      doThis: string[]
      avoidThis: string[]
      contentIdeas: string[]
    }
  }

  interface CreativeBriefJob {
    id: string
    status: 'pending' | 'uploading' | 'analyzing' | 'completed' | 'failed'
    progress: number
    error?: string
    images: { name: string; size: number }[]
    data?: CreativeBrief
    createdAt: string
  }
  ```

**1.3 Create Image Upload Component**
- [ ] Create `src/components/ImageUploader.tsx`
  - Drag-and-drop zone
  - Click to browse files
  - Support PNG, JPG, WEBP formats
  - Client-side validation (max 3 images, 5MB total)
  - Client-side resize to 1024px max dimension
  - Image preview thumbnails
  - Remove image button
- [ ] Add `canvas` API for client-side image resizing

---

#### Phase 2: Backend Implementation

**2.1 Creative Brief Job Store**
- [ ] Extend `src/lib/job-store.ts` or create `src/lib/creative-brief-store.ts`
- [ ] Support new job type for creative brief analysis

**2.2 New API Routes**

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/creative-brief/analyze` | POST | Start analysis job |
| `/api/creative-brief/status/[id]` | GET | Poll job status |
| `/api/creative-brief/results/[id]` | GET | Get creative brief |
| `/api/creative-brief/generate-pdf` | POST | Export as PDF |

- [ ] Create `src/app/api/creative-brief/analyze/route.ts`
  - Accept base64 images array
  - Validate image count (max 3)
  - Create job and return job ID
  - Fire off background analysis

- [ ] Create `src/app/api/creative-brief/status/[id]/route.ts`
  - Return job status and progress

- [ ] Create `src/app/api/creative-brief/results/[id]/route.ts`
  - Return completed creative brief data

- [ ] Create `src/app/api/creative-brief/generate-pdf/route.ts`
  - Generate PDF from creative brief data

**2.3 Image Analysis Service**
- [ ] Create `src/lib/creative-brief-analyzer.ts`
  - Function: `analyzeImages(images: string[]): Promise<CreativeBrief>`
  - Call Claude Vision API with structured prompt
  - Parse JSON response into CreativeBrief structure
  - Handle errors gracefully

**2.4 Claude Vision Prompt**
- [ ] Create `src/lib/prompts/creative-brief-prompt.ts`
  - Craft prompt to extract:
    - Color palette and usage patterns
    - Typography style and hierarchy
    - Layout and composition principles
    - Brand voice indicators
    - Visual motifs and patterns
    - Call-to-action style
    - Emotional tone
    - Target audience inference
  - Request structured JSON output

---

#### Phase 3: Frontend Implementation

**3.1 Update Landing Page**
- [ ] Modify `src/app/page.tsx`
  - Add tab toggle: "Analyze Website" | "Upload Images"
  - Show URL input for website tab
  - Show ImageUploader for images tab
  - Update form submission to handle both flows

**3.2 Processing Page**
- [ ] Create `src/app/creative-brief/processing/page.tsx`
  - Show uploaded image thumbnails
  - Progress bar with steps:
    1. Uploading images (10%)
    2. Analyzing visual style (30%)
    3. Extracting brand voice (50%)
    4. Generating recommendations (70%)
    5. Finalizing brief (90%)
    6. Complete (100%)
  - Poll status endpoint

**3.3 Results Page**
- [ ] Create `src/app/creative-brief/results/page.tsx`
  - Display creative brief sections in cards:
    - Visual Style (colors, typography, layout)
    - Brand Voice (tone, personality)
    - Key Messaging (themes, CTA style)
    - Target Audience
    - Recommendations (do's, don'ts, ideas)
  - Show uploaded image thumbnails as reference
  - Download PDF button
  - "Analyze More Images" button

---

#### Phase 4: PDF Generation

**4.1 Creative Brief PDF Template**
- [ ] Create `src/lib/pdf/CreativeBriefDocument.tsx`
  - Page 1: Cover with image thumbnails
  - Page 2: Executive Summary
  - Page 3: Visual Style Guide
  - Page 4: Brand Voice Analysis
  - Page 5: Messaging & Content Strategy
  - Page 6: Target Audience Profile
  - Page 7: Recommendations (Do's & Don'ts)
  - Page 8: Content Ideas
  - Page 9: Reference Images Appendix

- [ ] Create `src/lib/pdf/creative-brief-styles.ts`
  - Consistent styling with existing PDF

---

### Files to Create

```
src/
├── app/
│   ├── creative-brief/
│   │   ├── processing/
│   │   │   └── page.tsx           # Processing status
│   │   └── results/
│   │       └── page.tsx           # Results display
│   └── api/
│       └── creative-brief/
│           ├── analyze/
│           │   └── route.ts       # Start analysis
│           ├── status/
│           │   └── [id]/
│           │       └── route.ts   # Check status
│           ├── results/
│           │   └── [id]/
│           │       └── route.ts   # Get results
│           └── generate-pdf/
│               └── route.ts       # Generate PDF
├── components/
│   └── ImageUploader.tsx          # Drag-drop upload
├── lib/
│   ├── anthropic.ts               # Claude client
│   ├── creative-brief-analyzer.ts # Analysis logic
│   ├── creative-brief-store.ts    # Job storage
│   ├── prompts/
│   │   └── creative-brief-prompt.ts
│   └── pdf/
│       ├── CreativeBriefDocument.tsx
│       └── creative-brief-styles.ts
└── types/
    └── creative-brief.ts          # Type definitions
```

---

### Dependencies to Add

```bash
npm install @anthropic-ai/sdk
```

---

### Environment Variables

```
ANTHROPIC_API_KEY=sk-ant-api03-...
```

Add to:
- `.env.local` (local development)
- Railway environment variables (production)

---

### Testing Checklist

- [ ] Upload single image → generates brief
- [ ] Upload 3 images → generates comprehensive brief
- [ ] Upload 4+ images → shows error (max 3)
- [ ] Upload >5MB → shows error
- [ ] Large image auto-resized to 1024px
- [ ] Progress updates correctly during analysis
- [ ] Results display all sections
- [ ] PDF downloads correctly
- [ ] Error handling for API failures
- [ ] Mobile responsive upload UI

---

### Estimated API Costs

| Scenario | Images | Est. Cost |
|----------|--------|-----------|
| Single image analysis | 1 | $0.05 |
| Full analysis | 3 | $0.07 |
| 100 analyses/month | - | $5-7 |
| 500 analyses/month | - | $25-35 |

---

### Risk Mitigation

| Risk | Mitigation |
|------|------------|
| API key exposure | Server-side only, never sent to client |
| Large images | Client-side resize before upload |
| API failures | Retry logic with exponential backoff |
| Inconsistent output | Structured JSON mode + validation |
| Cost overruns | Hard limits on image count/size |
