import Redis from "ioredis";

// Blizzard limite à 36000 requêtes/heure par client soit 10/sec
const MAX_REQUESTS_PER_HOUR = 36000;
const WINDOW_SECONDS = 3600;

export async function checkRateLimit(redis: Redis): Promise<boolean> {
  const key = "blizzard:rate:requests";
  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, WINDOW_SECONDS);
  }

  return count <= MAX_REQUESTS_PER_HOUR;
}

export async function getRateLimitStatus(redis: Redis): Promise<{
  count: number;
  remaining: number;
  resetIn: number;
}> {
  const key = "blizzard:rate:requests";
  const [count, ttl] = await Promise.all([redis.get(key), redis.ttl(key)]);

  const current = parseInt(count ?? "0");
  return {
    count: current,
    remaining: Math.max(0, MAX_REQUESTS_PER_HOUR - current),
    resetIn: ttl,
  };
}
