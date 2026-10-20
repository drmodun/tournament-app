---
title: Matches and brackets
description: Matchups, score entry, round progression through Challonge, and bracket display.
---

## Concepts

- A **matchup** is one match in a stage. It has a `round` number, start and end dates, `isFinished`, and a
  `challongeMatchupId` when it came from Challonge.
- `roster_matchup` links the competing rosters and records `isWinner`.
- A matchup's result is a list of **scores**, one per played round (game), each with points per roster.

## Where matchups come from

| Source              | When                                                                                                                                                              |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Challonge round 1   | Imported when a stage is started                                                                                                                                  |
| Challonge round N+1 | Imported when every matchup of round N is finished                                                                                                                |
| `BracketGenerator`  | Used by the seed to build single-elimination brackets locally, with rosters sorted by average ELO in the tournament's category (1000 when a player has no career) |

## Entering results

Tournament managers enter results. `CanEditMatchupGuard` allows the tournament's creator and the `admin` or `owner`
members of the tournament's affiliated group. It does not grant site admins anything extra.

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

Challonge is treated as a mirror of the local data. After the database write:

1. If the matchup has a `challongeMatchupId` and the stage has a Challonge tournament, the API sends the scores and
   winner to Challonge (identifying rosters by their Challonge participant ids).
2. For create and update, it then checks whether every matchup in that round is finished. If so, it fetches the next
   round's matches from Challonge and imports them as matchups.
3. Deleting a result resets the match in Challonge and does not advance anything.

Any Challonge error is logged and swallowed; the request still succeeds with the local result saved.

The API authenticates to Challonge with the OAuth client-credentials flow (`CHALLONGE_CLIENT_ID` /
`CHALLONGE_CLIENT_SECRET`) and retries each call once after fetching a new token.

## Reading results

| Endpoint                                  | Returns                                                         |
| ----------------------------------------- | --------------------------------------------------------------- |
| `GET /matches/results`                    | Matchups with results, filterable (stage, round, finished, ...) |
| `GET /matches/matchup/:matchupId/results` | One matchup with all its scores                                 |
| `GET /matches/user/:userId/results`       | Matchups a user played                                          |
| `GET /matches/roster/:rosterId/results`   | Matchups of a roster                                            |
| `GET /matches/group/:groupId/results`     | Matchups of a group's rosters                                   |
| `GET /matches/managed`                    | Matchups the caller can score                                   |

## Brackets in the web app

`/stage/[id]/bracket` loads the stage (with `responseType=withChallongeTournament`) during server rendering and
embeds Challonge's own bracket widget in an iframe (`https://challonge.com/<challongeTournamentId>/module`). A stage
without a Challonge tournament shows "no bracket data".

There is also groundwork for drawing brackets natively with `@g-loot/react-tournament-brackets`
(`utils/bracketUtils.tsx`, the `useGetBracket` hook, `ChallongeService.getChallongeBracketData` in the API), but it
is not wired up: the hook calls `GET /matches/stage/:stageId/bracket`, which the API no longer exposes, and no page
uses it.

Score entry for managers is at `/manageMatchup/[id]` and `/manageUserManagedMatchups`.

## ELO

Match results do not update ELO ratings yet. See [Careers and ELO](/docs/features/careers/).
