export type Region = "eu" | "us" | "kr" | "tw";

export const REGIONS: Region[] = ["eu", "us", "kr", "tw"];

export interface SessionUser {
  id: number;
  battletag: string;
  accessToken: string;
  region: Region;
}
