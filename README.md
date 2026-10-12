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
docker compose up --build                      # PostGIS, migrations, API and web
docker compose --profile seed run --rm seed    # optional: fill the database with sample data
```

- Web: http://localhost:3000
- API: http://localhost:5500 (Swagger UI at `/swagger`)
- Seeded login: `admin@example.com` / `Password123!`

The seed empties every table before filling it, which is why it only runs on request.

If a port is taken, move it: `DB_PORT`, `API_HOST_PORT` and `WEB_PORT` change the published ports.
When you change `API_HOST_PORT`, set `NEXT_PUBLIC_API_URL` to match before building the web image, for example:

```bash
API_HOST_PORT=5501 WEB_PORT=3002 NEXT_PUBLIC_API_URL=http://localhost:5501 docker compose up --build
```

The dormant docs and admin apps are behind a profile: `docker compose --profile tools up --build`.

## Environment variables

The tracked `.env` and `.env.test` contain local URLs and mock keys only, so the project starts without any setup.
Put real credentials in untracked override files; they take precedence:

- `.env.local` in the root directory, for development
- `.env.test.local` in the root directory, for the test suites
- `apps/web/.env.local` for the web app (see `apps/web/.env.example`)

What stays mocked until you add a real key:

| Key | Without a real value |
| --- | --- |
| `EMAIL_KEY`, `EMAIL_DOMAIN` (Mailgun) | Emails are logged by the API instead of sent, including confirmation links |
| `AWS_*` (S3) | Image uploads fail |
| `FIREBASE_*` | Push notifications are disabled |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google sign-in fails |
| `CHALLONGE_CLIENT_ID`, `CHALLONGE_CLIENT_SECRET` | Brackets are not mirrored to Challonge |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Maps show "map unavailable"; location autocomplete is off |
| `JWT_SECRET`, `JWT_REFRESH_SECRET` | Work as they are, but must be replaced outside local development |

## Local development

```bash
yarn install
docker compose up -d db        # PostGIS on localhost:5433, with tournament and tournament_test databases
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

`scripts/smoke-api.sh [api-url]` runs a quick check against a running, seeded API.

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
- Registration succeeds but the user cannot log in to protected pages: the email must be confirmed first; with the mock email key, the confirmation link is in the API logs

## License

[MIT](LICENSE)
