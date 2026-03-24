import { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prisma.js";
import { redis } from "../../lib/redis.js";

const CACHE_KEY = "realms:all";
const CACHE_TTL = 60 * 60; // 1h en secondes

export async function realmsRoutes(app: FastifyInstance) {
  app.get("/realms", async (request, reply) => {
    const cached = await redis.get(CACHE_KEY);

    if (cached) {
      return reply.send(JSON.parse(cached));
    }

    const realms = await prisma.realm.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        region: true,
        lastSyncedAt: true,
      },
    });

    await redis.set(CACHE_KEY, JSON.stringify(realms), "EX", CACHE_TTL);

    return reply.send(realms);
  });
}
