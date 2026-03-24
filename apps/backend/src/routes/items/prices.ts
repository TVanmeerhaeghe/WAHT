import { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prisma.js";
import { redis } from "../../lib/redis.js";

const CACHE_TTL = 60 * 5;

const PERIODS: Record<string, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

export async function itemPricesRoutes(app: FastifyInstance) {
  app.get<{
    Params: { id: string };
    Querystring: { realm?: string; period?: string };
  }>("/items/:id/prices", async (request, reply) => {
    const itemId = parseInt(request.params.id);
    const realmSlug = request.query.realm;
    const period = request.query.period ?? "30d";

    if (isNaN(itemId)) {
      return reply.status(400).send({ error: "Invalid item ID" });
    }

    if (!PERIODS[period]) {
      return reply
        .status(400)
        .send({ error: "Invalid period. Use 7d, 30d or 90d" });
    }

    const cacheKey = `items:${itemId}:prices:${realmSlug ?? "all"}:${period}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return reply.send(JSON.parse(cached));
    }

    const since = new Date();
    since.setDate(since.getDate() - PERIODS[period]);

    // Résout le realm si un slug est fourni
    let realmId: number | undefined;
    if (realmSlug) {
      const realm = await prisma.realm.findUnique({
        where: { slug: realmSlug },
        select: { id: true },
      });

      if (!realm) {
        return reply.status(404).send({ error: "Realm not found" });
      }

      realmId = realm.id;
    }

    const snapshots = await prisma.auctionSnapshot.findMany({
      where: {
        itemId,
        ...(realmId ? { realmId } : {}),
        capturedAt: { gte: since },
      },
      orderBy: { capturedAt: "asc" },
      select: {
        minPrice: true,
        maxPrice: true,
        avgPrice: true,
        quantity: true,
        capturedAt: true,
        realm: {
          select: { name: true, slug: true },
        },
      },
    });

    if (snapshots.length === 0) {
      return reply
        .status(404)
        .send({ error: "No price data found for this item" });
    }

    // Convertit les BigInt en nombre pour la sérialisation JSON
    const result = {
      itemId,
      period,
      realm: realmSlug ?? "all",
      snapshots: snapshots.map((s) => ({
        minPrice: Number(s.minPrice),
        maxPrice: Number(s.maxPrice),
        avgPrice: Number(s.avgPrice),
        quantity: s.quantity,
        capturedAt: s.capturedAt,
        realm: s.realm,
      })),
    };

    await redis.set(cacheKey, JSON.stringify(result), "EX", CACHE_TTL);

    return reply.send(result);
  });
}
