import { INestApplication } from '@nestjs/common';
import { stageTypeEnum } from '@tournament-app/types';
import { createHash, randomUUID } from 'crypto';
import { exportJWK, generateKeyPair, KeyLike, SignJWT } from 'jose';
import request from 'supertest';
import { VansyClient } from '../src/vansy/vansy.client';
import { VANSY_CONFIG } from '../src/vansy/vansy.config';
import {
  createApp,
  loginAs,
  TournamentRun,
  userPool,
} from './helpers/tournamentRun';

// The Vansy integration against a fake Vansy: launches are checked for what tournaments asserts
// (owner, roster as team, stage context) and webhooks are signed with a test Vansy key.
describe('Vansy integration (e2e)', () => {
  let app: INestApplication;
  let run: TournamentRun;
  let vansyKey: KeyLike;
  const quizId = randomUUID();
  const soloQuizId = randomUUID();
  const launches: any[] = [];
  const contexts: [string, unknown[]][] = [];

  const fakeClient = {
    enabled: true,
    launch: jest.fn(async (body: unknown) => {
      launches.push(body);
      return {
        launchUrl: 'http://vansy.test/api/v1/l/ticket',
        expiresAt: new Date().toISOString(),
      };
    }),
    getQuiz: jest.fn(async (id: string) => ({
      id,
      title: 'Maths final',
      ownerRef: 'user:1',
      publishState: 'PUBLISHED',
      participationMode: id === soloQuizId ? 'SOLO' : 'TEAM',
      contexts: [],
    })),
    listQuizzes: jest.fn(async () => ({ results: [] })),
    setContexts: jest.fn(async (id: string, list: unknown[]) => {
      contexts.push([id, list]);
      return list;
    }),
    finalize: jest.fn(async () => ({ closedAttempts: 2 })),
  };

  beforeAll(async () => {
    const pair = await generateKeyPair('EdDSA', {
      crv: 'Ed25519',
      extractable: true,
    });
    vansyKey = pair.privateKey;
    const publicJwk = {
      ...(await exportJWK(pair.publicKey)),
      kid: 'vansy-test',
    };

    app = await createApp((builder) =>
      builder
        .overrideProvider(VANSY_CONFIG)
        .useValue({
          url: 'http://vansy.test',
          tenantId: 'tournaments',
          privateKey: '{}',
          publicKey: JSON.stringify(publicJwk),
          frontendUrl: 'http://localhost:3000',
        })
        .overrideProvider(VansyClient)
        .useValue(fakeClient),
    );
    run = new TournamentRun(app, await loginAs(app, 1));
  });

  afterAll(async () => {
    await app.close();
  });

  const http = () => request(app.getHttpServer());

  async function signedWebhook(event: Record<string, unknown>, tamper = false) {
    const body = JSON.stringify(event);
    const now = Math.floor(Date.now() / 1000);
    const signature = await new SignJWT({
      body_sha256: createHash('sha256').update(body).digest('base64url'),
    })
      .setProtectedHeader({ alg: 'EdDSA', kid: 'vansy-test' })
      .setIssuer('vansy')
      .setAudience('tournaments')
      .setJti(event.eventId as string)
      .setIssuedAt(now)
      .setExpirationTime(now + 300)
      .sign(vansyKey);

    return http()
      .post('/integrations/vansy/webhook')
      .set('content-type', 'application/json')
      .set('vansy-signature', signature)
      .send(tamper ? body.replace('"score":40', '"score":99') : body);
  }

  // A started quiz stage with solo players: each player's roster, keyed by user id
  async function quizStage(players: number[]) {
    const tournamentId = await run.createTournament(players, 'Vansy run');
    const stageId = await run.createStage(tournamentId, stageTypeEnum.QUIZ);
    await run.startStage(stageId).expect(200);
    const rosterOf = new Map<number, number>();
    for (const matchup of await run.matchups(stageId)) {
      for (const result of matchup.results) {
        const userId = result.roster?.participation?.user?.id;
        if (userId) rosterOf.set(userId, result.id);
      }
    }
    return { stageId, rosterOf };
  }

  it('launches an author into their own quiz bank', async () => {
    const res = await http()
      .post('/vansy/launch/author')
      .set('Authorization', `Bearer ${run.token}`)
      .expect(201);

    expect(res.body.launchUrl).toBe('http://vansy.test/api/v1/l/ticket');
    expect(launches.at(-1)).toMatchObject({
      action: 'author',
      subject: { externalUserId: '1' },
      capabilities: ['author'],
      scope: { ownerRef: 'user:1' },
    });
  });

  it('lets only the stage organiser link a team quiz to a stage', async () => {
    const { stageId } = await quizStage(userPool(2, 40));
    const outsider = await loginAs(app, 45);

    await http()
      .put(`/vansy/stages/${stageId}/quiz`)
      .set('Authorization', `Bearer ${outsider}`)
      .send({ quizId })
      .expect(403);

    await http()
      .put(`/vansy/stages/${stageId}/quiz`)
      .set('Authorization', `Bearer ${run.token}`)
      .send({ quizId })
      .expect(200);
    expect(contexts.at(-1)).toEqual([
      quizId,
      [{ type: 'stage', id: String(stageId) }],
    ]);

    const linked = await http()
      .get(`/vansy/stages/${stageId}/quiz`)
      .expect(200);
    expect(linked.body).toMatchObject({ linked: true, vansyQuizId: quizId });
  });

  it('launches a player as their roster, with the stage as context', async () => {
    const players = userPool(3, 50);
    const { stageId, rosterOf } = await quizStage(players);
    await http()
      .put(`/vansy/stages/${stageId}/quiz`)
      .set('Authorization', `Bearer ${run.token}`)
      .send({ quizId })
      .expect(200);

    const player = await loginAs(app, players[1]);
    await http()
      .post(`/vansy/stages/${stageId}/launch/take`)
      .set('Authorization', `Bearer ${player}`)
      .expect(201);
    expect(launches.at(-1)).toMatchObject({
      action: 'take',
      subject: { externalUserId: String(players[1]) },
      team: {
        externalTeamId: String(rosterOf.get(players[1])),
        memberCount: 1,
      },
      scope: { quizId, contextRef: { type: 'stage', id: String(stageId) } },
      returnUrl: `http://localhost:3000/stage/${stageId}`,
    });

    const outsider = await loginAs(app, 59);
    await http()
      .post(`/vansy/stages/${stageId}/launch/take`)
      .set('Authorization', `Bearer ${outsider}`)
      .expect(403);
  });

  it('turns quiz.results_final into stage standings, idempotently, and refuses forgeries', async () => {
    const players = userPool(3, 60);
    const { stageId, rosterOf } = await quizStage(players);
    await http()
      .put(`/vansy/stages/${stageId}/quiz`)
      .set('Authorization', `Bearer ${run.token}`)
      .send({ quizId })
      .expect(200);

    const row = (userId: number, rank: number, score: number) => ({
      rank,
      category: 'TEAM',
      attemptId: randomUUID(),
      subject: null,
      team: { externalTeamId: String(rosterOf.get(userId)), name: 'x' },
      score,
      maxScore: 50,
      durationMs: 1000,
      submittedAt: new Date().toISOString(),
      reviewStatus: 'NONE',
    });
    const event = {
      eventId: randomUUID(),
      type: 'quiz.results_final',
      occurredAt: new Date().toISOString(),
      tenantId: 'tournaments',
      quiz: {
        id: quizId,
        ownerRef: 'user:1',
        contexts: [{ type: 'stage', id: String(stageId) }],
      },
      standings: [
        {
          category: 'TEAM',
          rows: [row(players[2], 1, 40), row(players[0], 2, 30)],
        },
      ],
    };

    const forged = await signedWebhook(event, true);
    expect(forged.status).toBe(401);
    await http()
      .post('/integrations/vansy/webhook')
      .set('content-type', 'application/json')
      .send(JSON.stringify(event))
      .expect(401);

    expect((await signedWebhook(event)).body).toEqual({
      received: true,
      duplicate: false,
    });
    expect((await signedWebhook(event)).body).toEqual({
      received: true,
      duplicate: true,
    });

    const standings = await run.standings(stageId);
    expect(standings.format).toBe('quiz');
    expect(
      standings.standings.map((s) => [s.rosterId, s.place, s.points]),
    ).toEqual([
      [rosterOf.get(players[2]), 1, 40],
      [rosterOf.get(players[0]), 2, 30],
      [rosterOf.get(players[1]), 3, 0],
    ]);
  });

  it('stores completed attempts for the stage', async () => {
    const players = userPool(2, 70);
    const { stageId, rosterOf } = await quizStage(players);
    const attemptId = randomUUID();

    await signedWebhook({
      eventId: randomUUID(),
      type: 'attempt.completed',
      occurredAt: new Date().toISOString(),
      tenantId: 'tournaments',
      attempt: {
        id: attemptId,
        quizId,
        quizVersion: 1,
        subject: { externalUserId: String(players[0]) },
        team: { externalTeamId: String(rosterOf.get(players[0])) },
        contextRef: { type: 'stage', id: String(stageId) },
        score: 40,
        maxScore: 50,
        percent: 80,
        passed: true,
        startedAt: new Date().toISOString(),
        submittedAt: new Date().toISOString(),
        durationMs: 60000,
        status: 'SUBMITTED',
        integrity: { reviewStatus: 'OPEN' },
      },
    }).then((res) => expect(res.status).toBe(200));

    const results = await http()
      .get(`/vansy/stages/${stageId}/results`)
      .expect(200);
    expect(results.body.attempts).toEqual([
      expect.objectContaining({
        attemptId,
        rosterId: rosterOf.get(players[0]),
        userId: players[0],
        score: 40,
        reviewStatus: 'OPEN',
      }),
    ]);
  });

  it('refuses a solo quiz for a stage, since every entrant is a team', async () => {
    const { stageId } = await quizStage(userPool(2, 80));
    await http()
      .put(`/vansy/stages/${stageId}/quiz`)
      .set('Authorization', `Bearer ${run.token}`)
      .send({ quizId: soloQuizId })
      .expect(400);
  });
});
