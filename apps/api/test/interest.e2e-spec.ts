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
  categoryTypeEnum,
  ICreateCategoryRequest,
} from '@tournament-app/types';

describe('InterestController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let testCategoryId: number;
  let anotherAuthToken: string;

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

    const { body: authUser } = await request(app.getHttpServer())
      .get('/users/22')
      .expect(200);

    const { body: anotherUser } = await request(app.getHttpServer())
      .get('/users/3')
      .expect(200);

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: authUser.email, password: 'Password123!' });

    const anotherLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: anotherUser.email, password: 'Password123!' });

    authToken = loginResponse.body.accessToken;
    anotherAuthToken = anotherLoginResponse.body.accessToken;

    const { body: categories } = await request(app.getHttpServer())
      .post('/categories')
      .set('Authorization', `Bearer ${anotherAuthToken}`)
      .send({
        name: 'Test Category',
        description: 'Test Description',
        logo: 'https://example.com/logo.png',
        type: categoryTypeEnum.PROGRAMMING,
      } satisfies ICreateCategoryRequest)
      .expect(201);

    testCategoryId = categories.id;
  });

  describe('GET /interest', () => {
    it('should return paginated interest categories', async () => {
      const response = await request(app.getHttpServer())
        .get('/interest')
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
        .get(`/interest?page=${page}&pageSize=${pageSize}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const { results, metadata } = response.body;
      expect(results.length).toBeLessThanOrEqual(pageSize);
      expect(metadata.pagination.page).toBe(page);
      expect(metadata.pagination.pageSize).toBe(pageSize);
    });

    it('should only return interests for the authenticated user', async () => {
      // Create an interest for the current user
      await request(app.getHttpServer())
        .post(`/interest/${testCategoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);

      const { body: anotherUser } = await request(app.getHttpServer())
        .get('/users/27')
        .expect(200);

      const anotherLoginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: anotherUser.email, password: 'Password123!' });

      const anotherAuthToken = anotherLoginResponse.body.accessToken;

      const response = await request(app.getHttpServer())
        .get('/interest')
        .set('Authorization', `Bearer ${anotherAuthToken}`)
        .expect(200);

      const { results } = response.body;
      expect(
        results.some((category) => category.id === testCategoryId),
      ).toBeFalsy();

      await request(app.getHttpServer())
        .delete(`/interest/${testCategoryId}`)
        .set('Authorization', `Bearer ${authToken}`);
    });
  });

  describe('POST /interest/:categoryId', () => {
    afterEach(async () => {
      try {
        await request(app.getHttpServer())
          .delete(`/interest/${testCategoryId}`)
          .set('Authorization', `Bearer ${authToken}`);
      } catch (error) {}
    });

    it('should create an interest', async () => {
      await request(app.getHttpServer())
        .post(`/interest/${testCategoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);

      const response = await request(app.getHttpServer())
        .get('/interest')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const { results } = response.body;
      expect(
        results.some((category) => category.id === testCategoryId),
      ).toBeTruthy();
    });

    it('should not allow creating the same interest twice', async () => {
      await request(app.getHttpServer())
        .post(`/interest/${testCategoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);

      await request(app.getHttpServer())
        .post(`/interest/${testCategoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('should return 422 for non-existent category', async () => {
      const nonExistentCategoryId = 99999;
      await request(app.getHttpServer())
        .post(`/interest/${nonExistentCategoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(422);
    });
  });

  describe('DELETE /interest/:categoryId', () => {
    beforeEach(async () => {
      try {
        await request(app.getHttpServer())
          .post(`/interest/${testCategoryId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(201);
      } catch (error) {}
    });

    it('should delete an interest', async () => {
      await request(app.getHttpServer())
        .delete(`/interest/${testCategoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const response = await request(app.getHttpServer())
        .get('/interest')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const { results } = response.body;
      expect(
        results.some((category) => category.id === testCategoryId),
      ).toBeFalsy();
    });

    it('should not allow deleting an interest that does not exist', async () => {
      await request(app.getHttpServer())
        .delete(`/interest/${testCategoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .delete(`/interest/${testCategoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('should return 400 for non-existent category', async () => {
      const nonExistentCategoryId = 99999;
      await request(app.getHttpServer())
        .delete(`/interest/${nonExistentCategoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });

  describe('Authorization', () => {
    it('should require authentication for all endpoints', async () => {
      // Test GET /interest
      await request(app.getHttpServer()).get('/interest').expect(401);

      // Test POST /interest/:categoryId
      await request(app.getHttpServer())
        .post(`/interest/${testCategoryId}`)
        .expect(401);

      // Test DELETE /interest/:categoryId
      await request(app.getHttpServer())
        .delete(`/interest/${testCategoryId}`)
        .expect(401);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
