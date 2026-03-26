import {
  Region,
  BLIZZARD_API_URLS,
  getClientToken,
  checkRateLimit,
  withRetry,
  BlizzardItem,
} from "@waht/shared";
import { prisma } from "../lib/prisma.js";
import { redis } from "../lib/redis.js";

type ItemQuality = "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY";

const BATCH_SIZE = 100;
const REFERENCE_REGION: Region = "eu";

async function fetchItemDetails(
  itemId: number,
  token: string,
): Promise<BlizzardItem | null> {
  try {
    return await withRetry(
      async () => {
        const allowed = await checkRateLimit(redis);
        if (!allowed) throw new Error("Rate limit reached");

        const response = await fetch(
          `${BLIZZARD_API_URLS[REFERENCE_REGION]}/data/wow/item/${itemId}?namespace=static-${REFERENCE_REGION}&locale=en_US`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        if (response.status === 404) return null;
        if (!response.ok)
          throw new Error(`Blizzard API error: ${response.status}`);

        return response.json() as Promise<BlizzardItem>;
      },
      { maxAttempts: 3, baseDelayMs: 1000 },
    );
  } catch (error) {
    console.error(`Failed to fetch item ${itemId}:`, error);
    return null;
  }
}

async function fetchItemIconUrl(
  mediaHref: string,
  token: string,
): Promise<string | null> {
  try {
    const response = await fetch(mediaHref, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) return null;

    const data = (await response.json()) as {
      assets: { key: string; value: string }[];
    };

    return data.assets.find((a) => a.key === "icon")?.value ?? null;
  } catch {
    return null;
  }
}

function mapQuality(blizzardQuality: string): ItemQuality {
  const qualityMap: Record<string, ItemQuality> = {
    POOR: "COMMON",
    COMMON: "COMMON",
    UNCOMMON: "UNCOMMON",
    RARE: "RARE",
    EPIC: "EPIC",
    LEGENDARY: "LEGENDARY",
  };
  return qualityMap[blizzardQuality] ?? "COMMON";
}

export async function enrichItems(): Promise<void> {
  console.log(`[${new Date().toISOString()}] Starting item enrichment`);

  const unenrichedItems = await prisma.item.findMany({
    where: { name: { startsWith: "Item #" } },
    select: { id: true },
    take: BATCH_SIZE,
    orderBy: { id: "desc" },
  });

  if (unenrichedItems.length === 0) {
    console.log("All items are enriched!");
    return;
  }

  console.log(`Enriching ${unenrichedItems.length} items...`);

  const token = await getClientToken(REFERENCE_REGION);
  let enriched = 0;
  let failed = 0;

  for (const item of unenrichedItems) {
    const details = await fetchItemDetails(item.id, token);

    if (!details) {
      await prisma.item.update({
        where: { id: item.id },
        data: { name: `Unknown Item ${item.id}` },
      });
      failed++;
      continue;
    }

    const iconUrl = await fetchItemIconUrl(details.media.key.href, token);

    await prisma.item.update({
      where: { id: item.id },
      data: {
        name: details.name.en_US,
        quality: mapQuality(details.quality.type),
        iconUrl,
      },
    });

    enriched++;
  }

  console.log(
    `[${new Date().toISOString()}] Enrichment complete: ${enriched} enriched, ${failed} not found`,
  );
}
