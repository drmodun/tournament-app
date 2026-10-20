import {
  bracketFormatFor,
  computeStandings,
  doubleEliminationFirstRound,
  doubleEliminationNextRound,
  LocalBracketFormat,
  LocalMatchup,
  matchupOutcomes,
  pairAvoidingRematches,
  roundRobinRounds,
  swissFirstRound,
  swissNextRound,
  swissRoundCount,
} from '../bracketFormats';

let nextId = 1;

const played = (
  round: number,
  rosterIds: number[],
  winners: number[],
  bracket: string | null = null,
): LocalMatchup => ({
  id: nextId++,
  round,
  bracket,
  isFinished: true,
  rosterIds,
  winners,
});

const pairKey = (pair: number[]) => [...pair].sort((a, b) => a - b).join('-');

// Plays a double-elimination stage to the end; `beats(a, b)` decides each matchup
function playDoubleElimination(
  seeds: number[],
  beats: (a: number, b: number) => boolean,
) {
  const history: LocalMatchup[] = [];
  let pairings = doubleEliminationFirstRound(seeds);
  let round = 1;

  while (pairings.length) {
    for (const { rosterIds, bracket } of pairings) {
      const winner =
        rosterIds.length === 1
          ? rosterIds[0]
          : beats(rosterIds[0], rosterIds[1])
            ? rosterIds[0]
            : rosterIds[1];
      history.push(played(round, rosterIds, [winner], bracket));
    }

    const next = doubleEliminationNextRound(seeds, history);
    if (next.championId != null) {
      return { history, championId: next.championId, rounds: round };
    }

    pairings = next.pairings;
    round++;
  }

  throw new Error('The bracket stopped without a champion');
}

describe('bracketFormats', () => {
  beforeEach(() => {
    nextId = 1;
  });

  describe('bracketFormatFor', () => {
    it('maps stage types to the formats the API runs', () => {
      expect(bracketFormatFor('knockout')).toBe(
        LocalBracketFormat.SINGLE_ELIMINATION,
      );
      expect(bracketFormatFor('double_elimination')).toBe(
        LocalBracketFormat.DOUBLE_ELIMINATION,
      );
      expect(bracketFormatFor('round_robin')).toBe(
        LocalBracketFormat.ROUND_ROBIN,
      );
      expect(bracketFormatFor('group')).toBe(LocalBracketFormat.ROUND_ROBIN);
      expect(bracketFormatFor('fixture')).toBe(LocalBracketFormat.ROUND_ROBIN);
      expect(bracketFormatFor('swiss')).toBe(LocalBracketFormat.SWISS);
    });

    it('runs formats without their own logic as single elimination', () => {
      for (const stageType of ['compass', 'triple_elimination', 'quiz', null]) {
        expect(bracketFormatFor(stageType)).toBe(
          LocalBracketFormat.SINGLE_ELIMINATION,
        );
      }
    });
  });

  describe('matchupOutcomes', () => {
    it('reads wins, losses, draws and byes', () => {
      expect([...matchupOutcomes(played(1, [1, 2], [1]))]).toEqual([
        [1, 'win'],
        [2, 'loss'],
      ]);
      expect([...matchupOutcomes(played(1, [1, 2], []))]).toEqual([
        [1, 'draw'],
        [2, 'draw'],
      ]);
      expect([...matchupOutcomes(played(1, [1, 2], [1, 2]))]).toEqual([
        [1, 'draw'],
        [2, 'draw'],
      ]);
      expect([...matchupOutcomes(played(1, [1], [1]))]).toEqual([[1, 'bye']]);
    });

    it('ignores unfinished matchups', () => {
      expect(
        matchupOutcomes({ ...played(1, [1, 2], []), isFinished: false }).size,
      ).toBe(0);
    });
  });

  describe('roundRobinRounds', () => {
    it.each([2, 3, 4, 5, 8])(
      'has every pair of %i rosters meet exactly once',
      (count) => {
        const ids = Array.from({ length: count }, (_, i) => i + 1);
        const rounds = roundRobinRounds(ids);
        const pairs = rounds.flat().map(pairKey);

        expect(pairs).toHaveLength((count * (count - 1)) / 2);
        expect(new Set(pairs).size).toBe(pairs.length);
        expect(rounds).toHaveLength(count % 2 ? count : count - 1);

        // Nobody plays twice in a round
        for (const round of rounds) {
          const players = round.flat();
          expect(new Set(players).size).toBe(players.length);
        }
      },
    );

    it('needs two rosters', () => {
      expect(roundRobinRounds([1])).toEqual([]);
    });
  });

  describe('Swiss', () => {
    it('plays enough rounds to leave one unbeaten roster', () => {
      expect(swissRoundCount(1)).toBe(0);
      expect(swissRoundCount(2)).toBe(1);
      expect(swissRoundCount(5)).toBe(3);
      expect(swissRoundCount(8)).toBe(3);
    });

    it('pairs the top half of the seeds with the bottom half in round 1', () => {
      expect(swissFirstRound([1, 2, 3, 4])).toEqual([
        { rosterIds: [1, 3] },
        { rosterIds: [2, 4] },
      ]);
    });

    it('gives the lowest seed the bye in round 1', () => {
      expect(swissFirstRound([1, 2, 3])).toEqual([
        { rosterIds: [1, 2] },
        { rosterIds: [3] },
      ]);
    });

    it('avoids rematches and repeated byes', () => {
      const history = [played(1, [1, 2], [1]), played(1, [3], [3])];

      const pairings = swissNextRound([1, 3, 2], history);

      expect(pairings).toEqual([{ rosterIds: [1, 3] }, { rosterIds: [2] }]);
    });
  });

  describe('pairAvoidingRematches', () => {
    it('backtracks to avoid a rematch', () => {
      const met = new Set(['2-3']);
      const pairs = pairAvoidingRematches([1, 2, 3, 4], (a, b) =>
        met.has(pairKey([a, b])),
      );

      expect(pairs).toEqual([
        [1, 2],
        [3, 4],
      ]);

      const met2 = new Set(['1-2', '3-4']);
      expect(
        pairAvoidingRematches([1, 2, 3, 4], (a, b) =>
          met2.has(pairKey([a, b])),
        ),
      ).toEqual([
        [1, 3],
        [2, 4],
      ]);
    });

    it('falls back to neighbours when every pairing is a rematch', () => {
      expect(pairAvoidingRematches([1, 2], () => true)).toEqual([[1, 2]]);
    });
  });

  describe('double elimination', () => {
    it.each([2, 3, 4, 5, 6, 7, 8, 13, 16])(
      'crowns the top seed of %i rosters when the better seed always wins',
      (count) => {
        const seeds = Array.from({ length: count }, (_, i) => i + 1);
        const { history, championId } = playDoubleElimination(
          seeds,
          (a, b) => a < b,
        );

        expect(championId).toBe(1);

        // Everyone else lost twice, the champion never
        const losses = new Map<number, number>();
        for (const matchup of history) {
          for (const [id, outcome] of matchupOutcomes(matchup)) {
            if (outcome === 'loss') losses.set(id, (losses.get(id) ?? 0) + 1);
          }
        }
        expect(losses.get(1) ?? 0).toBe(0);
        for (const id of seeds.slice(1)) {
          expect(losses.get(id)).toBe(2);
        }

        // Nobody plays twice in a round
        const byRound = new Map<number, number[]>();
        for (const matchup of history) {
          byRound.set(matchup.round, [
            ...(byRound.get(matchup.round) ?? []),
            ...matchup.rosterIds,
          ]);
        }
        for (const players of byRound.values()) {
          expect(new Set(players).size).toBe(players.length);
        }
      },
    );

    it('replays the grand final when the losers-bracket roster wins it', () => {
      // Seed 2 loses round 1 to seed 1, then beats it in the grand final and the reset
      let calls = 0;
      const { history, championId } = playDoubleElimination([1, 2], (a) =>
        calls++ === 0 ? a === 1 : a === 2,
      );

      expect(championId).toBe(2);
      expect(history.filter((m) => m.bracket === 'grand_final').length).toBe(2);
    });

    it('starts in the winners bracket with seeded byes', () => {
      expect(doubleEliminationFirstRound([1, 2, 3])).toEqual([
        { rosterIds: [1], bracket: 'winners' },
        { rosterIds: [2, 3], bracket: 'winners' },
      ]);
    });
  });

  describe('computeStandings', () => {
    it('ranks a round robin by points, then wins, sharing equal places', () => {
      const history = [
        played(1, [1, 2], [1]),
        played(1, [3, 4], []),
        played(2, [1, 3], [3]),
        played(2, [2, 4], [2]),
        played(3, [1, 4], [1]),
        played(3, [2, 3], [2]),
      ];

      const standings = computeStandings(
        LocalBracketFormat.ROUND_ROBIN,
        [1, 2, 3, 4],
        history,
      );

      expect(
        standings.map(({ rosterId, place, points }) => [
          rosterId,
          place,
          points,
        ]),
      ).toEqual([
        [1, 1, 6],
        [2, 1, 6],
        [3, 3, 4],
        [4, 4, 1],
      ]);
    });

    it('adds carried points and counts byes as wins', () => {
      const standings = computeStandings(
        LocalBracketFormat.SWISS,
        [1, 2, 3],
        [played(1, [1, 2], [1]), played(1, [3], [3])],
        new Map([[2, 5]]),
      );

      expect(standings.map((row) => [row.rosterId, row.points])).toEqual([
        [2, 5],
        [1, 3],
        [3, 3],
      ]);
      expect(standings.find((row) => row.rosterId === 3)).toMatchObject({
        byes: 1,
        played: 0,
      });
    });

    it('ranks an elimination bracket by how long each roster lasted', () => {
      const history = [
        played(1, [1, 4], [1]),
        played(1, [2, 3], [2]),
        played(2, [1, 2], [1]),
      ];

      const standings = computeStandings(
        LocalBracketFormat.SINGLE_ELIMINATION,
        [1, 2, 3, 4],
        history,
      );

      expect(
        standings.map(({ rosterId, place, eliminatedInRound }) => [
          rosterId,
          place,
          eliminatedInRound,
        ]),
      ).toEqual([
        [1, 1, null],
        [2, 2, 2],
        [3, 3, 1],
        [4, 3, 1],
      ]);
    });

    it('counts two losses in double elimination', () => {
      const history = [played(1, [1, 2], [1]), played(2, [1, 2], [2])];

      const standings = computeStandings(
        LocalBracketFormat.DOUBLE_ELIMINATION,
        [1, 2],
        history,
      );

      expect(standings.every((row) => row.eliminatedInRound == null)).toBe(
        true,
      );
    });
  });
});
