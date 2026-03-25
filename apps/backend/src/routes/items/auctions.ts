import { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prisma.js";
import { redis } from "../../lib/redis.js";
import { syncRealmOnDemand } from "../../services/auctionSync.js";

const CACHE_TTL = 60 * 5;

export async function itemAuctionsRoutes(app: FastifyInstance) {
  app.get<{
    Params: { id: string };
    Querystring: { realm: string };
  }>("/items/:id/auctions", async (request, reply) => {
    const itemId = parseInt(request.params.id);
    const realmSlug = request.query.realm;

    if (isNaN(itemId)) {
      return reply.status(400).send({ error: "Invalid item ID" });
    }

    if (!realmSlug) {
      return reply
        .status(400)
        .send({ error: "realm query parameter is required" });
    }

    const realm = await prisma.realm.findUnique({
      where: { slug: realmSlug },
      select: { id: true, name: true, region: true, lastSyncedAt: true },
    });

    if (!realm) {
      return reply.status(404).send({ error: "Realm not found" });
    }

    const cacheKey = `items:${itemId}:auctions:${realmSlug}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return reply.send(JSON.parse(cached));
    }

    // Sync à la demande si les données sont trop vieilles
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (!realm.lastSyncedAt || realm.lastSyncedAt < fiveMinutesAgo) {
      try {
        await syncRealmOnDemand(
          realm.id,
          realm.region as "eu" | "us" | "kr" | "tw",
        );
      } catch (error) {
        app.log.error(error, `On-demand sync failed for realm ${realmSlug}`);
      }
    }

    const auctions = await prisma.rawAuction.findMany({
      where: { itemId, realmId: realm.id },
      orderBy: { price: "asc" },
      select: {
        id: true,
        price: true,
        quantity: true,
        capturedAt: true,
      },
    });

    const result = {
      itemId,
      realm: { name: realm.name, slug: realmSlug },
      lastSyncedAt: realm.lastSyncedAt,
      auctions: auctions.map(
        (a: {
          id: bigint;
          price: bigint;
          quantity: number;
          capturedAt: Date;
        }) => ({
          id: a.id.toString(),
          price: Number(a.price),
          quantity: a.quantity,
          capturedAt: a.capturedAt,
        }),
      ),
    };

    await redis.set(cacheKey, JSON.stringify(result), "EX", CACHE_TTL);

    return reply.send(result);
  });
}
