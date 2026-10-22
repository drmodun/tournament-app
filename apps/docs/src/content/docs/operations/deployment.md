---
title: Docker stack and deployment
description: The development and production Compose stacks, their services, profiles, ports, images and reverse proxy setups.
---

There are two Compose files:

| File                 | For         | Images                                                   |
| -------------------- | ----------- | -------------------------------------------------------- |
| `docker-compose.yml` | development | Built from the checkout on every `docker compose up`     |
| `deploy/compose.yml` | production  | Pulled from GitHub Container Registry, never built there |

Both use the same Dockerfiles and the same Caddy configuration (`docker/caddy/Caddyfile`). Images are built from the
monorepo with `turbo prune`, so each image only contains its own workspace and the packages it depends on.

## Development stack

`docker-compose.yml` in the repository root runs everything, including a mail inbox and S3 storage, so the app works
without any outside service. Every built service has `pull_policy: build`, so `docker compose up` rebuilds from the
code in front of you; unchanged layers come from the build cache.

### Services

| Service   | Image                           | Purpose                                                                                                     |
| --------- | ------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `proxy`   | `caddy:2-alpine`                | Single entry point on ports 80/443. Config: `docker/caddy/Caddyfile`                                        |
| `db`      | `postgis/postgis:16-3.4-alpine` | Postgres with PostGIS. `docker/db/init.sql` creates `tournament_test` and enables PostGIS in both databases |
| `migrate` | `tournament-app-api`            | One-shot `yarn migrate`                                                                                     |
| `seed`    | `tournament-app-api`            | One-shot `yarn seed`, only with `--profile seed` (destructive)                                              |
| `api`     | `tournament-app-api`            | The NestJS API, health-checked on `GET /`                                                                   |
| `web`     | `tournament-app-web`            | Next.js standalone server                                                                                   |
| `docs`    | `tournament-app-docs`           | This site: the static Astro build served by Caddy under `/docs`                                             |
| `admin`   | `tournament-app-admin`          | Admin panel (an early placeholder) served by `vite preview` under `/admin`                                  |
| `mail`    | `axllent/mailpit`               | Catches all outgoing email; web UI on 8025                                                                  |
| `s3`      | `chrislusf/seaweedfs`           | S3-compatible storage, credentials in `docker/s3/s3.json`                                                   |
| `s3-init` | `chrislusf/seaweedfs`           | One-shot: creates the bucket if it is missing                                                               |

### Startup order

```text
db (healthy) ──▶ migrate (completed) ──▶ api (healthy) ──▶ web
s3 (healthy) ──▶ s3-init (completed) ──▶ api
mail (started) ─────────────────────────▶ api
web, api, docs, admin ──────────────────▶ proxy
```

The API does not start until migrations have run and the bucket exists. The web container waits for a healthy API
because it renders some pages with server-side requests.

### Routing

Caddy routes by path, in both stacks:

| Path                 | Goes to      | Notes                                                                              |
| -------------------- | ------------ | ---------------------------------------------------------------------------------- |
| `/api/*`             | `api:5500`   | Prefix stripped. `flush_interval -1` so SSE notifications are not buffered         |
| `/docs`, `/docs/*`   | `docs:4321`  | Prefix kept: the site is built with `base: '/docs'`. `/docs` redirects to `/docs/` |
| `/admin`, `/admin/*` | `admin:3001` | Prefix kept: the panel is built with `base: '/admin/'`. 502 while admin is off     |
| everything else      | `web:3000`   |                                                                                    |

Caddy trusts `X-Forwarded-*` headers from private addresses, so behind nginx or a tunnel the API sees the client's
address and scheme rather than the proxy's.

The API, web app, docs and admin are also published on their own host ports in development (`API_HOST_PORT`,
`WEB_PORT`, `DOCS_PORT`, `ADMIN_PORT`).

The Caddyfile is bind-mounted, and `docker compose up` does not recreate the proxy when only that file changes. After
editing it, run `docker compose restart proxy`.

### Ports

| Variable           | Default | Service                                    |
| ------------------ | ------- | ------------------------------------------ |
| `PROXY_HTTP_PORT`  | 80      | proxy                                      |
| `PROXY_HTTPS_PORT` | 443     | proxy                                      |
| `DB_PORT`          | 5433    | db (5433 to avoid a host Postgres on 5432) |
| `API_HOST_PORT`    | 5500    | api                                        |
| `WEB_PORT`         | 3000    | web                                        |
| `DOCS_PORT`        | 4321    | docs (open http://localhost:4321/docs/)    |
| `ADMIN_PORT`       | 3001    | admin (open http://localhost:3001/admin/)  |
| `MAIL_UI_PORT`     | 8025    | mail web UI                                |
| `MAIL_SMTP_PORT`   | 1025    | mail SMTP                                  |
| `S3_PORT`          | 8333    | s3                                         |

### Commands

| Command                                       | Does                                    |
| --------------------------------------------- | --------------------------------------- |
| `docker compose up`                           | Builds and starts everything but `seed` |
| `docker compose --profile seed run --rm seed` | Empties and reseeds the database        |
| `docker compose up -d db s3 s3-init`          | Just what `yarn dev` and the tests need |

`PUBLIC_URL` (default `http://localhost:<PROXY_HTTP_PORT>`) is baked into the development web image as
`NEXT_PUBLIC_API_URL=<PUBLIC_URL>/api` and used for email links.

## Production stack

`deploy/compose.yml` runs the images that [the images workflow](#images) pushes. It reads its settings from
`deploy/.env` (untracked), which Compose picks up by itself because it sits next to the file. The development `.env`
in the repository root is not used.

```bash
git clone https://github.com/drmodun/tournament-app.git && cd tournament-app
cp deploy/.env.example deploy/.env      # fill it in
docker compose -f deploy/compose.yml pull
docker compose -f deploy/compose.yml up -d
```

The checkout is only needed for `deploy/` and `docker/caddy/Caddyfile`. To update, `git pull` for configuration
changes, then `pull` and `up -d` again.

### What runs where: profiles

The database, the file storage and the admin panel are optional. Each is a profile, enabled through
`COMPOSE_PROFILES` in `deploy/.env`:

| Profile    | Starts            | Leave it out to                                                                 |
| ---------- | ----------------- | ------------------------------------------------------------------------------- |
| `local-db` | `db` (PostGIS)    | use another Postgres 16 with PostGIS: set `DATABASE_URL`                        |
| `local-s3` | `s3`, `s3-init`   | use another S3 service (R2, AWS, MinIO elsewhere): set `S3_ENDPOINT` and others |
| `admin`    | `admin`           | not serve the admin panel; `/admin` then answers 502                            |
| `seed`     | `seed` (one-shot) | (only ever used with `run --rm seed`)                                           |

Profiles have no default inside the Compose file; `COMPOSE_PROFILES` is the switch, and `deploy/.env.example` starts
with `local-db,local-s3`. With no profiles, only `proxy`, `migrate`, `api`, `web` and `docs` run.

A `--profile` flag replaces `COMPOSE_PROFILES` rather than adding to it. `run --rm seed` does not mind, but
`docker compose -f deploy/compose.yml --profile seed down` would leave the database and storage running. To stop
everything, use `docker compose -f deploy/compose.yml --profile '*' down`.

The connection settings do have defaults, and they point at the bundled services. Enabling a profile is therefore
enough on an all-in-one server, and only moving a service elsewhere needs a variable:

| Variable       | Default                                                       |
| -------------- | ------------------------------------------------------------- |
| `DATABASE_URL` | `postgres://postgres:${POSTGRES_PASSWORD}@db:5432/tournament` |
| `S3_ENDPOINT`  | `http://s3:8333`                                              |
| `S3_BUCKET`    | `tournament`                                                  |
| `IMAGE_TAG`    | `latest`                                                      |

A few variables have no sensible default, and Compose refuses to start until they are set: `PUBLIC_URL`,
`JWT_SECRET`, `JWT_REFRESH_SECRET`, `EMAIL_FROM`, `SMTP_HOST`, `S3_ACCESS_KEY_ID` and `S3_SECRET_ACCESS_KEY`.
Compose checks every service whether its profile is on or not, so variables only some setups need are not marked
required. `POSTGRES_PASSWORD` is one of them; with `local-db` on and the password empty, the database container
refuses to start.

With `local-s3`, `S3_ACCESS_KEY_ID` and `S3_SECRET_ACCESS_KEY` also become the SeaweedFS credentials, so the API and
the storage always agree.

Services on another machine should be on the same local network as the API. A database across the internet adds its
round trip to every query, and pages make several.

### Email

Production has no mail catcher, and the API refuses to start without SMTP. Any SMTP server works; Amazon SES is a
good fit (`SMTP_HOST=email-smtp.<region>.amazonaws.com`, port 587, SMTP credentials from the SES console). Set up
SPF, DKIM and DMARC for the sending domain, and request production access, as new SES accounts can only send to
verified addresses.

### In front of the stack

Caddy is the stack's single entry point, and it can sit behind another reverse proxy or face the internet itself.

**Behind nginx (or Traefik, or a Cloudflare tunnel).** Caddy listens on plain HTTP and the proxy in front terminates
TLS. It is reachable two ways:

- on `127.0.0.1:8080` (`PROXY_HTTP_PORT`), for a proxy installed on the host
- as `tournament-app:80` (`EDGE_ALIAS`) on the Docker network named by `EDGE_NETWORK`, for a proxy in another
  container. Set `EDGE_NETWORK` to that proxy's network, for example `nginx_default`; the stack joins it without
  taking it over.

`deploy/nginx.conf.example` is a complete server block. The parts that matter:

- `client_max_body_size 6m`: image uploads are up to 5 MB, and nginx's default is 1 MB.
- `proxy_buffering off` and a long `proxy_read_timeout`: notifications are server-sent events.
- `X-Forwarded-For` and `X-Forwarded-Proto`, which Caddy passes on to the API.

On the shared network only the proxy is visible. Caddy reaches the API, web, docs and admin through aliases that
exist only inside the stack (`<EDGE_ALIAS>-api` and so on), so another project's `api` or `web` service on the same
network is never picked by mistake.

A Cloudflare tunnel closes connections that send nothing for about 100 seconds, which affects an idle notification
stream. The web app reconnects five seconds after a dropped stream, and notifications are stored, so only the toast for
one arriving in that gap is missed.

**Facing the internet.** Set `SITE_ADDRESS` to the domain and publish ports 80 and 443 on all interfaces
(`PROXY_HTTP_PORT=0.0.0.0:80`, `PROXY_HTTPS_PORT=0.0.0.0:443`). Caddy then obtains and renews the certificate itself.

### Memory

Idle, the whole stack uses about 200 MB; under light traffic plan for about 1 GB. `api` and `web` are capped at
512 MB each (`API_MEMORY_LIMIT`, `WEB_MEMORY_LIMIT`), and every container's log is rotated at 3 × 10 MB.

Building the images takes several gigabytes, which is why the server never builds them.

### Sample data

`docker compose -f deploy/compose.yml --profile seed run --rm seed` empties every table and fills the database with
the sample data and the `admin@example.com` / `Password123!` login. Change that password, or do not seed a server
other people use.

## Images

`.github/workflows/images.yml` builds the `api`, `web`, `docs` and `admin` images and pushes them to
`ghcr.io/drmodun/tournament-app-<app>`. Each is built natively on an amd64 and an arm64 runner (ARM servers such as
Oracle Cloud's free tier need the arm64 one) and published as one multi-arch tag.

| Trigger              | Tags                                 |
| -------------------- | ------------------------------------ |
| push to `main`       | `latest`, `sha-<short commit>`       |
| tag `v1.2.3`         | `1.2.3`, `1.2`, `sha-<short commit>` |
| manual run elsewhere | `sha-<short commit>`                 |

Pin `IMAGE_TAG` to a version or `sha-` tag to choose exactly what a server runs.

The web image is built with `NEXT_PUBLIC_API_URL=/api`, a relative address, so one image serves any domain behind the
stack's Caddy; server-side requests use `API_INTERNAL_URL`. The optional map and geocoder addresses come from the
repository variables `NEXT_PUBLIC_GEOCODER_URL`, `NEXT_PUBLIC_MAP_STYLE_URL` and `NEXT_PUBLIC_MAP_STYLE_URL_DARK`.

New packages on GitHub Container Registry are private. Either make each package public in its settings, or log the
server in with a token that has `read:packages`: `docker login ghcr.io -u <user>`.

Each Dockerfile has the same pruner → installer → runner stages:

| Image | Runner                                                                                                                               |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------ |
| API   | Node 22 Alpine, runs `node dist/main` as an unprivileged user; also used for `migrate` and `seed`                                    |
| Web   | Node 22 Alpine with the Next.js standalone output (`node apps/web/server.js`)                                                        |
| Docs  | `caddy:2-alpine` serving the static `dist/` from `/srv/docs` (config: `apps/docs/Caddyfile`, which also serves Starlight's 404 page) |
| Admin | Node 22 Alpine running `vite preview`                                                                                                |

## Before exposing a server

1. Generate `JWT_SECRET` and `JWT_REFRESH_SECRET` (`openssl rand -hex 32`); never reuse the development values.
2. Configure real SMTP and `EMAIL_FROM`.
3. Choose a database password and S3 keys, or point `DATABASE_URL` and `S3_*` at managed services.
4. Only `PUBLIC_URL` may call the API from a browser; set `CORS_ORIGIN` to allow other origins.
5. Add Google credentials for Google sign-in; without them the API starts with a placeholder and the Google button
   fails. Challonge is off by default and the API runs the brackets itself; to run stages on Challonge instead, set
   `CHALLONGE_ENABLED=true` with `CHALLONGE_CLIENT_ID` and `CHALLONGE_CLIENT_SECRET`.
6. Keep `deploy/.env` out of version control (it is ignored) and back up the database, for example with a nightly
   `pg_dump`.
