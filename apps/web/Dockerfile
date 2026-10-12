FROM node:22-alpine AS base
# https://github.com/nodejs/docker-node/tree/main#nodealpine explains why libc6-compat may be needed
RUN apk add --no-cache libc6-compat

# Reduce the monorepo to the web workspace and what it depends on
FROM base AS pruner
WORKDIR /app
RUN yarn global add turbo@^2
COPY . .
RUN turbo prune web --docker

FROM base AS installer
WORKDIR /app

# Install dependencies first, as they change less often than the source
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/yarn.lock ./yarn.lock
RUN yarn install --frozen-lockfile

COPY --from=pruner /app/out/full/ .

# NEXT_PUBLIC_* values are inlined into the browser bundle at build time
ARG NEXT_PUBLIC_API_URL=http://localhost:5500
ARG NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY \
  NEXT_TELEMETRY_DISABLED=1

RUN yarn turbo build --filter=web...

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production \
  NEXT_TELEMETRY_DISABLED=1 \
  PORT=3000 \
  HOSTNAME=0.0.0.0

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 --ingroup nodejs nextjs
USER nextjs

# Standalone output keeps the monorepo layout: the server lives at apps/web/server.js
# https://nextjs.org/docs/app/api-reference/config/next-config-js/output
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

EXPOSE 3000
CMD ["node", "apps/web/server.js"]
