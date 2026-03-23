import type { Region } from "@waht/shared";

export type { Region } from "@waht/shared";
export { REGIONS } from "@waht/shared";

export interface SessionUser {
  id: number;
  battletag: string;
  accessToken: string;
  region: Region;
}
