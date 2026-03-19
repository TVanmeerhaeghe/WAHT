FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
COPY apps/frontend/package.json ./apps/frontend/package.json
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY apps/frontend ./apps/frontend
WORKDIR /app/apps/frontend
RUN /app/node_modules/.bin/nuxt build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S waht && adduser -S waht -G waht
COPY --from=builder /app/apps/frontend/.output ./.output
USER waht
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
