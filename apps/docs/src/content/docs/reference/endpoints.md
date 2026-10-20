---
title: API endpoints
description: Every route the API exposes, grouped by controller, with the guard that protects it.
---

All paths are relative to the API root: `http://localhost:5500` directly, or `http://localhost/api` through the
proxy. The interactive Swagger UI at `/swagger` has request and response schemas and examples.

**Auth** column: `–` public · `JWT` any signed-in, verified user · `Site admin` user role `admin` · group roles
mean the caller's role in the group from the path or body. Site admins pass every guard except the ones marked † in
[Permissions](/docs/reference/permissions/).

## Auth: `/auth`

| Method | Path                                    | Auth          | Purpose                                      |
| ------ | --------------------------------------- | ------------- | -------------------------------------------- |
| POST   | `/auth/login`                           | –             | Email + password → access and refresh tokens |
| GET    | `/auth/refresh`                         | refresh token | New token pair                               |
| GET    | `/auth/google`, `/auth/google/callback` | –             | Google OAuth                                 |
| GET    | `/auth/password-reset-request/:email`   | –             | Email a reset link                           |
| POST   | `/auth/password-reset/:token`           | –             | Set a new password                           |
| POST   | `/auth/email-confirmation/:token`       | –             | Confirm an email address                     |
| GET    | `/auth/sse-token`                       | JWT           | Token for the notification stream            |

## Users: `/users`

| Method | Path                           | Auth       | Purpose               |
| ------ | ------------------------------ | ---------- | --------------------- |
| POST   | `/users`                       | –          | Register              |
| POST   | `/users/fake`                  | JWT        | Create a fake user    |
| GET    | `/users`                       | –          | List and search users |
| GET    | `/users/me`                    | JWT        | Own profile           |
| GET    | `/users/:id`                   | –          | One user              |
| GET    | `/users/auto-complete/:search` | –          | Username search       |
| PATCH  | `/users`                       | JWT        | Update own profile    |
| DELETE | `/users`                       | JWT        | Delete own account    |
| PATCH  | `/users/:id`                   | Site admin | Update any user       |
| DELETE | `/users/:id`                   | Site admin | Delete any user       |

## Groups: `/groups`

| Method | Path                               | Auth        | Purpose                                                  |
| ------ | ---------------------------------- | ----------- | -------------------------------------------------------- |
| GET    | `/groups`                          | –           | List and search                                          |
| GET    | `/groups/:groupId`                 | –           | One group                                                |
| GET    | `/groups/auto-complete/:search`    | –           | Name search                                              |
| GET    | `/groups/:groupId/members`         | –           | Members                                                  |
| GET    | `/groups/:groupId/tournaments`     | –           | Tournaments the group is in                              |
| GET    | `/groups/:groupId/followers`       | –           | Followers                                                |
| GET    | `/groups/for-roster/:tournamentId` | JWT         | Groups you administer that are entered in the tournament |
| POST   | `/groups`                          | JWT         | Create; you become its admin                             |
| POST   | `/groups/fake`                     | JWT         | Create a fake group                                      |
| PATCH  | `/groups/:groupId`                 | group admin | Update                                                   |
| DELETE | `/groups/:groupId`                 | group owner | Delete                                                   |

## Group membership: `/group-membership`

| Method | Path                                                     | Auth         | Purpose                    |
| ------ | -------------------------------------------------------- | ------------ | -------------------------- |
| GET    | `/group-membership`                                      | –            | List memberships           |
| GET    | `/group-membership/:groupId/:userId`                     | –            | One membership             |
| GET    | `/group-membership/auto-complete/users/:groupId/:search` | –            | Search a group's members   |
| GET    | `/group-membership/auto-complete/groups/:search`         | JWT          | Search your groups         |
| DELETE | `/group-membership/:groupId/leave`                       | group member | Leave                      |
| POST   | `/group-membership/:groupId/:userId`                     | Site admin   | Add directly               |
| PATCH  | `/group-membership/:groupId/:userId`                     | group admin  | Change role (not to owner) |
| DELETE | `/group-membership/:groupId/:userId`                     | group admin  | Remove a member            |

## Group invites: `/group-invites`

| Method | Path                              | Auth              | Purpose                |
| ------ | --------------------------------- | ----------------- | ---------------------- |
| GET    | `/group-invites`                  | –                 | List invitations       |
| GET    | `/group-invites/:groupId/:userId` | –                 | One invitation         |
| POST   | `/group-invites/:groupId/:userId` | group admin       | Invite a user          |
| PATCH  | `/group-invites/:groupId/:userId` | group admin       | Edit the message       |
| DELETE | `/group-invites/:groupId/:userId` | group admin       | Withdraw               |
| POST   | `/group-invites/:groupId/accept`  | JWT, not a member | Accept your invitation |
| DELETE | `/group-invites/:groupId/reject`  | JWT, not a member | Reject your invitation |

## Group join requests: `/group-join-requests`

| Method | Path                                           | Auth              | Purpose                    |
| ------ | ---------------------------------------------- | ----------------- | -------------------------- |
| GET    | `/group-join-requests`                         | –                 | List requests              |
| GET    | `/group-join-requests/:groupId/:userId`        | –                 | One request                |
| POST   | `/group-join-requests/:groupId`                | JWT, not a member | Ask to join a public group |
| PATCH  | `/group-join-requests/:groupId`                | JWT, not a member | Edit your request          |
| DELETE | `/group-join-requests/:groupId`                | JWT, not a member | Withdraw your request      |
| POST   | `/group-join-requests/:groupId/:userId/accept` | group admin       | Accept                     |
| DELETE | `/group-join-requests/:groupId/:userId/reject` | group admin       | Reject                     |

## Group requirements, interests, block list

| Method | Path                                            | Auth         | Purpose                 |
| ------ | ----------------------------------------------- | ------------ | ----------------------- |
| POST   | `/group-requirements/:groupId`                  | group admin  | Create requirements     |
| GET    | `/group-requirements/:groupId`                  | group member | Read requirements       |
| PUT    | `/group-requirements/:groupId`                  | group admin  | Update requirements     |
| DELETE | `/group-requirements/:groupId`                  | group admin  | Remove requirements     |
| GET    | `/group-interests/:groupId`                     | JWT          | Group's categories      |
| POST   | `/group-interests/:groupId/:categoryId`         | group admin  | Add a category          |
| DELETE | `/group-interests/:groupId/:categoryId`         | group admin  | Remove a category       |
| GET    | `/blocked-users/:groupId`                       | group admin  | Users the group blocked |
| GET    | `/blocked-users/auto-complete/:groupId/:search` | group admin  | Search them             |
| POST   | `/blocked-users/:groupId/:userId`               | group admin  | Block a user            |
| DELETE | `/blocked-users/:groupId/:userId`               | group admin  | Unblock                 |

## User-side social

| Method | Path                                         | Auth | Purpose                   |
| ------ | -------------------------------------------- | ---- | ------------------------- |
| GET    | `/followers`                                 | –    | List follow relationships |
| GET    | `/followers/:userId/:followerId`             | –    | One relationship          |
| GET    | `/followers/auto-complete/followers/:search` | JWT  | Search your followers     |
| GET    | `/followers/auto-complete/following/:search` | JWT  | Search who you follow     |
| POST   | `/followers/:userId`                         | JWT  | Follow                    |
| DELETE | `/followers/:userId`                         | JWT  | Unfollow                  |
| GET    | `/interest`                                  | JWT  | Your interests            |
| POST   | `/interest/:categoryId`                      | JWT  | Add an interest           |
| DELETE | `/interest/:categoryId`                      | JWT  | Remove an interest        |
| GET    | `/blocked-groups`                            | JWT  | Groups you blocked        |
| GET    | `/blocked-groups/auto-complete/:search`      | JWT  | Search them               |
| POST   | `/blocked-groups/:groupId`                   | JWT  | Block a group             |
| DELETE | `/blocked-groups/:groupId`                   | JWT  | Unblock                   |

## Categories: `/categories`

| Method | Path                                | Auth       | Purpose     |
| ------ | ----------------------------------- | ---------- | ----------- |
| GET    | `/categories`                       | –          | List        |
| GET    | `/categories/:categoryId`           | –          | One         |
| GET    | `/categories/auto-complete/:search` | –          | Name search |
| POST   | `/categories`                       | Site admin | Create      |
| PATCH  | `/categories/:categoryId`           | JWT        | Update      |
| DELETE | `/categories/:categoryId`           | Site admin | Delete      |

## Locations: `/locations`

| Method | Path                     | Auth | Purpose                                                      |
| ------ | ------------------------ | ---- | ------------------------------------------------------------ |
| GET    | `/locations`             | –    | List; distance filter with `lat`, `lng`, `distance` (metres) |
| GET    | `/locations/map`         | –    | All locations as map points                                  |
| GET    | `/locations/:locationId` | –    | One                                                          |
| POST   | `/locations`             | JWT  | Create (or return existing by `apiId`)                       |
| PATCH  | `/locations/:locationId` | JWT  | Update                                                       |
| DELETE | `/locations/:locationId` | JWT  | Delete                                                       |

## Tournaments: `/tournaments`

| Method | Path                                 | Auth                                       | Purpose                |
| ------ | ------------------------------------ | ------------------------------------------ | ---------------------- |
| GET    | `/tournaments`                       | –                                          | List and filter        |
| GET    | `/tournaments/:tournamentId`         | –                                          | One                    |
| GET    | `/tournaments/auto-complete/:search` | –                                          | Name search            |
| GET    | `/tournaments/managed`               | JWT                                        | Tournaments you manage |
| POST   | `/tournaments`                       | JWT (+ group admin if `affiliatedGroupId`) | Create                 |
| PATCH  | `/tournaments/:tournamentId`         | tournament manager                         | Update                 |
| DELETE | `/tournaments/:tournamentId`         | tournament manager                         | Delete                 |

## Stages: `/stages`

| Method | Path                             | Auth               | Purpose                                                                   |
| ------ | -------------------------------- | ------------------ | ------------------------------------------------------------------------- |
| GET    | `/stages`                        | –                  | List and filter                                                           |
| GET    | `/stages/:stageId`               | –                  | One (`responseType=withChallongeTournament` adds the Challonge data)      |
| GET    | `/stages/managed`                | JWT                | Stages you manage                                                         |
| POST   | `/stages/:tournamentId`          | tournament manager | Create (also creates rosters for solo entries and a Challonge tournament) |
| PATCH  | `/stages/:tournamentId/:stageId` | stage manager      | Update                                                                    |
| DELETE | `/stages/:tournamentId/:stageId` | stage manager      | Delete                                                                    |
| PATCH  | `/stages/start/:stageId`         | stage manager      | Start the stage                                                           |

## Participations: `/participations`

| Method | Path                                                       | Auth                                                           | Purpose                 |
| ------ | ---------------------------------------------------------- | -------------------------------------------------------------- | ----------------------- |
| GET    | `/participations`                                          | –                                                              | List and filter         |
| GET    | `/participations/:participationId`                         | –                                                              | One                     |
| GET    | `/participations/managed-for-player/:tournamentId`         | JWT                                                            | Entries you can act for |
| POST   | `/participations/apply-solo/:tournamentId`                 | JWT + entry checks                                             | Enter yourself          |
| POST   | `/participations/apply-group/:tournamentId/:groupId`       | group admin + entry checks                                     | Enter your group        |
| POST   | `/participations/admin/apply-solo/:tournamentId/:userId`   | tournament manager + entry checks                              | Enter a (fake) user     |
| POST   | `/participations/admin/apply-group/:tournamentId/:groupId` | tournament manager + entry checks                              | Enter a (fake) group    |
| DELETE | `/participations/:participationId`                         | see [Participation](/docs/features/participation/#withdrawing) | Withdraw                |

## Rosters: `/roster`

| Method | Path                                     | Auth          | Purpose                         |
| ------ | ---------------------------------------- | ------------- | ------------------------------- |
| GET    | `/roster`                                | –             | List and filter                 |
| GET    | `/roster/:id`                            | –             | One                             |
| GET    | `/roster/stage/:stageId`                 | –             | Rosters in a stage              |
| GET    | `/roster/participation/:participationId` | –             | Rosters of an entry             |
| GET    | `/roster/user/:userId`                   | –             | Rosters a user plays in         |
| GET    | `/roster/group/:groupId`                 | –             | Rosters of a group              |
| GET    | `/roster/managed-by-user/:stageId`       | JWT           | Rosters you can edit in a stage |
| POST   | `/roster/:participationId/:stageId`      | roster checks | Create (first stage only)       |
| PATCH  | `/roster/:id`                            | roster checks | Replace members                 |

## Matches: `/matches`

| Method | Path                                  | Auth           | Purpose                           |
| ------ | ------------------------------------- | -------------- | --------------------------------- |
| GET    | `/matches/results`                    | –              | Matchups with results, filterable |
| GET    | `/matches/matchup/:matchupId/results` | –              | One matchup with scores           |
| GET    | `/matches/user/:userId/results`       | –              | A user's matchups                 |
| GET    | `/matches/roster/:rosterId/results`   | –              | A roster's matchups               |
| GET    | `/matches/group/:groupId/results`     | –              | A group's matchups                |
| GET    | `/matches/managed`                    | JWT            | Matchups you can score            |
| POST   | `/matches/:matchupId/score`           | matchup editor | Record result                     |
| PUT    | `/matches/:matchupId/update-score`    | matchup editor | Replace result                    |
| DELETE | `/matches/:matchupId/delete-score`    | matchup editor | Remove result                     |

## Quizzes: `/quiz` and `/quiz-attempt`

| Method | Path                                           | Auth                            | Purpose                           |
| ------ | ---------------------------------------------- | ------------------------------- | --------------------------------- |
| GET    | `/quiz`                                        | –                               | List and filter                   |
| GET    | `/quiz/:quizId`                                | –                               | One (without answers)             |
| GET    | `/quiz/auto-complete/:search`                  | –                               | Name search                       |
| GET    | `/quiz/authored`                               | JWT                             | Your quizzes                      |
| GET    | `/quiz/detailed/:quizId`                       | quiz author                     | With correct answers              |
| POST   | `/quiz`                                        | JWT                             | Create with questions and options |
| PUT    | `/quiz/:quizId`                                | quiz author                     | Replace                           |
| DELETE | `/quiz/:quizId`                                | quiz author                     | Delete                            |
| GET    | `/quiz-attempt`                                | JWT                             | List attempts                     |
| GET    | `/quiz-attempt/my-attempts`                    | JWT                             | Your attempts                     |
| GET    | `/quiz-attempt/:attemptId`                     | attempt owner                   | One attempt                       |
| POST   | `/quiz-attempt/:quizId`                        | JWT + retake rule               | Start or resume                   |
| PUT    | `/quiz-attempt/:attemptId/submit`              | attempt owner                   | Submit and score                  |
| POST   | `/quiz-attempt/answers/:attemptId/:questionId` | attempt owner                   | Answer                            |
| PUT    | `/quiz-attempt/answers/:attemptId/:answerId`   | attempt owner, answer not final | Change answer                     |
| GET    | `/quiz-attempt/leaderboard/:quizId`            | –                               | Ranking                           |

## LFG and LFP

| Method | Path                | Auth           | Purpose                                              |
| ------ | ------------------- | -------------- | ---------------------------------------------------- |
| GET    | `/lfg/me`           | JWT            | Your LFG posts                                       |
| POST   | `/lfg`              | JWT            | Create                                               |
| PATCH  | `/lfg/:id`          | JWT (own post) | Update                                               |
| DELETE | `/lfg/:id`          | JWT (own post) | Delete                                               |
| GET    | `/lfg/:groupId`     | group admin    | Players matching the group                           |
| GET    | `/lfp/groups`       | JWT            | Groups matching you (`lat`, `lng`, `distance` in km) |
| POST   | `/lfp/:groupId`     | group admin    | Create                                               |
| GET    | `/lfp/:groupId`     | group member   | The group's posts                                    |
| PATCH  | `/lfp/:groupId/:id` | group admin    | Update                                               |
| DELETE | `/lfp/:groupId/:id` | group admin    | Delete                                               |

## Notifications: `/notifications`

| Method | Path                           | Auth      | Purpose              |
| ------ | ------------------------------ | --------- | -------------------- |
| GET    | `/notifications`               | JWT       | Your notifications   |
| GET    | `/notifications/stream?token=` | SSE token | Live event stream    |
| POST   | `/notifications/token`         | JWT       | Rotate the SSE token |
| PATCH  | `/notifications/:id/read`      | JWT       | Mark as read         |
| PATCH  | `/notifications/read/all`      | JWT       | Mark all as read     |
| PATCH  | `/notifications/read/bulk`     | JWT       | Mark several as read |
| DELETE | `/notifications/:id`           | JWT       | Delete               |

## Misc

| Method | Path       | Auth | Purpose                       |
| ------ | ---------- | ---- | ----------------------------- |
| GET    | `/`        | –    | Health check (`Hello World!`) |
| GET    | `/swagger` | –    | Swagger UI                    |
