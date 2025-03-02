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
  ICreateRosterRequest,
  rosterRoleEnum,
  rosterTypeEnum,
} from '@tournament-app/types';

describe('RosterMembersController (e2e)', () => {
  let app: INestApplication;
  let regularUserToken: string;
  let rosterAdminToken: string;
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

    const regularUser = await request(app.getHttpServer())
      .get('/users/20')
      .expect(200);

    const rosterAdmin = await request(app.getHttpServer())
      .get('/users/3')
      .expect(200);

    const otherUser = await request(app.getHttpServer())
      .get('/users/21')
      .expect(200);

    const loginRegularUser = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: regularUser.body.email, password: 'Password123!' });
    regularUserToken = loginRegularUser.body.accessToken;

    const loginRosterAdmin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: rosterAdmin.body.email, password: 'Password123!' });
    rosterAdminToken = loginRosterAdmin.body.accessToken;

    const loginOtherUser = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: otherUser.body.email, password: 'Password123!' });
    otherUserToken = loginOtherUser.body.accessToken;
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /roster-members', () => {
    it('should return roster members with BASE response type', async () => {
      const response = await request(app.getHttpServer())
        .get('/roster-members?responseType=base')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(200);

      expect(response.body.data[0]).toHaveProperty('id');
      expect(response.body.data[0]).toHaveProperty('rosterId');
      expect(response.body.data[0]).toHaveProperty('userId');
      expect(response.body.metadata).toBeDefined();
    });

    it('should return roster members with MINI response type', async () => {
      const response = await request(app.getHttpServer())
        .get('/roster-members?responseType=mini')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(200);

      expect(response.body.data[0]).toHaveProperty('id');
      expect(response.body.data[0]).toHaveProperty('rosterId');
      expect(response.body.data[0]).toHaveProperty('userId');
      expect(response.body.metadata).toBeDefined();
    });

    it('should return roster members with EXTENDED response type', async () => {
      const response = await request(app.getHttpServer())
        .get('/roster-members?responseType=extended')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(200);

      expect(response.body.data[0]).toHaveProperty('id');
      expect(response.body.data[0]).toHaveProperty('rosterId');
      expect(response.body.data[0]).toHaveProperty('userId');
      expect(response.body.data[0]).toHaveProperty('role');
      expect(response.body.data[0]).toHaveProperty('user');
      expect(response.body.data[0]).toHaveProperty('roster');
      expect(response.body.metadata).toBeDefined();
    });

    it('should filter roster members by rosterId', async () => {
      const rosterId = 1;
      const response = await request(app.getHttpServer())
        .get(`/roster-members?rosterId=${rosterId}`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(200);

      expect(
        response.body.data.every((m) => m.rosterId === rosterId),
      ).toBeTruthy();
    });

    it('should filter roster members by userId', async () => {
      const userId = 20;
      const response = await request(app.getHttpServer())
        .get(`/roster-members?userId=${userId}`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(200);

      expect(response.body.data.every((m) => m.userId === userId)).toBeTruthy();
    });
  });

  describe('GET /roster-members/:id', () => {
    it('should return a single roster member', async () => {
      const response = await request(app.getHttpServer())
        .get('/roster-members/1')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', 1);
    });

    it('should return 404 for non-existent roster member', async () => {
      await request(app.getHttpServer())
        .get('/roster-members/999999')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(404);
    });
  });

  describe('POST /roster-members/:rosterId/join', () => {
    it('should allow user to join public roster', async () => {
      const createPublicRosterResponse = await request(app.getHttpServer())
        .post('/rosters')
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({
          name: 'Public Roster',
          description: 'This is a public roster',
          type: rosterTypeEnum.PUBLIC,
          tag: 'PR',
        } satisfies ICreateRosterRequest)
        .expect(201);

      const rosterId = createPublicRosterResponse.body.id;

      await request(app.getHttpServer())
        .post(`/roster-members/${rosterId}/join`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(201);
    });

    it('should prevent joining private roster without invitation', async () => {
      const createPrivateRosterResponse = await request(app.getHttpServer())
        .post('/rosters')
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({
          name: 'Private Roster',
          description: 'This is a private roster',
          type: rosterTypeEnum.PRIVATE,
          tag: 'PR',
        } satisfies ICreateRosterRequest)
        .expect(201);

      const rosterId = createPrivateRosterResponse.body.id;

      await request(app.getHttpServer())
        .post(`/roster-members/${rosterId}/join`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(403);
    });

    it('should prevent double membership', async () => {
      const createPublicRosterResponse = await request(app.getHttpServer())
        .post('/rosters')
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({
          name: 'Public Roster',
          description: 'This is a public roster',
          type: rosterTypeEnum.PUBLIC,
          tag: 'PR',
        } satisfies ICreateRosterRequest)
        .expect(201);

      const rosterId = createPublicRosterResponse.body.id;

      await request(app.getHttpServer())
        .post(`/roster-members/${rosterId}/join`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(201);

      await request(app.getHttpServer())
        .post(`/roster-members/${rosterId}/join`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(403);
    });
  });

  describe('POST /roster-members/:rosterId/invite/:userId', () => {
    it('should allow roster admin to invite user', async () => {
      const createRosterResponse = await request(app.getHttpServer())
        .post('/rosters')
        .set('Authorization', `Bearer ${rosterAdminToken}`)
        .send({
          name: 'Test Roster',
          description: 'This is a test roster',
          type: rosterTypeEnum.PRIVATE,
          tag: 'TR',
        } satisfies ICreateRosterRequest)
        .expect(201);

      const rosterId = createRosterResponse.body.id;

      await request(app.getHttpServer())
        .post(`/roster-members/${rosterId}/invite/20`)
        .set('Authorization', `Bearer ${rosterAdminToken}`)
        .expect(201);
    });

    it('should prevent non-admin from inviting users', async () => {
      const createRosterResponse = await request(app.getHttpServer())
        .post('/rosters')
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({
          name: 'Test Roster',
          description: 'This is a test roster',
          type: rosterTypeEnum.PRIVATE,
          tag: 'TR',
        } satisfies ICreateRosterRequest)
        .expect(201);

      const rosterId = createRosterResponse.body.id;

      await request(app.getHttpServer())
        .post(`/roster-members/${rosterId}/invite/20`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(403);
    });
  });

  describe('PATCH /roster-members/:id/role', () => {
    it('should allow roster admin to change member role', async () => {
      const createRosterResponse = await request(app.getHttpServer())
        .post('/rosters')
        .set('Authorization', `Bearer ${rosterAdminToken}`)
        .send({
          name: 'Test Roster',
          description: 'This is a test roster',
          type: rosterTypeEnum.PUBLIC,
          tag: 'TR',
        } satisfies ICreateRosterRequest)
        .expect(201);

      const rosterId = createRosterResponse.body.id;

      const joinResponse = await request(app.getHttpServer())
        .post(`/roster-members/${rosterId}/join`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(201);

      await request(app.getHttpServer())
        .patch(`/roster-members/${joinResponse.body.id}/role`)
        .set('Authorization', `Bearer ${rosterAdminToken}`)
        .send({ role: rosterRoleEnum.MODERATOR })
        .expect(200);
    });

    it('should prevent non-admin from changing roles', async () => {
      const createRosterResponse = await request(app.getHttpServer())
        .post('/rosters')
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({
          name: 'Test Roster',
          description: 'This is a test roster',
          type: rosterTypeEnum.PUBLIC,
          tag: 'TR',
        } satisfies ICreateRosterRequest)
        .expect(201);

      const rosterId = createRosterResponse.body.id;

      const joinResponse = await request(app.getHttpServer())
        .post(`/roster-members/${rosterId}/join`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(201);

      await request(app.getHttpServer())
        .patch(`/roster-members/${joinResponse.body.id}/role`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({ role: rosterRoleEnum.MODERATOR })
        .expect(403);
    });
  });

  describe('DELETE /roster-members/:id', () => {
    it('should allow user to leave roster', async () => {
      const createRosterResponse = await request(app.getHttpServer())
        .post('/rosters')
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({
          name: 'Test Roster',
          description: 'This is a test roster',
          type: rosterTypeEnum.PUBLIC,
          tag: 'TR',
        } satisfies ICreateRosterRequest)
        .expect(201);

      const rosterId = createRosterResponse.body.id;

      const joinResponse = await request(app.getHttpServer())
        .post(`/roster-members/${rosterId}/join`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/roster-members/${joinResponse.body.id}`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(200);
    });

    it('should allow roster admin to remove member', async () => {
      const createRosterResponse = await request(app.getHttpServer())
        .post('/rosters')
        .set('Authorization', `Bearer ${rosterAdminToken}`)
        .send({
          name: 'Test Roster',
          description: 'This is a test roster',
          type: rosterTypeEnum.PUBLIC,
          tag: 'TR',
        } satisfies ICreateRosterRequest)
        .expect(201);

      const rosterId = createRosterResponse.body.id;

      const joinResponse = await request(app.getHttpServer())
        .post(`/roster-members/${rosterId}/join`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/roster-members/${joinResponse.body.id}`)
        .set('Authorization', `Bearer ${rosterAdminToken}`)
        .expect(200);
    });

    it("should prevent user from removing other's membership", async () => {
      const createRosterResponse = await request(app.getHttpServer())
        .post('/rosters')
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({
          name: 'Test Roster',
          description: 'This is a test roster',
          type: rosterTypeEnum.PUBLIC,
          tag: 'TR',
        } satisfies ICreateRosterRequest)
        .expect(201);

      const rosterId = createRosterResponse.body.id;

      const otherJoinResponse = await request(app.getHttpServer())
        .post(`/roster-members/${rosterId}/join`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/roster-members/${otherJoinResponse.body.id}`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(403);
    });

    it('should prevent removing last admin', async () => {
      const createRosterResponse = await request(app.getHttpServer())
        .post('/rosters')
        .set('Authorization', `Bearer ${rosterAdminToken}`)
        .send({
          name: 'Test Roster',
          description: 'This is a test roster',
          type: rosterTypeEnum.PUBLIC,
          tag: 'TR',
        } satisfies ICreateRosterRequest)
        .expect(201);

      const adminMembershipId = (
        await request(app.getHttpServer())
          .get(`/roster-members?rosterId=${createRosterResponse.body.id}`)
          .set('Authorization', `Bearer ${rosterAdminToken}`)
          .expect(200)
      ).body.data[0].id;

      await request(app.getHttpServer())
        .delete(`/roster-members/${adminMembershipId}`)
        .set('Authorization', `Bearer ${rosterAdminToken}`)
        .expect(403);
    });
  });
});
