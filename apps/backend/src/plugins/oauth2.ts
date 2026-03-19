import fastifyOauth2 from '@fastify/oauth2'
import { FastifyInstance } from 'fastify'

const REGIONS = ['eu', 'us', 'kr', 'tw'] as const

export async function registerOauth2(app: FastifyInstance) {
  for (const region of REGIONS) {
    await app.register(fastifyOauth2, {
      name: `blizzardOauth2${region.toUpperCase()}`,
      scope: ['openid', 'wow.profile'],
      credentials: {
        client: {
          id: process.env.BLIZZARD_CLIENT_ID!,
          secret: process.env.BLIZZARD_CLIENT_SECRET!,
        },
        auth: {
          authorizeHost: `https://${region}.battle.net`,
          authorizePath: '/oauth/authorize',
          tokenHost: `https://${region}.battle.net`,
          tokenPath: '/oauth/token',
        },
      },
      startRedirectPath: `/auth/${region}/login`,
      callbackUri: `${process.env.BACKEND_URL}/auth/${region}/callback`,
    })
  }
}
