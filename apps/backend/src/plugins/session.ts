import fastifyCookie from "@fastify/cookie";
import fastifySession from "@fastify/session";
import { FastifyInstance } from "fastify";

export async function registerSession(app: FastifyInstance) {
  await app.register(fastifyCookie);

  await app.register(fastifySession, {
    secret: process.env.SESSION_SECRET!,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "lax",
    },
    saveUninitialized: false,
  });
}
