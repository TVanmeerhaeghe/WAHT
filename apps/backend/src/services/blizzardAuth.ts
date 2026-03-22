import { Region } from "../types/index.js";

const TOKEN_URLS: Record<Region, string> = {
  eu: "https://eu.battle.net/oauth/token",
  us: "https://us.battle.net/oauth/token",
  kr: "https://kr.battle.net/oauth/token",
  tw: "https://tw.battle.net/oauth/token",
};

export async function getClientToken(region: Region): Promise<string> {
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
    throw new Error(
      `Failed to get client token for ${region}: ${response.status}`,
    );
  }

  const data = (await response.json()) as { access_token: string };
  return data.access_token;
}
