import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { CreateUserRequest } from 'src/users/dto/requests.dto';

describe('FollowersController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let userId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    const testUser = await request(app.getHttpServer())
      .get('/users/3')
      .expect(200);

    const auth = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: testUser.body.email, password: 'Password123!' })
      .expect(201);

    accessToken = auth.body.accessToken;
    userId = testUser.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/followers (GET)', () => {
    it('should return followers with base response type', async () => {
      const response = await request(app.getHttpServer())
        .get('/followers')
        .query({ page: 1, pageSize: 10, responseType: 'base' })
        .expect(200);

      expect(response.body.results).toBeDefined();
      expect(response.body.metadata).toBeDefined();
      expect(Array.isArray(response.body.results)).toBeTruthy();
      if (response.body.results.length > 0) {
        expect(response.body.results[0].id).toBeDefined();
        expect(response.body.results[0].username).toBeDefined();
        expect(response.body.results[0].name).toBeDefined();
        expect(response.body.results[0].profilePicture).toBeDefined();
      }
    });

    it('should return followers with mini response type', async () => {
      const response = await request(app.getHttpServer())
        .get('/followers')
        .query({ page: 1, pageSize: 10, responseType: 'mini' })
        .expect(200);

      expect(response.body.results).toBeDefined();
      expect(response.body.metadata).toBeDefined();
      expect(Array.isArray(response.body.results)).toBeTruthy();
      if (response.body.results.length > 0) {
        expect(response.body.results[0].id).toBeDefined();
        expect(response.body.results[0].username).toBeDefined();
        expect(response.body.results[0].createdAt).toBeDefined();
      }
    });

    it('should return following with following response type', async () => {
      const response = await request(app.getHttpServer())
        .get('/followers')
        .query({ page: 1, pageSize: 10, responseType: 'following' })
        .expect(200);

      expect(response.body.results).toBeDefined();
      expect(response.body.metadata).toBeDefined();
      expect(Array.isArray(response.body.results)).toBeTruthy();
      if (response.body.results.length > 0) {
        expect(response.body.results[0].id).toBeDefined();
        expect(response.body.results[0].username).toBeDefined();
        expect(response.body.results[0].name).toBeDefined();
        expect(response.body.results[0].profilePicture).toBeDefined();
      }
    });

    it('should return following with following-mini response type', async () => {
      const response = await request(app.getHttpServer())
        .get('/followers')
        .query({ page: 1, pageSize: 10, responseType: 'following-mini' })
        .expect(200);

      expect(response.body.results).toBeDefined();
      expect(response.body.metadata).toBeDefined();
      expect(Array.isArray(response.body.results)).toBeTruthy();
      if (response.body.results.length > 0) {
        expect(response.body.results[0].id).toBeDefined();
        expect(response.body.results[0].username).toBeDefined();
        expect(response.body.results[0].createdAt).toBeDefined();
      }
    });
  });

  describe('/followers/:userId (POST)', () => {
    it('should create a follower relationship', async () => {
      // Create another user to follow

      const { body: createdUser } = await request(app.getHttpServer())
        .post('/users')
        .send({
          username: 'testuser',
          email: 'K5VJH@example.com',
          password: 'Password123!',
          country: 'USA',
          name: 'Test User',
          dateOfBirth: new Date(),
        } satisfies CreateUserRequest)
        .expect(201);

      return request(app.getHttpServer())
        .post(`/followers/${createdUser.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201);
    });

    it('should not allow following self', async () => {
      return request(app.getHttpServer())
        .post(`/followers/${userId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('should require authentication', () => {
      return request(app.getHttpServer()).post('/followers/1').expect(401);
    });
  });

  describe('/followers/:userId (DELETE)', () => {
    it('should remove a follower relationship', async () => {
      // Create a user and follow them first
      const { body: createdUser } = await request(app.getHttpServer())
        .post('/users')
        .send({
          username: 'testuser',
          email: 'K5VJ1H@example.com',
          password: 'Password123!',
          country: 'USA',
          name: 'Test User',
          dateOfBirth: new Date(),
        } satisfies CreateUserRequest)
        .expect(201);

      await request(app.getHttpServer())
        .post(`/followers/${createdUser.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201);

      return request(app.getHttpServer())
        .delete(`/followers/${createdUser.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });

    it('should require authentication', () => {
      return request(app.getHttpServer()).delete('/followers/1').expect(401);
    });
  });

  describe('/followers/:userId/:followerId (GET)', () => {
    it('should return a follower relationship', async () => {
      // Create a user and follow them
      const { body: createdUser } = await request(app.getHttpServer())
        .post('/users')
        .send({
          username: 'testuser',
          email: 'K25VJasdasdasdH@example.com',
          password: 'Password123!',
          country: 'USA',
          name: 'Test User',
          dateOfBirth: new Date(),
        } satisfies CreateUserRequest)
        .expect(201);

      await request(app.getHttpServer())
        .post(`/followers/${createdUser.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201);

      return request(app.getHttpServer())
        .get(`/followers/${createdUser.id}/${userId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toBeDefined();
          expect(res.body.id).toBeDefined();
          expect(res.body.username).toBeDefined();
        });
    });

    it('should return 404 for non-existent relationship', () => {
      return request(app.getHttpServer()).get('/followers/999/998').expect(404);
    });
  });
});
