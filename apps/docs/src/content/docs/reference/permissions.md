---
title: Permissions
description: Every guard in the API, what it checks, and whether site admins bypass it.
---

Authorisation is implemented as Nest guards. Most combine `JwtAuthGuard` (a valid access token for an existing,
email-verified user) with a domain check. The table lists them all.

## Guards

| Guard                                  | Location               | Passes when                                                                                                                   | Site admin bypass                                           |
| -------------------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `JwtAuthGuard`                         | `auth/guards`          | Valid access token, user exists and has confirmed their email                                                                 | n/a                                                         |
| `RefreshTokenGuard`                    | `auth/guards`          | Valid refresh token                                                                                                           | n/a                                                         |
| `AdminAuthGuard`                       | `auth/guards`          | User role is `admin`                                                                                                          | –                                                           |
| `GroupMemberGuard`                     | `group/guards`         | Caller has any role in the group                                                                                              | ✓                                                           |
| `GroupAdminGuard`                      | `group/guards`         | Caller is `admin` or `owner` of the group                                                                                     | ✓                                                           |
| `GroupOwnerGuard`                      | `group/guards`         | Caller is `owner` of the group                                                                                                | ✓                                                           |
| `GroupNonMemberGuard`                  | `group/guards`         | Caller is **not** in the group                                                                                                | ✗, and admins are treated as members, so they cannot use it |
| `ConditionalAdminGuard`                | `tournament/guards`    | No `affiliatedGroupId` in the body, or caller is admin of that group                                                          | ✓                                                           |
| `TournamentAdminGuard`                 | `tournament/guards`    | Caller created the tournament or administers its affiliated group                                                             | ✓                                                           |
| `StageAdminGuard`                      | `stage/guards`         | Same as above, for the stage's tournament                                                                                     | ✓                                                           |
| `CanEditMatchupGuard`                  | `matches/guards`       | Caller created the matchup's tournament or administers its affiliated group                                                   | ✗ †                                                         |
| `CanCancelParticipationGuard`          | `participation/guards` | Tournament creator or affiliated group admin; or, before `endDate`, the entered user or an admin of the entered group         | ✗ †                                                         |
| `TournamentMaximumParticipantsGuard`   | `participation/guards` | Fewer than `maxParticipants` entries                                                                                          | ✗                                                           |
| `PublicTournamentParticipationGuard`   | `participation/guards` | Tournament `isPublic`                                                                                                         | ✗                                                           |
| `TeamTypeTournamentParticipationGuard` | `participation/guards` | Entry type allowed by `tournamentTeamType`                                                                                    | ✗                                                           |
| `TournamentStartDateGuard`             | `participation/guards` | Tournament has not started                                                                                                    | ✗                                                           |
| `DoubleParticipationGuard`             | `participation/guards` | User or group not already entered                                                                                             | ✗                                                           |
| `TournamentIsFakePlayersAllowedGuard`  | `participation/guards` | Entry is real, or the tournament allows fake players and is not ranked                                                        | ✗                                                           |
| `CanRosterBeUsedGuard`                 | `roster/guards`        | Membership, solo/team, duplicate-player and MMR checks (see [Participation](/docs/features/participation/#creating-a-roster)) | ✓                                                           |
| `CanCreateRosterGuard`                 | `roster/guards`        | No roster yet for this entry and stage, and the stage is the first one                                                        | ✗                                                           |
| `CanUpdateRosterGuard`                 | `roster/guards`        | First stage, or the change count is within `maxChanges`                                                                       | ✗                                                           |
| `CanEditQuizGuard`                     | `quiz/guards`          | Caller authored the quiz                                                                                                      | ✗ †                                                         |
| `CanAttemptGuard`                      | `quiz-attempt/guards`  | Quiz is retakeable or the caller has no previous attempt                                                                      | ✓                                                           |
| `CanAccessAttemptGuard`                | `quiz-attempt/guards`  | Caller owns the attempt                                                                                                       | ✓                                                           |
| `CanSubmitAnswerGuard`                 | `quiz-attempt/guards`  | Caller owns the attempt; `POST` only if no answer yet, `PUT` only if the answer is not final                                  | ✓                                                           |

† Site admins have no special access here, unlike almost everywhere else.

Rule-type guards (participant limit, start date, team type) have no admin bypass by design: they describe the
tournament, not the caller.

## Where the group id comes from

The group role guards look for the group id in this order: route parameter `groupId`, body `groupId`, query
`groupId`, body `affiliatedGroupId`. A request without any of them is refused.

## Who manages what

| Thing                       | Managed by                                                                 |
| --------------------------- | -------------------------------------------------------------------------- |
| A group                     | Its `admin`s and `owner`; deletion by the `owner` only                     |
| A tournament and its stages | Its creator, the `admin`s and `owner` of its affiliated group, site admins |
| Match results               | The tournament's creator and the affiliated group's `admin`s and `owner`   |
| A solo entry and its roster | The entered user                                                           |
| A team entry and its roster | The entered group's `admin`s and `owner`                                   |
| A quiz                      | Its author                                                                 |
| An LFG post                 | Its author                                                                 |
| An LFP post                 | The group's `admin`s and `owner`                                           |
| Categories                  | Site admins create and delete; any signed-in user can edit                 |
| Locations                   | Any signed-in user                                                         |
| Users                       | Themselves; site admins for anyone                                         |

## Endpoints with no ownership check

A few endpoints only require a signed-in user and do not check that the caller owns the target. They are listed in
[Known limitations](/docs/reference/known-limitations/#authorisation-gaps).
