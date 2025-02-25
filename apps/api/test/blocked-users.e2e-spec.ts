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
  groupTypeEnum,
  ICreateGroupRequest,
} from '@tournament-app/types';

describe('BlockedUsersController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let testGroupId: number;
  let testUserId: number;

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

    // Get a test admin user
    const { body: authUser } = await request(app.getHttpServer())
      .get('/users/31')
      .expect(200);

    // Login to get auth token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: authUser.email, password: 'Password123!' });

    authToken = loginResponse.body.accessToken;

    // Create a test group
    const res = await request(app.getHttpServer())
      .post('/groups')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Block Group',
        description: 'A test group for blocking users',
        type: groupTypeEnum.PUBLIC,
        focus: groupFocusEnum.HYBRID,
        abbreviation: 'exp',
        logo: 'https://www.logo.hrvatska.hr/logo.png',
        country: 'hr',
        location: 'hrvatska',
      } satisfies ICreateGroupRequest)
      .expect(201);

    testGroupId = res.body.id;

    // Get a real user to block
    const { body: userToBlock } = await request(app.getHttpServer())
      .get('/users/34')
      .expect(200);

    testUserId = userToBlock.id;
  });

  describe('GET /blocked-users', () => {
    it('should return paginated blocked users', async () => {
      const response = await request(app.getHttpServer())
        .get(`/blocked-users/${testGroupId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const { results, metadata } = response.body;

      expect(Array.isArray(results)).toBeTruthy();
      expect(metadata).toHaveProperty('pagination');
      expect(metadata).toHaveProperty('links');
      expect(metadata.pagination).toHaveProperty('page');
      expect(metadata.pagination).toHaveProperty('pageSize');
    });

    it('should respect pagination parameters', async () => {
      const page = 1;
      const pageSize = 5;

      const response = await request(app.getHttpServer())
        .get(`/blocked-users/${testGroupId}?page=${page}&pageSize=${pageSize}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const { results, metadata } = response.body;
      expect(results.length).toBeLessThanOrEqual(pageSize);
      expect(metadata.pagination.page).toBe(page);
      expect(metadata.pagination.pageSize).toBe(pageSize);
    });
  });

  describe('POST /blocked-users/:userId', () => {
    it('should block a user', async () => {
      await request(app.getHttpServer())
        .post(`/blocked-users/${testGroupId}/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);

      // Verify the user is now blocked
      const response = await request(app.getHttpServer())
        .get(`/blocked-users/${testGroupId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const { results } = response.body;
      expect(results.some((user) => user.id === testUserId)).toBeTruthy();

      await request(app.getHttpServer())
        .delete(`/blocked-users/${testGroupId}/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('should not allow blocking the same user twice', async () => {
      // Block the user first time
      await request(app.getHttpServer())
        .post(`/blocked-users/${testGroupId}/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);

      // Try to block the same user again
      await request(app.getHttpServer())
        .post(`/blocked-users/${testGroupId}/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      await request(app.getHttpServer())
        .delete(`/blocked-users/${testGroupId}/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('should return 422 for non-existent user', async () => {
      const nonExistentUserId = 99999;
      await request(app.getHttpServer())
        .post(`/blocked-users/${testGroupId}/${nonExistentUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(422);
    });
  });

  describe('DELETE /blocked-users/:userId', () => {
    beforeEach(async () => {
      // Block the test user before each test
      await request(app.getHttpServer())
        .post(`/blocked-users/${testGroupId}/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);
    });

    it('should unblock a user', async () => {
      await request(app.getHttpServer())
        .delete(`/blocked-users/${testGroupId}/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const response = await request(app.getHttpServer())
        .get(`/blocked-users/${testGroupId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const { results } = response.body;
      expect(results.some((user) => user.id === testUserId)).toBeFalsy();
    });

    it('should not allow unblocking a user that is not blocked', async () => {
      await request(app.getHttpServer())
        .delete(`/blocked-users/${testGroupId}/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .delete(`/blocked-users/${testGroupId}/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('should return 400 for non-existent user', async () => {
      const nonExistentUserId = 99999;
      await request(app.getHttpServer())
        .delete(`/blocked-users/${testGroupId}/${nonExistentUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });

  describe('Authorization', () => {
    it('should require authentication for all endpoints', async () => {
      // Test GET /blocked-users
      await request(app.getHttpServer())
        .get(`/blocked-users/${testGroupId}`)
        .expect(401);

      // Test POST /blocked-users/:userId
      await request(app.getHttpServer())
        .post(`/blocked-users/${testGroupId}/${testUserId}`)
        .expect(401);

      // Test DELETE /groups/:groupId/blocked-users/:userId
      await request(app.getHttpServer())
        .delete(`/blocked-users/${testGroupId}/${testUserId}`)
        .expect(401);
    });

    it('should require group admin privileges', async () => {
      const { body: authUser } = await request(app.getHttpServer())
        .get('/users/22')
        .expect(200);

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: authUser.email,
          password: 'Password123!',
        });

      const nonAdminToken = loginResponse.body.accessToken;

      // Test endpoints with non-admin user
      await request(app.getHttpServer())
        .get(`/blocked-users/${testGroupId}`)
        .set('Authorization', `Bearer ${nonAdminToken}`)
        .expect(403);

      await request(app.getHttpServer())
        .post(`/blocked-users/${testGroupId}/${testUserId}`)
        .set('Authorization', `Bearer ${nonAdminToken}`)
        .expect(403);

      await request(app.getHttpServer())
        .delete(`/blocked-users/${testGroupId}/${testUserId}`)
        .set('Authorization', `Bearer ${nonAdminToken}`)
        .expect(403);
    });
  });
});
