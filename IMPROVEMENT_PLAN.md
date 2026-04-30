# Style Guide Generator — Comprehensive Improvement & Redesign Plan

**Author:** Coordinator review (Architect + Research + Coder + Tester sub-agents)
**Date:** 2026-04-30
**Scope:** PDF polish, S3 Labs–style web redesign, UX/bug/perf fixes
**Repos / URLs reviewed:** `TomsTools11/styleguidegenerator`, `https://styleguidegenerator-production.up.railway.app/`, `https://s3labs.tech/`

---

## 0. Executive summary

Three workstreams, ordered by visible impact:

| # | Stream | Outcome | Effort |
|---|--------|---------|--------|
| **A** | **PDF polish + S3 branding** | Cover with S3 logo, real Inter/Geist Mono fonts embedded, cleaner type, dot-leader TOC, brand-blue palette, no ugly justified text | ~1 day |
| **B** | **Web redesign in S3 Labs style** | Light, restrained, "small software" aesthetic; brand `#2e9df1`; Lato + Geist Mono; sticky-blur header w/ S3 logo; aura hero; status-pill | ~1.5 days |
| **C** | **UX, bugs, performance** | Kill fake-progress + demo-fallback bugs, fix in-memory job store, sanitize URLs, real PDF preview, screenshot of analyzed site, caching, telemetry | ~1.5 days |

**Two non-negotiable bug fixes that should land before anything cosmetic** — both are in [§3.1](#31-must-fix-bugs):
1. The processing page **silently routes to a fake "demo" page** if the analyze API hasn't returned a `jobId` after 800ms — users get fabricated style guides for real URLs.
2. The progress steps (`fetching → extracting_colors → ...`) all advance via **hardcoded `setTimeout` calls before analysis runs**, so the UI claims "Done" for steps that haven't started. Cosmetic-but-actively-misleading.

S3 logos have already been staged at [`public/brand/s3-logo-dark-bg.png`](style-guide-app/public/brand/s3-logo-dark-bg.png) and [`public/brand/s3-logo-dark-bg-alt.png`](style-guide-app/public/brand/s3-logo-dark-bg-alt.png) so they're ready to wire in.

---

## A. PDF polish & S3 branding

### A.1 Findings from the current example PDF

Reviewed [`example-styleguide.pdf`](example-styleguide.pdf) (TomsMCPs.com, 19 pages). Issues:

| # | Problem | Evidence |
|---|---------|----------|
| 1 | **No brand mark anywhere** | Cover page is a centered title + color bar. No logo or visual anchor. |
| 2 | **Default Helvetica everywhere** despite the doc *claiming* to use Inter | `styles.ts:5` hardcodes `FONT_FAMILY = 'Helvetica'` because no fonts are registered. The PDF therefore *describes* its own typography incorrectly. |
| 3 | **Justified body text** produces visible "rivers" of whitespace in narrow columns | `styles.ts:137` `textAlign: 'justify'` |
| 4 | **TOC has no dot leaders, no page numbers** | `StyleGuideDocument.tsx:80-119` — just `[number] [title]`, looks like a draft |
| 5 | **Cover footer shows "Page 1 of 19"** | Cover should be unnumbered (book convention) |
| 6 | **Tiny, hard-to-read swatch labels** | `styles.colorSwatchHex` is 9pt, `colorSwatchName` is 8pt centered under a 50px tile |
| 7 | **No section/chapter dividers** — chapters tumble into each other | A 1-pg "2.0 Brand Identity" intro on its own page, then 2.1, 2.2 on different pages, etc. Inconsistent rhythm |
| 8 | **Color "name" is always a generic descriptor** (`Dark Blue`, `Light Cyan`) | `analyzer.ts:46-102` — no semantic naming |
| 9 | **Brand boilerplate is AI-fabricated** ("To provide exceptional digital experiences through {domain}") | `analyzer.ts:526-528` |
| 10 | **No screenshot of the analyzed site** | A 1-page hero shot would dramatically increase perceived quality |

### A.2 PDF redesign — concrete changes

#### A.2.1 Embed real fonts (`style-guide-app/src/lib/pdf/fonts.ts`, new file)

> **Important** — `Font.register` does **not** resolve `/public/...` URL-style paths the way Next does. It needs either a real URL or an *absolute filesystem path*. Use `path.join(process.cwd(), 'public/fonts/...')` so the same code works in dev, in `next build`, and in the Railway container.

```ts
import { Font } from '@react-pdf/renderer';
import path from 'node:path';

const fontDir = path.join(process.cwd(), 'public/fonts');

// Self-host the .ttf files in /public/fonts/ (download from Google Fonts) so renderToBuffer
// in a Railway container does NOT depend on outbound network access at request time.
Font.register({
  family: 'Inter',
  fonts: [
    { src: path.join(fontDir, 'Inter-Regular.ttf'),  fontWeight: 400 },
    { src: path.join(fontDir, 'Inter-Medium.ttf'),   fontWeight: 500 },
    { src: path.join(fontDir, 'Inter-SemiBold.ttf'), fontWeight: 600 },
    { src: path.join(fontDir, 'Inter-Bold.ttf'),     fontWeight: 700 },
  ],
});
Font.register({
  family: 'Geist Mono',
  fonts: [
    { src: path.join(fontDir, 'GeistMono-Regular.ttf'), fontWeight: 400 },
    { src: path.join(fontDir, 'GeistMono-Medium.ttf'),  fontWeight: 500 },
  ],
});
// Disable hyphenation — react-pdf's default mangles compound words and URLs.
Font.registerHyphenationCallback((w) => [w]);
```

Then in [`style-guide-app/src/lib/pdf/styles.ts:5`](style-guide-app/src/lib/pdf/styles.ts):
```ts
import './fonts'; // side-effect import registers fonts
const FONT_SANS = 'Inter';
const FONT_MONO = 'Geist Mono';
```

`fonts.ts` should only be imported from server code (the API route + the styles module it pulls in). Don't import it from a client component or `next build` will try to bundle `node:path` for the browser.

Verify with the tester checklist in [§4](#4-tester-checklist).

#### A.2.2 New brand-blue token set (replace `colors` export)

```ts
// styles.ts — replace `colors` constant
export const colors = {
  // S3 brand
  brand:        '#2E9DF1',
  brandHover:   '#3E80B6',
  brandDeep:    '#2A5364',
  brandSoft:    '#C5DFF6',
  brandRing:    'rgba(46,157,241,0.22)',

  // Surfaces (s3labs neutrals)
  surface0:     '#FFFFFF',
  surface1:     '#F6FAFF',
  surface2:     '#EEF4FB',
  border:       '#DFE9F1',
  borderStrong: '#BEDEF9',

  // Text
  textPrimary:   '#09090B',
  textSecondary: '#52525B',
  textTertiary:  '#A1A1AA',

  // Semantic
  success: '#16A34A',
  warning: '#D97706',
  danger:  '#DC2626',
};
```

#### A.2.3 New cover page with S3 logo

Replace [`StyleGuideDocument.tsx:25-77`](style-guide-app/src/lib/pdf/StyleGuideDocument.tsx) `CoverPage`. **Do not** put `fs.readFileSync` at module top-level — module-load filesystem reads in App Router server modules can fire during build/lint passes where `process.cwd()` is wrong, and it'll break SSR/RSC boundaries. Read the logo in the route handler and pass it in via props.

```tsx
// api/generate-pdf/route.ts
import fs from 'node:fs/promises';
import path from 'node:path';

const logoDark = `data:image/png;base64,${(
  await fs.readFile(path.join(process.cwd(), 'public/brand/s3-logo-dark-bg.png'))
).toString('base64')}`;

const pdfBuffer = await renderToBuffer(
  React.createElement(StyleGuideDocument, { data, logoDark })
);
```

Then the document module accepts it as a prop — no filesystem access inside:

```tsx
// StyleGuideDocument.tsx
interface StyleGuideDocumentProps {
  data: StyleGuideData;
  logoDark: string; // data: URI
}

const CoverPage = ({ data, logoDark }: { data: StyleGuideData; logoDark: string }) => {
  const swatches = [
    ...(data.colors.primary || []),
    ...(data.colors.secondary || []),
  ].slice(0, 5);

  return (
    <Page size="A4" style={styles.coverPage}>
      {/* Top dark band — s3-tinted #0F2330 with a subtle radial */}
      <View style={styles.coverHero}>
        <Image src={logoDark} style={styles.coverLogo} />
        <Text style={styles.coverEyebrow}>STYLE GUIDE · {new Date().getFullYear()}</Text>
        <Text style={styles.coverTitle}>{data.brand.name}</Text>
        <Text style={styles.coverSubtitle}>Brand & Design Style Guide</Text>
      </View>

      {/* Mid band: large website screenshot (see §A.2.7) */}
      {data.meta.screenshot && (
        <Image src={data.meta.screenshot} style={styles.coverScreenshot} />
      )}

      {/* Color bar */}
      <View style={styles.coverColorBar}>
        {swatches.map((c, i) => (
          <View key={i} style={[styles.coverColorSwatch, { backgroundColor: c.hex }]} />
        ))}
      </View>

      {/* Meta — monospace, small caps feel */}
      <View style={styles.coverMeta}>
        <CoverMetaRow label="VERSION"     value={data.meta.version} />
        <CoverMetaRow label="GENERATED"   value={new Date(data.meta.analyzedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} />
        <CoverMetaRow label="SOURCE"      value={data.meta.domain} />
        <CoverMetaRow label="GENERATED BY" value="s3labs.tech" />
      </View>
      {/* No page footer on cover */}
    </Page>
  );
};
```

New cover styles to add to `styles.ts`:
```ts
coverPage: { fontFamily: FONT_SANS, backgroundColor: colors.surface0, padding: 0 },
coverHero: {
  backgroundColor: '#0F2330',                     // dark surface for the dark-bg logo
  paddingTop: 80, paddingHorizontal: 56, paddingBottom: 48,
},
coverLogo: { width: 72, height: 72, marginBottom: 56 },
coverEyebrow: {
  fontFamily: FONT_MONO, fontSize: 10, color: '#6FC5DA',
  letterSpacing: 1.2, marginBottom: 16,
},
coverTitle:    { fontSize: 56, fontWeight: 900, color: '#FFFFFF', letterSpacing: -1.2, lineHeight: 1.04 },
coverSubtitle: { fontSize: 16, fontWeight: 400, color: 'rgba(255,255,255,0.72)', marginTop: 12 },
coverScreenshot: {
  marginTop: -24, marginHorizontal: 56,                 // overlaps the hero band
  borderRadius: 12, borderWidth: 1, borderColor: colors.border,
  height: 280, objectFit: 'cover',
},
coverColorBar: { flexDirection: 'row', marginTop: 32, marginHorizontal: 56, gap: 4 },
coverColorSwatch: { flex: 1, height: 32, borderRadius: 4 },
coverMeta: { marginTop: 'auto', paddingHorizontal: 56, paddingBottom: 56 },
```

#### A.2.4 TOC with dot leaders + page numbers

The current TOC has no page numbers because page numbers aren't computed until render. Two clean options:

- **Easy:** ship without page numbers but add dot leaders for visual rhythm — replace each TOC row with `[number] [title] [····dots····] [page]`-shaped row, leaving the page column blank as a typography device.
- **Right:** use `<Link src="#section-id">` + react-pdf's `id` on Page sections, then post-process via `react-pdf`'s `renderToStream` callback. Skip on v1.

Implement the **Easy** option now. **Don't use `borderBottomStyle: 'dotted'`** — react-pdf's dotted borders render inconsistently across versions and platforms. Use repeated `·` (middle dot, U+00B7) glyphs in a flex-1 `<Text>` with `overflow: 'hidden'` instead. That's how virtually every printable PDF report does dot leaders.

```tsx
const LEADER = '·'.repeat(120); // overshoots, gets clipped by overflow: hidden

<View style={styles.tocItem}>
  <Text style={styles.tocNumber}>{item.num}</Text>
  <Text style={styles.tocTitle}>{item.title}</Text>
  <Text style={styles.tocDots} numberOfLines={1}>{` ${LEADER} `}</Text>
  <Text style={styles.tocPage}>{/* page number — fill via §A.2.4 "Right" later */}</Text>
</View>
```

```ts
tocItem:   { flexDirection: 'row', alignItems: 'baseline', marginBottom: 10 },
tocNumber: { width: 38, fontSize: 11, fontFamily: FONT_MONO, color: colors.textSecondary },
tocTitle:  { fontSize: 12, color: colors.textPrimary, fontWeight: 500 },
tocDots:   {
  flex: 1, marginHorizontal: 8, fontSize: 11, color: colors.border,
  overflow: 'hidden', letterSpacing: 1.5,
  // baseline trick: nudge the dots down to align with title's x-height
  transform: 'translateY(-2px)',
},
tocPage:   { fontSize: 11, fontFamily: FONT_MONO, color: colors.textSecondary, width: 24, textAlign: 'right' },
```

#### A.2.5 Page typography fixes

In [`style-guide-app/src/lib/pdf/styles.ts`](style-guide-app/src/lib/pdf/styles.ts):

- Remove `textAlign: 'justify'` from `paragraph` — switch to `textAlign: 'left'`.
- Body `lineHeight: 1.6 → 1.55`, fontSize stays at 11pt.
- Section title: 32pt bold, `letterSpacing: -0.5`, `marginBottom: 6`, accent rule `borderBottomColor: colors.brand` (was `grayBorder`), `borderBottomWidth: 2`.
- Subsection title: color `colors.brandDeep` (was `bluePrimary`) — the deep navy reads better at 22pt than bright blue.
- Subsubsection title: `letterSpacing: 0.4`, `textTransform: 'uppercase'`, fontSize 10pt — turns into a small-caps eyebrow that visually separates from the H2 above.
- Tables: change header background from the bright `#E8F4FD` to `colors.surface2` (`#EEF4FB`), with a 1px `borderStrong` bottom rule. Row dividers stay subtle.
- Add zebra striping on alternate `tableRow` (`backgroundColor: index % 2 ? colors.surface1 : 'transparent'`) — requires passing index into the row. The current example PDF already does this; preserve it but switch to the new neutrals.

#### A.2.6 Section dividers

Insert a half-page divider between major numbered sections (1, 2, 3, …). One file, reusable:

```tsx
const SectionDivider = ({ num, title }: { num: string; title: string }) => (
  <Page size="A4" style={[styles.page, { justifyContent: 'center', backgroundColor: colors.surface1 }]}>
    <Text style={{ fontFamily: FONT_MONO, fontSize: 12, color: colors.brand, letterSpacing: 1.5 }}>
      PART {num}
    </Text>
    <Text style={{ fontSize: 64, fontWeight: 900, color: colors.textPrimary, letterSpacing: -1.5, marginTop: 8 }}>
      {title}
    </Text>
  </Page>
);
```

Drop this between `<IntroductionPage>`/`<DesignPrinciplesPage>`/`<BrandIdentityPage>`/`<ContentStyleGuidePage>`/`<UIComponentsPage>`/`<LayoutPage>`/`<AccessibilityPage>`/`<ResourcesPage>` in [`StyleGuideDocument.tsx:1012-1032`](style-guide-app/src/lib/pdf/StyleGuideDocument.tsx).

#### A.2.7 Capture & embed a screenshot of the analyzed site

In [`analyzer.ts`](style-guide-app/src/lib/analyzer.ts) right after `await page.goto(...)` and `dismissPopups`:

```ts
const screenshotBuffer = await page.screenshot({
  type: 'jpeg',
  quality: 80,
  fullPage: false,
  clip: { x: 0, y: 0, width: 1920, height: 1200 },
});
const screenshotB64 = `data:image/jpeg;base64,${screenshotBuffer.toString('base64')}`;
```

Add `meta.screenshot?: string` to [`StyleGuideData`](style-guide-app/src/types/style-guide.ts) and pass it through. Use it on the cover and on a new "Visual Reference" page right after the cover.

#### A.2.8 Footer

Already conditional — keep it, but bump font to Geist Mono and shrink to 9pt:
```ts
footer: { ..., fontFamily: FONT_MONO, fontSize: 9, color: colors.textTertiary },
```
And gate it off the cover by giving the cover its own `<Page>` without `<PageFooter />`.

#### A.2.9 Logo file is bitmap — note for v2

The provided S3 logos are PNGs at ~217KB each. Fine for the PDF cover, but consider asking @Tom for an SVG to avoid pixelation if printed at A3+. Both PNGs in `~/Downloads/S3 Labs Logo Ideas*.png` appeared visually identical when inspected (both on dark backgrounds) — confirm with you whether one was meant to be a light-bg variant before treating either as "light".

---

## B. Website redesign — S3 Labs aesthetic

### B.1 Design tokens harvested from `s3labs.tech/colors_and_type.css`

These are the S3 brand tokens, verified by `curl`-ing the live stylesheet:

```
Brand:
  --brand:       #2E9DF1   ← primary accent (matches the logo's S)
  --brand-hover: #3E80B6
  --brand-deep:  #2A5364
  --brand-soft:  #C5DFF6
  --brand-ring:  rgba(46,157,241,0.22)

Surfaces (warm-blue tinted):
  --surface-0: #FFFFFF
  --surface-1: #F6FAFF
  --surface-2: #EEF4FB
  --surface-border:        #DFE9F1
  --surface-border-strong: #BEDEF9

Text:
  --text-primary:   #09090B
  --text-secondary: #52525B
  --text-tertiary:  #A1A1AA

Type:
  --font-sans: "Lato", system-ui, sans-serif      (300/400/700/900)
  --font-mono: "Geist Mono", ui-monospace, ...    (400/500/700)

Scale: display 36 / xl 22 / lg 17 / md 15 / base 14 / sm 13 / xs 12
Line-heights: tight 1.15 / snug 1.3 / base 1.5 / relaxed 1.65
Tracking: tight -0.015em / snug -0.005em / normal 0

Radii: sm 6 / md 8 / lg 12 / xl 16 / 2xl 20 / full

Motion: cubic-bezier(0.22, 1, 0.36, 1)   ease-out
Durations: fast 120ms / base 200ms / slow 320ms
```

**Notable:** S3 runs a *small* base size (14px) and a tight container (1024px max). That's the "less software" signature — restraint over visual weight. Match it.

### B.2 Adopt the tokens

Rewrite [`globals.css`](style-guide-app/src/app/globals.css) — replace the dark-mode default + DocBuildr colors with the S3 light theme:

```css
:root {
  /* Brand */
  --brand:        #2E9DF1;
  --brand-hover:  #3E80B6;
  --brand-deep:   #2A5364;
  --brand-soft:   #C5DFF6;
  --brand-ring:   rgba(46,157,241,0.22);

  /* Surfaces */
  --surface-0: #ffffff;
  --surface-1: #f6faff;
  --surface-2: #eef4fb;
  --surface-border: #dfe9f1;
  --surface-border-strong: #bedef9;

  /* Text */
  --text-primary:   #09090b;
  --text-secondary: #52525b;
  --text-tertiary:  #a1a1aa;

  /* Radii / motion / spacing — copy from s3labs token block */
  --radius-md: 8px; --radius-lg: 12px; --radius-2xl: 20px; --radius-full: 9999px;
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  --dur-fast: 120ms; --dur-base: 200ms; --dur-slow: 320ms;
}

html, body { background: var(--surface-0); color: var(--text-primary); }
body { font-family: var(--font-lato), system-ui, sans-serif; font-size: 14px; line-height: 1.5; }
```

Drop `gradient-text`, `pulse-glow`, `shimmer`, the dark glass header — they're DocBuildr leftovers.

### B.3 Swap the font stack in `layout.tsx`

Replace [`layout.tsx:5-15`](style-guide-app/src/app/layout.tsx):
```tsx
import { Lato, Geist_Mono } from 'next/font/google';

const lato = Lato({
  variable: '--font-lato',
  subsets: ['latin'],
  weight: ['300', '400', '700', '900'],
});
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});
```
Apply both variables to `<body>`. Remove Inter + Red Hat Display.

### B.4 Header — sticky blur with S3 lockup

Replace the header block in [`page.tsx:101-116`](style-guide-app/src/app/page.tsx):

```tsx
<header className="sticky top-0 z-20 h-14 border-b border-[color:var(--surface-border)] bg-white/80 backdrop-blur-xl">
  <div className="mx-auto flex h-full max-w-[1024px] items-center justify-between px-6">
    <a href="https://s3labs.tech" className="flex items-center gap-2.5">
      <img src="/brand/s3-logo-dark-bg.png" alt="" className="h-7 w-7 rounded-md" />
      <span className="text-[15px] font-black tracking-[-0.015em]">
        StyleSnap <span className="font-normal text-[color:var(--text-tertiary)]">/ s3labs.tech</span>
      </span>
    </a>
    <div className="flex items-center gap-3.5 font-mono text-xs text-[color:var(--text-tertiary)] tabular-nums">
      <span className="inline-flex items-center gap-1.5 font-sans text-xs font-bold text-[color:var(--text-secondary)]">
        <span className="status-dot" /> Live · v0.2
      </span>
      <span className="text-[color:var(--surface-border-strong)]">·</span>
      <a href="https://github.com/TomsTools11/styleguidegenerator" className="hover:text-[color:var(--text-primary)]">GitHub</a>
    </div>
  </div>
</header>
```

Add the breathing dot to `globals.css`:
```css
.status-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--brand);
  box-shadow: 0 0 0 4px var(--brand-ring);
  animation: status-breath 2.4s var(--ease-out) infinite;
}
@keyframes status-breath {
  0%, 100% { opacity: .85; }
  50%      { opacity: 1; box-shadow: 0 0 0 6px var(--brand-ring); }
}
```

> **Naming note** — this is inferred, not verified. The s3labs.tech portfolio page (per a fetched summary) lists a tool called "StyleSnap · in progress"; the current header on the deployed site says "Style Guide Generator" / "DocBuildr". Confirm the canonical name before changing copy. The plan uses **StyleSnap** as a placeholder; if it's something else, swap it in three places (header, footer, `<title>` in `layout.tsx:18`).

### B.5 Hero — the s3labs "aura"

Rewrite the hero (`page.tsx:118-280`). Strip the gradient title, the "Sparkles" pill, and the mock-PDF carousel; keep one strong headline + the URL field + the example chips.

```tsx
<section className="relative overflow-hidden pt-[88px] pb-[72px]">
  {/* aura */}
  <div className="pointer-events-none absolute inset-0 opacity-70
    bg-[radial-gradient(640px_360px_at_78%_20%,var(--brand-soft)_0%,transparent_60%),radial-gradient(520px_320px_at_8%_110%,rgba(46,157,241,.08)_0%,transparent_65%)]" />
  {/* grid mesh, masked to fade out */}
  <div className="pointer-events-none absolute inset-0 opacity-[.18]
    [background-image:linear-gradient(135deg,var(--surface-border)_1px,transparent_1px)]
    [background-size:22px_22px]
    [mask-image:radial-gradient(ellipse_70%_60%_at_50%_30%,#000_30%,transparent_75%)]" />

  <div className="relative mx-auto max-w-[1024px] px-6">
    {/* eyebrow */}
    <div className="mb-7 flex items-center gap-2.5 font-mono text-xs text-[color:var(--text-secondary)]">
      <span className="rounded-full bg-[color:var(--brand-soft)] px-2 py-0.5 font-sans text-[11px] font-bold uppercase tracking-[.04em] text-[color:var(--brand-deep)]">
        New
      </span>
      <span>style guides from any URL · ~30s · free</span>
    </div>

    {/* headline — Lato Black, tight */}
    <h1 className="mb-5 max-w-[14ch] font-sans text-[clamp(40px,6.6vw,76px)] font-black leading-[1.04] tracking-[-0.025em] text-[color:var(--brand)]">
      Style guides
      <span className="block text-[color:var(--text-tertiary)]">from any website.</span>
    </h1>

    <p className="mb-9 max-w-[56ch] text-[18px] leading-[1.55] text-[color:var(--text-secondary)]">
      Drop in a URL, get a polished, branded PDF style guide — colors, typography,
      components, accessibility — in about thirty seconds. No account.
    </p>

    {/* form */}
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2.5">
      <input
        type="url"
        inputMode="url"
        autoComplete="url"
        placeholder="stripe.com"
        value={url}
        onChange={(e) => { setUrl(e.target.value); setError(''); }}
        className="h-[42px] w-full max-w-[420px] rounded-md border border-[color:var(--surface-border)]
          bg-white px-4 font-mono text-[15px] text-[color:var(--text-primary)]
          placeholder:text-[color:var(--text-tertiary)]
          focus:outline-none focus:ring-2 focus:ring-[color:var(--brand-ring)] focus:border-[color:var(--brand)]"
      />
      <button type="submit" disabled={isLoading}
        className="inline-flex h-[42px] items-center gap-2 rounded-md border border-[color:var(--brand)]
          bg-[color:var(--brand)] px-[18px] text-[15px] font-bold text-[color:var(--brand-deep)]
          transition-[background-color] duration-200
          hover:bg-[color:var(--brand-hover)] hover:border-[color:var(--brand-hover)]
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand-ring)]">
        {isLoading ? 'Analyzing…' : 'Generate'}
        <span className="arrow">→</span>
      </button>
      <span className="ml-1 font-mono text-xs text-[color:var(--text-tertiary)]">
        {url.length > 0 ? `${url.length} chars` : 'free · no account'}
      </span>
    </form>

    {error && <p className="mt-3 text-sm text-[color:var(--danger,#DC2626)]">{error}</p>}

    {/* examples */}
    <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-[color:var(--text-tertiary)]">
      <span className="font-mono">try</span>
      {['stripe.com', 'notion.so', 'linear.app', 'vercel.com'].map((ex) => (
        <button key={ex} type="button" onClick={() => setUrl(ex)}
          className="rounded-full border border-[color:var(--surface-border)] bg-white px-2.5 py-1
            font-mono text-[12px] text-[color:var(--text-secondary)]
            hover:border-[color:var(--surface-border-strong)] hover:text-[color:var(--text-primary)]">
          {ex}
        </button>
      ))}
    </div>
  </div>
</section>
```

### B.6 "How it works" — match the s3labs 3-step layout

Replace the bordered-tile "How it Works" block with three numbered, monospace steps stacked side-by-side under one rule:

```
┌── 01 ─────── 02 ─────── 03 ──┐
│ Drop URL    Analyze    Download
│ stripe.com  ~30s       19-page PDF
└──────────────────────────────┘
```

Use Geist Mono for the `01 / 02 / 03`, Lato Bold for titles, Lato Regular for descriptions. No heavy cards. Match s3labs's restrained step list.

### B.7 Featured product card

Replace the "What's Included" + glow block with one s3labs-style featured card (single, two-column, bordered, 20px radius, subtle shadow) showing:
- left: pitch + bullet list of what's in the PDF
- right: a real PDF preview (use [`react-pdf`'s viewer](https://react-pdf.org) or just a screenshot of the cover JPEG generated server-side after analyze)

### B.8 Processing page — same aesthetic

In [`processing/page.tsx`](style-guide-app/src/app/processing/page.tsx) replace the dark glass surface with the same light surface; replace the colored step pills (green/blue/red) with monospace step rows showing live status. Use `var(--brand-soft)` for the active row background, a thin `var(--brand)` rule for progress.

Key principle: **mirror s3labs's `monospace = technical detail, sans = headlines`** rule throughout. URLs, file sizes, byte counts, durations, page counts → Geist Mono. Everything else → Lato.

### B.9 Footer

```tsx
<footer className="mt-32 border-t border-[color:var(--surface-border)] py-10">
  <div className="mx-auto flex max-w-[1024px] flex-col items-start justify-between gap-3 px-6 md:flex-row md:items-center">
    <div className="flex items-center gap-2.5">
      <img src="/brand/s3-logo-dark-bg.png" alt="" className="h-6 w-6 rounded" />
      <span className="font-mono text-xs text-[color:var(--text-tertiary)]">
        StyleSnap · part of <a href="https://s3labs.tech" className="text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]">s3labs.tech</a>
      </span>
    </div>
    <p className="font-mono text-xs text-[color:var(--text-tertiary)]">
      Made with ❤ by Tom in Milwaukee, WI
    </p>
  </div>
</footer>
```

---

## C. UX, bugs & performance

### C.1 Must-fix bugs (block the redesign on these)

#### C.1.1 Demo-data fallback misleads real users

[`processing/page.tsx:126-145`](style-guide-app/src/app/processing/page.tsx) currently runs a parallel `setInterval` that, *if* the analyze API hasn't returned a `jobId` within a few hundred ms, redirects to `/results?demo=true`. The results page then **fabricates** a TomsMCPs/Inter style guide regardless of which URL was entered. A user who asks for `notion.so` can be silently shown a TomsMCPs-themed PDF.

**Fix**: delete the demo branch entirely; let the analyze API drive everything. If you want a "demo" link, make it a separate `?demo=stripe.com` route that always shows a known-good cached payload.

```tsx
// processing/page.tsx — DELETE this whole block
useEffect(() => {
  if (!jobId && !error && url) {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          router.push(`/results?url=${encodeURIComponent(url)}&demo=true`);
          return 100;
        }
        // …
```

#### C.1.2 Fake step progression

[`api/analyze/route.ts:44-69`](style-guide-app/src/app/api/analyze/route.ts) advances the status (`fetching → extracting_colors → extracting_typography → identifying_components`) via `setTimeout(500ms)` calls **before** `analyzeWebsite()` runs. So the UI claims four steps are done in ~2 seconds while Playwright is still booting.

**Fix**: emit status updates from inside `analyzer.ts` after each real step. Pass a `(status, progress) => updateJob(...)` callback into `analyzeWebsite`:

```ts
// analyzer.ts
export async function analyzeWebsite(url: string, onStep?: (s: string, p: number) => void) {
  onStep?.('fetching', 5);
  // … goto …
  onStep?.('fetching', 25);
  // … screenshot + scroll + dismiss popups …
  onStep?.('extracting_colors', 45);
  const styles = await extractStyles(page);
  onStep?.('extracting_typography', 65);
  const typography = processTypography(styles);
  onStep?.('identifying_components', 80);
  const data = buildStyleGuideData(...);
  onStep?.('generating_pdf', 95);
  return data;
}
```
Then the route just wires `(status, progress) => updateJob(jobId, { status, progress })`. Drop all the `await sleep(500)` calls.

#### C.1.3 In-memory job store leaks and resets

[`job-store.ts`](style-guide-app/src/lib/job-store.ts) is a `Map` on `globalThis`. Two issues:
- Railway redeploys lose every in-flight job → user gets stuck on the processing page.
- Nothing ever evicts entries → memory grows unbounded as the tool scales.

**Fix v1** (cheap): add a 10-min TTL sweep:
```ts
setInterval(() => {
  const cutoff = Date.now() - 10 * 60 * 1000;
  for (const [id, job] of jobStore) {
    if (new Date(job.createdAt).getTime() < cutoff) jobStore.delete(id);
  }
}, 60 * 1000).unref();
```
**Fix v2** (proper): store jobs in Redis (Railway has a 1-click Redis add-on) or in a SQLite/Postgres table. Sketch:
```ts
// jobs/redis-store.ts
import { createClient } from 'redis';
const r = createClient({ url: process.env.REDIS_URL });
await r.connect();
export const setJob = (id, j) => r.set(`job:${id}`, JSON.stringify(j), { EX: 600 });
export const getJob = async (id) => JSON.parse((await r.get(`job:${id}`)) ?? 'null');
```

#### C.1.4 `javascript:` and `file:` URL bypass

[`api/analyze/route.ts:14-19`](style-guide-app/src/app/api/analyze/route.ts) accepts anything `new URL()` can parse, so `javascript:alert(1)` and `file:///etc/passwd` slip through. Playwright's `page.goto('javascript:…')` will then *execute* the script in the headless browser. Same for `chrome://settings`.

**Fix**: enforce `https?:` and reject private network targets:
```ts
const parsed = new URL(input);
if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Only http(s) URLs allowed');

// Optional but recommended: block local & RFC1918 ranges to prevent SSRF.
const host = parsed.hostname.toLowerCase();
if (
  host === 'localhost' || host.endsWith('.local') ||
  /^127\./.test(host) || /^10\./.test(host) || /^192\.168\./.test(host) || /^169\.254\./.test(host) ||
  /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)
) throw new Error('Private network not allowed');
```

#### C.1.5 PDF generation route doesn't validate input

[`api/generate-pdf/route.ts:10-21`](style-guide-app/src/app/api/generate-pdf/route.ts) accepts the entire `StyleGuideData` from the client, which means anyone can POST 50MB of arbitrary data and pin a Node process for tens of seconds. Validate with Zod (already a dep):
```ts
const result = StyleGuideDataSchema.safeParse(body.data);
if (!result.success) return NextResponse.json({ error: 'Invalid' }, { status: 400 });
```
Or simpler: drop `/api/generate-pdf` and have `/api/results/[id]` return the PDF directly — no client-controlled input at all.

#### C.1.6 `<img>` instead of `<Image>` and `noindex`

- Replace the `/docbuildr-logo.svg` reference and the four `<img>` tags with `next/image` so Next ships a sized + lazy version.
- Add OpenGraph tags & a real description in `layout.tsx:17-20`. The current `description: "Generate professional style guides from any website"` is fine but the title is just `"Style Guide Generator"` — make it `"StyleSnap — Style guides from any website · S3 Labs"` and add `metadata.openGraph` with the cover screenshot.

### C.2 Should-fix UX issues

| # | Issue | Where | Fix |
|---|-------|-------|-----|
| 1 | URL field accepts non-URL text but only validates `try { new URL() }` after click | `page.tsx:27-49` | Use `<input type="url">`, debounce a live-validation check, show a green checkmark when parseable |
| 2 | "Estimated time remaining" is fake | `processing/page.tsx:374` | Either show real elapsed (`Date.now() - startedAt`) or drop it |
| 3 | Tip card says "color palettes, typography, …" — vague | `processing/page.tsx:362-368` | Show the actual current step's verb in active voice ("Pulling colors from `notion.so`…") |
| 4 | Examples are plain anchors that just paste into the field — no instant submit | `page.tsx:196-205` | Add a one-click "Try it" that auto-submits |
| 5 | After download there's no "regenerate" or "share" option | `results/page.tsx` | Add a "Copy share link" button (links back to the cached job) and a "Re-run" button (forces re-analysis) |
| 6 | Color preview shows hex but isn't click-to-copy | `results/page.tsx:364-380` | Wrap each swatch in a `button` that copies hex to clipboard with a fade-out toast |
| 7 | Real PDF preview is missing — page shows a fake mock cover | `results/page.tsx:222-265` | Either embed `<embed src={`/api/results/${jobId}/pdf#view=Fit`} />` or a generated cover PNG (cheaper) |
| 8 | No mobile-keyboard hints | `page.tsx:158` | Add `inputMode="url" autoComplete="url" autoCapitalize="off" spellCheck={false}` |
| 9 | "19 pages total" is hardcoded and brittle | `page.tsx:275`, `results/page.tsx:155,229` | Compute from the actual document or expose `data.meta.pageCount` |
| 10 | `setError('')` runs on every keystroke even when there is no error — minor jitter | `page.tsx:161-163` | Only clear when `error` is non-empty |

### C.3 Analyzer quality

| # | Issue | Where | Fix |
|---|-------|-------|-----|
| 1 | Iterates `document.querySelectorAll('*')` and reads computed styles for every node — slow + noisy | `analyzer.ts:313-345` | Sample N=200 most-visible elements (use `IntersectionObserver` or `getBoundingClientRect()` filtering); or restrict to `body > *, h1..h6, button, a, [role]` |
| 2 | External stylesheets fail silently due to CORS, so Tailwind sites lose tokens | `analyzer.ts:347-374` | Already swallows errors; *additionally* fall back to fetching each stylesheet via the route handler (server-side, no CORS) and parsing tokens there |
| 3 | Color frequency dedup but no perceptual clustering — neighbors like `#0D91FD`/`#0E92FE` count separately | `analyzer.ts:386-419` | Run a small k-means in LAB space (chroma-js or a 30-line custom impl); cluster to ~8 buckets, pick centroid |
| 4 | "Color name" is hand-rolled hue/lightness logic and produces rough labels | `analyzer.ts:46-102` | Use [`color-namer`](https://www.npmjs.com/package/color-namer) (~50KB, ships ntc + Pantone-ish names) |
| 5 | Brand boilerplate is fabricated | `analyzer.ts:526-528` | Either omit the mission/vision section in v1, or generate it with a single Claude/OpenAI call from the page's `<title>` + `<meta description>` + first H1 |
| 6 | `processTypography` invents a type scale from sorted unique sizes | `analyzer.ts:421-482` | Cluster sizes too (k-means k=6); attach the most common element selector that actually uses each size as evidence |
| 7 | Hardcoded `domcontentloaded + 2s wait` misses heavy SPAs | `analyzer.ts:166-172` | Try `networkidle` with a 10s budget, fall back to `domcontentloaded` + `waitForFunction(() => document.fonts.ready)` |
| 8 | No caching by URL | analyze route | Hash `(domain, normalizedPath)`, cache the resulting `StyleGuideData` JSON for 24h. A re-request returns instantly. Massive cost saver on Railway |

### C.4 Build & deploy

- [`Dockerfile`](Dockerfile) — confirm it runs `npx playwright install chromium --with-deps` once at build, not per-request. Recent commit history (`d15ddfc`) suggests this is already done — verify the image isn't downloading Chromium at boot (kills cold starts on Railway).
- Add `NEXT_TELEMETRY_DISABLED=1` to env.
- Add a `/api/health` route returning 200 + uptime so Railway's health-check stops bouncing the container.
- Add a basic rate limit (e.g. `@upstash/ratelimit` keyed by IP — 10 analyses/hour) — your blog post about this will get traffic and a free tool with a Playwright backend is an attractive nuisance.
- Telemetry: drop in [PostHog](https://posthog.com) or [Plausible](https://plausible.io) — one snippet in `layout.tsx`. Track `analyze_started`, `analyze_completed`, `pdf_downloaded`, with the host of the analyzed URL.

### C.5 Repo hygiene

- Delete `style-guide-app/public/{file,globe,next,vercel,window}.svg` — they're CRA/Next leftovers.
- Move `docbuildr-logo.svg` to `public/legacy/` or delete it and the `<img>` reference.
- `PROGRESS.md` and `style-guide-generator-web-app-plan.md` are 15K+ stale planning docs at repo root — archive into a `docs/archive/` folder or delete.
- `example-styleguide.pdf` should live in `docs/` not at root.
- Add a `CONTRIBUTING.md` if you plan to take PRs (you have one open from a Claude bot already, per the merge log).

---

## 4. Tester checklist

Before merging the redesign:

**PDF**
- [ ] Cover renders the S3 logo at 72×72 and dark-band #0F2330 backdrop, no page footer.
- [ ] Body uses Inter (not Helvetica) — confirm by reading the PDF's `/Font` dictionary or visual diff against a known Inter sample.
- [ ] Body text is left-aligned, no rivers, no broken hyphenation in URLs.
- [ ] TOC has dotted leaders that align across all rows.
- [ ] Section dividers appear before parts 1, 2, 3, 4, 5, 6, 7.
- [ ] Color swatches have legible hex (≥10pt) and name.
- [ ] Tables zebra-stripe with `surface1` rows, no harsh `#E8F4FD` headers.
- [ ] Render on five sites — `stripe.com`, `notion.so`, `linear.app`, `s3labs.tech`, `vercel.com` — and verify each PDF's primary color matches the site's actual brand.

**Web**
- [ ] All text is Lato; all `01/02/03`-style numerals + URL field are Geist Mono.
- [ ] Aura gradient + grid mesh visible behind hero, fades cleanly at 75%.
- [ ] Status dot in header breathes (animation runs).
- [ ] Submitting `javascript:alert(1)` returns a 400, not a busy spinner.
- [ ] Submitting `localhost:3000` is rejected (SSRF guard).
- [ ] Killing the API mid-analyze surfaces the error on the processing page within 5s — no demo-fallback redirect.
- [ ] Refreshing the processing page after the analyze server restarts shows a clear "job lost, please retry" rather than spinning forever.
- [ ] Lighthouse score ≥ 95 on the home page.

---

## 5. Suggested rollout order

1. **Day 1 AM** — Land §C.1.1, §C.1.2, §C.1.4 (the three correctness bugs). One PR, no design changes.
2. **Day 1 PM** — §A.2.1–A.2.5: fonts, cover, TOC, body fixes. Visual diff vs. example PDF.
3. **Day 2 AM** — §A.2.6–A.2.8: dividers + screenshot capture + footer.
4. **Day 2 PM** — §B.1–B.5: tokens, fonts, header, hero. Ship behind a `?redesign=1` flag, a/b in your head for an hour, then default-on.
5. **Day 3 AM** — §B.6–B.9: how-it-works, featured card, processing page, footer.
6. **Day 3 PM** — §C.2 polish + §C.4 deploy hardening.
7. **Week 2** — §C.3 analyzer quality (k-means clusters, caching). Highest leverage on perceived output quality but the most algorithmic work.

---

## 6. Open questions for you

1. **Light vs. dark site — this is a blocker for §B.** The s3labs *default* aesthetic is light; the logo you provided is dark-bg only; you said "use the blue in the logo" *and* "incorporate the logo for dark backgrounds." Those steers point in different directions, so the plan picked a middle path (mostly light, dark `#0F2330` tile around the logo). That may not be what you wanted. Three coherent options — pick one before §B starts:
   - **(a) Mostly light, dark logo tile** — what's drafted above. Closest to s3labs.tech's actual look. Good if your goal is "feel like a sibling product to DropDoc."
   - **(b) Fully dark site** — mirror s3labs's `@media (prefers-color-scheme: dark)` block: `#0a0a0a` surfaces, `#6FC5DA` brand variant, logo on its native dark backdrop everywhere. Stronger logo presence; further from s3labs's default.
   - **(c) Light hero / dark footer + sections** — alternating bands. Most flexibility for showcasing the logo, more design risk.
2. **Logo file format.** Both attached PNGs were dark-bg variants and visually identical to me. Confirm whether you have an SVG and a true light-bg variant, or if you want me to derive one (the logo on a transparent or white background) before we ship the PDF cover.
3. **Product name.** Header currently says "Style Guide Generator"; s3labs calls it "StyleSnap"; this plan uses **StyleSnap**. Confirm.
4. **Mission/vision boilerplate.** Currently fabricated. OK to (a) drop those sections from the PDF, (b) leave them as obvious placeholders the user fills in, or (c) wire up a one-shot LLM call (Anthropic key needed)?
5. **Auth & rate limit.** Are you OK keeping it 100% free + anonymous (recommended for the s3labs ethos), or do you want lightweight email-gated rate limiting for the eventual scale?
