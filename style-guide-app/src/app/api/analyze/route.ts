import { NextRequest, NextResponse } from 'next/server';
import { analyzeWebsite } from '@/lib/analyzer';

// Vercel: Chromium analysis takes 30–60s; default 10s timeout would kill
// every request. Pro plan required (Hobby caps maxDuration at 10s).
export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  let url: string | undefined;
  try {
    const body = await request.json();
    url = body.url;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate URL — only http/https, no javascript:/file:/etc.
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return NextResponse.json(
        { error: 'Only http(s) URLs are allowed' },
        { status: 400 },
      );
    }

    // Run the full analysis inline. Returning data directly avoids the
    // need for shared state across serverless instances — Vercel splits
    // requests across lambdas, so an in-memory job store would 404 the
    // status poll the moment it landed on a different instance.
    const data = await analyzeWebsite(url);

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Analysis failed for', url, error);
    const message = error instanceof Error ? error.message : 'Analysis failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
