import cron from "node-cron";
import { syncAllAuctions } from "./jobs/syncAuctions.js";
import { purgeOldAuctions } from "./jobs/purgeAuctions.js";

console.log("WAHT Worker started");

cron.schedule("0 * * * *", async () => {
  await syncAllAuctions();
  await purgeOldAuctions();
});

// Sync immédiate au démarrage
syncAllAuctions()
  .then(() => purgeOldAuctions())
  .catch(console.error);
