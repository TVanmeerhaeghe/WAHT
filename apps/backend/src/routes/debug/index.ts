import { FastifyInstance } from "fastify";
import { Region, REGIONS } from "../../types/index.js";
import { fetchRealms, fetchAuctions } from "../../services/blizzard.js";
import { syncAllRegions } from "../../services/realms.js";

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
}
