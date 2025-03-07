import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ClassSerializerInterceptor,
  ValidationPipe,
} from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { CreateLFGRequest, UpdateLFGRequest } from '../src/lfg/dto/requests';
import { NoValuesToSetExceptionFilter } from 'src/base/exception/noValuesToSetExceptionFilter';
import { PostgresExceptionFilter } from 'src/base/exception/postgresExceptionFilter';
import { Reflector } from '@nestjs/core';

describe('LFGController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let userId: number;

  beforeAll(async () => {
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
    const { body: adminUser } = await request(app.getHttpServer())
      .get('/users/3')
      .expect(200);

    // Login to get auth token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: adminUser.email,
        password: 'Password123!',
      })
      .expect(201);

    authToken = loginResponse.body.accessToken;
    userId = 3;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /lfg', () => {
    it('should create a new LFG post when authenticated', async () => {
      const lfgData: CreateLFGRequest = {
        message: 'Looking for team for tournament',
        categoryIds: [1, 2], // Assuming these categories exist from seed data
      };

      await request(app.getHttpServer())
        .post('/lfg')
        .set('Authorization', `Bearer ${authToken}`)
        .send(lfgData)
        .expect(201);
    });

    it('should return 401 when creating LFG without auth', async () => {
      const lfgData: CreateLFGRequest = {
        message: 'Looking for team',
        categoryIds: [1],
      };

      await request(app.getHttpServer()).post('/lfg').send(lfgData).expect(401);
    });

    it('should return 400 when creating LFG with invalid data', async () => {
      const invalidLfgData = {
        message: 'a', // Empty message should be invalid
        categoryIds: [],
      };

      await request(app.getHttpServer())
        .post('/lfg')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidLfgData)
        .expect(400);
    });
  });

  describe('GET /lfg/me', () => {
    it("should return user's LFG posts when authenticated", async () => {
      const response = await request(app.getHttpServer())
        .get('/lfg/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('id');
        expect(response.body[0]).toHaveProperty('message');
        expect(response.body[0]).toHaveProperty('userId');
        expect(response.body[0]).toHaveProperty('createdAt');
      }
    });

    it('should return 401 when fetching LFG posts without auth', async () => {
      await request(app.getHttpServer()).get('/lfg/me').expect(401);
    });
  });

  describe('GET /lfg/:groupId', () => {
    it('should return players for a group', async () => {
      const response = await request(app.getHttpServer())
        .get('/lfg/1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        const player = response.body[0];
        expect(player).toHaveProperty('user');
        expect(player).toHaveProperty('message');
        expect(player).toHaveProperty('careers');
        expect(player.careers.length).toBeGreaterThan(0);
      }
    });
  });

  describe('PATCH /lfg/:id', () => {
    let lfgId: number;

    beforeEach(async () => {
      // Create a new LFG post to update
      await request(app.getHttpServer())
        .post('/lfg')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          message: 'Initial message',
          categoryIds: [1],
        })
        .expect(201);

      lfgId = await request(app.getHttpServer())
        .get('/lfg/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .then((res) => res.body[0].id);
    });

    it('should update an LFG post when authenticated as owner', async () => {
      const updateData: UpdateLFGRequest = {
        message: 'Updated message',
        categoryIds: [1, 2],
      };

      await request(app.getHttpServer())
        .patch(`/lfg/${lfgId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      // Verify the update
      const response = await request(app.getHttpServer())
        .get('/lfg/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.body[0].message).toBe(updateData.message);
    });

    it('should return 401 when updating LFG without auth', async () => {
      const updateData: UpdateLFGRequest = {
        message: 'Updated message',
      };

      await request(app.getHttpServer())
        .patch(`/lfg/${lfgId}`)
        .send(updateData)
        .expect(401);
    });
  });

  describe('DELETE /lfg/:id', () => {
    let lfgId: number;

    beforeEach(async () => {
      // Create a new LFG post to delete
      await request(app.getHttpServer())
        .post('/lfg')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          message: 'To be deleted',
          categoryIds: [1],
        })
        .expect(201);

      lfgId = await request(app.getHttpServer())
        .get('/lfg/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .then((res) => res.body[0].id);
    });

    it('should delete an LFG post when authenticated as owner', async () => {
      await request(app.getHttpServer())
        .delete(`/lfg/${lfgId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verify the deletion
      const response = await request(app.getHttpServer())
        .get('/lfg/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.body.filter((lfg) => lfg.id === lfgId).length).toBe(0);
    });

    it('should return 401 when deleting LFG without auth', async () => {
      await request(app.getHttpServer()).delete(`/lfg/${lfgId}`).expect(401);
    });
  });
});
