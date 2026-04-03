import cron from "node-cron";
import { syncAllAuctions } from "./jobs/syncAuctions.js";
import { purgeOldAuctions } from "./jobs/purgeAuctions.js";
import { enrichItems, backfillEnrichQueue } from "./jobs/enrichItems.js";

console.log("WAHT Worker started");

// Sync auctions toutes les heures
cron.schedule("0 * * * *", async () => {
  await syncAllAuctions();
  await purgeOldAuctions();
});

// Enrichissement toutes les 5 minutes
cron.schedule("*/5 * * * *", async () => {
  await enrichItems();
});

// Au démarrage
backfillEnrichQueue()
  .then(() => syncAllAuctions())
  .then(() => purgeOldAuctions())
  .then(() => enrichItems())
  .catch(console.error);
