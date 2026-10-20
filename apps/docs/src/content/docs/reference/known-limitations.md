---
title: Known limitations
description: Behaviour that is still incomplete or worth knowing about, and what has already been fixed.
---

These were found by reading the code while writing this documentation. Most have since been fixed; what remains is
listed first, each with the place to look.

## Still open

### Behaviour

- **Ownership cannot be transferred**: a group's creator is its owner, and `PATCH /group-membership/...` refuses to
  assign `owner`, so there is no way to hand a group over except through the database.
- **Corrections do not re-rate**: ratings change when a result is first recorded. Updating or deleting the result
  afterwards leaves ratings as they are (`CareerService.applyMatchResult`).
- **Brackets run by the API are single elimination only**, whatever the stage type. Other formats need Challonge.
- **The bracket page needs Challonge**: `/stage/[id]/bracket` embeds Challonge's widget, so stages run by the API show
  "no bracket data" there; their matchups are on the stage page.
- **Quiz timing per question**: the API enforces the quiz's dates and total time limit, but per-question time limits,
  randomisation and test mode are only applied by the web client.
- **Point conversion rules**: tournaments and stages accept `conversionRuleId`, but no logic applies the rules.

### Authorisation

- **Fake users and groups**: any signed-in user can create them (`POST /users/fake`, `POST /groups/fake`). Tournament
  managers need them for brackets, and fake entries are refused by ranked tournaments, but the endpoints are not
  limited to managers.
- **Withdrawing entries**: `CanCancelParticipationGuard` has no site-admin exception.

### Operational

- **Live notifications are per instance**: SSE fan-out uses the in-process event emitter. With several API replicas,
  a user connected to one replica does not receive live events created on another (they are still stored).
- **SSE tokens never expire**: the stream token is a long-lived UUID in the query string; rotate it with
  `POST /notifications/token`.
- **CORS is open by default**: without `CORS_ORIGIN`, every origin may call the API. Set it in production.
- **S3 is configured but unused**: `BlobModule` is wired up and the bucket is created, but no endpoint uploads files
  yet. Images (logos, avatars, covers) are stored as URLs.
- **Random seed data**: the seed creates group requirements with `Math.random`, so seeded groups differ between runs.

### Not built yet

The schema already holds tables for subscriptions, achievements, chat, direct messages, bets, sponsors, promotions,
reports, posts and likes, reviews and competitive programming problems and submissions, with no API on top of them.
`apps/admin` is a placeholder.

## Fixed

| Was                                                                              | Now                                                         |
| -------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Group creators became admins, so only site admins could delete their groups      | Creators become owners                                      |
| Join-request notifications skipped the owner                                     | The owner and every admin are notified                      |
| Unverified users got tokens, then `401` everywhere                               | Login returns `403` and says to confirm the email           |
| Google sign-ups stayed unverified and failed                                     | Google accounts start verified                              |
| Stages could not start without real Challonge credentials                        | The API runs a single-elimination bracket itself            |
| Marking a notification read marked it for every recipient                        | Read state and removal are per recipient                    |
| Any signed-in user could mark or delete any notification                         | Only recipients, others get `404`                           |
| Any group admin could edit or delete another group's LFP post                    | The post must belong to the group in the URL                |
| Any signed-in user could edit categories, and edit or delete locations           | Site admins only                                            |
| Site admins could not fix results or quizzes they did not own                    | They pass `CanEditMatchupGuard` and `CanEditQuizGuard`      |
| Roster size, substitute and start-time limits were never checked                 | Checked on roster create and update                         |
| Results never changed ratings                                                    | Ranked results update ELO                                   |
| Group ELO requirements were not used                                             | They filter LFG search and are checked when joining         |
| Group requirements were not checked on joining                                   | Checked on join requests and invitation acceptance          |
| Quiz dates and time limits were only enforced by the client                      | The API refuses attempts and answers outside them           |
| Non-retakeable quizzes could be retaken after submitting, and not resumed before | Only a submitted attempt counts                             |
| A group could enter the same tournament repeatedly                               | One entry per group unless `isMultipleTeamsPerGroupAllowed` |
| `isMultipleTeamsPerGroupAllowed` was stored but ignored                          | It allows a group to enter several teams                    |
| LFP distance filter used a bitwise `&` and was often skipped                     | Fixed                                                       |
| Bracket seeding stopped at the first 12 rosters (default page size)              | All rosters are seeded                                      |
| `useGetBracket` called a removed route                                           | Removed                                                     |
| Final-answer guard said "Answer is not final"                                    | Message corrected                                           |
| CORS could not be restricted                                                     | `CORS_ORIGIN`                                               |
| The smoke script hard-coded the seeded password                                  | `SMOKE_PASSWORD` overrides it                               |
