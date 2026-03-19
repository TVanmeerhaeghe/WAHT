FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
COPY apps/worker/package.json ./apps/worker/package.json
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY apps/worker ./apps/worker
WORKDIR /app/apps/worker
RUN npm run build --if-present

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S waht && adduser -S waht -G waht
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/worker/dist ./dist
COPY --from=builder /app/apps/worker/package.json ./
USER waht
CMD ["node", "dist/index.js"]
