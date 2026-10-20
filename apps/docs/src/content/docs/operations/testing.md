---
title: Testing and CI
description: Unit tests, end-to-end tests, the smoke script and the GitHub Actions workflows.
---

## Unit tests

```bash
yarn test            # from the root, runs the API's Jest suite
cd apps/api && yarn test:watch
cd apps/api && yarn test:cov
```

About a hundred `*.spec.ts` files sit next to the code they test, mostly guards, services, helpers and exception
filters, with Nest's `Test.createTestingModule` and mocked dependencies. They read `.env.test` (and
`.env.test.local`) through `dotenv-cli`.

## End-to-end tests

```bash
docker compose up -d db   # provides tournament_test on localhost:5433
yarn test:e2e
```

`yarn test:e2e` in `apps/api`:

1. runs migrations against `tournament_test` (`migrate:test`),
2. seeds it (`seed:test`), which wipes it first,
3. runs Jest with `test/jest-e2e.json`, in band, with coverage.

The specs in `apps/api/test/` boot the real Nest application and call it over HTTP with supertest. There is one per
area: auth, users, groups, membership, invites, join requests, requirements, interests, blocked users and groups,
followers, categories, locations, LFG, LFP, tournaments, stages and participation. `environmentCheck.ts` runs before
every spec: it asserts `MODE=test` (so the suite never runs against the development database) and mocks the email
service and the Challonge client, so no mail is sent and no external API is called.

## Smoke test against a running stack

`scripts/smoke-api.sh` exercises a running, seeded API with `curl`: login, registration, reads across the main
resources, and the guarded endpoints.

```bash
scripts/smoke-api.sh                                                    # http://localhost:5500
MAILPIT_URL=http://localhost:8025 scripts/smoke-api.sh http://localhost/api   # Docker stack, via the proxy
SMOKE_LOGS_CMD="docker compose logs api" scripts/smoke-api.sh           # find confirmation links in the API log
```

With `MAILPIT_URL` or `SMOKE_LOGS_CMD` set, it also completes the email confirmation of the user it registers.

## Web components

There are no automated web tests. Components are developed and reviewed in Storybook (`yarn storybook` in
`apps/web`).

## Continuous integration

| Workflow         | Trigger           | What it does                                                                                                             |
| ---------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `build.yml`      | push              | `yarn install --frozen-lockfile` and `yarn build` (every workspace, including `astro check` for these docs)              |
| `lint.yml`       | push              | `yarn lint`                                                                                                              |
| `test.yml`       | push              | Build, then `yarn test`; uploads coverage and results to Codecov                                                         |
| `test-e2e.yml`   | push              | Starts a PostGIS service container on port 5433 with `tournament_test`, builds, runs `yarn test:e2e`, uploads to Codecov |
| `super-lint.yml` | push / PR         | Super-linter across the repository (formatting, YAML, Dockerfiles, ...)                                                  |
| `bump.yml`       | push / PR to main | Publishes the OpenAPI spec to Bump.sh, and comments the API diff on pull requests                                        |

Actions are pinned by commit SHA and checkouts use `persist-credentials: false`.

## After changing the stack

A quick end-to-end check of the containers:

```bash
docker compose up --build -d
docker compose ps                         # api healthy, migrate and s3-init exited 0
curl -fsS http://localhost/api/           # Hello World!
curl -fsSI http://localhost/ | head -1     # web app
curl -fsSI http://localhost/docs/ | head -1  # docs
docker compose --profile seed run --rm seed
MAILPIT_URL=http://localhost:8025 scripts/smoke-api.sh http://localhost/api
```
