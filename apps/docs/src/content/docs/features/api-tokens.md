---
title: API tokens
description: Personal access tokens for scripts, bots and integrations that use the API as their user.
---

A personal access token (PAT) lets a script, bot or integration call the API as you without your password or a
short-lived login token. You create, name, limit and revoke tokens yourself under **Profile → api tokens**.

## Using a token

Send it like a login token:

```sh
curl -H "Authorization: Bearer wsh_…" https://<host>/api/users/me
```

A token works on every endpoint a login works on, as its user and with their rights at the moment of the request
(group roles, tournament ownership and so on are checked as usual). It never has more rights than that, and can
have fewer:

| Scope   | Allows                                   |
| ------- | ---------------------------------------- |
| `read`  | `GET` and `HEAD` requests                |
| `write` | every method; a `write` token also reads |

A read-only token gets `403 This token is read-only` for anything else.

### What a token cannot do

So that a leaked token cannot lock its owner out, hide itself or moderate the site, these need a real login:

- creating, listing and revoking tokens (`/auth/tokens…`), answering
  `403 This action needs a login, not an API token`;
- deleting the account (`DELETE /users`), with the same answer;
- every site admin action (`AdminAuthGuard`), answering `403 Admin actions need a login, not an API token`. A site
  admin's token also loses the site admin bypass of the other guards: it acts as a regular user.

## Tokens

Tokens look like `wsh_` followed by 43 characters (32 random bytes, base64url). The prefix makes leaked tokens easy
to spot in logs and for secret scanners. The token is shown **once**, when it is created; the API keeps only its
SHA-256 hash and the 8 characters after `wsh_`, which the list shows as `wsh_Jq3xY8a1…`.

- A token expires after 90 days by default, after 1–365 days if you choose, or never (`expiresInDays: null`; the
  web app warns about this).
- You can have at most **10** tokens that are neither revoked nor expired.
- Revoking keeps the token in the list, marked revoked, and it stops working at once. Expired tokens stay listed
  too.
- Tokens survive a password reset. **Revoke all** in the web app (`DELETE /auth/tokens`) ends every active token.
- A token of a user who has not confirmed their email address is refused, like their login.

## Limits and usage

Each token may make **120 requests a minute** (a fixed window per token). Every answer to a token request carries
`X-RateLimit-Limit`, `X-RateLimit-Remaining` and `X-RateLimit-Reset` (seconds until the window starts over); over
the limit the answer is `429 Too many requests with this API token` with `Retry-After`.

The token's owner gets an in-app notification (`api-token-rate-limit-warning`, `api-token-rate-limit-reached`)
when a token makes 80% and 100% of its limit in a minute, at most once a day per token and kind.

The counter lives in each API process, so with several API instances a token can make up to 120 requests a
minute per instance. A shared store (Redis) would fix that if it ever matters.

The API counts each token's requests per UTC day (`api_token_usage`) and sets `lastUsedAt`, without delaying the
request; `GET /auth/tokens/:id/usage` returns the last 30 days. It stores no IP addresses or user agents.

## Endpoints

All of them need a login and act on your own tokens only; someone else's token is answered with `404`.

| Method | Path                     | Body / result                                                                             |
| ------ | ------------------------ | ----------------------------------------------------------------------------------------- |
| POST   | `/auth/tokens`           | `{ name, scopes, expiresInDays? }` → the token with `token`, the only time it is returned |
| GET    | `/auth/tokens`           | Your tokens: `id, name, prefix, scopes, createdAt, expiresAt, lastUsedAt, revokedAt`      |
| DELETE | `/auth/tokens`           | Revokes every active token → `{ revoked }`                                                |
| DELETE | `/auth/tokens/:id`       | Revokes one token                                                                         |
| GET    | `/auth/tokens/:id/usage` | `[{ day, requests }]` for the last 30 days, days without requests left out                |

`name` is 1–60 characters, `scopes` a non-empty list of `read` / `write`, `expiresInDays` 1–365 or `null`.

## Implementation

- `api-tokens/`: generation and hashing (`api-token.ts`), the rate limiter, repository, service and controller.
- `auth/strategies/apiToken.strategy.ts`: the `api-token` Passport strategy. A bearer token without the `wsh_`
  prefix fails so the `jwt` strategy handles it; a `wsh_` token that does not check out is an error with its own
  message. `JwtAuthGuard` is `AuthGuard(['jwt', 'api-token'])`, so every guard built on it accepts tokens.
- `auth/guards/session-only.guard.ts`: `@SessionOnly()`, used instead of `UseGuards(JwtAuthGuard)` on routes a token
  must not reach. `req.user.tokenId` is set for token requests, which is how code tells them from a login.
