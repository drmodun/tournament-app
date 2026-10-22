---
title: Tournaments and stages
description: Creating tournaments, the settings that control entry, stages and their lifecycle.
---

## Tournaments

A tournament is a competition in one category. Create it with `POST /tournaments` while signed in; the caller
becomes `creatorId`.

### Who manages a tournament

A user manages a tournament (passes `TournamentAdminGuard`) when any of these holds:

- they are a site admin,
- they created it,
- it has an `affiliatedGroupId` and they are an `admin` or `owner` of that group.

Setting `affiliatedGroupId` on create requires being an admin of that group (`ConditionalAdminGuard`); without it,
anyone signed in can create a tournament. Managers can `PATCH` and `DELETE` the tournament, add stages, enter fake
players, and enter scores. `GET /tournaments/managed` lists the tournaments the caller manages.

### Settings

| Field                                  | Default              | Effect                                                                                     |
| -------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------ |
| `name`, `description`, `logo`, `links` |                      | Display                                                                                    |
| `categoryId`                           | required             | The game or discipline; also selects which ELO rating is checked                           |
| `subcategoryId`                        |                      | A [subcategory](#subcategories) of that category; `null` on update clears it               |
| `startDate`, `endDate`                 | `startDate` required | Entry closes at `startDate`. Participations cannot be cancelled by players after `endDate` |
| `tournamentType`                       | `league`             | `league`, `competition`, `seasonal`, `contest`, `event` (descriptive)                      |
| `tournamentTeamType`                   | `team`               | `solo`: only individual entries. `team`: only group entries. `mixed`: both                 |
| `tournamentLocation`                   | `online`             | `online`, `offline`, `hybrid`; offline and hybrid events can set `locationId`              |
| `isPublic`                             | `true`               | Only public tournaments accept self-entry. Private ones are filled by managers             |
| `maxParticipants`                      | 32                   | Entry is refused once this many participations exist                                       |
| `minimumMMR`, `maximumMMR`             | 0, 999999            | ELO bounds checked when rosters are built (see below)                                      |
| `isFakePlayersAllowed`                 | `false`              | Allows managers to enter fake users and fake groups                                        |
| `isRanked`                             | `false`              | A ranked tournament never accepts fake entries, even with `isFakePlayersAllowed`           |
| `isMultipleTeamsPerGroupAllowed`       | `false`              | Lets one group enter the tournament more than once, as separate teams                      |
| `affiliatedGroupId`                    |                      | Group whose admins co-manage the tournament                                                |
| `parentTournamentId`                   |                      | Nest tournaments, for example events in a league                                           |
| `minimumLevel`, `country`              |                      | Stored for future use                                                                      |

### Reading tournaments

`GET /tournaments` supports the base query parameters and tournament-specific filters (category, subcategory, type,
team type, location, dates, creator, affiliated group, ...). The `base` and `extended` projections include
`subcategory` (`{ id, name }`, or `null`). `GET /tournaments/:id` takes `responseType`; the `extended`
projection includes `currentParticipants`. `GET /tournaments/auto-complete/:search` searches by name.

### Subcategories

A subcategory narrows a category, for example a time control within chess. Site admins manage them at
`/subcategories` (`name`, optional `description` and `image`, `categoryId`); anyone can list them, filtered by
`categoryId`, `name` or `search`. Responses carry `tournamentCount`; `responseType=extended` adds the category.

A tournament's subcategory must belong to its category (`400` otherwise). Moving a tournament to another category
without sending a subcategory drops one that does not belong there. A subcategory that tournaments use cannot move to
another category (`409`); deleting it leaves its tournaments in their category without a subcategory.

## Stages

A stage is one phase of a tournament: a group stage, a knockout bracket, a quiz round. Stages are ordered by
`startDate`; the earliest is the **first stage**, which matters for rosters.

### Stage fields

| Field                                                                  | Effect                                                                                                                                         |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`, `description`, `logo`                                          | Display                                                                                                                                        |
| `stageType`                                                            | `group`, `knockout`, `swiss`, `round_robin`, `fixture`, `double_elimination`, `quiz`, `compass`, `triple_elimination`, `evaluated_competition` |
| `stageStatus`                                                          | `upcoming` (the default) → `ongoing` → `finished`, or `cancelled`                                                                              |
| `startDate`, `endDate`                                                 | Ordering and schedule                                                                                                                          |
| `stageLocation`, `locationId`                                          | Like the tournament's location                                                                                                                 |
| `minPlayersPerTeam` (default 1), `maxPlayersPerTeam`, `maxSubstitutes` | Roster size limits                                                                                                                             |
| `maxChanges`                                                           | How many roster changes are allowed in later stages                                                                                            |

### Who manages a stage

`StageAdminGuard` resolves the stage's tournament and applies the same rule as for tournaments: site admin, the
tournament's creator, or an admin of its affiliated group. `GET /stages/managed` lists stages the caller manages.

### Creating a stage

`POST /stages/:tournamentId` (tournament managers) does three things:

1. Inserts the stage.
2. Creates a roster in the new stage for every **solo** participation already in the tournament, with that player
   as its only member. Team participations build their rosters themselves.
3. When `CHALLONGE_ENABLED=true`, creates a private Challonge tournament for the stage and stores its id. The stage type is mapped to a Challonge
   type:

| Stage type                                                                     | Challonge type     |
| ------------------------------------------------------------------------------ | ------------------ |
| `group`, `knockout`                                                            | single elimination |
| `double_elimination`, `triple_elimination`, `compass`, `evaluated_competition` | double elimination |
| `round_robin`, `fixture`, `quiz`                                               | round robin        |
| `swiss`                                                                        | swiss              |

If the Challonge call fails (for example with the mock credentials), the stage is still created, just without a
Challonge id, and the error is logged.

With Challonge enabled, updating a stage (`PATCH /stages/:tournamentId/:stageId`) also updates the Challonge
tournament, and deleting it deletes the Challonge tournament.

### Starting a stage

`PATCH /stages/start/:stageId` (stage managers) moves a stage from `upcoming` to `ongoing`:

1. Refuses if the stage is already `ongoing` or `finished` (`400`).
2. Refuses if the stage has no rosters (`400`).
3. Starts the bracket, in one of two ways:
   - **With a Challonge tournament** (only when `CHALLONGE_ENABLED=true`): adds every roster to Challonge as a participant in one bulk call, stores the
     returned participant ids, sets the stage to `ongoing` here and in Challonge (which seeds and starts the
     bracket), and imports Challonge's round 1 matches as matchups.
   - **Without one** (the default: Challonge is disabled, or its call failed when the stage was created): the API runs
     the bracket itself, in the format of the stage type (single, double or triple elimination, compass, round robin or
     Swiss). See
     [Brackets run by the API](/docs/features/matches/#brackets-run-by-the-api).
4. Sends a `tournament-start` notification, linking to `/stage/<id>`, to every user in a roster of the stage.

From there, results drive the bracket: see [Matches and brackets](/docs/features/matches/).
