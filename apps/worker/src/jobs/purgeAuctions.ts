import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function purgeOldAuctions(): Promise<number> {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const result = await prisma.rawAuction.deleteMany({
    where: {
      capturedAt: { lt: cutoff },
    },
  });

  console.log(
    `[${new Date().toISOString()}] Purged ${result.count} old auctions`,
  );
  return result.count;
}
