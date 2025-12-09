import { NextRequest, NextResponse } from 'next/server';
import { getJob } from '@/lib/job-store';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const job = await getJob(id);

  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  return NextResponse.json({
    status: job.status,
    progress: job.progress,
    error: job.error,
  });
}
