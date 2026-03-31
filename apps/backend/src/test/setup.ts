import Fastify from "fastify";
import { realmsRoutes } from "../routes/realms/index.js";
import { itemsRoutes } from "../routes/items/index.js";
import { itemPricesRoutes } from "../routes/items/prices.js";
import { itemAuctionsRoutes } from "../routes/items/auctions.js";

// Mock Redis pour les tests
vi.mock("../lib/redis.js", () => ({
  redis: {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue("OK"),
    del: vi.fn().mockResolvedValue(1),
    incr: vi.fn().mockResolvedValue(1),
    expire: vi.fn().mockResolvedValue(1),
    ttl: vi.fn().mockResolvedValue(3600),
  },
}));

// Mock Prisma pour les tests
vi.mock("../lib/prisma.js", () => ({
  prisma: {
    realm: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    item: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    auctionSnapshot: {
      findMany: vi.fn(),
    },
    rawAuction: {
      findMany: vi.fn(),
    },
  },
}));

export function buildApp() {
  const app = Fastify();
  app.register(realmsRoutes);
  app.register(itemsRoutes);
  app.register(itemPricesRoutes);
  app.register(itemAuctionsRoutes);
  return app;
}
