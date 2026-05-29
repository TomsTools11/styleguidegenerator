'use client';

import Image from 'next/image';
import { useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  IcArrow,
  IcSpinner,
  IcCheck,
  IcPalette,
  IcType,
  IcComponents,
  IcAccess,
  IcPdf,
  IcBolt,
} from '@/components/style-snap/icons';
import { PdfMockup } from '@/components/style-snap/PdfMockup';

const FEATURES: { icon: ReactNode; title: string; body: string; tag: string }[] = [
  {
    icon: <IcPalette />,
    title: 'Color extraction',
    body: 'We pull every brand-meaningful color, classify primary, secondary, accent, surface, and text — and write hex, RGB, and HSL.',
    tag: 'rgb · hex · hsl',
  },
  {
    icon: <IcType />,
    title: 'Typography analysis',
    body: 'Detected font families, weights, and sizes resolve into a clean, ratio-based type scale your team can actually use.',
    tag: 'modular scale',
  },
  {
    icon: <IcComponents />,
    title: 'Component detection',
    body: 'Buttons, inputs, cards, and nav patterns are identified and documented with their states and structural specs.',
    tag: 'buttons · forms · cards',
  },
  {
    icon: <IcAccess />,
    title: 'Accessibility audit',
    body: 'WCAG AA / AAA contrast checks on every text–surface pair. Failures are flagged with the contrast ratio.',
    tag: 'WCAG 2.2',
  },
  {
    icon: <IcPdf />,
    title: 'Print-ready PDF',
    body: 'A 19-page document with cover, table of contents, sections, and an index — formatted for screen and A4 print.',
    tag: 'A4 · letter',
  },
  {
    icon: <IcBolt />,
    title: 'Under 60 seconds',
    body: 'Crawl, classify, render, paginate. Average run takes 47 seconds. Long tail capped at one minute.',
    tag: '≈ 47s avg',
  },
];

const STEPS = [
  {
    num: '01',
    title: 'Paste a URL',
    body: 'Drop in any public site. We crawl the homepage and one level deep, render with a real engine, and capture computed styles.',
    detail: 'GET /analyze → 200',
  },
  {
    num: '02',
    title: 'We classify',
    body: 'Tokens get clustered, named, and ranked. Type collapses into a scale. Components are detected by shape, not selector.',
    detail: 'tokens: 142 · roles: 7',
  },
  {
    num: '03',
    title: 'Download a PDF',
    body: 'Stable URL at stylesnap.sh/r/<slug>. Open it, share it, print it. Re-runs replace the file at the same link.',
    detail: '/r/9kR2vH.pdf',
  },
];

const PDF_INCLUDES = [
  'Cover page with a captured brand mark',
  'Table of contents and document index',
  'Color palette with hex, RGB, and HSL values',
  'Typography scale and font specifications',
  'UI component documentation with states',
  'Layout, grid, and spacing tokens',
  'Accessibility compliance report',
  'Resource links and a versioned changelog',
];

const FAQS: { q: string; a: ReactNode }[] = [
  {
    q: 'Is it really free?',
    a: 'Yes. No card, no account, no paywall. If StyleSnap saves you an afternoon, tips at s3labs.com keep it running — but nothing is gated.',
  },
  {
    q: 'What sites can I analyze?',
    a: 'Any public website that loads without authentication. We render the page in a real browser, so SPAs, lazy-loaded fonts, and CSS-in-JS all work. Behind a login or VPN — not yet.',
  },
  {
    q: 'How long does generation take?',
    a: 'Most runs finish in under 60 seconds. Average is 47 seconds. Heavy SPAs can push toward the cap.',
  },
  {
    q: 'Can I edit the style guide afterwards?',
    a: "The PDF is final. We're working on an editable HTML output and a token export (JSON, CSS variables, Tailwind theme) — both planned for v1.1.",
  },
  {
    q: 'Do you store the analyzed site?',
    a: "We cache the rendered output for 24 hours so re-downloads are instant, then it's purged. The PDF stays at its slug forever.",
  },
  {
    q: "What's the URL pattern for guides?",
    a: (
      <>
        Each guide gets a 6-character Base62 slug — e.g.{' '}
        <code>stylesnap.sh/r/9kR2vH</code>. Not indexed, not listed. Shareable means shareable on purpose.
      </>
    ),
  },
  {
    q: 'Who made this?',
    a: 'A tiny utility from S3 Labs. Same studio that ships DropDoc. One page, one input, one output.',
  },
];

const EXAMPLES = ['stripe.com', 'notion.so', 'linear.app', 'vercel.com'];

export default function Home() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openFaq, setOpenFaq] = useState<number>(0);

  const validate = (input: string): boolean => {
    try {
      const candidate = input.startsWith('http') ? input : `https://${input}`;
      const parsed = new URL(candidate);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    const trimmed = url.trim();
    if (!trimmed) {
      setError('Enter a website URL.');
      return;
    }
    if (!validate(trimmed)) {
      setError('That doesn’t look like a valid URL.');
      return;
    }
    setError('');
    setLoading(true);
    const normalized = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
    router.push(`/processing?url=${encodeURIComponent(normalized)}`);
  };

  return (
    <>
      {/* Header */}
      <header className="ss-header">
        <div className="ss-header-inner">
          <a href="#" className="ss-brand-link" aria-label="StyleSnap">
            <Image
              src="/brand/stylesnap-logo-nav.png"
              alt="StyleSnap"
              width={1159}
              height={307}
              className="ss-brand-logo"
              priority
            />
          </a>
          <nav className="ss-nav">
            <a className="nav-link" href="#features">Features</a>
            <a className="nav-link" href="#how">How it works</a>
            <a className="nav-link" href="#faq">FAQ</a>
            <span className="ss-meta" style={{ color: 'rgb(197, 223, 246)' }}>
              v1.0<span className="dot">·</span>by s3 labs
            </span>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="hero ss-container">
          <div className="hero-eyebrow">
            <span className="pulse" />
            a tiny utility from s3 labs
          </div>
          <h1 className="hero-h1">
            Create professional style guides.
            <br />
            <span className="muted">In just seconds.</span>
          </h1>
          <p className="hero-lead">
            Enter any website URL and receive a comprehensive, beautifully formatted PDF
            style guide documenting colors, typography, components, and more.
          </p>

          <form className="url-form-wrap" onSubmit={submit} noValidate>
            <div className="url-form">
              <input
                className="url-input"
                type="text"
                inputMode="url"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                placeholder="stripe.com"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (error) setError('');
                }}
                aria-label="Website URL"
              />
              <button
                type="submit"
                className="url-submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <IcSpinner />
                    <span>Analyzing…</span>
                  </>
                ) : (
                  <>
                    <span>Generate guide</span>
                    <IcArrow />
                  </>
                )}
              </button>
            </div>
            <p className="url-tail">
              <span className="label">try:</span>
              <span className="example-list">
                {EXAMPLES.map((ex) => (
                  <button
                    type="button"
                    key={ex}
                    className="example-chip"
                    onClick={() => setUrl(ex)}
                  >
                    {ex}
                  </button>
                ))}
              </span>
            </p>
            {error && <p className="url-error">{error}</p>}
          </form>

          {/* Stats */}
          <div className="hero-stats">
            <div className="stat">
              <div className="stat-value">≈47s</div>
              <div className="stat-label">average run</div>
            </div>
            <div className="stat">
              <div className="stat-value">19pp</div>
              <div className="stat-label">guide length</div>
            </div>
            <div className="stat">
              <div className="stat-value">0</div>
              <div className="stat-label">accounts to create</div>
            </div>
            <div className="stat">
              <div className="stat-value">∞</div>
              <div className="stat-label">link lifetime</div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="features ss-container">
          <p className="ss-section-eyebrow" style={{ color: 'var(--brand-accent)' }}>features</p>
          <h2 className="ss-section-title">
            Everything a handoff needs.{' '}
            <span className="muted" style={{ color: 'var(--brand-accent)' }}>Nothing it doesn’t.</span>
          </h2>
          <p className="ss-section-lead">
            Six things, done well. Built for the dev-to-design handoff, not the demo reel.
          </p>

          <div className="features-grid">
            {FEATURES.map((f) => (
              <div className="feature" key={f.title}>
                <span className="feature-icon">{f.icon}</span>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
                <div className="feature-tag">{f.tag}</div>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="how">
          <div className="ss-container">
            <p className="ss-section-eyebrow" style={{ color: 'var(--brand-accent)' }}>how it works</p>
            <h2 className="ss-section-title">
              Three steps.{' '}
              <span className="muted" style={{ color: 'var(--brand-accent)' }}>One minute.</span>
            </h2>

            <div className="how-grid">
              {STEPS.map((s) => (
                <div className="step" key={s.num}>
                  <div className="step-num">
                    {s.num}
                    <span />
                  </div>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                  <div className="step-detail">{s.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PDF preview */}
        <section className="pdf-section ss-container">
          <div className="pdf-grid">
            <div>
              <p className="ss-section-eyebrow" style={{ color: 'var(--brand-accent)' }}>the output</p>
              <h2 className="ss-section-title">
                A pdf style guide.{' '}
                <span className="muted" style={{ color: 'var(--brand-accent)' }}>Professionally Styled.</span>
              </h2>
              <p className="ss-section-lead">
                The output is one PDF. Designed for the handoff: a cover, a table of contents,
                then the work — colors, type, components, accessibility, and a versioned changelog.
                Send it to a client or print it for the kickoff.
              </p>
              <ul className="pdf-checklist">
                {PDF_INCLUDES.map((item) => (
                  <li key={item}>
                    <span className="pdf-check">
                      <IcCheck />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <PdfMockup />
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="faq ss-container">
          <p className="ss-section-eyebrow" style={{ color: 'var(--brand-accent)' }}>questions</p>
          <h2 className="ss-section-title">Things worth asking.</h2>

          <div className="faq-list">
            {FAQS.map((item, i) => (
              <div key={i} className={`faq-item${openFaq === i ? ' open' : ''}`}>
                <button
                  className="faq-q"
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                  type="button"
                  aria-expanded={openFaq === i}
                >
                  <span>{item.q}</span>
                  <span className="faq-toggle">+</span>
                </button>
                <div className="faq-a">
                  <div className="faq-a-inner">
                    <div className="faq-a-text">{item.a}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="ss-footer">
        <div className="ss-container">
          <div className="footer-grid">
            <div className="footer-brand">
              <a href="#" className="ss-brand-link" aria-label="StyleSnap">
                <Image
                  src="/brand/stylesnap-logo-footer.png"
                  alt="StyleSnap"
                  width={1822}
                  height={1009}
                  className="ss-brand-logo"
                  style={{ objectFit: 'contain', height: 110, width: 140 }}
                />
              </a>
              <p className="footer-tagline">
                A tiny utility from S3 Labs. One URL in, one printable style guide out.
                No subscriptions or ads.
              </p>
            </div>
            <div className="footer-col">
              <h4>product</h4>
              <ul>
                <li><a href="#features">Features</a></li>
                <li><a href="#how">How it works</a></li>
                <li><a href="#faq">FAQ</a></li>
                <li><a href="#">Changelog</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>studio</h4>
              <ul>
                <li><a href="https://s3labs.tech">S3 Labs</a></li>
                <li><a href="https://s3labs.tech">All products</a></li>
                <li><a href="https://dropdoc.sh">DropDoc</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} S3 Labs</span>
            <span>
              Made with{' '}
              <span aria-label="love" style={{ color: 'var(--mark-red)' }}>❤</span>{' '}
              <span style={{ color: '#71717a' }}>
                by Tom &amp; Alex from{' '}
                <span style={{ color: '#2e9df0' }}>S3 Labs</span>
              </span>
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
