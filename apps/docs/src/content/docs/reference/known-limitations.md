---
title: Known limitations
description: Behaviour that is still incomplete or worth knowing about, and what has already been fixed.
---

These were found by reading the code while writing this documentation. Most have since been fixed; what remains is
listed first, each with the place to look.

## Still open

### Behaviour

- **Brackets run by the API are single elimination only**, whatever the stage type. Other formats need Challonge.
- **Quiz timing per question**: the API enforces the quiz's dates and total time limit, but per-question time limits,
  randomisation and test mode are only applied by the web client.
- **Point conversion rules**: tournaments and stages accept `conversionRuleId`, but no logic applies the rules.
- **Large brackets on the bracket page**: the page loads up to 100 matchups, enough for 64 rosters.

### Operational

- **S3 is configured but unused**: `BlobModule` is wired up and the bucket is created, but no endpoint uploads files
  yet. Images (logos, avatars, covers) are stored as URLs.
- **The `sseToken` column is unused** since stream tokens became short-lived JWTs; it can be dropped in a later
  migration.

### Not built yet

The schema already holds tables for subscriptions, achievements, chat, direct messages, bets, sponsors, promotions,
reports, posts and likes, reviews and competitive programming problems and submissions, with no API on top of them.
`apps/admin` is a placeholder.

## Fixed

| Was                                                                              | Now                                                               |
| -------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Group creators became admins, so only site admins could delete their groups      | Creators become owners                                            |
| Join-request notifications skipped the owner                                     | The owner and every admin are notified                            |
| Unverified users got tokens, then `401` everywhere                               | Login returns `403` and says to confirm the email                 |
| Google sign-ups stayed unverified and failed                                     | Google accounts start verified                                    |
| Stages could not start without real Challonge credentials                        | The API runs a single-elimination bracket itself                  |
| Marking a notification read marked it for every recipient                        | Read state and removal are per recipient                          |
| Any signed-in user could mark or delete any notification                         | Only recipients, others get `404`                                 |
| Any group admin could edit or delete another group's LFP post                    | The post must belong to the group in the URL                      |
| Any signed-in user could edit categories, and edit or delete locations           | Site admins only                                                  |
| Site admins could not fix results or quizzes they did not own                    | They pass `CanEditMatchupGuard` and `CanEditQuizGuard`            |
| Roster size, substitute and start-time limits were never checked                 | Checked on roster create and update                               |
| Results never changed ratings                                                    | Ranked results update ELO                                         |
| Group ELO requirements were not used                                             | They filter LFG search and are checked when joining               |
| Group requirements were not checked on joining                                   | Checked on join requests and invitation acceptance                |
| Quiz dates and time limits were only enforced by the client                      | The API refuses attempts and answers outside them                 |
| Non-retakeable quizzes could be retaken after submitting, and not resumed before | Only a submitted attempt counts                                   |
| A group could enter the same tournament repeatedly                               | One entry per group unless `isMultipleTeamsPerGroupAllowed`       |
| `isMultipleTeamsPerGroupAllowed` was stored but ignored                          | It allows a group to enter several teams                          |
| LFP distance filter used a bitwise `&` and was often skipped                     | Fixed                                                             |
| Bracket seeding stopped at the first 12 rosters (default page size)              | All rosters are seeded                                            |
| `useGetBracket` called a removed route                                           | Removed                                                           |
| Final-answer guard said "Answer is not final"                                    | Message corrected                                                 |
| CORS could not be restricted                                                     | `CORS_ORIGIN`                                                     |
| The smoke script hard-coded the seeded password                                  | `SMOKE_PASSWORD` overrides it                                     |
| Group ownership could not be handed over                                         | `POST /group-membership/:groupId/transfer-ownership/:userId`      |
| Corrected results kept their old rating changes                                  | Corrections are re-rated and deletions reverted (`rating_change`) |
| Any signed-in user could create fake players and groups                          | Tournament organisers and site admins only                        |
| Site admins could not withdraw entries                                           | They can                                                          |
| Live notifications only reached streams on the same API instance                 | Delivered through Postgres `LISTEN/NOTIFY`                        |
| Stream tokens never expired                                                      | 5-minute tokens with their own secret, refreshed on reconnect     |
| CORS allowed every origin unless configured                                      | Production defaults to `FRONTEND_URL`                             |
| The bracket page needed Challonge                                                | Stages run by the API are drawn from their matchups               |
