import { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prisma.js";
import { redis } from "../../lib/redis.js";

const CACHE_TTL = 60 * 5;

export async function itemsRoutes(app: FastifyInstance) {
  app.get<{
    Querystring: {
      q?: string;
      page?: string;
      limit?: string;
    };
  }>("/items/search", async (request, reply) => {
    const q = request.query.q?.trim() ?? "";
    const page = Math.max(1, parseInt(request.query.page ?? "1"));
    const limit = Math.min(
      50,
      Math.max(1, parseInt(request.query.limit ?? "20")),
    );
    const skip = (page - 1) * limit;

    const cacheKey = `items:search:${q}:${page}:${limit}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return reply.send(JSON.parse(cached));
    }

    const where = q
      ? {
          name: { contains: q, mode: "insensitive" as const },
          NOT: [
            { name: { startsWith: "Item #" } },
            { name: { startsWith: "Unknown Item" } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      prisma.item.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          quality: true,
          iconUrl: true,
        },
      }),
      prisma.item.count({ where }),
    ]);

    const result = {
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };

    await redis.set(cacheKey, JSON.stringify(result), "EX", CACHE_TTL);

    return reply.send(result);
  });

  app.get<{ Params: { id: string } }>("/items/:id", async (request, reply) => {
    const itemId = parseInt(request.params.id);
    if (isNaN(itemId))
      return reply.status(400).send({ error: "Invalid item ID" });

    const item = await prisma.item.findUnique({
      where: { id: itemId },
      select: { id: true, name: true, quality: true, iconUrl: true },
    });

    if (!item) return reply.status(404).send({ error: "Item not found" });

    return reply.send(item);
  });

  app.get("/items/stats", async (request, reply) => {
    const [itemCount, realmCount, auctionCount] = await Promise.all([
      prisma.item.count({
        where: {
          NOT: [
            { name: { startsWith: "Item #" } },
            { name: { startsWith: "Unknown Item" } },
          ],
        },
      }),
      prisma.realm.count(),
      prisma.rawAuction.count(),
    ]);

    return reply.send({ itemCount, realmCount, auctionCount });
  });
}
