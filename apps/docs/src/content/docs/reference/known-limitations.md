---
title: Known limitations
description: Behaviour that is still incomplete or worth knowing about, and what has already been fixed.
---

These were found by reading the code while writing this documentation. Most have since been fixed; what remains is
listed first, each with the place to look.

## Still open

### Behaviour

- **Formats without their own bracket logic**: compass, triple elimination, quiz and evaluated stages run by the API
  are played as single elimination.
- **Conversion strategies**: `tie_breaker` and `qualification_with_lcq` are refused. Stages run on Challonge are not
  tracked to their end, so their rules need `POST /conversion-rules/:ruleId/apply`.
- **Results of a finished stage are frozen**, because its conversion rules have already run. A mistake in the final
  result needs a fix in the database.
- **Taking a quiz**: the web app has no screen for it yet; attempts work through the API.
- **Uploads are not in the web forms yet**: the API stores images (`POST /files/:directory`), but the web forms still
  take image URLs.

### Operational

- **The `sseToken` column is unused** since stream tokens became short-lived JWTs; it can be dropped in a later
  migration.

### Not built yet

`apps/admin` is a placeholder. `subcategory`, `roster_round`, `user_notification_settings` and
`user_to_notification_tokens` have no API on top of them.

## Fixed

| Was                                                                                | Now                                                                 |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Group creators became admins, so only site admins could delete their groups        | Creators become owners                                              |
| Join-request notifications skipped the owner                                       | The owner and every admin are notified                              |
| Unverified users got tokens, then `401` everywhere                                 | Login returns `403` and says to confirm the email                   |
| Google sign-ups stayed unverified and failed                                       | Google accounts start verified                                      |
| Stages could not start without real Challonge credentials                          | The API runs a single-elimination bracket itself                    |
| Marking a notification read marked it for every recipient                          | Read state and removal are per recipient                            |
| Any signed-in user could mark or delete any notification                           | Only recipients, others get `404`                                   |
| Any group admin could edit or delete another group's LFP post                      | The post must belong to the group in the URL                        |
| Any signed-in user could edit categories, and edit or delete locations             | Site admins only                                                    |
| Site admins could not fix results or quizzes they did not own                      | They pass `CanEditMatchupGuard` and `CanEditQuizGuard`              |
| Roster size, substitute and start-time limits were never checked                   | Checked on roster create and update                                 |
| Results never changed ratings                                                      | Ranked results update ELO                                           |
| Group ELO requirements were not used                                               | They filter LFG search and are checked when joining                 |
| Group requirements were not checked on joining                                     | Checked on join requests and invitation acceptance                  |
| Quiz dates and time limits were only enforced by the client                        | The API refuses attempts and answers outside them                   |
| Non-retakeable quizzes could be retaken after submitting, and not resumed before   | Only a submitted attempt counts                                     |
| A group could enter the same tournament repeatedly                                 | One entry per group unless `isMultipleTeamsPerGroupAllowed`         |
| `isMultipleTeamsPerGroupAllowed` was stored but ignored                            | It allows a group to enter several teams                            |
| LFP distance filter used a bitwise `&` and was often skipped                       | Fixed                                                               |
| Bracket seeding stopped at the first 12 rosters (default page size)                | All rosters are seeded                                              |
| `useGetBracket` called a removed route                                             | Removed                                                             |
| Final-answer guard said "Answer is not final"                                      | Message corrected                                                   |
| CORS could not be restricted                                                       | `CORS_ORIGIN`                                                       |
| The smoke script hard-coded the seeded password                                    | `SMOKE_PASSWORD` overrides it                                       |
| Group ownership could not be handed over                                           | `POST /group-membership/:groupId/transfer-ownership/:userId`        |
| Corrected results kept their old rating changes                                    | Corrections are re-rated and deletions reverted (`rating_change`)   |
| Any signed-in user could create fake players and groups                            | Tournament organisers and site admins only                          |
| Site admins could not withdraw entries                                             | They can                                                            |
| Live notifications only reached streams on the same API instance                   | Delivered through Postgres `LISTEN/NOTIFY`                          |
| Stream tokens never expired                                                        | 5-minute tokens with their own secret, refreshed on reconnect       |
| CORS allowed every origin unless configured                                        | Production defaults to `FRONTEND_URL`                               |
| The bracket page needed Challonge                                                  | Stages run by the API are drawn from their matchups                 |
| Brackets run by the API were single elimination only                               | Knockout, double elimination, round robin and Swiss, with standings |
| Point conversion rules were stored but never applied                               | `/conversion-rules`, applied when their source finishes             |
| Per-question quiz time limits, order and test mode were left to the client         | The API serves one question at a time and enforces its time limit   |
| Anyone could read a quiz's correct answers (`GET /quiz/:id?responseType=EXTENDED`) | Refused; only the author's detailed view has them                   |
| Answers could name another quiz's question or another question's option            | Refused                                                             |
| Quiz booleans sent as JSON (`isTest`, `isCorrect`, ...) were read as false         | JSON booleans and `"true"`/`"false"` strings are accepted           |
| Quiz questions lost their type and image, and ones without options failed (`500`)  | Stored as sent                                                      |
| `responseType=FOR_ATTEMPT` failed with `500`                                       | Fixed, without `isCorrect`                                          |
| `passingRate` was always 100 or empty                                              | Share of submitted attempts at or above `passingScore` percent      |
| New stages had no status (the default was lost in migration 0016)                  | `upcoming` again; existing stages without one were backfilled       |
| `GET /matches/results` skipped matchups on pages after the first                   | Fixed offset                                                        |
| The bracket page loaded only 100 matchups                                          | It pages through all of them                                        |
| No endpoint uploaded files to S3                                                   | `POST /files/:directory`, served from `GET /files/...`              |
| Tables for features that were never built                                          | Dropped in migration `0045`                                         |
