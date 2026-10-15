# Tournament App

A comprehensive tournament management application built with NestJS (API) and Next.js (Web frontend).

## Project Structure

This is a monorepo project with the following structure:

- `apps/api`: NestJS backend API
- `apps/web`: Next.js frontend application
- `packages`: Shared packages and types
- `docs`: Documentation (currently dormant, will be used later as a standalone docs site)
- `admin`: Admin panel (not currently used, will be used later for superadmins only, now they just act as all privileges enabled users)

## Prerequisites

- Node.js 22 or newer (`.nvmrc` is provided)
- Yarn 1 (`corepack enable` picks up the pinned version)
- Docker, for the database and for running the whole stack in containers

## Quick start with Docker

```bash
docker compose up --build                      # everything, behind a Caddy reverse proxy
docker compose --profile seed run --rm seed    # optional: fill the database with sample data
```

| What | Where |
| --- | --- |
| Web app | http://localhost |
| API | http://localhost/api (Swagger UI at `/api/swagger`) |
| Mail inbox (Mailpit) | http://localhost:8025 — every email the API sends lands here |
| S3 storage (SeaweedFS) | http://localhost:8333, bucket `tournament` |
| Seeded login | `admin@example.com` / `Password123!` |

The seed empties every table before filling it, which is why it only runs on request.

### Reverse proxy

Caddy is the single entry point; its configuration is `docker/caddy/Caddyfile`. It serves the web app at `/`
and the API under `/api`. Two variables control the address:

- `SITE_ADDRESS`: what Caddy listens on. The default `:80` is plain HTTP on any hostname. Set it to a domain and
  Caddy obtains and renews the HTTPS certificate itself.
- `PUBLIC_URL`: the address people open. The web image is built to call the API at `<PUBLIC_URL>/api`, and links in
  emails use it. Defaults to `http://localhost:<PROXY_HTTP_PORT>`.

```bash
SITE_ADDRESS=example.com PUBLIC_URL=https://example.com docker compose up --build
```

### Ports

If a port is taken, move it: `PROXY_HTTP_PORT` (80), `PROXY_HTTPS_PORT` (443), `DB_PORT` (5433),
`API_HOST_PORT` (5500), `WEB_PORT` (3000), `MAIL_UI_PORT` (8025), `MAIL_SMTP_PORT` (1025), `S3_PORT` (8333).

```bash
PROXY_HTTP_PORT=8080 PROXY_HTTPS_PORT=8443 docker compose up --build   # then open http://localhost:8080
```

The dormant docs and admin apps are behind a profile: `docker compose --profile tools up --build`.

## Environment variables

The tracked `.env` and `.env.test` contain local URLs and mock keys only, so the project starts without any setup.
Put real credentials in untracked override files; they take precedence:

- `.env.local` in the root directory, for development
- `.env.test.local` in the root directory, for the test suites
- `apps/web/.env.local` for the web app (see `apps/web/.env.example`)

### Email (any SMTP server)

| Variable | Meaning |
| --- | --- |
| `EMAIL_FROM` | Sender, for example `winning.sh <noreply@example.com>` |
| `SMTP_HOST`, `SMTP_PORT` | Server and port (default 587) |
| `SMTP_USER`, `SMTP_PASSWORD` | Credentials; leave empty for servers without authentication |
| `SMTP_SECURE` | `true` for implicit TLS (port 465). Otherwise STARTTLS is used when the server offers it |

With `SMTP_HOST` empty the API logs each email (with its links) instead of sending it, except in production, where
it refuses to start. In Docker the API uses the bundled Mailpit inbox unless you set `SMTP_HOST`.

### File storage (any S3-compatible server)

| Variable | Meaning |
| --- | --- |
| `S3_ENDPOINT` | Server URL. Leave empty for AWS S3 |
| `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET` | As usual |
| `S3_FORCE_PATH_STYLE` | Defaults to `true` when `S3_ENDPOINT` is set, which is what self-hosted servers need |

The defaults point at the SeaweedFS container; its access key is defined in `docker/s3/s3.json`.
The older `AWS_*` names are still read as a fallback.

### Maps

Maps need no key: the web app uses MapLibre GL with OpenFreeMap tiles (OpenStreetMap data) and the public Photon
geocoder for location search. To use your own servers, set `NEXT_PUBLIC_MAP_STYLE_URL`,
`NEXT_PUBLIC_MAP_STYLE_URL_DARK` and `NEXT_PUBLIC_GEOCODER_URL` (see `apps/web/.env.example`).

### Still mocked until you add a real key

| Key | Without a real value |
| --- | --- |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google sign-in fails |
| `CHALLONGE_CLIENT_ID`, `CHALLONGE_CLIENT_SECRET` | Brackets are not mirrored to Challonge |
| `JWT_SECRET`, `JWT_REFRESH_SECRET` | Work as they are, but must be replaced outside local development |

## Local development

```bash
yarn install
docker compose up -d db s3 s3-init   # PostGIS on localhost:5433 and S3 storage on localhost:8333
cd apps/api && yarn migrate && yarn seed && cd ../..
yarn dev                       # API on :5500, web on :3000
```

Other commands, all from the root: `yarn build`, `yarn lint`, `yarn format`.

## Testing

```bash
yarn test        # API unit tests
yarn test:e2e    # migrates and seeds tournament_test, then runs the API end-to-end tests
```

Both use `.env.test`, which points at the local `tournament_test` database from `docker compose up -d db`.

`scripts/smoke-api.sh [api-url]` runs a quick check against a running, seeded API, for example
`MAILPIT_URL=http://localhost:8025 scripts/smoke-api.sh http://localhost/api`.

## Features

- Tournament creation and management
- Group/team management
- User registration and authentication
- LFP and LFG search 
- Bracket generation and visualization (single elim only as of right now)
- Location-based services (using Google Maps API)
- Email notifications
- Many more tournament features are coming

## Troubleshooting

- Port already in use: see the port variables under "Quick start with Docker". For `yarn dev`, set `API_PORT` and `DATABASE_URL` in `.env.local`
- Migrations or the API cannot connect: check that the `db` container is healthy with `docker compose ps`
- Registration succeeds but the user cannot log in to protected pages: the email must be confirmed first; the confirmation email is in the Mailpit inbox (Docker) or the API logs (`yarn dev`)

## License

[MIT](LICENSE)
