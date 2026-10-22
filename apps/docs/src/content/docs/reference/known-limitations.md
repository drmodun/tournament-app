---
title: Known limitations
description: Behaviour that is still incomplete or worth knowing about, and what has already been fixed.
---

These were found by reading the code while writing this documentation. Most have since been fixed; what remains is
listed first, each with the place to look.

## Still open

### Behaviour

- **Formats without their own bracket logic**: quiz and evaluated stages run by the API are played as single
  elimination.
- **Taking a quiz**: the web app has no screen for it yet; attempts work through the API.
- **Challonge corrections are untested against Challonge itself**: correcting or deleting a result reopens the match
  there first. The calls follow Challonge's v2.1 reference and are tested against a mock, not a live tournament.

### Not built yet

`apps/admin` is a placeholder. Push tokens and the email and push notification settings are stored, but nothing
sends push notifications, and notifications are not sent by email.

## Fixed

| Was                                                                                     | Now                                                                       |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Group creators became admins, so only site admins could delete their groups             | Creators become owners                                                    |
| Join-request notifications skipped the owner                                            | The owner and every admin are notified                                    |
| Unverified users got tokens, then `401` everywhere                                      | Login returns `403` and says to confirm the email                         |
| Google sign-ups stayed unverified and failed                                            | Google accounts start verified                                            |
| Stages could not start without real Challonge credentials                               | The API runs a single-elimination bracket itself                          |
| Marking a notification read marked it for every recipient                               | Read state and removal are per recipient                                  |
| Any signed-in user could mark or delete any notification                                | Only recipients, others get `404`                                         |
| Any group admin could edit or delete another group's LFP post                           | The post must belong to the group in the URL                              |
| Any signed-in user could edit categories, and edit or delete locations                  | Site admins only                                                          |
| Site admins could not fix results or quizzes they did not own                           | They pass `CanEditMatchupGuard` and `CanEditQuizGuard`                    |
| Roster size, substitute and start-time limits were never checked                        | Checked on roster create and update                                       |
| Results never changed ratings                                                           | Ranked results update ELO                                                 |
| Group ELO requirements were not used                                                    | They filter LFG search and are checked when joining                       |
| Group requirements were not checked on joining                                          | Checked on join requests and invitation acceptance                        |
| Quiz dates and time limits were only enforced by the client                             | The API refuses attempts and answers outside them                         |
| Non-retakeable quizzes could be retaken after submitting, and not resumed before        | Only a submitted attempt counts                                           |
| A group could enter the same tournament repeatedly                                      | One entry per group unless `isMultipleTeamsPerGroupAllowed`               |
| `isMultipleTeamsPerGroupAllowed` was stored but ignored                                 | It allows a group to enter several teams                                  |
| LFP distance filter used a bitwise `&` and was often skipped                            | Fixed                                                                     |
| Bracket seeding stopped at the first 12 rosters (default page size)                     | All rosters are seeded                                                    |
| `useGetBracket` called a removed route                                                  | Removed                                                                   |
| Final-answer guard said "Answer is not final"                                           | Message corrected                                                         |
| CORS could not be restricted                                                            | `CORS_ORIGIN`                                                             |
| The smoke script hard-coded the seeded password                                         | `SMOKE_PASSWORD` overrides it                                             |
| Group ownership could not be handed over                                                | `POST /group-membership/:groupId/transfer-ownership/:userId`              |
| Corrected results kept their old rating changes                                         | Corrections are re-rated and deletions reverted (`rating_change`)         |
| Any signed-in user could create fake players and groups                                 | Tournament organisers and site admins only                                |
| Site admins could not withdraw entries                                                  | They can                                                                  |
| Live notifications only reached streams on the same API instance                        | Delivered through Postgres `LISTEN/NOTIFY`                                |
| Stream tokens never expired                                                             | 5-minute tokens with their own secret, refreshed on reconnect             |
| CORS allowed every origin unless configured                                             | Production defaults to `FRONTEND_URL`                                     |
| The bracket page needed Challonge                                                       | Stages run by the API are drawn from their matchups                       |
| Brackets run by the API were single elimination only                                    | Knockout, double elimination, round robin and Swiss, with standings       |
| Compass and triple-elimination stages ran as single elimination                         | Both have their own brackets and standings                                |
| Stages run on Challonge needed their rules applied by hand                              | They finish when Challonge reports every match complete                   |
| The web forms sent images as base64 data URLs                                           | They upload to `POST /files/:directory` and send the returned URL         |
| Site admins got a `500` creating or updating a roster                                   | The roster guard still loads the stage for admins                         |
| Byes counted as matches played, so the K-factor dropped too early                       | Only matches against an opponent count                                    |
| `PATCH /roster/:id` always failed with `400` for the web app's request                  | The guards read the roster from the route; admins skip the change limit   |
| Stages could not be created with `maxChanges` or `maxSubstitutes`                       | Both are accepted when creating a stage                                   |
| `PUT /quiz/:id` deleted every question when the body had none, and answers with them    | Questions are kept unless sent, and cannot be replaced after an attempt   |
| `endDate` of a quiz could not be set                                                    | Accepted when creating and updating a quiz                                |
| `GET /quiz?responseType=EXTENDED` answered `501`                                        | `400`, as documented                                                      |
| Results of a finished Challonge stage could still change after its rules had run        | Frozen, like stages run by the API                                        |
| The bracket page showed Challonge's widget for any stage with a Challonge id            | The standings say whether the stage `runsOnChallonge`                     |
| A Challonge stage could stay unfinished when its grand-final reset was never played     | Finishes when only matches missing a player are left                      |
| Quiz `tags` were accepted and dropped                                                   | Stored on create, replaced on update                                      |
| An edit and a new attempt at the same moment could delete the attempt's answers         | The quiz is locked while either is saved                                  |
| Bracket order in double elimination moved on a draw as if it were a win                 | Only wins and byes move it                                                |
| A failed image upload showed nothing, and a retry stored the image again                | A message says why, and a retry reuses the stored image                   |
| Point conversion rules were stored but never applied                                    | `/conversion-rules`, applied when their source finishes                   |
| Per-question quiz time limits, order and test mode were left to the client              | The API serves one question at a time and enforces its time limit         |
| Anyone could read a quiz's correct answers (`GET /quiz/:id?responseType=EXTENDED`)      | Refused; only the author's detailed view has them                         |
| Answers could name another quiz's question or another question's option                 | Refused                                                                   |
| Quiz booleans sent as JSON (`isTest`, `isCorrect`, ...) were read as false              | JSON booleans and `"true"`/`"false"` strings are accepted                 |
| Quiz questions lost their type and image, and ones without options failed (`500`)       | Stored as sent                                                            |
| `responseType=FOR_ATTEMPT` failed with `500`                                            | Fixed, without `isCorrect`                                                |
| `passingRate` was always 100 or empty                                                   | Share of submitted attempts at or above `passingScore` percent            |
| New stages had no status (the default was lost in migration 0016)                       | `upcoming` again; existing stages without one were backfilled             |
| `GET /matches/results` skipped matchups on pages after the first                        | Fixed offset                                                              |
| The bracket page loaded only 100 matchups                                               | It pages through all of them                                              |
| No endpoint uploaded files to S3                                                        | `POST /files/:directory`, served from `GET /files/...`                    |
| Tables for features that were never built                                               | Dropped in migration `0045`                                               |
| The unused `sseToken` column stayed after stream tokens became JWTs                     | Dropped in migration `0049`                                               |
| With Challonge on, compass and triple elimination ran there as double elimination       | Those stages always run in the API                                        |
| `tie_breaker` and `qualification_with_lcq` conversion strategies were refused           | Both are applied (`lastChanceDestination` for the last-chance stage)      |
| Results of a finished stage could only be fixed in the database                         | `POST /stages/:stageId/reopen` undoes its rules and reopens it            |
| `PATCH` on a stage could set any status, skipping the draw or its conversion rules      | Finishing applies the rules; starting and reopening have their own routes |
| The register form had no profile picture, because uploads need a signed-in user         | `POST /users` takes the picture as a multipart form                       |
| A sign-up could set `isFake`                                                            | Ignored; fake users come from `POST /users/fake`                          |
| Rules that add entries added nobody in solo tournaments (everyone already had a roster) | Stages they feed are left to them                                         |
| A player entering after the stages existed got rosters with nobody in them              | They are in their rosters                                                 |
| Corrected Challonge results were sent for matches Challonge had already completed       | The match is reopened there first                                         |
| Challonge results could change after the next round was brought in from them            | Frozen then, like the API's own brackets                                  |
| An image picked in a form was dropped unless its scale or rotation was changed          | The form holds the picture from when it loads                             |
| `subcategory` had no API                                                                | `/subcategories`, and tournaments can name one (`subcategoryId`)          |
| `GET /tournaments?categoryId=` failed instead of filtering                              | Filters by category                                                       |
| `roster_round` was never written                                                        | Derived from results, read with `GET /roster-rounds`                      |
| `user_notification_settings` had no API                                                 | `/notifications/settings`; turning in-app off stops in-app notifications  |
| `user_to_notification_tokens` had no API                                                | `/notifications/push-tokens`, one row per device token                    |
