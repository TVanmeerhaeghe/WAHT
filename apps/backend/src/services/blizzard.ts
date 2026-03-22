import { Region } from "../types/index.js";
import { getClientToken } from "./blizzardAuth.js";

const BLIZZARD_API_URLS: Record<Region, string> = {
  eu: "https://eu.api.blizzard.com",
  us: "https://us.api.blizzard.com",
  kr: "https://kr.api.blizzard.com",
  tw: "https://tw.api.blizzard.com",
};

export async function fetchAuctions(region: Region, realmId: number) {
  const token = await getClientToken(region);
  const baseUrl = BLIZZARD_API_URLS[region];

  const response = await fetch(
    `${baseUrl}/data/wow/connected-realm/${realmId}/auctions?namespace=dynamic-${region}&locale=en_US`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  if (!response.ok) {
    throw new Error(`Blizzard API error: ${response.status}`);
  }

  return response.json();
}

export async function fetchRealms(region: Region) {
  const token = await getClientToken(region);
  const baseUrl = BLIZZARD_API_URLS[region];

  const response = await fetch(
    `${baseUrl}/data/wow/connected-realm/index?namespace=dynamic-${region}&locale=en_US`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  if (!response.ok) {
    throw new Error(`Blizzard API error: ${response.status}`);
  }

  return response.json();
}
