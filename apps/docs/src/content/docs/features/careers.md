---
title: Careers and ELO
description: Per-category ratings, how they gate tournaments, rank thresholds, and the ELO formula.
---

## Careers

A **career** (`category_career`) is a user's rating in one category, keyed by `(category_id, user_id)`. The rating
starts at `BASE_ELO = 1000`.

Ratings show up in:

- **Rosters**: when a tournament has non-default MMR bounds (`minimumMMR ≠ 0` and `maximumMMR ≠ 999999`), every
  roster member needs a career in the tournament's category with `minimumMMR < elo < maximumMMR`. A member without a
  career in that category makes the roster invalid.
- **LFG posts**: each post lists the author's ELO in the categories they chose.
- **Group requirements**: groups can state minimum and maximum ELO per category. They filter the group's LFG search
  and are checked when a player asks to join or accepts an invitation.
- **Bracket seeding**: brackets run by the API (and the seed's `BracketGenerator`) order rosters by the average ELO of
  their players (1000 for a player without a career).

The `career` module currently has no HTTP routes; careers are read through the endpoints above. Seeded users get
careers in random categories.

## Ranks

`@tournament-app/types` exports upper bounds for labelling ratings (neither app uses them yet):

| Rank         | Constant           | Upper bound |
| ------------ | ------------------ | ----------- |
| Bronze       | `BRONZE_MAX`       | 800         |
| Silver       | `SILVER_MAX`       | 950         |
| Gold         | `GOLD_MAX`         | 1100        |
| Platinum     | `PLATINUM_MAX`     | 1250        |
| Diamond      | `DIAMOND_MAX`      | 1400        |
| Master       | `MASTER_MAX`       | 1500        |
| Grand Master | `GRAND_MASTER_MAX` | 1600        |
| Champion     | `CHAMPION_MAX`     | 1700        |
| Elite        |                    | above 1700  |

## The ELO formula

`apps/api/src/base/static/eloHelper.ts` implements standard ELO:

```text
expected = 1 / (1 + 10^((opponent − player) / 400))
new      = max(0, round(player + K × (actual − expected)))
```

`actual` is 1 for a win, 0.5 for a draw and 0 for a loss. K depends on experience:

| Matches played | K   |
| -------------- | --- |
| fewer than 10  | 50  |
| 10–19          | 32  |
| 20 or more     | 20  |

## Rating updates

When a result is recorded (`POST /matches/:matchupId/score`) in a **ranked** tournament, the players' ratings in the
tournament's category change:

- Only one-on-one matchups (two rosters) are rated. Each player is rated against the opposing roster's average.
- "Matches played" for the K-factor is the player's number of finished matchups in that category before this one.
- A matchup where neither or both rosters won counts as a draw.
- Fake players are left out. A player without a career in the category gets one, starting from 1000.
- Every change is stored per matchup (`rating_change`). Correcting a result (`PUT`) undoes the stored changes and
  rates the new result; deleting it undoes them.
- Unranked tournaments never change ratings.

A failure while updating ratings is logged and does not undo the result.
