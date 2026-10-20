---
title: Database and domain model
description: The Postgres schema, how the main entities relate, migrations and seeding.
---

The schema is defined in TypeScript in `apps/api/src/db/schema.ts` with Drizzle ORM. Migrations generated from it live
in `apps/api/src/db/drizzle`. The database is Postgres 16 with the PostGIS extension (image
`postgis/postgis:16-3.4-alpine`); `docker/db/init.sql` runs on first start.

Postgres enums are generated from the TypeScript enums in `@tournament-app/types` with `exportEnumValues`, so the
database and both apps always agree on allowed values. See [Enums](/docs/reference/enums/).

## Core entities

```text
user ─┬─< group_user >── group ──< group_requirements ──< elo_requirement
      │                    │
      │                    ├──< looking_for_players >── category_lfp >── category
      │                    ├──< group_invite / group_join_request (per user)
      │                    └──< group_user_block_list (users the group blocked)
      │
      ├──< interests >── category ──< category_career (user ELO per category)
      ├──< looking_for_group ──< category_lfg >── category
      ├──< follower (user follows user)
      └──< user_group_block_list (groups the user blocked)

category ──< tournament ──< stage ──< roster ──< user_roster >── user
                 │            │          │
                 │            │          └──< roster_matchup >── matchup ──< score ──< score_to_roster
                 │            └──< matchup, stage_round
                 └──< participation (userId XOR groupId) ──< roster

user ──< quiz ──< quiz_question ──< quiz_option
            └──< quiz_attempt ──< quiz_answer

notification ──< notification_to_user >── user
location (PostGIS point) ◀── tournament.location_id, stage.location_id, group.location_id
```

### Users

`user` holds profile fields, the bcrypt `password`, `role` (`user` / `admin`), `isFake`, `isEmailVerified`,
`emailConfirmationToken`, `passwordResetToken` with its expiry, and `sseToken` (unused since stream tokens became
short-lived JWTs; formerly a UUID for the notification
stream). `dateOfBirth` and `country` feed group requirements. Location is deliberately not stored for users (a code
comment cites GDPR); distance searches take coordinates as query parameters instead.

### Groups

`group` has `type` (`public`, `private`, `fake`) and `focus` (`participation`, `organization`, `hybrid`).
Membership is `group_user` with a composite key `(user_id, group_id)` and a `role`. Invitations and join requests are
also keyed by `(group_id, user_id)`, so there can be at most one pending of each per pair. Invitations can reference
the LFG post that prompted them, and join requests the LFP post.

### Tournaments and stages

`tournament` references a `category` (required), its `creator` (required), an optional `affiliated_group`, an
optional `location`, and optionally a `parent_tournament` (for leagues and seasons). Settings include `isPublic`,
`isRanked`, `isFakePlayersAllowed`, `isMultipleTeamsPerGroupAllowed`, `maxParticipants` (default 32),
`minimumMMR` / `maximumMMR` (defaults 0 and 999999), `tournamentTeamType` (`solo`, `team`, `mixed`) and
`tournamentLocation` (`online`, `offline`, `hybrid`).

`stage` belongs to a tournament and has a `stageType`, a `stageStatus` (`upcoming`, `ongoing`, `finished`,
`cancelled`), dates, roster rules (`minPlayersPerTeam`, `maxPlayersPerTeam`, `maxSubstitutes`, `maxChanges`) and a
`challongeTournamentId`. Stage order is defined by `startDate`: the earliest stage is the "first stage".

### Participation, rosters and matches

`participation` links a tournament to either a user (solo) or a group (team). A `roster` is that participation's
line-up in one stage; `user_roster` lists its players with `isSubstitute`. A `matchup` belongs to a stage and a round
and has `isFinished`, plus a `bracket` (`winners`, `losers`, `grand_final`) in double-elimination stages the API
runs. `roster_matchup` connects rosters to matchups with `isWinner`. Each played round of a matchup is
a `score` row with per-roster points in `score_to_roster`. Challonge ids are stored on stage, roster, round and
matchup to keep the mirror in sync.

### Ratings

`category_career` holds each user's rating per category. `rating_change` records how much each rating moved for each
matchup, so a corrected or deleted result can be undone.

### Quizzes

`quiz` has scheduling (`startDate`, `endDate`, `timeLimitTotal` in seconds) and behaviour flags (`isTest`,
`isImmediateFeedback`, `isAnonymousAllowed`, `isRandomizedQuestions`, `isRetakeable`, `passingScore` as a
percentage). It can be attached to a stage or a matchup. Questions carry `points` (default 5), a `type`, an optional
`timeLimit`, and either options (`quiz_option.isCorrect`) or `correctAnswers` as a comma-separated list. A
`quiz_attempt` stores its `questionOrder` (shuffled for randomised quizzes), the `currentQuestion` and when it was
shown (`questionStartedAt`), for quizzes shown one question at a time.

### Notifications

`notification` stores type, message, link and image; `notification_to_user` fans it out per recipient with a read
flag.

### Point conversion

`conversion_rule` holds a rule's `type`, `strategy`, `source` and `destination` ids, its range and point settings,
`appliedAt` once it has run, and `createdBy`. `roster.points` holds points carried in by a rule and `roster.seed` a
seed it set; `participation.points` holds tournament points. See
[Point conversion rules](/docs/features/matches/#point-conversion-rules).

## Tables without features yet

These tables exist in the schema but no module reads or writes them: `group_follower` (read by the group followers
endpoint, but nothing writes it), `subcategory`, `roster_round`, `user_notification_settings` and
`user_to_notification_tokens`.

Migration `0045` dropped the tables of features that were never built: subscriptions, achievements, chat rooms and
direct messages, bets, sponsors, promotions, reports, tournament and result posts with their images, likes,
reviews, and the competitive programming tables (problems, test clusters, testcases, submissions).

## Indexes

B-tree indexes on `user.username`, `tournament.name`, `group.name`, `category.name` and `tags.name` back the
autocomplete and search endpoints. `location.coordinates` has a GiST index for `ST_DWithin` distance queries.

## Migrations

```bash
cd apps/api
yarn generate   # diff schema.ts against the last snapshot and write a new SQL migration
yarn migrate    # apply pending migrations to DATABASE_URL
```

In Docker, the one-shot `migrate` service runs `yarn migrate` before the API starts, and the API waits for it to
complete successfully.

## Seeding

`yarn seed` runs `src/db/seed.ts`, which calls `seedDefinition.ts`. It first tears every table down
(`seed/teardown.ts`), then inserts deterministic data in dependency order: categories, users (including
`admin@example.com` / `Password123!`), groups with owners and members, tournaments and stages, participations and
rosters, single-elimination brackets built with `BracketGenerator`, quizzes and LFG posts. Counts are set in
`seed/seedCount.ts`; `seed/deterministic.ts` provides a seeded random generator so runs are repeatable.
