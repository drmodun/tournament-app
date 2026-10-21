---
title: Matches and brackets
description: Matchups, score entry, round progression through Challonge, and bracket display.
---

## Concepts

- A **matchup** is one match in a stage. It has a `round` number, start and end dates, `isFinished`, a
  `challongeMatchupId` when it came from Challonge, and a `bracket` in stages run by
  the API that have more than one (`winners`, `losers`, `last_chance` and `grand_final`, or the compass directions).
- `roster_matchup` links the competing rosters and records `isWinner`.
- A matchup's result is a list of **scores**, one per played round (game), each with points per roster.

## Where matchups come from

| Source              | When                                                                                                                                                              |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Challonge round 1   | Imported when a stage with a Challonge tournament is started                                                                                                      |
| Challonge round N+1 | Imported when every matchup of round N is finished                                                                                                                |
| Local round 1       | Drawn by the API when a stage without a Challonge tournament is started (every round at once for a round robin)                                                   |
| Local round N+1     | Drawn by the API when every matchup of round N has a result                                                                                                       |
| `BracketGenerator`  | Used by the seed to build single-elimination brackets locally, with rosters sorted by average ELO in the tournament's category (1000 when a player has no career) |

## Entering results

Tournament managers enter results. `CanEditMatchupGuard` allows site admins, the tournament's creator and the
`admin` or `owner` members of the tournament's affiliated group.

| Endpoint                                  | Effect                                   |
| ----------------------------------------- | ---------------------------------------- |
| `POST /matches/:matchupId/score`          | Record the result                        |
| `PUT /matches/:matchupId/update-score`    | Replace the result                       |
| `DELETE /matches/:matchupId/delete-score` | Remove the result and reopen the matchup |

The body has per-round scores and the overall result:

```json
{
  "scores": [
    {
      "roundNumber": 1,
      "scores": [
        { "rosterId": 10, "points": 13, "isWinner": true },
        { "rosterId": 11, "points": 7, "isWinner": false }
      ]
    },
    {
      "roundNumber": 2,
      "scores": [
        { "rosterId": 10, "points": 13, "isWinner": true },
        { "rosterId": 11, "points": 11, "isWinner": false }
      ]
    }
  ],
  "results": [
    { "rosterId": 10, "isWinner": true },
    { "rosterId": 11, "isWinner": false }
  ]
}
```

Recording a result happens in one transaction: insert a `score` row per round, insert per-roster points, mark the
matchup `isFinished` with `endDate = now`, and set `isWinner` on the winning rosters' `roster_matchup` rows.

## Syncing with Challonge

Challonge is optional and **off by default**: it is only used when `CHALLONGE_ENABLED=true`. With it off, stages get no
Challonge tournament, and a stage that already has one is started and run by the API. Challonge has no compass or
triple-elimination bracket, so those stages never get a Challonge tournament and are always run by the API. Challonge
is treated as a mirror of the local data. After the database write:

1. If the matchup has a `challongeMatchupId` and the stage has a Challonge tournament, the API sends the scores and
   winner to Challonge (identifying rosters by their Challonge participant ids).
2. For create and update, it then checks whether every matchup in that round is finished. If so, it fetches the next
   round's matches from Challonge and imports them as matchups.
3. Deleting a result resets the match in Challonge and does not advance anything.

Any Challonge error is logged and swallowed; the request still succeeds with the local result saved.

The API authenticates to Challonge with the OAuth client-credentials flow (`CHALLONGE_CLIENT_ID` /
`CHALLONGE_CLIENT_SECRET`) and retries each call once after fetching a new token.

## Brackets run by the API

A stage without a Challonge tournament (no credentials, or Challonge failed when the stage was created) still
starts. The API then runs the bracket itself, in the format its `stageType` names:

| Stage type                                      | Format             |
| ----------------------------------------------- | ------------------ |
| `knockout`                                      | Single elimination |
| `double_elimination`                            | Double elimination |
| `triple_elimination`                            | Triple elimination |
| `compass`                                       | Compass            |
| `round_robin`, `group` (the default), `fixture` | Round robin        |
| `swiss`                                         | Swiss              |
| `quiz`, `evaluated_competition`                 | Single elimination |

**Seeding** is the same for every format: rosters with a `seed` (set by a [seeding conversion
rule](#point-conversion-rules)) come first in seed order, then the rest by their players' average rating in the
tournament's category (1000 for a player without a career), ties by roster id.

A matchup with a single roster is a **bye**: it is finished on creation and counts as a win.

### Single elimination

1. **Round 1**: the bracket is padded to a power of two and paired in standard order (1 v 8, 4 v 5, 2 v 7, 3 v 6), so
   the top seeds can only meet late. Seeds without an opponent get a bye.
2. **Next rounds**: when every matchup of a round has exactly one winner, the winners are paired in bracket order into
   the next round. An odd one out gets a bye.
3. **Final**: when a round leaves a single winner, the stage is `finished`.

### Double elimination

Round 1 is the seeded single-elimination round above, in the winners bracket. After that each round has two parts:

- Rosters without a loss play each other in the **winners bracket**, in bracket order.
- Rosters with one loss play each other in the **losers bracket**, avoiding rematches where possible. With an odd
  number, the lowest seed that has not had a bye yet gets one.
- A second loss knocks a roster out. A roster alone in its bracket waits for the other bracket to catch up.

When one roster is left in each bracket they meet in the **grand final**. If the losers-bracket roster wins it, both
have one loss and the grand final is played again. The last roster standing wins the stage.

### Triple elimination

Double elimination with three losses: rosters play others with the same number of losses, in the **winners**
(no loss), **losers** (one) and **last-chance** (two) brackets, and a third loss knocks a roster out. When two rosters
are left they meet in the grand final, replayed while the roster with more losses wins. If every bracket holds a
single roster, the two with the most losses play each other so the stage never stalls.

### Compass

Round 1 is the seeded single-elimination round, in the **east** bracket. Every bracket then plays single elimination
among the rosters in it, and the loser of a bracket's n-th round drops into the n-th bracket listed below. Losing the
last round of a bracket, or a round with no bracket listed, ends a roster's run.

| Bracket     | 1st round loser → | 2nd round loser → | 3rd round loser → |
| ----------- | ----------------- | ----------------- | ----------------- |
| `east`      | `west`            | `north`           | `south`           |
| `west`      | `southwest`       | `northwest`       |                   |
| `north`     | `northeast`       |                   |                   |
| `southwest` | `southeast`       |                   |                   |

With 8 rosters this is the usual East, West, North and South; 16 fill all eight. Everyone plays the same number of
rounds. The stage finishes when no bracket has a matchup left. Places are ranked by how far down the compass a roster
went (leaving the east later is better), then by how long it lasted there.

### Round robin

Every round is drawn when the stage starts (circle method): each roster meets every other once, and with an odd
number of rosters one sits out each round. Rounds can be played in any order, and the stage finishes when every
matchup has a result.

### Swiss

The stage plays `ceil(log2(rosters))` rounds (3 for 5 to 8 rosters). Round 1 pairs the top half of the seeds with the
bottom half (1 v 5, 2 v 6, ...). Each later round is drawn from the [standings](#standings): rosters are paired from
the top down with the next one they have not met, and with an odd number the lowest-placed roster without a bye gets
one.

### Draws

A result with no winner, or with every roster marked as winner, is a draw. Round robin and Swiss count draws;
elimination formats need exactly one winner per matchup and do not advance until it is set.

### Standings

`GET /matches/stage/:stageId/standings` returns the stage's `format`, whether it is `isFinished`, whether it
`runsOnChallonge`, and one row per roster, best first: `place`, `played`, `wins`, `draws`, `losses`, `byes`, `carriedPoints`, `points`, `buchholz` and
`eliminatedInRound`.

- **Round robin and Swiss** rank by `points` (carried points, plus 3 per win or bye and 1 per draw), then wins, then
  Buchholz (the sum of the opponents' points).
- **Elimination formats** rank by how long a roster lasted: rosters still in first, then by the round of their last
  allowed loss (`eliminatedInRound`), latest first.

Rosters with equal records share a place.

### Changing results

Because later rounds are drawn from earlier results, a result can be changed or deleted only until the next round
has been drawn; round robin results, which nothing depends on, can change at any time. Once the stage is finished,
its conversion rules have run, so every result is frozen. In both cases `PUT` and `DELETE` return `400`.

## Point conversion rules

A conversion rule turns the final placings of a stage or tournament (the **source**) into points or entries in
another one (the **destination**). Rules are applied once, automatically, when their source finishes: a stage run by
the API when its last matchup is played, a tournament when its last stage is finished. `appliedAt` records when.

```text
POST   /conversion-rules                 create (organisers of both the source and the destination)
GET    /conversion-rules?source=&type=   list
GET    /conversion-rules/:ruleId         one rule
POST   /conversion-rules/:ruleId/apply   apply by hand, once the source has finished
DELETE /conversion-rules/:ruleId         delete (organisers of the source)
```

| `type`                     | Source placings                                 | Destination                                               |
| -------------------------- | ----------------------------------------------- | --------------------------------------------------------- |
| `stage_to_stage`           | The stage's [standings](#standings)             | Rosters in another stage of the same tournament           |
| `stage_to_tournament`      | The stage's standings, by participation         | Participations (the same group or player) in a tournament |
| `tournament_to_tournament` | Participations by `points` (ties share a place) | Participations in another tournament                      |

| `strategy`      | Effect on the places in range                                                                   |
| --------------- | ----------------------------------------------------------------------------------------------- |
| `ranking`       | Adds points to the entry the same group or player already has in the destination                |
| `qualification` | Gives each one an entry in the destination (a roster with the same players, or a participation) |
| `elimination`   | Qualification, and removes the other source entries' rosters from the destination stage         |
| `seed`          | Qualification, with the destination rosters' `seed` set in order of place                       |
| `hybrid`        | Qualification plus ranking points                                                               |

`tie_breaker` and `qualification_with_lcq` are refused with `400`. `elimination` and `seed` need a `stage_to_stage`
rule, and strategies that add entries need a destination stage that is still `upcoming`.

The places in range are `from` to `to` (both included; by default every place). Points start at `maxPoints` (or
`points`) for place `from` and drop by `pointsPerPlace` per place, never below `minPoints` (default 0). For example
`maxPoints: 10, pointsPerPlace: 3` gives 10, 7, 4, 1, 0, ...

Points given to a roster are its `carriedPoints` in the destination stage's standings; points given to a participation
add to its `points`, which `tournament_to_tournament` rules rank by.

A stage run on Challonge finishes when nothing more can be played there (checked after each result): every match is
complete, or the ones left are pending with a player missing, such as the unneeded reset of a double-elimination grand
final. Its rules then apply the same way, and its results are frozen like those of any finished stage. `POST /conversion-rules/:ruleId/apply` stays available for a rule that was missed.

## Reading results

| Endpoint                                  | Returns                                                         |
| ----------------------------------------- | --------------------------------------------------------------- |
| `GET /matches/results`                    | Matchups with results, filterable (stage, round, finished, ...) |
| `GET /matches/stage/:stageId/standings`   | The stage's [standings](#standings)                             |
| `GET /matches/matchup/:matchupId/results` | One matchup with all its scores                                 |
| `GET /matches/user/:userId/results`       | Matchups a user played                                          |
| `GET /matches/roster/:rosterId/results`   | Matchups of a roster                                            |
| `GET /matches/group/:groupId/results`     | Matchups of a group's rosters                                   |
| `GET /matches/managed`                    | Matchups the caller can score                                   |

## Brackets in the web app

`/stage/[id]/bracket` loads the stage (with `responseType=withChallongeTournament`) and its standings during server
rendering. `runsOnChallonge` in the standings decides whose bracket it is, because a stage can have a Challonge
tournament and still have been run by the API (it was created while Challonge was on and started after it was turned
off). On Challonge it embeds Challonge's own bracket widget in an iframe
(`https://challonge.com/<challongeTournamentId>/module`). For a stage run by the API it loads every matchup of the stage (`GET /matches/results?stageId=`, 100 per page) and its
standings, draws the rounds side by side (one row per bracket for double elimination), marks winners and byes, and
shows the standings table below.

`utils/bracketUtils.tsx` and `ChallongeService.getChallongeBracketData` are groundwork for drawing brackets natively
with `@g-loot/react-tournament-brackets`; no page uses them yet.

Score entry for managers is at `/manageMatchup/[id]` and `/manageUserManagedMatchups`.

## ELO

In ranked tournaments, recording a result updates the players' ratings, and correcting or deleting it re-rates them. See
[Careers and ELO](/docs/features/careers/#rating-updates).
