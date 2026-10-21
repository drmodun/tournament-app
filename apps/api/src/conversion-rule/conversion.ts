// What a point conversion rule gives each entry of its source, from the source's final placings.
// Pure, so the rules can be checked without a database.

import { pointConversionStrategyEnum } from '@tournament-app/types';

export interface ConversionSettings {
  strategy: string;
  points?: number | null;
  from?: number | null;
  to?: number | null;
  minPoints?: number | null;
  maxPoints?: number | null;
  pointsPerPlace?: number | null;
}

// An entry of the source: a roster for a stage, a participation for a tournament
export interface Placing {
  id: number;
  place: number;
}

export interface ConversionOutcome {
  id: number;
  place: number;
  // Added to the entry in the destination
  points: number;
  // Gets an entry in the destination
  qualifies: boolean;
  // Seeding strategy: its seed in the destination, 1 first
  seed: number | null;
  // Elimination strategy: an entry it already has in the destination is removed
  isRemoved: boolean;
  // Qualification with a last-chance qualifier: a place after the range, which gets an entry in the
  // last-chance stage
  toLastChance: boolean;
}

// What applying a rule changed in its destinations, recorded so that it can be undone
export interface ConversionEffects {
  // Rosters it entered into destination stages
  createdRosters: number[];
  // Points it added to rosters already there
  rosterPoints: { rosterId: number; points: number }[];
  // Seeds it replaced
  seeds: { rosterId: number; previous: number | null }[];
  // Rosters it removed from a destination stage, enough to enter them again
  removedRosters: {
    stageId: number;
    participationId: number;
    points: number | null;
    seed: number | null;
    players: { userId: number; isSubstitute: boolean | null }[];
  }[];
  // Participations it entered into a destination tournament
  createdParticipations: number[];
  // Points it added to participations
  participationPoints: { participationId: number; points: number }[];
}

export const noEffects = (): ConversionEffects => ({
  createdRosters: [],
  rosterPoints: [],
  seeds: [],
  removedRosters: [],
  createdParticipations: [],
  participationPoints: [],
});

export const SUPPORTED_STRATEGIES: string[] = [
  pointConversionStrategyEnum.RANKING,
  pointConversionStrategyEnum.QUALIFICATION,
  pointConversionStrategyEnum.ELIMINATION,
  pointConversionStrategyEnum.SEED,
  pointConversionStrategyEnum.HYBRID,
  pointConversionStrategyEnum.TIE_BREAKER,
  pointConversionStrategyEnum.QUALIFICATION_WITH_LCQ,
];

const AWARDS_POINTS: string[] = [
  pointConversionStrategyEnum.RANKING,
  pointConversionStrategyEnum.HYBRID,
];

const QUALIFIES: string[] = [
  pointConversionStrategyEnum.QUALIFICATION,
  pointConversionStrategyEnum.ELIMINATION,
  pointConversionStrategyEnum.SEED,
  pointConversionStrategyEnum.HYBRID,
  pointConversionStrategyEnum.QUALIFICATION_WITH_LCQ,
];

/** Whether a place falls in the rule's range of places (`from` to `to`, both included, open-ended when unset). */
export function isInRange(rule: ConversionSettings, place: number) {
  return place >= (rule.from ?? 1) && place <= (rule.to ?? Infinity);
}

/**
 * Points for a place in range. The first place of the range gets `maxPoints` (or `points`), each place
 * after it `pointsPerPlace` fewer, never below `minPoints` (or 0). Without `pointsPerPlace` every place
 * gets the same.
 */
export function pointsForPlace(rule: ConversionSettings, place: number) {
  if (!isInRange(rule, place)) {
    return 0;
  }

  const top = rule.maxPoints ?? rule.points ?? 0;
  const value = top - (place - (rule.from ?? 1)) * (rule.pointsPerPlace ?? 0);

  return Math.max(rule.minPoints ?? 0, value);
}

/**
 * What the rule gives each placing, best first. A tie-breaker qualifies the entries in range that share
 * their place, so a tie-breaker stage can split them.
 */
export function planConversion(
  rule: ConversionSettings,
  placings: Placing[],
): ConversionOutcome[] {
  const sorted = [...placings].sort((a, b) => a.place - b.place);
  const entriesAtPlace = new Map<number, number>();
  let seed = 0;

  for (const { place } of sorted) {
    entriesAtPlace.set(place, (entriesAtPlace.get(place) ?? 0) + 1);
  }

  return sorted.map(({ id, place }) => {
    const inRange = isInRange(rule, place);
    const qualifies =
      inRange &&
      (QUALIFIES.includes(rule.strategy) ||
        (rule.strategy === pointConversionStrategyEnum.TIE_BREAKER &&
          entriesAtPlace.get(place) > 1));

    return {
      id,
      place,
      points: AWARDS_POINTS.includes(rule.strategy)
        ? pointsForPlace(rule, place)
        : 0,
      qualifies,
      seed:
        qualifies && rule.strategy === pointConversionStrategyEnum.SEED
          ? ++seed
          : null,
      isRemoved:
        !inRange && rule.strategy === pointConversionStrategyEnum.ELIMINATION,
      toLastChance:
        rule.strategy === pointConversionStrategyEnum.QUALIFICATION_WITH_LCQ &&
        place > (rule.to ?? Infinity),
    };
  });
}

/** Places from points, best first; equal points share a place. */
export function placingsByPoints(
  entries: { id: number; points: number }[],
): Placing[] {
  const sorted = [...entries].sort((a, b) => b.points - a.points);
  let place = 0;

  return sorted.map((entry, index) => {
    if (index === 0 || sorted[index - 1].points !== entry.points) {
      place = index + 1;
    }

    return { id: entry.id, place };
  });
}
