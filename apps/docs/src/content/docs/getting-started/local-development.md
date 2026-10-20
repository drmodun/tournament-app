---
title: Local development
description: Run the API and web app with hot reload against a containerised database.
---

## Prerequisites

- Node.js 22 or newer (`.nvmrc` is provided)
- Yarn 1 (`corepack enable` picks up the pinned `yarn@1.22.22`)
- Docker, for PostGIS and S3 storage

## First run

```bash
yarn install
docker compose up -d db s3 s3-init   # PostGIS on localhost:5433, S3 on localhost:8333
cd apps/api && yarn migrate && yarn seed && cd ../..
yarn dev                             # API on :5500, web on :3000, docs on :4321
```

`yarn dev` runs `turbo run dev`, which starts every workspace that has a `dev` script: the API (`nest start
--watch`), the web app (`next dev`), the docs (`astro dev`), the admin placeholder (Vite) and a `tsup --watch`
rebuild of `@tournament-app/types`.

To run one app only, filter it:

```bash
yarn turbo dev --filter=api
yarn turbo dev --filter=web
yarn turbo dev --filter=docs
```

## How the API finds its settings

Every API script is wrapped in `dotenv-cli`, for example `dotenv -e ../../.env -c -- nest start --watch`. The `-c`
flag also loads the `.local` override, so the effective configuration is the root `.env` overlaid by the root
`.env.local`. Tests use `.env.test` and `.env.test.local` in the same way.

The web app reads `apps/web/.env.local` (see `apps/web/.env.example`). Without it, it calls the API at
`http://localhost:5500`.

## Useful API scripts

Run these from `apps/api`:

| Script          | What it does                                                         |
| --------------- | -------------------------------------------------------------------- |
| `yarn migrate`  | Applies Drizzle migrations from `src/db/drizzle` to `DATABASE_URL`   |
| `yarn generate` | Generates a new migration from changes to `src/db/schema.ts`         |
| `yarn studio`   | Opens Drizzle Studio on the development database                     |
| `yarn seed`     | Empties and reseeds the development database                         |
| `yarn test`     | Unit tests (Jest) against `.env.test`                                |
| `yarn test:e2e` | Migrates and seeds `tournament_test`, then runs the end-to-end suite |

When the API starts outside production (`MODE` is not `production`) it writes the current OpenAPI document to
`apps/api/openapi.yml`.

## Other root commands

```bash
yarn build     # turbo run build, every workspace
yarn lint      # turbo run lint
yarn format    # prettier on ts, tsx and md files
yarn test      # API unit tests
yarn test:e2e  # API end-to-end tests
```

## Storybook

The web components have stories. From `apps/web`:

```bash
yarn storybook        # http://localhost:6006
```

## Troubleshooting

- **Port already in use**: for `yarn dev`, set `API_PORT` and `DATABASE_URL` in `.env.local`. For Docker, see the
  port variables.
- **Migrations cannot connect**: check that the `db` container is healthy with `docker compose ps`.
- **Logged in but every page says unauthorised**: the email is not confirmed. Without `SMTP_HOST` the API logs the
  confirmation email (with its link) to the console instead of sending it.
