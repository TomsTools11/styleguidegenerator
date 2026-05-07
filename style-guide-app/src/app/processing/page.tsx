'use client';

import Image from 'next/image';
import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Globe,
  Palette,
  Type,
  Layout,
  FileText,
  Check,
  Circle,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import type { AnalysisStep, StyleGuideData } from '@/types/style-guide';

const STEPS: {
  id: AnalysisStep['id'];
  label: string;
  Icon: typeof Globe;
}[] = [
  { id: 'fetching',                label: 'Fetching website',       Icon: Globe },
  { id: 'extracting_colors',       label: 'Extracting colors',      Icon: Palette },
  { id: 'extracting_typography',   label: 'Analyzing typography',   Icon: Type },
  { id: 'identifying_components',  label: 'Identifying components', Icon: Layout },
  { id: 'generating_pdf',          label: 'Generating PDF',         Icon: FileText },
];

// Visual milestones — we don't have real progress signals from the analyzer
// yet (see IMPROVEMENT_PLAN.md §C.1.2 for the proper streaming fix), so we
// pace the UI to land near 90% by ~25s and hold there until the response
// arrives, then snap to 100% on completion.
const MILESTONES = [
  { at: 0,     progress: 5,  step: 0 },
  { at: 4000,  progress: 25, step: 1 },
  { at: 9000,  progress: 50, step: 2 },
  { at: 16000, progress: 70, step: 3 },
  { at: 24000, progress: 88, step: 4 },
];

const SAMPLE_LOG: { lvl: string; text: string; ok?: boolean }[] = [
  { lvl: 'GET', text: 'Connecting to target server', ok: true },
  { lvl: 'DOC', text: 'DOM parsed · resolving stylesheets' },
  { lvl: 'CSS', text: 'Resolving computed styles' },
  { lvl: 'PIC', text: 'Capturing viewport screenshot · 1440×900' },
  { lvl: 'HUE', text: 'Clustering colors → brand candidates' },
  { lvl: 'OK',  text: 'Primary brand color detected', ok: true },
  { lvl: 'FNT', text: 'Detecting font-family stacks' },
  { lvl: 'FNT', text: 'Resolving fallbacks via system-ui' },
  { lvl: 'DOM', text: 'Indexing components — buttons, inputs, cards…' },
  { lvl: 'PDF', text: 'Composing pages @ 144 DPI' },
];

const fmtTimestamp = (i: number) => {
  const total = i * 1.4;
  const mins = Math.floor(total / 60);
  const secs = Math.floor(total % 60);
  return `00:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const PREVIEW_SWATCHES = ['#212529', '#057BE5', '#00172D', '#E83A89', '#DEE2E6'];

function ProcessingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const url = searchParams.get('url');

  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [logIdx, setLogIdx] = useState(2);
  const startedRef = useRef(false);

  const getStepStatus = (
    index: number,
  ): 'pending' | 'in_progress' | 'completed' | 'failed' => {
    if (error && index === currentStep) return 'failed';
    if (done) return 'completed';
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'in_progress';
    return 'pending';
  };

  useEffect(() => {
    if (!url) {
      setError('No URL provided');
      return;
    }
    if (startedRef.current) return;
    startedRef.current = true;

    const startedAt = Date.now();
    let cancelled = false;

    const tickAnimation = () => {
      if (cancelled) return;
      const elapsed = Date.now() - startedAt;
      const next = MILESTONES.reduce(
        (acc, m) => (elapsed >= m.at ? m : acc),
        MILESTONES[0],
      );
      setProgress(next.progress);
      setCurrentStep(next.step);
      requestAnimationFrame(tickAnimation);
    };
    requestAnimationFrame(tickAnimation);

    const logTimer = setInterval(() => {
      setLogIdx((i) => Math.min(i + 1, SAMPLE_LOG.length));
    }, 1100);

    (async () => {
      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error || 'Analysis failed');
        }
        cancelled = true;
        clearInterval(logTimer);
        const data = payload.data as StyleGuideData;

        sessionStorage.setItem(
          `stylesnap:${data.meta.url}`,
          JSON.stringify(data),
        );
        setProgress(100);
        setCurrentStep(STEPS.length);
        setLogIdx(SAMPLE_LOG.length);
        setDone(true);
        setTimeout(() => {
          router.push(`/results?url=${encodeURIComponent(data.meta.url)}`);
        }, 1100);
      } catch (err) {
        cancelled = true;
        clearInterval(logTimer);
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    })();

    return () => {
      cancelled = true;
      clearInterval(logTimer);
    };
  }, [url, router]);

  if (!url) {
    return (
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
            <AlertCircle size={28} strokeWidth={2.2} />
          </div>
          <h1 className="an-h1">No URL provided</h1>
          <p className="an-sub">
            Please go back and enter a website URL to analyze.
          </p>
          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => router.push('/')}
              className="ss-btn ss-btn-primary ss-btn-auto"
            >
              <ArrowLeft size={16} /> Go back
            </button>
          </div>
        </div>
      </main>
    );
  }

  const retry = () => {
    setError(null);
    setCurrentStep(0);
    setProgress(0);
    setLogIdx(2);
    startedRef.current = false;
    router.replace(`/processing?url=${encodeURIComponent(url)}`);
  };

  const previewVisible = !error && currentStep >= 1 && !done;
  const visibleSwatchCount = Math.min(
    PREVIEW_SWATCHES.length,
    Math.max(2, currentStep + 1),
  );

  return (
    <>
      <header className="ss-header">
        <div className="ss-header-inner">
          <a href="/" className="ss-brand-link" aria-label="StyleSnap">
            <Image
              src="/brand/stylesnap-logo.png"
              alt="StyleSnap"
              width={1159}
              height={307}
              className="ss-brand-logo"
              priority
            />
          </a>
          <a href="/" className="ss-link-btn">
            <ArrowLeft size={14} />
            Cancel
          </a>
        </div>
      </header>

      <main className="ss-main" style={{ paddingBottom: 80 }}>
        <div className="ss-narrow">
          <section className="an-hero">
            <div className="an-url-pill">
              <span className="glo"><Globe size={14} /></span>
              <span className="url-text">{url}</span>
            </div>
            <h1 className="an-h1">
              {error ? (
                <>Analysis <span className="accent">failed</span></>
              ) : done ? (
                <>Analysis <span className="accent">complete</span></>
              ) : (
                <>Analyzing <span className="accent">website</span></>
              )}
            </h1>
            <p className="an-sub">
              {error
                ? 'Something went wrong during the analysis.'
                : done
                  ? 'Redirecting to your style guide…'
                  : "Hold tight — we’re extracting colors, type, and components."}
            </p>
          </section>

          <section className="an-card">
            <div className="an-progress-head">
              <span className="an-progress-title">Overall progress</span>
              <span className="an-progress-pct">{Math.round(progress)}%</span>
            </div>
            <div className="an-progress-bar">
              <div
                className="an-progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="an-steps">
              {STEPS.map((step, index) => {
                const status = getStepStatus(index);
                const stateClass =
                  status === 'completed'
                    ? 'is-done'
                    : status === 'in_progress'
                      ? 'is-active'
                      : status === 'failed'
                        ? 'is-failed'
                        : '';
                return (
                  <div key={step.id} className={`an-step ${stateClass}`}>
                    <span className="ico-wrap">
                      {status === 'completed' ? (
                        <Check size={16} strokeWidth={2.2} />
                      ) : status === 'in_progress' ? (
                        <Loader2 size={18} className="spin" />
                      ) : status === 'failed' ? (
                        <AlertCircle size={16} strokeWidth={2.2} />
                      ) : (
                        <Circle size={14} strokeWidth={1.8} />
                      )}
                    </span>
                    <span className="label">
                      <span className="l-ico"><step.Icon size={14} /></span>
                      {step.label}
                    </span>
                    <span className="status">
                      {status === 'completed'
                        ? 'Done'
                        : status === 'in_progress'
                          ? 'Processing…'
                          : status === 'failed'
                            ? 'Failed'
                            : 'Queued'}
                    </span>
                  </div>
                );
              })}
            </div>

            {previewVisible && (
              <div className="an-preview">
                <span className="an-preview-label">Live · colors found</span>
                <div className="an-preview-swatches">
                  {PREVIEW_SWATCHES.slice(0, visibleSwatchCount).map((hex) => (
                    <span
                      key={hex}
                      className="sw"
                      style={{ background: hex }}
                    />
                  ))}
                </div>
                <span style={{ flex: 1 }} />
                <span className="an-preview-label">primary · #057BE5</span>
              </div>
            )}

            {error ? (
              <div className="an-error">
                <div className="an-error-head">
                  <AlertCircle size={16} strokeWidth={2.2} />
                  Error
                </div>
                <div className="an-error-body">{error}</div>
                <div className="an-error-actions">
                  <button
                    type="button"
                    onClick={retry}
                    className="ss-btn ss-btn-primary ss-btn-auto"
                  >
                    <RefreshCw size={14} /> Try again
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push('/')}
                    className="ss-btn ss-btn-ghost ss-btn-auto"
                  >
                    Go back
                  </button>
                </div>
              </div>
            ) : (
              <div className="an-tip">
                <b>Tip:</b> heavier sites (Notion, Linear) take ~30–60 seconds
                because we render the full page in a real browser before
                extracting tokens.
              </div>
            )}
          </section>

          {!error && (
            <section className="an-log">
              <div className="an-log-head">
                <span className="an-log-title">Activity log</span>
                <span className="an-log-meta">
                  {logIdx} / {SAMPLE_LOG.length}
                </span>
              </div>
              <div className="an-log-body">
                {SAMPLE_LOG.slice(0, logIdx).map((line, i) => (
                  <div
                    key={i}
                    className={`an-log-line${line.ok ? ' ok' : ''}`}
                  >
                    <span className="ts">{fmtTimestamp(i)}</span>
                    <span className="lvl">{line.lvl}</span>
                    <span>{line.text}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {done && !error && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: 28,
              }}
            >
              <button
                type="button"
                className="ss-btn ss-btn-primary ss-btn-auto"
                onClick={() =>
                  router.push(`/results?url=${encodeURIComponent(url)}`)
                }
              >
                View style guide <Sparkles size={14} />
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default function ProcessingPage() {
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
      <ProcessingContent />
    </Suspense>
  );
}
