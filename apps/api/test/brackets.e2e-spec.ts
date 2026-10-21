import { INestApplication } from '@nestjs/common';
import { stageTypeEnum } from '@tournament-app/types';
import {
  createApp,
  loginAs,
  lossesOf,
  lowestIdWins,
  played,
  RunMatchup,
  rosterIdsOf,
  TournamentRun,
  userPool,
} from './helpers/tournamentRun';

// Every format is run to its end through the HTTP API, the way an organiser would: entering players,
// starting the stage and posting results. The bracket logic itself is covered by the unit tests.
describe('Brackets run by the API (e2e)', () => {
  let app: INestApplication;
  let run: TournamentRun;

  beforeAll(async () => {
    app = await createApp();
    run = new TournamentRun(app, await loginAs(app, 1));
  });

  afterAll(async () => {
    await app.close();
  });

  // Creates a tournament with `count` players and one started stage of the given type
  async function startStage(stageType: stageTypeEnum, count: number) {
    const tournamentId = await run.createTournament(userPool(count));
    const stageId = await run.createStage(tournamentId, stageType);
    await run.startStage(stageId).expect(200);

    return { tournamentId, stageId };
  }

  const finishedStage = async (stageId: number) =>
    (await run.stage(stageId)).stageStatus;

  describe('single elimination', () => {
    it.each([2, 3, 4, 5, 8, 11, 16])(
      'crowns the top seed of %i players and finishes the stage',
      async (count) => {
        const { stageId } = await startStage(stageTypeEnum.KNOCKOUT, count);
        const matchups = await run.play(stageId, lowestIdWins);
        const rosters = rosterIdsOf(matchups);

        expect(rosters).toHaveLength(count);
        expect(played(matchups)).toHaveLength(count - 1);
        expect(await finishedStage(stageId)).toBe('finished');

        const { standings, isFinished, format } = await run.standings(stageId);

        expect(format).toBe('single_elimination');
        expect(isFinished).toBe(true);
        expect(standings[0]).toMatchObject({ rosterId: rosters[0], place: 1 });
        expect(standings.filter((row) => row.place === 1)).toHaveLength(1);
        // Everybody but the champion lost exactly once
        for (const rosterId of rosters.slice(1)) {
          expect(lossesOf(rosterId, matchups)).toBe(1);
        }
      },
    );

    it('lets the lowest seed win when it beats everybody', async () => {
      const { stageId } = await startStage(stageTypeEnum.KNOCKOUT, 8);
      const matchups = await run.play(stageId, (m) =>
        Math.max(...m.results.map((r) => r.id)),
      );
      const rosters = rosterIdsOf(matchups);

      const { standings } = await run.standings(stageId);

      expect(standings[0].rosterId).toBe(rosters[rosters.length - 1]);
    });

    it('gives seeds without an opponent a bye that is already finished', async () => {
      const { stageId } = await startStage(stageTypeEnum.KNOCKOUT, 5);
      const drawn = await run.matchups(stageId);

      // 5 players fill a bracket of 8: three byes and one real match in round 1
      const byes = drawn.filter((m) => m.results.length === 1);
      expect(byes).toHaveLength(3);
      expect(byes.every((m) => m.isFinished)).toBe(true);
      expect(byes.every((m) => m.results[0].isWinner)).toBe(true);
      expect(drawn.filter((m) => m.results.length === 2)).toHaveLength(1);
    });

    it('draws one round at a time', async () => {
      const { stageId } = await startStage(stageTypeEnum.KNOCKOUT, 8);
      const round1 = await run.matchups(stageId);

      expect(round1.map((m) => m.round)).toEqual([1, 1, 1, 1]);

      // All but one result: the next round is not drawn
      for (const matchup of round1.slice(0, 3)) {
        await run.score(matchup, lowestIdWins(matchup)).expect(201);
      }
      expect(await run.matchups(stageId)).toHaveLength(4);

      await run.score(round1[3], lowestIdWins(round1[3])).expect(201);
      const afterRound1 = await run.matchups(stageId);

      expect(afterRound1.filter((m) => m.round === 2)).toHaveLength(2);
    });

    it('finishes a stage of one player when it starts', async () => {
      const { stageId } = await startStage(stageTypeEnum.KNOCKOUT, 1);

      expect(await finishedStage(stageId)).toBe('finished');
      expect((await run.standings(stageId)).standings).toHaveLength(1);
    });

    it.each([stageTypeEnum.QUIZ, stageTypeEnum.EVALUATED_COMPETITION])(
      'runs %s stages as single elimination',
      async (stageType) => {
        const { stageId } = await startStage(stageType, 4);
        await run.play(stageId, lowestIdWins);

        expect(await finishedStage(stageId)).toBe('finished');
        expect((await run.standings(stageId)).format).toBe(
          'single_elimination',
        );
      },
    );
  });

  describe('double elimination', () => {
    it.each([2, 3, 4, 5, 8, 13, 16])(
      'crowns the top seed of %i players; everybody else loses twice',
      async (count) => {
        const { stageId } = await startStage(
          stageTypeEnum.DOUBLE_ELIMINATION,
          count,
        );
        const matchups = await run.play(stageId, lowestIdWins);
        const rosters = rosterIdsOf(matchups);

        expect(rosters).toHaveLength(count);
        expect(await finishedStage(stageId)).toBe('finished');
        expect(lossesOf(rosters[0], matchups)).toBe(0);

        for (const rosterId of rosters.slice(1)) {
          expect(lossesOf(rosterId, matchups)).toBe(2);
        }

        const { standings, format } = await run.standings(stageId);

        expect(format).toBe('double_elimination');
        expect(standings[0].rosterId).toBe(rosters[0]);
        expect(standings.filter((row) => row.place === 1)).toHaveLength(1);
        expect(new Set(matchups.map((m) => m.bracket).filter(Boolean))).toEqual(
          new Set(
            count === 2
              ? ['winners', 'grand_final']
              : ['winners', 'losers', 'grand_final'],
          ),
        );
      },
    );

    it('plays the grand final again when the losers-bracket player wins it', async () => {
      const { stageId } = await startStage(stageTypeEnum.DOUBLE_ELIMINATION, 4);
      const matchups = await run.play(stageId, (matchup, all) => {
        if (matchup.bracket !== 'grand_final') {
          return lowestIdWins(matchup);
        }

        const isFirstFinal = !all.some(
          (m) =>
            m.bracket === 'grand_final' && m.id !== matchup.id && m.isFinished,
        );
        const [a, b] = matchup.results.map((r) => r.id);

        // First final: the one with a loss wins; the replay goes to the top seed
        return isFirstFinal
          ? lossesOf(a, all) > lossesOf(b, all)
            ? a
            : b
          : lowestIdWins(matchup);
      });

      const finals = matchups.filter((m) => m.bracket === 'grand_final');

      expect(finals).toHaveLength(2);
      expect(await finishedStage(stageId)).toBe('finished');
    });

    it('keeps playing the winners and losers brackets side by side', async () => {
      const { stageId } = await startStage(stageTypeEnum.DOUBLE_ELIMINATION, 8);
      const round1 = await run.matchups(stageId);

      expect(round1.every((m) => m.bracket === 'winners')).toBe(true);

      for (const matchup of round1) {
        await run.score(matchup, lowestIdWins(matchup)).expect(201);
      }

      const round2 = (await run.matchups(stageId)).filter((m) => m.round === 2);

      expect(round2.filter((m) => m.bracket === 'winners')).toHaveLength(2);
      expect(round2.filter((m) => m.bracket === 'losers')).toHaveLength(2);
    });
  });

  describe('triple elimination', () => {
    it.each([2, 3, 4, 5, 8, 11, 16])(
      'crowns the top seed of %i players; everybody else loses three times',
      async (count) => {
        const { stageId } = await startStage(
          stageTypeEnum.TRIPLE_ELIMINATION,
          count,
        );
        const matchups = await run.play(stageId, lowestIdWins);
        const rosters = rosterIdsOf(matchups);

        expect(rosters).toHaveLength(count);
        expect(await finishedStage(stageId)).toBe('finished');
        expect(lossesOf(rosters[0], matchups)).toBe(0);

        for (const rosterId of rosters.slice(1)) {
          expect(lossesOf(rosterId, matchups)).toBe(3);
        }

        const { standings, format } = await run.standings(stageId);

        expect(format).toBe('triple_elimination');
        expect(standings[0].rosterId).toBe(rosters[0]);
      },
    );

    it('uses winners, losers, last-chance and grand-final brackets', async () => {
      const { stageId } = await startStage(stageTypeEnum.TRIPLE_ELIMINATION, 8);
      const matchups = await run.play(stageId, lowestIdWins);

      expect(new Set(matchups.map((m) => m.bracket).filter(Boolean))).toEqual(
        new Set(['winners', 'losers', 'last_chance', 'grand_final']),
      );
    });

    it('does not stall when an upset keeps every group down to one player', async () => {
      const { stageId } = await startStage(stageTypeEnum.TRIPLE_ELIMINATION, 6);
      // The weakest player always wins: losses spread out in every possible way
      const matchups = await run.play(stageId, (m) =>
        Math.max(...m.results.map((r) => r.id)),
      );

      expect(await finishedStage(stageId)).toBe('finished');
      expect(rosterIdsOf(matchups)).toHaveLength(6);
    });
  });

  describe('compass', () => {
    it.each([2, 3, 4, 5, 8, 9, 13, 16])(
      'places all %i players, the top seed first',
      async (count) => {
        const { stageId } = await startStage(stageTypeEnum.COMPASS, count);
        const matchups = await run.play(stageId, lowestIdWins);
        const rosters = rosterIdsOf(matchups);

        expect(rosters).toHaveLength(count);
        expect(await finishedStage(stageId)).toBe('finished');

        const { standings, format } = await run.standings(stageId);

        expect(format).toBe('compass');
        expect(standings).toHaveLength(count);
        expect(standings[0]).toMatchObject({ rosterId: rosters[0], place: 1 });
        expect(standings.filter((row) => row.place === 1)).toHaveLength(1);
        // Nobody is knocked out of the compass before it ends: everybody keeps playing
        expect(standings.every((row) => row.played >= 1)).toBe(true);
      },
    );

    it('plays east, west, north and southwest with 8 players', async () => {
      const { stageId } = await startStage(stageTypeEnum.COMPASS, 8);
      const matchups = await run.play(stageId, lowestIdWins);
      const inBracket = (bracket: string) =>
        matchups.filter((m) => m.bracket === bracket).length;

      expect(inBracket('east')).toBe(7);
      expect(inBracket('west')).toBe(3);
      expect(inBracket('north')).toBe(1);
      expect(inBracket('southwest')).toBe(1);
      expect(matchups).toHaveLength(12);

      // Everybody plays three matches
      for (const rosterId of rosterIdsOf(matchups)) {
        expect(
          matchups.filter((m) => m.results.some((r) => r.id === rosterId)),
        ).toHaveLength(3);
      }
    });

    it('fills all eight brackets with 16 players', async () => {
      const { stageId } = await startStage(stageTypeEnum.COMPASS, 16);
      const matchups = await run.play(stageId, lowestIdWins);
      const inBracket = (bracket: string) =>
        matchups.filter((m) => m.bracket === bracket).length;

      expect(
        Object.fromEntries(
          [
            'east',
            'west',
            'north',
            'south',
            'northeast',
            'northwest',
            'southeast',
            'southwest',
          ].map((bracket) => [bracket, inBracket(bracket)]),
        ),
      ).toEqual({
        east: 15,
        west: 7,
        north: 3,
        south: 1,
        northeast: 1,
        northwest: 1,
        southeast: 1,
        southwest: 3,
      });
    });

    it('sends the loser of an east round into the next bracket', async () => {
      const { stageId } = await startStage(stageTypeEnum.COMPASS, 8);
      const round1 = await run.matchups(stageId);
      const losers: number[] = [];

      for (const matchup of round1) {
        const winner = lowestIdWins(matchup) as number;
        losers.push(matchup.results.find((r) => r.id !== winner)!.id);
        await run.score(matchup, winner).expect(201);
      }

      const round2 = await run.matchups(stageId);
      const west = round2.filter((m) => m.round === 2 && m.bracket === 'west');

      expect(west).toHaveLength(2);
      expect(rosterIdsOf(west)).toEqual([...losers].sort((a, b) => a - b));
    });

    it('ranks a player that left the east later above one that left earlier', async () => {
      const { stageId } = await startStage(stageTypeEnum.COMPASS, 8);
      const matchups = await run.play(stageId, lowestIdWins);
      const { standings } = await run.standings(stageId);
      const placeOf = (rosterId: number) =>
        standings.find((s) => s.rosterId === rosterId)!.place;
      const losersOfEastRound = (round: number) =>
        matchups
          .filter((m) => m.bracket === 'east' && m.round === round)
          .map((m) => m.results.find((r) => !r.isWinner)!.id);

      const [runnerUp] = losersOfEastRound(3);

      expect(placeOf(runnerUp)).toBe(2);

      for (const semiFinalLoser of losersOfEastRound(2)) {
        for (const firstRoundLoser of losersOfEastRound(1)) {
          expect(placeOf(semiFinalLoser)).toBeLessThan(
            placeOf(firstRoundLoser),
          );
        }
      }
    });
  });

  describe.each([
    [stageTypeEnum.ROUND_ROBIN],
    [stageTypeEnum.GROUP],
    [stageTypeEnum.FIXTURE],
  ])('round robin (%s)', (stageType) => {
    it.each([2, 4, 5, 6])(
      'has every pair of %i players meet exactly once',
      async (count) => {
        const { stageId } = await startStage(stageType, count);
        const drawn = await run.matchups(stageId);

        // The whole schedule is drawn at the start
        expect(drawn).toHaveLength((count * (count - 1)) / 2);

        const pairs = drawn.map((m) =>
          m.results
            .map((r) => r.id)
            .sort((a, b) => a - b)
            .join('-'),
        );

        expect(new Set(pairs).size).toBe(pairs.length);
        expect(await finishedStage(stageId)).toBe('ongoing');
      },
    );

    it('ranks by points and finishes with the last result', async () => {
      const { stageId } = await startStage(stageType, 4);
      const drawn = await run.matchups(stageId);

      // Results may be entered in any order; reverse order here
      for (const matchup of [...drawn].reverse()) {
        expect(await finishedStage(stageId)).toBe('ongoing');
        await run.score(matchup, lowestIdWins(matchup)).expect(201);
      }

      expect(await finishedStage(stageId)).toBe('finished');

      const { standings, format } = await run.standings(stageId);
      const rosters = rosterIdsOf(drawn);

      expect(format).toBe('round_robin');
      expect(standings.map((row) => row.rosterId)).toEqual(rosters);
      expect(standings.map((row) => row.points)).toEqual([9, 6, 3, 0]);
      expect(standings.map((row) => row.place)).toEqual([1, 2, 3, 4]);
    });

    it('shares places when every match is a draw', async () => {
      const { stageId } = await startStage(stageType, 4);

      await run.play(stageId, () => 'draw');

      const { standings } = await run.standings(stageId);

      expect(await finishedStage(stageId)).toBe('finished');
      expect(standings.every((row) => row.place === 1)).toBe(true);
      expect(
        standings.every((row) => row.points === 3 && row.draws === 3),
      ).toBe(true);
    });
  });

  describe('swiss', () => {
    const meetings = (matchups: RunMatchup[]) =>
      played(matchups).map((m) =>
        m.results
          .map((r) => r.id)
          .sort((a, b) => a - b)
          .join('-'),
      );

    it('plays three rounds for 8 players without rematches', async () => {
      const { stageId } = await startStage(stageTypeEnum.SWISS, 8);
      const matchups = await run.play(stageId, lowestIdWins);
      const rosters = rosterIdsOf(matchups);

      expect(Math.max(...matchups.map((m) => m.round))).toBe(3);
      expect(played(matchups)).toHaveLength(12);
      expect(new Set(meetings(matchups)).size).toBe(12);
      expect(await finishedStage(stageId)).toBe('finished');

      const { standings, format } = await run.standings(stageId);

      expect(format).toBe('swiss');
      expect(standings[0]).toMatchObject({
        rosterId: rosters[0],
        place: 1,
        wins: 3,
        points: 9,
      });
    });

    it('pairs the top half of the seeds with the bottom half in round 1', async () => {
      const { stageId } = await startStage(stageTypeEnum.SWISS, 8);
      const round1 = await run.matchups(stageId);

      expect(round1).toHaveLength(4);
      // Each pair has one player from the top four seeds and one from the bottom four
      const rosters = rosterIdsOf(round1);
      expect(
        new Set(round1.flatMap((m) => m.results.map((r) => r.id))).size,
      ).toBe(rosters.length);
    });

    it('gives each odd player out one bye and never two', async () => {
      const { stageId } = await startStage(stageTypeEnum.SWISS, 5);
      const matchups = await run.play(stageId, lowestIdWins);
      const byes = matchups.filter((m) => m.results.length === 1);
      const byeRosters = byes.map((m) => m.results[0].id);

      // 5 players: one bye per round, three rounds
      expect(byes).toHaveLength(3);
      expect(new Set(byeRosters).size).toBe(3);
      expect(new Set(meetings(matchups)).size).toBe(meetings(matchups).length);
      expect(await finishedStage(stageId)).toBe('finished');
    });

    it('counts draws', async () => {
      const { stageId } = await startStage(stageTypeEnum.SWISS, 4);

      await run.play(stageId, () => 'draw');

      const { standings } = await run.standings(stageId);

      expect(await finishedStage(stageId)).toBe('finished');
      expect(
        standings.every((row) => row.draws === 2 && row.points === 2),
      ).toBe(true);
    });
  });

  it('says a stage run by the API does not run on Challonge', async () => {
    const { stageId } = await startStage(stageTypeEnum.COMPASS, 4);

    expect((await run.standings(stageId)).runsOnChallonge).toBe(false);
  });

  it('runs a stage on the API even though a tournament id would be set by Challonge', async () => {
    const { stageId } = await startStage(stageTypeEnum.KNOCKOUT, 4);

    expect((await run.stage(stageId)).challongeTournamentId).toBeNull();
  });
});
