import { Region, BLIZZARD_API_URLS } from "@waht/shared";
import { getClientToken } from "./blizzardAuth.js";

export async function fetchAuctions(region: Region, realmId: number) {
  const token = await getClientToken(region);

  const response = await fetch(
    `${BLIZZARD_API_URLS[region]}/data/wow/connected-realm/${realmId}/auctions?namespace=dynamic-${region}&locale=en_US`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  if (!response.ok) {
    throw new Error(`Blizzard API error: ${response.status}`);
  }

  return response.json();
}

export async function fetchRealms(region: Region) {
  const token = await getClientToken(region);

  const response = await fetch(
    `${BLIZZARD_API_URLS[region]}/data/wow/connected-realm/index?namespace=dynamic-${region}&locale=en_US`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  if (!response.ok) {
    throw new Error(`Blizzard API error: ${response.status}`);
  }

  return response.json();
}
