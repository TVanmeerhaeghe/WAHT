export function useApi() {
  const config = useRuntimeConfig();
  const baseUrl = config.public.apiUrl;

  async function searchItems(params: {
    q?: string;
    page?: number;
    limit?: number;
  }) {
    const query = new URLSearchParams();
    if (params.q) query.set("q", params.q);
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));

    return $fetch<{
      items: Array<{
        id: number;
        name: string;
        quality: string;
        iconUrl: string | null;
      }>;
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>(`${baseUrl}/items/search?${query}`);
  }

  async function getRealms() {
    return $fetch<
      Array<{
        id: number;
        name: string;
        slug: string;
        region: string;
        connectedRealms: string[];
      }>
    >(`${baseUrl}/realms`);
  }

  async function getItemPrices(
    itemId: number,
    params: {
      realm?: string;
      period?: "7d" | "30d" | "90d";
    },
  ) {
    const query = new URLSearchParams();
    if (params.realm) query.set("realm", params.realm);
    if (params.period) query.set("period", params.period);

    return $fetch<{
      itemId: number;
      period: string;
      realm?: string;
      snapshots: Array<{
        minPrice: number;
        maxPrice: number;
        avgPrice: number;
        quantity: number;
        capturedAt: string;
        realm: { name: string; slug: string };
      }>;
    }>(`${baseUrl}/items/${itemId}/prices?${query}`);
  }

  async function getItem(itemId: number) {
    return $fetch<{
      id: number;
      name: string;
      quality: string;
      iconUrl: string | null;
    }>(`${baseUrl}/items/${itemId}`);
  }

  return { searchItems, getRealms, getItemPrices, getItem };
}
