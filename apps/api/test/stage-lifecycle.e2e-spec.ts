import { INestApplication } from '@nestjs/common';
import {
  pointConversionStrategyEnum,
  pointConversionTypeEnum,
  stageTypeEnum,
} from '@tournament-app/types';
import request from 'supertest';
import {
  createApp,
  loginAs,
  lowestIdWins,
  RunMatchup,
  rosterIdsOf,
  TournamentRun,
  userPool,
} from './helpers/tournamentRun';

// What can and cannot happen to a stage and its results, and how finished stages feed later ones
describe('Stage lifecycle and conversion rules (e2e)', () => {
  let app: INestApplication;
  let run: TournamentRun;
  let outsiderToken: string;

  beforeAll(async () => {
    app = await createApp();
    run = new TournamentRun(app, await loginAs(app, 1));
    outsiderToken = await loginAs(app, 20);
  });

  afterAll(async () => {
    await app.close();
  });

  async function startStage(stageType: stageTypeEnum, count: number) {
    const tournamentId = await run.createTournament(userPool(count));
    const stageId = await run.createStage(tournamentId, stageType);
    await run.startStage(stageId).expect(200);

    return { tournamentId, stageId };
  }

  const status = async (stageId: number) =>
    (await run.stage(stageId)).stageStatus;

  const userOf = (matchups: RunMatchup[], rosterId: number) =>
    matchups.flatMap((m) => m.results).find((r) => r.id === rosterId)!.roster!
      .participation!.user!.id;

  describe('starting a stage', () => {
    it('refuses a stage without rosters', async () => {
      const tournamentId = await run.createTournament([]);
      const stageId = await run.createStage(
        tournamentId,
        stageTypeEnum.KNOCKOUT,
      );

      await run.startStage(stageId).expect(400);
      expect(await status(stageId)).toBe('upcoming');
    });

    it('refuses to start a stage twice', async () => {
      const { stageId } = await startStage(stageTypeEnum.KNOCKOUT, 4);

      await run.startStage(stageId).expect(400);
      expect(await run.matchups(stageId)).toHaveLength(2);
    });

    it('refuses to start a finished stage', async () => {
      const { stageId } = await startStage(stageTypeEnum.KNOCKOUT, 2);
      await run.play(stageId, lowestIdWins);

      await run.startStage(stageId).expect(400);
    });

    it('refuses people who do not manage the tournament', async () => {
      const tournamentId = await run.createTournament(userPool(4));
      const stageId = await run.createStage(
        tournamentId,
        stageTypeEnum.KNOCKOUT,
      );

      await request(app.getHttpServer())
        .patch(`/stages/start/${stageId}`)
        .set('Authorization', `Bearer ${outsiderToken}`)
        .expect(403);
      await request(app.getHttpServer())
        .patch(`/stages/start/${stageId}`)
        .expect(401);
      expect(await status(stageId)).toBe('upcoming');
    });

    it('does not create a Challonge tournament while Challonge is disabled', async () => {
      const tournamentId = await run.createTournament(userPool(2));
      const stageId = await run.createStage(
        tournamentId,
        stageTypeEnum.DOUBLE_ELIMINATION,
      );

      expect((await run.stage(stageId)).challongeTournamentId).toBeNull();
    });
  });

  describe('standings', () => {
    it('are 404 for a stage that does not exist', async () => {
      await request(app.getHttpServer())
        .get('/matches/stage/99999999/standings')
        .expect(404);
    });

    it('list every roster before anything is played', async () => {
      const tournamentId = await run.createTournament(userPool(4));
      const stageId = await run.createStage(tournamentId, stageTypeEnum.SWISS);

      const { standings, isFinished } = await run.standings(stageId);

      expect(isFinished).toBe(false);
      expect(standings).toHaveLength(4);
      expect(
        standings.every((row) => row.played === 0 && row.points === 0),
      ).toBe(true);
    });

    it('can be read without signing in', async () => {
      const { stageId } = await startStage(stageTypeEnum.ROUND_ROBIN, 3);

      await request(app.getHttpServer())
        .get(`/matches/stage/${stageId}/standings`)
        .expect(200);
    });
  });

  describe('entering results', () => {
    it('is refused for people who do not manage the tournament', async () => {
      const { stageId } = await startStage(stageTypeEnum.KNOCKOUT, 4);
      const [matchup] = await run.matchups(stageId);

      await run
        .score(matchup, lowestIdWins(matchup), outsiderToken)
        .expect(403);
      await request(app.getHttpServer())
        .post(`/matches/${matchup.id}/score`)
        .send({ scores: [], results: [] })
        .expect(401);
      expect((await run.matchups(stageId)).every((m) => !m.isFinished)).toBe(
        true,
      );
    });

    it('does not advance a knockout past a draw until the result is corrected', async () => {
      const { stageId } = await startStage(stageTypeEnum.KNOCKOUT, 4);
      const [first, second] = await run.matchups(stageId);

      await run.score(first, 'draw').expect(201);
      await run.score(second, lowestIdWins(second)).expect(201);

      // Round 1 is complete, but a draw has no winner to send on
      expect(await run.matchups(stageId)).toHaveLength(2);

      await run.updateScore(first, lowestIdWins(first)).expect(200);

      const afterCorrection = await run.matchups(stageId);

      expect(afterCorrection.filter((m) => m.round === 2)).toHaveLength(1);
    });

    it('can be corrected until the next round is drawn, then is frozen', async () => {
      const { stageId } = await startStage(stageTypeEnum.KNOCKOUT, 4);
      const [first, second] = await run.matchups(stageId);
      const [a, b] = first.results.map((r) => r.id);

      await run.score(first, a).expect(201);
      await run.updateScore(first, b).expect(200);
      await run.score(second, lowestIdWins(second)).expect(201);

      const round2 = (await run.matchups(stageId)).find((m) => m.round === 2)!;

      // The corrected winner went on
      expect(round2.results.map((r) => r.id)).toContain(b);

      await run.updateScore(first, a).expect(400);
      await run.deleteScore(first).expect(400);
    });

    it('can be deleted and entered again before the next round exists', async () => {
      const { stageId } = await startStage(stageTypeEnum.KNOCKOUT, 4);
      const [first] = await run.matchups(stageId);

      await run.score(first, lowestIdWins(first)).expect(201);
      await run.deleteScore(first).expect(200);

      const byId = async () =>
        (await run.matchups(stageId)).find((m) => m.id === first.id)!;

      expect((await byId()).isFinished).toBe(false);

      await run.score(first, lowestIdWins(first)).expect(201);
      expect((await byId()).isFinished).toBe(true);
    });

    it('is frozen once the stage is finished', async () => {
      const { stageId } = await startStage(stageTypeEnum.KNOCKOUT, 2);
      const [final] = await run.matchups(stageId);

      await run.score(final, lowestIdWins(final)).expect(201);

      expect(await status(stageId)).toBe('finished');
      await run.updateScore(final, final.results[1].id).expect(400);
      await run.deleteScore(final).expect(400);
    });

    it('can change in any round of a round robin until the stage finishes', async () => {
      const { stageId } = await startStage(stageTypeEnum.ROUND_ROBIN, 4);
      const drawn = await run.matchups(stageId);
      const last = drawn[drawn.length - 1];
      const [a, b] = drawn[0].results.map((r) => r.id);

      await run.score(drawn[0], a).expect(201);
      await run.updateScore(drawn[0], b).expect(200);
      await run.deleteScore(drawn[0]).expect(200);
      await run.score(drawn[0], a).expect(201);

      for (const matchup of drawn.slice(1, -1)) {
        await run.score(matchup, lowestIdWins(matchup)).expect(201);
      }

      // The first result can still change while the last is missing
      await run.updateScore(drawn[0], b).expect(200);
      await run.score(last, lowestIdWins(last)).expect(201);

      expect(await status(stageId)).toBe('finished');
      await run.updateScore(drawn[0], a).expect(400);
    });

    it('waits for a Swiss round to be complete before drawing the next', async () => {
      const { stageId } = await startStage(stageTypeEnum.SWISS, 4);
      const [first, second] = await run.matchups(stageId);

      await run.score(first, lowestIdWins(first)).expect(201);
      expect(await run.matchups(stageId)).toHaveLength(2);

      await run.score(second, lowestIdWins(second)).expect(201);
      expect(
        (await run.matchups(stageId)).filter((m) => m.round === 2),
      ).toHaveLength(2);
    });

    it('runs a ranked tournament to its end', async () => {
      const tournamentId = await run.createTournament(
        userPool(4, 15),
        'Ranked run',
        {
          isRanked: true,
        },
      );
      const stageId = await run.createStage(
        tournamentId,
        stageTypeEnum.KNOCKOUT,
      );

      await run.startStage(stageId).expect(200);
      await run.play(stageId, lowestIdWins);

      expect(await status(stageId)).toBe('finished');

      // A correction after the fact is refused, so ratings stay as they were applied
      const [first] = await run.matchups(stageId);
      await run.updateScore(first, first.results[1].id).expect(400);
    });
  });

  describe('conversion rules between stages', () => {
    // Stage A is a finished-in-order round robin of 4 players; stage B follows in the same tournament
    async function twoStages(secondType: stageTypeEnum) {
      const tournamentId = await run.createTournament(userPool(4));
      const first = await run.createStage(
        tournamentId,
        stageTypeEnum.ROUND_ROBIN,
        'Groups',
      );
      const second = await run.createStage(
        tournamentId,
        secondType,
        'Playoffs',
      );

      await run.startStage(first).expect(200);

      return { tournamentId, first, second };
    }

    const rule = (
      first: number,
      second: number,
      extra: Record<string, unknown>,
    ) => ({
      type: pointConversionTypeEnum.STAGE_TO_STAGE,
      source: first,
      destination: second,
      ...extra,
    });

    it('applies by itself when the source finishes: elimination keeps the top two', async () => {
      const { first, second } = await twoStages(stageTypeEnum.KNOCKOUT);
      const created = await run
        .createRule(
          rule(first, second, {
            strategy: pointConversionStrategyEnum.ELIMINATION,
            from: 1,
            to: 2,
          }),
        )
        .expect(201);

      expect((await run.rule(created.body.id)).appliedAt).toBeNull();
      expect((await run.stage(second)).rostersParticipating).toBe(4);

      const groupMatches = await run.play(first, lowestIdWins);

      expect(await status(first)).toBe('finished');
      expect((await run.rule(created.body.id)).appliedAt).not.toBeNull();
      expect((await run.stage(second)).rostersParticipating).toBe(2);

      await run.startStage(second).expect(200);
      const playoffs = await run.matchups(second);
      const winners = rosterIdsOf(groupMatches).slice(0, 2);
      const finalists = playoffs.flatMap((m) =>
        m.results.map((r) => userOf(playoffs, r.id)),
      );

      expect(playoffs).toHaveLength(1);
      expect(finalists.sort()).toEqual(
        winners.map((rosterId) => userOf(groupMatches, rosterId)).sort(),
      );
    });

    it('seeds the next stage in order of place', async () => {
      const { first, second } = await twoStages(stageTypeEnum.KNOCKOUT);

      await run
        .createRule(
          rule(first, second, {
            strategy: pointConversionStrategyEnum.SEED,
          }),
        )
        .expect(201);

      const groupMatches = await run.play(first, lowestIdWins);
      const placed = rosterIdsOf(groupMatches).map((id) =>
        userOf(groupMatches, id),
      );

      await run.startStage(second).expect(200);
      const playoffs = await run.matchups(second);
      const pairs = playoffs.map((m) =>
        m.results.map((r) => userOf(playoffs, r.id)).sort((a, b) => a - b),
      );

      // 1st v 4th and 2nd v 3rd
      expect(pairs).toContainEqual(
        [placed[0], placed[3]].sort((a, b) => a - b),
      );
      expect(pairs).toContainEqual(
        [placed[1], placed[2]].sort((a, b) => a - b),
      );
    });

    it('carries ranking points into the standings of the next stage', async () => {
      const { first, second } = await twoStages(stageTypeEnum.ROUND_ROBIN);

      await run
        .createRule(
          rule(first, second, {
            strategy: pointConversionStrategyEnum.RANKING,
            maxPoints: 10,
            pointsPerPlace: 3,
          }),
        )
        .expect(201);

      const groupMatches = await run.play(first, lowestIdWins);
      const placed = rosterIdsOf(groupMatches).map((id) =>
        userOf(groupMatches, id),
      );

      await run.startStage(second).expect(200);
      const playoffs = await run.matchups(second);
      const { standings } = await run.standings(second);
      const carried = Object.fromEntries(
        standings.map((row) => [
          userOf(playoffs, row.rosterId),
          row.carriedPoints,
        ]),
      );

      expect(placed.map((user) => carried[user])).toEqual([10, 7, 4, 1]);
    });

    it('applies once only', async () => {
      const { first, second } = await twoStages(stageTypeEnum.KNOCKOUT);
      const created = await run
        .createRule(
          rule(first, second, {
            strategy: pointConversionStrategyEnum.RANKING,
            maxPoints: 5,
          }),
        )
        .expect(201);

      await run.applyRule(created.body.id).expect(400);
      await run.play(first, lowestIdWins);

      expect((await run.rule(created.body.id)).appliedAt).not.toBeNull();
      await run.applyRule(created.body.id).expect(400);
    });

    it('is refused for strategies the API does not support', async () => {
      const { first, second } = await twoStages(stageTypeEnum.KNOCKOUT);

      for (const strategy of [
        pointConversionStrategyEnum.TIE_BREAKER,
        pointConversionStrategyEnum.QUALIFICATION_WITH_LCQ,
      ]) {
        await run.createRule(rule(first, second, { strategy })).expect(400);
      }
    });

    it('is refused when it makes no sense', async () => {
      const { first, second } = await twoStages(stageTypeEnum.KNOCKOUT);
      const strategy = pointConversionStrategyEnum.QUALIFICATION;

      await run.createRule(rule(first, first, { strategy })).expect(400);
      await run
        .createRule(rule(first, second, { strategy, from: 4, to: 2 }))
        .expect(400);
      await run
        .createRule({
          type: pointConversionTypeEnum.STAGE_TO_TOURNAMENT,
          source: first,
          destination: 1,
          strategy: pointConversionStrategyEnum.ELIMINATION,
        })
        .expect(400);

      // Entries cannot be added to a stage that has started
      await run.startStage(second).expect(200);
      await run.createRule(rule(first, second, { strategy })).expect(400);
    });

    it('can only be made and deleted by the organisers', async () => {
      const { first, second } = await twoStages(stageTypeEnum.KNOCKOUT);
      const body = rule(first, second, {
        strategy: pointConversionStrategyEnum.RANKING,
        maxPoints: 1,
      });

      await request(app.getHttpServer())
        .post('/conversion-rules')
        .set('Authorization', `Bearer ${outsiderToken}`)
        .send(body)
        .expect(403);

      const created = await run.createRule(body).expect(201);

      await request(app.getHttpServer())
        .delete(`/conversion-rules/${created.body.id}`)
        .set('Authorization', `Bearer ${outsiderToken}`)
        .expect(403);
      await request(app.getHttpServer())
        .delete(`/conversion-rules/${created.body.id}`)
        .set('Authorization', `Bearer ${run.token}`)
        .expect(200);
      await request(app.getHttpServer())
        .get(`/conversion-rules/${created.body.id}`)
        .expect(404);
    });
  });

  describe('conversion rules between tournaments', () => {
    it('gives participations points from a stage, then qualifies the best into another tournament', async () => {
      const source = await run.createTournament(userPool(4), 'Qualifier');
      const target = await run.createTournament([], 'Final event');
      const stageId = await run.createStage(source, stageTypeEnum.ROUND_ROBIN);

      await run.startStage(stageId).expect(200);

      await run
        .createRule({
          type: pointConversionTypeEnum.STAGE_TO_TOURNAMENT,
          source: stageId,
          destination: source,
          strategy: pointConversionStrategyEnum.RANKING,
          maxPoints: 10,
          pointsPerPlace: 3,
        })
        .expect(201);
      const qualify = await run
        .createRule({
          type: pointConversionTypeEnum.TOURNAMENT_TO_TOURNAMENT,
          source,
          destination: target,
          strategy: pointConversionStrategyEnum.QUALIFICATION,
          from: 1,
          to: 2,
        })
        .expect(201);

      const matchups = await run.play(stageId, lowestIdWins);
      const placed = rosterIdsOf(matchups).map((id) => userOf(matchups, id));

      const points = Object.fromEntries(
        (await run.participations(source)).results.map(
          (p: { userId: number; points: number }) => [p.userId, p.points],
        ),
      );

      expect(placed.map((user) => points[user])).toEqual([10, 7, 4, 1]);

      // The tournament finishes with its only stage, which applies the tournament rule
      expect((await run.rule(qualify.body.id)).appliedAt).not.toBeNull();

      const entered = (await run.participations(target)).results.map(
        (p: { userId: number }) => p.userId,
      );

      expect(entered.sort()).toEqual([placed[0], placed[1]].sort());
    });
  });

  describe('multi-stage tournaments', () => {
    it('runs round robin groups into a double-elimination playoff', async () => {
      const tournamentId = await run.createTournament(userPool(6));
      const groups = await run.createStage(
        tournamentId,
        stageTypeEnum.ROUND_ROBIN,
        'Groups',
      );
      const playoffs = await run.createStage(
        tournamentId,
        stageTypeEnum.DOUBLE_ELIMINATION,
        'Playoffs',
      );

      await run
        .createRule(
          rule(groups, playoffs, {
            strategy: pointConversionStrategyEnum.ELIMINATION,
            from: 1,
            to: 4,
          }),
        )
        .expect(201);

      await run.startStage(groups).expect(200);
      await run.play(groups, lowestIdWins);

      expect((await run.stage(playoffs)).rostersParticipating).toBe(4);

      await run.startStage(playoffs).expect(200);
      await run.play(playoffs, lowestIdWins);

      expect(await status(groups)).toBe('finished');
      expect(await status(playoffs)).toBe('finished');
      expect((await run.standings(playoffs)).standings).toHaveLength(4);
    });

    function rule(
      source: number,
      destination: number,
      extra: Record<string, unknown>,
    ) {
      return {
        type: pointConversionTypeEnum.STAGE_TO_STAGE,
        source,
        destination,
        ...extra,
      };
    }
  });
});
