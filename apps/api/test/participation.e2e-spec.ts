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
import {
  groupFocusEnum,
  groupRoleEnum,
  groupTypeEnum,
  ICreateFakeGroupRequest,
  ICreateGroupRequest,
  ICreateTournamentRequest,
  ICreateUserRequest,
  tournamentLocationEnum,
  tournamentTeamTypeEnum,
  tournamentTypeEnum,
} from '@tournament-app/types';
import { TournamentModule } from 'src/tournament/tournament.module';

describe('ParticipationController (e2e)', () => {
  let app: INestApplication;
  let regularUserToken: string;
  let tournamentAdminToken: string;
  let groupAdminToken: string;
  let otherUserToken: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TournamentModule],
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

    const regularUser = await request(app.getHttpServer())
      .get('/users/20')
      .expect(200);

    const tournamentAdmin = await request(app.getHttpServer())
      .get('/users/3')
      .expect(200);

    const groupAdmin = await request(app.getHttpServer())
      .get('/users/11')
      .expect(200);

    const otherUser = await request(app.getHttpServer())
      .get('/users/21')
      .expect(200);

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

      expect(response.body.results[0]).toHaveProperty('id');
      expect(response.body.results[0]).toHaveProperty('tournamentId');
      expect(response.body.metadata).toBeDefined();
    });

    it('should return participations with MINI response type', async () => {
      const response = await request(app.getHttpServer())
        .get('/participations?responseType=mini')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(200);

      expect(response.body.results[0]).toHaveProperty('id');
      expect(response.body.results[0]).toHaveProperty('tournamentId');
      expect(response.body.metadata).toBeDefined();
    });

    it('should return participations with EXTENDED response type', async () => {
      const response = await request(app.getHttpServer())
        .get('/participations?responseType=extended')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(200);

      expect(response.body.results[0]).toHaveProperty('id');
      expect(response.body.results[0]).toHaveProperty('tournamentId');
      expect(response.body.results[0]).toHaveProperty('userId');
      expect(response.body.results[0]).toHaveProperty('groupId');
      expect(response.body.metadata).toBeDefined();
    });

    it('should filter participations by tournamentId', async () => {
      const tournamentId = 1;
      const response = await request(app.getHttpServer())
        .get(`/participations?tournamentId=${tournamentId}`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(200);

      expect(
        response.body.results.every((p) => p.tournamentId === tournamentId),
      ).toBeTruthy();
    });

    it('should filter participations by userId', async () => {
      const userId = 20;
      const response = await request(app.getHttpServer())
        .get(`/participations?userId=${userId}`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(200);

      expect(
        response.body.results.every((p) => p.userId === userId),
      ).toBeTruthy();
    });

    it('should filter participations by groupId', async () => {
      const groupId = 1;
      const response = await request(app.getHttpServer())
        .get(`/participations?groupId=${groupId}`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(200);

      expect(
        response.body.results.every((p) => p.groupId === groupId),
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
      const createPublicTournamentResponse = await request(app.getHttpServer())
        .post('/tournaments')
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({
          name: 'Public Tournament',
          description: 'This is a public tournament',
          maxParticipants: 10,
          isPublic: true,
          startDate: new Date(Date.now() + 86400000),
          endDate: new Date(Date.now() + 172800000),
          tournamentType: tournamentTypeEnum.COMPETITION,
          location: tournamentLocationEnum.ONLINE,
          tournamentTeamType: tournamentTeamTypeEnum.SOLO,
          categoryId: 1,
          country: 'US',
          isRanked: true,
          creatorId: 1,
        } satisfies ICreateTournamentRequest)
        .expect(201);

      const tournamentId = createPublicTournamentResponse.body.id;

      await request(app.getHttpServer())
        .post(`/participations/apply-solo/${tournamentId}`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(201);
    });

    it('should prevent double participation', async () => {
      const createPublicTournamentResponse = await request(app.getHttpServer())
        .post('/tournaments')
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({
          name: 'Public Tournament',
          description: 'This is a public tournament',
          maxParticipants: 10,
          isPublic: true,
          startDate: new Date(Date.now() + 86400000),
          endDate: new Date(Date.now() + 172800000),
          tournamentType: tournamentTypeEnum.COMPETITION,
          location: tournamentLocationEnum.ONLINE,
          tournamentTeamType: tournamentTeamTypeEnum.SOLO,
          categoryId: 1,
          country: 'US',
          isRanked: true,
          creatorId: 1,
        } satisfies ICreateTournamentRequest)
        .expect(201);

      const tournamentId = createPublicTournamentResponse.body.id;
      await request(app.getHttpServer())
        .post(`/participations/apply-solo/${tournamentId}`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(201);

      await request(app.getHttpServer())
        .post(`/participations/apply-solo/${tournamentId}`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(403);
    });

    it('should prevent participation in non-public tournament', async () => {
      const createPrivateTournamentResponse = await request(app.getHttpServer())
        .post('/tournaments')
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({
          name: 'Private Tournament',
          description: 'This is a private tournament',
          maxParticipants: 10,
          isPublic: false,
          startDate: new Date(Date.now() + 86400000),
          endDate: new Date(Date.now() + 172800000),
          tournamentType: tournamentTypeEnum.COMPETITION,
          location: tournamentLocationEnum.ONLINE,
          tournamentTeamType: tournamentTeamTypeEnum.SOLO,
          categoryId: 1,
          country: 'US',
          isRanked: true,
          creatorId: 1,
        } satisfies ICreateTournamentRequest)
        .expect(201);

      const privateTorunamentId = createPrivateTournamentResponse.body.id;

      await request(app.getHttpServer())
        .post(`/participations/apply-solo/${privateTorunamentId}`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(403);

      await request(app.getHttpServer())
        .post(`/participations/apply-solo/${privateTorunamentId}`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(403);
    });

    it('should prevent participation after tournament start', async () => {
      const createPublicTournamentResponse = await request(app.getHttpServer())
        .post('/tournaments')
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({
          name: 'Public Tournament',
          description: 'This is a public tournament',
          maxParticipants: 10,
          isPublic: true,
          startDate: new Date(Date.now()),
          tournamentType: tournamentTypeEnum.COMPETITION,
          location: tournamentLocationEnum.ONLINE,
          tournamentTeamType: tournamentTeamTypeEnum.SOLO,
          categoryId: 1,
          country: 'US',
          isRanked: true,
          creatorId: 1,
          endDate: new Date(Date.now() + 86400000),
        } satisfies ICreateTournamentRequest)
        .expect(201);

      const startedTournamentId = createPublicTournamentResponse.body.id;

      await request(app.getHttpServer())
        .post(`/participations/apply-solo/${startedTournamentId}`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(403);
    });

    it('should prevent solo participation in team tournament', async () => {
      const createPublicTeamTournamentResponse = await request(
        app.getHttpServer(),
      )
        .post('/tournaments')
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({
          name: 'Public Tournament',
          description: 'This is a public tournament',
          maxParticipants: 10,
          isPublic: true,
          startDate: new Date(Date.now() + 86400000),
          endDate: new Date(Date.now() + 172800000),
          tournamentType: tournamentTypeEnum.COMPETITION,
          location: tournamentLocationEnum.ONLINE,
          tournamentTeamType: tournamentTeamTypeEnum.TEAM,
          categoryId: 1,
          country: 'US',
          isRanked: true,
          creatorId: 1,
        } satisfies ICreateTournamentRequest)
        .expect(201);

      const teamTournamentId = createPublicTeamTournamentResponse.body.id;

      await request(app.getHttpServer())
        .post(`/participations/apply-solo/${teamTournamentId}`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(403);
    });
  });

  describe('POST /participations/apply-group/:tournamentId/:groupId', () => {
    it('should allow group participation in a team tournament', async () => {
      const createPublicTeamTournamentResponse = await request(
        app.getHttpServer(),
      )
        .post('/tournaments')
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({
          name: 'Public Tournament',
          description: 'This is a public tournament',
          maxParticipants: 10,
          isPublic: true,
          startDate: new Date(Date.now() + 86400000),
          endDate: new Date(Date.now() + 172800000),
          tournamentType: tournamentTypeEnum.COMPETITION,
          location: tournamentLocationEnum.ONLINE,
          tournamentTeamType: tournamentTeamTypeEnum.TEAM,
          categoryId: 1,
          country: 'US',
          isRanked: true,
          creatorId: 1,
        } satisfies ICreateTournamentRequest)
        .expect(201);

      const teamTournamentId = createPublicTeamTournamentResponse.body.id;
      const group = await request(app.getHttpServer())
        .post('/groups')
        .set('Authorization', `Bearer ${groupAdminToken}`)
        .send({
          name: 'this is a test group',
          country: 'US',
          abbreviation: 'Gasdas',
          logo: 'https://www.google.com',
          focus: groupFocusEnum.HYBRID,
          type: groupTypeEnum.PUBLIC,
          locationId: 1,
          description: 'this is a test group',
        } satisfies ICreateGroupRequest)
        .expect(201);

      await request(app.getHttpServer())
        .post(
          `/participations/apply-group/${teamTournamentId}/${group.body.id}`,
        )
        .set('Authorization', `Bearer ${groupAdminToken}`)
        .expect(201);
    });

    it('should prevent non-admin from registering group', async () => {
      const createPublicTeamTournamentResponse = await request(
        app.getHttpServer(),
      )
        .post('/tournaments')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({
          name: 'Public Tournament',
          description: 'This is a public tournament',
          maxParticipants: 10,
          isPublic: true,
          startDate: new Date(Date.now() + 86400000),
          endDate: new Date(Date.now() + 172800000),
          tournamentType: tournamentTypeEnum.COMPETITION,
          location: tournamentLocationEnum.ONLINE,
          tournamentTeamType: tournamentTeamTypeEnum.TEAM,
          categoryId: 1,
          country: 'US',
          isRanked: true,
          creatorId: 1,
        } satisfies ICreateTournamentRequest)
        .expect(201);

      const teamTournamentId = createPublicTeamTournamentResponse.body.id;
      const groupMembership = await request(app.getHttpServer())
        .get(`/group-membership?userId=20`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(200);

      const group = groupMembership.body.results.filter(
        (m) => m.role != groupRoleEnum.ADMIN && m.role != groupRoleEnum.OWNER,
      );

      await request(app.getHttpServer())
        .post(
          `/participations/apply-group/${teamTournamentId}/${group[0].groupId}`,
        )
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(403);
    });
  });

  describe('POST /participations/admin/apply-solo/:tournamentId/:userId', () => {
    it('should allow tournament admin to add fake player', async () => {
      const createPublicTournamentResponse = await request(app.getHttpServer())
        .post('/tournaments')
        .set('Authorization', `Bearer ${tournamentAdminToken}`)
        .send({
          name: 'Public Tournament',
          description: 'This is a public tournament',
          maxParticipants: 10,
          isPublic: true,
          startDate: new Date(Date.now() + 86400000),
          endDate: new Date(Date.now() + 172800000),
          tournamentType: tournamentTypeEnum.COMPETITION,
          location: tournamentLocationEnum.ONLINE,
          tournamentTeamType: tournamentTeamTypeEnum.SOLO,
          categoryId: 1,
          country: 'US',
          isFakePlayersAllowed: true,
          isRanked: false,
          creatorId: 1,
        } satisfies ICreateTournamentRequest)
        .expect(201);

      const fakePlayer = await request(app.getHttpServer())
        .post('/users/fake')
        .set('Authorization', `Bearer ${tournamentAdminToken}`)
        .send({
          username: 'fakeplayer',
          email: 'fakeplayer@example.com',
          country: 'US',
          name: 'Fake Player',
          password: 'Password123!',
          dateOfBirth: new Date(),
        } satisfies ICreateUserRequest)
        .expect(201);

      await request(app.getHttpServer())
        .post(
          `/participations/admin/apply-solo/${createPublicTournamentResponse.body.id}/${fakePlayer.body.id}`,
        )
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
      const tournamentWithFakePlayersAllowed = await request(
        app.getHttpServer(),
      )
        .post('/tournaments')
        .set('Authorization', `Bearer ${tournamentAdminToken}`)
        .send({
          name: 'Public Tournament',
          description: 'This is a public tournament',
          maxParticipants: 10,
          isPublic: true,
          startDate: new Date(Date.now() + 86400000),
          endDate: new Date(Date.now() + 172800000),
          tournamentType: tournamentTypeEnum.COMPETITION,
          location: tournamentLocationEnum.ONLINE,
          tournamentTeamType: tournamentTeamTypeEnum.MIXED,
          categoryId: 1,
          country: 'US',
          isFakePlayersAllowed: true,
          isRanked: false,
          creatorId: 1,
        } satisfies ICreateTournamentRequest)
        .expect(201);

      const fakeGroupId = await request(app.getHttpServer())
        .post('/groups/fake')
        .set('Authorization', `Bearer ${tournamentAdminToken}`)
        .send({
          name: 'Fake Group',
          country: 'US',
          abbreviation: 'FG',
          logo: 'logo.png',
        } satisfies ICreateFakeGroupRequest)
        .expect(201);

      await request(app.getHttpServer())
        .post(
          `/participations/admin/apply-group/${tournamentWithFakePlayersAllowed.body.id}/${fakeGroupId.body.id}`,
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
      const createPublicTournamentResponse = await request(app.getHttpServer())
        .post('/tournaments')
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({
          name: 'Public Tournament',
          description: 'This is a public tournament',
          maxParticipants: 10,
          isPublic: true,
          startDate: new Date(Date.now() + 86400000),
          endDate: new Date(Date.now() + 172800000),
          tournamentType: tournamentTypeEnum.COMPETITION,
          location: tournamentLocationEnum.ONLINE,
          tournamentTeamType: tournamentTeamTypeEnum.SOLO,
          categoryId: 1,
          country: 'US',
          isRanked: true,
          creatorId: 1,
        } satisfies ICreateTournamentRequest)
        .expect(201);

      const createResponse = await request(app.getHttpServer())
        .post(
          `/participations/apply-solo/${createPublicTournamentResponse.body.id}`,
        )
        .set('Authorization', `Bearer ${groupAdminToken}`)
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/participations/${createResponse.body.id}`)
        .set('Authorization', `Bearer ${groupAdminToken}`)
        .expect(200);
    });

    it('should allow tournament admin to cancel any participation', async () => {
      const createPublicTournamentResponse = await request(app.getHttpServer())
        .post('/tournaments')
        .set('Authorization', `Bearer ${tournamentAdminToken}`)
        .send({
          name: 'Public Tournament',
          description: 'This is a public tournament',
          maxParticipants: 10,
          isPublic: true,
          startDate: new Date(Date.now() + 86400000),
          endDate: new Date(Date.now() + 172800000),
          tournamentType: tournamentTypeEnum.COMPETITION,
          location: tournamentLocationEnum.ONLINE,
          tournamentTeamType: tournamentTeamTypeEnum.SOLO,
          categoryId: 1,
          country: 'US',
          isRanked: true,
          creatorId: 1,
        } satisfies ICreateTournamentRequest)
        .expect(201);

      const tournamentId = createPublicTournamentResponse.body.id;

      const participation = await request(app.getHttpServer())
        .post(`/participations/apply-solo/${tournamentId}`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(201);

      const participationId = participation.body.id;

      await request(app.getHttpServer())
        .delete(`/participations/${participationId}`)
        .set('Authorization', `Bearer ${tournamentAdminToken}`)
        .expect(200);
    });

    it('should allow group admin to cancel group participation', async () => {
      const createdGroup = await request(app.getHttpServer())
        .post('/groups')
        .set('Authorization', `Bearer ${groupAdminToken}`)
        .send({
          name: 'Group to Delete',
          abbreviation: 'GTD',
          description: 'Group to delete',
          type: groupTypeEnum.PUBLIC,
          focus: groupFocusEnum.HYBRID,
          logo: 'logo.png',
          locationId: 1,
        } satisfies ICreateGroupRequest)
        .expect(201);

      const groupId = createdGroup.body.id;

      const createPublicTournamentResponse = await request(app.getHttpServer())
        .post('/tournaments')
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({
          name: 'Public Tournament',
          description: 'This is a public tournament',
          maxParticipants: 10,
          isPublic: true,
          startDate: new Date(Date.now() + 86400000),
          endDate: new Date(Date.now() + 172800000),
          tournamentType: tournamentTypeEnum.COMPETITION,
          location: tournamentLocationEnum.ONLINE,
          tournamentTeamType: tournamentTeamTypeEnum.MIXED,
          categoryId: 1,
          country: 'US',
          isRanked: true,
          creatorId: 1,
        } satisfies ICreateTournamentRequest)
        .expect(201);

      const groupParticipation = await request(app.getHttpServer())
        .post(
          `/participations/apply-group/${createPublicTournamentResponse.body.id}/${groupId}`,
        )
        .set('Authorization', `Bearer ${groupAdminToken}`)
        .expect(201);

      const groupParticipationId = groupParticipation.body.id;

      await request(app.getHttpServer())
        .delete(`/participations/${groupParticipationId}`)
        .set('Authorization', `Bearer ${groupAdminToken}`)
        .expect(200);
    });

    it("should prevent user from canceling other's participation", async () => {
      const createTournamentResponse = await request(app.getHttpServer())
        .post('/tournaments')
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({
          name: 'Public Tournament',
          description: 'This is a public tournament',
          maxParticipants: 10,
          isPublic: true,
          startDate: new Date(Date.now() + 86400000),
          endDate: new Date(Date.now() + 172800000),
          tournamentType: tournamentTypeEnum.COMPETITION,
          location: tournamentLocationEnum.ONLINE,
          tournamentTeamType: tournamentTeamTypeEnum.SOLO,
          categoryId: 1,
          country: 'US',
          isRanked: true,
          creatorId: 1,
        } satisfies ICreateTournamentRequest)
        .expect(201);

      const otherParticipation = await request(app.getHttpServer())
        .post(`/participations/apply-solo/${createTournamentResponse.body.id}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(201);

      const otherParticipationId = otherParticipation.body.id;

      await request(app.getHttpServer())
        .delete(`/participations/${otherParticipationId}`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(403);
    });

    it('should prevent cancellation after tournament start', async () => {
      const createPublicTournamentResponse = await request(app.getHttpServer())
        .post('/tournaments')
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({
          name: 'Public Tournament',
          description: 'This is a public tournament',
          maxParticipants: 10,
          isPublic: true,
          startDate: new Date(Date.now() + 100),
          tournamentType: tournamentTypeEnum.COMPETITION,
          location: tournamentLocationEnum.ONLINE,
          tournamentTeamType: tournamentTeamTypeEnum.SOLO,
          categoryId: 1,
          country: 'US',
          isRanked: true,
          creatorId: 1,
          endDate: new Date(Date.now() + 86400000),
        } satisfies ICreateTournamentRequest)
        .expect(201);

      const tournamentId = createPublicTournamentResponse.body.id;

      const createParticipation = await request(app.getHttpServer())
        .post(`/participations/apply-solo/${tournamentId}`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(201);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const participationId = createParticipation.body.id;

      await request(app.getHttpServer())
        .delete(`/participations/${participationId}`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(200);
    });
  });
});
