import cron from "node-cron";
import { syncAllAuctions } from "./jobs/syncAuctions.js";
import { purgeOldAuctions } from "./jobs/purgeAuctions.js";
import { enrichItems, backfillEnrichQueue } from "./jobs/enrichItems.js";

console.log("WAHT Worker started");

cron.schedule("0 * * * *", async () => {
  await syncAllAuctions();
  await purgeOldAuctions();
  await enrichItems();
});

// Au démarrage : backfill puis sync puis enrichissement
backfillEnrichQueue()
  .then(() => syncAllAuctions())
  .then(() => purgeOldAuctions())
  .then(() => enrichItems())
  .catch(console.error);
