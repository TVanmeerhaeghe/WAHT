import { describe, it, expect, vi, beforeEach } from "vitest";
import { buildApp } from "../setup.js";
import { prisma } from "../../lib/prisma.js";

describe("GET /items/:id/prices", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retourne 400 si itemId invalide", async () => {
    const app = buildApp();
    const response = await app.inject({
      method: "GET",
      url: "/items/abc/prices",
    });
    expect(response.statusCode).toBe(400);
  });

  it("retourne 400 si période invalide", async () => {
    const app = buildApp();
    const response = await app.inject({
      method: "GET",
      url: "/items/168487/prices?period=999d",
    });
    expect(response.statusCode).toBe(400);
  });

  it("retourne 404 si realm inexistant", async () => {
    vi.mocked(prisma.realm.findUnique).mockResolvedValue(null);

    const app = buildApp();
    const response = await app.inject({
      method: "GET",
      url: "/items/168487/prices?realm=fake-realm",
    });
    expect(response.statusCode).toBe(404);
  });

  it("retourne les snapshots de prix", async () => {
    vi.mocked(prisma.realm.findUnique).mockResolvedValue({
      id: 1302,
      name: "Archimonde",
      slug: "archimonde",
      region: "eu",
      lastSyncedAt: new Date(),
    } as any);

    vi.mocked(prisma.auctionSnapshot.findMany).mockResolvedValue([
      {
        minPrice: BigInt(1000000),
        maxPrice: BigInt(2000000),
        avgPrice: BigInt(1500000),
        quantity: 5,
        capturedAt: new Date(),
        realm: { name: "Archimonde", slug: "archimonde" },
      },
    ] as any);

    const app = buildApp();
    const response = await app.inject({
      method: "GET",
      url: "/items/168487/prices?realm=archimonde&period=7d",
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.snapshots).toHaveLength(1);
    expect(body.snapshots[0].minPrice).toBe(1000000);
    expect(body.snapshots[0].avgPrice).toBe(1500000);
  });
});
