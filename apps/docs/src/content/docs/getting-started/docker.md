---
title: Quick start with Docker
description: Start the full stack with one command and find each service.
---

The fastest way to see the app is the Compose stack in the repository root. It needs only Docker.

```bash
docker compose up --build                      # everything, behind a Caddy reverse proxy
docker compose --profile seed run --rm seed    # optional: fill the database with sample data
```

The first build takes a few minutes because it builds the API, web and docs images.

## Where everything is

| What                   | Where                                                                         |
| ---------------------- | ----------------------------------------------------------------------------- |
| Web app                | http://localhost                                                              |
| API                    | http://localhost/api (Swagger UI at `/api/swagger`)                           |
| These docs             | http://localhost/docs/ (also http://localhost:4321/docs/)                     |
| Mail inbox (Mailpit)   | http://localhost:8025: every email the API sends lands here                   |
| S3 storage (SeaweedFS) | http://localhost:8333, bucket `tournament`                                    |
| Database (PostGIS)     | `localhost:5433`, user `postgres`, password `postgres`, database `tournament` |

## Sample data

The seed is destructive: it empties every table before inserting deterministic sample users, groups, categories,
tournaments, stages, rosters, matches, quizzes and LFG posts. That is why it sits behind the `seed` profile and only
runs when you ask for it.

After seeding, sign in with `admin@example.com` / `Password123!`. That account is a site admin.

## Registering a new account

Registration sends a confirmation email. Open Mailpit at http://localhost:8025, click the link, and only then log in.
Until the email is confirmed the account can obtain tokens but every authenticated request returns `401`, because the
user lookup behind the JWT guard only returns verified users.

## When a port is taken

Every host port has a variable. For example, to move the proxy:

```bash
PROXY_HTTP_PORT=8080 PROXY_HTTPS_PORT=8443 docker compose up --build   # then open http://localhost:8080
```

The full list is in [Docker stack and deployment](/docs/operations/deployment/#ports).

## Just the database

For `yarn dev` and the test suites you only need the database (and S3 if you touch uploads):

```bash
docker compose up -d db s3 s3-init
```

Continue with [Local development](/docs/getting-started/local-development/).
