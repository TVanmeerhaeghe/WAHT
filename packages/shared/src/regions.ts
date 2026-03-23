export type Region = "eu" | "us" | "kr" | "tw";
export const REGIONS: Region[] = ["eu", "us", "kr", "tw"];

export const BLIZZARD_API_URLS: Record<Region, string> = {
  eu: "https://eu.api.blizzard.com",
  us: "https://us.api.blizzard.com",
  kr: "https://kr.api.blizzard.com",
  tw: "https://tw.api.blizzard.com",
};

export const BLIZZARD_TOKEN_URLS: Record<Region, string> = {
  eu: "https://eu.battle.net/oauth/token",
  us: "https://us.battle.net/oauth/token",
  kr: "https://kr.battle.net/oauth/token",
  tw: "https://tw.battle.net/oauth/token",
};
