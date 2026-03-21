import { SessionUser } from "./auth.js";

declare module "@fastify/session" {
  interface FastifySessionObject {
    user?: SessionUser;
  }
}
