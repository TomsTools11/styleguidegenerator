# Style Guide Generator - Development Progress

## Project Status: Deployed to Railway - MVP Working

**Last Updated:** December 9, 2025

**Live URL:** https://styleguidegenerator-production.up.railway.app

**GitHub:** https://github.com/TomsTools11/styleguidegenerator

---

## Deployment Summary

Successfully deployed to Railway with:
- Dockerfile with Playwright system dependencies
- Next.js 16 with Turbopack
- Website analyzer working for most sites
- PDF generation with Helvetica font
- **Redis for persistent job storage** ✓

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
- `ioredis` - Redis client for job persistence ✓

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
- **Redis service connected** for job persistence ✓

### 5. Redis Job Persistence (Complete) ✓
- **Files:** `src/lib/redis.ts`, `src/lib/job-store.ts`
- Redis client with connection handling and retry logic
- Job store rewritten to use Redis with in-memory fallback
- Jobs auto-expire after 24 hours (configurable via `JOB_TTL_SECONDS`)
- All API routes updated for async job operations
- `.env.example` created with configuration options

---

## Remaining Improvements (Priority Order)

### CRITICAL - Should Fix Next

#### 1. Concurrency Control / Job Queue
**File:** `src/app/api/analyze/route.ts`
- **Problem:** `processJob()` is fire-and-forget with no limits
- Multiple simultaneous requests spawn unlimited browser instances (~150-300MB each)
- Could exhaust memory and crash under load
- **Solution Options:**
  - Simple semaphore (in-memory counter) - Low complexity
  - BullMQ + Redis (full job queue) - Medium complexity, recommended since Redis exists
- **Benefits:** Prevents resource exhaustion, enables job prioritization

### MEDIUM - Stability Improvements

#### 2. Browser Connection Pooling
**File:** `src/lib/analyzer.ts`
- **Problem:** Each analysis spawns a new Chromium browser
- No connection pooling or browser reuse
- **Solution Options:**
  - Implement browser pool (reuse 2-3 browser instances)
  - Use headless browser service (Browserless.io)
- **Benefits:** Reduced memory usage, faster analysis

#### 3. Enhanced Error Handling
**File:** `src/lib/analyzer.ts`
- **Problem:** No retry logic for flaky websites
- No handling for 401/403 blocked sites
- No DNS resolution timeout
- **Solution:** Add comprehensive error handling with 3 retries and exponential backoff
- **Benefits:** Better user experience, handles transient failures

#### 4. Configurable Timeouts
**File:** `src/lib/analyzer.ts`
- **Problem:** 30s page load timeout may be too short for slow sites
- 2s JS render wait is arbitrary
- **Solution:** Make timeouts configurable via environment variables
- **Benefits:** Flexibility for different site types

### LOW - Future Enhancements

#### 5. Rate Limiting
- Limit requests per IP/session to prevent abuse
- Could use Redis for distributed rate limiting

#### 6. Analytics/Usage Tracking
- Track number of analyses, popular sites, success/failure rates
- Could use Supabase or simple Redis counters

#### 7. Caching Recently Analyzed Sites
- Cache results for recently analyzed URLs
- Serve cached results for repeat requests within a time window

#### 8. Custom PDF Branding
- Allow users to customize PDF colors/branding
- White-label option for agencies

---

## Environment Variables

```bash
# Redis Configuration (required for persistence)
REDIS_URL=redis://default:password@host:port

# Job Configuration (optional)
JOB_TTL_SECONDS=86400  # 24 hours default
```

---

## How to Resume Development

1. **Navigate to project:**
   ```bash
   cd style-guide-app
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **For local Redis (optional):**
   ```bash
   docker run -d -p 6379:6379 redis:alpine
   ```

4. **Test the flow:**
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
│   │   ├── redis.ts                    # Redis client ✓
│   │   ├── job-store.ts                # Redis job storage ✓
│   │   └── pdf/
│   │       ├── styles.ts               # PDF stylesheet (Helvetica)
│   │       └── StyleGuideDocument.tsx  # Complete PDF template
│   └── types/
│       └── style-guide.ts              # TypeScript interfaces
├── .env.example                        # Environment config template ✓
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

### Redis Job Storage
- Jobs stored with key prefix `styleguide:job:`
- Auto-expire after 24 hours (configurable)
- Graceful fallback to in-memory if Redis unavailable
- Connection retry with exponential backoff

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

## Future Considerations

### Supabase Migration
Could migrate from Redis to Supabase for:
- PostgreSQL for job storage (more query flexibility)
- Realtime subscriptions (push job status instead of polling)
- Edge Functions for analysis offloading
- Built-in auth if user accounts needed later
