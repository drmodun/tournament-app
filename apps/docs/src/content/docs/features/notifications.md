---
title: Notifications
description: Stored notifications, live delivery over server-sent events, and transactional email.
---

There are two channels: **in-app notifications** (stored, and pushed live over SSE) and **email** (for account
flows only).

## In-app notifications

### What triggers one

| Event                                                                        | Recipients                           | Type                                                                                |
| ---------------------------------------------------------------------------- | ------------------------------------ | ----------------------------------------------------------------------------------- |
| Someone follows you                                                          | the followed user                    | `new-follower`                                                                      |
| A group invites you                                                          | the invited user                     | `group-invitation`                                                                  |
| An invitation is accepted / rejected                                         | the invited user                     | `group-join-approval` / `group-join-rejection`                                      |
| Ownership of a group is transferred to you                                   | the new owner                        | `group-ownership-transfer`                                                          |
| A user requests to join a group                                              | the owner and every admin            | `group-join-request`                                                                |
| A join request is accepted / rejected                                        | the requester                        | `group-join-approval` / `group-join-rejection`                                      |
| You are promoted to / demoted from admin                                     | that member                          | `group-admin-promotion` / `group-admin-demotion`                                    |
| You are removed from a group                                                 | that member                          | `group-removal`                                                                     |
| A stage starts                                                               | every user in a roster of that stage | `tournament-start`, linking to `/stage/<id>`                                        |
| An API token makes 80% / all of its rate limit in a minute (once a day each) | the token's owner                    | `api-token-rate-limit-warning` / `api-token-rate-limit-reached`, linking to `/user` |

Messages are filled from short templates in `infrastructure/sse-notifications/templates.ts`, for example
`You have been invited to join the group {{group}}`.

### Storage

`createWithUsers(notification, userIds)` writes one `notification` row and one `notification_to_user` row per
recipient (with a read flag), then publishes it to each recipient's live stream.

### Reading and managing

| Endpoint                         | Effect                                                  |
| -------------------------------- | ------------------------------------------------------- |
| `GET /notifications`             | Your notifications, paginated, filterable by read state |
| `PATCH /notifications/:id/read`  | Mark one as read                                        |
| `PATCH /notifications/read/all`  | Mark all of yours as read                               |
| `PATCH /notifications/read/bulk` | Mark a list of ids as read                              |
| `DELETE /notifications/:id`      | Remove one from your list                               |

Read state is per recipient: marking a notification read or removing it only affects your own copy, and ids of
notifications you did not receive return `404`. A notification is deleted for good once every recipient has removed
it.

### Settings

`GET /notifications/settings` returns your `emailNotifications`, `pushNotifications` and `inAppNotifications`, all
`true` until changed; `PATCH /notifications/settings` changes the ones sent. With `inAppNotifications` off, new
notifications are neither stored for you nor sent to your stream; everyone else still receives them. The email and
push flags are stored for when those channels carry notifications: email is only used for account flows, and no push
notifications are sent yet.

### Push tokens

Devices register their push token (for example an FCM token) with `POST /notifications/push-tokens` `{ token }`.
A token is stored once: registering it again returns the same row, and registering it from another account moves it
there, since the device now belongs to whoever signed in last. `GET /notifications/push-tokens` lists yours and
`DELETE /notifications/push-tokens/:tokenId` removes one (`404` for a token that is not yours). The tokens are kept in
`user_to_notification_tokens`; nothing sends to them yet.

### Live stream

```text
POST /notifications/token                 → { id, sseToken: "eyJ…" }   (requires JWT)
GET  /notifications/stream?token=eyJ…     → text/event-stream
```

`GET /auth/sse-token` returns the same kind of token as a plain string.

Browsers cannot attach an `Authorization` header to `EventSource`, so the stream is authenticated with a token in the
query string. Because URLs end up in logs, that token is a JWT that expires after **5 minutes** and is signed with
its own secret (`SSE_TOKEN_SECRET`, by default derived from `JWT_SECRET`). It cannot be used as an access token, and
an access token is refused on the stream (`401`). Expiry is only checked when the stream opens, so an open stream
stays connected; a client requests a new token when it reconnects.

Each event has the type `notification` and the notification as JSON data. Behind Caddy, `flush_interval -1` keeps
events from being buffered.

### Several API instances

Live delivery goes through Postgres `LISTEN/NOTIFY` (`NotificationBus` in
`infrastructure/sse-notifications/notification-bus.ts`). Publishing sends a `NOTIFY` on the `notifications`
channel; every API instance listens on it and passes each message to its own open streams through the Nest event
emitter. A user therefore receives a notification whichever instance their stream is connected to. If an instance
cannot open its listener connection it logs an error and delivers only to its own streams.

In the web app, `NotificationProvider` opens the stream after login, shows a toast for each event, and five
seconds after an error requests a fresh token, which reconnects the stream. `/notifications` lists the stored ones.

## Email

Email is sent with Nodemailer over SMTP, using Handlebars templates in
`apps/api/src/infrastructure/email/templates/`:

| Template                  | Sent when                                 |
| ------------------------- | ----------------------------------------- |
| `email-confirmation.html` | A user registers                          |
| `reset-password.html`     | A password reset is requested             |
| `welcome.html`            | Template exists; not sent by any flow yet |
| `test-template.html`      | Used by tests                             |

Without `SMTP_HOST`, the transport serialises the message instead of sending it, and the API logs the recipient,
subject and every link in the body, which is enough to click through confirmation flows locally. In Docker, all mail
goes to Mailpit at http://localhost:8025.
