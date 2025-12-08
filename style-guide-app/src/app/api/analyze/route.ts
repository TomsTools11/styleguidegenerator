import { NextRequest, NextResponse } from 'next/server';
import { analyzeWebsite } from '@/lib/analyzer';
import { createJob, updateJob, getJob } from '@/lib/job-store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    // Create job ID
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Initialize job
    createJob(jobId, url);

    // Start analysis in background
    processJob(jobId, url);

    return NextResponse.json({ jobId, status: 'pending' });
  } catch (error) {
    console.error('Error starting analysis:', error);
    return NextResponse.json(
      { error: 'Failed to start analysis' },
      { status: 500 }
    );
  }
}

async function processJob(jobId: string, url: string) {
  const job = getJob(jobId);
  if (!job) return;

  try {
    // Update status: fetching
    updateJob(jobId, { status: 'fetching', progress: 10 });
    await sleep(500);

    // Update status: extracting colors
    updateJob(jobId, { status: 'extracting_colors', progress: 30 });
    await sleep(500);

    // Update status: extracting typography
    updateJob(jobId, { status: 'extracting_typography', progress: 50 });
    await sleep(500);

    // Update status: identifying components
    updateJob(jobId, { status: 'identifying_components', progress: 70 });

    // Perform actual analysis
    const data = await analyzeWebsite(url);

    // Update status: generating PDF
    updateJob(jobId, { status: 'generating_pdf', progress: 90, data });
    await sleep(500);

    // Complete
    updateJob(jobId, { status: 'completed', progress: 100 });
  } catch (error) {
    console.error('Job failed:', error);
    updateJob(jobId, {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Analysis failed',
    });
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
