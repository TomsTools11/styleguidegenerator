# Style Guide Generator Web App: Development Plan

## Executive Summary

This plan outlines the development of a standalone web application that allows users to input a URL and receive a professionally formatted, downloadable style guide PDF. The app will leverage the existing skill's logic while adding a modern web interface, backend processing, and automated PDF generation.

---

## 1. Product Overview

### 1.1 Core Value Proposition

Users input a website URL → The app analyzes the site's design system → Users receive a comprehensive, downloadable style guide PDF covering colors, typography, components, accessibility, and more.

### 1.2 Target Users
- Designers needing to document existing site styles
- Developers onboarding to new projects
- Agencies auditing client websites
- Brand managers standardizing design documentation
- Freelancers creating client deliverables

### 1.3 Key Differentiators
- One-click URL analysis (no manual extraction)
- Industry-standard template structure
- Professional PDF output ready for team distribution
- Accessibility compliance documentation built-in

---

## 2. Technical Architecture

### 2.1 Recommended Tech Stack

**Frontend:**
| Component | Technology | Rationale |
|-----------|------------|-----------|
| Framework | Next.js 14+ (App Router) | SSR for SEO, API routes, excellent DX |
| Styling | Tailwind CSS | Rapid development, consistent design |
| UI Components | shadcn/ui | Professional components, accessible |
| State Management | React Query (TanStack Query) | Async state, caching, loading states |
| Forms | React Hook Form + Zod | Validation, type safety |

**Backend:**
| Component | Technology | Rationale |
|-----------|------------|-----------|
| API Framework | Next.js API Routes or FastAPI | Serverless-ready, Python integration |
| Website Analysis | Puppeteer/Playwright | Full JS rendering, CSS extraction |
| PDF Generation | react-pdf or Puppeteer PDF | Programmatic PDF creation |
| Task Queue | BullMQ + Redis (or Inngest) | Handle long-running analysis jobs |
| Database | PostgreSQL (via Supabase/Neon) | Store job results, user history |

**Infrastructure:**
| Component | Technology | Rationale |
|-----------|------------|-----------|
| Hosting | Vercel | Optimal for Next.js, edge functions |
| Background Jobs | Railway/Render/Modal | Long-running Python processes |
| File Storage | Cloudflare R2 or S3 | PDF storage and delivery |
| Monitoring | Sentry + Vercel Analytics | Error tracking, usage insights |

### 2.2 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                              │
│  ┌─────────────┐    ┌──────────────┐    ┌─────────────────┐    │
│  │ URL Input   │ →  │ Job Status   │ →  │ Download PDF    │    │
│  │ Form        │    │ Polling      │    │ Button          │    │
│  └─────────────┘    └──────────────┘    └─────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NEXT.JS APPLICATION                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    API Routes                             │   │
│  │  POST /api/analyze    →  Queue analysis job               │   │
│  │  GET /api/status/:id  →  Return job progress              │   │
│  │  GET /api/download/:id → Return PDF link                  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKGROUND WORKER                             │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────┐  │
│  │ Fetch Site │→ │ Extract    │→ │ Structure  │→ │ Generate │  │
│  │ (Puppeteer)│  │ Design     │  │ Template   │  │ PDF      │  │
│  └────────────┘  │ System     │  │ Data       │  └──────────┘  │
│                  └────────────┘  └────────────┘                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     DATA LAYER                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  PostgreSQL  │  │    Redis     │  │ Cloud Storage│          │
│  │  (Job Data)  │  │ (Job Queue)  │  │ (PDF Files)  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Feature Specification

### 3.1 MVP Features (Phase 1)

| Feature | Description | Priority |
|---------|-------------|----------|
| URL Input | Single field URL submission with validation | P0 |
| Website Analysis | Extract colors, fonts, spacing, components | P0 |
| PDF Generation | Professional style guide PDF output | P0 |
| Download | Secure PDF download link | P0 |
| Progress Indicator | Real-time job status updates | P0 |
| Error Handling | Clear error messages for failed URLs | P0 |

### 3.2 Enhanced Features (Phase 2)

| Feature | Description | Priority |
|---------|-------------|----------|
| Customization Options | Select which sections to include | P1 |
| Multiple URL Analysis | Analyze multiple pages for comprehensive extraction | P1 |
| User Accounts | Save history, re-download past guides | P1 |
| Template Selection | Choose from different PDF templates | P1 |
| Export Formats | JSON, Figma tokens, CSS variables | P1 |

### 3.3 Premium Features (Phase 3)

| Feature | Description | Priority |
|---------|-------------|----------|
| Team Workspaces | Collaborate on style guides | P2 |
| Custom Branding | Add company logo to generated PDFs | P2 |
| API Access | Programmatic style guide generation | P2 |
| Scheduled Audits | Monitor sites for design drift | P2 |
| Competitor Analysis | Compare multiple sites side-by-side | P2 |

---

## 4. Data Extraction Pipeline

### 4.1 Website Analysis Process

The core analysis engine adapts the existing `analyze_website.py` logic into a more robust system:

**Step 1: Website Fetching**
```python
# Use Playwright for full JS rendering
async def fetch_website(url: str) -> WebsiteData:
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.goto(url, wait_until="networkidle")
        
        # Extract HTML
        html = await page.content()
        
        # Extract computed styles
        styles = await page.evaluate("""
            () => {
                const styles = [];
                document.querySelectorAll('*').forEach(el => {
                    styles.push(window.getComputedStyle(el));
                });
                return styles;
            }
        """)
        
        # Screenshot for visual analysis
        screenshot = await page.screenshot(full_page=True)
        
        return WebsiteData(html, styles, screenshot)
```

**Step 2: Design System Extraction**

| Element | Extraction Method | Output |
|---------|-------------------|--------|
| Colors | Parse CSS `color`, `background-color`, `border-color` properties | Deduplicated palette with semantic grouping |
| Typography | Extract `font-family`, `font-size`, `font-weight`, `line-height` | Type scale hierarchy |
| Spacing | Analyze `margin`, `padding`, `gap` patterns | Base unit + scale |
| Components | Identify `button`, `input`, `nav`, `card` patterns | Component inventory |
| Breakpoints | Parse `@media` queries | Responsive breakpoint map |

**Step 3: Color Intelligence**

```python
def analyze_colors(raw_colors: List[str]) -> ColorPalette:
    # Convert all to hex
    normalized = [to_hex(c) for c in raw_colors]
    
    # Deduplicate
    unique = list(set(normalized))
    
    # Cluster similar colors
    clusters = cluster_colors(unique, threshold=15)
    
    # Classify by role
    classified = classify_colors(clusters)
    # Returns: primary, secondary, text, background, accent, etc.
    
    # Calculate accessibility
    for color in classified:
        color.contrast_ratios = calculate_wcag_contrast(color, classified)
    
    return ColorPalette(classified)
```

**Step 4: Typography Analysis**

```python
def analyze_typography(styles: List[ComputedStyle]) -> TypographySystem:
    # Extract unique font stacks
    font_families = extract_font_families(styles)
    
    # Build type scale
    sizes = sorted(set([s.font_size for s in styles]))
    type_scale = build_modular_scale(sizes)
    
    # Map headings
    heading_map = {}
    for level in range(1, 7):
        h_styles = [s for s in styles if s.tag == f'h{level}']
        if h_styles:
            heading_map[f'h{level}'] = aggregate_styles(h_styles)
    
    return TypographySystem(
        primary_font=font_families[0],
        fallback_fonts=font_families[1:],
        type_scale=type_scale,
        headings=heading_map
    )
```

### 4.2 Data Model

```typescript
interface StyleGuideData {
  meta: {
    url: string;
    domain: string;
    analyzedAt: string;
    version: string;
  };
  
  brand: {
    title: string;  // Extracted from <title> or og:site_name
    description: string;  // From meta description
    favicon: string;
  };
  
  colors: {
    primary: Color[];
    secondary: Color[];
    accent: Color[];
    text: Color[];
    background: Color[];
    system: {
      success: Color;
      warning: Color;
      error: Color;
      info: Color;
    };
  };
  
  typography: {
    primaryFont: FontFamily;
    secondaryFont?: FontFamily;
    scale: TypeScale[];
    headings: HeadingSpec[];
    body: BodySpec;
  };
  
  spacing: {
    baseUnit: number;
    scale: number[];
  };
  
  components: {
    buttons: ButtonSpec[];
    inputs: InputSpec[];
    cards: CardSpec[];
    navigation: NavSpec[];
  };
  
  layout: {
    maxWidth: string;
    breakpoints: Breakpoint[];
    gridColumns: number;
  };
  
  accessibility: {
    contrastRatios: ContrastPair[];
    focusIndicators: boolean;
    semanticHTML: boolean;
  };
}
```

---

## 5. PDF Generation

### 5.1 Template Structure

The PDF follows the industry-standard structure from the skill documentation:

```
┌────────────────────────────────────────────────┐
│  STYLE GUIDE                                   │
│  [Website Name]                                │
│  Version 1.0 | Generated [Date]                │
├────────────────────────────────────────────────┤
│  TABLE OF CONTENTS                             │
│  1.0 Introduction                              │
│  2.0 Brand Identity                            │
│      2.1 Color Palette                         │
│      2.2 Typography                            │
│      2.3 Logo Usage                            │
│  3.0 UI Components                             │
│      3.1 Buttons                               │
│      3.2 Forms                                 │
│      3.3 Navigation                            │
│  4.0 Layout & Grid                             │
│  5.0 Accessibility                             │
│  6.0 Resources                                 │
├────────────────────────────────────────────────┤
│  1.0 INTRODUCTION                              │
│  [Purpose, scope, audience description]        │
├────────────────────────────────────────────────┤
│  2.0 BRAND IDENTITY                            │
│                                                │
│  2.1 Color Palette                             │
│  ┌──────────────────────────────────────────┐ │
│  │ Role     │ Color   │ HEX     │ RGB       │ │
│  │ Primary  │ ██████ │ #378DFF │ 55,141,255│ │
│  │ Secondary│ ██████ │ #A5CAFF │ 165,202...│ │
│  │ Text     │ ██████ │ #333333 │ 51,51,51  │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  2.2 Typography                                │
│  ┌──────────────────────────────────────────┐ │
│  │ Element │ Font  │ Weight │ Size │ Height │ │
│  │ H1      │ Inter │ Bold   │ 48px │ 1.2    │ │
│  │ H2      │ Inter │ Bold   │ 36px │ 1.3    │ │
│  │ Body    │ Inter │ Regular│ 16px │ 1.5    │ │
│  └──────────────────────────────────────────┘ │
│  [Continue for all sections...]                │
└────────────────────────────────────────────────┘
```

### 5.2 PDF Generation Approach

**Option A: React-PDF (Recommended for Next.js)**

```typescript
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const StyleGuideDocument = ({ data }: { data: StyleGuideData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Cover Page */}
      <View style={styles.cover}>
        <Text style={styles.title}>Style Guide</Text>
        <Text style={styles.subtitle}>{data.meta.domain}</Text>
        <Text style={styles.version}>Version 1.0 | {data.meta.analyzedAt}</Text>
      </View>
    </Page>
    
    {/* Color Palette Page */}
    <Page size="A4" style={styles.page}>
      <Text style={styles.sectionTitle}>2.1 Color Palette</Text>
      <ColorPaletteTable colors={data.colors} />
    </Page>
    
    {/* Typography Page */}
    <Page size="A4" style={styles.page}>
      <Text style={styles.sectionTitle}>2.2 Typography</Text>
      <TypographyTable typography={data.typography} />
    </Page>
    
    {/* Additional sections... */}
  </Document>
);
```

**Option B: Puppeteer PDF (For complex layouts)**

Generate HTML template → Render with Puppeteer → Export as PDF:

```typescript
async function generatePDF(data: StyleGuideData): Promise<Buffer> {
  const html = renderTemplate(data);  // Render React/HTML template
  
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html);
  
  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '1cm', bottom: '1cm', left: '1cm', right: '1cm' }
  });
  
  await browser.close();
  return pdf;
}
```

---

## 6. User Experience Flow

### 6.1 User Journey

```
┌─────────────────────────────────────────────────────────────┐
│ 1. LANDING PAGE                                             │
│    "Generate a professional style guide in seconds"         │
│    ┌─────────────────────────────────────────────────────┐ │
│    │  Enter website URL                            [GO]  │ │
│    │  https://example.com                                │ │
│    └─────────────────────────────────────────────────────┘ │
│    Examples: Apple.com, Stripe.com, Notion.so             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. PROCESSING PAGE                                          │
│    "Analyzing example.com..."                               │
│    ┌─────────────────────────────────────────────────────┐ │
│    │ ✓ Fetching website                                  │ │
│    │ ✓ Extracting colors                                 │ │
│    │ ● Analyzing typography...                           │ │
│    │ ○ Identifying components                            │ │
│    │ ○ Generating PDF                                    │ │
│    └─────────────────────────────────────────────────────┘ │
│    [================--------] 60%                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. RESULTS PAGE                                             │
│    "Your style guide is ready!"                             │
│    ┌──────────────────────────────────────┐                │
│    │  [PDF Preview]                       │                │
│    │  Style Guide                         │                │
│    │  example.com                         │                │
│    │                                      │                │
│    │  • 8 colors extracted                │                │
│    │  • 3 font families                   │                │
│    │  • 12 components identified          │                │
│    └──────────────────────────────────────┘                │
│    [Download PDF]  [Customize]  [Share Link]               │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 UI Components Needed

| Component | Purpose |
|-----------|---------|
| URLInputForm | Main input with validation |
| ProcessingIndicator | Multi-step progress display |
| PDFPreview | Embedded PDF viewer or preview cards |
| ColorSwatchDisplay | Visual color palette preview |
| TypographyPreview | Font samples with specs |
| DownloadButton | Secure PDF download |
| ErrorState | Friendly error messaging |
| EmptyState | No results / getting started |

---

## 7. Development Phases

### Phase 1: MVP (4-6 weeks)

**Week 1-2: Foundation**
- [ ] Set up Next.js project with TypeScript
- [ ] Configure Tailwind CSS and shadcn/ui
- [ ] Create basic page layouts (landing, processing, results)
- [ ] Implement URL input form with validation
- [ ] Set up PostgreSQL database schema

**Week 3-4: Core Engine**
- [ ] Build website fetching service (Playwright)
- [ ] Implement color extraction algorithm
- [ ] Implement typography extraction
- [ ] Create data processing pipeline
- [ ] Set up background job queue (BullMQ/Inngest)

**Week 5-6: PDF & Polish**
- [ ] Design PDF template components
- [ ] Implement PDF generation (react-pdf)
- [ ] Build download flow with cloud storage
- [ ] Add progress indicators and error handling
- [ ] Testing and bug fixes

**Deliverable:** Working app that accepts URL → generates PDF

### Phase 2: Enhanced Features (4 weeks)

**Week 7-8:**
- [ ] User authentication (Clerk/NextAuth)
- [ ] Job history and re-download
- [ ] Customization options (select sections)

**Week 9-10:**
- [ ] Multiple URL analysis
- [ ] Alternative export formats (JSON, CSS variables)
- [ ] Template selection

**Deliverable:** Full-featured app with user accounts

### Phase 3: Premium & Scale (4+ weeks)

- [ ] Team workspaces
- [ ] Custom branding on PDFs
- [ ] API access for developers
- [ ] Payment integration (Stripe)
- [ ] Performance optimization

---

## 8. Cost Estimation

### 8.1 Infrastructure Costs (Monthly)

| Service | Tier | Estimated Cost |
|---------|------|----------------|
| Vercel | Pro | $20/mo |
| Database (Neon/Supabase) | Free/Pro | $0-25/mo |
| Redis (Upstash) | Free tier | $0/mo |
| Cloud Storage (R2) | Pay-as-you-go | ~$5/mo |
| Background Workers (Modal/Railway) | Usage-based | ~$20-50/mo |
| **Total** | | **$45-100/mo** |

### 8.2 Development Investment

| Phase | Hours | Cost (at $150/hr) |
|-------|-------|-------------------|
| Phase 1 (MVP) | 120-160 hrs | $18,000-24,000 |
| Phase 2 (Enhanced) | 80-100 hrs | $12,000-15,000 |
| Phase 3 (Premium) | 100+ hrs | $15,000+ |

---

## 9. Monetization Strategy

### 9.1 Pricing Tiers

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0/mo | 3 style guides/month, basic template |
| **Pro** | $19/mo | Unlimited guides, all templates, history |
| **Team** | $49/mo | Workspaces, custom branding, API access |
| **Enterprise** | Custom | SSO, dedicated support, on-premise |

### 9.2 Revenue Projections

| Scenario | Users | MRR |
|----------|-------|-----|
| Conservative (Month 6) | 100 Pro users | $1,900 |
| Moderate (Month 12) | 500 Pro, 50 Team | $12,000 |
| Aggressive (Month 18) | 2,000 Pro, 200 Team | $47,800 |

---

## 10. Next Steps

### Immediate Actions (This Week)

1. **Validate demand** - Share concept on LinkedIn, gather interest
2. **Technical spike** - Build minimal Playwright extraction POC
3. **Design mockups** - Create Figma wireframes for key screens
4. **Domain selection** - Secure domain (styleguide.ai, designsystem.io, etc.)

### Decision Points

| Decision | Options | Recommendation |
|----------|---------|----------------|
| Hosting | Vercel vs Railway vs AWS | Vercel (simplicity) |
| PDF Library | react-pdf vs Puppeteer | react-pdf (Next.js native) |
| Auth Provider | Clerk vs NextAuth vs Auth0 | Clerk (fastest) |
| Background Jobs | Inngest vs BullMQ vs Trigger.dev | Inngest (serverless) |

---

## Appendix A: Existing Skill Assets

The style-guide-generator skill includes these resources that can be leveraged:

### A.1 Template Structure (from SKILL.md)

The skill defines a comprehensive 8-section template:
1. Introduction (version, purpose, scope)
2. Brand Identity (logo, colors, typography, iconography, imagery)
3. Content Style Guide (voice, tone, grammar)
4. UI Components (buttons, forms, etc.)
5. Layout & Grid (grid system, breakpoints, spacing)
6. Accessibility (WCAG compliance, contrast, keyboard nav)
7. Resources (design files, icon library, code repo)
8. Changelog (version history)

### A.2 Python Analysis Script

Located at `/scripts/analyze_website.py`, this script provides:
- Color extraction via regex patterns (hex, rgb, rgba)
- Font family extraction from CSS
- Spacing value extraction (margins, paddings)
- HTML component pattern detection (buttons, forms, nav, headings)

### A.3 Design System Reference

Located at `/references/design_system_examples.md`, includes:
- Analysis of Material Design, Apple HIG, Atlassian, IBM Carbon
- Essential style guide components checklist
- Component documentation best practices
- Color system and typography best practices
- Versioning and changelog guidelines

---

## Appendix B: Technical Reference

### B.1 Color Extraction Patterns

```python
# Hex colors
hex_pattern = r'#[0-9A-Fa-f]{3,6}\b'

# RGB/RGBA colors
rgb_pattern = r'rgba?\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+(?:\s*,\s*[\d.]+)?\s*\)'

# Font families
font_pattern = r'font-family\s*:\s*([^;]+);'

# Spacing values
margin_pattern = r'margin(?:-\w+)?\s*:\s*([^;]+);'
padding_pattern = r'padding(?:-\w+)?\s*:\s*([^;]+);'
```

### B.2 Component Detection Patterns

```python
# Buttons
button_pattern = r'<button[^>]*>.*?</button>'

# Forms
form_pattern = r'<form[^>]*>.*?</form>'

# Navigation
nav_pattern = r'<nav[^>]*>.*?</nav>'

# Headings (h1-h6)
heading_pattern = f'<h{level}[^>]*>(.*?)</h{level}>'
```

---

*Document generated: December 2024*
*Based on style-guide-generator skill v1.0*
