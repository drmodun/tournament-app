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

Two specs simulate whole tournaments through the API, using `test/helpers/tournamentRun.ts` (create a tournament, enter
players, add and start stages, post results until the stage ends):

- `brackets.e2e-spec.ts` plays every format to its end for several field sizes (single, double and triple
  elimination, compass, round robin, Swiss), including byes, draws, grand-final replays, rematch avoidance and the
  standings.
- `stage-lifecycle.e2e-spec.ts` covers starting, permissions, correcting and freezing results, and point conversion
  rules between stages and tournaments.
- `roster-update.e2e-spec.ts` covers creating and updating rosters as a group owner, as other users and as a site admin:
  membership, size and substitute limits, started stages, duplicates, and the change limit in later stages.
- `quiz.e2e-spec.ts` takes quizzes as an author and as players: answers stay hidden, one question at a time with
  per-question and total time limits (moved in the database instead of waiting), tests, scoring, retakes, the
  leaderboard and whose attempt is whose.
- `files.e2e-spec.ts` covers image uploads and serving against an in-memory stand-in for S3: the types accepted by their
  bytes, size limit, directories, headers and addresses.
- `elo.e2e-spec.ts` checks ratings against an independent model of the formula: first-match changes, draws, upsets,
  the K-factor thresholds over 22 matches, byes, team matchups rated against the opposing average, fake players, the
  floor of 0, unranked tournaments, corrections and deletions, per-category ratings and seeding by rating. It reads ratings straight from the database, because there is no career endpoint.

Challonge is disabled in the tests (`CHALLONGE_ENABLED` is unset), so they exercise the brackets the API runs itself.

## Smoke test against a running stack

`scripts/smoke-api.sh` exercises a running, seeded API with `curl`: login, registration, reads across the main
resources, and the guarded endpoints.

```bash
scripts/smoke-api.sh                                                    # http://localhost:5500
MAILPIT_URL=http://localhost:8025 scripts/smoke-api.sh http://localhost/api   # Docker stack, via the proxy
SMOKE_LOGS_CMD="docker compose logs api" scripts/smoke-api.sh           # find confirmation links in the API log
```

It checks that the new user cannot log in before confirming the email. With `MAILPIT_URL` or `SMOKE_LOGS_CMD` set,
it also completes the confirmation and logs in as that user. `SMOKE_PASSWORD` overrides the password of the seeded
accounts (default `Password123!`).

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
