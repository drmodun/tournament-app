---
title: Accounts and authentication
description: Registration, email confirmation, login, token refresh, Google sign-in and password reset.
---

## Registration

`POST /users` with name, username, email, password, country and date of birth.

Uploads need a signed-in user, so a profile picture chosen while registering is sent with the sign-up itself: the same
fields as a `multipart/form-data` form, with the image (PNG, JPEG, GIF or WebP, up to 5 MB) in a `profilePicture` file
field. The API stores it like `POST /files/avatar` and saves its URL on the new user, and removes it again if the user
cannot be created. JSON sign-ups without a picture work as before. `isFake` is not accepted here.

1. The password is hashed with bcrypt (10 rounds).
2. The user row is created with `isEmailVerified = false`.
3. A random UUID is stored as `emailConfirmationToken`.
4. An email with the link `<FRONTEND_URL>/email-confirmation/<token>` is sent (Handlebars template
   `email-confirmation.html`).
5. If sending the email fails, the new user is deleted again and the request returns `500`, so there are no
   half-registered accounts.

Fake users (`isFake: true`, created through `POST /users/fake` by tournament organisers and site admins) skip the
email step.

## Email confirmation

The web route `/email-confirmation/[token]` calls `POST /auth/email-confirmation/:token`, which sets
`isEmailVerified = true`. An unknown token returns `401`.

:::caution[Unverified accounts]
`POST /auth/login` returns `403` ("Confirm your email address before logging in") for an account whose email is not
confirmed yet; the password is checked first, so this does not reveal anything to someone without it. Unverified
users are also invisible to `GET /users/:id` and to the JWT guard. Check the inbox (Mailpit at http://localhost:8025
in Docker, or the API log without SMTP) for the confirmation link.
:::

## Login and tokens

`POST /auth/login` with `{ email, password }` returns:

```json
{ "accessToken": "…", "refreshToken": "…" }
```

| Token   | Secret               | Lifetime | Payload                          |
| ------- | -------------------- | -------- | -------------------------------- |
| Access  | `JWT_SECRET`         | 8 hours  | `sub` (user id), `email`, `role` |
| Refresh | `JWT_REFRESH_SECRET` | 7 days   | same                             |

An unknown email returns `404`, a wrong password `401`.

Send the access token as `Authorization: Bearer <accessToken>`. When it expires, call `GET /auth/refresh` with
`Authorization: Bearer <refreshToken>` to receive a new pair. The web app does this automatically on the first `401`
(see [Web app](/docs/architecture/web/#in-the-browser)).

Because the access strategy reloads the user on every request, the effective role is always the one in the database,
not the one baked into the token.

## Google sign-in

`GET /auth/google` starts the OAuth flow with the `email` and `profile` scopes. On callback
(`GET /auth/google/callback`) the API looks the user up by email. If there is none, it creates one with the Google
first name as name and username, the Google photo as profile picture, country `None` and a random password, then
returns the same token pair as a normal login. Accounts created this way start verified, since Google has already
confirmed the address, and no confirmation email is sent. Configure `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` and
`GOOGLE_CALLBACK_URL` for this to work.

## Password reset

1. `GET /auth/password-reset-request/:email`: if the user exists, store a reset token valid for 24 hours and email
   the link (`reset-password.html` template). Unknown emails return `404`.
2. The web route `/reset-password/[token]` calls `POST /auth/password-reset/:token` with `{ password }`. The token
   must exist and not be expired; otherwise `401`.

## Managing your own account

| Endpoint              | Effect                                                                                 |
| --------------------- | -------------------------------------------------------------------------------------- |
| `GET /users/me`       | Your profile (`extended` projection)                                                   |
| `PATCH /users`        | Update your own profile                                                                |
| `DELETE /users`       | Delete your own account; cascades to memberships, participations, rosters and the rest |
| `GET /auth/sse-token` | A 5-minute token for the notification stream                                           |

Site admins can also update and delete any user through `PATCH /users/:id` and `DELETE /users/:id`.

## Site roles

| Role    | Meaning                                                                                                                                                                                                                                |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `user`  | Default                                                                                                                                                                                                                                |
| `admin` | Superuser. Passes the admin guard, every group role guard, tournament and stage admin guards, roster and quiz attempt checks. There is no endpoint to grant it; set it in the database (the seeded `admin@example.com` already has it) |

The exceptions where `admin` does **not** bypass a check are listed under [Permissions](/docs/reference/permissions/).
