---
title: Architecture overview
description: The monorepo layout, how the parts talk to each other, and where requests go.
---

## Monorepo layout

The repository is a Yarn 1 workspace driven by Turborepo.

| Path                         | Package                   | What it is                                                             |
| ---------------------------- | ------------------------- | ---------------------------------------------------------------------- |
| `apps/api`                   | `api`                     | NestJS 11 REST API on Postgres + PostGIS via Drizzle ORM               |
| `apps/web`                   | `web`                     | Next.js 16 / React 19 frontend                                         |
| `apps/docs`                  | `docs`                    | This Astro Starlight site                                              |
| `apps/admin`                 | `admin`                   | Vite + React placeholder for a future superadmin panel (unused)        |
| `packages/types`             | `@tournament-app/types`   | Enums, request/response interfaces and constants shared by API and web |
| `packages/eslint-config`     | `@repo/eslint-config`     | Shared ESLint configurations                                           |
| `packages/typescript-config` | `@repo/typescript-config` | Shared `tsconfig` bases                                                |

`turbo.json` makes `build`, `lint` and `test:e2e` depend on the builds of a workspace's dependencies (`^build`), so
`@tournament-app/types` is always compiled before the apps that import it.

## How the parts connect

```text
                    ┌───────────────────────── Caddy (proxy) :80/:443 ─────────────────────────┐
 browser ──────────▶│  /api/*  → api:5500 (prefix stripped)   /docs* → docs:4321   /* → web:3000 │
                    └──────────────────────────────────────────────────────────────────────────┘
                                   │                                   │
                                   ▼                                   ▼
                        ┌──────────────────┐   API_INTERNAL_URL  ┌──────────────┐
                        │  NestJS API      │◀────────────────────│ Next.js web  │
                        │                  │   (server fetches)  └──────────────┘
                        └──────────────────┘
                          │   │   │    │
          PostGIS ◀───────┘   │   │    └──────▶ Challonge API (optional)
          Mailpit/SMTP ◀──────┘   └───────────▶ S3 (SeaweedFS or any S3)
```

- The **browser** talks to the API through `<PUBLIC_URL>/api`. Caddy strips `/api` before forwarding, so the API
  itself has no prefix.
- The **Next.js server** fetches data for server-rendered pages directly from `api:5500` (`API_INTERNAL_URL`),
  because the browser-facing URL is not reachable from inside the container.
- The **notification stream** (`/api/notifications/stream`) is server-sent events; Caddy flushes it immediately.
- **Challonge** is optional and off unless `CHALLONGE_ENABLED=true`; by default the API runs every bracket. When
  enabled it is a mirror: brackets are created and advanced there, but the API's own database is the source of truth. Failed syncs are logged, never surfaced as request errors.

## Request lifecycle in the API

1. Global `ValidationPipe` with `whitelist: true, transform: true`: unknown body fields are dropped and query strings
   are converted to the DTO types.
2. Route guards run in the order listed in `@UseGuards(...)`. Most start with `JwtAuthGuard`, which loads the user
   from the database (only verified users) and attaches it as `request.user`.
3. Some guards stash what they loaded on the request (`request.tournament`, `request.stage`) for the guards after
   them, which is why guard order matters.
4. The controller calls a service, which calls a Drizzle repository.
5. `ClassSerializerInterceptor` serialises the response. Postgres errors are translated by `PostgresExceptionFilter`
   (for example unique violation → `409`, foreign key violation → `422`).

Details in [API (NestJS)](/docs/architecture/api/).

## Technology summary

| Concern       | Choice                                                                            |
| ------------- | --------------------------------------------------------------------------------- |
| Language      | TypeScript everywhere                                                             |
| API framework | NestJS 11, Passport (JWT, refresh JWT, Google OAuth)                              |
| ORM / DB      | Drizzle ORM 0.45, Postgres 16 with PostGIS 3.4                                    |
| Events        | `@nestjs/event-emitter` locally, Postgres `LISTEN/NOTIFY` between API instances   |
| Email         | Nodemailer + Handlebars templates                                                 |
| Storage       | AWS SDK v3 S3 client, any S3-compatible server                                    |
| Frontend      | Next.js 16 App Router, React 19, TanStack Query 5, axios, SCSS modules, MUI icons |
| Rich text     | Tiptap 3                                                                          |
| Maps          | MapLibre GL + OpenFreeMap tiles, Photon geocoder                                  |
| Brackets UI   | `@g-loot/react-tournament-brackets`                                               |
| Docs          | Astro 7 + Starlight 0.42                                                          |
| Proxy         | Caddy 2                                                                           |
