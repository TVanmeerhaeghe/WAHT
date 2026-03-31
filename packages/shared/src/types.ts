export interface BlizzardItem {
  id: number;
  name: { en_US: string };
  quality: { type: string };
  media: { key: { href: string } };
}

export interface BlizzardUserInfo {
  id: number;
  battletag: string;
  sub: string;
}
