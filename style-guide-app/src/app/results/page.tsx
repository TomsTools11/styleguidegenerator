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
  const jobId = searchParams.get('jobId');
  const urlParam = searchParams.get('url');
  const isDemo = searchParams.get('demo') === 'true';

  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [styleGuideData, setStyleGuideData] = useState<StyleGuideData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (isDemo && urlParam) {
        // Create demo data for development
        const demoData = createDemoData(urlParam);
        setStyleGuideData(demoData);
        setIsLoading(false);
        return;
      }

      if (!jobId) {
        setError('No job ID provided');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/results/${jobId}`);
        const data = await response.json();

        if (data.error) {
          setError(data.error);
        } else {
          setStyleGuideData(data);
        }
      } catch {
        setError('Failed to fetch results');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [jobId, urlParam, isDemo]);

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

function createDemoData(url: string): StyleGuideData {
  const domain = new URL(url).hostname.replace('www.', '');
  const brandName = domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1);

  return {
    meta: {
      url,
      domain,
      title: `${brandName} Style Guide`,
      analyzedAt: new Date().toISOString(),
      version: '1.0',
    },
    brand: {
      name: brandName,
      description: `Brand and design style guide for ${domain}`,
      missionStatement: `To provide exceptional digital experiences through ${domain}.`,
      visionStatement: `A world where ${brandName} sets the standard for design excellence.`,
      strategicPositioning: `${brandName} positions itself as a leader in its industry.`,
    },
    designPrinciples: [
      { name: 'Clarity', description: 'Every element should communicate its purpose instantly.' },
      { name: 'Consistency', description: 'Maintain visual and functional consistency throughout.' },
      { name: 'Accessibility', description: 'Design for everyone, regardless of ability.' },
    ],
    logo: {
      specifications: [
        { attribute: 'Primary Format', specification: 'SVG (vector) for web, PNG for applications' },
        { attribute: 'Minimum Width', specification: '120px for digital, 1 inch for print' },
        { attribute: 'Clear Space', specification: "Minimum padding equal to 'M' height on all sides" },
      ],
      incorrectUsage: [
        'Do not stretch or distort the logo',
        'Do not rotate the logo',
        'Do not add effects (shadows, gradients)',
      ],
    },
    colors: {
      primary: [
        { hex: '#021A2E', rgb: { r: 2, g: 26, b: 46 }, name: 'Navy Dark', role: 'Primary Dark', usage: 'Headers, footers' },
        { hex: '#014379', rgb: { r: 1, g: 67, b: 121 }, name: 'Navy Medium', role: 'Primary Medium', usage: 'Secondary backgrounds' },
        { hex: '#0D91FD', rgb: { r: 13, g: 145, b: 253 }, name: 'Blue Primary', role: 'Primary Accent', usage: 'CTAs, links' },
      ],
      secondary: [
        { hex: '#5DB5FE', rgb: { r: 93, g: 181, b: 254 }, name: 'Blue Light', role: 'Light Accent', usage: 'Hover states' },
        { hex: '#C2E3FE', rgb: { r: 194, g: 227, b: 254 }, name: 'Blue Pale', role: 'Background', usage: 'Card backgrounds' },
      ],
      system: {
        success: { hex: '#10B981', rgb: { r: 16, g: 185, b: 129 }, name: 'Green', role: 'Success', usage: 'Success states' },
        warning: { hex: '#F59E0B', rgb: { r: 245, g: 158, b: 11 }, name: 'Amber', role: 'Warning', usage: 'Warnings' },
        error: { hex: '#EF4444', rgb: { r: 239, g: 68, b: 68 }, name: 'Red', role: 'Error', usage: 'Errors' },
        info: { hex: '#0D91FD', rgb: { r: 13, g: 145, b: 253 }, name: 'Blue', role: 'Info', usage: 'Information' },
      },
      text: [
        { hex: '#374151', rgb: { r: 55, g: 65, b: 81 }, name: 'Gray Dark', role: 'Text Primary', usage: 'Body text' },
        { hex: '#6B7280', rgb: { r: 107, g: 114, b: 128 }, name: 'Gray Medium', role: 'Text Secondary', usage: 'Secondary text' },
      ],
      background: [
        { hex: '#FFFFFF', rgb: { r: 255, g: 255, b: 255 }, name: 'White', role: 'Background', usage: 'Main background' },
        { hex: '#F9FAFB', rgb: { r: 249, g: 250, b: 251 }, name: 'Gray 50', role: 'Background Alt', usage: 'Alternative background' },
      ],
    },
    typography: {
      primaryFont: { name: 'Inter', fallback: 'system-ui, sans-serif', category: 'primary' },
      secondaryFont: { name: 'Inter', fallback: 'system-ui, sans-serif', category: 'secondary' },
      monospaceFont: { name: 'JetBrains Mono', fallback: 'Consolas, monospace', category: 'monospace' },
      scale: [
        { element: 'Display', size: '48px / 3rem', weight: '700 (Bold)', lineHeight: '1.1', letterSpacing: '-0.02em' },
        { element: 'H1', size: '36px / 2.25rem', weight: '700 (Bold)', lineHeight: '1.2', letterSpacing: '-0.01em' },
        { element: 'H2', size: '28px / 1.75rem', weight: '600 (Semi)', lineHeight: '1.3', letterSpacing: '0' },
        { element: 'H3', size: '22px / 1.375rem', weight: '600 (Semi)', lineHeight: '1.4', letterSpacing: '0' },
        { element: 'Body', size: '16px / 1rem', weight: '400 (Regular)', lineHeight: '1.6', letterSpacing: '0' },
        { element: 'Small', size: '14px / 0.875rem', weight: '400 (Regular)', lineHeight: '1.5', letterSpacing: '0' },
      ],
    },
    iconography: {
      specifications: [
        { attribute: 'Style', specification: 'Outlined (stroke-based) with rounded corners' },
        { attribute: 'Stroke Width', specification: '1.5px for standard size' },
        { attribute: 'Grid Size', specification: '24x24px base' },
      ],
      usageGuidelines: [
        'Use icons to supplement text, not replace it',
        'Maintain consistent icon sizes',
        'Ensure 4px minimum spacing between icon and text',
      ],
    },
    imagery: {
      specifications: [
        { type: 'Tool Logos', format: 'PNG/SVG', maxSize: '96x96px @2x', guidelines: 'Square, transparent bg' },
        { type: 'Screenshots', format: 'PNG/WebP', maxSize: '1200px width', guidelines: 'Clean, minimal chrome' },
        { type: 'Hero Images', format: 'WebP/AVIF', maxSize: '1920px width', guidelines: 'Abstract tech patterns' },
      ],
    },
    contentStyle: {
      voiceCharacteristics: [
        { name: 'Knowledgeable', description: 'We speak with expertise and authority' },
        { name: 'Helpful', description: 'Every interaction aims to solve problems' },
        { name: 'Clear', description: 'We avoid jargon unless necessary' },
      ],
      toneVariations: [
        { context: 'Tool Descriptions', tone: 'Informative, neutral', example: 'Enables bidirectional sync...' },
        { context: 'Error Messages', tone: 'Helpful, reassuring', example: 'We couldn\'t find that. Try...' },
        { context: 'Success States', tone: 'Encouraging, brief', example: 'Added to your favorites!' },
      ],
      writingGuidelines: {
        capitalization: ['Use sentence case for headings', 'Capitalize proper nouns', 'Avoid ALL CAPS'],
        punctuation: ['Use Oxford comma', 'Avoid exclamation points in UI'],
        numbers: ['Spell out one through nine', 'Use numerals for 10+'],
        technicalWriting: ['Use code formatting for commands', 'Explain acronyms on first use'],
      },
    },
    uiComponents: {
      buttons: {
        variants: [
          { variant: 'Primary', background: '#0D91FD', text: '#FFFFFF', border: 'None', useCase: 'Main CTA' },
          { variant: 'Secondary', background: 'Transparent', text: '#0D91FD', border: '1px #0D91FD', useCase: 'Secondary actions' },
          { variant: 'Destructive', background: '#EF4444', text: '#FFFFFF', border: 'None', useCase: 'Delete actions' },
        ],
        sizes: [
          { size: 'Small', height: '32px', paddingH: '12px', fontSize: '14px', borderRadius: '6px' },
          { size: 'Medium', height: '40px', paddingH: '16px', fontSize: '16px', borderRadius: '8px' },
          { size: 'Large', height: '48px', paddingH: '24px', fontSize: '18px', borderRadius: '10px' },
        ],
      },
      cards: [
        { property: 'Background', value: '#FFFFFF' },
        { property: 'Border', value: '1px solid #E5E7EB' },
        { property: 'Border Radius', value: '12px' },
        { property: 'Padding', value: '20px' },
        { property: 'Shadow', value: '0 1px 3px rgba(0,0,0,0.1)' },
      ],
      forms: [
        { property: 'Height', textInput: '40px', select: '40px', checkbox: '20px' },
        { property: 'Border', textInput: '1px #E5E7EB', select: '1px #E5E7EB', checkbox: '1px #E5E7EB' },
        { property: 'Border Radius', textInput: '8px', select: '8px', checkbox: '4px' },
      ],
      navigation: [
        { element: 'Header Height', specification: '64px (desktop), 56px (mobile)' },
        { element: 'Logo Area', specification: 'Left-aligned, 120px max width' },
        { element: 'Nav Links', specification: 'Center or right-aligned, 16px font' },
      ],
    },
    layout: {
      grid: [
        { property: 'Columns', value: '12' },
        { property: 'Gutter Width', value: '24px (desktop), 16px (mobile)' },
        { property: 'Max Container Width', value: '1280px' },
      ],
      breakpoints: [
        { name: 'Mobile', width: '< 640px', columns: '1-2', layout: 'Stacked, full-width' },
        { name: 'Tablet', width: '640px - 1024px', columns: '2-3', layout: '2-column grid' },
        { name: 'Desktop', width: '> 1024px', columns: '4', layout: '4-column grid' },
      ],
      spacing: [
        { token: 'space-1', value: '4px', useCase: 'Tight spacing' },
        { token: 'space-2', value: '8px', useCase: 'Default inline spacing' },
        { token: 'space-4', value: '16px', useCase: 'Small section gaps' },
        { token: 'space-6', value: '24px', useCase: 'Section spacing' },
        { token: 'space-8', value: '32px', useCase: 'Large section breaks' },
      ],
    },
    accessibility: {
      contrastPairs: [
        { combination: 'Navy Dark on White', ratio: '18.3:1', status: 'AAA Pass' },
        { combination: 'Blue Primary on White', ratio: '3.2:1', status: 'AA Large Text' },
        { combination: 'Gray Dark on White', ratio: '9.8:1', status: 'AAA Pass' },
      ],
      keyboardNav: [
        'All interactive elements are focusable via Tab',
        'Focus order follows logical reading order',
        'Focus indicators are clearly visible',
      ],
      screenReader: [
        'All images have descriptive alt text',
        'Form fields have associated labels',
        'ARIA landmarks define page regions',
      ],
      visualDesign: [
        'Color is not the only means of conveying information',
        'Text can be resized up to 200%',
        'Touch targets are at least 44x44px',
      ],
      motion: [
        'Respect prefers-reduced-motion setting',
        'No content flashes more than 3 times per second',
      ],
    },
    resources: [
      { name: 'Icon Library', location: 'Lucide React: https://lucide.dev/' },
      { name: 'Font Files', location: 'Inter: https://fonts.google.com/specimen/Inter' },
      { name: 'WCAG Guidelines', location: 'https://www.w3.org/WAI/WCAG21/quickref/' },
    ],
    changelog: [
      { version: '1.0', date: new Date().toISOString().split('T')[0], changes: 'Initial release' },
    ],
  };
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
