import Fastify from "fastify";
import { registerOauth2 } from "./plugins/oauth2.js";
import { registerSession } from "./plugins/session.js";
import { authRoutes } from "./routes/auth/index.js";
import { debugRoutes } from "./routes/debug/index.js";
import { realmsRoutes } from "./routes/realms/index.js";
import { itemsRoutes } from "./routes/items/index.js";

const requiredEnvVars = [
  "BLIZZARD_CLIENT_ID",
  "BLIZZARD_CLIENT_SECRET",
  "SESSION_SECRET",
  "BACKEND_URL",
  "FRONTEND_URL",
] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

const app = Fastify({
  logger: {
    transport:
      process.env.NODE_ENV !== "production"
        ? { target: "pino-pretty" }
        : undefined,
  },
});

await registerSession(app);
await registerOauth2(app);
await app.register(authRoutes);
await app.register(debugRoutes);
await app.register(realmsRoutes);
await app.register(itemsRoutes);

app.get("/health", async () => ({
  status: "ok",
  timestamp: new Date().toISOString(),
}));

try {
  await app.listen({ port: 3001, host: "0.0.0.0" });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
