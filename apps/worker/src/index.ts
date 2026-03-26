import cron from "node-cron";
import { syncAllAuctions } from "./jobs/syncAuctions.js";
import { purgeOldAuctions } from "./jobs/purgeAuctions.js";
import { enrichItems } from "./jobs/enrichItems.js";

console.log("WAHT Worker started");

// Sync des auctions toutes les heures + purge + enrichissement
cron.schedule("0 * * * *", async () => {
  await syncAllAuctions();
  await purgeOldAuctions();
  await enrichItems();
});

// Au démarrage : sync immédiate puis enrichissement
syncAllAuctions()
  .then(() => purgeOldAuctions())
  .then(() => enrichItems())
  .catch(console.error);
