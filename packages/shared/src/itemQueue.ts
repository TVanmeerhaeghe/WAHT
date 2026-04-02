import Redis from "ioredis";

const QUEUE_KEY = "items:enrich:queue";

export async function pushItemsToQueue(
  redis: Redis,
  itemIds: number[],
): Promise<void> {
  if (itemIds.length === 0) return;
  await redis.sadd(QUEUE_KEY, ...itemIds.map(String));
}

export async function popItemsFromQueue(
  redis: Redis,
  count: number,
): Promise<number[]> {
  const items = await redis.spop(QUEUE_KEY, count);
  return items.map(Number);
}

export async function getQueueSize(redis: Redis): Promise<number> {
  return redis.scard(QUEUE_KEY);
}
