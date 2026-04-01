import pLimit from "p-limit";
import {
  Region,
  REGIONS,
  BLIZZARD_API_URLS,
  getClientToken,
  checkRateLimit,
  withRetry,
} from "@waht/shared";
import { prisma } from "../lib/prisma.js";
import { redis } from "../lib/redis.js";

const CONCURRENCY_LIMIT = 3;

interface RawAuctionData {
  id: number;
  item: { id: number };
  buyout?: number;
  unit_price?: number;
  quantity: number;
  time_left: string;
}

async function fetchAuctionsForRealm(
  region: Region,
  realmId: number,
  token: string,
): Promise<RawAuctionData[]> {
  const allowed = await checkRateLimit(redis);
  if (!allowed) {
    throw new Error(`Rate limit reached, skipping realm ${realmId}`);
  }

  const data = await withRetry(
    async () => {
      const response = await fetch(
        `${BLIZZARD_API_URLS[region]}/data/wow/connected-realm/${realmId}/auctions?namespace=dynamic-${region}&locale=en_US`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!response.ok) {
        throw new Error(
          `Blizzard API error ${response.status} for realm ${realmId}`,
        );
      }
      return response.json() as Promise<{ auctions: RawAuctionData[] }>;
    },
    { maxAttempts: 3, baseDelayMs: 2000 },
  );

  return data.auctions ?? [];
}

async function ensureItemsExist(itemIds: number[]): Promise<void> {
  const uniqueIds = [...new Set(itemIds)];

  const existing = await prisma.realm.findMany({
    where: { id: { in: uniqueIds } },
    select: { id: true, name: true, connectedRealms: true },
  });

  const existingIds = new Set(existing.map((i: { id: number }) => i.id));
  const missingIds = uniqueIds.filter((id) => !existingIds.has(id));

  if (missingIds.length === 0) return;

  await prisma.item.createMany({
    data: missingIds.map((id) => ({
      id,
      name: `Item #${id}`,
      quality: "COMMON",
    })),
    skipDuplicates: true,
  });
}

async function processAuctions(
  auctions: RawAuctionData[],
  realmId: number,
): Promise<void> {
  if (auctions.length === 0) return;

  const itemIds = auctions.map((a) => a.item.id);
  await ensureItemsExist(itemIds);

  const CHUNK_SIZE = 500;
  for (let i = 0; i < auctions.length; i += CHUNK_SIZE) {
    const chunk = auctions.slice(i, i + CHUNK_SIZE);

    await prisma.$transaction(
      chunk.map((auction) =>
        prisma.rawAuction.upsert({
          where: { id: BigInt(auction.id) },
          update: {
            price: BigInt(auction.buyout ?? auction.unit_price ?? 0),
            quantity: auction.quantity,
            capturedAt: new Date(),
          },
          create: {
            id: BigInt(auction.id),
            itemId: auction.item.id,
            realmId,
            price: BigInt(auction.buyout ?? auction.unit_price ?? 0),
            quantity: auction.quantity,
          },
        }),
      ),
    );
  }

  const itemGroups = auctions.reduce(
    (acc, auction) => {
      const itemId = auction.item.id;
      if (!acc[itemId]) acc[itemId] = [];
      acc[itemId].push(auction.buyout ?? auction.unit_price ?? 0);
      return acc;
    },
    {} as Record<number, number[]>,
  );

  const snapshots = Object.entries(itemGroups).map(([itemId, prices]) => {
    const sorted = prices.sort((a, b) => a - b);
    return {
      itemId: parseInt(itemId),
      realmId,
      minPrice: BigInt(sorted[0]),
      maxPrice: BigInt(sorted[sorted.length - 1]),
      avgPrice: BigInt(
        Math.round(sorted.reduce((a, b) => a + b, 0) / sorted.length),
      ),
      quantity: prices.length,
    };
  });

  await prisma.auctionSnapshot.createMany({ data: snapshots });
}

async function syncRealm(
  region: Region,
  realmId: number,
  realmName: string,
  connectedRealms: string[],
  token: string,
): Promise<void> {
  const auctions = await fetchAuctionsForRealm(region, realmId, token);
  await new Promise((resolve) => setTimeout(resolve, 200));
  await processAuctions(auctions, realmId);

  await prisma.realm.update({
    where: { id: realmId },
    data: { lastSyncedAt: new Date() },
  });

  console.log(
    `Synced ${auctions.length} auctions for realm ${realmName} [${connectedRealms?.join(" + ") ?? realmName}]`,
  );
}

export async function syncRegionAuctions(region: Region): Promise<void> {
  const realms = await prisma.realm.findMany({ where: { region } });

  if (realms.length === 0) {
    console.log(`No realms found for ${region}, skipping`);
    return;
  }

  const token = await getClientToken(region);
  const limit = pLimit(CONCURRENCY_LIMIT);

  console.log(
    `Syncing ${realms.length} realms for ${region} (concurrency: ${CONCURRENCY_LIMIT})`,
  );

  await Promise.all(
    realms.map(
      (realm: { id: number; name: string; connectedRealms: string[] }) =>
        limit(() =>
          syncRealm(
            region,
            realm.id,
            realm.name,
            realm.connectedRealms,
            token,
          ).catch((error) =>
            console.error(`Failed to sync realm ${realm.name}:`, error),
          ),
        ),
    ),
  );
}

export async function syncAllAuctions(): Promise<void> {
  console.log(
    `[${new Date().toISOString()}] Starting auction sync for all regions`,
  );

  for (const region of REGIONS) {
    try {
      await syncRegionAuctions(region);
    } catch (error) {
      console.error(`Failed to sync region ${region}:`, error);
    }
  }

  console.log(`[${new Date().toISOString()}] Auction sync complete`);
}
