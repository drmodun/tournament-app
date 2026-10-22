import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModuleBuilder } from '@nestjs/testing';
import {
  stageTypeEnum,
  tournamentLocationEnum,
  tournamentTeamTypeEnum,
  tournamentTypeEnum,
} from '@tournament-app/types';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { NoValuesToSetExceptionFilter } from '../../src/base/exception/noValuesToSetExceptionFilter';
import { PostgresExceptionFilter } from '../../src/base/exception/postgresExceptionFilter';

export interface RunMatchup {
  id: number;
  round: number;
  bracket: string | null;
  isFinished: boolean;
  results: {
    id: number;
    isWinner: boolean;
    roster?: {
      participation?: {
        user?: { id: number } | null;
        group?: { id: number } | null;
      };
    };
  }[];
}

export interface Standings {
  stageId: number;
  format: string;
  isFinished: boolean;
  runsOnChallonge: boolean;
  standings: {
    rosterId: number;
    place: number;
    played: number;
    wins: number;
    draws: number;
    losses: number;
    byes: number;
    points: number;
    carriedPoints: number;
    eliminatedInRound: number | null;
  }[];
}

/** What to do with a matchup: the roster that wins it, or a draw. */
export type Decision = number | 'draw';

export async function createApp(
  configure: (builder: TestingModuleBuilder) => TestingModuleBuilder = (b) => b,
) {
  const moduleFixture = await configure(
    Test.createTestingModule({
      imports: [AppModule],
    }),
  ).compile();

  const app = moduleFixture.createNestApplication({ rawBody: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalFilters(
    new PostgresExceptionFilter(),
    new NoValuesToSetExceptionFilter(),
  );
  await app.init();

  return app;
}

export async function loginAs(app: INestApplication, userId: number) {
  const user = await request(app.getHttpServer())
    .get(`/users/${userId}`)
    .expect(200);
  const login = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email: user.body.email, password: 'Password123!' })
    .expect(201);

  return login.body.accessToken as string;
}

/**
 * Drives tournaments through the HTTP API the way an organiser would: create a tournament, enter
 * players, add stages, start them and enter results.
 */
export class TournamentRun {
  constructor(
    readonly app: INestApplication,
    readonly token: string,
  ) {}

  private http() {
    return request(this.app.getHttpServer());
  }

  private auth(req: request.Test, token = this.token) {
    return req.set('Authorization', `Bearer ${token}`);
  }

  /** A tournament that has not started, with the given users entered as solo participants. */
  async createTournament(
    userIds: number[],
    name = 'Bracket run',
    overrides: Record<string, unknown> = {},
  ) {
    const created = await this.auth(this.http().post('/tournaments'))
      .send({
        name,
        description: 'Created by the bracket e2e suite',
        startDate: new Date(Date.now() + 7 * 86400000),
        endDate: new Date(Date.now() + 14 * 86400000),
        categoryId: 1,
        location: tournamentLocationEnum.ONLINE,
        tournamentTeamType: tournamentTeamTypeEnum.SOLO,
        tournamentType: tournamentTypeEnum.COMPETITION,
        isPublic: true,
        maxParticipants: 64,
        country: 'US',
        isRanked: false,
        locationId: 1,
        ...overrides,
      })
      .expect(201);

    const tournamentId = created.body.id as number;

    for (const userId of userIds) {
      await this.enter(tournamentId, userId).expect(201);
    }

    return tournamentId;
  }

  enter(tournamentId: number, userId: number) {
    return this.auth(
      this.http().post(
        `/participations/admin/apply-solo/${tournamentId}/${userId}`,
      ),
    );
  }

  enterGroup(tournamentId: number, groupId: number) {
    return this.auth(
      this.http().post(
        `/participations/admin/apply-group/${tournamentId}/${groupId}`,
      ),
    );
  }

  createRoster(participationId: number, stageId: number, userIds: number[]) {
    return this.auth(
      this.http().post(`/roster/${participationId}/${stageId}`),
    ).send({
      members: userIds.map((userId) => ({ userId, isSubstitute: false })),
    });
  }

  async createStage(
    tournamentId: number,
    stageType: stageTypeEnum,
    name = `${stageType} stage`,
    overrides: Record<string, unknown> = {},
  ) {
    const created = await this.auth(this.http().post(`/stages/${tournamentId}`))
      .send({
        name,
        tournamentId,
        description: 'Created by the bracket e2e suite',
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
        stageType,
        locationId: 1,
        ...overrides,
      })
      .expect(201);

    return created.body.id as number;
  }

  startStage(stageId: number) {
    return this.auth(this.http().patch(`/stages/start/${stageId}`));
  }

  async stage(stageId: number) {
    return (await this.http().get(`/stages/${stageId}`).expect(200)).body;
  }

  async matchups(stageId: number): Promise<RunMatchup[]> {
    const pageSize = 100;
    const all: RunMatchup[] = [];

    for (let page = 1; ; page++) {
      const response = await this.http()
        .get(
          `/matches/results?stageId=${stageId}&page=${page}&pageSize=${pageSize}`,
        )
        .expect(200);

      all.push(...response.body);

      if (response.body.length < pageSize) {
        return all;
      }
    }
  }

  async participations(tournamentId: number) {
    return (
      await this.http()
        .get(`/participations?tournamentId=${tournamentId}&pageSize=100`)
        .expect(200)
    ).body;
  }

  async standings(stageId: number): Promise<Standings> {
    return (
      await this.http().get(`/matches/stage/${stageId}/standings`).expect(200)
    ).body;
  }

  private resultBody(matchup: RunMatchup, decision: Decision) {
    const rosterIds = matchup.results.map((result) => result.id);
    const winners = decision === 'draw' ? [] : [decision];

    return {
      scores: [
        {
          roundNumber: 1,
          scores: rosterIds.map((rosterId) => ({
            rosterId,
            points:
              decision === 'draw' ? 1 : winners.includes(rosterId) ? 1 : 0,
            isWinner: winners.includes(rosterId),
          })),
        },
      ],
      results: rosterIds.map((rosterId) => ({
        rosterId,
        isWinner: winners.includes(rosterId),
      })),
    };
  }

  /** Posts a result for a matchup; returns the request so failures can be asserted. */
  score(matchup: RunMatchup, decision: Decision, token = this.token) {
    return this.auth(
      this.http().post(`/matches/${matchup.id}/score`),
      token,
    ).send(this.resultBody(matchup, decision));
  }

  updateScore(matchup: RunMatchup, decision: Decision) {
    return this.auth(
      this.http().put(`/matches/${matchup.id}/update-score`),
    ).send(this.resultBody(matchup, decision));
  }

  deleteScore(matchup: RunMatchup) {
    return this.auth(this.http().delete(`/matches/${matchup.id}/delete-score`));
  }

  createRule(rule: Record<string, unknown>) {
    return this.auth(this.http().post('/conversion-rules')).send(rule);
  }

  applyRule(ruleId: number) {
    return this.auth(this.http().post(`/conversion-rules/${ruleId}/apply`));
  }

  async rule(ruleId: number) {
    return (await this.http().get(`/conversion-rules/${ruleId}`).expect(200))
      .body;
  }

  /**
   * Plays a stage to its end. `decide` picks the result of every matchup that has two or more
   * rosters and no result; it is called with matchups in the order they were drawn.
   */
  async play(
    stageId: number,
    decide: (matchup: RunMatchup, all: RunMatchup[]) => Decision,
    maxRounds = 60,
  ) {
    for (let pass = 0; pass < maxRounds; pass++) {
      const all = await this.matchups(stageId);
      const open = all
        .filter((m) => !m.isFinished && m.results.length >= 2)
        .sort((a, b) => a.id - b.id);

      if (!open.length) {
        return all;
      }

      for (const matchup of open) {
        await this.score(matchup, decide(matchup, all)).expect(201);
      }
    }

    throw new Error(`Stage ${stageId} did not finish in ${maxRounds} passes`);
  }
}

/** The roster with the lowest id wins; rosters are created in entry order, so this is the top seed. */
export const lowestIdWins = (matchup: RunMatchup): Decision =>
  Math.min(...matchup.results.map((result) => result.id));

/** Rosters in a list of matchups that have two or more entrants, i.e. not byes. */
export const played = (matchups: RunMatchup[]) =>
  matchups.filter((m) => m.results.length >= 2);

export const rosterIdsOf = (matchups: RunMatchup[]) =>
  [...new Set(matchups.flatMap((m) => m.results.map((r) => r.id)))].sort(
    (a, b) => a - b,
  );

/** Finished matchups a roster lost (not byes, not draws). */
export const lossesOf = (rosterId: number, matchups: RunMatchup[]) =>
  played(matchups).filter(
    (m) =>
      m.isFinished &&
      m.results.some((r) => r.id === rosterId && !r.isWinner) &&
      m.results.some((r) => r.isWinner),
  ).length;

/** Users 10 to 30 all exist in the seeded database (4 and 32 do not). */
export const userPool = (count: number, offset = 0) =>
  Array.from({ length: count }, (_, i) => 10 + offset + i);
