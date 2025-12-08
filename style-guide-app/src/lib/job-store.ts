import type { StyleGuideData } from '@/types/style-guide';

export interface Job {
  status: string;
  progress: number;
  error?: string;
  data?: StyleGuideData;
  url: string;
  createdAt: string;
}

// Use globalThis to persist across hot reloads in development
const globalForJobs = globalThis as unknown as {
  jobStore: Map<string, Job> | undefined;
};

export const jobStore = globalForJobs.jobStore ?? new Map<string, Job>();

if (process.env.NODE_ENV !== 'production') {
  globalForJobs.jobStore = jobStore;
}

export function createJob(jobId: string, url: string): void {
  jobStore.set(jobId, {
    status: 'pending',
    progress: 0,
    url,
    createdAt: new Date().toISOString(),
  });
}

export function updateJob(jobId: string, updates: Partial<Job>): void {
  const job = jobStore.get(jobId);
  if (job) {
    jobStore.set(jobId, { ...job, ...updates });
  }
}

export function getJob(jobId: string): Job | undefined {
  return jobStore.get(jobId);
}

export function deleteJob(jobId: string): void {
  jobStore.delete(jobId);
}
