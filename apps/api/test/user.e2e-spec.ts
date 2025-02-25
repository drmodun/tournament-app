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
import { Links } from '@tournament-app/types';
import { CreateUserRequest, UpdateUserInfo } from 'src/users/dto/requests.dto';
import { AuthModule } from 'src/auth/auth.module';

const checkLinksOnDefault = (links: Links, baseLink: string) => {
  expect(links.first).toEqual(`${baseLink}&page=1`);
  expect(links.prev).toEqual(`${baseLink}&page=0`);
  expect(links.next).toEqual(`${baseLink}&page=2`);
};

describe('UserController', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, AuthModule],
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
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /users', () => {
    it('should return a valid query with mini return type', async () => {
      const response = await request(app.getHttpServer())
        .get('/users?responseType=mini')
        .expect(200);

      const { results, metadata } = response.body;

      expect(results.length).toEqual(12);
      expect(Object.keys(results[0])).toEqual(['id', 'username', 'isFake']);

      expect(metadata.pagination).toEqual({
        page: 1,
        pageSize: 12,
      });

      checkLinksOnDefault(metadata.links, '/users?responseType=mini');
    });

    it('should return a valid query with miniWithProfilePicture return type', async () => {
      const response = await request(app.getHttpServer())
        .get('/users?responseType=mini-with-pfp')
        .expect(200);

      const { results, metadata } = response.body;

      expect(results.length).toEqual(12);
      expect(Object.keys(results[0])).toEqual([
        'id',
        'username',
        'isFake',
        'profilePicture',
      ]);

      expect(metadata.pagination).toEqual({
        page: 1,
        pageSize: 12,
      });

      checkLinksOnDefault(metadata.links, '/users?responseType=mini-with-pfp');
    });

    it('should return a valid query with miniWithCountry return type', async () => {
      const response = await request(app.getHttpServer())
        .get('/users?responseType=mini-with-country')
        .expect(200);

      const { results, metadata } = response.body;

      expect(results.length).toEqual(12);
      expect(Object.keys(results[0])).toEqual([
        'id',
        'username',
        'isFake',
        'profilePicture',
        'country',
      ]);

      expect(metadata.pagination).toEqual({
        page: 1,
        pageSize: 12,
      });

      checkLinksOnDefault(
        metadata.links,
        '/users?responseType=mini-with-country',
      );
    });

    it('should return a valid query with extended return type', async () => {
      const response = await request(app.getHttpServer())
        .get('/users?responseType=extended')
        .expect(200);

      const { results, metadata } = response.body;

      expect(results.length).toEqual(12);
      expect(Object.keys(results[0])).toEqual([
        'id',
        'username',
        'isFake',
        'profilePicture',
        'country',
        'bio',
        'email',
        'level',
        'name',
        'updatedAt',
        'followers',
        'following',
        'createdAt',
      ]);

      expect(metadata.pagination).toEqual({
        page: 1,
        pageSize: 12,
      });

      checkLinksOnDefault(metadata.links, '/users?responseType=extended');
    });

    it('should return a valid query', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .expect(200);

      const { results, metadata } = response.body;

      expect(results.length).toEqual(12);
      expect(Object.keys(results[0])).toEqual([
        'id',
        'username',
        'isFake',
        'profilePicture',
        'country',
        'bio',
        'email',
        'level',
        'name',
        'updatedAt',
        'followers',
      ]);

      expect(metadata.pagination).toEqual({
        page: 1,
        pageSize: 12,
      });

      expect(metadata.links).toEqual({
        first: '/users?page=1',
        prev: '/users?page=0',
        next: '/users?page=2',
      });
    });
  });

  describe('PATCH /users/:id', () => {
    let adminAccessToken: string;

    beforeAll(async () => {
      const { body } = await request(app.getHttpServer()).get('/users/4');

      const tokens = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: body.email,
          password: 'Password123!',
        })
        .expect(201);

      adminAccessToken = tokens.body.accessToken;
    });

    it('should return a 400 when updating a user with an invalid request', async () => {
      const update: UpdateUserInfo = {
        bio: '',
        location: 'Updated location',
      };

      const results = await request(app.getHttpServer())
        .patch('/users/1')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(update)
        .expect(400);

      const { message, error } = results.body;

      expect(message.length).toEqual(1);
      expect(error).toBe('Bad Request');
    });

    it('should return a 422 when no body is sent', async () => {
      await request(app.getHttpServer())
        .patch('/users/1')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({})
        .expect(422);
    });

    it('should return a 404 when updating a non-existent user', async () => {
      const update: UpdateUserInfo = {
        bio: 'Updated bio',
        location: 'Updated location',
      };

      await request(app.getHttpServer())
        .patch('/users/100')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(update)
        .expect(404);
    });

    it('should return a 401 when updating a user without authentication', async () => {
      const update: UpdateUserInfo = {
        bio: 'Updated bio',
        location: 'Updated location',
      };

      await request(app.getHttpServer())
        .patch('/users/2')
        .send(update)
        .expect(401);
    });

    it('should return a 403 when updating a user without authorization', async () => {
      const update: UpdateUserInfo = {
        bio: 'Updated bio',
        location: 'Updated location',
      };

      const { body } = await request(app.getHttpServer()).get('/users/7');

      const tokens = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: body.email,
          password: 'Password123!',
        })
        .expect(201);

      await request(app.getHttpServer())
        .patch('/users/2')
        .set('Authorization', `Bearer ${tokens.body.accessToken}`)
        .send(update)
        .expect(403);
    });

    it('should update a user', async () => {
      const updateUserDto = {
        bio: 'Updated bio',
        location: 'Updated location',
      };

      const response = await request(app.getHttpServer())
        .patch('/users/1')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateUserDto)
        .expect(200);

      expect(response.body).toEqual({ id: 1 });
    });
  });

  describe('DELETE /users/:id', () => {
    let adminAccessToken: string;

    beforeAll(async () => {
      const { body } = await request(app.getHttpServer()).get('/users/4');

      const tokens = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: body.email,
          password: 'Password123!',
        })
        .expect(201);

      adminAccessToken = tokens.body.accessToken;
    });

    it('should return a 404 when deleting a non-existent user', async () => {
      await request(app.getHttpServer())
        .delete('/users/100')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(404);
    });

    it('should return a 401 when deleting a user without authentication', async () => {
      await request(app.getHttpServer()).delete('/users/1').expect(401);
    });

    it('should return a 403 when deleting a user without authorization', async () => {
      const { body } = await request(app.getHttpServer()).get('/users/7');

      const tokens = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: body.email,
          password: 'Password123!',
        })
        .expect(201);

      await request(app.getHttpServer())
        .delete('/users/1')
        .set('Authorization', `Bearer ${tokens.body.accessToken}`)
        .expect(403);
    });

    it('should delete a user', async () => {
      const response = await request(app.getHttpServer())
        .delete('/users/32')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      expect(response.body).toEqual({ id: 32 });
    });
  });

  describe('POST /users', () => {
    it('should create a user', async () => {
      const createRequest: CreateUserRequest = {
        username: 'john_doe',
        bio: 'I am a user',
        country: 'USA',
        email: 'johssn@doe.com',
        location: 'New York',
        password: 'Password123!',
        name: 'John Doe',
        profilePicture: 'https://example.com/john_doe.jpg',
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(createRequest)
        .expect(201);

      expect(response.body).toEqual({ id: expect.any(Number) });
    });

    it('should return a 400 when creating a user with an invalid request', async () => {
      const createRequest: Partial<CreateUserRequest> = {
        username: 'john_doe',
        name: 'John Doe',
        bio: 'I am a user',
        country: 'USA',
        email: 'ad',
        location: 'New York',
        password: 'Password',
      };

      const results = await request(app.getHttpServer())
        .post('/users')
        .send(createRequest)
        .expect(400);

      const { message, error } = results.body;

      expect(message.length).toEqual(2);
      expect(error).toBe('Bad Request');
    });

    it('should return a 400 when no body is sent', async () => {
      await request(app.getHttpServer()).post('/users').send({}).expect(400);
    });

    it('should return a 422 when creating a user with an existing username', async () => {
      const userList = await request(app.getHttpServer()).get('/users');
      const { email } = userList.body.results[0];
      const createRequest: CreateUserRequest = {
        username: 'john_doe',
        bio: 'I am a user',
        name: 'John Doe',
        country: 'USA',
        email,
        location: 'New York',
        password: 'Password123!',
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(createRequest)
        .expect(409);

      expect(response.body.message).toBe(
        'Unproccessable Entity: Unique Entity Violation',
      );
    });
  });

  describe('GET /users/me', () => {
    let userAccessToken: string;

    beforeAll(async () => {
      const { body } = await request(app.getHttpServer()).get('/users/4');

      const tokens = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: body.email,
          password: 'Password123!',
        })
        .expect(201);

      userAccessToken = tokens.body.accessToken;
    });

    it('should return the authenticated user', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(200);

      expect(response.body).toEqual({
        id: 4,
        username: expect.any(String),
        isFake: false,
        email: expect.any(String),
        name: expect.any(String),
        bio: expect.any(String),
        profilePicture: expect.any(String),
        country: expect.any(String),
        followers: expect.any(Number),
        following: expect.any(Number),
        level: expect.any(Number),
        updatedAt: expect.any(String),
        createdAt: expect.any(String),
      });
    });

    it('should return 401 if no access token is provided', async () => {
      await request(app.getHttpServer()).get('/users/me').expect(401);
    });
  });

  describe('PATCH /users', () => {
    let accessToken;

    beforeAll(async () => {
      const { body } = await request(app.getHttpServer()).get('/users/4');

      const tokens = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: body.email,
          password: 'Password123!',
        })
        .expect(201);

      accessToken = tokens.body.accessToken;
    });

    it('should update the authenticated user', async () => {
      const response = await request(app.getHttpServer())
        .patch('/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          bio: 'Updated bio',
          location: 'Updated location',
        })
        .expect(200);

      expect(response.body).toEqual({ id: 4 });
    });

    it('should return 401 if no access token is provided', async () => {
      await request(app.getHttpServer())
        .patch('/users')
        .send({
          bio: 'Updated bio',
          location: 'Updated location',
        })
        .expect(401);
    });

    it('should return 400 if no info is provided', async () => {
      await request(app.getHttpServer())
        .patch('/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({})
        .expect(422);
    });
  });

  describe('DELETE /users', () => {
    let accessToken;

    beforeAll(async () => {
      const { body } = await request(app.getHttpServer()).get('/users/4');

      const tokens = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: body.email,
          password: 'Password123!',
        })
        .expect(201);

      accessToken = tokens.body.accessToken;
    });

    it('should return 401 if no access token is provided', async () => {
      await request(app.getHttpServer()).delete('/users').expect(401);
    });

    it('should delete the authenticated user', async () => {
      const response = await request(app.getHttpServer())
        .delete('/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toEqual({ id: 4 });
    });
  });
});
