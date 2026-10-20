---
title: Web app (Next.js)
description: Routes, data fetching, authentication handling and UI conventions in apps/web.
---

The frontend is a Next.js 16 App Router application in `apps/web`, using React 19, TanStack Query 5 for server
state, axios for HTTP and SCSS modules for styling.

## Folder layout

```text
src/
├── app/          # routes: each folder with a page.tsx is a URL
├── views/        # page-level building blocks (forms, dashboards, dialogs), one folder each
├── components/   # reusable UI primitives (button, card, carousel, dropdown, ...)
├── api/
│   ├── client/   # axios instance, TanStack Query hooks per domain, mutation helper
│   ├── geocoding/# Photon geocoder client
│   └── serverApiUrl.ts
├── utils/
│   ├── context/  # theme, toast, drawer, notification contexts
│   ├── hooks/    # useDebounce, useInfiniteScrollTrigger, useLocationPicker, ...
│   ├── mixins/   # SCSS mixins
│   └── providers/# QueryProvider, ClientProviders
├── styles/  types/  stories/
```

`app/*/page.tsx` files are thin: they read route parameters and render a component from `views/`. Most views are
client components.

## Routes

| URL                                                                 | What it shows                                                |
| ------------------------------------------------------------------- | ------------------------------------------------------------ |
| `/`                                                                 | Landing page                                                 |
| `/main`                                                             | Home feed for signed-in users                                |
| `/login`, `/register`                                               | Authentication forms                                         |
| `/email-confirmation/[token]`                                       | Confirms an email address (link from the confirmation email) |
| `/requestPasswordReset`, `/reset-password/[token]`                  | Password reset flow                                          |
| `/search`                                                           | Search across tournaments, groups, users and more            |
| `/user`, `/user/[id]`                                               | Own profile / a user's profile                               |
| `/group/[id]`                                                       | Group page: members, tournaments, followers, join button     |
| `/contest/[id]`                                                     | Tournament page                                              |
| `/stages/[id]`                                                      | Stages of a tournament                                       |
| `/stage/[id]`, `/stage/[id]/bracket`                                | One stage and its bracket                                    |
| `/quiz/[id]`                                                        | Take a quiz                                                  |
| `/lfp/[...slug]`                                                    | Browse "looking for players" posts                           |
| `/notifications`                                                    | Notification centre                                          |
| `/manageTeams`, `/manageGroupInvites`, `/manageGroupInterests/[id]` | Group management                                             |
| `/manageBlockedUsers`, `/manageBlockedGroups`                       | Block lists                                                  |
| `/manageCompetitions`, `/manageStages/[id]`, `/manageRosters/[id]`  | Tournament, stage and roster management                      |
| `/manageMatchup/[id]`, `/manageUserManagedMatchups[/stageId]`       | Score entry for matches you manage                           |
| `/manageQuizzes`, `/manageUserManagedQuizzes`                       | Authoring quizzes                                            |
| `/manageInterests`, `/manageLFG`                                    | Own interests and LFG post                                   |
| `/landingPage2`                                                     | Alternative landing page                                     |

## Talking to the API

### In the browser

`src/api/client/base.ts` creates one axios instance, `clientApi`, with `baseURL = NEXT_PUBLIC_API_URL`.

- The access and refresh tokens are stored in cookies (`accessToken`, `refreshToken`) with `SameSite=Lax`, a 7-day
  expiry, and `Secure` in production.
- A request interceptor adds `Authorization: Bearer <accessToken>`.
- A response interceptor handles `401`: it calls `GET /auth/refresh` once with the refresh token, stores the new
  pair and retries the original request. If the refresh fails, both cookies are cleared.

Every domain has a folder in `src/api/client/hooks/` (for example `competitions`, `groups`, `rosters`, `quiz`) with
TanStack Query hooks such as `useGetX` and `useCreateX`. Mutations go through `useApiMutation`, which applies the
app-wide conventions: retry presets by request size, a pending toast, a success toast, an error toast, and
invalidation of every query whose key contains one of the listed segments.

### On the server

Some routes fetch data during server rendering (`serverFetches.ts` files next to the hooks). They use
`serverApiUrl`, which prefers `API_INTERNAL_URL`. In Docker that is `http://api:5500`, because the browser-facing
`http://localhost/api` is not reachable from inside the web container.

## Live notifications

`NotificationProvider` (in `utils/context/notificationContext.tsx`) uses `useSseNotifications`:

1. Request a stream token with `POST /notifications/token`.
2. Open `new EventSource(<API>/notifications/stream?token=<sseToken>)`. `EventSource` cannot send headers, which is
   why a separate short-lived token is used instead of the JWT.
3. Listen for `notification` events and show a toast.
4. On error, close the stream and, after 5 seconds, request a new token; the new token opens a new stream.

## Maps and location

Location pickers and the map view use MapLibre GL. Styles default to OpenFreeMap (Positron for light mode, Dark for
dark mode) and search uses the public Photon geocoder; all three can be overridden with `NEXT_PUBLIC_*` variables.
`useLocationPicker` turns a geocoder result into the `{ name, apiId, coordinates }` the API stores.

## Theming and UI

- `ThemeProvider` switches light and dark; components read it through `useThemeContext` and pick class names
  accordingly.
- `ToastProvider` shows feedback for mutations.
- `DrawerProvider` controls the navigation drawer rendered in the root layout.
- Rich text (descriptions, LFG messages, quiz questions) is edited with Tiptap.
- Brackets render with `@g-loot/react-tournament-brackets`; `utils/bracketUtils.tsx` converts API matchups into its
  format.

## Storybook

`apps/web/.storybook` configures Storybook for the components in `src/components` and `src/stories`. Run
`yarn storybook` in `apps/web` to browse them on port 6006.
