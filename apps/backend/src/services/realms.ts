import {
  Region,
  REGIONS,
  BLIZZARD_API_URLS,
  getClientToken,
} from "@waht/shared";
import { prisma } from "../lib/prisma.js";

interface ConnectedRealmRef {
  href: string;
}

interface ConnectedRealmDetail {
  id: number;
  realms: { name: string; slug: string }[];
}

async function fetchConnectedRealmDetail(
  href: string,
  token: string,
): Promise<ConnectedRealmDetail> {
  const response = await fetch(`${href}&locale=en_US`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch realm detail: ${response.status}`);
  }

  return response.json() as Promise<ConnectedRealmDetail>;
}

export async function syncRealms(region: Region): Promise<number> {
  const token = await getClientToken(region);

  const indexResponse = await fetch(
    `${BLIZZARD_API_URLS[region]}/data/wow/connected-realm/index?namespace=dynamic-${region}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  if (!indexResponse.ok) {
    throw new Error(
      `Failed to fetch realm index for ${region}: ${indexResponse.status}`,
    );
  }

  const index = (await indexResponse.json()) as {
    connected_realms: ConnectedRealmRef[];
  };

  let synced = 0;

  for (const ref of index.connected_realms) {
    try {
      const detail = await fetchConnectedRealmDetail(ref.href, token);
      const mainRealm = detail.realms[0];
      if (!mainRealm) continue;

      await prisma.realm.upsert({
        where: { id: detail.id },
        update: {
          name: mainRealm.name,
          slug: mainRealm.slug,
          region,
          connectedRealms: detail.realms.map((r) => r.name),
        },
        create: {
          id: detail.id,
          name: mainRealm.name,
          slug: mainRealm.slug,
          region,
          connectedRealms: detail.realms.map((r) => r.name),
        },
      });

      const realmNames = detail.realms.map((r) => r.name).join(" + ");
      console.log(`Synced Connected Realm ${detail.id}: ${realmNames}`);

      synced++;
    } catch (error) {
      console.error(`Failed to sync realm ${ref.href}:`, error);
    }
  }

  return synced;
}

export async function syncAllRegions(): Promise<Record<Region, number>> {
  const results = {} as Record<Region, number>;

  for (const region of REGIONS) {
    try {
      results[region] = await syncRealms(region);
      console.log(`Synced ${results[region]} realms for ${region}`);
    } catch (error) {
      console.error(`Failed to sync realms for ${region}:`, error);
      results[region] = 0;
    }
  }

  return results;
}
