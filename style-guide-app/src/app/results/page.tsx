'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Download,
  ArrowLeft,
  Sparkles,
  Palette,
  Type,
  Layout,
  FileText,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import type { StyleGuideData } from '@/types/style-guide';

function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlParam = searchParams.get('url');

  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [styleGuideData, setStyleGuideData] = useState<StyleGuideData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!urlParam) {
      setError('No URL provided');
      setIsLoading(false);
      return;
    }

    // The processing page stashes the full StyleGuideData in sessionStorage
    // keyed by URL. Pulling it from there avoids a second network round-trip
    // and sidesteps the in-memory job store, which can't be shared across
    // serverless function instances on Vercel.
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
      setError(
        err instanceof Error ? err.message : 'Failed to load results',
      );
    } finally {
      setIsLoading(false);
    }
  }, [urlParam]);

  const handleDownload = async () => {
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
      a.download = `${styleGuideData?.meta.domain || 'style-guide'}-style-guide.pdf`;
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#191919] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#407EC9] animate-spin mx-auto mb-4" />
          <p className="text-[#A7A39A]">Loading your style guide...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#191919] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-[#D44E49]/10 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-[#D44E49]" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Red Hat Display', sans-serif" }}>
            Unable to Load Results
          </h1>
          <p className="text-[#A7A39A] mb-6">{error}</p>
          <Button
            onClick={() => router.push('/')}
            className="bg-[#407EC9] hover:bg-[#327DA9] text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Try Another URL
          </Button>
        </div>
      </div>
    );
  }

  if (!styleGuideData) return null;

  const stats = [
    {
      icon: Palette,
      label: 'Colors',
      value: (styleGuideData.colors.primary?.length || 0) +
             (styleGuideData.colors.secondary?.length || 0) +
             (styleGuideData.colors.text?.length || 0),
    },
    {
      icon: Type,
      label: 'Font Families',
      value: [styleGuideData.typography.primaryFont, styleGuideData.typography.secondaryFont, styleGuideData.typography.monospaceFont].filter(Boolean).length,
    },
    {
      icon: Layout,
      label: 'Components',
      value: (styleGuideData.uiComponents.buttons?.variants?.length || 0) +
             (styleGuideData.uiComponents.cards?.length || 0) +
             (styleGuideData.uiComponents.forms?.length || 0),
    },
    {
      icon: FileText,
      label: 'Pages',
      value: 19,
    },
  ];

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
            <RefreshCw className="w-4 h-4 mr-2" />
            New Analysis
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-6">
          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#448361]/10 mb-6">
              <CheckCircle2 className="w-8 h-8 text-[#448361]" />
            </div>
            <h1
              className="text-3xl md:text-4xl font-bold mb-4 text-white"
              style={{ fontFamily: "'Red Hat Display', sans-serif" }}
            >
              Your Style Guide is Ready!
            </h1>
            <p className="text-[#A7A39A] text-lg max-w-xl mx-auto">
              We've analyzed {styleGuideData.meta.domain} and created a comprehensive
              19-page style guide document.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
              <Card key={stat.label} className="bg-[#202020] border-[#444B4E]">
                <CardContent className="p-6 text-center">
                  <div className="w-10 h-10 rounded-xl bg-[#407EC9]/10 flex items-center justify-center mx-auto mb-3">
                    <stat.icon className="w-5 h-5 text-[#407EC9]" />
                  </div>
                  <p className="text-3xl font-bold text-white mb-1" style={{ fontFamily: "'Red Hat Display', sans-serif" }}>
                    {stat.value}
                  </p>
                  <p className="text-sm text-[#A7A39A]">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* PDF Preview */}
            <div className="lg:col-span-2">
              <Card className="bg-[#202020] border-[#444B4E] overflow-hidden">
                <CardContent className="p-0">
                  {/* Preview Header */}
                  <div className="p-4 border-b border-[#444B4E] flex items-center justify-between">
                    <span className="text-[#EDEEEE] font-medium">PDF Preview</span>
                    <span className="text-sm text-[#A7A39A]">19 pages</span>
                  </div>

                  {/* Mock Preview */}
                  <div className="p-8 bg-[#191919]">
                    <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md mx-auto aspect-[3/4]">
                      {/* Cover Page Mock */}
                      <div className="h-full flex flex-col">
                        <h2
                          className="text-2xl font-bold text-[#021A2E] mb-2"
                          style={{ fontFamily: "'Red Hat Display', sans-serif" }}
                        >
                          {styleGuideData.brand.name}
                        </h2>
                        <p className="text-gray-500 text-sm mb-8">Brand & Design Style Guide</p>

                        {/* Color swatches */}
                        <div className="flex gap-2 mb-8">
                          {styleGuideData.colors.primary?.slice(0, 5).map((color, i) => (
                            <div
                              key={i}
                              className="w-12 h-8 rounded"
                              style={{ backgroundColor: color.hex }}
                            />
                          ))}
                        </div>

                        <div className="mt-auto text-sm text-gray-500">
                          <p><strong>Version:</strong> {styleGuideData.meta.version}</p>
                          <p><strong>Generated:</strong> {new Date(styleGuideData.meta.analyzedAt).toLocaleDateString()}</p>
                          <p><strong>Source:</strong> {styleGuideData.meta.domain}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action Panel */}
            <div className="space-y-6">
              {/* Download Card */}
              <Card className="bg-[#202020] border-[#444B4E]">
                <CardContent className="p-6">
                  <h3
                    className="text-lg font-semibold text-white mb-4"
                    style={{ fontFamily: "'Red Hat Display', sans-serif" }}
                  >
                    Download Style Guide
                  </h3>
                  <p className="text-[#A7A39A] text-sm mb-6">
                    Get your professionally formatted PDF style guide, ready to share
                    with your team.
                  </p>
                  <Button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="w-full h-12 bg-[#407EC9] hover:bg-[#327DA9] text-white font-semibold"
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Generating PDF...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5 mr-2" />
                        Download PDF
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* What's Included */}
              <Card className="bg-[#202020] border-[#444B4E]">
                <CardContent className="p-6">
                  <h3
                    className="text-lg font-semibold text-white mb-4"
                    style={{ fontFamily: "'Red Hat Display', sans-serif" }}
                  >
                    What's Included
                  </h3>
                  <ul className="space-y-3">
                    {[
                      'Cover page & table of contents',
                      'Brand identity guidelines',
                      'Color palette with values',
                      'Typography specifications',
                      'UI component library',
                      'Layout & grid system',
                      'Accessibility report',
                      'Resource links',
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-3 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-[#448361] flex-shrink-0" />
                        <span className="text-[#EDEEEE]">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Source Link */}
              <Card className="bg-[#202020] border-[#444B4E]">
                <CardContent className="p-6">
                  <h3
                    className="text-lg font-semibold text-white mb-4"
                    style={{ fontFamily: "'Red Hat Display', sans-serif" }}
                  >
                    Source Website
                  </h3>
                  <a
                    href={styleGuideData.meta.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[#407EC9] hover:text-[#5DB5FE] transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="truncate">{styleGuideData.meta.domain}</span>
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Color Preview */}
          <Card className="bg-[#202020] border-[#444B4E] mt-8">
            <CardContent className="p-6">
              <h3
                className="text-lg font-semibold text-white mb-6"
                style={{ fontFamily: "'Red Hat Display', sans-serif" }}
              >
                Extracted Color Palette
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-4">
                {[
                  ...(styleGuideData.colors.primary || []),
                  ...(styleGuideData.colors.secondary || []),
                  ...(styleGuideData.colors.text || []),
                  ...(styleGuideData.colors.background || []),
                ].slice(0, 10).map((color, index) => (
                  <div key={index} className="text-center">
                    <div
                      className="w-full aspect-square rounded-lg mb-2 border border-[#444B4E]"
                      style={{ backgroundColor: color.hex }}
                    />
                    <p className="text-xs text-[#EDEEEE] font-mono">{color.hex}</p>
                    <p className="text-xs text-[#A7A39A] truncate">{color.name}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Typography Preview */}
          <Card className="bg-[#202020] border-[#444B4E] mt-8">
            <CardContent className="p-6">
              <h3
                className="text-lg font-semibold text-white mb-6"
                style={{ fontFamily: "'Red Hat Display', sans-serif" }}
              >
                Typography System
              </h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-sm text-[#A7A39A] mb-3">Primary Font</h4>
                  <p className="text-2xl text-white mb-1" style={{ fontFamily: styleGuideData.typography.primaryFont?.name }}>
                    {styleGuideData.typography.primaryFont?.name || 'Inter'}
                  </p>
                  <p className="text-sm text-[#A7A39A]">
                    {styleGuideData.typography.primaryFont?.fallback || 'system-ui, sans-serif'}
                  </p>
                </div>
                {styleGuideData.typography.secondaryFont && (
                  <div>
                    <h4 className="text-sm text-[#A7A39A] mb-3">Secondary Font</h4>
                    <p className="text-2xl text-white mb-1" style={{ fontFamily: styleGuideData.typography.secondaryFont.name }}>
                      {styleGuideData.typography.secondaryFont.name}
                    </p>
                    <p className="text-sm text-[#A7A39A]">
                      {styleGuideData.typography.secondaryFont.fallback}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#191919] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#407EC9] animate-spin" />
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
