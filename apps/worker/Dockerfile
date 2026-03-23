FROM node:22-alpine AS deps
WORKDIR /app
COPY apps/worker/package.json ./package.json
COPY packages/shared ./packages/shared
RUN cd packages/shared && npm install && npm run build
RUN npm install

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/shared ./packages/shared
COPY apps/worker .
COPY apps/backend/prisma ./backend/prisma
RUN /app/node_modules/.bin/prisma generate --schema ./backend/prisma
RUN npx tsc -p tsconfig.build.json && find dist -name "*.js" -exec sed -i 's|@waht/shared|/app/packages/shared/dist/index.js|g' {} +

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S waht && adduser -S waht -G waht
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
USER waht
CMD ["node", "dist/index.js"]
