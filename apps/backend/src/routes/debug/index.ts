import { FastifyInstance } from "fastify";
import { Region, REGIONS } from "../../types/index.js";
import { fetchRealms, fetchAuctions } from "../../services/blizzard.js";
import { syncAllRegions } from "../../services/realms.js";
import { redis } from "../../lib/redis.js";
import { getQueueSize } from "@waht/shared";

// Routes debug — à supprimer avant la mise en production
export async function debugRoutes(app: FastifyInstance) {
  app.get<{ Params: { region: string } }>(
    "/debug/realms/:region",
    async (request, reply) => {
      const { region } = request.params;

      if (!Object.values(REGIONS).includes(region as Region)) {
        return reply.status(400).send({ error: "Invalid region" });
      }

      const data = await fetchRealms(region as Region);
      return reply.send(data);
    },
  );

  app.get<{ Params: { region: string; realmId: string } }>(
    "/debug/auctions/:region/:realmId",
    async (request, reply) => {
      const { region, realmId } = request.params;

      if (!Object.values(REGIONS).includes(region as Region)) {
        return reply.status(400).send({ error: "Invalid region" });
      }

      const data = await fetchAuctions(region as Region, parseInt(realmId));
      return reply.send(data);
    },
  );

  app.post("/debug/sync-realms", async (request, reply) => {
    const results = await syncAllRegions();
    return reply.send({ success: true, results });
  });

  app.get("/debug/rate-limit", async (request, reply) => {
    const { getRateLimitStatus } = await import("@waht/shared");
    const status = await getRateLimitStatus(redis);
    return reply.send(status);
  });

  app.get<{ Params: { id: string } }>(
    "/debug/item/:id",
    async (request, reply) => {
      const { getClientToken, BLIZZARD_API_URLS } =
        await import("@waht/shared");
      const token = await getClientToken("eu");
      const response = await fetch(
        `${BLIZZARD_API_URLS["eu"]}/data/wow/item/${request.params.id}?namespace=static-eu&locale=en_US`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await response.json();
      return reply.send({ status: response.status, data });
    },
  );

  app.get("/debug/enrich-queue", async (request, reply) => {
    const size = await getQueueSize(redis);
    return reply.send({ pendingItems: size });
  });
}
