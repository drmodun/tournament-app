import { Test, TestingModule } from '@nestjs/testing';
import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PostgresExceptionFilter } from '../src/base/exception/postgresExceptionFilter';
import { Reflector } from '@nestjs/core';
import { NoValuesToSetExceptionFilter } from '../src/base/exception/noValuesToSetExceptionFilter';

describe('BlockedGroupsController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let testGroupId: number;

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

    // Get a test user
    const { body: authUser } = await request(app.getHttpServer())
      .get('/users/3')
      .expect(200);

    // Login to get auth token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: authUser.email, password: 'Password123!' });

    authToken = loginResponse.body.accessToken;

    testGroupId = 5;
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /blocked-groups', () => {
    it('should return paginated blocked groups', async () => {
      const response = await request(app.getHttpServer())
        .get('/blocked-groups')
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
        .get(`/blocked-groups?page=${page}&pageSize=${pageSize}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const { results, metadata } = response.body;
      expect(results.length).toBeLessThanOrEqual(pageSize);
      expect(metadata.pagination.page).toBe(page);
      expect(metadata.pagination.pageSize).toBe(pageSize);
    });
  });

  describe('POST /blocked-groups/:groupId', () => {
    it('should block a group', async () => {
      await request(app.getHttpServer())
        .post(`/blocked-groups/${testGroupId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);

      // Verify the group is now blocked
      const response = await request(app.getHttpServer())
        .get('/blocked-groups')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const { results } = response.body;
      expect(results.some((group) => group.id === testGroupId)).toBeTruthy();
    });

    it('should not allow blocking the same group twice', async () => {
      await request(app.getHttpServer())
        .post(`/blocked-groups/${testGroupId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('should return 422 for non-existent group', async () => {
      const nonExistentGroupId = 99999;
      await request(app.getHttpServer())
        .post(`/blocked-groups/${nonExistentGroupId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(422);
    });

    afterAll(async () => {
      await request(app.getHttpServer())
        .delete(`/blocked-groups/${testGroupId}`)
        .set('Authorization', `Bearer ${authToken}`);
    });
  });

  describe('DELETE /blocked-groups/:groupId', () => {
    beforeEach(async () => {
      // Block the test group before each test
      await request(app.getHttpServer())
        .post(`/blocked-groups/${testGroupId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);
    });

    it('should unblock a group', async () => {
      await request(app.getHttpServer())
        .delete(`/blocked-groups/${testGroupId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verify the group is no longer blocked
      const response = await request(app.getHttpServer())
        .get('/blocked-groups')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const { results } = response.body;
      expect(results.some((group) => group.id === testGroupId)).toBeFalsy();
    });

    it('should not allow unblocking a group that is not blocked', async () => {
      // Unblock the group first
      await request(app.getHttpServer())
        .delete(`/blocked-groups/${testGroupId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Try to unblock again
      await request(app.getHttpServer())
        .delete(`/blocked-groups/${testGroupId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('should return 400 for non-existent group', async () => {
      const nonExistentGroupId = 99999;
      await request(app.getHttpServer())
        .delete(`/blocked-groups/${nonExistentGroupId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });

  describe('Authorization', () => {
    it('should require authentication for all endpoints', async () => {
      // Test GET /blocked-groups
      await request(app.getHttpServer()).get('/blocked-groups').expect(401);

      // Test POST /blocked-groups/:groupId
      await request(app.getHttpServer())
        .post(`/blocked-groups/${testGroupId}`)
        .expect(401);

      // Test DELETE /blocked-groups/:groupId
      await request(app.getHttpServer())
        .delete(`/blocked-groups/${testGroupId}`)
        .expect(401);
    });
  });
});
