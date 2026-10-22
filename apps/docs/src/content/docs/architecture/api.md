---
title: API (NestJS)
description: How the API is organised, the conventions every module follows, and how to add a new one.
---

The API lives in `apps/api`. Its entry point is `src/main.ts`, and `src/app.module.ts` imports one Nest module per
feature.

## Bootstrapping (`src/main.ts`)

- Sets `process.env.TZ = 'UTC'`.
- Registers the global `ValidationPipe({ whitelist: true, transform: true })`.
- Registers the global `ClassSerializerInterceptor`.
- Registers two exception filters: `PostgresExceptionFilter` and `NoValuesToSetExceptionFilter` (an update with no
  fields becomes a `400` instead of a crash).
- Enables CORS for every origin.
- Builds the OpenAPI document (title "winning.sh API", bearer auth), serves Swagger UI at `/swagger`, and writes
  `openapi.yml` when `MODE` is not `production`. The `bump.yml` workflow publishes that spec to Bump.sh.
- Listens on `API_PORT` (default 5500). `GET /` returns `Hello World!` and is used as the container health check.

## Source layout

```text
src/
├── app.module.ts           # imports every feature module
├── main.ts
├── auth/                   # login, refresh, Google OAuth, password reset, email confirmation
├── base/                   # shared building blocks (see below)
├── db/                     # schema.ts, drizzle/ migrations, seed/
├── infrastructure/
│   ├── blob/               # S3 client and the /files upload endpoint
│   ├── email/              # Nodemailer + Handlebars templates
│   └── sse-notifications/  # notification storage and the SSE stream
├── users/  group/  group-membership/  group-invites/  group-join-requests/
├── blocked-groups/  followers/  interest/  category/  location/  career/
├── tournament/  stage/  participation/  roster/  matches/  challonge/  conversion-rule/
├── lfg/  lfp/
└── quiz/  quiz-attempt/
```

Each feature folder follows the same shape:

| File                    | Role                                                                  |
| ----------------------- | --------------------------------------------------------------------- |
| `*.module.ts`           | Nest module wiring                                                    |
| `*.controller.ts`       | Routes, guards, Swagger annotations                                   |
| `*.service.ts`          | Business rules; throws Nest HTTP exceptions                           |
| `*.repository.ts`       | Drizzle queries, extending a base repository                          |
| `dto/`                  | `class-validator` request classes, response classes, Swagger examples |
| `guards/`               | Feature-specific authorisation                                        |
| `tests/` or `*.spec.ts` | Jest unit tests                                                       |

## Base building blocks (`src/base`)

### Repositories

`base/repository/baseRepository.ts` defines `BaseDrizzleRepository<Table, Query>`. A concrete repository supplies:

- `getMappingObject(responseType)`: the `select` shape for each response type (`mini`, `base`, `extended`, ...).
- `conditionallyJoin(query, responseType)`: the joins that response type needs.
- `getValidWhereClause(query)`: turns query parameters into SQL conditions.
- `sortRecord`: which `field` values are sortable and the column or expression behind each.

From those, the base class builds list queries with filtering, sorting, pagination and an optional total count.
`primaryRepository.ts` adds create/update/delete for tables with a serial `id`; `compositeRepository.ts` does the
same for join tables keyed by two columns (for example group membership).

### Queries and responses

Every list endpoint accepts the `BaseQuery` parameters in addition to its own filters:

| Parameter          | Meaning                                                                   |
| ------------------ | ------------------------------------------------------------------------- |
| `page`, `pageSize` | Pagination. `page` defaults to 1, `pageSize` to 12, maximum 100           |
| `field`, `order`   | Sort column (must be in the repository's `sortRecord`) and `asc` / `desc` |
| `responseType`     | Which projection to return, for example `mini`, `base`, `extended`        |
| `returnFullCount`  | `true` adds `pagination.total`                                            |
| `search`           | Free-text filter where the repository supports it                         |

List responses have this shape (built by `base/static/makeMetadata.ts`):

```json
{
  "results": [ ... ],
  "metadata": {
    "pagination": { "page": 1, "pageSize": 12, "total": 40 },
    "links": { "first": "/tournaments?page=1", "prev": "/tournaments?page=0", "next": "/tournaments?page=2" },
    "query": { ... echo of the parsed query ... }
  }
}
```

Single-entity `GET` endpoints accept `responseType` too. Creates return `{ id }` (`ActionResponsePrimary`).

Many modules also expose `GET /<resource>/auto-complete/:search`, a lightweight name search used by the web app's
autocomplete inputs.

### Decorators and helpers

- `@CurrentUser()` injects `request.user` (a `ValidatedUserDto`: id, email, role and a few profile fields).
- `@RefreshToken()` injects the refresh token from the `Authorization` header.
- `@IsDateGreaterThan()` / `@IsNumberGreaterThan()` cross-field validators (for example `endDate > startDate`).
- `base/static/teamTypeExtractor.ts` derives solo vs team from the participation URL.
- `base/static/locationHelper.ts` builds PostGIS WKT / geography expressions.
- `base/static/eloHelper.ts` implements the ELO formula (see [Careers and ELO](/docs/features/careers/)).
- `base/static/toBoolean.ts` is the `@Transform` for boolean body fields: it accepts JSON booleans as well as the
  `"true"`/`"false"` strings of query strings and form data.

### Error translation

`PostgresExceptionFilter` catches driver errors (also when Drizzle wraps them) and maps SQLSTATE codes:

| Postgres code                 | HTTP status | Message                    |
| ----------------------------- | ----------- | -------------------------- |
| `23505` unique violation      | 409         | Unique Entity Violation    |
| `23503` foreign key violation | 422         | Foreign Key Constraint     |
| `42P01` undefined table       | 400         | Undefined Table            |
| `42703` undefined column      | 422         | Undefined column mentioned |
| `08006` connection error      | 503         | Database Connection Error  |
| anything else                 | 500         | Internal Server Error      |

## Authentication strategies

Passport strategies live in `src/auth/strategies`:

| Strategy               | Name          | Token source                                                                         | Used by                                     |
| ---------------------- | ------------- | ------------------------------------------------------------------------------------ | ------------------------------------------- |
| `AccessTokenStrategy`  | `jwt`         | `Authorization: Bearer <access>` signed with `JWT_SECRET`                            | `JwtAuthGuard` and everything built on it   |
| `RefreshTokenStrategy` | `jwt-refresh` | `Authorization: Bearer <refresh>` signed with `JWT_REFRESH_SECRET`                   | `GET /auth/refresh`                         |
| `GoogleStrategy`       | `google`      | Google OAuth 2                                                                       | `GET /auth/google`, `/auth/google/callback` |
| `ApiTokenStrategy`     | `api-token`   | `Authorization: Bearer wsh_…`, a [personal access token](/docs/features/api-tokens/) | `JwtAuthGuard` and everything built on it   |

The access strategy reloads the user from the database on every request, so role changes and deletions take effect
immediately even though the token itself carries the role.

Authorisation is done with guards. The full list is in [Permissions](/docs/reference/permissions/).

## Events

`EventEmitterModule.forRoot()` provides an in-process event bus. Open SSE connections subscribe to an event named
after their user's id. Notifications reach that bus through Postgres `LISTEN/NOTIFY`, so they arrive whichever API
instance created them. See [Notifications](/docs/features/notifications/#several-api-instances).

When a stage run by the API finishes, `MatchesService` emits `stage.finished` with the stage id and waits for the
listeners; `ConversionRuleService` applies that stage's [conversion rules](/docs/features/matches/#point-conversion-rules)
there, which keeps the matches module free of a dependency on conversion rules.

## File uploads

`POST /files/:directory` (signed in) takes a multipart form with one `file` field of up to 5 MB, and stores it in the
S3 bucket under `<directory>/<uuid>.<ext>`. The directory is one of `avatar`, `group-avatar`, `group-banner`,
`tournament`, `tournament-avatar` or `quiz`. The type is read from the file's first bytes, not from what the client
claims: only PNG, JPEG, GIF and WebP are accepted (`400` otherwise, `413` when too large). SVG is refused because it
can carry scripts.

The response has the object `key` and a `url`, `<API_PUBLIC_URL>/files/<key>`, to put in any image field (a user's
`profilePicture`, a group's or tournament's `logo`, a quiz's `coverImage`, ...). `GET /files/:directory/:name` serves
the image from the bucket with a long cache lifetime, `nosniff` and a `default-src 'none'` content security policy, so
the bucket itself never needs to be public. Image fields still accept any URL, so links to other sites keep working.

## Adding a feature module

1. Add tables to `src/db/schema.ts`, then `yarn generate` and `yarn migrate` in `apps/api`.
2. Add shared enums and request/response interfaces to `packages/types/src/<feature>` and export them from
   `packages/types/src/index.ts`.
3. Create `src/<feature>/` with module, controller, service and a repository extending `PrimaryRepository` or
   `CompositeRepository`.
4. Implement `getMappingObject`, `conditionallyJoin`, `getValidWhereClause` and `sortRecord`.
5. Protect routes with `JwtAuthGuard` plus the feature or group guards you need.
6. Import the module in `app.module.ts`.
7. Add a seed file under `src/db/seed/` if the feature needs sample data, and wire it in `seedDefinition.ts`.
