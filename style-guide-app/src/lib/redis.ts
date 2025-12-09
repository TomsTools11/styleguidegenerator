import Redis from 'ioredis';

// Redis connection configuration
// Railway provides REDIS_URL automatically when you add a Redis service
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Create Redis client with connection handling
function createRedisClient(): Redis {
  const client = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      // Exponential backoff with max 30 seconds
      const delay = Math.min(times * 1000, 30000);
      return delay;
    },
    // Reconnect on error
    reconnectOnError(err) {
      const targetErrors = ['READONLY', 'ECONNRESET', 'ETIMEDOUT'];
      return targetErrors.some((e) => err.message.includes(e));
    },
  });

  client.on('connect', () => {
    console.log('Redis connected');
  });

  client.on('error', (err) => {
    console.error('Redis connection error:', err.message);
  });

  client.on('reconnecting', () => {
    console.log('Redis reconnecting...');
  });

  return client;
}

// Use globalThis to persist across hot reloads in development
const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

export const redis = globalForRedis.redis ?? createRedisClient();

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis;
}

// Helper to check if Redis is available
export async function isRedisConnected(): Promise<boolean> {
  try {
    await redis.ping();
    return true;
  } catch {
    return false;
  }
}
