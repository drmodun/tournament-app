---
title: Configuration
description: Every environment variable the API, web app and Compose stack read.
---

The tracked `.env` and `.env.test` hold local URLs and mock keys only, so the project starts without setup. Put real
credentials in untracked override files, which take precedence:

| File                     | Used by                                                          |
| ------------------------ | ---------------------------------------------------------------- |
| `.env.local` (root)      | API scripts during development                                   |
| `.env.test.local` (root) | API unit and end-to-end tests                                    |
| `apps/web/.env.local`    | The web app under `yarn dev` (template: `apps/web/.env.example`) |

The Docker images never contain `.env*.local` files (see `.dockerignore`). In Compose, the API containers read the
root `.env` and then override a few values (database, SMTP, S3 endpoint, frontend URL) to point at other containers.

## API

### Core

| Variable             | Meaning                                                                                                                                                                                                    |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`       | Postgres connection string. Locally `postgres://postgres:postgres@localhost:5433/tournament`                                                                                                               |
| `API_PORT`           | Port the API listens on (default `5500`)                                                                                                                                                                   |
| `MODE`               | `production` turns off writing `openapi.yml`, hides the seed's database URL log, and makes the API refuse to start without `SMTP_HOST`                                                                     |
| `CORS_ORIGIN`        | Comma-separated origins allowed to call the API from a browser, for example `https://example.com`. When empty, production (`MODE=production`) allows only `FRONTEND_URL` and development allows any origin |
| `SSE_TOKEN_SECRET`   | Signs the 5-minute notification stream tokens. Defaults to a value derived from `JWT_SECRET`                                                                                                               |
| `FRONTEND_URL`       | Base for links in emails (confirmation, password reset). Default `http://localhost:3000`                                                                                                                   |
| `JWT_SECRET`         | Signs access tokens (valid 8 hours)                                                                                                                                                                        |
| `JWT_REFRESH_SECRET` | Signs refresh tokens (valid 7 days)                                                                                                                                                                        |

The API process forces `TZ=UTC` at startup so stored timestamps do not shift.

### Email (any SMTP server)

| Variable                     | Meaning                                                                                             |
| ---------------------------- | --------------------------------------------------------------------------------------------------- |
| `EMAIL_FROM`                 | Sender, for example `winning.sh <noreply@example.com>`. Required: the API does not start without it |
| `SMTP_HOST`, `SMTP_PORT`     | Server and port (default 587)                                                                       |
| `SMTP_USER`, `SMTP_PASSWORD` | Credentials; leave empty for servers without authentication                                         |
| `SMTP_SECURE`                | `true` for implicit TLS (port 465). Otherwise STARTTLS is used when the server offers it            |

With `SMTP_HOST` empty the API logs each email, including its links, instead of sending it. In production (`MODE=production`) the API
refuses to start without it. In Docker the API uses the bundled Mailpit inbox unless you set `SMTP_HOST`.

### File storage (any S3-compatible server)

| Variable                                                             | Meaning                                                                              |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `S3_ENDPOINT`                                                        | Server URL. Leave empty for AWS S3                                                   |
| `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET` | As usual                                                                             |
| `S3_FORCE_PATH_STYLE`                                                | Defaults to `true` when `S3_ENDPOINT` is set, which is what self-hosted servers need |

The defaults point at the SeaweedFS container; its access key is defined in `docker/s3/s3.json`. The older
`AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` and `AWS_S3_BUCKET` names are still read as fallbacks.

### Third parties (mocked by default)

| Variable                                                          | Without a real value                                                                                                                                                      |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` | Google sign-in fails. The callback defaults to `http://localhost:3000/auth/google/callback`                                                                               |
| `CHALLONGE_CLIENT_ID`, `CHALLONGE_CLIENT_SECRET`                  | Stages are created without a Challonge tournament and the API runs their brackets itself (see [Brackets run by the API](/docs/features/matches/#brackets-run-by-the-api)) |

## Web app

`NEXT_PUBLIC_*` values are inlined into the browser bundle at build time, so in Docker they are build arguments, not
runtime variables.

| Variable                         | Meaning                                                                                                                                        |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL`            | The API URL as the browser reaches it. Default `http://localhost:5500`; in Compose `<PUBLIC_URL>/api`                                          |
| `API_INTERNAL_URL`               | Server side only: how the Next.js server reaches the API when that differs (in Compose `http://api:5500`). Falls back to `NEXT_PUBLIC_API_URL` |
| `NEXT_PUBLIC_GEOCODER_URL`       | Photon geocoder for location search. Default `https://photon.komoot.io`                                                                        |
| `NEXT_PUBLIC_MAP_STYLE_URL`      | MapLibre style for light mode. Default OpenFreeMap Positron                                                                                    |
| `NEXT_PUBLIC_MAP_STYLE_URL_DARK` | MapLibre style for dark mode. Default OpenFreeMap Dark                                                                                         |

## Compose stack

| Variable                              | Default                              | Meaning                                                                                         |
| ------------------------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------- |
| `SITE_ADDRESS`                        | `:80`                                | What Caddy listens on. Set a domain and Caddy obtains and renews HTTPS certificates             |
| `PUBLIC_URL`                          | `http://localhost:<PROXY_HTTP_PORT>` | The address people open. The web image calls the API at `<PUBLIC_URL>/api` and emails link here |
| `PROXY_HTTP_PORT`, `PROXY_HTTPS_PORT` | 80, 443                              | Caddy                                                                                           |
| `DB_PORT`                             | 5433                                 | PostGIS                                                                                         |
| `API_HOST_PORT`                       | 5500                                 | API, published directly                                                                         |
| `WEB_PORT`                            | 3000                                 | Web app, published directly                                                                     |
| `DOCS_PORT`                           | 4321                                 | These docs, published directly                                                                  |
| `MAIL_UI_PORT`, `MAIL_SMTP_PORT`      | 8025, 1025                           | Mailpit                                                                                         |
| `S3_PORT`                             | 8333                                 | SeaweedFS S3                                                                                    |
| `S3_BUCKET`                           | `tournament`                         | Bucket created by `s3-init`                                                                     |
| `S3_ENDPOINT_INTERNAL`                | `http://s3:8333`                     | S3 endpoint the API container uses                                                              |
