import { Test, TestingModule } from '@nestjs/testing';
import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PostgresExceptionFilter } from '../src/base/exception/postgresExceptionFilter';
import { Reflector } from '@nestjs/core';
import { NoValuesToSetExceptionFilter } from '../src/base/exception/noValuesToSetExceptionFilter';

describe('ParticipationController (e2e)', () => {
  let app: INestApplication;
  let regularUserToken: string;
  let tournamentAdminToken: string;
  let groupAdminToken: string;
  let otherUserToken: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector)),
    );
    app.useGlobalFilters(
      new PostgresExceptionFilter(),
      new NoValuesToSetExceptionFilter(),
    );

    await app.init();

    // Get test users
    const regularUser = await request(app.getHttpServer())
      .get('/users/20') // Regular participant
      .expect(200);

    const tournamentAdmin = await request(app.getHttpServer())
      .get('/users/3') // Tournament creator/admin
      .expect(200);

    const groupAdmin = await request(app.getHttpServer())
      .get('/users/5') // Group admin
      .expect(200);

    const otherUser = await request(app.getHttpServer())
      .get('/users/21') // Another regular user
      .expect(200);

    // Login to get tokens
    const loginRegularUser = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: regularUser.body.email, password: 'Password123!' });
    regularUserToken = loginRegularUser.body.accessToken;

    const loginTournamentAdmin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: tournamentAdmin.body.email, password: 'Password123!' });
    tournamentAdminToken = loginTournamentAdmin.body.accessToken;

    const loginGroupAdmin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: groupAdmin.body.email, password: 'Password123!' });
    groupAdminToken = loginGroupAdmin.body.accessToken;

    const loginOtherUser = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: otherUser.body.email, password: 'Password123!' });
    otherUserToken = loginOtherUser.body.accessToken;
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /participations', () => {
    it('should return participations with BASE response type', async () => {
      const response = await request(app.getHttpServer())
        .get('/participations?responseType=base')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(200);

      expect(response.body.data[0]).toHaveProperty('id');
      expect(response.body.data[0]).toHaveProperty('tournamentId');
      expect(response.body.metadata).toBeDefined();
    });

    it('should return participations with MINI response type', async () => {
      const response = await request(app.getHttpServer())
        .get('/participations?responseType=mini')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(200);

      expect(response.body.data[0]).toHaveProperty('id');
      expect(response.body.data[0]).toHaveProperty('tournamentId');
      expect(response.body.metadata).toBeDefined();
    });

    it('should return participations with EXTENDED response type', async () => {
      const response = await request(app.getHttpServer())
        .get('/participations?responseType=extended')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(200);

      expect(response.body.data[0]).toHaveProperty('id');
      expect(response.body.data[0]).toHaveProperty('tournament');
      expect(response.body.data[0]).toHaveProperty('user');
      expect(response.body.metadata).toBeDefined();
    });

    it('should filter participations by tournamentId', async () => {
      const tournamentId = 1;
      const response = await request(app.getHttpServer())
        .get(`/participations?tournamentId=${tournamentId}`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(200);

      expect(
        response.body.data.every((p) => p.tournamentId === tournamentId),
      ).toBeTruthy();
    });

    it('should filter participations by userId', async () => {
      const userId = 20;
      const response = await request(app.getHttpServer())
        .get(`/participations?userId=${userId}`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(200);

      expect(response.body.data.every((p) => p.userId === userId)).toBeTruthy();
    });

    it('should filter participations by groupId', async () => {
      const groupId = 1;
      const response = await request(app.getHttpServer())
        .get(`/participations?groupId=${groupId}`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(200);

      expect(
        response.body.data.every((p) => p.groupId === groupId),
      ).toBeTruthy();
    });
  });

  describe('GET /participations/:id', () => {
    it('should return a single participation', async () => {
      const response = await request(app.getHttpServer())
        .get('/participations/1')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', 1);
    });

    it('should return 404 for non-existent participation', async () => {
      await request(app.getHttpServer())
        .get('/participations/999999')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(404);
    });
  });

  describe('POST /participations/apply-solo/:tournamentId', () => {
    it('should allow solo participation in a solo tournament', async () => {
      const tournamentId = 1; // Assuming this is a solo tournament
      await request(app.getHttpServer())
        .post(`/participations/apply-solo/${tournamentId}`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(201);
    });

    it('should prevent double participation', async () => {
      const tournamentId = 1;
      // First participation
      await request(app.getHttpServer())
        .post(`/participations/apply-solo/${tournamentId}`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(201);

      // Second attempt should fail
      await request(app.getHttpServer())
        .post(`/participations/apply-solo/${tournamentId}`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(403);
    });

    it('should prevent participation in non-public tournament', async () => {
      const privateTorunamentId = 2; // Assuming this is a private tournament
      await request(app.getHttpServer())
        .post(`/participations/apply-solo/${privateTorunamentId}`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(403);
    });

    it('should prevent participation after tournament start', async () => {
      const startedTournamentId = 3; // Assuming this tournament has started
      await request(app.getHttpServer())
        .post(`/participations/apply-solo/${startedTournamentId}`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(403);
    });

    it('should prevent solo participation in team tournament', async () => {
      const teamTournamentId = 4; // Assuming this is a team tournament
      await request(app.getHttpServer())
        .post(`/participations/apply-solo/${teamTournamentId}`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(403);
    });
  });

  describe('POST /participations/apply-group/:tournamentId/:groupId', () => {
    it('should allow group participation in a team tournament', async () => {
      const tournamentId = 4; // Team tournament
      const groupId = 1;
      await request(app.getHttpServer())
        .post(`/participations/apply-group/${tournamentId}/${groupId}`)
        .set('Authorization', `Bearer ${groupAdminToken}`)
        .expect(201);
    });

    it('should prevent non-admin from registering group', async () => {
      const tournamentId = 4;
      const groupId = 1;
      await request(app.getHttpServer())
        .post(`/participations/apply-group/${tournamentId}/${groupId}`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(403);
    });
  });

  describe('POST /participations/admin/apply-solo/:tournamentId/:userId', () => {
    it('should allow tournament admin to add fake player', async () => {
      const tournamentId = 1;
      const fakeUserId = 100; // Assuming this is a fake player
      await request(app.getHttpServer())
        .post(`/participations/admin/apply-solo/${tournamentId}/${fakeUserId}`)
        .set('Authorization', `Bearer ${tournamentAdminToken}`)
        .expect(201);
    });

    it('should prevent non-admin from adding fake player', async () => {
      const tournamentId = 1;
      const fakeUserId = 100;
      await request(app.getHttpServer())
        .post(`/participations/admin/apply-solo/${tournamentId}/${fakeUserId}`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(403);
    });
  });

  describe('POST /participations/admin/apply-group/:tournamentId/:groupId', () => {
    it('should allow tournament admin to add fake team', async () => {
      const tournamentId = 4;
      const fakeGroupId = 100; // Assuming this is a fake group
      await request(app.getHttpServer())
        .post(
          `/participations/admin/apply-group/${tournamentId}/${fakeGroupId}`,
        )
        .set('Authorization', `Bearer ${tournamentAdminToken}`)
        .expect(201);
    });

    it('should prevent non-admin from adding fake team', async () => {
      const tournamentId = 4;
      const fakeGroupId = 100;
      await request(app.getHttpServer())
        .post(
          `/participations/admin/apply-group/${tournamentId}/${fakeGroupId}`,
        )
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(403);
    });
  });

  describe('DELETE /participations/:id', () => {
    it('should allow user to cancel own participation', async () => {
      // First create a participation
      const tournamentId = 1;
      const createResponse = await request(app.getHttpServer())
        .post(`/participations/apply-solo/${tournamentId}`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(201);

      // Then cancel it
      await request(app.getHttpServer())
        .delete(`/participations/${createResponse.body.id}`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(200);
    });

    it('should allow tournament admin to cancel any participation', async () => {
      const participationId = 1;
      await request(app.getHttpServer())
        .delete(`/participations/${participationId}`)
        .set('Authorization', `Bearer ${tournamentAdminToken}`)
        .expect(200);
    });

    it('should allow group admin to cancel group participation', async () => {
      const groupParticipationId = 2; // Assuming this is a group participation
      await request(app.getHttpServer())
        .delete(`/participations/${groupParticipationId}`)
        .set('Authorization', `Bearer ${groupAdminToken}`)
        .expect(200);
    });

    it("should prevent user from canceling other's participation", async () => {
      const otherParticipationId = 3;
      await request(app.getHttpServer())
        .delete(`/participations/${otherParticipationId}`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(403);
    });

    it('should prevent cancellation after tournament start', async () => {
      const startedTournamentParticipationId = 4; // Participation in started tournament
      await request(app.getHttpServer())
        .delete(`/participations/${startedTournamentParticipationId}`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(403);
    });
  });
});
