import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `${process.env.DATABASE_URL}?connection_limit=50&pool_timeout=30`,
    },
  },
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
});
