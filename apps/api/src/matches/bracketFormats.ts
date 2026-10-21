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
  TRIPLE_ELIMINATION = 'triple_elimination',
  COMPASS = 'compass',
  ROUND_ROBIN = 'round_robin',
  SWISS = 'swiss',
}

// Quiz and evaluated stages have no format of their own here and run as single elimination
export function bracketFormatFor(
  stageType?: string | null,
): LocalBracketFormat {
  switch (stageType) {
    case stageTypeEnum.DOUBLE_ELIMINATION:
      return LocalBracketFormat.DOUBLE_ELIMINATION;
    case stageTypeEnum.TRIPLE_ELIMINATION:
      return LocalBracketFormat.TRIPLE_ELIMINATION;
    case stageTypeEnum.COMPASS:
      return LocalBracketFormat.COMPASS;
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
    format === LocalBracketFormat.DOUBLE_ELIMINATION ||
    format === LocalBracketFormat.TRIPLE_ELIMINATION ||
    format === LocalBracketFormat.COMPASS
  );
}

/** Losses that knock a roster out of a loss-counting elimination format; compass never does. */
function allowedLossesOf(format: LocalBracketFormat) {
  switch (format) {
    case LocalBracketFormat.TRIPLE_ELIMINATION:
      return 3;
    case LocalBracketFormat.DOUBLE_ELIMINATION:
      return 2;
    default:
      return 1;
  }
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

/** Double and triple elimination round 1 is a seeded single-elimination round in the winners bracket. */
export function doubleEliminationFirstRound(
  rosterIdsBySeed: number[],
): Pairing[] {
  return firstRoundPairings(rosterIdsBySeed).map((rosterIds) => ({
    rosterIds,
    bracket: matchupBracketEnum.WINNERS,
  }));
}

const bracketByLosses = [
  matchupBracketEnum.WINNERS,
  matchupBracketEnum.LOSERS,
  matchupBracketEnum.LAST_CHANCE,
];

/**
 * The next round of a format where a roster is out after `maxLosses` losses, from every matchup
 * played so far. Rosters play against others with the same number of losses, each group in its own
 * bracket. When two rosters are left they meet in the grand final; if the roster with more losses
 * wins it, the final is played again. A group with a single roster waits for the others to catch up.
 */
function lossCountingNextRound(
  rosterIdsBySeed: number[],
  history: LocalMatchup[],
  maxLosses: number,
): DoubleEliminationRound {
  const losses = new Map(rosterIdsBySeed.map((id) => [id, 0]));
  const lastWin = new Map<number, number>();

  for (const matchup of [...history].sort((a, b) => a.id - b.id)) {
    for (const [rosterId, outcome] of matchupOutcomes(matchup)) {
      if (outcome === 'loss') {
        losses.set(rosterId, (losses.get(rosterId) ?? 0) + 1);
      } else if (outcome === 'win' || outcome === 'bye') {
        // Bracket order follows the matchups won; a draw wins nothing
        lastWin.set(rosterId, matchup.id);
      }
    }
  }

  const alive = rosterIdsBySeed.filter((id) => losses.get(id) < maxLosses);

  if (alive.length <= 1) {
    return { pairings: [], championId: alive[0] };
  }

  const groups = Array.from({ length: maxLosses }, (_, lossCount) =>
    alive.filter((id) => losses.get(id) === lossCount),
  );

  if (alive.length === 2 && groups[0].length <= 1) {
    return {
      pairings: [
        {
          rosterIds: groups.flat(),
          bracket: matchupBracketEnum.GRAND_FINAL,
        },
      ],
    };
  }

  const pairings: Pairing[] = [];

  // Rosters without a loss stay in bracket order: the order of the matchups they last won
  if (groups[0].length >= 2) {
    const ordered = [...groups[0]].sort(
      (a, b) => (lastWin.get(a) ?? 0) - (lastWin.get(b) ?? 0),
    );

    for (const rosterIds of nextRoundPairings(ordered)) {
      pairings.push({ rosterIds, bracket: bracketByLosses[0] });
    }
  }

  for (let lossCount = 1; lossCount < maxLosses; lossCount++) {
    if (groups[lossCount].length < 2) {
      continue;
    }

    const { bye, rest } = takeBye(groups[lossCount], history);

    for (const rosterIds of pairAvoidingRematches(rest, meetings(history))) {
      pairings.push({ rosterIds, bracket: bracketByLosses[lossCount] });
    }

    if (bye != null) {
      pairings.push({
        rosterIds: [bye],
        bracket: bracketByLosses[lossCount],
      });
    }
  }

  // Every group has a single roster: the two with the most losses play each other
  if (!pairings.length) {
    const [first, second] = [...alive].sort(
      (a, b) => losses.get(b) - losses.get(a),
    );

    pairings.push({
      rosterIds: [first, second],
      bracket: bracketByLosses[losses.get(first)],
    });
  }

  return { pairings };
}

/** The next double-elimination round: winners bracket, losers bracket, then the grand final. */
export function doubleEliminationNextRound(
  rosterIdsBySeed: number[],
  history: LocalMatchup[],
): DoubleEliminationRound {
  return lossCountingNextRound(rosterIdsBySeed, history, 2);
}

/** The next triple-elimination round: winners, losers and last-chance brackets, then the grand final. */
export function tripleEliminationNextRound(
  rosterIdsBySeed: number[],
  history: LocalMatchup[],
): DoubleEliminationRound {
  return lossCountingNextRound(rosterIdsBySeed, history, 3);
}

/**
 * Where the losers of a compass bracket go: the loser of a bracket's n-th round plays on in the
 * n-th bracket listed here. Losing the last round, or a round with no bracket listed, ends the
 * run. With 16 rosters this fills all eight brackets; fewer rosters use fewer of them.
 */
export const COMPASS_DROPS: Record<string, matchupBracketEnum[]> = {
  [matchupBracketEnum.EAST]: [
    matchupBracketEnum.WEST,
    matchupBracketEnum.NORTH,
    matchupBracketEnum.SOUTH,
  ],
  [matchupBracketEnum.WEST]: [
    matchupBracketEnum.SOUTHWEST,
    matchupBracketEnum.NORTHWEST,
  ],
  [matchupBracketEnum.NORTH]: [matchupBracketEnum.NORTHEAST],
  [matchupBracketEnum.SOUTHWEST]: [matchupBracketEnum.SOUTHEAST],
};

interface CompassState {
  bracket: string;
  // Rounds played in the current bracket, byes included
  played: number;
  isOut: boolean;
  // Rounds played in each bracket the roster lost in, the way down; compared first to last
  path: number[];
  lastMatchupId: number;
}

// Where every roster stands after the matchups played so far
function compassStates(rosterIdsBySeed: number[], history: LocalMatchup[]) {
  const states = new Map<number, CompassState>(
    rosterIdsBySeed.map((id) => [
      id,
      {
        bracket: matchupBracketEnum.EAST,
        played: 0,
        isOut: false,
        path: [],
        lastMatchupId: 0,
      },
    ]),
  );

  for (const matchup of [...history].sort((a, b) => a.id - b.id)) {
    for (const [rosterId, outcome] of matchupOutcomes(matchup)) {
      const state = states.get(rosterId);

      if (!state) {
        continue;
      }

      state.played++;
      state.lastMatchupId = matchup.id;

      if (outcome !== 'loss') {
        continue;
      }

      state.path.push(state.played);

      const next = COMPASS_DROPS[state.bracket]?.[state.played - 1];

      if (next) {
        state.bracket = next;
        state.played = 0;
      } else {
        state.isOut = true;
      }
    }
  }

  return states;
}

/** Compass round 1: a seeded single-elimination round in the east bracket. */
export function compassFirstRound(rosterIdsBySeed: number[]): Pairing[] {
  return firstRoundPairings(rosterIdsBySeed).map((rosterIds) => ({
    rosterIds,
    bracket: matchupBracketEnum.EAST,
  }));
}

/**
 * The next compass round, from every matchup played so far. Each bracket plays single elimination
 * among the rosters in it; the loser of a round drops into the bracket COMPASS_DROPS names. A
 * bracket with one roster has nothing to play (everything drops in at the same time), and the stage
 * is over when no bracket has a matchup left.
 */
export function compassNextRound(
  rosterIdsBySeed: number[],
  history: LocalMatchup[],
): DoubleEliminationRound {
  const states = compassStates(rosterIdsBySeed, history);
  const seedOf = new Map(rosterIdsBySeed.map((id, seed) => [id, seed]));
  const inBracket = new Map<string, number[]>();

  for (const [rosterId, state] of states) {
    if (!state.isOut) {
      inBracket.set(state.bracket, [
        ...(inBracket.get(state.bracket) ?? []),
        rosterId,
      ]);
    }
  }

  const pairings: Pairing[] = [];

  for (const [bracket, rosterIds] of inBracket) {
    if (rosterIds.length < 2) {
      continue;
    }

    // Bracket order: by the matchup each roster last played; newcomers by seed
    const ordered = [...rosterIds].sort(
      (a, b) =>
        states.get(a).lastMatchupId - states.get(b).lastMatchupId ||
        seedOf.get(a) - seedOf.get(b),
    );

    for (const pair of nextRoundPairings(ordered)) {
      pairings.push({
        rosterIds: pair,
        bracket: bracket as matchupBracketEnum,
      });
    }
  }

  return { pairings };
}

// Compared first to last; larger is better. Rosters that are still in play beat any that are out.
function compassRankKey(state: CompassState) {
  return state.isOut ? state.path : [...state.path, Infinity];
}

/**
 * Standings of a locally run stage, best first. Round robin and Swiss rank by points (carried
 * points, plus 3 per win or bye and 1 per draw), then wins, then Buchholz. Elimination formats rank
 * by how long a roster lasted; in compass, by how far down the compass it dropped, then how long it
 * lasted there. Rosters with equal records share a place; seeds only order them.
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

  const allowedLosses = allowedLossesOf(format);
  const compass =
    format === LocalBracketFormat.COMPASS
      ? compassStates(rosterIdsBySeed, history)
      : null;

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

        if (
          compass ? compass.get(rosterId)?.isOut : row.losses === allowedLosses
        ) {
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
  const rankKey = (row: IStageStandingResponse): number[] => {
    if (compass) {
      return compassRankKey(compass.get(row.rosterId));
    }

    return isElimination(format)
      ? [row.eliminatedInRound == null ? 1 : 0, row.eliminatedInRound ?? 0]
      : [row.points, row.wins, row.buchholz];
  };

  // Keys of different lengths: a missing entry ranks below any present one
  const compareKeys = (a: number[], b: number[]) => {
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      const left = a[i] ?? -1;
      const right = b[i] ?? -1;

      if (left !== right) return right - left;
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
