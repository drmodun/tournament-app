---
title: Docker stack and deployment
description: Every Compose service, how they depend on each other, ports, profiles and running on a real domain.
---

`docker-compose.yml` in the repository root describes the whole stack. Images are built from the monorepo with
`turbo prune`, so each image only contains its own workspace and the packages it depends on.

## Services

| Service   | Image                           | Purpose                                                                                                     |
| --------- | ------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `proxy`   | `caddy:2-alpine`                | Single entry point on ports 80/443. Config: `docker/caddy/Caddyfile`                                        |
| `db`      | `postgis/postgis:16-3.4-alpine` | Postgres with PostGIS. `docker/db/init.sql` creates `tournament_test` and enables PostGIS in both databases |
| `migrate` | `tournament-app-api`            | One-shot `yarn migrate`                                                                                     |
| `seed`    | `tournament-app-api`            | One-shot `yarn seed`, only with `--profile seed` (destructive)                                              |
| `api`     | `tournament-app-api`            | The NestJS API, health-checked on `GET /`                                                                   |
| `web`     | `tournament-app-web`            | Next.js standalone server                                                                                   |
| `docs`    | `tournament-app-docs`           | This site: the static Astro build served by Caddy under `/docs`                                             |
| `mail`    | `axllent/mailpit`               | Catches all outgoing email; web UI on 8025                                                                  |
| `s3`      | `chrislusf/seaweedfs`           | S3-compatible storage, credentials in `docker/s3/s3.json`                                                   |
| `s3-init` | `chrislusf/seaweedfs`           | One-shot: creates the bucket if it is missing                                                               |
| `admin`   | `tournament-app-admin`          | Placeholder admin panel, only with `--profile tools`                                                        |

## Startup order

```text
db (healthy) ──▶ migrate (completed) ──▶ api (healthy) ──▶ web
s3 (healthy) ──▶ s3-init (completed) ──▶ api
mail (started) ─────────────────────────▶ api
web, api, docs ─────────────────────────▶ proxy
```

The API does not start until migrations have run and the bucket exists. The web container waits for a healthy API
because it renders some pages with server-side requests.

## Routing

Caddy routes by path:

| Path               | Goes to     | Notes                                                                              |
| ------------------ | ----------- | ---------------------------------------------------------------------------------- |
| `/api/*`           | `api:5500`  | Prefix stripped. `flush_interval -1` so SSE notifications are not buffered         |
| `/docs`, `/docs/*` | `docs:4321` | Prefix kept: the site is built with `base: '/docs'`. `/docs` redirects to `/docs/` |
| everything else    | `web:3000`  |                                                                                    |

The API, web app and docs are also published on their own host ports for debugging (`API_HOST_PORT`, `WEB_PORT`,
`DOCS_PORT`).

The Caddyfile is bind-mounted, and `docker compose up` does not recreate the proxy when only that file changes. After
editing it, run `docker compose restart proxy`.

## Ports

| Variable           | Default | Service                                    |
| ------------------ | ------- | ------------------------------------------ |
| `PROXY_HTTP_PORT`  | 80      | proxy                                      |
| `PROXY_HTTPS_PORT` | 443     | proxy                                      |
| `DB_PORT`          | 5433    | db (5433 to avoid a host Postgres on 5432) |
| `API_HOST_PORT`    | 5500    | api                                        |
| `WEB_PORT`         | 3000    | web                                        |
| `DOCS_PORT`        | 4321    | docs (open http://localhost:4321/docs/)    |
| `MAIL_UI_PORT`     | 8025    | mail web UI                                |
| `MAIL_SMTP_PORT`   | 1025    | mail SMTP                                  |
| `S3_PORT`          | 8333    | s3                                         |

## Profiles

| Command                                       | Starts                                  |
| --------------------------------------------- | --------------------------------------- |
| `docker compose up --build`                   | Everything except `seed` and `admin`    |
| `docker compose --profile seed run --rm seed` | Empties and reseeds the database        |
| `docker compose --profile tools up --build`   | Also the admin placeholder on port 3001 |
| `docker compose up -d db s3 s3-init`          | Just what `yarn dev` and the tests need |

## Running on a real domain

```bash
SITE_ADDRESS=example.com PUBLIC_URL=https://example.com docker compose up --build -d
```

- `SITE_ADDRESS` makes Caddy request and renew a certificate for the domain. Ports 80 and 443 must be reachable from
  the internet.
- `PUBLIC_URL` is baked into the web image as `NEXT_PUBLIC_API_URL=<PUBLIC_URL>/api` and used for email links, so
  rebuild the web image when it changes.

Before exposing the stack, replace the development values:

1. Set `MODE=production`, real `JWT_SECRET` and `JWT_REFRESH_SECRET`.
2. Configure a real SMTP server (`SMTP_HOST`, ...) and `EMAIL_FROM`. With `MODE=production` the API refuses to start
   without SMTP.
3. Change the database password and the S3 keys in `docker/s3/s3.json`, or point `S3_*` at a managed bucket.
4. With `MODE=production` only `FRONTEND_URL` (your `PUBLIC_URL` in Compose) may call the API from a browser; set
   `CORS_ORIGIN` to allow other origins.
5. Add Google credentials for Google sign-in, and Challonge credentials if you want brackets on Challonge
   (without them the API runs the brackets itself).
6. Put secrets in an untracked file or your platform's secret store, never in the tracked `.env`.

## Images

Each Dockerfile has the same pruner → installer → runner stages:

| Image | Runner                                                                                                                               |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------ |
| API   | Node 22 Alpine, runs `node dist/main` as an unprivileged user; also used for `migrate` and `seed`                                    |
| Web   | Node 22 Alpine with the Next.js standalone output (`node apps/web/server.js`)                                                        |
| Docs  | `caddy:2-alpine` serving the static `dist/` from `/srv/docs` (config: `apps/docs/Caddyfile`, which also serves Starlight's 404 page) |
| Admin | Node 22 Alpine running `vite preview`                                                                                                |
