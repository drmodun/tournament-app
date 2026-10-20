---
title: Known limitations
description: Behaviour in the current code that is surprising, incomplete or worth fixing, found while writing these docs.
---

These were found by reading the code while writing this documentation (as of commit `05b42ee`). Each entry names the
place to look. None of them is fixed by the documentation change itself.

## Behaviour that surprises users

### Group creators are admins, not owners

`GroupDrizzleRepository.createEntityWithUser` (`apps/api/src/group/group.repository.ts`) inserts the creator with
role `admin`. `DELETE /groups/:groupId` requires `owner`, and `PATCH /group-membership/...` refuses to assign
`owner`. As a result, only site admins can delete a group created through the API; only seeded groups have owners.

### Unverified users get tokens, then 401s

`POST /auth/login` does not check `isEmailVerified`, but the JWT strategy's user lookup only returns verified users.
An unverified user can log in, then every authenticated call fails with `401` and no hint about the cause.

### Starting a stage needs real Challonge credentials

`StageService.startStage` refuses stages without a `challongeTournamentId`, and stages only get one when the
Challonge API call at creation succeeds. With the mock credentials in `.env`, no stage can be started, so locally the
only matches are the seeded ones.

### Join-request notifications skip the owner

`GroupMembershipService.getAllAdmins` filters on role `admin` only, so a group's `owner` is not notified about new
join requests.

### Marking a notification read affects every recipient

`PATCH /notifications/:id/read` and `/read/bulk` update `notification_to_user` by notification id only. For a
notification sent to several users (for example a stage start), one user marking it read marks it read for all.

## Rules that exist but are not enforced

- **Roster size and timing**: `CanRosterBeUsedGuard.checkIfMembersAreEligibleForStage`
  (`apps/api/src/roster/guards/roster-check.guard.ts`) checks `minPlayersPerTeam`, `maxPlayersPerTeam`,
  `maxSubstitutes` and that the stage has not started, but nothing calls it.
- **ELO updates**: `EloHelper` (`apps/api/src/base/static/eloHelper.ts`) implements the rating formula, but match
  results never call it, so careers do not change.
- **Group ELO requirements**: stored and returned with LFP posts, but not used to filter LFG players.
- **Group requirements on joining**: age, country and ELO requirements are not checked when inviting or accepting
  members.
- **Quiz timing**: `timeLimitTotal`, per-question `timeLimit`, `startDate` and `endDate` are enforced only by the web
  client.
- **Multiple teams per group**: `isMultipleTeamsPerGroupAllowed` is stored, but rosters are limited to one per
  participation per stage regardless.
- **Point conversion rules**: tournaments and stages accept `conversionRuleId`, but no logic applies the rules.

## Authorisation gaps

- **LFP edit and delete** (`PATCH`/`DELETE /lfp/:groupId/:id`): the guard checks that the caller administers
  `:groupId`, but the service updates or deletes by `:id` alone, so an admin of any group can change another group's
  post by passing their own group id.
- **Notifications** (`PATCH /notifications/:id/read`, `DELETE /notifications/:id`): any signed-in user can act on any
  notification id.
- **Categories**: `PATCH /categories/:id` only requires a signed-in user, while create and delete require a site
  admin.
- **Locations**: update and delete only require a signed-in user, and locations are shared between tournaments,
  stages and groups.
- **Fake users and groups**: any signed-in user can create them (`POST /users/fake`, `POST /groups/fake`).
- **Site admins and matches/quizzes**: `CanEditMatchupGuard` and `CanEditQuizGuard` have no admin exception, so site
  admins cannot fix results or quizzes they do not own.

## Bugs

- **LFP distance filter**: `LFPDrizzleRepository.getGroups` (`apps/api/src/lfp/lfp.repository.ts`) tests
  `distanceInKm & lat & lng` with bitwise AND. For non-integer coordinates the result is often `0`, so the distance
  filter is silently skipped. It should be `&&`.
- **Bracket hook points at a removed route**: `useGetBracket` (`apps/web/src/api/client/hooks/bracket`) calls
  `GET /matches/stage/:stageId/bracket`, which no longer exists. Nothing uses the hook; the bracket page embeds
  Challonge's iframe instead.
- **Misleading guard message**: `CanSubmitAnswerGuard.checkForPutAttempt` rejects final answers with the message
  "Answer is not final, you cannot change it".

## Operational

- **Live notifications are per instance**: SSE fan-out uses the in-process event emitter. With several API replicas,
  a user connected to one replica does not receive live events created on another (they are still stored).
- **SSE tokens never expire**: the stream token is a long-lived UUID in the query string; rotate it with
  `POST /notifications/token`.
- **CORS is open**: `app.enableCors()` allows every origin.
- **S3 is configured but unused**: `BlobModule` is wired up and the bucket is created, but no endpoint uploads files
  yet. Images (logos, avatars, covers) are stored as URLs.
- **Hard-coded credential in the smoke script**: `scripts/smoke-api.sh` contains the seeded admin password
  (`Password123!`). It only matches seeded development data, but it should not be reused anywhere real.

## Not built yet

The schema already holds tables for subscriptions, achievements, chat, direct messages, bets, sponsors, promotions,
reports, posts and likes, reviews and competitive programming problems and submissions, with no API on top of them.
Brackets beyond single elimination depend on Challonge's support for the mapped type. `apps/admin` is a placeholder.
