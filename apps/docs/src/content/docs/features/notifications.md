---
title: Notifications
description: Stored notifications, live delivery over server-sent events, and transactional email.
---

There are two channels: **in-app notifications** (stored, and pushed live over SSE) and **email** (for account
flows only).

## In-app notifications

### What triggers one

| Event                                    | Recipients                           | Type                                             |
| ---------------------------------------- | ------------------------------------ | ------------------------------------------------ |
| Someone follows you                      | the followed user                    | `new-follower`                                   |
| A group invites you                      | the invited user                     | `group-invitation`                               |
| An invitation is accepted / rejected     | the invited user                     | `group-join-approval` / `group-join-rejection`   |
| A user requests to join a group          | the owner and every admin            | `group-join-request`                             |
| A join request is accepted / rejected    | the requester                        | `group-join-approval` / `group-join-rejection`   |
| You are promoted to / demoted from admin | that member                          | `group-admin-promotion` / `group-admin-demotion` |
| You are removed from a group             | that member                          | `group-removal`                                  |
| A stage starts                           | every user in a roster of that stage | `tournament-start`, linking to `/stage/<id>`     |

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

### Live stream

```text
GET /auth/sse-token                       → "3f2c…"   (requires JWT)
GET /notifications/stream?token=3f2c…     → text/event-stream
POST /notifications/token                 → rotate the SSE token (requires JWT)
```

Browsers cannot attach an `Authorization` header to `EventSource`, so the stream is authenticated with the user's
`sseToken`, a UUID stored on the user row. It does not expire; rotate it with `POST /notifications/token`.

Each event has the type `notification` and the notification as JSON data. Internally the API uses the Nest event
emitter: publishing emits an event named after the user id, and each open stream subscribes to its user's event.
Behind Caddy, `flush_interval -1` keeps events from being buffered.

:::note
Because the event bus is in-process, live delivery only reaches streams connected to the same API instance that
created the notification. With more than one API replica, notifications are still stored but may not arrive live.
:::

In the web app, `NotificationProvider` opens the stream after login, shows a toast for each event, and reconnects
five seconds after an error. `/notifications` lists the stored ones.

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
