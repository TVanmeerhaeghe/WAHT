import cron from "node-cron";
import { syncAllAuctions } from "./jobs/syncAuctions.js";

console.log("WAHT Worker started");

// Sync toutes les heures — calé sur l'heure pile comme l'API Blizzard
cron.schedule("0 * * * *", async () => {
  console.log(`[${new Date().toISOString()}] Starting scheduled sync`);
  await syncAllAuctions();
});

// Sync immédiate au démarrage pour ne pas attendre la première heure
syncAllAuctions().catch(console.error);
