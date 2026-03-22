import { Region } from "@prisma/client";

const BLIZZARD_API_URLS: Record<Region, string> = {
  eu: "https://eu.api.blizzard.com",
  us: "https://us.api.blizzard.com",
  kr: "https://kr.api.blizzard.com",
  tw: "https://tw.api.blizzard.com",
};

const TOKEN_URLS: Record<Region, string> = {
  eu: "https://eu.battle.net/oauth/token",
  us: "https://us.battle.net/oauth/token",
  kr: "https://kr.battle.net/oauth/token",
  tw: "https://tw.battle.net/oauth/token",
};

// Token client credentials — différent du token utilisateur OAuth2
// Utilisé pour les appels API sans contexte utilisateur (prix, auctions...)
async function getClientToken(region: Region): Promise<string> {
  const credentials = Buffer.from(
    `${process.env.BLIZZARD_CLIENT_ID}:${process.env.BLIZZARD_CLIENT_SECRET}`,
  ).toString("base64");

  const response = await fetch(TOKEN_URLS[region], {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error(`Failed to get client token: ${response.status}`);
  }

  const data = (await response.json()) as { access_token: string };
  return data.access_token;
}

export async function fetchAuctions(region: Region, realmId: number) {
  const token = await getClientToken(region);
  const baseUrl = BLIZZARD_API_URLS[region];

  const response = await fetch(
    `${baseUrl}/data/wow/connected-realm/${realmId}/auctions?namespace=dynamic-${region}&locale=en_US`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
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
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Blizzard API error: ${response.status}`);
  }

  return response.json();
}
