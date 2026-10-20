FROM node:22-alpine AS base
# https://github.com/nodejs/docker-node/tree/main#nodealpine explains why libc6-compat may be needed
RUN apk add --no-cache libc6-compat

# Reduce the monorepo to the docs workspace and what it depends on
FROM base AS pruner
WORKDIR /app
RUN yarn global add turbo@^2
COPY . .
RUN turbo prune docs --docker

FROM base AS installer
WORKDIR /app

# Install dependencies first, as they change less often than the source
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/yarn.lock ./yarn.lock
RUN yarn install --frozen-lockfile

COPY --from=pruner /app/out/full/ .
RUN yarn turbo build --filter=docs...

# The site is static: serve it with Caddy, under /docs like the Astro base path
FROM caddy:2-alpine AS runner
COPY apps/docs/Caddyfile /etc/caddy/Caddyfile
COPY --from=installer /app/apps/docs/dist /srv/docs
EXPOSE 4321
