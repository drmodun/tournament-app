// Formats of the brackets the API runs itself, for stages without a Challonge tournament.
// Everything here is pure: the matches service reads a stage's matchups and stores what these return.

import {
  IStageStandingResponse,
  matchupBracketEnum,
  stageTypeEnum,
} from '@tournament-app/types';
import { firstRoundPairings, nextRoundPairings } from './localBracket';

export enum LocalBracketFormat {
  SINGLE_ELIMINATION = 'single_elimination',
  DOUBLE_ELIMINATION = 'double_elimination',
  ROUND_ROBIN = 'round_robin',
  SWISS = 'swiss',
}

// Compass, triple elimination, quiz and evaluated stages have no format of their own here and run as
// single elimination
export function bracketFormatFor(
  stageType?: string | null,
): LocalBracketFormat {
  switch (stageType) {
    case stageTypeEnum.DOUBLE_ELIMINATION:
      return LocalBracketFormat.DOUBLE_ELIMINATION;
    case stageTypeEnum.ROUND_ROBIN:
    case stageTypeEnum.GROUP:
    case stageTypeEnum.FIXTURE:
      return LocalBracketFormat.ROUND_ROBIN;
    case stageTypeEnum.SWISS:
      return LocalBracketFormat.SWISS;
    default:
      return LocalBracketFormat.SINGLE_ELIMINATION;
  }
}

/** Formats where every matchup needs exactly one winner. */
export function isElimination(format: LocalBracketFormat) {
  return (
    format === LocalBracketFormat.SINGLE_ELIMINATION ||
    format === LocalBracketFormat.DOUBLE_ELIMINATION
  );
}

// A matchup of a locally run stage, drawn or played
export interface LocalMatchup {
  id: number;
  round: number;
  bracket?: string | null;
  isFinished: boolean;
  rosterIds: number[];
  winners: number[];
}

export interface Pairing {
  rosterIds: number[];
  bracket?: matchupBracketEnum;
}

type Outcome = 'win' | 'loss' | 'draw' | 'bye';

/**
 * What a finished matchup meant for each roster. A matchup with one roster is a bye. No winner, or
 * every roster marked as winner, is a draw.
 */
export function matchupOutcomes(matchup: LocalMatchup): Map<number, Outcome> {
  const outcomes = new Map<number, Outcome>();

  if (!matchup.isFinished) {
    return outcomes;
  }

  if (matchup.rosterIds.length === 1) {
    outcomes.set(matchup.rosterIds[0], 'bye');
    return outcomes;
  }

  const isDraw =
    matchup.winners.length === 0 ||
    matchup.winners.length === matchup.rosterIds.length;

  for (const rosterId of matchup.rosterIds) {
    outcomes.set(
      rosterId,
      isDraw ? 'draw' : matchup.winners.includes(rosterId) ? 'win' : 'loss',
    );
  }

  return outcomes;
}

const pairKey = (a: number, b: number) => (a < b ? `${a}-${b}` : `${b}-${a}`);

function meetings(history: LocalMatchup[]) {
  const met = new Set<string>();

  for (const matchup of history) {
    for (let i = 0; i < matchup.rosterIds.length; i++) {
      for (let j = i + 1; j < matchup.rosterIds.length; j++) {
        met.add(pairKey(matchup.rosterIds[i], matchup.rosterIds[j]));
      }
    }
  }

  return (a: number, b: number) => met.has(pairKey(a, b));
}

function rostersWithBye(history: LocalMatchup[]) {
  return new Set(
    history.filter((m) => m.rosterIds.length === 1).map((m) => m.rosterIds[0]),
  );
}

/**
 * Every round of a round robin, by the circle method: each roster meets every other once. With an
 * odd number of rosters one of them sits out each round.
 */
export function roundRobinRounds(rosterIds: number[]): number[][][] {
  if (rosterIds.length < 2) {
    return [];
  }

  const slots: (number | null)[] =
    rosterIds.length % 2 ? [...rosterIds, null] : [...rosterIds];
  const rounds: number[][][] = [];

  for (let round = 0; round < slots.length - 1; round++) {
    const pairs: number[][] = [];

    for (let i = 0; i < slots.length / 2; i++) {
      const home = slots[i];
      const away = slots[slots.length - 1 - i];

      if (home != null && away != null) {
        pairs.push([home, away]);
      }
    }

    rounds.push(pairs);
    // The first slot stays put and the others rotate
    slots.splice(1, 0, slots.pop()!);
  }

  return rounds;
}

/** Enough Swiss rounds to separate a single unbeaten roster. */
export function swissRoundCount(rosterCount: number) {
  return rosterCount < 2 ? 0 : Math.ceil(Math.log2(rosterCount));
}

// Bounds the search below, so a pairing that cannot avoid rematches falls back quickly
const PAIRING_SEARCH_STEPS = 20000;

/**
 * Pairs an even number of rosters, taken in order, each with the next one it has not met. Backtracks
 * so a rematch only happens when there is no other way, then pairs neighbours.
 */
export function pairAvoidingRematches(
  ordered: number[],
  hasMet: (a: number, b: number) => boolean,
): number[][] {
  let steps = 0;

  const search = (rest: number[]): number[][] | null => {
    if (!rest.length) {
      return [];
    }

    const [first, ...others] = rest;

    for (let i = 0; i < others.length; i++) {
      if (++steps > PAIRING_SEARCH_STEPS) {
        return null;
      }

      if (hasMet(first, others[i])) {
        continue;
      }

      const remaining = [...others.slice(0, i), ...others.slice(i + 1)];
      const paired = search(remaining);

      if (paired) {
        return [[first, others[i]], ...paired];
      }
    }

    return null;
  };

  const paired = search(ordered);

  if (paired) {
    return paired;
  }

  const neighbours: number[][] = [];

  for (let i = 0; i < ordered.length; i += 2) {
    neighbours.push(ordered.slice(i, i + 2));
  }

  return neighbours;
}

// With an odd number of rosters, the lowest-placed one that has not had a bye yet sits the round out
function takeBye(ordered: number[], history: LocalMatchup[]) {
  if (ordered.length % 2 === 0) {
    return { bye: null, rest: ordered };
  }

  const hadBye = rostersWithBye(history);
  let index = ordered.length - 1;

  while (index > 0 && hadBye.has(ordered[index])) {
    index--;
  }

  return {
    bye: ordered[index],
    rest: [...ordered.slice(0, index), ...ordered.slice(index + 1)],
  };
}

/** Swiss round 1: the top half of the seeds meets the bottom half (1 v 5, 2 v 6, ... for 8). */
export function swissFirstRound(rosterIdsBySeed: number[]): Pairing[] {
  const { bye, rest } = takeBye(rosterIdsBySeed, []);
  const half = rest.length / 2;
  const pairings: Pairing[] = rest
    .slice(0, half)
    .map((rosterId, i) => ({ rosterIds: [rosterId, rest[half + i]] }));

  return bye == null ? pairings : [...pairings, { rosterIds: [bye] }];
}

/** Later Swiss rounds: rosters with similar points meet, avoiding rematches. */
export function swissNextRound(
  rosterIdsByStanding: number[],
  history: LocalMatchup[],
): Pairing[] {
  const { bye, rest } = takeBye(rosterIdsByStanding, history);
  const pairings: Pairing[] = pairAvoidingRematches(
    rest,
    meetings(history),
  ).map((rosterIds) => ({ rosterIds }));

  return bye == null ? pairings : [...pairings, { rosterIds: [bye] }];
}

export interface DoubleEliminationRound {
  pairings: Pairing[];
  // Set once a single roster is left
  championId?: number;
}

/** Double elimination round 1 is a seeded single-elimination round in the winners bracket. */
export function doubleEliminationFirstRound(
  rosterIdsBySeed: number[],
): Pairing[] {
  return firstRoundPairings(rosterIdsBySeed).map((rosterIds) => ({
    rosterIds,
    bracket: matchupBracketEnum.WINNERS,
  }));
}

/**
 * The next double-elimination round, from every matchup played so far. Rosters without a loss play
 * in the winners bracket, rosters with one loss in the losers bracket, and two losses knock a roster
 * out. When one roster of each bracket is left they meet in the grand final; if the losers-bracket
 * roster wins it, both have one loss and the final is played again.
 */
export function doubleEliminationNextRound(
  rosterIdsBySeed: number[],
  history: LocalMatchup[],
): DoubleEliminationRound {
  const losses = new Map(rosterIdsBySeed.map((id) => [id, 0]));
  const lastWin = new Map<number, number>();

  for (const matchup of [...history].sort((a, b) => a.id - b.id)) {
    for (const [rosterId, outcome] of matchupOutcomes(matchup)) {
      if (outcome === 'loss') {
        losses.set(rosterId, (losses.get(rosterId) ?? 0) + 1);
      } else {
        lastWin.set(rosterId, matchup.id);
      }
    }
  }

  const alive = rosterIdsBySeed.filter((id) => losses.get(id) < 2);

  if (alive.length <= 1) {
    return { pairings: [], championId: alive[0] };
  }

  const winners = alive.filter((id) => losses.get(id) === 0);
  const losers = alive.filter((id) => losses.get(id) === 1);

  if (alive.length === 2 && winners.length <= 1) {
    return {
      pairings: [
        {
          rosterIds: [...winners, ...losers],
          bracket: matchupBracketEnum.GRAND_FINAL,
        },
      ],
    };
  }

  const pairings: Pairing[] = [];

  // Winners stay in bracket order: the order of the matchups they last won
  if (winners.length >= 2) {
    const ordered = [...winners].sort(
      (a, b) => (lastWin.get(a) ?? 0) - (lastWin.get(b) ?? 0),
    );

    for (const rosterIds of nextRoundPairings(ordered)) {
      pairings.push({ rosterIds, bracket: matchupBracketEnum.WINNERS });
    }
  }

  // A lone roster in either bracket waits for the other bracket to catch up
  if (losers.length >= 2) {
    const { bye, rest } = takeBye(losers, history);

    for (const rosterIds of pairAvoidingRematches(rest, meetings(history))) {
      pairings.push({ rosterIds, bracket: matchupBracketEnum.LOSERS });
    }

    if (bye != null) {
      pairings.push({ rosterIds: [bye], bracket: matchupBracketEnum.LOSERS });
    }
  }

  return { pairings };
}

/**
 * Standings of a locally run stage, best first. Round robin and Swiss rank by points (carried
 * points, plus 3 per win or bye and 1 per draw), then wins, then Buchholz. Elimination formats rank
 * by how long a roster lasted. Rosters with equal records share a place; seeds only order them.
 */
export function computeStandings(
  format: LocalBracketFormat,
  rosterIdsBySeed: number[],
  history: LocalMatchup[],
  carriedPoints: Map<number, number> = new Map(),
): IStageStandingResponse[] {
  const rows = new Map<
    number,
    IStageStandingResponse & { opponents: number[]; seed: number }
  >(
    rosterIdsBySeed.map((rosterId, seed) => [
      rosterId,
      {
        rosterId,
        place: 0,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        byes: 0,
        carriedPoints: carriedPoints.get(rosterId) ?? 0,
        points: 0,
        buchholz: 0,
        eliminatedInRound: null,
        opponents: [],
        seed,
      },
    ]),
  );

  const allowedLosses =
    format === LocalBracketFormat.DOUBLE_ELIMINATION ? 2 : 1;

  for (const matchup of [...history].sort((a, b) => a.id - b.id)) {
    for (const [rosterId, outcome] of matchupOutcomes(matchup)) {
      const row = rows.get(rosterId);

      if (!row) {
        continue;
      }

      if (outcome === 'bye') {
        row.byes++;
        continue;
      }

      row.played++;
      row.opponents.push(...matchup.rosterIds.filter((id) => id !== rosterId));

      if (outcome === 'win') row.wins++;
      if (outcome === 'draw') row.draws++;
      if (outcome === 'loss') {
        row.losses++;

        if (row.losses === allowedLosses) {
          row.eliminatedInRound = matchup.round;
        }
      }
    }
  }

  for (const row of rows.values()) {
    row.points = row.carriedPoints + 3 * (row.wins + row.byes) + row.draws;
  }

  for (const row of rows.values()) {
    row.buchholz = row.opponents.reduce(
      (sum, id) => sum + (rows.get(id)?.points ?? 0),
      0,
    );
  }

  // Compared first to last; equal keys share a place
  const rankKey = (row: IStageStandingResponse): number[] =>
    isElimination(format)
      ? [row.eliminatedInRound == null ? 1 : 0, row.eliminatedInRound ?? 0]
      : [row.points, row.wins, row.buchholz];

  const compareKeys = (a: number[], b: number[]) => {
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return b[i] - a[i];
    }
    return 0;
  };

  const sorted = [...rows.values()].sort(
    (a, b) => compareKeys(rankKey(a), rankKey(b)) || a.seed - b.seed,
  );

  let place = 0;

  return sorted.map(({ opponents: _opponents, seed: _seed, ...row }, index) => {
    if (index === 0 || compareKeys(rankKey(sorted[index - 1]), rankKey(row))) {
      place = index + 1;
    }

    return { ...row, place };
  });
}
