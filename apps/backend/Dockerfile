FROM node:22-alpine AS deps
WORKDIR /app
COPY apps/backend/package.json ./package.json
RUN npm install

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY apps/backend .
RUN ./node_modules/.bin/prisma generate --schema ./prisma
RUN npm run build --if-present

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S waht && adduser -S waht -G waht
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
USER waht
EXPOSE 3001
CMD ["node", "dist/index.js"]
