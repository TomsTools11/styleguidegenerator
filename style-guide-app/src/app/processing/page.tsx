'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
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
import type { AnalysisStep } from '@/types/style-guide';

function ProcessingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const url = searchParams.get('url');

  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);

  const steps: AnalysisStep[] = [
    { id: 'fetching', label: 'Fetching website', status: 'pending' },
    { id: 'extracting_colors', label: 'Extracting colors', status: 'pending' },
    { id: 'extracting_typography', label: 'Analyzing typography', status: 'pending' },
    { id: 'identifying_components', label: 'Identifying components', status: 'pending' },
    { id: 'generating_pdf', label: 'Generating PDF', status: 'pending' },
  ];

  const stepIcons = [Globe, Palette, Type, Layout, FileText];

  const getStepStatus = (index: number): 'pending' | 'in_progress' | 'completed' | 'failed' => {
    if (error && index === currentStep) return 'failed';
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'in_progress';
    return 'pending';
  };

  const startAnalysis = useCallback(async () => {
    if (!url) {
      setError('No URL provided');
      return;
    }

    try {
      // Start the analysis
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to start analysis');
      }

      const { jobId } = await response.json();
      setJobId(jobId);

      // Poll for status
      pollStatus(jobId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  }, [url]);

  const pollStatus = async (id: string) => {
    const statusMap: Record<string, number> = {
      'pending': 0,
      'fetching': 0,
      'extracting_colors': 1,
      'extracting_typography': 2,
      'identifying_components': 3,
      'generating_pdf': 4,
      'completed': 5,
    };

    const poll = async () => {
      try {
        const response = await fetch(`/api/status/${id}`);
        const data = await response.json();

        if (data.error) {
          setError(data.error);
          return;
        }

        const stepIndex = statusMap[data.status] ?? 0;
        setCurrentStep(stepIndex);
        setProgress(data.progress || (stepIndex / 5) * 100);

        if (data.status === 'completed') {
          // Navigate to results page
          router.push(`/results?jobId=${id}`);
        } else if (data.status === 'failed') {
          setError(data.error || 'Analysis failed');
        } else {
          // Continue polling
          setTimeout(poll, 1000);
        }
      } catch {
        setError('Failed to check status');
      }
    };

    poll();
  };

  useEffect(() => {
    if (url) {
      startAnalysis();
    }
  }, [url, startAnalysis]);

  // Progress simulation for demo/development
  useEffect(() => {
    if (!jobId && !error && url) {
      // Simulate progress for development when API isn't ready
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            // Navigate to results with demo data
            router.push(`/results?url=${encodeURIComponent(url)}&demo=true`);
            return 100;
          }
          const newProgress = prev + Math.random() * 8 + 2;
          setCurrentStep(Math.floor((newProgress / 100) * 5));
          return Math.min(newProgress, 100);
        });
      }, 800);

      return () => clearInterval(interval);
    }
  }, [jobId, error, url, router]);

  if (!url) {
    return (
      <div className="min-h-screen bg-[#191919] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-[#D44E49] mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Red Hat Display', sans-serif" }}>
            No URL Provided
          </h1>
          <p className="text-[#A7A39A] mb-6">Please go back and enter a website URL to analyze.</p>
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

  return (
    <div className="min-h-screen bg-[#191919]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#407EC9] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg text-white" style={{ fontFamily: "'Red Hat Display', sans-serif" }}>
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

      {/* Main Content */}
      <main className="pt-24 pb-12">
        <div className="max-w-2xl mx-auto px-6">
          {/* Analyzing header */}
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
                : 'Please wait while we extract your design system...'}
            </p>
          </div>

          {/* Progress Card */}
          <div className="bg-[#202020] border border-[#444B4E] rounded-2xl p-8">
            {/* Overall Progress */}
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

            {/* Steps */}
            <div className="space-y-4">
              {steps.map((step, index) => {
                const Icon = stepIcons[index];
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
                    {/* Status Icon */}
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

                    {/* Step Info */}
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

                    {/* Status Badge */}
                    <div>
                      {status === 'completed' && (
                        <span className="text-xs text-[#448361] font-medium">Done</span>
                      )}
                      {status === 'in_progress' && (
                        <span className="text-xs text-[#407EC9] font-medium">Processing...</span>
                      )}
                      {status === 'failed' && (
                        <span className="text-xs text-[#D44E49] font-medium">Failed</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Error State */}
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
                    onClick={() => {
                      setError(null);
                      setCurrentStep(0);
                      setProgress(0);
                      startAnalysis();
                    }}
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

            {/* Tips while waiting */}
            {!error && (
              <div className="mt-8 p-4 bg-[#191919] rounded-xl">
                <p className="text-[#A7A39A] text-sm">
                  <span className="text-[#407EC9] font-medium">Tip:</span> Your style guide will include
                  color palettes, typography specifications, component documentation, and accessibility
                  compliance information.
                </p>
              </div>
            )}
          </div>

          {/* Estimated Time */}
          {!error && (
            <p className="text-center text-[#A7A39A] text-sm mt-6">
              Estimated time remaining: {Math.max(1, Math.round((100 - progress) / 20))} seconds
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

export default function ProcessingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#191919] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#407EC9] animate-spin" />
      </div>
    }>
      <ProcessingContent />
    </Suspense>
  );
}
