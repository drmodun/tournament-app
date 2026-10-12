FROM node:22-alpine AS base
# https://github.com/nodejs/docker-node/tree/main#nodealpine explains why libc6-compat may be needed
RUN apk add --no-cache libc6-compat

# Reduce the monorepo to the api workspace and what it depends on
FROM base AS pruner
WORKDIR /app
RUN yarn global add turbo@^2
COPY . .
RUN turbo prune api --docker

FROM base AS installer
WORKDIR /app
# Toolchain for native modules (bcrypt) when no prebuilt binary matches
RUN apk add --no-cache python3 make g++

# Install dependencies first, as they change less often than the source
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/yarn.lock ./yarn.lock
RUN yarn install --frozen-lockfile

COPY --from=pruner /app/out/full/ .
RUN yarn turbo build --filter=api...

FROM base AS runner
# Email templates and drizzle migrations are resolved relative to the api workspace
WORKDIR /app/apps/api

# Don't run production as root
RUN addgroup --system --gid 1004 nestjs \
  && adduser --system --uid 1004 --ingroup nestjs nestjs
COPY --from=installer --chown=nestjs:nestjs /app /app
USER nestjs

EXPOSE 5500
CMD ["node", "dist/main.js"]
