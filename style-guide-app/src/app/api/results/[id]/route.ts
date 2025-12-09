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

  if (job.status !== 'completed') {
    return NextResponse.json({ error: 'Job not completed' }, { status: 400 });
  }

  if (!job.data) {
    return NextResponse.json({ error: 'No data available' }, { status: 500 });
  }

  return NextResponse.json(job.data);
}
