import { PrismaClient } from "@prisma/client";
import {
  Region,
  REGIONS,
  BLIZZARD_API_URLS,
  getClientToken,
} from "@waht/shared";

const prisma = new PrismaClient();

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
  const response = await fetch(
    `${BLIZZARD_API_URLS[region]}/data/wow/connected-realm/${realmId}/auctions?namespace=dynamic-${region}&locale=en_US`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  if (!response.ok) {
    throw new Error(
      `Blizzard API error ${response.status} for realm ${realmId}`,
    );
  }

  const data = (await response.json()) as { auctions: RawAuctionData[] };
  return data.auctions ?? [];
}

async function ensureItemsExist(itemIds: number[]): Promise<void> {
  // Upsert minimal des items — on crée un placeholder si l'item n'existe pas
  // Les vraies données (nom, qualité, icône) seront enrichies plus tard
  const uniqueIds = [...new Set(itemIds)];

  await Promise.all(
    uniqueIds.map((id) =>
      prisma.item.upsert({
        where: { id },
        update: {},
        create: {
          id,
          name: `Item #${id}`,
          quality: "COMMON",
        },
      }),
    ),
  );
}

async function processAuctions(
  auctions: RawAuctionData[],
  realmId: number,
): Promise<void> {
  if (auctions.length === 0) return;

  // On s'assure que tous les items existent avant d'insérer les auctions
  const itemIds = auctions.map((a) => a.item.id);
  await ensureItemsExist(itemIds);

  await prisma.$transaction(
    auctions.map((auction) =>
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

export async function syncRegionAuctions(region: Region): Promise<void> {
  const realms = await prisma.realm.findMany({ where: { region } });

  if (realms.length === 0) {
    console.log(`No realms found for ${region}, skipping`);
    return;
  }

  const token = await getClientToken(region);
  console.log(`Syncing ${realms.length} realms for ${region}`);

  for (const realm of realms) {
    try {
      const auctions = await fetchAuctionsForRealm(region, realm.id, token);
      await processAuctions(auctions, realm.id);
      console.log(`Synced ${auctions.length} auctions for realm ${realm.name}`);
    } catch (error) {
      console.error(`Failed to sync realm ${realm.name}:`, error);
    }
  }
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
