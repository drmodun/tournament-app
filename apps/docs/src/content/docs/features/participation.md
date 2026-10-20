---
title: Participation and rosters
description: How players and groups enter tournaments, and how line-ups are built for each stage.
---

## Participation

A participation says "this user" (solo) or "this group" (team) is entered in a tournament. It has exactly one of
`userId` and `groupId`.

### Entering a tournament

| Endpoint                                                        | Who                   | Enters                    |
| --------------------------------------------------------------- | --------------------- | ------------------------- |
| `POST /participations/apply-solo/:tournamentId`                 | any signed-in user    | themselves                |
| `POST /participations/apply-group/:tournamentId/:groupId`       | an admin of the group | the group                 |
| `POST /participations/admin/apply-solo/:tournamentId/:userId`   | tournament managers   | any user, typically fake  |
| `POST /participations/admin/apply-group/:tournamentId/:groupId` | tournament managers   | any group, typically fake |

The guards run in order and each can refuse with `403`:

| Check                                                                                                                                   | Self-entry | Manager entry |
| --------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------------- |
| Participant count is below `maxParticipants`                                                                                            | ✓          | ✓             |
| Tournament is public                                                                                                                    | ✓          | –             |
| Caller manages the tournament                                                                                                           | –          | ✓             |
| Fake user or group only if `isFakePlayersAllowed` and not `isRanked`                                                                    | –          | ✓             |
| Entry type matches `tournamentTeamType` (solo entries refused by `team` tournaments, team entries by `solo` ones; `mixed` accepts both) | ✓          | ✓             |
| Tournament has not started (`now < startDate`)                                                                                          | ✓          | ✓             |
| The user or group is not already entered (a group may enter again when the tournament sets `isMultipleTeamsPerGroupAllowed`)            | ✓          | ✓             |

Self-entry into a private tournament is not possible; managers fill private tournaments through the admin
endpoints, which only verify the fake-player rule for fake entries.

### Withdrawing

`DELETE /participations/:participationId` is allowed for:

- the tournament's creator or an admin of its affiliated group, at any time;
- otherwise, the entered user (solo) or an admin of the entered group (team), as long as the tournament has not ended
  (`endDate` in the past returns `403`).

Deleting a participation cascades to its rosters.

### Reading

`GET /participations` (filter by tournament, user or group), `GET /participations/:id`, and
`GET /participations/managed-for-player/:tournamentId`, which returns the participations in a tournament that the
caller can act for: their own solo entry and the entries of groups they administer.

## Rosters

A roster is a participation's line-up for one stage. Players are listed with an `isSubstitute` flag.

### Automatic rosters for solo players

When a stage is created, every solo participation in the tournament gets a roster with the player as its single
member. Solo players never have to build rosters by hand.

### Creating a roster

`POST /roster/:participationId/:stageId` with a body of `members: [{ userId, isSubstitute }]`.

`CanRosterBeUsedGuard` (skipped for site admins) checks:

1. The participation and stage exist and the stage belongs to the participation's tournament.
2. The member list is not empty.
3. **Solo participation**: the only member may be the caller.
4. **Team participation**: the caller is an admin of the group, and every member is a member of the group.
5. No member is already in another roster in the same stage.
6. When the tournament has non-default MMR bounds (`minimumMMR ≠ 0` and `maximumMMR ≠ 999999`): every member has a
   career in the tournament's category with an ELO strictly between the bounds. In that case, fake members are
   refused unless the tournament allows fake players.

`CanCreateRosterGuard` then checks:

1. The participation has no roster in this stage yet. One roster per participation per stage is a deliberate design
   decision noted in the code.
2. The stage is the tournament's **first stage**. Rosters for later stages are not created directly. They are
   carried over and edited.

### Updating a roster

`PATCH /roster/:id` with the full new member list runs `CanRosterBeUsedGuard` again (excluding the roster itself from
the "already in another roster" check) and then `CanUpdateRosterGuard`:

- In the first stage, any change is allowed.
- In later stages, the number of changes must not exceed the stage's `maxChanges`. Changes are counted as
  `added + removed + |old size − new size|`.

Both creating and updating a roster also check the stage's limits (site admins skip these, like the rest of this
guard):

- the stage must not have started yet;
- the roster must have between `minPlayersPerTeam` and `maxPlayersPerTeam` players (when set);
- it may have at most `maxSubstitutes` substitutes (when set; unset means no limit).

### Reading rosters

| Endpoint                                     | Returns                                                                            |
| -------------------------------------------- | ---------------------------------------------------------------------------------- |
| `GET /roster`                                | Filtered list (`responseType=mini` for a lightweight list, otherwise with players) |
| `GET /roster/:id`                            | One roster with players                                                            |
| `GET /roster/stage/:stageId`                 | All rosters in a stage                                                             |
| `GET /roster/participation/:participationId` | All rosters of an entry, across stages                                             |
| `GET /roster/user/:userId`                   | Rosters a user plays in                                                            |
| `GET /roster/group/:groupId`                 | Rosters of a group                                                                 |
| `GET /roster/managed-by-user/:stageId`       | Rosters in a stage the caller can edit                                             |
