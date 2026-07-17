import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL;

let redis: Redis | null = null;

if (redisUrl) {
  redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
  });

  redis.on('error', (err) => {
    console.error('[Redis] Connection Error:', err.message);
  });

  redis.on('connect', () => {
    console.log('[Redis] Connected successfully');
  });
} else {
  console.log('[Redis] No REDIS_URL set - running without cache');
}

// Safe helpers that work even when Redis is unavailable
export async function cacheGet(key: string): Promise<string | null> {
  if (!redis) return null;
  try {
    return await redis.get(key);
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, ttl: number, value: string): Promise<void> {
  if (!redis) return;
  try {
    await redis.setex(key, ttl, value);
  } catch {
    // silently ignore cache write failures
  }
}

export { redis };
