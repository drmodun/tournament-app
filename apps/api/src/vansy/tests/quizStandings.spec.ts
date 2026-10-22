import { quizStandings } from '../quizStandings';

describe('quizStandings', () => {
  it('places rosters by their Vansy rank and adds carried points to the score', () => {
    const rows = quizStandings(
      [10, 11, 12, 13],
      [
        { rosterId: 12, rank: 1, score: 40 },
        { rosterId: 10, rank: 2, score: 35 },
        { rosterId: 11, rank: 2, score: 35 },
      ],
      new Map([[10, 3]]),
    );

    expect(rows.map((r) => [r.rosterId, r.place, r.points, r.played])).toEqual([
      [12, 1, 40, 1],
      [10, 2, 38, 1],
      [11, 2, 35, 1],
      // No attempt: placed after everyone ranked
      [13, 4, 0, 0],
    ]);
    expect(rows[1].carriedPoints).toBe(3);
  });

  it('ignores results for rosters that are not in the stage', () => {
    const rows = quizStandings([1], [{ rosterId: 99, rank: 1, score: 5 }]);
    expect(rows).toEqual([
      expect.objectContaining({ rosterId: 1, place: 1, points: 0 }),
    ]);
  });
});
