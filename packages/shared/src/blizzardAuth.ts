import { Region, BLIZZARD_TOKEN_URLS } from "./regions.js";

export async function getClientToken(region: Region): Promise<string> {
  const credentials = Buffer.from(
    `${process.env.BLIZZARD_CLIENT_ID}:${process.env.BLIZZARD_CLIENT_SECRET}`,
  ).toString("base64");

  const response = await fetch(BLIZZARD_TOKEN_URLS[region], {
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
