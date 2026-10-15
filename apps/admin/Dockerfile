FROM node:22-alpine AS base
# https://github.com/nodejs/docker-node/tree/main#nodealpine explains why libc6-compat may be needed
RUN apk add --no-cache libc6-compat

# Reduce the monorepo to the admin workspace and what it depends on
FROM base AS pruner
WORKDIR /app
RUN yarn global add turbo@^2
COPY . .
RUN turbo prune admin --docker

FROM base AS installer
WORKDIR /app

# Install dependencies first, as they change less often than the source
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/yarn.lock ./yarn.lock
RUN yarn install --frozen-lockfile

COPY --from=pruner /app/out/full/ .
RUN yarn turbo build --filter=admin...

FROM base AS runner
WORKDIR /app/apps/admin

# Don't run as root
RUN addgroup --system --gid 1002 app \
  && adduser --system --uid 1002 --ingroup app app
COPY --from=installer --chown=app:app /app /app
USER app

# Serves the built admin panel with vite preview
EXPOSE 3001
CMD ["yarn", "preview", "--host", "0.0.0.0", "--port", "3001"]
