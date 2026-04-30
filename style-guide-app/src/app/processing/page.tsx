'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Globe,
  Palette,
  Type,
  Layout,
  FileText,
  CheckCircle2,
  Circle,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import type { AnalysisStep, StyleGuideData } from '@/types/style-guide';

const STEPS: { id: AnalysisStep['id']; label: string }[] = [
  { id: 'fetching', label: 'Fetching website' },
  { id: 'extracting_colors', label: 'Extracting colors' },
  { id: 'extracting_typography', label: 'Analyzing typography' },
  { id: 'identifying_components', label: 'Identifying components' },
  { id: 'generating_pdf', label: 'Generating PDF' },
];

const STEP_ICONS = [Globe, Palette, Type, Layout, FileText];

// Visual milestones — we don't have real progress signals from the analyzer
// yet (see IMPROVEMENT_PLAN.md §C.1.2 for the proper streaming fix), so we
// pace the UI to land near 90% by ~25s and hold there until the response
// arrives, then snap to 100% on completion.
const MILESTONES = [
  { at: 0,    progress: 5,  step: 0 },
  { at: 4000, progress: 25, step: 1 },
  { at: 9000, progress: 50, step: 2 },
  { at: 16000, progress: 70, step: 3 },
  { at: 24000, progress: 88, step: 4 },
];

function ProcessingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const url = searchParams.get('url');

  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const startedRef = useRef(false);

  const getStepStatus = (
    index: number,
  ): 'pending' | 'in_progress' | 'completed' | 'failed' => {
    if (error && index === currentStep) return 'failed';
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'in_progress';
    return 'pending';
  };

  useEffect(() => {
    if (!url) {
      setError('No URL provided');
      return;
    }
    // StrictMode double-mounts effects in dev — guard so analyze fires once.
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
        const data = payload.data as StyleGuideData;

        // Stash the result for /results to read without another network hop.
        sessionStorage.setItem(
          `stylesnap:${data.meta.url}`,
          JSON.stringify(data),
        );
        setProgress(100);
        setCurrentStep(STEPS.length);
        // Tiny pause so the user sees the "complete" frame.
        setTimeout(() => {
          router.push(`/results?url=${encodeURIComponent(data.meta.url)}`);
        }, 350);
      } catch (err) {
        cancelled = true;
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [url, router]);

  if (!url) {
    return (
      <div className="min-h-screen bg-[#191919] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-[#D44E49] mx-auto mb-4" />
          <h1
            className="text-2xl font-bold text-white mb-2"
            style={{ fontFamily: "'Red Hat Display', sans-serif" }}
          >
            No URL Provided
          </h1>
          <p className="text-[#A7A39A] mb-6">
            Please go back and enter a website URL to analyze.
          </p>
          <Button
            onClick={() => router.push('/')}
            className="bg-[#407EC9] hover:bg-[#327DA9] text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const retry = () => {
    setError(null);
    setCurrentStep(0);
    setProgress(0);
    startedRef.current = false;
    // Force the effect to re-run by replacing the URL with itself.
    router.replace(`/processing?url=${encodeURIComponent(url)}`);
  };

  return (
    <div className="min-h-screen bg-[#191919]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#407EC9] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span
              className="font-semibold text-lg text-white"
              style={{ fontFamily: "'Red Hat Display', sans-serif" }}
            >
              Style Guide Generator
            </span>
          </div>
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="text-[#A7A39A] hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
      </header>

      <main className="pt-24 pb-12">
        <div className="max-w-2xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-[#202020] border border-[#444B4E] mb-6">
              <Globe className="w-4 h-4 text-[#407EC9]" />
              <span className="text-sm text-[#EDEEEE] truncate max-w-[300px]">
                {url}
              </span>
            </div>
            <h1
              className="text-3xl md:text-4xl font-bold mb-4 text-white"
              style={{ fontFamily: "'Red Hat Display', sans-serif" }}
            >
              {error ? 'Analysis Failed' : 'Analyzing Website'}
            </h1>
            <p className="text-[#A7A39A] text-lg">
              {error
                ? 'Something went wrong during the analysis.'
                : 'Please wait while we extract your design system…'}
            </p>
          </div>

          <div className="bg-[#202020] border border-[#444B4E] rounded-2xl p-8">
            {!error && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#A7A39A]">Overall Progress</span>
                  <span className="text-sm font-medium text-[#EDEEEE]">
                    {Math.round(progress)}%
                  </span>
                </div>
                <div className="h-2 bg-[#191919] rounded-full overflow-hidden">
                  <div
                    className="h-full progress-bar rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="space-y-4">
              {STEPS.map((step, index) => {
                const Icon = STEP_ICONS[index];
                const status = getStepStatus(index);

                return (
                  <div
                    key={step.id}
                    className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                      status === 'in_progress'
                        ? 'bg-[#407EC9]/10 border border-[#407EC9]/30'
                        : status === 'completed'
                          ? 'bg-[#448361]/10 border border-transparent'
                          : status === 'failed'
                            ? 'bg-[#D44E49]/10 border border-[#D44E49]/30'
                            : 'bg-transparent border border-transparent'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        status === 'completed'
                          ? 'bg-[#448361]'
                          : status === 'in_progress'
                            ? 'bg-[#407EC9]'
                            : status === 'failed'
                              ? 'bg-[#D44E49]'
                              : 'bg-[#2F2F2F]'
                      }`}
                    >
                      {status === 'completed' ? (
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      ) : status === 'in_progress' ? (
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                      ) : status === 'failed' ? (
                        <AlertCircle className="w-5 h-5 text-white" />
                      ) : (
                        <Circle className="w-5 h-5 text-[#A7A39A]" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Icon
                          className={`w-4 h-4 ${
                            status === 'completed'
                              ? 'text-[#448361]'
                              : status === 'in_progress'
                                ? 'text-[#407EC9]'
                                : status === 'failed'
                                  ? 'text-[#D44E49]'
                                  : 'text-[#A7A39A]'
                          }`}
                        />
                        <span
                          className={`font-medium ${
                            status === 'completed'
                              ? 'text-[#448361]'
                              : status === 'in_progress'
                                ? 'text-white'
                                : status === 'failed'
                                  ? 'text-[#D44E49]'
                                  : 'text-[#A7A39A]'
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    </div>

                    <div>
                      {status === 'completed' && (
                        <span className="text-xs text-[#448361] font-medium">Done</span>
                      )}
                      {status === 'in_progress' && (
                        <span className="text-xs text-[#407EC9] font-medium">
                          Processing…
                        </span>
                      )}
                      {status === 'failed' && (
                        <span className="text-xs text-[#D44E49] font-medium">Failed</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {error && (
              <div className="mt-8 p-4 bg-[#D44E49]/10 border border-[#D44E49]/30 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-[#D44E49] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[#D44E49] font-medium mb-1">Error</p>
                    <p className="text-[#EDEEEE] text-sm">{error}</p>
                  </div>
                </div>
                <div className="mt-4 flex gap-3">
                  <Button
                    onClick={retry}
                    className="bg-[#407EC9] hover:bg-[#327DA9] text-white"
                  >
                    Try Again
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/')}
                    className="border-[#444B4E] text-[#EDEEEE] hover:bg-[#2F2F2F]"
                  >
                    Go Back
                  </Button>
                </div>
              </div>
            )}

            {!error && (
              <div className="mt-8 p-4 bg-[#191919] rounded-xl">
                <p className="text-[#A7A39A] text-sm">
                  <span className="text-[#407EC9] font-medium">Tip:</span>{' '}
                  Heavier sites (Notion, Linear) take ~30–60 seconds because we
                  render the full page in a real browser before extracting tokens.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ProcessingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#191919] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#407EC9] animate-spin" />
        </div>
      }
    >
      <ProcessingContent />
    </Suspense>
  );
}
