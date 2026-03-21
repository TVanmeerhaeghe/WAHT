export interface SessionUser {
  id: number;
  battletag: string;
  accessToken: string;
  region: "eu" | "us" | "kr" | "tw";
}
