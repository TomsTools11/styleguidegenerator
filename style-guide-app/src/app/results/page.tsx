'use client';

import { NavLogo } from '@/components/style-snap/NavLogo';
import { useEffect, useMemo, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Download,
  ArrowLeft,
  Palette,
  Type,
  Layout,
  FileText,
  Check,
  ExternalLink,
  RefreshCw,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { StyleGuideData, Color } from '@/types/style-guide';

const TOC: [string, string, string][] = [
  ['01', 'Cover & introduction', '01'],
  ['02', 'Brand identity',       '03'],
  ['03', 'Color palette',        '05'],
  ['04', 'Typography system',    '08'],
  ['05', 'UI components',        '11'],
  ['06', 'Layout & grid',        '13'],
  ['07', 'Accessibility',        '15'],
];

const INCLUDED = [
  'Cover page & table of contents',
  'Brand identity guidelines',
  'Color palette with hex / RGB / HSL',
  'Typography specifications',
  'UI component library',
  'Layout & grid system',
  'Accessibility report',
  'Resource links',
];

const TOTAL_PDF_PAGES = 19;

function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlParam = searchParams.get('url');

  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [styleGuideData, setStyleGuideData] = useState<StyleGuideData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(0); // 0 = cover, 1 = TOC
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (!urlParam) {
      setError('No URL provided');
      setIsLoading(false);
      return;
    }
    try {
      const cached = sessionStorage.getItem(`stylesnap:${urlParam}`);
      if (cached) {
        setStyleGuideData(JSON.parse(cached) as StyleGuideData);
      } else {
        setError(
          'Style guide not found in this session. Please run the analysis again.',
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load results');
    } finally {
      setIsLoading(false);
    }
  }, [urlParam]);

  const allColors = useMemo<Color[]>(() => {
    if (!styleGuideData) return [];
    return [
      ...(styleGuideData.colors.primary || []),
      ...(styleGuideData.colors.secondary || []),
      ...(styleGuideData.colors.text || []),
      ...(styleGuideData.colors.background || []),
    ];
  }, [styleGuideData]);

  const stats = useMemo(() => {
    if (!styleGuideData) return null;
    const colorCount =
      (styleGuideData.colors.primary?.length || 0) +
      (styleGuideData.colors.secondary?.length || 0) +
      Object.values(styleGuideData.colors.system || {}).filter(Boolean).length;
    const typeFaces = [
      styleGuideData.typography.primaryFont,
      styleGuideData.typography.secondaryFont,
      styleGuideData.typography.monospaceFont,
    ].filter(Boolean).length;
    const components =
      (styleGuideData.uiComponents.buttons?.variants?.length || 0) +
      (styleGuideData.uiComponents.cards?.length || 0) +
      (styleGuideData.uiComponents.forms?.length || 0) +
      (styleGuideData.uiComponents.navigation?.length || 0);
    return [
      { num: colorCount, label: 'Colors', Icon: Palette },
      { num: typeFaces, label: 'Type faces', Icon: Type },
      { num: components, label: 'Components', Icon: Layout },
      { num: TOTAL_PDF_PAGES, label: 'Pages', Icon: FileText },
    ];
  }, [styleGuideData]);

  const handleDownload = async () => {
    if (!styleGuideData) return;
    setIsDownloading(true);
    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: styleGuideData }),
      });
      if (!response.ok) throw new Error('Failed to generate PDF');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${styleGuideData.meta.domain || 'style-guide'}-style-guide.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      alert('Failed to download PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const copyHex = async (hex: string) => {
    try {
      await navigator.clipboard?.writeText(hex);
    } catch {
      // ignore — visual feedback still fires
    }
    setCopied(hex);
    setTimeout(() => setCopied(null), 1400);
  };

  if (isLoading) {
    return (
      <main
        className="ss-main"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <Loader2
            className="spin"
            size={32}
            color="var(--brand)"
            style={{ display: 'block', margin: '0 auto 12px' }}
          />
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Loading your style guide…
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <>
        <header className="ss-header">
          <div className="ss-header-inner">
            <a href="/" className="ss-brand-link" aria-label="StyleSnap">
              <NavLogo />
            </a>
          </div>
        </header>
        <main className="ss-main">
          <div className="ss-narrow" style={{ paddingTop: 80, textAlign: 'center' }}>
            <div
              className="out-checkmark"
              style={{
                background: 'rgba(220,38,38,0.12)',
                borderColor: 'rgba(220,38,38,0.4)',
                color: 'var(--danger)',
              }}
            >
              <FileText size={28} strokeWidth={2.2} />
            </div>
            <h1 className="out-h1">Unable to load results</h1>
            <p className="out-sub">{error}</p>
            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => router.push('/')}
                className="ss-btn ss-btn-primary ss-btn-auto"
              >
                <ArrowLeft size={16} /> Try another URL
              </button>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!styleGuideData || !stats) return null;

  const generatedDate = new Date(styleGuideData.meta.analyzedAt).toLocaleDateString(
    'en-US',
    { year: 'numeric', month: 'short', day: 'numeric' },
  );

  return (
    <>
      <header className="ss-header">
        <div className="ss-header-inner">
          <a href="/" className="ss-brand-link" aria-label="StyleSnap">
            <NavLogo />
          </a>
          <a href="/" className="ss-link-btn">
            <RefreshCw size={14} />
            New analysis
          </a>
        </div>
      </header>

      <main className="ss-main" style={{ paddingBottom: 80 }}>
        <div className="ss-container">
          {/* Hero */}
          <section className="out-hero">
            <span className="out-checkmark">
              <Check size={28} strokeWidth={2.5} />
            </span>
            <h1 className="out-h1">
              Your style guide <span className="accent">is ready</span>
            </h1>
            <p className="out-sub">
              We&rsquo;ve analyzed{' '}
              <span className="mono">{styleGuideData.meta.domain}</span> and built
              a comprehensive {TOTAL_PDF_PAGES}-page style guide document.
            </p>
          </section>

          {/* Stats */}
          <section className="out-stats">
            {stats.map((s) => (
              <div key={s.label} className="stat-tile">
                <span className="stat-tile-icon">
                  <s.Icon size={16} />
                </span>
                <div className="stat-tile-num">{s.num}</div>
                <div className="stat-tile-label">{s.label}</div>
              </div>
            ))}
          </section>

          {/* Two-column: PDF preview + side */}
          <section className="out-grid">
            <div className="ss-card">
              <div className="ss-card-head">
                <span className="ss-card-h">
                  <span className="dot" />
                  PDF preview
                </span>
                <span className="ss-card-meta">
                  {TOTAL_PDF_PAGES} pages · A4
                </span>
              </div>
              <div className="pdf-stage">
                {page === 0 ? (
                  <PdfCover
                    title={styleGuideData.brand.name}
                    domain={styleGuideData.meta.domain}
                    version={styleGuideData.meta.version}
                    generatedDate={generatedDate}
                    swatches={(styleGuideData.colors.primary || []).slice(0, 3)}
                  />
                ) : (
                  <PdfTOC domain={styleGuideData.meta.domain} />
                )}
              </div>
              <div className="pdf-pager">
                <button
                  type="button"
                  className="pdf-pager-btn"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="pdf-pager-pos">
                  {String(page + 1).padStart(2, '0')} / {TOTAL_PDF_PAGES}
                </span>
                <button
                  type="button"
                  className="pdf-pager-btn"
                  onClick={() => setPage((p) => Math.min(1, p + 1))}
                  disabled={page === 1}
                  aria-label="Next page"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            <div className="side-stack">
              <div className="ss-card">
                <div className="ss-card-body">
                  <div className="ss-card-h" style={{ marginBottom: 8 }}>
                    Download
                  </div>
                  <p
                    style={{
                      margin: '0 0 16px',
                      fontSize: 13.5,
                      color: 'var(--text-tertiary)',
                      lineHeight: 1.55,
                    }}
                  >
                    Get your professionally formatted PDF style guide, ready to
                    share with your team.
                  </p>
                  <button
                    type="button"
                    className="ss-btn ss-btn-primary"
                    onClick={handleDownload}
                    disabled={isDownloading}
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 size={14} className="spin" />
                        Preparing…
                      </>
                    ) : (
                      <>
                        <Download size={16} />
                        Download PDF
                      </>
                    )}
                  </button>
                  <div className="dl-summary">
                    <span>
                      {styleGuideData.meta.domain || 'style-guide'}-style-guide.pdf
                    </span>
                    <span>PDF · A4</span>
                  </div>
                </div>
              </div>

              <div className="ss-card">
                <div className="ss-card-body">
                  <div className="ss-card-h" style={{ marginBottom: 14 }}>
                    What&rsquo;s included
                  </div>
                  <ul className="included-list">
                    {INCLUDED.map((item) => (
                      <li key={item}>
                        <span className="ic-check">
                          <Check size={11} strokeWidth={2.4} />
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="ss-card">
                <div className="ss-card-body">
                  <div className="ss-card-h" style={{ marginBottom: 12 }}>
                    Source
                  </div>
                  <div className="source-row">
                    <span className="glo">
                      <ExternalLink size={14} />
                    </span>
                    <a
                      href={styleGuideData.meta.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {styleGuideData.meta.domain}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Color palette */}
          <section className="ss-card" style={{ marginTop: 20 }}>
            <div className="ss-card-head">
              <span className="ss-card-h">
                <span className="dot" />
                Extracted color palette
              </span>
              <span className="ss-card-meta">
                {allColors.length} tokens · click to copy
              </span>
            </div>
            <div className="ss-card-body">
              <div className="palette-grid">
                {allColors.slice(0, 10).map((color) => (
                  <button
                    key={`${color.hex}-${color.name}`}
                    type="button"
                    className="palette-cell"
                    onClick={() => copyHex(color.hex)}
                  >
                    <span
                      className="palette-swatch"
                      style={{ background: color.hex }}
                    >
                      <span className="copy">
                        {copied === color.hex ? 'Copied' : 'Copy hex'}
                      </span>
                    </span>
                    <span className="palette-meta">
                      <span className="palette-hex">{color.hex}</span>
                      <span className="palette-name">{color.name}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Typography */}
          <section className="ss-card" style={{ marginTop: 20 }}>
            <div className="ss-card-head">
              <span className="ss-card-h">
                <span className="dot" />
                Typography system
              </span>
              <span className="ss-card-meta">
                {[
                  styleGuideData.typography.primaryFont,
                  styleGuideData.typography.secondaryFont,
                  styleGuideData.typography.monospaceFont,
                ].filter(Boolean).length}{' '}
                families
              </span>
            </div>
            <div className="ss-card-body">
              <div className="type-grid">
                <div className="type-cell">
                  <div className="type-eyebrow">Primary · headings &amp; body</div>
                  <div
                    className="type-name"
                    style={{
                      fontFamily: styleGuideData.typography.primaryFont?.name,
                    }}
                  >
                    {styleGuideData.typography.primaryFont?.name || 'Inter'}
                  </div>
                  <div className="type-stack">
                    {styleGuideData.typography.primaryFont?.fallback ||
                      'system-ui, sans-serif'}
                  </div>
                </div>
                {(styleGuideData.typography.secondaryFont ||
                  styleGuideData.typography.monospaceFont) && (
                  <div className="type-cell">
                    <div className="type-eyebrow">
                      {styleGuideData.typography.monospaceFont
                        ? 'Mono · code & identifiers'
                        : 'Secondary · accents'}
                    </div>
                    <div
                      className="type-name"
                      style={{
                        fontFamily:
                          styleGuideData.typography.monospaceFont?.name ??
                          styleGuideData.typography.secondaryFont?.name,
                      }}
                    >
                      {styleGuideData.typography.monospaceFont?.name ??
                        styleGuideData.typography.secondaryFont?.name}
                    </div>
                    <div className="type-stack">
                      {styleGuideData.typography.monospaceFont?.fallback ??
                        styleGuideData.typography.secondaryFont?.fallback}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          <div className="out-nav-row">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="ss-btn ss-btn-ghost ss-btn-auto"
            >
              <RefreshCw size={14} /> Run another
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className="ss-btn ss-btn-primary ss-btn-auto"
            >
              {isDownloading ? (
                <>
                  <Loader2 size={14} className="spin" /> Preparing…
                </>
              ) : (
                <>
                  <Download size={16} /> Download PDF
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </>
  );
}

function PdfCover({
  title,
  domain,
  version,
  generatedDate,
  swatches,
}: {
  title: string;
  domain: string;
  version: string;
  generatedDate: string;
  swatches: Color[];
}) {
  return (
    <div className="pdf-page">
      <h2 className="pdf-cover-title">{title}</h2>
      <p className="pdf-cover-sub">Brand &amp; design style guide</p>
      <div className="pdf-cover-swatches">
        {swatches.length === 0
          ? ['#212529', '#057BE5', '#00172D'].map((hex) => (
              <span key={hex} className="sw" style={{ background: hex }} />
            ))
          : swatches.map((c) => (
              <span
                key={c.hex}
                className="sw"
                style={{ background: c.hex }}
              />
            ))}
      </div>
      <div className="pdf-cover-rule" />
      <div style={{ flex: 1 }} />
      <div className="pdf-foot">
        <span><b>Version:</b> {version}</span>
        <span><b>Generated:</b> {generatedDate}</span>
        <span><b>Source:</b> {domain}</span>
      </div>
    </div>
  );
}

function PdfTOC({ domain }: { domain: string }) {
  return (
    <div className="pdf-page">
      <h2 className="pdf-cover-title">Contents</h2>
      <p className="pdf-cover-sub">{TOTAL_PDF_PAGES} pages</p>
      <div className="pdf-cover-rule" />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {TOC.map(([n, t, p]) => (
          <div key={n} className="pdf-toc-row">
            <span><b>{n}</b>  {t}</span>
            <span>{p}</span>
          </div>
        ))}
      </div>
      <div style={{ flex: 1 }} />
      <div className="pdf-foot">
        <span><b>{domain}</b></span>
        <span>style guide · page 02</span>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <main
          className="ss-main"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
          }}
        >
          <Loader2 className="spin" size={32} color="var(--brand)" />
        </main>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
