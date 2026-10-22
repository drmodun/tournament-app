import { IStageStandingResponse } from '@tournament-app/types';

export interface QuizStanding {
  rosterId: number;
  rank: number;
  score: number;
}

/**
 * Stage standings from a Vansy quiz: the place is Vansy's rank (its tie-breakers already applied),
 * and points are the quiz score plus any points carried in from an earlier stage. Rosters without
 * a ranked attempt share the place after the last ranked one, so conversion rules still see them.
 */
export function quizStandings(
  rosterIds: number[],
  results: QuizStanding[],
  carriedPoints: Map<number, number> = new Map(),
): IStageStandingResponse[] {
  const byRoster = new Map(results.map((r) => [r.rosterId, r]));
  const ranked = rosterIds.filter((id) => byRoster.has(id));
  const unranked = rosterIds.filter((id) => !byRoster.has(id));
  const lastPlace = ranked.length + 1;

  const row = (rosterId: number, place: number, score: number) => {
    const carried = carriedPoints.get(rosterId) ?? 0;
    return {
      rosterId,
      place,
      played: byRoster.has(rosterId) ? 1 : 0,
      wins: 0,
      draws: 0,
      losses: 0,
      byes: 0,
      carriedPoints: carried,
      points: carried + score,
      buchholz: 0,
      eliminatedInRound: null,
    };
  };

  return [
    ...ranked
      .map((id) => byRoster.get(id)!)
      .sort((a, b) => a.rank - b.rank || a.rosterId - b.rosterId)
      .map((r) => row(r.rosterId, r.rank, r.score)),
    ...unranked.map((id) => row(id, lastPlace, 0)),
  ];
}
