'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Palette,
  Type,
  Layout,
  Accessibility,
  FileText,
  Zap,
  ArrowRight,
  Globe,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validateUrl = (input: string): boolean => {
    try {
      const urlToTest = input.startsWith('http') ? input : `https://${input}`;
      new URL(urlToTest);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!url.trim()) {
      setError('Please enter a website URL');
      return;
    }

    if (!validateUrl(url)) {
      setError('Please enter a valid URL (e.g., example.com or https://example.com)');
      return;
    }

    setIsLoading(true);

    // Normalize URL
    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;

    // Navigate to processing page with URL as query param
    router.push(`/processing?url=${encodeURIComponent(normalizedUrl)}`);
  };

  const features = [
    {
      icon: Palette,
      title: 'Color Extraction',
      description: 'Automatically extracts and organizes your color palette with hex, RGB values, and semantic roles.',
    },
    {
      icon: Type,
      title: 'Typography Analysis',
      description: 'Identifies font families, sizes, weights, and builds a comprehensive type scale.',
    },
    {
      icon: Layout,
      title: 'Component Detection',
      description: 'Detects buttons, cards, forms, and navigation patterns used across your site.',
    },
    {
      icon: Accessibility,
      title: 'Accessibility Audit',
      description: 'Evaluates color contrast ratios and provides WCAG compliance documentation.',
    },
    {
      icon: FileText,
      title: 'Professional PDF',
      description: 'Generates a beautifully formatted, 19-page style guide ready for your team.',
    },
    {
      icon: Zap,
      title: 'Instant Results',
      description: 'Complete analysis and PDF generation in under 60 seconds.',
    },
  ];

  const steps = [
    { number: '01', title: 'Enter URL', description: 'Paste any website URL you want to analyze' },
    { number: '02', title: 'AI Analysis', description: 'Our engine extracts design patterns automatically' },
    { number: '03', title: 'Download PDF', description: 'Get a professional style guide document' },
  ];

  return (
    <div className="min-h-screen bg-[#191919]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="https://docbuildr.app" target="_blank" rel="noopener noreferrer" className="flex items-center">
            <img
              src="/docbuildr-logo.svg"
              alt="DocBuildr"
              className="h-8 w-auto"
            />
          </a>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-[#A7A39A] hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-[#A7A39A] hover:text-white transition-colors">How it Works</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-24">
        <section className="max-w-7xl mx-auto px-6 py-20 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#202020] border border-[#444B4E] mb-8 animate-fade-in">
              <Sparkles className="w-4 h-4 text-[#407EC9]" />
              <span className="text-sm text-[#EDEEEE]">AI-Powered Design System Extraction</span>
            </div>

            {/* Headline */}
            <h1
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight animate-fade-in"
              style={{ fontFamily: "'Red Hat Display', sans-serif", animationDelay: '0.1s' }}
            >
              Generate Professional{' '}
              <span className="gradient-text">Style Guides</span>
              {' '}in Seconds
            </h1>

            {/* Subheadline */}
            <p
              className="text-lg md:text-xl text-[#A7A39A] mb-12 max-w-2xl mx-auto animate-fade-in"
              style={{ animationDelay: '0.2s' }}
            >
              Enter any website URL and receive a comprehensive, beautifully formatted
              PDF style guide documenting colors, typography, components, and more.
            </p>

            {/* URL Input Form */}
            <form
              onSubmit={handleSubmit}
              className="max-w-2xl mx-auto mb-8 animate-fade-in"
              style={{ animationDelay: '0.3s' }}
            >
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A7A39A]" />
                  <Input
                    type="text"
                    placeholder="Enter website URL (e.g., stripe.com)"
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      setError('');
                    }}
                    className="w-full h-14 pl-12 pr-4 bg-[#202020] border-[#444B4E] text-white placeholder:text-[#A7A39A] rounded-xl focus:ring-2 focus:ring-[#407EC9] focus:border-transparent text-lg"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-14 px-8 bg-[#407EC9] hover:bg-[#327DA9] text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-[#407EC9]/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Analyzing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>Generate Guide</span>
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  )}
                </Button>
              </div>
              {error && (
                <p className="mt-3 text-[#D44E49] text-sm text-left">{error}</p>
              )}
            </form>

            {/* Example links */}
            <div
              className="flex flex-wrap items-center justify-center gap-3 text-sm animate-fade-in"
              style={{ animationDelay: '0.4s' }}
            >
              <span className="text-[#A7A39A]">Try examples:</span>
              {['stripe.com', 'notion.so', 'linear.app'].map((example) => (
                <button
                  key={example}
                  onClick={() => setUrl(example)}
                  className="px-3 py-1.5 rounded-lg bg-[#202020] border border-[#444B4E] text-[#EDEEEE] hover:border-[#407EC9] hover:text-[#407EC9] transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          {/* Preview mockup */}
          <div
            className="mt-20 max-w-5xl mx-auto animate-fade-in"
            style={{ animationDelay: '0.5s' }}
          >
            <div className="relative rounded-2xl bg-[#202020] border border-[#444B4E] p-6 md:p-10 overflow-hidden">
              {/* Glow effect */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#407EC9] opacity-10 blur-[100px] rounded-full" />

              {/* Mock PDF preview */}
              <div className="relative grid md:grid-cols-3 gap-6">
                {/* Page 1 - Cover */}
                <div className="bg-white rounded-lg shadow-xl p-6 aspect-[3/4] flex flex-col">
                  <div className="text-[#021A2E] font-bold text-xl mb-2" style={{ fontFamily: "'Red Hat Display', sans-serif" }}>
                    YourSite.com
                  </div>
                  <div className="text-gray-500 text-sm mb-6">Brand & Design Style Guide</div>
                  <div className="flex gap-2 mt-auto">
                    <div className="w-12 h-8 rounded bg-[#021A2E]" />
                    <div className="w-12 h-8 rounded bg-[#014379]" />
                    <div className="w-12 h-8 rounded bg-[#0D91FD]" />
                    <div className="w-12 h-8 rounded bg-[#5DB5FE]" />
                    <div className="w-12 h-8 rounded bg-[#C2E3FE]" />
                  </div>
                </div>

                {/* Page 2 - Colors */}
                <div className="bg-white rounded-lg shadow-xl p-6 aspect-[3/4]">
                  <div className="text-[#0D91FD] font-semibold text-lg mb-4" style={{ fontFamily: "'Red Hat Display', sans-serif" }}>
                    2.2 Color Palette
                  </div>
                  <div className="space-y-2">
                    {['Primary', 'Secondary', 'Accent', 'Text', 'Background'].map((role, i) => (
                      <div key={role} className="flex items-center gap-3">
                        <div
                          className="w-6 h-6 rounded"
                          style={{ backgroundColor: ['#021A2E', '#014379', '#0D91FD', '#374151', '#F9FAFB'][i] }}
                        />
                        <span className="text-gray-700 text-sm">{role}</span>
                        <span className="text-gray-400 text-xs ml-auto">
                          {['#021A2E', '#014379', '#0D91FD', '#374151', '#F9FAFB'][i]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Page 3 - Typography */}
                <div className="bg-white rounded-lg shadow-xl p-6 aspect-[3/4]">
                  <div className="text-[#0D91FD] font-semibold text-lg mb-4" style={{ fontFamily: "'Red Hat Display', sans-serif" }}>
                    2.3 Typography
                  </div>
                  <div className="space-y-3">
                    <div className="text-2xl font-bold text-gray-800">Heading 1</div>
                    <div className="text-xl font-semibold text-gray-700">Heading 2</div>
                    <div className="text-lg font-medium text-gray-600">Heading 3</div>
                    <div className="text-base text-gray-500">Body text looks like this, with good readability.</div>
                    <div className="text-sm text-gray-400">Caption text for smaller details.</div>
                  </div>
                </div>
              </div>

              {/* Page indicator */}
              <div className="flex items-center justify-center gap-2 mt-8">
                <div className="w-2 h-2 rounded-full bg-[#407EC9]" />
                <div className="w-2 h-2 rounded-full bg-[#444B4E]" />
                <div className="w-2 h-2 rounded-full bg-[#444B4E]" />
                <span className="text-[#A7A39A] text-sm ml-2">19 pages total</span>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section id="how-it-works" className="py-20 bg-[#202020]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2
                className="text-3xl md:text-4xl font-bold mb-4"
                style={{ fontFamily: "'Red Hat Display', sans-serif" }}
              >
                How It Works
              </h2>
              <p className="text-[#A7A39A] text-lg max-w-2xl mx-auto">
                Three simple steps to create a comprehensive style guide for any website
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <div key={step.number} className="relative">
                  {/* Connector line */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-[#407EC9] to-transparent -translate-x-1/2" />
                  )}

                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-[#191919] border border-[#444B4E] mb-6">
                      <span
                        className="text-3xl font-bold gradient-text"
                        style={{ fontFamily: "'Red Hat Display', sans-serif" }}
                      >
                        {step.number}
                      </span>
                    </div>
                    <h3
                      className="text-xl font-semibold mb-2"
                      style={{ fontFamily: "'Red Hat Display', sans-serif" }}
                    >
                      {step.title}
                    </h3>
                    <p className="text-[#A7A39A]">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2
                className="text-3xl md:text-4xl font-bold mb-4"
                style={{ fontFamily: "'Red Hat Display', sans-serif" }}
              >
                Everything You Need
              </h2>
              <p className="text-[#A7A39A] text-lg max-w-2xl mx-auto">
                Our AI analyzes every aspect of a website's design system and documents it professionally
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => (
                <Card
                  key={feature.title}
                  className="bg-[#202020] border-[#444B4E] hover:border-[#407EC9] transition-all duration-300 hover:shadow-lg hover:shadow-[#407EC9]/10 hover:-translate-y-1"
                >
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-[#407EC9]/10 flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-[#407EC9]" />
                    </div>
                    <h3
                      className="text-lg font-semibold mb-2 text-white"
                      style={{ fontFamily: "'Red Hat Display', sans-serif" }}
                    >
                      {feature.title}
                    </h3>
                    <p className="text-[#A7A39A] text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* What's Included */}
        <section className="py-20 bg-[#202020]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2
                  className="text-3xl md:text-4xl font-bold mb-6"
                  style={{ fontFamily: "'Red Hat Display', sans-serif" }}
                >
                  Professional PDF Output
                </h2>
                <p className="text-[#A7A39A] text-lg mb-8">
                  Every style guide includes comprehensive documentation following industry-standard structure,
                  ready to share with your team or clients.
                </p>

                <div className="space-y-4">
                  {[
                    'Cover page with brand colors',
                    'Table of contents for easy navigation',
                    'Color palette with hex, RGB values',
                    'Typography scale and font specifications',
                    'UI component documentation',
                    'Layout and grid system specs',
                    'Accessibility compliance report',
                    'Resource links and changelog'
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#448361] flex-shrink-0" />
                      <span className="text-[#EDEEEE]">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#407EC9]/20 to-[#448361]/20 blur-3xl rounded-full" />
                <div className="relative bg-[#191919] border border-[#444B4E] rounded-2xl p-8">
                  <div className="aspect-[3/4] bg-white rounded-lg shadow-2xl p-6">
                    <div className="border-b border-gray-200 pb-4 mb-4">
                      <div className="text-2xl font-bold text-[#021A2E]" style={{ fontFamily: "'Red Hat Display', sans-serif" }}>
                        Brand Style Guide
                      </div>
                      <div className="text-sm text-gray-500 mt-1">Version 1.0 | Generated Today</div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-3 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-full" />
                      <div className="h-3 bg-gray-200 rounded w-5/6" />
                      <div className="mt-6 flex gap-2">
                        <div className="w-8 h-8 rounded bg-[#021A2E]" />
                        <div className="w-8 h-8 rounded bg-[#0D91FD]" />
                        <div className="w-8 h-8 rounded bg-[#448361]" />
                        <div className="w-8 h-8 rounded bg-[#D9730D]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2
              className="text-3xl md:text-4xl font-bold mb-6"
              style={{ fontFamily: "'Red Hat Display', sans-serif" }}
            >
              Ready to Create Your Style Guide?
            </h2>
            <p className="text-[#A7A39A] text-lg mb-8 max-w-2xl mx-auto">
              Join designers and developers who use our tool to document design systems
              quickly and professionally.
            </p>
            <Button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="h-14 px-10 bg-[#407EC9] hover:bg-[#327DA9] text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-[#407EC9]/25"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-[#444B4E]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[#407EC9] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-[#A7A39A]">Style Guide Generator</span>
            </div>
            <p className="text-[#A7A39A] text-sm">
              Made with ❤️ by <a href="https://tom-panos.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Tom in Milwaukee, WI</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
