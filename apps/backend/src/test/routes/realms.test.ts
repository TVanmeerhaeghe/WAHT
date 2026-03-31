import { describe, it, expect, vi, beforeEach } from "vitest";
import { buildApp } from "../setup.js";
import { prisma } from "../../lib/prisma.js";

describe("GET /realms", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retourne la liste des realms", async () => {
    const mockRealms = [
      {
        id: 1302,
        name: "Archimonde",
        slug: "archimonde",
        region: "eu",
        lastSyncedAt: new Date(),
      },
      {
        id: 3391,
        name: "Silvermoon",
        slug: "silvermoon",
        region: "eu",
        lastSyncedAt: new Date(),
      },
    ];

    vi.mocked(prisma.realm.findMany).mockResolvedValue(mockRealms as any);

    const app = buildApp();
    const response = await app.inject({ method: "GET", url: "/realms" });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body).toHaveLength(2);
    expect(body[0].name).toBe("Archimonde");
  });

  it("retourne un tableau vide si aucun realm", async () => {
    vi.mocked(prisma.realm.findMany).mockResolvedValue([]);

    const app = buildApp();
    const response = await app.inject({ method: "GET", url: "/realms" });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toHaveLength(0);
  });
});
