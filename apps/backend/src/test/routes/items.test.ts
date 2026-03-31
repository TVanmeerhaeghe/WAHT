import { describe, it, expect, vi, beforeEach } from "vitest";
import { buildApp } from "../setup.js";
import { prisma } from "../../lib/prisma.js";

describe("GET /items/search", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retourne les items avec pagination", async () => {
    const mockItems = [
      { id: 168487, name: "Zin'anthid", quality: "COMMON", iconUrl: null },
    ];

    vi.mocked(prisma.item.findMany).mockResolvedValue(mockItems as any);
    vi.mocked(prisma.item.count).mockResolvedValue(1);

    const app = buildApp();
    const response = await app.inject({
      method: "GET",
      url: "/items/search?q=zin",
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.items).toHaveLength(1);
    expect(body.items[0].name).toBe("Zin'anthid");
    expect(body.pagination.total).toBe(1);
  });

  it("respecte la limite max de 50 items par page", async () => {
    vi.mocked(prisma.item.findMany).mockResolvedValue([]);
    vi.mocked(prisma.item.count).mockResolvedValue(0);

    const app = buildApp();
    const response = await app.inject({
      method: "GET",
      url: "/items/search?limit=999",
    });

    expect(response.statusCode).toBe(200);
    // Vérifie que Prisma a bien été appelé avec take: 50 max
    expect(prisma.item.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 50 }),
    );
  });

  it("retourne page 1 par défaut", async () => {
    vi.mocked(prisma.item.findMany).mockResolvedValue([]);
    vi.mocked(prisma.item.count).mockResolvedValue(0);

    const app = buildApp();
    const response = await app.inject({ method: "GET", url: "/items/search" });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.pagination.page).toBe(1);
  });
});
