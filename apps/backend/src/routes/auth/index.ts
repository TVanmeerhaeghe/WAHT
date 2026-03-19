import { FastifyInstance } from "fastify";
import { BlizzardUserInfo, SessionUser } from "../../types/index.js";

const SUPPORTED_REGIONS = ["eu", "us", "kr", "tw"] as const;
type Region = (typeof SUPPORTED_REGIONS)[number];

const BLIZZARD_USERINFO_URLS: Record<Region, string> = {
  eu: "https://eu.battle.net/oauth/userinfo",
  us: "https://us.battle.net/oauth/userinfo",
  kr: "https://kr.battle.net/oauth/userinfo",
  tw: "https://tw.battle.net/oauth/userinfo",
};

export async function authRoutes(app: FastifyInstance) {
  app.get<{ Params: { region: string } }>(
    "/auth/:region/callback",
    async (request, reply) => {
      const { region } = request.params;

      if (!SUPPORTED_REGIONS.includes(region as Region)) {
        return reply.status(400).send({ error: "Invalid region" });
      }

      const typedRegion = region as Region;

      try {
        const oauthPlugin = (app as any)[
          `blizzardOauth2${typedRegion.toUpperCase()}`
        ];
        const tokenResponse =
          await oauthPlugin.getAccessTokenFromAuthorizationCodeFlow(request);
        const accessToken = tokenResponse.token.access_token;

        const userInfoResponse = await fetch(
          BLIZZARD_USERINFO_URLS[typedRegion],
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        );

        if (!userInfoResponse.ok) {
          throw new Error(
            `Blizzard userinfo failed: ${userInfoResponse.status}`,
          );
        }

        const userInfo = (await userInfoResponse.json()) as BlizzardUserInfo;

        const sessionUser: SessionUser = {
          id: userInfo.id,
          battletag: userInfo.battletag,
          accessToken, // nécessaire pour les appels API suivants
          region: typedRegion,
        };

        request.session.user = sessionUser;
        return reply.redirect(`${process.env.FRONTEND_URL}/auth/success`);
      } catch (error) {
        app.log.error(error, "OAuth2 callback error");
        return reply.redirect(`${process.env.FRONTEND_URL}/auth/error`);
      }
    },
  );

  app.get("/auth/me", async (request, reply) => {
    const user = request.session.user;

    if (!user) {
      return reply.status(401).send({ error: "Not authenticated" });
    }

    // on n'expose jamais le accessToken au frontend
    return reply.send({
      id: user.id,
      battletag: user.battletag,
      region: user.region,
    });
  });

  app.post("/auth/logout", async (request, reply) => {
    await request.session.destroy();
    return reply.send({ success: true });
  });
}
