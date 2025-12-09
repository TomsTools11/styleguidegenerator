import { redis, isRedisConnected } from './redis';
import type { StyleGuideData } from '@/types/style-guide';

export interface Job {
  status: string;
  progress: number;
  error?: string;
  data?: StyleGuideData;
  url: string;
  createdAt: string;
}

// Job key prefix for Redis
const JOB_PREFIX = 'styleguide:job:';

// Job TTL in seconds (24 hours - jobs auto-expire after this)
const JOB_TTL = parseInt(process.env.JOB_TTL_SECONDS || '86400', 10);

// In-memory fallback for when Redis is unavailable
const memoryStore = new Map<string, Job>();

function getJobKey(jobId: string): string {
  return `${JOB_PREFIX}${jobId}`;
}

export async function createJob(jobId: string, url: string): Promise<void> {
  const job: Job = {
    status: 'pending',
    progress: 0,
    url,
    createdAt: new Date().toISOString(),
  };

  const connected = await isRedisConnected();
  if (connected) {
    await redis.setex(getJobKey(jobId), JOB_TTL, JSON.stringify(job));
  } else {
    // Fallback to in-memory
    memoryStore.set(jobId, job);
  }
}

export async function updateJob(jobId: string, updates: Partial<Job>): Promise<void> {
  const connected = await isRedisConnected();

  if (connected) {
    const key = getJobKey(jobId);
    const existing = await redis.get(key);

    if (existing) {
      const job = JSON.parse(existing) as Job;
      const updated = { ...job, ...updates };
      // Reset TTL on each update to keep active jobs alive
      await redis.setex(key, JOB_TTL, JSON.stringify(updated));
    }
  } else {
    // Fallback to in-memory
    const job = memoryStore.get(jobId);
    if (job) {
      memoryStore.set(jobId, { ...job, ...updates });
    }
  }
}

export async function getJob(jobId: string): Promise<Job | undefined> {
  const connected = await isRedisConnected();

  if (connected) {
    const data = await redis.get(getJobKey(jobId));
    if (data) {
      return JSON.parse(data) as Job;
    }
    return undefined;
  } else {
    // Fallback to in-memory
    return memoryStore.get(jobId);
  }
}

export async function deleteJob(jobId: string): Promise<void> {
  const connected = await isRedisConnected();

  if (connected) {
    await redis.del(getJobKey(jobId));
  } else {
    // Fallback to in-memory
    memoryStore.delete(jobId);
  }
}

// Utility: Get all active jobs (useful for monitoring)
export async function getActiveJobCount(): Promise<number> {
  const connected = await isRedisConnected();

  if (connected) {
    const keys = await redis.keys(`${JOB_PREFIX}*`);
    return keys.length;
  } else {
    return memoryStore.size;
  }
}
