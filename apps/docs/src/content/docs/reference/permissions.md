---
title: Permissions
description: Every guard in the API, what it checks, and whether site admins bypass it.
---

Authorisation is implemented as Nest guards. Most combine `JwtAuthGuard` (a valid access token for an existing,
email-verified user) with a domain check. The table lists them all.

## Guards

| Guard                                  | Location               | Passes when                                                                                                                                                                                                                                  | Site admin bypass                                           |
| -------------------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `JwtAuthGuard`                         | `auth/guards`          | Valid access token, user exists and has confirmed their email                                                                                                                                                                                | n/a                                                         |
| `RefreshTokenGuard`                    | `auth/guards`          | Valid refresh token                                                                                                                                                                                                                          | n/a                                                         |
| `AdminAuthGuard`                       | `auth/guards`          | User role is `admin`                                                                                                                                                                                                                         | –                                                           |
| `GroupMemberGuard`                     | `group/guards`         | Caller has any role in the group                                                                                                                                                                                                             | ✓                                                           |
| `GroupAdminGuard`                      | `group/guards`         | Caller is `admin` or `owner` of the group                                                                                                                                                                                                    | ✓                                                           |
| `GroupOwnerGuard`                      | `group/guards`         | Caller is `owner` of the group                                                                                                                                                                                                               | ✓                                                           |
| `GroupNonMemberGuard`                  | `group/guards`         | Caller is **not** in the group                                                                                                                                                                                                               | ✗, and admins are treated as members, so they cannot use it |
| `TournamentManagerGuard`               | `tournament/guards`    | Caller organises at least one tournament (its creator, or an admin of its affiliated group)                                                                                                                                                  | ✓                                                           |
| `ConditionalAdminGuard`                | `tournament/guards`    | No `affiliatedGroupId` in the body, or caller is admin of that group                                                                                                                                                                         | ✓                                                           |
| `TournamentAdminGuard`                 | `tournament/guards`    | Caller created the tournament or administers its affiliated group                                                                                                                                                                            | ✓                                                           |
| `StageAdminGuard`                      | `stage/guards`         | Same as above, for the stage's tournament                                                                                                                                                                                                    | ✓                                                           |
| `CanEditMatchupGuard`                  | `matches/guards`       | Caller created the matchup's tournament or administers its affiliated group                                                                                                                                                                  | ✓                                                           |
| `CanCancelParticipationGuard`          | `participation/guards` | Tournament creator or affiliated group admin; or, before `endDate`, the entered user or an admin of the entered group                                                                                                                        | ✓                                                           |
| `TournamentMaximumParticipantsGuard`   | `participation/guards` | Fewer than `maxParticipants` entries                                                                                                                                                                                                         | ✗                                                           |
| `PublicTournamentParticipationGuard`   | `participation/guards` | Tournament `isPublic`                                                                                                                                                                                                                        | ✗                                                           |
| `TeamTypeTournamentParticipationGuard` | `participation/guards` | Entry type allowed by `tournamentTeamType`                                                                                                                                                                                                   | ✗                                                           |
| `TournamentStartDateGuard`             | `participation/guards` | Tournament has not started                                                                                                                                                                                                                   | ✗                                                           |
| `DoubleParticipationGuard`             | `participation/guards` | User or group not already entered                                                                                                                                                                                                            | ✗                                                           |
| `TournamentIsFakePlayersAllowedGuard`  | `participation/guards` | Entry is real, or the tournament allows fake players and is not ranked                                                                                                                                                                       | ✗                                                           |
| `CanRosterBeUsedGuard`                 | `roster/guards`        | Membership, solo/team, duplicate-player and MMR checks (see [Participation](/docs/features/participation/#creating-a-roster))                                                                                                                | ✓                                                           |
| `CanCreateRosterGuard`                 | `roster/guards`        | No roster yet for this entry and stage, and the stage is the first one                                                                                                                                                                       | ✗                                                           |
| `CanUpdateRosterGuard`                 | `roster/guards`        | First stage, or the change count is within `maxChanges` (site admins skip it)                                                                                                                                                                | ✗                                                           |
| `CanEditQuizGuard`                     | `quiz/guards`          | Caller authored the quiz                                                                                                                                                                                                                     | ✓                                                           |
| `CanAttemptGuard`                      | `quiz-attempt/guards`  | Quiz is retakeable or the caller has no previous attempt                                                                                                                                                                                     | ✓                                                           |
| `CanAccessAttemptGuard`                | `quiz-attempt/guards`  | Caller owns the attempt                                                                                                                                                                                                                      | ✓                                                           |
| `CanSubmitAnswerGuard`                 | `quiz-attempt/guards`  | Caller owns the attempt, the quiz has not ended and the time limit has not run out; `POST` only if no answer yet and, outside tests, only for the current question within its time limit; `PUT` only in tests and if the answer is not final | ✓                                                           |

Rule-type guards have no admin bypass by design: they describe the tournament, not the caller.

## Where the group id comes from

The group role guards look for the group id in this order: route parameter `groupId`, body `groupId`, query
`groupId`, body `affiliatedGroupId`. A request without any of them is refused.

## Who manages what

| Thing                       | Managed by                                                                         |
| --------------------------- | ---------------------------------------------------------------------------------- |
| A group                     | Its `admin`s and `owner`; deletion and ownership transfer by the `owner` only      |
| A tournament and its stages | Its creator, the `admin`s and `owner` of its affiliated group, site admins         |
| Match results               | The tournament's creator, the affiliated group's `admin`s and `owner`, site admins |
| A solo entry and its roster | The entered user                                                                   |
| A team entry and its roster | The entered group's `admin`s and `owner`                                           |
| A quiz                      | Its author, site admins                                                            |
| A conversion rule           | Organisers of its source (and of its destination, to create it), site admins       |
| Uploading an image          | Any signed-in user                                                                 |
| An LFG post                 | Its author                                                                         |
| An LFP post                 | The group's `admin`s and `owner`                                                   |
| Categories, subcategories   | Site admins                                                                        |
| Locations                   | Any signed-in user creates them; site admins change and delete them                |
| Users                       | Themselves; site admins for anyone                                                 |

## Own data only

Endpoints that act on "your" things are scoped to the caller even when they take an id: notifications can only be
read or deleted by a recipient (`404` otherwise), notification settings and push tokens are always the caller's own, LFG posts only by their author, and an LFP post only through its
own group.
