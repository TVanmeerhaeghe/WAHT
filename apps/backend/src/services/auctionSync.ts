import { prisma } from "../lib/prisma.js";
import { redis } from "../lib/redis.js";
import { Region, BLIZZARD_API_URLS, getClientToken } from "@waht/shared";

const ON_DEMAND_SYNC_TTL = 60 * 5;

interface RawAuctionData {
  id: number;
  item: { id: number };
  buyout?: number;
  unit_price?: number;
  quantity: number;
}

async function ensureItemsExist(itemIds: number[]): Promise<void> {
  const uniqueIds = [...new Set(itemIds)];

  const existing = await prisma.item.findMany({
    where: { id: { in: uniqueIds } },
    select: { id: true },
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

export async function syncRealmOnDemand(
  realmId: number,
  region: Region,
): Promise<boolean> {
  const lockKey = `sync:lock:${realmId}`;

  // Vérifie si une sync récente existe déjà
  const locked = await redis.get(lockKey);
  if (locked) return false;

  // Pose le verrou pour éviter les syncs simultanées
  await redis.set(lockKey, "1", "EX", ON_DEMAND_SYNC_TTL);

  try {
    const token = await getClientToken(region);

    const response = await fetch(
      `${BLIZZARD_API_URLS[region]}/data/wow/connected-realm/${realmId}/auctions?namespace=dynamic-${region}&locale=en_US`,
      { headers: { Authorization: `Bearer ${token}` } },
    );

    if (!response.ok) {
      throw new Error(`Blizzard API error: ${response.status}`);
    }

    const data = (await response.json()) as { auctions: RawAuctionData[] };
    const auctions = data.auctions ?? [];

    if (auctions.length === 0) return true;

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

    await prisma.realm.update({
      where: { id: realmId },
      data: { lastSyncedAt: new Date() },
    });

    return true;
  } catch (error) {
    // En cas d'erreur on libère le verrou pour permettre un retry
    await redis.del(lockKey);
    throw error;
  }
}
