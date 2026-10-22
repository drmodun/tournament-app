import { INestApplication } from '@nestjs/common';
import { stageTypeEnum } from '@tournament-app/types';
import request from 'supertest';
import {
  createApp,
  loginAs,
  lowestIdWins,
  played,
  RunMatchup,
  TournamentRun,
  userPool,
} from './helpers/tournamentRun';

interface RosterRound {
  rosterId: number;
  roundId: number;
  stageId: number;
  roundNumber: number;
  score: number;
  isWinner: boolean;
}

// roster_round is derived from matchup results, so it is checked against them after every change
describe('Roster rounds (e2e)', () => {
  let app: INestApplication;
  let run: TournamentRun;

  beforeAll(async () => {
    app = await createApp();
    run = new TournamentRun(app, await loginAs(app, 1));
  });

  afterAll(async () => {
    await app.close();
  });

  const rosterRounds = async (query: string): Promise<RosterRound[]> =>
    (
      await request(app.getHttpServer())
        .get(`/roster-rounds?pageSize=100&${query}`)
        .expect(200)
    ).body.results;

  async function startStage(stageType: stageTypeEnum, count: number) {
    const tournamentId = await run.createTournament(userPool(count));
    const stageId = await run.createStage(tournamentId, stageType);
    await run.startStage(stageId).expect(200);

    return stageId;
  }

  // One row per roster for every finished matchup it was in, keyed by round
  const expectedRows = (matchups: RunMatchup[]) =>
    matchups
      .filter((m) => m.isFinished)
      .flatMap((m) =>
        m.results.map((r) => ({
          rosterId: r.id,
          roundNumber: m.round,
          isWinner: r.isWinner,
        })),
      )
      .sort((a, b) => a.roundNumber - b.roundNumber || a.rosterId - b.rosterId);

  const rowsOf = (rows: RosterRound[]) =>
    rows
      .map(({ rosterId, roundNumber, isWinner }) => ({
        rosterId,
        roundNumber,
        isWinner,
      }))
      .sort((a, b) => a.roundNumber - b.roundNumber || a.rosterId - b.rosterId);

  it('follows a single-elimination stage played to its end, byes included', async () => {
    const stageId = await startStage(stageTypeEnum.KNOCKOUT, 5);
    const matchups = await run.play(stageId, lowestIdWins);

    const rows = await rosterRounds(`stageId=${stageId}`);

    expect(rowsOf(rows)).toEqual(expectedRows(matchups));
    expect(rows.every((row) => row.stageId === stageId)).toBe(true);
    // Sorted by round
    expect(rows.map((row) => row.roundNumber)).toEqual(
      [...rows.map((row) => row.roundNumber)].sort((a, b) => a - b),
    );
    // A win in a played matchup scores the point the result gave it; a bye scores nothing
    const byes = matchups.filter((m) => m.results.length === 1);
    expect(byes.length).toBeGreaterThan(0);
    for (const bye of byes) {
      expect(rows).toContainEqual(
        expect.objectContaining({
          rosterId: bye.results[0].id,
          roundNumber: bye.round,
          score: 0,
          isWinner: true,
        }),
      );
    }
    for (const matchup of played(matchups)) {
      const winner = matchup.results.find((r) => r.isWinner)!;
      expect(rows).toContainEqual(
        expect.objectContaining({
          rosterId: winner.id,
          roundNumber: matchup.round,
          score: 1,
        }),
      );
    }
  });

  it('filters by roster, round and winners', async () => {
    const stageId = await startStage(stageTypeEnum.KNOCKOUT, 4);
    const matchups = await run.play(stageId, lowestIdWins);
    const champion = Math.min(
      ...matchups.flatMap((m) => m.results.map((r) => r.id)),
    );

    const ofChampion = await rosterRounds(`rosterId=${champion}`);
    expect(ofChampion.map((row) => row.roundNumber)).toEqual([1, 2]);
    expect(ofChampion.every((row) => row.isWinner)).toBe(true);

    const firstRound = await rosterRounds(`stageId=${stageId}&roundNumber=1`);
    expect(firstRound).toHaveLength(4);

    const losers = await rosterRounds(`stageId=${stageId}&isWinner=false`);
    expect(losers).toHaveLength(3);
    expect(losers.every((row) => !row.isWinner)).toBe(true);
  });

  it('follows corrected and deleted results', async () => {
    const stageId = await startStage(stageTypeEnum.ROUND_ROBIN, 3);
    let matchups = await run.matchups(stageId);
    const first = played(matchups).sort((a, b) => a.id - b.id)[0];
    const [low, high] = first.results.map((r) => r.id).sort((a, b) => a - b);

    await run.score(first, low).expect(201);
    expect(
      await rosterRounds(`stageId=${stageId}&roundNumber=${first.round}`),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ rosterId: low, isWinner: true, score: 1 }),
        expect.objectContaining({ rosterId: high, isWinner: false, score: 0 }),
      ]),
    );

    await run.updateScore(first, high).expect(200);
    expect(
      await rosterRounds(`stageId=${stageId}&roundNumber=${first.round}`),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ rosterId: low, isWinner: false, score: 0 }),
        expect.objectContaining({ rosterId: high, isWinner: true, score: 1 }),
      ]),
    );

    await run.updateScore(first, 'draw').expect(200);
    const drawn = await rosterRounds(
      `stageId=${stageId}&roundNumber=${first.round}&rosterId=${low}`,
    );
    expect(drawn).toEqual([
      expect.objectContaining({ isWinner: false, score: 1 }),
    ]);

    await run.deleteScore(first).expect(200);
    matchups = await run.matchups(stageId);
    expect(rowsOf(await rosterRounds(`stageId=${stageId}`))).toEqual(
      expectedRows(matchups),
    );
    expect(
      await rosterRounds(
        `stageId=${stageId}&rosterId=${low}&roundNumber=${first.round}`,
      ),
    ).toEqual([]);
  });

  it('needs a stage or a roster to filter by', async () => {
    await request(app.getHttpServer()).get('/roster-rounds').expect(400);
  });
});
