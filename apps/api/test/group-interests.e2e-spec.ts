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

describe('GroupInterestsController (e2e)', () => {
  let app: INestApplication;
  let adminAuthToken: string;
  let memberAuthToken: string;
  let nonMemberAuthToken: string;
  let testGroupId: number;
  let testCategoryId: number;

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
    const { body: adminUser } = await request(app.getHttpServer())
      .get('/users/3')
      .expect(200);

    const { body: memberUser } = await request(app.getHttpServer())
      .get('/users/36')
      .expect(200);

    const { body: nonMemberUser } = await request(app.getHttpServer())
      .get('/users/33')
      .expect(200);

    const adminLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: adminUser.email, password: 'Password123!' });

    const memberLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: memberUser.email, password: 'Password123!' });

    const nonMemberLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: nonMemberUser.email, password: 'Password123!' });

    adminAuthToken = adminLoginResponse.body.accessToken;
    memberAuthToken = memberLoginResponse.body.accessToken;
    nonMemberAuthToken = nonMemberLoginResponse.body.accessToken;

    // Create a test group with admin as the creator
    const createGroupResponse = await request(app.getHttpServer())
      .post('/groups')
      .set('Authorization', `Bearer ${adminAuthToken}`)
      .send({
        name: 'Test Group for Interests',
        abbreviation: 'TGI',
        description: 'A test group for testing group interests',
        focus: groupFocusEnum.HYBRID,
        logo: 'https://example.com/logo.png',
        type: groupTypeEnum.PUBLIC,
        locationId: 1,
        country: 'Test Country',
      } satisfies ICreateGroupRequest)
      .expect(201);

    testGroupId = createGroupResponse.body.id;

    await request(app.getHttpServer())
      .post(`/group-membership/${testGroupId}/${memberUser.id}`)
      .set('Authorization', `Bearer ${adminAuthToken}`)
      .expect(201);

    const { body: categories } = await request(app.getHttpServer())
      .get('/categories')
      .expect(200);

    testCategoryId = categories.results[0]?.id || 1;
  });

  describe('GET /group-interests/:groupId', () => {
    it('should return group interests for admin', async () => {
      const response = await request(app.getHttpServer())
        .get(`/group-interests/${testGroupId}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(200);

      const { results, metadata } = response.body;

      expect(Array.isArray(results)).toBeTruthy();
      expect(metadata).toHaveProperty('pagination');
      expect(metadata).toHaveProperty('links');
    });

    it('should return group interests for member', async () => {
      const response = await request(app.getHttpServer())
        .get(`/group-interests/${testGroupId}`)
        .set('Authorization', `Bearer ${memberAuthToken}`)
        .expect(200);

      const { results, metadata } = response.body;

      expect(Array.isArray(results)).toBeTruthy();
      expect(metadata).toHaveProperty('pagination');
    });

    it('should return group interests for non-member', async () => {
      const response = await request(app.getHttpServer())
        .get(`/group-interests/${testGroupId}`)
        .set('Authorization', `Bearer ${nonMemberAuthToken}`)
        .expect(200);

      const { results, metadata } = response.body;

      expect(Array.isArray(results)).toBeTruthy();
      expect(metadata).toHaveProperty('pagination');
    });

    it('should respect pagination parameters', async () => {
      const page = 1;
      const pageSize = 5;

      const response = await request(app.getHttpServer())
        .get(
          `/group-interests/${testGroupId}?page=${page}&pageSize=${pageSize}`,
        )
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(200);

      const { results, metadata } = response.body;
      expect(results.length).toBeLessThanOrEqual(pageSize);
      expect(metadata.pagination.page).toBe(page);
      expect(metadata.pagination.pageSize).toBe(pageSize);
    });
  });

  describe('POST /group-interests/:groupId/:categoryId', () => {
    afterEach(async () => {
      try {
        await request(app.getHttpServer())
          .delete(`/group-interests/${testGroupId}/${testCategoryId}`)
          .set('Authorization', `Bearer ${adminAuthToken}`);
      } catch (error) {}
    });

    it('should allow admin to create a group interest', async () => {
      await request(app.getHttpServer())
        .post(`/group-interests/${testGroupId}/${testCategoryId}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(201);

      const response = await request(app.getHttpServer())
        .get(`/group-interests/${testGroupId}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(200);

      const { results } = response.body;
      expect(
        results.some((category) => category.id === testCategoryId),
      ).toBeTruthy();
    });

    it('should not allow member to create a group interest', async () => {
      await request(app.getHttpServer())
        .post(`/group-interests/${testGroupId}/${testCategoryId}`)
        .set('Authorization', `Bearer ${memberAuthToken}`)
        .expect(403);
    });

    it('should not allow non-member to create a group interest', async () => {
      await request(app.getHttpServer())
        .post(`/group-interests/${testGroupId}/${testCategoryId}`)
        .set('Authorization', `Bearer ${nonMemberAuthToken}`)
        .expect(403);
    });

    it('should not allow creating the same interest twice', async () => {
      await request(app.getHttpServer())
        .post(`/group-interests/${testGroupId}/${testCategoryId}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(201);

      await request(app.getHttpServer())
        .post(`/group-interests/${testGroupId}/${testCategoryId}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(400);
    });
  });

  describe('DELETE /group-interests/:groupId/:categoryId', () => {
    beforeEach(async () => {
      try {
        await request(app.getHttpServer())
          .post(`/group-interests/${testGroupId}/${testCategoryId}`)
          .set('Authorization', `Bearer ${adminAuthToken}`)
          .expect(201);
      } catch (error) {}
    });

    it('should allow admin to delete a group interest', async () => {
      await request(app.getHttpServer())
        .delete(`/group-interests/${testGroupId}/${testCategoryId}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(200);

      const response = await request(app.getHttpServer())
        .get(`/group-interests/${testGroupId}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(200);

      const { results } = response.body;
      expect(
        results.some((category) => category.id === testCategoryId),
      ).toBeFalsy();
    });

    it('should not allow member to delete a group interest', async () => {
      await request(app.getHttpServer())
        .delete(`/group-interests/${testGroupId}/${testCategoryId}`)
        .set('Authorization', `Bearer ${memberAuthToken}`)
        .expect(403);
    });

    it('should not allow non-member to delete a group interest', async () => {
      await request(app.getHttpServer())
        .delete(`/group-interests/${testGroupId}/${testCategoryId}`)
        .set('Authorization', `Bearer ${nonMemberAuthToken}`)
        .expect(403);
    });

    it('should not allow deleting an interest that does not exist', async () => {
      await request(app.getHttpServer())
        .delete(`/group-interests/${testGroupId}/${testCategoryId}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .delete(`/group-interests/${testGroupId}/${testCategoryId}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(400);
    });
  });

  describe('Authorization', () => {
    it('should require authentication for all endpoints', async () => {
      // Test GET /group-interests/:groupId
      await request(app.getHttpServer())
        .get(`/group-interests/${testGroupId}`)
        .expect(401);

      // Test POST /group-interests/:groupId/:categoryId
      await request(app.getHttpServer())
        .post(`/group-interests/${testGroupId}/${testCategoryId}`)
        .expect(401);

      // Test DELETE /group-interests/:groupId/:categoryId
      await request(app.getHttpServer())
        .delete(`/group-interests/${testGroupId}/${testCategoryId}`)
        .expect(401);
    });
  });

  afterAll(async () => {
    // Clean up - delete the test group
    await request(app.getHttpServer())
      .delete(`/group/${testGroupId}`)
      .set('Authorization', `Bearer ${adminAuthToken}`);

    await app.close();
  });
});
