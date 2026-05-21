FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/
COPY packages/api-client/package.json ./packages/api-client/
COPY packages/config/package.json ./packages/config/
COPY packages/design-tokens/package.json ./packages/design-tokens/
COPY packages/ai/package.json ./packages/ai/
COPY packages/maps/package.json ./packages/maps/
COPY packages/strava-integration/package.json ./packages/strava-integration/
COPY packages/realtime-client/package.json ./packages/realtime-client/
RUN pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm turbo build --filter=@fitconnect/web

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json
COPY --from=builder /app/node_modules ./node_modules
WORKDIR /app/apps/web
EXPOSE 3001
CMD ["pnpm", "start"]
